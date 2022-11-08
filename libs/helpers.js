/**
 * Project Name: Deacbot
 * By: Obi Ekekezie
 * Date Created 4/19/2022
 */

// Valid safety checks observations
const LIST_OF_SAFETY_CHECKS_OBS = {
    "BA": "Bed Awake",
    "SB": "Sleeping Breathing",
    "BR": "Bathroom",
    "SH": "Shower",
    "RM": "In Own Room",
    "GP": "Group",
    "H": "Hallway",
    "DR": "Day Room",
    "TV": "TV Room",
    "PH": "On Phone",
    "FP": "Fresh Air Porch",
    "QR": "Quiet Room",
    "OU": "Off Unit",
    "M": "Missing",
    "_": "_" // blank cell
}

// TODO: Documentation
function getAllDocumentFields(analyzeResult) {
    if (!analyzeResult || !analyzeResult.documents[0]) {
        throw new Error("Must provide a document from which to get all the fields");
    }

    return analyzeResult.documents[0].fields;
}

/**
 * Returns a hash map that facilitates looking up confidence scores of the words on the page by their offset and length
 * @param {object} page Form Recognizer Analyze Result
 * @returns {object} hash map e.g. { "offsetxlength`": confidence, word }
 */
 function getOCRConfidenceScores(analyzeResult) {
    const page = analyzeResult.pages[0];
    // Make sure there are words
    if (!Array.isArray(page.words)) 
        throw new Error("Must have words on the page");

    // Generate hash map e.g. { "offsetxlength": confidence }
    let hashMap = {
        _: {
            word: "_",
            confidence: "N/A" // confidence is N/A to blank cells
        }
    };
    page.words.forEach(word => {
        const key = `${word.span.offset}x${word.span.length}`;
        hashMap[key] = {
            word: word.content,
            confidence: word.confidence
        };
    });
    return hashMap;
}

/**
 * Returns confidence score lookup key for a word or cell
 * @param {object} elem Form Recognizer Word or Cell
 * @returns string
 */
function getOCRConfidenceScoreLookupKey(elem) {
    if (!elem.span && !elem.spans) throw new Error("Word or Cell must have span(s) to look up confidence score");

    if (elem.spans && elem.spans.length == 0) return "_"; // handle blank cells
    
    return elem.spans ? `${elem.spans[0].offset}x${elem.spans[0].length}` : `${elem.span.offset}x${elem.span.length}`;
}

/**
 * Returns all of the tables detected by Form Recognizer
 * @param {object} analyzeResult Form Recognizer Analyze Result
 * @returns Array of tables or empty array if no tables detected on page
 */
function getAllTablesDetected(analyzeResult) {
    return Array.isArray(analyzeResult.tables) ? analyzeResult.tables : [];
}

// TODO: Documentation
function addMinutesToTimeLabel(timeLabel, minutes) {
    const present = new Date(`1/1/1970 ${timeLabel}`);
    const future = new Date(present.getTime() + 1000 * 60 * minutes);
    // Add padding if necessary
    return future.getHours() < 10 ? `0${future.getHours()}:${future.getMinutes()}` : `${future.getHours()}:${future.getMinutes()}`;
}

// TODO: Documentation
function formatPatientMRN(patientMRN) {
    if (!patientMRN || !patientMRN.content) throw new Error ("Must be a Form Recognizer field object");
    return String(patientMRN.content).replace(/[-, ]/g, "");
}

/**
 * Returns which shift a safety check observation was documented
 * @param {object} shiftType Field Recognizer Object
 * @returns string
 */
function formatShiftType(shiftType) {
    if (!shiftType || !shiftType.content) throw new Error ("Must be a Form Recognizer field object");
    return shiftType.content.split(" ")[0].toLowerCase();
}

// TODO: Documentation
function formatShiftDate(shiftDate) {
    if (!shiftDate || !shiftDate.content || shiftDate.type !== "date") throw new Error ("Must be a Form Recognizer field object");
    const dateComponents = String(shiftDate.content).split(",");
    // console.log(JSON.stringify(dateComponents))
    if (dateComponents.length !== 3) throw new Error("Expecting date with format DOW, MM DD, YYYY");
    const date = new Date(dateComponents[1].trim() + ", " + dateComponents[2].trim());
    
    // Format date as YYYY-MM-DD
    return `${date.getFullYear() + 1}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 1 < 10 ? `0${date.getDate() + 1}` : date.getDate() + 1}`
}

// TODO: Documentation
function formatObsInterval(obsInterval) {
    const components = obsInterval.content.toLowerCase().split(" ");
    if (Number(components[0]) !== 5 && Number(components[0]) !== 15) {
        throw new Error("Observation interval expected to be 5 or 15 minutes");
    }
    return Number(components[0]);
}

// TODO: Documentation
function cleanCellContent(content) {
    if (!content instanceof String) throw new Error("Expecting content to be a string");
    // Replace all new line characters
    return String(content).replaceAll(/[\r\n]/gm, ' ').split(" ")[0];
}

module.exports = {
    getAllDocumentFields,
    getAllTablesDetected,
    getOCRConfidenceScores,
    getOCRConfidenceScoreLookupKey,
    addMinutesToTimeLabel,
    formatPatientMRN,
    formatShiftDate,
    formatShiftType,
    formatObsInterval,
    cleanCellContent
}