import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email || "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Enter a valid email address");
        }
        return { email };
      },
      validatePasswordRequirements(password) {
        if (password.length < 10 || !/[a-z]/i.test(password) || !/\d/.test(password)) {
          throw new Error("Password must be at least 10 characters and include a number");
        }
      },
    }),
  ],
});
