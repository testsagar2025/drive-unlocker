import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScreenshotUpload } from "./ScreenshotUpload";
import { CheckCircle, ExternalLink, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step1CardProps {
  isActive: boolean;
  isVerified: boolean;
  sessionToken: string;
  onVerified: () => void;
}

const AFFILIATE_LINK = "https://alleninfo.onelink.me/fMMw/community3";

export function Step1Card({ isActive, isVerified, sessionToken, onVerified }: Step1CardProps) {
  const [showIframe, setShowIframe] = useState(false);

  return (
    <Card className={cn(
      "transition-all duration-300",
      isActive && !isVerified && "ring-2 ring-primary shadow-gold",
      isVerified && "ring-2 ring-[hsl(var(--success))]",
      !isActive && !isVerified && "opacity-60"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isVerified ? "bg-[hsl(var(--success))]" : "bg-primary"
            )}>
              {isVerified ? (
                <CheckCircle className="h-5 w-5 text-[hsl(var(--success-foreground))]" />
              ) : (
                <UserPlus className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Step 1: Register</CardTitle>
              <CardDescription>Join our community platform</CardDescription>
            </div>
          </div>
          {isVerified && (
            <span className="text-xs bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] px-2 py-1 rounded-full">
              Verified ✓
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isVerified && (
          <>
            {!showIframe ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Register on our affiliate platform to get access to exclusive CBSE resources.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold"
                    onClick={() => setShowIframe(true)}
                  >
                    Open Registration Form
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-xs text-muted-foreground"
                    onClick={() => window.open(AFFILIATE_LINK, "_blank")}
                  >
                    Open in new tab instead
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-border bg-background">
                  <iframe
                    src={AFFILIATE_LINK}
                    className="w-full h-[400px]"
                    sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                    title="Registration Form"
                  />
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">After completing registration:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Take a screenshot of the success/confirmation page</li>
                    <li>Upload it below for AI verification</li>
                  </ol>
                </div>

                <ScreenshotUpload
                  stepNumber={1}
                  sessionToken={sessionToken}
                  onVerified={onVerified}
                />
              </div>
            )}
          </>
        )}
        
        {isVerified && (
          <div className="bg-[hsl(var(--success))]/10 rounded-lg p-4 text-center">
            <p className="text-sm text-[hsl(var(--success))]">
              Registration verified! Proceed to Step 2.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
