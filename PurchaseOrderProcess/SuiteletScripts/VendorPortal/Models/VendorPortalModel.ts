/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as log from 'N/log';
import * as search from 'N/search';
import * as record from 'N/record';
import * as file from 'N/file';
import * as render from 'N/render';
import * as email from 'N/email';

import * as constants from '../../../Global/Constants';
import * as functions from '../../../Global/Functions';
import * as forge from '../../../Global/forge.js';

// Get the Vendors using the cookie
export function getVendors(pCookie) {
    let {valid, email, token} = pCookie;
    let vendors = [];
    let vendorID = null;
    let relatedEmployee = null;
    if (valid) {
        search.create({
            type: search.Type.CONTACT,
            filters: [
                [constants.CONTACT.FIELDS.EMAIL,"is", email],
                "AND",
                [constants.CONTACT.FIELDS.PORTAL_ACCESS_TOKEN, "is", token]
            ],
            columns: [
                search.createColumn({ name: constants.CONTACT.FIELDS.COMPANY }),
                search.createColumn({ name: constants.CONTACT.FIELDS.RELATED_EMPLOYEE })
            ]
        }).run().each(function (result) {
            vendorID = result.getValue(constants.CONTACT.FIELDS.COMPANY);
            relatedEmployee = result.getValue(constants.CONTACT.FIELDS.RELATED_EMPLOYEE);
            return true;
        });
    
        if (vendorID && !relatedEmployee) return [vendorID];
    
        if (relatedEmployee) {
            search.create({
                type: search.Type.VENDOR,
                filters: [
                    [constants.VENDOR.FIELDS.TOV_REP, "is", relatedEmployee]
                ],
                columns: [
                    search.createColumn({ name: constants.EMPLOYEE.FIELDS.INTERNALID })
                ]
            }).run().each(function (result) {
                vendors.push(result.getValue(constants.EMPLOYEE.FIELDS.INTERNALID));
                return true;
            });
    
            return vendors;
        }
        else {
            return [];
        }
    }
    
    return vendors;
}

// Get the name of a Vendor
export function getVendorData(pVendorID) {
    let vendorData = search.lookupFields({
        type: search.Type.VENDOR,
        id: pVendorID,
        columns: [
            constants.VENDOR.FIELDS.INTERNALID,
            constants.VENDOR.FIELDS.ALTNAME,
            constants.VENDOR.FIELDS.LOGO,
            constants.VENDOR.FIELDS.PENDING_ETA_SUBMISSION,
            constants.VENDOR.FIELDS.WEEK_ETA_SUBMITTED,
        ]
    });

    return vendorData;
}

// Get the data of the specific Purchase Order
export function getPurchaseOrderData(pPurchaseOrderID) {
    // Data to return
    let purchaseOrderItems = [];
    let totalCBM = 0;
    let subTotal = 0;
    let total;
    let purchaseOrderData = {
        [constants.PURCHASE_ORDER.FIELDS.TRANID]: "",
        [constants.PURCHASE_ORDER.FIELDS.DATE]: "",
        [constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT]: false,
        [constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER]: false,
        [constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO]: false,
        [constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM]: 0,
        [constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME]: "",
        [constants.PURCHASE_ORDER_OBJECT.VENDOR_UNIQUE_KEY]: "",
        [constants.PURCHASE_ORDER_OBJECT.VENDOR_ID]: "",
        [constants.PURCHASE_ORDER_OBJECT.ITEMS]: []
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
                ["custcol_mw_approval_request_line","noneof","@NONE@"],
                "AND",
                ["internalid", "anyof", pPurchaseOrderID]
            ],
        columns:
            [
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TRANID }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.VENDOR }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TOTAL }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESS }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.LOCATION }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.DATE }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.PARTS_SHIP_METHOD }),
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
                search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE }),
                search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_DISCOUNT }),
                search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE }),
                search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.AMOUNT }),
                search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM }),
                search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.FABRIC_CODE }),
                search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.EXPECTED_RECEIPT_DATE }),
                // search.createColumn({ name: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM_COLLAB }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_VENDOR }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_TOV }),
                search.createColumn({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED })
            ]
    });

    let purchaseOrderSearchResults = purchaseOrderSearch.runPaged({ pageSize: 1000 });
    if (purchaseOrderSearchResults.pageRanges.length > 0) {
        for (let i = 0; i < purchaseOrderSearchResults.pageRanges.length; i++) {
            let page = purchaseOrderSearchResults.fetch({ index: purchaseOrderSearchResults.pageRanges[i].index });
            for (let j = 0; j < page.data.length; j++) {
                let result = page.data[j];

                let quantity = Number(result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY));
                let purchasePrice = Number(result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE));
                subTotal += quantity * purchasePrice;
                totalCBM += quantity * Number(result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM));

                if (!purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.TRANID]) {
                    let isDropship = Number(result.getValue(constants.PURCHASE_ORDER.FIELDS.LOCATION)) === constants.LOCATIONS.DROPSHIP;
                    let isReplacement = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM)) === constants.FORMS.PARTS_ORDER;
                    let shippAddress = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.SHIPADDRESS)).replace(/\r\n/g, '<br>');
                    total = Number(result.getValue(constants.PURCHASE_ORDER.FIELDS.TOTAL)).toFixed(2);

                    purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.TRANID] = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.TRANID));
                    purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.DATE] = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.DATE));
                    purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT] = isReplacement;
                    purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER] = isDropship;
                    purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO] = result.getValue(constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO);
                    purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.PARTS_SHIP_METHOD] = result.getText(constants.PURCHASE_ORDER.FIELDS.PARTS_SHIP_METHOD);
                    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL] = String(total);
                    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SHIPADDRESS] = shippAddress;
                    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.PO_EXPECTED_SHIP_DATE] = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE));
                    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.ALTNAME }));
                    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_ID] = result.getValue(constants.PURCHASE_ORDER.FIELDS.VENDOR);
                    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_UNIQUE_KEY] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.UNIQUE_KEY }));
                    purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.LOGO }));
                }

                purchaseOrderItems.push({
                    [constants.PURCHASE_ORDER_OBJECT.LINE_KEY]: result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY),
                    [constants.PURCHASE_ORDER_OBJECT.ITEM_ID]: result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM),
                    [constants.PURCHASE_ORDER_OBJECT.ITEM_NAME]: String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.ITEM_NAME })),
                    [constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME]: String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.DISPLAY_NAME })),
                    [constants.PURCHASE_ORDER_OBJECT.PURCHASE_PRICE]: String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.PURCHASE_PRICE })),
                    [constants.PURCHASE_ORDER_OBJECT.QUANTITY]: result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY),
                    [constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS]: result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY_ON_SHIPMENTS),
                    [constants.PURCHASE_ORDER_OBJECT.TARIFF_RATE]: result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_RATE),
                    [constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT]: result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_DISCOUNT),
                    [constants.PURCHASE_ORDER_OBJECT.RATE]: result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE),
                    [constants.PURCHASE_ORDER_OBJECT.CBM]: result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM),
                    [constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE]: result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.FABRIC_CODE),
                    [constants.PURCHASE_ORDER_OBJECT.EXPECTED_RECEIPT_DATE]: result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.EXPECTED_RECEIPT_DATE),
                    // [constants.PURCHASE_ORDER_OBJECT.ITEM_COLLAB] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM_COLLAB),
                    [constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY }),
                    [constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY }),
                    [constants.PURCHASE_ORDER_OBJECT.REQ_LAST_PURCH_PRICE]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE }),
                    [constants.PURCHASE_ORDER_OBJECT.REQ_NEW_PURCH_PRICE]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE }),
                    [constants.PURCHASE_ORDER_OBJECT.REQ_LAST_RATE]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE }),
                    [constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE }),
                    [constants.PURCHASE_ORDER_OBJECT.AMOUNT]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT }),
                    [constants.PURCHASE_ORDER_OBJECT.REQ_LAST_CBM]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM }),
                    [constants.PURCHASE_ORDER_OBJECT.REQ_NEW_CBM]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM }),
                    [constants.PURCHASE_ORDER_OBJECT.REQ_EXPECTED_RECEIPT_DATE]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE }),
                    [constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES }),
                    [constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE }),
                    [constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_VENDOR }),
                    [constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_TOV]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_TOV }),
                    [constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED]: result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED })
                });
            }
        }

        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.ITEMS] = purchaseOrderItems;
        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SUBTOTAL] = Number(subTotal !== 0 ? subTotal : total).toFixed(2);
        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_DISCOUNT] = Number(subTotal - total).toFixed(2);
        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM] = Number(totalCBM).toFixed(2);

        log.debug("Purchase Order Data", JSON.stringify(purchaseOrderData));

        return purchaseOrderData;
    }
    else {
        return null;
    }
}

