/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as error from 'N/error';
import * as http from 'N/http';

import * as controller from '../Controllers/CountryManagerPortalController';

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
        pContext.response.write(controller.getErrorPage(errorMessage, true));
        
    }
}

// Handle the get requests
function handleGet(pContext : EntryPoints.Suitelet.onRequestContext)
{
    // Get data from params
    let params = pContext.request.parameters;
    let uniqueKey = params.key;
    let approvalRequestID = params.id;
    let inboundShipmentID = params.isn;
    let page = params.page;

    log.debug("uniqueKey", uniqueKey);

    // Redirect to the specific function
    if (uniqueKey && approvalRequestID && !inboundShipmentID)
    {
        let purchaseOrderView = controller.getPurchaseOrderView(approvalRequestID, uniqueKey, page);
        pContext.response.write(purchaseOrderView);
    }
    else if (uniqueKey && approvalRequestID && inboundShipmentID)
    {
        let inboundShipmentView = controller.getInboundShipmentView(approvalRequestID, inboundShipmentID, uniqueKey, page);
        pContext.response.write(inboundShipmentView);
    }
    else if (uniqueKey && !approvalRequestID && page && page !== "home")
    {
        let pageView = controller.getApprovalRequestsView(uniqueKey, page);
        pContext.response.write(pageView);
    }
    else if (uniqueKey && !approvalRequestID && (!page || page === "home"))
    {
        let homePageView = controller.getHomePageView(uniqueKey);
        pContext.response.write(homePageView);
    }
    else
    {
        let errorPage = controller.getErrorPage("Invalid Link!", false);
        pContext.response.write(errorPage);
    }
}

// Handle the post requests
function handlePost(pContext : EntryPoints.Suitelet.onRequestContext)
{
    let params = pContext.request.parameters;
    log.debug("POST params", params);

    let body = JSON.parse(pContext.request.body);
    log.debug("POST body", body);

    let result = controller.updatePurchaseOrderData(body, params);

    pContext.response.write(JSON.stringify({ status: 'success', data: {} }));
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
