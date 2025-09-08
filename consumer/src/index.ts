import {
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import dotenv from "dotenv";
dotenv.config();

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
    QueueUrl:
      "https://sqs.ap-south-1.amazonaws.com/768666929577/version-control-sqs-checking",
    MaxNumberOfMessages: 3,
    WaitTimeSeconds: 3,
  });
  while (true) {
    const { Messages } = await sqs.send(command);
    if (!Messages) console.log("No messages");
    else {
      for (const msg of Messages) {
        if (msg.Body) {
          const records = JSON.parse(msg.Body).Records;
          if (records) {
            const {
              s3: { object, bucket },
            } = JSON.parse(msg.Body).Records[0];
            console.log({ object, bucket });

            const videoName = object.key;
            const bucketName = bucket.name;

            // Spin the docker image in ECR via ECS fragmate
            // ....
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
