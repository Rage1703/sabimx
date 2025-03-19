import json

# JSON dosyasını oku
with open("kelimeler.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# JSON verisini tek satıra sıkıştırılmış olarak kaydet
with open("kelimeler_min.json", "w", encoding="utf-8") as f:
    json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
