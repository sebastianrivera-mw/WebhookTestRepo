/**
* @NApiVersion 2.0
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* @author Midware
* @Website www.midware.net
* @developer Walter Bonilla
* @contact contact@midware.net
*/

import { EntryPoints } from 'N/types';

import * as runtime from 'N/runtime';
import * as log from 'N/log';
import * as serverWidget from "N/ui/serverWidget";
import * as search from "N/search";

import * as constants from '../Global/Constants';

export function beforeLoad(pContext: EntryPoints.UserEvent.beforeLoadContext)
{
    try
    {
        if (runtime.executionContext === runtime.ContextType.USER_INTERFACE && pContext.type !== pContext.UserEventType.CREATE && pContext.type !== pContext.UserEventType.COPY)
        {
            let isnID = pContext.newRecord.id;
            let data = searchApprovalRequest(isnID);
            let poID = undefined;
            let appReq = undefined;

            if (data && data['purchaseOrder'] && data['aprovalRequest']){
                poID = data['purchaseOrder'];
                appReq = data['aprovalRequest'];
            }

            pContext.form.clientScriptModulePath = "../ClientScripts/InboundShipmentPortalActionsCS.js";

            if ( poID && appReq )
            {
                // Create the buttons of every action
                pContext.form.addButton({ id : "custpage_see_on_portal", label: "See On Portal", functionName: `seeOnPortal("${isnID}", "${poID}", "${appReq}");` });
            }
        }

        return true;
    }
    catch(error)
    {
        handleError(error);
    }
}

// Search Approval Request 
function searchApprovalRequest(pISN){
    let searchAR = search.create({
        type: "customrecord_mw_po_approval_request",
        filters:
        [
           ["custrecord_mw_related_isns","anyof",pISN]
        ],
        columns:
        [
           search.createColumn({
              name: "id",
              sort: search.Sort.ASC
           }),
           "custrecord_mw_purchase_order"
        ]
    }).run().getRange({start: 0,end: 1000});

    log.debug('searchAR', searchAR);

    let aprovalRequestData = {};

    if ( searchAR.length > 0 ) {
        let values = searchAR[0].getAllValues();

        log.debug('values', values);

        aprovalRequestData['aprovalRequest'] = searchAR[0]['id'];
        aprovalRequestData['purchaseOrder'] = values['custrecord_mw_purchase_order'][0]['value'];
    }

    log.debug('aprovalRequestData', aprovalRequestData);

    return aprovalRequestData;
}

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
