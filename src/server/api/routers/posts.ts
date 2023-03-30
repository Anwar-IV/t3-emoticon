import clerkClient from "@clerk/clerk-sdk-node";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
    })
  ).map((user) => filterUserForClient(user));

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
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    return addUserDataToPosts(posts);
  }),
  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: { authorId: input.userId },
          take: 100,
          orderBy: { createdAt: "desc" },
        })
        .then(addUserDataToPosts)
    ),

  create: privateProcedure
    .input(
      z.object({
        content: z
          .string({
            errorMap: () => {
              return { message: "Input field cannot be empty" };
            },
          })
          .emoji("You can only post emojis here")
          .min(1)
          .max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { content } = input;
      console.log("CONTENT", /^[0-9]+$/.test(content));
      if (/^[0-9]+$/.test(content))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot post numbers only emojis",
        });
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
