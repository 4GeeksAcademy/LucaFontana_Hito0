"use client";

import {
  createElement,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type FadeInTag = "article" | "div" | "footer" | "header" | "section";

interface FadeInProps {
  as?: FadeInTag;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function FadeIn({
  as = "div",
  children,
  className,
  style,
}: FadeInProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return undefined;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref: elementRef,
      className: `fade-up${isVisible ? " is-visible" : ""}${className ? ` ${className}` : ""}`,
      style,
    },
    children,
  );
}