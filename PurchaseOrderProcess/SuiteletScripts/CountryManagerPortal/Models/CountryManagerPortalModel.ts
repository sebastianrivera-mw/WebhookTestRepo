/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as log from 'N/log';
import * as search from 'N/search';
import * as record from 'N/record';
import * as render from 'N/render';
import * as email from 'N/email';
import * as file from 'N/file';

import * as constants from '../../../Global/Constants';
import * as functions from '../../../Global/Functions';

// Get the data of the specific Purchase Order
export function getPurchaseOrderData(pVendorID, pPurchaseOrderID)
{
    // Data to return
    let purchaseOrderItems = [];
    let totalCBM = 0;
    let subTotal = 0;
    let total;
    let purchaseOrderData = {
        [constants.PURCHASE_ORDER.FIELDS.TRANID] : "",
        [constants.PURCHASE_ORDER.FIELDS.DATE] : "",
        [constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT] : false,
        [constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER] : false,
        [constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO] : false,
        [constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM] : 0,
        [constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME] : "",
        [constants.PURCHASE_ORDER_OBJECT.VENDOR_UNIQUE_KEY] : "",
        [constants.PURCHASE_ORDER_OBJECT.VENDOR_ID] : "",
        [constants.PURCHASE_ORDER_OBJECT.ITEMS] : []
    };
    
    // Search for the Purchase Order
    let purchaseOrderSearch = search.create({
        type: "transaction",
        filters:
        [
            ["mainline", "is", "F"],
            "AND",
            ["taxline", "is", "F"], 
            "AND", 
            ["cogs", "is", "F"], 
            "AND",
            ["item.type", "anyof", "InvtPart", "Group", "Kit", "NonInvtPart"],
            "AND",
            ["internalid", "anyof", pPurchaseOrderID]
        ],
        columns:
        [
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TRANID }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TOTAL }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESS }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.DATE }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO }),
            search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY }),
            search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.ITEM_NAME }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.DISPLAY_NAME }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.PURCHASE_PRICE }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.ALTNAME }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.UNIQUE_KEY }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.LOGO }),
            search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY }),
            search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY_ON_SHIPMENTS }),
            search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_DISCOUNT }),
            search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE }),
            search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT }),
            search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM }),
            search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.FABRIC_CODE }),
            search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.EXPECTED_RECEIPT_DATE }),
            // search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM_COLLAB }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_VENDOR }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_TOV }),
            search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED })
        ]
    });

    purchaseOrderSearch.run().each(function(result) {

        let quantity = Number(result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY));
        let purchasePrice = Number(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.PURCHASE_PRICE }));
        subTotal += quantity * purchasePrice;
        totalCBM += quantity * Number(result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM));

        if (!purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.TRANID])
        {
            let shippAddress = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.SHIPADDRESS)).replace(/\r\n/g, '<br>');
            total = Number(result.getValue(constants.PURCHASE_ORDER.FIELDS.TOTAL)).toFixed(2);

            purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.TRANID] = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.TRANID));
            purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.DATE] = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.DATE));
            purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT] = result.getValue(constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT);
            purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER] = result.getValue(constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER);
            purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO] = result.getValue(constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO);
            purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL] = String(total);
            purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SHIPADDRESS] = shippAddress;
            purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.PO_EXPECTED_SHIP_DATE] = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE));
            purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.ALTNAME }));
            purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_ID] = pVendorID;
            purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_UNIQUE_KEY] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.UNIQUE_KEY }));
            purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.LOGO }));
        }

        purchaseOrderItems.push({
            [constants.PURCHASE_ORDER_OBJECT.LINE_KEY] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY),
            [constants.PURCHASE_ORDER_OBJECT.ITEM_ID] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM),
            [constants.PURCHASE_ORDER_OBJECT.ITEM_NAME] : String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.ITEM_NAME })),
            [constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME] : String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.DISPLAY_NAME })),
            [constants.PURCHASE_ORDER_OBJECT.PURCHASE_PRICE] : String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.PURCHASE_PRICE })),
            [constants.PURCHASE_ORDER_OBJECT.QUANTITY] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY),
            [constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY_ON_SHIPMENTS),
            [constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_DISCOUNT),
            [constants.PURCHASE_ORDER_OBJECT.RATE] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE),
            [constants.PURCHASE_ORDER_OBJECT.AMOUNT] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT),
            [constants.PURCHASE_ORDER_OBJECT.CBM] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM),
            [constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.FABRIC_CODE),
            [constants.PURCHASE_ORDER_OBJECT.EXPECTED_RECEIPT_DATE] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.EXPECTED_RECEIPT_DATE),
            // [constants.PURCHASE_ORDER_OBJECT.ITEM_COLLAB] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM_COLLAB),
            [constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] : result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY }),
            [constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] : result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY }),
            [constants.PURCHASE_ORDER_OBJECT.REQ_LAST_RATE] : result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE }),
            [constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE] : result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE }),
            [constants.PURCHASE_ORDER_OBJECT.REQ_EXPECTED_RECEIPT_DATE] : result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE }),
            [constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] : result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES }),
            [constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] : result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE }),
            [constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR] : result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_VENDOR }),
            [constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_TOV] : result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_TOV }),
            [constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] : result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED })
        });

        return true;
    });

    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.ITEMS] = purchaseOrderItems;
    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SUBTOTAL] = Number(subTotal).toFixed(2);
    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_DISCOUNT] = Number(subTotal - total).toFixed(2);
    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM] = Number(totalCBM).toFixed(2);

    log.debug("Purchase Order Data", JSON.stringify(purchaseOrderData));

    return purchaseOrderData;
}

