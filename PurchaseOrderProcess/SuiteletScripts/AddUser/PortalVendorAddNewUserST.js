/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Walter Bonilla
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/error", "N/http", "../../UserEventScripts/PortalVendorAddNewUser"], function (require, exports, log, error, http, addUserUE) {
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
            pContext.response.write(errorMessage);
        }
    }
    exports.onRequest = onRequest;
    // Handle the get requests
    function handleGet(pContext) {
        var userID = pContext.request.parameters.user;
        if (userID) {
            var result = addUserUE.addUser(userID);
            if (result) {
                pContext.response.write('true');
            }
            else {
                pContext.response.write('false');
            }
        }
        else {
            pContext.response.write('false');
        }
    }
    // Handle the post requests
    function handlePost(pContext) {
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
