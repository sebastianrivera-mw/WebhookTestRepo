define(["require", "exports", "N/log", "N/search", "N/record"], function (require, exports, log, search, record) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get Purchase Orders
    // Search POs and get Items
    function searchPO(pVendorID) {
        var idPOs = [];
        // Search POs
        var customrecord_mw_po_approval_requestSearchObj = search.create({
            type: "customrecord_mw_po_approval_request",
            filters: [
                ["custrecord_mw_related_vendor", "anyof", "" + pVendorID],
                "AND",
                ["custrecord_mw_approved", "is", "T"],
                "AND",
                ["custrecord_mw_pi_file_uploaded", "is", "T"],
                "AND",
                ["custrecord_mw_load_plan_uploaded", "is", "T"],
                "AND",
                ["custrecord_mw_isn_complete", "is", "F"]
            ],
            columns: [
                "custrecord_mw_purchase_order",
            ]
        });
        var searchResultCount = customrecord_mw_po_approval_requestSearchObj.runPaged().count;
        customrecord_mw_po_approval_requestSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            var po = result.getText("custrecord_mw_purchase_order");
            var id = result.getValue("custrecord_mw_purchase_order");
            po = po.slice(16, po.length);
            // Json Object informations PO
            idPOs.push({
                po: po,
                id: id,
                flag: "po"
            });
            // Search Items
            var purchaseorderSearchObj = search.create({
                type: "purchaseorder",
                filters: [
                    ["type", "anyof", "PurchOrd"],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["numbertext", "is", po]
                ],
                columns: [
                    "item",
                    "quantity",
                    "quantityonshipments",
                    "location",
                    "fxrate",
                    "lineuniquekey"
                ]
            });
            var searchResultCount = purchaseorderSearchObj.runPaged().count;
            purchaseorderSearchObj.run().each(function (x) {
                // .run().each has a limit of 4,000 results
                // Get Name of Items
                var inventoryitemSearchObj = search.create({
                    type: "inventoryitem",
                    filters: [
                        ["type", "anyof", "InvtPart"],
                        "AND",
                        ["internalidnumber", "equalto", x.getValue("item")]
                    ],
                    columns: [
                        "displayname"
                    ]
                });
                var searchResultCount = inventoryitemSearchObj.runPaged().count;
                inventoryitemSearchObj.run().each(function (y) {
                    // .run().each has a limit of 4,000 results
                    if ((Number(x.getValue("quantity")) - Number(x.getValue("quantityonshipments"))) != 0) {
                        // Json Object information Item
                        idPOs.push({
                            po: po,
                            itemText: x.getText("item"),
                            itemValue: x.getValue("item"),
                            quantity: x.getValue("quantity"),
                            quantityShipment: x.getValue("quantityonshipments"),
                            description: y.getValue("displayname"),
                            locationText: x.getText("location"),
                            locationValue: x.getValue("location"),
                            rate: x.getValue("fxrate"),
                        });
                    }
                    return true;
                });
                return true;
            });
            return true;
        });
        log.debug("Array", idPOs);
        return idPOs;
    }
    exports.searchPO = searchPO;
    /// Get Inbound Shipment
    // Lookupfields for fields ISN
    function getFieldsISN(pIsnNumber) {
        var fields = [];
        var fieldsInboundShipment = search.lookupFields({
            type: "inboundshipment",
            id: pIsnNumber.slice(4, pIsnNumber.length),
            columns: ["billoflading", "custrecord_mw_expected_ready_date", "expectedshippingdate"]
        });
        fields.push({
            billoflading: fieldsInboundShipment.billoflading,
            readyDate: fieldsInboundShipment.custrecord_mw_expected_ready_date,
            departureDate: fieldsInboundShipment.expectedshippingdate
        });
        return fields;
    }
    exports.getFieldsISN = getFieldsISN;
    // Get Rows of inbound shipment
    function getInboundShipmentEditData(pIsnNumber) {
        var isnData = [];
        var inboundshipmentSearchObj = search.create({
            type: "inboundshipment",
            filters: [
                ["shipmentnumber", "anyof", pIsnNumber],
            ],
            columns: [
                "item",
                search.createColumn({
                    name: "purchaseorder",
                    sort: search.Sort.ASC
                }),
                "internalid",
                "quantityexpected",
                search.createColumn({
                    name: "quantity",
                    join: "purchaseOrder"
                }),
                "receivinglocation",
                "expectedrate"
            ]
        });
        var searchResultCount = inboundshipmentSearchObj.runPaged().count;
        log.debug("inboundshipmentSearchObj result count", searchResultCount);
        inboundshipmentSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            if (isnData.length == 0) {
                isnData.push({
                    po: result.getValue("purchaseorder"),
                    poText: result.getText("purchaseorder"),
                    flag: "po"
                });
            }
            for (var i = 0; i < isnData.length; i++) {
                if (isnData[i].flag == "po") {
                    if (isnData[i].po == result.getValue("purchaseorder")) {
                        break;
                    }
                }
                else if (i == isnData.length - 1) {
                    log.debug("Here", i);
                    isnData.push({
                        po: result.getValue("purchaseorder"),
                        poText: result.getText("purchaseorder"),
                        flag: "po"
                    });
                }
            }
            // Get Name of Items
            var inventoryitemSearchObj = search.create({
                type: "inventoryitem",
                filters: [
                    ["type", "anyof", "InvtPart"],
                    "AND",
                    ["internalidnumber", "equalto", result.getValue("item")]
                ],
                columns: [
                    "displayname"
                ]
            });
            var searchResultCount = inventoryitemSearchObj.runPaged().count;
            inventoryitemSearchObj.run().each(function (y) {
                // .run().each has a limit of 4,000 results
                log.debug("Result", result);
                {
                    // Json Object information Item
                    isnData.push({
                        po: result.getValue("purchaseorder"),
                        poText: result.getText("purchaseorder"),
                        itemText: result.getText("item"),
                        itemValue: result.getValue("item"),
                        quantity: result.getValue("quantityexpected"),
                        quantityShipment: result.getValue({ name: "quantity", join: "purchaseOrder" }),
                        description: y.getValue("displayname"),
                        locationText: result.getText("receivinglocation"),
                        locationValue: result.getValue("receivinglocation"),
                        rate: result.getValue("expectedrate")
                    });
                }
                return true;
            });
            return true;
        });
        log.debug("Array ISN", isnData);
        return isnData;
    }
    exports.getInboundShipmentEditData = getInboundShipmentEditData;
    // Update Load Plans
    function updateLoadPlan(pBody) {
        // ISN Id
        var idINS = Number(pBody.isnNumber.slice(4, pBody.isnNumber.length));
        var inboundShipmentUpdate = record.load({
            type: "inboundshipment",
            id: idINS,
            isDynamic: true
        });
        var lengthItemList = inboundShipmentUpdate.getLineCount({ sublistId: 'items' });
        // Delete lines of the INS
        for (var i = 0; i < lengthItemList; i++) {
            log.debug("Here", 0);
            inboundShipmentUpdate.removeLine({
                sublistId: "items",
                line: 0,
                ignoreRecalc: true
            });
        }
        // Update lines of the INS
        // Add lines for POs
        var itemLineUnique;
        var _loop_1 = function (i) {
            // Search Items Lineuniquekey
            var purchaseorderSearchObj = search.create({
                type: "purchaseorder",
                filters: [
                    ["type", "anyof", "PurchOrd"],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["internalid", "is", pBody.lines[i].purchaseOrder]
                ],
                columns: [
                    "item",
                    "lineuniquekey"
                ]
            });
            var searchResultCount = purchaseorderSearchObj.runPaged().count;
            purchaseorderSearchObj.run().each(function (result) {
                if (pBody.lines[i].item == result.getValue("item")) {
                    itemLineUnique = result.getValue("lineuniquekey");
                    log.debug("Item", itemLineUnique);
                }
                return true;
            });
            // Select new line and save data
            inboundShipmentUpdate.selectNewLine({
                sublistId: 'items'
            });
            inboundShipmentUpdate.setCurrentSublistValue({
                sublistId: 'items',
                fieldId: 'purchaseorder',
                value: pBody.lines[i].purchaseOrder
            });
            inboundShipmentUpdate.setCurrentSublistValue({
                sublistId: 'items',
                fieldId: 'shipmentitem',
                value: itemLineUnique
            });
            inboundShipmentUpdate.setCurrentSublistValue({
                sublistId: 'items',
                fieldId: 'receivinglocation',
                value: Number(pBody.lines[i].location)
            });
            inboundShipmentUpdate.setCurrentSublistValue({
                sublistId: 'items',
                fieldId: 'quantityexpected',
                value: Number(pBody.lines[i].quantityExpected)
            });
            inboundShipmentUpdate.setCurrentSublistValue({
                sublistId: 'items',
                fieldId: 'expectedrate',
                value: Number(pBody.lines[i].expectedRate)
            });
            inboundShipmentUpdate.commitLine({
                sublistId: 'items'
            });
        };
        for (var i = 0; i < pBody.lines.length; i++) {
            _loop_1(i);
        }
        inboundShipmentUpdate.save();
    }
    exports.updateLoadPlan = updateLoadPlan;
});
