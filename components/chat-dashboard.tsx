'use client'
import {
  CornerDownLeft, MessageCircle, UserRoundCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Textarea from "react-textarea-autosize";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { ChatScrollAnchor } from "@/lib/hooks/chat-scroll-anchor";
import { ChatList } from "./chat-list";
import { EmptyScreen } from "./empty-screen";
import { UserMessage } from "./offer/message";
import { readStreamableValue, useActions, useUIState } from "ai/rsc";
import { AI } from "@/app/action";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { SkeletonList } from "./skeleton-list";
import { useSwipeable } from "react-swipeable";
import { Header } from "./header";
import { Tabs, TabsContent } from "./ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ChatPanel } from "./chat-pannel";
import { IconArrowRight } from "./ui/icons";

export function Dashboard() {

  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useUIState<typeof AI>();
  const [loading, setIsLoading] = useState(false);
  const [isFeedback, setIsFeedback] = useState(false);
  const [feedbackValue, setFeedbackValue] = useState("");

  const [offersComponent, setOffersComponent] = useState<ReactNode>(null);

  const { submitUserMessage } = useActions<typeof AI>();

  const searchParams = useSearchParams()
  const keywordSearch = searchParams.get("keyword");
  const locationSearch = searchParams.get("location");

  const [openings, setOpenings] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [areNewOffers, setAreNewOffers] = useState(false);


  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setActiveTab("offers");
      setAreNewOffers(false);
    },
    onSwipedRight: () => setActiveTab("chat"),
  });

  useEffect(() => {
    async function triggerActionWithInitialData() {
      let prompt = ""
      if (!keywordSearch && locationSearch) {
        prompt = `I'm currently looking for new positions in ${locationSearch} as <insert job title here>`;
      } else if (keywordSearch && !locationSearch) {
        prompt = `I would like to work as ${keywordSearch} in <insert location here>`;
      } else {
        prompt = `I'd like to work as ${keywordSearch} in ${locationSearch}`;
      }

      setInputValue(prompt)
    }

    if (keywordSearch || locationSearch) {
      triggerActionWithInitialData();
    }

  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        if (
          e.target &&
          ["INPUT", "TEXTAREA"].includes((e.target as any).nodeName)
        ) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (inputRef?.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [inputRef]);
  
  return (
    <div>
      <Tabs defaultValue="chat" value={activeTab}>
        <Header
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          areNewOffers={areNewOffers}
        />
        <main className="flex flex-col flex-1 md:h-[calc(100vh-56px)]">
          {isDesktop ? (
            <div className="grid flex-1 gap-4 md:p-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative flex h-full  flex-col rounded-xl bg-muted/50 md:p-4 lg:col-span-2">
                <div className="flex flex-1 h-full overflow-auto mt-2 md:mt-0">
                  {messages.length ? (
                    <>
                      <ChatList messages={messages} />
                    </>
                  ) : (
                    <EmptyScreen />
                  )}
                </div>
                <ChatScrollAnchor trackVisibility={true} />
                <form
                  ref={formRef}
                  onSubmit={async (e: any) => {
                    e.preventDefault();

                    // Blur focus on mobile
                    if (window.innerWidth < 600) {
                      e.target["message"]?.blur();
                    }

                    const value = inputValue.trim();
                    setInputValue("");
                    if (!value) return;

                    // Add user message UI
                    setMessages((currentMessages) => [
                      ...currentMessages,
                      {
                        id: Date.now(),
                        display: <UserMessage>{value}</UserMessage>,
                      },
                    ]);

                    try {
                      // Submit and get response message
                      const responseMessage = await submitUserMessage({
                        content: value,
                      });

                      setMessages((currentMessages) => [
                        ...currentMessages,
                        responseMessage,
                      ]);

                      const isGeneratingStream = readStreamableValue(
                        responseMessage.isGenerating
                      );

                      for await (const value of isGeneratingStream) {
                        if (value != null) {
                          setIsLoading(value);
                        }
                      }

                      const isGeneratingOffers = readStreamableValue(
                        responseMessage.offers
                      );

                      for await (const value of isGeneratingOffers) {
                        if (value != null) {
                          setOffersComponent(value);
                        }
                      }
                    } catch (error) {
                      // You may want to show a toast or trigger an error state.
                      console.error(error);
                    }
                  }}
                >
                  <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-zinc-100 pl-2 pr-12 sm:rounded-full">
                    <Textarea
                      ref={inputRef}
                      tabIndex={0}
                      onKeyDown={onKeyDown}
                      placeholder="Type your preference here..."
                      className="min-h-[60px] w-full bg-transparent placeholder:text-zinc-900 resize-none px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                      autoFocus
                      spellCheck={false}
                      autoComplete="off"
                      autoCorrect="off"
                      name="message"
                      rows={1}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <div className="absolute right-4 top-[13px] sm:right-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="submit"
                            size="icon"
                            disabled={inputValue === ""}
                            className="bg-transparent shadow-none text-zinc-950 rounded-full hover:bg-zinc-200"
                          >
                            <IconArrowRight />
                            <span className="sr-only">Send message</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </form>
              </div>
              <div className="relative flex-col items-start gap-2 md:flex lg:col-span-2 max-h-[calc(100vh-88px)] overflow-auto">
                {loading ? (
                  <SkeletonList />
                ) : (
                  { offersComponent }.offersComponent
                )}
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="chat" className="mt-0">
                <div className="mt-0 over relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
                  <div className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] bg-muted/50">
                    {messages.length ? (
                      <div className="pb-[60px] pt-4">
                        <ChatList messages={messages} />
                      </div>
                    ) : (
                      <div className="pb-[200px] pt-4">
                        <EmptyScreen />
                      </div>
                    )}
                    <div className="fixed inset-x-0 bottom-0 w-full duration-300 ease-in-out peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px] dark:from-10%">
                      <ChatScrollAnchor trackVisibility={true} />
                      <div className="mx-auto sm:max-w-2xl sm:px-4">
                        {messages.length === 0 && (
                          <ChatPanel
                            setMessages={setMessages}
                            submitUserMessage={submitUserMessage}
                            messages={messages}
                            setInput={setInputValue}
                          />
                        )}

                        <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-zinc-100 px-2 pr-12 sm:rounded-full">
                          <form
                            ref={formRef}
                            onSubmit={async (e: any) => {
                              e.preventDefault();

                              // Blur focus on mobile
                              if (window.innerWidth < 600) {
                                e.target["message"]?.blur();
                              }

                              const value = inputValue.trim();
                              setInputValue("");
                              if (!value) return;

                              // Add user message UI
                              setMessages((currentMessages) => [
                                ...currentMessages,
                                {
                                  id: Date.now(),
                                  display: <UserMessage>{value}</UserMessage>,
                                },
                              ]);

                              try {
                                // Submit and get response message
                                const responseMessage = await submitUserMessage(
                                  {
                                    content: value,
                                  }
                                );

                                setMessages((currentMessages) => [
                                  ...currentMessages,
                                  responseMessage,
                                ]);

                                const isGeneratingStream = readStreamableValue(
                                  responseMessage.isGenerating
                                );

                                for await (const value of isGeneratingStream) {
                                  if (value != null) {
                                    setIsLoading(value);
                                  }
                                }

                                const isGeneratingOffers = readStreamableValue(
                                  responseMessage.offers
                                );

                                for await (const value of isGeneratingOffers) {
                                  if (value != null) {
                                    setOffersComponent(value);
                                    setAreNewOffers(true);
                                  }
                                }
                              } catch (error) {
                                // You may want to show a toast or trigger an error state.
                                console.error(error);
                              }
                            }}
                          >
                            {/* <Tooltip>
            <TooltipTrigger asChild> */}

                            {/* </TooltipTrigger>
            <TooltipContent>Add Attachments</TooltipContent>
          </Tooltip> */}
                            <Textarea
                              ref={inputRef}
                              tabIndex={0}
                              onKeyDown={onKeyDown}
                              placeholder="Type your preference here..."
                              className="min-h-[60px] w-full bg-transparent placeholder:text-zinc-900 resize-none px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                              autoFocus
                              spellCheck={false}
                              autoComplete="off"
                              autoCorrect="off"
                              name="message"
                              rows={1}
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                            />
                            <div className="absolute right-4 top-[13px] sm:right-4">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="submit"
                                    size="icon"
                                    disabled={inputValue === ""}
                                    className="bg-transparent shadow-none text-zinc-950 rounded-full hover:bg-zinc-200"
                                  >
                                    <IconArrowRight />
                                    <span className="sr-only">
                                      Send message
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send message</TooltipContent>
                              </Tooltip>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="offers">
                <div className="relative flex-col items-start gap-2 md:flex lg:col-span-2 max-h-[calc(100vh-88px)] overflow-auto">
                  {loading ? (
                    <SkeletonList />
                  ) : (
                    { offersComponent }.offersComponent
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </main>
      </Tabs>
    </div>
  );
}
