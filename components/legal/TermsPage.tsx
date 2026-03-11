import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-bg text-neutral-text font-sans selection:bg-primary-main/30 relative">
      <div className="film-grain animate-noise"></div>
      <div className="vignette"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-primary-main hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </a>

          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-neutral-textSecondary mb-12">Last Updated: March 2026</p>

          <div className="prose prose-invert max-w-none text-neutral-text/90 prose-headings:text-white prose-a:text-primary-main hover:prose-a:text-white">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using topofnewyork.com and the T.O.N.Y. applications on Roku, Apple TV, Google TV, or any other platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>

            <h2>2. The Service</h2>
            <p>
              T.O.N.Y. operates on a freemium model. Certain content ("Free Content") may be accessed without payment. Other content ("Premium Content") requires a one-time payment or subscription. We reserve the right to change which content is Free or Premium at any time.
            </p>

            <h2>3. Account Registration & Device Linking</h2>
            <p>
              To access Premium Content, you must create an account. You are responsible for maintaining the confidentiality of your account credentials. The "Device Linking" feature allows you to connect supported devices (e.g., Roku smart TVs) to your web account. You are responsible for all activity that occurs under your linked devices.
            </p>

            <h2>4. Payments and Entitlements</h2>
            <ul>
              <li><strong>Payments:</strong> All payments are securely processed by Square. We do not store your full credit card information on our servers.</li>
              <li><strong>Entitlements:</strong> Purchasing a film grants you a non-exclusive, non-transferable, revocable license to access the content for personal, non-commercial use.</li>
              <li><strong>Refunds:</strong> All sales are final. Streaming digital content is not eligible for refunds unless the content is permanently technically broken and inaccessible.</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality (including the T.O.N.Y. series itself) are owned by Top of New York Productions and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not rip, download, distribute, or pirate the content.
            </p>

            <h2>6. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach (or if we suspect you are attempting to breach or pirate) the Terms.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              In no event shall Top of New York Productions, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
