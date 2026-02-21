import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-5 sm:mb-6 py-1">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">Privacy Policy</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 sm:space-y-5 text-xs sm:text-sm text-muted-foreground">
          <p><strong>Last updated:</strong> February 2026</p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect the following information when you register on our platform:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Full name</li>
              <li>Class / Grade</li>
              <li>Mobile phone number</li>
              <li>Screenshots uploaded for verification purposes</li>
              <li>Session data and page view analytics</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To verify your registration and grant access to study materials</li>
              <li>To communicate updates about CBSE resources</li>
              <li>To improve our platform and user experience</li>
              <li>To maintain platform security and prevent misuse</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Data Storage & Security</h2>
            <p>Your data is stored securely using industry-standard encryption and cloud infrastructure. We do not sell, trade, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Third-Party Services</h2>
            <p>Our platform integrates with third-party services including ALLEN (for registration), WhatsApp (for community access), and Google Drive (for resource delivery). Each service has its own privacy policy.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. Cookies & Analytics</h2>
            <p>We use session tokens and analytics tools to track page views and improve the user experience. No personally identifiable information is shared with analytics providers.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. Your Rights</h2>
            <p>You have the right to request access to, correction of, or deletion of your personal data. Contact us to exercise these rights.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. Contact</h2>
            <p>For privacy-related inquiries, please reach out to the platform owner, Arvish Mirza, through the contact information provided on the website.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}