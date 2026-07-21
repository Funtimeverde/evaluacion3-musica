import json
import mimetypes
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = int(os.getenv("PORT", "8000"))


class EscuelaHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/"):
            self._handle_api()
            return

        if self.path in {"/", "/index.html"}:
            file_path = ROOT / "index.html"
        else:
            file_path = ROOT / self.path.lstrip("/")

        if file_path.exists() and file_path.is_file():
            self._serve_file(file_path)
        else:
            self._send_json({"error": "No encontrado"}, status=404)

    def _handle_api(self):
        if self.path == "/api/escuela":
            payload = {
                "nombre": "Escuela de Música Sonidos del Futuro",
                "descripcion": "Una plataforma simple para explorar cursos y actividades musicales.",
                "cursos": [
                    {"nombre": "Piano", "nivel": "Principiante"},
                    {"nombre": "Guitarra", "nivel": "Intermedio"},
                    {"nombre": "Canto", "nivel": "Avanzado"},
                ],
            }
            self._send_json(payload)
        elif self.path == "/api/saludo":
            self._send_json({"mensaje": "Hola desde la API de la escuela de música"})
        else:
            self._send_json({"error": "Endpoint no encontrado"}, status=404)

    def _serve_file(self, file_path: Path):
        content_type = "text/html; charset=utf-8"
        if file_path.suffix == ".css":
            content_type = "text/css; charset=utf-8"
        elif file_path.suffix == ".js":
            content_type = "application/javascript; charset=utf-8"
        elif file_path.suffix == ".json":
            content_type = "application/json; charset=utf-8"

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(file_path.stat().st_size))
        self.end_headers()
        with file_path.open("rb") as fh:
            self.wfile.write(fh.read())

    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


def main():
    mimetypes.init()
    server = HTTPServer(("0.0.0.0", PORT), EscuelaHandler)
    print(f"Servidor escuchando en http://localhost:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
