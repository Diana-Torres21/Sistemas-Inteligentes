"use client"

import { useState } from "react"
import { Activity, AlertTriangle, CheckCircle2, CircleDot, LoaderCircle, Radio, Sparkles, Wind } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"

type Inputs = { co: number; pm25: number; o3: number }
type Estimate = { value: number; source: "api" | "fallback" }
type InputKey = keyof Inputs

const initialValues: Inputs = { co: 0.75, pm25: 22, o3: 0.028 }
const scenarios: { name: string; values: Inputs }[] = [
  { name: "Día Limpio", values: { co: 0.35, pm25: 10, o3: 0.02 } },
  { name: "Promedio CDMX", values: initialValues },
  { name: "Alta Congestión", values: { co: 2.2, pm25: 65, o3: 0.055 } },
]
const controls: { key: InputKey; label: string; short: string; min: number; max: number; step: number; unit: string; digits: number }[] = [
  { key: "co", label: "Monóxido de carbono", short: "CO", min: 0, max: 5, step: 0.05, unit: "ppm", digits: 2 },
  { key: "pm25", label: "Partículas finas", short: "PM2.5", min: 0, max: 150, step: 0.5, unit: "µg/m³", digits: 1 },
  { key: "o3", label: "Ozono", short: "O₃", min: 0, max: 0.095, step: 0.001, unit: "ppm", digits: 3 },
]
const monthly = [
  { mes: "Ene 21", NO2: 0.0268, O3: 0.0266, CO: 0.75, PM25: 20.9 }, { mes: "Feb 21", NO2: 0.0269, O3: 0.0324, CO: 0.78, PM25: 23.1 },
  { mes: "Mar 21", NO2: 0.0253, O3: 0.036, CO: 0.75, PM25: 27.1 }, { mes: "Abr 21", NO2: 0.0242, O3: 0.0407, CO: 0.71, PM25: 29.1 },
  { mes: "May 21", NO2: 0.0197, O3: 0.0369, CO: 0.58, PM25: 19.6 }, { mes: "Jun 21", NO2: 0.0198, O3: 0.0257, CO: 0.58, PM25: 13.2 },
  { mes: "Jul 21", NO2: 0.022, O3: 0.0273, CO: 0.61, PM25: 17.9 }, { mes: "Ago 21", NO2: 0.0196, O3: 0.0254, CO: 0.57, PM25: 14 },
  { mes: "Sep 21", NO2: 0.021, O3: 0.026, CO: 0.56, PM25: 14.7 }, { mes: "Oct 21", NO2: 0.0221, O3: 0.0253, CO: 0.64, PM25: 15.3 },
  { mes: "Nov 21", NO2: 0.0268, O3: 0.0264, CO: 0.67, PM25: 19.3 }, { mes: "Dic 21", NO2: 0.0355, O3: 0.0271, CO: 0.95, PM25: 25.5 },
]
const validation = [
  { mes: "Nov 19", real: 0.0304, pred: 0.0305 }, { mes: "Dic 19", real: 0.0326, pred: 0.0322 }, { mes: "Ene 20", real: 0.0273, pred: 0.0286 },
  { mes: "Feb 20", real: 0.0269, pred: 0.0274 }, { mes: "Mar 20", real: 0.0242, pred: 0.0265 }, { mes: "Abr 20", real: 0.0175, pred: 0.0242 },
  { mes: "May 20", real: 0.0173, pred: 0.024 }, { mes: "Jun 20", real: 0.0148, pred: 0.022 }, { mes: "Jul 20", real: 0.0169, pred: 0.0226 },
  { mes: "Ago 20", real: 0.0171, pred: 0.0218 }, { mes: "Sep 20", real: 0.0188, pred: 0.022 }, { mes: "Oct 20", real: 0.0225, pred: 0.023 },
  { mes: "Nov 20", real: 0.0272, pred: 0.0259 }, { mes: "Dic 20", real: 0.0283, pred: 0.0273 }, { mes: "Ene 21", real: 0.0268, pred: 0.0273 },
  { mes: "Feb 21", real: 0.0269, pred: 0.0277 }, { mes: "Mar 21", real: 0.0253, pred: 0.0283 }, { mes: "Abr 21", real: 0.0242, pred: 0.0275 },
  { mes: "May 21", real: 0.0197, pred: 0.0236 }, { mes: "Jun 21", real: 0.0198, pred: 0.0214 }, { mes: "Jul 21", real: 0.022, pred: 0.0233 },
  { mes: "Ago 21", real: 0.0196, pred: 0.0215 }, { mes: "Sep 21", real: 0.021, pred: 0.0216 }, { mes: "Oct 21", real: 0.0221, pred: 0.0227 },
  { mes: "Nov 21", real: 0.0268, pred: 0.0247 }, { mes: "Dic 21", real: 0.0355, pred: 0.032 },
]
const models = [
  { name: "Gradient Boosting Regressor", mae: "0.0051", rmse: "0.0065", r2: "0.4504", status: "Modelo Seleccionado" },
  { name: "Random Forest Regressor", mae: "0.0051", rmse: "0.0066", r2: "0.4293", status: "Validado" },
  { name: "Regresión Lineal Múltiple", mae: "0.0053", rmse: "0.0068", r2: "0.4062", status: "Línea base" },
]
const chartConfig = {
  NO2: { label: "NO₂", color: "#4A5335" }, O3: { label: "O₃", color: "#7D8A62" }, CO: { label: "CO", color: "#87966A" }, PM25: { label: "PM2.5", color: "#A9A37E" },
  real: { label: "Real", color: "#4A5335" }, pred: { label: "Predicho", color: "#B18848" },
  variance: { label: "Varianza explicada", color: "#7D8A62" },
} satisfies ChartConfig
const metricOptions = ["NO2", "O3", "CO", "PM25"] as const

