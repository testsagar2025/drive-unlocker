import { useState, useRef } from "react";
import { Camera, Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ScreenshotUploadProps {
  stepNumber: number;
  sessionToken: string;
  onVerified: () => void;
  disabled?: boolean;
}

export function ScreenshotUpload({ 
  stepNumber, 
  sessionToken, 
  onVerified,
  disabled = false 
}: ScreenshotUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "failed">("idle");
  const [failReason, setFailReason] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    await verifyScreenshot(file);
  };

  const verifyScreenshot = async (file: File) => {
    setUploading(true);
    setVerificationStatus("verifying");
    setFailReason("");

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-screenshot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            sessionToken,
            stepNumber,
            screenshotBase64: base64,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        }
        if (response.status === 402) {
          throw new Error("Service temporarily unavailable. Please try again later.");
        }
        throw new Error("Verification failed. Please try again.");
      }

      const result = await response.json();

      if (result.verified) {
        setVerificationStatus("success");
        toast.success("Screenshot verified successfully!");
        onVerified();
      } else {
        setVerificationStatus("failed");
        setFailReason(result.reason || "Could not verify the screenshot");
        toast.error("Verification failed: " + (result.reason || "Please try again with a clearer screenshot"));
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("failed");
      const message = error instanceof Error ? error.message : "Verification failed";
      setFailReason(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    setPreview(null);
    setVerificationStatus("idle");
    setFailReason("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />

      {!preview ? (
        <Button
          variant="outline"
          className="w-full h-16 sm:h-20 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all rounded-xl"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          <div className="flex flex-col items-center gap-1">
            <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              Upload Screenshot
            </span>
          </div>
        </Button>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={preview}
              alt="Screenshot preview"
              className="w-full h-32 sm:h-40 md:h-48 object-cover"
            />
            
            {/* Overlay for status */}
            {verificationStatus !== "idle" && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                {verificationStatus === "verifying" && (
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto" />
                    <p className="text-[10px] sm:text-sm mt-2 text-muted-foreground">AI analyzing screenshot...</p>
                  </div>
                )}
                {verificationStatus === "success" && (
                  <div className="text-center">
                    <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-[hsl(var(--success))] mx-auto" />
                    <p className="text-xs sm:text-sm mt-2 text-[hsl(var(--success))]">Verified!</p>
                  </div>
                )}
                {verificationStatus === "failed" && (
                  <div className="text-center px-4">
                    <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive mx-auto" />
                    <p className="text-xs sm:text-sm mt-2 text-destructive">Verification Failed</p>
                    <p className="text-[10px] sm:text-xs mt-1 text-muted-foreground max-w-[200px]">{failReason}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {verificationStatus === "failed" && (
            <Button
              variant="outline"
              className="w-full text-xs sm:text-sm"
              onClick={handleRetry}
            >
              Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
