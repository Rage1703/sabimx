// ==UserScript==
// @name         Sabim Timer Synchronization with Smart Check
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Süre bilgisini senkronize eder, gereksiz veri çekmez ve takılmaları önler.
// @author       Your Name
// @match        https://sabim.sonitel.io/client/agent
// @match        https://sabim.sonitel.io/custom/sabim?MobileNumber=*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let lastTimerValue = null;
    let unchangedCounter = 0;

    function fetchTimerValue() {
        const timerElement = document.querySelector('timer h6');
        return timerElement ? timerElement.textContent.trim() : null;
    }

    function getSelectedOption(dropdownType) {
        const formFields = document.querySelectorAll('mat-form-field');
        for (const formField of formFields) {
            const label = formField.querySelector('mat-label');
            if (label && label.textContent.trim() === dropdownType) {
                const selectedValueElement = formField.querySelector('.mat-select-value-text span');
                return selectedValueElement ? selectedValueElement.textContent.trim() : null;
            }
        }
        return null;
    }

    function selectDropdownOption(dropdownType, optionText) {
        const formFields = document.querySelectorAll('mat-form-field');
        formFields.forEach(formField => {
            const label = formField.querySelector('mat-label');
            if (label && label.textContent.trim() === dropdownType) {
                const dropdown = formField.querySelector('mat-select');
                if (dropdown) {
                    const selectedValueElement = dropdown.querySelector('.mat-select-value-text span');
                    if (selectedValueElement && selectedValueElement.textContent.trim() === optionText) {
                        console.log(`Başlık zaten seçili: ${optionText}`);
                        return;
                    }

                    dropdown.click();
                    setTimeout(() => {
                        const options = document.querySelectorAll('mat-option span');
                        options.forEach(option => {
                            if (option.textContent.trim() === optionText) {
                                option.click();
                                console.log(`Başlık seçildi: ${optionText}`);
                            }
                        });
                    }, 500);
                }
            }
        });
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
        Object.assign(displayElement.style, {
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            backgroundColor: '#f9f9f9',
            padding: '4px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            fontSize: '12px',
            fontFamily: 'Franklin Gothic, sans-serif',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            maxWidth: '200px', // kutucuğun genişliğini sınırladım
        });

        const timerText = document.createElement('p');
        timerText.id = 'timerText';
        displayElement.appendChild(timerText);

        function createButton(text, color, messagePrefix, selectOption1, selectOption2) {
            const button = document.createElement('button');
            button.textContent = text;
            Object.assign(button.style, {
                padding: '6px 8px',
                backgroundColor: color,
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'Franklin Gothic, sans-serif',
            });

            button.addEventListener('click', () => {
                const timerValue = localStorage.getItem('sabimTimerValue');
                if (timerValue) {
                    const textarea = document.querySelector('textarea#mat-input-14');
                    if (textarea) {
                        textarea.value += `${messagePrefix}: ${timerValue}\n`;
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    } else {
                        alert('Doğru textarea bulunamadı! ID kontrol edin.');
                    }
                } else {
                    alert('Süre bilgisi bulunamadı!');
                }

                // Başvuru türünü kontrol et
                const selectedOption1 = getSelectedOption('Başvuru Türü');
                if (selectedOption1 === 'SAĞLIK ÇALIŞANINA TEHDİT / ŞİDDET') {
                    // Şiddet başlığı seçiliyse, dropdown'lara müdahale etme
                    console.log('Şiddet başlığı seçili, sadece süre bilgisi eklenecek.');
                    return;
                }

                // Eğer başvuru türü ACİL YARDIM ise, dropdown'lara müdahale edilmesin
                if (selectedOption1 === 'ACİL YARDIM' && text === 'Devlet Büyüklerine Hakaret') {
                    console.log('ACİL YARDIM başlığı seçili, sadece süre bilgisi eklenecek.');
                    return;
                }

                // İlk başvuru türünü seç
                if (selectedOption1 !== selectOption1) {
                    selectDropdownOption('Başvuru Türü', selectOption1);
                }

                // 1 saniye sonra ikinci başvuru türünü seç
                setTimeout(() => {
                    const selectedOption2 = getSelectedOption('Başvuru Sebebi');
                    if (selectedOption2 !== selectOption2) {
                        selectDropdownOption('Başvuru Sebebi', selectOption2);
                    }
                }, 1000);
            });

            return button;
        }

        // Butonları oluştur ve ekle
        displayElement.appendChild(createButton('Şiddet Beyanı', '#ba0c2f', 'ŞİDDET BEYANI', 'SAĞLIK ÇALIŞANINA TEHDİT / ŞİDDET', 'SAĞLIK ÇALIŞANINA TEHDİT / ŞİDDET'));
        displayElement.appendChild(createButton('İntihar Beyanı', '#007bff', 'İNTİHAR BEYANI', 'ACİL YARDIM', 'Acil Yardım Talebi'));
        displayElement.appendChild(createButton('Devlet Büyüklerine Hakaret', '#28a745', 'D.B.HAKARET', 'DEVLET BÜYÜKLERİNE HAKARET', 'DEVLET BÜYÜKLERİNE HAKARET'));
        document.body.appendChild(displayElement);

        // Sayaç (Zaman) yalnızca Şiddet Beyanı butonunun üstünde olacak şekilde ekliyoruz.
        const timerLabel = document.createElement('span');
        timerLabel.id = 'timerLabel';
        timerLabel.style.fontSize = '12px';
        timerLabel.style.marginBottom = '1px'; // buton ile arasına mesafe ekliyoruz
        displayElement.insertBefore(timerLabel, displayElement.firstChild);

        // Sayaç güncelleme işlevi
        setInterval(() => {
            const timerValue = localStorage.getItem('sabimTimerValue');
            if (timerValue) {
                timerLabel.textContent = `Süre: ${timerValue}`;
            }
        }, 1000);
    }
})();
