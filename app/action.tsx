import "server-only";

import { createAI, createStreamableUI, createStreamableValue, getAIState, getMutableAIState } from "ai/rsc";
import OpenAI from "openai";

import { openai as chatOpenAI } from "ai/openai";


import {
  spinner,
  BotCard,
  BotMessage,
} from "@/components/offer";

import {
  runOpenAICompletion,
} from '@/lib/openai';
import { z } from "zod";
import { StreamingTextResponse, experimental_generateObject, experimental_generateText, experimental_streamText } from "ai";
import JobList from "@/components/offer/job-list";
import React from "react";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

async function submitUserMessage({ content }: { content: string } ) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();

  aiState.update([
    ...aiState.get(),
    {
      role: "user",
      content,
    },
  ]);
  

  const args = await experimental_generateObject({
    model: chatOpenAI.chat("gpt-3.5-turbo"),
    schema: z.object({
      keyword: z.string().describe("The job title the user is looking for"),
      location: z.string().describe("The location the user is looking for"),
      additionalInformation: z
        .string()
        .optional()
        .describe("Additional information the user is looking for"),
    }),
    maxTokens: 2500,
    system:
      "Your goal is to extract the information from the user's request. When the information are not provided you should return an empty string instead of inventing value.",
    messages: [
      ...aiState
        .get()
        .map((info: any) => {
          return {
            role: info?.role,
            content: info?.content,
            name: info?.name,
          };
        }),
    ],
  });

  async function createObjectList({ keyword, location}: { keyword: string, location: string}) {
    const offers = createStreamableUI()

    const response = await fetch(
      `https://search-apis.eu.jobtome.io/search?country=uk&query=${keyword}&location=${location}&radius=25&limit=40&algorithm=semantic`
    );

    const JSONResponse = await response.json();

    offers.done(<JobList jobs={JSONResponse.data} />);

    return offers

  }

  function returnFollowup({ keyword, location, additionalInformation }: { keyword: string, location: string, additionalInformation: string }) {

    const reply = createStreamableUI();

    experimental_streamText({
      model: chatOpenAI.chat("gpt-3.5-turbo"),
      maxTokens: 2500,
      system: `Given the user history and the following information job title position ${keyword} in ${location} with ${additionalInformation}, 
          suggest a nice and concise follow up question when needed to narrow down the search`,
      messages: [
        ...aiState
          .get()
          .filter((info) => info.role !== "function")
          .map((info: any) => {
            return {
              role: info?.role,
              content: info?.content,
              name: info?.name,
            };
          }),
      ],
    }).then(async (result) => {
      try {
        let text = "";
        for await (const partialItinerary of result.fullStream) {
          text +=
            partialItinerary.type === "text-delta"
              ? partialItinerary.textDelta
              : "";
          reply.update(<BotMessage>{text}</BotMessage>);
        }
      } finally {
        reply.done();
      }
    });

    return reply
  }


  if (args.object.keyword && args.object.location) {

    const offers1 = await createObjectList({ keyword: args.object.keyword, location: args.object.location })

    const followup = returnFollowup({ keyword: args.object.keyword, location: args.object.location, additionalInformation: args.object.additionalInformation ?? "" })

    aiState.done([
      ...aiState.get(),
      {
        role: "system",
        name: "suggestion",
        content: "response from followup",
      },
    ]);

    return {
      id: Date.now(),
      display: followup.value,
      offers: offers1.value,
    };


  } else {
    const reply = createStreamableUI();
    const offers = getAIState('offers')

    experimental_streamText({
      model: chatOpenAI.chat("gpt-3.5-turbo"),
      maxTokens: 2500,
      system: "Based on the user's request, provide a response that is relevant to the user's request.",
      messages: [
        ...aiState
          .get()
          .map((info: any) => {
            return {
              role: info?.role,
              content: info?.content,
              name: info?.name,
            };
          }),
      ],
    }).then(async (result) => {
      let text = "";
      try {
        for await (const partialItinerary of result.fullStream) {
          text +=
            partialItinerary.type === "text-delta"
              ? partialItinerary.textDelta
              : "";
          reply.update(<BotMessage>{text}</BotMessage>);
        }
      } finally {

        aiState.done([
          ...aiState.get(),
          {
            role: "system",
            name: "suggestion",
            content: "response from chat",
          },
        ]);

        reply.done();
      }
    });

    return {
      id: Date.now(),
      display: reply.value,
      offers: offers
    };
  }
}

const initialAIState: {
  role: "user" | "assistant" | "system" | "function";
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
  offers: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submitUserMessage,
  },
  initialUIState,
  initialAIState,
});