// Get the data of the specific Purchase Order
export function getInboundShipmentData(pInboundShipmentID) {
    // Data to return
    let inboundShipmentItems = [];
    let inboundShipmentData = {
        [constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER]: "",
        [constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS]: "",
        [constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE]: "",
        [constants.INBOUND_SHIPMENT_OBJECT.VENDOR_NAME]: 0,
        [constants.INBOUND_SHIPMENT_OBJECT.VENDOR_ID]: "",
        [constants.INBOUND_SHIPMENT_OBJECT.VENDOR_UNIQUE_KEY]: "",
        [constants.INBOUND_SHIPMENT_OBJECT.LOGO]: "",
        [constants.INBOUND_SHIPMENT_OBJECT.ITEMS]: []
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
                search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.CONFIRMED_DEPARTURE_DATE }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.QUANTITY_EXPECTED }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.RATE }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.AMOUNT }),
                search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.PURCHASE_ORDER, name: constants.PURCHASE_ORDER.FIELDS.LOCATION }),
                search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.ITEM_NAME }),
                search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.DISPLAY_NAME }),
                search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.ALTNAME }),
                search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.UNIQUE_KEY }),
                search.createColumn({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.LOGO }),
            ]
    });

    let inboundShipmentSearchResults = inboundShipmentSearch.runPaged({ pageSize: 1000 });
    if (inboundShipmentSearchResults.pageRanges.length > 0) {
        for (let i = 0; i < inboundShipmentSearchResults.pageRanges.length; i++) {
            let page = inboundShipmentSearchResults.fetch({ index: inboundShipmentSearchResults.pageRanges[i].index });
            for (let j = 0; j < page.data.length; j++) {
                let result = page.data[j];

                if (!inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER]) {
                    inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER] = String(result.getValue(constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER));
                    inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS] = String(result.getValue(constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS));
                    inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE] = String(result.getValue(constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE));
                    inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.CONFIRMED_DEPARTURE_DATE] = String(result.getValue(constants.INBOUND_SHIPMENT.FIELDS.CONFIRMED_DEPARTURE_DATE));
                    inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_NAME] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.ALTNAME }));
                    inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_UNIQUE_KEY] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.UNIQUE_KEY }));
                    inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.LOGO] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.LOGO }));
                }

                inboundShipmentItems.push({
                    [constants.INBOUND_SHIPMENT_OBJECT.ITEM_ID]: result.getValue(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM),
                    [constants.INBOUND_SHIPMENT_OBJECT.ITEM_NAME]: String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.ITEM_NAME })),
                    [constants.INBOUND_SHIPMENT_OBJECT.DISPLAY_NAME]: String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.DISPLAY_NAME })),
                    [constants.INBOUND_SHIPMENT_OBJECT.PURCHASE_ORDER]: result.getText(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.PURCHASE_ORDER),
                    [constants.INBOUND_SHIPMENT_OBJECT.PO_LOCATION]: result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.PURCHASE_ORDER, name: constants.PURCHASE_ORDER.FIELDS.LOCATION }),
                    [constants.INBOUND_SHIPMENT_OBJECT.QUANTITY_EXPECTED]: result.getValue(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.QUANTITY_EXPECTED),
                    [constants.INBOUND_SHIPMENT_OBJECT.RATE]: result.getValue(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.RATE),
                    [constants.INBOUND_SHIPMENT_OBJECT.AMOUNT]: result.getValue(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.AMOUNT)
                });
            }
        }

        inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.ITEMS] = inboundShipmentItems;

        log.debug("Inbound Shipment Data", JSON.stringify(inboundShipmentData));

        return inboundShipmentData;
    }
    else {
        return null;
    }
}

