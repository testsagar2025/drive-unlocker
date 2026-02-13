import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, FolderOpen, ExternalLink, Loader2, CheckCircle, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Step3CardProps {
  isActive: boolean;
  isLocked: boolean;
  sessionToken: string;
}

export function Step3Card({ isActive, isLocked, sessionToken }: Step3CardProps) {
  const [loading, setLoading] = useState(false);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-drive-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ sessionToken }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to unlock resources");
      setDriveLink(result.driveLink);
      setRevealed(true);
      toast.success("🎉 Resources unlocked!");
    } catch (error) {
      console.error("Unlock error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to unlock resources");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "bg-card rounded-xl border transition-all duration-200",
      isActive && !revealed && "border-primary/40 shadow-gold",
      revealed && "border-[hsl(var(--success))]/40",
      isLocked && "border-border/50 opacity-40"
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          revealed ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" :
          isLocked ? "bg-muted text-muted-foreground" :
          "bg-primary text-primary-foreground"
        )}>
          {revealed ? <CheckCircle className="h-4 w-4" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : "3"}
        </div>
        <div>
          <p className="text-sm font-semibold">Get Resources</p>
          <p className="text-xs text-muted-foreground">
            {revealed ? "Unlocked ✓" : isLocked ? "Complete Steps 1 & 2" : "Tap to unlock your materials"}
          </p>
        </div>
      </div>

      {/* Body */}
      {!isLocked && !revealed && (
        <div className="px-4 pb-4">
          <Button
            className="w-full h-11 bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold rounded-xl"
            onClick={handleUnlock}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Unlocking...</>
            ) : (
              <>🔓 Unlock Resources</>
            )}
          </Button>
        </div>
      )}

      {revealed && driveLink && (
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-[hsl(var(--success))]/10 rounded-lg p-4 text-center border border-[hsl(var(--success))]/20">
            <PartyPopper className="h-8 w-8 mx-auto text-[hsl(var(--success))] mb-2" />
            <p className="text-sm font-bold text-[hsl(var(--success))]">Resources Unlocked!</p>
          </div>
          <Button
            className="w-full h-11 bg-[#4285F4] hover:bg-[#3b78e7] text-white font-semibold rounded-xl"
            onClick={() => window.open(driveLink, "_blank")}
          >
            <FolderOpen className="mr-2 h-4 w-4" /> Open Google Drive <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">Bookmark this folder for quick access</p>
        </div>
      )}
    </div>
  );
}