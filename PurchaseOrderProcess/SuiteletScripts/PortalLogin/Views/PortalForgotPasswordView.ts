/**
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */
import * as log from "N/log"

import * as constants from '../../../Global/Constants';
import * as functions from '../../../Global/Functions';

import * as styles from './css/style';

export function getForgotPasswordFormView(error) 
{
    let emailErrorMessage = "";

    if (error == constants.LOGIN_STATE.ACCOUNT_NOT_FOUND) 
    {
        emailErrorMessage = `<span aria-live="polite" class="error">This email is not registered or is not a vendor.</span>`
    }
    
    let html = `
    <head>
        <title>Vendor Portal</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

        <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
    </head>
    <body>
        <div class="main-container row">
            <div id="formContent" class="formContent col">
                <div class="logo-container">
                    <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                </div>
                <form action="${functions.getCurrentSuiteletURL(true)}&forgotPassword=true" method="post">
                    <h1>Vendor Portal</h1>
                    <h2>Lost your password?</h2>
                    <p>Please enter your email address. You will receive a link to create a new password via email.</p>
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="example@email.com" required>
                    ${emailErrorMessage}
                    <input class="button" type="submit" value="Send reset email">
                </form>
                <div id="formFooter">
                    <a class="underlineHover" href="${functions.getCurrentSuiteletURL(true)}">Go back to login</a>
                </div>
            </div>
        </div>
        ${styles.MAIN_STYLE}
    </body>`;

    return html;
}


export function getResetPasswordEmailSentView() 
{
    let html = `
    <head>
        <title>Vendor Portal</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

        <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
    </head>
    <body>
        <div class="main-container row">
            <div id="formContent" class="formContent col">
                <div class="logo-container">
                    <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                </div>
                <h1>Vendor Portal</h1>
                <h2>Reset Password Email Sent</h2>
                <p>An email with a link to create a new password has been sent. Please check your email inbox and spam.</p>
                <div id="formFooter">
                    <a class="underlineHover" href="${functions.getCurrentSuiteletURL(true)}">Go back to login</a>
                </div>
            </div>
        </div>
        ${styles.MAIN_STYLE}
    </body>`;

    return html;
}

