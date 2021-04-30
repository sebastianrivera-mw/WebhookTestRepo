/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from "N/types";

import * as search from "N/search";
import * as runtime from "N/runtime";
import * as log from "N/log";
import * as serverWidget from "N/ui/serverWidget";

import * as constants from "../Global/Constants";

export function beforeLoad(pContext: EntryPoints.UserEvent.beforeLoadContext) {
    try {
        if (
            runtime.executionContext === runtime.ContextType.USER_INTERFACE &&
            pContext.type !== pContext.UserEventType.CREATE &&
            pContext.type !== pContext.UserEventType.COPY
        ) {
            let currentStatus = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
            log.debug("Current Status", currentStatus);

            if (currentStatus) {
                let nextStatuses = getNextStatuses(currentStatus);
                log.debug("Status Data", nextStatuses);

                if (nextStatuses.length > 0) {
                    let htmlCode = fillDropdownOptions(nextStatuses);
                    log.debug("HTML Code", htmlCode);

                    pContext.form.addField({
                        id: "custpage_mw_po_status_options",
                        label: "null",
                        type: serverWidget.FieldType.INLINEHTML,
                    }).defaultValue = `<img class="inject_html_image" src="" onerror="javascript: jQuery(jQuery('#tbl__back').parent().next()).after(\`${htmlCode}\`); jQuery('#po-status-select').change(function(){ var submitF=require('N/record'); var newStatus = this.value; var identifier = '${pContext.newRecord.id}';  document.getElementById('po-status-select').style.display = 'none'; document.getElementById('loading-label').style.display = 'block'; var loadPurchaseOrderRecordPromise=submitF.load.promise({type:submitF.Type.PURCHASE_ORDER,id:identifier}); loadPurchaseOrderRecordPromise.then(function(objRecord) {objRecord.setValue({fieldId: 'custbody_mw_purchase_order_status',value: newStatus});var recordId = objRecord.save();location.reload();}, function(e) {console.error(e); document.getElementById('po-status-select').style.display = 'block'; document.getElementById('loading-label').style.display = 'none';}); }); "/>`;
                } // 61303623
            }
        }

        return true;
    } catch (error) {
        handleError(error);
    }
}

function getNextStatuses(pStatusID) {
    let statusData = search.lookupFields({
        type: constants.PURCHASE_ORDER_STATUS_LIST.ID,
        id: pStatusID,
        columns: [constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NEXT_STATUSES],
    })[constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NEXT_STATUSES];

    return statusData;
}

function fillDropdownOptions(pNextStatuses) {
    let htmlCode = `
    <style>
        #loading-label {
            display: none;
        }
        .ball-text {
            margin-right: 17px;
            display: inline-block;
            width: auto;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            color: black;
            opacity: 0.8;
            animation: pulse 1s infinite alternate ease-in-out;
            /*text-shadow: 0 0 5px rgba(33, 150, 243, .25), 0 0 5px rgba(33, 150, 243, .25), 0 0 5px rgba(33, 150, 243, .25);*/
        }
        @keyframes pulse {
        0% {
            opacity: 0.8;
        }
        100% {
            opacity: 0.1;
        }
        }
        @keyframes spin {
        0% {
            transform:rotate(0deg);
        }
        100% { 
            transform:rotate(360deg); 
        }
        }
    </style>
    <button id='loading-label' class='ball-text'>Loading...</button>
    <td style='padding-right:16px;'>
        <select id='po-status-select' style='margin-right: 17px;padding-left: 4px; cursor: pointer; height:27.5px; border-color: #b2b2b2 !important; border-radius: 3px; background: linear-gradient(to bottom, #fafafa 0%,#e5e5e5 100%) !important; color: #333333 !important; font-size: 14px !important; font-weight: 600;'>
            <option value='0' selected disabled hidden>Change Status To</option>`;

    for (let i = 0; i < pNextStatuses.length; i++) {
        let nextStatusValue = pNextStatuses[i].value;
        let nextStatusText = constants.PURCHASE_ORDER_STATUSES_TEXT[nextStatusValue];

        htmlCode = htmlCode + `<option value='${nextStatusValue}'>${nextStatusText}</option>`;
    }

    htmlCode = htmlCode + `</select></td>`;

    return htmlCode;
}

// Handle errors
function handleError(pError: Error) {
    log.error({ title: "Error", details: pError.message });
    log.error({ title: "Stack", details: JSON.stringify(pError) });
}
