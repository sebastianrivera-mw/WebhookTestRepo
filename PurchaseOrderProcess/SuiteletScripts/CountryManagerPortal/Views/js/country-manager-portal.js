// Javascript functions for the PO Planner Portal

jQuery(document).ready(function() {

    // Comment Modal
    jQuery('#see-comment-modal').modal({ show: false });

    jQuery("#comment-view span").click(function() {
        showCommentModal(jQuery('#see-comment-modal'), jQuery(this));
    });

    // Summary Buttons
    jQuery(".btn-edit-shipdate").click(function() {
        editShipDate(jQuery(this));
    });

    jQuery(".btn-accept-change-shipdate").click(function() {
        acceptChangeShipDate(jQuery(this));
    });

    jQuery(".btn-cancel-change-shipdate").click(function() {
        cancelChangeShipDate(jQuery(this));
    });

    // Line Buttons
    jQuery(".btn-approve-line").click(function() {
        approveLine(jQuery(this));
    });

    jQuery(".btn-cancel-approved").click(function() {
        cancelApprovedLine(jQuery(this));
    });

    jQuery(".btn-change-line").click(function() {
        changeLine(jQuery(this));
    });

    jQuery(".btn-accept-change").click(function() {
        acceptChangeLine(jQuery(this));
    });

    jQuery(".btn-cancel-change").click(function() {
        cancelChangeLine(jQuery(this));
    });

    jQuery(".btn-cancel-changed").click(function() {
        changeLine(jQuery(this));
    });

    // Main Buttons
    jQuery("#btn-print-order").click(function() {
        printOrder();
    });

    jQuery("#btn-approve-all-lines").click(function() {
        approveAllLines();
    });

    jQuery("#btn-add-general-comment").click(function() {
        showGeneralCommentModal(jQuery('#add-general-comment-modal'));
    });

    jQuery("#btn-save-general-comment").click(function() {
        saveGeneralComment(jQuery('#add-general-comment-modal'));
    });

    jQuery("#btn-accept-all-lines").click(function() {
        acceptAllLines();
    });

    jQuery("#btn-submit-data").click(function() {
        submitData();
    });
});

// ----------------------------------------------------------
// Summary Buttons Actions
// ----------------------------------------------------------

// Change Ship Date on the summary
function editShipDate(pThis)
{
    var summaryTablesSection = pThis.parent();

    // Change buttons
    summaryTablesSection.find(".btn-edit-shipdate").hide();
    summaryTablesSection.find(".btn-accept-change-shipdate").show();
    summaryTablesSection.find(".btn-cancel-change-shipdate").show();

    // Ship Date editable
    var actualShipDate = summaryTablesSection.find(".summary-ship-date .line-new-shipdate").text().trim() || summaryTablesSection.find(".summary-ship-date .line-actual-shipdate").text().trim();
    var splittedDate = actualShipDate.split("/");
    var day = splittedDate[1];
    if (day.length == 1)
    {
        day = "0" + day;
    }
    var month = splittedDate[0];
    if (month.length == 1)
    {
        month = "0" + month;
    }
    var year = splittedDate[2];
    var formattedDate = year + "-" + month + "-" + day;
    summaryTablesSection.find(".summary-ship-date").append("<br /> <input type=\"date\" value=\"" + formattedDate + "\"></input>");
}

