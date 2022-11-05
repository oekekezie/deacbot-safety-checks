module.exports = {
    mockSafetyChecks: [
        JSON.parse(`{"_index":809,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient W","roomBed":"D418-02","mrn":"5242737","timeLabel":"08:00","status":"DR","confidence":1}`), 
        JSON.parse(`{"_index":810,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient W","roomBed":"D418-02","mrn":"5242737","timeLabel":"08:15","status":"_","confidence":"N/A"}`), 
        JSON.parse(`{"_index":811,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient W","roomBed":"D418-02","mrn":"5242737","timeLabel":"08:30","status":"H","confidence":1}`), 
        JSON.parse(` {"_index":860,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient X","roomBed":"D418-03","mrn":"5767018","timeLabel":"12:00","status":"TV","confidence":1}`), 
        JSON.parse(`{"_index":861,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient X","roomBed":"D418-03","mrn":"5767018","timeLabel":"12:15","status":"SH","confidence":1}`), 
        JSON.parse(`{"_index":865,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient X","roomBed":"D418-03","mrn":"5767018","timeLabel":"13:15","status":"M","confidence":1}`), 
        JSON.parse(`{"_index":889,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient Y","roomBed":"D418-04","mrn":"8093490","timeLabel":"10:30","status":"SH","confidence":1}`), 
        JSON.parse(`{"_index":890,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient Y","roomBed":"D418-04","mrn":"8093490","timeLabel":"10:45","status":"RM","confidence":1}`), 
        JSON.parse(`{"_index":907,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient Y","roomBed":"D418-04","mrn":"8093490","timeLabel":"15:00","status":"OU","confidence":1}`), 
        JSON.parse(`{"_index":908,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient Y","roomBed":"D418-04","mrn":"8093490","timeLabel":"15:15","status":"DR","confidence":1}`), 
        JSON.parse(`{"_index":909,"date":"2022-03-12T05:00:00.000Z","shiftType":"day","obsInterval":15,"name":"Patient Y","roomBed":"D418-04","mrn":"8093490","timeLabel":"15:30","status":"H","confidence":1}`) 
    ]
}