import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StepProgress } from "@/components/StepProgress";
import { Step1Card } from "@/components/Step1Card";
import { Step2Card } from "@/components/Step2Card";
import { Step3Card } from "@/components/Step3Card";
import { RegistrationForm } from "@/components/RegistrationForm";
import { useSession } from "@/hooks/useSession";
import { Loader2, Rocket, Shield, Award, Users } from "lucide-react";

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
  const showRegistrationForm = !session.registration_completed;

  let currentStep = 1;
  if (step1Verified && !step2Verified) currentStep = 2;
  if (step1Verified && step2Verified) currentStep = 3;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero with radial glow */}
        <div className="bg-hero-gradient">
          <div className="container mx-auto px-4 pt-12 pb-8 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-gold rounded-full text-white text-sm font-medium mb-6 shadow-gold">
              <Rocket className="h-4 w-4" />
              Exclusive CBSE Resources
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
              Access Premium{" "}
              <span className="text-gradient-gold">Study Materials</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
              {showRegistrationForm
                ? "Register now to unlock exclusive study resources for CBSE students."
                : "Complete 3 simple verification steps to unlock exclusive study resources."}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { icon: Shield, label: "100% Secure", color: "text-emerald-500" },
                { icon: Users, label: "10,000+ Students", color: "text-blue-500" },
                { icon: Award, label: "Premium Quality", color: "text-primary" },
              ].map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 bg-card/80 border border-border/50 rounded-full text-xs backdrop-blur-sm"
                >
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {showRegistrationForm ? (
            <div className="max-w-md mx-auto">
              <RegistrationForm
                sessionToken={session.session_token}
                onComplete={refreshSession}
              />
            </div>
          ) : (
            <>
              <StepProgress
                currentStep={currentStep}
                step1Verified={step1Verified}
                step2Verified={step2Verified}
              />

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

              <div className="max-w-xl mx-auto mt-10 text-center">
                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold mb-3">How It Works</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 text-left list-decimal list-inside">
                    <li>Register on our partner platform (embedded form)</li>
                    <li>Take a screenshot showing registration success</li>
                    <li>Join our WhatsApp community for updates</li>
                    <li>Take a screenshot showing you joined the group</li>
                    <li>Our AI will verify your screenshots automatically</li>
                    <li>Access your exclusive CBSE resources!</li>
                  </ol>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
