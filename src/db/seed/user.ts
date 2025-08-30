import { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";

const users = (hashPassword: string) => [
  {
    id: 1,
    name: "Abc",
    username: "abc123",
    email: "abc@gmail.com",
    password: hashPassword,
    refreshToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRoZWhhcnNoaWlsZUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6ImdyYXpvIiwiaWF0IjoxNzU2NTQ1MTEyfQ.eJA83ok7M3tgijB-4oYh0qf350Mge8C3PZdCGKeAooU",
    avatar: null,
  },
  {
    id: 2,
    name: "Xyz",
    username: "xyz123",
    email: "xyz@gmail.com",
    password: hashPassword,
    refreshToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRoZWhhcnNoaWlsZUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6ImdyYXpvIiwiaWF0IjoxNzU2NTQ1MTEyfQ.eJA83ok7M3tgijB-4oYh0qf350Mge8C3PZdCGKeAooU",
    avatar: null,
  },
];

export const seedUser = async (prisma: PrismaClient) => {
  const password = "12345678";
  const hashPassword = await hash(password, 5);

  prisma.user
    .deleteMany()
    .then((_: any) => {
      prisma.user
        .createMany({
          data: users(hashPassword),
        })
        .then((_: any) =>
          console.log(`Users seeded sucessfully with password : ${password}`)
        )
        .catch((err: any) => {
          throw new Error(err);
        });
    })
    .catch((err: any) => {
      throw new Error(err);
    });
};
