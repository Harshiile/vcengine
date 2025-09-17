import { hash, compare } from "bcrypt";
import { JwtGenerate } from "../utils/jwt";
import { getPrismaInstance } from "../db";

export class AuthService {
  private getTokens(email: string, username: string) {
    return {
      refreshToken: JwtGenerate({ email, username }),
      accessToken: JwtGenerate({ email, username }),
    };
  }

  async signup(
    email: string,
    password: string,
    username: string,
    name: string
  ) {
    const prisma = getPrismaInstance();
    const user = await prisma.user.findFirst({ where: { email } });
    if (user) throw new Error("User already exists");

    const hashedPassword = await hash(password, 5);
    const { refreshToken, accessToken } = this.getTokens(email, username);

    await prisma.user
      .createA({
        data: {
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

    return { accessToken };
  }

  async login(email: string, password: string) {
    const prisma = getPrismaInstance();
    const user = await prisma.user
      .findFirst({ where: { email } })
      .catch((err: any) => {
        throw new Error(err.message);
      });

    if (!user) throw new Error("User not exists");

    if (!(await compare(password, user.passwordHash)))
      throw new Error("Password Incorrect");

    // Password Correct
    const { refreshToken, accessToken } = this.getTokens(
      user.email,
      user.username
    );

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