type Metric = (typeof metricOptions)[number]
function SectionTitle({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="eyebrow">{eyebrow}</p><h2 className="section-title">{title}</h2></div>{detail && <p className="max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">{detail}</p>}</div>
}
function Header() {
  return <header className="border-b border-[#D6D1C2]/80 bg-[#F5F3EC]/90"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><div className="flex items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#4A5335] text-[#F5F3EC]"><Wind className="size-5" strokeWidth={1.7}/></div><div><h1 className="font-serif text-[22px] font-semibold tracking-[-.04em]">AtmoSense <span className="text-[#4A5335]">AI</span></h1><p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Sensor Virtual de NO₂ · Red SINAICA Valle de México (CDMX)</p></div></div><Badge variant="outline" className="w-fit gap-2 border-[#D6D1C2] bg-[#EBE7DC] px-3 py-1.5 text-[11px] font-medium text-[#4A5335]"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7D8A62] opacity-40"/><span className="relative inline-flex size-2 rounded-full bg-[#7D8A62]"/></span>API Gradient Boosting en vivo</Badge></div></header>
}
function RiskPanel({ result }: { result: Estimate | null }) {
  const risk = result ? result.value < 0.025 ? "low" : result.value <= 0.045 ? "moderate" : "high" : "none"
  const progress = result ? Math.max(4, Math.min(100, result.value / 0.06 * 100)) : 0
  const display = risk === "low" ? { label: "Nivel Bajo (Calidad Buena)", className: "text-[#496843]", icon: CheckCircle2 } : risk === "moderate" ? { label: "Nivel Moderado (Precaución)", className: "text-[#A67528]", icon: AlertTriangle } : risk === "high" ? { label: "Nivel Alto (Alerta Preventiva)", className: "text-[#B4473D]", icon: AlertTriangle } : { label: "Esperando estimación", className: "text-[#73766D]", icon: CircleDot }
  const Icon = display.icon
  const fill = risk === "low" ? "bg-[#6D8A60]" : risk === "moderate" ? "bg-[#C69A4C]" : risk === "high" ? "bg-[#C25C4F]" : "bg-[#D6D1C2]"
  return <Card className="h-full overflow-hidden border-[#D6D1C2] bg-[#EBE7DC]/65"><CardContent className="flex h-full min-h-[365px] flex-col justify-between p-6 sm:p-8"><div><div className="flex items-center justify-between gap-3"><p className="eyebrow">Resultado de inferencia</p><Badge variant="outline" className="border-[#D6D1C2] bg-[#F5F3EC] text-[10px] text-[#4A5335]">{result?.source === "api" ? "API Render (Gradient Boosting)" : result ? "Respaldo local" : "En espera"}</Badge></div><p className="mt-8 font-serif text-5xl tracking-[-.06em] text-[#2C331F] sm:text-6xl">{result ? result.value.toFixed(4) : "—.———"}<span className="ml-2 text-base font-sans tracking-normal text-[var(--muted-foreground)]">ppm</span></p><div className={`mt-5 flex items-center gap-2 text-sm font-medium ${display.className}`}><Icon className="size-4"/>{display.label}</div></div><div className="mt-10"><div className="mb-2 flex justify-between text-[10px] text-[var(--muted-foreground)]"><span>0.000</span><span>0.025</span><span>0.045</span><span>0.060+ ppm</span></div><div className="relative h-2.5 overflow-hidden rounded-full bg-[#D6D1C2]"><div className="absolute inset-y-0 left-0 w-[41.67%] bg-[#93A788]"/><div className="absolute inset-y-0 left-[41.67%] w-[33.33%] bg-[#DEC28A]"/><div className="absolute inset-y-0 right-0 w-[25%] bg-[#D9A49A]"/><div className={`absolute top-0 h-full w-1.5 rounded-full border border-white shadow ${fill}`} style={{ left: `calc(${progress}% - 3px)` }}/></div><div className="mt-4 flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]"><Activity className="size-3.5 text-[#7D8A62]"/>Umbrales de riesgo para concentración estimada de NO₂</div></div></CardContent></Card>
}
function Simulator() {
  const [values, setValues] = useState<Inputs>(initialValues)
  const [result, setResult] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  function update(key: InputKey, value: number) { const config = controls.find(item => item.key === key)!; const bounded = Math.min(config.max, Math.max(config.min, Number.isFinite(value) ? value : config.min)); const normalized = Number(bounded.toFixed(config.digits)); setValues(current => ({ ...current, [key]: normalized })) }
  async function estimate() {
    setLoading(true); setError("")
    const fallback = Math.max(0.002, 0.00866 - 0.061384 * values.o3 + 0.018566 * values.co + 0.000277 * values.pm25)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const response = await fetch("https://atmosense-api.onrender.com/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ O3: values.o3, CO: values.co, PM25: values.pm25 }), signal: controller.signal })
      if (!response.ok) throw new Error(`API ${response.status}`)
      const data = await response.json()
      if (typeof data.no2_ppm !== "number" || !Number.isFinite(data.no2_ppm)) throw new Error("Respuesta inválida")
      setResult({ value: data.no2_ppm, source: "api" })
    } catch {
      setResult({ value: fallback, source: "fallback" })
      setError("No se pudo consultar la API; se muestra el cálculo de respaldo.")
    } finally { clearTimeout(timeout); setLoading(false) }
  }
  return <div className="space-y-8"><SectionTitle eyebrow="En vivo · Producto" title="Simulador y monitoreo" detail="Ajusta los contaminantes medidos por la red y estima la concentración de dióxido de nitrógeno con el modelo Gradient Boosting."/><section aria-label="Simulador en vivo" className="grid items-stretch gap-4 lg:grid-cols-2"><Card><CardHeader className="pb-3"><div className="flex items-center gap-3"><div className="rounded-lg bg-[#4A5335]/10 p-2 text-[#4A5335]"><Wind className="size-4"/></div><div><CardTitle className="text-base">Variables del modelo</CardTitle><p className="mt-1 text-xs text-[var(--muted-foreground)]">Entradas exactas de la API · SINAICA CDMX</p></div></div></CardHeader><CardContent className="space-y-5">{controls.map(control => <div key={control.key}><div className="mb-2 flex items-center justify-between gap-3"><label htmlFor={`input-${control.key}`} className="text-sm font-medium">{control.label} <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">{control.short} ({control.unit})</span></label><Input id={`input-${control.key}`} aria-label={`${control.short} valor`} type="number" className="h-8 w-[92px] bg-[#F5F3EC] text-right text-xs tabular-nums" min={control.min} max={control.max} step={control.step} value={values[control.key]} onChange={event => update(control.key, Number(event.target.value))}/></div><Slider aria-label={`${control.short} ${control.unit}`} value={[values[control.key]]} min={control.min} max={control.max} step={control.step} onValueChange={next => update(control.key, typeof next === "number" ? next : next[0])}/><div className="mt-1 flex justify-between text-[10px] tabular-nums text-[var(--muted-foreground)]"><span>{control.min.toFixed(control.digits)}</span><span>{control.max.toFixed(control.digits)}</span></div></div>)}<div className="flex flex-wrap gap-2 pt-1">{scenarios.map(scenario => <Button key={scenario.name} variant="outline" size="sm" className="border-[#D6D1C2] bg-[#F5F3EC] text-xs hover:bg-[#EBE7DC]" onClick={() => setValues(scenario.values)}>{scenario.name}</Button>)}</div><Button className="h-11 w-full bg-[#4A5335] text-white hover:bg-[#2C331F]" onClick={estimate} disabled={loading}>{loading ? <LoaderCircle className="animate-spin" data-icon="inline-start"/> : <Sparkles data-icon="inline-start"/>}{loading ? "Consultando modelo..." : "Estimar NO₂ en vivo"}</Button>{error && <p role="status" className="text-xs text-[#A04D3F]">{error}</p>}</CardContent></Card><RiskPanel result={result}/></section><section aria-label="Indicadores de la red"><div className="mb-3 flex items-center gap-2"><Radio className="size-4 text-[#7D8A62]"/><h3 className="text-sm font-semibold">Red SINAICA · Valle de México</h3></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Promedio Histórico NO₂" value="0.0270" unit="ppm"/><Kpi label="Pico Máximo Registrado" value="0.0998" unit="ppm"/><Kpi label="Lecturas Válidas Analizadas" value="38,825" unit="registros"/><Kpi label="Cobertura" value="16 estaciones" unit="2016–2021"/></div></section><MonthlyChart/></div>
}
function Kpi({ label, value, unit }: { label: string; value: string; unit: string }) {
  return <Card className="border-[#D6D1C2]/80 bg-[#FBFAF6]"><CardContent className="p-4"><p className="text-[11px] font-medium text-[var(--muted-foreground)]">{label}</p><div className="mt-2 flex flex-wrap items-baseline gap-x-2"><span className="font-serif text-2xl tracking-tight text-[#2C331F]">{value}</span><span className="text-[10px] text-[var(--muted-foreground)]">{unit}</span></div></CardContent></Card>
}
function MonthlyChart() {
  const [metric, setMetric] = useState<Metric>("NO2")
  const label = metric === "NO2" ? "NO₂ (ppm)" : metric === "PM25" ? "PM2.5 (µg/m³)" : `${metric} (ppm)`
  return <Card><CardHeader className="flex flex-row items-start justify-between gap-4"><div><p className="eyebrow">Datos observados · 2021</p><CardTitle className="chart-title">Evolución mensual</CardTitle></div><Select value={metric} onValueChange={value => value && setMetric(value as Metric)}><SelectTrigger className="w-[145px] bg-[#F5F3EC]" aria-label="Contaminante de la gráfica"><SelectValue/></SelectTrigger><SelectContent><SelectGroup>{metricOptions.map(option => <SelectItem key={option} value={option}>{option === "NO2" ? "NO₂" : option === "PM25" ? "PM2.5" : option}</SelectItem>)}</SelectGroup></SelectContent></Select></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-[260px] w-full"> <LineChart data={monthly} margin={{ top: 8, right: 10, left: 4, bottom: 0 }}><CartesianGrid vertical={false} stroke="#D6D1C2" strokeDasharray="3 5"/><XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "#74776D", fontSize: 10 }}/><YAxis tickLine={false} axisLine={false} width={52} tick={{ fill: "#74776D", fontSize: 10 }} tickFormatter={value => metric === "NO2" || metric === "O3" ? Number(value).toFixed(3) : String(value)}/><Tooltip formatter={(value) => [`${Number(value).toFixed(metric === "NO2" || metric === "O3" ? 4 : 1)} ${metric === "PM25" ? "µg/m³" : "ppm"}`, label]}/><Line type="monotone" dataKey={metric} stroke={`var(--color-${metric})`} strokeWidth={2.5} dot={{ r: 3, fill: "#F5F3EC", strokeWidth: 2 }}/></LineChart></ChartContainer></CardContent></Card>
}
function Evaluation() {
  return <div className="space-y-6"><SectionTitle eyebrow="Validación técnica · NO₂" title="Validación de IA y PCA" detail="Partición temporal estricta 80/20 · corte 19-Nov-2019 · sin fuga de datos."/><Card><CardHeader className="flex-row items-end justify-between gap-3"><div><p className="eyebrow">Benchmark · conjunto de prueba</p><CardTitle className="chart-title">Comparativa de modelos</CardTitle></div><Badge variant="outline" className="border-[#D6D1C2] text-[#5A5D54]">Temporal 80 / 20</Badge></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b border-[#D6D1C2] text-[10px] uppercase tracking-[.12em] text-[var(--muted-foreground)]"><th className="pb-3 font-medium">Modelo</th><th className="pb-3 font-medium">MAE (ppm)</th><th className="pb-3 font-medium">RMSE (ppm)</th><th className="pb-3 font-medium">R²</th><th className="pb-3 font-medium">Estado</th></tr></thead><tbody>{models.map((model, index) => <tr key={model.name} className="border-b border-[#D6D1C2]/70 last:border-0"><th scope="row" className="py-3.5 font-medium">{model.name}</th><td className="py-3.5 tabular-nums">{model.mae}</td><td className="py-3.5 tabular-nums">{model.rmse}</td><td className="py-3.5 tabular-nums">{model.r2}</td><td className="py-3.5">{index === 0 ? <Badge className="bg-[#4A5335] text-white">{model.status}</Badge> : <span className="text-xs text-[var(--muted-foreground)]">{model.status}</span>}</td></tr>)}</tbody></table></div><p className="mt-3 text-[11px] text-[var(--muted-foreground)]">30,453 registros de entrenamiento · 8,372 de prueba · MAE/RMSE en ppm</p></CardContent></Card><Card><CardHeader><p className="eyebrow">Nov 2019 – Dic 2021</p><CardTitle className="chart-title">NO₂ real vs. predicho</CardTitle></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-[300px] w-full"><LineChart data={validation} margin={{ top: 8, right: 10, left: 4, bottom: 0 }}><CartesianGrid vertical={false} stroke="#D6D1C2" strokeDasharray="3 5"/><XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={10} interval={2} tick={{ fill: "#74776D", fontSize: 10 }}/><YAxis domain={[0.01, 0.04]} tickLine={false} axisLine={false} width={54} tick={{ fill: "#74776D", fontSize: 10 }} tickFormatter={value => Number(value).toFixed(3)}/><Line type="monotone" dataKey="real" stroke="var(--color-real)" strokeWidth={2.5} dot={false}/><Line type="monotone" dataKey="pred" stroke="var(--color-pred)" strokeWidth={2.5} strokeDasharray="5 4" dot={false}/></LineChart></ChartContainer><div className="mt-2 flex flex-wrap gap-5 text-xs text-[var(--muted-foreground)]"><span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-[#4A5335]"/>NO₂ real</span><span className="flex items-center gap-2"><span className="h-0.5 w-5 border-t-2 border-dashed border-[#B18848]"/>Predicción Gradient Boosting</span></div></CardContent></Card><div className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><p className="eyebrow">Reducción dimensional</p><CardTitle className="chart-title">Varianza explicada · PCA</CardTitle><p className="text-sm text-[var(--muted-foreground)]">PC1 + PC2 explican el <strong className="text-[#4A5335]">88.47%</strong> de la varianza total.</p></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-[220px] w-full"><BarChart data={[{ component: "PC1", value: 51.14 }, { component: "PC2", value: 37.33 }, { component: "PC3", value: 11.53 }]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><CartesianGrid vertical={false} stroke="#D6D1C2" strokeDasharray="3 5"/><XAxis dataKey="component" tickLine={false} axisLine={false} tick={{ fill: "#74776D", fontSize: 11 }}/><YAxis domain={[0, 60]} tickLine={false} axisLine={false} width={38} tick={{ fill: "#74776D", fontSize: 10 }} tickFormatter={value => `${value}%`}/><Bar dataKey="value" fill="var(--color-variance)" radius={[6, 6, 0, 0]}/></BarChart></ChartContainer></CardContent></Card><Card><CardHeader><p className="eyebrow">Gradient Boosting</p><CardTitle className="chart-title">Importancia y metodología</CardTitle></CardHeader><CardContent><div className="space-y-4">{[{ name: "CO", value: 80 }, { name: "PM2.5", value: 18 }, { name: "O₃", value: 2 }].map(item => <div key={item.name}><div className="mb-1.5 flex justify-between text-xs"><span>{item.name}</span><span className="tabular-nums text-[var(--muted-foreground)]">{item.value}%</span></div><div className="h-2 rounded-full bg-[#EBE7DC]"><div className="h-full rounded-full bg-[#71805A]" style={{ width: `${item.value}%` }}/></div></div>)}</div><ul className="mt-6 space-y-3 border-t border-[#D6D1C2] pt-5 text-xs leading-5 text-[var(--muted-foreground)]"><li>Imputador estacional por estación y temporada, entrenado sin fuga de datos.</li><li>30,453 registros de entrenamiento y 8,372 registros de prueba.</li><li>Despliegue desacoplado: FastAPI en Render + Next.js en Vercel.</li></ul></CardContent></Card></div></div>
}
export function AtmoSenseDashboard() {
  return <main className="min-h-screen bg-[#F5F3EC] text-[#1E201D]"><Header/><div className="mx-auto max-w-[1440px] px-5 pb-9 pt-7 sm:px-8 lg:px-12 lg:pt-9"><Tabs defaultValue="simulator" className="gap-6"><TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-[#D6D1C2] bg-transparent p-0"><TabsTrigger value="simulator" className="rounded-none border-b-2 border-transparent px-4 py-3 text-xs data-[state=active]:border-[#4A5335] data-[state=active]:bg-transparent data-[state=active]:text-[#4A5335] sm:text-sm">Simulador y Monitoreo</TabsTrigger><TabsTrigger value="validation" className="rounded-none border-b-2 border-transparent px-4 py-3 text-xs data-[state=active]:border-[#4A5335] data-[state=active]:bg-transparent data-[state=active]:text-[#4A5335] sm:text-sm">Validación de IA y PCA</TabsTrigger></TabsList><TabsContent value="simulator" className="mt-0"><Simulator/></TabsContent><TabsContent value="validation" className="mt-0"><Evaluation/></TabsContent></Tabs><footer className="mt-8 border-t border-[#D6D1C2]/80 pt-4 text-center text-[11px] text-[var(--muted-foreground)]">AtmoSense AI · Datos reales Red SINAICA Valle de México</footer></div></main>
}
