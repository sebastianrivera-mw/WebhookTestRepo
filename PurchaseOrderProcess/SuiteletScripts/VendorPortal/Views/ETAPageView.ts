/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as search from 'N/search';

import * as etaModel from '../Models/ETAPageModel';
import * as constants from '../../../Global/Constants';
import * as functions from '../../../Global/Functions';

// Get the view of the ETA Section of the Vendor
export function getETASectionView(pVendors, pSelectedVendorID, pVendorData, pPurchaseOrdersSearch, pPageID)
{
    // Create the Vendors select to filter
    let vendorsSelect = pVendors.length > 1 ? createVendorsSelect(pVendors, pSelectedVendorID) : "";

    // Order the lines grouped by ISN Number
    let orderedLines = orderLines(pSelectedVendorID, pPurchaseOrdersSearch);

    // Get the view of the ETA list
    let etaListView = getETAListView(orderedLines, pSelectedVendorID, pVendorData, vendorsSelect, pPageID);
    return etaListView;
}

// Create the Vendors select to filter
function createVendorsSelect(pVendors, pSelectedVendorID)
{
    let vendorsList = `
    <div class="eta-vendors-select">
        <label for="vendors-select">Vendor:</label>
        <select id="vendors-select">
    `;

    for (let i = 0; i < pVendors.length; i++)
    {
        let vendorID = pVendors[i];
        let vendorName = etaModel.getVendorName(vendorID);

        let selected = vendorID == pSelectedVendorID ? true : false;

        vendorsList += `<option value="${vendorID}" ${selected ? 'selected' : ''} >${vendorName}</option>`
    }

    vendorsList += `</select></div>`;

    return vendorsList;
}

// Order the lines grouped by ISN Number
function orderLines(pVendorID, pPurchaseOrdersSearch)
{
    let orderedLines = {};

    let purchaseOrderSearchResults = pPurchaseOrdersSearch.runPaged({ pageSize: constants.ETA_GENERAL.QUANTITY_PER_PAGE });
    for (let i = 0; i < purchaseOrderSearchResults.pageRanges.length; i++)
    {
        let page = purchaseOrderSearchResults.fetch({ index: purchaseOrderSearchResults.pageRanges[i].index });
        for (let j = 0; j < page.data.length; j++)
        {
            let item = page.data[j];
            let itemId = item.id;
            var currentItemTBSData = JSON.parse(search.lookupFields({ id: itemId, type: "inventoryitem", columns: [constants.ITEM.FIELDS.TBS_DATA] })[constants.ITEM.FIELDS.TBS_DATA]);

            if (JSON.stringify(currentItemTBSData) != "{}")
            {
                let itemSKU = currentItemTBSData[constants.ETA_TBS_DATA_IDS.ITEM_SKU];
                let itemName = currentItemTBSData[constants.ETA_TBS_DATA_IDS.ITEM_NAME];

                // Loop through each key of the object, they will be the item data and every purchase order
                for (var purchaseOrder in currentItemTBSData)
                {
                    // If the key is the purchase order
                    if (purchaseOrder != constants.ETA_TBS_DATA_IDS.ITEM_NAME && purchaseOrder != constants.ETA_TBS_DATA_IDS.ITEM_SKU && purchaseOrder != constants.ETA_TBS_DATA_IDS.ITEM_TYPE && purchaseOrder != "FilterData")
                    {
                        // Loop through each key of the pruchase order object, they will be the purchase order data and every inbound shipment
                        for (var inboundShipment in currentItemTBSData[purchaseOrder])
                        {
                            // If the key is the inbound shipment
                            if (inboundShipment != constants.ETA_TBS_DATA_IDS.PO_ID)
                            {
                                if ((String(pVendorID) !== "0" && String(pVendorID) === String(currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.VENDOR_ID])) || String(pVendorID) == "0")
                                {
                                    let inboundShipmentNumber = inboundShipment && inboundShipment !== "Dropship Order" && inboundShipment.indexOf("ISN-") === -1 ? `ISN-${inboundShipment}` : inboundShipment || "Dropship Order";
                                    let inboundShipmentID = inboundShipment && inboundShipment !== "Dropship Order" ? String(inboundShipment).replace("ISN-", "") : "";
                                    let purchaseOrderID = currentItemTBSData[purchaseOrder][constants.ETA_TBS_DATA_IDS.PO_ID] || "-";
                                    let date = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.PO_DATE] ||  currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.SHIPMENT_DATE] || "-";
                                    let location = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.LOCATION_NAME] || "-";
                                    let quantityOnOrder = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.QUANTITY_EXPECTED] || "-";
                                    let expectedShipDate = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.EXPECTED_SHIP_DATE] || "-";
                                    let lastShipDate = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.CURRENT_SHIP_DATE] || "-";
                                    let expectedToPortDate = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.EXPECTED_TO_PORT_DATE] || "-";
                                    let bookingStatus = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.BOOKING_STATUS] || "-";
                                    let vendorID = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.VENDOR_ID] || "" ;
                                    let vendorCountry = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.VENDOR_COUNTRY] || "-" ;
                                    let locationState = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.LOCATION_STATE] || "-";
                                    let lastReadyDate = currentItemTBSData[purchaseOrder][inboundShipment][constants.ETA_TBS_DATA_IDS.CURRENT_READY_DATE] || "-";
                                    if (lastReadyDate !== "-")
                                    {
                                        let date = lastReadyDate.split("/")[1];
                                        (date.length == 1) ? date = `0${date}` : {};
                                        let month = lastReadyDate.split("/")[0];
                                        (month.length == 1) ? month = `0${month}` : {};
                                        let year = lastReadyDate.split("/")[2];
                                        lastReadyDate = `${month}/${date}/${year}`;
                                    }

                                    if (!orderedLines[inboundShipment])
                                    {
                                        orderedLines[inboundShipment] = [];
                                    }

                                    let obj = {
                                        "inboundShipmentNumber": inboundShipmentNumber,
                                        "inboundShipmentID": inboundShipmentID,
                                        "purchaseOrderNumber": purchaseOrder,
                                        "purchaseOrderID": purchaseOrderID,
                                        "date": date,
                                        "location": location,
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
    let dropShipLines = orderedLines["Dropship Order"];
    if (dropShipLines)
    {
        delete orderedLines["Dropship Order"];
        orderedLines["Dropship Order"] = dropShipLines;
    }

    return orderedLines;
}

