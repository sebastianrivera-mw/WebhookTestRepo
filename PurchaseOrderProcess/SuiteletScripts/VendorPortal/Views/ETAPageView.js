/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/search", "../Models/ETAPageModel", "../../../Global/Constants", "../../../Global/Functions"], function (require, exports, search, etaModel, constants, functions) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get the view of the ETA Section of the Vendor
    function getETASectionView(pVendors, pSelectedVendorID, pVendorData, pPurchaseOrdersSearch, pPageID) {
        // Create the Vendors select to filter
        var vendorsSelect = pVendors.length > 1 ? createVendorsSelect(pVendors, pSelectedVendorID) : "";
        // Order the lines grouped by ISN Number
        var orderedLines = orderLines(pSelectedVendorID, pPurchaseOrdersSearch);
        // Get the view of the ETA list
        var etaListView = getETAListView(orderedLines, pSelectedVendorID, pVendorData, vendorsSelect, pPageID);
        return etaListView;
    }
    exports.getETASectionView = getETASectionView;
    // Create the Vendors select to filter
    function createVendorsSelect(pVendors, pSelectedVendorID) {
        var vendorsList = "\n    <div class=\"eta-vendors-select\">\n        <label for=\"vendors-select\">Vendor:</label>\n        <select id=\"vendors-select\">\n    ";
        for (var i = 0; i < pVendors.length; i++) {
            var vendorID = pVendors[i];
            var vendorName = etaModel.getVendorName(vendorID);
            var selected = vendorID == pSelectedVendorID ? true : false;
            vendorsList += "<option value=\"" + vendorID + "\" " + (selected ? 'selected' : '') + " >" + vendorName + "</option>";
        }
        vendorsList += "</select></div>";
        return vendorsList;
    }
    // Order the lines grouped by ISN Number
    function orderLines(pVendorID, pPurchaseOrdersSearch) {
        var orderedLines = {};
        var purchaseOrderSearchResults = pPurchaseOrdersSearch.runPaged({ pageSize: constants.ETA_GENERAL.QUANTITY_PER_PAGE });
        for (var i = 0; i < purchaseOrderSearchResults.pageRanges.length; i++) {
            var page = purchaseOrderSearchResults.fetch({ index: purchaseOrderSearchResults.pageRanges[i].index });
            for (var j = 0; j < page.data.length; j++) {
                var item = page.data[j];
                var itemId = item.id;
                var currentItemTBSData = JSON.parse(search.lookupFields({ id: itemId, type: "inventoryitem", columns: [constants.ITEM.FIELDS.TBS_DATA] })[constants.ITEM.FIELDS.TBS_DATA]);
                if (JSON.stringify(currentItemTBSData) != "{}") {
                    var itemSKU = currentItemTBSData[constants.ETA_TBS_DATA_IDS.ITEM_SKU];
                    var itemName = currentItemTBSData[constants.ETA_TBS_DATA_IDS.ITEM_NAME];
                    // Loop through each key of the object, they will be the item data and every purchase order
                    for (var purchaseOrder in currentItemTBSData) {
                        // If the key is the purchase order
                        if (purchaseOrder != constants.ETA_TBS_DATA_IDS.ITEM_NAME && purchaseOrder != constants.ETA_TBS_DATA_IDS.ITEM_SKU && purchaseOrder != constants.ETA_TBS_DATA_IDS.ITEM_TYPE && purchaseOrder != "FilterData") {
                            // Loop through each key of the pruchase order object, they will be the purchase order data and every inbound shipment
                            for (var inboundShipment in currentItemTBSData[purchaseOrder]) {
                                // If the key is the inbound shipment
                                if (inboundShipment != constants.ETA_TBS_DATA_IDS.PO_ID) {
                                    if ((String(pVendorID) !== "0" && String(pVendorID) === String(currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.VENDOR_ID])) || String(pVendorID) == "0") {
                                        var inboundShipmentNumber = inboundShipment && inboundShipment !== "Dropship Order" && inboundShipment.indexOf("ISN-") === -1 ? "ISN-" + inboundShipment : inboundShipment || "Dropship Order";
                                        var inboundShipmentID = inboundShipment && inboundShipment !== "Dropship Order" ? String(inboundShipment).replace("ISN-", "") : "";
                                        var purchaseOrderID = currentItemTBSData[purchaseOrder][constants.ETA_TBS_DATA_IDS.PO_ID] || "-";
                                        var date = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.PO_DATE] || currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.SHIPMENT_DATE] || "-";
                                        var location_1 = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.LOCATION_NAME] || "-";
                                        var quantityOnOrder = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.QUANTITY_EXPECTED] || "-";
                                        var expectedShipDate = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.EXPECTED_SHIP_DATE] || "-";
                                        var lastShipDate = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.CURRENT_SHIP_DATE] || "-";
                                        var expectedToPortDate = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.EXPECTED_TO_PORT_DATE] || "-";
                                        var bookingStatus = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.BOOKING_STATUS] || "-";
                                        var vendorID = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.VENDOR_ID] || "";
                                        var vendorCountry = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.VENDOR_COUNTRY] || "-";
                                        var locationState = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.LOCATION_STATE] || "-";
                                        var lastReadyDate = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.CURRENT_READY_DATE] || "-";
                                        if (lastReadyDate !== "-") {
                                            var date_1 = lastReadyDate.split("/")[1];
                                            (date_1.length == 1) ? date_1 = "0" + date_1 : {};
                                            var month = lastReadyDate.split("/")[0];
                                            (month.length == 1) ? month = "0" + month : {};
                                            var year = lastReadyDate.split("/")[2];
                                            lastReadyDate = month + "/" + date_1 + "/" + year;
                                        }
                                        if (!orderedLines[inboundShipment]) {
                                            orderedLines[inboundShipment] = [];
                                        }
                                        var obj = {
                                            "inboundShipmentNumber": inboundShipmentNumber,
                                            "inboundShipmentID": inboundShipmentID,
                                            "purchaseOrderNumber": purchaseOrder,
                                            "purchaseOrderID": purchaseOrderID,
                                            "date": date,
                                            "location": location_1,
                                            "itemSKU": itemSKU || "-",
                                            "itemName": itemName || "-",
                                            "quantityOnOrder": quantityOnOrder,
                                            "expectedShipDate": expectedShipDate,
                                            "lastShipDate": lastShipDate,
                                            "lastReadyDate": lastReadyDate,
                                            "expectedToPortDate": expectedToPortDate,
                                            "bookingStatus": bookingStatus,
                                            "vendorID": vendorID,
                                            "vendorCountry": vendorCountry,
                                            "locationState": locationState
                                        };
                                        orderedLines[inboundShipment].push(obj);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // Add Dropship Lines at the end of the object
        var dropShipLines = orderedLines["Dropship Order"];
        if (dropShipLines) {
            delete orderedLines["Dropship Order"];
            orderedLines["Dropship Order"] = dropShipLines;
        }
        return orderedLines;
    }
    // Get the view of the ETA list
    function getETAListView(pOrderedLines, pVendorID, pVendorData, pVendorsSelect, pPageID) {
        var rows = "";
        var currentLine = 0;
        var delayTypes = etaModel.getDelayTypes();
        var shipmentNumbers = [];
        var purchaseOrderNumbers = [];
        var pendingETASubmission = pVendorData[constants.VENDOR.FIELDS.PENDING_ETA_SUBMISSION];
        var weekETADataSubmitted = pVendorData[constants.VENDOR.FIELDS.WEEK_ETA_SUBMITTED] ? JSON.parse(pVendorData[constants.VENDOR.FIELDS.WEEK_ETA_SUBMITTED]) : [];
        for (var inboundShipment in pOrderedLines) {
            for (var i = 0; i < pOrderedLines[inboundShipment].length; i++) {
                var line = pOrderedLines[inboundShipment][i];
                // Add the line to the html element
                var valueToCheckETASubmitted = line.inboundShipmentNumber !== "Dropship Order" ? line.inboundShipmentNumber : "Dropship Order / " + line.purchaseOrderID;
                var showNotificationCircle = pendingETASubmission && weekETADataSubmitted.indexOf(valueToCheckETASubmitted) === -1 && line.bookingStatus !== "Booking Approved";
                var copyButton = line.lastShipDate !== "-" ? "<button id=\"copy-last-ship-date-btn-line" + (currentLine + 1) + "\" class=\"btn copy-line\">Copy</button>" : " ";
                var currentReadyDateInput = "<input type=\"date\" id=\"current-ready-date-line" + (currentLine + 1) + "\" class=\"current-ready-date-input\"></input>";
                var currentDepartureDateInput = "<input type=\"date\" id=\"current-departure-date-line" + (currentLine + 1) + "\" class=\"current-departure-date-input\"></input>";
                var delayTypeSelect = createDelayTypeSelect(delayTypes, currentLine);
                var notesTextarea = "<textarea id=\"notes-line" + (currentLine + 1) + "\" rows=\"3\" cols=\"25\"></textarea>";
                var link = functions.getCurrentSuiteletURL(true) + "&po=" + line.purchaseOrderID + "&isn=" + line.inboundShipmentID + "&page=" + pPageID;
                rows += "\n            <tr class=\"item-line eta-item-line\">\n                <td class=\"circle-notification-wrapper\">" + (showNotificationCircle ? '<div class="circle-notification"><span>!</span></div>' : "") + "</td>\n                <!-- <td class=\"order-link\"> <a class=\"view-order-link\" href=\"" + link + "\">View</a> </td> -->\n                <td class=\"shipment-number\"> <span>" + line.inboundShipmentNumber + "</span> </td>\n                <td class=\"purchase-order-number\"> <span>" + line.purchaseOrderNumber + "</span> </td>\n                <td class=\"purchase-order-id\" style=\"display: none;\"> <span>" + line.purchaseOrderID + "</span> </td>\n                <td class=\"date\"> <span>" + line.date + "</span> </td>\n                <td class=\"item-sku\"> <span>" + line.itemSKU + "</span> </td>\n                <td class=\"item-name\"> <span>" + line.itemName + "</span> </td>\n                <td class=\"quantity\"> <span>" + line.quantityOnOrder + "</span> </td>\n                <td class=\"last-ready-date\"> <span>" + line.lastReadyDate + "</span> </td>\n                <td class=\"copy-button\" style=\"display: none;\"> " + copyButton + " </td>\n                <td class=\"current-ready-date\" style=\"display: none;\"> " + currentReadyDateInput + " </td>\n                <td class=\"current-departure-date\" style=\"display: none;\"> " + currentDepartureDateInput + " </td>\n                <td class=\"delay-type\" style=\"display: none;\"> " + delayTypeSelect + " </td>\n                <td class=\"location\"> <span>" + line.location + "</span> </td>\n                <td class=\"notes\" style=\"display: none;\"> " + notesTextarea + " </td>\n                <td class=\"vendor-country\" style=\"display: none;\"> <span>" + line.vendorCountry + "</span> </td>\n                <td class=\"location-state\" style=\"display: none;\"> <span>" + line.locationState + "</span> </td>\n            </tr>\n            ";
                // Store the shipment numbers and purchase order numbers
                var shipmentNumber = line.inboundShipmentNumber;
                if (shipmentNumber !== "Dropship Order") {
                    var shipmentID = Number(shipmentNumber.split("-")[1]);
                    if (shipmentNumbers.indexOf(shipmentID) === -1) {
                        shipmentNumbers.push(shipmentID);
                    }
                }
                else {
                    var purchaseOrderNumber = line.purchaseOrderNumber;
                    if (purchaseOrderNumbers.indexOf(purchaseOrderNumber) === -1) {
                        purchaseOrderNumbers.push(purchaseOrderNumber);
                    }
                }
                currentLine++;
            }
        }
        // Create the elements of the Copy To All feature
        var copyToAllElements = (rows.length > 0) ? getCopyToAllElements(shipmentNumbers, purchaseOrderNumbers) : "";
        var etaListView = rows.length > 0 ? "\n    <div class=\"eta-list-view\">\n        <div id=\"buttons-area\">\n            <button type=\"button\" id=\"btn-eta-edit-data\" class=\"btn btn-primary\">Update ETAs</button>\n            <button type=\"button\" id=\"btn-eta-cancel-edition\" class=\"btn btn-primary\" style=\"display: none;\">Cancel Edition</button>\n            <button type=\"button\" id=\"btn-eta-send-data\" class=\"btn btn-primary\" style=\"display: none;\" onclick=\"etaHandleSubmit(" + pVendorID + ");\">Send Data</button>\n        </div>\n        " + pVendorsSelect + "\n        <div class=\"copy-to-all\" style=\"display: none;\">\n            " + copyToAllElements + "\n        </div>\n        <div class=\"table-responsive shipments-table eta-table\">\n            <table class=\"table text-nowrap\">\n                <thead>\n                    <tr>\n                        <th style=\"padding: 0\"></th>\n                        <!-- <th></th> -->\n                        <th><span>ISN #</span></th>\n                        <th><span>PO #</span></th>\n                        <th style=\"display: none;\"><span>PO ID</span></th>\n                        <th><span>Date</span></th>\n                        <th><span>Item SKU</span></th>\n                        <th><span>Item Name</span></th>\n                        <th><span>Quantity</span></th>\n                        <th><span>Last Ready Date</span></th>\n                        <th class=\"copy-button-header\" style=\"display: none;\"><span>Copy</span></th>\n                        <th class=\"current-ready-date-header\" style=\"display: none;\"><span>Current Ready Date</span></th>\n                        <th class=\"current-departure-date-header\" style=\"display: none;\"><span>Current Departure Date</span></th>\n                        <th class=\"delay-type-header\" style=\"display: none;\"><span>Delay Type</span></th>\n                        <th><span>Location</span></th>\n                        <th class=\"notes-header\" style=\"display: none;\"><span>Notes</span></th>\n                    </tr>\n                </thead>\n                <tbody id=\"item-lines\">\n                    " + rows + "\n                </tbody>\n            </table>\n        </div>\n    </div>\n    " : "\n    <div class=\"eta-list-view\">\n        " + pVendorsSelect + "\n        <h5 style=\"text-align: center;\"> No Data Here! </h5>\n    </div>";
        return etaListView;
    }
    // Create HTML select for delay type options
    function createDelayTypeSelect(pDelayTypes, pCurrentLine) {
        var selectID = "delay_type_select_" + pCurrentLine;
        var finalHTML = "<select id=\"" + selectID + "\">";
        finalHTML += "<option value=\"0\">- None -</option>";
        for (var i = 0; i < pDelayTypes.length; i++) {
            var id = pDelayTypes[i].id;
            var name_1 = pDelayTypes[i].name;
            var option = void 0;
            option = "<option value=\"" + id + "\">" + name_1 + "</option>";
            finalHTML += option;
        }
        finalHTML += "</select>";
        return finalHTML;
    }
    // Create the elements of the Copy To All feature
    function getCopyToAllElements(pShipmentNumbers, pPurchaseOrderNumbers) {
        // Shipment / Order select
        pShipmentNumbers.sort(function (a, b) { return a - b; });
        pPurchaseOrderNumbers.sort();
        var shipmentOrderSelect = '<select id="copy-to-all-shipment-order-select" style="width: 180px;">';
        var options = "<option value='0'>- None -</option>";
        for (var i = 0; i < pShipmentNumbers.length; i++) {
            options += "<option value='ISN-" + pShipmentNumbers[i] + "'>ISN-" + pShipmentNumbers[i] + "</option>";
        }
        for (var i = 0; i < pPurchaseOrderNumbers.length; i++) {
            options += "<option value='" + pPurchaseOrderNumbers[i] + "'>" + pPurchaseOrderNumbers[i] + "</option>";
        }
        shipmentOrderSelect += options + "</select>";
        // Date
        var inputDate = '<input type="date" id="copy-to-all-date"></input>';
        // Copy to all
        var copyToAllButton = '<button id="copy-to-all-button" class="btn copy-to-all-btn">Copy To All</button>';
        // Help text
        var helpText = "<p>Here you can copy a date to the Current Ready Date column on all the lines of a specific Inbound Shipment or Purchase Order.</p>";
        return shipmentOrderSelect + inputDate + copyToAllButton + helpText;
    }
});
