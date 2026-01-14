import { Check, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep: number;
  step1Verified: boolean;
  step2Verified: boolean;
}

export function StepProgress({ currentStep, step1Verified, step2Verified }: StepProgressProps) {
  const steps = [
    { number: 1, label: "Register", verified: step1Verified },
    { number: 2, label: "Join WhatsApp", verified: step2Verified },
    { number: 3, label: "Get Resources", verified: step1Verified && step2Verified },
  ];

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
          <div 
            className="h-full bg-gradient-gold transition-all duration-500"
            style={{ 
              width: step2Verified ? "100%" : step1Verified ? "50%" : "0%" 
            }}
          />
        </div>
        
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isLocked = (step.number === 2 && !step1Verified) || 
                          (step.number === 3 && !step2Verified);
          const isVerified = step.verified;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isVerified && "bg-[hsl(var(--success))] border-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
                  isActive && !isVerified && "bg-primary border-primary text-primary-foreground glow-gold",
                  isLocked && "bg-muted border-muted-foreground/30 text-muted-foreground",
                  !isActive && !isVerified && !isLocked && "bg-card border-border text-muted-foreground"
                )}
              >
                {isVerified ? (
                  <Check className="h-5 w-5" />
                ) : isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : isActive ? (
                  <span className="font-bold">{step.number}</span>
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span className={cn(
                "text-xs mt-2 font-medium",
                isVerified && "text-[hsl(var(--success))]",
                isActive && !isVerified && "text-primary",
                isLocked && "text-muted-foreground/50"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
