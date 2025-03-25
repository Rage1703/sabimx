// ==UserScript==
// @name         Otomatik Kelime Tahmin
// @version      1.9
// @description  Türkçe ve Tıbbi terimler içeren yazım tahmini önerileri (Optimize Edilmiş Kod)
// @author       Rage17
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let dictionary = []; // Genel sözlük ve tıbbi terimler burada birleşecek
    let medicalTerms = []; // Tıbbi terimler için ayrı bir dizi

    // Türkçe karakterlere uygun büyük harfe çevirme fonksiyonu
    function toUpperCaseTurkish(text) {
        return text
            .toUpperCase(); // Geri kalan harfleri büyük harfe çevir
    }

    // JSON dosyasını indiren yardımcı fonksiyon
    async function fetchJSON(url) {
        try {
            const response = await fetch(url, { headers: { 'Accept': 'application/json; charset=utf-8' } });
            if (!response.ok) throw new Error(`Dosya yüklenemedi: ${url} (Durum: ${response.status})`);
            return await response.json();
        } catch (error) {
            console.error(`JSON dosyası indirilirken hata oluştu: ${error.message}`);
            return [];
        }
    }

    // Yerel depolamadan sözlükleri yükleme
    function loadDictionariesFromLocalStorage() {
        const generalWords = JSON.parse(localStorage.getItem('generalWords')) || [];
        const medicalTerms = JSON.parse(localStorage.getItem('medicalTerms')) || [];
        dictionary = [...new Set([...generalWords, ...medicalTerms])];
        console.log('Yerel depolamadan sözlükler yüklendi:', dictionary);
    }

    // JSON dosyalarını indirip yerel depolamaya kaydetme
    async function updateDictionaries() {
        try {
            console.log('JSON dosyaları indiriliyor...');
            const generalWords = await fetchJSON('https://raw.githubusercontent.com/Rage1703/sabimx/main/kelimeveritabani/kelimeler.json');
            const medicalTerms = await fetchJSON('https://raw.githubusercontent.com/Rage1703/sabimx/main/kelimeveritabani/tibbi_terimler.json');

            localStorage.setItem('generalWords', JSON.stringify(generalWords));
            localStorage.setItem('medicalTerms', JSON.stringify(medicalTerms));
            localStorage.setItem('lastUpdate', Date.now());

            console.log('JSON dosyaları güncellendi ve yerel depolamaya kaydedildi.');
        } catch (error) {
            console.error('JSON dosyaları güncellenirken hata oluştu:', error);
        }
    }

    // Güncelleme kontrolü
    async function checkForUpdates() {
        const lastUpdate = parseInt(localStorage.getItem('lastUpdate'), 10) || 0;
        const now = Date.now();

        if (now - lastUpdate > 24 * 60 * 60 * 1000) { // 24 saat
            console.log('24 saat geçti, JSON dosyaları güncelleniyor...');
            await updateDictionaries();
        } else {
            console.log('JSON dosyaları güncel, güncelleme yapılmadı.');
        }

        loadDictionariesFromLocalStorage();
    }

    // Sayfa yüklendiğinde sözlükleri kontrol et ve normalize et
    window.addEventListener('load', () => {
        checkForUpdates();
        normalizeDictionary(); // Sözlükteki kelimeleri normalize et
    });

    let activeIndex = -1;  // Seçilen öğe
    let suggestions = [];

    // Türkçe karakterleri normalize eden yardımcı fonksiyon
    function normalizeTurkishChars(text) {
        return text
            .replace(/İ/g, 'i') // Büyük İ harfini küçük i'ye dönüştür
            .replace(/i/g, 'İ') // Büyük i harfini küçük İ'ye dönüştür
            .replace(/ı/g, 'I') // Küçük ı harfini küçük I'ye dönüştür
            .replace(/I/g, 'ı') // Büyük I harfini küçük ı'ye dönüştür
            .replace(/ç/g, 'Ç') // Küçük ç harfini büyük Ç'ye dönüştür
            .replace(/Ç/g, 'ç') // Büyük Ç harfini küçük ç'ye dönüştür
            .replace(/ğ/g, 'Ğ') // Küçük ğ harfini büyük Ğ'ye dönüştür
            .replace(/Ğ/g, 'ğ') // Büyük Ğ harfini küçük ğ'ye dönüştür
            .replace(/ö/g, 'Ö') // Küçük ö harfini büyük Ö'ye dönüştür
            .replace(/Ö/g, 'ö') // Büyük Ö harfini küçük ö'ye dönüştür
            .replace(/ş/g, 'Ş') // Küçük ş harfini büyük Ş'ye dönüştür
            .replace(/Ş/g, 'ş') // Büyük Ş harfini küçük ş'ye dönüştür
            .replace(/ü/g, 'Ü') // Küçük ü harfini BÜYÜK ü'ye dönüştür
            .replace(/Ü/g, 'ü') // Büyük Ü harfini küçük ü'ye dönüştür
            .toLowerCase('tr'); // Geri kalan harfleri Türkçe diline uygun küçük harfe çevir
    }
    function showPredictions(inputElement) {
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
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        container.style.scrollbarWidth = 'thin';
        container.style.scrollbarColor = '#888 #ccc';
        container.style.transition = 'width 0.3s ease'; // Yumuşak animasyon
        container.style.fontFamily = 'Franklin Gothic, Arial, sans-serif !important'; // Font zorlandı

        const rect = inputElement.getBoundingClientRect();
        const cursorPosition = getCaretCoordinates(inputElement, inputElement.selectionStart);
        const lineHeight = parseInt(window.getComputedStyle(inputElement).lineHeight, 10) || 20;
        container.style.top = `${rect.top + cursorPosition.top + lineHeight + window.scrollY}px`;
        container.style.left = `${rect.left + cursorPosition.left + window.scrollX}px`;

        const query = normalizeTurkishChars(inputElement.value.trim().split(' ').pop());
        console.log("Girilen metin:", query);

        // Performans için filtreleme ve sıralama optimize edildi
        suggestions = dictionary
            .filter(word => normalizeTurkishChars(word).includes(query)) // Normalize edilmiş eşleşme
            .slice(0, 50) // İlk 50 eşleşmeyi al
            .sort((a, b) => {
                const aStartsWith = normalizeTurkishChars(a).startsWith(query);
                const bStartsWith = normalizeTurkishChars(b).startsWith(query);
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                return a.localeCompare(b);
            });

        console.log("Eşleşen tahminler:", suggestions);

        // Caps Lock durumunu kontrol et
        const isCapsLockOn = window.lastCapsLockState || false;

        // En uzun tahminin genişliğini hesapla
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.fontSize = window.getComputedStyle(inputElement).fontSize;
        tempSpan.style.fontFamily = window.getComputedStyle(inputElement).fontFamily;
        document.body.appendChild(tempSpan);

        let maxWidth = 0; // En uzun kelimenin genişliği
        suggestions.forEach(match => {
            const displayText = isCapsLockOn ? toUpperCaseTurkish(match) : match.toLowerCase(); // Büyük/küçük harf ayarı
            tempSpan.textContent = displayText;
            maxWidth = Math.max(maxWidth, tempSpan.offsetWidth + 20); // 20px padding ekle
        });

        document.body.removeChild(tempSpan);
        container.style.width = `${maxWidth}px`; // Dinamik genişlik ayarla

        suggestions.forEach((match, index) => {
            const item = document.createElement('div');
            item.classList.add('prediction-item');
            item.style.padding = '6px';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid #eee';
            item.style.backgroundColor = '#fff';
            item.style.fontSize = '14px';
            item.style.fontFamily = 'Franklin Gothic, Arial, sans-serif !important'; // Font zorlandı
            item.textContent = isCapsLockOn ? toUpperCaseTurkish(match) : match.toLowerCase(); // Büyük/küçük harf ayarı

            item.addEventListener('mouseover', () => {
                activeIndex = index;
                updateActiveItem();
                showLivePreview(inputElement, match); // Canlı önizleme
            });

            item.addEventListener('mouseout', () => {
                activeIndex = -1;
                updateActiveItem();
                clearLivePreview(inputElement); // Önizlemeyi temizle
            });

            item.addEventListener('click', () => {
                completePrediction(inputElement, match);
                container.remove();
            });

            container.appendChild(item);
        });

        if (suggestions.length > 0) {
            document.body.appendChild(container);
            activeIndex = 0; // İlk tahmine otomatik odaklan
            updateActiveItem();
            showLivePreview(inputElement, suggestions[0]); // İlk tahmin için önizleme
        } else {
            clearLivePreview(inputElement); // Tahmin yoksa önizlemeyi temizle
        }
    }

    // Canlı önizleme göster
    function showLivePreview(inputElement, match) {
        const currentValue = inputElement.value.trim();
        const lastSpaceIndex = currentValue.lastIndexOf(' ');
        const baseText = lastSpaceIndex === -1 ? currentValue : currentValue.substring(0, lastSpaceIndex + 1);
        const previewText = match.substring(baseText.length).trim();

        // Önceki önizlemeyi temizle
        clearLivePreview(inputElement);

        // Caps Lock durumunu kontrol et
        const isCapsLockOn = window.lastCapsLockState || false;
        const displayText = isCapsLockOn ? toUpperCaseTurkish(previewText) : previewText;

        // Placeholder gibi tamamlama için ::after yerine overlay kullanımı
        const rect = inputElement.getBoundingClientRect();
        const caretCoordinates = getCaretCoordinates(inputElement, inputElement.selectionStart);

        const previewSpan = document.createElement('span');
        previewSpan.classList.add('live-preview');
        previewSpan.style.position = 'absolute';
        previewSpan.style.color = '#ccc';
        previewSpan.style.pointerEvents = 'none';
        previewSpan.style.fontSize = window.getComputedStyle(inputElement).fontSize;
        previewSpan.style.fontFamily = window.getComputedStyle(inputElement).fontFamily;
        previewSpan.style.whiteSpace = 'pre';
        previewSpan.style.left = `${rect.left + caretCoordinates.left + window.scrollX}px`;
        previewSpan.style.top = `${rect.top + caretCoordinates.top + window.scrollY}px`;
        previewSpan.textContent = displayText;

        document.body.appendChild(previewSpan);
    }

    // Canlı önizlemeyi temizle
    function clearLivePreview(inputElement) {
        const previewSpan = document.querySelector('.live-preview');
        if (previewSpan) {
            previewSpan.remove();
        }
    }

    // Caps Lock durumunu güncelleyen olay dinleyici
    document.addEventListener('keydown', function(event) {
        window.lastCapsLockState = event.getModifierState('CapsLock');
    });
    document.addEventListener('keyup', function(event) {
        window.lastCapsLockState = event.getModifierState('CapsLock');
    });

    function updateActiveItem() {
        const predictionItems = document.querySelectorAll('.prediction-item');
        predictionItems.forEach((item, index) => {
            if (index === activeIndex) {
                item.style.backgroundColor = '#663399';
                item.style.color = '#fff';
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.style.backgroundColor = '#fff';
                item.style.color = '#000';
            }
        });
    }

    function completePrediction(inputElement, match) {
        // Tahmin sonucunu doğrudan metin alanına yaz
        inputElement.value = match + ' '; // Tahmin sonrası boşluk ekle
    }

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

    function handleArrowKeys(event, inputElement) {
        const predictionItems = document.querySelectorAll('.prediction-item');
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (activeIndex < predictionItems.length - 1) {
                activeIndex++;
                updateActiveItem();
                showLivePreview(inputElement, suggestions[activeIndex]); // Önizleme
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (activeIndex > 0) {
                activeIndex--;
                updateActiveItem();
                showLivePreview(inputElement, suggestions[activeIndex]); // Önizleme
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (activeIndex >= 0 && predictionItems[activeIndex]) {
                completePrediction(inputElement, predictionItems[activeIndex].textContent);
                document.querySelector('.prediction-container').remove();
                clearLivePreview(inputElement); // Önizlemeyi temizle
            }
        }
    }

    // Sözlükteki kelimeleri normalize etme
    function normalizeDictionary() {
        dictionary = dictionary.map(word => normalizeTurkishChars(word));
    }

    // Her kelime için tahmin kutusunu göster
    document.addEventListener('input', function(event) {
        const inputElement = event.target;
        if (inputElement.tagName === 'TEXTAREA') {
            const query = inputElement.value.trim();
            if (query.length > 0) { // Her kelime için tahminleri göster
                showPredictions(inputElement);
            } else {
                hidePredictions(inputElement);
            }
        }
    });

    document.addEventListener('keydown', function(event) {
        const inputElement = document.activeElement;
        if (inputElement.tagName === 'TEXTAREA' && document.querySelector('.prediction-item')) {
            handleArrowKeys(event, inputElement);
        }
    });

    document.addEventListener('blur', function(event) {
        const inputElement = event.target;
        if (inputElement.tagName === 'TEXTAREA') {
            const container = document.querySelector('.prediction-container');
            if (container) {
                container.remove();
            }
            clearLivePreview(inputElement); // Tahmin kutusu kapandığında önizlemeyi temizle
        }
    }, true);

    function hidePredictions(inputElement) {
        const container = document.querySelector('.prediction-container');
        if (container) {
            container.remove();
        }
        clearLivePreview(inputElement); // Tahmin kutusu gizlendiğinde önizlemeyi temizle
    }
})();