// Get the data of a specifc Approval Request
export function getApprovalRequestData(pVendors, pPurchaseOrderID) {
    let approvalRequestData = {};

    // Search for the Purchase Order
    let approvalRequestSearch = search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters:
            [
                search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, operator: search.Operator.ANYOF, values: [pPurchaseOrderID] }),
                search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.VENDOR, operator: search.Operator.ANYOF, values: pVendors }),
                search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, operator: search.Operator.IS, values: true })
            ],
        columns:
            [
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.INTERNALID }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.DATE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PI_FILE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.APPROVED }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES })
            ]
    });

    let approvalRequestResults = approvalRequestSearch.runPaged({ pageSize: 1000 });
    for (let i = 0; i < approvalRequestResults.pageRanges.length; i++) {
        let page = approvalRequestResults.fetch({ index: approvalRequestResults.pageRanges[i].index });
        for (let j = 0; j < page.data.length; j++) {
            let result = page.data[j];

            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.INTERNALID);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.DATE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.DATE);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PI_FILE);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.APPROVED);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER);
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES);
        }
    }
    
    if (approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS].length) {
        let inboundShipmentData = [];
        let processedInboundShipments = [];
        search.create({
            type: constants.INBOUND_SHIPMENT.ID,
            filters: [
                ['internalid', search.Operator.IS].concat(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS].split(','))
            ],
            columns: [
                search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.CURRENT_READY_DATE }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.DESTINATION_LOCATION }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.BOOKING_STATUS }),
                search.createColumn({ name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS })
            ]
        }).run().each(function (pOrder) {
            if (processedInboundShipments.indexOf(pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID })) === -1)
            {
                processedInboundShipments.push(pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID }));
                inboundShipmentData.push({
                    [constants.INBOUND_SHIPMENT_OBJECT.ISN_INTERNALID]: pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID }),
                    [constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_NUMBER]: pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER }),
                    [constants.INBOUND_SHIPMENT_OBJECT.CURRENT_READY_DATE]: pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.CURRENT_READY_DATE }),
                    [constants.INBOUND_SHIPMENT_OBJECT.DESTINATION_LOCATION]: pOrder.getText({ name: constants.INBOUND_SHIPMENT.FIELDS.DESTINATION_LOCATION }),
                    [constants.INBOUND_SHIPMENT_OBJECT.BOOKING_STATUS]: pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.BOOKING_STATUS }),
                    [constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_STATUS]: pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS })
                })
            }

            return true
        });
        approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS] = inboundShipmentData;
    }

    return approvalRequestData;
}

// Get the Approval Requests of a Vendor
export function getVendorApprovalRequestsData(pVendors) {
    let pendingApprovalRequestData = [];

    // Search for the Purchase Order
    let pendingApprovalRequestSearch = search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters:
            [
                [constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, "is", true],
                "AND",
                [constants.APPROVAL_REQUEST.FIELDS.VENDOR, "anyof", pVendors],
                "AND",
                [`${constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER}.mainline`, "is", true]
            ],
        columns:
            [
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.INTERNALID }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, sort: search.Sort.ASC }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TRANID, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.DATE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESS, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESSEE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.LOCATION, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TOTAL, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.PARTS_SHIP_METHOD, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.VENDOR.FIELDS.ALTNAME, join: constants.APPROVAL_REQUEST.FIELDS.VENDOR }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.DATE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.TOTAL }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PAGE_LINK }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.APPROVED }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS }),
                search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID }),
                search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER }),
                search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.CURRENT_READY_DATE }),
                search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.CONFIRMED_DEPARTURE_DATE }),
                search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.DESTINATION_LOCATION }),
                search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.BOOKING_STATUS }),
                search.createColumn({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS })
            ]
    });

    let pendingApprovalRequestResults = pendingApprovalRequestSearch.runPaged({ pageSize: 1000 });
    for (let i = 0; i < pendingApprovalRequestResults.pageRanges.length; i++) {
        let page = pendingApprovalRequestResults.fetch({ index: pendingApprovalRequestResults.pageRanges[i].index });
        for (let j = 0; j < page.data.length; j++) {
            let result = page.data[j];

            let shippAddress = String(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESS, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER })).replace(/\r\n/g, '<br>');
            let shippAddressee = String(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESSEE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }));
            let isDropship = Number(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.LOCATION, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER })) === constants.LOCATIONS.DROPSHIP;
            let isReplacement = String(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER })) === constants.FORMS.PARTS_ORDER;

            let object = {};
            object[constants.APPROVAL_REQUEST.FIELDS.INTERNALID] = result.id;
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER);
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.TRANID, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_DATE] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.DATE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.EXPECTED_SHIP_DATE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESS] = shippAddress;
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE] = shippAddressee;
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_TOTAL] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.TOTAL, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] = result.getText({ name: constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT] = isReplacement;
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_DROPSHIP] = isDropship;
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_RENEGADE] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_PARTS_SHIP_METHOD] = result.getText({ name: constants.PURCHASE_ORDER.FIELDS.PARTS_SHIP_METHOD, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
            object[constants.APPROVAL_REQUEST.FIELDS.VENDOR] = result.getValue({ name: constants.VENDOR.FIELDS.ALTNAME, join: constants.APPROVAL_REQUEST.FIELDS.VENDOR });
            object[constants.APPROVAL_REQUEST.FIELDS.DATE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.DATE);
            object[constants.APPROVAL_REQUEST.FIELDS.TOTAL] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.TOTAL);
            object[constants.APPROVAL_REQUEST.FIELDS.PAGE_LINK] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PAGE_LINK);
            object[constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT);
            object[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE);
            object[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED);
            object[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED);
            object[constants.APPROVAL_REQUEST.FIELDS.APPROVED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.APPROVED);
            object[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE);
            object[constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED);
            object[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS);
            object[constants.INBOUND_SHIPMENT_OBJECT.ISN_INTERNALID] = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID });
            object[constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_NUMBER] = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER });
            object[constants.INBOUND_SHIPMENT_OBJECT.CURRENT_READY_DATE] = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.CURRENT_READY_DATE });
            object[constants.INBOUND_SHIPMENT_OBJECT.CONFIRMED_DEPARTURE_DATE] = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.CONFIRMED_DEPARTURE_DATE });
            object[constants.INBOUND_SHIPMENT_OBJECT.DESTINATION_LOCATION] = result.getText({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.DESTINATION_LOCATION });
            object[constants.INBOUND_SHIPMENT_OBJECT.BOOKING_STATUS] = result.getText({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.BOOKING_STATUS });
            object[constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_STATUS] = result.getValue({ join: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS, name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS });
            pendingApprovalRequestData.push(object);
        }
    }

    return pendingApprovalRequestData;
}

// Get the Comments of a specific Approval Request
export function getApprovalRequestCommentsData(pApprovalRequestID) {
    let approvalRequestCommentsData = [];

    // Search for the Purchase Order
    let approvalRequestCommentsSearch = search.create({
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

    approvalRequestCommentsSearch.run().each(function (result) {

        approvalRequestCommentsData.push({
            [constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE]: result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE),
            [constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT]: result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT),
            [constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT]: result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT),
            [constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV]: result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV)
        });

        return true;
    });

    return approvalRequestCommentsData;
}

