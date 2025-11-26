import { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { ID } from "./ids";

const users = (hashPassword: string) => [
  {
    id: ID.user,
    name: "Dymitry Bivol",
    username: "borz",
    email: "example@gmail.com",
    passwordHash: hashPassword,
    refreshToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRoZWhhcnNoaWlsZUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6ImdyYXpvIiwiaWF0IjoxNzU2NTQ1MTEyfQ.eJA83ok7M3tgijB-4oYh0qf350Mge8C3PZdCGKeAooU",
    avatar: "5cf1e900-451f-41cb-b3ce-fefa356451ac.jpeg",
    website: "haz.onrender.com",
    location: "Dagestan, Russia",
    bio: "Orthodox | 5'10''"
  }
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
