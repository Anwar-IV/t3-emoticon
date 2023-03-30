import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (fullPost: PostWithUser) => {
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
                  <span className="font-semibold text-gray-200">{`@${author.username}`}</span>
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
                  <span className="font-semibold text-gray-200">{`@${author.firstName.toLowerCase()}_${author.lastName.toLowerCase()}`}</span>
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
