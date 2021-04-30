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
import * as search from 'N/search';
import * as render from 'N/render';
import * as email from 'N/email';
import * as url from 'N/url';
import * as https from 'N/https'
import * as redirect from 'N/redirect'

import * as constants from '../Global/Constants';
import * as functions from '../Global/Functions';

export function afterSubmit(pContext: EntryPoints.UserEvent.afterSubmitContext)
{    
    try
    {
        log.debug("Running", "Running afterSubmit");

        if (pContext.type === pContext.UserEventType.EDIT || pContext.type === pContext.UserEventType.XEDIT)
        {
            let oldApproved = pContext.oldRecord.getValue(constants.APPROVAL_REQUEST.FIELDS.APPROVED);
            let newApproved = pContext.newRecord.getValue(constants.APPROVAL_REQUEST.FIELDS.APPROVED);
            if (!oldApproved && newApproved)
            {
                let approvalRequestData = search.lookupFields({
                    type: constants.APPROVAL_REQUEST.ID,
                    id: pContext.newRecord.id,
                    columns: [
                        constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER,
                        constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED,
                        constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE,
                        constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE
                    ]
                })
                let purchaseOrderID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER][0].value;
                log.debug("Updating", "Updating Purchase Order ID: " + JSON.stringify(purchaseOrderID));

                let shipDate = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE];
                log.debug("Updating", "Ship Date: " + shipDate);

                let approvalRequestLines = getApprovalRequestLines(pContext.newRecord.id);
                log.debug("Updating", "approvalRequestLines: " + JSON.stringify(approvalRequestLines));

                let purchaseOrder = record.load({ type: record.Type.PURCHASE_ORDER, id: purchaseOrderID });
                let isReplacement = purchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT);

                // Update the lines of the Purchase Order
                updatePurchaseOrderData(purchaseOrder, isReplacement, shipDate, approvalRequestLines);

                // Check if the PI File was already uploaded
                let PIFileUploaded = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
                log.debug("PIFileUploaded", PIFileUploaded);

                // Check if it is on Vendor or TOV side
                let vendorOrTOVSide = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
                log.debug("vendorOrTOVSide", vendorOrTOVSide);

                // Send notification email to Vendor
                sendNotificationEmail(pContext.newRecord.id, isReplacement, PIFileUploaded, vendorOrTOVSide);

                log.debug("Finished", "Finished!");
            }
        }

        return true;
    }
    catch(error)
    {
        handleError(error);
    }
}

// Get the lines related to the Approval Request
function getApprovalRequestLines(pApprovalRequestID)
{
    let approvalRequestLines = [];

    // Search for the Purchase Order
    let approvalRequestSearch = search.create({
        type: constants.APPROVAL_REQUEST_LINES.ID,
        filters:
        [
            [constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST, search.Operator.ANYOF, [pApprovalRequestID]]
        ],
        columns:
        [
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.INTERNALID }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE })
        ]
    });

    approvalRequestSearch.run().each(function(result) {

        let approvalRequestLine = {};

        approvalRequestLine[constants.APPROVAL_REQUEST_LINES.FIELDS.INTERNALID] = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.INTERNALID);
        approvalRequestLine[constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY] = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY);
        approvalRequestLine[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY] = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY);
        approvalRequestLine[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE] = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE);
        approvalRequestLine[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE] = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE);
        approvalRequestLine[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM] = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM);
        approvalRequestLine[constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE] = result.getValue({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE });

        approvalRequestLines.push(approvalRequestLine);

        return true;
    });

    return approvalRequestLines;
}

