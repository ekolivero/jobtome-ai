'use client'
import {
  CornerDownLeft, MessageCircle, MicIcon, PaperclipIcon, UserRoundCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

    // async function triggerActionWithInitialData() {

    //   let prompt: string;

    //   if (!keywordSearch && locationSearch) {
    //     prompt = `I'm currently looking for new positions in ${locationSearch}`;
    //   } else if (keywordSearch && !locationSearch) {
    //     prompt = `I would like to work as ${keywordSearch}`;
    //   } else {
    //     prompt = `I'd like to work as ${keywordSearch} in ${locationSearch}`;
    //   }

    //   setMessages((currentMessages) => [
    //     ...currentMessages,
    //     {
    //       id: Date.now(),
    //       display: <UserMessage>{prompt}</UserMessage>,
    //     },
    //   ]);

    //   const responseMessage = await submitUserMessage({
    //     content: prompt,
    //   });
    //   const isGeneratingStream = readStreamableValue(
    //     responseMessage.isGenerating
    //   );

    //   setMessages((currentMessages) => [...currentMessages, responseMessage]);

    //   for await (const value of isGeneratingStream) {
    //     if (value != null) {
    //       setIsLoading(value);
    //     }
    //   }

    //   const isGeneratingOffers = readStreamableValue(responseMessage.offers);

    //   for await (const value of isGeneratingOffers) {
    //     if (value != null) {
    //       setOffersComponent(value);
    //     }
    //   }
      
    // }

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
        <div className="grid h-[calc(100svh-56px)] w-full overflow-none">
          <div className="flex flex-col">
            <main className="grid flex-1 gap-4 md:p-4 md:grid-cols-2 lg:grid-cols-4">
              {isDesktop ? (
                <>
                  <div className="relative flex h-full md:max-h-[calc(100vh-80px)] flex-col rounded-xl bg-muted/50 md:p-4 lg:col-span-2">
                    <div className="flex flex-1 h-full overflow-auto mt-2 md:mt-0">
                      {messages.length ? (
                        <>
                          <ChatList messages={messages} />
                        </>
                      ) : (
                        <EmptyScreen
                          submitMessage={async (message) => {
                            // Add user message UI
                            setMessages((currentMessages) => [
                              ...currentMessages,
                              {
                                id: Date.now(),
                                display: <UserMessage>{message}</UserMessage>,
                              },
                            ]);

                            // Submit and get response message
                            const responseMessage = await submitUserMessage({
                              content: message,
                            });
                            setMessages((currentMessages) => [
                              ...currentMessages,
                              responseMessage,
                            ]);
                          }}
                        />
                      )}
                    </div>
                    <ChatScrollAnchor trackVisibility={true} />
                    <form
                      ref={formRef}
                      className={`relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring min-h-[110px] m-2 md:m-0`}
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
                      <Label htmlFor="message" className="sr-only">
                        Message
                      </Label>
                      {isFeedback ? (
                        <Textarea
                          ref={inputRef}
                          tabIndex={0}
                          id="message"
                          placeholder="I've got some feedback..."
                          className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                          value={feedbackValue}
                          onChange={(e) => setFeedbackValue(e.target.value)}
                        />
                      ) : (
                        <Textarea
                          ref={inputRef}
                          tabIndex={0}
                          onKeyDown={onKeyDown}
                          id="message"
                          placeholder="Type your message here..."
                          className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                        />
                      )}
                      <div className="flex items-center p-3 pt-0">
                        <TooltipProvider>
                          {isFeedback ? (
                            <Tooltip>
                              <TooltipTrigger
                                asChild
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsFeedback((prev) => !prev);
                                }}
                              >
                                <Button size="icon" variant="ghost">
                                  <MessageCircle className="size-4" />
                                  <span className="sr-only">Chat 4 jobs</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Chat 4 jobs
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger
                                asChild
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsFeedback((prev) => !prev);
                                }}
                              >
                                <Button size="icon" variant="ghost">
                                  <UserRoundCheck className="size-4" />
                                  <span className="sr-only">
                                    Leave feedback
                                  </span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Leave feedback
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                        {isFeedback && (
                          <p className="text-foreground text-xs">
                            {" "}
                            Your feedback will help us improve your experience{" "}
                          </p>
                        )}
                        {isFeedback ? (
                          <Button
                            type="button"
                            size="sm"
                            className="ml-auto gap-1.5"
                            variant={"outline"}
                            disabled={!feedbackValue.trim()}
                          >
                            Leave feedback
                            <CornerDownLeft className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            size="sm"
                            className="ml-auto gap-1.5"
                          >
                            Send Message
                            <CornerDownLeft className="size-3.5" />
                          </Button>
                        )}
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
                </>
              ) : (
                <>
                  <TabsContent value="chat" className="mt-0 over">
                    <div className="relative flex h-full flex-col rounded-xl bg-muted/50 pb-[138px] md:p-4 lg:col-span-2">
                      <div className="flex flex-1 h-full overflow-auto md:mt-0 mt-2">
                        {messages.length ? (
                          <>
                            <ChatList messages={messages} />
                          </>
                        ) : (
                          <EmptyScreen
                            submitMessage={async (message) => {
                              // Add user message UI
                              setMessages((currentMessages) => [
                                ...currentMessages,
                                {
                                  id: Date.now(),
                                  display: <UserMessage>{message}</UserMessage>,
                                },
                              ]);

                              // Submit and get response message
                              const responseMessage = await submitUserMessage({
                                content: message,
                              });
                              setMessages((currentMessages) => [
                                ...currentMessages,
                                responseMessage,
                              ]);
                            }}
                          />
                        )}
                      </div>
                      <ChatScrollAnchor trackVisibility={true} />
                      <ChatPanel setMessages={setMessages} submitUserMessage={submitUserMessage} messages={messages} setInput={setInputValue} />
                      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-screen-sm">
                      <form
                        ref={formRef}
                        className={`relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring min-h-[110px] m-2 md:m-0`}
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
                                setAreNewOffers(true);
                              }
                            }
                          } catch (error) {
                            // You may want to show a toast or trigger an error state.
                            console.error(error);
                          }
                        }}
                      >
                        <Label htmlFor="message" className="sr-only">
                          Message
                        </Label>
                        {isFeedback ? (
                          <Textarea
                            ref={inputRef}
                            tabIndex={0}
                            id="message"
                            placeholder="I've got some feedback..."
                            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0 text-[16px]"
                            value={feedbackValue}
                            onChange={(e) => setFeedbackValue(e.target.value)}
                          />
                        ) : (
                          <Textarea
                            ref={inputRef}
                            tabIndex={0}
                            onKeyDown={onKeyDown}
                            id="message"
                            placeholder="Type your message here..."
                            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0 text-[16px]"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                          />
                        )}
                        <div className="flex items-center p-3 pt-0">
                          <TooltipProvider>
                            {isFeedback ? (
                              <Tooltip>
                                <TooltipTrigger
                                  asChild
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setIsFeedback((prev) => !prev);
                                  }}
                                >
                                  <Button size="icon" variant="ghost">
                                    <MessageCircle className="size-4" />
                                    <span className="sr-only">Chat 4 jobs</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Chat 4 jobs
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  asChild
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setIsFeedback((prev) => !prev);
                                  }}
                                >
                                  <Button size="icon" variant="ghost">
                                    <UserRoundCheck className="size-4" />
                                    <span className="sr-only">
                                      Leave feedback
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Leave feedback
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </TooltipProvider>
                          {isFeedback && (
                            <p className="text-foreground text-xs">
                              {" "}
                              Your feedback will help us improve your experience{" "}
                            </p>
                          )}
                          {isFeedback ? (
                            <Button
                              type="button"
                              size="sm"
                              className="ml-auto gap-1.5"
                              variant={"outline"}
                              disabled={!feedbackValue.trim()}
                            >
                              Leave feedback
                              <CornerDownLeft className="size-3.5" />
                            </Button>
                          ) : (
                            <Button
                              type="submit"
                              size="sm"
                              className="ml-auto gap-1.5"
                            >
                              Send Message
                              <CornerDownLeft className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </form>
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
          </div>
        </div>
      </Tabs>
    </div>
  );
}
