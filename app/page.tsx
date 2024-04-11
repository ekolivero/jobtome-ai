import { Dashboard } from "@/components/chat-dashboard";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