// Update the lines of the Purchase Order
function updatePurchaseOrderData(pPurchaseOrder, pIsReplacement, pShipDate, pApprovalRequestLines)
{
    log.debug("Update Line", "Update Line");
    // Set the data on the lines
    let lineCount = pPurchaseOrder.getLineCount({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID });
    for (let i = 0; i < lineCount; i++)
    {
        let purchaseOrderLineKey = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY, line: i });

        for (let j = 0; j < pApprovalRequestLines.length; j++)
        {
            let objectLineKey = pApprovalRequestLines[j][constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY];
            if (purchaseOrderLineKey == objectLineKey)
            {
                let quantity = Number(pApprovalRequestLines[j][constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY]);
                let purchasePrice = Number(pApprovalRequestLines[j][constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE]);
                let originalTotal = quantity * purchasePrice;
                let rate = pApprovalRequestLines[j][constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE];
                let cbm = pApprovalRequestLines[j][constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM];

                pPurchaseOrder.setSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY, value: quantity, line: i });
                pPurchaseOrder.setSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE, value: purchasePrice, line: i });
                pPurchaseOrder.setSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ORIGINAL_TOTAL, value: originalTotal, line: i });
                pPurchaseOrder.setSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE, value: rate, line: i });
                pPurchaseOrder.setSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM, value: cbm, line: i });
            }
        }
    }

    // Set the data on the Purchase Order
    pPurchaseOrder.setValue(constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE, new Date(pShipDate));
    // pPurchaseOrder.setValue(constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS, constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED);

    let statusToSet = pIsReplacement ? constants.PURCHASE_ORDER_STATUSES.APPROVED : constants.PURCHASE_ORDER_STATUSES.PENDING_LOAD_PLAN;
    pPurchaseOrder.setValue(constants.PURCHASE_ORDER.FIELDS.STATUS, statusToSet);

    pPurchaseOrder.save();
    
    ///////////////////////////////////// Added by Bryan Badilla 22/03/2021 /////////////////////////////////////////////////////////////////////////////
    let suitletURL = url.resolveScript({
        scriptId: constants.SCRIPTS.UPDATE_PO_APPROVED.ID,
        deploymentId: constants.SCRIPTS.UPDATE_PO_APPROVED.DEPLOY,
        returnExternalUrl: true,
        params: {idPO: pPurchaseOrder.id}
    });

    log.debug("PO ID", pPurchaseOrder.id);
    log.debug("URL" ,suitletURL);

    let response = https.request({
        method: https.Method.POST,
        url: suitletURL,
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    
}
// Send notification email to Vendor
function sendNotificationEmail(pApprovalRequestID, pIsReplacement, pPIFileUploaded, pVendorOrTOVSide)
{
    log.debug("Sending email", "Sending email");

    // Add attachments
    let purchaseOrderID = search.lookupFields({
        type: constants.APPROVAL_REQUEST.ID,
        id: pApprovalRequestID,
        columns: [
            constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER
        ]
    })[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER][0].value;

    // Get the data of the Purchase Order
    let purchaseOrderData = search.lookupFields({
        type: search.Type.PURCHASE_ORDER,
        id: purchaseOrderID,
        columns: [
            constants.PURCHASE_ORDER.FIELDS.VENDOR,
            constants.PURCHASE_ORDER.FIELDS.LOCATION
        ]
    });

    let vendorID = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR] ? purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR][0].value : null;
    let isDropship = Number(purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.LOCATION]) === constants.LOCATIONS.DROPSHIP;

    // Get the Purchase Order PDF
    let purchaseOrderPDF =  render.transaction({
        entityId: Number(purchaseOrderID),
        printMode: render.PrintMode.PDF
    });

    let attachments = [purchaseOrderPDF];

    // Get the template of the email
    let emailTemplate;
    if (pIsReplacement)
    {
        emailTemplate = (pVendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.TOV) ? constants.EMAIL_TEMPLATES.APPROVED_BY_TOV : constants.EMAIL_TEMPLATES.APPROVED_BY_VENDOR_TO_VENDOR;
    }
    else if (pPIFileUploaded)
    {
        emailTemplate = constants.EMAIL_TEMPLATES.APPROVED_BY_VENDOR_TO_VENDOR;
    }
    else
    {
        emailTemplate = constants.EMAIL_TEMPLATES.APPROVED_BY_TOV_PENDING_FILE;
    }
    
    // Merge the email
    let emailRender = render.mergeEmail({
        templateId: emailTemplate,
        customRecord: {
            type: constants.APPROVAL_REQUEST.ID,
            id: Number(pApprovalRequestID)
        }
    });

    // Set the subject and body
    let subject = emailRender.subject;
    let body = emailRender.body;

    log.debug("Email Body", emailRender.body);
    log.debug("Email Subject", emailRender.subject);

    // Get the data of the Vendor
    let vendorData = search.lookupFields({
        type: search.Type.VENDOR,
        id: vendorID,
        columns: [
            constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS,
            constants.VENDOR.FIELDS.TOV_REP
        ]
    });

    let vendorTOVRep = vendorData[constants.VENDOR.FIELDS.TOV_REP] ? vendorData[constants.VENDOR.FIELDS.TOV_REP][0].value : null;

    // Check if Vendor has access to the portal
    let vendorHasAccess = vendorData[constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS];

    // If Indian Vendor, send the data to the TOV Rep
    let isIndianVendor = Number(vendorTOVRep) === constants.GENERAL.INDIAN_VENDORS_TOV_REP;
    sendEmailToContacts(vendorID, vendorHasAccess, vendorTOVRep, isIndianVendor, purchaseOrderID, subject, body);

    // If was approved by the Vendor, send email to the PO Planner
    if ((!pIsReplacement && pPIFileUploaded) || (pIsReplacement && pVendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.VENDOR))
    {
        // Merge the email
        emailRender = render.mergeEmail({
            templateId: constants.EMAIL_TEMPLATES.APPROVED_BY_VENDOR_TO_TOV,
            customRecord: {
                type: constants.APPROVAL_REQUEST.ID,
                id: Number(pApprovalRequestID)
            }
        });

        // Set the subject and body
        let subject = emailRender.subject;
        let body = emailRender.body;

        log.debug("Email Body", emailRender.body);
        log.debug("Email Subject", emailRender.subject);

        // Get the data of the Purchase Order
        let purchaseOrderData = search.lookupFields({
            type: search.Type.PURCHASE_ORDER,
            id: purchaseOrderID,
            columns: [
                constants.PURCHASE_ORDER.FIELDS.VENDOR,
                constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO,
                constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM,
                constants.PURCHASE_ORDER.FIELDS.LOCATION
            ]
        });

        let vendor = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR] ? purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR][0].value : null;
        let isRenegade = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO];
        let customForm = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM] && purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM][0] ? purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM][0].value : null;
        let isPartsOrder = String(customForm) === constants.FORMS.PARTS_ORDER;
        let isDropship = Number(purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.LOCATION]) === constants.LOCATIONS.DROPSHIP;

        // Get the data of the Vendor
        let vendorData = search.lookupFields({
            type: search.Type.VENDOR,
            id: vendor,
            columns: [
                constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS,
                constants.VENDOR.FIELDS.TOV_REP
            ]
        });

        let vendorHasAccess = vendorData[constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS];
        let vendorTOVRep = vendorData[constants.VENDOR.FIELDS.TOV_REP] ? vendorData[constants.VENDOR.FIELDS.TOV_REP][0].value : null;

        let recipients = [ constants.EMPLOYEES.BAILA ];
        log.debug("Recipients", `Recipients: ${recipients}`);
        let cc;
        if (vendorHasAccess)
        {
            let modules = [constants.EMAIL_MODULES.ALL_PURCHASE_ORDERS];
            (isRenegade) ? modules.push(constants.EMAIL_MODULES.RENEGADE_PURCHASE_ORDERS) : {};
            (isPartsOrder) ? modules.push(constants.EMAIL_MODULES.PARTS_PURCHASE_ORDERS) : {};
            cc = functions.getEmailSubscribers(modules);
            if (isDropship) {
                // Remove Bruce if it is a dropship order
                cc = functions.removeElementFromArray(cc, -5);
            }
            (vendorTOVRep) ? cc.push(vendorTOVRep) : {};
        }
        else
        {
            cc = [];
        }
        log.debug("CC", `CC: ${cc}`);

        // Send the email
        email.send({
            author: constants.GENERAL.PURCHASING_EMAIL_AUTHOR,
            recipients: recipients,
            cc: cc,
            subject: subject,
            body: body,
            attachments: attachments,
            relatedRecords: {
                transactionId: Number(purchaseOrderID)
            }
        });

        log.debug("Email Sent", "Email Sent");
    }
}

