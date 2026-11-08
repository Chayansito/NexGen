#!/usr/bin/env python3
"""Descarga la Google Sheet publicada (CSV) y la convierte a data/setups.json.

Uso:
  python3 scripts/sheet_to_json.py                 # descarga de la URL publicada
  python3 scripts/sheet_to_json.py --file x.csv    # prueba local con un CSV
"""
import csv, io, json, os, sys, urllib.request

SHEET_CSV_URL = os.environ.get(
    "SHEET_CSV_URL",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vShPTNgVoClsfo6qXxPKgh-uKwPqKDHB8rtaxROlVk1mCZ4_7TKIML5wBxd08xOfP9Q2Gf5b5o2Fi1b/pub?gid=906394055&single=true&output=csv",
)
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "setups.json")

# Solo estas columnas llegan al sitio (se descarta Timestamp, mails, etc.)
COLUMNS = ["Track", "Tyre", "Sector 1", "Sector 2", "Sector 3", "Lap Time",
           "Wing Setup", "Brake Balance", "Suspension", "Down Force Level",
           "Driver", "Team"]


def read_csv_text():
    if "--file" in sys.argv:
        with open(sys.argv[sys.argv.index("--file") + 1], encoding="utf-8") as f:
            return f.read()
    req = urllib.request.Request(SHEET_CSV_URL, headers={"User-Agent": "nexgen-updater"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def main():
    reader = csv.DictReader(io.StringIO(read_csv_text()))
    rows = []
    for raw in reader:
        row = {c: (raw.get(c) or "").strip() for c in COLUMNS}
        if row["Track"] and row["Lap Time"]:          # descarta filas vacías/incompletas
            rows.append(row)

    # Si la descarga vino vacía o rota, NO pisamos el archivo bueno.
    if not rows:
        sys.exit("CSV sin filas válidas: se conserva data/setups.json anterior.")

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{len(rows)} setups escritos en data/setups.json")


if __name__ == "__main__":
    main()
