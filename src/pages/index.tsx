import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { api, RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex gap-3 ">
      <Image
        src={user.profileImageUrl}
        width={56}
        height={56}
        className="rounded-full"
        alt="Profile Image"
      />
      <input
        type="text"
        placeholder="Type some emojis!"
        className="grow bg-transparent px-3 text-lg font-semibold text-sky-200 outline-none"
      />
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (fullPost: PostWithUser) => {
  const { author, post } = fullPost;
  return (
    <div className="border-b border-slate-400 py-8 px-4">
      <div className="flex items-center gap-3">
        <Image
          width={56}
          height={56}
          className="rounded-full"
          alt={"profile image"}
          src={author.profileImageUrl!}
        />
        <div className="flex flex-col">
          <p>
            {author.username ? (
              <>
                <span className="font-semibold text-gray-400">{`@${author.username}`}</span>
                <span className="text-sm font-semibold text-gray-400">{` · ${dayjs(
                  post.createdAt
                ).fromNow()}`}</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-gray-400">{`@${author.firstName.toLowerCase()}_${author.lastName.toLowerCase()}`}</span>
                <span className="text-sm font-semibold text-gray-400">{` · ${dayjs(
                  post.createdAt
                ).fromNow()}`}</span>
              </>
            )}
          </p>
          <h1 className="">{post.content}</h1>
        </div>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  /*
   *     Until Clerk loads and initializes, `isLoaded` will be set to `false`.
   *     Once Clerk loads, `isLoaded` will be set to `true`, and you can
   *     safely access `isSignedIn` state and `user`. */
  const { isLoaded, isSignedIn, user } = useUser();
  user && console.log(user);
  const { data, isLoading } = api.posts.getAll.useQuery();
  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>Something went wrong!</p>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl ">
          <div className="border-b border-slate-400 p-4">
            {!user ? (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            ) : (
              <CreatePostWizard />
            )}
          </div>
          <div>
            {data.map((fullPost) => (
              <PostView key={fullPost.post.id} {...fullPost} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};
export default Home;
