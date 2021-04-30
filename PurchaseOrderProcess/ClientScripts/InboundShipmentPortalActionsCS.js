/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Walter Bonila
 * @contact contact@midware.net
 */
define(["require", "exports", "N/url", "../Global/Constants"], function (require, exports, url, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function pageInit(pContext) {
    }
    exports.pageInit = pageInit;
    // Open a new page with the PO Planner Portal page
    function seeOnPortal(pInboundShipmentID, pPurchaseOrderID, pApprovalRequestID) {
        var plannerPortalURL = url.resolveScript({
            scriptId: constants.SCRIPTS.PO_PLANNER_PORTAL_SUITELET.ID,
            deploymentId: constants.SCRIPTS.PO_PLANNER_PORTAL_SUITELET.DEPLOY,
            params: {
                id: pApprovalRequestID,
                po: pPurchaseOrderID,
                isn: pInboundShipmentID,
                page: 'load-plans'
            }
        });
        window.open(plannerPortalURL);
    }
    exports.seeOnPortal = seeOnPortal;
});
