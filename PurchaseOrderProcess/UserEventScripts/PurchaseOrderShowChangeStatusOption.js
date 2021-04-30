/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/search", "N/runtime", "N/log", "N/ui/serverWidget", "../Global/Constants"], function (require, exports, search, runtime, log, serverWidget, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function beforeLoad(pContext) {
        try {
            if (runtime.executionContext === runtime.ContextType.USER_INTERFACE &&
                pContext.type !== pContext.UserEventType.CREATE &&
                pContext.type !== pContext.UserEventType.COPY) {
                var currentStatus = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
                log.debug("Current Status", currentStatus);
                if (currentStatus) {
                    var nextStatuses = getNextStatuses(currentStatus);
                    log.debug("Status Data", nextStatuses);
                    if (nextStatuses.length > 0) {
                        var htmlCode = fillDropdownOptions(nextStatuses);
                        log.debug("HTML Code", htmlCode);
                        pContext.form.addField({
                            id: "custpage_mw_po_status_options",
                            label: "null",
                            type: serverWidget.FieldType.INLINEHTML,
                        }).defaultValue = "<img class=\"inject_html_image\" src=\"\" onerror=\"javascript: jQuery(jQuery('#tbl__back').parent().next()).after(`" + htmlCode + "`); jQuery('#po-status-select').change(function(){ var submitF=require('N/record'); var newStatus = this.value; var identifier = '" + pContext.newRecord.id + "';  document.getElementById('po-status-select').style.display = 'none'; document.getElementById('loading-label').style.display = 'block'; var loadPurchaseOrderRecordPromise=submitF.load.promise({type:submitF.Type.PURCHASE_ORDER,id:identifier}); loadPurchaseOrderRecordPromise.then(function(objRecord) {objRecord.setValue({fieldId: 'custbody_mw_purchase_order_status',value: newStatus});var recordId = objRecord.save();location.reload();}, function(e) {console.error(e); document.getElementById('po-status-select').style.display = 'block'; document.getElementById('loading-label').style.display = 'none';}); }); \"/>";
                    } // 61303623
                }
            }
            return true;
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.beforeLoad = beforeLoad;
    function getNextStatuses(pStatusID) {
        var statusData = search.lookupFields({
            type: constants.PURCHASE_ORDER_STATUS_LIST.ID,
            id: pStatusID,
            columns: [constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NEXT_STATUSES],
        })[constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NEXT_STATUSES];
        return statusData;
    }
    function fillDropdownOptions(pNextStatuses) {
        var htmlCode = "\n    <style>\n        #loading-label {\n            display: none;\n        }\n        .ball-text {\n            margin-right: 17px;\n            display: inline-block;\n            width: auto;\n            font-size: 14px;\n            font-weight: 600;\n            text-align: center;\n            color: black;\n            opacity: 0.8;\n            animation: pulse 1s infinite alternate ease-in-out;\n            /*text-shadow: 0 0 5px rgba(33, 150, 243, .25), 0 0 5px rgba(33, 150, 243, .25), 0 0 5px rgba(33, 150, 243, .25);*/\n        }\n        @keyframes pulse {\n        0% {\n            opacity: 0.8;\n        }\n        100% {\n            opacity: 0.1;\n        }\n        }\n        @keyframes spin {\n        0% {\n            transform:rotate(0deg);\n        }\n        100% { \n            transform:rotate(360deg); \n        }\n        }\n    </style>\n    <button id='loading-label' class='ball-text'>Loading...</button>\n    <td style='padding-right:16px;'>\n        <select id='po-status-select' style='margin-right: 17px;padding-left: 4px; cursor: pointer; height:27.5px; border-color: #b2b2b2 !important; border-radius: 3px; background: linear-gradient(to bottom, #fafafa 0%,#e5e5e5 100%) !important; color: #333333 !important; font-size: 14px !important; font-weight: 600;'>\n            <option value='0' selected disabled hidden>Change Status To</option>";
        for (var i = 0; i < pNextStatuses.length; i++) {
            var nextStatusValue = pNextStatuses[i].value;
            var nextStatusText = constants.PURCHASE_ORDER_STATUSES_TEXT[nextStatusValue];
            htmlCode = htmlCode + ("<option value='" + nextStatusValue + "'>" + nextStatusText + "</option>");
        }
        htmlCode = htmlCode + "</select></td>";
        return htmlCode;
    }
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
