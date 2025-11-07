import { ENV } from "../config/env.js";
import { mailQueue } from "../redis/queue.js";

export class EmailService {
  private mailTemplate = () => {
    return `
    <html>
      <body>
        <h4> Reset Password Link </h4>
        <a> ${ENV.FRONT_END_URL}/reset-password </a>
      <body>
    </html>`
  };

  sendMail = async (email: string) => {
    const mailParams = {
      email,
      title: "Submission Done !",
      body: this.mailTemplate(),
    };

    // Add mail to queue
    await mailQueue.add("mail_sending", mailParams);
  };
}
