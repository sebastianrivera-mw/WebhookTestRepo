/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as task from 'N/task';
import * as search from 'N/search';
import * as record from 'N/record';

import * as constants from '../Global/Constants';
import * as functions from '../Global/Functions';

/*
export function afterSubmit(pContext: EntryPoints.UserEvent.afterSubmitContext)
{    
    try
    {
        log.debug("Running", "Running afterSubmit");
        log.debug("pContext.type", pContext.type);

        if (pContext.type === pContext.UserEventType.CREATE || pContext.type === pContext.UserEventType.EDIT)
        {
            let currentStatus = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
            log.debug("Current Status", currentStatus);

            let requestEmailSent = search.lookupFields({
                type: search.Type.PURCHASE_ORDER,
                id: pContext.newRecord.id,
                columns: [ constants.PURCHASE_ORDER.FIELDS.REQUEST_EMAIL_SENT ]
            })[ constants.PURCHASE_ORDER.FIELDS.REQUEST_EMAIL_SENT ];
            log.debug("Request Email Sent", requestEmailSent);
            
            if (currentStatus == constants.PURCHASE_ORDER_STATUSES.VENDOR_ACTION && !requestEmailSent)
            {
                // Check if there are records for this Purchase Order
                let thereAreRecords = getExistingRecords(pContext.newRecord.id);
                if (!thereAreRecords)
                {
                    log.debug("Creating Approval Request Email", "Creating Approval Request Email for Purchase Order ID: " + pContext.newRecord.id);

                    // Create the Approval Request Email record
                    let approvalRequestEmailID = createApprovalRequestEmailRecord(pContext.newRecord.id);
                    log.debug("Approval Request Email ID", "Approval Request Email ID: " + approvalRequestEmailID);
    
                    // Schedule task
                    task.create({
                        taskType : task.TaskType.SCHEDULED_SCRIPT,
                        scriptId : constants.SCRIPTS.CREATE_APPROVAL_SCHEDULED.ID,
                        deploymentId : constants.SCRIPTS.CREATE_APPROVAL_SCHEDULED.DEPLOY
                    }).submit();
                }
            }
        }

        log.debug("Running", "All finished!");
    }
    catch(error)
    {
        handleError(error);
    }
}
*/

export function afterSubmit(pContext: EntryPoints.UserEvent.afterSubmitContext)
{
    try
    {
        log.debug("Running", "Running afterSubmit");
        log.debug("pContext.type", pContext.type);

        let requestEmailSent = search.lookupFields({
            type: search.Type.PURCHASE_ORDER,
            id: pContext.newRecord.id,
            columns: [ constants.PURCHASE_ORDER.FIELDS.REQUEST_EMAIL_SENT ]
        })[ constants.PURCHASE_ORDER.FIELDS.REQUEST_EMAIL_SENT ];

        log.debug("Request Email Sent", requestEmailSent);

        if ( pContext.type === pContext.UserEventType.CREATE && !requestEmailSent )
        {
            let currentStatus = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
            log.debug("Current Status", currentStatus);

            if ( currentStatus == constants.PURCHASE_ORDER_STATUSES.VENDOR_ACTION ) 
            {
                proccessVendorAction(pContext);
            } 
            else if ( currentStatus == constants.PURCHASE_ORDER_STATUSES.TOV_ACTION  || currentStatus == constants.PURCHASE_ORDER_STATUSES.PENDING_LOAD_PLAN || currentStatus == constants.PURCHASE_ORDER_STATUSES.APPROVED ) 
            {
                processNoEmailAction(pContext, currentStatus);
            }
        } 
        else if ( pContext.type === pContext.UserEventType.EDIT && !requestEmailSent )
        {
            let currentStatus = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
            log.debug("Current Status", currentStatus);

            let oldStatus = pContext.oldRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
            log.debug("Old Status", oldStatus);

            if ( oldStatus == constants.PURCHASE_ORDER_STATUSES.DRAFT && currentStatus == constants.PURCHASE_ORDER_STATUSES.VENDOR_ACTION ) 
            {
                proccessVendorAction(pContext);
            } 
            else if ( oldStatus == constants.PURCHASE_ORDER_STATUSES.DRAFT && (currentStatus == constants.PURCHASE_ORDER_STATUSES.TOV_ACTION  || currentStatus == constants.PURCHASE_ORDER_STATUSES.PENDING_LOAD_PLAN || currentStatus == constants.PURCHASE_ORDER_STATUSES.APPROVED) ) 
            {
                processNoEmailAction(pContext, currentStatus);
            }
        }

        log.debug("Running", "All finished!");
    }
    catch(error)
    {
        handleError(error);
    }
}

function proccessVendorAction(pContext)
{
    // Check if there are records for this Purchase Order
    let thereAreRecords = getExistingRecords(pContext.newRecord.id);
    if (!thereAreRecords)
    {
        log.debug("Creating Approval Request Email", "Creating Approval Request Email for Purchase Order ID: " + pContext.newRecord.id);

        // Create the Approval Request Email record
        let approvalRequestEmailID = createApprovalRequestEmailRecord(pContext.newRecord.id);
        log.debug("Approval Request Email ID", "Approval Request Email ID: " + approvalRequestEmailID);

        // Schedule task
        task.create({
            taskType : task.TaskType.SCHEDULED_SCRIPT,
            scriptId : constants.SCRIPTS.CREATE_APPROVAL_SCHEDULED.ID,
            deploymentId : constants.SCRIPTS.CREATE_APPROVAL_SCHEDULED.DEPLOY
        }).submit();
    }
}

