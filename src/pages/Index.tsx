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
import { Loader2, Rocket, Shield, Award, Users, Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [showFab, setShowFab] = useState(false);
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
        <motion.div
          className="bg-hero-gradient"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-4 pt-12 pb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-gold rounded-full text-white text-sm font-medium mb-6 shadow-gold"
            >
              <Rocket className="h-4 w-4" />
              Exclusive CBSE Resources
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight"
            >
              Access Premium{" "}
              <span className="text-gradient-gold">Study Materials</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg"
            >
              {showRegistrationForm
                ? "Register now to unlock exclusive study resources for CBSE students."
                : "Complete 3 simple verification steps to unlock exclusive study resources."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-3 mt-8"
            >
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
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="container mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {showRegistrationForm ? (
              <motion.div
                key="registration"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="max-w-md mx-auto"
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
                transition={{ duration: 0.5 }}
              >
                <StepProgress
                  currentStep={currentStep}
                  step1Verified={step1Verified}
                  step2Verified={step2Verified}
                />

                <div className="max-w-xl mx-auto space-y-6">
                  {[
                    <Step1Card key="s1" isActive={currentStep === 1} isVerified={step1Verified} sessionToken={session.session_token} onVerified={refreshSession} />,
                    <Step2Card key="s2" isActive={currentStep === 2} isVerified={step2Verified} isLocked={!step1Verified} sessionToken={session.session_token} onVerified={refreshSession} />,
                    <Step3Card key="s3" isActive={currentStep === 3} isLocked={!step1Verified || !step2Verified} sessionToken={session.session_token} />,
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * i }}
                    >
                      {card}
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="max-w-xl mx-auto mt-10 text-center"
                >
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
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Footer />

      {/* Floating Settings Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {showFab && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/50 shadow-lg text-sm font-medium text-foreground hover:bg-muted transition-colors backdrop-blur-sm"
            >
              <Shield className="h-4 w-4 text-primary" />
              Admin Panel
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFab((prev) => !prev)}
          className="w-12 h-12 rounded-full bg-gradient-gold shadow-gold flex items-center justify-center text-white"
        >
          {showFab ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
        </motion.button>
      </div>
    </div>
  );
};

export default Index;
