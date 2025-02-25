// ==UserScript==
// @name         Mouse tekerini Devre dışı bırak.
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  matinput type="number" öğelerinde fare tekeri ile değer değişimini engeller
// @author       [Kendi Adınız]
// @match        https://sabim.sonitel.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Tüm belge üzerinde fare tekeri olayını dinle
    document.addEventListener('wheel', function(event) {
        // Eğer hedef element bir matinput ve type="number" ise
        if (event.target.classList.contains('mat-input-element') && event.target.type === 'number') {
            // Varsayılan kaydırma davranışını engelle
            event.preventDefault();
        }
    }, { passive: false });
})();
