import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import psycopg2

# 1. Cargar las variables de entorno desde el archivo .env
load_dotenv()

# 2. Configurar la API Key desde el archivo .env
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("Error: La variable GROQ_API_KEY no está configurada en el archivo .env")

# 3. Configurar la base de datos PostgreSQL desde el archivo .env (con valores por defecto por si acaso)
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "cv_builder_db"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "gamer358"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432")
}

app = FastAPI(title="Backend CV con Groq IA")

# Permite peticiones desde el navegador (HTML/JS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PeticionMejorar(BaseModel):
    texto: str
    seccion: str
    idioma: str = "es"

@app.get("/")
def inicio():
    return {"mensaje": "¡El servidor FastAPI con Groq está funcionando!"}

@app.post("/api/mejorar-cv")
async def mejorar_cv(datos: PeticionMejorar):
    if not datos.texto.strip():
        raise HTTPException(status_code=400, detail="El texto no puede estar vacío.")

    # Prompts estructurados según la sección
    prompts = {
        "experiencia": "Eres un experto en reclutamiento. Transforma la idea recibida en viñetas de experiencia laboral profesionales (•), usando verbos de acción.",
        "formacion": "Organiza y da formato profesional a la sección de educación.",
        "competencias": "Clasifica las habilidades en Técnicas y Blandas para un currículum."
    }

    system_prompt = prompts.get(datos.seccion, "Optimiza y profesionaliza este texto para un Currículum Vitae.")

    # 1. Llamada a la API de Groq
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": f"{system_prompt} Responde en idioma: {datos.idioma}."},
                        {"role": "user", "content": datos.texto}
                    ],
                    "temperature": 0.5
                },
                timeout=30.0
            )

            res_json = response.json()

            if response.status_code != 200:
                mensaje_error = res_json.get("error", {}).get("message", "Error en la API de Groq")
                raise HTTPException(status_code=response.status_code, detail=f"Error de Groq: {mensaje_error}")

            texto_generado = res_json["choices"][0]["message"]["content"]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión con Groq: {str(e)}")

    # 2. Guardar en PostgreSQL
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO historial_ia (seccion, texto_original, texto_generado) VALUES (%s, %s, %s)",
            (datos.seccion, datos.texto, texto_generado)
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as db_err:
        raise HTTPException(status_code=500, detail=f"Error al guardar en PostgreSQL: {str(db_err)}")

    return {"resultado": texto_generado}