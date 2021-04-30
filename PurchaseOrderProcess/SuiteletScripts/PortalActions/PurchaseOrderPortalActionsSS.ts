/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as record from 'N/record';
import * as search from 'N/search';
import * as render from 'N/render';
import * as email from 'N/email';
import * as task from 'N/task';
import * as error from 'N/error';
import * as http from 'N/http';

import * as constants from '../../Global/Constants';
import * as functions from '../../Global/Functions';

export function onRequest(pContext : EntryPoints.Suitelet.onRequestContext)
{
    try
    {
        // Event router pattern design
        var eventMap = {};
        eventMap[http.Method.POST] = handlePost;

        eventMap[pContext.request.method] ? eventMap[pContext.request.method](pContext) : httpRequestError();
    }
    catch (error)
    {
        handleError(error);
    }
}

// Handle the post requests
function handlePost(pContext : EntryPoints.Suitelet.onRequestContext)
{
    try
    {
        // Get data from params
        let params = pContext.request.parameters;
        let action = params.action;
        let purchaseOrderID = params.purchaseOrderID;
        let approvalRequestID = params.approvalRequestID;

        if (action === "refresh")
        {
            log.debug("Refresh Portal Action", "Refresh Portal Action");

            // Refresh the data of the portal
            refreshPortal(purchaseOrderID, approvalRequestID);
        }
        else if (action === "resendEmail")
        {
            log.debug("Resend Email Action", "Resend Email Action");

            // Resend the email to the Vendor
            resendEmail(purchaseOrderID);
        }
    }
    catch (error)
    {
        handleError(error);
    }
}

// Refresh the data of the portal
function refreshPortal(pPurchaseOrderID, pApprovalRequestID)
{
    log.debug("Purchase Order ID", pPurchaseOrderID);
    log.debug("Approval Request ID", pApprovalRequestID);

    let purchaseOrder = record.load({ type: record.Type.PURCHASE_ORDER, id: pPurchaseOrderID });
    let purchaseOrderChanged = false;

    let allLinesOnShipments = true;
    let lineKeys = [];
    let lineCount = purchaseOrder.getLineCount({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID });
    for (let i = 0; i < lineCount; i++)
    {
        // Store the line key to compare later
        let lineKey = purchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY, line: i });
        lineKeys.push(lineKey);

        let approvalRequestLineID = purchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, line: i });
        if (approvalRequestLineID)
        {
            // Update the data from the line to the approval request line record
            syncApprovalRequestLine(purchaseOrder, i, approvalRequestLineID);
        }
        else
        {
            // Create approval request line record
            let approvalRequestLineID = createApprovalRequestLine(purchaseOrder, i, pApprovalRequestID);
            log.debug("Creating a new Approval Request Line", `Created Approval Request Line with ID: ${approvalRequestLineID}`);

            // Set the ID of the new record on the line
            purchaseOrder.setSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, line: i, value: approvalRequestLineID });
            purchaseOrderChanged = true;

            log.debug("Approval Request Line ID set on line", `Approval Request Line ID set on line: ${i}`);
        }

        // Check if all lines are on shipments
        let quantity = purchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY, line: i });
        let quantityOnShipments = purchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY_ON_SHIPMENTS, line: i });
        if (Number(quantity) !== Number(quantityOnShipments)) allLinesOnShipments = false;
    }

    log.debug("allLinesOnShipments", allLinesOnShipments);

    // Check if all the approval request lines still exist on the purchase order
    validateApprovalRequestLines(pApprovalRequestID, lineKeys);

    // Update the data of the approval request
    syncApprovalRequest(purchaseOrder, pApprovalRequestID, allLinesOnShipments);

    // Send the email to the related contacts of the Vendor
    sendNotificationEmail(purchaseOrder);
    
    // Save the purchase order if it was changed
    if (purchaseOrderChanged)
    {
        purchaseOrder.save();
    }
}

// Resend the email to the Vendor
function resendEmail(pPurchaseOrderID)
{
    // Create the approval request email
    let approvalRequestEmail = record.create({ type: constants.APPROVAL_REQUEST_EMAIL.ID });
    approvalRequestEmail.setValue(constants.APPROVAL_REQUEST_EMAIL.FIELDS.PURCHASE_ORDER, pPurchaseOrderID);
    approvalRequestEmail.setValue(constants.APPROVAL_REQUEST_EMAIL.FIELDS.IN_QUEUE, true);
    approvalRequestEmail.setValue(constants.APPROVAL_REQUEST_EMAIL.FIELDS.RESENT_EMAIL, true);
    let approvalRequestEmailID = approvalRequestEmail.save();
    log.debug("Approval Request Email ID", "Approval Request Email ID: " + approvalRequestEmailID);

    // Schedule task
    task.create({
        taskType : task.TaskType.SCHEDULED_SCRIPT,
        scriptId : constants.SCRIPTS.CREATE_APPROVAL_SCHEDULED.ID,
        deploymentId : constants.SCRIPTS.CREATE_APPROVAL_SCHEDULED.DEPLOY
    }).submit();

    log.debug("Scheduled script called!", "Scheduled script called!");
}

