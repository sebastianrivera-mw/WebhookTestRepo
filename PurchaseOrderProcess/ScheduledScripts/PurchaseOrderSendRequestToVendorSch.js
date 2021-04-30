/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/record", "N/search", "N/email", "N/render", "N/task", "N/runtime", "../Global/Constants", "../Global/Functions"], function (require, exports, log, record, search, email, render, task, runtime, constants, functions) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function execute(pContext) {
        var _a;
        try {
            log.debug("Running", "Starting process!");
            // Get the records to process
            var recordsToProcess = getRecordsToProcess();
            log.debug("Quantity of Records to process", recordsToProcess.length);
            for (var i = 0; i < recordsToProcess.length; i++) {
                try {
                    if (runtime.getCurrentScript().getRemainingUsage() > 1000) {
                        var recordToProcess = recordsToProcess[i];
                        // Get the Purchase Order
                        var purchaseOrderID = recordToProcess[constants.APPROVAL_REQUEST_EMAIL.FIELDS.PURCHASE_ORDER];
                        log.debug("purchaseOrderID", purchaseOrderID);
                        if (purchaseOrderID) {
                            // Load the Purchase Order
                            var purchaseOrder = record.load({ type: record.Type.PURCHASE_ORDER, id: purchaseOrderID });
                            var vendorID = purchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.VENDOR);
                            // Get the data of the Vendor
                            var vendorData = search.lookupFields({
                                type: search.Type.VENDOR,
                                id: vendorID,
                                columns: [
                                    constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS,
                                    constants.VENDOR.FIELDS.TOV_REP
                                ]
                            });
                            var vendorTOVRep = vendorData[constants.VENDOR.FIELDS.TOV_REP] && vendorData[constants.VENDOR.FIELDS.TOV_REP][0] ? vendorData[constants.VENDOR.FIELDS.TOV_REP][0].value : null;
                            var vendorHasAccess = vendorData[constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS];
                            // If Indian Vendor, send the data to the TOV Rep
                            var isIndianVendor = Number(vendorTOVRep) === constants.GENERAL.INDIAN_VENDORS_TOV_REP;
                            processRequest(recordToProcess, vendorID, vendorTOVRep, vendorHasAccess, isIndianVendor, purchaseOrder);
                        }
                        // Set record as processed
                        record.submitFields({
                            type: constants.APPROVAL_REQUEST_EMAIL.ID,
                            id: recordsToProcess[i][constants.APPROVAL_REQUEST_EMAIL.FIELDS.INTERNALID],
                            values: (_a = {},
                                _a[constants.APPROVAL_REQUEST_EMAIL.FIELDS.IN_QUEUE] = false,
                                _a)
                        });
                    }
                    else {
                        log.audit("Not Execution Units", "Scheduled for another iteration of the script");
                        task.create({
                            taskType: task.TaskType.SCHEDULED_SCRIPT,
                            scriptId: runtime.getCurrentScript().id,
                            deploymentId: runtime.getCurrentScript().deploymentId
                        }).submit();
                        return;
                    }
                }
                catch (error) {
                    handleError(error);
                }
            }
            // Schedule the script again to do a double check of pending emails
            if (recordsToProcess.length > 0) {
                log.debug("Re-Scheduling to double check!", "Re-Scheduling to double check!");
                task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: runtime.getCurrentScript().id,
                    deploymentId: runtime.getCurrentScript().deploymentId
                }).submit();
                return;
            }
            log.debug("Running", "All finished!");
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.execute = execute;
    // Get the records to process
    function getRecordsToProcess() {
        var _a;
        var approvalRequestEmails = [];
        // Search for the Purchase Order
        var pendingApprovalRequestEmailSearch = search.create({
            type: constants.APPROVAL_REQUEST_EMAIL.ID,
            filters: [
                search.createFilter({ name: constants.APPROVAL_REQUEST_EMAIL.FIELDS.IN_QUEUE, operator: search.Operator.IS, values: true }),
                search.createFilter({ name: constants.APPROVAL_REQUEST_EMAIL.FIELDS.SENT, operator: search.Operator.IS, values: false })
            ],
            columns: [
                search.createColumn({ name: constants.APPROVAL_REQUEST_EMAIL.FIELDS.INTERNALID }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_EMAIL.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_EMAIL.FIELDS.RESENT_EMAIL })
            ]
        });
        var pendingApprovalRequestEmailResults = pendingApprovalRequestEmailSearch.runPaged({ pageSize: 1000 });
        for (var i = 0; i < pendingApprovalRequestEmailResults.pageRanges.length; i++) {
            var page = pendingApprovalRequestEmailResults.fetch({ index: pendingApprovalRequestEmailResults.pageRanges[i].index });
            for (var j = 0; j < page.data.length; j++) {
                var result = page.data[j];
                var purchaseOrderID = result.getValue(constants.APPROVAL_REQUEST_EMAIL.FIELDS.PURCHASE_ORDER);
                var resentEmail = result.getValue(constants.APPROVAL_REQUEST_EMAIL.FIELDS.RESENT_EMAIL);
                var approvalRequestEmail = (_a = {},
                    _a[constants.APPROVAL_REQUEST_EMAIL.FIELDS.INTERNALID] = result.id,
                    _a[constants.APPROVAL_REQUEST_EMAIL.FIELDS.PURCHASE_ORDER] = purchaseOrderID,
                    _a[constants.APPROVAL_REQUEST_EMAIL.FIELDS.RESENT_EMAIL] = resentEmail,
                    _a);
                approvalRequestEmails.push(approvalRequestEmail);
            }
        }
        return approvalRequestEmails;
    }
    // Send the email to the related contacts of the Vendor
    function processRequest(pRecordToProcess, pVendorID, pVendorTOVRep, pVendorHasAccess, pIndianVendor, pPurchaseOrder) {
        var _a, _b;
        var tranid = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.TRANID);
        var total = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.TOTAL);
        var shipDate = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE);
        var isRenegade = pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO);
        var isPartsOrder = String(pPurchaseOrder.getValue(constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM)) === constants.FORMS.PARTS_ORDER;
        // Get the contacts to send email
        var contacts = (pIndianVendor) ? getContactsWithRelatedEmp(pVendorTOVRep) : getContactsWithVendor(pVendorID);
        if (pVendorHasAccess || contacts.length > 0) {
            // Get the data of the email that will be sent
            var emailData = getEmailData(pPurchaseOrder.id, tranid);
            // Send email to contacts
            sendEmailToContacts(emailData, contacts, pPurchaseOrder.id, isRenegade, isPartsOrder, pVendorHasAccess, pVendorTOVRep);
            var resentEmail = pRecordToProcess[constants.APPROVAL_REQUEST_EMAIL.FIELDS.RESENT_EMAIL];
            if (!resentEmail) {
                // Create the Approval Request record
                var approvalRequestRecordID = createApprovalRequestRecord(pPurchaseOrder.id, shipDate, pVendorID, total);
                // Create the Approval Request Lines records
                createApprovalRequestLines(pPurchaseOrder, approvalRequestRecordID);
                // Set as email sent in the Purchase Order
                record.submitFields({
                    type: record.Type.PURCHASE_ORDER,
                    id: pPurchaseOrder.id,
                    values: (_a = {},
                        _a[constants.PURCHASE_ORDER.FIELDS.REQUEST_EMAIL_SENT] = true,
                        _a[constants.PURCHASE_ORDER.FIELDS.APPROVAL_REQUEST] = approvalRequestRecordID,
                        _a)
                });
            }
            // Set record as processed
            record.submitFields({
                type: constants.APPROVAL_REQUEST_EMAIL.ID,
                id: pRecordToProcess[constants.APPROVAL_REQUEST_EMAIL.FIELDS.INTERNALID],
                values: (_b = {},
                    _b[constants.APPROVAL_REQUEST_EMAIL.FIELDS.IN_QUEUE] = false,
                    _b[constants.APPROVAL_REQUEST_EMAIL.FIELDS.SENT] = true,
                    _b)
            });
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
                    [
                        [constants.CONTACT.FIELDS.COPY_NEW_PO_EMAIL, "is", "T"],
                        "OR",
                        [constants.CONTACT.FIELDS.COPY_VENDOR_PORTAL_UPDATES, "is", "T"]
                    ]
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
                    [
                        [constants.CONTACT.FIELDS.COPY_NEW_PO_EMAIL, "is", "T"],
                        "OR",
                        [constants.CONTACT.FIELDS.COPY_VENDOR_PORTAL_UPDATES, "is", "T"]
                    ]
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
            templateId: constants.EMAIL_TEMPLATES.FIRST_REQUEST
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
        log.debug("Sending email to Contacts", "Sending email to Contacts");
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
    // Create the Approval Request record
    function createApprovalRequestRecord(pPurchaseOrderID, pShipDate, pVendorID, pTotal) {
        var _a;
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
            var _a;
            record.submitFields({
                type: constants.APPROVAL_REQUEST.ID,
                id: result.id,
                values: (_a = {},
                    _a[constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST] = false,
                    _a)
            });
            return true;
        });
        var actualDate = new Date();
        var approvalRequest = record.create({ type: constants.APPROVAL_REQUEST.ID });
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, pPurchaseOrderID);
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR, pVendorID);
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE, pShipDate);
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.TOTAL, pTotal);
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT, 0);
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE, constants.VENDOR_OR_TOV_TEXT.VENDOR);
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.DATE, actualDate);
        approvalRequest.setValue(constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, true);
        var approvalRequestID = approvalRequest.save();
        var plannerPageLink = functions.getSuiteletURL(constants.SCRIPTS.PO_PLANNER_PORTAL_SUITELET.ID, constants.SCRIPTS.PO_PLANNER_PORTAL_SUITELET.DEPLOY, false);
        plannerPageLink += "&id=" + approvalRequestID + "&po=" + pPurchaseOrderID;
        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: approvalRequestID,
            values: (_a = {},
                _a[constants.APPROVAL_REQUEST.FIELDS.PLANNER_PAGE_LINK] = plannerPageLink,
                _a)
        });
        log.debug("Approval Request Created", "Approval Request ID: " + approvalRequestID);
        return approvalRequestID;
    }
    // Create the Approval Request Lines records
    function createApprovalRequestLines(pPurchaseOrder, pApprovalRequestID) {
        var actualDate = new Date();
        var lineCount = pPurchaseOrder.getLineCount({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID });
        for (var i = 0; i < lineCount; i++) {
            var itemType = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM_TYPE, line: i });
            if (itemType !== "Discount") {
                var lineUniqueKey = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY, line: i });
                var item = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, line: i });
                var quantity = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY, line: i });
                var purchasePrice = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE, line: i });
                var rate = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE, line: i });
                var amount = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT, line: i });
                var cbm = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM, line: i });
                var cbf = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBF, line: i });
                var expectedReceiptDate = pPurchaseOrder.getSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.EXPECTED_RECEIPT_DATE, line: i });
                var approvalRequestLine = record.create({ type: constants.APPROVAL_REQUEST_LINES.ID });
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
                var approvalRequestLineID = approvalRequestLine.save();
                pPurchaseOrder.setSublistValue({ sublistId: constants.PURCHASE_ORDER.ITEM_SUBLIST.ID, fieldId: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, line: i, value: approvalRequestLineID });
            }
        }
        pPurchaseOrder.save();
    }
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
