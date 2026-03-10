import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, ShieldCheck, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"
import Footer from "@/components/layout/Footer.jsx"
import { Link } from "react-router-dom"

export default function Landing() {
      console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-4">
            Smart Invoice Management
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Manage Your Bills <br /> Faster & Smarter
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Bill-Bridge helps you create, track and manage invoices with a clean,
            secure and modern workflow.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="transition hover:scale-105">
              Start Free
            </Button>
            <Button size="lg" variant="outline" className="transition hover:scale-105">
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="grid gap-6 md:grid-cols-3">

          {[ 
            { icon: Receipt, title: "Easy Billing", desc: "Create and manage invoices in seconds." },
            { icon: BarChart3, title: "Analytics", desc: "Track revenue and payment insights." },
            { icon: ShieldCheck, title: "Secure", desc: "Encrypted and protected billing data." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="transition hover:-translate-y-2 hover:shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <item.icon className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20 text-center">
        <h2 className="text-3xl font-bold">
          Ready to simplify your billing?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Join Bill-Bridge today and take control of your invoices.
        </p>
        <div className="mt-6">
          <Link to="/signup">
          <Button size="lg"  className="transition hover:scale-105">
            Create Account
          </Button>
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  )
}