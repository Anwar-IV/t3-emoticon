import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { Layouts } from "~/components/layouts";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";

import { api } from "~/utils/api";

const ProfileFeed = ({ userId }: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId });
  if (isLoading)
    return (
      <div className="mt-40 flex w-full items-center justify-center">
        <div className="relative">
          <LoadingPage />
        </div>
      </div>
    );

  if (!data || data.length == 0) return <div>User has no posts</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

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
        <ProfileFeed userId={data.id} />{" "}
      </Layouts>
    </>
  );
};

import { generateSSGHelper } from "~/server/helpers/ssgHelper";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
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
