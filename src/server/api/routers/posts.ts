import clerkClient, { type User } from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
      })
    ).map((user) => filterUserForClient(user));
    console.log("users -->", users);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);
      if (author && author.firstName && author.lastName) {
        return {
          post,
          author: {
            ...author,
            firstName: author.firstName,
            lastName: author.lastName,
          },
        };
      }
      if (!author)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author not found!!!",
        });
      if (!author.firstName || !author.lastName)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No firstName or lastName field found on Author!",
        });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected Error",
      });
    });
  }),

  create: privateProcedure
    .input(z.object({ content: z.string().emoji().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const { content } = input;
      console.log("CONTENT", content);
      const authorId = ctx.currentUser;
      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content,
        },
      });
      return post;
    }),
});
