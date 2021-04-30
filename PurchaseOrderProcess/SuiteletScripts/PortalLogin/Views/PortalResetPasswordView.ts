/**
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */

import * as constants from '../../../Global/Constants';
import * as functions from '../../../Global/Functions';

import * as styles from './css/style';

export function getResetPasswordFormView(pParams) 
{
    let {userID, token} = pParams

    //Add invisible label with a redirect url and add the params for it
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
        <div class="main-container wrapper fadeInDown row">
            <div id="formContent" class="formContent col">
                <div class="logo-container">
                    <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                </div>
                <form action="${functions.getCurrentSuiteletURL(true)}&resetpassword=true&userID=${userID}&token=${token}" method="post">
                    <h1>Vendor Portal Login</h1>
                    <h2>Set Password</h2>
                    <p>Please type in your new password.</p>
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="*******" required>
                    <input class="button" type="submit" value="Set password">
                </form>
            </div>
        </div>
        ${styles.MAIN_STYLE}
    </body>`;

    return html;
}

export function getResetPasswordLinkErrorView() 
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
        <div class="main-container wrapper fadeInDown row">
            <div id="formContent" class="formContent col">
                <div class="logo-container">
                    <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                </div>
                <h1>Vendor Portal</h1>
                <h2>Set Password</h2>
                <p>Your link is invalid, please request a new link.</p>
                <div id="formFooter">
                    <a class="underlineHover" href="${functions.getCurrentSuiteletURL(true)}">Go back to login</a>
                </div>
            </div>
        </div>
        ${styles.MAIN_STYLE}
    </body>`;

    return html;
}


export function getResetPasswordSuccessView() 
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
        <div class="main-container wrapper fadeInDown row">
            <div id="formContent" class="formContent col">
                <div class="logo-container">
                    <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                </div>
                <h1>Vendor Portal</h1>
                <h2>Set Password</h2>
                <p>Your password has been set successfully.</p>
                <div id="formFooter">
                    <a class="underlineHover" href="${functions.getCurrentSuiteletURL(true)}">Go back to login</a>
                </div>
            </div>
        </div>
        ${styles.MAIN_STYLE}
    </body>`;

    return html;
}

