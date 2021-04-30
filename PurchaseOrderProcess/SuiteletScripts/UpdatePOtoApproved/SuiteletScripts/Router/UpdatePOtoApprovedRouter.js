/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */
define(["require", "exports", "N/http", "N/log", "N/error", "N/record"], function (require, exports, http, log, error, record) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRequest(pContext) {
        try {
            log.debug("Init Execution", "Init Execution");
            var eventMap = {}; //event router pattern design
            eventMap[http.Method.GET] = handleGet;
            eventMap[http.Method.POST] = handlePost;
            eventMap[pContext.request.method] ?
                eventMap[pContext.request.method](pContext) :
                httpRequestError();
        }
        catch (error) {
            pContext.response.write("Unexpected error. Detail: " + error.message);
            handleError(error);
        }
    }
    exports.onRequest = onRequest;
    function handleGet(pContext) {
    }
    function handlePost(pContext) {
        log.debug("params POST", pContext.request.parameters);
        var idPO = pContext.request.parameters.idPO;
        log.debug("ID PO", idPO);
        // Submit fields
        var recordPO = record.submitFields({
            id: idPO,
            type: "purchaseorder",
            values: { "approvalstatus": 2 }
        });
        log.debug("After Update", "After update Finish");
    }
    function httpRequestError() {
        throw error.create({
            name: "MW_UNSUPPORTED_REQUEST_TYPE",
            message: "Suitelet only supports GET and POST",
            notifyOff: true
        });
    }
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
