import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsConditions() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-5 sm:mb-6 py-1">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">Terms & Conditions</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 sm:space-y-5 text-xs sm:text-sm text-muted-foreground">
          <p><strong>Last updated:</strong> February 2026</p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing and using PRO CBSE, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Service Description</h2>
            <p>PRO CBSE provides free access to curated CBSE study materials through a verification-based access system. Users must complete a registration and verification process to unlock resources.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Affiliate Links</h2>
            <p>This platform contains affiliate links. By completing the registration process on partner platforms (such as ALLEN), you acknowledge that:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Registration on partner platforms is part of the verification process</li>
              <li>You are NOT required to make any payment</li>
              <li>PRO CBSE may receive affiliate commissions from partner registrations</li>
              <li>The examination and study materials are provided completely free of charge</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Provide accurate personal information during registration</li>
              <li>Do not share or redistribute the study materials without permission</li>
              <li>Do not attempt to bypass the verification process</li>
              <li>Do not upload fraudulent or manipulated screenshots</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. AI Verification</h2>
            <p>Screenshots are analyzed using AI technology for verification. The system may occasionally produce inaccurate results. If verification fails incorrectly, users may retry with a clearer screenshot.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. Intellectual Property</h2>
            <p>All content, design, and branding on PRO CBSE are owned by Arvish Mirza. Unauthorized reproduction or distribution is prohibited.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. Limitation of Liability</h2>
            <p>PRO CBSE is provided "as is" without warranties. We are not liable for any damages arising from the use of the platform or third-party services.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">8. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">9. Contact</h2>
            <p>For questions regarding these terms, contact the platform owner, Arvish Mirza.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}