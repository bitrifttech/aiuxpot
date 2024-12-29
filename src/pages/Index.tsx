import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { MainWorkspace } from "@/components/MainWorkspace";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen">
          <div className="flex items-center p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-2xl font-semibold ml-4">UX Design Platform</h1>
          </div>
          <MainWorkspace />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;