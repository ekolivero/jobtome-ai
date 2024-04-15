import "server-only";

import {
  StreamableValue,
  createAI,
  createStreamableUI,
  createStreamableValue,
  getMutableAIState,
} from "ai/rsc";

import { spinner, BotMessage } from "@/components/offer";
import { experimental_streamText } from "ai";
import React from "react";
import { openai as chatOpenAI } from "ai/openai";
import { AI } from "./action";

export const runtime = "edge";
export const config = {
  supportsResponseStreaming: true,
};

export async function submitFollowUp({ keyword, location, additionalInformation}: { keyword: string, location: string, additionalInformation: string[] }) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: "user",
      content: `user is looking for followup question for ${keyword} in ${location}`,
    },
  ]);

  const followup = createStreamableUI();

  followup.update(
    <BotMessage className="items-center">
      {spinner} generating follow up question...
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
    prompt: `I'd like to work as ${keyword} in ${location} with ${additionalInformation.join(
      ", "
    )}.`,
  });

  let fullResponse = "";
  for await (const delta of result.textStream) {
    fullResponse += delta;
    followup.update(<BotMessage>{fullResponse} </BotMessage>);
  }

  followup.done()

  return {
    id: Date.now(),
    followup: followup.value,
  };
}
