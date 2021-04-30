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
        showShipdateChangeReasonModal(jQuery(this));
    });

    jQuery("#btn-save-shipdate-change-reason").click(function() {
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

    jQuery("#btn-add-general-comment").click(function() {
        jQuery('#add-general-comment-modal').modal('show');
    });

    jQuery("#btn-save-general-comment").click(function() {
        saveGeneralComment(jQuery('#add-general-comment-modal'));
    });

    jQuery("#btn-approve-all-lines").click(function() {
        approveAllLines();
    });

    jQuery("#btn-change-all-lines").click(function() {
        changeAllLines();
    });

    jQuery("#btn-refresh-all-lines").click(function() {
        refreshAllLines();
    });

    jQuery("#btn-submit-data").click(function() {
        handleSubmit("updateOrderData", null);
    });

    // Upload PI and Load Plan buttons
    jQuery("#btn-new-pi").click(function() {
        jQuery('#upload-pi-file-modal').modal('show');
    });

    jQuery("#btn-upload-pi-file").click(function() {
        handleSubmit("updateOrderData", "piFileChange");
    });

    jQuery("#btn-new-load-plan").click(function() {
        jQuery('#upload-load-plan-modal').modal('show');
    });

    jQuery("#btn-upload-load-plan").click(function() {
        handleSubmit("updateOrderData", "loadPlan");
    });

    // Shipment Files Buttons
    jQuery("#btn-new-related-shipment-file").click(function() {
        jQuery('#upload-related-shipments-files-modal').modal('show');
        jQuery('#upload-related-shipments-files-modal .modal-title').text("Upload Related Shipment Files");
    });

    jQuery("#btn-upload-related-shipments-files").click(function() {
        handleSubmit("uploadShipmentFiles", null);
    });

    // Filters on Load Plans page
    jQuery("#load-plans-tables-area .nav-link").click(function() {
        jQuery('#orders-search-input').val('');
        jQuery('#orders-search-input').trigger('change');
        jQuery('#vendor-search-input').val('');
        jQuery('#vendor-search-input').trigger('change');
        jQuery('#booking-status-filter').val('none');
        jQuery('#booking-status-filter').trigger('change');
    });

    // Calculate and set the fields on the summary box
    reCalculateSummaryFields();
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
    if (summaryTablesSection.find(".summary-ship-date .line-new-shipdate-wrapper").length > 0)
    {
        summaryTablesSection.find(".summary-ship-date .line-new-shipdate-wrapper").after("<br /> <input type=\"date\" value=\"" + formattedDate + "\"></input>");
    }
    else
    {
        summaryTablesSection.find(".summary-ship-date .line-actual-shipdate-wrapper").after("<br /> <input type=\"date\" value=\"" + formattedDate + "\"></input>");
    }
}

// Show the modal to ask for reason to change the shipdate
function showShipdateChangeReasonModal(pThis)
{
    var summaryTablesSection = pThis.parent();

    // Check if Ship Date changed
    var actualShipDate = summaryTablesSection.find(".summary-ship-date .line-new-shipdate").text().trim() || summaryTablesSection.find(".summary-ship-date .line-actual-shipdate").text().trim();
    var newShipDate = summaryTablesSection.find(".summary-ship-date input").val();
    var splittedDate = newShipDate.split("-");
    var day = splittedDate[2];
    day = day.replace("0", "");
    var month = splittedDate[1];
    month = month.replace("0", "");
    var year = splittedDate[0];
    var formattedNewShipDate = month + "/" + day + "/" + year;

    if (actualShipDate != formattedNewShipDate)
    {
        jQuery("#shipdate-change-reason-modal").modal("show");
    }
    else
    {
        // Change buttons
        summaryTablesSection.find(".btn-edit-shipdate").show();
        summaryTablesSection.find(".btn-accept-change-shipdate").hide();
        summaryTablesSection.find(".btn-cancel-change-shipdate").hide();

        // Remove input
        summaryTablesSection.find(".summary-ship-date input").remove();
        summaryTablesSection.find(".summary-ship-date br").remove();
    }
}

// Accept change of data in the ship date
function acceptChangeShipDate(pThis)
{
    var summaryTablesSection = jQuery(".summary-tables-section");
    var changeReasonModalBody = pThis.parent();

    // Change buttons
    summaryTablesSection.find(".btn-edit-shipdate").show();
    summaryTablesSection.find(".btn-accept-change-shipdate").hide();
    summaryTablesSection.find(".btn-cancel-change-shipdate").hide();

    // Set Ship Date
    var actualShipDate = summaryTablesSection.find(".summary-ship-date .line-new-shipdate").text().trim() || summaryTablesSection.find(".summary-ship-date .line-actual-shipdate").text().trim();
    var newShipDate = summaryTablesSection.find(".summary-ship-date input").val();
    var splittedDate = newShipDate.split("-");
    var day = splittedDate[2];
    day = day.replace("0", "");
    var month = splittedDate[1];
    month = month.replace("0", "");
    var year = splittedDate[0];
    var formattedNewShipDate = month + "/" + day + "/" + year;
    var changeReason = changeReasonModalBody.find("textarea").val() || "";

    if (!changeReason)
    {
        alert("Please add a reason for the change on the Latest Cargo Ship Date.");
    }
    else
    {
        if (actualShipDate != formattedNewShipDate)
        {
            if (summaryTablesSection.find(".line-last-shipdate").length == 0)
            {
                summaryTablesSection.find(".summary-ship-date .line-actual-shipdate-wrapper").remove();
                summaryTablesSection.find(".summary-ship-date").append('<div><span class="line-last-shipdate-label">Req</span><span class="line-last-shipdate"></span></div><div><span class="line-new-shipdate-label">New</span><span class="line-new-shipdate"></span></div><br></br><span class="change-reason-label"><strong>Change Reason: </strong></span><div class="shipdate-change-reason-wrapper"><span class="shipdate-change-reason"></span></div>');
            }
    
            summaryTablesSection.find(".summary-ship-date .line-last-shipdate").text(actualShipDate);
            summaryTablesSection.find(".summary-ship-date .line-new-shipdate").text(formattedNewShipDate);
            summaryTablesSection.find(".summary-ship-date .shipdate-change-reason").text(changeReason);
            summaryTablesSection.find(".summary-ship-date .line-last-shipdate").show();
            summaryTablesSection.find(".summary-ship-date .line-new-shipdate").show();
            summaryTablesSection.find(".summary-ship-date .shipdate-change-reason").show();
        }
    
        summaryTablesSection.find(".summary-ship-date input").remove();
        summaryTablesSection.find(".summary-ship-date br").remove();
        jQuery("#shipdate-change-reason-modal").modal("hide");
    }
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
    // row.find(".line-action .btn-cancel-approved").show();
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
    row.find(".line-action #line-approved-alert").hide();
    row.find(".line-action #line-changed-alert").hide();
    row.find(".line-action #line-denied-alert").hide();
    row.find(".line-action .approve-check-input").show();
    row.find(".line-action .approve-check-input-label").show();
    // row.find(".line-action .btn-cancel-changed").hide();
    // row.find(".line-action .btn-accept-change").show();
    // row.find(".line-action .btn-cancel-change").show();

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

    // Purchase Price editable
    row.find(".line-purchase-price .line-actual-purchase-price").hide();
    var actualRate = Number(row.find(".line-new-purchase-price").text()) || Number(row.find(".line-actual-purchase-price").text());
    row.find(".line-purchase-price").append("<input type=\"number\" value=\"" + actualRate + "\" min=\"0\" step=\"1.00\" data-number-to-fixed=\"2\" data-number-stepfactor=\"100\" class=\"line-change-rate\"></input>");

    // CBM editable
    row.find(".line-cbm .line-actual-cbm").hide();
    var actualCBM = Number(row.find(".line-new-cbm").text()) || Number(row.find(".line-actual-cbm").text());
    row.find(".line-cbm").append("<input type=\"number\" value=\"" + actualCBM + "\" min=\"0\" step=\"1.00\" data-number-to-fixed=\"2\" data-number-stepfactor=\"100\" class=\"line-change-cbm\"></input>");

    // Vendor Changes editable
    var actualRequiredChanges = row.find(".line-tov-changes").text() || "";
    row.find(".line-tov-changes span").hide();
    row.find(".line-tov-changes").append("<textarea rows=\"4\" cols=\"35\">" + actualRequiredChanges + "</textarea>");
}

// Accept change of data in the specific line
function acceptChangeLine(pThis)
{
    var row = pThis.parent().parent();
    var lineChanged = false;
    var lineDenied = false;

    // Validate required changes if Quantity and Purchase Price changed
    var requiredChanges = row.find(".line-vendor-changes textarea").val() || "";
    var actualQuantity = Number(row.find(".line-new-quantity").text()) || Number(row.find(".line-actual-quantity").text());
    var newQuantity = row.find(".line-quantity input").val();
    var actualPurchPrice = Number(row.find(".line-new-purchase-price").text()) || Number(row.find(".line-actual-purchase-price").text());
    var newPurchPrice = row.find(".line-purchase-price input").val();
    var actualCBM = Number(row.find(".line-new-cbm").text()) || Number(row.find(".line-actual-cbm").text());
    var newCBM = row.find(".line-cbm input").val();
    var approved = row.find(".approve-check-input").is(":checked");
    var action = row.find(".line-action-selected").text();

    if (!approved && (actualQuantity != newQuantity || actualPurchPrice != newPurchPrice || actualCBM != newCBM || action == "Change" || action == "Pending After Change"))
    {
        lineChanged = true;
    }
    else if (!approved)
    {
        lineDenied = true;
    }

    // Action selected and buttons
    if (lineChanged)
    {
        row.find(".line-action-selected").text("Change");
        row.find(".line-action #line-changed-alert").show();
        // row.find(".line-action .btn-cancel-changed").show();
    }
    else if (lineDenied)
    {
        row.find(".line-action-selected").text("Denied");
        row.find(".line-action #line-denied-alert").show();
    }
    else
    {
        row.find(".line-action-selected").text("Approved");
        row.find(".line-action #line-approved-alert").show();
        // row.find(".line-action .btn-cancel-accepted").show();
    }

    // Change buttons
    row.find(".line-action .btn-accept-change").hide();
    row.find(".line-action .btn-cancel-change").hide();
    row.find(".line-action .approve-check-input").hide();
    row.find(".line-action .approve-check-input-label").hide();

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

    // Set Purchase Price
    var actualPurchPrice = Number(row.find(".line-new-purchase-price").text()) || Number(row.find(".line-actual-purchase-price").text());
    var newPurchPrice = row.find(".line-purchase-price input").val();

    if (actualPurchPrice != newPurchPrice)
    {
        if (row.find(".line-last-purchase-price").length == 0)
        {
            row.find(".line-purchase-price .line-actual-purchase-price").remove();
            row.find(".line-purchase-price").append('<div class="line-last-purchase-price-wrapper"><span class="line-last-purchase-price-label">Last</span><span class="line-last-purchase-price"></span></div><div class="line-new-purchase-price-wrapper"><span class="line-new-purchase-price-label">New</span><span class="line-new-purchase-price"></span></div>')
        }
    
        row.find(".line-last-purchase-price").text(actualPurchPrice);
        row.find(".line-new-purchase-price").text(newPurchPrice);
        row.find(".line-purchase-price .line-last-purchase-price").show();
        row.find(".line-purchase-price .line-new-purchase-price").show();
    }

    row.find(".line-purchase-price .line-actual-purchase-price").show();
    row.find(".line-purchase-price input").remove();

    // Set rate
    var tariffDiscount = Number(row.find(".line-tariff-discount span").text().replace("%", ""));
    var discount = newPurchPrice * (tariffDiscount / 100);
    var newRate = Number(newPurchPrice - discount).toFixed(2);
    row.find(".line-rate span").text(newRate);

    // Set amount
    var newAmount = Number(newQuantity * newRate).toFixed(2);
    row.find(".line-amount span").text(newAmount);

    // Set CBM
    if (actualCBM != newCBM)
    {
        if (row.find(".line-last-cbm").length == 0)
        {
            row.find(".line-cbm .line-actual-cbm").remove();
            row.find(".line-cbm").append('<div class="line-last-cbm-wrapper"><span class="line-last-cbm-label">Last</span><span class="line-last-cbm"></span></div><div class="line-new-cbm-wrapper"><span class="line-new-cbm-label">New</span><span class="line-new-cbm"></span></div>')
        }
    
        row.find(".line-last-cbm").text(actualCBM);
        row.find(".line-new-cbm").text(newCBM);
        row.find(".line-cbm .line-last-cbm").show();
        row.find(".line-cbm .line-new-cbm").show();
    }

    row.find(".line-cbm .line-actual-cbm").show();
    row.find(".line-cbm input").remove();

    // Calculate and set the fields on the summary box
    reCalculateSummaryFields();

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

    // Clean Purchase Price
    row.find(".line-purchase-price .line-actual-purchase-price").show();
    row.find(".line-purchase-price input").remove();

    // Clean Required Changes
    row.find(".line-tov-changes span").show();
    row.find(".line-tov-changes textarea").remove();
}

// Calculate and set the fields on the summary box
function reCalculateSummaryFields()
{
    var subtotal = 0;
    var total = 0;
    var totalcbm = 0;
    var rows = jQuery("#item-lines .item-line");
    rows.each(function(index) {

        // Get data from row
        var row = jQuery(this);
        var quantity = Number(row.find(".line-new-quantity").text()) || Number(row.find(".line-actual-quantity").text());
        var purchasePrice = Number(row.find(".line-new-purchase-price").text()) || Number(row.find(".line-actual-purchase-price").text());
        var rate = Number(row.find(".line-rate span").text());
        var cbm = Number(row.find(".line-cbm span").text());
        var purchasePriceAmount = quantity * purchasePrice;
        var rateAmount = quantity * rate;
        var linecbm = quantity * cbm;
        
        subtotal += purchasePriceAmount;
        total += rateAmount;
        totalcbm += linecbm;
    });

    subtotal = Number(subtotal !== 0 ? subtotal : total).toFixed(2);
    total = Number(total).toFixed(2);
    totalcbm = Number(totalcbm).toFixed(2);
    var vendorDiscount = Number(subtotal - total).toFixed(2);
    var containerCount = Math.ceil(totalcbm / 74);

    jQuery(".summary-tables-section .summary-table .subtotal td span").text("$" + Number(subtotal).toFixed(2));
    jQuery(".summary-tables-section .summary-table .total td span").text("$" + Number(total).toFixed(2));
    if (vendorDiscount > 0)
    {
        jQuery(".summary-tables-section .summary-table .vendor-discount td span").text("-$" + vendorDiscount);
    }
    else
    {
        jQuery(".summary-tables-section .summary-table .vendor-discount td span").text("$" + vendorDiscount);
    }
    jQuery(".summary-tables-section .summary-table .total-cbm td span").text(totalcbm);
    jQuery(".summary-tables-section .summary-table .container-count td span").text(containerCount);
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
    tableBody.find(".btn-approve-line").click();
}

// Change all the lines with the Edit button visible
function changeAllLines()
{
    jQuery("#btn-approve-all-lines").hide();
    jQuery("#btn-change-all-lines").hide();
    jQuery("#btn-refresh-all-lines").show();

    // Change action header
    jQuery("#action-header").html('<label class="approve-check-master-input-label" for="approve-line-check-${i}" style="display:block;">Approve</label><input type="checkbox" class="approve-check-master-input" id="approve-check-master-input" onclick="toggleApproved()">');

    var tableBody = jQuery("#item-lines");
    tableBody.find(".btn-change-line").click();
    // tableBody.find(".btn-cancel-changed:visible").click();
}

// Refresh all the lines
function refreshAllLines()
{    
    // jQuery("#btn-accept-all-lines").show();
    jQuery("#btn-change-all-lines").show();
    jQuery("#btn-refresh-all-lines").hide();

    // Change action header
    jQuery("#action-header").html('<span>Action</span>');

    var tableBody = jQuery("#item-lines");
    tableBody.find(".line-action .btn-accept-change").click();
}

// Toggle the approved checkbox of all the lines
function toggleApproved()
{
    var masterCheckbox = jQuery("#approve-check-master-input");
    var masterChecked = masterCheckbox.is(':checked');
    var checkboxes = jQuery(".approve-check-input");
    checkboxes.each(function(index) {
        var checkbox = jQuery(this);
        if (!masterChecked)
        {
            checkbox.prop('checked', false);
        }
        else
        {
            checkbox.prop('checked', true);
        }
    });
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
        saveGeneralCommentOnLines(comment);
    }
    else
    {
        jQuery("#general-comment-area").hide();
    }
}

