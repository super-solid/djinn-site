const API_URL = "http://142.93.238.136:8080/api/bot/api/state"

export async function GET() {
  try {
    const res = await fetch(API_URL, { next: { revalidate: 0 } })
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    return Response.json(data, {
      headers: { "Cache-Control": "no-cache, no-store" },
    })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 502 })
  }
}
