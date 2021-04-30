// Javascript functions for the Vendor Portal

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
    jQuery(".btn-accept-line").click(function() {
        acceptLine(jQuery(this));
    });

    jQuery(".btn-cancel-accepted").click(function() {
        cancelAcceptedLine(jQuery(this));
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
    jQuery("#btn-accept-all-lines").click(function() {
        acceptAllLines();
    });

    jQuery("#btn-add-general-comment").click(function() {
        jQuery('#add-general-comment-modal').modal('show');
    });

    jQuery("#btn-save-general-comment").click(function() {
        saveGeneralComment(jQuery('#add-general-comment-modal'));
    });

    jQuery("#btn-accept-all-lines").click(function() {
        acceptAllLines();
    });

    jQuery("#btn-change-all-lines").click(function() {
        changeAllLines();
    });

    jQuery("#btn-refresh-all-lines").click(function() {
        refreshAllLines();
    });

    jQuery("#btn-submit-data").click(function() {
        handleSubmit(jQuery(this), "updateOrderData", null);
    });

    jQuery("#btn-acceptance-confirmation").click(function() {
        handleSubmit(jQuery(this), "updateOrderData", "piFile");
    });

    // Upload PI and Load Plan buttons
    jQuery("#btn-new-pi").click(function() {
        jQuery('#upload-pi-file-modal').modal('show');
    });

    jQuery("#btn-upload-pi-file").click(function() {
        handleSubmit(jQuery(this), "updateOrderData", "piFileChange");
    });

    jQuery("#btn-new-load-plan").click(function() {
        jQuery('#upload-load-plan-modal').modal('show');
    });

    jQuery("#btn-upload-load-plan").click(function() {
        handleSubmit(jQuery(this), "updateOrderData", "loadPlan");
    });

    // Mark In Transit and Shipment Files Buttons
    jQuery("#btn-open-upload-files").click(function() {
        jQuery('#upload-shipment-files-modal').modal('show');
        jQuery('#upload-shipment-files-modal .modal-title').text("Upload Shipment Files");
    });

    jQuery("#btn-new-related-shipment-file").click(function() {
        jQuery('#upload-shipment-files-modal').modal('show');
        jQuery('#upload-shipment-files-modal .modal-title').text("Upload Shipment Files");
    });

    jQuery("#btn-submit-shipments-files").click(function() {
        handleSubmit(jQuery(this), "submitShipmentsFiles", null);
    });

    jQuery("#btn-mark-as-in-transit").click(function() {
        jQuery('#mark-as-intransit-modal').modal('show');
        jQuery('#mark-as-intransit-modal .modal-title').text("Mark As In Transit");
    });

    jQuery("#btn-mark-in-transit").click(function() {
        handleSubmit(jQuery(this), "markInTransit", null);
    });

    // Filters on Load Plans page
    jQuery("#load-plans-tables-area .nav-link").click(function() {
        jQuery('#orders-search-input').val('');
        jQuery('#orders-search-input').trigger('change');
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
    day = day != "10" && day != "20" && day != "30" ? day.replace("0", "") : day;
    var month = splittedDate[1];
    month = month != "10" ? month.replace("0", "") : month;
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
                summaryTablesSection.find(".summary-ship-date").append('<div class="line-last-shipdate-wrapper"><span class="line-last-shipdate-label">Req</span><span class="line-last-shipdate"></span></div><div class="line-new-shipdate-wrapper"><span class="line-new-shipdate-label">New</span><span class="line-new-shipdate"></span></div><br></br><span class="change-reason-label"><strong>Change Reason: </strong></span><div class="shipdate-change-reason-wrapper"><span class="shipdate-change-reason"></span></div>');
                summaryTablesSection.find(".summary-ship-date .line-last-shipdate").text(actualShipDate);
            }
    
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
function acceptLine(pThis)
{
    var row = pThis.parent().parent();

    // Change buttons
    row.find(".line-action #line-accepted-alert").show();
    // row.find(".line-action .btn-cancel-accepted").show();
    // row.find(".line-action .btn-accept-line").hide();
    // row.find(".line-action .btn-change-line").hide();

    // Action selected
    row.find(".line-action-selected").text("Accepted");
}

// Canceling the Accept of the specific line
function cancelAcceptedLine(pThis)
{
    var row = pThis.parent().parent();

    // Change buttons
    row.find(".line-action #line-accepted-alert").hide();
    row.find(".line-action .btn-cancel-accepted").hide();
    row.find(".line-action .btn-accept-line").show();
    row.find(".line-action .btn-change-line").show();

    // Action selected
    row.find(".line-action-selected").text("Pending");
}

// Change data in the specific line
function changeLine(pThis)
{
    var row = pThis.parent().parent();

    // Change buttons
    row.find(".line-action .btn-accept-line").hide();
    row.find(".line-action .btn-change-line").hide();
    row.find(".line-action #line-changed-alert").hide();
    row.find(".line-action #line-accepted-alert").hide();
    // row.find(".line-action .btn-cancel-changed").hide();
    // row.find(".line-action .btn-accept-change").show();
    // row.find(".line-action .btn-cancel-change").show();

    // Action selected
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
    var actualRequiredChanges = row.find(".line-vendor-changes").text() || "";
    row.find(".line-vendor-changes span").hide();
    row.find(".line-vendor-changes").append("<textarea rows=\"4\" cols=\"35\">" + actualRequiredChanges + "</textarea><div class=\"required-label\">* Required if quantity or price is changed</div>");
}

// Accept change of data in the specific line
function acceptChangeLine(pThis)
{
    var row = pThis.parent().parent();
    var lineChanged = false;

    // Validate required changes if Quantity and Purchase Price changed
    var requiredChanges = row.find(".line-vendor-changes textarea").val() || "";
    var actualQuantity = Number(row.find(".line-new-quantity").text()) || Number(row.find(".line-actual-quantity").text());
    var newQuantity = row.find(".line-quantity input").val();
    var actualPurchPrice = Number(row.find(".line-new-purchase-price").text()) || Number(row.find(".line-actual-purchase-price").text());
    var newPurchPrice = row.find(".line-purchase-price input").val();
    var actualCBM = Number(row.find(".line-new-cbm").text()) || Number(row.find(".line-actual-cbm").text());
    var newCBM = row.find(".line-cbm input").val();
    var action = row.find(".line-action-selected").text();

    if (actualQuantity != newQuantity || actualPurchPrice != newPurchPrice || actualCBM != newCBM || action == "Change" || action == "Pending After Change")
    {
        lineChanged = true;

        if (!requiredChanges)
        {
            var itemName = row.find(".item-name span").text();
            alert("Please fill the Vendor Changes field for item " + itemName);
            return;
        }
    }

    // Action selected and buttons
    if (lineChanged)
    {
        row.find(".line-action-selected").text("Change");
        row.find(".line-action #line-changed-alert").show();
        // row.find(".line-action .btn-cancel-changed").show();
    }
    else
    {
        row.find(".line-action-selected").text("Accepted");
        row.find(".line-action #line-accepted-alert").show();
        // row.find(".line-action .btn-cancel-accepted").show();
    }

    // Change buttons
    row.find(".line-action .btn-accept-change").hide();
    row.find(".line-action .btn-cancel-change").hide();

    // Set Quantity
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
    row.find(".line-vendor-changes span").text(requiredChanges);
    row.find(".line-vendor-changes span").show();
    row.find(".line-vendor-changes textarea").remove();
    row.find(".line-vendor-changes .required-label").remove();
}

// Cancel change of data in the specific line
function cancelChangeLine(pThis)
{
    var row = pThis.parent().parent();
    var actionSelected = row.find(".line-action-selected").text();

    // Change buttons
    if (actionSelected == "Pending")
    {
        row.find(".line-action .btn-accept-line").show();
        row.find(".line-action .btn-change-line").show();
    }
    else if (actionSelected == "Pending After Change")
    {
        row.find(".line-action #line-changed-alert").show();
        row.find(".line-action .btn-cancel-changed").show();

        // Action selected
        row.find(".line-action-selected").text("Change");
    }

    row.find(".line-action .btn-accept-change").hide();
    row.find(".line-action .btn-cancel-change").hide();

    // Clean Quantity
    row.find(".line-quantity .line-actual-quantity").show();
    row.find(".line-quantity input").remove();

    // Clean Purchase Price
    row.find(".line-purchase-price .line-actual-purchase-price").show();
    row.find(".line-purchase-price input").remove();

    // Clean Required Changes
    row.find(".line-vendor-changes span").show();
    row.find(".line-vendor-changes textarea").remove();
    row.find(".line-vendor-changes .required-label").remove();
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
    var containerCount = Number(totalcbm / 66).toFixed(2);

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
function printOrder(pPrintOrderURL)
{
    // Set the print URL
    let searchParams = new URLSearchParams(window.location.search);
    let purchaseOrderID = searchParams.get('po');
    let pdfURL = pPrintOrderURL + "&po=" + purchaseOrderID;

    // Open a new page
    window.open(pdfURL);
}

// Accept all the lines with the Accept button visible
function acceptAllLines()
{
    var tableBody = jQuery("#item-lines");
    tableBody.find(".btn-accept-line").click();
}

// Change all the lines with the Edit button visible
function changeAllLines()
{
    jQuery("#btn-accept-all-lines").hide();
    jQuery("#btn-change-all-lines").hide();
    jQuery("#btn-refresh-all-lines").show();

    var tableBody = jQuery("#item-lines");
    tableBody.find(".btn-change-line").click();
    // tableBody.find(".btn-cancel-changed:visible").click();
}

// Refresh all the lines
function refreshAllLines()
{
    var allLinesCorrect = true;
    var rows = jQuery("#item-lines .item-line");
    rows.each(function(index) {

        // Validate required changes if Quantity and Purchase Price changed
        var row = jQuery(this);
        var action = row.find(".line-action-selected").text();
        if (action != "Approved")
        {
            var requiredChanges = row.find(".line-vendor-changes textarea").val() || "";
            var actualQuantity = Number(row.find(".line-new-quantity").text()) || Number(row.find(".line-actual-quantity").text());
            var newQuantity = row.find(".line-quantity input").val();
            var actualPurchPrice = Number(row.find(".line-new-purchase-price").text()) || Number(row.find(".line-actual-purchase-price").text());
            var newPurchPrice = row.find(".line-purchase-price input").val();
            var actualCBM = Number(row.find(".line-new-cbm").text()) || Number(row.find(".line-actual-cbm").text());
            var newCBM = row.find(".line-cbm input").val();
    
            if (actualQuantity != newQuantity || actualPurchPrice != newPurchPrice || actualCBM != newCBM)
            {
                if (!requiredChanges)
                {
                    var itemName = row.find(".item-name span").text();
                    alert("Please fill the Vendor Changes field for item " + itemName);
                    allLinesCorrect = false;
                    return;
                }
            }
        }
    });

    if (allLinesCorrect)
    {
        // jQuery("#btn-accept-all-lines").show();
        jQuery("#btn-change-all-lines").show();
        jQuery("#btn-refresh-all-lines").hide();
    
        var tableBody = jQuery("#item-lines");
        tableBody.find(".line-action .btn-accept-change").click();
    }
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

// Handle if the Submit button is pressed
function handleSubmit(pButton, pSubmissionType, pFileType)
{
    // If it is a submission to update the data of the order
    if (pSubmissionType && pSubmissionType == "updateOrderData")
    {
        if (pFileType && pFileType == "piFile")
        {
            var piFile = jQuery("input[id^='pi-file-content-").val();
            var loadPlanFile = jQuery("input[id^='load-plan-file-content-").val();
            if (piFile)
            {
                var generalData = getGeneralData();
                var linesDataObj = getLinesData();
                var linesData = linesDataObj.linesData;
                if (linesData)
                {
                    var linesData = linesDataObj.linesData;
                    var generalComment = getGeneralComment();
                    submitData(generalData, linesData, generalComment, piFile, loadPlanFile);
                }
            }
            else
            {
                alert("Uploading a PI file is required.");
            }
        }
        else if (pFileType && pFileType == "piFileChange")
        {
            var piFile = jQuery("input[id^='pi-file2-content-").val();
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
            var loadPlanFile = jQuery("input[id^='load-plan-file2-content-").val();
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
            var linesDataObj = getLinesData();

            var allLinesAccepted = linesDataObj.allLinesAccepted;
            if (allLinesAccepted && !generalData.isReplacement)
            {
                if (pButton.hasClass('upload-pi-btn'))
                {
                    jQuery('#acceptance-confirmation-modal').modal('show');
                }
                else if (pButton.hasClass('upload-plan-btn'))
                {
                    jQuery('#upload-load-plan-modal').modal('show');
                }
                else
                {
                    jQuery('#acceptance-confirmation-modal').modal('show');
                }
            }
            else if (linesDataObj && generalData.shipDateFilled)
            {
                var linesData = linesDataObj.linesData;
                var generalComment = getGeneralComment();
                submitData(generalData, linesData, generalComment, "");
            }
            else
            {
                alert("Please be sure to Accept or Change all the data before submitting the form.");
            }
        }
    }
    // If it is a submission to submit the shipment related files
    else if (pSubmissionType && pSubmissionType == "submitShipmentsFiles")
    {
        // Add the shipment files inputs to the submitted shipment files area
        var fileContents = [];
        var shipmentFileInputs = jQuery('.shipment-file-input');
        shipmentFileInputs.each(function(index) {

            var shipmentFileInput = jQuery(this);
            shipmentFileInput.clone().appendTo("#submitted-shipment-files-area");

            var shipmentFileInputContent = JSON.parse(shipmentFileInput.val());
            var inputId = shipmentFileInput.attr('id');
            var fileName = shipmentFileInputContent.name;

            var type = "";
            if (inputId.includes("tsca-regulation-file"))
            {
                type = "TSCA Regulation File"
            }
            else if (inputId.includes("packing-slip-file"))
            {
                type = "Packing Slip & Commercial Invoice"
            }
            else if (inputId.includes("loading-report-file"))
            {
                type = "Loading Report"
            }
            else if (inputId.includes("other-shipment-file"))
            {
                type = "Other"
            }

            fileContents.push({
                "type": type,
                "name": fileName
            });
        });

        // Add a list with the type and name of the file
        var addList = false;
        var list = "<h5 class='shipment-data-to-submit-title'>Data to submit</h5><ul>";
        for (var i = 0; i < fileContents.length; i++)
        {
            var actualFileContent = fileContents[i];
            var element = "<li>" + actualFileContent.type + ": " + actualFileContent.name + "</li>";
            list += element;
            addList = true;
        }

        // Add the container number to the list on the submitted shipment files area
        var containerNumber = jQuery('#container-number').val();
        if (containerNumber)
        {
            var containerNumberElement = "<li id='container-number'>Container number: <span>" + containerNumber + "</span></li>";
            list += containerNumberElement;
            addList = true;
        }
        list += "</ul>";

        // Append the list to the submitted shipment files area
        if (addList)
        {
            jQuery("#submitted-shipment-files-area").append(list);
            jQuery("#btn-mark-as-in-transit").show();
        }

        // Hide the modal
        jQuery('#upload-shipment-files-modal').modal("hide");
    }
    // If it is a submission to mark the ISN as In Transit
    else if (pSubmissionType && pSubmissionType == "markInTransit")
    {
        var fileContents = [];

        // Get content of the files
        var markInTransitInputs = jQuery('#submitted-shipment-files-area .shipment-file-input');
        markInTransitInputs.each(function(index) {
            var markInTransitInput = jQuery(this);

            fileContents.push({
                "id": markInTransitInput.attr('id'),
                "content": markInTransitInput.val()
            });
        });

        // Get container number
        var containerNumber = jQuery('#submitted-shipment-files-area #container-number span').text() || null;

        var agreeTermsChecked = jQuery("#agree-terms").is(":checked");
        if (agreeTermsChecked)
        {
            markAsInTransit(fileContents, containerNumber);
        }
        else
        {
            alert("Please agree if all the information is accurate.");
        }
    }
    // If it is a submission to mark the ISN as In Transit
    else if (pSubmissionType && pSubmissionType == "uploadShipmentFiles")
    {
        var fileContents = [];

        var markInTransitInputs = jQuery('.mark-in-transit-input');
        markInTransitInputs.each(function(index) {
            var markInTransitInput = jQuery(this);

            fileContents.push({
                "id": markInTransitInput.attr('id'),
                "content": markInTransitInput.val()
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

// Send the data to store it in Netsuite
function markAsInTransit(pFilesContents, pContainerNumber)
{
    jQuery('#mark-as-intransit-modal').modal("hide");
    jQuery('#loading-modal').modal("show");

    var body = {
        "markInTransit": true,
        "uploadShipmentFiles": false,
        "filesContents": pFilesContents,
        "containerNumber": pContainerNumber
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

    // Get Ship Date data
    var actualShipDate = summaryTablesSection.find(".summary-ship-date .line-actual-shipdate").text().trim();
    var lastShipDate = summaryTablesSection.find(".summary-ship-date .line-last-shipdate").text().trim();
    var newShipDate = summaryTablesSection.find(".summary-ship-date .line-new-shipdate").text().trim();
    var newShipDate = summaryTablesSection.find(".summary-ship-date .line-new-shipdate").text().trim();
    var shipDateChangeReason = summaryTablesSection.find(".summary-ship-date .shipdate-change-reason").text();

    // Check if it is replacement or dropship
    var isReplacement = jQuery(".summary-area .order-is-replacement").length > 0;
    var isDropship = jQuery(".summary-area .order-is-dropship").length > 0;

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
            "isDropship": isDropship,
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
            "isDropship": isDropship,
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
    var allLinesAccepted = true;

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
        var requiredChanges = row.find(".line-vendor-changes").text() || "";
        if (action == "Change")
        {
            // var receiptDate = row.find(".line-receipt-date input").val();
            var accepted = false;
            allLinesAccepted = false;
        }
        else if (action == "Accepted" || action == "Approved" || action == "Accepted by Vendor")
        {
            // var receiptDate = row.find(".line-receipt-date span").text();
            var requiredChanges = "";
            var accepted = true;
        }
        else
        {
            pendingActions = true;
            return;
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
            "accepted" : accepted
        };

        linesData.push(object);
    });

    if (!pendingActions)
    {
        return {
            "linesData": linesData,
            "allLinesAccepted": allLinesAccepted
        };
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
    else if (pFilterType == "shipmentStatus")
    {
        var filter = jQuery("#shipment-status-filter option:selected").text().toUpperCase();
    }
    else if (pFilterType == "bookingStatus")
    {
        var filter = jQuery("#booking-status-filter option:selected").text().toUpperCase();
    }

    var table = jQuery(".shipments-table table");
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
