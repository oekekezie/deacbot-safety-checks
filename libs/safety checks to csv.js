/**
 * Project Name: Deacbot
 * By: Obi Ekekezie
 * Date Created 8/28/2022
 */

const { writeToString } = require("@fast-csv/format");

// FIXME: Safety Checks components ["_index" -> "index", "date", "shiftType", "obsInterval", "name", "roomBed", "mrn", "timeLabel" -> time, "status", "confidence"]
const safetyCheckProps = ["mrn", "name", "roomBed", "date", "timeLabel", "status", "confidence", "_index"];
const columnHeaders = ["mrn", "name", "roomBed", "date", "time", "status", "confidence", "index"];

async function writeSafetyChecksToCSV(safetyChecks = []) {
    return writeToString(_safetyChecksToRows(safetyChecks));
};

function _safetyChecksToRows(safetyChecks = []) {
    if (!Array.isArray(safetyChecks)) throw new Error("Safety Checks must be an array to write to CSV");

    // Create rows
    const rows = [];
    // Add headers
    rows.push(columnHeaders);
    // Add safety checks
    for (const safetyCheck of safetyChecks) {
        let row = safetyCheckProps;
        row = row.map((propKey) => {
            return safetyCheck[propKey];
        }); // returns row containing safety checks props
        rows.push(row);
    }

    return rows;
};

module.exports = {
    _safetyChecksToRows,
    writeSafetyChecksToCSV
};
