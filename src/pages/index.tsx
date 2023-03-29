import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { api, type RouterOutputs } from "~/utils/api";

import toast from "react-hot-toast";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { RxHamburgerMenu } from "react-icons/rx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "~/components/loading";
import { useState } from "react";
let toastErrorId: string;

dayjs.extend(relativeTime);

const Dropdown = () => {
  return (
    <div className="absolute top-10 right-0 md:right-10">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger id="trigger" className="rounded-full ">
          <RxHamburgerMenu
            size={50}
            className="rounded-full bg-blue-700 p-4 opacity-50 transition-opacity duration-300 hover:opacity-100 md:opacity-80"
          />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          sideOffset={5}
          className="rounded-md bg-gradient-to-tr from-violet-700 to-blue-700 p-4"
        >
          <DropdownMenu.Arrow className=" fill-blue-700" />
          <DropdownMenu.Item
            id="item"
            className="cursor-pointer px-2  hover:outline-none   "
          >
            <SignOutButton />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState<string>("");
  if (!user) return null;
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Emoji posted successfully", { id: toastErrorId });
      void ctx.posts.getAll.invalidate();
      setInput("");
    },
    onError: (error) => {
      setInput("");
      const errorArray = error.data?.zodError?.fieldErrors.content;
      if (errorArray) {
        errorArray.forEach((error, index) => {
          if (errorArray.length - 1 === index)
            return toast.error(error, {
              id: toastErrorId,
            });
          return toast.error(error);
        });
      }
      errorArray ??
        toast.error(error.message ?? error.data?.code, { id: toastErrorId });
    },
  });

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
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        type="button"
        disabled={isPosting}
        onClick={() => {
          toastErrorId = toast.loading("Uploading Post...", {
            id: toastErrorId,
          });
          mutate({ content: input });
        }}
        className="transition-scale rounded-lg border border-violet-800 bg-transparent p-2 text-gray-200 duration-500 hover:scale-[1.02] active:scale-95 "
      >
        Post
      </button>
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
          src={author.profileImageUrl}
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
          <h1 className="text-2xl">{post.content}</h1>
        </div>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (!postsLoading && !data) return <p>Something went wrong!</p>;
  return (
    <div>
      {!postsLoading ? (
        data.map((fullPost) => (
          <PostView key={fullPost.post.id} {...fullPost} />
        ))
      ) : (
        <LoadingPage />
      )}
    </div>
  );
};

const Home: NextPage = () => {
  /*
   *     Until Clerk loads and initializes, `isLoaded` will be set to `false`.
   *     Once Clerk loads, `isLoaded` will be set to `true`, and you can
   *     safely access `isSignedIn` state and `user`. */
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Run the query early so that we can use the cached results
  api.posts.getAll.useQuery();
  // Return empty div if BOTH user isn't loaded
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isSignedIn && <Dropdown />}
      <main className="flex h-full justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl ">
          <div className="border-b border-slate-400 p-4">
            {!isSignedIn ? (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            ) : (
              <CreatePostWizard />
            )}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};
export default Home;
