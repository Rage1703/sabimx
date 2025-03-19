// ==UserScript==
// @name         Otomatik Kelime Tahmin
// @version      1.3
// @description  Türkçe ve Tıbbi terimler içeren yazım tahmini önerileri
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
        return text.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
    }

    async function fetchDictionaries() {
        const generalWordsUrl = 'https://raw.githubusercontent.com/Rage1703/sabimx/main/kelimeveritabani/kelimeler.json';
        const medicalTermsUrl = 'https://raw.githubusercontent.com/Rage1703/sabimx/main/kelimeveritabani/tibbi_terimler.json'; // Tıbbi terimlerin URL'si

        try {
            // Genel sözlük verilerini çek
            const generalResponse = await fetch(generalWordsUrl);
            if (!generalResponse.ok) {
                throw new Error(`Genel sözlük yüklenemedi: ${generalResponse.status}`);
            }
            const generalWords = await generalResponse.json();
            dictionary.push(...generalWords.map(word => toUpperCaseTurkish(word.trim())));

            // Tıbbi terim verilerini çek
            const medicalResponse = await fetch(medicalTermsUrl);
            if (!medicalResponse.ok) {
                throw new Error(`Tıbbi terimler yüklenemedi: ${medicalResponse.status}`);
            }
            medicalTerms = await medicalResponse.json();
            dictionary.push(...medicalTerms.map(term => toUpperCaseTurkish(term.trim())));

            dictionary = [...new Set(dictionary)]; // Tekrar eden kelimeleri kaldır
            console.log('Sözlükler başarıyla yüklendi:', dictionary);
        } catch (error) {
            console.error('Sözlük yüklenirken hata oluştu:', error);
        }
    }

    // Sayfa yüklendiğinde sözlükleri yükle
    window.addEventListener('load', () => {
        fetchDictionaries();
    });

    let activeIndex = -1;  // Seçilen öğe
    let suggestions = [];

    // Türkçe karakterleri normalize eden yardımcı fonksiyon
    function normalizeTurkishChars(text) {
        return text
            .toLowerCase()
            .replace(/ç/g, 'c')
            .replace(/ğ/g, 'g')
            .replace(/ı/g, 'i') // Türkçe 'ı' harfini 'i' olarak normalize et
            .replace(/ö/g, 'o')
            .replace(/ş/g, 's')
            .replace(/ü/g, 'u')
            .replace(/İ/g, 'i'); // Büyük 'İ' harfini küçük 'i' olarak normalize et
    }

    // Sadece günlük ve tıbbi terimlerin kullanılmasını sağlamak için sözlüğü filtrele
    function filterDictionary() {
        dictionary = dictionary.filter(word => {
            const medicalTerms = [
                "ağrı", "ameliyat", "antibiyotik", "ateş", "bağışıklık", "doktor", "enfeksiyon",
                "grip", "hastane", "ilaç", "kanser", "muayene", "sağlık", "tedavi", "tıbbi", "virüs"
            ];
            return medicalTerms.includes(word.toLowerCase());
        });
    }

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
        container.style.maxHeight = '150px'; // Kutu yüksekliği küçültüldü
        container.style.overflowY = 'auto';
        container.style.zIndex = '1000';
        container.style.width = `${inputElement.offsetWidth * 0.8}px`; // Genişlik biraz küçültüldü
        container.style.borderRadius = '4px'; // Daha az yuvarlak köşeler
        container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        container.style.scrollbarWidth = 'thin'; // Zarif kaydırma çubuğu
        container.style.scrollbarColor = '#888 #ccc'; // Kaydırma çubuğu renkleri

        // Tahmin kutusunun konumunu ayarla
        const rect = inputElement.getBoundingClientRect();
        const cursorPosition = getCaretCoordinates(inputElement, inputElement.selectionStart);
        const lineHeight = parseInt(window.getComputedStyle(inputElement).lineHeight, 10) || 20;
        container.style.top = `${rect.top + cursorPosition.top + lineHeight + window.scrollY}px`;
        container.style.left = `${rect.left + cursorPosition.left + window.scrollX}px`;

        const query = normalizeTurkishChars(inputElement.value.trim().split(' ').pop());
        console.log("Girilen metin:", query);

        // Türkçe sözlükten ve tıbbi terimlerden eşleşmeleri bul
        suggestions = dictionary
            .filter(word => normalizeTurkishChars(word).includes(query))
            .sort((a, b) => {
                // En yakın eşleşmeleri önce göstermek için sıralama
                const aStartsWith = normalizeTurkishChars(a).startsWith(query);
                const bStartsWith = normalizeTurkishChars(b).startsWith(query);
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                return a.localeCompare(b); // Alfabetik sıralama
            });

        console.log("Eşleşen tahminler:", suggestions);

        // Yeni tahminleri ekle
        suggestions.forEach((match, index) => {
            const item = document.createElement('div');
            item.classList.add('prediction-item');
            item.style.padding = '6px'; // Daha dar iç boşluk
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid #eee';
            item.style.backgroundColor = '#fff';
            item.style.fontSize = '14px'; // Yazı boyutu VS Code varsayılanına ayarlandı
            item.textContent = match;

            // Tahmin numarasını ekle
            const numberSpan = document.createElement('span');
            numberSpan.textContent = ` ${index + 1}`; // Tahmin numarası
            numberSpan.style.float = 'right'; // Sağ köşeye hizala
            numberSpan.style.color = '#888'; // Gri renk
            numberSpan.style.fontSize = '12px'; // Daha küçük yazı boyutu
            item.appendChild(numberSpan);

            item.addEventListener('mouseover', () => {
                activeIndex = index; // Aktif öğeyi güncelle
                updateActiveItem();
            });

            item.addEventListener('mouseout', () => {
                activeIndex = -1; // Aktif öğeyi sıfırla
                updateActiveItem();
            });

            item.addEventListener('click', () => {
                completePrediction(inputElement, match);
                container.remove();
            });

            container.appendChild(item);
        });

        if (suggestions.length > 0) {
            document.body.appendChild(container);
        }
    }

    // Aktif öğeyi güncelleyen yardımcı fonksiyon
    function updateActiveItem() {
        const predictionItems = document.querySelectorAll('.prediction-item');
        predictionItems.forEach((item, index) => {
            if (index === activeIndex) {
                item.style.backgroundColor = '#663399';
                item.style.color = '#fff';
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); // Odakta olan öğeyi kaydır
            } else {
                item.style.backgroundColor = '#fff';
                item.style.color = '#000';
            }
        });
    }

    // Tahmini tamamlayan yardımcı fonksiyon
    function completePrediction(inputElement, match) {
        const words = inputElement.value.split(' ');
        words[words.length - 1] = match; // Son kelimeyi tahminle değiştir
        inputElement.value = words.join(' '); // Yeni metni güncelle
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
                updateActiveItem();
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (activeIndex > 0) {
                activeIndex--;
                updateActiveItem();
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (activeIndex >= 0 && predictionItems[activeIndex]) {
                completePrediction(inputElement, predictionItems[activeIndex].textContent);
                document.querySelector('.prediction-container').remove();
            }
        }
    }

    // Her yazı girdiğinde tahminleri göster
    document.addEventListener('input', async function(event) {
        const inputElement = event.target;

        // Yalnızca input alanlarında çalışacak
        if (inputElement.tagName === 'TEXTAREA') {
            const query = inputElement.value.trim();
            if (query.length > 2) { // En az 3 harf yazıldığında API'yi çağır
                const tdkResults = await fetchFromTDKAPI(query);
                dictionary.push(...tdkResults); // API'den gelen sonuçları sözlüğe ekle
                showPredictions(inputElement); // Tahminleri göster
            }
        }
    });

    // Klavye kısayollarını dinle
    document.addEventListener('keydown', function(event) {
        const inputElement = document.activeElement;

        // Yalnızca input ve textarea alanlarında çalışacak
        if (inputElement.tagName === 'TEXTAREA' && document.querySelector('.prediction-item')) {
            const key = parseInt(event.key, 10); // Basılan tuşu sayıya çevir
            if (!isNaN(key) && key > 0 && key <= suggestions.length) {
                // Numara tuşuna basıldığında tahmini tamamla
                event.preventDefault(); // Rakamın yazılmasını engelle
                completePrediction(inputElement, suggestions[key - 1]); // Sadece tahmini yaz
                document.querySelector('.prediction-container').remove();
            } else {
                handleArrowKeys(event, inputElement); // Ok tuşlarını işle
            }
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

    async function fetchFromTDKAPI(query) {
        const apiUrl = `https://tdk-api-url.com/search?q=${query}`; // TDK API'nin URL'si

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('TDK API verileri:', data); // Hata ayıklama için konsola yaz
            return data;
        } catch (error) {
            console.error('TDK API çağrısı sırasında hata oluştu:', error);
            return [];
        }
    }
})();