// Accept change of data in the ship date
function acceptChangeShipDate(pThis)
{
    var summaryTablesSection = pThis.parent();

    // Change buttons
    summaryTablesSection.find(".btn-edit-shipdate").show();
    summaryTablesSection.find(".btn-accept-change-shipdate").hide();
    summaryTablesSection.find(".btn-cancel-change-shipdate").hide();

    // Set Ship Date
    var actualShipDate = summaryTablesSection.find(".summary-ship-date .line-new-shipdate").text().trim() || summaryTablesSection.find(".summary-ship-date .line-actual-shipdate").text().trim();
    var newShipDate = summaryTablesSection.find(".summary-ship-date input").val();
    var splittedDate = newShipDate.split("-");
    var day = splittedDate[2];
    if (day.length == 1)
    {
        day = "0" + day;
    }
    var month = splittedDate[1];
    if (month.length == 1)
    {
        month = "0" + month;
    }
    var year = splittedDate[0];
    var formattednNewShipDate = month + "/" + day + "/" + year;

    if (actualShipDate != formattednNewShipDate)
    {
        if (summaryTablesSection.find(".line-last-shipdate").length == 0)
        {
            summaryTablesSection.find(".summary-ship-date .line-actual-shipdate-wrapper").remove();
            summaryTablesSection.find(".summary-ship-date").append('<div><span class="line-last-shipdate-label">Req</span><span class="line-last-shipdate"></span></div><div><span class="line-new-shipdate-label">New</span><span class="line-new-shipdate"></span></div>')
        }

        summaryTablesSection.find(".summary-ship-date .line-last-shipdate").text(actualShipDate);
        summaryTablesSection.find(".summary-ship-date .line-new-shipdate").text(formattednNewShipDate);
        summaryTablesSection.find(".summary-ship-date .line-last-shipdate").show();
        summaryTablesSection.find(".summary-ship-date .line-new-shipdate").show();
    }

    summaryTablesSection.find(".summary-ship-date input").remove();
    summaryTablesSection.find(".summary-ship-date br").remove();
}

// Cancel change of data in the ship date
function cancelChangeShipDate(pThis)
{
    var summaryTablesSection = pThis.parent();

    // Change buttons
    summaryTablesSection.find(".btn-edit-shipdate").show();
    summaryTablesSection.find(".btn-accept-change-shipdate").hide();
    summaryTablesSection.find(".btn-cancel-change-shipdate").hide();

    // Show Ship Date
    summaryTablesSection.find(".summary-ship-date span").show();
    summaryTablesSection.find(".summary-ship-date input").remove();
    summaryTablesSection.find(".summary-ship-date br").remove();
}

// ----------------------------------------------------------
// Line Buttons Actions
// ----------------------------------------------------------

// Accept the specific line
function approveLine(pThis)
{
    var row = pThis.parent().parent();

    // Change buttons
    row.find(".line-action #line-approved-alert").show();
    row.find(".line-action .btn-cancel-approved").show();
    row.find(".line-action .btn-approve-line").hide();
    row.find(".line-action .btn-change-line").hide();

    // Action selected
    row.find(".line-action-selected").text("Approved");
}

// Canceling the Accept of the specific line
function cancelApprovedLine(pThis)
{
    var row = pThis.parent().parent();
    var action = row.find(".line-status").text();

    // Change buttons
    row.find(".line-action #line-approved-alert").hide();
    row.find(".line-action .btn-cancel-approved").hide();
    row.find(".line-action .btn-approve-line").show();
    row.find(".line-action .btn-change-line").show();

    // Action selected
    row.find(".line-action-selected").text(action);
}

// Change data in the specific line
function changeLine(pThis)
{
    var row = pThis.parent().parent();

    // Change buttons
    row.find(".line-action .btn-approve-line").hide();
    row.find(".line-action .btn-change-line").hide();
    row.find(".line-action #line-changed-alert").hide();
    row.find(".line-action .btn-cancel-changed").hide();
    row.find(".line-action .btn-accept-change").show();
    row.find(".line-action .btn-cancel-change").show();

    if (row.find(".line-action-selected").text() == "Change")
    {
        row.find(".line-action-selected").text("Pending After Change");
    }
    else
    {
        row.find(".line-action-selected").text("Pending");
    }

    // Quantity editable
    row.find(".line-quantity .line-actual-quantity").hide();
    var actualQuantity = Number(row.find(".line-new-quantity").text()) || Number(row.find(".line-actual-quantity").text());
    row.find(".line-quantity").append("<input class=\"line-change-quantity\" type=\"number\" value=\""+ actualQuantity + "\"></input>");

    // Rate editable
    row.find(".line-rate .line-actual-rate").hide();
    var actualRate = Number(row.find(".line-new-rate").text()) || Number(row.find(".line-actual-rate").text());
    row.find(".line-rate").append("<input type=\"number\" value=\"" + actualRate + "\" min=\"0\" step=\"1.00\" data-number-to-fixed=\"2\" data-number-stepfactor=\"100\" class=\"line-change-rate\"></input>");

    // Expected Receipt Date editable
    /*row.find(".line-receipt-date span").hide();
    var actualDate = row.find(".line-receipt-date").text().trim();
    var splittedDate = actualDate.split("/");
    var day = splittedDate[1];
    if (day.length == 1)
    {
        day = "0" + day;
    }
    var month = splittedDate[0];
    if (month.length == 1)
    {
        month = "0" + month;
    }
    var year = splittedDate[2];
    var formattedDate = year + "-" + month + "-" + day;
    row.find(".line-receipt-date").append("<input type=\"date\" value=\"" + formattedDate + "\"></input>");*/

    // Vendor Changes editable
    var actualRequiredChanges = row.find(".line-tov-changes").text() || "";
    row.find(".line-tov-changes span").hide();
    row.find(".line-tov-changes").append("<textarea rows=\"4\" cols=\"35\">" + actualRequiredChanges + "</textarea>");
}

