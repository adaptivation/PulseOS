import { useEffect } from "react";
import { Search, Bell, Plus, Command as CommandIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthUser, useProfile, signOut } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  onOpenCommand: () => void;
}

export function TopBar({ onOpenCommand }: Props) {
  const { user } = useAuthUser();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenCommand();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenCommand]);

  const initials = (profile?.full_name || user?.email || "P")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border glass px-4 sm:px-6">
      <button
        onClick={onOpenCommand}
        className="group flex h-9 flex-1 max-w-md items-center gap-2 rounded-md border border-border bg-surface/60 px-3 text-left text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">Search anything…</span>
        <kbd className="hidden items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          <CommandIcon className="h-3 w-3" /> K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => navigate({ to: "/crm" })}
          className="hidden sm:inline-flex bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="mr-1 h-4 w-4" /> New customer
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" disabled title="Notifications coming soon">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-elevated">
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="rounded-md bg-elevated text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm">{profile?.full_name || "Member"}</span>
              <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenCommand}>Command palette</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}