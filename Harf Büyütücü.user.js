// ==UserScript==
// @name         Harf Büyütücü (Otomatik)
// @version      2.1
// @description  Belirli textarea alanlarını Türkçe karakter desteğiyle büyük harfe çevirir ve imleç konumunu korur. Ayrıca textarea yüksekliğini artırır.
// @author       Rage17
// @match        https://sabim.sonitel.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Sayfada belirli textareaları gözlemlemek için bir Observer tanımlanır
    const observer = new MutationObserver(() => {
        // Hedeflenen textarea elementlerini seçin
        const textareas = document.querySelectorAll(
            'textarea[data-placeholder="Açıklama"], textarea[data-placeholder="Notlar"]'
        );

        textareas.forEach((textarea) => {
            // Daha önce işlenmemiş olanlara işlem yap
            if (!textarea.hasAttribute('data-uppercase-initialized')) {
                // Textarea satır sayısını artır
                textarea.rows *= 2;

                // 'input' olayı ile değişiklikleri yakala
                textarea.addEventListener('input', function (e) {
                    // İmleç konumunu kaydet
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;

                    // Türkçe karakterleri dikkate alarak sadece büyük harfe çevir
                    const turkishUpperCase = textarea.value
                        .replace(/ı/g, 'I')
                        .replace(/i/g, 'İ')
                        .replace(/ş/g, 'Ş')
                        .replace(/ğ/g, 'Ğ')
                        .replace(/ü/g, 'Ü')
                        .replace(/ö/g, 'Ö')
                        .replace(/ç/g, 'Ç')
                        .toUpperCase();

                    // Eğer metin değiştirilmişse, güncelle ve imleci koru
                    if (textarea.value !== turkishUpperCase) {
                        textarea.value = turkishUpperCase;

                        // İmleç konumunu eski yerine getir
                        textarea.setSelectionRange(start, end);
                    }
                });

                // İşlenmiş olduğunu belirtmek için bir işaret ekle
                textarea.setAttribute('data-uppercase-initialized', 'true');
            }
        });
    });

    // Sayfa değişikliklerini dinle
    observer.observe(document.body, { childList: true, subtree: true });
})();