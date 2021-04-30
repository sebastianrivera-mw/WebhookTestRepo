/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/error", "N/http", "../Controllers/POPlannerPortalController"], function (require, exports, log, error, http, controller) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRequest(pContext) {
        try {
            // Event router pattern design
            var eventMap = {};
            eventMap[http.Method.GET] = handleGet;
            eventMap[http.Method.POST] = handlePost;
            eventMap[pContext.request.method] ? eventMap[pContext.request.method](pContext) : httpRequestError();
        }
        catch (error) {
            handleError(error);
            var errorMessage = error.message;
            pContext.response.write(controller.getErrorPage(errorMessage, true));
        }
    }
    exports.onRequest = onRequest;
    // Handle the get requests
    function handleGet(pContext) {
        // Get data from params
        var params = pContext.request.parameters;
        var approvalRequestID = params.id;
        var inboundShipmentID = params.isn;
        var page = params.page;
        // Redirect to the specific function
        if (approvalRequestID && !inboundShipmentID) {
            var purchaseOrderView = controller.getPurchaseOrderView(approvalRequestID, page);
            pContext.response.write(purchaseOrderView);
        }
        else if (approvalRequestID && inboundShipmentID) {
            var inboundShipmentView = controller.getInboundShipmentView(approvalRequestID, inboundShipmentID, page);
            pContext.response.write(inboundShipmentView);
        }
        else if (page && page !== "home") {
            var pageView = controller.getPageView(page);
            pContext.response.write(pageView);
        }
        else {
            var homePageView = controller.getHomePageView();
            pContext.response.write(homePageView);
        }
    }
    // Handle the post requests
    function handlePost(pContext) {
        var params = pContext.request.parameters;
        log.debug("POST params", params);
        var body = JSON.parse(pContext.request.body);
        log.debug("POST body", body);
        var result;
        if (body.uploadShipmentFiles) {
            result = controller.uploadShipmentFiles(body, params);
        }
        else {
            result = controller.updatePurchaseOrderData(body, params);
        }
        pContext.response.write(JSON.stringify({ status: 'success', data: {} }));
    }
    // Unsupported request type error
    function httpRequestError() {
        throw error.create({
            name: "MW_UNSUPPORTED_REQUEST_TYPE",
            message: "Suitelet only supports GET and POST request",
            notifyOff: true
        });
    }
    // Handle the errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