// Get the view of the ETA list
function getETAListView(pOrderedLines, pVendorID, pVendorData, pVendorsSelect, pPageID)
{
    let rows = "";
    let currentLine = 0;
    let delayTypes = etaModel.getDelayTypes();
    let shipmentNumbers = [];
    let purchaseOrderNumbers = [];
    let pendingETASubmission = pVendorData[constants.VENDOR.FIELDS.PENDING_ETA_SUBMISSION];
    let weekETADataSubmitted = pVendorData[constants.VENDOR.FIELDS.WEEK_ETA_SUBMITTED] ? JSON.parse(pVendorData[constants.VENDOR.FIELDS.WEEK_ETA_SUBMITTED]) : [];

    for (var inboundShipment in pOrderedLines)
    {
        for (let i = 0; i < pOrderedLines[inboundShipment].length; i++)
        {
            let line = pOrderedLines[inboundShipment][i];
            
            // Add the line to the html element
            let valueToCheckETASubmitted = line.inboundShipmentNumber !== "Dropship Order" ? line.inboundShipmentNumber : `Dropship Order / ${line.purchaseOrderID}`;
            let showNotificationCircle = pendingETASubmission && weekETADataSubmitted.indexOf(valueToCheckETASubmitted) === -1 && line.bookingStatus !== "Booking Approved";
            let copyButton = line.lastShipDate !== "-" ? `<button id="copy-last-ship-date-btn-line${currentLine + 1}" class="btn copy-line">Copy</button>` : " ";
            let currentReadyDateInput = `<input type="date" id="current-ready-date-line${currentLine + 1}" class="current-ready-date-input"></input>`;
            let currentDepartureDateInput = `<input type="date" id="current-departure-date-line${currentLine + 1}" class="current-departure-date-input"></input>`;
            let delayTypeSelect = createDelayTypeSelect(delayTypes, currentLine);
            let notesTextarea = `<textarea id="notes-line${currentLine + 1}" rows="3" cols="25"></textarea>`;
            let link = `${functions.getCurrentSuiteletURL(true)}&po=${line.purchaseOrderID}&isn=${line.inboundShipmentID}&page=${pPageID}`;

            rows += `
            <tr class="item-line eta-item-line">
                <td class="circle-notification-wrapper">${showNotificationCircle ? '<div class="circle-notification"><span>!</span></div>' : ""}</td>
                <!-- <td class="order-link"> <a class="view-order-link" href="${link}">View</a> </td> -->
                <td class="shipment-number"> <span>${line.inboundShipmentNumber}</span> </td>
                <td class="purchase-order-number"> <span>${line.purchaseOrderNumber}</span> </td>
                <td class="purchase-order-id" style="display: none;"> <span>${line.purchaseOrderID}</span> </td>
                <td class="date"> <span>${line.date}</span> </td>
                <td class="item-sku"> <span>${line.itemSKU}</span> </td>
                <td class="item-name"> <span>${line.itemName}</span> </td>
                <td class="quantity"> <span>${line.quantityOnOrder}</span> </td>
                <td class="last-ready-date"> <span>${line.lastReadyDate}</span> </td>
                <td class="copy-button" style="display: none;"> ${copyButton} </td>
                <td class="current-ready-date" style="display: none;"> ${currentReadyDateInput} </td>
                <td class="current-departure-date" style="display: none;"> ${currentDepartureDateInput} </td>
                <td class="delay-type" style="display: none;"> ${delayTypeSelect} </td>
                <td class="location"> <span>${line.location}</span> </td>
                <td class="notes" style="display: none;"> ${notesTextarea} </td>
                <td class="vendor-country" style="display: none;"> <span>${line.vendorCountry}</span> </td>
                <td class="location-state" style="display: none;"> <span>${line.locationState}</span> </td>
            </tr>
            `;

            // Store the shipment numbers and purchase order numbers
            let shipmentNumber = line.inboundShipmentNumber;
            if (shipmentNumber !== "Dropship Order")
            {
                let shipmentID = Number(shipmentNumber.split("-")[1]);
                if (shipmentNumbers.indexOf(shipmentID) === -1)
                {
                    shipmentNumbers.push(shipmentID);
                }
            }
            else
            {
                let purchaseOrderNumber = line.purchaseOrderNumber;
                if (purchaseOrderNumbers.indexOf(purchaseOrderNumber) === -1)
                {
                    purchaseOrderNumbers.push(purchaseOrderNumber);
                }
            }

            currentLine++;
        }
    }

    // Create the elements of the Copy To All feature
    let copyToAllElements = (rows.length > 0) ? getCopyToAllElements(shipmentNumbers, purchaseOrderNumbers) : "";

    let etaListView = rows.length > 0 ? `
    <div class="eta-list-view">
        <div id="buttons-area">
            <button type="button" id="btn-eta-edit-data" class="btn btn-primary">Update ETAs</button>
            <button type="button" id="btn-eta-cancel-edition" class="btn btn-primary" style="display: none;">Cancel Edition</button>
            <button type="button" id="btn-eta-send-data" class="btn btn-primary" style="display: none;" onclick="etaHandleSubmit(${pVendorID});">Send Data</button>
        </div>
        ${pVendorsSelect}
        <div class="copy-to-all" style="display: none;">
            ${copyToAllElements}
        </div>
        <div class="table-responsive shipments-table eta-table">
            <table class="table text-nowrap">
                <thead>
                    <tr>
                        <th style="padding: 0"></th>
                        <!-- <th></th> -->
                        <th><span>ISN #</span></th>
                        <th><span>PO #</span></th>
                        <th style="display: none;"><span>PO ID</span></th>
                        <th><span>Date</span></th>
                        <th><span>Item SKU</span></th>
                        <th><span>Item Name</span></th>
                        <th><span>Quantity</span></th>
                        <th><span>Last Ready Date</span></th>
                        <th class="copy-button-header" style="display: none;"><span>Copy</span></th>
                        <th class="current-ready-date-header" style="display: none;"><span>Current Ready Date</span></th>
                        <th class="current-departure-date-header" style="display: none;"><span>Current Departure Date</span></th>
                        <th class="delay-type-header" style="display: none;"><span>Delay Type</span></th>
                        <th><span>Location</span></th>
                        <th class="notes-header" style="display: none;"><span>Notes</span></th>
                    </tr>
                </thead>
                <tbody id="item-lines">
                    ${rows}
                </tbody>
            </table>
        </div>
    </div>
    ` : `
    <div class="eta-list-view">
        ${pVendorsSelect}
        <h5 style="text-align: center;"> No Data Here! </h5>
    </div>`;

    return etaListView;
}

