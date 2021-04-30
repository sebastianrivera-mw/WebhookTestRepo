/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/error", "N/http", "N/runtime"], function (require, exports, log, error, http, runtime) {
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
        }
    }
    exports.onRequest = onRequest;
    // Handle the get requests
    function handleGet(pContext) {
        try {
            var params = pContext.request.parameters;
            var method = params.method;
            if (method && method == "1") {
                log.debug("Test", "Test");
                log.debug("1", pContext.request.headers);
                log.debug("2", runtime.getCurrentSession());
                log.debug("3", runtime.getCurrentUser());
                /*
                let domain = url.resolveDomain({ hostType: url.HostType.APPLICATION });
                log.debug("domain", domain);
                let sUrl = url.resolveScript({ scriptId : "customscript_mw_is_user_logged_in", deploymentId : "customdeploy_mw_is_user_logged_in_d" });
                log.debug("sUrl", sUrl);
                log.debug("url", `https://${domain}${sUrl}`);
                let response = https.post({ url : `https://${domain}${sUrl}`, body: JSON.stringify({}) });
                log.debug("response", response.body);
                */
                pContext.response.write("Hello World2");
            }
            else {
                log.debug("User Logged In", "User Logged In");
                pContext.response.write("Hello World");
            }
        }
        catch (error) {
            handleError(error);
            pContext.response.write(error);
        }
    }
    // Handle the get requests
    function handlePost(pContext) {
        try {
            log.debug("POST", "POST");
            return "Hello World";
        }
        catch (error) {
            handleError(error);
            return error;
        }
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
