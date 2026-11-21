import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AtmoSense AI API")

# Permite que tu página en Vercel/v0 se conecte a esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

modelo = joblib.load("modelo_final.joblib")

class DatosSensor(BaseModel):
    O3: float
    CO: float
    PM25: float

@app.get("/")
def home():
    return {"status": "AtmoSense AI API activa"}

@app.post("/predict")
def predecir_no2(datos: DatosSensor):
    df_entrada = pd.DataFrame([{
        "O3": datos.O3,
        "CO": datos.CO,
        "PM2.5": datos.PM25,
    }])
    pred = float(modelo.predict(df_entrada)[0])
    return {"no2_ppm": round(pred, 4)}