// Accept change of data in the specific line
function acceptChangeLine(pThis)
{
    var row = pThis.parent().parent();

    // Change buttons
    row.find(".line-action .btn-accept-change").hide();
    row.find(".line-action .btn-cancel-change").hide();
    row.find(".line-action #line-changed-alert").show();
    row.find(".line-action .btn-cancel-changed").show();

    // Action selected
    row.find(".line-action-selected").text("Change");

    // Set Quantity
    var actualQuantity = Number(row.find(".line-new-quantity").text()) || Number(row.find(".line-actual-quantity").text());
    var newQuantity = row.find(".line-quantity input").val();

    if (actualQuantity != newQuantity)
    {
        if (row.find(".line-last-quantity").length == 0)
        {
            row.find(".line-quantity .line-actual-quantity").remove();
            row.find(".line-quantity").append('<div class="line-last-quantity-wrapper"><span class="line-last-quantity-label">Last</span><span class="line-last-quantity"></span></div><div class="line-new-quantity-wrapper"><span class="line-new-quantity-label">New</span><span class="line-new-quantity"></span></div>')
        }
    
        row.find(".line-last-quantity").text(actualQuantity);
        row.find(".line-new-quantity").text(newQuantity);
        row.find(".line-quantity .line-last-quantity").show();
        row.find(".line-quantity .line-new-quantity").show();
    }

    row.find(".line-quantity .line-actual-quantity").show();
    row.find(".line-quantity input").remove();

    // Set Rate
    var actualRate = Number(row.find(".line-new-rate").text()) || Number(row.find(".line-actual-rate").text());
    var newRate = row.find(".line-rate input").val();

    if (actualRate != newRate)
    {
        if (row.find(".line-last-rate").length == 0)
        {
            row.find(".line-rate .line-actual-rate").remove();
            row.find(".line-rate").append('<div class="line-last-rate-wrapper"><span class="line-last-rate-label">Last</span><span class="line-last-rate"></span></div><div class="line-new-rate-wrapper"><span class="line-new-rate-label">New</span><span class="line-new-rate"></span></div>')
        }
    
        row.find(".line-last-rate").text(actualRate);
        row.find(".line-new-rate").text(newRate);
        row.find(".line-rate .line-last-rate").show();
        row.find(".line-rate .line-new-rate").show();
    }

    row.find(".line-rate .line-actual-rate").show();
    row.find(".line-rate input").remove();

    // Set amount
    var newAmount = Number(newQuantity * newRate).toFixed(2);
    row.find(".line-amount span").text(newAmount);

    // Set Receipt Date
    // row.find(".line-receipt-date span").show();
    // row.find(".line-receipt-date input").remove();

    // Set Required Changes
    var requiredChanges = row.find(".line-tov-changes textarea").val() || "";
    row.find(".line-tov-changes span").text(requiredChanges);
    row.find(".line-tov-changes span").show();
    row.find(".line-tov-changes textarea").remove();
}

