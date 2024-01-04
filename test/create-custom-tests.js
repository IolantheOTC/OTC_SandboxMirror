console.log("Generating custom tests...");

let core = null;
try {
    core = require('@actions/core');
} catch {
    console.log(`@actions/core was unavailable!`);
}
const fs = require('fs');
const OTC = require('./api/otc_api.js');

// Get list of specific changed tour files (for PR)
var allChangedTourFiles = process.env.ALL_CHANGED_TOUR_FILES;
if (!allChangedTourFiles) { // Fallback to command-line
    console.log(`(Param fell back to command line...)`);
    allChangedTourFiles = process.argv[2];
}
console.log(`allChangedTourFiles: ${allChangedTourFiles}`);

let targetTourNameArray = null;
if(allChangedTourFiles) {
    allChangedTourFiles = allChangedTourFiles.replace('allChangedTourFiles=', '');
    if('' !== allChangedTourFiles) {
        targetTourNameArray = allChangedTourFiles.split(' '); // GitHub action list splits on space
        for(var nTourItr = 0; nTourItr < targetTourNameArray.length; ++nTourItr) {
            targetTourNameArray[nTourItr] = targetTourNameArray[nTourItr].replace('formats/', '').replace(OTC.TourExt, '');
        }
    }
}

const sTourNameList = fs.readFileSync('./../metadata/list.txt', {encoding: 'utf8'});
const sTourNameArray = sTourNameList.split('\n');

const sTemplateOuter = fs.readFileSync('./otc-test-template-outer.txt', {encoding: 'utf8'});
const sTemplateInner = fs.readFileSync('./otc-test-template-inner.txt', {encoding: 'utf8'});

var sGeneratedCodeInner = '';

process.chdir('./../formats');
fs.readdirSync('./').forEach(sFilename => {
    const sTourName = sFilename.replace(OTC.TourExt, '');
    if(!sTourNameArray.includes(sTourName)) return;

    if(targetTourNameArray) {
        if(!targetTourNameArray.includes(sTourName)) return;
    }

    console.log(`Listed and tested sFilename: ${sFilename}`);

    const sTourCode = fs.readFileSync('./' + sFilename, {encoding: 'utf8'});
    //console.log(`sTourCode: ${sTourCode}`);

    var sTourNewLine = null;
    var sTourCreateLine = null;
    var tourNewLineArray = null;
    var sInlineTourName = null;
    var sRulesLine = null;
    var sRulesetLine = null;
    var sTourNameLine = null;
    var output = '';

    const lineArray = sTourCode.split('\n');
    lineArray.forEach(function(sLine) {
        if(!sLine) return;
        sLine = sLine.replace(/ +(?= )/g,''); // Ensure the line of text is single-spaced
        //console.log(sLine);
        if(!sTourNewLine && sLine.startsWith(OTC.TourNewLinePrefix)) {
            if(sLine.includes(OTC.InlineNameSeparator)) {
                tourNewLineArray = sLine.split(OTC.InlineNameSeparator);
                sTourNewLine = tourNewLineArray[0].replace(/^\s+|\s+$/g, '');
                sInlineTourName = tourNewLineArray[1].replace(/^\s+|\s+$/g, '');
            }
            else {
                sTourNewLine = sLine;
            }
        }
        else if(!sTourCreateLine && sLine.startsWith(OTC.TourCreateLinePrefix)) {
            if(sLine.includes(OTC.InlineNameSeparator)) {
                tourNewLineArray = sLine.split(OTC.InlineNameSeparator);
                sTourCreateLine = tourNewLineArray[0].replace(/^\s+|\s+$/g, '');
                sInlineTourName = tourNewLineArray[1].replace(/^\s+|\s+$/g, '');
            }
            else {
                sTourCreateLine = sLine;
            }
        }
        else if(!sRulesLine && sLine.startsWith(OTC.TourRulesLinePrefix)) {
          sRulesLine = sLine;
        }
        else if(!sRulesetLine && sLine.startsWith(OTC.TourRulesetLinePrefix)) {
          sRulesetLine = sLine;
        }
        else if(!sTourNameLine && sLine.startsWith(OTC.TourNameLinePrefix)) {
          sTourNameLine = sLine;
        }
    });

    var bParseError = false;
    if('' === sTourCode) {
        output = 'No tour code.';
        bParseError = true;
    }
    else if(!sTourNewLine && !sTourCreateLine) {
        output = 'Invalid tour code error: no valid "/tour new" or "/tour create" command found.';
        bParseError = true;
    }

    if(bParseError) {
        const sError = `${sFilename} triggered challenge code parse error: ${output}`;
        if (core) {
            core.setFailed(sError);
        }
        else {
            console.log(`Non-core fallback error: ${sError}`);
        }
    }
    else {
        var sPostNewText;
        if (sTourNewLine) {
            sPostNewText = sTourNewLine.substr(OTC.TourNewLinePrefix.length);
        }
        else {
            sPostNewText = sTourCreateLine.substr(OTC.TourCreateLinePrefix.length);
        }
        //console.log(sPostNewText);
        var sTourBaseFormatName = sPostNewText.substr(0, sPostNewText.indexOf(','));
        sTourBaseFormatName.replace(/^\s+|\s+$/g, ''); // Remove any trailing/leading spaces

        // Content
        output = '';
        if(sRulesLine || sRulesetLine) {
            var sAddOnRulesText;
            if(sRulesLine) {
                sAddOnRulesText = sRulesLine.substr(OTC.TourRulesLinePrefix.length);
            }
            else if(sRulesetLine) {
                sAddOnRulesText = sRulesetLine.substr(OTC.TourRulesetLinePrefix.length);
            }
            var addOnRulesArray = sAddOnRulesText.split(',');
            sAddOnRulesText = '';
            var bFirstLoop = true;
            addOnRulesArray.forEach(function(sRule) {
                //console.log(sRule);
                bFirstLoop ? bFirstLoop = false : sAddOnRulesText += ',';
                sAddOnRulesText += sRule.replace(/^\s+|\s+$/g, ''); // Remove any trailing/leading spaces from every rule
            });
            //console.log(sAddOnRulesText);
            output += `${sTourBaseFormatName}@@@${sAddOnRulesText}`;
        }
        else {
            output += `${sTourBaseFormatName}`;
        }

        //console.log(`Challenge code: ${output}`);

        // Add to inner generated template
        var sChallengeCodeGeneratedCode = sTemplateInner.replace('#REPLACE_TITLE', sFilename);
        sChallengeCodeGeneratedCode = sChallengeCodeGeneratedCode.replace('#REPLACE_CODE', "`"+output+"`");
        sGeneratedCodeInner += `${sChallengeCodeGeneratedCode}\n`;
    }
});

// Generate source code that can run in Showdown's CI system
process.chdir('./../test');
const sCompleteGeneratedCode = sTemplateOuter.replace('#REPLACE', sGeneratedCodeInner);
fs.writeFileSync('./operationtourcode.js', sCompleteGeneratedCode);

console.log("Finished generating custom tests...");