// Update the data of the Purchase Order lines
export function updatePurchaseOrderData(pPurchaseOrderID, pGeneralData, pLinesData, pGeneralComment, pPIFileContent, pLoadPlanContent) {
    let linesComments = "";
    let approvalRequestID;
    let allLinesAccepted = true;
    let allLinesPreviouslyApproved = true;

    // Get the Approval Request Lines
    let approvalRequestLinesSearch = search.create({
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
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES }),
            search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE })
        ]
    });

    // Loop through existing Netsuite lines
    let approvalRequestLinesSearchResults = approvalRequestLinesSearch.runPaged({ pageSize: 1000 });
    for (let i = 0; i < approvalRequestLinesSearchResults.pageRanges.length; i++) {
        let page = approvalRequestLinesSearchResults.fetch({ index: approvalRequestLinesSearchResults.pageRanges[i].index });
        for (let j = 0; j < page.data.length; j++) {
            let result = page.data[j];

            approvalRequestID = approvalRequestID ? approvalRequestID : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST);

            // let lineAlreadyApproved = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED);

            // Loop through all lines coming on request
            allLinesPreviouslyApproved = false;
            for (let i = 0; i < pLinesData.length; i++) {
                let lineUniqueKey = pLinesData[i].lineKey;
                if (lineUniqueKey === result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY)) {
                    let accepted = pLinesData[i].accepted;
                    let lastQty = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY) : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY);
                    let newQty = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY) : pLinesData[i].quantity;
                    let lastPurchasePrice = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE) : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE);
                    let newPurchasePrice = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE) : pLinesData[i].purchasePrice;
                    let lastRate = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE) : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE);
                    let newRate = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE) : pLinesData[i].rate;
                    let amount = newQty * newRate;
                    let lastCBM = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM) : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM);
                    let newCBM = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM) : pLinesData[i].cbm;
                    let requiredChanges = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES) : pLinesData[i].requiredChanges;

                    if (!accepted) {
                        allLinesAccepted = false;
                        if (pLinesData[i].requiredChanges) {
                            let itemName = pLinesData[i].itemName;
                            linesComments += `${itemName}: ${requiredChanges}<br />`;
                        }
                    }

                    // Submit data on the NS line
                    record.submitFields({
                        type: constants.APPROVAL_REQUEST_LINES.ID,
                        id: result.id,
                        values: {
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY]: lastQty,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY]: newQty,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE]: lastPurchasePrice,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE]: newPurchasePrice,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE]: lastRate,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE]: newRate,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT]: amount,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM]: lastCBM,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM]: newCBM,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES]: requiredChanges,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE]: constants.VENDOR_OR_TOV_TEXT.TOV,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_VENDOR]: accepted,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_TOV] : accepted,
                            [constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED]: accepted
                        }
                    });
                }
            }
        }
    }

    // Create records for the comments
    createCommentsData(approvalRequestID, linesComments, pGeneralComment);

    // Send notification email
    let justPIFileUpload = (allLinesPreviouslyApproved && pPIFileContent) ? true : false;
    if (!allLinesAccepted || justPIFileUpload) {
        // Send notification email to PO Planner
        sendNotificationEmail(pPurchaseOrderID, approvalRequestID, justPIFileUpload)
    }

    // Attach the PI File if present
    let PIfileID = null;
    if (pPIFileContent) {
        log.debug("pPIFileContent", pPIFileContent);
        PIfileID = attachPIFile(pPurchaseOrderID, pPIFileContent);
    }

    // Attach the PI File if present
    let loadPlanFileID = null;
    if (pLoadPlanContent) {
        log.debug("pLoadPlanContent", pLoadPlanContent);
        loadPlanFileID = attachLoadPlanFile(pPurchaseOrderID, pLoadPlanContent);
    }

    // Update the Approval Request record
    let lastShipDate = pGeneralData.lastShipDate;
    let newShipDate = pGeneralData.newShipDate;
    let shipDateChangeReason = pGeneralData.shipDateChangeReason;
    let isReplacement = pGeneralData.isReplacement;
    let isDropship = pGeneralData.isDropship;
    let total = pGeneralData.total;
    updateApprovalRequest(approvalRequestID, allLinesAccepted, lastShipDate, newShipDate, shipDateChangeReason, isReplacement, isDropship, total, !!pPIFileContent, PIfileID, !!pLoadPlanContent, loadPlanFileID);

    if (!allLinesAccepted) {
        // Update Purchase Order status
        updatePurchaseOrderStatus(pPurchaseOrderID, constants.PURCHASE_ORDER_STATUSES.TOV_ACTION);
    }
}

// Create a comments record
function createCommentsData(pApprovalRequestID, pLinesComments, pGeneralComment) {
    if (pLinesComments.length > 0 || pGeneralComment) {
        let newApprovalRequestComment = record.create({ type: constants.APPROVAL_REQUEST_COMMENTS.ID });
        newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.APPROVAL_REQUEST, pApprovalRequestID);
        newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT, pGeneralComment);
        newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT, pLinesComments);
        newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE, new Date());
        newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV, constants.VENDOR_OR_TOV_TEXT.VENDOR);
        newApprovalRequestComment.save();
    }
}

// Update the approval requests record
function updateApprovalRequest(pApprovalRequestID, pAllLinesAccepted, pLastShipDate, pNewShipDate, pShipDateChangeReason, pIsReplacement, pIsDropship, pTotal, pThereIsPIFIle, pPIfileID, pThereIsLoadPlan, pLoadPlanFileID) {
    if (pIsReplacement && pAllLinesAccepted) {
        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: pApprovalRequestID,
            values: {
                [constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE]: pLastShipDate,
                [constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE]: pNewShipDate,
                [constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON]: pShipDateChangeReason,
                [constants.APPROVAL_REQUEST.FIELDS.TOTAL]: pTotal,
                [constants.APPROVAL_REQUEST.FIELDS.VENDOR_ANSWERED_ORIGINAL_REQUEST]: true,
                [constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED]: true,
                [constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED]: true,
                [constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE]: true,
                [constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE]: constants.VENDOR_OR_TOV_TEXT.VENDOR,
                [constants.APPROVAL_REQUEST.FIELDS.APPROVED]: true
            }
        });
    }
    else {
        // If the order is being approved by the Vendor, the request will remain on its side
        let vendorOrTOVSide = (pAllLinesAccepted && !pThereIsLoadPlan) ? constants.VENDOR_OR_TOV_TEXT.VENDOR : constants.VENDOR_OR_TOV_TEXT.TOV;
        let loadPlanUploaded = pIsDropship && pAllLinesAccepted && pThereIsPIFIle ? true : pThereIsLoadPlan;
        let isnComplete = pIsDropship && pAllLinesAccepted && pThereIsPIFIle ? true : false;

        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: pApprovalRequestID,
            values: {
                [constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE]: pLastShipDate,
                [constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE]: pNewShipDate,
                [constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON]: pShipDateChangeReason,
                [constants.APPROVAL_REQUEST.FIELDS.TOTAL]: pTotal,
                [constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED]: pThereIsPIFIle,
                [constants.APPROVAL_REQUEST.FIELDS.PI_FILE]: pPIfileID,
                [constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED]: loadPlanUploaded,
                [constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE]: isnComplete,
                [constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED]: isnComplete,
                [constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN]: pLoadPlanFileID,
                [constants.APPROVAL_REQUEST.FIELDS.VENDOR_ANSWERED_ORIGINAL_REQUEST]: true,
                [constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE]: vendorOrTOVSide,
                [constants.APPROVAL_REQUEST.FIELDS.APPROVED]: pAllLinesAccepted
            }
        });
    }
}