// Get the data of the specific Purchase Order
export function getInboundShipmentData(pVendorID, pInboundShipmentID)
{
    // Data to return
    let inboundShipmentItems = [];
    let inboundShipmentData = {
        [constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER] : "",
        [constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE] : "",
        [constants.INBOUND_SHIPMENT_OBJECT.VENDOR_NAME] : 0,
        [constants.INBOUND_SHIPMENT_OBJECT.VENDOR_ID] : "",
        [constants.INBOUND_SHIPMENT_OBJECT.VENDOR_UNIQUE_KEY] : "",
        [constants.INBOUND_SHIPMENT_OBJECT.LOGO] : "",
        [constants.INBOUND_SHIPMENT_OBJECT.ITEMS] : []
    };
    
    // Search for the Purchase Order
    let inboundShipmentSearch = search.create({
        type: "inboundshipment",
        filters:
        [
            ["internalid", "anyof", pInboundShipmentID]
        ],
        columns:
        [
            search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER }),
            search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE }),
            search.createColumn({ name: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM }),
            search.createColumn({ name: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.QUANTITY_EXPECTED }),
            search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.ITEM_NAME }),
            search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.DISPLAY_NAME }),
            search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.ALTNAME }),
            search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.UNIQUE_KEY }),
            search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.LOGO }),
        ]
    });

    inboundShipmentSearch.run().each(function(result) {

        if (!inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER])
        {
            inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER] = String(result.getValue(constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER));
            inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE] = String(result.getValue(constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE));
            inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_NAME] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.ALTNAME }));
            inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_ID] = pVendorID;
            inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_UNIQUE_KEY] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.UNIQUE_KEY }));
            inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.LOGO] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.LOGO }));
        }

        inboundShipmentItems.push({
            [constants.INBOUND_SHIPMENT_OBJECT.ITEM_ID] : result.getValue(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM),
            [constants.INBOUND_SHIPMENT_OBJECT.ITEM_NAME] : String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.ITEM_NAME })),
            [constants.INBOUND_SHIPMENT_OBJECT.DISPLAY_NAME] : String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.DISPLAY_NAME })),
            [constants.INBOUND_SHIPMENT_OBJECT.PURCHASE_ORDER] : result.getText(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.PURCHASE_ORDER),
            [constants.INBOUND_SHIPMENT_OBJECT.QUANTITY_EXPECTED] : result.getValue(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.QUANTITY_EXPECTED)
        });

        return true;
    });

    inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.ITEMS] = inboundShipmentItems;

    log.debug("Inbound Shipment Data", JSON.stringify(inboundShipmentData));

    return inboundShipmentData;
}

