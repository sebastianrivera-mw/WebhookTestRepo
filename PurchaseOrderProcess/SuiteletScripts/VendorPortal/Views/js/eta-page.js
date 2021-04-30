// Constants
const EXPECTED_TO_PORT_DAYS = {
    CHINA_CA : 20,
    CHINA_NC : 32,
    VIETNAM_CA : 22,
    VIETNAM_NC : 35,
    INDIA_CA : 40,
    INDIA_NC : 30,
};

const QUANTITY_BETWEEN_READY_AND_DEPARTURE = 5;

// Javascript functions for the ETA Page on the Vendor Portal
jQuery(document).ready(function() {

    // Enable the edition of the lines
    jQuery("#btn-eta-edit-data").click(function() {
        enableEdition();
    });

    // Cancel the edition of the lines
    jQuery("#btn-eta-cancel-edition").click(function() {
        cancelEdition();
    });

    // Copy the date to all the lines of a shipment / order
    jQuery(".eta-list-view #copy-to-all-button").click(function() {
        copyToAll();
    });
     
    // Copy the date to a specific shipment / order line
    jQuery(".eta-list-view .copy-button button").click(function() {
        copyLastReadyDate(jQuery(this));
    });

    // Reload the page if the selected vendor is changed
    jQuery('#vendors-select').change(function() {
        changeSelectedVendor();
    });

    // Set the current departure date if the current ready date is changed
    jQuery('.current-ready-date-input').change(function() {
        setCurrentDepartureDate(jQuery(this));
    });

});

// Enable the edition of the lines
function enableEdition()
{
    // Show the columns for edition
    jQuery(".copy-button-header").show();
    jQuery(".current-ready-date-header").show();
    jQuery(".current-departure-date-header").show();
    jQuery(".delay-type-header").show();
    jQuery(".notes-header").show();
    jQuery(".copy-button").show();
    jQuery(".current-ready-date").show();
    jQuery(".current-departure-date").show();
    jQuery(".delay-type").show();
    jQuery(".notes").show();

    // Hide this button and show the button to cancel the edition and the one to submit the data, also the Copy To All section
    jQuery("#btn-eta-edit-data").hide();
    jQuery("#btn-eta-cancel-edition").show();
    jQuery("#btn-eta-send-data").show();
    jQuery(".copy-to-all").show();
}

// Cancel the edition of the lines
function cancelEdition()
{
    // Hide the columns for edition
    jQuery(".copy-button-header").hide();
    jQuery(".current-ready-date-header").hide();
    jQuery(".current-departure-date-header").hide();
    jQuery(".delay-type-header").hide();
    jQuery(".notes-header").hide();
    jQuery(".copy-button").hide();
    jQuery(".current-ready-date").hide();
    jQuery(".current-departure-date").hide();
    jQuery(".delay-type").hide();
    jQuery(".notes").hide();

    // Hide this button and the one to submit the data and show the button to cancel the edition, also the Copy To All section
    jQuery("#btn-eta-edit-data").show();
    jQuery("#btn-eta-cancel-edition").hide();
    jQuery("#btn-eta-send-data").hide();
    jQuery(".copy-to-all").hide();
}

// Copy the date to all the lines of a shipment / order
function copyToAll()
{
    // Get the shipment / order to copy the date
    let shipmentOrderSelected = jQuery("#copy-to-all-shipment-order-select option:selected")[0]["value"];
    let isShipment = String(shipmentOrderSelected).indexOf("PO") == -1 ? true : false;

    // Get the date to set
    let dateToCopy = jQuery("#copy-to-all-date").val();

    // Set the date
    let linesCount = jQuery(".eta-item-line").length;
    for (let i = 0; i < linesCount; i++)
    {
        let actualRow = jQuery(".eta-item-line").eq(i);
        let actualShipmentOrderNumber = isShipment ? actualRow.find(".shipment-number span").text() : actualRow.find(".purchase-order-number span").text();
        if (actualShipmentOrderNumber == shipmentOrderSelected)
        {
            actualRow.find(".current-ready-date input").val(dateToCopy);
            actualRow.find(".current-ready-date input").change();
        }
    }
}

// Copy the date to a specific shipment / order line
function copyLastReadyDate(pThis)
{
    let row = pThis.parent().parent();
    let lastReadyDateStr = row.find(".last-ready-date span").text();
    let lastReadyDate = new Date(lastReadyDateStr).toISOString().split('T')[0];
    row.find(".current-ready-date input").val(lastReadyDate);
    row.find(".current-ready-date input").change();
}

