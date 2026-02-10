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
      "transition-all duration-300 rounded-2xl border-border/50 shadow-sm",
      isActive && !isVerified && "ring-2 ring-primary shadow-gold",
      isVerified && "ring-2 ring-[hsl(var(--success))]",
      isLocked && "opacity-40 pointer-events-none",
      !isActive && !isVerified && !isLocked && "opacity-60"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isVerified ? "bg-[hsl(var(--success))]" : isLocked ? "bg-muted" : "bg-gradient-gold"
            )}>
              {isVerified ? <CheckCircle className="h-5 w-5 text-white" /> : isLocked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <MessageCircle className="h-5 w-5 text-white" />}
            </div>
            <div>
              <CardTitle className="text-lg">Step 2: Join WhatsApp</CardTitle>
              <CardDescription>Join our community channel</CardDescription>
            </div>
          </div>
          {isVerified && <span className="text-xs bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] px-3 py-1 rounded-full font-medium">Verified ✓</span>}
          {isLocked && <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">Complete Step 1 first</span>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLocked && (
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Complete Step 1 to unlock</p>
          </div>
        )}
        {!isLocked && !isVerified && (
          <>
            <p className="text-sm text-muted-foreground">Join our WhatsApp community to get updates and exclusive content.</p>
            <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl h-11" onClick={() => window.open(WHATSAPP_LINK, "_blank")}>
              Join WhatsApp Channel <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <div className="bg-muted/30 rounded-xl p-4 space-y-2 border border-border/50">
              <p className="text-sm font-medium">After joining the group:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Take a screenshot showing you're inside the group</li>
                <li>Upload it below for AI verification</li>
              </ol>
            </div>
            <ScreenshotUpload stepNumber={2} sessionToken={sessionToken} onVerified={onVerified} />
          </>
        )}
        {isVerified && (
          <div className="bg-[hsl(var(--success))]/10 rounded-xl p-4 text-center border border-[hsl(var(--success))]/20">
            <p className="text-sm text-[hsl(var(--success))] font-medium">WhatsApp membership verified! Proceed to Step 3.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
