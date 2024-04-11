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


export function CarouselList({ j }: { j: JobProps[]}) {

    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);

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
      className="max-w-xs mx-auto mt-4"
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
      </CarouselContent>
    </Carousel>
  );
}
