"""Moonlight MP3 · pega un enlace y descarga su sonido en mp3 (128 kbps, listo para subir a Música).
Úsalo solo con contenido que tengas derecho a descargar."""
import os, sys, threading, subprocess, tkinter as tk
from pathlib import Path
from tkinter import ttk

import yt_dlp
import imageio_ffmpeg

CARPETA = Path.home() / "Downloads" / "Moonlight MP3"
BG, PANEL, ORO, TXT, SUAVE = "#0d1130", "#1a2050", "#f6e7b4", "#eef0fb", "#a9a3f0"

def abre(carpeta: Path):
    try:
        if sys.platform.startswith("win"): os.startfile(carpeta)
        elif sys.platform == "darwin": subprocess.Popen(["open", str(carpeta)])
        else: subprocess.Popen(["xdg-open", str(carpeta)])
    except Exception:
        pass

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Moonlight MP3"); self.configure(bg=BG); self.geometry("560x330"); self.minsize(480, 300)
        tk.Label(self, text="🌙  Moonlight MP3", bg=BG, fg=ORO, font=("Georgia", 22, "italic")).pack(pady=(22, 4))
        tk.Label(self, text="1 · Pon aquí el enlace de la canción", bg=BG, fg=SUAVE, font=("Georgia", 12)).pack(pady=(10, 6))
        self.url = tk.StringVar()
        e = tk.Entry(self, textvariable=self.url, font=("Segoe UI", 12), bg=PANEL, fg=TXT, insertbackground=ORO,
                     relief="flat", highlightthickness=1, highlightbackground=SUAVE, highlightcolor=ORO)
        e.pack(fill="x", padx=36, ipady=8); e.focus_set(); e.bind("<Return>", lambda _: self.empieza())
        tk.Label(self, text="2 · Haz clic aquí para descargar el sonido", bg=BG, fg=SUAVE, font=("Georgia", 12)).pack(pady=(18, 6))
        self.btn = tk.Button(self, text="⬇  Descargar sonido (mp3)", command=self.empieza, bg=ORO, fg="#2a1f55",
                             activebackground="#fff4c8", relief="flat", font=("Georgia", 13, "bold"), padx=22, pady=8, cursor="hand2")
        self.btn.pack()
        self.barra = ttk.Progressbar(self, mode="indeterminate", length=320)
        self.msg = tk.Label(self, text="", bg=BG, fg=TXT, font=("Segoe UI", 10), wraplength=500, justify="center")
        self.msg.pack(pady=14)

    def estado(self, t, color=TXT): self.after(0, lambda: self.msg.config(text=t, fg=color))

    def empieza(self):
        u = self.url.get().strip()
        if not u.startswith("http"): return self.estado("Pega primero un enlace (empieza por https://)", "#ffb3b3")
        self.btn.config(state="disabled"); self.barra.pack(pady=(10, 0)); self.barra.start(12); self.estado("Descargando…")
        threading.Thread(target=self.baja, args=(u,), daemon=True).start()

    def baja(self, u):
        try:
            CARPETA.mkdir(parents=True, exist_ok=True)
            opts = {"format": "bestaudio/best", "outtmpl": str(CARPETA / "%(title).80s.%(ext)s"), "noplaylist": True, "quiet": True, "no_warnings": True,
                    "ffmpeg_location": imageio_ffmpeg.get_ffmpeg_exe(),
                    "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "128"}]}
            with yt_dlp.YoutubeDL(opts) as y:
                info = y.extract_info(u, download=True); ruta = Path(y.prepare_filename(info)).with_suffix(".mp3")
            mb = ruta.stat().st_size / 1048576 if ruta.exists() else 0
            aviso = "  ⚠ Pesa más de 15 MB: Música no lo aceptará." if mb > 15 else ""
            self.estado(f"✔ Listo: {ruta.name} ({mb:.1f} MB)\nGuardado en la carpeta Descargas › Moonlight MP3.{aviso}", ORO); abre(CARPETA)
        except Exception as ex:
            self.estado("No se pudo descargar. Comprueba el enlace o inténtalo más tarde.\n" + str(ex)[:140], "#ffb3b3")
        finally:
            self.after(0, lambda: (self.barra.stop(), self.barra.pack_forget(), self.btn.config(state="normal")))

if __name__ == "__main__":
    App().mainloop()
