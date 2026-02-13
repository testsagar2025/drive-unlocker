import { Link } from "react-router-dom";
import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto bg-card/50">
      <div className="container mx-auto px-4 py-6">
        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
          <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <span className="text-border">•</span>
          <Link to="/terms-conditions" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
        </div>

        {/* Copyright */}
        <div className="text-center space-y-1.5">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} <span className="font-semibold text-gradient-gold">PRO CBSE</span>. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Owned by <span className="font-medium text-muted-foreground">Arvish Mirza</span>
          </p>
          <p className="text-[11px] text-muted-foreground/50 flex items-center justify-center gap-1">
            <Code2 className="h-3 w-3" />
            Developed by <span className="font-medium text-muted-foreground/70">Aryan Gupta</span>
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-center text-muted-foreground/40 mt-4 max-w-md mx-auto">
          This site contains affiliate links. By completing the verification steps, you agree to our terms and conditions.
        </p>
      </div>
    </footer>
  );
}