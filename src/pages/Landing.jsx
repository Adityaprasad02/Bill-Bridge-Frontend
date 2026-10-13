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
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');
.bb-display { font-family: 'Sora', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.03em; }
.bb-body { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }
@keyframes bb-fade { from { opacity: 0; transform: scale(.992); } to { opacity: 1; transform: none; } }
.bb-fade { animation: bb-fade .35s ease both; }
@keyframes bb-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.bb-rise { animation: bb-rise .8s cubic-bezier(.2,.7,.2,1) both; }
.bb-rise-2 { animation-delay: .12s; }
.bb-rise-3 { animation-delay: .24s; }
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

function Screen({ src, alt, fit = "object-contain" }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#07101c] p-4 text-center text-xs text-white/40">
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
    <div className={className}>
      <div className="rounded-t-[1.1rem] border border-white/15 bg-[#0b1220] p-[2%] pb-0 shadow-[0_50px_90px_-35px_rgba(0,0,0,0.95)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-md bg-[#0a0a0a] ring-1 ring-white/10">
          <div className="absolute left-1/2 top-1 z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/20" />
          <Screen src={src} alt={alt} />
        </div>
      </div>
      <div className="relative mx-[-2.5%] h-3 rounded-b-[1.2rem] bg-gradient-to-b from-[#2b3647] to-[#0e1520] sm:h-4">
        <div className="absolute left-1/2 top-0 h-1.5 w-24 -translate-x-1/2 rounded-b-lg bg-black/50 sm:w-32" />
      </div>
    </div>
  )
}

