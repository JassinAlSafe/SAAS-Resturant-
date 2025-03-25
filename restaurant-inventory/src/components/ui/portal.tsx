"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement;
}

/**
 * Portal component that renders its children into a DOM node that exists
 * outside the DOM hierarchy of the parent component.
 *
 * @param {React.ReactNode} children - The content to render in the portal
 * @param {HTMLElement} container - Optional target container (defaults to document.body)
 */
export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Client-side only
  if (!mounted) return null;

  // Default to document.body if no container is provided
  const targetElement = container || document.body;

  return createPortal(children, targetElement);
}

export default Portal;
