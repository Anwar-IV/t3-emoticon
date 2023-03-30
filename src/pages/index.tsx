import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { api, type RouterOutputs } from "~/utils/api";

import toast from "react-hot-toast";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useClerk } from "@clerk/nextjs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { RxHamburgerMenu } from "react-icons/rx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "~/components/loading";
import { useState } from "react";
import Link from "next/link";
import { Layouts } from "~/components/layouts";
let toastErrorId: string;

dayjs.extend(relativeTime);

const Dropdown = ({ userId }: { userId: string }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { signOut } = useClerk();
  return (
    <div className="absolute top-10 right-0 md:right-10">
      <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenu.Trigger id="trigger" className="rounded-full ">
          <RxHamburgerMenu
            size={50}
            className="rounded-full bg-blue-700 p-4 opacity-50 transition-opacity duration-300 hover:opacity-100 md:opacity-80"
          />
        </DropdownMenu.Trigger>

        <AnimatePresence>
          {dropdownOpen && (
            <DropdownMenu.Content
              sideOffset={5}
              className="rounded-md bg-gradient-to-tr from-violet-700 to-blue-700 p-4"
              asChild
              forceMount
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { ease: "easeInOut" },
                  duration: 0.1,
                }}
              >
                <DropdownMenu.Arrow className=" fill-blue-700" />
                <Link href={`/${userId}`}>
                  <DropdownMenu.Item id="item">
                    <p>Profile</p>
                  </DropdownMenu.Item>
                </Link>
                <DropdownMenu.Item id="item" onSelect={() => signOut()}>
                  <p>Sign Out</p>
                </DropdownMenu.Item>
              </motion.div>
            </DropdownMenu.Content>
          )}
        </AnimatePresence>
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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            } else {
              toast.error("Cannot submit an empty post");
            }
          }
        }}
        onChange={(e) => setInput(e.target.value)}
      />
      {input !== "" && !isPosting && (
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
      )}
      {isPosting && (
        <div className="relative mt-2">
          <LoadingPage size={30} />
        </div>
      )}
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
                <Link href={`/${author.id}`}>
                  <span className="font-semibold text-gray-400">{`@${author.username}`}</span>
                </Link>
                <Link href={`/post/${post.id}`}>
                  <span className="text-sm font-semibold text-gray-400">{` · ${dayjs(
                    post.createdAt
                  ).fromNow()}`}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href={`/${author.id}`}>
                  <span className="font-semibold text-gray-400">{`@${author.firstName.toLowerCase()}_${author.lastName.toLowerCase()}`}</span>
                </Link>
                <Link href={`/post/${post.id}`}>
                  <span className="text-sm font-semibold text-gray-400">{` · ${dayjs(
                    post.createdAt
                  ).fromNow()}`}</span>
                </Link>
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
        <LoadingPage height="h-screen" width="w-screen" />
      )}
    </div>
  );
};

const Home: NextPage = () => {
  /*
   *     Until Clerk loads and initializes, `isLoaded` will be set to `false`.
   *     Once Clerk loads, `isLoaded` will be set to `true`, and you can
   *     safely access `isSignedIn` state and `user`. */
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();

  // Run the query early so that we can use the cached results
  api.posts.getAll.useQuery();
  // Return empty div if BOTH user isn't loaded
  if (!userLoaded) return <div />;
  console.log("user --->", user);
  return (
    <>
      <Head>
        <title>T3-emoticon</title>
        <meta name="description" content="Emojis for weeks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isSignedIn && <Dropdown userId={user.id} />}
      <Layouts>
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
      </Layouts>
    </>
  );
};
export default Home;
