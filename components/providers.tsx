'use client'
import { TooltipProvider } from "./ui/tooltip";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PostHogProvider client={posthog}>
      <TooltipProvider>{children}</TooltipProvider>
    </PostHogProvider>
  );
}