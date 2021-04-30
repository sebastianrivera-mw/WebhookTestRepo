/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Reinaldo Stephens Chaves
 * @contact contact@midware.net
 */

 import * as log from "N/log";
 import * as email from "N/email";
 import * as record from "N/record";
 import * as search from "N/search";
 
 import { EMAIL_MODULES_CUSTOM_RECORD, PURCHASE_ORDER_FIELDS, EMAIL_RECIPIENTS_CUSTOM_RECORD } from "../Global/Constants";
 
 const APPROVED_STATUS = "2";
 const NO_REPLY_EMPLOYEE = 5280;
 // const PURCHASE_ORDER_APPROVE_ID = "4";
 // const EMP99_SALES_T_FURNITURE = 63392;
 const APPROVE_PURCHASE_ORDER_MODULE = "14";
 
 import { EntryPoints } from "N/types";
 
 export function afterSubmit(pContext: EntryPoints.UserEvent.afterSubmitContext) {
     try {
         log.audit("<After Submit>", pContext.type);
 
         if (pContext.type !== pContext.UserEventType.DELETE) {
             let newPurchaseOrderRecord = pContext.newRecord;

             log.debug("Purchase Record", newPurchaseOrderRecord);
 
             let isXEditContext = pContext.type === pContext.UserEventType.XEDIT;
 
             let beforeCheckValues = checkIfItsNecessaryToSendEmail(isXEditContext, newPurchaseOrderRecord);

             log.debug("Before Check Values", beforeCheckValues);
 
             if (!isReplacementOrder(newPurchaseOrderRecord, beforeCheckValues.purchaseOrderValues)) {
                 log.audit("Purchase Order Record", newPurchaseOrderRecord.id ? newPurchaseOrderRecord.id : "");
 
                 let approved = pContext.type === pContext.UserEventType.APPROVE;
 
                 let purchaseOrderApprovedEmailSent = beforeCheckValues.purchaseOrderApprovedEmailSent;
                 log.debug("purchaseOrderApprovedEmailSent", purchaseOrderApprovedEmailSent)
 
                 if (!purchaseOrderApprovedEmailSent) {
                     if (!approved) approved = isPurchaseOrderApproved(newPurchaseOrderRecord, beforeCheckValues.purchaseOrderValues);
 
                     if (approved) {
                         // Purchase Order APPROVED
 
                         let purchaseOrderData = getPurchaseOrderData(newPurchaseOrderRecord, beforeCheckValues.purchaseOrderValues);
 
                         let moduleValues = getPurchaseOrderApprovedEmailModuleInfo();
 
                         if (moduleValues && Object.keys(moduleValues).length) {
                             let filterByLocation = moduleValues[EMAIL_MODULES_CUSTOM_RECORD.FILTER_BY_LOCATION];
                             let showAttachments = moduleValues[EMAIL_MODULES_CUSTOM_RECORD.SHOW_SEND_ATTACHMENTS_COLUMN];
 
                             sendPOApprovedEmail(
                                 purchaseOrderData.tranId,
                                 newPurchaseOrderRecord.id,
                                 filterByLocation,
                                 showAttachments,
                                 purchaseOrderData.poLocation
                             );
                         } else {
                             log.audit("Skipped", "Not Approved or Email Already Sent");
                         }
                     } else {
                         log.audit("Skipped", "Purchase Order Not Approved");
                     }
                 } else {
                     log.audit("Skipped", "Purchase Order Approved Email has already been sent.");
                 }
             }
         }
 
         log.audit("<After Submit>", "END");
     } catch (error) {
         handleError(error);
     }
 }
 
 function isReplacementOrder(pNewPurchaseOrderRecord: record.Record, pPurchaseOrderValues) {
    log.audit("is Replacement Order", "FUNCTION");

    log.audit("Values", pNewPurchaseOrderRecord+"      "+pPurchaseOrderValues);
     let isReplacementOrder = false;

     if (pNewPurchaseOrderRecord.getValue({ fieldId: PURCHASE_ORDER_FIELDS.PARENT_PO })) {
        log.debug("pNewPurchaseOrderRecord", pNewPurchaseOrderRecord.getValue({ fieldId: PURCHASE_ORDER_FIELDS.PARENT_PO }))
         isReplacementOrder = true;
     } else if (pPurchaseOrderValues) {
        log.debug("pPurchaseOrderValues",  pPurchaseOrderValues[PURCHASE_ORDER_FIELDS.PARENT_PO])
         isReplacementOrder = pPurchaseOrderValues[PURCHASE_ORDER_FIELDS.PARENT_PO].length > 0 ? true : false;
     }
     log.debug("Value of isReplacement", isReplacementOrder);
     return isReplacementOrder;
 }
 
 function checkIfItsNecessaryToSendEmail(pIsXEditContext, pNewPurchaseOrderRecord: record.Record) {
     let purchaseOrderApprovedEmailSent = false;
 
     let purchaseOrderValues = undefined;
 
     if (pIsXEditContext) {
         purchaseOrderValues = search.lookupFields({
             id: pNewPurchaseOrderRecord.id.toString(),
             type: search.Type.PURCHASE_ORDER,
             columns: [
                 PURCHASE_ORDER_FIELDS.APPROVAL_STATUS,
                 PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVAL_STATUS,
                 PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVED_EMAIL_SENT,
                 PURCHASE_ORDER_FIELDS.TRANID,
                 PURCHASE_ORDER_FIELDS.LOCATION,
                 PURCHASE_ORDER_FIELDS.PARENT_PO,
             ],
         });

         log.debug("purchaseOrderValues", purchaseOrderValues);
 
         if (purchaseOrderValues) {
             purchaseOrderApprovedEmailSent = Boolean(purchaseOrderValues[PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVED_EMAIL_SENT]);
         }
     } else {
         let purchaseOrderApprovedEmailSentFieldValue = pNewPurchaseOrderRecord.getValue({
             fieldId: PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVED_EMAIL_SENT,
         });
 
         if (purchaseOrderApprovedEmailSentFieldValue) purchaseOrderApprovedEmailSent = true;
     }
 
     return { purchaseOrderValues, purchaseOrderApprovedEmailSent };
 }
 
 function getPurchaseOrderApprovedEmailModuleInfo() {
     return search.lookupFields({
         id: APPROVE_PURCHASE_ORDER_MODULE,
         type: EMAIL_MODULES_CUSTOM_RECORD.TYPE,
         columns: [EMAIL_MODULES_CUSTOM_RECORD.SHOW_SEND_ATTACHMENTS_COLUMN, EMAIL_MODULES_CUSTOM_RECORD.FILTER_BY_LOCATION],
     });
 }
 
 function sendPOApprovedEmail(pPurchaseNumber, pNewPurchaseOrderRecordId, pFilterByLocation, pShowAttachments, pPurchaseOrderLocation) {
     log.debug("SEND EMAIL", "SEND EMAIL");
     let emailSubject = `PO # ${pPurchaseNumber} has been approved`;
 
     let emailBody = `<p>Hi,</p></br></br><p>Please note that PO # ${pPurchaseNumber} has been approved for production. It is time to now place parts orders against this PO and collect the proper load plans.</p></br></br><p>Regards.</p>`;
 
     let recipientsEmails = getEmailRecipientSubscriptions(pFilterByLocation, pPurchaseOrderLocation);

     log.debug("Recipients Emails", recipientsEmails);
 
     if (recipientsEmails.length > 0) {
         email.send({ author: NO_REPLY_EMPLOYEE, recipients: ["bryan.badilla@midware.net"], subject: emailSubject, body: emailBody });
 
         let newValues = {};
         newValues[PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVED_EMAIL_SENT] = true;
 
         record.submitFields({ id: pNewPurchaseOrderRecordId, type: record.Type.PURCHASE_ORDER, values: newValues });
     } else {
         log.audit("Email Not Sent", "No Recipients Found");
     }
 }
 
 function getEmailRecipientSubscriptions(pFilterByLocation, pPurchaseOrderLocation) {
     let recipientsEmails: any = [];
     log.debug("Params", pFilterByLocation +"       "+ pPurchaseOrderLocation )
 
     let filters = [
         [EMAIL_RECIPIENTS_CUSTOM_RECORD.MODULE, search.Operator.ANYOF, APPROVE_PURCHASE_ORDER_MODULE],
         "AND",
         ["isinactive", search.Operator.IS, "F"],
     ];
 
     if (pFilterByLocation) {
         filters.push("AND");
         filters.push([EMAIL_RECIPIENTS_CUSTOM_RECORD.LOCATION, search.Operator.ANYOF, pPurchaseOrderLocation]);
     }
 
     var customrecord_mw_email_recipientsSearchObj = search.create({
         type: EMAIL_RECIPIENTS_CUSTOM_RECORD.TYPE,
         filters: filters,
         columns: [
             search.createColumn({ name: EMAIL_RECIPIENTS_CUSTOM_RECORD.MODULE, label: "Module" }),
             search.createColumn({ name: EMAIL_RECIPIENTS_CUSTOM_RECORD.EMPLOYEE, label: "Employee" }),
             search.createColumn({ name: EMAIL_RECIPIENTS_CUSTOM_RECORD.EMAIL, label: "Email" }),
             search.createColumn({ name: EMAIL_RECIPIENTS_CUSTOM_RECORD.SEND_ATTACHMENTS, label: "Send Attachments" }),
             search.createColumn({ name: EMAIL_RECIPIENTS_CUSTOM_RECORD.IS_EMPLOYEE, label: "Is Employee" }),
             search.createColumn({ name: EMAIL_RECIPIENTS_CUSTOM_RECORD.IS_EMAIL, label: "Is Email" }),
         ],
     });
     let searchResultCount = customrecord_mw_email_recipientsSearchObj.runPaged().count;

     log.debug("Count", searchResultCount)
     customrecord_mw_email_recipientsSearchObj.run().each((result) => {
         // .run().each has a limit of 4,000 results

         log.debug("Results", result)
 
         let employeeId = result.getValue({ name: EMAIL_RECIPIENTS_CUSTOM_RECORD.EMPLOYEE });
         let emailAddress = result.getValue({ name: EMAIL_RECIPIENTS_CUSTOM_RECORD.EMAIL });
 
         let isEmployee = result.getValue({ name: EMAIL_RECIPIENTS_CUSTOM_RECORD.IS_EMPLOYEE });
         let isEmail = result.getValue({ name: EMAIL_RECIPIENTS_CUSTOM_RECORD.IS_EMAIL });
 
         let currentEmail = "";
 
         if (isEmployee && employeeId) {
             if (recipientsEmails.length <= 10) recipientsEmails.push(Number(employeeId));
         } else if (isEmail && emailAddress) {
             currentEmail = emailAddress.toString();
 
             if (recipientsEmails.length <= 10) recipientsEmails.push(currentEmail);
         }
 
         return true;
     });
 
     log.audit("Subscriptions Emails", recipientsEmails);
 
     return recipientsEmails;
 }
 
 function isPurchaseOrderApproved(pNewPurchaseOrderRecord: record.Record, pPurchaseOrderValues) {
     let approved = false;
     let approvedStatus = "";
     let purchaseOrderApprovedStatus = "";
 
     if (pPurchaseOrderValues) {
         approvedStatus =
             pPurchaseOrderValues[PURCHASE_ORDER_FIELDS.APPROVAL_STATUS].length > 0
                 ? pPurchaseOrderValues[PURCHASE_ORDER_FIELDS.APPROVAL_STATUS][0].value
                 : "";
 
         purchaseOrderApprovedStatus =
             pPurchaseOrderValues[PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVAL_STATUS].length > 0
                 ? pPurchaseOrderValues[PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVAL_STATUS][0].value
                 : "";
     } else {
         let approvedStatusFieldValue = pNewPurchaseOrderRecord.getValue({ fieldId: PURCHASE_ORDER_FIELDS.APPROVAL_STATUS });
 
         approvedStatus = approvedStatusFieldValue ? approvedStatusFieldValue.toString() : "";
 
         let purchaseOrderApprovedStatusFieldValue = pNewPurchaseOrderRecord.getValue({
             fieldId: PURCHASE_ORDER_FIELDS.PURCHASE_ORDER_APPROVAL_STATUS,
         });
 
         purchaseOrderApprovedStatus = purchaseOrderApprovedStatusFieldValue ? purchaseOrderApprovedStatusFieldValue.toString() : "";
     }
 
     log.audit("Purchase Order Data", `Approval Status: ${approvedStatus}, Purchase Order Approve Status: ${purchaseOrderApprovedStatus}`);
 
     if (approvedStatus) {
         if (approvedStatus == APPROVED_STATUS) {
             approved = true;
         }
     }
 
     return approved;
 }
 
 function getPurchaseOrderData(pNewPurchaseOrderRecord: record.Record, pPurchaseOrderValues) {
     let tranId = "";
     let poLocation = "";
 
     if (pPurchaseOrderValues) {
         tranId = pPurchaseOrderValues[PURCHASE_ORDER_FIELDS.TRANID];
 
         poLocation =
             pPurchaseOrderValues[PURCHASE_ORDER_FIELDS.LOCATION].length > 0
                 ? pPurchaseOrderValues[PURCHASE_ORDER_FIELDS.LOCATION][0].value
                 : "";
     } else {
         let locationFieldValue = pNewPurchaseOrderRecord.getValue({
             fieldId: PURCHASE_ORDER_FIELDS.LOCATION,
         });
 
         poLocation = locationFieldValue ? locationFieldValue.toString() : "";
 
         tranId = pNewPurchaseOrderRecord.getValue({ fieldId: PURCHASE_ORDER_FIELDS.TRANID })
             ? pNewPurchaseOrderRecord.getValue({ fieldId: PURCHASE_ORDER_FIELDS.TRANID }).toString()
             : "";
     }
 
     log.audit("Purchase Order Data", `Location ${poLocation},Tranid: ${tranId}`);
 
     return { tranId, poLocation };
 }
 
 function areReplacementOrdersApproved(pPurchaseOrderId) {
     let approved = true;
 
     let purchaseorderSearchObj = search.create({
         type: search.Type.PURCHASE_ORDER,
         filters: [
             ["type", search.Operator.ANYOF, "PurchOrd"],
             "AND",
             [PURCHASE_ORDER_FIELDS.PARENT_PO, search.Operator.ANYOF, pPurchaseOrderId],
             "AND",
             ["mainline", search.Operator.IS, "T"],
         ],
         columns: [
             search.createColumn({ name: "internalid", label: "Internal ID" }),
             search.createColumn({ name: PURCHASE_ORDER_FIELDS.APPROVAL_STATUS, label: "Approval Status" }),
         ],
     });
 
     purchaseorderSearchObj.run().each((result) => {
         // .run().each has a limit of 4,000 results
 
         let replacementOrderInternalId = result.id;
         let replacementOrderApprovalStatus = "";
         let replacementOrderApprovalStatusFieldValue = result.getValue({ name: PURCHASE_ORDER_FIELDS.APPROVAL_STATUS });
 
         if (replacementOrderApprovalStatusFieldValue) {
             replacementOrderApprovalStatus = replacementOrderApprovalStatusFieldValue.toString();
 
             if (replacementOrderApprovalStatus !== APPROVED_STATUS) {
                 approved = false;
 
                 log.audit("Replacement Order Not Approved", `Internal Id: ${replacementOrderInternalId}`);
             } else {
                 log.audit("Replacement Order Approved", `Internal Id: ${replacementOrderInternalId}`);
             }
         }
 
         return true;
     });
 
     return approved;
 }
 
 function handleError(pError: Error) {
     log.error({ title: "Error", details: pError.message });
 
     log.error({ title: "Stack", details: JSON.stringify(pError) });
 }
