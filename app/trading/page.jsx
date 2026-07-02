"use client"

import { useState, useEffect } from "react"

const API_URL = "http://142.93.238.136:8080/api/bot/api/state"
const REFRESH_MS = 5000

function fmt(n, decimals = 2) {
  if (n == null) return "—"
  return Number(n).toFixed(decimals)
}

function pct(n) {
  if (n == null) return "—"
  return Number(n).toFixed(1) + "%"
}

function ConfidenceBar({ value }) {
  const w = Math.min(100, Math.max(0, value * 100))
  const color = w > 80 ? "#22c55e" : w > 60 ? "#C9A84C" : "#ef4444"
  return (
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${w}%`, background: color }} />
    </div>
  )
}

function Stat({ label, value, sub, color }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-semibold ${color || "text-white"}`}>{value}</span>
      {sub && <span className="text-xs text-white/30">{sub}</span>}
    </div>
  )
}

function Pulse({ alive }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {alive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${alive ? "bg-green-500" : "bg-red-500"}`} />
    </span>
  )
}

export default function TradingDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    let mounted = true
    async function fetchState() {
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`${res.status}`)
        const json = await res.json()
        if (mounted) {
          setData(json)
          setError(null)
          setLastUpdate(new Date())
        }
      } catch (e) {
        if (mounted) setError(e.message)
      }
    }
    fetchState()
    const interval = setInterval(fetchState, REFRESH_MS)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const stats = data?.stats || {}
  const markets = data?.markets || []
  const trades = data?.trades || []
  const mode = data?.mode || "—"
  const secsRemaining = data?.secs_remaining || 0
  const secsIntoWindow = data?.secs_into_window || 0
  const windowProgress = (secsIntoWindow / 300) * 100
  const inEntryWindow = secsIntoWindow >= 210 && secsIntoWindow <= 270

  const recentTrades = [...trades].reverse().slice(0, 20)
  const pnl = stats.total_pnl || 0
  const pnlColor = pnl > 0 ? "text-green-400" : pnl < 0 ? "text-red-400" : "text-white"

  return (
    <div className="min-h-screen bg-black text-white font-[Inter] p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <a href="/" className="text-white/40 hover:text-white text-sm">&larr; DJINN</a>
          <span className="text-white/20">|</span>
          <h1 className="text-lg font-semibold tracking-tight">Polymarket Bot</h1>
          <Pulse alive={!!data && !error} />
        </div>
        <div className="flex items-center gap-4 text-xs text-white/30">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${mode === "live" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
            {mode.toUpperCase()}
          </span>
          {lastUpdate && <span>Updated {lastUpdate.toLocaleTimeString()}</span>}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          Connection error: {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 p-6 bg-white/[0.03] rounded-xl border border-white/[0.06]">
        <Stat label="Portfolio" value={`$${fmt(stats.portfolio)}`} />
        <Stat label="PnL" value={`${pnl >= 0 ? "+" : ""}$${fmt(pnl)}`} color={pnlColor} sub={`${pct(stats.avg_pnl_pct)} return`} />
        <Stat label="Trades" value={stats.total_trades || 0} sub={`${stats.wins || 0}W / ${stats.losses || 0}L`} />
        <Stat label="Win Rate" value={pct(stats.win_rate)} color={stats.win_rate > 70 ? "text-green-400" : "text-white"} />
        <Stat label="Sigma" value={fmt(stats.sigma, 1)} sub="vs random" color={stats.sigma > 3 ? "text-[#C9A84C]" : "text-white"} />
      </div>

      {/* 5-Minute Window Timer */}
      <div className="mb-8 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40 uppercase tracking-wider">5-Minute Window</span>
          <span className={`text-xs font-medium ${inEntryWindow ? "text-[#C9A84C]" : "text-white/30"}`}>
            {inEntryWindow ? "ENTRY WINDOW OPEN" : `Entry in ${Math.max(0, 210 - secsIntoWindow)}s`}
          </span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${windowProgress}%`,
              background: inEntryWindow
                ? "linear-gradient(90deg, #C9A84C, #e2c06e)"
                : "linear-gradient(90deg, #333, #555)",
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-white/20">
          <span>0:00</span>
          <span className="text-white/40">3:30 entry</span>
          <span className="text-white/40">4:30 close</span>
          <span>5:00</span>
        </div>
      </div>

      {/* Markets */}
      <div className="mb-8">
        <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Live Markets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {markets.map((m) => {
            const delta = m.delta_pct || 0
            const hasSignal = !!m.signal
            return (
              <div
                key={m.crypto}
                className={`p-4 rounded-xl border ${hasSignal ? "border-[#C9A84C]/40 bg-[#C9A84C]/[0.05]" : "border-white/[0.06] bg-white/[0.03]"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{m.name || m.crypto?.toUpperCase()}</span>
                  <span className={`text-sm font-mono ${delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-white/40"}`}>
                    {delta >= 0 ? "+" : ""}{pct(delta)}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-white/40 mb-2">
                  <span>UP {fmt(m.up_price)}</span>
                  <span>DOWN {fmt(m.down_price)}</span>
                </div>
                {hasSignal && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#C9A84C] font-medium">
                        {m.signal.direction?.toUpperCase()} signal
                      </span>
                      <span className="text-white/60">{pct(m.signal.confidence * 100)} conf</span>
                    </div>
                    <ConfidenceBar value={m.signal.confidence} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Recent Trades</h2>
        <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-white/30 uppercase border-b border-white/[0.06]">
                <th className="text-left p-3 font-medium">Time</th>
                <th className="text-left p-3 font-medium">Asset</th>
                <th className="text-left p-3 font-medium">Direction</th>
                <th className="text-right p-3 font-medium">Price</th>
                <th className="text-right p-3 font-medium">Stake</th>
                <th className="text-right p-3 font-medium">Conf</th>
                <th className="text-right p-3 font-medium">Result</th>
                <th className="text-right p-3 font-medium">PnL</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.length === 0 && (
                <tr><td colSpan={8} className="p-4 text-center text-white/20">No trades yet</td></tr>
              )}
              {recentTrades.map((t, i) => {
                const isWin = t.result === "win"
                const isLoss = t.result === "loss"
                return (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="p-3 text-white/40 font-mono text-xs">
                      {t.timestamp?.slice(11, 19) || "—"}
                    </td>
                    <td className="p-3 font-medium">{t.crypto?.toUpperCase()}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${t.direction === "up" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {t.direction?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono">${fmt(t.token_price)}</td>
                    <td className="p-3 text-right font-mono">${fmt(t.stake_usd)}</td>
                    <td className="p-3 text-right">{pct((t.confidence || 0) * 100)}</td>
                    <td className="p-3 text-right">
                      {t.result ? (
                        <span className={isWin ? "text-green-400" : "text-red-400"}>
                          {t.result.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-white/20">pending</span>
                      )}
                    </td>
                    <td className={`p-3 text-right font-mono ${isWin ? "text-green-400" : isLoss ? "text-red-400" : "text-white/20"}`}>
                      {t.pnl != null ? `${t.pnl >= 0 ? "+" : ""}$${fmt(t.pnl)}` : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-white/20">
        Late Window Certainty Strategy | BTC ETH SOL DOGE | 5-minute crypto prediction markets | Auto-refreshes every 5s
      </div>
    </div>
  )
}
