import { Sidebar, SidebarHeader, SidebarNav, SidebarNavItem } from "./ui/sidebar";
import { Home, Settings, FileCode } from "lucide-react";
import { Link } from "react-router-dom";

export function AppSidebar() {
  return (
    <Sidebar defaultOpen>
      <SidebarHeader>
        <h2 className="text-lg font-semibold">UX Design Platform</h2>
      </SidebarHeader>
      <SidebarNav>
        <SidebarNavItem asChild>
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </SidebarNavItem>
        <SidebarNavItem asChild>
          <Link to="/design/new" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            <span>New Design</span>
          </Link>
        </SidebarNavItem>
        <SidebarNavItem asChild>
          <Link to="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </SidebarNavItem>
      </SidebarNav>
    </Sidebar>
  );
}