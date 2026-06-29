import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "DJINN Handbook — Architecture & How It Works",
  description: "Everything that runs inside DJINN. No vague claims — just the actual system.",
}

function Section({ id, label, children }) {
  return (
    <section id={id} className="py-20 border-t border-white/10 scroll-mt-24">
      <p className="text-white/30 text-xs tracking-widest uppercase mb-10">{label}</p>
      {children}
    </section>
  )
}

function Code({ children }) {
  return (
    <pre className="bg-white/5 border border-white/10 p-6 text-sm font-mono text-white/60 leading-relaxed overflow-x-auto">
      {children}
    </pre>
  )
}

function Note({ children }) {
  return (
    <div className="border-l-2 border-gold pl-6 py-1 my-8">
      <p className="text-white/50 text-sm font-light leading-relaxed">{children}</p>
    </div>
  )
}

const nav = [
  { id: "what-it-is", label: "What it is" },
  { id: "brain", label: "The brain" },
  { id: "memory", label: "Memory" },
  { id: "verify", label: "The Verify step" },
  { id: "build-pipeline", label: "Build pipeline" },
  { id: "the-loop", label: "The loop" },
  { id: "connectors", label: "Connectors" },
  { id: "constraints", label: "Constraints" },
  { id: "deployment", label: "Deployment" },
]

