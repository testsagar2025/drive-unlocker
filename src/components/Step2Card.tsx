import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreenshotUpload } from "./ScreenshotUpload";
import { CheckCircle, Lock, MessageCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2CardProps {
  isActive: boolean;
  isVerified: boolean;
  isLocked: boolean;
  sessionToken: string;
  onVerified: () => void;
}

const WHATSAPP_LINK = "https://chat.whatsapp.com/LWt6GLsZ2cf5dapQi5k4k1?mode=gi_t";

export function Step2Card({ isActive, isVerified, isLocked, sessionToken, onVerified }: Step2CardProps) {
  const [expanded, setExpanded] = useState(isActive && !isLocked);

  return (
    <div className={cn(
      "bg-card rounded-xl border transition-all duration-200",
      isActive && !isVerified && !isLocked && "border-primary/40 shadow-gold",
      isVerified && "border-[hsl(var(--success))]/40",
      isLocked && "border-border/50 opacity-40",
      !isActive && !isVerified && !isLocked && "border-border/50 opacity-60"
    )}>
      {/* Header */}
      <button
        onClick={() => !isLocked && !isVerified && setExpanded((p) => !p)}
        disabled={isLocked}
        className="w-full flex items-center justify-between p-3 sm:p-4 text-left disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={cn(
            "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0",
            isVerified && "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
            isLocked && "bg-muted text-muted-foreground",
            isActive && !isVerified && !isLocked && "bg-primary text-primary-foreground",
            !isActive && !isVerified && !isLocked && "bg-muted text-muted-foreground"
          )}>
            {isVerified ? <CheckCircle className="h-4 w-4" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : "2"}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold">Join WhatsApp Group</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {isVerified ? "Completed ✓" : isLocked ? "Complete Step 1 first" : "Join & take a screenshot"}
            </p>
          </div>
        </div>
        {!isLocked && !isVerified && (
          expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Body */}
      {!isLocked && !isVerified && expanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2.5 sm:space-y-3">
          <Button
            className="w-full h-10 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-xl text-xs sm:text-sm"
            onClick={() => window.open(WHATSAPP_LINK, "_blank")}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Join WhatsApp Group
            <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>

          <div className="bg-muted/50 rounded-lg p-2.5 sm:p-3 border border-border/50">
            <p className="text-[10px] sm:text-xs font-medium mb-1">After clicking join:</p>
            <ol className="text-[10px] sm:text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
              <li>Take a screenshot of the group page (join request, group info, or chat)</li>
              <li>Upload it below for verification</li>
            </ol>
          </div>

          <ScreenshotUpload stepNumber={2} sessionToken={sessionToken} onVerified={onVerified} />
        </div>
      )}
    </div>
  );
}
