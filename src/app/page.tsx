import Link from 'next/link';
import {
  FileText,
  MessageSquare,
  CheckSquare,
  CreditCard,
  Shield,
  Zap,
  ArrowRight,
  Star,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="text-lg font-bold text-foreground">ClientDrop</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/5 text-accent text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star className="w-4 h-4" />
            Simple. Branded. Professional.
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Your clients deserve better than{' '}
            <span className="text-accent">email chaos</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
            Give every client a branded portal where they can view files, send messages,
            upload documents, and pay invoices — all in one place. Set up in 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors text-base"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-muted">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Portal Preview */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border bg-background-secondary p-3 sm:p-6 shadow-xl shadow-background-secondary">
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-500 rounded-lg" />
                  <span className="font-semibold text-foreground">Acme Consulting</span>
                </div>
                <span className="text-sm text-muted">Welcome, Sarah</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
                <div className="bg-background-secondary rounded-lg p-4 border border-border">
                  <div className="text-sm font-medium text-foreground mb-2">Project Status</div>
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                    In Review
                  </div>
                </div>
                <div className="bg-background-secondary rounded-lg p-4 border border-border">
                  <div className="text-sm font-medium text-foreground mb-2">Documents</div>
                  <div className="text-2xl font-bold text-foreground">3/5</div>
                  <div className="text-xs text-muted">uploaded</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-4 border border-border">
                  <div className="text-sm font-medium text-foreground mb-2">Messages</div>
                  <div className="text-2xl font-bold text-foreground">2</div>
                  <div className="text-xs text-muted">unread</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background-secondary px-4 sm:px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything your clients need. Nothing they don&apos;t.
            </h2>
            <p className="text-muted mt-4 max-w-xl mx-auto">
              Other tools try to be your CRM, project manager, and accounting software.
              We just do one thing: make your clients feel taken care of.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={FileText}
              title="File Sharing"
              description="Share files with clients and let them upload documents back to you. No more email attachments."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Client Messaging"
              description="A simple message thread per client. Everything in one place instead of scattered across email."
            />
            <FeatureCard
              icon={CheckSquare}
              title="Document Checklists"
              description="Request specific documents from clients. They see what's done and what's still needed."
            />
            <FeatureCard
              icon={CreditCard}
              title="Payment Links"
              description="Send a 'Pay Now' button to any client. They pay via Stripe. You get paid faster."
            />
            <FeatureCard
              icon={Shield}
              title="Branded Portal"
              description="Your logo, your colors, your business name. Clients see your brand, not ours."
            />
            <FeatureCard
              icon={Zap}
              title="5-Minute Setup"
              description="No complex configuration. Sign up, add your branding, invite a client. That's it."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6" id="pricing">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Simple pricing. No per-user fees.
            </h2>
            <p className="text-muted mt-4">
              Most tools charge per team member. We charge a flat monthly fee. Done.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <PricingCard
              name="Starter"
              price="19"
              description="For solo professionals getting started"
              features={[
                'Up to 10 active clients',
                'File sharing & messaging',
                'Document checklists',
                'Payment links',
                'Your branding',
              ]}
            />
            <PricingCard
              name="Pro"
              price="39"
              description="For growing businesses"
              features={[
                'Unlimited clients',
                'Everything in Starter',
                'Intake forms',
                'Custom domain',
                'Priority support',
              ]}
              popular
            />
            <PricingCard
              name="Team"
              price="79"
              description="For teams with multiple members"
              features={[
                'Everything in Pro',
                'Up to 5 team members',
                'Team permissions',
                'Activity log',
                'API access',
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Stop emailing files. Start impressing clients.
          </h2>
          <p className="text-muted mt-4 mb-8">
            Join hundreds of professionals who give their clients a better experience.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors text-base"
          >
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-sm font-semibold text-foreground">ClientDrop</span>
          </div>
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} ClientDrop. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  popular,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        popular
          ? 'border-accent bg-accent/5 ring-1 ring-accent relative'
          : 'border-border bg-card'
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground text-lg">{name}</h3>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">${price}</span>
        <span className="text-muted">/mo</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <svg className="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/auth/login"
        className={`block text-center w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
          popular
            ? 'bg-accent text-white hover:bg-accent/90'
            : 'border border-border text-foreground hover:bg-foreground/5'
        }`}
      >
        Get started
      </Link>
    </div>
  );
}
