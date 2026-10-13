import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Footer from "@/components/layout/Footer.jsx"

/* ------------------------------------------------------------------
   Assets live in /public:
     /paytm-logo.png
     /screenshots/*.webp
   ------------------------------------------------------------------ */
const S = (name) => `/screenshots/${name}.webp`

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.bb-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.04em; }
.bb-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
@keyframes bb-fade { from { opacity: 0; } to { opacity: 1; } }
.bb-fade { animation: bb-fade .3s ease both; }
@keyframes bb-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.bb-rise { animation: bb-rise .7s cubic-bezier(.2,.8,.2,1) both; }
.bb-rise-2 { animation-delay: .08s; }
.bb-rise-3 { animation-delay: .16s; }
.bb-scroll::-webkit-scrollbar { display: none; }
@media (prefers-reduced-motion: reduce) { .bb-fade, .bb-rise { animation: none; } }
`

/* ----------------------------- content ----------------------------- */
const merchantSteps = [
  {
    id: "setup",
    title: "Register your business",
    body: "Sign up with email or Google, then add your business name, address and GSTIN. Your profile shows as a verified merchant once it is live.",
    shots: [
      { src: S("register"), label: "Create account", alt: "Create account screen with Customer and Merchant tabs" },
      { src: S("business"), label: "Business details", alt: "Merchant registration form with business name, address and GST number" },
    ],
  },
  {
    id: "bill",
    title: "Create and send a bill",
    body: "Enter the customer ID, amount and title, then generate the bill. It appears under Send Bill, ready to go to the customer.",
    shots: [
      { src: S("bill-create"), label: "Create bill", alt: "Create Bill form on the merchant dashboard" },
      { src: S("bill-send"), label: "Send bill", alt: "Generated bill summary with a Send Bill button" },
    ],
  },
  {
    id: "track",
    title: "Follow every bill",
    body: "Pending bills can be resent, viewed or deleted. Paid bills open into the full payment record: transaction ID, bank, gateway and timestamp.",
    shots: [
      { src: S("bills-pending"), label: "Pending", alt: "All Bills list showing a pending bill with Resend, View and Delete" },
      { src: S("bills-paid"), label: "Paid", alt: "A paid bill expanded to show payment details" },
    ],
  },
  {
    id: "responses",
    title: "See customer payments",
    body: "When a customer pays, the response lands in your Responses tab with the bill title, customer and payment status.",
    shots: [{ src: S("responses"), label: "Responses", alt: "Customer Responses tab showing a successful payment" }],
  },
  {
    id: "refund",
    title: "Refund from the same bill",
    body: "Confirm the amount once, then follow the refund status on the bill itself, with the refund ID and reference.",
    shots: [
      { src: S("refund-confirm"), label: "Confirm", alt: "Confirm Refund dialog" },
      { src: S("refund-status"), label: "Status", alt: "Refund details with pending status" },
    ],
  },
]

const payFlow = [
  {
    src: S("m-received"),
    alt: "Customer view of received bills with a Pay button",
    title: "Bill lands",
    body: "Customer sees the bill with amount, merchant name and one clear Pay button.",
  },
  {
    src: S("m-paytm"),
    alt: "Paytm checkout with bank selection",
    title: "Paytm handles it",
    body: "Checkout opens on Paytm. Card, net banking or UPI — whatever they prefer.",
    paytm: true,
  },
  {
    src: S("m-receipt"),
    alt: "Payment receipt with transaction details",
    title: "Receipt locked in",
    body: "Order ID, bank ref, gateway and timestamp saved against the exact bill.",
  },
]

const alsoMobile = [
  { src: S("m-login"), alt: "Mobile sign in screen", title: "Username or Google" },
  { src: S("m-google"), alt: "Google sign-in consent screen", title: "One-tap Google consent" },
  { src: S("m-history"), alt: "Bill history with PDF download", title: "History + PDF download" },
]

/* ----------------------------- pieces ----------------------------- */
function PaytmLogo({ className = "h-6" }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className="bb-display inline-flex items-baseline text-xl font-bold leading-none" aria-label="Paytm">
        <span style={{ color: "#002970" }}>pay</span>
        <span style={{ color: "#00B9F5" }}>tm</span>
      </span>
    )
  }
  return <img src="/paytm-logo.png" alt="Paytm" className={className} onError={() => setFailed(true)} />
}

function Screen({ src, alt, fit = "object-cover" }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a] p-4 text-center text-xs text-white/25">
        Missing: {src}
      </div>
    )
  }
  return (
    <img
      key={src}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`bb-fade h-full w-full ${fit} object-top`}
    />
  )
}

function Laptop({ src, alt, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Chassis */}
      <div className="rounded-t-[14px] border border-white/[0.09] bg-[#111111] p-[7px] pb-0 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] bg-black">
          {/* thin top bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex h-5 items-center justify-center bg-[#111]">
            <div className="h-[3px] w-14 rounded-full bg-white/10" />
          </div>
          <div className="absolute inset-0 top-5">
            <Screen src={src} alt={alt} />
          </div>
        </div>
      </div>
      {/* base */}
      <div className="relative mx-[-1%] h-2.5 rounded-b-[10px] bg-[#1a1a1a]">
        <div className="absolute left-1/2 top-0 h-1 w-16 -translate-x-1/2 rounded-b-sm bg-black/80" />
      </div>
    </div>
  )
}

function Phone({ src, alt, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="rounded-[22px] border border-white/[0.12] bg-[#161616] p-[4px] shadow-[0_18px_40px_-10px_rgba(0,0,0,0.9)]">
        <div className="relative aspect-[9/19.4] overflow-hidden rounded-[18px] bg-black">
          {/* island */}
          <div className="absolute left-1/2 top-2.5 z-20 h-4 w-[26%] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />
          <Screen src={src} alt={alt} />
          {/* home bar */}
          <div className="absolute bottom-1.5 left-1/2 h-[3px] w-[28%] -translate-x-1/2 rounded-full bg-white/25" />
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- tour ----------------------------- */
function MerchantTour() {
  const [step, setStep] = useState(0)
  const [shot, setShot] = useState(0)
  const current = merchantSteps[step]
  const currentShot = current.shots[shot] ?? current.shots[0]

  const pick = (i) => {
    setStep(i)
    setShot(0)
  }

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
      {/* left rail */}
      <div
        role="tablist"
        aria-label="Merchant workflow"
        className="bb-scroll -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
      >
        {merchantSteps.map((s, i) => {
          const active = i === step
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={active}
              onClick={() => pick(i)}
              className={`shrink-0 rounded-lg px-4 py-3 text-left transition-colors lg:rounded-none lg:border-l-2 lg:px-5 lg:py-4 ${
                active
                  ? "bg-white/[0.05] lg:border-l-[#ff5c35] lg:bg-transparent"
                  : "lg:border-l-transparent hover:bg-white/[0.03]"
              }`}
            >
              <span className={`bb-display block text-[15px] font-semibold ${active ? "text-white" : "text-white/40"}`}>
                {s.title}
              </span>
              {active && (
                <p className="mt-1.5 hidden max-w-[220px] text-[13px] leading-5 text-white/45 lg:block">
                  {s.body}
                </p>
              )}
            </button>
          )
        })}
      </div>

      {/* screen */}
      <div>
        <Laptop src={currentShot.src} alt={currentShot.alt} className="w-full" />
        <p className="mt-5 text-sm leading-6 text-white/45 lg:hidden">{current.body}</p>

        {current.shots.length > 1 && (
          <div className="mt-5 flex gap-2" role="group" aria-label="Screens for this step">
            {current.shots.map((s, i) => (
              <button
                key={s.src}
                onClick={() => setShot(i)}
                aria-pressed={i === shot}
                className={`rounded-md border px-3.5 py-1 text-xs font-medium transition-colors ${
                  i === shot
                    ? "border-[#ff5c35]/50 bg-[#ff5c35]/10 text-[#ff8a6a]"
                    : "border-white/10 text-white/40 hover:text-white/70"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ----------------------------- page ----------------------------- */
export default function Landing() {
  return (
    <div
      className="bb-body min-h-screen overflow-x-hidden text-white/70"
      style={{ background: "#080808" }}
    >
      <style>{FONT_CSS}</style>

      <main>
        {/* ---------------- HERO ---------------- */}
        <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-28">
          <div className="grid items-end gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
            <div className="max-w-lg">
              <div className="bb-rise mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-3 pr-1 text-[12px] text-white/55">
                Powered by
                <span className="rounded-full bg-white px-2.5 py-0.5">
                  <PaytmLogo className="h-3.5" />
                </span>
              </div>

              <h1 className="bb-display bb-rise bb-rise-2 text-[2.6rem] font-bold leading-[1.05] text-white sm:text-[3.4rem]">
                Bill customers.
                <br />
                Get paid{" "}
                <span className="text-[#ff5c35]">today.</span>
              </h1>

              <p className="bb-rise bb-rise-3 mt-5 text-[15px] leading-7 text-white/50">
                Create GST-ready bills, send them in one click, collect through Paytm.
                Payments and refunds stay attached to the bill they belong to.
              </p>

              <div className="bb-rise bb-rise-3 mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-lg bg-[#ff5c35] px-6 text-sm font-semibold text-white hover:bg-[#ff6f4d]"
                >
                  <Link to="/signup">Create free account</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-lg border-white/15 bg-transparent px-6 text-sm font-medium text-white/80 hover:bg-white/[0.05] hover:text-white"
                >
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </div>

            {/* devices – asymmetric placement */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <Laptop src={S("bill-create")} alt="Merchant dashboard" className="w-[92%] ml-auto" />
              <div className="absolute -bottom-6 left-0 w-[38%] max-w-[160px] sm:-bottom-10 sm:left-2 sm:max-w-[180px]">
                <Phone src={S("m-received")} alt="Customer bill view" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- MERCHANT TOUR ---------------- */}
        <section className="border-t border-white/[0.07]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-28">
            <div className="max-w-xl">
              <h2 className="bb-display text-[1.9rem] font-bold leading-tight text-white sm:text-[2.4rem]">
                Merchant side — sign-up to refund
              </h2>
              <p className="mt-3 text-sm text-white/45">
                Click any step to see the live screen.
              </p>
            </div>
            <MerchantTour />
          </div>
        </section>

        {/* ---------------- CUSTOMER FLOW ---------------- */}
        <section className="border-t border-white/[0.07] bg-[#0c0c0c]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-28">
            <div className="max-w-xl">
              <h2 className="bb-display text-[1.9rem] font-bold leading-tight text-white sm:text-[2.4rem]">
                Customer pays in three taps
              </h2>
              <p className="mt-3 text-sm text-white/45">
                Works in any phone browser. No app required.
              </p>
            </div>

            <ol className="mt-14 grid gap-14 sm:grid-cols-3 sm:gap-8">
              {payFlow.map((p, i) => (
                <li key={p.title} className="flex flex-col items-center text-center">
                  <Phone src={p.src} alt={p.alt} className="w-[58%] max-w-[200px]" />
                  <div className="mt-6 flex items-center gap-2">
                    <span className="bb-display flex h-6 w-6 items-center justify-center rounded-full bg-[#ff5c35]/15 text-[11px] font-bold text-[#ff8a6a]">
                      {i + 1}
                    </span>
                    <h3 className="bb-display text-base font-semibold text-white">{p.title}</h3>
                  </div>
                  <p className="mt-2 max-w-[200px] text-[13px] leading-5 text-white/45">{p.body}</p>
                  {p.paytm && (
                    <span className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1">
                      <PaytmLogo className="h-3.5" />
                    </span>
                  )}
                </li>
              ))}
            </ol>

            <div className="mt-20 border-t border-white/[0.07] pt-14">
              <h3 className="bb-display text-lg font-semibold text-white">Also on mobile</h3>
              <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-10">
                {alsoMobile.map((m) => (
                  <figure key={m.title} className="flex flex-col items-center text-center">
                    <Phone src={m.src} alt={m.alt} className="w-full max-w-[170px]" />
                    <figcaption className="mt-4 text-[12px] text-white/40">{m.title}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-white/[0.08] bg-[#111] px-7 py-10 sm:flex-row sm:items-center sm:px-10 sm:py-12">
            <div>
              <div className="mb-5 inline-flex rounded-full bg-white px-3.5 py-1.5">
                <PaytmLogo className="h-4.5" />
              </div>
              <h2 className="bb-display text-[1.7rem] font-bold leading-tight text-white sm:text-3xl">
                Send the first bill today.
              </h2>
              <p className="mt-2 max-w-sm text-sm text-white/45">
                Register, add GSTIN, and let customers pay through Paytm.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-11 shrink-0 rounded-lg bg-white px-7 text-sm font-semibold text-black hover:bg-white/90"
            >
              <Link to="/signup">Create free account</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}