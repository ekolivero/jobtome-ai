import "server-only";

import {
 createStreamableValue,
} from "ai/rsc";

import { spinner } from "@/components/offer";
import { experimental_streamText } from "ai";
import React from "react";
import { openai as chatOpenAI } from "ai/openai";

export const runtime = "edge";
export const config = {
  supportsResponseStreaming: true,
};

export async function submitCompanyInformation({
  company
}: {
  company: string;
}) {
  "use server";

  const companyUI = createStreamableValue();
  const isCompanyGenerating = createStreamableValue(true);

  companyUI.update(<p> {spinner} generating company information</p>);

  const result = await experimental_streamText({
    model: chatOpenAI.chat("gpt-3.5-turbo"),
    system: `\
      You are an AI assistant for jobtome, a company that aggregates job offers from different sources.
      Your goal is to make a research on the company that the user is looking for. 
      Provide a short and concise message. 
      User will really value your help.
    `,
    prompt: `Tell me more about ${company}`,
  });

  let fullResponse = "";
  for await (const delta of result.textStream) {
    fullResponse += delta;
    companyUI.update(<p className="text-foreground text-xs mt-4"> {fullResponse} </p>);
  }

  companyUI.done();
  isCompanyGenerating.done(false);

  
  return {
    id: Date.now(),
    companyInformation: companyUI.value,
    isCompanyGenerating: isCompanyGenerating.value,
  };
}
