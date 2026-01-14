import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StepProgress } from "@/components/StepProgress";
import { Step1Card } from "@/components/Step1Card";
import { Step2Card } from "@/components/Step2Card";
import { Step3Card } from "@/components/Step3Card";
import { useSession } from "@/hooks/useSession";
import { Loader2, Rocket } from "lucide-react";

const Index = () => {
  const { session, loading, error, refreshSession } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Failed to initialize session</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const step1Verified = session.step1_verified;
  const step2Verified = session.step2_verified;

  // Determine current active step
  let currentStep = 1;
  if (step1Verified && !step2Verified) currentStep = 2;
  if (step1Verified && step2Verified) currentStep = 3;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Rocket className="h-4 w-4" />
            Exclusive CBSE Resources
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Access Premium <span className="text-gradient-gold">CBSE Study Materials</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Complete 3 simple verification steps to unlock exclusive study resources for CBSE students.
          </p>
        </div>

        {/* Progress Indicator */}
        <StepProgress
          currentStep={currentStep}
          step1Verified={step1Verified}
          step2Verified={step2Verified}
        />

        {/* Step Cards */}
        <div className="max-w-xl mx-auto space-y-6">
          <Step1Card
            isActive={currentStep === 1}
            isVerified={step1Verified}
            sessionToken={session.session_token}
            onVerified={refreshSession}
          />
          
          <Step2Card
            isActive={currentStep === 2}
            isVerified={step2Verified}
            isLocked={!step1Verified}
            sessionToken={session.session_token}
            onVerified={refreshSession}
          />
          
          <Step3Card
            isActive={currentStep === 3}
            isLocked={!step1Verified || !step2Verified}
            sessionToken={session.session_token}
          />
        </div>

        {/* Info Section */}
        <div className="max-w-xl mx-auto mt-10 text-center">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-2">How It Works</h3>
            <ol className="text-sm text-muted-foreground space-y-2 text-left list-decimal list-inside">
              <li>Register on our partner platform (embedded form above)</li>
              <li>Join our WhatsApp community for updates</li>
              <li>Verify each step by uploading a screenshot</li>
              <li>Our AI will analyze your screenshots automatically</li>
              <li>Once verified, access your exclusive resources!</li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
