import { Separator } from "@/components/ui/separator";

export function ChatList({ messages }: { messages: any[] }) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative px-4">
      {messages.map((message, index) => {
        return (
          <div key={index} className="pb-4">
            {message.responseOffers}
            {message.carousel}
            {message.display}
          </div>
        );})}
    </div>
  );
}
