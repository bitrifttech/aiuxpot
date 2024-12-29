import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Tab {
  path: string;
  isDirty?: boolean;
}

interface TabsManagerProps {
  tabs: Tab[];
  activeTab?: string;
  onTabSelect: (path: string) => void;
  onTabClose: (path: string) => void;
}

export const TabsManager = ({
  tabs,
  activeTab,
  onTabSelect,
  onTabClose
}: TabsManagerProps) => {
  return (
    <div className="border-b bg-background">
      <ScrollArea className="max-w-full" orientation="horizontal">
        <div className="flex">
          {tabs.map((tab) => (
            <div
              key={tab.path}
              className={cn(
                "group flex items-center gap-2 border-r px-4 py-2 hover:bg-accent",
                activeTab === tab.path && "bg-accent"
              )}
            >
              <button
                onClick={() => onTabSelect(tab.path)}
                className="text-sm truncate max-w-[200px]"
              >
                {tab.path.split('/').pop()}
                {tab.isDirty && ' •'}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 opacity-0 group-hover:opacity-100"
                onClick={() => onTabClose(tab.path)}
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
