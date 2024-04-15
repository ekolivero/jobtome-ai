"use client";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { HeartIcon, Share2Icon } from "lucide-react";
import { IconAI } from "../ui/icons";
import { readStreamableValue, useActions } from "ai/rsc";
import { AI } from "@/app/action";
import { useState } from "react";
import { JobProps } from "./job-list";
import { spinner } from ".";

export default function JobWithCompanyInfo({ j, idx}: { j: JobProps, idx: number}) {

    const { submitCompanyInformation } = useActions<typeof AI>();
    const [isLoading, setIsLoading] = useState(false);
    const [companyInformation, setCompanyInformation] = useState(null);

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto p-2" key={idx}>
      <div className="flex flex-col bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold">{j.title} </h2>
        <h3 className="text-lg text-gray-500 dark:text-gray-400">
          {j.company}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{j.geo.city}</p>
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
        <Button
          className={`mt-4 ${companyInformation && "hidden"}`}
          variant={"outline"}
          onClick={async () => {
            const responseMessage = await submitCompanyInformation({
              company: j.company,
            });

            const isGeneratingOffers = readStreamableValue(
              responseMessage.companyInformation
            );

            for await (const value of isGeneratingOffers) {
              if (value != null) {
                setCompanyInformation(value);
              }
            }

            const isGeneratingStream = readStreamableValue(
              responseMessage.isCompanyGenerating
            );

            for await (const value of isGeneratingStream) {
              if (value != null) {
                setIsLoading(value);
              }
            }
          }}
        >
          <IconAI className="mr-2" /> {isLoading && spinner} More about this company{" "}
        </Button>
        {companyInformation && companyInformation}
      </div>
    </div>
  );
}
