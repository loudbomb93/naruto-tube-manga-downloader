// ==UserScript==
// @name         Manga-Tube Downloader v2
// @namespace    http://tampermonkey.net/
// @version      2.1.3
// @description  Ein Tampermonkey-Script um Manga-Kapitel von http://onepiece-tube.com und http://naruto-tube.org als PDF herunterzuladen.
// @author       LoudBomb
// @license      MIT
// @icon         https://i.imgur.com/SAtFjAa.png
// @match        https://onepiece-tube.com/manga/kapitel-mangaliste*
// @match        http://manga-lesen.com/kapitel/*
// @match        https://manga-lesen.com/kapitel/*
// @match        http://naruto-tube.org/boruto-kapitel-mangaliste*
// @match        https://naruto-tube.org/boruto-kapitel-mangaliste*
// @match        http://naruto-tube.org/manga/boruto-kapitel/*
// @match        https://naruto-tube.org/manga/boruto-kapitel/*
// @match        http://naruto-tube.org/shippuuden-kapitel-mangaliste*
// @match        https://naruto-tube.org/shippuuden-kapitel-mangaliste*
// @match        http://naruto-tube.org/manga/shippuuden-kapitel/*
// @match        https://naruto-tube.org/manga/shippuuden-kapitel/*
// @grant        none
// @homepage     https://loudbomb93.github.io/manga-tube-downloader/
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function() {
    'use strict';
    /**-----------------------Libraries-------------------
     * JsPDF wird im head eingebunden              */
    $("head").append('<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js" integrity="sha384-NaWTHo/8YCBYJ59830LTz/P4aQZK1sS0SneOgAvhsIl3zBu8r9RevNg5lHCHAuQ/" crossorigin="anonymous"></script>');

    /**------------------set Variables-----------------*/
    /**Helper function inIframe
     * Checkt ob sich ein element inerhalb eines iFrames befindet oder nicht */
 function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

/**------------ html5 Postmessage Function iFrame---------------------------*/
function displayMessage (evt) {
    //console.log("iFrame MSG: " + evt.data + " from " + evt.origin);
    //Wenn das iFrame mit jpg antwortet wurde kein jpg gefunden und es wird ein neues iframe mit .png erstellt
    if(evt.data[1] === "jpg"){
        var Arraykey = parseInt(evt.data[0])-1;
        createiFrame(Arraykey, ".png", elem);
    }else if(evt.data[1] === "NF"){
        window.oFinal[evt.data[0]] = ["dne"];
    }else if(evt.data[1] === "found"){
        window.oFinal[evt.data[0]] = [evt.data[2], evt.data[3], evt.data[4]];
    }
    //window.checkFinal(window.oFinal);
}

if (window.addEventListener) {
    window.addEventListener("message", displayMessage, false);
}
else {
    window.attachEvent("onmessage", displayMessage);
}
/**------------------------------------------------------------------- */
if(inIframe()){
    debugger;
    var sTitle = document.title;
    //TODO: function welche auch Pages über 100 erkennt.
    var sPage = document.location.pathname.replace(/(.jpg|.png)/, "").substr(-2, 2);
    if(sTitle === "500 Internal Server Error" || sTitle === "404 Not Found"){
        if((/.*\.jpg$/).test(document.location.pathname)){
            //console.log("JPG NOT FOUND:  " + document.location.pathname)
            parent.window.postMessage([sPage, "jpg"], "*");
        }
        else if((/.*\.png$/).test(document.location.pathname)){
            //console.log(document.location.pathname + " does not exist")
            parent.window.postMessage([sPage, "NF"], "*");
        }
    }
    else {
        //console.log("FOUND :" + sTitle + "|" + document.location.pathname);
        var bimg = $("img")[0];
        var bwidth = bimg.width;
        var bheight = bimg.height;
        var imgData = getBase64Image(bimg);
        parent.window.postMessage([sPage, "found", imgData, bwidth, bheight], "*");
    }
}

//--------------SETTING Download Button---------------------------
var headingnames = $(".segment-heading").find(".segment-name");

for (var i = 0; i < headingnames.length; i++) {
    var dwheading = document.createElement("div");
    dwheading.innerText = "PDF Download";
    dwheading.className = "fw-bold";
    headingnames[i].parentNode.insertBefore(dwheading, headingnames[i].nextSibling);
}

var bodynames = $(".segment-body").find(".segment-name");

for (var i = 0; i < bodynames.length; i++) {
    //save href from paren
    var kapitel_href = bodynames[i].parentElement.href;
    //remove href from element
    bodynames[i].parentElement.removeAttribute("href");
    var dwbutton = document.createElement("button"); 
    dwbutton.innerText = "Download  ";
    dwbutton.className = "btn success LoudBomb-btn";
    dwbutton.setAttribute("chapter_href", kapitel_href);
    dwbutton.onclick = download_pdf;
    var fa_icon = document.createElement("i");
    fa_icon.className = "far fa-save";
    //fa_icon.className = "far fa-file-pdf";
    dwbutton.append(fa_icon);
    bodynames[i].parentNode.insertBefore(dwbutton, bodynames[i].nextSibling);
}

function download_pdf(){
    var parentrow_elem = $(this).parent();
    var chapter = {
        name : parentrow_elem.find(".segment-name")[0].innerText,
        number : parentrow_elem.find(".segment-number")[0].innerText,
        pages : parentrow_elem.find(".segment-pages")[0].innerText
    };
    console.log("Starting Download");
    console.log(chapter);

    $('<iframe>', {
        src: this.getAttribute("chapter_href"),
        class:  'LoudBomb-iframe-ID',
        id : "lb_info_iframe",
        height :0,
        width : 0,
        frameborder: 0,
        scrolling: 'no'
    }).appendTo(this)
}

})();
