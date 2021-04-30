/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/search", "N/record", "../Global/Constants"], function (require, exports, log, search, record, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function afterSubmit(pContext) {
        var _a, _b, _c;
        try {
            log.debug("Running", "Running afterSubmit");
            if (pContext.type === pContext.UserEventType.CREATE || pContext.type === pContext.UserEventType.EDIT) {
                var inboundShipmentID = pContext.newRecord.id;
                log.debug("inboundShipmentID", inboundShipmentID);
                // Get the purchase orders from the ISN
                var purchaseOrders = [];
                var itemsLineCount = pContext.newRecord.getLineCount({ sublistId: "items" });
                for (var i = 0; i < itemsLineCount; i++) {
                    var purchaseOrderID = pContext.newRecord.getSublistValue({ sublistId: "items", fieldId: "purchaseorder", line: i });
                    (purchaseOrders.indexOf(purchaseOrderID) === -1) ? purchaseOrders.push(purchaseOrderID) : {};
                }
                log.debug("purchaseOrders", purchaseOrders);
                // Get the approval requests of the related purchase orders
                var approvalRequestsSearch = search.create({
                    type: constants.APPROVAL_REQUEST.ID,
                    filters: [
                        search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, operator: search.Operator.ANYOF, values: purchaseOrders }),
                        search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, operator: search.Operator.IS, values: true }),
                        search.createFilter({ join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, name: "taxline", operator: search.Operator.IS, values: false }),
                        search.createFilter({ join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, name: "cogs", operator: search.Operator.IS, values: false })
                    ],
                    columns: [
                        search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                        search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM }),
                        search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY }),
                        search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY_ON_SHIPMENTS })
                    ]
                });
                var data = {};
                var approvalRequestsSearchResults = approvalRequestsSearch.runPaged({ pageSize: 1000 });
                for (var i = 0; i < approvalRequestsSearchResults.pageRanges.length; i++) {
                    var page = approvalRequestsSearchResults.fetch({ index: approvalRequestsSearchResults.pageRanges[i].index });
                    for (var j = 0; j < page.data.length; j++) {
                        var result = page.data[j];
                        var approvalRequestID = result.id;
                        var item = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM });
                        if (item) {
                            var object = {
                                "purchaseOrder": result.getValue({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                                "item": result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM }),
                                "quantity": result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY }),
                                "quantityOnShipments": result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY_ON_SHIPMENTS })
                            };
                            (data[approvalRequestID]) ? data[approvalRequestID].push(object) : data[approvalRequestID] = [object];
                        }
                    }
                }
                log.debug("data", data);
                //Get all inbound shipment statuses per approval request
                var approvalRequestsISNStatusSearch = search.create({
                    type: constants.APPROVAL_REQUEST.ID,
                    filters: [
                        search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, operator: search.Operator.ANYOF, values: purchaseOrders }),
                        search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, operator: search.Operator.IS, values: true })
                    ],
                    columns: [
                        search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS }),
                        search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID })
                    ]
                });
                var approvalISNStatuses = {};
                var approvalRequestsISNStatusResults = approvalRequestsISNStatusSearch.runPaged({ pageSize: 1000 });
                for (var i = 0; i < approvalRequestsISNStatusResults.pageRanges.length; i++) {
                    var page = approvalRequestsISNStatusResults.fetch({ index: approvalRequestsISNStatusResults.pageRanges[i].index });
                    for (var j = 0; j < page.data.length; j++) {
                        var result = page.data[j];
                        var approvalRequestID = result.id;
                        var inboundShipmentID_1 = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID });
                        var inboundShipmentStatus = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS });
                        if (approvalISNStatuses.hasOwnProperty(approvalRequestID)) {
                            if (!approvalISNStatuses[approvalRequestID].hasOwnProperty(inboundShipmentID_1)) {
                                approvalISNStatuses[approvalRequestID][inboundShipmentID_1] = inboundShipmentStatus;
                            }
                        }
                        else {
                            approvalISNStatuses[approvalRequestID] = {};
                            approvalISNStatuses[approvalRequestID][inboundShipmentID_1] = inboundShipmentStatus;
                        }
                    }
                }
                log.debug('Approval ISN Status', approvalISNStatuses);
                // Check if all the items of every purchase order is on Inbound Shipments to check the approval request
                var approvalRequests = Object.keys(data);
                for (var i = 0; i < approvalRequests.length; i++) {
                    var approvalRequestID = String(approvalRequests[i]);
                    log.debug("approvalRequestID", approvalRequestID);
                    // Set the related ISNs on the Approval Request
                    var ISNInfo = search.lookupFields({
                        type: constants.APPROVAL_REQUEST.ID,
                        id: approvalRequestID,
                        columns: [constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS]
                    });
                    var actualRelatedISNs = ISNInfo[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS];
                    log.debug("actualRelatedISNs", actualRelatedISNs);
                    var relatedISNs = [];
                    for (var j = 0; j < actualRelatedISNs.length; j++) {
                        relatedISNs.push(actualRelatedISNs[j].value);
                    }
                    (relatedISNs.indexOf(String(inboundShipmentID)) === -1) ? relatedISNs.push(inboundShipmentID) : {};
                    log.debug("relatedISNs", relatedISNs);
                    // Check lines of purchase order
                    var allLinesOnShipments = true;
                    var purchaseOrderData = data[approvalRequestID];
                    for (var j = 0; j < purchaseOrderData.length; j++) {
                        var line = purchaseOrderData[j];
                        if (line.quantity !== line.quantityOnShipments) {
                            allLinesOnShipments = false;
                            break;
                        }
                    }
                    log.debug("allLinesOnShipments", allLinesOnShipments);
                    var approvalUpdateObject = {};
                    // If all lines present, set values on approval request record and purchase order
                    if (allLinesOnShipments) {
                        approvalUpdateObject = (_a = {},
                            _a[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE] = true,
                            _a[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED] = true,
                            _a[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS] = relatedISNs,
                            _a);
                        record.submitFields({
                            type: record.Type.PURCHASE_ORDER,
                            id: data[approvalRequestID][0].purchaseOrder,
                            values: (_b = {},
                                _b[constants.PURCHASE_ORDER.FIELDS.STATUS] = constants.PURCHASE_ORDER_STATUSES.APPROVED,
                                _b)
                        });
                    }
                    else {
                        // If not all the lines are present, just set the related ISNs
                        approvalUpdateObject = (_c = {},
                            _c[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS] = relatedISNs,
                            _c);
                    }
                    //If all related ISN are In Trasit check the ISN Shipped value of Approval request
                    var IsISNsShipped = true;
                    for (var ISNStatus in approvalISNStatuses[approvalRequestID]) {
                        if (approvalISNStatuses[approvalRequestID][ISNStatus] !== 'In Transit') {
                            IsISNsShipped = false;
                        }
                    }
                    approvalUpdateObject[constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED] = IsISNsShipped;
                    record.submitFields({
                        type: constants.APPROVAL_REQUEST.ID,
                        id: approvalRequestID,
                        values: approvalUpdateObject
                    });
                }
                log.debug("All finished!", "All finished!");
            }
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.afterSubmit = afterSubmit;
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
