import requests
import json

# GitHub Repo Bilgileri
GITHUB_OWNER = "Rage1703"  # GitHub kullanıcı adın
REPO_NAME = "sabimx"  # Repo adı
BRANCH = "main"  # Kullanılan branch (main veya master)

# API URL'si
GITHUB_API_URL = f"https://api.github.com/repos/{GITHUB_OWNER}/{REPO_NAME}/contents/"

# Script'in çalışmasını sağlar
def get_js_files():
    response = requests.get(GITHUB_API_URL)
    
    if response.status_code != 200:
        print("GitHub API'den veri alınamadı!")
        return []

    files = response.json()
    js_files = []

    for file in files:
        if file["name"].endswith(".js"):  # Sadece .js dosyalarını al
            js_files.append({
                "name": file["name"].replace(".user.js", ""),  # Adı düzenle
                "url": file["download_url"]  # Direkt raw dosya linki
            })

    return js_files

# scripts.json dosyasını oluştur
def generate_json():
    js_files = get_js_files()
    
    if not js_files:
        print("Hiçbir .js dosyası bulunamadı!")
        return
    
    scripts_data = {
        "scripts": js_files
    }
    
    with open("scripts.json", "w", encoding="utf-8") as json_file:
        json.dump(scripts_data, json_file, indent=4, ensure_ascii=False)
    
    print("✅ scripts.json başarıyla oluşturuldu!")

# Çalıştır
if __name__ == "__main__":
    generate_json()
