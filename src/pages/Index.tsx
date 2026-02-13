import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StepProgress } from "@/components/StepProgress";
import { Step1Card } from "@/components/Step1Card";
import { Step2Card } from "@/components/Step2Card";
import { Step3Card } from "@/components/Step3Card";
import { RegistrationForm } from "@/components/RegistrationForm";
import { useSession } from "@/hooks/useSession";
import { Loader2, BookOpen, Shield, Users, Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [showFab, setShowFab] = useState(false);
  const { session, loading, error, refreshSession } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive font-medium">Failed to initialize session</p>
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
        {/* Hero - compact and clean */}
        <div className="bg-hero-gradient">
          <motion.div
            className="container mx-auto px-4 pt-10 pb-6 md:pt-14 md:pb-8 text-center max-w-2xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-semibold mb-5">
              <BookOpen className="h-3.5 w-3.5" />
              Free CBSE Study Materials
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight tracking-tight">
              Get Premium <span className="text-gradient-gold">CBSE Resources</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              {showRegistrationForm
                ? "Register to unlock curated study materials for free."
                : "Complete the steps below to unlock your resources."}
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {[
                { icon: Shield, label: "100% Free" },
                { icon: Users, label: "10K+ Students" },
                { icon: BookOpen, label: "Quality Content" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-lg">
          <AnimatePresence mode="wait">
            {showRegistrationForm ? (
              <motion.div
                key="registration"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <RegistrationForm
                  sessionToken={session.session_token}
                  onComplete={refreshSession}
                />
              </motion.div>
            ) : (
              <motion.div
                key="steps"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                <StepProgress
                  currentStep={currentStep}
                  step1Verified={step1Verified}
                  step2Verified={step2Verified}
                />

                <div className="space-y-4">
                  {[
                    <Step1Card key="s1" isActive={currentStep === 1} isVerified={step1Verified} sessionToken={session.session_token} onVerified={refreshSession} />,
                    <Step2Card key="s2" isActive={currentStep === 2} isVerified={step2Verified} isLocked={!step1Verified} sessionToken={session.session_token} onVerified={refreshSession} />,
                    <Step3Card key="s3" isActive={currentStep === 3} isLocked={!step1Verified || !step2Verified} sessionToken={session.session_token} />,
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.08 * i }}
                    >
                      {card}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

      {/* Floating Admin FAB */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {showFab && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border shadow-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              <Shield className="h-4 w-4 text-primary" />
              Admin
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFab((prev) => !prev)}
          className="w-11 h-11 rounded-full bg-gradient-gold shadow-gold flex items-center justify-center text-primary-foreground"
        >
          {showFab ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
        </motion.button>
      </div>
    </div>
  );
};

export default Index;