// Update the approval requests record to set the PI File as uploaded
function setAsPIFIleUploaded(pApprovalRequestID, pPIFileID) {
    record.submitFields({
        type: constants.APPROVAL_REQUEST.ID,
        id: pApprovalRequestID,
        values: {
            [constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED]: true,
            [constants.APPROVAL_REQUEST.FIELDS.PI_FILE]: pPIFileID
        }
    });
}

// Update the approval requests record to set the Load Plan as uploaded
function setAsLoadPlanUploaded(pApprovalRequestID, pLoadPlanID) {
    record.submitFields({
        type: constants.APPROVAL_REQUEST.ID,
        id: pApprovalRequestID,
        values: {
            [constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED]: true,
            [constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN]: pLoadPlanID,
            [constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE]: constants.VENDOR_OR_TOV_TEXT.TOV
        }
    });
}

// Update Purchase Order status
function updatePurchaseOrderStatus(pPurchaseOrderID, pStatus) {
    record.submitFields({
        type: record.Type.PURCHASE_ORDER,
        id: pPurchaseOrderID,
        values: {
            [constants.PURCHASE_ORDER.FIELDS.STATUS]: pStatus
        }
    })
}

// Send the email with the notification
function sendNotificationEmail(pPurchaseOrderID, pApprovalRequestID, pJustPIFileUpload) {
    log.debug("Sending email", "Sending email");

    // Merge the email
    let templateID;
    if (pJustPIFileUpload) {
        templateID = constants.EMAIL_TEMPLATES.VENDOR_UPLOADED_PI;
    }
    else {
        templateID = constants.EMAIL_TEMPLATES.CHANGE_BY_VENDOR;
    }
    log.debug("templateID", templateID);

    let emailRender = render.mergeEmail({
        templateId: templateID,
        customRecord: {
            type: constants.APPROVAL_REQUEST.ID,
            id: Number(pApprovalRequestID)
        }
    });

    // Set the subject and body
    let subject = emailRender.subject;
    let body = emailRender.body;

    log.debug("Email Body", emailRender.body);
    log.debug("Email Subject", emailRender.subject);

    // Get the data of the Purchase Order
    let purchaseOrderData = search.lookupFields({
        type: search.Type.PURCHASE_ORDER,
        id: pPurchaseOrderID,
        columns: [
            constants.PURCHASE_ORDER.FIELDS.VENDOR,
            constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO,
            constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM,
            constants.PURCHASE_ORDER.FIELDS.LOCATION
        ]
    });

    let vendor = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR] ? purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR][0].value : null;
    let isRenegade = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO];
    let customForm = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM] && purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM][0] ? purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM][0].value : null;
    let isPartsOrder = String(customForm) === constants.FORMS.PARTS_ORDER;
    let isDropship = Number(purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.LOCATION]) === constants.LOCATIONS.DROPSHIP;

    // Get the data of the Vendor
    let vendorData = search.lookupFields({
        type: search.Type.VENDOR,
        id: vendor,
        columns: [
            constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS,
            constants.VENDOR.FIELDS.TOV_REP
        ]
    });

    let vendorHasAccess = vendorData[constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS];
    let vendorTOVRep = vendorData[constants.VENDOR.FIELDS.TOV_REP] ? vendorData[constants.VENDOR.FIELDS.TOV_REP][0].value : null;

    let recipients = [constants.EMPLOYEES.BAILA];
    log.debug("Recipients", `Recipients: ${recipients}`);
    let cc;
    if (vendorHasAccess) {
        let modules = [constants.EMAIL_MODULES.ALL_PURCHASE_ORDERS];
        (isRenegade) ? modules.push(constants.EMAIL_MODULES.RENEGADE_PURCHASE_ORDERS) : {};
        (isPartsOrder) ? modules.push(constants.EMAIL_MODULES.PARTS_PURCHASE_ORDERS) : {};
        log.debug("isPartsOrder", isPartsOrder);
        log.debug("modules", modules);
        cc = functions.getEmailSubscribers(modules);
        if (isDropship) {
            // Remove Bruce if it is a dropship order
            cc = functions.removeElementFromArray(cc, -5);
        }
        if (vendorTOVRep) {
            cc.push(vendorTOVRep);
        }
        log.debug("cc", cc);
    }
    else {
        cc = [];
    }
    log.debug("CC", `CC: ${cc}`);

    // Send the email
    email.send({
        author: constants.GENERAL.PURCHASING_EMAIL_AUTHOR,
        recipients: recipients,
        cc: cc,
        subject: subject,
        body: body,
        relatedRecords: {
            transactionId: Number(pPurchaseOrderID)
        }
    });

    log.debug("Email Sent", "Email Sent");
}

// Attach the PI file to the purchase order
function attachPIFile(pPurchaseOrderID, pFileContent) {
    pFileContent = JSON.parse(pFileContent);
    let fileType = getFileTypeId(pFileContent.type);
    let fileContents = getContentsWithCorrectEncoding(pFileContent);

    let newFile = file.create({
        name: pFileContent.name,
        fileType: fileType,
        contents: fileContents,
        folder: constants.GENERAL.PI_FILES_FOLDER_ID,
        isOnline: true
    });

    let fileId = newFile.save();

    record.attach({
        record: {
            type: "file",
            id: fileId
        },
        to: {
            type: record.Type.PURCHASE_ORDER,
            id: pPurchaseOrderID
        }
    });

    return fileId;
}

// Attach the Load Plan file to the purchase order
function attachLoadPlanFile(pPurchaseOrderID, pFileContent) {
    pFileContent = JSON.parse(pFileContent);
    let fileType = getFileTypeId(pFileContent.type);
    let fileContents = getContentsWithCorrectEncoding(pFileContent);

    let newFile = file.create({
        name: pFileContent.name,
        fileType: fileType,
        contents: fileContents,
        folder: constants.GENERAL.LOAD_PLANS_FOLDER_ID,
        isOnline: true
    });

    let fileId = newFile.save();

    record.attach({
        record: {
            type: "file",
            id: fileId
        },
        to: {
            type: record.Type.PURCHASE_ORDER,
            id: pPurchaseOrderID
        }
    });

    return fileId;
}

