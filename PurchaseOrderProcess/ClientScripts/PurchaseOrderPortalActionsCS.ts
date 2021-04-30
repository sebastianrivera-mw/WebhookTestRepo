/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as url from 'N/url';
import * as https from 'N/https';
import * as message from 'N/ui/message';
import * as dialog from 'N/ui/dialog';

import * as constants from '../Global/Constants';

// Refresh the data of the portal with the actual data of the order
export function refreshPortal(pPurchaseOrderID, pApprovalRequestID)
{
    function success(result)
    {
        if (result)
        {
            let suiteletURL = url.resolveScript({
                scriptId : constants.SCRIPTS.PORTAL_ACTIONS.ID,
                deploymentId : constants.SCRIPTS.PORTAL_ACTIONS.DEPLOY
            });
    
            // Send post to suitelet with Vendor ID
            https.post({
                url: suiteletURL,
                body: {
                    'action': 'refresh',
                    'purchaseOrderID': pPurchaseOrderID,
                    'approvalRequestID': pApprovalRequestID
                }
            });
    
            // Show message for the user with duration of 5 seconds
            message.create({
                title: "Action",
                message: "The data is being refreshed in the portal",
                type: message.Type.CONFIRMATION
            }).show({ duration: 5000 });
    
            // Reload page after 5 seconds
            setTimeout(() => { location.reload(true) }, 5000);
        }
    }

    function failure(reason)
    {
        console.log("Failure with reason: " + reason);
    }

    var options = {
        title: "Refresh Portal",
        message: "The data of this purchase order on the portal will be replaced with the data is actually on Netsuite. Do you want to proceed?"
    };

    dialog.confirm(options).then(success).catch(failure);
}

// Resend the email to the Vendor with the portal data
export function resendPortalEmail(pPurchaseOrderID)
{
    function success(result)
    {
        if (result)
        {
            let suiteletURL = url.resolveScript({
                scriptId : constants.SCRIPTS.PORTAL_ACTIONS.ID,
                deploymentId : constants.SCRIPTS.PORTAL_ACTIONS.DEPLOY
            });
    
            // Send post to suitelet with Vendor ID
            https.post({
                url: suiteletURL,
                body: {
                    'action': 'resendEmail',
                    'purchaseOrderID': pPurchaseOrderID
                }
            });
    
            // Show message for the user with duration of 5 seconds
            message.create({
                title: "Action",
                message: "The email is now in queue to be sent",
                type: message.Type.CONFIRMATION
            }).show({ duration: 5000 });
    
            // Reload page after 5 seconds
            setTimeout(() => { location.reload(true) }, 5000);
        }
    }

    function failure(reason)
    {
        console.log("Failure with reason: " + reason);
    }

    var options = {
        title: "Resend Vendor Portal Email",
        message: "Do you want to resend the email to the Vendor with the data of this purchase order?"
    };

    dialog.confirm(options).then(success).catch(failure);
}

// Open a new page with the PO Planner Portal page
export function seeOnPortal(pPurchaseOrderID, pApprovalRequestID)
{
    let plannerPortalURL = url.resolveScript({
        scriptId: constants.SCRIPTS.PO_PLANNER_PORTAL_SUITELET.ID,
        deploymentId: constants.SCRIPTS.PO_PLANNER_PORTAL_SUITELET.DEPLOY,
        params: {
            id : pApprovalRequestID,
            po : pPurchaseOrderID
        }
    });

    window.open(plannerPortalURL);
}
