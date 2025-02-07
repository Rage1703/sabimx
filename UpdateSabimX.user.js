// ==UserScript==
// @name         SabimXGuncelleme
// @version      1.0
// @description  GitHub'daki tüm betikleri yükler ve günceller
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// @grant        GM_getResourceText
// @connect      api.github.com
// @connect      raw.githubusercontent.com
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const repoOwner = "Rage1703"; // GitHub kullanıcı adı
    const repoName = "sabimx"; // Depo adı
    const branch = "main"; // Kullanılan branch (genellikle "main" veya "master")
    
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;
    
    // GitHub API'den betik listesini al
    GM_xmlhttpRequest({
        method: "GET",
        url: apiUrl,
        headers: { "Accept": "application/vnd.github.v3+json" },
        onload: function(response) {
            if (response.status === 200) {
                const files = JSON.parse(response.responseText);
                files.forEach(file => {
                    if (file.name.endsWith(".user.js")) {
                        loadScript(file.download_url);
                    }
                });
            } else {
                console.error("GitHub deposundan dosya listesi alınamadı.");
            }
        }
    });

    // Betiği yükleme fonksiyonu
    function loadScript(url) {
        GM_xmlhttpRequest({
            method: "GET",
            url: url + "?t=" + new Date().getTime(), // Güncellemeleri zorlamak için zaman ekliyoruz
            onload: function(response) {
                if (response.status === 200) {
                    let script = document.createElement('script');
                    script.textContent = response.responseText;
                    document.head.appendChild(script);
                    console.log(`Yüklendi: ${url}`);
                } else {
                    console.error(`Betik yüklenemedi: ${url}`);
                }
            }
        });
    }
})();