function Phone({ src, alt, className = "" }) {
  return (
    <div
      className={`rounded-[2.2rem] border border-white/20 bg-[#0b1220] p-[6px] shadow-[0_40px_70px_-25px_rgba(0,0,0,0.95)] ${className}`}
    >
      <div className="relative aspect-[9/19] overflow-hidden rounded-[1.75rem] bg-black">
        <Screen src={src} alt={alt} />
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
    <div className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-14">
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
              className={`shrink-0 rounded-xl border px-4 py-3 text-left transition-colors lg:rounded-none lg:border-0 lg:border-l-2 lg:px-6 lg:py-5 ${
                active
                  ? "border-[#00baf2]/60 bg-[#00baf2]/10 lg:border-l-[#19d9a0] lg:bg-white/[0.04]"
                  : "border-white/10 hover:bg-white/[0.03] lg:border-l-white/10"
              }`}
            >
              <span className={`bb-display block text-base font-semibold sm:text-lg ${active ? "text-white" : "text-white/60"}`}>
                {s.title}
              </span>
              {active && (
                <span className="mt-2 hidden max-w-sm text-sm leading-6 text-[#9fb2c8] lg:block">{s.body}</span>
              )}
            </button>
          )
        })}
      </div>

      <div>
        <Laptop src={currentShot.src} alt={currentShot.alt} className="mx-auto w-[94%]" />

        <p className="mt-6 text-sm leading-6 text-[#9fb2c8] lg:hidden">{current.body}</p>

        {current.shots.length > 1 && (
          <div className="mt-6 flex justify-center gap-2" role="group" aria-label="Screens for this step">
            {current.shots.map((s, i) => (
              <button
                key={s.src}
                onClick={() => setShot(i)}
                aria-pressed={i === shot}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  i === shot
                    ? "border-[#19d9a0] bg-[#19d9a0]/15 text-white"
                    : "border-white/15 text-white/55 hover:text-white"
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
      className="bb-body min-h-screen overflow-x-hidden text-[#cbd8e6]"
      style={{
        background:
          "radial-gradient(60rem 36rem at 100% -5%, rgba(0,186,242,0.30), transparent 62%)," +
          "radial-gradient(55rem 34rem at -8% 30%, rgba(25,217,160,0.18), transparent 62%)," +
          "radial-gradient(50rem 30rem at 100% 62%, rgba(10,80,190,0.25), transparent 62%)," +
          "#040a14",
      }}
    >
      <style>{FONT_CSS}</style>

      <main>
        {/* ---------------- HERO ---------------- */}
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:pb-32 lg:pt-24">
          <div>
            <div className="bb-rise inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-4 pr-1.5 text-sm text-white/70">
              Bills collected through
              <span className="flex items-center rounded-full bg-white px-3 py-1.5">
                <PaytmLogo className="h-4" />
              </span>
            </div>

            <h1 className="bb-display bb-rise bb-rise-2 mt-8 text-[2.7rem] font-semibold leading-[1.02] text-white sm:text-6xl xl:text-[4.4rem]">
              Bill your customers.
              <br />
              Get paid the same day.
            </h1>

            <p className="bb-rise bb-rise-3 mt-7 max-w-md text-lg leading-8 text-[#9fb2c8]">
              Bill-Bridge lets merchants create GST-ready bills, send them to customers, and collect through Paytm.
              Every payment and refund stays on the bill it belongs to.
            </p>

            <div className="bb-rise bb-rise-3 mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-[#19d9a0] px-7 text-base font-semibold text-[#03140e] hover:bg-[#4be8b8]"
              >
                <Link to="/signup">Create free account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/25 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* composite: merchant laptop + customer phone */}
          <div className="relative mx-auto w-full max-w-2xl pb-10 lg:max-w-none lg:pb-0 lg:pr-0">
            <div
              className="pointer-events-none absolute inset-x-6 top-10 h-4/5 rounded-[50%] blur-3xl"
              style={{ background: "linear-gradient(120deg, rgba(0,186,242,0.35), rgba(25,217,160,0.25))" }}
            />
            <Laptop src={S("bill-create")} alt="Bill-Bridge merchant dashboard" className="relative w-[92%]" />
            <Phone
              src={S("m-received")}
              alt="Bill-Bridge customer view"
              className="absolute -bottom-2 right-0 w-[26%] min-w-[92px] max-w-[190px] sm:-bottom-6 lg:-right-4"
            />
          </div>
        </section>

        {/* ---------------- MERCHANT TOUR ---------------- */}
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
            <h2 className="bb-display max-w-3xl text-4xl font-semibold leading-[1.05] text-white sm:text-5xl">
              The merchant side, from sign-up to refund
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-[#9fb2c8]">
              Pick a step to see the real dashboard screen for it.
            </p>
            <MerchantTour />
          </div>
        </section>

        {/* ---------------- CUSTOMER FLOW ---------------- */}
        <section
          className="border-t border-white/10"
          style={{ background: "linear-gradient(180deg, rgba(8,40,52,0.55), rgba(4,10,20,0) 75%)" }}
        >
          <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
            <h2 className="bb-display max-w-3xl text-4xl font-semibold leading-[1.05] text-white sm:text-5xl">
              Customers pay in three taps
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-[#9fb2c8]">
              Everything works in a phone browser, so there is no app for your customers to install.
            </p>

            <ol className="mt-16 grid gap-16 md:grid-cols-3 md:gap-8">
              {payFlow.map((p, i) => (
                <li key={p.title} className={`flex flex-col items-center text-center ${i === 1 ? "md:mt-14" : ""}`}>
                  <Phone src={p.src} alt={p.alt} className="w-[62%] max-w-[250px]" />
                  <div className="mt-8 flex items-center gap-3">
                    <span className="bb-display flex h-8 w-8 items-center justify-center rounded-full bg-[#19d9a0]/15 text-sm font-semibold text-[#19d9a0]">
                      {i + 1}
                    </span>
                    <h3 className="bb-display text-xl font-semibold text-white">{p.title}</h3>
                  </div>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-[#9fb2c8]">{p.body}</p>
                  {p.paytm && (
                    <span className="mt-4 inline-flex items-center rounded-full bg-white px-3.5 py-1.5">
                      <PaytmLogo className="h-4" />
                    </span>
                  )}
                </li>
              ))}
            </ol>

            <div className="mt-24 border-t border-white/10 pt-14">
              <h3 className="bb-display text-2xl font-semibold text-white">Also on mobile</h3>
              <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-10">
                {alsoMobile.map((m) => (
                  <figure key={m.title} className="flex flex-col items-center text-center">
                    <Phone src={m.src} alt={m.alt} className="w-full max-w-[190px]" />
                    <figcaption className="mt-5 text-xs leading-5 text-[#9fb2c8] sm:text-sm">{m.title}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div
            className="overflow-hidden rounded-[2rem] border border-white/15 px-8 py-16 sm:px-14 sm:py-20"
            style={{
              background:
                "radial-gradient(40rem 20rem at 100% 0%, rgba(0,186,242,0.32), transparent 65%)," +
                "radial-gradient(40rem 22rem at 0% 100%, rgba(25,217,160,0.22), transparent 65%)," +
                "#08111f",
            }}
          >
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-white px-5 py-2.5">
                  <PaytmLogo className="h-6" />
                </div>
                <h2 className="bb-display mt-8 max-w-2xl text-4xl font-semibold leading-[1.05] text-white sm:text-5xl">
                  Send your first bill today.
                </h2>
                <p className="mt-5 max-w-lg leading-7 text-[#a9bdd2]">
                  Register your business, add your GSTIN, and your customers can pay through Paytm.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="h-14 shrink-0 rounded-full bg-white px-9 text-base font-semibold text-[#04120e] hover:bg-[#e6fff6]"
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
