// ==UserScript==
// @name         Copy stat.ink stats in excel format.
// @namespace    http://tampermonkey.net/
// @version      0.2
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
            item.innerHTML = '00:' + matchTime;
        }
    });

    var assistHeader = document.createElement('th');
    assistHeader.class = "text-nowrap text-center col-assist";
    assistHeader.innerText = "a";
    $('.col-kill').after(assistHeader);

    var goodGuysScore = $('tr:contains(Final Count)').find('.progress-bar-info').text();
    var badGuysScore = $('tr:contains(Final Count)').find('.progress-bar-danger').text();

    $('#players').find('th:contains(Good Guys)').append(' ' + goodGuysScore);
    $('#players').find('th:contains(Bad Guys)').append(' ' + badGuysScore);

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
        var excelData = [];
        excelData.push([]);
        $('#players > thead > tr > th').each(function(index, item) {
            excelData[0].push(item.innerText);
        });
        $('#players > tbody > tr').each(function(trIndex, item) {
            excelData.push([]);
            $(item).children().each(function(_, item) {
                var tdData = item.innerText;
                if (isNaN(tdData)) {
                    if (tdData.match(/\#[0-9][0-9][0-9][0-9]/)) {
                        excelData[trIndex + 1].push(tdData.split('\n')[1]);
                    }
                    else {
                        excelData[trIndex + 1].push(tdData.replace('\n', ''));
                    }
                }
                else {
                    var num = parseInt(tdData);
                    if (isNaN(num)) {
                        excelData[trIndex + 1].push(' ');
                    }
                    else {
                        excelData[trIndex + 1].push(num);
                    }
                }
            });
        });

        excelData[1].splice(1, 0, '\t');
        excelData[6].splice(1, 0, '\t');

        var result = '';
        excelData.forEach(row => {
            result += row.join('\t');
            result += '\n';
        });

        navigator.clipboard.writeText(result);
    };

    var btnCopyStats = document.createElement('button');
    btnCopyStats.innerText = "Copy";
    btnCopyStats.style = "float: right; margin-bottom: 10px;";
    btnCopyStats.onclick = excelCopy;
    $('#players').after(btnCopyStats);

    $('div[class*=abilities]').remove();

    $('#players').find('.basic-icon').remove();
})();