// Get the vendors related to the employee
export function getVendorsRelatedToEmp(pUniqueKey)
{
    let vendors = [];

    let vendorsSearch = search.create({
        type: search.Type.VENDOR,
        filters: [
            search.createFilter({ join: constants.VENDOR.FIELDS.TOV_REP, name: constants.EMPLOYEE.FIELDS.CM_PORTAL_KEY, operator: search.Operator.IS, values: pUniqueKey})
        ],
        columns: [
            search.createColumn({ name: constants.VENDOR.FIELDS.ALTNAME })
        ]
    });

    let vendorsSearchResults = vendorsSearch.runPaged({ pageSize: 1000 });
    if (vendorsSearchResults.pageRanges.length > 0)
    {
        for(let i = 0; i < vendorsSearchResults.pageRanges.length; i++)
        {
            let page = vendorsSearchResults.fetch({index: vendorsSearchResults.pageRanges[i].index});
            for(let j = 0; j < page.data.length; j++)
            {
                let result = page.data[j];
                vendors.push(result.id);
            }
        }
    }

    return vendors;
}

// Get the data of a specifc Approval Request
export function getApprovalRequestData(pApprovalRequestID)
{
    let approvalRequestData = {};

    // Search for the Purchase Order
    let approvalRequestSearch = search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters:
        [
            [constants.APPROVAL_REQUEST.FIELDS.INTERNALID, search.Operator.ANYOF, [pApprovalRequestID]]
        ],
        columns:
        [
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.INTERNALID }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.VENDOR }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PI_FILE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.APPROVED }),
        ]
    });

    approvalRequestSearch.run().each(function(result) {

        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.INTERNALID);
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER] = result.getValue({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR] = result.getValue({ name: constants.APPROVAL_REQUEST.FIELDS.VENDOR });
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED);
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED);
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE);
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PI_FILE);
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN);
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE);
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE);
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE);
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.APPROVED);

        return true;
    });

    return approvalRequestData;
}

// Get the pending Approval Requests
export function getPendingApprovalRequestsData(pVendors)
{
    let pendingApprovalRequestData = [];

    // Search for the Purchase Order
    let pendingApprovalRequestSearch = search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters:
        [
            [constants.APPROVAL_REQUEST.FIELDS.VENDOR, "anyof", pVendors],
            "AND",
            [constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, "is", true],
            "AND",
            [`${constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER}.mainline`, "is", true]
        ],
        columns:
        [
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.INTERNALID }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TRANID, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESS, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESSEE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.LOCATION, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TOTAL, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.VENDOR.FIELDS.ALTNAME, join: constants.APPROVAL_REQUEST.FIELDS.VENDOR }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.DATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PAGE_LINK }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.APPROVED }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS }),
            search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID }),
            search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER }),
            search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.CURRENT_READY_DATE }),
            search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.DESTINATION_LOCATION }),
            search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.BOOKING_STATUS }),
            search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS })
        ]
    });

    let pendingApprovalRequestResults = pendingApprovalRequestSearch.runPaged({ pageSize: 1000 });
    for(let i = 0; i < pendingApprovalRequestResults.pageRanges.length; i++)
    {
        let page = pendingApprovalRequestResults.fetch({index: pendingApprovalRequestResults.pageRanges[i].index});
        for(let j = 0; j < page.data.length; j++)
        {
            let result = page.data[j];

            let shippAddress = String(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESS, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER })).replace(/\r\n/g, '<br>');
            let shippAddressee = String(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESSEE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }));
            let isDropship = Number(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.LOCATION, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER })) === constants.LOCATIONS.DROPSHIP;

            let object = {};
            object[constants.APPROVAL_REQUEST.FIELDS.INTERNALID] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.INTERNALID);
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER);
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.TRANID, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESS] = shippAddress;
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE] = shippAddressee;
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_LOCATION] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.LOCATION, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_TOTAL] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.TOTAL, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] = result.getText({ name: constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_DROPSHIP] = isDropship;
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_RENEGADE] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.VENDOR] = result.getValue({ name: constants.VENDOR.FIELDS.ALTNAME, join: constants.APPROVAL_REQUEST.FIELDS.VENDOR });
            object[constants.APPROVAL_REQUEST.FIELDS.DATE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.DATE);
            object[constants.APPROVAL_REQUEST.FIELDS.PAGE_LINK] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PAGE_LINK);
            object[constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT);
            object[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE);
            object[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED);
            object[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED);
            object[constants.APPROVAL_REQUEST.FIELDS.APPROVED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.APPROVED);
            object[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE);
            object[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS);
            object[constants.INBOUND_SHIPMENT_OBJECT.ISN_INTERNALID] = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID });
            object[constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_NUMBER] = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER });
            object[constants.INBOUND_SHIPMENT_OBJECT.CURRENT_READY_DATE] = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.CURRENT_READY_DATE });
            object[constants.INBOUND_SHIPMENT_OBJECT.DESTINATION_LOCATION] = result.getText({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.DESTINATION_LOCATION });
            object[constants.INBOUND_SHIPMENT_OBJECT.BOOKING_STATUS] = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.BOOKING_STATUS });
            object[constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_STATUS] = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS });
            pendingApprovalRequestData.push(object);
        }
    }

    return pendingApprovalRequestData;
}

