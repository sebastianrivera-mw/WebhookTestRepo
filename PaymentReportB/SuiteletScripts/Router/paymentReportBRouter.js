/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/error", "N/http", "../Controllers/paymentReportBController"], function (require, exports, log, error, http, controller) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRequest(pContext) {
        try {
            var eventMap = {}; //event router pattern design
            eventMap[http.Method.GET] = handleGet;
            eventMap[http.Method.POST] = handlePost;
            eventMap[pContext.request.method] ? eventMap[pContext.request.method](pContext) : httpRequestError();
        }
        catch (error) {
            pContext.response.write("Unexpected error. Detail: " + error.message);
            handleError(error);
        }
    }
    exports.onRequest = onRequest;
    function handleGet(pContext) {
        var data = pContext.request.parameters;
        log.debug("Params get", data);
        pContext.response.writePage(controller.getView());
    }
    function handlePost(pContext) {
        var data = pContext.request;
        log.debug("Params post", data.files);
        controller.updatePaymentes(data).redirect();
    }
    function httpRequestError() {
        throw error.create({
            name: "MW_UNSUPPORTED_REQUEST_TYPE",
            message: "Suitelet only supports GET and POST",
            notifyOff: true,
        });
    }
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});