// Handle if the Submit button is pressed
function etaHandleSubmit(pVendorID)
{
    let numbersWithoutDelayReason = [];
    let linesWithoutDelayReason = "";
    let shipmentsDates = {};
    let shipmentWithDifferentDates = "";

    // Loop through lines to check data
    let linesCount = jQuery(".eta-item-line").length;
    for (let i = 0; i < linesCount; i++)
    {
        let actualRow = jQuery(".eta-item-line").eq(i);

        // Validate if Delay Reason for changing ship date lines
        let delayReasonSelected = actualRow.find(".delay-type select").val();
        let lastReadyDate = actualRow.find(".last-ready-date span").text();
        let currentReadyDate = actualRow.find(".current-ready-date-input").val();
        let currentReadyDateStr = currentReadyDate ? `${currentReadyDate.split("-")[1]}/${currentReadyDate.split("-")[2]}/${currentReadyDate.split("-")[0]}` : "";
        if (lastReadyDate !== "-" && currentReadyDateStr && lastReadyDate !== currentReadyDateStr && delayReasonSelected === "0")
        {
            let shipmentOrderNumber = actualRow.find(".shipment-number span").text().indexOf("Dropship") === -1 ? actualRow.find(".shipment-number span").text() : actualRow.find(".purchase-order-number span").text();
            if (numbersWithoutDelayReason.indexOf(shipmentOrderNumber) === -1)
            {
                numbersWithoutDelayReason.push(shipmentOrderNumber);
                linesWithoutDelayReason = linesWithoutDelayReason == "" ? `${shipmentOrderNumber}` : `${linesWithoutDelayReason}, ${shipmentOrderNumber}`;
            }
        }

        // Validate if the same date for all lines of Shipment
        let shipmentNumber = actualRow.find(".shipment-number span").text();
        shipmentNumber = shipmentNumber !== "Dropship Order" ? shipmentNumber : actualRow.find(".purchase-order-id span").text();
        if (!shipmentsDates[shipmentNumber])
        {
            shipmentsDates[shipmentNumber] = currentReadyDate;
        }
        else
        {
            if (shipmentsDates[shipmentNumber] != currentReadyDate)
            {
                shipmentWithDifferentDates = shipmentNumber;
            }
        }
    }

    if (shipmentWithDifferentDates.length > 0)
    {
        alert(`Two or more items from the same Shipment Number / Purchase Order have different ready dates, if the Shipment Load plan needs to be adjusted, please contact TOV Furniture to make the adjustment.\nShipment Number / Purchase Order: ${shipmentWithDifferentDates}`);
    }
    else if (linesWithoutDelayReason.length > 0)
    {
        alert(`Current Ready Date is changing but no Delay Reason is specified for the next lines: ${linesWithoutDelayReason}.\nPlease add a Delay Reason for them.`);
    }
    else
    {
        submitETAData(pVendorID);
    }
}

// Send the data to store it in Netsuite
function submitETAData(pVendorID)
{
    jQuery('#loading-modal').modal("show");

    // Get the general and lines data
    let generalData = getGeneralData(pVendorID);
    let linesData = getLinesData();
    generalData["allPendingLinesSubmitted"] = linesData.allPendingLinesSubmitted;

    var body = {
        "updateETAData": true,
        "general": generalData,
        "lines": linesData.linesData
    };

    var url = window.location.href;

    var requestData = {
        requestType: "POST",
        url: url,
        body: body
    };

    makeARequest(requestData).then(function(response) {
        jQuery('#loading-modal').modal("hide");

        let requestResponse = JSON.parse(response.response)
        if(requestResponse.status === 'success')
        {
            var url = window.location.href + "&action=thanks";
            location.replace(url);
        }
        else
        {
            console.error("Server Error");
        }
        
    }).catch(function(response) {
        console.log("Request Error");
    });
}

// Get the general data of submission
function getGeneralData(pVendorID)
{
    let generalData = {};

    generalData["vendorID"] = pVendorID;

    return generalData;
}

