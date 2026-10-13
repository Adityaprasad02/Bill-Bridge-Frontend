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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
.bb-display { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.035em; }
.bb-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
@keyframes bb-fade { from { opacity: 0; transform: scale(.985); } to { opacity: 1; transform: none; } }
.bb-fade { animation: bb-fade .4s cubic-bezier(.16,1,.3,1) both; }
@keyframes bb-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
.bb-rise { animation: bb-rise .85s cubic-bezier(.16,1,.3,1) both; }
.bb-rise-2 { animation-delay: .1s; }
.bb-rise-3 { animation-delay: .2s; }
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
    title: "The bill arrives",
    body: "Customers see every bill sent to them, with the merchant, amount and a single Pay button.",
  },
  {
    src: S("m-paytm"),
    alt: "Paytm checkout with bank selection",
    title: "Paytm takes the payment",
    body: "Checkout opens on Paytm. Pick a card, net banking or another option and pay securely.",
    paytm: true,
  },
  {
    src: S("m-receipt"),
    alt: "Payment receipt with transaction details",
    title: "The receipt is instant",
    body: "Order ID, bank transaction ID, gateway, date and status are saved against the bill.",
  },
]

const alsoMobile = [
  { src: S("m-login"), alt: "Mobile sign in screen", title: "Username or Google sign-in" },
  { src: S("m-google"), alt: "Google sign-in consent screen", title: "Google consent in one step" },
  { src: S("m-history"), alt: "Bill history with PDF download", title: "Bill history and PDF copies" },
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
      <div className="flex h-full w-full items-center justify-center bg-[#090d16] p-4 text-center text-xs text-white/30">
        Missing image: {src}
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
      {/* Outer ambient glow */}
      <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-blue-600/20 via-indigo-600/10 to-cyan-400/10 blur-3xl" />

      {/* Modern MacBook Pro style Chassis */}
      <div className="relative rounded-t-2xl border border-white/15 bg-[#121826] p-2 sm:p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)]">
        {/* Screen Bezel */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#060911] shadow-inner">
          <div className="absolute left-1/2 top-2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-white/20 ring-1 ring-white/10" />
            <div className="h-[3px] w-12 rounded-full bg-white/10" />
          </div>
          <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.08]" />
          <Screen src={src} alt={alt} fit="object-cover" />
        </div>
      </div>

      {/* Sleek Machined Aluminum Base / Keyboard Deck */}
      <div className="relative mx-auto h-4 w-full rounded-b-2xl bg-gradient-to-b from-[#1a2234] via-[#101522] to-[#080b14] shadow-2xl sm:h-5">
        <div className="absolute inset-x-[20%] top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
        <div className="absolute left-1/2 top-0 h-2 w-32 -translate-x-1/2 rounded-b-lg bg-black/60 sm:w-44" />
        <div className="absolute bottom-1 left-1/2 h-[2px] w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </div>
    </div>
  )
}