function processNoEmailAction(pContext: EntryPoints.UserEvent.afterSubmitContext, pStatus)
{
    // Check if there are records for this Purchase Order
    let thereAreRecords = getExistingRecords(pContext.newRecord.id);
    if (!thereAreRecords)
    {
        let poID = pContext.newRecord.id;
        let vendorID = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.VENDOR);
        let total = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.TOTAL);
        let shipDate = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE);

        // Create the Approval Request record
        let approvalRequestRecordID = createApprovalRequestRecord(poID, shipDate, vendorID, total, pStatus);
        
        // Create the Approval Request Lines records
        createApprovalRequestLines(pContext.newRecord, approvalRequestRecordID);
    }
}

// Check if there are records for this Purchase Order
function getExistingRecords(pPurchaseOrderID)
{
    // Search for the Purchase Order
    let pendingApprovalRequestEmailSearch = search.create({
        type: constants.APPROVAL_REQUEST_EMAIL.ID,
        filters:
        [
            search.createFilter({ name: constants.APPROVAL_REQUEST_EMAIL.FIELDS.IN_QUEUE, operator: search.Operator.IS, values: true }),
            search.createFilter({ name: constants.APPROVAL_REQUEST_EMAIL.FIELDS.PURCHASE_ORDER, operator: search.Operator.ANYOF, values: [pPurchaseOrderID] })
        ],
        columns:
        [
            search.createColumn({ name: constants.APPROVAL_REQUEST_EMAIL.FIELDS.INTERNALID })
        ]
    });

    let thereAreRecords = pendingApprovalRequestEmailSearch.runPaged({ pageSize: 1000 }).count > 0;    
    log.debug("thereAreRecords", thereAreRecords);

    return thereAreRecords;
}

// Create the Approval Request Email record
function createApprovalRequestEmailRecord(pPurchaseOrderID)
{
    let approvalRequestEmail = record.create({ type: constants.APPROVAL_REQUEST_EMAIL.ID });
    approvalRequestEmail.setValue(constants.APPROVAL_REQUEST_EMAIL.FIELDS.PURCHASE_ORDER, pPurchaseOrderID);
    approvalRequestEmail.setValue(constants.APPROVAL_REQUEST_EMAIL.FIELDS.IN_QUEUE, true);
    let approvalRequestEmailID = approvalRequestEmail.save();

    return approvalRequestEmailID;
}

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}

// Create the Approval Request record
export function createApprovalRequestRecord(pPurchaseOrderID, pShipDate, pVendorID, pTotal, pInitialStatus)
{
    // Update previous records
    search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters: [
            search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, operator: search.Operator.ANYOF, values: [pPurchaseOrderID] }),
            search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, operator: search.Operator.IS, values: true })
        ],
        columns: [
            search.createColumn({ name: "internalid" })
        ]
    }).run().each(function (result) {

        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: result.id,
            values: {
                [constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST]: false
            }
        });

        return true;
    });

    let actualDate = new Date();

    let approvalRequest = record.create({ type: constants.APPROVAL_REQUEST.ID });
    approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, pPurchaseOrderID);
    approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR, pVendorID);
    approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE, pShipDate);
    approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.TOTAL, pTotal);
    approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT, 0);
    approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE, constants.VENDOR_OR_TOV_TEXT.VENDOR);
    approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.DATE, actualDate);
    approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, true);

    // Set special field by the PO status
    if ( pInitialStatus == constants.PURCHASE_ORDER_STATUSES.PENDING_LOAD_PLAN || pInitialStatus == constants.PURCHASE_ORDER_STATUSES.APPROVED  )
    {
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.APPROVED, true);
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED, true);
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED, true);
    }

    let approvalRequestID = approvalRequest.save();

    let plannerPageLink = functions.getSuiteletURL(constants.SCRIPTS.PO_PLANNER_PORTAL_SUITELET.ID, constants.SCRIPTS.PO_PLANNER_PORTAL_SUITELET.DEPLOY, false);
    plannerPageLink += `&id=${approvalRequestID}&po=${pPurchaseOrderID}`;

    record.submitFields({
        type: constants.APPROVAL_REQUEST.ID,
        id: approvalRequestID,
        values: {
            [constants.APPROVAL_REQUEST.FIELDS.PLANNER_PAGE_LINK] : plannerPageLink
        }
    })

    log.debug("Approval Request Created", "Approval Request ID: " + approvalRequestID);

    return approvalRequestID;
}

// Create the Approval Request Lines records
export function createApprovalRequestLines(pPurchaseOrder, pApprovalRequestID)
{
    let actualDate = new Date();

    let lineCount = pPurchaseOrder.getLineCount({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID });
    for (let i = 0; i < lineCount; i++)
    {
        let itemType = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM_TYPE, line: i });
        if (itemType !== "Discount")
        {
            let lineUniqueKey = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY, line: i });
            let item = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, line: i });
            let quantity = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY, line: i });
            let purchasePrice = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE, line: i });
            let rate = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE, line: i });
            let amount = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT, line: i });
            let cbm = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM, line: i });
            let cbf = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBF, line: i });
            let expectedReceiptDate = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.EXPECTED_RECEIPT_DATE, line: i });
    
            let approvalRequestLine = record.create({ type: constants.APPROVAL_REQUEST_LINES.ID });
    
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST, pApprovalRequestID);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY, lineUniqueKey);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.REQUEST_DATE, actualDate);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.ITEM, item);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY, quantity);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE, purchasePrice);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE, rate);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT, amount);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM, cbm);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.CBF, cbf);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE, expectedReceiptDate);
            approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE, constants.VENDOR_OR_TOV_TEXT.VENDOR);
    
            let approvalRequestLineID = approvalRequestLine.save();

            pPurchaseOrder.setSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, line: i, value: approvalRequestLineID });
        }
    }

    pPurchaseOrder.save();
}
