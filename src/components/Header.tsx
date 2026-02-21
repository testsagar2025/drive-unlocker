import proCbseLogo from "@/assets/pro-cbse-logo.jpg";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 safe-top">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={proCbseLogo}
            alt="PRO CBSE Logo"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-border/50"
          />
          <span className="text-sm sm:text-base font-bold tracking-tight text-gradient-gold">
            PROCBSE
          </span>
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
