// ==UserScript==
// @name         Sayfa Kapatma Uyarısı
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sayfayı kapatmadan önce onay isteyen bir betik
// @author       Rage17
// @match        https://sabim.sonitel.io/custom/sabim?MobileNumber=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Kullanıcı sayfayı kapatmaya veya yenilemeye çalıştığında uyarı göster
    window.addEventListener("beforeunload", function(event) {
        const message = "Bu sayfadan ayrılmak istediğinize emin misiniz?";
        event.preventDefault();
        event.returnValue = message; // Bazı tarayıcılar için gereklidir
        return message;
    });
})();
