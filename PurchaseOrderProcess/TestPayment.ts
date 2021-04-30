/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as serverWidget from "N/ui/serverWidget";
import * as search from 'N/search';

export function beforeLoad(pContext: EntryPoints.UserEvent.beforeLoadContext)
{
    try
    {
        log.debug("Running beforeLoad", "Running beforeLoad");

        if (pContext.type === pContext.UserEventType.CREATE || pContext.type === pContext.UserEventType.EDIT)
        {
            let form = pContext.form;
            let payment = pContext.newRecord;
    
            // Add a new field to select the Credit Memos
            let multiSelectHTML = createCreditMemoSelect(payment);
            if (multiSelectHTML)
            {
                let applySublist = form.getSublist({ id: "apply" });       
                applySublist.addField({ id : 'custpage_credit_memo_selector', type : serverWidget.FieldType.TEXT, label : 'Notas de crédito' })
                .defaultValue = multiSelectHTML;

                applySublist.addField({ id : 'custpage_credit_memo_selector_hidden', type : serverWidget.FieldType.TEXTAREA, label : 'Notas credito' })
                .updateDisplayType({ displayType: serverWidget.FieldDisplayType.ENTRY });
            }

            // Get and set on a hidden field the payment conditions data
            let customerID = payment.getValue("customer");
            log.debug("customerID", customerID);

            let paymentConditionsData = getCustomerPaymentConditions(customerID);
            log.debug("paymentConditionsData", paymentConditionsData);

            payment.setValue("custbody_mw_cust_paym_conditions_data", JSON.stringify(paymentConditionsData));
        }
    }
    catch(e)
    {
        // Handle errors
        handleError(e);
    }
}

// Create the select with the credit memos
function createCreditMemoSelect(pPayment)
{
    let multiSelectHTML = '<select class="credit-memos-selector" style="width: 100%;" multiple>';

    let creditSublistCount = pPayment.getLineCount({ sublistId: "credit" });
    log.debug("creditSublistCount", creditSublistCount);
    if (creditSublistCount === 0) return null;

    for (let i = 0; i < creditSublistCount; i++)
    {
        let creditMemoID = pPayment.getSublistValue({ sublistId: "credit", fieldId: "internalid", line: i });
        let creditMemoName = pPayment.getSublistValue({ sublistId: "credit", fieldId: "refnum", line: i });
        let creditMemoTotal = pPayment.getSublistValue({ sublistId: "credit", fieldId: "total", line: i });
        let creditMemoDue = pPayment.getSublistValue({ sublistId: "credit", fieldId: "due", line: i });
        log.debug("creditMemo", "creditMemoID: " + creditMemoID + " - creditMemoName: " + creditMemoName + " - creditMemoTotal: " + creditMemoTotal + " - creditMemoDue: " + creditMemoDue);

        multiSelectHTML += `<option value="${creditMemoID}" data-total="${creditMemoTotal}" data-due="${creditMemoDue}" data-line="${i}">${creditMemoName}</option>`;
    }

    multiSelectHTML += "</select>";

    return multiSelectHTML;
}

// Get the data of the payment conditions of the customer
function getCustomerPaymentConditions(pCustomerID)
{
    let paymentConditionsSearch = search.create({
        type: "customrecord_mw_condiciones_pago_cliente",
        filters: [
            search.createFilter({ name: "custrecord_mw_cliente_condicion_pago", operator: search.Operator.ANYOF, values: [pCustomerID] })
        ],
        columns: [
            search.createColumn({ name: "custrecord_mw_dias_condicion_pago" }),
            search.createColumn({ name: "custrecord_mw_porc_desc_condicion_pago" })
        ]
    });

    let paymentConditionsData = [];
    let paymentConditionsSearchResults = paymentConditionsSearch.runPaged({ pageSize: 1000 });
    for (let i = 0; i < paymentConditionsSearchResults.pageRanges.length; i++)
    {
        let page = paymentConditionsSearchResults.fetch({index: paymentConditionsSearchResults.pageRanges[i].index});
        for (let j = 0; j < page.data.length; j++)
        {
            let result = page.data[j];

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
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
