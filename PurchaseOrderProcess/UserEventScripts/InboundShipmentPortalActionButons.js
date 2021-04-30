/**
* @NApiVersion 2.0
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* @author Midware
* @Website www.midware.net
* @developer Walter Bonilla
* @contact contact@midware.net
*/
define(["require", "exports", "N/runtime", "N/log", "N/search"], function (require, exports, runtime, log, search) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function beforeLoad(pContext) {
        try {
            if (runtime.executionContext === runtime.ContextType.USER_INTERFACE && pContext.type !== pContext.UserEventType.CREATE && pContext.type !== pContext.UserEventType.COPY) {
                var isnID = pContext.newRecord.id;
                var data = searchApprovalRequest(isnID);
                var poID = undefined;
                var appReq = undefined;
                if (data && data['purchaseOrder'] && data['aprovalRequest']) {
                    poID = data['purchaseOrder'];
                    appReq = data['aprovalRequest'];
                }
                pContext.form.clientScriptModulePath = "../ClientScripts/InboundShipmentPortalActionsCS.js";
                if (poID && appReq) {
                    // Create the buttons of every action
                    pContext.form.addButton({ id: "custpage_see_on_portal", label: "See On Portal", functionName: "seeOnPortal(\"" + isnID + "\", \"" + poID + "\", \"" + appReq + "\");" });
                }
            }
            return true;
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.beforeLoad = beforeLoad;
    // Search Approval Request 
    function searchApprovalRequest(pISN) {
        var searchAR = search.create({
            type: "customrecord_mw_po_approval_request",
            filters: [
                ["custrecord_mw_related_isns", "anyof", pISN]
            ],
            columns: [
                search.createColumn({
                    name: "id",
                    sort: search.Sort.ASC
                }),
                "custrecord_mw_purchase_order"
            ]
        }).run().getRange({ start: 0, end: 1000 });
        log.debug('searchAR', searchAR);
        var aprovalRequestData = {};
        if (searchAR.length > 0) {
            var values = searchAR[0].getAllValues();
            log.debug('values', values);
            aprovalRequestData['aprovalRequest'] = searchAR[0]['id'];
            aprovalRequestData['purchaseOrder'] = values['custrecord_mw_purchase_order'][0]['value'];
        }
        log.debug('aprovalRequestData', aprovalRequestData);
        return aprovalRequestData;
    }
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
