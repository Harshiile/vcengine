import { hash, compare } from "bcrypt";
import { JwtGenerate } from "../utils/jwt";
import { getPrismaInstance } from "../db";
import { VCError } from "../utils/error";
import { v4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { BUCKETS } from "../config/buckets";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3";
import z from "zod";
import { signupSchema } from "../@types/req";

type avatarType = z.infer<typeof signupSchema.shape.body.shape.avatar>;

export class AuthService {
  private getTokens(email: string, userId: string) {
    return {
      refreshToken: JwtGenerate({ email, userId }),
      accessToken: JwtGenerate({ email, userId }),
    };
  }

  async signup(
    email: string,
    password: string,
    username: string,
    name: string,
    avatar: avatarType
  ) {
    const prisma = getPrismaInstance();
    const user = await prisma.user.findFirst({ where: { email } });
    if (user) throw new VCError(409, "User already exists");

    const userId = v4();
    const hashedPassword = await hash(password, 3);
    const { refreshToken, accessToken } = this.getTokens(email, userId);

    await prisma.user
      .create({
        data: {
          id: userId,
          name,
          username,
          email,
          passwordHash: hashedPassword,
          refreshToken,
        },
      })
      .catch((err: any) => {
        throw err;
      });

    let uploadAvatarUrl: string | null = null;
    if (avatar) {
      // Sending signedUrl for avatar
      const command = new PutObjectCommand({
        Bucket: BUCKETS.VC_AVATAR,
        Key: `${userId}.${avatar.avatarExt}`,
        ContentType: avatar.avatarContentType,
      });

      uploadAvatarUrl = await getSignedUrl(s3, command, {
        expiresIn: 60,
      });
    }

    return { accessToken, uploadAvatarUrl };
  }

  async login(email: string, password: string) {
    const prisma = getPrismaInstance();
    const user = await prisma.user
      .findFirst({ where: { email } })
      .catch((err: any) => {
        throw new Error(err.message);
      });

    if (!user) throw new VCError(404, "User not exists");

    if (!(await compare(password, user.passwordHash)))
      throw new VCError(401, "Password Incorrect");

    // Password Correct
    const { refreshToken, accessToken } = this.getTokens(user.email, user.id);

    // Rotate Refresh Token
    await prisma.user
      .update({
        where: { id: user.id },
        data: {
          refreshToken,
        },
      })
      .catch((err: any) => {
        throw err;
      });

    return { accessToken, user };
  }

  async getUser() {}

  async updateUser() {
    // which thing can update
    // name
    // username
    // passwordHash
    // avatarUrl
  }
}
