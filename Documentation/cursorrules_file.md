Cursor Rules for Project

## Project Overview

**Project Name:** AI-Powered UX Design Platform

**Description:** This platform empowers developers to design and implement user experiences with AI assistance. It allows developers to run design processes locally for enhanced privacy and customization while integrating with a local Ollama instance or remote API for LLM capabilities. This tool aims to provide developers control over their workflows and AI interactions.

**Tech Stack:**

*   **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/UI, Radix UI, Lucide Icons
*   **Backend & Storage:** Local in-memory storage and file system
*   **AI Integration:** GPT-4o, Ollama for local LLMs, or remote API
*   **Tools:** V0 by Vercel, Claude AI, Cursor AI, Lovable, Bolt

**Key Features:**

*   AI-Powered UX Design suggestions
*   Local/Remote LLM Integration
*   Developer-Centric Design Tools
*   Customizable Design Options
*   Real-Time Design Preview

## Project Structure

**Root Directory:**

*   Contains main configuration files and documentation.

**/frontend:**

*   Contains all frontend-related code, components, styles, and assets. **/components:**

    *   ProjectPage
    *   DesignDashboard (includes CodeEditor, AIChatWindow, FileStructureView, PreviewArea)
    *   SettingsPage

*   **/assets:**

    *   Icons
    *   Images

*   **/styles:**

    *   GlobalStyles.css
    *   TailwindConfig.css

**/backend:**

*   Contains all backend-related code, API routes, and models. **/controllers:**

    *   AIDesignController
    *   ProjectManagementController

*   **/models:**

    *   DesignProjectModel
    *   UserPreferencesModel

*   **/routes:**

    *   api/ai
    *   api/projects

**/config:**

*   Configuration files for environment variables and application settings.

**/tests:**

*   Contains unit and integration tests for both frontend and backend.

## Development Guidelines

**Coding Standards:**

*   Follow TypeScript best practices and maintain code readability.
*   Use Tailwind CSS for consistent styling.

**Component Organization:**

*   Components should be reusable and stateless where possible.
*   Organize components by feature to streamline management and updates.

## Cursor IDE Integration

**Setup Instructions:**

*   Clone the repository and install dependencies using the provided script.
*   Set up a local development environment following the configuration guides.

**Key Commands:**

*   `npm run dev`: Start the development server.
*   `npm run build`: Build the project for production.
*   `npm test`: Run test suites to ensure functionality.

## Additional Context

**User Roles:**

*   Developer: Access to all tools and settings.
*   Admin: Manage user accounts and configurations.
*   Guest: View-only access with restricted permissions.

**Accessibility Considerations:**

*   Focus on keyboard navigation and screen reader compatibility.
*   Ensure all components meet WCAG 2.1 guidelines.