// Send the email to the related contacts of the Vendor
function sendEmailToContacts(pVendorID, pVendorHasAccess, pVendorTOVRep, pIndianVendor, pPurchaseOrderID, pSubject, pBody)
{
    // Get the contacts to send email
    let contacts = (pIndianVendor) ? getContactsWithRelatedEmp(pVendorTOVRep) : getContactsWithVendor(pVendorID);
    if (!pVendorHasAccess || contacts.length > 0)
    {
        // Send email to contacts
        let link = functions.getSuiteletURL(constants.SCRIPTS.VENDOR_PORTAL_SUITELET.ID, constants.SCRIPTS.VENDOR_PORTAL_SUITELET.DEPLOY, true);
        link += `&po=${pPurchaseOrderID}&page=pending-vendor`;

        pBody = pBody.replace("_page_link_", link);

        // Set the recipients
        let recipients = (pVendorHasAccess) ? contacts : [ "roy.cordero@midware.net", "baila@tovfurniture.com" ];
        log.debug("Recipients", `Recipients: ${recipients}`);

        let cc = pVendorTOVRep && pVendorHasAccess ? [pVendorTOVRep] : [];
        log.debug("CC", `CC: ${cc}`);
    
        // Send the email
        email.send({
            author: constants.GENERAL.PURCHASING_EMAIL_AUTHOR,
            recipients: recipients,
            cc: cc,
            subject: pSubject,
            body: pBody,
            relatedRecords: {
                transactionId: Number(pPurchaseOrderID)
            }
        });
    
        log.debug("Email Sent", "Email Sent");
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

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
