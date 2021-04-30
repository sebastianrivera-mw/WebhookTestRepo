/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/search", "N/record", "N/render", "N/email", "N/file", "../../../Global/Constants", "../../../Global/Functions", "../../../Global/forge.js"], function (require, exports, log, search, record, render, email, file, constants, functions, forge) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get the data of the specific Purchase Order
    function getPurchaseOrderData(pVendorID, pPurchaseOrderID) {
        var _a, _b;
        // Data to return
        var purchaseOrderItems = [];
        var totalCBM = 0;
        var subTotal = 0;
        var total;
        var purchaseOrderData = (_a = {},
            _a[constants.PURCHASE_ORDER.FIELDS.TRANID] = "",
            _a[constants.PURCHASE_ORDER.FIELDS.DATE] = "",
            _a[constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT] = false,
            _a[constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER] = false,
            _a[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO] = false,
            _a[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM] = 0,
            _a[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME] = "",
            _a[constants.PURCHASE_ORDER_OBJECT.VENDOR_UNIQUE_KEY] = "",
            _a[constants.PURCHASE_ORDER_OBJECT.VENDOR_ID] = "",
            _a[constants.PURCHASE_ORDER_OBJECT.ITEMS] = [],
            _a);
        // Search for the Purchase Order
        var purchaseOrderSearch = search.create({
            type: "transaction",
            filters: [
                ["mainline", "is", "F"],
                "AND",
                ["taxline", "is", "F"],
                "AND",
                ["cogs", "is", "F"],
                "AND",
                ["item.type", "anyof", "InvtPart", "Group", "Kit", "NonInvtPart"],
                "AND",
                ["custcol_mw_approval_request_line", "noneof", "@NONE@"],
                "AND",
                ["internalid", "anyof", pPurchaseOrderID]
            ],
            columns: [
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TRANID }),
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
        var purchaseOrderSearchResults = purchaseOrderSearch.runPaged({ pageSize: 1000 });
        if (purchaseOrderSearchResults.pageRanges.length > 0) {
            for (var i = 0; i < purchaseOrderSearchResults.pageRanges.length; i++) {
                var page = purchaseOrderSearchResults.fetch({ index: purchaseOrderSearchResults.pageRanges[i].index });
                for (var j = 0; j < page.data.length; j++) {
                    var result = page.data[j];
                    var quantity = Number(result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY));
                    var purchasePrice = Number(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.PURCHASE_PRICE }));
                    subTotal += quantity * purchasePrice;
                    totalCBM += quantity * Number(result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM));
                    if (!purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.TRANID]) {
                        var isDropship = Number(result.getValue(constants.PURCHASE_ORDER.FIELDS.LOCATION)) === constants.LOCATIONS.DROPSHIP;
                        var isReplacement = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM)) === constants.FORMS.PARTS_ORDER;
                        var shippAddress = String(result.getValue(constants.PURCHASE_ORDER.FIELDS.SHIPADDRESS)).replace(/\r\n/g, '<br>');
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
                        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_ID] = pVendorID;
                        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_UNIQUE_KEY] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.UNIQUE_KEY }));
                        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.LOGO }));
                    }
                    purchaseOrderItems.push((_b = {},
                        _b[constants.PURCHASE_ORDER_OBJECT.LINE_KEY] = result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.LINE_KEY),
                        _b[constants.PURCHASE_ORDER_OBJECT.ITEM_ID] = result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM),
                        _b[constants.PURCHASE_ORDER_OBJECT.ITEM_NAME] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.ITEM_NAME })),
                        _b[constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.DISPLAY_NAME })),
                        _b[constants.PURCHASE_ORDER_OBJECT.PURCHASE_PRICE] = String(result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.PURCHASE_PRICE })),
                        _b[constants.PURCHASE_ORDER_OBJECT.QUANTITY] = result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY),
                        _b[constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS] = result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.QUANTITY_ON_SHIPMENTS),
                        _b[constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT] = result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.TARIFF_DISCOUNT),
                        _b[constants.PURCHASE_ORDER_OBJECT.RATE] = result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.RATE),
                        _b[constants.PURCHASE_ORDER_OBJECT.CBM] = result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.CBM),
                        _b[constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE] = result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.FABRIC_CODE),
                        _b[constants.PURCHASE_ORDER_OBJECT.EXPECTED_RECEIPT_DATE] = result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.EXPECTED_RECEIPT_DATE),
                        // [constants.PURCHASE_ORDER_OBJECT.ITEM_COLLAB] : result.getValue(constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.ITEM_COLLAB),
                        _b[constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY }),
                        _b[constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY }),
                        _b[constants.PURCHASE_ORDER_OBJECT.REQ_LAST_PURCH_PRICE] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE }),
                        _b[constants.PURCHASE_ORDER_OBJECT.REQ_NEW_PURCH_PRICE] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE }),
                        _b[constants.PURCHASE_ORDER_OBJECT.REQ_LAST_RATE] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE }),
                        _b[constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE }),
                        _b[constants.PURCHASE_ORDER_OBJECT.AMOUNT] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT }),
                        _b[constants.PURCHASE_ORDER_OBJECT.REQ_LAST_CBM] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM }),
                        _b[constants.PURCHASE_ORDER_OBJECT.REQ_NEW_CBM] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM }),
                        _b[constants.PURCHASE_ORDER_OBJECT.REQ_EXPECTED_RECEIPT_DATE] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE }),
                        _b[constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES }),
                        _b[constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE }),
                        _b[constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_VENDOR }),
                        _b[constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_TOV] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_TOV }),
                        _b[constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] = result.getValue({ join: constants.PURCHASE_ORDER.ITEM_SUBLIST.FIELDS.APPROVAL_REQUEST_LINE, name: constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED }),
                        _b));
                }
            }
        }
        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.ITEMS] = purchaseOrderItems;
        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SUBTOTAL] = Number(subTotal !== 0 ? subTotal : total).toFixed(2);
        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_DISCOUNT] = Number(subTotal - total).toFixed(2);
        purchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM] = Number(totalCBM).toFixed(2);
        log.debug("Purchase Order Data", JSON.stringify(purchaseOrderData));
        return purchaseOrderData;
    }
    exports.getPurchaseOrderData = getPurchaseOrderData;
    // Get the data of the specific Purchase Order
    function getInboundShipmentData(pVendorID, pInboundShipmentID) {
        var _a;
        // Data to return
        var inboundShipmentItems = [];
        var inboundShipmentData = (_a = {},
            _a[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER] = "",
            _a[constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE] = "",
            _a[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_NAME] = 0,
            _a[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_ID] = "",
            _a[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_UNIQUE_KEY] = "",
            _a[constants.INBOUND_SHIPMENT_OBJECT.LOGO] = "",
            _a[constants.INBOUND_SHIPMENT_OBJECT.ITEMS] = [],
            _a);
        // Search for the Purchase Order
        var inboundShipmentSearch = search.create({
            type: "inboundshipment",
            filters: [
                ["internalid", "anyof", pInboundShipmentID]
            ],
            columns: [
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
        inboundShipmentSearch.run().each(function (result) {
            var _a;
            if (!inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER]) {
                inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER] = String(result.getValue(constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER));
                inboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE] = String(result.getValue(constants.INBOUND_SHIPMENT.FIELDS.EXPECTED_READY_DATE));
                inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_NAME] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.ALTNAME }));
                inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_ID] = pVendorID;
                inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_UNIQUE_KEY] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.UNIQUE_KEY }));
                inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.LOGO] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.VENDOR, name: constants.VENDOR.FIELDS.LOGO }));
            }
            inboundShipmentItems.push((_a = {},
                _a[constants.INBOUND_SHIPMENT_OBJECT.ITEM_ID] = result.getValue(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM),
                _a[constants.INBOUND_SHIPMENT_OBJECT.ITEM_NAME] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.ITEM_NAME })),
                _a[constants.INBOUND_SHIPMENT_OBJECT.DISPLAY_NAME] = String(result.getValue({ join: constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.ITEM, name: constants.ITEM.FIELDS.DISPLAY_NAME })),
                _a[constants.INBOUND_SHIPMENT_OBJECT.PURCHASE_ORDER] = result.getText(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.PURCHASE_ORDER),
                _a[constants.INBOUND_SHIPMENT_OBJECT.QUANTITY_EXPECTED] = result.getValue(constants.INBOUND_SHIPMENT.ITEM_SUBLIST.FIELDS.QUANTITY_EXPECTED),
                _a));
            return true;
        });
        inboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.ITEMS] = inboundShipmentItems;
        log.debug("Inbound Shipment Data", JSON.stringify(inboundShipmentData));
        return inboundShipmentData;
    }
    exports.getInboundShipmentData = getInboundShipmentData;
    // Get the data of a specifc Approval Request
    function getApprovalRequestData(pApprovalRequestID) {
        var approvalRequestData = {};
        // Search for the Purchase Order
        var approvalRequestSearch = search.create({
            type: constants.APPROVAL_REQUEST.ID,
            filters: [
                [constants.APPROVAL_REQUEST.FIELDS.INTERNALID, search.Operator.ANYOF, [pApprovalRequestID]]
            ],
            columns: [
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
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.APPROVED }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES })
            ]
        });
        var approvalRequestResults = approvalRequestSearch.runPaged({ pageSize: 1000 });
        for (var i = 0; i < approvalRequestResults.pageRanges.length; i++) {
            var page = approvalRequestResults.fetch({ index: approvalRequestResults.pageRanges[i].index });
            for (var j = 0; j < page.data.length; j++) {
                var result = page.data[j];
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
                approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON);
                approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE);
                approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.APPROVED);
                approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS);
                approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES);
            }
        }
        if (approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS].length) {
            log.debug('Related isn', approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS]);
            var inboundShipmentData_1 = [];
            var processedInboundShipments_1 = [];
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
                var _a;
                if (processedInboundShipments_1.indexOf(pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID })) === -1) {
                    processedInboundShipments_1.push(pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID }));
                    inboundShipmentData_1.push((_a = {},
                        _a[constants.INBOUND_SHIPMENT_OBJECT.ISN_INTERNALID] = pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.INTERNALID }),
                        _a[constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_NUMBER] = pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER }),
                        _a[constants.INBOUND_SHIPMENT_OBJECT.CURRENT_READY_DATE] = pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.CURRENT_READY_DATE }),
                        _a[constants.INBOUND_SHIPMENT_OBJECT.DESTINATION_LOCATION] = pOrder.getText({ name: constants.INBOUND_SHIPMENT.FIELDS.DESTINATION_LOCATION }),
                        _a[constants.INBOUND_SHIPMENT_OBJECT.BOOKING_STATUS] = pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.BOOKING_STATUS }),
                        _a[constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_STATUS] = pOrder.getValue({ name: constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS }),
                        _a));
                }
                return true;
            });
            approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS] = inboundShipmentData_1;
            log.debug('Related isn', approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS]);
        }
        return approvalRequestData;
    }
    exports.getApprovalRequestData = getApprovalRequestData;
    // Get the pending Approval Requests
    function getPendingApprovalRequestsData() {
        var pendingApprovalRequestData = [];
        // Search for the Purchase Order
        var pendingApprovalRequestSearch = search.create({
            type: constants.APPROVAL_REQUEST.ID,
            filters: [
                [constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, "is", true],
                "AND",
                [constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER + ".mainline", "is", true]
            ],
            columns: [
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.INTERNALID }),
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
                search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TRANID, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
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
        var pendingApprovalRequestResults = pendingApprovalRequestSearch.runPaged({ pageSize: 1000 });
        for (var i = 0; i < pendingApprovalRequestResults.pageRanges.length; i++) {
            var page = pendingApprovalRequestResults.fetch({ index: pendingApprovalRequestResults.pageRanges[i].index });
            for (var j = 0; j < page.data.length; j++) {
                var result = page.data[j];
                var shippAddress = String(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESS, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER })).replace(/\r\n/g, '<br>');
                var shippAddressee = String(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.SHIPADDRESSEE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }));
                var isDropship = Number(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.LOCATION, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER })) === constants.LOCATIONS.DROPSHIP;
                var isReplacement = String(result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.CUSTOMFORM, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER })) === constants.FORMS.PARTS_ORDER;
                var object = {};
                object[constants.APPROVAL_REQUEST.FIELDS.INTERNALID] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.INTERNALID);
                object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER);
                object[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.TRANID, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
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
    exports.getPendingApprovalRequestsData = getPendingApprovalRequestsData;
    // Get the Comments of a specific Approval Request
    function getApprovalRequestCommentsData(pApprovalRequestID) {
        var approvalRequestCommentsData = [];
        // Search for the Purchase Order
        var approvalRequestCommentSearch = search.create({
            type: constants.APPROVAL_REQUEST_COMMENTS.ID,
            filters: [
                [constants.APPROVAL_REQUEST_COMMENTS.FIELDS.APPROVAL_REQUEST, "anyof", pApprovalRequestID]
            ],
            columns: [
                search.createColumn({ name: constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE, sort: search.Sort.DESC }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV })
            ]
        });
        approvalRequestCommentSearch.run().each(function (result) {
            var _a;
            approvalRequestCommentsData.push((_a = {},
                _a[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE] = result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE),
                _a[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] = result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT),
                _a[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT] = result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT),
                _a[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV] = result.getValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV),
                _a));
            return true;
        });
        return approvalRequestCommentsData;
    }
    exports.getApprovalRequestCommentsData = getApprovalRequestCommentsData;
    // Update the data of the Purchase Order lines
    function updatePurchaseOrderData(pPurchaseOrderID, pGeneralData, pLinesData, pGeneralComment) {
        var _a, _b;
        var linesComments = "";
        var approvalRequestID;
        var allLinesApproved = true;
        // Get the Approval Request Lines
        var approvalRequestLinesSearch = search.create({
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
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.EXPECTED_RECEIPT_DATE }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES }),
                search.createColumn({ name: constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE })
            ]
        });
        // Loop through existing Netsuite lines
        var approvalRequestLinesSearchResults = approvalRequestLinesSearch.runPaged({ pageSize: 1000 });
        for (var i = 0; i < approvalRequestLinesSearchResults.pageRanges.length; i++) {
            var page = approvalRequestLinesSearchResults.fetch({ index: approvalRequestLinesSearchResults.pageRanges[i].index });
            for (var j = 0; j < page.data.length; j++) {
                var result = page.data[j];
                approvalRequestID = approvalRequestID ? approvalRequestID : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST);
                // let lineAlreadyApproved = result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED);
                for (var i_1 = 0; i_1 < pLinesData.length; i_1++) {
                    var lineUniqueKey = pLinesData[i_1].lineKey;
                    if (lineUniqueKey === result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LINE_UNIQUE_KEY)) {
                        var approved = pLinesData[i_1].approved;
                        var accepted = pLinesData[i_1].accepted;
                        var denied = pLinesData[i_1].denied;
                        var lastQty = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY) : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY);
                        var newQty = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY) : pLinesData[i_1].quantity;
                        var lastPurchasePrice = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE) : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE);
                        var newPurchasePrice = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE) : pLinesData[i_1].purchasePrice;
                        var lastRate = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE) : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE);
                        var newRate = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE) : pLinesData[i_1].rate;
                        var amount = newQty * newRate;
                        var lastCBM = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM) : result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM);
                        var newCBM = accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM) : pLinesData[i_1].cbm;
                        var requiredChanges = approved || accepted ? result.getValue(constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES) : pLinesData[i_1].requiredChanges;
                        if (!approved) {
                            allLinesApproved = false;
                            if (pLinesData[i_1].requiredChanges) {
                                var itemName = pLinesData[i_1].itemName;
                                linesComments += itemName + ": " + requiredChanges + "<br />";
                            }
                        }
                        if (denied) {
                            record.submitFields({
                                type: constants.APPROVAL_REQUEST_LINES.ID,
                                id: result.id,
                                values: (_a = {},
                                    _a[constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES] = requiredChanges,
                                    _a[constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE] = constants.VENDOR_OR_TOV_TEXT.VENDOR,
                                    _a[constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_VENDOR] = false,
                                    _a[constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_TOV] = false,
                                    _a[constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED] = false,
                                    _a)
                            });
                        }
                        else {
                            record.submitFields({
                                type: constants.APPROVAL_REQUEST_LINES.ID,
                                id: result.id,
                                values: (_b = {},
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_QTY] = lastQty,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_QTY] = newQty,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_PURCH_PRICE] = lastPurchasePrice,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_PURCH_PRICE] = newPurchasePrice,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_RATE] = lastRate,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_RATE] = newRate,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.AMOUNT] = amount,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.LAST_CBM] = lastCBM,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.NEW_CBM] = newCBM,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.REQUIRED_CHANGES] = requiredChanges,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.VENDOR_OR_TOV_SIDE] = constants.VENDOR_OR_TOV_TEXT.VENDOR,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_VENDOR] = approved,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.ACCEPTED_BY_TOV] = approved,
                                    _b[constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVED] = approved,
                                    _b)
                            });
                        }
                    }
                }
            }
        }
        // Create records for the comments
        createCommentsData(approvalRequestID, linesComments, pGeneralComment);
        // Update the Approval Request record
        var lastShipDate = pGeneralData.lastShipDate;
        var newShipDate = pGeneralData.newShipDate;
        var shipDateChangeReason = pGeneralData.shipDateChangeReason;
        var isReplacement = pGeneralData.isReplacement;
        var total = pGeneralData.total;
        updateApprovalRequest(approvalRequestID, lastShipDate, newShipDate, shipDateChangeReason, isReplacement, total, allLinesApproved);
        if (!allLinesApproved) {
            // Update Purchase Order status
            updatePurchaseOrder(pPurchaseOrderID);
            // Send notification email to Vendor
            sendNotificationEmail(pPurchaseOrderID, approvalRequestID);
        }
    }
    exports.updatePurchaseOrderData = updatePurchaseOrderData;
    // Create a comments record
    function createCommentsData(pApprovalRequestID, pLinesComments, pGeneralComment) {
        if (pLinesComments.length > 0 || pGeneralComment) {
            var newApprovalRequestComment = record.create({ type: constants.APPROVAL_REQUEST_COMMENTS.ID });
            newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.APPROVAL_REQUEST, pApprovalRequestID);
            newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT, pGeneralComment);
            newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT, pLinesComments);
            newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE, new Date());
            newApprovalRequestComment.setValue(constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV, constants.VENDOR_OR_TOV_TEXT.TOV);
            newApprovalRequestComment.save();
        }
    }
    // Update the approval requests record
    function updateApprovalRequest(pApprovalRequestID, pLastShipDate, pNewShipDate, pShipDateChangeReason, pIsReplacement, pTotal, pAllLinesApproved) {
        var _a, _b;
        if (pIsReplacement && pAllLinesApproved) {
            record.submitFields({
                type: constants.APPROVAL_REQUEST.ID,
                id: pApprovalRequestID,
                values: (_a = {},
                    _a[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] = pLastShipDate,
                    _a[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] = pNewShipDate,
                    _a[constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON] = pShipDateChangeReason,
                    _a[constants.APPROVAL_REQUEST.FIELDS.TOTAL] = pTotal,
                    _a[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED] = true,
                    _a[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED] = true,
                    _a[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE] = true,
                    _a[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] = constants.VENDOR_OR_TOV_TEXT.TOV,
                    _a[constants.APPROVAL_REQUEST.FIELDS.APPROVED] = true,
                    _a)
            });
        }
        else {
            record.submitFields({
                type: constants.APPROVAL_REQUEST.ID,
                id: pApprovalRequestID,
                values: (_b = {},
                    _b[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] = pLastShipDate,
                    _b[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] = pNewShipDate,
                    _b[constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON] = pShipDateChangeReason,
                    _b[constants.APPROVAL_REQUEST.FIELDS.TOTAL] = pTotal,
                    _b[constants.APPROVAL_REQUEST.FIELDS.APPROVED] = pAllLinesApproved,
                    _b[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] = constants.VENDOR_OR_TOV_TEXT.VENDOR,
                    _b)
            });
        }
    }
    // Update Purchase Order status
    function updatePurchaseOrder(pPurchaseOrderID) {
        var _a;
        record.submitFields({
            type: record.Type.PURCHASE_ORDER,
            id: pPurchaseOrderID,
            values: (_a = {},
                _a[constants.PURCHASE_ORDER.FIELDS.STATUS] = constants.PURCHASE_ORDER_STATUSES.VENDOR_ACTION,
                _a)
        });
    }
    // Send the email with the notification
    function sendNotificationEmail(pPurchaseOrderID, pApprovalRequestID) {
        log.debug("Sending email", "Sending email");
        // Merge the email
        var emailRender = render.mergeEmail({
            templateId: constants.EMAIL_TEMPLATES.CHANGE_BY_TOV,
            customRecord: {
                type: constants.APPROVAL_REQUEST.ID,
                id: Number(pApprovalRequestID)
            }
        });
        // Set the subject and body
        var subject = emailRender.subject;
        var body = emailRender.body;
        log.debug("Email Subject", subject);
        log.debug("Email Body", body);
        // Get the data of the Purchase Order
        var purchaseOrderData = search.lookupFields({
            type: search.Type.PURCHASE_ORDER,
            id: pPurchaseOrderID,
            columns: [
                constants.PURCHASE_ORDER.FIELDS.VENDOR
            ]
        });
        var vendorID = purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR] ? purchaseOrderData[constants.PURCHASE_ORDER.FIELDS.VENDOR][0].value : null;
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
        sendEmailToContacts(vendorID, vendorHasAccess, vendorTOVRep, isIndianVendor, pPurchaseOrderID, subject, body);
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
    // Get the name of a specific file
    function getFileData(pFileID) {
        var fileName = file.load({
            id: pFileID
        });
        return fileName;
    }
    exports.getFileData = getFileData;
    // Upload a PI File on the Purchase Order
    function uploadPIFile(pPurchaseOrderID, pPIFileContent) {
        // Attach the PI file to the purchase order
        var piFileID = attachPIFile(pPurchaseOrderID, pPIFileContent);
        // Get the Approval Request
        var approvalRequest = search.create({
            type: constants.APPROVAL_REQUEST.ID,
            filters: [
                search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, operator: search.Operator.IS, values: pPurchaseOrderID }),
                search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, operator: search.Operator.IS, values: true })
            ],
            columns: [
                search.createColumn({ name: "internalid" })
            ]
        }).run().getRange({ start: 0, end: 1 });
        var approvalRequestID = approvalRequest[0].id;
        // Update the approval requests record to set the PI File as uploaded
        setAsPIFIleUploaded(approvalRequestID, piFileID);
    }
    exports.uploadPIFile = uploadPIFile;
    // Attach the PI file to the purchase order
    function attachPIFile(pPurchaseOrderID, pFileContent) {
        pFileContent = JSON.parse(pFileContent);
        var fileType = getFileTypeId(pFileContent.type);
        var fileContents = getContentsWithCorrectEncoding(pFileContent);
        var newFile = file.create({
            name: pFileContent.name,
            fileType: fileType,
            contents: fileContents,
            folder: constants.GENERAL.PI_FILES_FOLDER_ID,
            isOnline: true
        });
        var fileId = newFile.save();
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
    // Upload a Load Plan on the Purchase Order
    function uploadLoadPlan(pPurchaseOrderID, pLoadPlanContent) {
        // Attach the PI file to the purchase order
        var loadPlanID = attachLoadPlanFile(pPurchaseOrderID, pLoadPlanContent);
        // Get the Approval Request
        var approvalRequest = search.create({
            type: constants.APPROVAL_REQUEST.ID,
            filters: [
                search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, operator: search.Operator.IS, values: pPurchaseOrderID }),
                search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, operator: search.Operator.IS, values: true })
            ],
            columns: [
                search.createColumn({ name: "internalid" })
            ]
        }).run().getRange({ start: 0, end: 1 });
        var approvalRequestID = approvalRequest[0].id;
        var loadPlanAlreadyUploaded = approvalRequest[0][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
        // Update the approval requests record to set the Load Plan as uploaded
        setAsLoadPlanUploaded(approvalRequestID, loadPlanID);
    }
    exports.uploadLoadPlan = uploadLoadPlan;
    // Attach the PI file to the purchase order
    function attachLoadPlanFile(pPurchaseOrderID, pFileContent) {
        pFileContent = JSON.parse(pFileContent);
        var fileType = getFileTypeId(pFileContent.type);
        var fileContents = getContentsWithCorrectEncoding(pFileContent);
        var newFile = file.create({
            name: pFileContent.name,
            fileType: fileType,
            contents: fileContents,
            folder: constants.GENERAL.LOAD_PLANS_FOLDER_ID,
            isOnline: true
        });
        var fileId = newFile.save();
        log.debug("File attachment", { fileId: fileId, pPurchaseOrderID: pPurchaseOrderID });
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
    // Update the approval requests record to set the Load Plan as uploaded
    function setAsLoadPlanUploaded(pApprovalRequestID, pLoadPlanID) {
        var _a;
        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: pApprovalRequestID,
            values: (_a = {},
                _a[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED] = true,
                _a[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN] = pLoadPlanID,
                _a[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] = constants.VENDOR_OR_TOV_TEXT.TOV,
                _a)
        });
    }
    // Get the type ID of a file
    function getFileTypeId(pContentType) {
        var GENERAL_DEFAULT_FILE_TYPE_ID = "PLAINTEXT";
        var MULTIPART_TYPES = {
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
        var CONTENT_TYPES = ["application", "audio", "image", "message", "text", "video"];
        var DEFAULT_FILE_TYPES_IDS = {
            application: "ZIP",
            audio: "MP3",
            image: "JPGIMAGE",
            message: "MESSAGERFC",
            text: "PLAINTEXT",
            video: "MPEGMOVIE"
        };
        // Check for the ones that Netsuite specifies
        var fileTypeID = MULTIPART_TYPES[pContentType];
        // If no fileTypeID, return a default
        if (!fileTypeID) {
            var contentType = pContentType.split("/")[0];
            if (CONTENT_TYPES.indexOf(contentType) != -1) {
                return DEFAULT_FILE_TYPES_IDS[contentType];
            }
            return GENERAL_DEFAULT_FILE_TYPE_ID;
        }
        return fileTypeID;
    }
    // Get the contents after encoding
    function getContentsWithCorrectEncoding(pResponseFile) {
        var APPLICATION_EXCEPTIONS = ["application/json", "application/postscript"];
        var contents = pResponseFile.contents.substr(pResponseFile.contents.indexOf(",") + 1);
        var fileType = pResponseFile.type.split("/")[0];
        log.debug("encoding", { fileType: fileType, contents: contents });
        if (fileType == "text" || fileType == "message" || APPLICATION_EXCEPTIONS.indexOf(pResponseFile.type) != -1) {
            return forge.util.decode64(contents);
        }
        else {
            return contents;
        }
    }
    // Update the approval requests record to set the PI File as uploaded
    function setAsPIFIleUploaded(pApprovalRequestID, pPIFileID) {
        var _a;
        record.submitFields({
            type: constants.APPROVAL_REQUEST.ID,
            id: pApprovalRequestID,
            values: (_a = {},
                _a[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED] = true,
                _a[constants.APPROVAL_REQUEST.FIELDS.PI_FILE] = pPIFileID,
                _a)
        });
    }
    // Attach the Shipment Related files
    function attachShipmentRelatedFiles(pFilesContents) {
        var fileIDs = [];
        for (var i = 0; i < pFilesContents.length; i++) {
            var actualFile = JSON.parse(pFilesContents[i].content);
            var fileType = getFileTypeId(actualFile.type);
            var fileContents = getContentsWithCorrectEncoding(actualFile);
            var newFile = file.create({
                name: actualFile.name,
                fileType: fileType,
                contents: fileContents,
                folder: constants.GENERAL.LOAD_PLANS_FOLDER_ID,
                isOnline: true
            });
            var fileID = newFile.save();
            fileIDs.push({
                "type": pFilesContents[i].id,
                "fileID": fileID
            });
        }
        return fileIDs;
    }
    exports.attachShipmentRelatedFiles = attachShipmentRelatedFiles;
    // Store the file IDs on the approval request
    function storeShipmentRelatedFilesIDs(pPurchaseOrderID, pFileIDs) {
        var _a;
        // Get the Approval Request data
        var approvalRequest = search.create({
            type: constants.APPROVAL_REQUEST.ID,
            filters: [
                search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, operator: search.Operator.IS, values: pPurchaseOrderID }),
                search.createFilter({ name: constants.APPROVAL_REQUEST.FIELDS.MOST_RECENT_REQUEST, operator: search.Operator.IS, values: true })
            ],
            columns: [
                search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES })
            ]
        }).run().getRange({ start: 0, end: 1 });
        var approvalRequestID = approvalRequest[0].id;
        var actualShipmentRelatedFiles = approvalRequest[0].getValue(constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES);
        var shipmentRelatedFiles = actualShipmentRelatedFiles ? JSON.parse(String(actualShipmentRelatedFiles)) : {};
        for (var i = 0; i < pFileIDs.length; i++) {
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
            values: (_a = {},
                _a[constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES] = JSON.stringify(shipmentRelatedFiles),
                _a)
        });
    }
    exports.storeShipmentRelatedFilesIDs = storeShipmentRelatedFilesIDs;
});
