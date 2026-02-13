export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto py-4">
      <div className="container mx-auto px-4 flex flex-col items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gradient-gold">PRO CBSE</span>
          <span>© {new Date().getFullYear()}</span>
          <span className="text-border">•</span>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/60">
          This site contains affiliate links. By completing verification, you agree to our terms.
        </p>
      </div>
    </footer>
  );
}