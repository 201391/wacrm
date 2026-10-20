'use client'

import React from 'react'
import {
  ShieldCheck,
  Calendar,
  Lock,
  UserCheck,
  CreditCard,
  Globe,
  Share2,
  Cookie,
  Database,
  CheckCircle2,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  FileText,
  Printer,
  ChevronRight,
} from 'lucide-react'

export function PrivacyPolicyContent({ showPrintButton = true }: { showPrintButton?: boolean }) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="text-slate-800 text-sm space-y-6 leading-relaxed">
      {/* Policy Meta Header */}
      <div className="bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0b7b3e] text-white flex items-center justify-center shadow-md shadow-emerald-900/10 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Privacy Policy
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Official Policy
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Effective Date: <strong>20 Oct 2026</strong></span>
              </p>
            </div>
          </div>

          {showPrintButton && (
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Policy</span>
            </button>
          )}
        </div>

        {/* Welcome Statement */}
        <div className="mt-4 pt-4 border-t border-emerald-100/80 text-xs sm:text-sm text-slate-700 space-y-2">
          <p>
            Welcome to <strong>Jatrra</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit our website{' '}
            <a
              href="https://jatrra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
            >
              https://jatrra.com
            </a>{' '}
            and book our tour packages, pilgrimage services, or travel arrangements (collectively, the &ldquo;Services&rdquo;).
          </p>
          <p className="font-medium text-slate-800 bg-white/70 p-2.5 rounded-lg border border-emerald-100">
            By accessing our website and using our Services, you consent to the data practices described in this policy.
          </p>
        </div>
      </div>

      {/* Quick Nav anchor pills */}
      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
        <span className="text-slate-400 font-semibold px-1 py-0.5">Quick Jump:</span>
        <a href="#section-1" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">1. Information We Collect</a>
        <a href="#section-2" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">2. How We Use Info</a>
        <a href="#section-3" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">3. Sharing & Disclosure</a>
        <a href="#section-4" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">4. Cookies</a>
        <a href="#section-5" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">5. Data Security</a>
        <a href="#section-6" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">6. Retention</a>
        <a href="#section-7" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">7. Your Rights</a>
        <a href="#section-8" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">8. Policy Changes</a>
        <a href="#section-9" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">9. Grievance Officer</a>
      </div>

      {/* 1. Information We Collect */}
      <section id="section-1" className="scroll-mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Information We Collect
          </h2>
        </div>
        <p className="mt-3 text-slate-600 text-xs sm:text-sm">
          We collect information directly from you when you register, book a tour, request a quote, or communicate with our support team.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5 text-slate-900 font-semibold text-xs sm:text-sm">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>Identity &amp; Contact Details</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full name, gender, date of birth, age, mobile phone number, email address, billing address, and government-issued identification details (such as Aadhaar, Voter ID, or Passport details when required for hotel bookings, permits, or travel ticketing).
            </p>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5 text-slate-900 font-semibold text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Booking &amp; Travel Details</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Travel dates, pickup/drop points, passenger lists, emergency contacts, special dietary or mobility requests, and pilgrimage-specific requirements.
            </p>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5 text-slate-900 font-semibold text-xs sm:text-sm">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Payment Information</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transaction IDs, payment mode, and billing records.{' '}
              <span className="font-semibold text-slate-700">
                (Note: We do not store full credit card numbers or UPI PINs. All online payments are handled securely through third-party payment gateways).
              </span>
            </p>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5 text-slate-900 font-semibold text-xs sm:text-sm">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Technical &amp; Usage Data</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              IP address, browser type, device information, operating system, pages viewed, and referral URLs collected automatically via cookies and web analytics.
            </p>
          </div>
        </div>
      </section>

      {/* 2. How We Use Your Information */}
      <section id="section-2" className="scroll-mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h2 className="text-base font-bold text-slate-900">
            How We Use Your Information
          </h2>
        </div>
        <p className="mt-3 text-slate-600 text-xs sm:text-sm">
          We process your personal information for specific operational and service-delivery purposes:
        </p>

        <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0b7b3e] shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Fulfilling Bookings:</strong>{' '}
              <span className="text-slate-600">
                Reserving transport (buses, trains, flights, cabs), securing hotel accommodations, arranging temple entry passes/darshan slots, and purchasing travel insurance.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0b7b3e] shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Customer Communication:</strong>{' '}
              <span className="text-slate-600">
                Sending booking confirmations, itinerary updates, payment receipts, boarding alerts, and emergency notifications.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0b7b3e] shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Support &amp; Inquiries:</strong>{' '}
              <span className="text-slate-600">
                Answering your customer service requests and resolving operational issues during your trip.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0b7b3e] shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Marketing &amp; Updates:</strong>{' '}
              <span className="text-slate-600">
                Sending promotional offers, new tour announcements, and festive discounts (only if you have opted in, with an easy option to unsubscribe anytime).
              </span>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0b7b3e] shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Legal Compliance:</strong>{' '}
              <span className="text-slate-600">
                Complying with regulatory obligations, tax requirements, and verifying passenger identities as mandated by local authorities.
              </span>
            </div>
          </li>
        </ul>
      </section>

      {/* 3. Sharing and Disclosure of Information */}
      <section id="section-3" className="scroll-mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Sharing and Disclosure of Information
          </h2>
        </div>

        <div className="mt-3.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            We do not sell, rent, or trade your personal data to third parties. We only share necessary details with trusted partners essential to providing your travel experience:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>Travel Service Providers</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              Hotels, transport operators, local tour guides, and temple/shrine management authorities who require traveler lists to confirm arrangements.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Payment Gateways &amp; Financial Partners</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              Authorized third-party processors to handle secure payments and process refunds.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>Technology &amp; Communication Partners</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              SMS, email, and automated messaging platforms (e.g., WhatsApp business tools) used solely to send itinerary and service updates.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Legal Authorities</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              When required by applicable law, court order, or governmental regulations to protect legal rights, passenger safety, or investigate fraud.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Cookies and Tracking Technologies */}
      <section id="section-4" className="scroll-mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Cookies and Tracking Technologies
          </h2>
        </div>
        <div className="mt-3.5 flex items-start gap-3">
          <Cookie className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Our website uses cookies and similar tracking technologies to enhance user experience, remember your preferences, and analyze website traffic. You can choose to disable cookies through your browser settings, though some features of our website may not function properly as a result.
          </p>
        </div>
      </section>

      {/* 5. Data Security */}
      <section id="section-5" className="scroll-mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            5
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Data Security
          </h2>
        </div>
        <div className="mt-3.5 flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            We implement technical, administrative, and physical security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. While we strive to protect your personal data, no internet transmission is 100% secure, and we cannot guarantee absolute security.
          </p>
        </div>
      </section>

      {/* 6. Data Retention */}
      <section id="section-6" className="scroll-mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            6
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Data Retention
          </h2>
        </div>
        <div className="mt-3.5 flex items-start gap-3">
          <Database className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, complete past travel records, resolve disputes, and satisfy legal or tax compliance requirements. Once no longer required, data is securely deleted or anonymized.
          </p>
        </div>
      </section>

      {/* 7. Your Rights */}
      <section id="section-7" className="scroll-mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            7
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Your Rights
          </h2>
        </div>
        <p className="mt-3 text-slate-600 text-xs sm:text-sm">
          Depending on applicable privacy regulations, you have the right to:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
            <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Access and review the personal information we hold about you.</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
            <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Request corrections to inaccurate or incomplete information.</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
            <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Request deletion of your personal details (subject to active bookings or legal record-keeping obligations).</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
            <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Opt out of marketing emails, newsletters, or promotional messages at any time.</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500 italic">
          To exercise any of these rights, contact our Grievance Officer using the details below.
        </p>
      </section>

      {/* 8. Changes to This Privacy Policy */}
      <section id="section-8" className="scroll-mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            8
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Changes to This Privacy Policy
          </h2>
        </div>
        <div className="mt-3.5 flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            We may update this Privacy Policy periodically to reflect changes in our operational practices or legal requirements. Any modifications will be posted directly on this page with an updated &ldquo;Last Updated&rdquo; date. Continued use of our Services after changes are posted constitutes acceptance of the revised policy.
          </p>
        </div>
      </section>

      {/* 9. Contact Us & Grievance Redressal */}
      <section id="section-9" className="scroll-mt-6 bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-800/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
            9
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Contact Us &amp; Grievance Redressal
            </h2>
            <p className="text-xs text-emerald-200">
              Direct point of contact for data questions, requests, or privacy concerns
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-emerald-100">
          If you have any questions, concerns, or grievances regarding this Privacy Policy or our handling of your data, please contact:
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
            <div className="text-emerald-300 font-semibold mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Business Entity</span>
            </div>
            <p className="text-sm font-bold text-white">Jatrra E Commerce</p>
            <div className="mt-2 text-emerald-300 font-semibold mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Grievance / Privacy Officer</span>
            </div>
            <p className="text-sm font-bold text-white">Dheeraj Gour</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15 space-y-2">
            <div>
              <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>Email Address</span>
              </span>
              <a
                href="mailto:Gourdhiraj71@gmail.com"
                className="text-white hover:text-emerald-300 font-medium underline underline-offset-2 break-all"
              >
                Gourdhiraj71@gmail.com
              </a>
            </div>

            <div>
              <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>Phone / WhatsApp</span>
              </span>
              <a
                href="https://wa.me/919763765259?text=Hello%20Jatrra%20Privacy%20Officer%2C%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-emerald-300 font-medium underline underline-offset-2"
              >
                +91 9763765259
              </a>
            </div>

            <div>
              <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Office Address</span>
              </span>
              <p className="text-emerald-100 font-medium">
                Janta Colony, Mandi, Sehore, Madhyapradesh
              </p>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="mt-4 pt-3 border-t border-emerald-800/80 flex flex-wrap gap-2.5">
          <a
            href="https://wa.me/919763765259?text=Hello%20Dheeraj%20ji%2C%20I%20have%20a%20question%20regarding%20Jatrra%20Privacy%20Policy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp (+91 9763765259)</span>
          </a>
          <a
            href="mailto:Gourdhiraj71@gmail.com?subject=Privacy%20Policy%20Inquiry%20-%20Jatrra"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </a>
        </div>
      </section>
    </div>
  )
}
