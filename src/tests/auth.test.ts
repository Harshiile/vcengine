import { AuthService } from "../services/auth.service";

describe("AuthService Unit Tests", () => {
  it("should return token for valid login", async () => {
    const res = await new AuthService().login("test@example.com", "1234");
    expect(res).toHaveProperty("token");
  });

  //   it("should throw error for invalid login", async () => {
  //     await expect(authService.login("wrong@example.com", "bad")).rejects.toThrow(
  //       "Invalid credentials"
  //     );
  //   });
});
