// ==UserScript==
// @name         Günlük Toplam Mola Hesaplayıcı (Butona Bağlı)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Kısa mola ve yemek molası sürelerini toplayarak toplamın altına ekler, butona bağlı çalışır (sayfa yüklemesini beklemez).
// @author       Your Name
// @match        https://sabim.sonitel.io/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Zamanı saniyeye çeviren fonksiyon
    function parseTimeToSeconds(time) {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }

    // Saniyeyi saat:dakika:saniye formatına çeviren fonksiyon
    function formatSecondsToTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function calculateAndAddRow() {
        const rows = document.querySelectorAll('tbody tr');
        let totalSeconds = 0;

        // Kısa Mola ve Yemek Molası sürelerini topla
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const breakName = cells[0]?.textContent.trim();
            const breakTime = cells[1]?.textContent.trim();

            if (breakName === 'Kısa Mola' || breakName === 'Yemek Molası') {
                totalSeconds += parseTimeToSeconds(breakTime);
            }
        });

        if (totalSeconds === 0) return;

        const formattedTotal = formatSecondsToTime(totalSeconds);

        // Önceki "Günlük Toplam Mola" satırını kaldır
        const existingRow = document.querySelector('tfoot tr[data-total-mola="true"]');
        if (existingRow) existingRow.remove();

        // Yeni toplam satırını ekle
        const tableFooter = document.querySelector('tfoot');
        if (!tableFooter) {
            console.error('Tablo altbilgisi (tfoot) bulunamadı!');
            return;
        }

        const newRow = document.createElement('tr');
        newRow.setAttribute('data-total-mola', 'true');
        newRow.innerHTML = `
            <td class="mat-footer-cell cdk-footer-cell font-bold cdk-column-item mat-column-item" colspan="1">Günlük Toplam Mola</td>
            <td class="mat-footer-cell cdk-footer-cell font-bold cdk-column-cost mat-column-cost">${formattedTotal}</td>
        `;
        tableFooter.appendChild(newRow);
    }

    function setupButtonListener() {
        const observer = new MutationObserver(() => {
            const refreshButton = document.querySelector('button[mat-raised-button][color="primary"]');
            if (refreshButton && !refreshButton.dataset.listenerAdded) {
                refreshButton.addEventListener('click', () => {
                    console.log('Hedef butona basıldı, işlem başlatılıyor...');
                    calculateAndAddRow();
                });
                refreshButton.dataset.listenerAdded = 'true';
            }
        });

        // Sürekli dinle
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Dinleyiciyi doğrudan başlat
    setupButtonListener();
})();
