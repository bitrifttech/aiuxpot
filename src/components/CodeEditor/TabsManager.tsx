import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EditorPane } from './EditorContainer';

interface Tab {
  path: string;
  isDirty?: boolean;
}

interface TabsManagerProps {
  panes: EditorPane[];
  activePaneId: string;
  onTabClose: (paneId: string, path: string) => void;
  onTabChange: (paneId: string, path: string) => void;
}

export const TabsManager = ({
  panes,
  activePaneId,
  onTabClose,
  onTabChange
}: TabsManagerProps) => {
  const activePane = panes.find(pane => pane.id === activePaneId);
  if (!activePane) return null;

  return (
    <div className="border-b bg-background">
      <ScrollArea className="max-w-full" orientation="horizontal">
        <div className="flex">
          {activePane.tabs.map((tab) => (
            <div
              key={tab.path}
              className={cn(
                "group flex items-center gap-2 border-r px-4 py-2 hover:bg-accent cursor-pointer",
                activePane.activeTab === tab.path && "bg-accent"
              )}
              onClick={() => onTabChange(activePaneId, tab.path)}
            >
              <span className="text-sm truncate max-w-[200px]">
                {tab.path.split('/').pop()}
                {tab.isDirty && ' •'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(activePaneId, tab.path);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
