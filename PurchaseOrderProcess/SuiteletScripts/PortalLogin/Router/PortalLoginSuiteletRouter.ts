/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types'

import * as log from 'N/log'
import * as error from 'N/error'
import * as http from 'N/http'

import * as controller from '../Controllers/PortalLoginSuiteletController'

import * as constants from '../../../Global/Constants'
import * as functions from '../../../Global/Functions'

export function onRequest(pContext : EntryPoints.Suitelet.onRequestContext) 
{
    try 
    {
        var eventMap = {}; //event router pattern design
        eventMap[http.Method.GET] = handleGet;
        eventMap[http.Method.POST] = handlePost;

        eventMap[pContext.request.method] ?
            eventMap[pContext.request.method](pContext) :
            httpRequestError();   
    } 
    catch (error) 
    {    
        pContext.response.write(`Unexpected error. Detail: ${error.message}`);
        handleError(error);
    }
}

function handleGet(pContext : EntryPoints.Suitelet.onRequestContext) 
{
    let validCookie = controller.validateSession(pContext.request.headers.cookie);
    
    let redirectURL = null; 
    if (pContext.request.parameters.redirectURL) redirectURL = pContext.request.parameters.redirectURL;

    if (pContext.request.parameters.logout) 
    {
        let cookieHeader = controller.deleteCookie();
        pContext.response.setHeader(cookieHeader);
        
        pContext.response.write(controller.renderLoginForm(constants.LOGIN_STATE.NOT_STARTED));
    } 
    else if (validCookie) 
    {
        pContext.response.write(controller.renderRedirectView(functions.getSuiteletURL(constants.SCRIPTS.VENDOR_PORTAL_SUITELET.ID, constants.SCRIPTS.VENDOR_PORTAL_SUITELET.DEPLOY, true)));
    } 
    else if (pContext.request.parameters.forgotPassword) 
    {
        pContext.response.write(controller.renderForgotPasswordView(null));
    }
    else if (pContext.request.parameters.resetpassword) 
    {
        let {userID, token} = pContext.request.parameters;
        let valid = controller.validateResetPasswordToken(userID, token);
        
        if (valid) pContext.response.write(controller.renderResetPasswordFormView({userID, token}));
        else pContext.response.write(controller.renderResetPasswordLinkErrorView());
    }
    else 
    {   
        pContext.response.write(controller.renderLoginForm({state : constants.LOGIN_STATE.NOT_STARTED, redirectURL}));
    }
}

function handlePost(pContext : EntryPoints.Suitelet.onRequestContext) 
{
    let redirectURL = null; 
    if (pContext.request.parameters.redirectURL) redirectURL = pContext.request.parameters.redirectURL;

    if (pContext.request.parameters.logout) 
    {
        let cookieHeader = controller.deleteCookie();
        
        pContext.response.setHeader(cookieHeader);
        pContext.response.write(controller.renderLoginForm(constants.LOGIN_STATE.NOT_STARTED));
    } 
    else if (pContext.request.parameters.forgotPassword) 
    {
        let status = controller.sendResetPasswordEmail(pContext.request.parameters.email);

        if (status == constants.LOGIN_STATE.ACCOUNT_NOT_FOUND) pContext.response.write(controller.renderForgotPasswordView(constants.LOGIN_STATE.ACCOUNT_NOT_FOUND));
        else if (status == constants.LOGIN_STATE.SUCCESSFUL) pContext.response.write(controller.renderForgotPasswordEmailSentView());
    }
    else if (pContext.request.parameters.resetpassword) 
    {
        let {userID, token, password} = pContext.request.parameters;
        let valid = controller.validateResetPasswordToken(userID, token);

        if (valid) pContext.response.write(controller.resetPassword(userID, password));
        else pContext.response.write(controller.renderResetPasswordLinkErrorView());
    }
    else 
    {
        let {state, userID} = controller.validateLogin(pContext.request.parameters);

        if (state === constants.LOGIN_STATE.SUCCESSFUL) 
        {
            let cookieHeader = controller.setCookie(pContext.request.parameters, userID)
            
            if (cookieHeader) pContext.response.setHeader(cookieHeader);
                
            if(redirectURL) redirectURL = functions.getDecoded(pContext.request.parameters.redirectURL);
            
            pContext.response.write(controller.renderRedirectView(redirectURL))
        } 
        else
        {
            pContext.response.write(controller.renderLoginForm({state, redirectURL}));
        }
    }
}

function httpRequestError() {
    throw error.create({
        name : "MW_UNSUPPORTED_REQUEST_TYPE",
        message : "Suitelet only supports GET and POST",
        notifyOff : true
    });
}

function handleError(pError : Error) {
    log.error({ title : "Error", details : pError.message });

    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
