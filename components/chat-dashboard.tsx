'use client'
import {
  CornerDownLeft,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { ChatScrollAnchor } from "@/lib/hooks/chat-scroll-anchor";
import { ChatList } from "./chat-list";
import { EmptyScreen } from "./empty-screen";
import { UserMessage } from "./offer/message";
import { useAIState, useActions, useUIState } from "ai/rsc";
import { AI } from "@/app/action";

export function Dashboard() {

  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [inputValue, setInputValue] = useState("");


  const [messages, setMessages] = useUIState<typeof AI>();
  const [history, setHistory] = useAIState<typeof AI>();

  const { submitUserMessage } = useActions<typeof AI>();

  const offersList = messages.filter((message) => message.offers);

  const offers = offersList[offersList.length - 1]?.offers;

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
    <div className="grid h-[calc(100vh-56px)] w-full">
      <div className="flex flex-col">
        <main className="grid flex-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative flex max-h-[calc(100vh-88px)] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <div className="flex flex-1 h-full overflow-auto">
              <Badge variant="outline" className="absolute right-3 top-3">
                Chat
              </Badge>
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
                        offers,
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
              className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring min-h-[110px]"
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
                    offers: offers
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
                } catch (error) {
                  // You may want to show a toast or trigger an error state.
                  console.error(error);
                }
              }}
            >
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
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
              <div className="flex items-center p-3 pt-0">
                <Button type="submit" size="sm" className="ml-auto gap-1.5">
                  Send Message
                  <CornerDownLeft className="size-3.5" />
                </Button>
              </div>
            </form>
          </div>
          <div className="relative hidden flex-col items-start gap-2 md:flex lg:col-span-2 max-h-[calc(100vh-88px)] overflow-auto">
            {/* <form className="grid w-full items-start gap-6">
              <Messages
                setSystemMessage={setSystemMessage}
                systemMessage={systemMessage}
              />
              <FollowUp
                setSystemFollowUp={setSystemFollowUp}
                systemFollowUp={systemFollowUp}
              />
              <Button
                type="button"
                size="sm"
                className="ml-auto gap-1.5"
                onClick={saveValuesLocalStorage}
              >
                {" "}
                Save{" "}
              </Button>
            </form> */}
            {offers}
          </div>
        </main>
      </div>
    </div>
  );
}
