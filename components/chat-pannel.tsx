import * as React from "react";

import { nanoid, random } from "nanoid";
import { UserMessage, BotMessage } from "./offer/message";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

export interface ChatPanelProps {
  id?: string;
  title?: string;
  input: string;
  setInput: (value: string) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

function pickThreeUniqueValues(list: string[]) {
  // Check if the list has at least 3 unique items
  if (new Set(list).size < 3) {
    throw new Error("The list must contain at least 3 unique items.");
  }

  const pickedValues = [];
  const pickedIndexes = new Set();

  while (pickedValues.length < 3) {
    // Generate a random index based on the list length
    const randomIndex = Math.floor(Math.random() * list.length);

    // Check if the index has already been used
    if (!pickedIndexes.has(randomIndex)) {
      pickedIndexes.add(randomIndex);
      pickedValues.push(list[randomIndex]);
    }
  }

  return pickedValues;
}

export function ChatPanel({
  messages,
  setMessages,
  submitUserMessage,
  setInput
}: {
    messages: any,
    setMessages: any,
    submitUserMessage: any
    setInput: any
}) {

    const suggestedPositions = [
        "Waiter",
        "Forklift driver",
        "Warehouse worker",
        "Cleaner",
        "Driver",
        "Factory worker",
        "Construction worker",
        "Electrician",
        "Plumber",
        "Carpenter",
        "Painter",
        "Mechanic",
        "Gardener",
        "Security guard",
        "Caregiver",
        "Nurse",
        "Accountant",
        "HR manager",
        "Marketing manager",
        "Sales manager",
    ]

    // generate a random number between 0 and the length of the array

    const exampleMessages = [
      {
        heading: "Search a job 🔎",
        subheading: "Looking for a new job position",
        message: "Looking for a new job position",
      },
      {
        heading: "Inspire me ⚡️",
        subheading: "I'm open to your suggestions",
        message: `Inspire and propose me a new job opportunity in London.`,
      },
    ];

    return (
      <div className="grid sm:grid-cols-2 gap-2 sm:gap-4 px-4 sm:px-0 pb-4">
        {messages.length === 0 &&
          exampleMessages.map((example, index) => (
            <div
              key={example.heading}
              className={cn(
                "cursor-pointer  text-zinc-950 rounded-2xl p-4 sm:p-6 bg-zinc-100 transition-colors",
                index > 1 && "hidden md:block"
              )}
              onClick={async () => {
                if (index === 1) {
                setMessages((currentMessages: any) => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: (
                      <BotMessage>
                        I&apos;m glad you&apos;re looking for a new job
                        opportunity! I can help you with that. 🚀
                        <p className="text-forground mt-4 mb-4">
                          {" "}
                          Here some suggestions
                        </p>
                        <div className="flex flex-1 flex-col gap-2 mb-2">
                          {pickThreeUniqueValues(suggestedPositions).map(
                            (e, idx) => (
                              <Badge
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 text-zinc-950 justify-center cursor-pointer hover:bg-zinc-200 transition-colors shadow-none"
                                onClick={async () => {
                                  setMessages((currentMessages: any) => [
                                    ...currentMessages,
                                    {
                                      id: nanoid(),
                                      display: (
                                        <UserMessage>
                                          I&apos;d like to work as {e}
                                        </UserMessage>
                                      ),
                                    },
                                  ]);

                                  const responseMessage =
                                    await submitUserMessage({
                                      content: `I'd like to work as ${e}`,
                                    });

                                  setMessages((currentMessages: any) => [
                                    ...currentMessages,
                                    responseMessage,
                                  ]);
                                }}
                              >
                                {e}
                              </Badge>
                            )
                          )}
                          <div className="flex flex-1 flex-col">
                            <Badge
                              key={"search-more"}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 text-zinc-950 justify-center cursor-pointer hover:bg-zinc-200 transition-colors shadow-none"
                              onClick={async () => {
                                setInput("I'd like to work as ...");
                              }}
                            >
                              Let me type it
                            </Badge>
                          </div>
                        </div>
                      </BotMessage>
                    ),
                  },
                ]);

                    return
                }
                setMessages((currentMessages: any) => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{example.message}</UserMessage>,
                  },
                ]);

                const responseMessage = await submitUserMessage({
                  content: example.message,
                });

                setMessages((currentMessages: any) => [
                  ...currentMessages,
                  responseMessage,
                ]);
              }}
            >
              <div className="font-medium">{example.heading}</div>
              <div className="text-sm text-zinc-800">{example.subheading}</div>
            </div>
          ))}
      </div>
    );
}