// Get the type ID of a file
function getFileTypeId(pContentType) {
    const GENERAL_DEFAULT_FILE_TYPE_ID = "PLAINTEXT";

    const MULTIPART_TYPES = {
        "application/json": "JSON",
        "application/msword": "WORD",
        "application/pdf": "PDF",
        "application/postscript": "POSTSCRIPT",
        "application/rtf": "RTF",
        "application/sms": "SMS",
        "application/vnd.ms-excel": "EXCEL",
        "application/vnd.ms-powerpoint": "POWERPOINT",
        "application/vnd.ms-project": "MSPROJECT",
        "application/vnd.visio": "VISIO",
        "application/x-autocad": "AUTOCAD",
        "application/x-gzip-compressed": "GZIP",
        "application/x-shockwave-flash": "FLASH",
        "application/zip": "ZIP",
        "audio/mpeg": "MP3",
        "image/gif": "GIFIMAGE",
        "image/ico": "ICON",
        "image/jpeg": "JPGIMAGE",
        "image/pjpeg": "PJPGIMAGE",
        "image/tiff": "TIFFIMAGE",
        "image/x-png": "PNGIMAGE",
        "image/x-xbitmap": "BMPIMAGE",
        "message/rfc822": "MESSAGERFC",
        "text/css": "STYLESHEET",
        "text/csv": "CSV",
        "text/html": "HTMLDOC",
        "text/javascript": "JAVASCRIPT",
        "text/plain": "PLAINTEXT",
        "text/xml": "XMLDOC",
        "video/mpeg": "MPEGMOVIE",
        "video/quicktime": "QUICKTIME",
        //from here on, were added manually. Mostly for office suite type documents and open office documents
        "application/vnd.oasis.opendocument.text": "WORD",
        "application/vnd.oasis.opendocument.spreadsheet": "EXCEL",
        "application/vnd.oasis.opendocument.presentation": "POWERPOINT",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "WORD",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "EXCEL",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation ": "POWERPOINT"
    };

    const CONTENT_TYPES = ["application", "audio", "image", "message", "text", "video"];

    const DEFAULT_FILE_TYPES_IDS = {
        application: "ZIP",
        audio: "MP3",
        image: "JPGIMAGE",
        message: "MESSAGERFC",
        text: "PLAINTEXT",
        video: "MPEGMOVIE"
    };

    // Check for the ones that Netsuite specifies
    let fileTypeID = MULTIPART_TYPES[pContentType];

    // If no fileTypeID, return a default
    if (!fileTypeID) {
        let contentType = pContentType.split("/")[0];

        if (CONTENT_TYPES.indexOf(contentType) != -1) {
            return DEFAULT_FILE_TYPES_IDS[contentType];
        }

        return GENERAL_DEFAULT_FILE_TYPE_ID;
    }

    return fileTypeID;
}

// Get the contents after encoding
function getContentsWithCorrectEncoding(pResponseFile) {
    const APPLICATION_EXCEPTIONS = ["application/json", "application/postscript"];
    let contents = pResponseFile.contents.substr(pResponseFile.contents.indexOf(",") + 1);
    let fileType = pResponseFile.type.split("/")[0];
    if (fileType == "text" || fileType == "message" || APPLICATION_EXCEPTIONS.indexOf(pResponseFile.type) != -1) {
        return forge.util.decode64(contents);
    } else {
        return contents;
    }
}

// Get the name of a specific file
export function getFileData(pFileID) {
    let fileData = search.lookupFields({
        type: "file",
        id: pFileID,
        columns: ["name", "url"]
    });

    return fileData;
}

// Upload a PI File on the Purchase Order
export function uploadPIFile(pPurchaseOrderID, pPIFileContent) {
    // Attach the PI file to the purchase order
    let piFileID = attachPIFile(pPurchaseOrderID, pPIFileContent);

    // Get the Approval Request
    let approvalRequest = search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters: [
            search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, operator: search.Operator.IS, values: pPurchaseOrderID }),
            search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, operator: search.Operator.IS, values: true })
        ],
        columns: [
            search.createColumn({ name: "internalid" })
        ]
    }).run().getRange({ start: 0, end: 1 });

    let approvalRequestID = approvalRequest[0].id;

    // Update the approval requests record to set the PI File as uploaded
    setAsPIFIleUploaded(approvalRequestID, piFileID);
}

// Upload a Load Plan on the Purchase Order
export function uploadLoadPlan(pPurchaseOrderID, pLoadPlanContent) {
    // Attach the PI file to the purchase order
    let loadPlanID = attachLoadPlanFile(pPurchaseOrderID, pLoadPlanContent);

    // Get the Approval Request
    let approvalRequest = search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters: [
            search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, operator: search.Operator.IS, values: pPurchaseOrderID }),
            search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, operator: search.Operator.IS, values: true })
        ],
        columns: [
            search.createColumn({ name: "internalid" })
        ]
    }).run().getRange({ start: 0, end: 1 });

    let approvalRequestID = approvalRequest[0].id;
    let loadPlanAlreadyUploaded = approvalRequest[0][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];

    // Update the approval requests record to set the Load Plan as uploaded
    setAsLoadPlanUploaded(approvalRequestID, loadPlanID);

    if (!loadPlanAlreadyUploaded) {
        // Send notification email to PO Planner
        sendLoadPlanNotificationEmail(pPurchaseOrderID, approvalRequestID);
    }
}

// Send the email with the notification
function sendLoadPlanNotificationEmail(pPurchaseOrderID, pApprovalRequestID) {
    log.debug("Sending email", "Sending email");

    // Merge the email
    let templateID = constants.EMAIL_TEMPLATES.VENDOR_UPLOADED_LOAD_PLAN;
    log.debug("templateID", templateID);

    let emailRender = render.mergeEmail({
        templateId: templateID,
        customRecord: {
            type: constants.APPROVAL_REQUEST.ID,
            id: Number(pApprovalRequestID)
        }
    });

    // Set the subject and body
    let subject = emailRender.subject;
    let body = emailRender.body;

    log.debug("Email Body", emailRender.body);
    log.debug("Email Subject", emailRender.subject);

    // Get the data of the Purchase Order
    let purchaseOrderData = search.lookupFields({
        type: search.Type.PURCHASE_ORDER,
        id: pPurchaseOrderID,
        columns: [
            constants.PURCHASE_ORDER.FIELDS.VENDOR,
            constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO,
            constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM,
            constants.PURCHASE_ORDER.FIELDS.LOCATION
        ]
    });

    let vendor = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR] ? purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR][0].value : null;
    let isRenegade = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO];
    let customForm = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM] && purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM][0] ? purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM][0].value : null;
    let isPartsOrder = String(customForm) === constants.FORMS.PARTS_ORDER;
    let isDropship = Number(purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.LOCATION]) === constants.LOCATIONS.DROPSHIP;

    // Get the data of the Vendor
    let vendorData = search.lookupFields({
        type: search.Type.VENDOR,
        id: vendor,
        columns: [
            constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS,
            constants.VENDOR.FIELDS.TOV_REP
        ]
    });

    let vendorHasAccess = vendorData[constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS];
    let vendorTOVRep = vendorData[constants.VENDOR.FIELDS.TOV_REP] ? vendorData[constants.VENDOR.FIELDS.TOV_REP][0].value : null;

    let recipients = [constants.EMPLOYEES.BAILA];
    log.debug("Recipients", `Recipients: ${recipients}`);
    let cc;
    if (vendorHasAccess) {
        let modules = [constants.EMAIL_MODULES.ALL_PURCHASE_ORDERS];
        (isRenegade) ? modules.push(constants.EMAIL_MODULES.RENEGADE_PURCHASE_ORDERS) : {};
        (isPartsOrder) ? modules.push(constants.EMAIL_MODULES.PARTS_PURCHASE_ORDERS) : {};
        cc = functions.getEmailSubscribers(modules);
        if (isDropship) {
            // Remove Bruce if it is a dropship order
            cc = functions.removeElementFromArray(cc, -5);
        }
        if (vendorTOVRep) {
            cc.push(vendorTOVRep);
        }
    }
    else {
        cc = [];
    }
    log.debug("CC", `CC: ${cc}`);

    // Send the email
    email.send({
        author: constants.GENERAL.SHIPMENT_EMAIL_AUTHOR,
        recipients: recipients,
        cc: cc,
        subject: subject,
        body: body,
        relatedRecords: {
            transactionId: Number(pPurchaseOrderID)
        }
    });

    log.debug("Email Sent", "Email Sent");
}

