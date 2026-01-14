import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScreenshotUpload } from "./ScreenshotUpload";
import { CheckCircle, Lock, MessageCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2CardProps {
  isActive: boolean;
  isVerified: boolean;
  isLocked: boolean;
  sessionToken: string;
  onVerified: () => void;
}

const WHATSAPP_LINK = "https://chat.whatsapp.com/F37Hcfx6xFIEyHrtE4OLRV";

export function Step2Card({ isActive, isVerified, isLocked, sessionToken, onVerified }: Step2CardProps) {
  return (
    <Card className={cn(
      "transition-all duration-300",
      isActive && !isVerified && "ring-2 ring-primary shadow-gold",
      isVerified && "ring-2 ring-[hsl(var(--success))]",
      isLocked && "opacity-40 pointer-events-none",
      !isActive && !isVerified && !isLocked && "opacity-60"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isVerified ? "bg-[hsl(var(--success))]" : isLocked ? "bg-muted" : "bg-primary"
            )}>
              {isVerified ? (
                <CheckCircle className="h-5 w-5 text-[hsl(var(--success-foreground))]" />
              ) : isLocked ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Step 2: Join WhatsApp</CardTitle>
              <CardDescription>Join our community channel</CardDescription>
            </div>
          </div>
          {isVerified && (
            <span className="text-xs bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] px-2 py-1 rounded-full">
              Verified ✓
            </span>
          )}
          {isLocked && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              Complete Step 1 first
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLocked && (
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Complete Step 1 to unlock this step
            </p>
          </div>
        )}

        {!isLocked && !isVerified && (
          <>
            <p className="text-sm text-muted-foreground">
              Join our WhatsApp community to get updates and exclusive content.
            </p>
            
            <Button
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold"
              onClick={() => window.open(WHATSAPP_LINK, "_blank")}
            >
              Join WhatsApp Channel
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">After joining the group:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Take a screenshot showing you're inside the group</li>
                <li>Upload it below for AI verification</li>
              </ol>
            </div>

            <ScreenshotUpload
              stepNumber={2}
              sessionToken={sessionToken}
              onVerified={onVerified}
            />
          </>
        )}
        
        {isVerified && (
          <div className="bg-[hsl(var(--success))]/10 rounded-lg p-4 text-center">
            <p className="text-sm text-[hsl(var(--success))]">
              WhatsApp membership verified! Proceed to Step 3.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