function Phone({ src, alt, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Soft outer glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-gradient-to-b from-blue-500/20 via-cyan-500/10 to-transparent blur-2xl" />

      {/* Frame */}
      <div className="relative rounded-[2.5rem] border border-white/20 bg-[#161d2f] p-[6px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)]">
        {/* Inner bezel */}
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.2rem] bg-black shadow-inner">
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-3 z-20 h-[1.1rem] w-[26%] -translate-x-1/2 rounded-full bg-black shadow-[0_0_0_1.5px_rgba(255,255,255,0.12)]" />
          {/* Side buttons */}
          <div className="absolute -left-[7px] top-[18%] h-8 w-[3px] rounded-l-full bg-white/20" />
          <div className="absolute -left-[7px] top-[28%] h-12 w-[3px] rounded-l-full bg-white/20" />
          <div className="absolute -right-[7px] top-[24%] h-14 w-[3px] rounded-r-full bg-white/20" />

          <Screen src={src} alt={alt} fit="object-cover" />
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-white/30" />
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
    <div className="mt-16 grid gap-12 lg:grid-cols-[0.85fr_1.35fr] lg:gap-16 items-center">
      <div
        role="tablist"
        aria-label="Merchant workflow"
        className="bb-scroll -mx-6 flex gap-2.5 overflow-x-auto px-6 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0"
      >
        {merchantSteps.map((s, i) => {
          const active = i === step
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={active}
              onClick={() => pick(i)}
              className={`group relative shrink-0 rounded-2xl border px-5 py-4 text-left transition-all duration-300 lg:rounded-xl lg:border-0 lg:border-l-[3px] lg:px-6 lg:py-5 ${
                active
                  ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_30px_-8px_rgba(59,130,246,0.3)] lg:border-l-blue-500 lg:bg-white/[0.05]"
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.03] lg:border-l-white/10"
              }`}
            >
              <span
                className={`bb-display block text-[15px] font-semibold tracking-tight sm:text-base ${
                  active ? "text-white" : "text-white/60 group-hover:text-white/85"
                }`}
              >
                {s.title}
              </span>
              {active && (
                <span className="mt-2 hidden max-w-sm text-[13.5px] leading-6 text-white/55 lg:block">
                  {s.body}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div>
        <Laptop src={currentShot.src} alt={currentShot.alt} className="mx-auto w-full max-w-4xl" />

        <p className="mt-6 text-sm leading-6 text-white/60 lg:hidden">{current.body}</p>

        {current.shots.length > 1 && (
          <div className="mt-6 flex justify-center gap-2.5" role="group" aria-label="Screens for this step">
            {current.shots.map((s, i) => (
              <button
                key={s.src}
                onClick={() => setShot(i)}
                aria-pressed={i === shot}
                className={`rounded-full border px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  i === shot
                    ? "border-blue-500/60 bg-blue-500/15 text-blue-300 shadow-[0_0_20px_-6px_rgba(59,130,246,0.4)]"
                    : "border-white/15 text-white/50 hover:border-white/25 hover:text-white/80"
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
      className="bb-body min-h-screen overflow-x-hidden text-white/80"
      style={{
        background:
          "radial-gradient(70rem 40rem at 110% -10%, rgba(37,99,235,0.18), transparent 55%)," +
          "radial-gradient(60rem 38rem at -15% 25%, rgba(14,116,144,0.12), transparent 55%)," +
          "radial-gradient(55rem 32rem at 90% 70%, rgba(79,70,229,0.10), transparent 60%)," +
          "#030712",
      }}
    >
      <style>{FONT_CSS}</style>

      <main>
        {/* ---------------- HERO ---------------- */}
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-28 pt-16 lg:grid-cols-[1fr_1fr] lg:gap-12 lg:pb-36 lg:pt-28">
          <div>
            <div className="bb-rise inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 py-1.5 pl-4 pr-2 text-sm text-blue-200 backdrop-blur-md">
              Bills collected through
              <span className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
                <PaytmLogo className="h-4" />
              </span>
            </div>

            <h1 className="bb-display bb-rise bb-rise-2 mt-8 text-[2.85rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl xl:text-[4.2rem]">
              Bill your customers.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Get paid the same day.
              </span>
            </h1>

            <p className="bb-rise bb-rise-3 mt-6 max-w-lg text-lg leading-relaxed text-white/60">
              Bill-Bridge lets merchants create GST-ready bills, send them to customers, and collect through Paytm. Every payment and refund stays securely linked to the bill.
            </p>

            <div className="bb-rise bb-rise-3 mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-13 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-8 text-base font-semibold text-white shadow-[0_8px_30px_-6px_rgba(37,99,235,0.5)] transition-all hover:brightness-110 hover:shadow-[0_12px_40px_-6px_rgba(37,99,235,0.7)]"
              >
                <Link to="/signup">Create free account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-xl border-white/15 bg-white/[0.04] px-8 text-base text-white/90 hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
              >
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* CONSECUTIVE HERO SHOWCASE: Laptop & Mobile Side-by-Side / Stacked cleanly */}
          <div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-6 lg:max-w-none lg:flex-row lg:items-center lg:justify-center">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-blue-600/15 blur-3xl" />
            
            {/* Laptop mockup */}
            <div className="relative w-full max-w-[500px] lg:max-w-[560px]">
              <Laptop src={S("bill-create")} alt="Bill-Bridge merchant dashboard" />
            </div>

            {/* Mobile mockup positioned consecutively/harmoniously */}
            <div className="relative w-[55%] max-w-[220px] sm:max-w-[250px] lg:-ml-16 lg:mt-24 z-10">
              <Phone src={S("m-received")} alt="Bill-Bridge customer view" />
            </div>
          </div>
        </section>

        {/* ---------------- MERCHANT TOUR ---------------- */}
        <section className="border-t border-white/[0.08] bg-black/20">
          <div className="mx-auto max-w-7xl px-6 py-28 lg:py-36">
            <h2 className="bb-display max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
              The merchant workflow,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                from sign-up to refund
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/50">
              Select any step to view the actual production dashboard screen.
            </p>
            <MerchantTour />
          </div>
        </section>

        {/* ---------------- CUSTOMER FLOW ---------------- */}
        <section
          className="border-t border-white/[0.08]"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.45), rgba(3,7,18,0) 70%)",
          }}
        >
          <div className="mx-auto max-w-7xl px-6 py-28 lg:py-36">
            <h2 className="bb-display max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Customers pay in{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                three simple taps
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/50">
              Works instantly in any mobile browser with zero app installation required.
            </p>

            <ol className="mt-20 grid gap-16 md:grid-cols-3 md:gap-8">
              {payFlow.map((p, i) => (
                <li
                  key={p.title}
                  className={`flex flex-col items-center text-center ${i === 1 ? "md:mt-12" : ""}`}
                >
                  <Phone src={p.src} alt={p.alt} className="w-[70%] max-w-[240px]" />
                  <div className="mt-8 flex items-center gap-3">
                    <span className="bb-display flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400 ring-1 ring-blue-500/30">
                      {i + 1}
                    </span>
                    <h3 className="bb-display text-xl font-semibold tracking-tight text-white">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-white/50">{p.body}</p>
                  {p.paytm && (
                    <span className="mt-5 inline-flex items-center rounded-full bg-white px-4 py-2 shadow-md">
                      <PaytmLogo className="h-4" />
                    </span>
                  )}
                </li>
              ))}
            </ol>

            <div className="mt-28 border-t border-white/[0.08] pt-16">
              <h3 className="bb-display text-2xl font-semibold tracking-tight text-white">
                Also available on mobile
              </h3>
              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
                {alsoMobile.map((m) => (
                  <figure key={m.title} className="flex flex-col items-center text-center">
                    <Phone src={m.src} alt={m.alt} className="w-[70%] max-w-[220px]" />
                    <figcaption className="mt-5 text-xs leading-5 text-white/50 sm:text-sm">
                      {m.title}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div
            className="relative overflow-hidden rounded-[2.2rem] border border-blue-500/20 px-8 py-16 sm:px-16 sm:py-20"
            style={{
              background:
                "radial-gradient(45rem 24rem at 100% -10%, rgba(37,99,235,0.25), transparent 60%)," +
                "radial-gradient(40rem 22rem at 0% 110%, rgba(14,116,144,0.18), transparent 55%)," +
                "#0b101d",
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]" />

            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-white px-5 py-2 shadow-lg">
                  <PaytmLogo className="h-6" />
                </div>
                <h2 className="bb-display mt-8 max-w-2xl text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
                  Send your first bill{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    today.
                  </span>
                </h2>
                <p className="mt-4 max-w-lg text-[15px] leading-7 text-white/60">
                  Register your business, add your GSTIN, and let your customers settle invoices instantly through Paytm.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="h-13 shrink-0 rounded-xl bg-white px-9 text-base font-semibold text-slate-950 shadow-xl transition-all hover:bg-blue-50 hover:shadow-[0_12px_40px_-8px_rgba(255,255,255,0.25)]"
              >
                <Link to="/signup">Create free account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}