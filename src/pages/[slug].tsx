import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
const ProfilePage: NextPage<{ id: string }> = ({ id }) => {
  console.log("id -->", id);
  const { data } = api.profile.getUserById.useQuery({
    id,
  });

  if (!data) return <p>404</p>;

  return (
    <>
      <Head>
        <title>
          {data.username ? data.username : data.firstName + " " + data.lastName}
        </title>
      </Head>
      <Layouts>
        <div>
          {data.username ? data.username : data.firstName + " " + data.lastName}
        </div>
      </Layouts>
    </>
  );
};

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { Layouts } from "~/components/layouts";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, currentUser: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("No slug");

  await ssg.profile.getUserById.prefetch({ id: slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: slug,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
