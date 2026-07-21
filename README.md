# Proyecto Escuela de Música

Este proyecto incluye una API sencilla en Python y una página web estática para mostrar información de una escuela de música.

## Estructura

- `main.py` — servidor HTTP con endpoints de API
- `index.html` — frontend simple que consume la API
- `requirements.txt` — dependencias del proyecto

## Requisitos

- Python 3.9 o superior

## Ejecutar el proyecto

1. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

2. Inicia el servidor:
   ```bash
   python main.py
   ```

3. Abre en tu navegador:
   ```text
   http://localhost:8000
   ```

## Endpoints disponibles

- `GET /api/escuela` — devuelve información de la escuela y sus cursos
- `GET /api/saludo` — devuelve un mensaje de prueba
