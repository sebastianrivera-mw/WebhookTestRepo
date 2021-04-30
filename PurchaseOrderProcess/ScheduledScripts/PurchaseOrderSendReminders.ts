/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as search from 'N/search';
import * as email from 'N/email';
import * as render from 'N/render';
import * as record from 'N/record';

import * as constants from '../Global/Constants';

export function execute(pContext: EntryPoints.Scheduled.executeContext)
{    
    try
    {
        log.debug("Running", "Starting process!");

        let approvalRequests = getApprovalRequests();
        log.debug("Approval Requests", "Quantity of Records: " + approvalRequests.length);

        for (let i = 0; i < approvalRequests.length; i++)
        {
            let approvalRequest = approvalRequests[i];
            let approvalRequestID = approvalRequest[constants.APPROVAL_REQUEST_OBJECT.INTERNALID];
            let ageInHours = approvalRequest[constants.APPROVAL_REQUEST_OBJECT.AGE_IN_HOURS];
            let remindersSent = approvalRequest[constants.APPROVAL_REQUEST_OBJECT.REMINDERS_SENT];
            let purchaseOrderID = Number(approvalRequest[constants.APPROVAL_REQUEST_OBJECT.PURCHASE_ORDER]);
            let tranID = approvalRequest[constants.APPROVAL_REQUEST_OBJECT.PO_TRANID];
            let pageLink = approvalRequest[constants.APPROVAL_REQUEST_OBJECT.PAGE_LINK];

            log.debug("ageInHours", ageInHours);
            log.debug("remindersSent", remindersSent);
            log.debug("purchaseOrderID", purchaseOrderID);
            log.debug("tranID", tranID);
            log.debug("pageLink", pageLink);

            if (ageInHours < 72 && remindersSent == 0)
            {
                // Send the reminder email
                sendReminders(false, purchaseOrderID, tranID, pageLink);

                // Update the Reminders Sent field on the Approval Request record
                updateReminderSentField(approvalRequestID, 1);
            }
            else if (ageInHours > 72 && remindersSent == 1)
            {
                // Send the reminder email
                sendReminders(true, purchaseOrderID, tranID, pageLink);

                // Update the Reminders Sent field on the Approval Request record
                updateReminderSentField(approvalRequestID, 2);
            }
        }

        log.debug("Running", "All finished!");
    }
    catch(error)
    {
        handleError(error);
    }
}

// Get the Approval Requests to send reminders
function getApprovalRequests()
{
    let approvalRequestData = [];

    // Search for the Purchase Order
    let approvalRequestSearch = search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters:
        [
            [constants.APPROVAL_REQUEST.FIELDS.VENDOR_ANSWERED_ORIGINAL_REQUEST, "is", "F"],
            "AND",
            [constants.APPROVAL_REQUEST.FIELDS.DATE, "onorbefore", "hoursago24"],
            "AND",
            [constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT, "lessthanorequalto", 2],
            "AND",
            ["custrecord_mw_purchase_order.mainline","is","T"]
        ],
        columns:
        [
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.INTERNALID }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.DATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PAGE_LINK }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TRANID, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.VENDOR }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.DATE, function: "ageInHours" })
        ]
    });

    approvalRequestSearch.run().each(function(result) {

        let approvalRequestDataObj = {};

        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.INTERNALID] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.INTERNALID);
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.DATE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.DATE);
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.PAGE_LINK] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PAGE_LINK);
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.REMINDERS_SENT] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT) || 0;
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.PURCHASE_ORDER] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER);
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.PO_TRANID] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.TRANID, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.VENDOR] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR);
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.AGE_IN_HOURS] = result.getValue({ name: constants.APPROVAL_REQUEST.FIELDS.DATE, function: "ageInHours" });

        approvalRequestData.push(approvalRequestDataObj);

        return true;
    });

    return approvalRequestData;
}

// Send the reminder email
function sendReminders(pIsSecondReminder, pPurchaseOrderID, pTranID, pPageLink)
{
    // Get the Purchase Order PDF
    let purchaseOrderPDF =  render.transaction({
        entityId: Number(pPurchaseOrderID),
        printMode: render.PrintMode.PDF
    });

    // Merge the email
    let emailRender = render.mergeEmail({
        transactionId : pPurchaseOrderID, 
        templateId : constants.EMAIL_TEMPLATES.REMINDER
    });

    // Set the subject and body
    let subject = emailRender.subject;
    subject = subject.replace("_tranid_", pTranID);
    let body = emailRender.body;
    body = body.replace("_page_link_", pPageLink);

    log.debug("Email Body", emailRender.body);
    log.debug("Email Subject", emailRender.subject);

    let cc = [];
    if (pIsSecondReminder)
    {
        cc = constants.CC_REMINDERS;
    }

    // Send the email
    email.send({
        author: 6151,
        recipients: [ "roy.cordero@midware.net" ],
        cc: cc,
        subject: subject,
        body: body,
        attachments: [ purchaseOrderPDF ],
        relatedRecords: {
            transactionId: Number(pPurchaseOrderID)
        }
    });

    log.debug("Email Sent", "Email Sent");
}

// Update the Reminders Sent field on the Approval Request record
function updateReminderSentField(pApprovalRequestID, pQuantity)
{
    record.submitFields({
        type: constants.APPROVAL_REQUEST.ID,
        id: pApprovalRequestID,
        values: {
            [constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT] : pQuantity
        }
    });
}

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
