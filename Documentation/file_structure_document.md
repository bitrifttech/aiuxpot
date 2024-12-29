### Introduction

A well-organized file structure is essential for the efficient development and maintenance of any software project. It facilitates clear navigation, enhances collaboration among team members, and supports robust project management. This document lays out the file structure for a platform designed to empower developers in creating user experiences with AI assistance. The unique ability to run the design process locally caters to privacy-concerned developers, providing them control over their workflows and data security. This clear file structure is vital to manage the integration of local or remote AI capabilities and aligns with the technical approach outlined in the project requirements.

### Overview of the Tech Stack

The platform is a web application built using a selection of modern and powerful technologies. The frontend utilizes Next.js 14, TypeScript, Tailwind CSS, shadcn/UI, Radix UI, and Lucide Icons, forming a comprehensive stack for building interactive and aesthetically pleasing user interfaces. The backend operates primarily using local in-memory storage and the server's file system. Integration options for AI models include GPT-4o and local Ollama instances or remote API calls. This choice affects the file structure by necessitating clear separation between frontend and backend components and defining specific directories for AI model integration.

### Root Directory Structure

At the root level, the primary directories and files include:

*   **src/**: The main source directory housing frontend and backend code.
*   **public/**: Where static assets like images, fonts, and public JavaScript files are stored.
*   **config/**: Contains configuration files pertinent to the application setup.
*   **.env**: Environment variables file, crucial for managing API keys and settings for local or remote AI use.
*   **next.config.js**: Configuration file for Next.js settings.
*   **package.json**: Lists all dependencies and scripts, essential for building and running the project.
*   **README.md**: A comprehensive guide for developers, explaining setup, usage, and contribution guidelines.

### Frontend File Structure

In the **src/frontend/** directory, the file organization enhances modularity and reusability:

*   **components/**: Hosts React components, each in its directory with relevant styles and logic.
*   **styles/**: Incorporates global stylesheets and Tailwind CSS configurations to maintain a consistent design.
*   **pages/**: Contains route-specific pages developed using Next.js, facilitating smooth navigation.
*   **assets/**: Stores images, icons, and fonts used throughout the frontend.
*   **hooks/**: Custom React hooks to encapsulate stateful logic for easy access. This layout ensures components are reusable across different pages, promoting efficient development and maintenance.

### Backend File Structure

The **src/backend/** directory organizes backend solutions to support maintainability and scalability:

*   **controllers/**: Manages application logic and request/response handling for different routes.
*   **models/**: Defines data structures and in-memory storage logic for handling user data.
*   **services/**: Contains services that perform operations or business logic, interacting with models as needed.
*   **routes/**: Specifies API endpoints and associates them with controller functions to manage data flow. This separation encapsulates functionality, ensuring systems can be updated with minimal impact on other parts.

### Configuration and Environment Files

The **config/** directory holds necessary setup configurations:

*   **aiConfig.js**: Handles AI model integration settings, defining local or remote processing parameters.
*   **dbConfig.js**: Sets database and in-memory storage parameters. Environment settings are stored in the **.env** file to manage sensitive data like API keys securely, which is critical for both local and external AI integrations.

### Testing and Documentation Structure

Testing files are structured to assure quality:

*   **tests/**: Holds unit and integration tests categorized by frontend and backend functionalities.
*   **e2e/**: Stores end-to-end test scripts that simulate real user interactions across the application. Documentation is contained in **docs/** with guidelines on usage, coding standards, and contribution instructions. This includes system prompt documents and cursor rules files, ensuring that users and developers can familiarize themselves with both the service and the development process.

### Conclusion and Overall Summary

The file structure detailed in this document is essential for supporting the platform's development and maintenance. By ensuring clean separation between components and logical grouping of related files, this organization enhances collaboration among developers and facilitates new feature integration. Key differentiators include the robust management of AI components both locally and remotely, ensuring that the project remains responsive to user needs while prioritizing privacy and performance.
