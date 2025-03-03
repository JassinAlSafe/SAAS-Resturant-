"use client";

import * as React from "react";
import { useTransition as useReactTransition } from "react";

export const useTransition = () => {
  const [isPending, startTransition] = useReactTransition();

  return {
    isPending,
    startTransition,
  };
};

interface TransitionProps {
  children: React.ReactNode;
  show: boolean;
  className?: string;
  unmount?: boolean;
  duration?: number;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
}

export const Transition = ({
  children,
  show,
  className = "",
  unmount = true,
  duration = 300,
  enter = "transition-all ease-in-out",
  enterFrom = "opacity-0",
  enterTo = "opacity-100",
  leave = "transition-all ease-in-out",
  leaveFrom = "opacity-100",
  leaveTo = "opacity-0",
}: TransitionProps) => {
  const [shouldRender, setShouldRender] = React.useState(show);
  const [animationClass, setAnimationClass] = React.useState("");

  // Handle the entering animation
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (show) {
      setShouldRender(true);

      // Start with enterFrom class
      setAnimationClass(`${enter} ${enterFrom}`);

      // After a short delay (for the browser to apply enterFrom), switch to enterTo
      timeoutId = setTimeout(() => {
        setAnimationClass(`${enter} ${enterTo}`);
      }, 10);
    } else {
      // Start with leaveFrom class
      setAnimationClass(`${leave} ${leaveFrom}`);

      // After a short delay, switch to leaveTo
      timeoutId = setTimeout(() => {
        setAnimationClass(`${leave} ${leaveTo}`);
      }, 10);

      // After animation duration, unmount if needed
      timeoutId = setTimeout(() => {
        if (unmount) {
          setShouldRender(false);
        }
      }, duration);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    show,
    enter,
    enterFrom,
    enterTo,
    leave,
    leaveFrom,
    leaveTo,
    unmount,
    duration,
  ]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`${className} ${animationClass}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};
