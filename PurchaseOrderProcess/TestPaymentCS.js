/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log"], function (require, exports, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function pageInit(pContext) {
        try {
            jQuery('[name^="custpage_credit_memo_selector_hidden"]').parent().css("display", "none");
            jQuery('[data-label="Notas credito"]').css("display", "none");
            jQuery(document).ready(function () {
                jQuery(".credit-memos-selector").on("change", function () {
                    // Get the previous value
                    var previousValue = jQuery(this).data("previousValue");
                    previousValue = (previousValue != undefined) ? JSON.parse(previousValue) : null;
                    var applyLine = jQuery(this).index('.credit-memos-selector');
                    // Get the selected options
                    var selectedOptions = [];
                    jQuery("option:selected", this).each(function () {
                        selectedOptions.push({
                            "value": jQuery(this).val(),
                            "text": jQuery(this).text(),
                            "total": jQuery(this).attr("data-total"),
                            "due": jQuery(this).attr("data-due"),
                            "line": jQuery(this).attr("data-line")
                        });
                    });
                    // Set the previous value
                    jQuery(this).data("previousValue", JSON.stringify(selectedOptions));
                    // Populate the hidden field with the data of the credit memos
                    pContext.currentRecord.selectLine({ sublistId: "apply", line: applyLine });
                    pContext.currentRecord.setCurrentSublistValue({ sublistId: "apply", fieldId: "custpage_credit_memo_selector_hidden", value: JSON.stringify(selectedOptions) });
                    pContext.currentRecord.commitLine({ sublistId: "apply" });
                    // Update the Credit Memos list and the Credit Memos selects based on the selection
                    updateCreditMemosChange(pContext, previousValue, selectedOptions);
                });
            });
        }
        catch (e) {
            // Handle errors
            handleError(e);
        }
    }
    exports.pageInit = pageInit;
    // Update the Credit Memos list and the Credit Memos selects based on the selection
    function updateCreditMemosChange(pContext, pPreviousValues, pNewValues) {
        if (pPreviousValues) {
            // Get the options that were unchecked from the select
            var removedValues = getRemovedOptions(pPreviousValues, pNewValues);
            for (var i = 0; i < removedValues.length; i++) {
                // Check the line on the Credit Memos list
                var creditMemoLine = removedValues[i].line;
                pContext.currentRecord.selectLine({ sublistId: "credit", line: creditMemoLine });
                pContext.currentRecord.setCurrentSublistValue({ sublistId: "credit", fieldId: "apply", value: false });
                pContext.currentRecord.commitLine({ sublistId: "credit" });
                // Hide the credit memo on the rest of selects
                var creditMemoValue = removedValues[i].value;
                jQuery('.credit-memos-selector option[value="' + creditMemoValue + '"]').show();
            }
            for (var i = 0; i < pNewValues.length; i++) {
                // Check the line on the Credit Memos list
                var creditMemoLine = pNewValues[i].line;
                pContext.currentRecord.selectLine({ sublistId: "credit", line: creditMemoLine });
                pContext.currentRecord.setCurrentSublistValue({ sublistId: "credit", fieldId: "apply", value: true });
                pContext.currentRecord.commitLine({ sublistId: "credit" });
                // Hide the credit memo on the rest of selects
                var creditMemoValue = pNewValues[i].value;
                jQuery('.credit-memos-selector option[value="' + creditMemoValue + '"]:not(:selected)').hide();
            }
        }
        else {
            for (var i = 0; i < pNewValues.length; i++) {
                // Check the line on the Credit Memos list
                var creditMemoLine = pNewValues[i].line;
                pContext.currentRecord.selectLine({ sublistId: "credit", line: creditMemoLine });
                pContext.currentRecord.setCurrentSublistValue({ sublistId: "credit", fieldId: "apply", value: true });
                pContext.currentRecord.commitLine({ sublistId: "credit" });
                // Hide the credit memo on the rest of selects
                var creditMemoValue = pNewValues[i].value;
                jQuery('.credit-memos-selector option[value="' + creditMemoValue + '"]:not(:selected)').hide();
            }
        }
    }
    // Get the options that were unchecked from the select
    function getRemovedOptions(pPreviousValues, pNewValues) {
        var removedValues = [];
        for (var i = 0; i < pPreviousValues.length; i++) {
            var previousValue = pPreviousValues[i].value;
            var valueFound = false;
            for (var j = 0; j < pNewValues.length; j++) {
                var newValue = pNewValues[j].value;
                if (previousValue === newValue) {
                    valueFound = true;
                    break;
                }
            }
            if (!valueFound)
                removedValues.push(pPreviousValues[i]);
        }
        return removedValues;
    }
    function fieldChanged(pContext) {
        try {
            log.debug("Running fieldChanged", "Running fieldChanged - " + pContext.fieldId);
            if (pContext.sublistId === "apply" && (pContext.fieldId === "apply" || pContext.fieldId === "custpage_credit_memo_selector_hidden")) {
                var apply = pContext.currentRecord.getSublistValue({ sublistId: "apply", fieldId: "apply", line: pContext.line });
                if (apply) {
                    // Calculate and set the discount to apply to the line
                    calculateAndSetDiscount(pContext, pContext.line);
                }
            }
        }
        catch (e) {
            // Handle errors
            handleError(e);
        }
    }
    exports.fieldChanged = fieldChanged;
    // Calculate and set the discount to apply to the line
    function calculateAndSetDiscount(pContext, pLine) {
        var creditMemosData = String(pContext.currentRecord.getSublistValue({ sublistId: pContext.sublistId, fieldId: "custpage_credit_memo_selector_hidden", line: pLine }));
        creditMemosData = (creditMemosData.length > 1) ? JSON.parse(creditMemosData) : null;
        log.debug("creditMemosData", creditMemosData);
        // Get the total of the credit memos
        var creditMemosTotal = 0;
        if (creditMemosData) {
            creditMemosTotal = getCreditMemosTotal(creditMemosData);
            log.debug("creditMemosTotal", creditMemosTotal);
        }
        // Get the data of the payment conditions
        var paymentConditionsData = String(pContext.currentRecord.getValue("custbody_mw_cust_paym_conditions_data")) || null;
        paymentConditionsData = (paymentConditionsData) ? JSON.parse(paymentConditionsData) : null;
        log.debug("paymentConditionsData", paymentConditionsData);
        if (paymentConditionsData) {
            var applyDateStr = String(pContext.currentRecord.getSublistValue({ sublistId: pContext.sublistId, fieldId: "applydate", line: pLine }));
            var applyDate = new Date(applyDateStr);
            var today = new Date();
            var differenceInTime = applyDate.getTime() - today.getTime();
            var differenceInDays = Math.abs(Math.round(differenceInTime / (1000 * 3600 * 24)));
            // TODO: Remove
            differenceInDays = 10;
            log.debug("differenceInDays", differenceInDays);
            // Get the discount to apply based on the difference of days
            var discountToApply = getDiscountBasedOnDate(paymentConditionsData, differenceInDays);
            log.debug("discountToApply", discountToApply);
            // Calculate the discount amount based on the amount due, the credit memos total and the percentage to apply
            var amountDue = Number(pContext.currentRecord.getSublistValue({ sublistId: pContext.sublistId, fieldId: "due", line: pLine }));
            var discount = getDiscount(amountDue, creditMemosTotal, discountToApply.custrecord_mw_porc_desc_condicion_pago);
            log.debug("discount", discount);
            pContext.currentRecord.setCurrentSublistValue({ sublistId: "apply", fieldId: "disc", value: discount });
        }
    }
    // Get the discount to apply based on the difference of days
    function getDiscountBasedOnDate(pPaymentConditionsData, pDifferenceInDays) {
        var discountToApply;
        var smallerQuantityDays;
        for (var i = 0; i < pPaymentConditionsData.length; i++) {
            var actualQuantityDays = pPaymentConditionsData[i].custrecord_mw_dias_condicion_pago;
            if (pDifferenceInDays <= actualQuantityDays && (!smallerQuantityDays || actualQuantityDays < smallerQuantityDays)) {
                discountToApply = pPaymentConditionsData[i];
                smallerQuantityDays = actualQuantityDays;
            }
        }
        return discountToApply || null;
    }
    // Get the total of the credit memos
    function getCreditMemosTotal(pCreditMemosData) {
        var total = 0;
        for (var i = 0; i < pCreditMemosData.length; i++) {
            var due = Number(pCreditMemosData[i].due);
            total += due;
        }
        return total;
    }
    // Calculate the discount to apply based on the amount due, the credit memos total and the percentage to apply
    function getDiscount(pAmountDue, pCreditMemosTotal, pDiscountPerc) {
        var discountPerc = Number(String(pDiscountPerc).replace("%", "")) / 100;
        var total = pAmountDue - pCreditMemosTotal;
        var discount = total * discountPerc;
        return discount > 0 ? discount : 0;
    }
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
