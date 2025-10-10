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

  async createUser(
    email: string,
    password: string,
    username: string,
    name: string,
    avatar: string | undefined
  ) {
    const prisma = getPrismaInstance();

    // Fetch user - to check whether user already exists
    const user = await prisma.user.findFirst({ where: { email } });
    if (user) throw new VCError(409, "User already exists");

    const userId = v4();
    const hashedPassword = await hash(password, 3);
    const { refreshToken, accessToken } = this.getTokens(email, userId);

    // Add DB Record
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
      accessToken,
      user: {
        id: userId,
        username,
        name,
        avatar
      }
    };
  }

  async loginUser(email: string, password: string) {
    const prisma = getPrismaInstance();

    // Fetch user - to check whether user already exists
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
        avatar: user.avatarUrl
      }
    };
  }


  async uploadAvatar(contentType: string) {
    // Avatar File Key
    const avatarKey = `${v4()}.${contentType.split("/")[1]}`

    const command = new PutObjectCommand({
      Bucket: BUCKETS.VC_AVATAR,
      Key: avatarKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    // Send Signed Url
    return { uploadUrl, avatarKey };
  }

  async getAvatar(userId: string) {
    const prisma = getPrismaInstance();

    // First check whether user exists or not
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

    // Send avatar image as stream
    return Body as Stream;
  }

  async getUser(userId: string) {
    const prisma = getPrismaInstance();

    // Get user details
    const user = await prisma.user
      .findFirst({ where: { id: userId } })
      .catch((err: any) => {
        throw new Error(err.message);
      });

    if (!user) return null;

    const { id, name, username, avatarUrl } = user
    return {
      id,
      name,
      username,
      avatar: avatarUrl
    }
  }

  async isUniqueUsername(username: string) {
    const prisma = getPrismaInstance();

    const user = await prisma.user
      .findFirst({ where: { username: username } })
      .catch((err: any) => {
        throw new Error(err.message);
      });

    return user ? true : false;
  };

  async deleteUser(userId: string) {
    const prisma = getPrismaInstance();

    await prisma.user
      .delete({ where: { id: userId } })
      .catch((err: any) => {
        throw new Error(err.message);
      });
  };


  async updateUser(userId: string, name: string | undefined, username: string | undefined, avatarUrl: string | undefined) {
    const prisma = getPrismaInstance();

    if (username) {
      const isUsernameExist = await this.isUniqueUsername(username)
      if (isUsernameExist) throw new VCError(409, "Username already exists")
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(avatarUrl && { avatarUrl }),
        ...(name && { name }),
        ...(username && { username }),
      }
    }).catch(err => { throw err })
  };
}