// Get the Comments of a specific Approval Request
export function getApprovalRequestCommentsData(pApprovalRequestID)
{
    let approvalRequestCommentsData = [];

    // Search for the Purchase Order
    let approvalRequestCommentSearch = search.create({
        type: constants.APPROVAL_REQUEST_COMMENTS.ID,
        filters:
        [
            [constants.APPROVAL_REQUEST_COMMENTS.FIELDS.APPROVAL_REQUEST, "anyof", pApprovalRequestID]
        ],
        columns:
        [
            search.createColumn({ name: constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE, sort: search.Sort.DESC }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV })
        ]
    });

    approvalRequestCommentSearch.run().each(function(result) {

        approvalRequestCommentsData.push({
            [constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE] : result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE),
            [constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] : result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT),
            [constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT] : result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT),
            [constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV] : result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV)
        });        

        return true;
    });

    return approvalRequestCommentsData;
}

// Update the data of the Purchase Order lines
export function updatePurchaseOrderData(pPurchaseOrderID, pGeneralData, pLinesData, pGeneralComment)
{
    let linesComments = "";
    let approvalRequestID;
    let allLinesApproved = true;

    // Get the Approval Request Lines
    search.create({
        type: constants.APPROVAL_REQUEST_LINES.ID,
        filters: [
            search.createFilter({
                join: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST,
                name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER,
                operator: search.Operator.IS,
                values: pPurchaseOrderID
            }),
            search.createFilter({
                join: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST,
                name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST,
                operator: search.Operator.IS,
                values: true
            })
        ],
        columns: [
            search.createColumn({ name: "internalid" }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_VENDOR }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE })
        ]
    }).run().each(function (result) {

        approvalRequestID = approvalRequestID ? approvalRequestID : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST);

        let lineAlreadyApproved = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED);

        if (!lineAlreadyApproved)
        {
            for (let i = 0; i < pLinesData.length; i++)
            {
                let lineUniqueKey = pLinesData[i].lineKey;
                if (lineUniqueKey === result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY))
                {
                    let approved = pLinesData[i].approved;
                    let accepted = pLinesData[i].accepted;
                    let lastQty = approved || accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY) : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY);
                    let newQty = approved || accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY) : pLinesData[i].quantity;
                    let lastRate = approved || accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE) : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE);
                    let newRate = approved || accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE) : pLinesData[i].rate;
                    let amount = newQty * newRate;
                    // let inputReceiptDate = pLinesData[i].receiptDate.length > 0 ? `${pLinesData[i].receiptDate.split("-")[1]}/${pLinesData[i].receiptDate.split("-")[2]}/${pLinesData[i].receiptDate.split("-")[0]}` : "";
                    // let receiptDate = approved || accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE) : new Date(inputReceiptDate);
                    let requiredChanges = approved || accepted? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES) : pLinesData[i].requiredChanges;
    
                    if (!approved)
                    {
                        allLinesApproved = false;
                        if (pLinesData[i].requiredChanges)
                        {
                            let itemName = pLinesData[i].itemName;
                            linesComments += `${itemName}: ${requiredChanges}<br />`;
                        }
                    }
    
                    record.submitFields({
                        type: constants.APPROVAL_REQUEST_LINES.ID,
                        id: result.id,
                        values: {
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY] : lastQty,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY] : newQty,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE] : lastRate,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE] : newRate,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT] : amount,
                            // [constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE] : receiptDate,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES] : requiredChanges,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE] : constants.VENDOR_OR_TOV_TEXT.VENDOR,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_TOV] : approved,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED] : approved
                        }
                    });
                }
            }
        }

        return true;
    });

    // Create records for the comments
    createCommentsData(approvalRequestID, linesComments, pGeneralComment);

    // Update the Approval Request record
    let lastShipDate = pGeneralData.lastShipDate;
    let newShipDate = pGeneralData.newShipDate;
    let isReplacement = pGeneralData.isReplacement;
    updateApprovalRequest(approvalRequestID, lastShipDate, newShipDate, isReplacement, allLinesApproved);

    if (!allLinesApproved)
    {
        // Update Purchase Order status
        updatePurchaseOrder(pPurchaseOrderID);

        // Send notification email to Vendor
        sendNotificationEmail(pPurchaseOrderID, approvalRequestID);
    }
}

