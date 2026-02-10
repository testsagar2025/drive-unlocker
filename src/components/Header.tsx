import proCbseLogo from "@/assets/pro-cbse-logo.jpg";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={proCbseLogo}
            alt="PRO CBSE Logo"
            className="h-10 w-10 rounded-xl border border-border shadow-sm"
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-gradient-gold">PROCBSE</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Verified Resources
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full h-9 w-9"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
