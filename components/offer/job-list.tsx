/**
 * v0 by Vercel.
 * @see https://v0.dev/t/NXzBPtQmYoJ
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
'use client'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { HeartIcon, Share2Icon } from "lucide-react";

export type JobProps = {
  title: string;
  short_descr: string;
  geo: {
    city: string;
  };
  company: string;
  url: string;
};

type JobListProps = {
    jobs: JobProps[];
}

export default function JobList({ jobs }: JobListProps) {
  return (
    <>
      {jobs.map((j, idx) => (
        <div
          className="flex flex-col gap-2 w-full max-w-2xl mx-auto p-2"
          key={idx}
        >
          <div className="flex flex-col bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold">{j.title} </h2>
            <h3 className="text-lg text-gray-500 dark:text-gray-400">
              {j.company}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {j.geo.city}
            </p>
            <p
              className="text-sm mt-2"
              dangerouslySetInnerHTML={{ __html: j.short_descr }}
            />
            <div className="flex flex-row">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  asChild
                  onClick={(e) => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: j.title,
                          text: "Check out this interesting job offer:",
                          url: j.url,
                        })
                        .then(() => console.log("Successful share"))
                        .catch((error) => console.log("Error sharing:", error));
                    } else {
                      alert("Your browser does not support the share API.");
                    }
                  }}
                >
                  <Button size="icon" variant="ghost">
                    <Share2Icon className="size-4" />
                    <span className="sr-only">Share offer</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Share offer</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  asChild
                  onClick={(e) => {
                    console.log("Do something");
                  }}
                >
                  <Button size="icon" variant="ghost">
                    <HeartIcon className="size-4" />
                    <span className="sr-only">Share offer</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Share offer</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            </div>
            <Button className="mt-4">Apply Now</Button>
          </div>
        </div>
      ))}
    </>
  );
}
