import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, FolderOpen, ExternalLink, Loader2, CheckCircle, Sparkles } from "lucide-react";
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
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ sessionToken }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to unlock resources");
      }

      setDriveLink(result.driveLink);
      setRevealed(true);
      toast.success("🎉 Resources unlocked successfully!");
    } catch (error) {
      console.error("Unlock error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to unlock resources");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      isActive && !revealed && "ring-2 ring-primary shadow-gold",
      revealed && "ring-2 ring-[hsl(var(--success))]",
      isLocked && "opacity-40 pointer-events-none"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              revealed ? "bg-[hsl(var(--success))]" : isLocked ? "bg-muted" : "bg-primary"
            )}>
              {revealed ? (
                <CheckCircle className="h-5 w-5 text-[hsl(var(--success-foreground))]" />
              ) : isLocked ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <FolderOpen className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Step 3: Get Resources</CardTitle>
              <CardDescription>Access your CBSE materials</CardDescription>
            </div>
          </div>
          {revealed && (
            <span className="text-xs bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] px-2 py-1 rounded-full">
              Unlocked ✓
            </span>
          )}
          {isLocked && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              Complete Steps 1 & 2
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLocked && (
          <div className="bg-muted/30 rounded-lg p-6 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Complete both verification steps to unlock exclusive CBSE resources
            </p>
          </div>
        )}

        {!isLocked && !revealed && (
          <div className="space-y-4">
            <div className="bg-gradient-gold/10 border border-primary/30 rounded-lg p-4 text-center">
              <Sparkles className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">
                Congratulations! All steps verified.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click below to reveal your exclusive resources
              </p>
            </div>

            <Button
              className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-bold text-lg h-12"
              onClick={handleUnlock}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  🔓 Unlock Resources
                </>
              )}
            </Button>
          </div>
        )}
        
        {revealed && driveLink && (
          <div className="space-y-4">
            <div className="bg-[hsl(var(--success))]/10 rounded-lg p-4 text-center">
              <CheckCircle className="h-10 w-10 mx-auto text-[hsl(var(--success))] mb-2" />
              <p className="text-lg font-bold text-[hsl(var(--success))]">
                🎉 Resources Unlocked!
              </p>
            </div>

            <Button
              className="w-full bg-[#4285F4] hover:bg-[#3b78e7] text-white font-semibold h-12"
              onClick={() => window.open(driveLink, "_blank")}
            >
              <FolderOpen className="mr-2 h-5 w-5" />
              Open Google Drive
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Bookmark this folder for quick access to all CBSE materials
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
