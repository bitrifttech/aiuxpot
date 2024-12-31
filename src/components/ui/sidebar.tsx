import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

interface SidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContextType = React.createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    console.error("useSidebar must be used within a SidebarProvider")
    return {
      state: "expanded" as const,
      open: true,
      setOpen: () => {},
      openMobile: false,
      setOpenMobile: () => {},
      isMobile: false,
      toggleSidebar: () => {},
    }
  }
  return context
}

export function useSidebarType() {
  const context = React.useContext(SidebarContextType);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(true)
  const [openMobile, setOpenMobile] = React.useState(false)

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev)
    } else {
      setOpen((prev) => !prev)
    }
  }, [isMobile])

  const value = React.useMemo(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [open, openMobile, isMobile, toggleSidebar]
  )

  const valueType = React.useMemo(
    () => ({
      isOpen: open,
      isMobile,
      toggleSidebar,
    }),
    [open, isMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={value}>
      <SidebarContextType.Provider value={valueType}>
        <div>
          {children}
        </div>
      </SidebarContextType.Provider>
    </SidebarContext.Provider>
  )
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => {
    const { open, openMobile, isMobile, setOpenMobile } = useSidebar()

    // Handle clicks outside sidebar on mobile
    React.useEffect(() => {
      if (!isMobile) return

      const handleClickOutside = (event: MouseEvent) => {
        const sidebar = document.getElementById('app-sidebar')
        if (sidebar && !sidebar.contains(event.target as Node) && openMobile) {
          setOpenMobile(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isMobile, openMobile])

    return (
      <div
        ref={ref}
        id="app-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r bg-background transition-transform duration-300 ease-in-out",
          isMobile
            ? openMobile
              ? "translate-x-0 shadow-lg"
              : "-translate-x-full"
            : open
              ? "w-64 translate-x-0"
              : "w-16 translate-x-0",
          "md:relative",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-14 items-center border-b px-4", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

export const SidebarNav = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("flex-1 space-y-1 p-2", className)}
    {...props}
  />
))
SidebarNav.displayName = "SidebarNav"

export const SidebarNavItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      ref={ref}
      className={cn(
        "flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
})
SidebarNavItem.displayName = "SidebarNavItem"

export const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"
