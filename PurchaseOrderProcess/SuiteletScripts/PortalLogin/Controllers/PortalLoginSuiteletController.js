define(["require", "exports", "N/log", "../Views/PortalLoginSuiteletView", "../Views/PortalLoginRedirectView", "../Views/PortalForgotPasswordView", "../Views/PortalResetPasswordView", "../Models/PortalLoginSuiteletModel", "../../../Global/Functions", "../../../Global/Constants"], function (require, exports, log, view, redirectView, forgotPasswordView, resetPasswordView, model, functions, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function renderLoginForm(pParams) {
        return view.getLoginFormView(pParams);
    }
    exports.renderLoginForm = renderLoginForm;
    function renderRedirectView(pURL) {
        return redirectView.redirect(pURL);
    }
    exports.renderRedirectView = renderRedirectView;
    function renderForgotPasswordView(pErrors) {
        return forgotPasswordView.getForgotPasswordFormView(pErrors);
    }
    exports.renderForgotPasswordView = renderForgotPasswordView;
    function renderForgotPasswordEmailSentView() {
        return forgotPasswordView.getResetPasswordEmailSentView();
    }
    exports.renderForgotPasswordEmailSentView = renderForgotPasswordEmailSentView;
    function renderResetPasswordFormView(pParams) {
        return resetPasswordView.getResetPasswordFormView(pParams);
    }
    exports.renderResetPasswordFormView = renderResetPasswordFormView;
    function renderResetPasswordLinkErrorView() {
        return resetPasswordView.getResetPasswordLinkErrorView();
    }
    exports.renderResetPasswordLinkErrorView = renderResetPasswordLinkErrorView;
    function validateSession(pCookies) {
        var cookies = null;
        if (pCookies)
            cookies = functions.getCookieData(constants.GENERAL.ACCESS_TOKEN, pCookies);
        //If the access token cookie is present
        if (cookies) {
            var _a = functions.decodeAccessToken(cookies), email = _a.email, token = _a.token;
            //If the access token has both email and portal access token, validate the access token
            if (email && token) {
                return functions.validateAccessToken(email, token);
            }
        }
        return false;
    }
    exports.validateSession = validateSession;
    //Generates an access token and encodes it
    //Builds a Set-Cookie request header for the browser to add the cookie once it makes a request with that header
    function setCookie(pParameters, pUserID) {
        var email = pParameters.email;
        //Generate a token for the Portal Access Token field of the Contact
        var portalAccessToken = model.generateRandomToken(pUserID);
        model.submitToken(pUserID, portalAccessToken);
        var accessToken = model.generateAccessToken(portalAccessToken, email);
        //Build the cookie
        var cookieString = constants.GENERAL.ACCESS_TOKEN + "=" + accessToken + "; Max-Age=" + constants.GENERAL.ACCESS_TOKEN_MAX_AGE + "; httpOnly; secure;";
        return { name: "Set-Cookie", value: cookieString };
    }
    exports.setCookie = setCookie;
    //Builds a Set-Cookie request header for the browser to delete the cookie once it makes a request with that header
    function deleteCookie() {
        //Build the cookie
        var cookieString = constants.GENERAL.ACCESS_TOKEN + "=; Max-Age=-1; httpOnly; secure;";
        return { name: "Set-Cookie", value: cookieString };
    }
    exports.deleteCookie = deleteCookie;
    function validateLogin(pParameters) {
        var email = pParameters.email, password = pParameters.password;
        return model.validateEmailPassword(email, password);
    }
    exports.validateLogin = validateLogin;
    // Generates and submits the token and expiration date in the Contact record and 
    // sends an email with a link to reset the password
    function sendResetPasswordEmail(pEmail) {
        var userID = model.validateContact(pEmail);
        var status = constants.LOGIN_STATE.ACCOUNT_NOT_FOUND;
        if (userID != 0) {
            var token = model.generateResetPasswordToken(userID);
            //let link = `${functions.getSuiteletURL(constants.SCRIPTS.PORTAL_LOGIN.ID, constants.SCRIPTS.PORTAL_LOGIN.DEPLOY, true)}&resetpassword=true&userID=${userID}&token=${token}`;
            var link = constants.GENERAL.VENDOR_PORTAL_URL + "/?resetpassword=true&userID=" + userID + "&token=" + token;
            var email = {
                recipients: [pEmail],
                cc: null,
                templateID: constants.EMAIL_TEMPLATES.RESET_PASSWORD,
                userID: userID,
                attachments: null,
                link: link
            };
            model.sendEmailTemplate(email);
            status = constants.LOGIN_STATE.SUCCESSFUL;
        }
        return status;
    }
    exports.sendResetPasswordEmail = sendResetPasswordEmail;
    function validateResetPasswordToken(pUserID, pToken) {
        return model.validateResetPasswordToken(pUserID, pToken);
    }
    exports.validateResetPasswordToken = validateResetPasswordToken;
    function resetPassword(pUserID, pPassword) {
        try {
            model.resetPassword(pUserID, pPassword);
            return resetPasswordView.getResetPasswordSuccessView();
        }
        catch (error) {
            handleError(error);
            return resetPasswordView.getResetPasswordLinkErrorView();
        }
    }
    exports.resetPassword = resetPassword;
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
