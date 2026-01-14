import proCbseLogo from "@/assets/pro-cbse-logo.jpg";
import { Shield } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={proCbseLogo} 
            alt="PRO CBSE Logo" 
            className="h-12 w-12 rounded-full border-2 border-primary shadow-gold"
          />
          <div>
            <h1 className="text-xl font-bold text-gradient-gold">PRO CBSE</h1>
            <p className="text-xs text-muted-foreground">Verified Resources Access</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm hidden sm:inline">Secure Access</span>
        </div>
      </div>
    </header>
  );
}
