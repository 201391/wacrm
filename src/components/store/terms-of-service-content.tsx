'use client'

import React from 'react'
import {
  FileText,
  Calendar,
  Truck,
  MapPin,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Building2,
  UserCheck,
  Mail,
  Phone,
  MessageSquare,
  Printer,
  Scale,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Package,
} from 'lucide-react'

export function TermsOfServiceContent({ showPrintButton = true }: { showPrintButton?: boolean }) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="text-slate-800 text-sm space-y-6 leading-relaxed">
      {/* Meta Header */}
      <div className="bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0b7b3e] text-white flex items-center justify-center shadow-md shadow-emerald-900/10 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Terms of Service &amp; User Agreement
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Legal Agreement
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Effective Date: <strong>26-10-2026</strong></span>
                </p>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Last Revised: <strong>26-10-2026</strong></span>
                </p>
              </div>
            </div>
          </div>

          {showPrintButton && (
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Terms</span>
            </button>
          )}
        </div>

        {/* Preamble / Introduction */}
        <div className="mt-4 pt-4 border-t border-emerald-100/80 text-xs sm:text-sm text-slate-700 space-y-2.5">
          <p>
            This Terms of Service &amp; User Agreement (<strong>&ldquo;Agreement&rdquo;</strong>) forms a legally binding contract between <strong>Jatrra</strong> (operated under <strong>Jatrra E Commerce</strong>, hereinafter referred to as <strong>&ldquo;Jatrra&rdquo;</strong>, <strong>&ldquo;Company&rdquo;</strong>, <strong>&ldquo;we&rdquo;</strong>, <strong>&ldquo;our&rdquo;</strong>, or <strong>&ldquo;us&rdquo;</strong>) and you (<strong>&ldquo;Customer&rdquo;</strong>, <strong>&ldquo;User&rdquo;</strong>, <strong>&ldquo;you&rdquo;</strong>).
          </p>
          <p>
            This Agreement governs your access to and use of our digital platforms, including our website located at{' '}
            <a
              href="https://jatrra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
            >
              https://jatrra.com
            </a>
            , mobile application, WhatsApp/assisted ordering lines, and last-mile logistics network dedicated to delivering consumer products, agri-inputs, household goods, and essentials to rural areas, villages, and semi-urban communities.
          </p>
          <p className="font-medium text-slate-800 bg-white/70 p-2.5 rounded-lg border border-emerald-100">
            By accessing our platform, placing an order, or utilizing our assisted booking channels, you agree to be bound by all provisions of this Agreement.
          </p>
        </div>
      </div>

      {/* Quick Jump Links */}
      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
        <span className="text-slate-400 font-semibold px-1 py-0.5">Quick Jump:</span>
        <a href="#tos-1" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">1. Platform &amp; Services</a>
        <a href="#tos-2" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">2. Accounts &amp; Address</a>
        <a href="#tos-3" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">3. Orders &amp; Pricing</a>
        <a href="#tos-4" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">4. Payment &amp; COD</a>
        <a href="#tos-5" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">5. Rural Logistics</a>
        <a href="#tos-6" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">6. Returns &amp; Refunds</a>
        <a href="#tos-7" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">7. Intellectual Property</a>
        <a href="#tos-8" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">8. Prohibited Conduct</a>
        <a href="#tos-9" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">9. Liability &amp; Disclaimers</a>
        <a href="#tos-10" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">10. Governing Law</a>
        <a href="#tos-11" className="bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:text-emerald-700 hover:border-emerald-300 transition">11. Grievance Redressal</a>
      </div>

      {/* Section 1 */}
      <section id="tos-1" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            1
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Platform Structure and Service Model
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-1">Operational Scope</h3>
            <p>
              Jatrra facilitates the retail sale, order processing, and rural distribution of goods directly to consumers residing in mapped rural pin codes, village clusters, and peri-urban hubs.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-1">Order Channels</h3>
            <p>
              Orders may be accepted via our website, smartphone app, or through designated assisted-booking partners, village touchpoint associates, and authorized phone/WhatsApp order desks. Regardless of the channel used, all transactions remain bound by these Terms.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-1">Communication Authorization</h3>
            <p>
              By providing your mobile number during checkout or sign-up, you expressly consent to receive operational transactional notifications, order confirmations, dispatch updates, and delivery alerts via SMS, automated voice calls, and messaging platforms such as WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section id="tos-2" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            2
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            User Accounts and Verification
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            <strong>Registration:</strong> Customers may browse the catalog freely, but completing a transaction requires the creation of an account or supplying an active, reachable mobile number for one-time password (OTP) verification.
          </p>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Rural Address Integrity Requirements</span>
            </div>
            <p className="text-xs text-slate-600">
              Standard urban addressing models often do not apply in rural settlements. You are solely responsible for furnishing accurate address descriptors, including:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
              <li className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                <span>Full legal name of the consignee.</span>
              </li>
              <li className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                <span>Secondary contact number (recommended for remote deliveries).</span>
              </li>
              <li className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-emerald-100 sm:col-span-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                <span>
                  Village name, Gram Panchayat, Ward/Mohalla details, and primary landmark (e.g., Temple, Government School, Panchayat Bhavan, Community Center, or Mobile Tower).
                </span>
              </li>
              <li className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-emerald-100 sm:col-span-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                <span>Correct postal pincode and nearest Tehsil/Block.</span>
              </li>
            </ul>
          </div>

          <p>
            <strong>Account Security:</strong> You are responsible for preserving the confidentiality of any access credentials and OTPs associated with your account. Jatrra is not liable for unauthorized purchases executed via compromised OTP access on your mobile device.
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section id="tos-3" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            3
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Orders, Pricing, and Billing
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            <strong>Offer and Acceptance:</strong> Placement of an order represents your offer to purchase. An order is confirmed and deemed accepted only when Jatrra dispatches the parcel or issues an electronic shipping confirmation with a system-generated Tracking/Order ID.
          </p>
          <p>
            <strong>Price Inclusivity:</strong> All displayed prices on the portal are quoted in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST) unless explicitly itemized otherwise at final checkout.
          </p>
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm">
            <span className="font-bold">Pricing Errors: </span>
            While we make every attempt to ensure accurate pricing, typographical errors or technical glitches may occasionally display an erroneous price. In such cases, Jatrra retains the unilateral right to cancel the order prior to dispatch, notifying you promptly and issuing a complete refund if payment was debited.
          </div>
          <p>
            <strong>Order Limits:</strong> Jatrra reserves the right to cap maximum purchase quantities on specific commodities or promotional items per customer, household, or village delivery run to maintain fair access across rural markets.
          </p>
        </div>
      </section>

      {/* Section 4 */}
      <section id="tos-4" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            4
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Modes of Payment and Cash on Delivery (COD)
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <CreditCard className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Prepaid Transactions</p>
              <p className="text-slate-600 mt-0.5">
                We facilitate digital payments via secure third-party payment gateways, supporting Unified Payments Interface (UPI), RuPay, Visa, MasterCard, and direct Net Banking.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
            <p className="font-bold text-slate-900 text-xs sm:text-sm">
              Cash on Delivery (COD) Policy
            </p>
            <p className="text-xs text-slate-600">
              To support financial accessibility in non-metro regions, COD is offered subject to localized feasibility:
            </p>

            <ul className="space-y-2 text-xs">
              <li className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">Order Validation: </span>
                Jatrra reserves the right to place a pre-dispatch confirmation call or require an SMS confirmation before releasing COD consignments.
              </li>
              <li className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">Exact Payment &amp; Open-Box: </span>
                Customers must pay the entire invoice value to the delivery agent before the parcel seal is opened. Open-box delivery is only permitted where explicitly authorized in writing by Jatrra.
              </li>
              <li className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-900">
                <span className="font-bold text-rose-950">Fair-Use Policy: </span>
                Repeated rejection of COD orders at the doorstep, refusal of calls from delivery field staff, or repeated unavailability without valid cause will result in the immediate and permanent revocation of COD privileges on the associated account and mobile number.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section id="tos-5" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            5
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Rural Logistics, Transit, and Delivery Framework
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            <strong>Fulfillment Logistics:</strong> Due to diverse rural topographies, unpaved village roads, seasonal flooding, and fragmented transport infrastructure, delivery intervals provided during checkout are approximate estimates rather than guaranteed deadlines.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm mb-1">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Standard Doorstep Delivery</span>
              </div>
              <p className="text-xs text-slate-600">
                Parcels will be delivered directly to the customer’s residence where roadways permit motorable vehicular access.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm mb-1">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Central Hub / Drop Points</span>
              </div>
              <p className="text-xs text-slate-600">
                In hilly tracts, interior hamlets, or areas where narrow lanes prevent vehicle entry, the delivery representative will arrange an agreed-upon handover point at a central landmark (e.g., local market square, main road junction, or affiliated village retail counter).
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-900">
            <span className="font-bold">Delivery Reattempts: </span>
            Our delivery personnel will make up to two (2) attempts to deliver the parcel. If contact cannot be established after reasonable notification, the order will be marked as &ldquo;Failed Delivery&rdquo; and returned to the fulfillment warehouse.
          </div>
        </div>
      </section>

      {/* Section 6 */}
      <section id="tos-6" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            6
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Return, Replacement, and Inspection Standards
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            <strong>Inspection upon Arrival:</strong> Customers are advised to examine external packaging for visible physical damage, tampering, or broken seals before signing for or accepting receipt. If the outer carton is severely compromised, you should refuse delivery and report the matter immediately.
          </p>

          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs sm:text-sm">
              <RotateCcw className="w-4 h-4 text-[#0b7b3e]" />
              <span>Return Window:</span>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
              Within 5 calendar days of physical delivery
            </span>
            <p className="w-full text-xs text-emerald-700 mt-1">
              Requests for returns or replacements must be raised within 5 calendar days of physical delivery through our customer care channel or portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Eligible Conditions</span>
              </p>
              <ul className="space-y-1 list-disc pl-4 text-slate-600">
                <li>Dead-on-Arrival (DOA) or functionally inoperative electronics/appliances.</li>
                <li>Damaged, cracked, leaked, or soiled products.</li>
                <li>Receipt of an incorrect SKU, variant, size, or expired consumer packaged good.</li>
              </ul>
            </div>

            <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1.5 text-rose-950">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                <span>Non-Returnable Exclusions</span>
              </p>
              <p className="text-rose-900">
                Agricultural consumables once opened (e.g., seeds, fertilizers, feeds), inner garments, hygiene supplies, customized goods, and perishables cannot be returned unless delivered in an already damaged or defective state.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-0.5">Reverse Logistics in Rural Areas</h3>
            <p>
              Where reverse courier services are not available directly at a village doorstep, Jatrra will direct the customer to hand over the securely repackaged product at the nearest designated village pickup agent or common service center.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-0.5">Refund Settlement</h3>
            <p>
              Refunds are initiated following technical inspection and verification at our warehouse. Digital payments are refunded to the original payment source within 5 to 7 business days; COD refunds are processed via UPI transfer or direct bank NEFT upon submission of verified account details.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7 */}
      <section id="tos-7" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            7
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Intellectual Property Rights
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          All trademarks, visual assets, software code, graphic elements, text descriptions, and page architectures on Jatrra platforms are the sole property of the Company or its authorized content suppliers. No license, express or implied, is granted to scrape, mirror, redistribute, or commercially exploit any material without prior written authorization.
        </p>
      </section>

      {/* Section 8 */}
      <section id="tos-8" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
            8
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Prohibited Conduct and Fraud Prevention
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          Users agree not to:
        </p>

        <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-rose-600 font-bold">✕</span>
            <span>Place malicious, dummy, or speculative bulk orders intended to disrupt village supply chains.</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-rose-600 font-bold">✕</span>
            <span>Misrepresent identities or provide fictitious village landmarks to evade delivery partners.</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-rose-600 font-bold">✕</span>
            <span>Harass, verbally abuse, threaten, or obstruct field delivery agents, logistics personnel, or support team members.</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-rose-600 font-bold">✕</span>
            <span>Introduce malicious computer code, bots, or unauthorized automated systems into our web infrastructure.</span>
          </li>
        </ul>

        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
          Any verified breach may lead to immediate termination of platform access, reporting to relevant cybercrime authorities, and initiation of appropriate legal proceedings.
        </div>
      </section>

      {/* Section 9 */}
      <section id="tos-9" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            9
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Limitation of Liability and Disclaimers
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            <strong>As-Is Service:</strong> The platform and its contents are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without express or implied warranties beyond those provided by manufacturers of original equipment.
          </p>
          <p>
            <strong>Third-Party Manufacturers:</strong> Jatrra is a distribution and fulfillment platform for third-party manufactured brands. Inherent product defects or performance complaints outside the immediate return window must be routed through the manufacturer’s warranty framework.
          </p>
          <p>
            <strong>Force Majeure:</strong> Jatrra shall not be held accountable or liable for non-fulfillment or dispatch delays resulting from natural calamities (monsoon flooding, severe storms, landslides), village bandhs, public health emergencies, infrastructure breakdowns, or unexpected governmental transportation bans.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
            <strong>Financial Cap:</strong> To the maximum extent permitted by applicable Indian laws, Jatrra’s aggregate liability for all claims related to an order is strictly capped at the net amount paid by the customer for the disputed product.
          </div>
        </div>
      </section>

      {/* Section 10 */}
      <section id="tos-10" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            10
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Governing Law, Jurisdiction, and Dispute Resolution
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          This Agreement is governed by and construed in conformity with the substantive laws of India. Any dispute, controversy, or claim arising out of or relating to your use of Jatrra’s platform or purchases shall fall within the exclusive jurisdiction of the competent courts of <strong>Sehore / Bhopal, Madhya Pradesh</strong>.
        </p>
      </section>

      {/* Section 11 - Grievance Officer */}
      <section id="tos-11" className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 rounded-2xl shadow-md space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-800/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
            11
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Grievance Redressal and Regulatory Compliance
            </h2>
            <p className="text-xs text-emerald-200">
              In compliance with the Consumer Protection (E-Commerce) Rules, 2020 and the Information Technology Act, 2000
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-emerald-100">
          Consumer complaints, compliance queries, or notices under the Consumer Protection (E-Commerce) Rules, 2020 should be directed to our appointed officer:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15 space-y-2">
            <div>
              <div className="text-emerald-300 font-semibold mb-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Company Name</span>
              </div>
              <p className="text-sm font-bold text-white">Jatrra E Commerce</p>
            </div>

            <div>
              <div className="text-emerald-300 font-semibold mb-0.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Grievance Redressal Officer</span>
              </div>
              <p className="text-sm font-bold text-white">Dheeraj Gour</p>
              <p className="text-xs text-emerald-200">Customer Experience &amp; Compliance Head</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15 space-y-2">
            <div>
              <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>Helpline / WhatsApp Desk</span>
              </span>
              <a
                href="https://wa.me/919763765259?text=Hello%20Jatrra%20Compliance%20Desk%2C%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-emerald-300 font-medium underline underline-offset-2"
              >
                +91 9763765259
              </a>
            </div>

            <div>
              <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>Official Email</span>
              </span>
              <div className="flex flex-col gap-0.5 mt-0.5">
                <a
                  href="mailto:Gourdhiraj@jatrra.com"
                  className="text-white hover:text-emerald-300 font-medium underline underline-offset-2 break-all"
                >
                  Gourdhiraj@jatrra.com
                </a>
                <a
                  href="mailto:support@jatrra.com"
                  className="text-white hover:text-emerald-300 font-medium underline underline-offset-2 break-all"
                >
                  support@jatrra.com
                </a>
              </div>
            </div>

            <div>
              <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Registered Corporate Address</span>
              </span>
              <p className="text-emerald-100 font-medium">
                Indira colony, mandi, sehore m.p
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-emerald-800/80 flex flex-wrap gap-2.5">
          <a
            href="https://wa.me/919763765259?text=Hello%20Jatrra%20Team%2C%20I%20have%20a%20question%20about%20the%20Terms%20of%20Service"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp (+91 9763765259)</span>
          </a>
          <a
            href="mailto:support@jatrra.com?subject=Terms%20of%20Service%20Inquiry%20-%20Jatrra"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Support</span>
          </a>
        </div>
      </section>
    </div>
  )
}
