import { hash, compare } from "bcrypt";
import { JwtGenerate } from "../utils/jwt";
import { getPrismaInstance } from "../db";
import { VCError } from "../utils/error";
import { v4 } from "uuid";
import { Stream } from "stream";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { BUCKETS } from "../config/buckets";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3";
import z from "zod";

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
    avatar: string | undefined
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
          avatarUrl: avatar,
          passwordHash: hashedPassword,
          refreshToken,
        },
      })
      .catch((err: any) => {
        throw err;
      });


    return {
      accessToken, user: {
        id: userId,
        username,
        name
      }
    };
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



    return {
      accessToken, user: {
        id: user.id,
        name: user.name,
        username: user.username,
      }
    };
  }


  async uploadAvatar(contentType: string) {
    const tmpAvatarId = v4()
    const avatarKey = `${v4()}.${contentType.split("/")[1]}`
    const command = new PutObjectCommand({
      Bucket: BUCKETS.VC_AVATAR,
      Key: avatarKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    return { uploadUrl, avatarKey };
  }

  async getAvatar(userId: string) {
    const prisma = getPrismaInstance();
    const user = await prisma.user
      .findFirst({ where: { id: userId } })
      .catch((err: any) => {
        throw new Error(err.message);
      });


    if (!user) throw new VCError(404, "User not exists");
    if (!user.avatarUrl) return null;

    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKETS.VC_AVATAR,
        Key: user.avatarUrl,
      })
    );
    return Body as Stream;

  }

  async getUser(userId: string) {
    const prisma = getPrismaInstance();
    const user = await prisma.user
      .findFirst({ where: { id: userId } })
      .catch((err: any) => {
        throw new Error(err.message);
      });

    if (!user) return null;

    const { id, name, username } = user
    return {
      id,
      name,
      username,
    }
  }

  async updateUser() {
    // which thing can update
    // name
    // username
    // passwordHash
    // avatarUrl
  }
}
