const SLACK_CHANNEL = "C0B8E6D5E95"

export async function POST(req) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes("@")) {
      return Response.json({ error: "invalid email" }, { status: 400 })
    }

    const token = process.env.SLACK_BOT_USER_TOKEN || process.env.SLACK_BOT_TOKEN
    if (!token) {
      console.error("SLACK_BOT_USER_TOKEN not set")
      return Response.json({ error: "config" }, { status: 500 })
    }

    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: SLACK_CHANNEL,
        text: `*New DJINN access request*\n${email}`,
      }),
    })

    const data = await res.json()
    if (!data.ok) {
      console.error("Slack error:", data.error)
      return Response.json({ error: "slack" }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (e) {
    console.error("waitlist error:", e?.message || e)
    return Response.json({ error: "internal" }, { status: 500 })
  }
}
