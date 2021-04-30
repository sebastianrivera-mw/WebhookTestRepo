/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/error", "N/http", "../Controllers/PortalLoginSuiteletController", "../../../Global/Constants", "../../../Global/Functions"], function (require, exports, log, error, http, controller, constants, functions) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRequest(pContext) {
        try {
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
        var validCookie = controller.validateSession(pContext.request.headers.cookie);
        var redirectURL = null;
        if (pContext.request.parameters.redirectURL)
            redirectURL = pContext.request.parameters.redirectURL;
        if (pContext.request.parameters.logout) {
            var cookieHeader = controller.deleteCookie();
            pContext.response.setHeader(cookieHeader);
            pContext.response.write(controller.renderLoginForm(constants.LOGIN_STATE.NOT_STARTED));
        }
        else if (validCookie) {
            pContext.response.write(controller.renderRedirectView(functions.getSuiteletURL(constants.SCRIPTS.VENDOR_PORTAL_SUITELET.ID, constants.SCRIPTS.VENDOR_PORTAL_SUITELET.DEPLOY, true)));
        }
        else if (pContext.request.parameters.forgotPassword) {
            pContext.response.write(controller.renderForgotPasswordView(null));
        }
        else if (pContext.request.parameters.resetpassword) {
            var _a = pContext.request.parameters, userID = _a.userID, token = _a.token;
            var valid = controller.validateResetPasswordToken(userID, token);
            if (valid)
                pContext.response.write(controller.renderResetPasswordFormView({ userID: userID, token: token }));
            else
                pContext.response.write(controller.renderResetPasswordLinkErrorView());
        }
        else {
            pContext.response.write(controller.renderLoginForm({ state: constants.LOGIN_STATE.NOT_STARTED, redirectURL: redirectURL }));
        }
    }
    function handlePost(pContext) {
        var redirectURL = null;
        if (pContext.request.parameters.redirectURL)
            redirectURL = pContext.request.parameters.redirectURL;
        if (pContext.request.parameters.logout) {
            var cookieHeader = controller.deleteCookie();
            pContext.response.setHeader(cookieHeader);
            pContext.response.write(controller.renderLoginForm(constants.LOGIN_STATE.NOT_STARTED));
        }
        else if (pContext.request.parameters.forgotPassword) {
            var status_1 = controller.sendResetPasswordEmail(pContext.request.parameters.email);
            if (status_1 == constants.LOGIN_STATE.ACCOUNT_NOT_FOUND)
                pContext.response.write(controller.renderForgotPasswordView(constants.LOGIN_STATE.ACCOUNT_NOT_FOUND));
            else if (status_1 == constants.LOGIN_STATE.SUCCESSFUL)
                pContext.response.write(controller.renderForgotPasswordEmailSentView());
        }
        else if (pContext.request.parameters.resetpassword) {
            var _a = pContext.request.parameters, userID = _a.userID, token = _a.token, password = _a.password;
            var valid = controller.validateResetPasswordToken(userID, token);
            if (valid)
                pContext.response.write(controller.resetPassword(userID, password));
            else
                pContext.response.write(controller.renderResetPasswordLinkErrorView());
        }
        else {
            var _b = controller.validateLogin(pContext.request.parameters), state = _b.state, userID = _b.userID;
            if (state === constants.LOGIN_STATE.SUCCESSFUL) {
                var cookieHeader = controller.setCookie(pContext.request.parameters, userID);
                if (cookieHeader)
                    pContext.response.setHeader(cookieHeader);
                if (redirectURL)
                    redirectURL = functions.getDecoded(pContext.request.parameters.redirectURL);
                pContext.response.write(controller.renderRedirectView(redirectURL));
            }
            else {
                pContext.response.write(controller.renderLoginForm({ state: state, redirectURL: redirectURL }));
            }
        }
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
