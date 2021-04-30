/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as search from 'N/search';
import * as record from 'N/record';

import * as constants from '../Global/Constants';

export function afterSubmit(pContext: EntryPoints.UserEvent.afterSubmitContext) {
    try {
        log.debug("Running", "Running afterSubmit");

        if (pContext.type === pContext.UserEventType.CREATE || pContext.type === pContext.UserEventType.EDIT) {
            let inboundShipmentID = pContext.newRecord.id;
            log.debug("inboundShipmentID", inboundShipmentID);

            // Get the purchase orders from the ISN
            let purchaseOrders = [];
            let itemsLineCount = pContext.newRecord.getLineCount({ sublistId: "items" });
            for (let i = 0; i < itemsLineCount; i++) {
                let purchaseOrderID = pContext.newRecord.getSublistValue({ sublistId: "items", fieldId: "purchaseorder", line: i });
                (purchaseOrders.indexOf(purchaseOrderID) === -1) ? purchaseOrders.push(purchaseOrderID) : {};
            }

            log.debug("purchaseOrders", purchaseOrders);

            // Get the approval requests of the related purchase orders
            let approvalRequestsSearch = search.create({
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

            let data = {};
            let approvalRequestsSearchResults = approvalRequestsSearch.runPaged({ pageSize: 1000 });
            for (let i = 0; i < approvalRequestsSearchResults.pageRanges.length; i++) {
                let page = approvalRequestsSearchResults.fetch({ index: approvalRequestsSearchResults.pageRanges[i].index });
                for (let j = 0; j < page.data.length; j++) {
                    let result = page.data[j];
                    let approvalRequestID = result.id;

                    let item = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM });
                    if (item) {
                        let object = {
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
            let approvalRequestsISNStatusSearch = search.create({
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

            let approvalISNStatuses = {}
            let approvalRequestsISNStatusResults = approvalRequestsISNStatusSearch.runPaged({ pageSize: 1000 });
            for (let i = 0; i < approvalRequestsISNStatusResults.pageRanges.length; i++) {
                let page = approvalRequestsISNStatusResults.fetch({ index: approvalRequestsISNStatusResults.pageRanges[i].index });
                for (let j = 0; j < page.data.length; j++) {
                    let result = page.data[j];
                    let approvalRequestID = result.id;
                    let inboundShipmentID = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID });
                    let inboundShipmentStatus = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS });

                    if (approvalISNStatuses.hasOwnProperty(approvalRequestID)) {

                        if (!approvalISNStatuses[approvalRequestID].hasOwnProperty(inboundShipmentID)) {
                            approvalISNStatuses[approvalRequestID][inboundShipmentID] = inboundShipmentStatus;
                        }
                    } else {
                        approvalISNStatuses[approvalRequestID] = {};
                        approvalISNStatuses[approvalRequestID][inboundShipmentID] = inboundShipmentStatus;
                    }
                }
            }

            log.debug('Approval ISN Status', approvalISNStatuses)


            // Check if all the items of every purchase order is on Inbound Shipments to check the approval request
            let approvalRequests = Object.keys(data);
            for (let i = 0; i < approvalRequests.length; i++) {
                let approvalRequestID = String(approvalRequests[i]);
                log.debug("approvalRequestID", approvalRequestID);

                // Set the related ISNs on the Approval Request
                let ISNInfo = search.lookupFields({
                    type: constants.APPROVAL_REQUEST.ID,
                    id: approvalRequestID,
                    columns: [constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS]
                });

                let actualRelatedISNs = ISNInfo[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS];

                log.debug("actualRelatedISNs", actualRelatedISNs);

                let relatedISNs = [];
                for (let j = 0; j < actualRelatedISNs.length; j++) {
                    relatedISNs.push(actualRelatedISNs[j].value);
                }

                (relatedISNs.indexOf(String(inboundShipmentID)) === -1) ? relatedISNs.push(inboundShipmentID) : {};
                log.debug("relatedISNs", relatedISNs);

                // Check lines of purchase order
                let allLinesOnShipments = true;
                let purchaseOrderData = data[approvalRequestID];
                for (let j = 0; j < purchaseOrderData.length; j++) {
                    let line = purchaseOrderData[j];
                    if (line.quantity !== line.quantityOnShipments) {
                        allLinesOnShipments = false;
                        break;
                    }
                }
                log.debug("allLinesOnShipments", allLinesOnShipments);

                let approvalUpdateObject = {}
                // If all lines present, set values on approval request record and purchase order
                if (allLinesOnShipments) {
                    approvalUpdateObject = {
                        [constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE]: true,
                        [constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED]: true,
                        [constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS]: relatedISNs
                    }

                    record.submitFields({
                        type: record.Type.PURCHASE_ORDER,
                        id: data[approvalRequestID][0].purchaseOrder,
                        values: {
                            [constants.PURCHASE_ORDER.FIELDS.STATUS]: constants.PURCHASE_ORDER_STATUSES.APPROVED
                        }
                    });
                }
                else {
                    // If not all the lines are present, just set the related ISNs
                    approvalUpdateObject = {
                        [constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS]: relatedISNs
                    }
                }

                //If all related ISN are In Trasit check the ISN Shipped value of Approval request
                let IsISNsShipped = true;
                for (const ISNStatus in approvalISNStatuses[approvalRequestID]) {
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

// Handle errors
function handleError(pError: Error) {
    log.error({ title: "Error", details: pError.message });
    log.error({ title: "Stack", details: JSON.stringify(pError) });
}