// Update the data from the line to the approval request line record
function syncApprovalRequestLine(pPurchaseOrder, pLine, pApprovalRequestLineID)
{
    // Get the data from the Approval Request Line
    let approvalRequestLineData = search.lookupFields({
        type: constants.APPROVAL_REQUEST_LINES.ID,
        id: pApprovalRequestLineID,
        columns: [
            constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY,
            constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE,
            constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE,
            constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT,
            constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM
        ]
    });

    let apprRequestQty = Number(approvalRequestLineData[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY]);
    let apprRequestPurchPrice = Number(approvalRequestLineData[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE]);
    let apprRequestRate = Number(approvalRequestLineData[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE]);
    let apprRequestAmount = Number(approvalRequestLineData[constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT]);
    let apprRequestCBM = Number(approvalRequestLineData[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM]);
    let lineQty = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY, line: pLine });
    let linePurchPrice = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE, line: pLine });
    let lineRate = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE, line: pLine });
    let lineAmount = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT, line: pLine });
    let lineCBM = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM, line: pLine });

    log.debug("approvalRequestLineData", JSON.stringify(approvalRequestLineData));
    log.debug("purchaseOrderLineData", {[constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY] : lineQty, [constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE] : linePurchPrice, [constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE] : lineRate, [constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT] : lineAmount, [constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM] : lineCBM});

    // Set data on Approval Request Line if different data
    if ((apprRequestQty !== lineQty) || (apprRequestPurchPrice !== linePurchPrice) || (apprRequestRate !== lineRate) || (apprRequestAmount !== lineAmount) || (apprRequestCBM !== lineCBM))
    {
        log.debug("Setting data on Approval Request Line", `Setting data on Approval Request Line ID: ${pApprovalRequestLineID}`);

        record.submitFields({
            type: constants.APPROVAL_REQUEST_LINES.ID,
            id: pApprovalRequestLineID,
            values: {
                [constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY]: null,
                [constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY]: lineQty,
                [constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE]: null,
                [constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE]: linePurchPrice,
                [constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE]: null,
                [constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE]: lineRate,
                [constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT]: lineAmount,
                [constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM]: null,
                [constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM]: lineCBM
            }
        });
    }
}

// Create approval request line record
function createApprovalRequestLine(pPurchaseOrder, pLine, pApprovalRequestID)
{
    let lineUniqueKey = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY, line: pLine });
    let lineItem = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, line: pLine });
    let lineQty = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY, line: pLine });
    let linePurchPrice = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE, line: pLine });
    let lineRate = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE, line: pLine });
    let lineAmount = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT, line: pLine });
    let lineCBM = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM, line: pLine });

    let approvalRequestLine = record.create({ type: constants.APPROVAL_REQUEST_LINES.ID });
    approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST, pApprovalRequestID);
    approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.REQUEST_DATE, new Date());
    approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY, lineUniqueKey);
    approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.ITEM, lineItem);
    approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY, lineQty);
    approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE, linePurchPrice);
    approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE, lineRate);
    approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT, lineAmount);
    approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM, lineCBM);
    approvalRequestLine.setValue(constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE, constants.VENDOR_OR_TOV_TEXT.VENDOR);
    let approvalRequestLineID = approvalRequestLine.save();

    return approvalRequestLineID;
}

// Check if all the approval request lines still exist on the purchase order
function validateApprovalRequestLines(pApprovalRequestID, pLineKeys)
{
    log.debug("Validating approval request lines", "Line keys: " + pLineKeys);

    // Get the Approval Request Lines
    let approvalRequestLinesSearch = search.create({
        type: constants.APPROVAL_REQUEST_LINES.ID,
        filters: [
            search.createFilter({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST, operator: search.Operator.ANYOF, values: pApprovalRequestID })
        ],
        columns: [
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY })
        ]
    });

    // Loop through existing Netsuite lines and validate if required to delete
    let linesToDelete = [];
    let approvalRequestLinesSearchResults = approvalRequestLinesSearch.runPaged({ pageSize: 1000 });
    for (let i = 0; i < approvalRequestLinesSearchResults.pageRanges.length; i++)
    {
        let page = approvalRequestLinesSearchResults.fetch({ index: approvalRequestLinesSearchResults.pageRanges[i].index });
        for (let j = 0; j < page.data.length; j++)
        {
            let result = page.data[j];
            let lineKey = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY);

            // If the line is not present on the Purchase Order, store it to delete it
            if (pLineKeys.indexOf(lineKey) === -1)
            {
                linesToDelete.push(result.id);
            }
        }
    }

    log.debug("linesToDelete", linesToDelete);

    // Delete the approval request lines that were deleted from the Purchase Order
    for (let i = 0; i < linesToDelete.length; i++)
    {
        record.delete({ type: constants.APPROVAL_REQUEST_LINES.ID, id: linesToDelete[i] });
    }
}

