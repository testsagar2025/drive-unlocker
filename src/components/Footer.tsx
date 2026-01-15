export function Footer() {
  return <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-gradient-gold font-semibold">PRO CBSE</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a className="hover:text-primary transition-colors" href="/admin">​Admin</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Disclaimer</a>
          </div>
        </div>
        
        <p className="text-xs text-center mt-4 text-muted-foreground/70">
          This site contains affiliate links. By completing the verification steps, you agree to our terms.
        </p>
      </div>
    </footer>;
}