import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  /*
   *     Until Clerk loads and initializes, `isLoaded` will be set to `false`.
   *     Once Clerk loads, `isLoaded` will be set to `true`, and you can
   *     safely access `isSignedIn` state and `user`. */
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  const { data } = api.profile.getUserById.useQuery({
    id: "user_2Nbn3vMLdjaH1Vagaj0Vx2ziefh",
  });
  console.log(data);

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex h-full justify-center">
        <div>Profile View</div>
      </main>
    </>
  );
};
export default ProfilePage;
