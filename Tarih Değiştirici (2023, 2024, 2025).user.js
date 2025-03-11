// ==UserScript==
// @name         Tarih Değiştirici (2023, 2024, 2025)
// @version      1.3
// @description  Tarih alanını belirlenen bir değere günceller (2023, 2024 ve 2025 butonları eklendi)
// @author       Rage17
// @match        https://sabim.sonitel.io/custom/sabim?MobileNumber=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Sayfa yüklendiğinde çalıştır
    window.addEventListener('load', function() {
        // İlgili input elemanını seç
        const dateInput = document.getElementById('mat-input-23');

        if (dateInput) {
            console.log("Tarih inputu bulundu.");

            // Input'un üstüne butonları eklemek için konumlandırma
            dateInput.parentNode.style.position = 'relative';

            // Buton oluşturma fonksiyonu
            function createButton(text, dateValue, rightPosition) {
                const button = document.createElement('button');
                button.textContent = text;
                button.style.position = 'absolute';
                button.style.right = rightPosition; // Sağdan mesafe ayarı
                button.style.top = '-25px';
                button.style.padding = '4px 8px';
                button.style.backgroundColor = '#007bff';
                button.style.color = 'white';
                button.style.border = 'none';
                button.style.borderRadius = '4px';
                button.style.cursor = 'pointer';
                button.style.fontSize = '12px';
                button.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.2)';
                button.style.transition = 'background-color 0.2s';

                // Hover efekti
                button.addEventListener('mouseenter', () => {
                    button.style.backgroundColor = '#0056b3';
                });
                button.addEventListener('mouseleave', () => {
                    button.style.backgroundColor = '#007bff';
                });

                // Butona tıklanınca input içeriğini değiştir
                button.addEventListener('click', function() {
                    dateInput.value = dateValue;
                    dateInput.dispatchEvent(new Event('input', { bubbles: true })); // Angular için input event tetikle
                    console.log(`Tarih değiştirildi: ${dateValue}`);
                });

                return button;
            }

            // Butonları oluştur ve konumlandır (sağdan mesafeler ayarlandı)
            const button2023 = createButton('2023', '1/1/2023, 00:00:00', '95px');
            const button2024 = createButton('2024', '1/1/2024, 00:00:00', '50px');
            const button2025 = createButton('2025', '1/1/2025, 00:00:00', '5px');

            // Butonları input'un üstüne ekle
            dateInput.parentNode.appendChild(button2023);
            dateInput.parentNode.appendChild(button2024);
            dateInput.parentNode.appendChild(button2025);
        } else {
            console.log("Tarih inputu bulunamadı!");
        }
    });
})();
