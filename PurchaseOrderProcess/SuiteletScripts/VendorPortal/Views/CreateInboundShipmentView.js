/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log"], function (require, exports, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get the view of the ETA Section of the Vendor
    function getCreateInboudShipmentView(purchaseOrdersSearch, pVendorID) {
        // Variables of all necesary data
        var optionsPO = generateOptionsPO(purchaseOrdersSearch);
        var dataInfo = getFieldData(purchaseOrdersSearch);
        var optionsPOModal = generateOptionsPOModalTable(purchaseOrdersSearch);
        // Rows of main table
        var rows = "\n    <tr class=\"item-line createlp-item-line\">\n        <td class=\"purchase-order-number\"> \n            <select id='pos0' style=\"height:19px; width:110px; text-align:center;\" name=\"po-options\" onchange=\"isFirst(id, `" + dataInfo + "`)\">\n            <option id=\"po\" ></option>\n                " + optionsPO + "\n            </select> \n        </td>\n        <td class=\"item-sku\"> \n            <select id='item-selector0' style=\"height:19px; width:110px; text-align:center;\" name=\"item-options\" onchange=\"setFields(id)\">\n                <option id=\"item\" ></option>\n            </select> \n        </td>\n        <td class=\"item-name\" id=\"item-name0\"> <span></span> </td>\n        <td class=\"receiving-location\" id=\"receiving-location0\"> <span></span> </td>\n        <td class=\"quantity-expected\"> <input type=\"number\" id=\"quantity-expected0\" disabled=\"true\" max=\"\" min=\"\" style=\"width: 4em\"  onchange=\"calculated(id, max)\"/> </td>\n        <td class=\"quantity-remaining\"> <input type=\"number\" id=\"quantity-remaining0\" style=\"width: 4em\" disabled=\"true\" /> </td>\n        <td class=\"expected-rate\" > <input type=\"number\" id=\"expected-rate0\" disabled=\"true\" style=\"width: 7em\" onchange=\"calculatedAmount(id)\"/> </td>\n        <td class=\"amount\" > <input type=\"number\" id=\"amount0\" style=\"width: 7em\" disabled=\"true\"/> </td>\n        <td class=\"location\" id=\"location-number0\" style=\"display: none;\"> <span></span> </td>\n        <td><button type=\"button\" class=\"btn\" id=\"delete-btn\" onclick=\"remove(this)\"><i class=\"fa fa-trash\"></i></button></td>\n        </tr>\n    ";
        // Main View
        var view = "\n    <div class=\"create-isn-view\">\n        <div id=\"buttons-area\">\n            <button type=\"button\" value=\"Submit\" id=\"btn-edit-data\" class=\"btn btn-primary\" style=\"display: true;\" onclick=\"createLPHandleSubmit(" + pVendorID + ")\">Save</button>\n        </div>\n        </br>\n        </br>\n\n        <div>\n            " + infoForCreateIS() + "\n        </div>\n      \n        <div class=\"table-responsive createlp-table\">\n            <table class=\"table text-nowrap\" style=\"width: 100%; margin-left: auto; margin-right: auto;\">\n                <thead>\n                    <tr>\n                        <th><span>PO #</span></th>\n                        <th><span>Item</span></th>\n                        <th><span>Description</span></th>\n                        <th><span>Receiving Location</span></th>\n                        <th><span>Quantity Expected</span></th>\n                        <th><span>Quantity Remaining</span></th>\n                        <th><span>Expected Rate</span></th>\n                        <th><span>Amount</span></th>\n                        <th><span></span></th>\n                    </tr>\n                </thead>\n                <tbody id=\"item-lines\" class=\"item-lines\">\n                    " + rows + "\n                </tbody>\n            </table>\n            \n            <!-- The Modal -->\n            <div id=\"modal-table\" class=\"modal\">\n\n                <!-- Modal content -->\n                <div class=\"modal-content\">\n                    <span class=\"close\">&times;</span>\n                    </br>\n                    <div class=\"multiselect\">\n                        <div class=\"selectBox\" onclick=\"showCheckboxes()\">\n                            <label>Purchase Order (PO)      </label>\n                            <select>\n                                <option>Select an option</option>\n                            </select>\n                            <div class=\"overSelect\"></div>\n                        </div>\n                        <div id=\"checkboxes\">\n                            " + optionsPOModal + "\n                            <button type=\"button\" class=\"btn btn-light btn-selector-modal btn-adds\" onclick=\"getValueOptions();\">Select</button>\n                        </div>\n                    </div>\n                    <div class=\"table-responsive shipments-table eta-table\">\n                        <table class=\"table text-nowrap\" id=\"modal-table-body\" style=\"width:50%;\">\n                            <thead >\n                                <tr>\n                                    <th><input type=\"checkbox\" id=\"global-checkbox\" name=\"global-check\"></th>\n                                    <th><span>PO #</span></th>\n                                    <th><span>Item</span></th>\n                                    <th><span>Description</span></th>\n                                    <th><span>Receiving Location</span></th>\n                                    <th><span>Quantity Expected</span></th>\n                                    <th><span>Quantity Remaining</span></th>\n                                    <th><span>Expected Rate</span></th>\n                                    <th><span>Amount</span></th>\n                                </tr>\n                            </thead>\n                            <tbody id=\"item-lines\" class=\"modal-item-lines\">\n                            </tbody>\n                        </table>\n                        <button type=\"button\" class=\"btn btn-light btn-adds\" id=\"btn-item-modal\" onclick=\"moveModalTable(`" + optionsPO + "`);\">OK</button>\n                    </div>\n                </div>\n\n            </div>\n\n            <button type=\"button\" class=\"btn btn-light btn-adds\" id=\"btn-add-line\"  onclick=\"addLine(`" + optionsPO + "`)\">Add Row</button>\n            <button type=\"button\" class=\"btn btn-light btn-adds\" id=\"btn-add-group-items\" onclick=\"getOptions(`" + optionsPO + "`, `" + dataInfo + "` )\">Add Multiple Lines</button>\n        </div>\n    </div>\n    ";
        return view;
    }
    exports.getCreateInboudShipmentView = getCreateInboudShipmentView;
    // Get fields from NS (Date and Bill of lading)
    function infoForCreateIS() {
        return "\n    <div id=\"orders-search-wrapper\" class=\"orders-search-wrapper\">\n        <label for=\"bill-of-lading\" class=\"orders-search-label\">Bill of Lading</label>\n        <input id=\"bill-of-lading\" name=\"bill-of-lading\"/>\n        <label for=\"ready-date\" class=\"orders-search-label\">Expected Ready Date</label>\n        <input type=\"date\" id=\"ready-date\" name=\"ready-date\"/>\n        <label for=\"departure-date\" class=\"orders-search-label\">Departure Ready Date</label>\n        <input type=\"date\" id=\"departure-date\" name=\"departure-date\"/>\n    </div>\n    ";
    }
    // Generate option for select
    function generateOptionsPO(purchaseOrdersSearch) {
        var options = "";
        var cont = 0;
        for (var i = 0; i < purchaseOrdersSearch.length; i++) {
            if (purchaseOrdersSearch[i].flag == "po") {
                options += "<option id='" + purchaseOrdersSearch[i].po + "' value='" + purchaseOrdersSearch[i].id + "' >" + purchaseOrdersSearch[i].po + "</option>";
                cont++;
            }
        }
        return options;
    }
    // Generate Data fields for tables
    function getFieldData(purchaseOrdersSearch) {
        var data = [];
        var cont = 0;
        for (var i = 0; i < purchaseOrdersSearch.length; i++) {
            if (purchaseOrdersSearch[i].flag != "po") {
                var quantity = Number(purchaseOrdersSearch[i].quantity) - Number(purchaseOrdersSearch[i].quantityShipment);
                data[cont] = purchaseOrdersSearch[i].po + "," + purchaseOrdersSearch[i].itemText + "," + purchaseOrdersSearch[i].itemValue + "," + quantity + "," + purchaseOrdersSearch[i].description + "," + purchaseOrdersSearch[i].locationText + "," + purchaseOrdersSearch[i].locationValue + "," + purchaseOrdersSearch[i].rate;
                cont++;
            }
        }
        log.debug("Data", data);
        return data;
    }
    // Generate Options Modal table
    function generateOptionsPOModalTable(purchaseOrdersSearch) {
        var options = "";
        var cont = 0;
        for (var i = 0; i < purchaseOrdersSearch.length; i++) {
            if (purchaseOrdersSearch[i].flag == "po") {
                options += " <label for=\"one\"><input type=\"checkbox\" id='check-" + purchaseOrdersSearch[i].po + "' name=\"po\" style=\"margin-right:5px;\" value=\"" + purchaseOrdersSearch[i].po + "\"/>" + purchaseOrdersSearch[i].po + "</label>";
                cont++;
            }
        }
        return options;
    }
});
