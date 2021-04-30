/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Walter Bonila
 * @contact contact@midware.net
 */

import {EntryPoints} from 'N/types'

import * as dialog from "N/ui/dialog";
import * as https from "N/https";
import * as url from "N/url";
import * as log from 'N/log';
import * as message from 'N/ui/message';

import * as constants from '../Global/Constants';

export function pageInit(pContext : EntryPoints.Client.pageInitContext)
{
   
}

// Open a new page with the PO Planner Portal page
export function seeOnPortal(pInboundShipmentID, pPurchaseOrderID, pApprovalRequestID)
{
    let plannerPortalURL = url.resolveScript({
        scriptId: constants.SCRIPTS.PO_PLANNER_PORTAL_SUITELET.ID,
        deploymentId: constants.SCRIPTS.PO_PLANNER_PORTAL_SUITELET.DEPLOY,
        params: {
            id : pApprovalRequestID,
            po : pPurchaseOrderID,
            isn : pInboundShipmentID,
            page : 'load-plans'
        }
    });

    window.open(plannerPortalURL);
}
