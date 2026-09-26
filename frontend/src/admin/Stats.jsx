import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Loader2, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../lib/api";

const RANGES = [{ v: 7, l: "7 jours" }, { v: 30, l: "30 jours" }, { v: 90, l: "90 jours" }];

const frDate = (k) => new Date(`${k}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
const shortDate = (k) => new Date(`${k}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

export default function Stats() {
  const [days, setDays] = useState(30);
  const [day, setDay] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics", days, day],
    queryFn: () => api.get("/admin/analytics", { params: { days, day } }).then((r) => r.data),
    refetchInterval: 60000,
  });

  if (isLoading || !data) return <div className="flex items-center gap-2 text-brand-ink/60"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  const t = data.totals;
  const kpis = [
    { label: "En ligne (5 min)", value: t.live_visitors, id: "stats-live", icon: Activity },
    { label: "Visiteurs aujourd'hui", value: t.today_visitors, id: "stats-today-visitors", icon: Users },
    { label: "Pages vues aujourd'hui", value: t.today_views, id: "stats-today-views" },
    { label: `Visiteurs (${days} j)`, value: t.visitors, id: "stats-range-visitors" },
    { label: `Pages vues (${days} j)`, value: t.views, id: "stats-range-views" },
    { label: "Moyenne / jour", value: t.avg_daily_views, id: "stats-avg" },
  ];
  const heatMax = Math.max(1, ...data.heatmap.flatMap((d) => d.hours));

  return (
    <div data-testid="admin-stats-page">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="h-serif text-2xl sm:text-3xl font-semibold mb-1">Statistiques de visite</h1>
          <p className="text-sm text-brand-ink/60">Mesure interne first-party, sans cookie — heure de Paris. Les robots sont exclus.</p>
        </div>
        <div className="flex gap-2" data-testid="stats-range-switch">
          {RANGES.map((r) => (
            <button key={r.v} onClick={() => setDays(r.v)} className={`chip ${days === r.v ? "chip-active" : ""}`} data-testid={`stats-range-${r.v}`}>{r.l}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6 mb-8">
        {kpis.map((k) => (
          <div key={k.id} className="card p-5" data-testid={k.id}>
            <p className="text-[11px] uppercase tracking-wider text-brand-ink/50 mb-1 flex items-center gap-1.5">
              {k.icon && <k.icon className="h-3.5 w-3.5 text-brand-green" />}{k.label}
            </p>
            <p className="font-serif text-3xl text-brand-ink">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-6" data-testid="stats-daily-chart">
        <p className="eyebrow mb-4">Jour par jour — pages vues et visiteurs uniques</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.daily} margin={{ left: -10, right: 8 }}>
              <CartesianGrid vertical={false} stroke="#E6E9E4" />
              <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} interval={days > 30 ? 6 : days > 7 ? 2 : 0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={frDate} formatter={(v, n) => [v, n === "views" ? "Pages vues" : "Visiteurs"]} />
              <Legend formatter={(v) => (v === "views" ? "Pages vues" : "Visiteurs uniques")} />
              <Bar dataKey="views" fill="#155C45" radius={[2, 2, 0, 0]} />
              <Bar dataKey="visitors" fill="#B8923A" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-brand-ink/50 mt-2">Cliquez sur un jour dans le tableau ci-dessous pour voir son détail heure par heure.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 mb-6">
        <div className="card p-6 lg:col-span-3" data-testid="stats-hourly-chart">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="eyebrow">Heure par heure — {frDate(data.range.focus_day)}</p>
            <input type="date" value={data.range.focus_day} max={data.range.end} onChange={(e) => setDay(e.target.value)} className="input-base !w-auto !py-1.5 !text-sm" data-testid="stats-day-picker" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourly} margin={{ left: -10, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#E6E9E4" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => [v, n === "views" ? "Pages vues" : "Visiteurs"]} />
                <Bar dataKey="views" fill="#155C45" radius={[2, 2, 0, 0]} />
                <Bar dataKey="visitors" fill="#B8923A" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-xs mt-4" data-testid="stats-hourly-table">
            <tbody>
              {chunk(data.hourly.filter((h) => h.views > 0), 4).map((row, i) => (
                <tr key={i} className="border-t border-brand-line">
                  {row.map((h) => (
                    <td key={h.hour} className="py-1.5 pr-3"><span className="font-semibold text-brand-ink">{h.label}</span> <span className="text-brand-ink/60">{h.views} vues · {h.visitors} vis.</span></td>
                  ))}
                </tr>
              ))}
              {data.hourly.every((h) => h.views === 0) && <tr><td className="py-2 text-brand-ink/50">Aucune visite enregistrée ce jour.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card p-6 lg:col-span-2" data-testid="stats-daily-table">
          <p className="eyebrow mb-4">Détail par jour</p>
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-brand-ink/50 border-b border-brand-line">
                  <th className="py-1.5">Jour</th><th className="py-1.5 text-right">Vues</th><th className="py-1.5 text-right">Visiteurs</th>
                </tr>
              </thead>
              <tbody>
                {[...data.daily].reverse().map((d) => (
                  <tr key={d.date} onClick={() => setDay(d.date)} className={`border-b border-brand-line last:border-0 cursor-pointer hover:bg-brand-ivory ${d.date === data.range.focus_day ? "bg-brand-ivory" : ""}`} data-testid={`stats-day-row-${d.date}`}>
                    <td className="py-1.5 capitalize">{frDate(d.date)}</td>
                    <td className="py-1.5 text-right font-semibold">{d.views}</td>
                    <td className="py-1.5 text-right text-brand-ink/70">{d.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6" data-testid="stats-heatmap">
        <p className="eyebrow mb-4">Carte de chaleur — 7 derniers jours × 24 heures</p>
        <div className="overflow-x-auto">
          <table className="text-[10px]">
            <thead>
              <tr>
                <th className="pr-2 text-left font-normal text-brand-ink/50" />
                {Array.from({ length: 24 }, (_, h) => <th key={h} className="w-7 font-normal text-brand-ink/50">{h}h</th>)}
              </tr>
            </thead>
            <tbody>
              {data.heatmap.map((d) => (
                <tr key={d.date}>
                  <td className="pr-2 whitespace-nowrap capitalize text-brand-ink/70">{frDate(d.date)}</td>
                  {d.hours.map((v, h) => (
                    <td key={h} className="p-0.5">
                      <div title={`${frDate(d.date)} ${h}h : ${v} vue(s)`} className="h-6 w-6 rounded-sm flex items-center justify-center text-white" style={{ backgroundColor: v ? `rgba(21,92,69,${0.18 + 0.82 * (v / heatMax)})` : "#EEF1EC" }}>{v || ""}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-6">
        <ListCard title="Pages les plus vues" rows={data.pages} keyName="path" id="stats-pages" />
        <ListCard title="Par type de page" rows={data.page_types} keyName="page" id="stats-page-types" />
        <ListCard title="Sources de trafic" rows={data.referrers} keyName="referrer" id="stats-referrers" />
        <ListCard title="Campagnes (utm_source)" rows={data.utm_sources} keyName="source" id="stats-utm" empty="Aucune campagne taguée." />
        <ListCard title="Appareils" rows={data.devices} keyName="device" id="stats-devices" />
        <ListCard title="Navigateurs" rows={data.browsers} keyName="browser" id="stats-browsers" />
      </div>

      <div className="card p-6" data-testid="stats-recent">
        <p className="eyebrow mb-4">Dernières visites (60)</p>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-brand-ink/50 border-b border-brand-line">
                <th className="py-1.5 pr-3">Date / heure</th><th className="py-1.5 pr-3">Page</th><th className="py-1.5 pr-3">Source</th><th className="py-1.5 pr-3">Appareil</th><th className="py-1.5">Navigateur</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((v, i) => (
                <tr key={i} className="border-b border-brand-line last:border-0">
                  <td className="py-1.5 pr-3 whitespace-nowrap text-brand-ink/60">{new Date(v.ts).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</td>
                  <td className="py-1.5 pr-3 font-mono">{v.path}</td>
                  <td className="py-1.5 pr-3">{v.referrer}{v.utm_source ? ` · ${v.utm_source}` : ""}</td>
                  <td className="py-1.5 pr-3">{v.device} {v.screen ? `(${v.screen}px)` : ""}</td>
                  <td className="py-1.5">{v.browser}</td>
                </tr>
              ))}
              {data.recent.length === 0 && <tr><td colSpan={5} className="py-3 text-brand-ink/50">Aucune visite enregistrée pour l'instant.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function ListCard({ title, rows, keyName, id, empty = "Aucune donnée." }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <div className="card p-6" data-testid={id}>
      <p className="eyebrow mb-4">{title}</p>
      {rows.length === 0 ? <p className="text-sm text-brand-ink/50">{empty}</p> : (
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r[keyName]} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate text-brand-ink/80">{r[keyName]}</span>
                <span className="whitespace-nowrap font-semibold">{r.views} <span className="text-brand-ink/45 font-normal">· {r.visitors} vis.</span></span>
              </div>
              <div className="h-1 bg-brand-ivory rounded-sm mt-1"><div className="h-1 bg-brand-green rounded-sm" style={{ width: `${(r.views / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
