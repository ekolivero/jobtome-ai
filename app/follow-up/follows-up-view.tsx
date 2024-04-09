'use client'
import { PartialFollowsUp } from "./schema";
import { IconArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {  useAIState, useActions } from "ai/rsc";
import { AI } from "../action";

export const ItineraryView = ({ itinerary }: { itinerary?: PartialFollowsUp }) => {

    const [messages, setMessages] = useAIState<typeof AI>();
    const { submitUserMessage } = useActions<typeof AI>();

    return (
      <div className="mt-8">
        {itinerary?.followsUp && (
          <>
            <div className="space-y-4">
              {itinerary.followsUp.map(
                (question, index) =>
                  question && (
                    <div
                      className="mt-4 flex flex-col items-start space-y-2 mb-4"
                      key={index}
                    >
                      <Button
                        key={index}
                        variant="link"
                        className="h-auto p-0 text-base"
                        onClick={async () => {
                           setMessages((currentMessages) => [
                             ...currentMessages,
                             {
                                content: 'I would like to know more about this itinerary.',
                                role: 'user'
                             }
                           ]);

                           submitUserMessage({
                            content: 'I would like to know more about this itinerary.',
                            systemPrompt: localStorage.getItem('systemMessage') || '',
                            followUp: localStorage.getItem('systemFollowUp') || ''
                           })
                        }}
                      >
                        <IconArrowRight className="mr-2 text-muted-foreground" />
                        {question}
                      </Button>
                    </div>
                  )
              )}
            </div>
          </>
        )}
      </div>
    );}