// Save the general comment on the lines that are being edited
function saveGeneralCommentOnLines(pGeneralComment)
{
    var rows = jQuery("#item-lines .item-line");
    rows.each(function() {
        var row = jQuery(this);

        var requiredChanges = row.find(".line-tov-changes textarea").val() || "";
        if (!requiredChanges)
        {
            var commentToAdd = "General comment: " + pGeneralComment;
            row.find(".line-tov-changes textarea").val(commentToAdd);
        }
    });
}

// ----------------------------------------------------------
// Handle Submit
// ----------------------------------------------------------

// Send the data to store it in Netsuite
function handleSubmit(pSubmissionType, pFileType)
{
    // If it is a submission to update the data of the order
    if (pSubmissionType && pSubmissionType == "updateOrderData")
    {
        if (pFileType && pFileType == "piFileChange")
        {
            var piFile = jQuery("input[id^='pi-file-content-").val();
            console.log(piFile)
            if (piFile)
            {
                submitData(null, null, null, piFile, "");
            }
            else
            {
                alert("Uploading a PI file is required.");
            }
        }
        else if (pFileType && pFileType == "loadPlan")
        {
            var loadPlanFile = jQuery("input[id^='load-plan-file-content-").val();
            if (loadPlanFile)
            {
                submitData(null, null, null, "", loadPlanFile);
            }
            else
            {
                alert("Uploading a Load Plan is required.");
            }
        }
        else 
        {
            var generalData = getGeneralData();
            var linesData = getLinesData();
            if (linesData && generalData.shipDateFilled)
            {
                jQuery('#loading-modal').modal("show");
        
                var generalComment = getGeneralComment();
                if (generalComment)
                {
                    linesData = addGeneralCommentToLines(linesData, generalComment);
                }
                
                submitData(generalData, linesData, generalComment, "");
            }
            else
            {
                alert("Please be sure to Approve or Change all the data before submitting the form.");
            }
        }
    }
    // If it is a submission to mark the ISN as In Transit
    else if (pSubmissionType && pSubmissionType == "uploadShipmentFiles")
    {
        var fileContents = [];

        var relatedShipmentFilesInputs = jQuery('.related-shipment-file-input');
        relatedShipmentFilesInputs.each(function(index) {
            var relatedShipmentFileInput = jQuery(this);

            fileContents.push({
                "id": relatedShipmentFileInput.attr('id'),
                "content": relatedShipmentFileInput.val()
            });
        });

        uploadShipmentFiles(fileContents);
    }
}

