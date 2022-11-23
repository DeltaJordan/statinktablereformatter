// ==UserScript==
// @name         Copy stat.ink stats in excel format.
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copies stat.ink stats in a format that plays better with excel.
// @author       DeltaJordan
// @match        https://stat.ink/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stat.ink
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function() {
    'use strict';

    $('#players > thead > tr > th').each(function(index, item) {
        if (index == 0) {
            var elapsedRow = $('tr:contains(Elapsed Time)');
            var elapsedData = $(elapsedRow).find('td');
            var matchTime = elapsedData.text().split(' ')[0];
            item.innerHTML = matchTime;
        }
    });

    var assistHeader = document.createElement('th');
    assistHeader.class = "text-nowrap text-center col-assist";
    assistHeader.innerText = "a";
    $('.col-kill').after(assistHeader);

    $('#players > tbody > tr').each(function(index, item) {
        if (index == 1) {
            let mapRow = $('tr:contains(Stage)');
            let mapData = $(mapRow).find('td');
            let ggFirstRow = $(item).children().first();
            ggFirstRow.text(mapData.text());
        }
        else if (index == 2) {
            let modeRow = $('tr:contains(Mode)');
            let modeData = $(modeRow).find('td');
            let ggFirstRow = $(item).children().first();
            ggFirstRow.text(modeData.text().split('-')[0].trimEnd());
        }
    });

    $('td > small').each(function(index, small) {
        var currentAssistData = $(small).parent();
        var newAssistData = document.createElement('td');
        newAssistData.innerText = small.innerText.replace("+ ", "");
        newAssistData.class = "text-right assistData";
        $(currentAssistData).after(newAssistData);
        $(small).remove();
    });

    var totalGG = 0;
    var totalBG = 0;
    let tablePlayers = $('#players > tbody');
    for (var i = 0; i < tablePlayers.children().length; i++) {
        if ([1,2,3,4].includes(i)) {
            totalGG += parseInt($(tablePlayers.children()[i]).children()[5].innerText);
        }
        else if ([6,7,8,9].includes(i)) {
            totalBG += parseInt($(tablePlayers.children()[i]).children()[5].innerText);
        }
    }

    var ggAssistTotalColumn = document.createElement('td');
    ggAssistTotalColumn.innerText = totalGG;
    ggAssistTotalColumn.class = "text-right";
    var goodGuysAssists = tablePlayers.children()[0];
    $(goodGuysAssists).children()[2].after(ggAssistTotalColumn);

    var bgAssistTotalColumn = document.createElement('td');
    bgAssistTotalColumn.innerText = totalBG;
    bgAssistTotalColumn.class = "text-right";
    var badGuysAssists = tablePlayers.children()[5];
    $(badGuysAssists).children()[2].after(bgAssistTotalColumn);

    var excelCopy = function() {
        let html = document.getElementById('players');
        const blob = new Blob([html], { 'type': 'text/html' });
        navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    };

    var btnCopyStats = document.createElement('button');
    btnCopyStats.innerText = "Copy";
    btnCopyStats.style = "float: right; margin-bottom: 10px;";
    btnCopyStats.onclick = excelCopy;
    $('#players').after(btnCopyStats);

    $('div[class*=abilities]').each(function(index, item) {
        $(item).remove();
    });

    $('#players').find('.basic-icon').remove();
})();