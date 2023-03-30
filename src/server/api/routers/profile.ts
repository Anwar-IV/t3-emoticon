import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;

      const [user] = await clerkClient.users.getUserList({ userId: [id] });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      const filteredUser = filterUserForClient(user);
      if (!filteredUser.firstName || !filteredUser.lastName)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No firstName or lastName for User",
        });
      return {
        ...filteredUser,
        firstName: filteredUser.firstName,
        lastName: filteredUser.lastName,
      };
    }),
});
