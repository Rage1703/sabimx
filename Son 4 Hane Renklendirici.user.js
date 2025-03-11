// ==UserScript==
// @name         Son 4 Hane Renklendirici
// @version      1.4
// @description  Input alanındaki 8, 9, 10 ve 11. karakterlerin arka planını şeffaf kırmızı yapar (her türlü değişiklikte çalışır).
// @author       Rage17
// @match        https://sabim.sonitel.io/custom/sabim?MobileNumber=*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Dinamik yüklemelere karşı düzenli olarak kontrol etmek için bir interval veya observer kullanılır
    const checkInput = setInterval(() => {
        const inputElement = document.querySelector('input#mat-input-8'); // Input elemanını seç

        if (inputElement) {
            console.log("Gsm No input bulundu.");
            clearInterval(checkInput); // Input bulunduğu anda intervali durdur

            // Stil eklemek için input alanının bulunduğu bir wrapper oluşturalım
            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            wrapper.style.display = "inline-block";

            // Input alanını mevcut DOM'dan çıkarıp yeni wrapper içine yerleştiriyoruz
            inputElement.parentNode.insertBefore(wrapper, inputElement);
            wrapper.appendChild(inputElement);

            // Stil için overlay oluştur
            const overlay = document.createElement("div");
            overlay.style.position = "absolute";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.right = "0";
            overlay.style.bottom = "0";
            overlay.style.pointerEvents = "none";
            overlay.style.color = "black";
            overlay.style.fontFamily = getComputedStyle(inputElement).fontFamily;
            overlay.style.fontSize = getComputedStyle(inputElement).fontSize;
            overlay.style.lineHeight = getComputedStyle(inputElement).lineHeight;
            overlay.style.padding = getComputedStyle(inputElement).padding;
            overlay.style.whiteSpace = "pre";
            overlay.style.overflowWrap = "break-word";
            wrapper.appendChild(overlay);

            // Input alanının şeffaf olmasını sağla
            inputElement.style.backgroundColor = "transparent";
            inputElement.style.color = "transparent";
            inputElement.style.position = "relative";
            inputElement.style.zIndex = "2";
            inputElement.style.caretColor = "black";

            // Metni işleyip overlay'e yazdırma fonksiyonu
            const updateOverlay = () => {
                const value = inputElement.value;

                // Overlay'i temizle
                overlay.innerHTML = "";

                // Yeni HTML ile overlay alanının içeriğini yeniden oluştur
                value.split('').forEach((char, index) => {
                    const span = document.createElement("span");
                    span.textContent = char;

                    // Karakter stilleri
                    span.style.whiteSpace = "pre";
                    span.style.color = "black";

                    // 8, 9, 10 ve 11. karakterleri şeffaf kırmızı yap
                    if (index >= 7 && index <= 10) {
                        span.style.backgroundColor = "rgba(255, 88, 227, 0.8)"; // Şeffaf kırmızı
                    }

                    overlay.appendChild(span);
                });
            };

            // Input değişikliklerinde overlay'i güncelle
            inputElement.addEventListener('input', updateOverlay);

            // Sayfa yüklendiğinde mevcut metni işle
            updateOverlay();

            // Dinamik DOM değişikliklerini izlemek için MutationObserver kullan
            const observer = new MutationObserver(() => {
                updateOverlay();
            });

            observer.observe(inputElement, { attributes: true, childList: true, subtree: true, characterData: true });
        } else {
            console.warn("Gsm No input henüz bulunamadı, tekrar kontrol ediliyor...");
        }
    }, 500); // Her 500 ms'de bir kontrol et
})();
