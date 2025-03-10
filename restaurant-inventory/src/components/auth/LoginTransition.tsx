"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface LoginTransitionProps {
  onAnimationComplete?: () => void;
}

export const LoginTransition = ({
  onAnimationComplete,
}: LoginTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Ensure component is mounted before starting animations
  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out the entire container
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => onAnimationComplete?.(),
        });
      },
    });

    // Initial state
    gsap.set([circleRef.current, textRef.current, dotsRef.current], {
      opacity: 0,
      immediateRender: true,
    });
    gsap.set(welcomeTextRef.current, {
      opacity: 0,
      y: 20,
      immediateRender: true,
    });

    // Welcome text animation
    tl.to(welcomeTextRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    });

    // Loading circle and dots entrance
    tl.to(
      circleRef.current,
      {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      },
      "+=0.2"
    );

    // Rotate circle
    tl.to(
      circleRef.current,
      {
        rotation: 360,
        duration: 1,
        ease: "none",
        repeat: 1,
      },
      "<"
    );

    // Animate dots
    const dots = dotsRef.current?.querySelectorAll("div");
    if (dots) {
      tl.to(
        dots,
        {
          opacity: 0.8,
          duration: 0.2,
          stagger: 0.05,
        },
        "<"
      );

      tl.to(
        dots,
        {
          y: -4,
          duration: 0.3,
          stagger: {
            each: 0.1,
            repeat: 2,
            yoyo: true,
          },
          ease: "power2.inOut",
        },
        "<"
      );
    }

    // Text fade in
    tl.to(
      textRef.current,
      {
        opacity: 1,
        duration: 0.3,
      },
      "<"
    );

    // Set total animation duration
    tl.to({}, { duration: 1 }); // Add a small pause before completion

    return () => {
      tl.kill();
      if (dots) gsap.killTweensOf(dots);
      gsap.killTweensOf([circleRef.current, textRef.current]);
    };
  }, [onAnimationComplete, isReady]);

  if (!isReady) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-50"
      style={{ opacity: 1 }} // Ensure initial visibility
    >
      <div
        ref={welcomeTextRef}
        className="text-2xl font-bold text-primary mb-8"
      >
        Welcome to ShelfWise
      </div>
      <div className="relative">
        <div
          ref={circleRef}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div ref={dotsRef} className="flex gap-2">
            <div className="w-2 h-2 bg-primary rounded-full opacity-0" />
            <div className="w-2 h-2 bg-primary rounded-full opacity-0" />
            <div className="w-2 h-2 bg-primary rounded-full opacity-0" />
          </div>
        </div>
      </div>
      <span ref={textRef} className="text-sm text-primary font-medium mt-4">
        Preparing your dashboard...
      </span>
    </div>
  );
};
