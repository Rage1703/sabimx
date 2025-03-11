// ==UserScript==
// @name         Müdavim Takip Sistemi 2. Numara
// @version      1.2
// @description  Telefon numarasına göre tarihleri otomatik günceller, ancak numara butona basıldığında değişir.
// @author       Rage17
// @match        https://sabim.sonitel.io/*
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    let dataList = [];
    let lastFetchTime = 0;
    const FETCH_INTERVAL = 10 * 60 * 1000; // 10 dakika
    const JSON_URL = "https://raw.githubusercontent.com/Rage1703/sabimx/main/mudavimler2.json"; // Doğru JSON URL

    async function fetchData() {
        const now = Date.now();
        if (now - lastFetchTime > FETCH_INTERVAL || dataList.length === 0) {
            try {
                const response = await fetch(JSON_URL, { cache: "no-store" });
                dataList = await response.json();
                lastFetchTime = now;
                console.log("JSON verisi güncellendi.");
            } catch (error) {
                console.error("Veri çekme hatası:", error);
            }
        }
    }

    async function updateData() {
        await fetchData();
        const phoneInput = document.getElementById('mat-input-22');
        const startDateInput = document.getElementById('mat-input-23');
        const endDateInput = document.getElementById('mat-input-24');

        if (phoneInput && startDateInput && endDateInput) {
            const phoneNumber = phoneInput.value.trim();
            const userData = dataList.find(entry => entry.number === phoneNumber);

            if (userData) {
                const { start, end, name, number2 } = userData;

                // Tarihleri güncelle
                startDateInput.value = start;
                endDateInput.value = end;
                startDateInput.dispatchEvent(new Event('input', { bubbles: true }));
                endDateInput.dispatchEvent(new Event('input', { bubbles: true }));

                console.log(`Numara bulundu: ${phoneNumber}, İsim: ${name}, Başlangıç: ${start}, Bitiş: ${end}`);

                if (number2) {
                    showMudavimButton(userData); // Eğer number2 varsa butonu göster
                }
            }
        }
    }

    function showMudavimButton(userData) {
        let button = document.getElementById('mudavim-button');
        if (button) return;

        button = document.createElement('button');
        button.id = 'mudavim-button';
        button.innerText = 'Müdavim 2. numaradan arıyor';
        button.style.position = 'fixed';
        button.style.top = '15px';
        button.style.right = '15px';
        button.style.backgroundColor = '#0c63e7';
        button.style.color = 'white';
        button.style.fontSize = '14px';
        button.style.padding = '10px 16px';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontWeight = 'bold';
        button.style.zIndex = '9999';
        button.style.boxShadow = '0 0 10px rgba(0, 102, 255, 0.8)';
        button.style.transition = 'transform 0.2s ease-in-out';
        button.style.animation = 'bluePulse 2s infinite linear';

        button.addEventListener('click', () => {
            changePhoneNumber(userData);
        });

        button.addEventListener('mouseover', () => {
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });

        document.body.appendChild(button);

        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes bluePulse {
                0% { box-shadow: 0 0 5px blue; }
                50% { box-shadow: 0 0 15px blue; }
                100% { box-shadow: 0 0 5px blue; }
            }
        `;
        document.head.appendChild(style);
    }

    function changePhoneNumber(userData) {
        const phoneInput = document.getElementById('mat-input-22');
        if (phoneInput) {
            phoneInput.value = userData.number2;
            phoneInput.dispatchEvent(new Event('input', { bubbles: true }));

            console.log(`Numara değiştirildi: ${userData.number} → ${userData.number2}`);

            // Butonu yeşile çevir ve değiştirildiğini göster
            let button = document.getElementById('mudavim-button');
            if (button) {
                button.innerText = 'Numara değiştirildi!';
                button.style.backgroundColor = '#28a745';
                button.style.boxShadow = '0 0 10px rgba(40, 167, 69, 0.8)';
                button.style.animation = 'none';
                setTimeout(() => {
                    button.remove();
                }, 3000); // 3 saniye sonra butonu kaldır
            }
        }
    }

    // Sayfa açıldığında çalıştır
    window.addEventListener('load', updateData);

    // Her 10 dakikada bir JSON'u yeniden çekip güncelle
    setInterval(updateData, FETCH_INTERVAL);
})();
