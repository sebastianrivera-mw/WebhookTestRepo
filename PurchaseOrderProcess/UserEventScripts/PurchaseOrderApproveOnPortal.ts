/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as record from 'N/record';

import * as constants from '../Global/Constants';

export function afterSubmit(pContext: EntryPoints.UserEvent.afterSubmitContext)
{    
    try
    {
        log.debug("Running", "Running afterSubmit");
        log.debug("pContext.type", pContext.type);

        if (pContext.type === pContext.UserEventType.EDIT || pContext.type === pContext.UserEventType.XEDIT)
        {
            let oldApprovalStatus = pContext.oldRecord.getValue(constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS);
            log.debug("oldApprovalStatus", oldApprovalStatus);
            let newApprovalStatus = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS);
            log.debug("newApprovalStatus", newApprovalStatus);
            log.debug("constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED", constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED);
            if (oldApprovalStatus && Number(oldApprovalStatus) !== constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED && Number(newApprovalStatus) === constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED)
            {
                log.debug("Purchase Order Approved", `Purchase Order ID: ${pContext.newRecord.id} was approved, changing request.`);

                // Approve the request related to the PO
                approveRequest(pContext);

                // Update the Purchase Order status
                approvePurchaseOrder(pContext);

                log.debug("Finished", "Finished!");
                return;
            }

            let oldStatus = pContext.oldRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
            let newStatus = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
            if (oldStatus && Number(oldStatus) !== constants.PURCHASE_ORDER_STATUSES.APPROVED && Number(newStatus) === constants.PURCHASE_ORDER_STATUSES.APPROVED)
            {
                log.debug("Purchase Order Status moved to approved", `Purchase Order ID: ${pContext.newRecord.id} with status moved to approved, changing request.`);

                // Approve the request related to the PO
                approveRequest(pContext);

                log.debug("Finished", "Finished!");
                return;
            }
        }
        else if (pContext.type === pContext.UserEventType.APPROVE)
        {
            // Approve the request related to the PO
            approveRequest(pContext);

            // Update the Purchase Order status
            approvePurchaseOrder(pContext);

            log.debug("Finished", "Finished!");
        }
    }
    catch(error)
    {
        handleError(error);
    }
}

// Approve the request related to the PO
function approveRequest(pContext)
{
    let approvalRequestID = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.APPROVAL_REQUEST);
    log.debug("approvalRequestID", approvalRequestID);
    
    if (approvalRequestID)
    {
        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: String(approvalRequestID),
            values: {
                [constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED]: true,
                [constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED]: true,
                [constants.APPROVAL_REQUEST.FIELDS.APPROVED]: true
            }
        });
    }
}

// Update the Purchase Order status
function approvePurchaseOrder(pContext)
{
    record.submitFields({
        type: record.Type.PURCHASE_ORDER,
        id: String(pContext.newRecord.id),
        values: {
            [constants.PURCHASE_ORDER.FIELDS.STATUS]: constants.PURCHASE_ORDER_STATUSES.APPROVED
        }
    });
}

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
