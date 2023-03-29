import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";

const SinglePostPage: NextPage = () => {
  /*
   *     Until Clerk loads and initializes, `isLoaded` will be set to `false`.
   *     Once Clerk loads, `isLoaded` will be set to `true`, and you can
   *     safely access `isSignedIn` state and `user`. */
  const { isLoaded: userLoaded } = useUser();

  // Run the query early so that we can use the cached results
  api.posts.getAll.useQuery();
  // Return empty div if BOTH user isn't loaded
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-full justify-center">
        <div>Profile View</div>
      </main>
    </>
  );
};
export default SinglePostPage;
