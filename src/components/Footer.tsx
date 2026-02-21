import { Link } from "react-router-dom";
import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto bg-card/50 safe-bottom">
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-6">
        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground mb-3 sm:mb-4">
          <Link to="/privacy-policy" className="hover:text-foreground transition-colors py-1">Privacy Policy</Link>
          <span className="text-border">•</span>
          <Link to="/terms-conditions" className="hover:text-foreground transition-colors py-1">Terms & Conditions</Link>
        </div>

        {/* Copyright */}
        <div className="text-center space-y-1">
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            © {new Date().getFullYear()} <span className="font-semibold text-gradient-gold">PRO CBSE</span>. All rights reserved.
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground/70">
            Owned by <span className="font-medium text-muted-foreground">Arvish Mirza</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground/50 flex items-center justify-center gap-1">
            <Code2 className="h-3 w-3" />
            Developed by <span className="font-medium text-muted-foreground/70">Aryan Gupta</span>
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-[9px] sm:text-[10px] text-center text-muted-foreground/40 mt-3 sm:mt-4 max-w-sm sm:max-w-md mx-auto leading-relaxed">
          This site contains affiliate links. By completing the verification steps, you agree to our terms and conditions.
        </p>
      </div>
    </footer>
  );
}
