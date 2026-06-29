"use client"
import { useState } from "react"
import Image from "next/image"

export default function Home() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState("idle") // idle | loading | done | error

  async function submit(e) {
    e.preventDefault()
    if (!email || state === "loading" || state === "done") return
    setState("loading")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setState(res.ok ? "done" : "error")
    } catch {
      setState("error")
    }
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans">

      {/* ── HERO ── */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center relative">
        <div className="mb-10">
          <Image src="/djinn-mark.png" alt="DJINN" width={160} height={160} priority />
        </div>

        <h1 className="text-5xl sm:text-7xl font-light tracking-tight mb-6">
          DJINN
        </h1>

        <p className="text-xl sm:text-2xl text-white/60 font-light max-w-xl mb-4 leading-relaxed">
          Your company brain.
        </p>

        <p className="text-base sm:text-lg text-white/40 font-light max-w-2xl mb-14 leading-relaxed">
          Not a chatbot. Not a search tool. An agent that knows your company and ships work —
          in Slack, 24/7, with memory that survives every conversation.
        </p>

        <a
          href="#access"
          className="border border-gold text-gold px-8 py-3 text-sm tracking-widest uppercase hover:bg-gold hover:text-black transition-colors duration-200"
        >
          Request access
        </a>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 text-xs tracking-widest uppercase">
          Done for you
        </div>
      </section>

      {/* ── WHAT ACTUALLY HAPPENS ── */}
      <section className="px-6 py-32 max-w-5xl mx-auto">
        <p className="text-white/30 text-xs tracking-widest uppercase mb-16">What it does</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="text-gold text-xs tracking-widest uppercase mb-4">Memory</div>
            <p className="text-white/80 text-lg font-light leading-relaxed">
              Ask it what was decided in last Tuesday&apos;s thread. It was there.
              Every Slack message, Linear issue, email, and calendar event — indexed and queryable.
            </p>
          </div>
          <div>
            <div className="text-gold text-xs tracking-widest uppercase mb-4">Action</div>
            <p className="text-white/80 text-lg font-light leading-relaxed">
              Tell it to implement that Linear issue. It branches, writes the code, runs a
              cross-model review, fixes the blockers, and hands you a PR. You merge.
            </p>
          </div>
          <div>
            <div className="text-gold text-xs tracking-widest uppercase mb-4">Proactive</div>
            <p className="text-white/80 text-lg font-light leading-relaxed">
              It posts to your DM when a tariff announcement moves your market.
              Morning digest of what&apos;s open in Linear and what&apos;s on the calendar.
              It doesn&apos;t wait to be asked.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs tracking-widest uppercase mb-16">How it works</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-light mb-8 leading-tight">
                Connected to everything.<br />
                Lives in Slack.
              </h2>
              <p className="text-white/50 font-light leading-relaxed mb-8">
                We connect DJINN to your Slack, Linear, Gmail, GitHub, and calendar.
                It ingests everything, builds persistent memory per conversation, and
                surfaces it when you need it — without you having to switch tools.
              </p>
              <p className="text-white/50 font-light leading-relaxed">
                Every reply goes through a second model before it reaches you.
                It checks for claims without evidence, fabricated file paths, confident
                assertions with no lookup behind them. The answer you see is the one that passed.
              </p>
            </div>

            <div className="font-mono text-sm text-white/30 leading-loose border border-white/10 p-8">
              <div className="text-white/60 mb-2">Your tools</div>
              <div className="pl-4 mb-4">
                Slack · Linear · Gmail<br />
                GitHub · Calendar
              </div>
              <div className="text-white/20 mb-4">↓ ingests · remembers · acts</div>
              <div className="text-white/60 mb-2">DJINN</div>
              <div className="pl-4 mb-4">
                Sonnet answers<br />
                <span className="text-gold">Opus judges</span> before you see it<br />
                Codex codes when asked
              </div>
              <div className="text-white/20 mb-4">↓ replies</div>
              <div className="text-white/60">Your Slack thread</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE LOOP ── */}
      <section className="px-6 py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs tracking-widest uppercase mb-16">The loop</p>

          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-light mb-8 leading-tight">
              It improves itself<br />
              through the same pipeline<br />
              it uses for your work.
            </h2>
            <p className="text-white/50 font-light leading-relaxed mb-6">
              Every change DJINN makes — to your codebase or to its own — goes through a
              cross-model review before it ships. A different model family reads the diff
              and looks for bugs. If it finds them, DJINN fixes them and tries again.
            </p>
            <p className="text-white/50 font-light leading-relaxed">
              This is not a marketing claim. It is the loop that ran to build this page.
            </p>
          </div>
        </div>
      </section>

      {/* ── DONE FOR YOU ── */}
      <section className="px-6 py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs tracking-widest uppercase mb-16">How we work</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-light mb-8 leading-tight">
                We set it up.<br />
                You use it.
              </h2>
              <p className="text-white/50 font-light leading-relaxed">
                DJINN is not a product you configure yourself. We connect your tools,
                train it on your company context, and keep it running. When something
                breaks or a connector changes, we fix it. You talk to DJINN in Slack
                and it works.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <div className="text-white text-sm font-light mb-1">Onboarding</div>
                <div className="text-white/40 text-sm font-light">We connect your tools and tune DJINN to your stack. Takes about a week.</div>
              </div>
              <div className="border-t border-white/10 pt-8">
                <div className="text-white text-sm font-light mb-1">Running</div>
                <div className="text-white/40 text-sm font-light">DJINN runs on our infrastructure. Monthly retainer. We handle restarts, updates, and new connectors.</div>
              </div>
              <div className="border-t border-white/10 pt-8">
                <div className="text-white text-sm font-light mb-1">Access</div>
                <div className="text-white/40 text-sm font-light">We&apos;re taking a small number of teams right now. Leave your email — we&apos;ll reach out within a day.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <section id="access" className="px-6 py-32 border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-light mb-6 leading-tight">
            Want DJINN for your company?
          </h2>
          <p className="text-white/40 font-light mb-12 max-w-md mx-auto">
            Leave your email. We&apos;ll reach out within 24 hours.
          </p>

          {state === "done" ? (
            <p className="text-gold text-lg font-light">Got it. We&apos;ll be in touch.</p>
          ) : (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="your@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="border border-gold text-gold px-6 py-3 text-sm tracking-widest uppercase hover:bg-gold hover:text-black transition-colors duration-200 disabled:opacity-40"
              >
                {state === "loading" ? "..." : "Request access"}
              </button>
            </form>
          )}
          {state === "error" && (
            <p className="text-red-400 text-sm mt-4">Something went wrong. Email us directly at julian@supersolid.co</p>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-16 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <Image
            src="/supersolid-logo.png"
            alt="Supersolid"
            width={160}
            height={32}
            className="opacity-30 hover:opacity-60 transition-opacity"
          />
          <p className="text-white/20 text-xs font-light tracking-wide">
            Built in Buenos Aires.
          </p>
        </div>
      </footer>

    </main>
  )
}
