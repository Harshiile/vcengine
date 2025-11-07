import { Worker } from "bullmq";
import { transporter } from "../../config/mail.js";
import { ENV } from "../../config/env.js";
import { redisConnection } from "../../config/redis.js";

const worker = new Worker(
  "mail_queue",
  async (job) => {
    const { email, title, body } = job.data;

    const mailOptions = {
      from: ENV.MAIL_EMAIL,
      to: email,
      subject: title,
      html: body,
    };

    await transporter.sendMail(mailOptions);
  },
  { connection: redisConnection }
);

worker.on("completed", (job) => {
  console.log(`Email sent to ${job.data.email}`);
});

worker.on("failed", (job, err) => {
  console.error("Worker failed error :", err.message);
});

worker.on("error", (err) => {
  console.error("Worker internal error :", err.message);
});
