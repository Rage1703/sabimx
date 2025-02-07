// ==UserScript==
// @name         Mat-Select Searchable Dropdown (Sabit ve Otomatik Seçim)
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Mat-Select dropdown'lara sabit bir arama kutusu ekler, Türkçe destekli arama yapar, kutuyu otomatik etkinleştirir ve tek sonuç kaldığında Enter/Space ile seçer.
// @author       Your Name
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function normalizeText(text) {
        const charMap = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
        };
        return text.replace(/ç|ğ|ı|ö|ş|ü|Ç|Ğ|İ|Ö|Ş|Ü/g, match => charMap[match]).toLowerCase();
    }

    function makeMatSelectSearchable() {
        const matSelects = document.querySelectorAll('mat-select');

        matSelects.forEach(matSelect => {
            const selectId = matSelect.id;
            if (!selectId) return;

            const panelId = `#${selectId}-panel`;
            const panelElement = document.querySelector(panelId);

            if (panelElement && !panelElement.querySelector('.search-box')) {
                const searchBox = document.createElement('input');
                searchBox.type = 'text';
                searchBox.placeholder = 'Ara...';
                searchBox.className = 'search-box';
                searchBox.style.cssText = `
                    width: 90%;
                    margin: 10px;
                    padding: 5px;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    background: white;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                `;

                panelElement.insertBefore(searchBox, panelElement.firstChild);

                searchBox.addEventListener('input', function() {
                    const searchTerm = normalizeText(searchBox.value);
                    const options = panelElement.querySelectorAll('mat-option');

                    let visibleOptions = 0;
                    let lastVisibleOption = null;

                    options.forEach(option => {
                        const optionText = normalizeText(option.textContent || '');
                        if (optionText.includes(searchTerm)) {
                            option.style.display = '';
                            visibleOptions++;
                            lastVisibleOption = option;
                        } else {
                            option.style.display = 'none';
                        }
                    });

                    if (visibleOptions === 1) {
                        const selectOption = function(event) {
                            if ((event.key === 'Enter' || event.key === ' ') && lastVisibleOption) {
                                event.preventDefault();
                                lastVisibleOption.click();
                            }
                        };
                        searchBox.addEventListener('keydown', selectOption);
                    }
                });

                matSelect.addEventListener('keydown', (event) => {
                    const isCharacterKey = event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey;
                    if (isCharacterKey) {
                        event.preventDefault();
                        searchBox.click();
                        searchBox.focus();
                        searchBox.value = event.key;
                        const inputEvent = new Event('input', { bubbles: true });
                        searchBox.dispatchEvent(inputEvent);
                    }
                });

                panelElement.style.maxHeight = '500px';
                panelElement.style.overflowY = 'auto';
            }
        });
    }

    const observer = new MutationObserver(() => {
        makeMatSelectSearchable();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        makeMatSelectSearchable();
    });
})();