// Reset the password on the contact record
export function resetPassword(pUserID, pPassword) 
{
    let hashedPassword = encodePassword(pPassword);
    
    record.submitFields({type : record.Type.CONTACT, id : pUserID, values : { 
        [constants.CONTACT.FIELDS.PORTAL_PASSWORD] : hashedPassword, 
        [constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN] : null, 
        [constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION] : null
    }});
}

// Encode the incoming password
function encodePassword(pPassword) 
{
    let messageDigest = forge.md.sha256.create();
    messageDigest.update(pPassword);
    let hashedPassword = messageDigest.digest().toHex();

    return hashedPassword;
}

//Validates if the user is registered in the Vendor Portal
//If the same email is registered twice or more, it takes the first one 
export function validateContact(pUserEmail) 
{
    let internalid = 0;

    search.create({
        type: "contact",
        filters:
        [
            ["email","is", pUserEmail],
            "AND",
            [constants.CONTACT.FIELDS.VENDOR_PORTAL,"is","T"],
            "AND",
            [
                ["company.type","anyof","Vendor"],
                "OR",
                ["custentity_mw_contact_related_employee","isnotempty", ""]
            ]
        ],
        columns:
        [
           "internalid"
        ]
     }).run().each(function(contact)
     {
        if (internalid == 0) internalid = Number(contact.getValue("internalid"));

        return true;
     });

    return internalid;
}

// Attach the Shipment Related files
export function attachShipmentRelatedFiles(pFilesContents) {
    let fileIDs = [];
    for (let i = 0; i < pFilesContents.length; i ++) {
        let actualFile = JSON.parse(pFilesContents[i].content);
        let fileType = getFileTypeId(actualFile.type);
        let fileContents = getContentsWithCorrectEncoding(actualFile);

        let newFile = file.create({
            name: actualFile.name,
            fileType: fileType,
            contents: fileContents,
            folder: constants.GENERAL.LOAD_PLANS_FOLDER_ID,
            isOnline: true
        });
    
        let fileID = newFile.save();
        fileIDs.push({
            "type": pFilesContents[i].id,
            "fileID": fileID
        });
    }

    return fileIDs;
}

// Mark the Inbound Shipment as In Transit
export function markShipmentAsInTransit(pInboundShipmentID, pPurchaseOrderID, pContainerNumber, pFileIDs) {
    log.debug("markShipmentAsInTransit", "markShipmentAsInTransit");
    let values = {
        [constants.INBOUND_SHIPMENT.FIELDS.STATUS]: "inTransit"
    };

    if (pContainerNumber)
    {
        values[constants.INBOUND_SHIPMENT.FIELDS.COINTAINER_NUMBER] = pContainerNumber;
    }

    for (let i = 0; i < pFileIDs.length; i++) {
        if (String(pFileIDs[i].type).indexOf("tsca-regulation-file") !== -1) {
            values[constants.INBOUND_SHIPMENT.FIELDS.TSCA_FILE] = pFileIDs[i].fileID;
        }
        else if (String(pFileIDs[i].type).indexOf("packing-slip-file") !== -1) {
            values[constants.INBOUND_SHIPMENT.FIELDS.PACK_SLIP_FILE] = pFileIDs[i].fileID;
        }
        else if (String(pFileIDs[i].type).indexOf("loading-report-file") !== -1) {
            values[constants.INBOUND_SHIPMENT.FIELDS.LOADING_REPORT_FILE] = pFileIDs[i].fileID;
        }
        else if (String(pFileIDs[i].type).indexOf("other-shipment-file") !== -1) {
            values[constants.INBOUND_SHIPMENT.FIELDS.OTHER_FILE] = pFileIDs[i].fileID;
        }
    }

    record.submitFields({
        type: record.Type.INBOUND_SHIPMENT,
        id: pInboundShipmentID,
        values: values
    });

    // Send the email with the notification
    sendMarkAsInTransitEmails(pInboundShipmentID, pPurchaseOrderID, pContainerNumber, pFileIDs);
}

// Send the emails with notifications to TOV and the Vendor
function sendMarkAsInTransitEmails(pInboundShipmentID, pPurchaseOrderID, pContainerNumber, pFileIDs) {

    // Send the email with the notification to TOV
    sendMarkAsInTransitEmailToTOV(pInboundShipmentID, pPurchaseOrderID, pContainerNumber, pFileIDs);

    // Send the email with the notification to the Vendor
    sendMarkAsInTransitEmailToVendor(pInboundShipmentID, pPurchaseOrderID, pContainerNumber, pFileIDs);
}

// Send the email with the notification to TOV
function sendMarkAsInTransitEmailToTOV(pInboundShipmentID, pPurchaseOrderID, pContainerNumber, pFileIDs) {

    log.debug("Sending email to TOV", "Sending email to TOV");

    // Get the ids of the files
    let files = [];
    for (let i = 0; i < pFileIDs.length; i ++) {
        let actualFile = file.load({ id: pFileIDs[i].fileID });
        files.push(actualFile);
    }

    // Get the name of the Vendor of a Purchase Order
    let vendorName = getVendorName(pPurchaseOrderID);

    // Set the subject and body
    let subject = `ISN-${pInboundShipmentID} Container ${pContainerNumber}`;
    (vendorName) ? subject += ` from ${vendorName} has shipped` : subject += ` has shipped`;

    let body = `Please be aware that ISN-${pInboundShipmentID} Container ${pContainerNumber}`;
    (vendorName) ? body += ` from ${vendorName} has been marked as in transit.<br><br>` : body += ` has been marked as in transit.<br><br>`;

    let inboundShipmentLink = functions.getRecordLink("inboundshipment", pInboundShipmentID);
    body += `<a href="${inboundShipmentLink}" target="_blank">View record</a><br>`;

    log.debug("Email Subject", subject);
    log.debug("Email Body", body);

    let modules = [constants.EMAIL_MODULES.SHIPMENTS];
    let cc = functions.getEmailSubscribers(modules);

    // Send the email
    email.send({
        author: constants.GENERAL.SHIPMENT_EMAIL_AUTHOR,
        recipients: [constants.GENERAL.SHIPMENT_EMAIL_AUTHOR],
        cc: cc,
        // recipients: ["roy.cordero@midware.net", "baila@tovfurniture.com"],
        subject: subject,
        body: body,
        attachments: files
    });

    log.debug("Email Sent", "Email Sent");
}

