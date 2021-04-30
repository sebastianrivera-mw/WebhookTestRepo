/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Walter Bonilla
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as error from 'N/error';
import * as http from 'N/http';
import * as email from 'N/email';
import * as render from 'N/render';
import * as search from "N/search"
import * as encode from "N/encode";
import * as record from "N/record"

import * as constants from '../../Global/Constants';
import * as addUserUE from '../../UserEventScripts/PortalVendorAddNewUser';

export function onRequest(pContext : EntryPoints.Suitelet.onRequestContext)
{
    try
    {
        // Event router pattern design
        var eventMap = {};
        eventMap[http.Method.GET] = handleGet;
        eventMap[http.Method.POST] = handlePost;

        eventMap[pContext.request.method] ? eventMap[pContext.request.method](pContext) : httpRequestError();
    }
    catch (error)
    {
        handleError(error);
        let errorMessage = error.message;
        pContext.response.write(errorMessage);
    }
}

// Handle the get requests
function handleGet(pContext : EntryPoints.Suitelet.onRequestContext)
{
    let userID = pContext.request.parameters.user;

    if ( userID )
    {
        let result = addUserUE.addUser(userID);

        if ( result )
        {
            pContext.response.write('true');
        } 
        else 
        {
            pContext.response.write('false');
        } 
        

    } else {
        pContext.response.write('false');
    }
}

// Handle the post requests
function handlePost(pContext : EntryPoints.Suitelet.onRequestContext)
{
}

// Unsupported request type error
function httpRequestError()
{
    throw error.create({
        name : "MW_UNSUPPORTED_REQUEST_TYPE",
        message : "Suitelet only supports GET and POST request",
        notifyOff : true
    });
}

// Handle the errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