// Cancel change of data in the specific line
function cancelChangeLine(pThis)
{
    var row = pThis.parent().parent();
    var action = row.find(".line-status").text();
    var actionSelected = row.find(".line-action-selected").text();

    // Change buttons
    if (actionSelected == "Pending")
    {
        row.find(".line-action .btn-approve-line").show();
        row.find(".line-action .btn-change-line").show();
    }
    else if (actionSelected == "Pending After Change")
    {
        row.find(".line-action #line-changed-alert").show();
        row.find(".line-action .btn-cancel-changed").show();
    }

    row.find(".line-action .btn-accept-change").hide();
    row.find(".line-action .btn-cancel-change").hide();

    // Action selected
    row.find(".line-action-selected").text(action);

    // Clean Quantity
    row.find(".line-quantity .line-actual-quantity").show();
    row.find(".line-quantity input").remove();

    // Clean Rate
    row.find(".line-rate .line-actual-rate").show();
    row.find(".line-rate input").remove();

    // Clean  Receipt Date
    // row.find(".line-receipt-date span").show();
    // row.find(".line-receipt-date input").remove();

    // Clean Required Changes
    row.find(".line-tov-changes span").show();
    row.find(".line-tov-changes textarea").remove();
}

// ----------------------------------------------------------
// Main Buttons
// ----------------------------------------------------------

// Open a page with the order PDF
function printOrder()
{
    // Set the print URL
    let domain = location.protocol + "//" + location.host;
    let searchParams = new URLSearchParams(window.location.search);
    let purchaseOrderID = searchParams.get('po');
    let pdfURL = domain + "/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&formnumber=113&trantype=purchord&&id=" + purchaseOrderID + "&label=Purchase+Order&printtype=transaction";

    // Open a new page
    window.open(pdfURL);
}

// Accept all the lines with the Accept button visible
function approveAllLines()
{
    var tableBody = jQuery("#item-lines");
    tableBody.find(".btn-approve-line:visible").click();
}

// Show model with info of a specific comment
function showGeneralCommentModal(pModal)
{
    pModal.modal('show');
}

// Save the General Comment
function saveGeneralComment(pModal)
{
    pModal.modal('hide');
    var comment = jQuery("#add-general-comment-modal textarea").val();
    if (comment != "")
    {
        comment = comment.replace(new RegExp("\n", "g"), "<br>");
        jQuery("#general-comment-area #general-comment-body").html(comment);
        jQuery("#general-comment-area").show();
        jQuery("#btn-add-general-comment").text("Change General Comment");
    }
    else
    {
        jQuery("#general-comment-area").hide();
    }
}

// ----------------------------------------------------------
// Handle Submit
// ----------------------------------------------------------

// Send the data to store it in Netsuite
function submitData()
{
    var generalData = getGeneralData();
    var linesData = getLinesData();
    if (linesData && generalData.shipDateFilled)
    {
        jQuery('#loading-modal').modal("show");

        var generalComment = getGeneralComment();
    
        var body = {
            "general": generalData,
            "lines": linesData,
            "comment": generalComment
        };
    
        var url = window.location.href;
    
        var requestData = {
            requestType: "POST",
            url: url,
            body: body
        };

        makeARequest(requestData).then(function(response) {
            jQuery('#loading-modal').modal("hide");
            
            //TO DO: Handle posible errors.
            let requestResponse = JSON.parse(response.response)
            if(requestResponse.status === 'success')
            {
                location.reload();
            }
            else
            {
                console.error("Server Error");
            }
            
        }).catch(function(response) {
            console.log("Request Error");
        });
    }
    else
    {
        alert("Please be sure to Approve or Change all the data before submitting the form.");
    }
}

// Make a request to a specific URL with specific data
function makeARequest(pData)
{    
    return new Promise((resolve, reject) =>
    {
        var request = new XMLHttpRequest();
        request.open(pData.requestType, pData.url, true);

        request.onerror = function (e)
        {
            reject({
                success: false,
                error: { message: "Error on http request" }
            });
        };

        request.onload = function ()
        {
            var response = request.responseText;
            if (request.status === 200)
            {
                resolve({
                    success: true,
                    response: response
                });
            }
            else
            {
                reject({
                    success: false,
                    error: { message: "Error on http request"}
                });
            }
        }

        if (pData.body)
        {
            request.send(JSON.stringify(pData.body));
        }
        else
        {
            request.send();
        }
    });
}

