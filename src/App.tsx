import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AIProvider } from "@/contexts/ai-context";
import Index from "./pages/Index";
import Design from "./pages/Design";
import TestDesign from "./pages/TestDesign";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AIProvider>
          <ProjectProvider>
            <SidebarProvider>
              <TooltipProvider>
                <div className="min-h-screen bg-background text-foreground">
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/design/:projectId" element={<Design />} />
                      <Route path="/test-design/:projectId" element={<TestDesign />} />
                      <Route path="/settings/*" element={<Settings />} />
                    </Routes>
                  </BrowserRouter>
                </div>
              </TooltipProvider>
            </SidebarProvider>
          </ProjectProvider>
        </AIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;