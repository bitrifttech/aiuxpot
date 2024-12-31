import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AIProvider } from "@/types/ai";
import { Badge } from "./badge";

interface AIProviderSelectorProps {
  providers: AIProvider[];
  selectedProvider?: string;
  onSelect: (providerId: string) => void;
  className?: string;
}

export function AIProviderSelector({
  providers,
  selectedProvider,
  onSelect,
  className,
}: AIProviderSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(
    () => providers.find((p) => p.id === selectedProvider),
    [providers, selectedProvider]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selected ? (
            <div className="flex items-center gap-2">
              {selected.name}
              <Badge variant={selected.type === 'local' ? 'secondary' : 'default'}>
                {selected.type}
              </Badge>
            </div>
          ) : (
            "Select AI provider..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search AI providers..." />
          <CommandEmpty>No AI provider found.</CommandEmpty>
          <CommandGroup>
            {providers.map((provider) => (
              <CommandItem
                key={provider.id}
                value={provider.id}
                onSelect={() => {
                  onSelect(provider.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedProvider === provider.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center justify-between w-full">
                  <span>{provider.name}</span>
                  <Badge variant={provider.type === 'local' ? 'secondary' : 'default'}>
                    {provider.type}
                  </Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
