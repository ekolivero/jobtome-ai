import "server-only";

import { StreamableValue, createAI, createStreamableUI, createStreamableValue, getMutableAIState } from "ai/rsc";
import OpenAI from "openai";

import {
  spinner,
  BotMessage,
} from "@/components/offer";

import {
  runOpenAICompletion,
} from '@/lib/openai';
import { z } from "zod";
import { experimental_streamObject, experimental_streamText } from "ai";
import React from "react";
import { openai as chatOpenAI } from "ai/openai";
import JobList, { JobProps } from "@/components/offer/job-list";
import { SkeletonList } from "@/components/skeleton-list";
import Job from "@/components/offer/job";
import { CarouselList } from "@/components/offer/carousel-list";
import { offers as jsonOffers } from "@/lib/offer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const runtime = "edge";
export const config = {
  supportsResponseStreaming: true,
};

async function submitUserMessage({ content }: { content: string }) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: "user",
      content,
    },
  ]);

  const reply = createStreamableUI(
    <BotMessage className="items-center">{spinner}</BotMessage>
  );

  const carousel = createStreamableUI()

  const offers = createStreamableValue();
  const isGenerating = createStreamableValue(false);
  const responseOffers = createStreamableUI();

  const completion = runOpenAICompletion(openai, {
    model: "gpt-4-turbo-preview",
    stream: true,
    messages: [
      {
        role: "system",
        content: `\
        Answer the user's request using relevant tools (if they are available). Before calling a tool, do some analysis within <thinking></thinking> tags. 
        First, think about which of the provided tools is the relevant tool to answer the user's request. Second, go through each of the required 
        parameters of the relevant tool and determine if the user has directly provided or given enough information to infer a value. 
        When deciding if the parameter can be inferred, carefully consider all the context to see if it supports a specific value. 
        If all of the required parameters are present or can be reasonably inferred, close the thinking tag and proceed with the tool call. 
        BUT, if one of the values for a required parameter is missing, 
        DO NOT invoke the function (not even with fillers for the missing params) and instead, ask the user to provide the missing parameters.
        DO NOT ask for more information on optional parameters if it is not provided.

        You are an AI assistant for jobtome, a company that aggregates job offers from different sources. Your goal is to help the user
        find the right job offer or address their questions about the job market. 

        Here some examples of questions you can answer:
        - I'd like to work in the hospitality do you have any suggestion?
        - What are good opportunities in the IT sector?
        - What are the most requested jobs in UK?

        When user is asking for your suggestion close the thinking and proceed with generating an answer without invoiking any function.
        Answer should be short and concise with a list of job titles or sectors. Max 30 words.
    
        Only when you have enought information (keyword and location) to provide a list of job offers, you can call the function \'get_job_offers\'.
        `,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [
      {
        name: "get_job_offers",
        description: "Get the job offers list based on the user reuqest",
        parameters: z.object({
          keyword: z
            .string()
            .describe("The job title or position the user is asking"),
          location: z.string().describe("The location of the job offer"),
          additionalInformation: z
            .array(z.string())
            .describe("Additional information for narrow down the search"),
        }),
      },
    ],
    temperature: 0,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(<BotMessage>{content}</BotMessage>);
    if (isFinal) {
      reply.done();
      isGenerating.done(false);
      offers.done(null)
      aiState.done([...aiState.get(), { role: "assistant", content }]);
    }
  });

  completion.onFunctionCall("get_job_offers", async ({ keyword, location, additionalInformation }) => {

    isGenerating.update(true);
    offers.update(<SkeletonList />)
    reply.update(
      <BotMessage>
        <span className="inline-flex">
          {spinner}{" "}
          <p className="text-foreground ml-2">
            {" "}
            Searching {keyword} in {location} {additionalInformation.length > 0 && `with ${additionalInformation.join(", ")}`}...{" "}
          </p>
        </span>
      </BotMessage>
    );

    const result = await experimental_streamText({
      model: chatOpenAI.chat("gpt-4-turbo-preview"),
      system: `\
      You are an AI assistant for jobtome, a company that aggregates job offers from different sources.
      The user has requested for a position and a location, your goal is to provide a followup message to narrow down the job search.
      Provide a short and concise message, do not present or compliment, do not repeat the prompt. Let the user know that offers are 
      already available. The followup message should be short and concise. Once thing at the time.
    `,
      prompt: `I'd like to work as ${keyword} in ${location} with ${additionalInformation.join(", ")}.`,
    });

    const enhancedKeyword = keyword + " " + additionalInformation.join(" ");
    const response = await fetch(
      `https://search-apis.eu.jobtome.io/search?country=uk&query=${enhancedKeyword}&location=${location}&radius=25&limit=40&algorithm=semantic`
    );

    const JSONResponse = jsonOffers

    if (JSONResponse.data.length > 0) {
      responseOffers.done(
        <BotMessage> Here some must check offers for you </BotMessage>
      );
    } else {
      responseOffers.done()
    }

    carousel.done(<CarouselList j={JSONResponse.data.slice(0, 5)} /> )

    let fullResponse = "";
    for await (const delta of result.textStream) {
      fullResponse += delta;
      reply.update(<BotMessage>{fullResponse} </BotMessage>);
    }

    offers.done(
      <JobList jobs={JSONResponse.data} />
    )

    reply.done()

    aiState.done([
      ...aiState.get(),
      {
        role: "function",
        name: "list_offers",
        content: `User requested job offers for ${keyword} in ${location} with ${additionalInformation.join(
          ", "
        )}`,
      },
    ]);

    isGenerating.done(false);
  });

  return {
    id: Date.now(),
    display: reply.value,
    offers: offers.value,
    isGenerating: isGenerating.value,
    carousel: carousel.value,
    responseOffers: responseOffers.value
  };
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
  offers?: StreamableValue<React.ReactNode>;
  isGenerating?: StreamableValue<boolean>;
  carousel?: React.ReactNode;
  responseOffers?: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submitUserMessage,
  },
  initialUIState,
  initialAIState,
});
