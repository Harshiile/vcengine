import { hash } from "bcrypt";

export class AuthService {
  constructor() {}

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

  async login(email: string, hashedPassword: string) {
    // console.log()
  }
}
