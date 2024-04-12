import { Dashboard } from "@/components/chat-dashboard";
import { Suspense } from "react";

export const runtime = "edge";
export const revalidate = 0;

export default function Home() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
