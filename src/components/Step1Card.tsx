import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScreenshotUpload } from "./ScreenshotUpload";
import { CheckCircle, ExternalLink, UserPlus, Maximize2, Minimize2, X, RotateCcw } from "lucide-react";
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

  const handleRefresh = () => setIframeKey((prev) => prev + 1);
  const handleClose = () => { setShowIframe(false); setIsFullscreen(false); };

  return (
    <>
      {isFullscreen && showIframe && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">ALLEN Registration</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8"><RotateCcw className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => window.open(AFFILIATE_LINK, "_blank")} className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)} className="h-8 w-8"><Minimize2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 hover:bg-destructive/20"><X className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe key={iframeKey} src={AFFILIATE_LINK} className="w-full h-full border-0" sandbox="allow-scripts allow-forms allow-same-origin allow-popups" title="Registration Form" />
          </div>
          <div className="p-3 border-t border-border bg-card text-center">
            <p className="text-sm text-muted-foreground">After registration, close this and upload your confirmation screenshot</p>
          </div>
        </div>
      )}

      <Card className={cn(
        "transition-all duration-300 rounded-2xl border-border/50 shadow-sm",
        isActive && !isVerified && "ring-2 ring-primary shadow-gold",
        isVerified && "ring-2 ring-[hsl(var(--success))]",
        !isActive && !isVerified && "opacity-60"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isVerified ? "bg-[hsl(var(--success))]" : "bg-gradient-gold"
              )}>
                {isVerified ? <CheckCircle className="h-5 w-5 text-white" /> : <UserPlus className="h-5 w-5 text-white" />}
              </div>
              <div>
                <CardTitle className="text-lg">Step 1: Register</CardTitle>
                <CardDescription>Join our community platform</CardDescription>
              </div>
            </div>
            {isVerified && (
              <span className="text-xs bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] px-3 py-1 rounded-full font-medium">Verified ✓</span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isVerified && (
            <>
              {!showIframe ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Register on our affiliate platform to get access to exclusive CBSE resources.</p>
                  <div className="flex flex-col gap-2">
                    <Button className="w-full bg-gradient-gold hover:opacity-90 text-white font-semibold rounded-xl h-11" onClick={() => setShowIframe(true)}>
                      Open Registration Form <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="text-xs text-muted-foreground" onClick={() => window.open(AFFILIATE_LINK, "_blank")}>
                      Open in new tab instead
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/50">
                      <span className="text-sm font-medium">ALLEN Registration Portal</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-7 w-7"><RotateCcw className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => window.open(AFFILIATE_LINK, "_blank")} className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(true)} className="h-7 w-7"><Maximize2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-7 w-7"><X className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    <div className="relative overflow-auto" style={{ height: "500px" }}>
                      <iframe key={iframeKey} src={AFFILIATE_LINK} className="w-full border-0" style={{ height: "100%", minHeight: "500px" }} sandbox="allow-scripts allow-forms allow-same-origin allow-popups" title="Registration Form" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Maximize2 className="h-3 w-3" />
                    <span>Click fullscreen for better experience</span>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 space-y-2 border border-border/50">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">!</span>
                      After completing registration:
                    </p>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside pl-7">
                      <li>Take a screenshot of the success/confirmation page</li>
                      <li>Upload it below for AI verification</li>
                    </ol>
                  </div>
                  <ScreenshotUpload stepNumber={1} sessionToken={sessionToken} onVerified={onVerified} />
                </div>
              )}
            </>
          )}
          {isVerified && (
            <div className="bg-[hsl(var(--success))]/10 rounded-xl p-4 text-center border border-[hsl(var(--success))]/20">
              <p className="text-sm text-[hsl(var(--success))] font-medium">✓ Registration verified! Proceed to Step 2.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
