/**
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */
define(["require", "exports", "../../../Global/Constants", "../../../Global/Functions", "./css/style", "N/log"], function (require, exports, constants, functions, styles, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function getLoginFormView(pParams) {
        var emailErrorMessage = "";
        var passwordErrorMessage = "";
        var state = pParams.state;
        if (state == constants.LOGIN_STATE.ACCOUNT_NOT_FOUND) {
            emailErrorMessage = "<span aria-live=\"polite\" class=\"error\">This email is not registered or is not a vendor.</span>";
        }
        else if (state == constants.LOGIN_STATE.PASSWORD_ERROR) {
            passwordErrorMessage = "<span aria-live=\"polite\" class=\"error\">The password is incorrect.</span>";
        }
        var url = functions.getCurrentSuiteletURL(true);
        log.debug("pParams", pParams);
        if (pParams.redirectURL)
            url += "&redirectURL=" + pParams.redirectURL;
        log.debug("url", url);
        //Add invisible label with a redirect url and add the params for it
        var loginHTML = "\n    <head>\n        <title>Vendor Portal</title>\n        <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n        <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n        <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n        <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.GLOBAL.CSS) + "\">\n        <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n    </head>\n    <body>\n        <div class=\"main-container wrapper fadeInDown row\">\n            <div id=\"formContent\" class=\"formContent col\">\n                <div class=\"logo-container\">\n                    <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n                </div>\n                <form action=\"" + url + "\" method=\"post\">\n                    <h1>Vendor Portal Login</h1>\n                    <label for=\"email\">Email</label>\n                    <input type=\"email\" id=\"email\" class=\"fadeIn second\" name=\"email\" placeholder=\"example@email.com\" required>\n                    " + emailErrorMessage + "\n                    <label for=\"password\">Password</label>\n                    <input type=\"password\" id=\"password\" class=\"fadeIn third\" name=\"password\" placeholder=\"*******\" required>\n                    " + passwordErrorMessage + "\n                    <input class=\"button\" type=\"submit\" class=\"fadeIn fourth\" value=\"Log In\">\n                </form>\n\n                <div id=\"formFooter\">\n                    <a class=\"underlineHover\" href=\"" + functions.getCurrentSuiteletURL(true) + "&forgotPassword=true\">Lost your password?</a>\n                </div>\n            </div>\n        </div>\n        " + styles.MAIN_STYLE + "\n    </body>";
        return loginHTML;
    }
    exports.getLoginFormView = getLoginFormView;
});
