import React, { useState } from 'react';
import { useAIContext } from '@/contexts/ai-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateUXAnalysisPrompt, parseUXAnalysisResponse, UXAnalysisResult } from '@/lib/ai/prompts/ux-analysis';

interface UXAnalysisProps {
  componentCode: string;
  userStory?: string;
  accessibilityRequirements?: string[];
  deviceTypes?: string[];
  userExperienceLevel?: 'beginner' | 'intermediate' | 'expert';
  onAnalysisComplete?: (result: UXAnalysisResult) => void;
}

export function UXAnalysis({
  componentCode,
  userStory,
  accessibilityRequirements,
  deviceTypes,
  userExperienceLevel,
  onAnalysisComplete,
}: UXAnalysisProps) {
  const { complete, activeProvider } = useAIContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UXAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = generateUXAnalysisPrompt({
        componentCode,
        userStory,
        accessibilityRequirements,
        deviceTypes,
        userExperienceLevel,
      });

      const response = await complete({
        prompt,
        model: activeProvider?.models[0] || 'gpt-4',
        temperature: 0.3,
        maxTokens: 2000,
      });

      const analysisResult = parseUXAnalysisResponse(response.content);
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze component');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>UX Analysis</CardTitle>
          <CardDescription>
            AI-powered analysis of component usability and accessibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!result && (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Component...
                </>
              ) : (
                'Analyze Component'
              )}
            </Button>
          )}

          {result && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Accessibility</div>
                  <Progress value={result.score.accessibility} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Usability</div>
                  <Progress value={result.score.usability} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Performance</div>
                  <Progress value={result.score.performance} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Overall</div>
                  <Progress value={result.score.overall} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Issues</h3>
                {result.issues.map((issue, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant={getSeverityColor(issue.severity)}>
                          {issue.type} - {issue.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{issue.description}</p>
                      {issue.suggestion && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Suggestion: {issue.suggestion}
                        </p>
                      )}
                      {issue.codeSnippet && (
                        <pre className="mt-2 rounded bg-muted p-2 text-sm">
                          <code>{issue.codeSnippet}</code>
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recommendations</h3>
                {result.recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <Badge>{rec.category}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{rec.description}</p>
                      {rec.implementation && (
                        <pre className="mt-2 rounded bg-muted p-2 text-sm">
                          <code>{rec.implementation}</code>
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Best Practices</h3>
                <ul className="list-inside list-disc space-y-1">
                  {result.bestPractices.map((practice, index) => (
                    <li key={index} className="text-sm">
                      {practice}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {result && (
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="w-full"
            >
              Start New Analysis
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
