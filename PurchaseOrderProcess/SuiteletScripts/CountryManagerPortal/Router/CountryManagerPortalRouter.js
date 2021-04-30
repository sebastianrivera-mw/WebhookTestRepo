/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/error", "N/http", "../Controllers/CountryManagerPortalController"], function (require, exports, log, error, http, controller) {
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
        var uniqueKey = params.key;
        var approvalRequestID = params.id;
        var inboundShipmentID = params.isn;
        var page = params.page;
        log.debug("uniqueKey", uniqueKey);
        // Redirect to the specific function
        if (uniqueKey && approvalRequestID && !inboundShipmentID) {
            var purchaseOrderView = controller.getPurchaseOrderView(approvalRequestID, uniqueKey, page);
            pContext.response.write(purchaseOrderView);
        }
        else if (uniqueKey && approvalRequestID && inboundShipmentID) {
            var inboundShipmentView = controller.getInboundShipmentView(approvalRequestID, inboundShipmentID, uniqueKey, page);
            pContext.response.write(inboundShipmentView);
        }
        else if (uniqueKey && !approvalRequestID && page && page !== "home") {
            var pageView = controller.getApprovalRequestsView(uniqueKey, page);
            pContext.response.write(pageView);
        }
        else if (uniqueKey && !approvalRequestID && (!page || page === "home")) {
            var homePageView = controller.getHomePageView(uniqueKey);
            pContext.response.write(homePageView);
        }
        else {
            var errorPage = controller.getErrorPage("Invalid Link!", false);
            pContext.response.write(errorPage);
        }
    }
    // Handle the post requests
    function handlePost(pContext) {
        var params = pContext.request.parameters;
        log.debug("POST params", params);
        var body = JSON.parse(pContext.request.body);
        log.debug("POST body", body);
        var result = controller.updatePurchaseOrderData(body, params);
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
