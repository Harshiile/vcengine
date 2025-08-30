import { hash, compare } from "bcrypt";
import { prisma } from "../db";
import { JwtGenerate } from "../utils/jwt";

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
    const user = await prisma.user.findFirst({ where: { email } });
    if (user) throw new Error("User already exists");

    const hashedPassword = await hash(password, 5);
    const { refreshToken } = this.getTokens(email, username);

    prisma.user
      .create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
          refreshToken,
        },
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  }

  async login(email: string, password: string) {
    const user = await prisma.user
      .findFirst({ where: { email } })
      .catch((err) => {
        throw new Error(err.message);
      });

    if (!user) throw new Error("User not exists");

    if (!(await compare(password, user.password)))
      throw new Error("Password Incorrect");

    // Password Correct
    const { refreshToken, accessToken } = this.getTokens(
      user.email,
      user.username
    );

    prisma.user
      .update({
        where: { id: user.id },
        data: {
          refreshToken,
        },
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    return user;
  }

  async logout() {}

  async getUser() {}

  async updateUser() {}
}
