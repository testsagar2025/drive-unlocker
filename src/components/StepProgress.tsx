import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep: number;
  step1Verified: boolean;
  step2Verified: boolean;
}

export function StepProgress({ currentStep, step1Verified, step2Verified }: StepProgressProps) {
  const steps = [
    { number: 1, label: "Register", verified: step1Verified },
    { number: 2, label: "WhatsApp", verified: step2Verified },
    { number: 3, label: "Resources", verified: step1Verified && step2Verified },
  ];

  return (
    <div className="w-full max-w-xs sm:max-w-sm mx-auto mb-5 sm:mb-6">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-[14px] sm:top-4 left-[15%] right-[15%] h-[2px] bg-border">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: step2Verified ? "100%" : step1Verified ? "50%" : "0%" }}
          />
        </div>

        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isLocked = (step.number === 2 && !step1Verified) || (step.number === 3 && !step2Verified);
          const isVerified = step.verified;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10 w-16 sm:w-20">
              <div className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300",
                isVerified && "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
                isActive && !isVerified && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                isLocked && "bg-muted text-muted-foreground",
                !isActive && !isVerified && !isLocked && "bg-card border-2 border-border text-muted-foreground"
              )}>
                {isVerified ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : isLocked ? <Lock className="h-3 w-3" /> : step.number}
              </div>
              <span className={cn(
                "text-[9px] sm:text-[11px] mt-1 sm:mt-1.5 font-medium",
                isVerified && "text-[hsl(var(--success))]",
                isActive && !isVerified && "text-primary",
                (isLocked || (!isActive && !isVerified)) && "text-muted-foreground"
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
