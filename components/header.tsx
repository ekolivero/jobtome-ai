import Link from "next/link";

import {
  IconGitHub,
  IconSeparator,
  IconSparkles,
  IconVercel,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TabsList, TabsTrigger } from "./ui/tabs";

export function Header({ activeTab, setActiveTab, areNewOffers }: { activeTab: string, setActiveTab: (value: string) => void, areNewOffers: boolean}) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full px-4 border-b h-14 shrink-0 bg-background backdrop-blur-xl">
      <span className="items-center home-links whitespace-nowrap hidden md:inline-flex">
        <a href="https://vercel.com" rel="noopener" target="_blank">
          <IconVercel className="w-5 h-5 sm:h-6 sm:w-6" />
        </a>
        <IconSeparator className="w-6 h-6 text-muted-foreground/20" />
        <Link href="/">
          <span className="text-lg font-bold">
            <IconSparkles className="inline mr-0 w-4 sm:w-5 mb-0.5" />
            AI
          </span>
        </Link>
      </span>
      <TabsList className="flex flex-1 md:hidden">
        <TabsTrigger
          value="chat"
          className={`text-zinc-600 dark:text-zinc-200 ${
            activeTab === "chat" && "w-full"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          Chat
        </TabsTrigger>
        <TabsTrigger
          value="offers"
          className={`text-zinc-600 dark:text-zinc-200 ${
            activeTab === "offers" && "w-full"
          }`}
          onClick={() => {
            setActiveTab("offers");
          }}
        >
          Offers
          {areNewOffers ? (
            <span className="flex h-3 w-3 ml-2 rounded-full bg-blue-600 animate-pulse" />
          ) : (
            <span className="flex h-2 w-2 ml-2 rounded-full bg-gray-300" />
          )}
        </TabsTrigger>
      </TabsList>
    </header>
  );
}
