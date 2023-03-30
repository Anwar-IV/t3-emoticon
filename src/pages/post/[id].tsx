import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { Layouts } from "~/components/layouts";
import { PostView } from "~/components/postview";

import { api } from "~/utils/api";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({
    id,
  });
  if (!data) return <p>404</p>;
  const { author, post } = data;

  const displayName = author.username
    ? `@${author.username}`
    : `@${author.firstName?.toLowerCase() ?? ""}_${
        author.lastName?.toLowerCase() ?? ""
      }`;
  return (
    <>
      <Head>
        <title>{`${post.content} - ${displayName}`}</title>
      </Head>
      <Layouts>
        <PostView {...data} />
      </Layouts>
    </>
  );
};

import { generateSSGHelper } from "~/server/helpers/ssgHelper";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("No id");

  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
