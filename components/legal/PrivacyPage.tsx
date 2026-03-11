import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-bg text-neutral-text font-sans selection:bg-primary-main/30 relative">
      <div className="film-grain animate-noise"></div>
      <div className="vignette"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-primary-main hover:text-white transition-colors mb-8 focus-visible:ring-2 focus-visible:ring-primary-main rounded outline-none"
            aria-label="Return to homepage"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </a>

          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-neutral-textSecondary mb-12">Last Updated: March 2026</p>

          <div className="prose prose-invert max-w-none text-neutral-text/90 prose-headings:text-white prose-a:text-primary-main hover:prose-a:text-white">
            <h2>1. Information We Collect</h2>
            <p>We collect several different types of information for various purposes to provide and improve our streaming service to you:</p>
            <ul>
              <li><strong>Personal Data:</strong> When you register an account, we ask for your email address.</li>
              <li><strong>Payment Data:</strong> To process purchases, we use Square. We do not directly store or handle your credit card numbers.</li>
              <li><strong>Device Data:</strong> When you use our Device Linking feature (e.g., to link a Roku TV), we generate and store a secure device identifier to authorize your TV to stream purchased content.</li>
              <li><strong>Usage Data:</strong> We track your video playback progress (analytics and bookmarks) to allow seamless resuming of the T.O.N.Y. series across your devices.</li>
            </ul>

            <h2>2. How We Use Your Data</h2>
            <p>Top of New York Productions uses the collected data for various streaming purposes:</p>
            <ul>
              <li>To provide and maintain the Service</li>
              <li>To notify you about changes to our Service or new Episodes</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve the Service (via Mux Data)</li>
              <li>To monitor the usage of our Service and prevent piracy</li>
            </ul>

            <h2>3. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track the activity on our Service. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser or our integrated Cookie Banner to refuse all non-essential cookies.
            </p>

            <h2>4. Third-Party Service Providers</h2>
            <p>
              We employ third-party companies to facilitate our Service, provide the Service on our behalf, and perform Service-related services. These include:
            </p>
            <ul>
              <li><strong>Supabase:</strong> Handles secure authentication and database storage.</li>
              <li><strong>Mux:</strong> Handles video hosting, streaming delivery, and quality analytics.</li>
              <li><strong>Square:</strong> Processes secure credit card payments.</li>
            </ul>

            <h2>5. Your Data Rights</h2>
            <p>
              You have the right to request access to the data we have on you, or request that your account and all associated data be permanently deleted. Contact us directly to execute these rights.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
