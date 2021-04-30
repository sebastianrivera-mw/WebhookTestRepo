/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/record", "N/search", "N/render", "N/email", "N/task", "N/error", "N/http", "../../Global/Constants", "../../Global/Functions"], function (require, exports, log, record, search, render, email, task, error, http, constants, functions) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRequest(pContext) {
        try {
            // Event router pattern design
            var eventMap = {};
            eventMap[http.Method.POST] = handlePost;
            eventMap[pContext.request.method] ? eventMap[pContext.request.method](pContext) : httpRequestError();
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.onRequest = onRequest;
    // Handle the post requests
    function handlePost(pContext) {
        try {
            // Get data from params
            var params = pContext.request.parameters;
            var action = params.action;
            var purchaseOrderID = params.purchaseOrderID;
            var approvalRequestID = params.approvalRequestID;
            if (action === "refresh") {
                log.debug("Refresh Portal Action", "Refresh Portal Action");
                // Refresh the data of the portal
                refreshPortal(purchaseOrderID, approvalRequestID);
            }
            else if (action === "resendEmail") {
                log.debug("Resend Email Action", "Resend Email Action");
                // Resend the email to the Vendor
                resendEmail(purchaseOrderID);
            }
        }
        catch (error) {
            handleError(error);
        }
    }
    // Refresh the data of the portal
    function refreshPortal(pPurchaseOrderID, pApprovalRequestID) {
        log.debug("Purchase Order ID", pPurchaseOrderID);
        log.debug("Approval Request ID", pApprovalRequestID);
        var purchaseOrder = record.load({ type: record.Type.PURCHASE_ORDER, id: pPurchaseOrderID });
        var purchaseOrderChanged = false;
        var allLinesOnShipments = true;
        var lineKeys = [];
        var lineCount = purchaseOrder.getLineCount({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID });
        for (var i = 0; i < lineCount; i++) {
            // Store the line key to compare later
            var lineKey = purchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY, line: i });
            lineKeys.push(lineKey);
            var approvalRequestLineID = purchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, line: i });
            if (approvalRequestLineID) {
                // Update the data from the line to the approval request line record
                syncApprovalRequestLine(purchaseOrder, i, approvalRequestLineID);
            }
            else {
                // Create approval request line record
                var approvalRequestLineID_1 = createApprovalRequestLine(purchaseOrder, i, pApprovalRequestID);
                log.debug("Creating a new Approval Request Line", "Created Approval Request Line with ID: " + approvalRequestLineID_1);
                // Set the ID of the new record on the line
                purchaseOrder.setSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, line: i, value: approvalRequestLineID_1 });
                purchaseOrderChanged = true;
                log.debug("Approval Request Line ID set on line", "Approval Request Line ID set on line: " + i);
            }
            // Check if all lines are on shipments
            var quantity = purchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY, line: i });
            var quantityOnShipments = purchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY_ON_SHIPMENTS, line: i });
            if (Number(quantity) !== Number(quantityOnShipments))
                allLinesOnShipments = false;
        }
        log.debug("allLinesOnShipments", allLinesOnShipments);
        // Check if all the approval request lines still exist on the purchase order
        validateApprovalRequestLines(pApprovalRequestID, lineKeys);
        // Update the data of the approval request
        syncApprovalRequest(purchaseOrder, pApprovalRequestID, allLinesOnShipments);
        // Send the email to the related contacts of the Vendor
        sendNotificationEmail(purchaseOrder);
        // Save the purchase order if it was changed
        if (purchaseOrderChanged) {
            purchaseOrder.save();
        }
    }
    // Resend the email to the Vendor
    function resendEmail(pPurchaseOrderID) {
        // Create the approval request email
        var approvalRequestEmail = record.create({ type: constants.APPROVAL_REQUEST_EMAIL.ID });
        approvalRequestEmail.setValue(constants.APPROVAL_REQUEST_EMAIL.FIELDS.PURCHASE_ORDER, pPurchaseOrderID);
        approvalRequestEmail.setValue(constants.APPROVAL_REQUEST_EMAIL.FIELDS.IN_QUEUE, true);
        approvalRequestEmail.setValue(constants.APPROVAL_REQUEST_EMAIL.FIELDS.RESENT_EMAIL, true);
        var approvalRequestEmailID = approvalRequestEmail.save();
        log.debug("Approval Request Email ID", "Approval Request Email ID: " + approvalRequestEmailID);
        // Schedule task
        task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT,
            scriptId: constants.SCRIPTS.CREATE_APPROVAL_SCHEDULED.ID,
            deploymentId: constants.SCRIPTS.CREATE_APPROVAL_SCHEDULED.DEPLOY
        }).submit();
        log.debug("Scheduled script called!", "Scheduled script called!");
    }
    // Update the data from the line to the approval request line record
    function syncApprovalRequestLine(pPurchaseOrder, pLine, pApprovalRequestLineID) {
        var _a, _b;
        // Get the data from the Approval Request Line
        var approvalRequestLineData = search.lookupFields({
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
        var apprRequestQty = Number(approvalRequestLineData[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY]);
        var apprRequestPurchPrice = Number(approvalRequestLineData[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE]);
        var apprRequestRate = Number(approvalRequestLineData[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE]);
        var apprRequestAmount = Number(approvalRequestLineData[constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT]);
        var apprRequestCBM = Number(approvalRequestLineData[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM]);
        var lineQty = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY, line: pLine });
        var linePurchPrice = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE, line: pLine });
        var lineRate = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE, line: pLine });
        var lineAmount = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT, line: pLine });
        var lineCBM = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM, line: pLine });
        log.debug("approvalRequestLineData", JSON.stringify(approvalRequestLineData));
        log.debug("purchaseOrderLineData", (_a = {}, _a[constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY] = lineQty, _a[constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE] = linePurchPrice, _a[constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE] = lineRate, _a[constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT] = lineAmount, _a[constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM] = lineCBM, _a));
        // Set data on Approval Request Line if different data
        if ((apprRequestQty !== lineQty) || (apprRequestPurchPrice !== linePurchPrice) || (apprRequestRate !== lineRate) || (apprRequestAmount !== lineAmount) || (apprRequestCBM !== lineCBM)) {
            log.debug("Setting data on Approval Request Line", "Setting data on Approval Request Line ID: " + pApprovalRequestLineID);
            record.submitFields({
                type: constants.APPROVAL_REQUEST_LINES.ID,
                id: pApprovalRequestLineID,
                values: (_b = {},
                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY] = null,
                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY] = lineQty,
                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE] = null,
                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE] = linePurchPrice,
                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE] = null,
                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE] = lineRate,
                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT] = lineAmount,
                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM] = null,
                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM] = lineCBM,
                    _b)
            });
        }
    }
    // Create approval request line record
    function createApprovalRequestLine(pPurchaseOrder, pLine, pApprovalRequestID) {
        var lineUniqueKey = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY, line: pLine });
        var lineItem = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, line: pLine });
        var lineQty = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY, line: pLine });
        var linePurchPrice = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE, line: pLine });
        var lineRate = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE, line: pLine });
        var lineAmount = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT, line: pLine });
        var lineCBM = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM, line: pLine });
        var approvalRequestLine = record.create({ type: constants.APPROVAL_REQUEST_LINES.ID });
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
        var approvalRequestLineID = approvalRequestLine.save();
        return approvalRequestLineID;
    }
    // Check if all the approval request lines still exist on the purchase order
    function validateApprovalRequestLines(pApprovalRequestID, pLineKeys) {
        log.debug("Validating approval request lines", "Line keys: " + pLineKeys);
        // Get the Approval Request Lines
        var approvalRequestLinesSearch = search.create({
            type: constants.APPROVAL_REQUEST_LINES.ID,
            filters: [
                search.createFilter({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST, operator: search.Operator.ANYOF, values: pApprovalRequestID })
            ],
            columns: [
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY })
            ]
        });
        // Loop through existing Netsuite lines and validate if required to delete
        var linesToDelete = [];
        var approvalRequestLinesSearchResults = approvalRequestLinesSearch.runPaged({ pageSize: 1000 });
        for (var i = 0; i < approvalRequestLinesSearchResults.pageRanges.length; i++) {
            var page = approvalRequestLinesSearchResults.fetch({ index: approvalRequestLinesSearchResults.pageRanges[i].index });
            for (var j = 0; j < page.data.length; j++) {
                var result = page.data[j];
                var lineKey = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY);
                // If the line is not present on the Purchase Order, store it to delete it
                if (pLineKeys.indexOf(lineKey) === -1) {
                    linesToDelete.push(result.id);
                }
            }
        }
        log.debug("linesToDelete", linesToDelete);
        // Delete the approval request lines that were deleted from the Purchase Order
        for (var i = 0; i < linesToDelete.length; i++) {
            record.delete({ type: constants.APPROVAL_REQUEST_LINES.ID, id: linesToDelete[i] });
        }
    }
    // Update the data of the approval request
    function syncApprovalRequest(pPurchaseOrder, pApprovalRequestID, pAllLinesOnShipments) {
        var _a;
        // Get the data from the Approval Request Line
        var approvalRequestLineData = search.lookupFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: pApprovalRequestID,
            columns: [
                constants.APPROVAL_REQUEST.FIELDS.TOTAL,
                constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE,
                constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE,
                constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED
            ]
        });
        var apprRequestTotal = approvalRequestLineData[constants.APPROVAL_REQUEST.FIELDS.TOTAL];
        var apprRequestShipDate = approvalRequestLineData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE];
        var apprRequestISNComplete = approvalRequestLineData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        var apprRequestISNShipped = approvalRequestLineData[constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED];
        var total = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.TOTAL);
        var shipDate = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE);
        log.debug("apprRequestTotal", apprRequestTotal);
        log.debug("apprRequestShipDate", apprRequestShipDate);
        log.debug("apprRequestISNComplete", apprRequestISNComplete);
        log.debug("apprRequestISNShipped", apprRequestISNShipped);
        log.debug("total", total);
        log.debug("shipDate", shipDate);
        // Set data on Approval Request Line if different data
        if ((apprRequestTotal !== total) || (apprRequestShipDate !== shipDate) || (apprRequestISNComplete !== pAllLinesOnShipments)) {
            log.debug("Setting data on Approval Request", "Setting data on Approval Request ID: " + pApprovalRequestID);
            var newISNShipped = !pAllLinesOnShipments ? false : apprRequestISNShipped;
            record.submitFields({
                type: constants.APPROVAL_REQUEST.ID,
                id: pApprovalRequestID,
                values: (_a = {},
                    _a[constants.APPROVAL_REQUEST.FIELDS.TOTAL] = total,
                    _a[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] = shipDate,
                    _a[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE] = pAllLinesOnShipments,
                    _a[constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED] = newISNShipped,
                    _a)
            });
        }
    }
    // Send the email to the related contacts of the Vendor
    function sendNotificationEmail(pPurchaseOrder) {
        log.debug("Sending email to Contacts", "Sending email to Contacts");
        // Get the data of the Vendor
        var vendorID = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.VENDOR);
        var vendorData = search.lookupFields({
            type: search.Type.VENDOR,
            id: vendorID,
            columns: [
                constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS,
                constants.VENDOR.FIELDS.TOV_REP
            ]
        });
        var vendorTOVRep = vendorData[constants.VENDOR.FIELDS.TOV_REP] ? vendorData[constants.VENDOR.FIELDS.TOV_REP][0].value : null;
        var vendorHasAccess = vendorData[constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS];
        var isIndianVendor = Number(vendorTOVRep) === constants.GENERAL.INDIAN_VENDORS_TOV_REP;
        // Get the data of the order
        var tranid = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.TRANID);
        var isRenegade = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO);
        var isPartsOrder = String(pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM)) === constants.FORMS.PARTS_ORDER;
        // Get the contacts to send email
        var contacts = (isIndianVendor) ? getContactsWithRelatedEmp(vendorTOVRep) : getContactsWithVendor(vendorID);
        if (!vendorHasAccess || contacts.length > 0) {
            // Get the data of the email that will be sent
            var emailData = getEmailData(pPurchaseOrder.id, tranid);
            // Send email to contacts
            sendEmailToContacts(emailData, contacts, pPurchaseOrder.id, isRenegade, isPartsOrder, vendorHasAccess, vendorTOVRep);
        }
        else {
            log.debug("No contacts to send the email", "No contacts to send the email");
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
    // Get the data of the email that will be sent
    function getEmailData(pPurchaseOrderID, pTranID) {
        // Get the Purchase Order PDF
        var purchaseOrderPDF = render.transaction({
            entityId: Number(pPurchaseOrderID),
            printMode: render.PrintMode.PDF
        });
        // Merge the email
        var emailRender = render.mergeEmail({
            transactionId: pPurchaseOrderID,
            templateId: constants.EMAIL_TEMPLATES.DATA_REFRESHED
        });
        // Set the subject and body
        var subject = emailRender.subject;
        subject = subject.replace("_tranid_", pTranID);
        var body = emailRender.body;
        // Set the links on the body
        var link = functions.getSuiteletURL(constants.SCRIPTS.VENDOR_PORTAL_SUITELET.ID, constants.SCRIPTS.VENDOR_PORTAL_SUITELET.DEPLOY, true);
        link += "&po=" + pPurchaseOrderID + "&page=pending-vendor";
        var portalLink = functions.getSuiteletURL(constants.SCRIPTS.VENDOR_PORTAL_SUITELET.ID, constants.SCRIPTS.VENDOR_PORTAL_SUITELET.DEPLOY, true);
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
    function sendEmailToContacts(pEmailData, pContacts, pPurchaseOrderID, pIsRenegade, pIsPartsOrder, pVendorHasAccess, pVendorTOVRep) {
        // Set the recipients
        var recipients = (pVendorHasAccess) ? pContacts : ["roy.cordero@midware.net", "baila@tovfurniture.com"];
        var cc;
        if (pVendorHasAccess) {
            var modules = [constants.EMAIL_MODULES.ALL_PURCHASE_ORDERS];
            (pIsRenegade) ? modules.push(constants.EMAIL_MODULES.RENEGADE_PURCHASE_ORDERS) : {};
            (pIsPartsOrder) ? modules.push(constants.EMAIL_MODULES.PARTS_PURCHASE_ORDERS) : {};
            cc = functions.getEmailSubscribers(modules);
            (pVendorTOVRep) ? cc.push(pVendorTOVRep) : {};
        }
        else {
            cc = [];
        }
        log.debug("Recipients and CC", "Recipients: " + recipients + " - CC: " + cc);
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
    function httpRequestError() {
        throw error.create({
            name: "MW_UNSUPPORTED_REQUEST_TYPE",
            message: "Suitelet only supports GET and POST request",
            notifyOff: true
        });
    }
    // Handle the errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
