/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/ui/serverWidget", "N/search"], function (require, exports, log, serverWidget, search) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function beforeLoad(pContext) {
        try {
            log.debug("Running beforeLoad", "Running beforeLoad");
            if (pContext.type === pContext.UserEventType.CREATE || pContext.type === pContext.UserEventType.EDIT) {
                var form = pContext.form;
                var payment = pContext.newRecord;
                // Add a new field to select the Credit Memos
                var multiSelectHTML = createCreditMemoSelect(payment);
                if (multiSelectHTML) {
                    var applySublist = form.getSublist({ id: "apply" });
                    applySublist.addField({ id: 'custpage_credit_memo_selector', type: serverWidget.FieldType.TEXT, label: 'Notas de crédito' })
                        .defaultValue = multiSelectHTML;
                    applySublist.addField({ id: 'custpage_credit_memo_selector_hidden', type: serverWidget.FieldType.TEXTAREA, label: 'Notas credito' })
                        .updateDisplayType({ displayType: serverWidget.FieldDisplayType.ENTRY });
                }
                // Get and set on a hidden field the payment conditions data
                var customerID = payment.getValue("customer");
                log.debug("customerID", customerID);
                var paymentConditionsData = getCustomerPaymentConditions(customerID);
                log.debug("paymentConditionsData", paymentConditionsData);
                payment.setValue("custbody_mw_cust_paym_conditions_data", JSON.stringify(paymentConditionsData));
            }
        }
        catch (e) {
            // Handle errors
            handleError(e);
        }
    }
    exports.beforeLoad = beforeLoad;
    // Create the select with the credit memos
    function createCreditMemoSelect(pPayment) {
        var multiSelectHTML = '<select class="credit-memos-selector" style="width: 100%;" multiple>';
        var creditSublistCount = pPayment.getLineCount({ sublistId: "credit" });
        log.debug("creditSublistCount", creditSublistCount);
        if (creditSublistCount === 0)
            return null;
        for (var i = 0; i < creditSublistCount; i++) {
            var creditMemoID = pPayment.getSublistValue({ sublistId: "credit", fieldId: "internalid", line: i });
            var creditMemoName = pPayment.getSublistValue({ sublistId: "credit", fieldId: "refnum", line: i });
            var creditMemoTotal = pPayment.getSublistValue({ sublistId: "credit", fieldId: "total", line: i });
            var creditMemoDue = pPayment.getSublistValue({ sublistId: "credit", fieldId: "due", line: i });
            log.debug("creditMemo", "creditMemoID: " + creditMemoID + " - creditMemoName: " + creditMemoName + " - creditMemoTotal: " + creditMemoTotal + " - creditMemoDue: " + creditMemoDue);
            multiSelectHTML += "<option value=\"" + creditMemoID + "\" data-total=\"" + creditMemoTotal + "\" data-due=\"" + creditMemoDue + "\" data-line=\"" + i + "\">" + creditMemoName + "</option>";
        }
        multiSelectHTML += "</select>";
        return multiSelectHTML;
    }
    // Get the data of the payment conditions of the customer
    function getCustomerPaymentConditions(pCustomerID) {
        var paymentConditionsSearch = search.create({
            type: "customrecord_mw_condiciones_pago_cliente",
            filters: [
                search.createFilter({ name: "custrecord_mw_cliente_condicion_pago", operator: search.Operator.ANYOF, values: [pCustomerID] })
            ],
            columns: [
                search.createColumn({ name: "custrecord_mw_dias_condicion_pago" }),
                search.createColumn({ name: "custrecord_mw_porc_desc_condicion_pago" })
            ]
        });
        var paymentConditionsData = [];
        var paymentConditionsSearchResults = paymentConditionsSearch.runPaged({ pageSize: 1000 });
        for (var i = 0; i < paymentConditionsSearchResults.pageRanges.length; i++) {
            var page = paymentConditionsSearchResults.fetch({ index: paymentConditionsSearchResults.pageRanges[i].index });
            for (var j = 0; j < page.data.length; j++) {
                var result = page.data[j];
                paymentConditionsData.push({
                    "id": result.id,
                    "custrecord_mw_dias_condicion_pago": result.getValue("custrecord_mw_dias_condicion_pago"),
                    "custrecord_mw_porc_desc_condicion_pago": result.getValue("custrecord_mw_porc_desc_condicion_pago")
                });
            }
        }
        return paymentConditionsData;
    }
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