// Get the data of the lines
function getLinesData()
{
    let linesData = [];
    let allPendingLinesSubmitted = true;

    // Loop through lines
    let linesCount = jQuery(".eta-item-line").length;
    for (let i = 0; i < linesCount; i++)
    {
        let actualRow = jQuery(".eta-item-line").eq(i);

        let isPendingLine = actualRow.find(".circle-notification").length > 0;
        let currentReadyDate = actualRow.find(".current-ready-date-input").val();

        // Validate if all the pending lines are submitted
        if (isPendingLine && !currentReadyDate) allPendingLinesSubmitted = false;

        // If current ready date submitted, process the line
        if (currentReadyDate)
        {
            let shipmentNumber = actualRow.find(".shipment-number span").text();
            let purchaseOrderNumber = actualRow.find(".purchase-order-number span").text();
            let purchaseOrderID = actualRow.find(".purchase-order-id span").text();
            let itemSku = actualRow.find(".item-sku span").text();
            let currentReadyDateStr = currentReadyDate ? `${currentReadyDate.split("-")[1]}/${currentReadyDate.split("-")[2]}/${currentReadyDate.split("-")[0]}` : "";
            let currentDepartureDate = actualRow.find(".current-departure-date-input").val();
            let currentDepartureDateStr = currentDepartureDate ? `${currentDepartureDate.split("-")[1]}/${currentDepartureDate.split("-")[2]}/${currentDepartureDate.split("-")[0]}` : "";
            let vendorCountry = actualRow.find(".vendor-country span").text();
            let locationState = actualRow.find(".location-state span").text();
            let quantityOfDays = calculateDays(vendorCountry, locationState);
            quantityOfDays = quantityOfDays + QUANTITY_BETWEEN_READY_AND_DEPARTURE;
            let expectedToPort = new Date(currentReadyDateStr);
            expectedToPort.setDate(expectedToPort.getDate() + quantityOfDays);
            let expectedToPortStr = expectedToPort ? `${expectedToPort.getMonth()+1}/${expectedToPort.getDate()}/${expectedToPort.getFullYear()}` : "";
            let delayType = actualRow.find(".delay-type select").val();
            let notes = actualRow.find(".notes textarea").val();
    
            linesData.push({
                "isPendingLine": isPendingLine,
                "shipmentNumber": shipmentNumber,
                "purchaseOrderNumber": purchaseOrderNumber,
                "purchaseOrderID": purchaseOrderID,
                "itemSku": itemSku,
                "currentReadyDate": currentReadyDateStr,
                "currentDepartureDate": currentDepartureDateStr,
                "expectedToPort": expectedToPortStr,
                "delayType": delayType,
                "notes": notes
            });
        }
    }

    return {
        "linesData": linesData,
        "allPendingLinesSubmitted": allPendingLinesSubmitted
    };
}

// Calculate the quantity of days for the Expected To Port
function calculateDays(pVendorCountry, pLocationState)
{
    let quantityOfDays = 0;
    if (pVendorCountry === "China" || pVendorCountry === "CN")
    {
        if (pLocationState === "CA")
        {
            quantityOfDays = EXPECTED_TO_PORT_DAYS.CHINA_CA;
        }
        else if (pLocationState === "NC")
        {
            quantityOfDays = EXPECTED_TO_PORT_DAYS.CHINA_NC
        }
    }
    else if (pVendorCountry === "Vietnam" || pVendorCountry === "VN")
    {
        if (pLocationState === "CA")
        {
            quantityOfDays = EXPECTED_TO_PORT_DAYS.VIETNAM_CA;
        }
        else if (pLocationState === "NC")
        {
            quantityOfDays = EXPECTED_TO_PORT_DAYS.VIETNAM_NC;
        }
    }
    else if (pVendorCountry === "India" || pVendorCountry === "IN")
    {
        if (pLocationState === "CA")
        {
            quantityOfDays = EXPECTED_TO_PORT_DAYS.INDIA_CA;
        }
        else if (pLocationState === "NC")
        {
            quantityOfDays = EXPECTED_TO_PORT_DAYS.INDIA_NC;
        }
    }

    return quantityOfDays;
}

// Reload the page if the selected vendor is changed
function changeSelectedVendor()
{

    // Get the selected Vendor
    var vendorSelected = jQuery('.eta-vendors-select #vendors-select option:selected');

    // Modify the URL
    var urlBase = location.toString();
    urlBase = urlBase.split("?")[0];

    var urlSearchParams = new URLSearchParams(location.search);
    urlSearchParams.set("vendor", vendorSelected.val());

    var newURL = String(urlBase) + "?" + urlSearchParams.toString();

    // Reload the page
    location.replace(newURL);
}

// Set the current departure date if the current ready date is changed
function setCurrentDepartureDate(pCurrentReadyDateInput)
{
    let row = pCurrentReadyDateInput.parent().parent();

    // Get the current ready date
    let currentReadyDate = pCurrentReadyDateInput.val();

    if (currentReadyDate)
    {
        // Calculate the current departure date
        let currentDepartureDate = new Date(currentReadyDate + " 00:00:00");
        currentDepartureDate.setDate(currentDepartureDate.getDate() + QUANTITY_BETWEEN_READY_AND_DEPARTURE);
        let currentDepartureDateMonth = String(currentDepartureDate.getMonth() + 1).length === 1 ? "0" + String(currentDepartureDate.getMonth() + 1) : String(currentDepartureDate.getMonth() + 1);
        let currentDepartureDateDate = String(currentDepartureDate.getDate()).length === 1 ? "0" + String(currentDepartureDate.getDate()) : String(currentDepartureDate.getDate());
        let formattedCurrentDepartureDate = `${currentDepartureDate.getFullYear()}-${currentDepartureDateMonth}-${currentDepartureDateDate}`;
    
        // Set the current departure date
        row.find(".current-departure-date-input").val(formattedCurrentDepartureDate);
    }
    else
    {
        row.find(".current-departure-date-input").val(null);
    }
}
