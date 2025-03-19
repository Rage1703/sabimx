// ==UserScript==
// @name         Türkçe ve Tıbbi Terimlerle Yazım Tahmini
// @version      1.3
// @description  Türkçe ve Tıbbi terimler içeren yazım tahmini önerileri
// @author       ChatGPT
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Türkçe sözlük ve tıbbi terimler (örnek olarak sınırlı)
    const dictionary = [
        'RANDEVU', 'HEKİM', 'İLAÇ', 'REÇETE', 'POLİKKLİNİK', 'KALP', 'DAMAR', 'DİŞ HEKİMİ', 'DR.',
        'AİLE SAĞLIĞI MERKEZİ', 'anne', 'çocuk', 'okul', 'öğretmen', 'tıp', 'sağlık', 'kanser', 'ilaç', 'müdahale', 'doktor', 'tedavi'
    ];

    let activeIndex = -1;  // Seçilen öğe
    let suggestions = [];

    // Kullanıcının girdiği metni alıp tahminler sunan fonksiyon
    function showPredictions(inputElement) {
        // Önceki tahmin kutusunu kaldır
        const previousContainer = document.querySelector('.prediction-container');
        if (previousContainer) {
            previousContainer.remove();
        }

        const container = document.createElement('div');
        container.classList.add('prediction-container');
        container.style.position = 'absolute';
        container.style.backgroundColor = '#b2b2b2';
        container.style.border = '1px solid #ccc';
        container.style.maxHeight = '150px';
        container.style.overflowY = 'auto';
        container.style.zIndex = '1000';
        container.style.width = `${inputElement.offsetWidth * 0.8}px`; // Genişliği biraz küçült
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

        // Tahmin kutusunun konumunu ayarla (text cursor'un bir satır altına yerleştir)
        const rect = inputElement.getBoundingClientRect();
        const cursorPosition = getCaretCoordinates(inputElement, inputElement.selectionStart);
        const lineHeight = parseInt(window.getComputedStyle(inputElement).lineHeight, 10) || 20; // Satır yüksekliği
        container.style.top = `${rect.top + cursorPosition.top + lineHeight + window.scrollY}px`; // Bir satır alta yerleştir
        container.style.left = `${rect.left + cursorPosition.left + window.scrollX}px`;

        const query = inputElement.value.toLowerCase(); // Tüm metni al
        console.log("Girilen metin:", query); // Hata ayıklama için konsola yaz

        // Türkçe sözlükten ve tıbbi terimlerden eşleşmeleri bul
        suggestions = dictionary.filter(word => word.toLowerCase().includes(query)); // İçeren kelimeleri bul
        console.log("Eşleşen tahminler:", suggestions); // Hata ayıklama için konsola yaz

        // Yeni tahminleri ekle
        suggestions.forEach((match, index) => {
            const item = document.createElement('div');
            item.classList.add('prediction-item');
            item.style.padding = '8px';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid #eee';
            item.style.backgroundColor = '#fff';
            item.textContent = match;

            item.addEventListener('mouseover', () => {
                item.style.backgroundColor = '#e0e0e0'; // Hover efekti
            });
            item.addEventListener('mouseout', () => {
                item.style.backgroundColor = '#b2b2b2';
            });

            item.addEventListener('click', function () {
                const words = inputElement.value.split(' ');
                words[words.length - 1] = match; // Son kelimeyi tahminle değiştir
                inputElement.value = words.join(' '); // Yeni metni güncelle
                container.remove(); // Tahmin kutusunu kapat
            });

            container.appendChild(item);
        });

        if (suggestions.length > 0) {
            document.body.appendChild(container); // Tahmin kutusunu body'e ekle
        }
    }

    // Textarea'daki caret (imleç) konumunu hesaplayan yardımcı fonksiyon
    function getCaretCoordinates(element, position) {
        const div = document.createElement('div');
        const style = window.getComputedStyle(element);
        for (const prop of style) {
            div.style[prop] = style[prop];
        }
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        div.textContent = element.value.substring(0, position);
        if (element.nodeName === 'TEXTAREA') div.style.height = `${element.scrollHeight}px`;
        document.body.appendChild(div);
        const span = document.createElement('span');
        span.textContent = element.value.substring(position) || '.';
        div.appendChild(span);
        const coordinates = {
            top: span.offsetTop,
            left: span.offsetLeft,
        };
        document.body.removeChild(div);
        return coordinates;
    }

    // Ok tuşları ile tahminleri seçme ve yazıya aktar
    function handleArrowKeys(event, inputElement) {
        const predictionItems = document.querySelectorAll('.prediction-item');
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (activeIndex < predictionItems.length - 1) {
                activeIndex++;
                predictionItems[activeIndex].style.backgroundColor = '#e0e0e0';
                if (activeIndex > 0) {
                    predictionItems[activeIndex - 1].style.backgroundColor = '';
                }
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (activeIndex > 0) {
                activeIndex--;
                predictionItems[activeIndex].style.backgroundColor = '#e0e0e0';
                predictionItems[activeIndex + 1].style.backgroundColor = '';
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (activeIndex >= 0 && predictionItems[activeIndex]) {
                inputElement.value = predictionItems[activeIndex].textContent;
                predictionItems[activeIndex].style.backgroundColor = ''; // Temizle
                document.querySelector('.prediction-container').remove(); // Tahmin kutusunu kapat
            }
        }
    }

    // Her yazı girdiğinde tahminleri göster
    document.addEventListener('input', function(event) {
        const inputElement = event.target;

        // Yalnızca input alanlarında çalışacak
        if (inputElement.tagName === 'TEXTAREA') {
            showPredictions(inputElement);
        }
    });

    // Ok tuşlarını dinle
    document.addEventListener('keydown', function(event) {
        const inputElement = document.activeElement;

        // Yalnızca input ve textarea alanlarında ok tuşlarını işle
        if ((inputElement.tagName === 'TEXTAREA') && document.querySelector('.prediction-item')) {
            handleArrowKeys(event, inputElement);
        }
    });

    // Yazı yazmayı bitirdiğinde tahmin kutusunu gizle
    document.addEventListener('blur', function(event) {
        const inputElement = event.target;
        if (inputElement.tagName === 'TEXTAREA') {
            const container = inputElement.parentElement.querySelector('.prediction-container');
            if (container) {
                container.remove();
            }
        }
    }, true);
})();