// Create a comments record
function createCommentsData(pApprovalRequestID, pLinesComments, pGeneralComment)
{
    if (pLinesComments.length > 0 || pGeneralComment)
    {
        let newApprovalRequestComment = record.create({ type: constants.APPROVAL_REQUEST_COMMENTS.ID });
        newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.APPROVAL_REQUEST, pApprovalRequestID);
        newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT, pGeneralComment);
        newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT, pLinesComments);
        newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE, new Date());
        newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV, constants.VENDOR_OR_TOV_TEXT.TOV);
        newApprovalRequestComment.save();
    }
}

// Update the approval requests record
function updateApprovalRequest(pApprovalRequestID, pLastShipDate, pNewShipDate, pIsReplacement, pAllLinesApproved)
{
    if (pIsReplacement && pAllLinesApproved)
    {
        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: pApprovalRequestID,
            values: {
                [constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] : pLastShipDate,
                [constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] : pNewShipDate,
                [constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED] : true,
                [constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED] : true,
                [constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE] : true,
                [constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] : constants.VENDOR_OR_TOV_TEXT.TOV,
                [constants.APPROVAL_REQUEST.FIELDS.APPROVED] : true
            }
        });
    }
    else
    {
        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: pApprovalRequestID,
            values: {
                [constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] : pLastShipDate,
                [constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] : pNewShipDate,
                [constants.APPROVAL_REQUEST.FIELDS.APPROVED] : pAllLinesApproved,
                [constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] : constants.VENDOR_OR_TOV_TEXT.VENDOR
            }
        });
    }
}

// Update Purchase Order status
function updatePurchaseOrder(pPurchaseOrderID)
{
    record.submitFields({
        type: record.Type.PURCHASE_ORDER,
        id: pPurchaseOrderID,
        values: {
            [constants.PURCHASE_ORDER.FIELDS.STATUS]: constants.PURCHASE_ORDER_STATUSES.VENDOR_ACTION
        }
    })
}

