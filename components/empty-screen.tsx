import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/external-link";
import { IconArrowRight } from "@/components/ui/icons";

const exampleMessages = [
  {
    heading: "What are the trending stocks?",
    message: "What are the trending stocks?",
  },
  {
    heading: "What's the stock price of AAPL?",
    message: "What's the stock price of AAPL?",
  },
  {
    heading: "I'd like to buy 10 shares of MSFT",
    message: "I'd like to buy 10 shares of MSFT",
  },
];

export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8 mb-4">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to AI SDK 3.0 Generative UI demo!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This is a demo of an interactive financial assistant. It can show you
          stocks, tell you their prices, and even help you buy shares.
        </p>
      </div>
      <p className="leading-normal text-muted-foreground text-[0.8rem] text-center max-w-96 ml-auto mr-auto">
        Note: Data and latency are simulated for illustrative purposes and
        should not be considered as financial advice.
      </p>
    </div>
  );
}
