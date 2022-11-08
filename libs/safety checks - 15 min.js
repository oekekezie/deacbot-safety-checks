/**
 * Project Name: Deacbot
 * By: Obi Ekekezie
 * Date Created 4/23/2022
 */

const {  
    formatShiftDate,
    formatShiftType,
    isValidSafetyCheckObservation,
    getOCRConfidenceScores,
    getOCRConfidenceScoreLookupKey,
    cleanCellContent
} = require("./helpers");

// Expected table dimensions
const EXPECTED_TABLE_NUM_ROWS = 26;
const EXPECTED_TABLE_NUM_COLUMNS = 35;

// Cell index of first time label
const FIRST_TIME_LABEL_CELL_INDEX = 3;

// Bounds of safety checks observations for patients
const FIRST_OBS_ROW = 1;
const FIRST_OBS_COLUMN = 3;

// TODO: Likely should have a function to get checks for one patient and another to get checks for all patients using said function
// Safety check: name, mrn, date, timeLabel, obsInterval, status, confidence
function summarize(analyzeResult) {
    // From analyzeResult
    const tables = analyzeResult.tables;
    const metadata = analyzeResult.documents[0].fields;
    const ocrConfidenceScores = getOCRConfidenceScores(analyzeResult);

    // Expects one 26x35 table
    const table = tables[0];
    if (!_isValidTable(table)) throw new Error("15 Minute Safety Checks Sheet must have one 26x35 table");

    // Expects metadata
    if (!metadata) throw new Error("15 Minute Safety Checks Sheet expects metadata");

    // Make lookup lists
    const listOfPatients = _getListOfPatients(table);
    const listOfTimeLabels = _getListOfTimeLabels(table);

    // Keep track of safety check observations
    let safetyChecks = [];

    // Get all the cells from the table
    if (!table.cells || !Array.isArray(table.cells)) throw new Error("Table must have an array of cells");
    const cells = table.cells;
    
    // Set date
    if (!metadata.date || metadata.date.type !== "date") throw new Error("No date found in document metadata");
    const date = formatShiftDate(metadata.date);
    
    // Set shift type
    if (!metadata.shift) throw new Error("No shift specified in document metadata");
    const shift = formatShiftType(metadata.shift);

    // Specify checks observation interval
    const obsInterval = 15;

    // FIXME: How does this handle missing rows? Fix confidence scores bug?
    // Create observations
    let index = 0;
    for (const cell of cells) {
        if (cell.rowIndex >= FIRST_OBS_ROW && cell.columnIndex >= FIRST_OBS_COLUMN && _matchCellToPatient(cell, listOfPatients)) {            
            safetyChecks = [...safetyChecks, _createObservation(cell, date, shift, obsInterval, listOfPatients, listOfTimeLabels, ocrConfidenceScores, index)];
        }
        // Increment
        index++;
    }

    // Return safety checks
    return safetyChecks;
}

function _isValidTable(table) {
    return table.rowCount == EXPECTED_TABLE_NUM_ROWS && table.columnCount == EXPECTED_TABLE_NUM_COLUMNS;
}

/**
 * Gets list of patients in safety checks table
 * @param {object} table Form Recognizer Table
 * @returns Hash map with patient name, room, and MRN by original table row
 */
function _getListOfPatients(table) {
    const cells = table.cells;
    const patients = {};
    // Skip row header cells
    for (let index = table.columnCount; index < cells.length; index += table.columnCount) {
        const cellPatientName = cells[index] || ""; // Name column (index)
        const cellPatientRoomBed = cells[index + 1] || ""; // Room-Bed column (index)
        const cellPatientMRN = cells[index + 2] || ""; // MRN column (index + 2)
        if (cellPatientName.content.trim().length > 0 && cellPatientMRN.content.trim().length > 0) {            
            // Patient exists i.e. cell not blank, add to list
            patients[cellPatientMRN.rowIndex] = { 
                _cellIndexName: index, // included to make code testable
                _cellIndexRoomBed: index + 1,
                _cellIndexMRN: index + 2,
                name: cellPatientName.content, 
                roomBed: cellPatientRoomBed.content, 
                mrn: cellPatientMRN.content 
            };
        }
    }
    return patients;
}

/**
 * Gets list of time labels in safety checks table
 * @param {object} table Form Recognizer Table
 * @returns Hash map with time labels by original table column
 */
function _getListOfTimeLabels(table) {
    const cells = table.cells;
    const timeLabels = {};

    function _formatTimeLabel(label) {
        const cleanedLabel = String(label).replaceAll(/[^\:\d]/gm, "");
        // Ensure "0" padding for sortability ex. "7:30" -> "07:30"
        if (cleanedLabel.length === 4) {
            return `0${cleanedLabel}`;
        } else {
            // No padding
            return cleanedLabel;
        }
    }

    for (let index = FIRST_TIME_LABEL_CELL_INDEX; index < table.columnCount; index++) {
        const cell = cells[index];
        timeLabels[cell.columnIndex] = _formatTimeLabel(cell.content);
    }
    return timeLabels;
}

function _createObservation(cell, date, shiftType, obsInterval, patientLookup, timeLabelLookup, confidenceScoreLookup, _index = -1) {
    let obs = {
        _index, // original cell index
        date,
        shiftType,
        obsInterval
    };

    // Set patient name, room, and MRN
    obs = Object.assign(obs, _matchCellToPatient(cell, patientLookup));

    // Set time label
    obs = Object.assign(obs, _matchCellToTimeLabel(cell, timeLabelLookup));
    
    // Set status
    obs = Object.assign(obs, _formatObservationStatus(cell));

    // Set confidence, will be N/A if blank
    obs = Object.assign(obs, confidenceScoreLookup[getOCRConfidenceScoreLookupKey(cell)]);
    if (obs.word) delete obs.word; // only exists if cell wasn't blank

    // FIXME: Debugging confidence scores missing from observations
    // console.log(`Obs = ${JSON.stringify(obs)}`);
    // console.log(`Confidence Key = ${getOCRConfidenceScoreLookupKey(cell)}`);
    // console.log(`Confidence Score = ${JSON.stringify(confidenceScoreLookup[getOCRConfidenceScoreLookupKey(cell)])}`);

    return obs;
}

function _formatObservationStatus(cell) {
    const content = cleanCellContent(cell.content) || "_"; // handle blank cells
    return {
        status: String(content).toUpperCase()
    };
}

function _matchCellToPatient(cell, patientLookup) {
    if (!cell.rowIndex) throw new Error("Cannot match cell to patient without a row index");
    if (!patientLookup[cell.rowIndex]) return false;

    return {
        name: patientLookup[cell.rowIndex].name,
        roomBed: patientLookup[cell.rowIndex].roomBed,
        mrn: patientLookup[cell.rowIndex].mrn
    };
}

function _matchCellToTimeLabel(cell, timeLabelLookup) {
    if (!cell.columnIndex) throw new Error("Cannot match cell to time label without a column index");
    if (!timeLabelLookup[cell.columnIndex]) throw new Error("Could not match cell to a time label");

    return {
        timeLabel: timeLabelLookup[cell.columnIndex]
    };
}

module.exports = {
    _constants: {
        EXPECTED_TABLE_NUM_COLUMNS,
        EXPECTED_TABLE_NUM_ROWS,
        FIRST_OBS_COLUMN,
        FIRST_OBS_ROW
    },
    _createObservation,
    _getListOfPatients,
    _getListOfTimeLabels,
    summarize
};