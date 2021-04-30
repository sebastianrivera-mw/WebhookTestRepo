/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Bryan Badilla
 * @contact contact@midware.net
*/
define(["require", "exports", "N/log", "N/search", "N/record", "../Global/Constants"], function (require, exports, log, search, record, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function afterSubmit(pContext) {
        try {
            if (pContext.type === pContext.UserEventType.EDIT || pContext.type === pContext.UserEventType.XEDIT) {
                log.debug("Init Script", "Init Script");
                // Current and old record
                var currentRecord = pContext.newRecord;
                var oldRecord = pContext.oldRecord;
                // Status
                var currentStatusPO = currentRecord.getValue({ fieldId: constants.PURCHASE_ORDER.FIELDS.STATUS });
                var oldStatusPO = oldRecord.getValue({ fieldId: constants.PURCHASE_ORDER.FIELDS.STATUS });
                log.debug("Status Current and Old", currentStatusPO + "   " + oldStatusPO);
                // if not change status
                if (currentStatusPO == oldStatusPO)
                    return;
                var idPO = currentRecord.id;
                var fieldValue = "";
                log.debug("PO ID", idPO);
                if (String(currentStatusPO) == String(constants.PURCHASE_ORDER_STATUSES.VENDOR_ACTION)) {
                    fieldValue = constants.VENDOR_OR_TOV_TEXT.VENDOR;
                }
                else if (String(currentStatusPO) == String(constants.PURCHASE_ORDER_STATUSES.TOV_ACTION)) {
                    fieldValue = constants.VENDOR_OR_TOV_TEXT.TOV;
                }
                // Finish execution
                else {
                    return;
                }
                // Change Field Approval Request and return array of approval request ids
                var arrayIdApproval = changeTOVorVendorField(idPO, fieldValue);
                // Change field in Approval Request Line
                changeLines(arrayIdApproval, fieldValue);
            }
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.afterSubmit = afterSubmit;
    // Change TOV or Vendor field
    function changeTOVorVendorField(pIdPO, pFieldValue) {
        var arrayIDApprovalRequest = [];
        // Search Approval Request
        var approvalRequestPO = search.create({
            type: constants.APPROVAL_REQUEST.ID,
            filters: [
                [constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER, "anyof", pIdPO]
            ],
            columns: [
                search.createColumn({
                    name: "id",
                    sort: search.Sort.ASC
                })
            ]
        });
        approvalRequestPO.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            arrayIDApprovalRequest.push({
                idPOApproval: result.getValue("id")
            });
            // Change Field
            record.submitFields({
                type: constants.APPROVAL_REQUEST.ID,
                id: String(result.getValue("id")),
                values: { "custrecord_mw_vendor_or_tov_side": pFieldValue }
            });
            // Checkboxes to False
            // Approved
            record.submitFields({
                type: constants.APPROVAL_REQUEST.ID,
                id: String(result.getValue("id")),
                values: { "custrecord_mw_approved": false }
            });
            // Pi file
            record.submitFields({
                type: constants.APPROVAL_REQUEST.ID,
                id: String(result.getValue("id")),
                values: { "custrecord_mw_pi_file_uploaded": false }
            });
            // Load plan
            record.submitFields({
                type: constants.APPROVAL_REQUEST.ID,
                id: String(result.getValue("id")),
                values: { "custrecord_mw_load_plan_uploaded": false }
            });
            return true;
        });
        return arrayIDApprovalRequest;
    }
    // Change Approval Request lines
    function changeLines(pArrayIdApproval, pFieldValue) {
        for (var i = 0; i < pArrayIdApproval.length; i++) {
            // Search lines 
            var approvalLines = search.create({
                type: constants.APPROVAL_REQUEST_LINES.ID,
                filters: [
                    [constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST, "anyof", pArrayIdApproval[i].idPOApproval]
                ],
                columns: [
                    search.createColumn({
                        name: "id",
                        sort: search.Sort.ASC
                    }),
                ]
            });
            approvalLines.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                // Submit field, change field in line
                record.submitFields({
                    type: constants.APPROVAL_REQUEST_LINES.ID,
                    id: String(result.getValue("id")),
                    values: { "custrecord_mw_line_vendor_or_tov_side": pFieldValue }
                });
                // Checkbox to false - Approved
                record.submitFields({
                    type: constants.APPROVAL_REQUEST_LINES.ID,
                    id: String(result.getValue("id")),
                    values: { "custrecord_mw_approved_line": false }
                });
                return true;
            });
        }
    }
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
