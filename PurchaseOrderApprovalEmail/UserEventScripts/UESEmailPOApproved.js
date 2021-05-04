/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Reinaldo Stephens Chaves
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/email", "N/record", "N/search", "../Global/Constants"], function (require, exports, log, email, record, search, Constants_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var APPROVED_STATUS = "2";
    var NO_REPLY_EMPLOYEE = 5280;
    // const PURCHASE_ORDER_APPROVE_ID = "4";
    // const EMP99_SALES_T_FURNITURE = 63392;
    var APPROVE_PURCHASE_ORDER_MODULE = "14";
    function afterSubmit(pContext) {
        try {
            log.audit("<After Submit>", pContext.type);
            if (pContext.type !== pContext.UserEventType.DELETE) {
                var newPurchaseOrderRecord = pContext.newRecord;
                log.debug("Purchase Record", newPurchaseOrderRecord);
                var isXEditContext = pContext.type === pContext.UserEventType.XEDIT;
                var beforeCheckValues = checkIfItsNecessaryToSendEmail(isXEditContext, newPurchaseOrderRecord);
                log.debug("Before Check Values", beforeCheckValues);
                if (!isReplacementOrder(newPurchaseOrderRecord, beforeCheckValues.purchaseOrderValues)) {
                    log.audit("Purchase Order Record", newPurchaseOrderRecord.id ? newPurchaseOrderRecord.id : "");
                    var approved = pContext.type === pContext.UserEventType.APPROVE;
                    var purchaseOrderApprovedEmailSent = beforeCheckValues.purchaseOrderApprovedEmailSent;
                    log.debug("purchaseOrderApprovedEmailSent", purchaseOrderApprovedEmailSent);
                    if (!purchaseOrderApprovedEmailSent) {
                        if (!approved)
                            approved = isPurchaseOrderApproved(newPurchaseOrderRecord, beforeCheckValues.purchaseOrderValues);
                        if (approved) {
                            // Purchase Order APPROVED
                            var purchaseOrderData = getPurchaseOrderData(newPurchaseOrderRecord, beforeCheckValues.purchaseOrderValues);
                            var moduleValues = getPurchaseOrderApprovedEmailModuleInfo();
                            if (moduleValues && Object.keys(moduleValues).length) {
                                var filterByLocation = moduleValues[Constants_1.EMAIL_MODULES_CUSTOM_RECORD.FILTER_BY_LOCATION];
                                var showAttachments = moduleValues[Constants_1.EMAIL_MODULES_CUSTOM_RECORD.SHOW_SEND_ATTACHMENTS_COLUMN];
                                sendPOApprovedEmail(purchaseOrderData.tranId, newPurchaseOrderRecord.id, filterByLocation, showAttachments, purchaseOrderData.poLocation);
                            }
                            else {
                                log.audit("Skipped", "Not Approved or Email Already Sent");
                            }
                        }
                        else {
                            log.audit("Skipped", "Purchase Order Not Approved");
                        }
                    }
                    else {
                        log.audit("Skipped", "Purchase Order Approved Email has already been sent.");
                    }
                }
            }
            log.audit("<After Submit>", "END");
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.afterSubmit = afterSubmit;
    function isReplacementOrder(pNewPurchaseOrderRecord, pPurchaseOrderValues) {
        log.audit("is Replacement Order", "FUNCTION");
        log.audit("Values", pNewPurchaseOrderRecord + "      " + pPurchaseOrderValues);
        var isReplacementOrder = false;
        if (pNewPurchaseOrderRecord.getValue({ fieldId: Constants_1.PURCHASE_ORDER_FIELDS.PARENT_PO })) {
            log.debug("pNewPurchaseOrderRecord", pNewPurchaseOrderRecord.getValue({ fieldId: Constants_1.PURCHASE_ORDER_FIELDS.PARENT_PO }));
            isReplacementOrder = true;
        }
        else if (pPurchaseOrderValues) {
            log.debug("pPurchaseOrderValues", pPurchaseOrderValues[Constants_1.PURCHASE_ORDER_FIELDS.PARENT_PO]);
            isReplacementOrder = pPurchaseOrderValues[Constants_1.PURCHASE_ORDER_FIELDS.PARENT_PO].length > 0 ? true : false;
        }
        log.debug("Value of isReplacement", isReplacementOrder);
        return isReplacementOrder;
    }
    function checkIfItsNecessaryToSendEmail(pIsXEditContext, pNewPurchaseOrderRecord) {
        var purchaseOrderApprovedEmailSent = false;
        var purchaseOrderValues = undefined;
        if (pIsXEditContext) {
            purchaseOrderValues = search.lookupFields({
                id: pNewPurchaseOrderRecord.id.toString(),
                type: search.Type.PURCHASE_ORDER,
                columns: [
                    Constants_1.PURCHASE_ORDER_FIELDS.APPROVAL_STATUS,
                    Constants_1.PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVAL_STATUS,
                    Constants_1.PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVED_EMAIL_SENT,
                    Constants_1.PURCHASE_ORDER_FIELDS.TRANID,
                    Constants_1.PURCHASE_ORDER_FIELDS.LOCATION,
                    Constants_1.PURCHASE_ORDER_FIELDS.PARENT_PO,
                ],
            });
            log.debug("purchaseOrderValues", purchaseOrderValues);
            if (purchaseOrderValues) {
                purchaseOrderApprovedEmailSent = Boolean(purchaseOrderValues[Constants_1.PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVED_EMAIL_SENT]);
            }
        }
        else {
            var purchaseOrderApprovedEmailSentFieldValue = pNewPurchaseOrderRecord.getValue({
                fieldId: Constants_1.PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVED_EMAIL_SENT,
            });
            if (purchaseOrderApprovedEmailSentFieldValue)
                purchaseOrderApprovedEmailSent = true;
        }
        return { purchaseOrderValues: purchaseOrderValues, purchaseOrderApprovedEmailSent: purchaseOrderApprovedEmailSent };
    }
    function getPurchaseOrderApprovedEmailModuleInfo() {
        return search.lookupFields({
            id: APPROVE_PURCHASE_ORDER_MODULE,
            type: Constants_1.EMAIL_MODULES_CUSTOM_RECORD.TYPE,
            columns: [Constants_1.EMAIL_MODULES_CUSTOM_RECORD.SHOW_SEND_ATTACHMENTS_COLUMN, Constants_1.EMAIL_MODULES_CUSTOM_RECORD.FILTER_BY_LOCATION],
        });
    }
    function sendPOApprovedEmail(pPurchaseNumber, pNewPurchaseOrderRecordId, pFilterByLocation, pShowAttachments, pPurchaseOrderLocation) {
        log.debug("SEND EMAIL", "SEND EMAIL");
        var emailSubject = "PO # " + pPurchaseNumber + " has been approved";
        var emailBody = "<p>Hi,</p></br></br><p>Please note that PO # " + pPurchaseNumber + " has been approved for production. It is time to now place parts orders against this PO and collect the proper load plans.</p></br></br><p>Regards.</p>";
        var recipientsEmails = getEmailRecipientSubscriptions(pFilterByLocation, pPurchaseOrderLocation);
        log.debug("Recipients Emails", recipientsEmails);
        if (recipientsEmails.length > 0) {
            email.send({ author: NO_REPLY_EMPLOYEE, recipients: ["bryan.badilla@midware.net"], subject: emailSubject, body: emailBody });
            var newValues = {};
            newValues[Constants_1.PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVED_EMAIL_SENT] = true;
            record.submitFields({ id: pNewPurchaseOrderRecordId, type: record.Type.PURCHASE_ORDER, values: newValues });
        }
        else {
            log.audit("Email Not Sent", "No Recipients Found");
        }
    }
    function getEmailRecipientSubscriptions(pFilterByLocation, pPurchaseOrderLocation) {
        var recipientsEmails = [];
        log.debug("Params", pFilterByLocation + "       " + pPurchaseOrderLocation);
        var filters = [
            [Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.MODULE, search.Operator.ANYOF, APPROVE_PURCHASE_ORDER_MODULE],
            "AND",
            ["isinactive", search.Operator.IS, "F"],
        ];
        if (pFilterByLocation) {
            filters.push("AND");
            filters.push([Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.LOCATION, search.Operator.ANYOF, pPurchaseOrderLocation]);
        }
        var customrecord_mw_email_recipientsSearchObj = search.create({
            type: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.TYPE,
            filters: filters,
            columns: [
                search.createColumn({ name: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.MODULE, label: "Module" }),
                search.createColumn({ name: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.EMPLOYEE, label: "Employee" }),
                search.createColumn({ name: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.EMAIL, label: "Email" }),
                search.createColumn({ name: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.SEND_ATTACHMENTS, label: "Send Attachments" }),
                search.createColumn({ name: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.IS_EMPLOYEE, label: "Is Employee" }),
                search.createColumn({ name: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.IS_EMAIL, label: "Is Email" }),
            ],
        });
        var searchResultCount = customrecord_mw_email_recipientsSearchObj.runPaged().count;
        log.debug("Count", searchResultCount);
        customrecord_mw_email_recipientsSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            log.debug("Results", result);
            var employeeId = result.getValue({ name: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.EMPLOYEE });
            var emailAddress = result.getValue({ name: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.EMAIL });
            var isEmployee = result.getValue({ name: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.IS_EMPLOYEE });
            var isEmail = result.getValue({ name: Constants_1.EMAIL_RECIPIENTS_CUSTOM_RECORD.IS_EMAIL });
            var currentEmail = "";
            if (isEmployee && employeeId) {
                if (recipientsEmails.length <= 10)
                    recipientsEmails.push(Number(employeeId));
            }
            else if (isEmail && emailAddress) {
                currentEmail = emailAddress.toString();
                if (recipientsEmails.length <= 10)
                    recipientsEmails.push(currentEmail);
            }
            return true;
        });
        log.audit("Subscriptions Emails", recipientsEmails);
        return recipientsEmails;
    }
    function isPurchaseOrderApproved(pNewPurchaseOrderRecord, pPurchaseOrderValues) {
        var approved = false;
        var approvedStatus = "";
        var purchaseOrderApprovedStatus = "";
        if (pPurchaseOrderValues) {
            approvedStatus =
                pPurchaseOrderValues[Constants_1.PURCHASE_ORDER_FIELDS.APPROVAL_STATUS].length > 0
                    ? pPurchaseOrderValues[Constants_1.PURCHASE_ORDER_FIELDS.APPROVAL_STATUS][0].value
                    : "";
            purchaseOrderApprovedStatus =
                pPurchaseOrderValues[Constants_1.PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVAL_STATUS].length > 0
                    ? pPurchaseOrderValues[Constants_1.PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVAL_STATUS][0].value
                    : "";
        }
        else {
            var approvedStatusFieldValue = pNewPurchaseOrderRecord.getValue({ fieldId: Constants_1.PURCHASE_ORDER_FIELDS.APPROVAL_STATUS });
            approvedStatus = approvedStatusFieldValue ? approvedStatusFieldValue.toString() : "";
            var purchaseOrderApprovedStatusFieldValue = pNewPurchaseOrderRecord.getValue({
                fieldId: Constants_1.PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVAL_STATUS,
            });
            purchaseOrderApprovedStatus = purchaseOrderApprovedStatusFieldValue ? purchaseOrderApprovedStatusFieldValue.toString() : "";
        }
        log.audit("Purchase Order Data", "Approval Status: " + approvedStatus + ", Purchase Order Approve Status: " + purchaseOrderApprovedStatus);
        if (approvedStatus) {
            if (approvedStatus == APPROVED_STATUS) {
                approved = true;
            }
        }
        return approved;
    }
    function getPurchaseOrderData(pNewPurchaseOrderRecord, pPurchaseOrderValues) {
        var tranId = "";
        var poLocation = "";
        if (pPurchaseOrderValues) {
            tranId = pPurchaseOrderValues[Constants_1.PURCHASE_ORDER_FIELDS.TRANID];
            poLocation =
                pPurchaseOrderValues[Constants_1.PURCHASE_ORDER_FIELDS.LOCATION].length > 0
                    ? pPurchaseOrderValues[Constants_1.PURCHASE_ORDER_FIELDS.LOCATION][0].value
                    : "";
        }
        else {
            var locationFieldValue = pNewPurchaseOrderRecord.getValue({
                fieldId: Constants_1.PURCHASE_ORDER_FIELDS.LOCATION,
            });
            poLocation = locationFieldValue ? locationFieldValue.toString() : "";
            tranId = pNewPurchaseOrderRecord.getValue({ fieldId: Constants_1.PURCHASE_ORDER_FIELDS.TRANID })
                ? pNewPurchaseOrderRecord.getValue({ fieldId: Constants_1.PURCHASE_ORDER_FIELDS.TRANID }).toString()
                : "";
        }
        log.audit("Purchase Order Data", "Location " + poLocation + ",Tranid: " + tranId);
        return { tranId: tranId, poLocation: poLocation };
    }
    function areReplacementOrdersApproved(pPurchaseOrderId) {
        var approved = true;
        var purchaseorderSearchObj = search.create({
            type: search.Type.PURCHASE_ORDER,
            filters: [
                ["type", search.Operator.ANYOF, "PurchOrd"],
                "AND",
                [Constants_1.PURCHASE_ORDER_FIELDS.PARENT_PO, search.Operator.ANYOF, pPurchaseOrderId],
                "AND",
                ["mainline", search.Operator.IS, "T"],
            ],
            columns: [
                search.createColumn({ name: "internalid", label: "Internal ID" }),
                search.createColumn({ name: Constants_1.PURCHASE_ORDER_FIELDS.APPROVAL_STATUS, label: "Approval Status" }),
            ],
        });
        purchaseorderSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            var replacementOrderInternalId = result.id;
            var replacementOrderApprovalStatus = "";
            var replacementOrderApprovalStatusFieldValue = result.getValue({ name: Constants_1.PURCHASE_ORDER_FIELDS.APPROVAL_STATUS });
            if (replacementOrderApprovalStatusFieldValue) {
                replacementOrderApprovalStatus = replacementOrderApprovalStatusFieldValue.toString();
                if (replacementOrderApprovalStatus !== APPROVED_STATUS) {
                    approved = false;
                    log.audit("Replacement Order Not Approved", "Internal Id: " + replacementOrderInternalId);
                }
                else {
                    log.audit("Replacement Order Approved", "Internal Id: " + replacementOrderInternalId);
                }
            }
            return true;
        });
        return approved;
    }
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});