// Get the name of the Vendor of a Purchase Order
function getVendorName(pPurchaseOrderID)
{
    let vendorID = search.lookupFields({
        type: search.Type.PURCHASE_ORDER,
        id: pPurchaseOrderID,
        columns: [ constants.PURCHASE_ORDER.FIELDS.VENDOR ]
    })[ constants.PURCHASE_ORDER.FIELDS.VENDOR ];

    if (vendorID)
    {
        return vendorID[0].text;
    }
    else
    {
        return null;
    }
}

// Send the email with the notification to the Vendor
function sendMarkAsInTransitEmailToVendor(pInboundShipmentID, pPurchaseOrderID, pContainerNumber, pFileIDs) {

    log.debug("Sending email to Vendor", "Sending email to Vendor");
    
    // Get the ids of the files
    let files = [];
    for (let i = 0; i < pFileIDs.length; i ++) {
        let actualFile = file.load({ id: pFileIDs[i].fileID });
        files.push(actualFile);
    }

    // Set the subject and body
    let subject = `ISN-${pInboundShipmentID} Container ${pContainerNumber} has been successfully updated`;

    let body = `Please be aware that you have successfully updated ISN-${pInboundShipmentID} Container ${pContainerNumber} and your shipment has been marked as in transit. Should you have any questions or need assistance, please reach out to your account manager.<br><br>`;

    let link = functions.getSuiteletURL(constants.SCRIPTS.VENDOR_PORTAL_SUITELET.ID, constants.SCRIPTS.VENDOR_PORTAL_SUITELET.DEPLOY, true);
    link += `&po=${pPurchaseOrderID}&isn=${pInboundShipmentID}&page=load-plans`;
    body += `<a href="${link}" target="_blank">View record</a><br>`;

    log.debug("Email Subject", subject);
    log.debug("Email Body", body);

    // Get the data of the Purchase Order
    let purchaseOrderData = search.lookupFields({
        type: search.Type.PURCHASE_ORDER,
        id: pPurchaseOrderID,
        columns: [
            constants.PURCHASE_ORDER.FIELDS.VENDOR
        ]
    });

    let vendorID = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR] ? purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR][0].value : null;

    // Get the data of the Vendor
    let vendorData = search.lookupFields({
        type: search.Type.VENDOR,
        id: vendorID,
        columns: [
            constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS,
            constants.VENDOR.FIELDS.TOV_REP
        ]
    });

    let vendorTOVRep = vendorData[constants.VENDOR.FIELDS.TOV_REP] ? vendorData[constants.VENDOR.FIELDS.TOV_REP][0].value : null;

    // Check if Vendor has access to the portal
    let vendorHasAccess = vendorData[constants.VENDOR.FIELDS.VENDOR_PORTAL_ACCESS];

    // If Indian Vendor, send the data to the TOV Rep
    let isIndianVendor = Number(vendorTOVRep) === constants.GENERAL.INDIAN_VENDORS_TOV_REP;
    sendEmailToContacts(vendorID, vendorHasAccess, vendorTOVRep, isIndianVendor, subject, body);
}

// Send the email to the related contacts of the Vendor
function sendEmailToContacts(pVendorID, pVendorHasAccess, pVendorTOVRep, pIndianVendor, pSubject, pBody)
{
    // Get the contacts to send email
    let contacts = (pIndianVendor) ? getContactsWithRelatedEmp(pVendorTOVRep) : getContactsWithVendor(pVendorID);
    if (!pVendorHasAccess || contacts.length > 0)
    {
        // Set the recipients
        let recipients = (pVendorHasAccess) ? contacts : [ "roy.cordero@midware.net", "baila@tovfurniture.com" ];
        log.debug("Recipients", `Recipients: ${recipients}`);
    
        // Send the email
        email.send({
            author: constants.GENERAL.SHIPMENT_EMAIL_AUTHOR,
            recipients: recipients,
            subject: pSubject,
            body: pBody
        });
    
        log.debug("Email Sent", "Email Sent");
    }
}

// Get the contacts to send the email using the Vendor ID
function getContactsWithVendor(pVendorID)
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

            contacts.push(result.id);

            return true;
        });

        log.debug("contacts", contacts);
    }

    return contacts;
}

// Get the contacts to send the email using the TOV Rep
function getContactsWithRelatedEmp(pTOVRep)
{
    let contacts = [];
    if (pTOVRep)
    {
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

// Store the file IDs on the approval request
export function storeShipmentRelatedFilesIDs(pPurchaseOrderID, pFileIDs) {
    // Get the Approval Request data
    let approvalRequest = search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters: [
            search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, operator: search.Operator.IS, values: pPurchaseOrderID }),
            search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, operator: search.Operator.IS, values: true })
        ],
        columns: [
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES })
        ]
    }).run().getRange({ start: 0, end: 1 });

    let approvalRequestID = approvalRequest[0].id;
    let actualShipmentRelatedFiles = approvalRequest[0].getValue(constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES);
    let shipmentRelatedFiles = actualShipmentRelatedFiles ? JSON.parse(String(actualShipmentRelatedFiles)) : {};

    for (let i = 0; i < pFileIDs.length; i++) {
        if (String(pFileIDs[i].type).indexOf("tsca-regulation-file") !== -1) {
            shipmentRelatedFiles["tsca-regulation-file"] = pFileIDs[i].fileID;
        }
        else if (String(pFileIDs[i].type).indexOf("packing-slip-file") !== -1) {
            shipmentRelatedFiles["packing-slip-file"] = pFileIDs[i].fileID;
        }
        else if (String(pFileIDs[i].type).indexOf("loading-report-file") !== -1) {
            shipmentRelatedFiles["loading-report-file"] = pFileIDs[i].fileID;
        }
        else if (String(pFileIDs[i].type).indexOf("other-shipment-file") !== -1) {
            shipmentRelatedFiles["other-shipment-file"] ? shipmentRelatedFiles["other-shipment-file"].push(pFileIDs[i].fileID) : shipmentRelatedFiles["other-shipment-file"] = [pFileIDs[i].fileID];
        }
    }

    // Submit the file IDs
    record.submitFields({
        type: constants.APPROVAL_REQUEST.ID,
        id: approvalRequestID,
        values: {
            [constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES]: JSON.stringify(shipmentRelatedFiles)
        }
    });
}