// Get the data of the order
function getGeneralData()
{
    var summaryTablesSection = jQuery(".summary-area .summary-tables-section");

    let shipDateFilled = true;
    if (summaryTablesSection.find(".summary-ship-date input").is(":visible"))
    {
        shipDateFilled = false;
    }

    // Ship Date editable
    var actualShipDate = summaryTablesSection.find(".summary-ship-date .line-actual-shipdate").text().trim();
    var lastShipDate = summaryTablesSection.find(".summary-ship-date .line-last-shipdate").text().trim();
    var newShipDate = summaryTablesSection.find(".summary-ship-date .line-new-shipdate").text().trim();

    // Check if it is replacement
    var isReplacement = jQuery(".summary-area .order-is-replacement").length > 0;

    let objectToReturn;
    if (actualShipDate)
    {
        objectToReturn = {
            "lastShipDate": "",
            "newShipDate": actualShipDate,
            "shipDateFilled": shipDateFilled,
            "isReplacement": isReplacement
        };
    }
    else
    {
        objectToReturn = {
            "lastShipDate": lastShipDate,
            "newShipDate": newShipDate,
            "shipDateFilled": shipDateFilled,
            "isReplacement": isReplacement
        };
    }

    return objectToReturn;
}

// Get the data of the Lines
function getLinesData()
{
    var linesData = [];
    var pendingActions = false;

    var rows = jQuery("#item-lines .item-line");
    console.log("rows.length", rows.length)
    rows.each(function(index) {

        // Get data from row
        var row = jQuery(this);
        var lineKey = row.find(".line-key span").text();
        var action = row.find(".line-action-selected").text();
        var itemId = row.find(".item-id span").text();
        var itemName = row.find(".item-name span").text();
        var quantity = Number(row.find(".line-new-quantity").text()) || Number(row.find(".line-actual-quantity").text());
        var rate = Number(row.find(".line-new-rate").text()) || Number(row.find(".line-actual-rate").text());
        var amount = quantity * rate;
        var requiredChanges = row.find(".line-tov-changes").text() || "";
        if (action == "Change")
        {
            console.log("change");
            var approved = false;
            var accepted = false;
        }
        else if (action == "Approved")
        {
            console.log("approved");
            var requiredChanges = "";
            var approved = true;
            var accepted = true;
        }
        else if (action == "Accepted by Vendor")
        {
            console.log("accepted");
            var requiredChanges = "";
            var approved = false;
            var accepted = true;
        }
        else
        {
            console.log("pending");
            pendingActions = true;
        }

        // Push object to array
        var object = {
            "lineKey" : lineKey,
            "itemId" : itemId,
            "itemName" : itemName,
            "quantity" : quantity,
            "rate" : rate,
            "amount" : amount,
            // "receiptDate" : receiptDate,
            "requiredChanges" : requiredChanges,
            "approved" : approved,
            "accepted" : accepted
        };

        linesData.push(object);
    });

    if (!pendingActions)
    {
        return linesData;
    }
    else
    {
        return false;
    }
}

// Get the General Comment if present
function getGeneralComment()
{
    return jQuery("#general-comment-body").text();
}

// ----------------------------------------------------------
// View Comment
// ----------------------------------------------------------

// Show model with info of a specific comment
function showCommentModal(pModal, pThis)
{
    var row = pThis.parent().parent();
    var date = row.find("#comment-date").text();
    var from = row.find("#comment-from").text();
    var itemsComments = row.find("#hidden-items-comments").html();
    var generalComment = row.find("#general-comment").text();

    jQuery("#modal-comment-date-and-from").html('<p class="comment-from"><b style="margin-right: 5px;">·</b>From <strong>' + from + '</strong> on <strong>' + date + '</p>');

    if (itemsComments)
    {
        jQuery("#modal-items-comment").html(itemsComments);
    }
    if (generalComment)
    {
        jQuery("#modal-general-comment").html("<strong>General Comment:</strong> " + generalComment);
    }

    pModal.modal('show');
}
