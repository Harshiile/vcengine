import { createTransport } from "nodemailer";
import { ENV } from "./env.js";

export const transporter = createTransport({
  service: "gmail",
  auth: { user: ENV.MAIL_EMAIL, pass: ENV.MAIL_PASSKEY },
});
