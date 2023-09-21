 /**Helper function inIframe
     * Checkt ob sich ein element inerhalb eines iFrames befindet oder nicht */
 function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
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
    var dwheading = document.createElement("button"); 
    dwheading.innerText = "Download  ";
    dwheading.className = "btn success LoudBomb-btn";
    dwheading.setAttribute("origin", kapitel_href);
    dwheading.onclick = download_pdf;
    var fa_icon = document.createElement("i");
    fa_icon.className = "far fa-save";
    //fa_icon.className = "far fa-file-pdf";
    dwheading.append(fa_icon);
    bodynames[i].parentNode.insertBefore(dwheading, bodynames[i].nextSibling);
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
        src: this.getAttribute(origin),
        class:  'LoudBomb-iframe-ID',
        id : "lb_info_iframe",
        height :0,
        width : 0,
        frameborder: 0,
        scrolling: 'no'
    }).appendTo(this)
}