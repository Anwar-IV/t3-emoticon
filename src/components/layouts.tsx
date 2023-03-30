import type { PropsWithChildren } from "react";

export const Layouts = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="h-full w-full overflow-y-scroll overscroll-none border-x border-slate-400 md:max-w-2xl ">
        {props.children}
      </div>
    </main>
  );
};