// Create HTML select for delay type options
function createDelayTypeSelect(pDelayTypes, pCurrentLine)
{
    let selectID = `delay_type_select_${pCurrentLine}`;
    let finalHTML = `<select id="${selectID}">`;

    finalHTML += `<option value="0">- None -</option>`

    for (let i = 0; i < pDelayTypes.length; i++)
    {
        let id = pDelayTypes[i].id;
        let name = pDelayTypes[i].name;
        let option;

        option = `<option value="${id}">${name}</option>`;

        finalHTML += option;
    }

    finalHTML += "</select>";
    return finalHTML;
}

// Create the elements of the Copy To All feature
function getCopyToAllElements(pShipmentNumbers, pPurchaseOrderNumbers)
{
    // Shipment / Order select
    pShipmentNumbers.sort((a, b) => a - b);
    pPurchaseOrderNumbers.sort();

    let shipmentOrderSelect = '<select id="copy-to-all-shipment-order-select" style="width: 180px;">';
    let options = "<option value='0'>- None -</option>";
    for (let i = 0; i < pShipmentNumbers.length; i++)
    {
        options += `<option value='ISN-${pShipmentNumbers[i]}'>ISN-${pShipmentNumbers[i]}</option>`;
    }
    
    for (let i = 0; i < pPurchaseOrderNumbers.length; i++)
    {
        options += `<option value='${pPurchaseOrderNumbers[i]}'>${pPurchaseOrderNumbers[i]}</option>`;
    }
    shipmentOrderSelect += options + "</select>";

    // Date
    let inputDate = '<input type="date" id="copy-to-all-date"></input>';

    // Copy to all
    let copyToAllButton = '<button id="copy-to-all-button" class="btn copy-to-all-btn">Copy To All</button>';

    // Help text
    let helpText = "<p>Here you can copy a date to the Current Ready Date column on all the lines of a specific Inbound Shipment or Purchase Order.</p>"

    return shipmentOrderSelect + inputDate + copyToAllButton + helpText;
}
