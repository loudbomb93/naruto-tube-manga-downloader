// ==UserScript==
// @name         Naruto-Tube.org - Manga Downloader
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Ein Tampermonkey-Script um Manga-Kapitel von http://onepiece-tube.com als PDF herunterzuladen.
// @author       LoudBomb
// @icon         https://i.imgur.com/SAtFjAa.png
// @match        http://naruto-tube.org/boruto-kapitel-mangaliste*
// @match        http://naruto-tube.org/manga/boruto-kapitel/*
// @match        http://naruto-tube.org/shippuuden-kapitel-mangaliste*
// @match        http://naruto-tube.org/manga/shippuuden-kapitel/*
// @grant        none
// @homepage     https://loudbomb93.github.io/one-piece-manga-downloader/
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function() {
    'use strict';
    /**-----------------------Libraries-------------------
     * JsPDF wird im head eingebunden              */
    $("head").append('<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js" integrity="sha384-NaWTHo/8YCBYJ59830LTz/P4aQZK1sS0SneOgAvhsIl3zBu8r9RevNg5lHCHAuQ/" crossorigin="anonymous"></script>');

    /**------------------set Variables-----------------*/
    var sParenthostname = "naruto-tube.org";
    var sIMGsrc = "http://naruto-tube.org/manga/boruto-kapitel/";
    var iFrameHost = "naruto-tube.org";
    var aIMGUrl = [];
    window.oFinal = {};
    var sDocname = "Manga";
    var elem = $("body");
    var sKapitel = "test";
    var sName = "";
    var iSeiten = 0;

    /**-----------------initial setup per Page -----------*/
    if((/boruto/).test(document.location.pathname)){
        sDocname = "Boruto";
        sIMGsrc = "http://naruto-tube.org/manga/boruto-kapitel/";
        sParenthostname = "naruto-tube.org";
    }
    if((/shippuuden/).test(document.location.pathname)){
        sDocname = "Naruto Shippuuden";
        sIMGsrc = "http://naruto-tube.org/manga/shippuuden-kapitel/";
        sParenthostname = "naruto-tube.org";
    }

    /**Helper function inIframe
     * Checkt ob sich ein element inerhalb eines iFrames befindet oder nicht */
    function inIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    /** ---------------CreatePDF with jsPDF-----------------*/
    function createpdf(){
        var doc = new jsPDF();
        for(var p = 1; p <=Object.keys(window.oFinal).length; p++){
            var sKey = p.toString().length === 2 ? p.toString() : "0" + p;
            if(window.oFinal[sKey][0] !== "dne"){
                if(window.oFinal[sKey][1] > 910){
                    doc.addImage(window.oFinal[sKey][0], 'PNG', 0, 0, 210, 148);
                } else {
                    doc.addImage(window.oFinal[sKey][0], 'PNG', 0, 0, 210, 297);
                }
                if(p <Object.keys(window.oFinal).length) {
                    doc.addPage();
                }
            }
        }
        doc.save(sDocname + " " + sKapitel + " - " + sName+ ".pdf");
        elem.text("Finished");
        elem.css("background-color", "#4CAF50");
    }

    /**-----------------checkFinal Funktion----------------------
     * checkt ob alle Bilder geladen sind oder noch auf bilder gewartet werden muss
     * sind alle Bilder da so wird die createpdf function aufgerufen*/
    window.checkFinal = function(final){
        if(aIMGUrl.length === Object.keys(final).length && !inIframe() && aIMGUrl.length > 0){
            console.log("Geladen: " + Object.keys(final).length + " von "+ aIMGUrl.length);
            createpdf();
        }else if(!(elem.is("body")) && !inIframe()){
            //elem.text("Lade: " + Object.keys(final).length + " von "+ aIMGUrl.length);
            console.log("Lade: " + Object.keys(final).length + " von "+ aIMGUrl.length);
        }
    };
    /**----------------------------------------------------------

    /**------------ html5 Postmessage Function iFrame---------------------------*/
    function createiFrame(i, imgtype, element){
        $('<iframe>', {
            src: aIMGUrl[i] + imgtype,
            class:  'LoudBomb-iframe-ID',
            height :0,
            width : 0,
            frameborder: 0,
            scrolling: 'no'
        }).appendTo(element)
    }
    function displayMessage (evt) {
        //console.log("iFrame MSG: " + evt.data + " from " + evt.origin);
        //Wenn das iFrame mit jpg antwortet wurde kein jpg gefunden und es wird ein neues iframe mit .png erstellt
        if(evt.data[1] === "jpg"){
            var Arraykey = parseInt(evt.data[0])-1;
            createiFrame(Arraykey, ".png", elem);
        }else if(evt.data[1] === "NF"){
            window.oFinal[evt.data[0]] = ["dne"];
        }else if(evt.data[1] === "found"){
            window.oFinal[evt.data[0]] = [evt.data[2], evt.data[3]];
        }
        window.checkFinal(window.oFinal);
    }

    if (window.addEventListener) {
        window.addEventListener("message", displayMessage, false);
    }
    else {
        window.attachEvent("onmessage", displayMessage);
    }
    /**------------------------------------------------------------------- */


    /**-------------Convert image to base64 Function-------------------- */
    function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/jpeg");

        return dataURL;
    }
    /**------------------------------------------------------------------- */


    /**------------ Set iFrame Logic-------------------------*/
    if(inIframe()){
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
            var imgData = getBase64Image(bimg);
            parent.window.postMessage([sPage, "found", imgData, bwidth], "*");
        }
    }


    /** --------------------Setze Download-Buttons-----------------------------------------*/
    if(document.location.hostname === sParenthostname && $(".sagatable .list tbody").length !== 0){
        $(".sagatable .list tbody").find("[onclick]").each(function(){
            $(this).prop("onclick", null).off("click");
            $(this).find('td:eq(2)').after('<td> <button class="btn success LoudBomb-btn" >Download</button> </td>');
        })
    }
    /** --------------------Add function to Button-Click-----------------------------------------*/
    $(".LoudBomb-btn").click(function(){
        //Clear old IMGURLS
        aIMGUrl = [];
        window.oFinal = {};
        $(".LoudBomb-iframe-ID").remove()
        //------------------------------------
        var oInfo = $(this).parents("tr.mediaitem").children();
        if(typeof oInfo !== "undefined" && Object.keys(oInfo).length !== 0){
            elem = $(this);
            elem.text("Converting to PDF");
            elem.css("background-color", "#f7d219");
            sKapitel = (/^\d{1,3}$/g).test(oInfo[0].innerText) ? oInfo[0].innerText : false;
            if(sKapitel.length === 1){
                sKapitel = "00" + sKapitel;
            }else if (sKapitel.length === 2){
                sKapitel = "0" + sKapitel;
            }
            sName = oInfo[1].innerText;
            var sOnlineStatus = oInfo[2].innerText.replace(" ", "");
            iSeiten = parseInt(oInfo[4].innerText);
            window.aimg = [];
            for(var keys = 1; keys <= iSeiten; keys++){
                var sSeite = keys.toString().length === 2 ? keys.toString() : "0" + keys;
                //console.log(sIMGsrc + sKapitel + "/" + sSeite + ".jpg");
                aIMGUrl.push(sIMGsrc + sKapitel + "/" + sSeite);
                // For Testing uncomment to check if IMGs are loaded under window.aimg
                //window.aimg.push(sIMGsrc + sKapitel + "/" + sSeite);
            }
            for(var i = 0; i<=aIMGUrl.length; i++){
                $('<iframe>', {
                    src: aIMGUrl[i] + ".jpg",
                    class:  'LoudBomb-iframe-ID',
                    height :0,
                    width : 0,
                    frameborder: 0,
                    scrolling: 'no'
                }).appendTo(this)
            }
            // iframe abgleichen ob img vorhanden ist (messagepassing)
        }
    });

})();
