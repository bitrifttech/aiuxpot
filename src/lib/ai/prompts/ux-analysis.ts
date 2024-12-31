export interface UXAnalysisInput {
  componentCode: string;
  userStory?: string;
  accessibilityRequirements?: string[];
  deviceTypes?: string[];
  userExperienceLevel?: 'beginner' | 'intermediate' | 'expert';
}

export interface UXAnalysisResult {
  issues: Array<{
    type: 'accessibility' | 'usability' | 'performance' | 'mobile' | 'desktop';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
    codeSnippet?: string;
  }>;
  recommendations: Array<{
    category: string;
    description: string;
    implementation?: string;
  }>;
  bestPractices: string[];
  score: {
    accessibility: number;
    usability: number;
    performance: number;
    overall: number;
  };
}

export function generateUXAnalysisPrompt(input: UXAnalysisInput): string {
  const {
    componentCode,
    userStory = 'General purpose component',
    accessibilityRequirements = ['WCAG 2.1 Level AA'],
    deviceTypes = ['desktop', 'mobile'],
    userExperienceLevel = 'intermediate',
  } = input;

  return `Analyze the following React component for UX and accessibility improvements:

Context:
- User Story: ${userStory}
- Target Devices: ${deviceTypes.join(', ')}
- Accessibility Requirements: ${accessibilityRequirements.join(', ')}
- User Experience Level: ${userExperienceLevel}

Component Code:
\`\`\`tsx
${componentCode}
\`\`\`

Please provide a comprehensive UX analysis including:
1. Identify potential UX issues (accessibility, usability, performance, responsive design)
2. Rate each issue by severity (low, medium, high)
3. Provide specific recommendations for improvements
4. Suggest code implementations where applicable
5. Score the component on:
   - Accessibility (0-100)
   - Usability (0-100)
   - Performance (0-100)
   - Overall UX (0-100)
6. List relevant best practices that should be followed

Format your response as a structured JSON object matching the UXAnalysisResult type.`;
}

export function generateUXSuggestionPrompt(
  issue: UXAnalysisResult['issues'][0]
): string {
  return `Provide a detailed solution for the following UX issue:

Issue Type: ${issue.type}
Severity: ${issue.severity}
Description: ${issue.description}

Please provide:
1. Step-by-step implementation guide
2. Code examples with best practices
3. Alternative approaches if applicable
4. Accessibility considerations
5. Performance implications

Focus on practical, maintainable solutions that follow React and modern web development best practices.`;
}

export function parseUXAnalysisResponse(response: string): UXAnalysisResult {
  try {
    // Remove any markdown formatting if present
    const jsonString = response.replace(/```json\n?|\n?```/g, '');
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Failed to parse UX analysis response: ' + error.message);
  }
}
