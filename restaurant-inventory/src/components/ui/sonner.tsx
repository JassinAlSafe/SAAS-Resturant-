"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={true}
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:border-none group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:p-6 group-[.toaster]:min-w-[450px] group-[.toaster]:my-3 group-[.toaster]:mx-auto",
          title:
            "group-[.toast]:text-2xl group-[.toast]:font-bold group-[.toast]:text-black",
          description:
            "group-[.toast]:text-lg group-[.toast]:font-medium group-[.toast]:text-neutral-800 group-[.toast]:mt-2",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-orange-500 group-[.toast]:to-orange-400 group-[.toast]:text-white group-[.toast]:rounded-full group-[.toast]:px-5 group-[.toast]:py-2.5 group-[.toast]:text-base group-[.toast]:font-medium group-[.toast]:mt-2",
          cancelButton:
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-600 group-[.toast]:rounded-full group-[.toast]:px-5 group-[.toast]:py-2.5 group-[.toast]:text-base group-[.toast]:font-medium group-[.toast]:mt-2",
          success:
            "group-[.toast]:border-l-[12px] group-[.toast]:border-l-green-500 !bg-white",
          error:
            "group-[.toast]:border-l-[12px] group-[.toast]:border-l-red-500 !bg-white",
          warning:
            "group-[.toast]:border-l-[12px] group-[.toast]:border-l-orange-500 !bg-white",
          info: "group-[.toast]:border-l-[12px] group-[.toast]:border-l-blue-500 !bg-white",
        },
        duration: 7000,
        unstyled: false,
      }}
      {...props}
    />
  );
};

export { Toaster };
