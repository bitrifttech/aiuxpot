import { SidebarProvider } from "../components/ui/sidebar";
import { MainWorkspace } from "@/components/MainWorkspace";
import { AppSidebar } from "@/components/AppSidebar";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col min-h-screen">
            <div className="flex items-center justify-end p-4 border-b">
              <DarkModeToggle />
            </div>
            <MainWorkspace />
          </main>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default Index;