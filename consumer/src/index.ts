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
  const dbUrl = process.env.DB_URL;

  if (!accessKeyId || !secretAccessKey || !dbUrl)
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

          const records = JSON.parse(Body).Records;
          if (records) {
            const {
              s3: { object },
            } = JSON.parse(Body).Records[0];

            const videoName = object.key;

            // Just delete message now - Store state if message our push state again
            await sqs.send(
              new DeleteMessageCommand({
                QueueUrl: sqsUrl,
                ReceiptHandle,
              })
            );

            // Spin the docker image in ECR via ECS fragmate
            new Promise(async (resolve, reject) => {
              const docker = new Docker();
              const container = await docker.createContainer({
                Image: "transcoder-segmentor",
                name: `transcoder_instance_${Date.now()}`,
                HostConfig: {
                  NetworkMode: 'vcengine_vcengine',
                },
                Env: [
                  `VIDEO_NAME=${videoName}`,
                  `ACCESS_KEY=${accessKeyId}`,
                  `SECRET_KEY=${secretAccessKey}`,
                  `DB_URL=${dbUrl}`,
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
              const messageBody = {
                Records: [
                  {
                    s3: {
                      object: {
                        key: videoName
                      }
                    }
                  }
                ]
              }
              await sqs.send(new SendMessageCommand({
                MessageBody: JSON.stringify(messageBody),
                QueueUrl: sqsUrl
              }))
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
