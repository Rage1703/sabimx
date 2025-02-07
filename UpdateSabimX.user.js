// ==UserScript==
// @name         UpdateSabimX
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  GitHub deposundaki tüm betikleri otomatik yükler ve günceller
// @match        *://*
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://raw.githubusercontent.com/Rage1703/sabimx/main/UpdateSabimX.user.js
// @downloadURL  https://raw.githubusercontent.com/Rage1703/sabimx/main/UpdateSabimX.user.js
// ==/UserScript==

(function() {
    'use strict';

    const repoUrl = "https://api.github.com/repos/Rage1703/sabimx/contents/";
    const rawBase = "https://raw.githubusercontent.com/Rage1703/sabimx/main/";

    function fetchAndRun(scriptUrl) {
        GM_xmlhttpRequest({
            method: "GET",
            url: scriptUrl,
            onload: function(response) {
                if (response.status === 200) {
                    GM_addElement('script', { textContent: response.responseText });
                    console.log("Yüklendi: " + scriptUrl);
                } else {
                    console.error("Yükleme başarısız: " + scriptUrl);
                }
            },
            onerror: function() {
                console.error("Betik yüklenirken hata oluştu: " + scriptUrl);
            }
        });
    }

    function checkForUpdates() {
        GM_xmlhttpRequest({
            method: "GET",
            url: repoUrl,
            onload: function(response) {
                if (response.status === 200) {
                    const files = JSON.parse(response.responseText);
                    files.forEach(file => {
                        if (file.name.endsWith(".user.js") && file.name !== "UpdateSabimX.user.js") {
                            fetchAndRun(rawBase + file.name);
                        }
                    });
                } else {
                    console.error("GitHub deposuna erişilemedi");
                }
            },
            onerror: function() {
                console.error("GitHub API çağrısında hata oluştu");
            }
        });
    }

    checkForUpdates();
    setInterval(checkForUpdates, 3600000); // 1 saatte bir güncelleme kontrolü
})();
