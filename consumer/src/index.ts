import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import dotenv from "dotenv";
import Docker from "dockerode";
import path from "path";
dotenv.config();

const sqsUrl =
  "https://sqs.ap-south-1.amazonaws.com/280428163167/s3-to-consumer-connecter";
const init = async () => {
  const accessKeyId = process.env.ACCESS_KEY;
  const secretAccessKey = process.env.SECRET_KEY;

  if (!accessKeyId || !secretAccessKey)
    throw new Error("Credentails is not valid");

  const sqs = new SQSClient({
    region: "ap-south-1",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const command = new ReceiveMessageCommand({
    QueueUrl: sqsUrl,
    MaxNumberOfMessages: 3,
    WaitTimeSeconds: 3,
  });

  while (true) {
    const { Messages } = await sqs.send(command);
    if (!Messages) console.log("No messages");
    else {
      for (const msg of Messages) {
        const { Body, ReceiptHandle } = msg;
        if (Body) {
          console.log(JSON.parse(Body));

          const records = JSON.parse(Body).Records;
          if (records) {
            const {
              s3: { object, bucket },
            } = JSON.parse(Body).Records[0];
            console.log({ object, bucket });

            const videoName = object.key;

            // Just delete message now - Store state if message our push state again
            const oldMessageState = {
              videoName,
            };
            await sqs.send(
              new DeleteMessageCommand({
                QueueUrl: sqsUrl,
                ReceiptHandle,
              })
            );

            // Spin the docker image in ECR via ECS fragmate
            // ....
            // Do volume mapping with folder /output which contain playlist.m3u8 files for multiple resolution
            new Promise(async (resolve, reject) => {
              const docker = new Docker();
              const container = await docker.createContainer({
                Image: "transcoder-segmentor",
                name: `transcoder_instance_${Date.now()}`,
                HostConfig: {
                  Binds: [`${path.resolve(".")}:/app/output`],
                },
                Env: [
                  `VIDEO_NAME=${videoName}`,
                  `ACCESS_KEY=${accessKeyId}`,
                  `SECRET_KEY=${secretAccessKey}`,
                ],
              });
              const logs = await container.attach({
                stream: true,
                stdout: true,
                stderr: true,
              });

              logs.on("data", (data) => console.log(data.toString()));
              await container.start().catch(reject);

              const result = await container.wait();
              resolve(result);
            }).catch(async (err) => {
              // Resend message Delete
            });
          }
        }
      }
    }
  }
};

init().catch((err) => {
  console.log(err.message);
  process.exit(1);
});