// Send the email with the notification
function sendNotificationEmail(pPurchaseOrderID, pApprovalRequestID)
{
    log.debug("Sending email", "Sending email");
    
    // Merge the email
    let emailRender = render.mergeEmail({
        templateId: constants.EMAIL_TEMPLATES.CHANGE_BY_TOV,
        customRecord: {
            type: constants.APPROVAL_REQUEST.ID,
            id: Number(pApprovalRequestID)
        }
    });

    // Set the subject and body
    let subject = emailRender.subject;
    let body = emailRender.body;

    log.debug("Email Subject", subject);
    log.debug("Email Body", body);

    // Get the Vendor of the Purchase Order
    let vendor = search.lookupFields({
        type: search.Type.PURCHASE_ORDER,
        id: pPurchaseOrderID,
        columns: [
            constants.PURCHASE_ORDER.FIELDS.VENDOR
        ]
    })[constants.PURCHASE_ORDER.FIELDS.VENDOR][0].value;

    // Check if Vendor has access to the portal
    let vendorHasAccess = search.lookupFields({
        type: search.Type.VENDOR,
        id: vendor,
        columns: [ constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS ]
    })[ constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS ];
    let testingEmailSent = false;

    // Get the contacts to send email
    let contacts = getContactsToSendEmail(vendor);
    if (vendorHasAccess || contacts.length > 0)
    {
        // Send the email to each contact
        for (let i = 0; i < contacts.length; i++)
        {
            if (vendorHasAccess || !testingEmailSent)
            {
                (!vendorHasAccess && !testingEmailSent) ? testingEmailSent = true : {};

                let uniqueKey = contacts[i][constants.CONTACT.FIELDS.VENDOR_PORTAL_KEY];
                let link = functions.getSuiteletURL(constants.SCRIPTS.VENDOR_PORTAL_SUITELET.ID, constants.SCRIPTS.VENDOR_PORTAL_SUITELET.DEPLOY, true);
                link += `&key=${uniqueKey}&po=${pPurchaseOrderID}&page=pending-vendor`;
    
                body = body.replace("_page_link_", link);
    
                // Set the recipients
                let recipients;
                if (vendorHasAccess)
                {
                    recipients = [contacts[i][constants.CONTACT.FIELDS.EMAIL]];
                }
                else
                {
                    recipients = [ "roy.cordero@midware.net", "baila@tovfurniture.com" ];
                }

                log.debug("Original to", `Original to: ${recipients}`);
                recipients = [ "roy.cordero@midware.net", "baila@tovfurniture.com" ];
            
                // Send the email
                email.send({
                    author: constants.GENERAL.PURCHASING_EMAIL_AUTHOR,
                    recipients: recipients,
                    subject: subject,
                    body: body,
                    relatedRecords: {
                        transactionId: Number(pPurchaseOrderID)
                    }
                });
            
                log.debug("Email Sent", "Email Sent");
            }
        }
    }
}

// Get Vendor ID using unique code from parameters
function getContactsToSendEmail(pVendorID)
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
            let object = {
                [constants.CONTACT.FIELDS.INTERNALID]: result.id,
                [constants.CONTACT.FIELDS.EMAIL]: result.getValue(constants.CONTACT.FIELDS.EMAIL),
                [constants.CONTACT.FIELDS.COPY_NEW_PO_EMAIL]: result.getValue(constants.CONTACT.FIELDS.COPY_NEW_PO_EMAIL),
                [constants.CONTACT.FIELDS.COPY_VENDOR_PORTAL_UPDATES]: result.getValue(constants.CONTACT.FIELDS.COPY_VENDOR_PORTAL_UPDATES),
                [constants.CONTACT.FIELDS.VENDOR_PORTAL_KEY]: result.getValue(constants.CONTACT.FIELDS.VENDOR_PORTAL_KEY),
                [constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS]: result.getValue({ name: constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS, join: constants.CONTACT.FIELDS.COMPANY })
            };

            contacts.push(object);

            return true;
        });

        log.debug("contacts", contacts);
    }

    return contacts;
}

// Get the name of a specific file
export function getFileData(pFileID)
{
    let fileName = file.load({
        id: pFileID
    });

    return fileName;
}
