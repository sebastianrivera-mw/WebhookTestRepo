define(["require", "exports", "N/log", "N/search", "N/record"], function (require, exports, log, search, record) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get Functions
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
                            itemValue: x.getValue("lineuniquekey"),
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
    // Post Functions
    // Save Inbound Shipment on NS
    function saveLoadPlan(pBody) {
        // Create Inbound Shipment
        var inboundShipment = record.create({
            type: "inboundshipment",
            isDynamic: true
        });
        // Set some fields
        inboundShipment.setValue({
            fieldId: "billoflading",
            value: pBody.fields[0].billOfLading
        });
        inboundShipment.setValue({
            fieldId: "custrecord_mw_expected_ready_date",
            value: new Date(pBody.fields[0].readyDate)
        });
        inboundShipment.setValue({
            fieldId: "expectedshippingdate",
            value: new Date(pBody.fields[0].departureDate)
        });
        // Add lines for POs
        for (var i = 0; i < pBody.lines.length; i++) {
            inboundShipment.selectNewLine({
                sublistId: 'items'
            });
            inboundShipment.setCurrentSublistValue({
                sublistId: 'items',
                fieldId: 'purchaseorder',
                value: pBody.lines[i].purchaseOrder
            });
            inboundShipment.setCurrentSublistValue({
                sublistId: 'items',
                fieldId: 'shipmentitem',
                value: pBody.lines[i].item
            });
            inboundShipment.setCurrentSublistValue({
                sublistId: 'items',
                fieldId: 'receivinglocation',
                value: Number(pBody.lines[i].location)
            });
            inboundShipment.setCurrentSublistValue({
                sublistId: 'items',
                fieldId: 'quantityexpected',
                value: Number(pBody.lines[i].quantityExpected)
            });
            inboundShipment.setCurrentSublistValue({
                sublistId: 'items',
                fieldId: 'expectedrate',
                value: Number(pBody.lines[i].expectedRate)
            });
            inboundShipment.commitLine({
                sublistId: 'items'
            });
        }
        inboundShipment.save();
    }
    exports.saveLoadPlan = saveLoadPlan;
});
