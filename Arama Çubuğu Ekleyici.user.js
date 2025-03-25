// ==UserScript==
// @name         Arama Çubuğu Ekleyici
// @version      2.9
// @description  Arama Çubuğu Ekleyici (Dropdown Menü) 
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

    function addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Sayfanın kendi seçili stilini kaldır */
            mat-option.mat-selected {
                background-color: transparent !important;
                color: inherit !important;
            }

            /* Yalnızca bizim seçili stilimiz aktif olsun */
            .selected-option {
                background-color: #a0e7e5 !important; /* Açık Turkuaz */
                color: black !important;
                font-weight: bold;
                border: 2px solid #00bcd4 !important; /* Mavi çerçeve */
            }

            /* Focus olan option'ı da belirginleştirelim */
            .focused-option {
                background-color: #00bcd4 !important; /* Mavi Arkaplan */
                color: white !important;
                font-weight: bold;
                outline: 2px solid #ffffff !important; /* Beyaz Kenarlık */
            }
        `;
        document.head.appendChild(style);
    }

    function makeMatSelectSearchable() {
        const matSelects = document.querySelectorAll('mat-select');

        matSelects.forEach(matSelect => {
            const selectId = matSelect.id;
            if (!selectId) return;

            const panelId = `#${selectId}-panel`;
            const panelElement = document.querySelector(panelId);

            if (panelElement && !panelElement.querySelector('.search-box')) {
                const options = Array.from(panelElement.querySelectorAll('mat-option'));

                if (options.length < 3) return;

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

                let activeIndex = -1;

                function updateSelection(visibleOptions, index) {
                    visibleOptions.forEach((option, i) => {
                        if (i === index) {
                            option.classList.add('focused-option'); // Focus edilen öğe
                            option.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        } else {
                            option.classList.remove('focused-option');
                        }

                        if (i === activeIndex) {
                            option.classList.add('selected-option'); // Seçilen öğe
                        } else {
                            option.classList.remove('selected-option');
                        }
                    });
                }

                searchBox.addEventListener('input', function() {
                    const searchTerm = normalizeText(searchBox.value);
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

                    startsWithMatches.sort((a, b) => a.textContent.localeCompare(b.textContent, 'tr'));
                    containsMatches.sort((a, b) => a.textContent.localeCompare(b.textContent, 'tr'));

                    const sortedOptions = [...startsWithMatches, ...containsMatches];
                    sortedOptions.forEach(option => option.style.display = '');

                    if (sortedOptions.length > 0) {
                        activeIndex = 0;
                        updateSelection(sortedOptions, activeIndex);
                    } else {
                        activeIndex = -1;
                    }
                });

                searchBox.addEventListener('keydown', function(event) {
                    const visibleOptions = Array.from(panelElement.querySelectorAll('mat-option:not([style*="display: none"])'));

                    if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        if (visibleOptions.length > 0) {
                            if (activeIndex === -1) {
                                activeIndex = 0; // İlk basışta doğrudan ilk elemana git
                            } else {
                                activeIndex = (activeIndex + 1) % visibleOptions.length;
                            }
                        }
                    } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (visibleOptions.length > 0) {
                            activeIndex = (activeIndex - 1 + visibleOptions.length) % visibleOptions.length;
                        }
                    } else if (event.key === 'Enter') {
                        event.preventDefault();
                        if (activeIndex >= 0 && visibleOptions[activeIndex]) {
                            visibleOptions[activeIndex].click();
                        }
                    } else if (event.key === ' ') {
                        event.stopPropagation();
                    }

                    updateSelection(visibleOptions, activeIndex);
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

    addCustomStyles();

    const observer = new MutationObserver(() => {
        makeMatSelectSearchable();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        makeMatSelectSearchable();
    });

})();
