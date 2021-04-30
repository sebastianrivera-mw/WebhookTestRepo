/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/record", "N/search", "N/render", "N/email", "N/url", "N/https", "../Global/Constants", "../Global/Functions"], function (require, exports, log, record, search, render, email, url, https, constants, functions) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function afterSubmit(pContext) {
        try {
            log.debug("Running", "Running afterSubmit");
            if (pContext.type === pContext.UserEventType.EDIT || pContext.type === pContext.UserEventType.XEDIT) {
                var oldApproved = pContext.oldRecord.getValue(constants.APPROVAL_REQUEST.FIELDS.APPROVED);
                var newApproved = pContext.newRecord.getValue(constants.APPROVAL_REQUEST.FIELDS.APPROVED);
                if (!oldApproved && newApproved) {
                    var approvalRequestData = search.lookupFields({
                        type: constants.APPROVAL_REQUEST.ID,
                        id: pContext.newRecord.id,
                        columns: [
                            constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER,
                            constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED,
                            constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE,
                            constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE
                        ]
                    });
                    var purchaseOrderID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER][0].value;
                    log.debug("Updating", "Updating Purchase Order ID: " + JSON.stringify(purchaseOrderID));
                    var shipDate = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE];
                    log.debug("Updating", "Ship Date: " + shipDate);
                    var approvalRequestLines = getApprovalRequestLines(pContext.newRecord.id);
                    log.debug("Updating", "approvalRequestLines: " + JSON.stringify(approvalRequestLines));
                    var purchaseOrder = record.load({ type: record.Type.PURCHASE_ORDER, id: purchaseOrderID });
                    var isReplacement = purchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT);
                    // Update the lines of the Purchase Order
                    updatePurchaseOrderData(purchaseOrder, isReplacement, shipDate, approvalRequestLines);
                    // Check if the PI File was already uploaded
                    var PIFileUploaded = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
                    log.debug("PIFileUploaded", PIFileUploaded);
                    // Check if it is on Vendor or TOV side
                    var vendorOrTOVSide = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
                    log.debug("vendorOrTOVSide", vendorOrTOVSide);
                    // Send notification email to Vendor
                    sendNotificationEmail(pContext.newRecord.id, isReplacement, PIFileUploaded, vendorOrTOVSide);
                    log.debug("Finished", "Finished!");
                }
            }
            return true;
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.afterSubmit = afterSubmit;
    // Get the lines related to the Approval Request
    function getApprovalRequestLines(pApprovalRequestID) {
        var approvalRequestLines = [];
        // Search for the Purchase Order
        var approvalRequestSearch = search.create({
            type: constants.APPROVAL_REQUEST_LINES.ID,
            filters: [
                [constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST, search.Operator.ANYOF, [pApprovalRequestID]]
            ],
            columns: [
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.INTERNALID }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE })
            ]
        });
        approvalRequestSearch.run().each(function (result) {
            var approvalRequestLine = {};
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
    function updatePurchaseOrderData(pPurchaseOrder, pIsReplacement, pShipDate, pApprovalRequestLines) {
        log.debug("Update Line", "Update Line");
        // Set the data on the lines
        var lineCount = pPurchaseOrder.getLineCount({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID });
        for (var i = 0; i < lineCount; i++) {
            var purchaseOrderLineKey = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY, line: i });
            for (var j = 0; j < pApprovalRequestLines.length; j++) {
                var objectLineKey = pApprovalRequestLines[j][constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY];
                if (purchaseOrderLineKey == objectLineKey) {
                    var quantity = Number(pApprovalRequestLines[j][constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY]);
                    var purchasePrice = Number(pApprovalRequestLines[j][constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE]);
                    var originalTotal = quantity * purchasePrice;
                    var rate = pApprovalRequestLines[j][constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE];
                    var cbm = pApprovalRequestLines[j][constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM];
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
        var statusToSet = pIsReplacement ? constants.PURCHASE_ORDER_STATUSES.APPROVED : constants.PURCHASE_ORDER_STATUSES.PENDING_LOAD_PLAN;
        pPurchaseOrder.setValue(constants.PURCHASE_ORDER.FIELDS.STATUS, statusToSet);
        pPurchaseOrder.save();
        ///////////////////////////////////// Added by Bryan Badilla 22/03/2021 /////////////////////////////////////////////////////////////////////////////
        var suitletURL = url.resolveScript({
            scriptId: constants.SCRIPTS.UPDATE_PO_APPROVED.ID,
            deploymentId: constants.SCRIPTS.UPDATE_PO_APPROVED.DEPLOY,
            returnExternalUrl: true,
            params: { idPO: pPurchaseOrder.id }
        });
        log.debug("PO ID", pPurchaseOrder.id);
        log.debug("URL", suitletURL);
        var response = https.request({
            method: https.Method.POST,
            url: suitletURL,
        });
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }
    // Send notification email to Vendor
    function sendNotificationEmail(pApprovalRequestID, pIsReplacement, pPIFileUploaded, pVendorOrTOVSide) {
        log.debug("Sending email", "Sending email");
        // Add attachments
        var purchaseOrderID = search.lookupFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: pApprovalRequestID,
            columns: [
                constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER
            ]
        })[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER][0].value;
        // Get the data of the Purchase Order
        var purchaseOrderData = search.lookupFields({
            type: search.Type.PURCHASE_ORDER,
            id: purchaseOrderID,
            columns: [
                constants.PURCHASE_ORDER.FIELDS.VENDOR,
                constants.PURCHASE_ORDER.FIELDS.LOCATION
            ]
        });
        var vendorID = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR] ? purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR][0].value : null;
        var isDropship = Number(purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.LOCATION]) === constants.LOCATIONS.DROPSHIP;
        // Get the Purchase Order PDF
        var purchaseOrderPDF = render.transaction({
            entityId: Number(purchaseOrderID),
            printMode: render.PrintMode.PDF
        });
        var attachments = [purchaseOrderPDF];
        // Get the template of the email
        var emailTemplate;
        if (pIsReplacement) {
            emailTemplate = (pVendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.TOV) ? constants.EMAIL_TEMPLATES.APPROVED_BY_TOV : constants.EMAIL_TEMPLATES.APPROVED_BY_VENDOR_TO_VENDOR;
        }
        else if (pPIFileUploaded) {
            emailTemplate = constants.EMAIL_TEMPLATES.APPROVED_BY_VENDOR_TO_VENDOR;
        }
        else {
            emailTemplate = constants.EMAIL_TEMPLATES.APPROVED_BY_TOV_PENDING_FILE;
        }
        // Merge the email
        var emailRender = render.mergeEmail({
            templateId: emailTemplate,
            customRecord: {
                type: constants.APPROVAL_REQUEST.ID,
                id: Number(pApprovalRequestID)
            }
        });
        // Set the subject and body
        var subject = emailRender.subject;
        var body = emailRender.body;
        log.debug("Email Body", emailRender.body);
        log.debug("Email Subject", emailRender.subject);
        // Get the data of the Vendor
        var vendorData = search.lookupFields({
            type: search.Type.VENDOR,
            id: vendorID,
            columns: [
                constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS,
                constants.VENDOR.FIELDS.TOV_REP
            ]
        });
        var vendorTOVRep = vendorData[constants.VENDOR.FIELDS.TOV_REP] ? vendorData[constants.VENDOR.FIELDS.TOV_REP][0].value : null;
        // Check if Vendor has access to the portal
        var vendorHasAccess = vendorData[constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS];
        // If Indian Vendor, send the data to the TOV Rep
        var isIndianVendor = Number(vendorTOVRep) === constants.GENERAL.INDIAN_VENDORS_TOV_REP;
        sendEmailToContacts(vendorID, vendorHasAccess, vendorTOVRep, isIndianVendor, purchaseOrderID, subject, body);
        // If was approved by the Vendor, send email to the PO Planner
        if ((!pIsReplacement && pPIFileUploaded) || (pIsReplacement && pVendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.VENDOR)) {
            // Merge the email
            emailRender = render.mergeEmail({
                templateId: constants.EMAIL_TEMPLATES.APPROVED_BY_VENDOR_TO_TOV,
                customRecord: {
                    type: constants.APPROVAL_REQUEST.ID,
                    id: Number(pApprovalRequestID)
                }
            });
            // Set the subject and body
            var subject_1 = emailRender.subject;
            var body_1 = emailRender.body;
            log.debug("Email Body", emailRender.body);
            log.debug("Email Subject", emailRender.subject);
            // Get the data of the Purchase Order
            var purchaseOrderData_1 = search.lookupFields({
                type: search.Type.PURCHASE_ORDER,
                id: purchaseOrderID,
                columns: [
                    constants.PURCHASE_ORDER.FIELDS.VENDOR,
                    constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO,
                    constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM,
                    constants.PURCHASE_ORDER.FIELDS.LOCATION
                ]
            });
            var vendor = purchaseOrderData_1[constants.PURCHASE_ORDER.FIELDS.VENDOR] ? purchaseOrderData_1[constants.PURCHASE_ORDER.FIELDS.VENDOR][0].value : null;
            var isRenegade = purchaseOrderData_1[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO];
            var customForm = purchaseOrderData_1[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM] && purchaseOrderData_1[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM][0] ? purchaseOrderData_1[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM][0].value : null;
            var isPartsOrder = String(customForm) === constants.FORMS.PARTS_ORDER;
            var isDropship_1 = Number(purchaseOrderData_1[constants.PURCHASE_ORDER.FIELDS.LOCATION]) === constants.LOCATIONS.DROPSHIP;
            // Get the data of the Vendor
            var vendorData_1 = search.lookupFields({
                type: search.Type.VENDOR,
                id: vendor,
                columns: [
                    constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS,
                    constants.VENDOR.FIELDS.TOV_REP
                ]
            });
            var vendorHasAccess_1 = vendorData_1[constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS];
            var vendorTOVRep_1 = vendorData_1[constants.VENDOR.FIELDS.TOV_REP] ? vendorData_1[constants.VENDOR.FIELDS.TOV_REP][0].value : null;
            var recipients = [constants.EMPLOYEES.BAILA];
            log.debug("Recipients", "Recipients: " + recipients);
            var cc = void 0;
            if (vendorHasAccess_1) {
                var modules = [constants.EMAIL_MODULES.ALL_PURCHASE_ORDERS];
                (isRenegade) ? modules.push(constants.EMAIL_MODULES.RENEGADE_PURCHASE_ORDERS) : {};
                (isPartsOrder) ? modules.push(constants.EMAIL_MODULES.PARTS_PURCHASE_ORDERS) : {};
                cc = functions.getEmailSubscribers(modules);
                if (isDropship_1) {
                    // Remove Bruce if it is a dropship order
                    cc = functions.removeElementFromArray(cc, -5);
                }
                (vendorTOVRep_1) ? cc.push(vendorTOVRep_1) : {};
            }
            else {
                cc = [];
            }
            log.debug("CC", "CC: " + cc);
            // Send the email
            email.send({
                author: constants.GENERAL.PURCHASING_EMAIL_AUTHOR,
                recipients: recipients,
                cc: cc,
                subject: subject_1,
                body: body_1,
                attachments: attachments,
                relatedRecords: {
                    transactionId: Number(purchaseOrderID)
                }
            });
            log.debug("Email Sent", "Email Sent");
        }
    }
    // Send the email to the related contacts of the Vendor
    function sendEmailToContacts(pVendorID, pVendorHasAccess, pVendorTOVRep, pIndianVendor, pPurchaseOrderID, pSubject, pBody) {
        // Get the contacts to send email
        var contacts = (pIndianVendor) ? getContactsWithRelatedEmp(pVendorTOVRep) : getContactsWithVendor(pVendorID);
        if (!pVendorHasAccess || contacts.length > 0) {
            // Send email to contacts
            var link = functions.getSuiteletURL(constants.SCRIPTS.VENDOR_PORTAL_SUITELET.ID, constants.SCRIPTS.VENDOR_PORTAL_SUITELET.DEPLOY, true);
            link += "&po=" + pPurchaseOrderID + "&page=pending-vendor";
            pBody = pBody.replace("_page_link_", link);
            // Set the recipients
            var recipients = (pVendorHasAccess) ? contacts : ["roy.cordero@midware.net", "baila@tovfurniture.com"];
            log.debug("Recipients", "Recipients: " + recipients);
            var cc = pVendorTOVRep && pVendorHasAccess ? [pVendorTOVRep] : [];
            log.debug("CC", "CC: " + cc);
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
    function getContactsWithVendor(pVendorID) {
        var contacts = [];
        if (pVendorID) {
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
    function getContactsWithRelatedEmp(pTOVRep) {
        var contacts = [];
        if (pTOVRep) {
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
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
