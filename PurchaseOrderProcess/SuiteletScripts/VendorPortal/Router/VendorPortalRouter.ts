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

import * as controller from '../Controllers/VendorPortalController';
import * as functions from '../../../Global/Functions';
import * as constants from '../../../Global/Constants';

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
    let purchaseOrderID = params.po;
    let inboundShipmentID = params.isn;
    let page = params.page;
    let action = params.action;
    let cookie = pContext.request.headers.cookie;
    let isnNumber = "ISN-"+params.isn;

    cookie = functions.validateSession(cookie);

    log.debug("params", params);

    if (!cookie.valid) 
    {
        let url = `${functions.getSuiteletURL(constants.SCRIPTS.PORTAL_LOGIN.ID, constants.SCRIPTS.PORTAL_LOGIN.DEPLOY, true)}`;
        let redirectURL= functions.buildURL(pContext.request.url, params);

        if (params.resetpassword) 
        {
            url += `&resetpassword=${params.resetpassword}&token=${params.token}&userID=${params.userID}`
            pContext.response.write(controller.getRedirectView(url));
        } 
        else 
        {
            url += `&redirectURL=${functions.getEncoded(redirectURL)}`;
            pContext.response.write(controller.getRedirectView(url));
        }
    }
    else
    {
        // Redirect to the specific function
        if (action && action === "thanks")
        {
            pContext.response.write(controller.getThanksPage(cookie));
        }
        else if (page == constants.PAGES_IDS.RESET_PASSWORD)
        {
            let resetPasswordView = controller.getResetPasswordView(cookie, page);
            pContext.response.write(resetPasswordView);
        }
        else if (purchaseOrderID && !inboundShipmentID && page)
        {
            let purchaseOrderView = controller.getPurchaseOrderView(cookie, purchaseOrderID, page);
            pContext.response.write(purchaseOrderView);
        }
        else if(purchaseOrderID && inboundShipmentID && page)
        {
            let editView = controller.getEditInboundShipmentView(cookie, params, page, isnNumber);
            let inboundShipmentView = controller.getInboundShipmentView(cookie, purchaseOrderID, inboundShipmentID, editView);
            pContext.response.write(inboundShipmentView);
        }
        else if (page == constants.PAGES_IDS.LOAD_PLANS)
        {
            log.debug("Load Plans Page", "Load Plans Page");
            let etaView = controller.getLoadPlansView(cookie, params, page);
            pContext.response.write(etaView);
        }
        else if (page == constants.PAGES_IDS.CREATE_LOAD_PLAN)
        {
            log.debug("Create Load Plans Page", "Create Load Plans Page");
            let etaView = controller.getCreateInboundShipmentView(cookie, params, page);
            pContext.response.write(etaView);
        }
        else if(!purchaseOrderID && page && page !== "home")
        {
            let pageView = controller.getVendorApprovalRequestsView(cookie, page);
            pContext.response.write(pageView);
        }
        else if(!purchaseOrderID && (!page || page === "home"))
        {
            let homePageView = controller.getHomePageView(cookie);
            pContext.response.write(homePageView);
        }
        else
        {
            let errorPage = controller.getErrorPage("Invalid Link!", false);
            pContext.response.write(errorPage);
        }
    }
}

// Handle the post requests
function handlePost(pContext : EntryPoints.Suitelet.onRequestContext)
{
    let params = pContext.request.parameters;
    let page = params.page;

    log.debug("post params", params);
    log.debug("post body", pContext.request.body);

    let cookie = pContext.request.headers.cookie;

    cookie = functions.validateSession(cookie);
    if (!cookie.valid) pContext.response.write(controller.getRedirectView(functions.getSuiteletURL(1564, 1, true)));
    else
    {
        if (page == constants.PAGES_IDS.RESET_PASSWORD)
        {
            let {userID, password} = params;

            pContext.response.write(controller.resetPassword(cookie, page, userID, password));
        }
        else
        {    
            let body = JSON.parse(pContext.request.body);
            let result;
            if (body.updateETAData)
            {
                log.debug("Update ETA Page", "Update ETA Page");
                controller.updateETAData(body);
            }
            else if (body.markInTransit)
            {
                log.debug("Mark In Transit", "Mark In Transit");
                result = controller.markShipmentAsInTransit(body, params);
            }
            else if (body.uploadShipmentFiles)
            {
                log.debug("Upload Shipment Files", "Upload Shipment Files");
                result = controller.uploadShipmentFiles(body, params);
            }
            else if (body.saveCreateLPData)
            {
                log.debug("Create Load Plans", "Create Load Plans");
                result = controller.saveLoadPlan(body);
            }
            else if (body.editCreateLPData)
            {
                log.debug("Update Load Plans", "Update Load Plans");
                result = controller.updateLoadPlan(body);
            }
            else
            {
                result = controller.updatePurchaseOrderData(body, params);
            }

            pContext.response.write(JSON.stringify({ status: 'success', data: {} }));
        }
    }
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
