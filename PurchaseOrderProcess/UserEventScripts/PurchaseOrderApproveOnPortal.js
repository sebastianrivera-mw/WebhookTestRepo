/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/record", "../Global/Constants"], function (require, exports, log, record, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function afterSubmit(pContext) {
        try {
            log.debug("Running", "Running afterSubmit");
            log.debug("pContext.type", pContext.type);
            if (pContext.type === pContext.UserEventType.EDIT || pContext.type === pContext.UserEventType.XEDIT) {
                var oldApprovalStatus = pContext.oldRecord.getValue(constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS);
                log.debug("oldApprovalStatus", oldApprovalStatus);
                var newApprovalStatus = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS);
                log.debug("newApprovalStatus", newApprovalStatus);
                log.debug("constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED", constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED);
                if (oldApprovalStatus && Number(oldApprovalStatus) !== constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED && Number(newApprovalStatus) === constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED) {
                    log.debug("Purchase Order Approved", "Purchase Order ID: " + pContext.newRecord.id + " was approved, changing request.");
                    // Approve the request related to the PO
                    approveRequest(pContext);
                    // Update the Purchase Order status
                    approvePurchaseOrder(pContext);
                    log.debug("Finished", "Finished!");
                    return;
                }
                var oldStatus = pContext.oldRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
                var newStatus = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
                if (oldStatus && Number(oldStatus) !== constants.PURCHASE_ORDER_STATUSES.APPROVED && Number(newStatus) === constants.PURCHASE_ORDER_STATUSES.APPROVED) {
                    log.debug("Purchase Order Status moved to approved", "Purchase Order ID: " + pContext.newRecord.id + " with status moved to approved, changing request.");
                    // Approve the request related to the PO
                    approveRequest(pContext);
                    log.debug("Finished", "Finished!");
                    return;
                }
            }
            else if (pContext.type === pContext.UserEventType.APPROVE) {
                // Approve the request related to the PO
                approveRequest(pContext);
                // Update the Purchase Order status
                approvePurchaseOrder(pContext);
                log.debug("Finished", "Finished!");
            }
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.afterSubmit = afterSubmit;
    // Approve the request related to the PO
    function approveRequest(pContext) {
        var _a;
        var approvalRequestID = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.APPROVAL_REQUEST);
        log.debug("approvalRequestID", approvalRequestID);
        if (approvalRequestID) {
            record.submitFields({
                type: constants.APPROVAL_REQUEST.ID,
                id: String(approvalRequestID),
                values: (_a = {},
                    _a[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED] = true,
                    _a[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED] = true,
                    _a[constants.APPROVAL_REQUEST.FIELDS.APPROVED] = true,
                    _a)
            });
        }
    }
    // Update the Purchase Order status
    function approvePurchaseOrder(pContext) {
        var _a;
        record.submitFields({
            type: record.Type.PURCHASE_ORDER,
            id: String(pContext.newRecord.id),
            values: (_a = {},
                _a[constants.PURCHASE_ORDER.FIELDS.STATUS] = constants.PURCHASE_ORDER_STATUSES.APPROVED,
                _a)
        });
    }
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
