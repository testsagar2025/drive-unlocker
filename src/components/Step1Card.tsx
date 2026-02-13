import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreenshotUpload } from "./ScreenshotUpload";
import { CheckCircle, ExternalLink, UserPlus, Maximize2, Minimize2, X, RotateCcw, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step1CardProps {
  isActive: boolean;
  isVerified: boolean;
  sessionToken: string;
  onVerified: () => void;
}

const AFFILIATE_LINK = "https://alleninfo.onelink.me/fMMw/439lbgy9";

export function Step1Card({ isActive, isVerified, sessionToken, onVerified }: Step1CardProps) {
  const [showIframe, setShowIframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [expanded, setExpanded] = useState(isActive);

  const handleRefresh = () => setIframeKey((prev) => prev + 1);
  const handleClose = () => { setShowIframe(false); setIsFullscreen(false); };

  return (
    <>
      {/* Fullscreen iframe overlay */}
      {isFullscreen && showIframe && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <UserPlus className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">ALLEN Registration</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-7 w-7"><RotateCcw className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => window.open(AFFILIATE_LINK, "_blank")} className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)} className="h-7 w-7"><Minimize2 className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" onClick={handleClose} className="h-7 w-7 hover:bg-destructive/20"><X className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe key={iframeKey} src={AFFILIATE_LINK} className="w-full h-full border-0" sandbox="allow-scripts allow-forms allow-same-origin allow-popups" title="Registration Form" />
          </div>
          <div className="p-2.5 border-t border-border bg-accent/10 text-center">
            <p className="text-xs font-medium text-accent">⚠️ Screenshot the payment page — DO NOT PAY. It's FREE!</p>
          </div>
        </div>
      )}

      {/* Card */}
      <div className={cn(
        "bg-card rounded-xl border transition-all duration-200",
        isActive && !isVerified && "border-primary/40 shadow-gold",
        isVerified && "border-[hsl(var(--success))]/40",
        !isActive && !isVerified && "border-border/50 opacity-60"
      )}>
        {/* Header - clickable */}
        <button
          onClick={() => !isVerified && setExpanded((p) => !p)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              isVerified ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" : "bg-primary text-primary-foreground"
            )}>
              {isVerified ? <CheckCircle className="h-4 w-4" /> : "1"}
            </div>
            <div>
              <p className="text-sm font-semibold">Register on ALLEN</p>
              <p className="text-xs text-muted-foreground">
                {isVerified ? "Completed ✓" : "Complete OTP & screenshot payment page"}
              </p>
            </div>
          </div>
          {!isVerified && (
            expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Body */}
        {!isVerified && expanded && (
          <div className="px-4 pb-4 space-y-3">
            {!showIframe ? (
              <div className="space-y-3">
                <Button
                  className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl text-sm"
                  onClick={() => setShowIframe(true)}
                >
                  Open Registration Form <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Button>
                <button
                  onClick={() => window.open(AFFILIATE_LINK, "_blank")}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Open in new tab ↗
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Embedded iframe */}
                <div className="rounded-lg overflow-hidden border border-border/50">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border/50">
                    <span className="text-xs font-medium text-muted-foreground">ALLEN Portal</span>
                    <div className="flex items-center gap-0.5">
                      <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-6 w-6"><RotateCcw className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => window.open(AFFILIATE_LINK, "_blank")} className="h-6 w-6"><ExternalLink className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(true)} className="h-6 w-6"><Maximize2 className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" onClick={handleClose} className="h-6 w-6"><X className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="overflow-auto" style={{ height: "420px" }}>
                    <iframe key={iframeKey} src={AFFILIATE_LINK} className="w-full border-0" style={{ height: "100%", minHeight: "420px" }} sandbox="allow-scripts allow-forms allow-same-origin allow-popups" title="Registration Form" />
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-accent/8 border border-accent/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-accent shrink-0" />
                    <p className="text-xs font-semibold text-accent">Important</p>
                  </div>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside ml-5">
                    <li>Fill details & complete <strong>OTP verification</strong></li>
                    <li>A <strong>payment page (₹99)</strong> will appear</li>
                    <li><strong className="text-[hsl(var(--success))]">DO NOT PAY</strong> — it's completely free!</li>
                    <li>Screenshot the payment page & upload below</li>
                  </ol>
                </div>

                <ScreenshotUpload stepNumber={1} sessionToken={sessionToken} onVerified={onVerified} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}