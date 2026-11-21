export type Pollutant = "no2" | "o3" | "co" | "pm25"
export type PredictionPayload = {
  temperature: number
  humidity: number
  co: number
  o3: number
  pm25: number
}

export const pollutants: Record<Pollutant, { label: string; unit: string }> = {
  no2: { label: "NO2", unit: "ppm" },
  o3: { label: "O3", unit: "ppm" },
  co: { label: "CO", unit: "ppm" },
  pm25: { label: "PM2.5", unit: "µg/m³" },
}

export const historical = Array.from({ length: 84 }, (_, i) => {
  const date = new Date(2021, 0, i + 1)
  const no2 = i === 0 ? 0.002 : i === 1 ? 0.1 : 0.017 + ((i * 17) % 23) * 0.0007 + Math.sin(i * 0.73) * 0.005
  return {
    date: date.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
    no2: +no2.toFixed(3),
    o3: +(0.012 + ((i * 11) % 31) * 0.0017 + Math.sin(i * 0.51) * 0.009).toFixed(3),
    co: +(0.22 + ((i * 13) % 27) * 0.09 + Math.sin(i * 0.61) * 0.23).toFixed(2),
    pm25: +(12 + ((i * 19) % 37) * 1.9 + Math.sin(i * 0.43) * 8).toFixed(1),
  }
})

export const observed = Array.from({ length: 18 }, (_, i) => {
  const real = +(0.009 + (i % 6) * 0.006 + Math.sin(i * 1.4) * 0.002).toFixed(4)
  return {
    sample: `M${String(i + 1).padStart(2, "0")}`,
    real,
    predicted: +(real + Math.sin(i * 2.2) * 0.002 - 0.0003).toFixed(4),
  }
})

export async function predictAirQuality(payload: PredictionPayload): Promise<{ value: number; source: "api" | "simulation" }> {
  const endpoint = process.env.NEXT_PUBLIC_API_URL
  if (endpoint) {
    try {
      const response = await fetch(`${endpoint.replace(/\/$/, "")}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        const data = await response.json()
        if (typeof data.prediction === "number" && Number.isFinite(data.prediction)) {
          return { value: Math.min(0.1, Math.max(0.002, +data.prediction.toFixed(4))), source: "api" }
        }
      }
    } catch {
      // La demo continúa con la estimación local si la API no está disponible.
    }
  }

  const estimate =
    0.0285 +
    (payload.temperature - 17.2) * 0.00012 +
    (payload.humidity - 51.5) * 0.000018 +
    (payload.co - 0.74) * 0.0032 +
    (payload.o3 - 0.031) * 0.085 +
    (payload.pm25 - 22.3) * 0.00011

  return { value: Math.min(0.1, Math.max(0.002, +estimate.toFixed(4))), source: "simulation" }
}
