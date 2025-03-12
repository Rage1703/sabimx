// ==UserScript==
// @name         Kaydet Butonunu Devre Dışı Bırak
// @version      1.3
// @description  Açıklama alanı boşken kaydet butonunu devre dışı bırakır, ancak başka kısıtlamalara müdahale etmez.
// @author       Rage1703
// @match        https://sabim.sonitel.io/custom/sabim?MobileNumber=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function updateButtonState() {
        let textarea = document.querySelector('textarea[id="mat-input-15"]');
        let button = Array.from(document.querySelectorAll('button.mat-raised-button')).find(btn => btn.innerText.trim() === "Kaydet");

        if (textarea && button) {
            if (textarea.value.trim() === "") {
                button.setAttribute("data-textarea-empty", "true");
                button.setAttribute("disabled", "true");
                button.classList.add("mat-button-disabled");
            } else {
                button.removeAttribute("data-textarea-empty");

                // Eğer başka bir engel yoksa butonu aktif hale getir
                if (button.hasAttribute("disabled") && button.getAttribute("data-textarea-empty") !== "true") {
                    button.removeAttribute("disabled");
                    button.classList.remove("mat-button-disabled");
                }
            }
        }
    }

    document.addEventListener("input", updateButtonState);

    // Sayfa yüklendiğinde butonun durumunu güncelle
    window.addEventListener("load", updateButtonState);
})();
