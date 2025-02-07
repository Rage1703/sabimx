// ==UserScript==
// @name         Müdavim Başvuru Takip Sistemi - Otomatik Tarih Atama
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Telefon numarasına göre başlangıç ve bitiş tarihlerini otomatik olarak doldurur.
// @author       Your Name
// @match        https://sabim.sonitel.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Telefon numaralarına karşılık gelen tarih bilgileri
    const dataList = {
        "05372313311": { start: "9/22/2024, 11:22:00", end: "9/22/2024, 11:24:00", name: "Sebahat Özdemir" },
        "05376004274": { start: "12/1/2024, 20:34:00", end: "12/1/2024, 20:36:00", name: "Erol Oruç" },
        "05459152853": { start: "1/3/2024, 17:00:26", end: "1/3/2024, 17:00:29", name: "Yeter İpkin" },
        "05524140464": { start: "12/1/2024, 01:14:20", end: "12/1/2024, 01:14:25", name: "Can Ercan Tağı" },
        "05055763640": { start: "12/5/2024, 19:31:25", end: "12/5/2024, 19:31:40", name: "Şeyma Çiçek" },
        "05060314967": { start: "12/13/2024, 23:25:40", end: "12/13/2024, 23:25:50", name: "İsmail Taner Kocabıyık"},
        "05395296090": { start: "8/23/2024, 00:21:30", end: "08/23/2024, 00:21:35", name: "İsa Zan" },
        "05344402768": { start: "10/13/2024, 21:50:20", end: "10/13/2024, 21:50:25", name: "Hüseyin Arap" },
        "05438500558": { start: "8/27/2023, 01:56:05", end: "08/27/2023, 01:56:08", name: "Mehmet Yılmaz" },
        "05323358127": { start: "6/29/2023, 15:33:50", end: "06/29/2023, 15:33:59", name: "Kemal Namaz" },
        "05436521853": { start: "9/28/2023, 13:26:50", end: "9/28/2023, 13:26:59", name: "Yunus Emre Tunçay" },
        "05467205048": { start: "9/28/2023, 23:39:15", end: "9/28/2023, 23:39:20", name: "Mustafa Yaman" },
        "05396978226": { start: "12/19/2022, 11:59:09", end: "12/19/2022, 11:59:13", name: "Yüksel Akdoğan" },
        "05388394353": { start: "7/27/2023, 09:45:52", end: "7/27/2023, 09:45:54", name: "Ertuğrul Abanoz" },

        // Buraya yeni numaralar ekleyebilirsiniz
    };

    function updateDates() {
        const phoneInput = document.getElementById('mat-input-22');
        const startDateInput = document.getElementById('mat-input-23');
        const endDateInput = document.getElementById('mat-input-24');

        // Müdavim etiketi ekleme
        let label = document.getElementById('mudavim-label');
        if (!label) {
            label = document.createElement('div');
            label.id = 'mudavim-label';
            label.textContent = 'MÜDAVİM';
            label.style.position = 'absolute';
            label.style.top = '10px';
            label.style.right = '10px';
            label.style.backgroundColor = 'transparent';
            label.style.color = 'white';
            label.style.fontWeight = 'bold';
            label.style.fontSize = '20px';
            label.style.fontFamily = 'Franklin Gothic';
            label.style.padding = '10px';
            label.style.border = '3px solid #ba0c2f';
            label.style.borderRadius = '5px';
            label.style.animation = 'blink-text 0.5s infinite alternate';

            // CSS animasyonu ekleme
            const style = document.createElement('style');
            style.textContent = `
                @keyframes blink-text {
                    0% { color: #ba0c2f; }
                    100% { color: white; }
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(label);
        }

        if (phoneInput && startDateInput && endDateInput) {
            const phoneNumber = phoneInput.value.trim();

            if (dataList[phoneNumber]) {
                const { start, end, name } = dataList[phoneNumber];
                startDateInput.value = start;
                endDateInput.value = end;

                startDateInput.dispatchEvent(new Event('input', { bubbles: true }));
                endDateInput.dispatchEvent(new Event('input', { bubbles: true }));

                console.log(`Numara: ${phoneNumber}, İsim: ${name}, Başlangıç: ${start}, Bitiş: ${end}`);
                label.style.display = 'block';
            } else {
                label.style.display = 'none';
            }
        }
    }

    // Sayfa açıldığında çalıştır
    window.addEventListener('load', updateDates);

    // Her 10 saniyede bir kontrol et
    setInterval(updateDates, 10000);
})();
