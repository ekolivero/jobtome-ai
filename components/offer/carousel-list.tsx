'use client'
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Job, { JobProps } from "./job";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { useActions } from "ai/rsc";
import { AI } from "@/app/action";
import { useUIState } from "ai/rsc";
import { spinner } from ".";

export function CarouselList({ j, keyword, location, additionalInformation }: { j: JobProps[], keyword: string, location: string, additionalInformation: string[]}) {

    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);

    const [isLoading, setIsLoading] = React.useState(false);

    const [_, setMessages] = useUIState();

    const { submitFollowUp } = useActions<typeof AI>();

    React.useEffect(() => {
        if (!api) {
        return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
        setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

  return (
    <Carousel
      className="max-w-xs mx-auto mt-4 shadow-sm rounded-lg bg-white mb-4 md:hidden"
      setApi={setApi}
      plugins={[
        Autoplay({
          delay: 4000,
          stopOnLastSnap: true,
        }),
      ]}
    >
      <CarouselContent>
        {j.map((job, index) => (
          <CarouselItem key={index}>
            <Job j={job} />
          </CarouselItem>
        ))}
        <CarouselItem>
          <div className="flex flex-col rounded-lg p-6 bg-white md:hidden h-full align-middle justify-center">
            <h2 className="text-xl font-bold truncate">Wanna see all offers? </h2>
            <h3 className="text-lg text-gray-500 dark:text-gray-400">
              Click on the button below
            </h3>
            <Button variant={"outline"} className="mt-4 text-xs">
              See all offers 
            </Button>
            <Button variant={"outline"} className="mt-2 text-xs" onClick={async () => {
              setIsLoading(true)
              const response = await submitFollowUp({
                keyword,
                location,
                additionalInformation
              })
              setIsLoading(false)
              setMessages((currentMessages: any[]) => [
                ...currentMessages,
                response
              ])
            }}>
              {isLoading && spinner} { "  " } More specific offers
            </Button>
          </div>
        </CarouselItem>
      </CarouselContent>
      <div className="flex justify-center space-x-2 items-center">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${
              current === index + 1 ? "w-2 h-2" : "w-1.5 h-1.5"
            } bg-gray-400 rounded-full ${
              current === index + 1 ? "bg-gray-800" : ""
            }`}
          />
        ))}
      </div>
      <div className="pb-4" />
    </Carousel>
  );
}
