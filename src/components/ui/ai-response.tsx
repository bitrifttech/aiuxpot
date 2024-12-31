import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { AIResponse } from "@/types/ai";
import { Badge } from "./badge";

interface AIResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  response?: AIResponse;
  isLoading?: boolean;
  error?: Error | null;
}

export function AIResponse({
  response,
  isLoading,
  error,
  className,
  ...props
}: AIResponseProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 text-destructive">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {response && !isLoading && !error && (
        <>
          <div className="p-4">
            <div className="whitespace-pre-wrap">{response.content}</div>
          </div>

          <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {response.model}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {response.provider}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span>
                Tokens: {response.usage.totalTokens.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
