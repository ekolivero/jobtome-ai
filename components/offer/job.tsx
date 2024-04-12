import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Button } from "../ui/button";
import { Share1Icon } from "@radix-ui/react-icons";
import { HeartIcon, SaveIcon, Share2Icon } from "lucide-react";

export type JobProps = {
  title: string;
  short_descr: string;
  geo: {
    city: string;
  };
  company: string;
};

type JobListProps = {
  jobs: JobProps[];
};

export default function Job({ j }: { j: JobProps} ) {
    return (
      <div className="flex flex-col rounded-lg p-6 bg-white md:hidden h-full align-middle justify-center">
        <h2 className="text-xl font-bold truncate">{j.title} </h2>
        <h3 className="text-lg text-gray-500 dark:text-gray-400">
          {j.company}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{j.geo.city}</p>
        <div className="flex flex-row">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              asChild
              onClick={(e) => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: "Example Page",
                      text: "Check out this interesting webpage!",
                      url: window.location.href,
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
        <Button variant={"outline"} className="mt-1 text-xs">
          View Job
        </Button>
      </div>
    );
}