// Update the data of the approval request
function syncApprovalRequest(pPurchaseOrder, pApprovalRequestID, pAllLinesOnShipments)
{
    // Get the data from the Approval Request Line
    let approvalRequestLineData = search.lookupFields({
        type: constants.APPROVAL_REQUEST.ID,
        id: pApprovalRequestID,
        columns: [
            constants.APPROVAL_REQUEST.FIELDS.TOTAL,
            constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE,
            constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE,
            constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED
        ]
    });

    let apprRequestTotal = approvalRequestLineData[constants.APPROVAL_REQUEST.FIELDS.TOTAL];
    let apprRequestShipDate = approvalRequestLineData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE];
    let apprRequestISNComplete = approvalRequestLineData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
    let apprRequestISNShipped = approvalRequestLineData[constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED];
    let total = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.TOTAL);
    let shipDate = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE);
    log.debug("apprRequestTotal", apprRequestTotal);
    log.debug("apprRequestShipDate", apprRequestShipDate);
    log.debug("apprRequestISNComplete", apprRequestISNComplete);
    log.debug("apprRequestISNShipped", apprRequestISNShipped);
    log.debug("total", total);
    log.debug("shipDate", shipDate);

    // Set data on Approval Request Line if different data
    if ((apprRequestTotal !== total) || (apprRequestShipDate !== shipDate) || (apprRequestISNComplete !== pAllLinesOnShipments))
    {
        log.debug("Setting data on Approval Request", `Setting data on Approval Request ID: ${pApprovalRequestID}`);

        let newISNShipped = !pAllLinesOnShipments ? false : apprRequestISNShipped;

        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: pApprovalRequestID,
            values: {
                [constants.APPROVAL_REQUEST.FIELDS.TOTAL]: total,
                [constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE]: shipDate,
                [constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE]: pAllLinesOnShipments,
                [constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED]: newISNShipped
            }
        });
    }
}

// Send the email to the related contacts of the Vendor
function sendNotificationEmail(pPurchaseOrder)
{
    log.debug("Sending email to Contacts", "Sending email to Contacts");

    // Get the data of the Vendor
    let vendorID = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.VENDOR);
    let vendorData = search.lookupFields({
        type: search.Type.VENDOR,
        id: vendorID,
        columns: [
            constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS,
            constants.VENDOR.FIELDS.TOV_REP
        ]
    });

    let vendorTOVRep = vendorData[constants.VENDOR.FIELDS.TOV_REP] ? vendorData[constants.VENDOR.FIELDS.TOV_REP][0].value : null;
    let vendorHasAccess = vendorData[constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS];
    let isIndianVendor = Number(vendorTOVRep) === constants.GENERAL.INDIAN_VENDORS_TOV_REP;

    // Get the data of the order
    let tranid = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.TRANID);
    let isRenegade = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO);
    let isPartsOrder = String(pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM)) === constants.FORMS.PARTS_ORDER;

    // Get the contacts to send email
    let contacts = (isIndianVendor) ? getContactsWithRelatedEmp(vendorTOVRep) : getContactsWithVendor(vendorID);
    if (!vendorHasAccess || contacts.length > 0)
    {
        // Get the data of the email that will be sent
        let emailData = getEmailData(pPurchaseOrder.id, tranid);

        // Send email to contacts
        sendEmailToContacts(emailData, contacts, pPurchaseOrder.id, isRenegade, isPartsOrder, vendorHasAccess, vendorTOVRep);
    }
    else
    {
        log.debug("No contacts to send the email", "No contacts to send the email");
    }
}

// Get the contacts to send the email using the Vendor ID
function getContactsWithVendor(pVendorID)
{
    let contacts = [];
    if (pVendorID)
    {
        // Get the Vendor ID with the unique key
        search.create({
            type: search.Type.CONTACT,
            filters: [
                [constants.CONTACT.FIELDS.COMPANY, "is", pVendorID],
                "AND",
                [constants.CONTACT.FIELDS.EMAIL, "isnotempty", null],
                "AND",
                [constants.CONTACT.FIELDS.COPY_VENDOR_PORTAL_UPDATES, "is", "T"]
            ],
            columns: [
                search.createColumn({ name: constants.CONTACT.FIELDS.EMAIL }),
                search.createColumn({ name: constants.CONTACT.FIELDS.COPY_NEW_PO_EMAIL }),
                search.createColumn({ name: constants.CONTACT.FIELDS.COPY_VENDOR_PORTAL_UPDATES }),
                search.createColumn({ name: constants.CONTACT.FIELDS.VENDOR_PORTAL_KEY }),
                search.createColumn({ name: constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS, join: constants.CONTACT.FIELDS.COMPANY })
            ]
        }).run().each(function (result) {
            
            contacts.push(result.id);

            return true;
        });

        log.debug("contacts", contacts);
    }

    return contacts;
}

