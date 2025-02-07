// ==UserScript==
// @name         Sabim Timer Synchronization with Smart Check
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Süre bilgisini senkronize eder, gereksiz veri çekmez ve takılmaları önler.
// @author       Your Name
// @match        https://sabim.sonitel.io/client/agent
// @match        https://sabim.sonitel.io/custom/sabim?MobileNumber=*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let lastTimerValue = null; // Son bilinen timer değeri
    let unchangedCounter = 0; // Kaç defa aynı kaldığını sayar

    function fetchTimerValue() {
        const timerElement = document.querySelector('timer h6');
        if (timerElement) {
            return timerElement.textContent.trim();
        }
        return null;
    }

    if (window.location.href.includes("/client/agent")) {
        console.log("Kaynak sekmede çalışıyor...");

        setInterval(() => {
            let timerValue = localStorage.getItem('sabimTimerValue');
            let newTimerValue = fetchTimerValue();

            if (!timerValue || timerValue.trim() === "") {
                console.warn("Süre bilgisi bulunamadı, çekiliyor...");
                if (newTimerValue) {
                    localStorage.setItem('sabimTimerValue', newTimerValue);
                }
            } else {
                if (newTimerValue === lastTimerValue) {
                    unchangedCounter++;
                } else {
                    unchangedCounter = 0;
                }

                lastTimerValue = newTimerValue;

                if (unchangedCounter >= 3) {
                    console.warn("Süre bilgisi takıldı! Yeniden çekiliyor...");
                    if (newTimerValue) {
                        localStorage.setItem('sabimTimerValue', newTimerValue);
                    }
                    unchangedCounter = 0;
                } else if (newTimerValue && newTimerValue !== timerValue) {
                    localStorage.setItem('sabimTimerValue', newTimerValue);
                }
            }
        }, 1000);
    }

    if (window.location.href.includes("/custom/sabim?MobileNumber=")) {
        console.log("Hedef sekmede çalışıyor...");

        const displayElement = document.createElement('div');
        displayElement.id = 'timerDisplay';
        displayElement.style.position = 'fixed';
        displayElement.style.bottom = '10px';
        displayElement.style.left = '10px';
        displayElement.style.backgroundColor = '#f9f9f9';
        displayElement.style.padding = '8px';
        displayElement.style.border = '1px solid #ccc';
        displayElement.style.borderRadius = '6px';
        displayElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        displayElement.style.fontSize = '13px';
        displayElement.style.fontFamily = 'Arial, sans-serif';
        displayElement.style.zIndex = '9999';

        const timerText = document.createElement('p');
        timerText.id = 'timerText';
        displayElement.appendChild(timerText);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Beyan Dakikasını Kaydet';
        saveButton.style.marginTop = '6px';
        saveButton.style.padding = '6px 12px';
        saveButton.style.backgroundColor = '#ba0c2f';
        saveButton.style.color = 'white';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '5px';
        saveButton.style.cursor = 'pointer';
        saveButton.style.fontSize = '13px';
        saveButton.style.transition = 'background-color 0.3s ease';

        saveButton.addEventListener('mouseenter', () => {
            saveButton.style.backgroundColor = '#900922';
        });

        saveButton.addEventListener('mouseleave', () => {
            saveButton.style.backgroundColor = '#ba0c2f';
        });

        saveButton.addEventListener('click', () => {
            const timerValue = localStorage.getItem('sabimTimerValue');
            if (timerValue) {
                const textarea = document.querySelector('textarea#mat-input-14');
                if (textarea) {
                    textarea.value += `BEYAN DAKİKASI: ${timerValue}\n`;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    alert('Doğru textarea bulunamadı! ID kontrol edin.');
                }
            } else {
                alert('Süre bilgisi bulunamadı!');
            }
        });

        displayElement.appendChild(saveButton);
        document.body.appendChild(displayElement);

        setInterval(() => {
            let timerValue = localStorage.getItem('sabimTimerValue');

            if (!timerValue || timerValue.trim() === "") {
                console.warn("LocalStorage'daki süre kayboldu! Yeniden çekiliyor...");
                let newTimerValue = fetchTimerValue();
                if (newTimerValue) {
                    localStorage.setItem('sabimTimerValue', newTimerValue);
                    timerValue = newTimerValue;
                }
            }

            if (timerValue) {
                timerText.textContent = `Süre Bilgisi: ${timerValue}`;
            } else {
                timerText.textContent = "Süre bilgisi alınamıyor.";
            }
        }, 1000);
    }
})();
