// ==UserScript==
// @name         Müdavim Başvuru Takip Sistemi - Otomatik Tarih Seçici
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Telefon numarasına göre başlangıç ve bitiş tarihlerini otomatik doldurur, müdavim etiketi ekler (Dark Rider efekti). Tıklanınca tarihleri tekrar yükler.
// @author       Rage17
// @match        https://sabim.sonitel.io/*
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    let dataList = [];
    let lastFetchTime = 0;
    const FETCH_INTERVAL = 10 * 60 * 1000; // 10 dakika

    async function fetchData() {
        const now = Date.now();
        if (now - lastFetchTime > FETCH_INTERVAL || dataList.length === 0) {
            try {
                const response = await fetch("https://raw.githubusercontent.com/Rage1703/sabimx/main/mudavimler.json", { cache: "no-store" });
                dataList = await response.json();
                lastFetchTime = now;
                console.log("JSON verisi güncellendi.");
            } catch (error) {
                console.error("Veri çekme hatası:", error);
            }
        }
    }

    async function updateDates() {
        await fetchData();
        const phoneInput = document.getElementById('mat-input-22');
        const startDateInput = document.getElementById('mat-input-23');
        const endDateInput = document.getElementById('mat-input-24');

        if (phoneInput && startDateInput && endDateInput) {
            const phoneNumber = phoneInput.value.trim();
            const userData = dataList.find(entry => entry.number === phoneNumber);

            if (userData) {
                const { start, end, name } = userData;
                startDateInput.value = start;
                endDateInput.value = end;

                startDateInput.dispatchEvent(new Event('input', { bubbles: true }));
                endDateInput.dispatchEvent(new Event('input', { bubbles: true }));

                console.log(`Numara: ${phoneNumber}, İsim: ${name}, Başlangıç: ${start}, Bitiş: ${end}`);

                // Eğer telefon numarası listede varsa "Müdavim" butonunu ekleyelim
                showMudavimBadge(userData);
            }
        }
    }

    function showMudavimBadge(userData) {
        if (document.getElementById('mudavim-badge')) return;

        const badge = document.createElement('div');
        badge.id = 'mudavim-badge';
        badge.innerText = 'Müdavim';

        Object.assign(badge.style, {
            position: 'fixed',
            top: '15px',
            right: '15px',
            backgroundColor: '#b80c2e',
            color: 'white',
            fontSize: '14px',
            fontFamily: '"Franklin Gothic Medium", "Franklin Gothic", Arial, sans-serif',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            textAlign: 'center',
            zIndex: '9999',
            transition: 'transform 0.2s ease-in-out',
            boxShadow: '0 0 10px rgba(255, 0, 0, 0.8)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            border: '2px solid white',
            animation: 'darkRiderEffect 2s infinite linear'
        });

        badge.addEventListener('click', () => {
            restoreDates(userData);
        });

        badge.addEventListener('mouseover', () => {
            badge.style.transform = 'scale(1.1)';
        });

        badge.addEventListener('mouseleave', () => {
            badge.style.transform = 'scale(1)';
        });

        document.body.appendChild(badge);

        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes darkRiderEffect {
                0% { text-shadow: 0 0 5px red; }
                50% { text-shadow: 0 0 15px red; }
                100% { text-shadow: 0 0 5px red; }
            }
        `;
        document.head.appendChild(style);
    }

    function restoreDates(userData) {
        const startDateInput = document.getElementById('mat-input-23');
        const endDateInput = document.getElementById('mat-input-24');

        if (startDateInput && endDateInput) {
            startDateInput.value = userData.start;
            endDateInput.value = userData.end;

            startDateInput.dispatchEvent(new Event('input', { bubbles: true }));
            endDateInput.dispatchEvent(new Event('input', { bubbles: true }));

            console.log(`Tarih bilgileri tekrar yüklendi: Başlangıç: ${userData.start}, Bitiş: ${userData.end}`);
        }
    }

    // Sayfa açıldığında çalıştır
    window.addEventListener('load', updateDates);

    // Her 10 saatte bir JSON'u yeniden çekip güncelle
    setInterval(updateDates, FETCH_INTERVAL);
})();