// Get the contacts to send the email using the TOV Rep
function getContactsWithRelatedEmp(pTOVRep)
{
    let contacts = [];
    if (pTOVRep)
    {
        // Get the Vendor ID with the unique key
        search.create({
            type: search.Type.CONTACT,
            filters: [
                [constants.CONTACT.FIELDS.RELATED_EMPLOYEE, "anyof", [pTOVRep]],
                "AND",
                [constants.CONTACT.FIELDS.EMAIL, "isnotempty", null],
                "AND",
                [constants.CONTACT.FIELDS.COPY_VENDOR_PORTAL_UPDATES, "is", "T"]
            ],
            columns: [
                search.createColumn({ name: constants.CONTACT.FIELDS.EMAIL }),
                search.createColumn({ name: constants.CONTACT.FIELDS.COPY_NEW_PO_EMAIL }),
                search.createColumn({ name: constants.CONTACT.FIELDS.COPY_VENDOR_PORTAL_UPDATES }),
                search.createColumn({ name: constants.CONTACT.FIELDS.VENDOR_PORTAL_KEY }),
                search.createColumn({ name: constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS, join: constants.CONTACT.FIELDS.COMPANY })
            ]
        }).run().each(function (result) {
            
            contacts.push(result.id);

            return true;
        });

        log.debug("contacts", contacts);
    }

    return contacts;
}

// Get the data of the email that will be sent
function getEmailData(pPurchaseOrderID, pTranID)
{
    // Get the Purchase Order PDF
    let purchaseOrderPDF =  render.transaction({
        entityId: Number(pPurchaseOrderID),
        printMode: render.PrintMode.PDF
    });

    // Merge the email
    let emailRender = render.mergeEmail({
        transactionId : pPurchaseOrderID, 
        templateId : constants.EMAIL_TEMPLATES.DATA_REFRESHED
    });

    // Set the subject and body
    let subject = emailRender.subject;
    subject = subject.replace("_tranid_", pTranID);
    let body = emailRender.body;

    // Set the links on the body
    let link = functions.getSuiteletURL(constants.SCRIPTS.VENDOR_PORTAL_SUITELET.ID, constants.SCRIPTS.VENDOR_PORTAL_SUITELET.DEPLOY, true);
    link += `&po=${pPurchaseOrderID}&page=pending-vendor`;

    let portalLink = functions.getSuiteletURL(constants.SCRIPTS.VENDOR_PORTAL_SUITELET.ID, constants.SCRIPTS.VENDOR_PORTAL_SUITELET.DEPLOY, true);

    body = body.replace("_page_link_", link);
    body = body.replace("_portal_link_", portalLink);

    log.debug("Email Subject", subject);
    log.debug("Email Body", body);

    return {
        "subject": subject,
        "body": body,
        "attachments": [purchaseOrderPDF]
    };
}

// Send email to contacts
function sendEmailToContacts(pEmailData, pContacts, pPurchaseOrderID, pIsRenegade, pIsPartsOrder, pVendorHasAccess, pVendorTOVRep)
{
    // Set the recipients
    let recipients = (pVendorHasAccess) ? pContacts : [ "roy.cordero@midware.net", "baila@tovfurniture.com" ];
    let cc;
    if (pVendorHasAccess)
    {
        let modules = [constants.EMAIL_MODULES.ALL_PURCHASE_ORDERS];
        (pIsRenegade) ? modules.push(constants.EMAIL_MODULES.RENEGADE_PURCHASE_ORDERS) : {};
        (pIsPartsOrder) ? modules.push(constants.EMAIL_MODULES.PARTS_PURCHASE_ORDERS) : {};
        cc = functions.getEmailSubscribers(modules);
        (pVendorTOVRep) ? cc.push(pVendorTOVRep) : {};
    }
    else
    {
        cc = [];
    }
    log.debug("Recipients and CC", `Recipients: ${recipients} - CC: ${cc}`);

    // Send the email
    email.send({
        author: constants.GENERAL.PURCHASING_EMAIL_AUTHOR,
        recipients: recipients,
        cc: cc,
        subject: pEmailData.subject,
        body: pEmailData.body,
        attachments: pEmailData.attachments,
        relatedRecords: {
            transactionId: Number(pPurchaseOrderID),
            entityId: pContacts
        }
    });

    log.debug("Email Sent", "Email Sent");
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