// Send the data to store it in Netsuite
function submitData(pGeneralData, pLinesData, pGeneralComment, pPIFileContent, pLoadPlanContent)
{
    jQuery('#acceptance-confirmation-modal').modal("hide");
    jQuery('#upload-load-plan-modal').modal("hide");
    jQuery('#upload-pi-file-modal').modal("hide");
    jQuery('#loading-modal').modal("show");

    var body = {
        "general": pGeneralData,
        "lines": pLinesData,
        "comment": pGeneralComment,
        "piFileContent": pPIFileContent,
        "loadPlanContent": pLoadPlanContent
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

// Send the data to store it in Netsuite
function uploadShipmentFiles(pFilesContents)
{
    jQuery('#upload-related-shipments-files-modal').modal("hide");
    jQuery('#loading-modal').modal("show");

    var body = {
        "uploadShipmentFiles": true,
        "filesContents": pFilesContents
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
    var shipDateChangeReason = summaryTablesSection.find(".summary-ship-date .shipdate-change-reason").text();

    // Check if it is replacement
    var isReplacement = jQuery(".summary-area .order-is-replacement").length > 0;

    // Get the total
    var total = summaryTablesSection.find(".summary-table .total span").text().replace("$", "");

    let objectToReturn;
    if (actualShipDate)
    {
        objectToReturn = {
            "lastShipDate": "",
            "newShipDate": actualShipDate,
            "shipDateFilled": shipDateFilled,
            "isReplacement": isReplacement,
            "total": total
        };
    }
    else
    {
        objectToReturn = {
            "lastShipDate": lastShipDate,
            "newShipDate": newShipDate,
            "shipDateChangeReason": shipDateChangeReason,
            "shipDateFilled": shipDateFilled,
            "isReplacement": isReplacement,
            "total": total
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
    rows.each(function(index) {

        // Get data from row
        var row = jQuery(this);
        var lineKey = row.find(".line-key span").text();
        var action = row.find(".line-action-selected").text();
        var itemId = row.find(".item-id span").text();
        var itemName = row.find(".item-name span").text();
        var quantity = Number(row.find(".line-new-quantity").text()) || Number(row.find(".line-actual-quantity").text());
        var purchasePrice = Number(row.find(".line-new-purchase-price").text()) || Number(row.find(".line-actual-purchase-price").text());
        var rate = Number(row.find(".line-rate span").text());
        var amount = quantity * rate;
        var cbm = Number(row.find(".line-new-cbm").text()) || Number(row.find(".line-actual-cbm").text());
        var requiredChanges = row.find(".line-tov-changes").text() || "";
        if (action == "Change")
        {
            var approved = false;
            var accepted = false;
            var denied = false;
        }
        else if (action == "Approved")
        {
            var requiredChanges = "";
            var approved = true;
            var accepted = true;
            var denied = false;
        }
        else if (action == "Denied")
        {
            var approved = false;
            var accepted = false;
            var denied = true;
        }
        else if (action == "Accepted by Vendor")
        {
            var requiredChanges = "";
            var approved = false;
            var accepted = true;
            var denied = false;
        }

        // Push object to array
        var object = {
            "lineKey" : lineKey,
            "itemId" : itemId,
            "itemName" : itemName,
            "quantity" : quantity,
            "purchasePrice" : purchasePrice,
            "rate" : rate,
            "amount" : amount,
            "cbm" : cbm,
            "requiredChanges" : requiredChanges,
            "approved" : approved,
            "accepted" : accepted,
            "denied" : denied
        };

        linesData.push(object);
    });

    return linesData;
}

// Get the General Comment if present
function getGeneralComment()
{
    return jQuery("#general-comment-body").text();
}

// Add the general comment to the lines data
function addGeneralCommentToLines(pLinesData, pGeneralComment)
{
    for (var i = 0; i < pLinesData.length; i++)
    {
        var lineRequiredChanges = pLinesData[i].requiredChanges;
        if (!lineRequiredChanges)
        {
            pLinesData[i].requiredChanges = "General comment: " + pGeneralComment;
        }
    }

    return pLinesData;
}

// Handle the content of an input file
function handleFileContents(pInputFileID, pContentsInputClass)
{
    var counter = 0;
    var files = jQuery('#' + pInputFileID).prop('files');
    for (var i = 0; i < files.length; i++)
    {
        var file = files[i];
    
        var fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = function () {
            var index = jQuery('.file-contents-input').length;
            var inputToStoreData = jQuery('<input class="file-contents-input ' + pContentsInputClass + '" name="' + pInputFileID + '-content-' + index + '" id="' + pInputFileID + '-content-' + index + '" type="text">');

            var actualFile = files[counter];
            counter++;
            var fileObj = { name: actualFile.name, size: actualFile.size, type: actualFile.type, contents: "" };
            fileObj.contents = fileReader.result;

            inputToStoreData[0].value = JSON.stringify(fileObj);
            jQuery('#' + pInputFileID).after(inputToStoreData);
            inputToStoreData.hide();
        };
    }
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

// ----------------------------------------------------------
// Other functions
// ----------------------------------------------------------

// Update the results on the orders search
function updateOrdersSearchResult(pFilterType, pColumnName)
{
    var filter;
    if (pFilterType == "isnNumber")
    {
        var filter = jQuery("#orders-search-input").val().toUpperCase();
    }
    else if (pFilterType == "vendor")
    {
        var filter = jQuery("#vendor-search-input").val().toUpperCase();
    }
    else if (pFilterType == "shipmentStatus")
    {
        var filter = jQuery("#shipment-status-filter option:selected").text().toUpperCase();
    }
    else if (pFilterType == "bookingStatus")
    {
        var filter = jQuery("#booking-status-filter option:selected").text().toUpperCase();
    }

    var table = jQuery(".po-planner-orders-table table");
    var rows = table.find(".item-line");
    rows.each(function(index) {
        var row = jQuery(this);
        var name = row.find(pColumnName).text();
        if (name.toUpperCase().indexOf(filter) > -1) {
            row.show();
        }
        else {
            row.hide();
        }
    });

    var visibleRows = table.find(".item-line:visible");
    visibleRows.each(function(index) {
        var visibleRow = jQuery(this);
        if (index % 2 == 0) {
            visibleRow.css("background-color", "#fad2d2");
        }
        else {
            visibleRow.css("background-color", "#fff");
        }
    });
}
