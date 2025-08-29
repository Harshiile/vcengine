import { hash, compare } from "bcrypt";

export class AuthService {
  async signup(
    email: string,
    password: string,
    username: string,
    name: string
  ) {
    const hashedPassword = await hash(password, 5);
    console.log(
      `${name} signup as ${username} via gmail : ${email} with password : ${hashedPassword}`
    );
  }

  async login(email: string, password: string) {
    const hashedPassword = "............"; // Get from DB
    if (await compare(password, hashedPassword)) {
      // Password Correct
      console.log(`${email} login via password : ${password}`);
    }
  }

  async logout() {}

  async getUser() {}

  async updateUser() {}
}
