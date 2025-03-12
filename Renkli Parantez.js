// ==UserScript==
// @name         Highlight Parentheses Text in Textareas
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Belirli textarea'larda parantez içindeki metni renklendirir.
// @author       YourName
// @match        https://sabim.sonitel.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function createOverlay(textarea) {
        let overlay = document.createElement('div');
        overlay.classList.add('text-highlight-overlay');
        overlay.style.position = 'absolute';
        overlay.style.pointerEvents = 'none';
        overlay.style.whiteSpace = 'pre-wrap';
        overlay.style.wordWrap = 'break-word';
        overlay.style.overflow = 'hidden';
        overlay.style.color = 'black';
        overlay.style.background = 'transparent';
        overlay.style.zIndex = '10';
        overlay.style.border = '1px solid transparent'; // Yerleşim için
        overlay.style.padding = window.getComputedStyle(textarea).padding;
        overlay.style.fontSize = window.getComputedStyle(textarea).fontSize;
        overlay.style.fontFamily = window.getComputedStyle(textarea).fontFamily;
        overlay.style.lineHeight = window.getComputedStyle(textarea).lineHeight;
        overlay.style.textAlign = window.getComputedStyle(textarea).textAlign;
        overlay.style.overflowWrap = 'break-word';
        overlay.style.resize = 'none';
        overlay.style.whiteSpace = 'pre-wrap';
        overlay.style.left = textarea.offsetLeft + 'px';
        overlay.style.top = textarea.offsetTop + 'px';
        overlay.style.width = textarea.offsetWidth + 'px';
        overlay.style.height = textarea.offsetHeight + 'px';
        overlay.style.position = 'absolute';
        overlay.style.padding = window.getComputedStyle(textarea).padding;
        overlay.style.color = 'transparent';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.overflow = 'hidden';
        overlay.style.pointerEvents = 'none';

        textarea.parentNode.appendChild(overlay);
        return overlay;
    }

    function updateOverlay(textarea, overlay) {
        let value = textarea.value;
        let highlightedText = value.replace(/\(([^()]+)\)/g, '<span style="color:#de1fde">($1)</span>');

        overlay.innerHTML = highlightedText.replace(/\n/g, '<br>');
        overlay.style.left = textarea.offsetLeft + 'px';
        overlay.style.top = textarea.offsetTop + 'px';
        overlay.style.width = textarea.offsetWidth + 'px';
        overlay.style.height = textarea.offsetHeight + 'px';
    }

    function observeTextareas() {
        const textareas = document.querySelectorAll('textarea[data-placeholder="Açıklama"], textarea[data-placeholder="Notlar"]');
        textareas.forEach(textarea => {
            if (!textarea.hasAttribute('data-highlight-initialized')) {
                let overlay = createOverlay(textarea);

                textarea.addEventListener('input', () => updateOverlay(textarea, overlay));
                textarea.addEventListener('scroll', () => overlay.scrollTop = textarea.scrollTop);

                textarea.setAttribute('data-highlight-initialized', 'true');
            }
        });
    }

    const observer = new MutationObserver(observeTextareas);
    observer.observe(document.body, { childList: true, subtree: true });

    observeTextareas(); // Sayfa yüklenirken hemen çalıştır
})();
