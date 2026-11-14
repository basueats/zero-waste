import React, { useEffect } from 'react';
import { X, FileText, Cookie, ShieldCheck, Mail } from 'lucide-react';

export type LegalPolicyType = 'terms' | 'cookie' | 'privacy';

interface LegalPolicyModalProps {
  activePolicy: LegalPolicyType | null;
  onSelectPolicy: (policy: LegalPolicyType) => void;
  onClose: () => void;
}

const POLICY_TABS: Array<{ id: LegalPolicyType; label: string; icon: React.ReactNode }> = [
  { id: 'terms', label: 'Terms & Conditions', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'cookie', label: 'Cookie Policy', icon: <Cookie className="w-3.5 h-3.5" /> },
  { id: 'privacy', label: 'Privacy Policy', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
];

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  activePolicy,
  onSelectPolicy,
  onClose,
}) => {
  useEffect(() => {
    if (!activePolicy) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePolicy, onClose]);

  if (!activePolicy) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-black text-white flex items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
              Zero Waste Academy · Dr. Supritam Basu
            </p>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight mt-0.5">
              {activePolicy === 'terms' && 'Terms and Conditions'}
              {activePolicy === 'cookie' && 'Cookie Policy'}
              {activePolicy === 'privacy' && 'Privacy Policy'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close legal policy modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Policy Switcher Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2 overflow-x-auto shrink-0">
          {POLICY_TABS.map((tab) => {
            const isActive = activePolicy === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectPolicy(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:text-black hover:border-neutral-400'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Document Body */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-5 text-xs sm:text-[13px] text-neutral-700 leading-relaxed">
          {activePolicy === 'terms' && <TermsAndConditionsContent />}
          {activePolicy === 'cookie' && <CookiePolicyContent />}
          {activePolicy === 'privacy' && <PrivacyPolicyContent />}
        </div>

        {/* Sticky Footer Bar */}
        <div className="px-4 sm:px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-neutral-600">
            <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>
              Dr. Supritam Basu ·{' '}
              <a
                href="mailto:supritam.basu@supritamone.com"
                className="font-semibold text-black underline"
              >
                supritam.basu@supritamone.com
              </a>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer self-end sm:self-auto"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xs sm:text-sm font-extrabold text-neutral-900 uppercase tracking-wide pt-3 border-t border-neutral-100 first:border-t-0 first:pt-0">
    {children}
  </h3>
);

const SubClause: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-1">
    <p className="font-bold text-neutral-900">{title}</p>
    <div>{children}</div>
  </div>
);

const TermsAndConditionsContent: React.FC = () => (
  <div className="space-y-4">
    <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
      <p className="font-extrabold text-neutral-900 text-sm">
        TERMS AND CONDITIONS — Zero Waste Academy (by Dr. Supritam Basu / Supritamone)
      </p>
      <p className="text-[11px] text-neutral-500 mt-1">
        Last updated: November 2026 · Websites: https://zerowasteacademy.supritamone.com/ &amp; https://zerowaste.supritamone.com/
      </p>
      <p className="mt-2">
        These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the Zero Waste Academy website,
        culinary learning platform, byproduct catalogue, calculators, certifications, and companion mobile/web interfaces
        (collectively, the &ldquo;Services&rdquo;), operated by <strong>Dr. Supritam Basu</strong> (&ldquo;Zero Waste Academy&rdquo;,
        &ldquo;Supritamone&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
      </p>
    </div>

    <SectionHeading>Article I. Parties, Scope, and Acceptance</SectionHeading>
    <SubClause title="1.1 Contracting Entity &amp; Contact">
      Zero Waste Academy is operated by Dr. Supritam Basu, accessible via{' '}
      <a href="mailto:supritam.basu@supritamone.com" className="text-black underline font-semibold">
        supritam.basu@supritamone.com
      </a>
      . By registering an Account, activating a 3-Day Free Trial, purchasing any membership plan, or accessing any part of
      the Services, you agree to be bound by these Terms.
    </SubClause>
    <SubClause title="1.2 Consumer (B2C) &amp; Commercial Business (B2B) Users">
      Where you purchase or access the Services for a hotel, restaurant, resort, culinary institute, or hospitality group,
      you represent that you have authority to bind that organization (&ldquo;Business Customer&rdquo;). Individual chefs
      purchasing for personal professional development act as Consumer Users (&ldquo;B2C Users&rdquo;).
    </SubClause>

    <SectionHeading>Article II. Definitions</SectionHeading>
    <p>
      <strong>&ldquo;Account&rdquo;</strong> means your registered subscriber profile on Zero Waste Academy or via verified SSO from
      zerowaste.supritamone.com. <strong>&ldquo;Platform Content&rdquo;</strong> means all courses, 26h lecture modules, 252 newsletter
      syntheses, 500+ byproduct guides, 500+ recipes, waste calculators, SOP worksheets, assessments, and official certificates.
      <strong>&ldquo;Subscription&rdquo;</strong> means a Free Trial, Individual Annual Plan, Team Brigade Plan, or Executive
      Advisory Training Plan.
    </p>

    <SectionHeading>Article III. Eligibility, Accounts, and Security</SectionHeading>
    <SubClause title="3.1 Accurate Information &amp; Credential Confidentiality">
      You must provide accurate registration details (full name, workplace, and valid email address) and safeguard your login
      credentials. Accounts are strictly personal (or bound to assigned seats under a Team Plan) and may not be shared,
      sold, or transferred without written authorization from Dr. Supritam Basu.
    </SubClause>
    <SubClause title="3.2 Seamless Partner SSO Access">
      Members arriving with an active trial or paid subscription from{' '}
      <span className="font-mono text-neutral-900">zerowaste.supritamone.com</span> may be authenticated seamlessly into Zero
      Waste Academy without duplicate sign-in, subject to active plan validity and administrator verification.
    </SubClause>

    <SectionHeading>Article IV. Digital Content License &amp; Permitted Use</SectionHeading>
    <p>
      Subject to timely payment and compliance with these Terms, Zero Waste Academy grants you a limited, non-exclusive,
      non-transferable, revocable license to access Platform Content solely for internal culinary education, commercial
      kitchen waste reduction, and personal professional certification.
    </p>

    <SectionHeading>Article V. Subscriptions, Free Trials, Billing, and No-Refund Policy</SectionHeading>
    <SubClause title="5.1 Plans &amp; Trial Expiration">
      We offer a 3-Day (72-hour) Free Trial, Individual Chef Annual Plan ($99/yr), Team Brigade Plan (from $79/chef/yr), and
      Executive Advisory Training Plan ($1,499/5 chefs/yr). Upon expiration of a 3-Day Free Trial without upgrading to a paid
      subscription, account access is automatically restricted until a paid plan is activated.
    </SubClause>
    <SubClause title="5.2 No-Refund Policy">
      Because Zero Waste Academy delivers immediate access to digital courses, downloadable culinary SOPs, recipes, and
      proprietary frameworks, all subscription fees are final and non-refundable once access is granted, except where
      mandatory consumer law applies or if we refuse registration or terminate an active Account without cause.
    </SubClause>

    <SectionHeading>Article VI. Optional Add-Ons &amp; Live Advisory Calls</SectionHeading>
    <SubClause title="6.1 Live Masterclasses &amp; 1:1 Culinary Coaching">
      Scheduled Q&amp;A masterclasses and executive 1:1 kitchen advisory sessions must be attended at the confirmed time.
      Payments for bespoke consulting or coaching add-ons are non-refundable except where required by applicable law;
      missed sessions or late arrivals without prior written notice may be treated as delivered in full.
    </SubClause>

    <SectionHeading>Article VII. Offline Access, Downloads, and Device Rules</SectionHeading>
    <p>
      Where downloadable SOP sheets, calculators, or offline study resources are provided, access remains contingent upon an
      active, unrestricted subscription. Sharing downloaded materials with external non-subscribed third parties is prohibited.
    </p>

    <SectionHeading>Article VIII. Intellectual Property, Copyright, and Content Protection</SectionHeading>
    <SubClause title="8.1 Proprietary Ownership">
      All curriculum design, narration scripts, recipes, byproduct methodologies, ISO 9001:2015 / CPD-aligned training
      materials, trademarks, and platform software belong exclusively to Dr. Supritam Basu and Supritamone.
    </SubClause>
    <SubClause title="8.2 Anti-Piracy &amp; Liquidated Remedies">
      You agree not to reproduce, scrape, republish, resell, frame, or distribute any Platform Content externally, nor train
      competing commercial datasets on proprietary course transcripts. Unauthorized commercial distribution may result in
      immediate termination and claims for damages, lost revenue, and legal enforcement costs.
    </SubClause>

    <SectionHeading>Article IX. Business Users, Multi-Seat Plans, and Organizational Responsibility</SectionHeading>
    <p>
      For Team Brigade and Enterprise plans, the Business Customer is responsible for assigning seats only to active kitchen
      staff, ensuring compliance with these Terms by all brigade members, and preventing credential sharing beyond purchased
      seat counts.
    </p>

    <SectionHeading>Article X. Acceptable Use, Platform Rules, and Prohibited Conduct</SectionHeading>
    <p>
      You agree not to attempt unauthorized access to the Administrator Portal, bypass trial or paywall restrictions, inject
      malicious code, harass culinary mentors or community members, or misrepresent completion certificates. Certificates are
      awarded strictly upon passing all 12 section assessments with the required 37%+ overall score.
    </p>

    <SectionHeading>Article XI. User Content, Feedback, and Communications</SectionHeading>
    <p>
      By submitting kitchen questions, waste case studies, or product suggestions via &ldquo;Ask Dr. Chef Basu&rdquo; or
      support forms, you grant Zero Waste Academy a royalty-free right to use that feedback to answer your inquiry and improve
      curriculum resources.
    </p>

    <SectionHeading>Article XII. Data Protection, Privacy, and Cookies</SectionHeading>
    <p>
      Personal data and cookie preferences are governed by our Privacy Policy and Cookie Policy, incorporated into these Terms
      by reference.
    </p>

    <SectionHeading>Article XIII. Disclaimers and Educational Purpose</SectionHeading>
    <p>
      Platform Content provides professional culinary and sustainability guidance. Every commercial kitchen must independently
      verify local food safety laws, HACCP critical control points, allergen labeling, and municipal donation regulations
      before serving or donating food.
    </p>

    <SectionHeading>Article XIV. Limitation of Liability</SectionHeading>
    <p>
      To the maximum extent permitted by law, Zero Waste Academy and Dr. Supritam Basu shall not be liable for indirect,
      incidental, consequential, or lost-profit damages arising from your use of the Services. Total aggregate liability
      shall not exceed the subscription fees paid by you during the twelve (12) months preceding the claim.
    </p>

    <SectionHeading>Article XV. Indemnity</SectionHeading>
    <p>
      You agree to indemnify and hold harmless Dr. Supritam Basu and Zero Waste Academy against third-party claims, losses, or
      expenses arising from your breach of these Terms, food safety non-compliance in your kitchen, or unauthorized use of
      Platform Content.
    </p>

    <SectionHeading>Article XVI. Suspension, Termination, and Effects</SectionHeading>
    <p>
      We may restrict, suspend, or terminate Accounts for unpaid invoices, expired 3-Day Trials, credential sharing, content
      piracy, or prohibited conduct. Upon termination, all licenses immediately cease, except accrued payment obligations and
      intellectual property protections which survive.
    </p>

    <SectionHeading>Article XVII. Confidentiality and Platform Integrity</SectionHeading>
    <p>
      Non-public pricing proposals, audit tools, and proprietary internal SOP templates shared with Business Customers must be
      kept confidential.
    </p>

    <SectionHeading>Article XVIII – XXI. Third-Party Services, Pricing Changes, Governing Law, and General</SectionHeading>
    <p>
      We may update plans, pricing, and these Terms upon notice posted on the Website. If any clause is held unenforceable,
      the remaining provisions remain in full effect. For all contractual inquiries, billing questions, or legal notices,
      contact <strong>Dr. Supritam Basu</strong> at{' '}
      <a href="mailto:supritam.basu@supritamone.com" className="text-black underline font-semibold">
        supritam.basu@supritamone.com
      </a>
      .
    </p>
  </div>
);

const CookiePolicyContent: React.FC = () => (
  <div className="space-y-4">
    <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
      <p className="font-extrabold text-neutral-900 text-sm">
        COOKIE POLICY — Zero Waste Academy (by Dr. Supritam Basu / Supritamone)
      </p>
      <p className="text-[11px] text-neutral-500 mt-1">
        Last updated: November 2026 · Website: https://zerowasteacademy.supritamone.com/
      </p>
    </div>

    <SectionHeading>Definitions and Key Terms</SectionHeading>
    <ul className="list-disc pl-5 space-y-1">
      <li>
        <strong>Cookie:</strong> small amount of data generated by a website and saved by your web browser to identify your
        browser, provide analytics, and remember session details or preferences.
      </li>
      <li>
        <strong>Company:</strong> Zero Waste Academy operated by <strong>Dr. Supritam Basu</strong> (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, or &ldquo;our&rdquo;), responsible for your information under this Cookie Policy.
      </li>
      <li>
        <strong>Personal Data:</strong> any information that directly, indirectly, or in connection with other information
        allows for the identification of a natural person.
      </li>
      <li>
        <strong>Service:</strong> the culinary learning platform, course player, byproduct catalogue, and tools provided by Zero
        Waste Academy.
      </li>
      <li>
        <strong>Website:</strong> Zero Waste Academy&apos;s site, accessible via{' '}
        <span className="font-mono">https://zerowasteacademy.supritamone.com/</span> and related Supritamone domains.
      </li>
    </ul>

    <SectionHeading>Introduction</SectionHeading>
    <p>
      This Cookie Policy explains how Zero Waste Academy and Dr. Supritam Basu use cookies and similar technologies to
      recognize you when you visit <span className="font-mono">https://zerowasteacademy.supritamone.com/</span> and related
      domains/sub-domains (including partner SSO authentication from <span className="font-mono">zerowaste.supritamone.com</span>).
      It explains what these technologies are, why we use them, and your choices for controlling them.
    </p>

    <SectionHeading>What Is a Cookie?</SectionHeading>
    <p>
      A cookie is a small text file stored on your computer or mobile device to identify your browser, keep your session
      authenticated, remember preferences, and improve usability. Cookies cannot run programs or deliver viruses to your
      device.
    </p>

    <SectionHeading>Why Do We Use Cookies?</SectionHeading>
    <ul className="list-disc pl-5 space-y-1">
      <li>To facilitate secure authentication and seamless SSO handoff between Supritamone properties;</li>
      <li>To operate the Zero Waste Academy course player, exam progress, and certificate status cleanly;</li>
      <li>To remember your preferences and make navigation faster across desktop, tablet, and mobile devices;</li>
      <li>To analyze platform performance and improve culinary modules, calculators, and technical support;</li>
      <li>To protect against credential abuse, automated scraping, and unauthorized access.</li>
    </ul>

    <SectionHeading>Types of Cookies We Use</SectionHeading>
    <SubClause title="1. Essential / Strictly Necessary Cookies">
      Strictly necessary for core functionality such as signed session authentication cookies, security verification, trial
      status enforcement, and administrator portal protection. Without these cookies, you would not be able to stay signed in
      or access paid courses.
    </SubClause>
    <SubClause title="2. Performance &amp; Functionality Cookies">
      Used to enhance site speed and functionality — for instance, remembering course chapter progress, audio narration states,
      and layout preferences so you do not need to re-enter details on every visit.
    </SubClause>
    <SubClause title="3. Analytics &amp; Customization Cookies">
      Help us understand aggregate platform usage (such as which modules or calculators chefs use most) so we can continuously
      improve course quality and performance.
    </SubClause>
    <SubClause title="4. Third-Party Cookies">
      Some embedded resources, payment gateways, or external accreditation verification links opened from the platform may set
      their own third-party cookies subject to their respective privacy policies. Zero Waste Academy does not sell user cookie
      data to ad networks.
    </SubClause>

    <SectionHeading>How You Can Manage or Disable Cookies</SectionHeading>
    <p>
      Most browsers allow you to view, manage, and delete cookies through browser settings (Google Chrome, Mozilla Firefox,
      Apple Safari, Microsoft Edge, Opera, and mobile browsers). Please note that blocking strictly necessary cookies or local
      storage may prevent signed-in session persistence and require signing in again on each page load.
    </p>

    <SectionHeading>Changes to This Cookie Policy &amp; Your Consent</SectionHeading>
    <p>
      By using our website, registering an account, or starting a trial/subscription, you consent to this Cookie Policy. We may
      update this policy periodically to reflect platform improvements; continued use constitutes acceptance of the updated
      policy.
    </p>

    <SectionHeading>Contact Us</SectionHeading>
    <p>
      If you have any questions regarding this Cookie Policy, please contact <strong>Dr. Supritam Basu</strong> via email at{' '}
      <a href="mailto:supritam.basu@supritamone.com" className="text-black underline font-semibold">
        supritam.basu@supritamone.com
      </a>
      .
    </p>
  </div>
);

const PrivacyPolicyContent: React.FC = () => (
  <div className="space-y-4">
    <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
      <p className="font-extrabold text-neutral-900 text-sm">
        PRIVACY POLICY — Zero Waste Academy (by Dr. Supritam Basu / Supritamone)
      </p>
      <p className="text-[11px] text-neutral-500 mt-1">
        Last updated: November 2026 · Platforms: https://zerowasteacademy.supritamone.com/ &amp; https://zerowaste.supritamone.com/
      </p>
      <p className="mt-2">
        This Privacy Policy explains how Zero Waste Academy, led by <strong>Dr. Supritam Basu</strong> (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;), collects, uses, discloses, and protects personal data when you visit our Website
        or use our culinary learning platform for both individual chefs (B2C) and hospitality businesses (B2B).
      </p>
    </div>

    <SectionHeading>Article I. Data Controller &amp; Contact Details</SectionHeading>
    <SubClause title="1.1 Data Controller">
      <strong>Dr. Supritam Basu</strong> / Zero Waste Academy (Supritamone) acts as data controller for personal data
      processed through the Services. Privacy requests, data access inquiries, and support questions may be directed to{' '}
      <a href="mailto:supritam.basu@supritamone.com" className="text-black underline font-semibold">
        supritam.basu@supritamone.com
      </a>
      .
    </SubClause>
    <SubClause title="1.2 Scope">
      This Policy covers account registration, partner SSO sign-in from zerowaste.supritamone.com, subscriptions &amp; billing
      verification, course delivery, exam scoring &amp; certificate issuance, security audit logging, and customer support.
    </SubClause>

    <SectionHeading>Article II. Definitions</SectionHeading>
    <p>
      &ldquo;Personal Data&rdquo; means any information relating to an identified or identifiable natural person.
      &ldquo;Processing&rdquo; means collection, storage, use, disclosure, or deletion. &ldquo;B2B User&rdquo; refers to chefs
      accessing via a hospitality organization or multi-seat plan; &ldquo;B2C User&rdquo; refers to individual subscribers.
    </p>

    <SectionHeading>Article III. Categories of Personal Data We Collect</SectionHeading>
    <SubClause title="3.1 Data You Provide Directly">
      (a) Identity &amp; contact details: full name and email address (used for account login and official certificates); (b)
      Professional workplace details: property/kitchen name and culinary designation; (c) Account credentials: securely salted
      and hashed passwords (plaintext passwords are never stored); (d) Support correspondence and culinary Q&amp;A messages.
    </SubClause>
    <SubClause title="3.2 Subscription, Trial &amp; Payment Data">
      We record plan type, trial/subscription start and expiration dates, payment status (paid, unpaid, trial, pending
      approval), and transaction reference IDs. Full card numbers are never stored on Zero Waste Academy servers.
    </SubClause>
    <SubClause title="3.3 Technical, Device &amp; Login Security Data">
      To secure accounts and enforce seat/trial rules, we record IP addresses, browser/device types, login timestamps, login
      counts, and session tokens.
    </SubClause>
    <SubClause title="3.4 Educational &amp; Certification Usage Data">
      We track module completion progress, section exam scores (required ≥ 37% pass threshold), and certificate issuance names.
    </SubClause>

    <SectionHeading>Article IV. Purposes &amp; Legal Bases for Processing</SectionHeading>
    <p>
      We process Personal Data based on: (a) <strong>Contract performance</strong> — to deliver courses, issue certificates, and
      manage your subscription; (b) <strong>Legal obligation</strong> — for tax, billing, and regulatory compliance; (c)
      <strong>Legitimate interests</strong> — to prevent unauthorized credential sharing, secure logins, and improve culinary
      curriculum quality; and (d) <strong>Consent</strong> — for optional communications and non-essential cookies.
    </p>

    <SectionHeading>Article V. B2B &amp; Multi-Seat Administration</SectionHeading>
    <p>
      For hospitality groups on Team Brigade or Executive Advisory plans, account administrators and Dr. Supritam Basu&apos;s
      team may process seat rosters, login activity, and subscription compliance signals to ensure authorized brigade access.
    </p>

    <SectionHeading>Article VI. Cookies and Local Storage</SectionHeading>
    <p>
      We use strictly necessary session cookies and browser storage to keep your signed-in state, remember certificate learner
      names, and save exam progress cleanly. See the Cookie Policy tab for full details.
    </p>

    <SectionHeading>Article VII – VIII. Data Sharing &amp; International Transfers</SectionHeading>
    <p>
      <strong>We never sell your Personal Data.</strong> Limited data may be processed by trusted infrastructure providers
      (cloud hosting, email delivery, and payment processors) under strict confidentiality and security safeguards.
    </p>

    <SectionHeading>Article IX – X. Data Retention &amp; Security Measures</SectionHeading>
    <p>
      Personal Data is retained only as long as your Account remains active or as required for accounting, certification
      verification, and legal compliance. We enforce cryptographic password hashing, HMAC-signed session tokens, HTTPS
      encryption in transit, and role-based Administrator controls.
    </p>

    <SectionHeading>Article XI. Your Privacy Rights</SectionHeading>
    <p>
      Depending on your jurisdiction (including GDPR/UK GDPR), you have the right to request access to your personal data,
      rectification of inaccurate details, deletion (&ldquo;right to be forgotten&rdquo;), restriction of processing, data
      portability, and objection or withdrawal of consent at any time.
    </p>

    <SectionHeading>Article XII – XVI. Children&apos;s Privacy, Third-Party Links &amp; Updates</SectionHeading>
    <p>
      Zero Waste Academy is built for commercial culinary professionals and is not directed to individuals under 16. We do not
      engage in solely automated legal profiling. We may update this Privacy Policy as platform features evolve.
    </p>

    <SectionHeading>Article XVII. Contact for Privacy Requests</SectionHeading>
    <p>
      To exercise any privacy right, request account deletion, or ask privacy questions, please email{' '}
      <strong>Dr. Supritam Basu</strong> directly at{' '}
      <a href="mailto:supritam.basu@supritamone.com" className="text-black underline font-semibold">
        supritam.basu@supritamone.com
      </a>
      .
    </p>
  </div>
);
