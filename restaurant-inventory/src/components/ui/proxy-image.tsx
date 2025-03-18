"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { getProxiedImageUrl } from "@/lib/image-proxy";

interface ProxyImageProps extends Omit<ImageProps, "src"> {
  src: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * A component that proxies images through our API to avoid Next.js domain restrictions
 */
export function ProxyImage({
  src,
  alt,
  width,
  height,
  fallbackSrc = "/placeholder-image.jpg",
  className,
  containerClassName,
  ...props
}: ProxyImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <Image
        src={error ? fallbackSrc : getProxiedImageUrl(src)}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          !loaded && "opacity-0",
          loaded && "opacity-100",
          className
        )}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        {...props}
      />

      {/* Loading indicator */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
          <span className="sr-only">Loading image...</span>
        </div>
      )}
    </div>
  );
}
