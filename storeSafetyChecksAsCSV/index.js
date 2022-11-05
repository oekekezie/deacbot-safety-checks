// FIXME: For testing only
// const { analyzeResult: testAnalyzeResult } = require("./../../test data/15 min safety checks analyze result.json");

const { summarize } = require("./../libs/safety checks - 15 min");
const { writeSafetyChecksToCSV } = require("./../libs/safety checks to csv");

module.exports = async function (context, req) {
    try {
        // Get analyzeResult
        const analyzeResult = req.body.analyzeResult;
        if (!analyzeResult) throw new Error ("No 'analyzeResult' was included.")

        // FIXME: Debugging
        // console.log(analyzeResult);

        // Get safety checks summary
        const safetyChecksSummary = summarize(analyzeResult);

        // Generate CSV
        const csv = await writeSafetyChecksToCSV(safetyChecksSummary);

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: csv
        };
    } catch (error) {
        console.log(error);
        context.res = {
            status: 500,
            body: error
        }
    }
}