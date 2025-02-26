// ==UserScript==
// @name         Mat-Select Searchable Dropdown (Sabit ve Otomatik Seçim)
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Mat-Select dropdown'lara sabit bir arama kutusu ekler, Türkçe destekli arama yapar, kutuyu otomatik etkinleştirir ve ilk uygun seçeneği Enter ile seçer.
// @author       Rage17
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
                    const options = Array.from(panelElement.querySelectorAll('mat-option'));

                    let startsWithMatches = [];
                    let containsMatches = [];

                    options.forEach(option => {
                        const optionText = normalizeText(option.textContent || '');
                        if (optionText.startsWith(searchTerm)) {
                            startsWithMatches.push(option);
                        } else if (optionText.includes(searchTerm)) {
                            containsMatches.push(option);
                        } else {
                            option.style.display = 'none';
                        }
                    });

                    // Alfabetik olarak sırala
                    startsWithMatches.sort((a, b) => a.textContent.localeCompare(b.textContent, 'tr'));
                    containsMatches.sort((a, b) => a.textContent.localeCompare(b.textContent, 'tr'));

                    const sortedOptions = [...startsWithMatches, ...containsMatches];
                    sortedOptions.forEach(option => option.style.display = '');

                    searchBox.dataset.firstVisibleOption = sortedOptions.length > 0 ? sortedOptions[0].dataset.index : '';
                });

                searchBox.addEventListener('keydown', function(event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        const firstVisibleOption = panelElement.querySelector('mat-option:not([style*="display: none"])');
                        if (firstVisibleOption) {
                            firstVisibleOption.click();
                        }
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
