/**
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */

import * as constants from '../../../Global/Constants';
import * as functions from '../../../Global/Functions';
import * as styles from './css/style';

import * as log from "N/log";

export function getLoginFormView(pParams) 
{
    let emailErrorMessage = "";
    let passwordErrorMessage = "";

    let {state} = pParams;

    if (state == constants.LOGIN_STATE.ACCOUNT_NOT_FOUND) 
    {
        emailErrorMessage = `<span aria-live="polite" class="error">This email is not registered or is not a vendor.</span>`
    }
    else if (state == constants.LOGIN_STATE.PASSWORD_ERROR) 
    {
        passwordErrorMessage = `<span aria-live="polite" class="error">The password is incorrect.</span>`
    }

    let url = functions.getCurrentSuiteletURL(true);

    log.debug("pParams", pParams)

    if (pParams.redirectURL) url += `&redirectURL=`+ pParams.redirectURL;

    log.debug("url", url)

    //Add invisible label with a redirect url and add the params for it
    let loginHTML = `
    <head>
        <title>Vendor Portal</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

        <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
    </head>
    <body>
        <div class="main-container wrapper fadeInDown row">
            <div id="formContent" class="formContent col">
                <div class="logo-container">
                    <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                </div>
                <form action="${url}" method="post">
                    <h1>Vendor Portal Login</h1>
                    <label for="email">Email</label>
                    <input type="email" id="email" class="fadeIn second" name="email" placeholder="example@email.com" required>
                    ${emailErrorMessage}
                    <label for="password">Password</label>
                    <input type="password" id="password" class="fadeIn third" name="password" placeholder="*******" required>
                    ${passwordErrorMessage}
                    <input class="button" type="submit" class="fadeIn fourth" value="Log In">
                </form>

                <div id="formFooter">
                    <a class="underlineHover" href="${functions.getCurrentSuiteletURL(true)}&forgotPassword=true">Lost your password?</a>
                </div>
            </div>
        </div>
        ${styles.MAIN_STYLE}
    </body>`;

    return loginHTML;
}
