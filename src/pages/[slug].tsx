import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
const ProfilePage: NextPage<{ id: string }> = ({ id }) => {
  console.log("id -->", id);
  const { data } = api.profile.getUserById.useQuery({
    id,
  });

  if (!data) return <p>404</p>;
  console.log("data -->", data);
  const fullName = `${data.firstName ?? ""} ${data.lastName ?? ""}`;
  const displayName = data.username
    ? `@${data.username}`
    : `@${data.firstName?.toLowerCase() ?? ""}_${
        data.lastName?.toLowerCase() ?? ""
      }`;
  return (
    <>
      <Head>
        <title>{displayName}</title>
      </Head>
      <Layouts>
        <div className="relative h-40  bg-slate-700">
          <Image
            src={data.profileImageUrl}
            alt={`${displayName}'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 ml-4 -mb-[64px] rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[64px]"></div>

        <div className="flex flex-col gap-2 p-4">
          <p className="text-2xl font-bold">{fullName}</p>
          <p className="text-2xl text-slate-400">{displayName}</p>
        </div>
        <div className="w-full border-b border-slate-400"></div>
      </Layouts>
    </>
  );
};

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { Layouts } from "~/components/layouts";
import Image from "next/image";

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
