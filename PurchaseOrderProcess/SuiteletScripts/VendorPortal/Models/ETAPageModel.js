/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/search", "N/record", "N/task", "../../../Global/Constants"], function (require, exports, log, search, record, task, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get Vendor ID using unique code from parameters
    function getVendorID(pUniqueKey, pGroupedPageID, pGroupedPageVendor) {
        var filters = [];
        if (pGroupedPageID) {
            filters.push(search.createFilter({ join: constants.VENDOR.FIELDS.TOV_REP, name: constants.EMPLOYEE.FIELDS.UNIQUE_KEY, operator: search.Operator.IS, values: pUniqueKey }));
            filters.push(search.createFilter({ name: constants.VENDOR.FIELDS.TOV_REP, operator: search.Operator.IS, values: pGroupedPageID }));
            filters.push(search.createFilter({ name: constants.VENDOR.FIELDS.INTERNALID, operator: search.Operator.ANYOF, values: [pGroupedPageVendor] }));
        }
        else {
            filters.push(search.createFilter({ name: constants.VENDOR.FIELDS.ETA_PAGE_KEY, operator: search.Operator.IS, values: pUniqueKey }));
        }
        var vendorID = null;
        var vendorsSearch = search.create({
            type: search.Type.VENDOR,
            filters: filters,
            columns: [search.createColumn({ name: "internalid" })]
        }).run().getRange({ start: 0, end: 1 });
        vendorID = vendorsSearch[0] ? vendorsSearch[0].id : null;
        return vendorID;
    }
    exports.getVendorID = getVendorID;
    // Load search to get the data of the Purchase Order lines
    function getPurchaseOrdersSearch(pVendorID) {
        var existingItemsSearch = search.load({ id: constants.SEARCHES.PREVIOUS_TBS_ITEMS });
        if (pVendorID) {
            var vendorFilterFormula = "REGEXP_INSTR({custitem_mw_tbs_report_data}, '\"vendorId\":\"" + pVendorID.toString() + "\"')";
            var vendorFilter = search.createFilter({ name: "formulatext", formula: vendorFilterFormula, operator: search.Operator.ISNOT, values: "0" });
            existingItemsSearch.filters.push(vendorFilter);
        }
        return existingItemsSearch;
    }
    exports.getPurchaseOrdersSearch = getPurchaseOrdersSearch;
    // Set the link of the Vendor as viewed
    function setLinkAsViewed(pVendorsList) {
        var _a;
        var records = [];
        search.create({
            type: constants.VENDOR_ETA_EMAIL_SENT.ID,
            filters: [
                search.createFilter({ name: constants.VENDOR_ETA_EMAIL_SENT.FIELDS.VENDOR, operator: search.Operator.ANYOF, values: pVendorsList }),
                search.createFilter({ name: constants.VENDOR_ETA_EMAIL_SENT.FIELDS.LINK_OPENED, operator: search.Operator.IS, values: false }),
                search.createFilter({ name: constants.VENDOR_ETA_EMAIL_SENT.FIELDS.MOST_RECENT_EMAIL, operator: search.Operator.IS, values: true })
            ],
            columns: [
                search.createColumn({ name: "internalid" })
            ]
        }).run().each(function (result) {
            records.push(result.id);
            return true;
        });
        for (var i = 0; i < records.length; i++) {
            record.submitFields({
                type: constants.VENDOR_ETA_EMAIL_SENT.ID,
                id: records[i],
                values: (_a = {},
                    _a[constants.VENDOR_ETA_EMAIL_SENT.FIELDS.LINK_OPENED] = true,
                    _a)
            });
        }
    }
    exports.setLinkAsViewed = setLinkAsViewed;
    // Get the list of delay types
    function getDelayTypes() {
        var delayTypes = [];
        // Search for the list of Delay Types
        var delayTypeSearch = search.create({
            type: constants.DELAY_TYPE_LIST.ID,
            columns: [
                search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
                search.createColumn({ name: 'name' })
            ]
        });
        // Create HTML with values of list
        delayTypeSearch.run().each(function (result) {
            delayTypes.push({
                "id": result.getValue('internalid'),
                "name": result.getValue('name')
            });
            return true;
        });
        return delayTypes;
    }
    exports.getDelayTypes = getDelayTypes;
    // Get the name of a Vendor
    function getVendorName(pVendorID) {
        return search.lookupFields({ type: search.Type.VENDOR, id: pVendorID, columns: [constants.VENDOR.FIELDS.COMPANY_NAME] })[constants.VENDOR.FIELDS.COMPANY_NAME];
    }
    exports.getVendorName = getVendorName;
    // Create Purchase Orders to Update record and call scheduled script to process them
    function updatePurchaseOrders(pLinesData, pGeneralData, pVendorID) {
        try {
            // Create Purchase Orders to Update record with data to upload
            createPurchaseOrdersToUpdateRecord(pLinesData, pGeneralData, pVendorID);
            // Call scheduled script to process the data
            task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                scriptId: constants.SCRIPTS.IMPORT_SCHEDULED_SCRIPT.ID,
                deploymentId: constants.SCRIPTS.IMPORT_SCHEDULED_SCRIPT.DEPLOY
            }).submit();
        }
        catch (error) {
            log.error('ERROR', JSON.stringify(error));
            log.error('An error has occured.', error.message);
        }
    }
    exports.updatePurchaseOrders = updatePurchaseOrders;
    // Create Purchase Orders to Update record with data to upload
    function createPurchaseOrdersToUpdateRecord(pLinesData, pGeneralData, pVendorID) {
        var _a;
        // Store details data
        var objectToStore = {};
        for (var i = 0; i < pLinesData.length; i++) {
            var line = pLinesData[i];
            var shipmentNumber = line.shipmentNumber;
            var purchaseOrderID = line.purchaseOrderID;
            var isPendingLine = line.isPendingLine;
            shipmentNumber == "Dropship Order" ? shipmentNumber = "Dropship Order / " + purchaseOrderID : shipmentNumber;
            var itemSku = line.itemSku;
            var currentReadyDate = line.currentReadyDate;
            var currentDepartureDate = line.currentDepartureDate;
            var expectedToPort = line.expectedToPort;
            var delayType = line.delayType;
            var notes = line.notes;
            !objectToStore[shipmentNumber] ? objectToStore[shipmentNumber] = {} : {};
            var lineKey = itemSku + "/" + purchaseOrderID;
            objectToStore[shipmentNumber][lineKey] = (_a = {},
                _a[constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.PURCHASE_ORDER_ID] = purchaseOrderID,
                _a[constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.IS_PENDING_LINE] = isPendingLine,
                _a[constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.CURRENT_SHIP_DATE] = currentReadyDate,
                _a[constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.CURRENT_DEPARTURE_DATE] = currentDepartureDate,
                _a[constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.EXPECTED_TO_PORT] = expectedToPort,
                _a[constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.DELAY_TYPE] = delayType,
                _a[constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.NOTES] = notes,
                _a);
        }
        var newRecord = record.create({ type: constants.PO_TO_UPDATE_RECORD.RECORD_ID });
        newRecord.setValue(constants.PO_TO_UPDATE_RECORD.FIELDS.GENERAL_DATA, JSON.stringify(pGeneralData));
        newRecord.setValue(constants.PO_TO_UPDATE_RECORD.FIELDS.DETAILS, JSON.stringify(objectToStore));
        newRecord.setValue(constants.PO_TO_UPDATE_RECORD.FIELDS.VENDOR, pVendorID);
        newRecord.save();
    }
});
