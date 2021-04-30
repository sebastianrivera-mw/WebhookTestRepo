/**
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */
import * as log from "N/log"
import * as https from 'N/https'

//import the views
import * as view from '../Views/PortalLoginSuiteletView'
import * as redirectView from '../Views/PortalLoginRedirectView'
import * as forgotPasswordView from '../Views/PortalForgotPasswordView'
import * as resetPasswordView from '../Views/PortalResetPasswordView'

//import the models
import * as model from '../Models/PortalLoginSuiteletModel'

import * as functions from '../../../Global/Functions';
import * as constants from '../../../Global/Constants';

export function renderLoginForm(pParams) 
{
    return view.getLoginFormView(pParams);
}

export function renderRedirectView(pURL) 
{
    return redirectView.redirect(pURL);
}

export function renderForgotPasswordView(pErrors) 
{
    return forgotPasswordView.getForgotPasswordFormView(pErrors);
}

export function renderForgotPasswordEmailSentView() 
{
    return forgotPasswordView.getResetPasswordEmailSentView();
}

export function renderResetPasswordFormView(pParams) 
{
    return resetPasswordView.getResetPasswordFormView(pParams);
}

export function renderResetPasswordLinkErrorView() 
{
    return resetPasswordView.getResetPasswordLinkErrorView();
}

export function validateSession(pCookies)
{
    let cookies = null;
    
    if (pCookies) cookies = functions.getCookieData(constants.GENERAL.ACCESS_TOKEN, pCookies);

    //If the access token cookie is present
    if (cookies) 
    {
        let {email, token} = functions.decodeAccessToken(cookies);

        //If the access token has both email and portal access token, validate the access token
        if (email && token) 
        {
            return functions.validateAccessToken(email, token);
        } 
    }
    
    return false;
}

//Generates an access token and encodes it
//Builds a Set-Cookie request header for the browser to add the cookie once it makes a request with that header
export function setCookie(pParameters, pUserID)
{
    let {email} = pParameters;

    //Generate a token for the Portal Access Token field of the Contact
    let portalAccessToken = model.generateRandomToken(pUserID);
    model.submitToken(pUserID, portalAccessToken);
    let accessToken = model.generateAccessToken(portalAccessToken, email)

    //Build the cookie
    let cookieString = `${constants.GENERAL.ACCESS_TOKEN}=${accessToken}; Max-Age=${constants.GENERAL.ACCESS_TOKEN_MAX_AGE}; httpOnly; secure;`;

    return {name : "Set-Cookie", value : cookieString};
}

//Builds a Set-Cookie request header for the browser to delete the cookie once it makes a request with that header
export function deleteCookie()
{
    //Build the cookie
    let cookieString = `${constants.GENERAL.ACCESS_TOKEN}=; Max-Age=-1; httpOnly; secure;`;

    return {name : "Set-Cookie", value : cookieString};
}

export function validateLogin(pParameters)
{
    let {email, password} = pParameters;
    
    return model.validateEmailPassword(email, password);
}

// Generates and submits the token and expiration date in the Contact record and 
// sends an email with a link to reset the password
export function sendResetPasswordEmail(pEmail) 
{    
    let userID = model.validateContact(pEmail);
    let status = constants.LOGIN_STATE.ACCOUNT_NOT_FOUND;

    if (userID != 0) 
    {
        let token = model.generateResetPasswordToken(userID);
        
        //let link = `${functions.getSuiteletURL(constants.SCRIPTS.PORTAL_LOGIN.ID, constants.SCRIPTS.PORTAL_LOGIN.DEPLOY, true)}&resetpassword=true&userID=${userID}&token=${token}`;
        let link = `${constants.GENERAL.VENDOR_PORTAL_URL}/?resetpassword=true&userID=${userID}&token=${token}`;

        let email = {
            recipients : [pEmail],
            cc : null,
            templateID : constants.EMAIL_TEMPLATES.RESET_PASSWORD,
            userID : userID,
            attachments : null,
            link : link
        }

        model.sendEmailTemplate(email);
        
        status = constants.LOGIN_STATE.SUCCESSFUL;
    }

    return status;
}

export function validateResetPasswordToken(pUserID, pToken) 
{
    return model.validateResetPasswordToken(pUserID, pToken);
}

export function resetPassword(pUserID, pPassword) 
{
    try 
    {
        model.resetPassword(pUserID, pPassword);
        return resetPasswordView.getResetPasswordSuccessView();
    } 
    catch (error) 
    {
        handleError(error)
        return resetPasswordView.getResetPasswordLinkErrorView();
    }
}

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
