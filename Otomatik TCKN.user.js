// ==UserScript==
// @name         Otomatik Başlık seçimi ve TCKN
// @version      2.1
// @description  Textarea içinde veri girildikçe veya değişiklik oldukça TCKN: veya TC: verisini otomatik aktarır ve belirli ifadeler geçerse başvuru türü ve sebebini seçer.
// @author       Rage17
// @match        https://sabim.sonitel.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let lastTckn = null;
    let scanningInterval = 2000;
    let isFirstInput = true;
    let textAreaClicked = false;
    let ambulanceSelectedCount = 0; // Ambulans başvuru türü seçilme sayısı
    let animationResetTimeout;
    let isAnimationReset = false;

    // Dropdown animasyonlarını sıfırlamak
    function disableDropdownAnimations() {
        const dropdowns = document.querySelectorAll('mat-select');
        dropdowns.forEach(dropdown => {
            dropdown.style.transition = 'none'; // Animasyonu kapatıyoruz
        });
    }

    // Animasyonları eski haline getirmek
    function restoreDropdownAnimations() {
        const dropdowns = document.querySelectorAll('mat-select');
        dropdowns.forEach(dropdown => {
            dropdown.style.transition = ''; // Animasyonu eski haline getiriyoruz
        });
    }

    // Animasyon sıfırlama işlemi tetikleniyor
    function triggerAnimationResetIfNeeded() {
        if (isAnimationReset) return; // Zaten animasyon sıfırlandıysa, tekrar yapma

        disableDropdownAnimations();

        // 10 saniye sonra animasyonları geri yükle
        animationResetTimeout = setTimeout(() => {
            restoreDropdownAnimations();
            isAnimationReset = false; // Animasyon sıfırlama işlemi tamamlandı
        }, 10000); // 10 saniye sonra animasyonları geri yükle

        isAnimationReset = true; // Animasyon sıfırlama işlemi başlatıldı
    }

    // TCKN verisini almak
    function extractTCKN(text) {
        const matches = text.match(/(?:TCKN|TC):\s*(\d{11})/g);
        if (matches && matches.length > 0) {
            const firstMatch = matches[0].match(/\d{11}/);
            return firstMatch ? firstMatch[0] : null;
        }
        return null;
    }

    // TCKN bilgisini input'a aktar
    function updateTcField() {
        const textarea = document.querySelector('#mat-input-15');
        const tcInput = document.querySelector('#mat-input-1');

        if (!textarea || !tcInput) return;

        const tckn = extractTCKN(textarea.value);

        if (tckn && lastTckn !== tckn) {
            lastTckn = tckn;
            if (!tcInput.value.trim() || tcInput.value.trim() !== tckn) {
                tcInput.value = tckn;
                tcInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }

    // Dropdown'dan seçili olan değeri almak
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

    // Dropdown menüsünden seçim yapmak
    function selectDropdownOption(dropdownType, optionText, callback) {
        if (getSelectedOption(dropdownType) === optionText) {
            console.log(`${dropdownType} zaten seçili: ${optionText}`);
            if (callback) callback();
            return;
        }

        // Eğer başvuru türü "SAĞLIK ÇALIŞANINA TEHDİT / ŞİDDET" seçili ise, hiçbir değişiklik yapılmasın
        if (getSelectedOption('Başvuru Türü') === 'SAĞLIK ÇALIŞANINA TEHDİT / ŞİDDET') {
            console.log('Başvuru türü "SAĞLIK ÇALIŞANINA TEHDİT / ŞİDDET" seçili, dropdown menülerine müdahale edilmiyor.');
            return;
        }

        const formFields = document.querySelectorAll('mat-form-field');
        formFields.forEach(formField => {
            const label = formField.querySelector('mat-label');
            if (label && label.textContent.trim() === dropdownType) {
                const dropdown = formField.querySelector('mat-select');
                if (dropdown) {
                    dropdown.click();
                    setTimeout(() => {
                        const options = document.querySelectorAll('mat-option .mat-option-text');
                        options.forEach(option => {
                            if (option.textContent.trim() === optionText) {
                                option.click();
                                console.log(`${dropdownType} seçildi: ${optionText}`);
                                if (callback) setTimeout(callback, 120); // 120 ms gecikme ekliyoruz
                            }
                        });
                    }, 70); // 70 ms gecikme ekliyoruz
                }
            }
        });
    }

    // Ambulans talebini kontrol etme
    function checkForAmbulanceRequest() {
        const textarea = document.querySelector('#mat-input-15');
        if (!textarea) return;

        const text = textarea.value;
        const ambulanceKeywords = [
            "BİRİMİNİZ ARACILIĞI İLE AMBULANS TALEP EDİYORUM",
            "AMBULANSI TALEP EDİYORUM",
            "AMBULANS TALEP EDİYORUM",
            "AMBULANS TEMİN EDİLMESİNİ İSTİYORUM",
            "AMBULANS İSTİYORUM",
            "BİRİMİNİZ ARACILIĞIYLA AMBULANS TALEP EDİYORUM."
        ];

        if (ambulanceKeywords.some(keyword => text.includes(keyword))) {
            console.log("Ambulans talebi tespit edildi, seçim yapılıyor...");

            // Ambulans başvuru türü zaten seçildiyse, tekrar değiştirme
            if (ambulanceSelectedCount < 2) {
                if (getSelectedOption('Başvuru Türü') !== 'ACİL YARDIM' || getSelectedOption('Başvuru Sebebi') !== 'Ambulans Talebi') {
                    selectDropdownOption('Başvuru Türü', 'ACİL YARDIM', () => {
                        selectDropdownOption('Başvuru Sebebi', 'Ambulans Talebi', () => {
                            selectDropdownOption('Kurum Türü', 'Kamu', () => {
                                selectDropdownOption('Kurum Tipi', '112 Başhekimliği');
                                ambulanceSelectedCount++;
                            });
                        });
                    });
                }
            }
        }
    }

    // Ücret bilgisi talebini kontrol etme
    function checkForFeeInformationRequest() {
        const textarea = document.querySelector('#mat-input-15');
        if (!textarea) return;

        const text = textarea.value;
        const feeInformationKeywords = [
            "BU ÜCRETİN YASAL OLUP OLMADIĞI HAKKINDA BİRİMİNİZ ARACILIĞI İLE BİLGİ ALMAK İSTİYORUM.",
            "ÜCRETLER HAKKINDA BİLGİ ALMAK İSTİYORUM."
        ];

        if (feeInformationKeywords.some(keyword => text.includes(keyword))) {
            console.log("Ücret bilgisi talebi tespit edildi, seçim yapılıyor...");

            // Başvuru türü seçilmemişse "BİLGİ ALMA" ve "Sağlık Hizmeti Ücretlendirmeleri" seçeneklerini otomatik seç
            if (!getSelectedOption('Başvuru Türü')) {
                selectDropdownOption('Başvuru Türü', 'BİLGİ ALMA', () => {
                    selectDropdownOption('Başvuru Sebebi', 'Sağlık Hizmeti Ücretlendirmeleri');
                });
            }
        }
    }

    // Sağlık çalışanı eylemi talebini kontrol etme
    function checkForHealthWorkerActionRequest() {
        const textarea = document.querySelector('#mat-input-15');
        if (!textarea) return;

        const text = textarea.value;
        const actionKeywords = [
            "EYLEMDE OLMASI SEBEBİ İLE",
            "EYLEMDE OLDUĞU İÇİN",
            "EYLEMDE OLMASI SEBEBİYLE"
        ];

        if (actionKeywords.some(keyword => text.includes(keyword))) {
            console.log("Sağlık çalışanı eylemi talebi tespit edildi, seçim yapılıyor...");

            // Başvuru türü seçilmemişse "SAĞLIK ÇALIŞANI EYLEMİ" ve "SAĞLIK ÇALIŞANI EYLEMİ" seçeneklerini otomatik seç
            if (!getSelectedOption('Başvuru Türü')) {
                selectDropdownOption('Başvuru Türü', 'SAĞLIK ÇALIŞANI EYLEMİ', () => {
                    selectDropdownOption('Başvuru Sebebi', 'SAĞLIK ÇALIŞANI EYLEMİ');
                });
            }
        }
    }

    const observer = new MutationObserver(() => {
        updateTcField();
        checkForAmbulanceRequest();
        checkForFeeInformationRequest(); // Yeni özellik ekleniyor
        checkForHealthWorkerActionRequest(); // Yeni özellik ekleniyor
    });
    const config = { childList: true, subtree: true, characterData: true };

    const textarea = document.querySelector('#mat-input-15');
    if (textarea) {
        observer.observe(textarea, config);
        textarea.addEventListener('input', () => {
            textAreaClicked = true;
        });
    }

    function startScanning() {
        if (isFirstInput) {
            scanningInterval = 2000;
        } else {
            scanningInterval = textAreaClicked ? 5000 : 15000;
        }

        setTimeout(() => {
            updateTcField();
            checkForAmbulanceRequest();
            checkForFeeInformationRequest(); // Yeni özellik ekleniyor
            checkForHealthWorkerActionRequest(); // Yeni özellik ekleniyor
            startScanning();
        }, scanningInterval);
    }

    startScanning();

    console.log("TCKN veya TC Otomatik Aktarma ve Başvuru Türü Seçme scripti çalışıyor...");
})();