export default function Handbook() {
  return (
    <main className="min-h-screen bg-black text-white font-sans">

      {/* ── TOP NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
          <Image src="/djinn-mark.png" alt="DJINN" width={24} height={24} />
          <span className="text-sm font-light tracking-wide">DJINN</span>
        </Link>
        <span className="text-white/30 text-xs tracking-widest uppercase">Handbook</span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-32 flex gap-16">

        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-28">
            <p className="text-white/20 text-xs tracking-widest uppercase mb-6">Contents</p>
            <ul className="space-y-3">
              {nav.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    className="text-white/40 text-sm font-light hover:text-white transition-colors"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <div className="flex-1 max-w-2xl">

          {/* Header */}
          <div className="mb-20">
            <Image src="/djinn-mark.png" alt="DJINN" width={56} height={56} className="mb-8" />
            <h1 className="text-4xl sm:text-5xl font-light mb-6 leading-tight">
              The DJINN Handbook
            </h1>
            <p className="text-white/50 text-lg font-light leading-relaxed">
              Everything that runs inside DJINN. No vague claims — just the actual system,
              the real constraints, and why it&apos;s built this way.
            </p>
          </div>

          {/* ── WHAT IT IS ── */}
          <Section id="what-it-is" label="What it is">
            <h2 className="text-3xl font-light mb-6">An agent, not a feature.</h2>
            <p className="text-white/60 font-light leading-relaxed mb-6">
              Most &quot;AI for your company&quot; products are search boxes with a language model bolted on.
              You ask a question, they find relevant documents, they summarize. That&apos;s retrieval.
              It&apos;s useful. It&apos;s not what DJINN is.
            </p>
            <p className="text-white/60 font-light leading-relaxed mb-6">
              DJINN is a persistent agent. It holds a conversation across days and weeks without
              losing context. It takes actions — writing code, querying live systems, watching markets.
              It has a second model reviewing its own answers before they reach you.
              And it runs 24/7 without anyone watching it.
            </p>
            <Code>{`Slack (@DJINN or DM)
  └─ message-handler.mjs      serialized queue, live stage, orphan recovery
       └─ djinn-slack.mjs     Claude Sonnet — resumed per thread
            └─ tools          synapse, linear, founders, expenses, bash
                 └─ judge     Opus reviews the reply before you see it`}</Code>
          </Section>

          {/* ── THE BRAIN ── */}
          <Section id="brain" label="The brain">
            <h2 className="text-3xl font-light mb-6">Claude Sonnet. One session per thread.</h2>
            <p className="text-white/60 font-light leading-relaxed mb-6">
              The underlying model is Claude Sonnet, running via the Anthropic Agent SDK.
              Every Slack thread — a DM, a channel thread, any conversation — gets its own
              persistent session. That session survives restarts. When DJINN reboots,
              it resumes right where it left off.
            </p>
            <p className="text-white/60 font-light leading-relaxed mb-6">
              This is not achieved by stuffing a conversation summary into a prompt.
              The Agent SDK maintains the full session server-side. DJINN just stores the
              session ID per thread key and passes it as a <code className="text-gold bg-white/5 px-1">resume</code> parameter.
            </p>
            <Note>
              The brain health is probed on boot and every 5 minutes. When the subscription token
              expires, DJINN replies instantly with the recovery steps instead of hanging for minutes
              on a token that can&apos;t auth.
            </Note>
            <p className="text-white/60 font-light leading-relaxed">
              The Agent SDK also handles what happens when DJINN hits its turn limit mid-task:
              it saves the session and resumes with a meta-prompt asking it to summarize what it
              did and what&apos;s left. You get a coherent partial answer, not a raw error.
            </p>
          </Section>

          {/* ── MEMORY ── */}
          <Section id="memory" label="Memory">
            <h2 className="text-3xl font-light mb-6">Four layers that don&apos;t overlap.</h2>

            <div className="space-y-10">
              <div>
                <div className="text-gold text-xs tracking-widest uppercase mb-3">Conversation</div>
                <p className="text-white/60 font-light leading-relaxed">
                  Per-thread Agent SDK session. Full history, server-side. Survives restarts.
                  Stale sessions (inactive 30+ days) are pruned automatically so the file doesn&apos;t grow forever.
                  Every 10 turns, company facts are re-injected into the system prompt so long sessions
                  don&apos;t drift on outdated context.
                </p>
              </div>
              <div>
                <div className="text-gold text-xs tracking-widest uppercase mb-3">Facts</div>
                <p className="text-white/60 font-light leading-relaxed">
                  A deduplicated, auto-maintained table of current-state facts: identities, decisions,
                  configurations. Maintained nightly by a reconciliation job that reads new conversations
                  and issues ADD/UPDATE/DELETE operations. This is the distilled truth — not a log,
                  the current state.
                </p>
              </div>
              <div>
                <div className="text-gold text-xs tracking-widest uppercase mb-3">Journal</div>
                <p className="text-white/60 font-light leading-relaxed">
                  A timestamped append log of every message plus hourly/daily/weekly summaries.
                  Search it with <code className="text-gold bg-white/5 px-1">journal.mjs find</code>.
                  It&apos;s cheap — returns only matching rows, not the whole history.
                  Use it for &quot;what did we decide about X in May&quot; or &quot;what happened this week.&quot;
                </p>
              </div>
              <div>
                <div className="text-gold text-xs tracking-widest uppercase mb-3">Company data</div>
                <p className="text-white/60 font-light leading-relaxed">
                  BM25 full-text search across every connected source — Slack, Linear, Gmail,
                  Vercel, Supabase, market intel — via Synapse. Noisy (it ingests everything),
                  so DJINN reads citations and draws its own conclusions rather than trusting
                  a synthesized answer.
                </p>
              </div>
            </div>
          </Section>

          {/* ── VERIFY ── */}
          <Section id="verify" label="The Verify step">
            <h2 className="text-3xl font-light mb-6">Sonnet makes. Opus checks.</h2>
            <p className="text-white/60 font-light leading-relaxed mb-6">
              Every reply DJINN drafts goes through a second model before it reaches you.
              The judge is Claude Opus — more capable than the maker, specifically because
              the reviewer needs to catch what the maker missed.
            </p>
            <p className="text-white/60 font-light leading-relaxed mb-8">
              The judge looks for five specific failure modes:
            </p>
            <div className="space-y-4 mb-8">
              {[
                ["Fabricated paths", "Names a file, function, or URL that wasn't verified this turn."],
                ["Confident absence", "Says 'X doesn't exist' without a successful empty lookup to back it."],
                ["Lookup blur", "States a failed tool call as a fact. 'No issues found' when the tool threw an error."],
                ["Editorializing", "Adds emotional or financial judgment that wasn't asked for."],
                ["Deploy claims", "Says code is live without having seen pm2 or log output this turn."],
              ].map(([name, desc]) => (
                <div key={name} className="flex gap-4">
                  <div className="text-gold text-sm font-light w-40 flex-shrink-0 pt-0.5">{name}</div>
                  <div className="text-white/50 text-sm font-light leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
            <Note>
              If the judge finds a violation and can rewrite the reply correctly, it does.
              If it can&apos;t, it flags in logs but lets the reply through. The judge never blocks —
              a judge failure is worse than a slightly imperfect answer.
            </Note>
            <p className="text-white/60 font-light leading-relaxed">
              This pattern — maker-checker across two model families — is borrowed from
              adversarial ML. The key is that the checker uses a different model than the maker.
              The same model that generated a mistake is unlikely to catch it when re-reading its own output.
            </p>
          </Section>

          {/* ── BUILD PIPELINE ── */}
          <Section id="build-pipeline" label="Build pipeline">
            <h2 className="text-3xl font-light mb-6">Opus plans. Codex codes. Opus reviews.</h2>
            <p className="text-white/60 font-light leading-relaxed mb-6">
              When you tell DJINN to implement something, it runs a multi-agent pipeline in the background.
              You get a Slack notification when it&apos;s done. The PR link and a plain-English
              description of what was built — no need to read the diff to understand it.
            </p>
            <Code>{`1. Opus reads the codebase, produces a concrete implementation plan
2. Codex (GPT, different model family) implements the plan
3. Opus reviews the diff — looks for bugs, missing cases, broken conventions
4. Codex fixes blockers (up to 3 rounds)
5. PR opened on GitHub
6. Slack notification: TL;DR + verdict + PR link`}</Code>
            <p className="text-white/60 font-light leading-relaxed mt-8 mb-6">
              The cross-model review matters. Codex implementing and Opus reviewing means
              the reviewer has no stake in the implementation choices. It&apos;s not re-reading
              its own work — it&apos;s auditing someone else&apos;s.
            </p>
            <p className="text-white/60 font-light leading-relaxed">
              All code runs in a sandbox clone of your repo, never the live tree.
              Merging and deploying a PR is a deliberate human step.
            </p>
          </Section>

          {/* ── THE LOOP ── */}
          <Section id="the-loop" label="The loop">
            <h2 className="text-3xl font-light mb-6">It ships its own improvements through the same pipeline.</h2>
            <p className="text-white/60 font-light leading-relaxed mb-6">
              The build pipeline exists for your codebase. But DJINN also uses it on itself.
              When a new capability is needed — a new connector, a bug fix, a better judge prompt —
              the same loop runs: Opus plans the change, Codex implements it, Opus reviews the diff,
              blockers get fixed, a PR opens.
            </p>
            <p className="text-white/60 font-light leading-relaxed mb-6">
              The CHANGELOG is the on-disk record. Every shipped change goes in there with a date.
              When asked what changed or why something broke, DJINN reads the CHANGELOG first —
              it&apos;s the source of truth, not the conversation memory.
            </p>
            <Note>
              This is the Loop Engineering framework applied to the agent itself:
              Discover → Handoff → Verify → Persist → Schedule.
              DJINN is both the practitioner and the subject.
            </Note>
            <p className="text-white/60 font-light leading-relaxed">
              There&apos;s one hard constraint on this loop: the WIP limit.
              DJINN does not start new build work while several unmerged PRs sit in the queue.
              The bottleneck is integration — review, fix, merge, deploy — not generation.
              Generating more PRs when the existing ones haven&apos;t landed makes the queue longer,
              not shorter.
            </p>
          </Section>

          {/* ── CONNECTORS ── */}
          <Section id="connectors" label="Connectors">
            <h2 className="text-3xl font-light mb-6">What DJINN can reach.</h2>
            <div className="space-y-6">
              {[
                ["Slack", "Read: full workspace history via Synapse. Write: posts messages in conversations it's part of."],
                ["Linear", "Read: live API (issues, projects, status, assignees). Write: proposed and run by a human."],
                ["Gmail", "Read: any founder's inbox via service account domain-wide delegation. Write: dry-run by default, human confirms."],
                ["Google Calendar", "Read: any founder's calendar. Write: dry-run, human confirms."],
                ["GitHub", "Read: repos, PRs, diffs. Write: commits and opens PRs in the sandbox via build pipeline."],
                ["Expenses", "Read/write: Supabase table. Auto-logged from a designated Slack channel. Queryable: totals, subscriptions, upcoming payments."],
                ["Market intel", "Polls Trump Truth Social every 30 min, classifies with Haiku, pushes relevant signals to a Slack channel."],
                ["Vercel", "Read via Synapse (deploy history, project status)."],
              ].map(([name, desc]) => (
                <div key={name} className="flex gap-6 py-4 border-b border-white/5">
                  <div className="text-white text-sm font-light w-32 flex-shrink-0">{name}</div>
                  <div className="text-white/40 text-sm font-light leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── CONSTRAINTS ── */}
          <Section id="constraints" label="Constraints">
            <h2 className="text-3xl font-light mb-6">What it won&apos;t do. On purpose.</h2>
            <p className="text-white/60 font-light leading-relaxed mb-8">
              These aren&apos;t limitations to be fixed. They&apos;re decisions.
            </p>
            <div className="space-y-8">
              <div>
                <div className="text-white text-sm font-light mb-2">No self-deploy</div>
                <p className="text-white/40 text-sm font-light leading-relaxed">
                  DJINN cannot restart its own process. pm2 is blocked at the tool layer.
                  A code change that bricks the bot mid-restart would leave it dead with no way to recover.
                  Deploy is a human step, always.
                </p>
              </div>
              <div>
                <div className="text-white text-sm font-light mb-2">No writes without confirmation</div>
                <p className="text-white/40 text-sm font-light leading-relaxed">
                  Posting to Slack, creating Linear issues, sending email, creating calendar events:
                  DJINN proposes the exact payload and waits. It doesn&apos;t act on writes unilaterally.
                  Code in the sandbox doesn&apos;t count — that&apos;s not a write to a live system.
                </p>
              </div>
              <div>
                <div className="text-white text-sm font-light mb-2">No secret reads</div>
                <p className="text-white/40 text-sm font-light leading-relaxed">
                  .env files, API keys, tokens — blocked at the tool layer. DJINN cannot read
                  its own credentials, yours, or anyone else&apos;s.
                </p>
              </div>
              <div>
                <div className="text-white text-sm font-light mb-2">No editorializing</div>
                <p className="text-white/40 text-sm font-light leading-relaxed">
                  DJINN doesn&apos;t characterize amounts as big or small, progress as good or bad,
                  or outcomes as worth it or wasteful. It states facts. The Opus judge enforces this.
                </p>
              </div>
            </div>
          </Section>

          {/* ── DEPLOYMENT ── */}
          <Section id="deployment" label="Deployment">
            <h2 className="text-3xl font-light mb-6">How it runs.</h2>
            <p className="text-white/60 font-light leading-relaxed mb-6">
              DJINN runs on a Linux droplet under pm2. Two processes:
              the Slack brain (<code className="text-gold bg-white/5 px-1">djinn-slack</code>) and
              the market watcher (<code className="text-gold bg-white/5 px-1">djinn-market</code>).
              The brain is the one that answers you; the watcher polls and pushes signals independently.
            </p>
            <Code>{`pm2 describe djinn-slack     # uptime, restarts, memory
pm2 logs djinn-slack         # what's happening right now
node packages/djinn/djinn-status.mjs   # what's being processed and why`}</Code>
            <p className="text-white/60 font-light leading-relaxed mt-8 mb-6">
              The message handler maintains a durable in-flight registry on disk.
              If the process is killed mid-reply, the next boot finds the orphaned job,
              edits the frozen placeholder with an explanation, and resumes normally.
              No message is silently lost.
            </p>
            <p className="text-white/60 font-light leading-relaxed">
              Safe deploy runs a syntax check before restarting and probes the brain after.
              If the brain doesn&apos;t respond within 30 seconds of restart, it rolls back automatically.
            </p>
          </Section>

          {/* Footer */}
          <div className="pt-20 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <Link href="/" className="text-white/30 text-sm font-light hover:text-white transition-colors">
              ← Back to DJINN
            </Link>
            <Image src="/supersolid-logo.png" alt="Supersolid" width={120} height={24} className="opacity-20" />
          </div>

        </div>
      </div>
    </main>
  )
}
