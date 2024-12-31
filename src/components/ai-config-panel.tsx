import * as React from "react";
import { useAIContext } from "@/contexts/ai-context";
import { AIProviderSelector } from "./ui/ai-provider-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function AIConfigPanel() {
  const { 
    providers, 
    activeProvider, 
    setActiveProvider,
    stats,
    isInitialized,
    error
  } = useAIContext();

  const activeStats = activeProvider ? stats.get(activeProvider.id) : undefined;

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>Loading AI providers...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>Error initializing AI providers</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
        <CardDescription>
          Configure AI providers and view statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>AI Provider</Label>
          <AIProviderSelector
            providers={providers}
            selectedProvider={activeProvider?.id}
            onSelect={setActiveProvider}
          />
        </div>

        {activeProvider && (
          <>
            <div className="space-y-2">
              <Label>Supported Models</Label>
              <div className="flex flex-wrap gap-2">
                {activeProvider.supportedModels.map((model) => (
                  <Badge key={model} variant="secondary">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Provider Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge className="ml-2" variant={activeProvider.type === 'local' ? 'secondary' : 'default'}>
                    {activeProvider.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Max Tokens</span>
                  <Badge className="ml-2" variant="outline">
                    {activeProvider.maxTokens.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>

            {activeStats && (
              <div className="space-y-2">
                <Label>Usage Statistics</Label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requests</span>
                    <div>{activeStats.requestCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Errors</span>
                    <div>{activeStats.errorCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Tokens</span>
                    <div>{activeStats.tokenUsage.total.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg. Latency</span>
                    <div>{Math.round(activeStats.averageLatency)}ms</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
