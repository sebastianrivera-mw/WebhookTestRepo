/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log"], function (require, exports, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get the view of the ETA Section of the Vendor
    function getEditInboudShipmentView(pPurchaseOrdersSearch, pIsnData, pisnFields) {
        // Variables with all necesary data
        var optionsPO = generateOptionsPO(pPurchaseOrdersSearch, pIsnData);
        var dataInfo = getFieldData(pPurchaseOrdersSearch, pIsnData);
        var optionsPOModal = generateOptionsPOModalTable(pPurchaseOrdersSearch, pIsnData);
        var isnOptionsTable = putIsnOptions(pIsnData);
        var isnOptionsTableNotEdit = putIsnOptionsNotEdit(pIsnData);
        var dataField = infoForCreateIS(pisnFields);
        // Rows of Principal Table
        var rows = "\n    " + isnOptionsTable + "\n    <tr class=\"item-line createlp-item-line\">\n        <td class=\"purchase-order-number\"> \n            <select id='pos" + pIsnData.length + "' style=\"height:19px; width:110px; text-align:center;\" name=\"po-options\" onchange=\"isFirst(id, `" + dataInfo + "`, `" + (pIsnData.length + 1) + "`)\">\n            <option id=\"po\" ></option>\n                " + optionsPO + "\n            </select> \n        </td>\n        <td class=\"item-sku\"> \n            <select id='item-selector" + pIsnData.length + "' style=\"height:19px; width:110px; text-align:center;\" name=\"item-options\" onchange=\"setFields(id)\">\n                <option id=\"item\" ></option>\n            </select> \n        </td>\n        <td class=\"item-name\" id=\"item-name" + pIsnData.length + "\"> <span></span> </td>\n        <td class=\"receiving-location\" id=\"receiving-location" + pIsnData.length + "\"> <span></span> </td>\n        <td class=\"quantity-expected\"> <input type=\"number\" id=\"quantity-expected" + pIsnData.length + "\" disabled=\"true\" max=\"\" min=\"\" style=\"width: 4em\" onchange=\"calculated(id, max)\"/> </td>\n        <td class=\"quantity-remaining\"> <input type=\"number\" id=\"quantity-remaining" + pIsnData.length + "\" style=\"width: 4em\" disabled=\"true\" /> </td>\n        <td class=\"expected-rate\" > <input type=\"number\" id=\"expected-rate" + pIsnData.length + "\" disabled=\"true\" style=\"width: 7em\" onchange=\"calculatedAmount(id)\"/> </td>\n        <td class=\"amount\" > <input type=\"number\" id=\"amount" + pIsnData.length + "\" style=\"width: 7em\" disabled=\"true\"/> </td>\n        <td class=\"location\" id=\"location-number" + pIsnData.length + "\" style=\"display: none;\"> <span></span> </td>\n        <td><button type=\"button\" class=\"btn\" id=\"delete-btn\" onclick=\"remove(this)\"><i class=\"fa fa-trash\"></i></button></td>\n        </tr>\n    ";
        // View of Principal Table
        var view = "\n    <div class=\"create-isn-view\">  \n        <div>\n            " + dataField + "\n        </div>\n        <div class=\"table-responsive createlp-table\">\n            <table class=\"table text-nowrap\" style=\"width: 100%; margin-left: auto; margin-right: auto;\">\n                <thead>\n                    <tr>\n                        <th><span>PO #</span></th>\n                        <th><span>Item</span></th>\n                        <th><span>Description</span></th>\n                        <th><span>Receiving Location</span></th>\n                        <th><span>Quantity Expected</span></th>\n                        <th><span>Quantity Remaining</span></th>\n                        <th><span>Expected Rate</span></th>\n                        <th><span>Amount</span></th>\n                        <th><span></span></th>\n                    </tr>\n                </thead>\n                <tbody id=\"item-lines\" class=\"item-lines\">\n                    " + rows + "\n                </tbody>\n            </table>\n            <button type=\"button\" class=\"btn btn-light btn-adds\" id=\"btn-add-line\" style=\"margin-left:20px; margin-top:-10px;\" onclick=\"addLine(`" + optionsPO + "`, `" + (pIsnData.length + 1) + "`)\">Add Row</button>\n            \n            <!-- The Modal -->\n            <div id=\"modal-table\" class=\"modal\">\n\n                <!-- Modal content -->\n                <div class=\"modal-content\">\n                    <span class=\"close\" onclick=\"closeModal();\" >&times;</span>\n                    </br>\n                    <div class=\"multiselect\">\n                        <div class=\"selectBox\" onclick=\"showCheckboxes()\">\n                            <label>Purchase Order (PO)      </label>\n                            <select>\n                                <option>Select an option</option>\n                            </select>\n                            <div class=\"overSelect\"></div>\n                        </div>\n                        <div id=\"checkboxes\">\n                            " + optionsPOModal + "\n                            <button type=\"button\" class=\"btn btn-light btn-selector-modal btn-adds\" onclick=\"getValueOptions();\">Select</button>\n                        </div>\n                    </div>\n                    <div class=\"table-responsive shipments-table eta-table\">\n                        <table class=\"table text-nowrap\" id=\"modal-table-body\" style=\"width:50%;\">\n                            <thead >\n                                <tr>\n                                    <th><input type=\"checkbox\" id=\"global-checkbox\" name=\"global-check\" onchange=\"selectGlobalCheck()\"></th>\n                                    <th><span>PO #</span></th>\n                                    <th><span>Item</span></th>\n                                    <th><span>Description</span></th>\n                                    <th><span>Receiving Location</span></th>\n                                    <th><span>Quantity Expected</span></th>\n                                    <th><span>Quantity Remaining</span></th>\n                                    <th><span>Expected Rate</span></th>\n                                    <th><span>Amount</span></th>\n                                </tr>\n                            </thead>\n                            <tbody id=\"item-lines\" class=\"modal-item-lines\">\n                            </tbody>\n                        </table>\n                        <button type=\"button\" class=\"btn btn-light btn-adds\" id=\"btn-item-modal\" onclick=\"moveModalTable(`" + optionsPO + "`);\">OK</button>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n    ";
        // View of not editable table
        var viewNotEdit = "<div class='create-isn-view'>\n        <div class='table-responsive createlp-table'>\n            <table class='table text-nowrap' style='width: 100%'>\n                <thead>\n                    <tr>\n                        <th><span>PO #</span></th>\n                        <th><span>Item</span></th>\n                        <th><span>Description</span></th>\n                        <th><span>Receiving Location</span></th>\n                        <th><span>Quantity Expected</span></th>\n                        <th><span>Quantity Remaining</span></th>\n                        <th><span>Expected Rate</span></th>\n                        <th><span>Amount</span></th>\n                    </tr>\n                </thead>\n                <tbody id='item-lines' class='item-lines'>\n                " + isnOptionsTableNotEdit + "\n                </tbody>\n            </table>\n        </div>\n    </div>";
        // Result JSON object with Views and Data
        var result = {
            editable: view,
            notEditable: viewNotEdit,
            data: {
                options: optionsPO,
                dataInfo: dataInfo,
                initCont: pIsnData.length + 1
            }
        };
        return result;
    }
    exports.getEditInboudShipmentView = getEditInboudShipmentView;
    // Manipulate Fields Data from NS (Dates and biil of lading)
    function infoForCreateIS(pisnFields) {
        // Convert date to correct format
        var readyDate = pisnFields[0].readyDate.split("/");
        var departureDate = pisnFields[0].departureDate.split("/");
        if (readyDate[0].length == 1)
            readyDate[0] = "0" + readyDate[0];
        if (readyDate[1].length == 1)
            readyDate[1] = "0" + readyDate[1];
        if (departureDate != "") {
            if (departureDate[0].length == 1)
                departureDate[0] = "0" + departureDate[0];
            if (departureDate[1].length == 1)
                departureDate[1] = "0" + departureDate[1];
            departureDate = departureDate[2] + "-" + departureDate[0] + "-" + departureDate[1];
        }
        readyDate = readyDate[2] + "-" + readyDate[0] + "-" + readyDate[1];
        // Return fields section
        return "\n    <div id=\"orders-search-wrapper\" class=\"orders-search-wrapper\">\n        <label for=\"bill-of-lading\" class=\"orders-search-label\">Bill of Lading</label>\n        <input id=\"bill-of-lading\" name=\"bill-of-lading\" value\"" + pisnFields[0].billoflading + "\"/>\n        <label for=\"ready-date\" class=\"orders-search-label\">Expected Ready Date</label>\n        <input type=\"date\" id=\"ready-date\" name=\"ready-date\" value='" + readyDate + "'/>\n        <label for=\"departure-date\" class=\"orders-search-label\">Expected Departure Date</label>\n        <input type=\"date\" id=\"departure-date\" name=\"departure-date\" value=\"" + departureDate + "\"/>\n    </div>\n    ";
    }
    // Generate options of selec
    function generateOptionsPO(pPurchaseOrdersSearch, pIsnData) {
        var options = "";
        for (var i = 0; i < pIsnData.length; i++) {
            if (isExistInPO(pIsnData[i].poText, pPurchaseOrdersSearch)) {
                if (pIsnData[i].flag == "po") {
                    options += "<option id='" + pIsnData[i].poText + "' value='" + pIsnData[i].po + "' >" + pIsnData[i].poText + "</option>";
                }
            }
        }
        for (var i = 0; i < pPurchaseOrdersSearch.length; i++) {
            if (pPurchaseOrdersSearch[i].flag == "po") {
                options += "<option id='" + pPurchaseOrdersSearch[i].po + "' value='" + pPurchaseOrdersSearch[i].id + "' >" + pPurchaseOrdersSearch[i].po + "</option>";
            }
        }
        return options;
    }
    // Generate Data fields for tables
    function getFieldData(pPurchaseOrdersSearch, pIsnData) {
        var data = [];
        var cont = 0;
        log.debug("DataField", pPurchaseOrdersSearch);
        for (var i = 0; i < pIsnData.length; i++) {
            if (pIsnData[i].flag != "po") {
                var quantity = Number(pIsnData[i].quantityShipment) - Number(pIsnData[i].quantity);
                data[cont] = pIsnData[i].poText + "," + pIsnData[i].itemText + "," + pIsnData[i].itemValue + "," + Number(pIsnData[i].quantity) + "," + quantity + "," + pIsnData[i].description + "," + pIsnData[i].locationText + "," + pIsnData[i].locationValue + "," + pIsnData[i].rate;
                cont++;
            }
        }
        for (var i = 0; i < pPurchaseOrdersSearch.length; i++) {
            if (pPurchaseOrdersSearch[i].flag != "po") {
                if (repitItem(pIsnData, pPurchaseOrdersSearch[i])) {
                    var quantity = Number(pPurchaseOrdersSearch[i].quantity) - Number(pPurchaseOrdersSearch[i].quantityShipment);
                    data[cont] = pPurchaseOrdersSearch[i].po + "," + pPurchaseOrdersSearch[i].itemText + "," + pPurchaseOrdersSearch[i].itemValue + "," + quantity + "," + 0 + "," + pPurchaseOrdersSearch[i].description + "," + pPurchaseOrdersSearch[i].locationText + "," + pPurchaseOrdersSearch[i].locationValue + "," + pPurchaseOrdersSearch[i].rate;
                    cont++;
                }
            }
        }
        return data;
    }
    // Generate Options Modal table
    function generateOptionsPOModalTable(pPurchaseOrdersSearch, pIsnData) {
        var options = "";
        for (var i = 0; i < pIsnData.length; i++) {
            if (isExistInPO(pIsnData[i].poText, pPurchaseOrdersSearch)) {
                if (pIsnData[i].flag == "po") {
                    options += " <label for=\"one\"><input type=\"checkbox\" id='check-" + pIsnData[i].poText + "' name=\"po\" value=\"" + pIsnData[i].poText + "\"/>" + pIsnData[i].poText + "</label>";
                }
            }
        }
        for (var i = 0; i < pPurchaseOrdersSearch.length; i++) {
            if (pPurchaseOrdersSearch[i].flag == "po") {
                options += " <label for=\"one\"><input type=\"checkbox\" id='check-" + pPurchaseOrdersSearch[i].po + "' name=\"po\" value=\"" + pPurchaseOrdersSearch[i].po + "\"/>" + pPurchaseOrdersSearch[i].po + "</label>";
            }
        }
        return options;
    }
    // Put in html the rows obneined from NS
    function putIsnOptions(pIsnData) {
        var optionsIsn = "";
        for (var i = 0; i < pIsnData.length; i++) {
            if (pIsnData[i].flag != "po") {
                var quantity = Number(pIsnData[i].quantityShipment) - Number(pIsnData[i].quantity);
                optionsIsn += "<tr class=\"item-line createlp-item-line\">\n            <td class=\"purchase-order-number\"> \n                <select id='pos" + i + "' style=\"height:19px; width:110px; text-align:center;\" onchange=\"getValuePOid(id)\">\n                    <option id=\"po\" ></option>\n                    <option id='" + pIsnData[i].poText + "' value='" + pIsnData[i].po + "' selected>" + pIsnData[i].poText + " </option>\n                </select>  \n            </td>\n            <td class=\"item-sku\"> <span></span> \n                <select id='item-selector" + i + "' style=\"height:19px; width:110px; text-align:center;\" onchange=\"setFields(id)\">\n                    <option id=\"item\" ></option>\n                    <option value=\"" + pIsnData[i].itemValue + "\" selected>" + pIsnData[i].itemText + " </option>\n                </select> \n            </td>\n            <td class=\"item-name\" id=\"item-name" + i + "\"> <span>" + pIsnData[i].description + "</span> </td>\n            <td class=\"receiving-location\" id=\"receiving-location" + i + "\"> <span>" + pIsnData[i].locationText + "</span> </td>\n            <td class=\"quantity-expected\"> <input type=\"number\" id=\"quantity-expected" + i + "\" max=\"" + Number(pIsnData[i].quantityShipment) + "\" min=\"1\" style=\"width: 4em\" onchange=\"calculated(id, max)\" value=\"" + Number(pIsnData[i].quantity) + "\"/> </td>\n            <td class=\"quantity-remaining\"> <input type=\"number\" id=\"quantity-remaining" + i + "\" disabled=\"false\" value=\"" + quantity + "\" style=\"width: 4em\" name=\"" + Number(pIsnData[i].quantityShipment) + "\"/> </td>\n            <td class=\"expected-rate\" > <input type=\"number\" id=\"expected-rate" + i + "\" onchange=\"calculatedAmount(id)\" style=\"width: 7em\" value=\"" + Number(pIsnData[i].rate) + "\"/> </td>\n            <td class=\"amount\" > <input type=\"number\" id=\"amount" + i + "\" disabled=\"true\" style=\"width: 7em\" value=\"" + Number(pIsnData[i].quantity) * Number(pIsnData[i].rate) + "\"/> </td>\n            <td class=\"location\" id=\"location-number" + i + "\" style=\"display: none;\"> <span>" + pIsnData[i].locationValue + "</span> </td>\n            <td><button type=\"button\" class=\"btn\" id=\"delete-btn\" onclick=\"remove(this)\"><i class=\"fa fa-trash\"></i></button></td>\n            </tr>";
            }
        }
        return optionsIsn;
    }
    // Verifications if Item and PO were selected
    function isExistInPO(isnPO, po) {
        for (var i = 0; i < po.length; i++) {
            if (isnPO == po[i].po) {
                return false;
            }
            else if (i == po.length - 1) {
                return true;
            }
        }
    }
    // If Repit Items
    function repitItem(isnPO, po) {
        for (var i = 0; i < isnPO.length; i++) {
            if (isnPO[i].flag != "po") {
                if (po.po == isnPO[i].poText) {
                    if (po.itemText == isnPO[i].itemText) {
                        return false;
                    }
                    else if (i == isnPO.length - 1) {
                        return true;
                    }
                }
                else if (i == isnPO.length - 1) {
                    return true;
                }
            }
        }
    }
    // Put data in not editable table
    function putIsnOptionsNotEdit(pIsnData) {
        var optionsIsn = "";
        for (var i = 0; i < pIsnData.length; i++) {
            if (pIsnData[i].flag != 'po') {
                var quantity = Number(pIsnData[i].quantityShipment) - Number(pIsnData[i].quantity);
                optionsIsn += "<tr class='item-line createlp-item-line-notedit'>\n            <td class='purchase-order-number-span' id='pos-span-notedit'> <span>" + pIsnData[i].poText + "</span></td>\n            <td class='item-sku-span' id='item-selector-span-notedit'> <span>" + pIsnData[i].itemText + "</span> </td>\n            <td class='item-name' id='item-name-notedit'> <span>" + pIsnData[i].description + "</span> </td>\n            <td class='receiving-location' id='receiving-location-notedit'> <span>" + pIsnData[i].locationText + "</span> </td>\n            <td class='quantity-expected' id='quantity-expected-notedit' /><span>" + Number(pIsnData[i].quantity) + "</span> </td>\n            <td class='quantity-remaining' id='quantity-remaining-notedit'/><span>" + quantity + "</span></td>\n            <td class='expected-rate' id='expected-rate-notedit'/><span>" + Number(pIsnData[i].rate) + "</span></td>\n            <td class='amount' id='amount-notedit'/><span>" + Number(pIsnData[i].quantity) * Number(pIsnData[i].rate) + "</span> </td>\n            <td class='location' id='location-number-notedit' style='display: none;'> <span>" + pIsnData[i].locationValue + "</span> </td>\n            </tr>";
            }
        }
        return optionsIsn;
    }
});
