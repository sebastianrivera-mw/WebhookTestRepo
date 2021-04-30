/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/search", "N/email", "N/render", "N/record", "../Global/Constants"], function (require, exports, log, search, email, render, record, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function execute(pContext) {
        try {
            log.debug("Running", "Starting process!");
            var approvalRequests = getApprovalRequests();
            log.debug("Approval Requests", "Quantity of Records: " + approvalRequests.length);
            for (var i = 0; i < approvalRequests.length; i++) {
                var approvalRequest = approvalRequests[i];
                var approvalRequestID = approvalRequest[constants.APPROVAL_REQUEST_OBJECT.INTERNALID];
                var ageInHours = approvalRequest[constants.APPROVAL_REQUEST_OBJECT.AGE_IN_HOURS];
                var remindersSent = approvalRequest[constants.APPROVAL_REQUEST_OBJECT.REMINDERS_SENT];
                var purchaseOrderID = Number(approvalRequest[constants.APPROVAL_REQUEST_OBJECT.PURCHASE_ORDER]);
                var tranID = approvalRequest[constants.APPROVAL_REQUEST_OBJECT.PO_TRANID];
                var pageLink = approvalRequest[constants.APPROVAL_REQUEST_OBJECT.PAGE_LINK];
                log.debug("ageInHours", ageInHours);
                log.debug("remindersSent", remindersSent);
                log.debug("purchaseOrderID", purchaseOrderID);
                log.debug("tranID", tranID);
                log.debug("pageLink", pageLink);
                if (ageInHours < 72 && remindersSent == 0) {
                    // Send the reminder email
                    sendReminders(false, purchaseOrderID, tranID, pageLink);
                    // Update the Reminders Sent field on the Approval Request record
                    updateReminderSentField(approvalRequestID, 1);
                }
                else if (ageInHours > 72 && remindersSent == 1) {
                    // Send the reminder email
                    sendReminders(true, purchaseOrderID, tranID, pageLink);
                    // Update the Reminders Sent field on the Approval Request record
                    updateReminderSentField(approvalRequestID, 2);
                }
            }
            log.debug("Running", "All finished!");
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.execute = execute;
    // Get the Approval Requests to send reminders
    function getApprovalRequests() {
        var approvalRequestData = [];
        // Search for the Purchase Order
        var approvalRequestSearch = search.create({
            type: constants.APPROVAL_REQUEST.ID,
            filters: [
                [constants.APPROVAL_REQUEST.FIELDS.VENDOR_ANSWERED_ORIGINAL_REQUEST, "is", "F"],
                "AND",
                [constants.APPROVAL_REQUEST.FIELDS.DATE, "onorbefore", "hoursago24"],
                "AND",
                [constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT, "lessthanorequalto", 2],
                "AND",
                ["custrecord_mw_purchase_order.mainline", "is", "T"]
            ],
            columns: [
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
        approvalRequestSearch.run().each(function (result) {
            var approvalRequestDataObj = {};
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
    function sendReminders(pIsSecondReminder, pPurchaseOrderID, pTranID, pPageLink) {
        // Get the Purchase Order PDF
        var purchaseOrderPDF = render.transaction({
            entityId: Number(pPurchaseOrderID),
            printMode: render.PrintMode.PDF
        });
        // Merge the email
        var emailRender = render.mergeEmail({
            transactionId: pPurchaseOrderID,
            templateId: constants.EMAIL_TEMPLATES.REMINDER
        });
        // Set the subject and body
        var subject = emailRender.subject;
        subject = subject.replace("_tranid_", pTranID);
        var body = emailRender.body;
        body = body.replace("_page_link_", pPageLink);
        log.debug("Email Body", emailRender.body);
        log.debug("Email Subject", emailRender.subject);
        var cc = [];
        if (pIsSecondReminder) {
            cc = constants.CC_REMINDERS;
        }
        // Send the email
        email.send({
            author: 6151,
            recipients: ["roy.cordero@midware.net"],
            cc: cc,
            subject: subject,
            body: body,
            attachments: [purchaseOrderPDF],
            relatedRecords: {
                transactionId: Number(pPurchaseOrderID)
            }
        });
        log.debug("Email Sent", "Email Sent");
    }
    // Update the Reminders Sent field on the Approval Request record
    function updateReminderSentField(pApprovalRequestID, pQuantity) {
        var _a;
        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: pApprovalRequestID,
            values: (_a = {},
                _a[constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT] = pQuantity,
                _a)
        });
    }
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
