/**
* @NApiVersion 2.0
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* @author Midware
* @Website www.midware.net
* @developer Roy Cordero
* @contact contact@midware.net
*/
define(["require", "exports", "N/runtime", "N/log", "N/ui/serverWidget", "../Global/Constants"], function (require, exports, runtime, log, serverWidget, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function beforeLoad(pContext) {
        try {
            if (runtime.executionContext === runtime.ContextType.USER_INTERFACE && pContext.type !== pContext.UserEventType.CREATE && pContext.type !== pContext.UserEventType.COPY) {
                var purchaseOrderID = pContext.newRecord.id;
                var approvalRequestID = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.APPROVAL_REQUEST);
                pContext.form.clientScriptModulePath = "../ClientScripts/PurchaseOrderPortalActionsCS.js";
                // Create the buttons of every action
                pContext.form.addButton({ id: "custpage_see_on_portal", label: "See On Portal", functionName: "seeOnPortal(\"" + purchaseOrderID + "\", \"" + approvalRequestID + "\");" }).isHidden = true;
                pContext.form.addButton({ id: "custpage_refresh_portal", label: "Refresh Portal", functionName: "refreshPortal(\"" + purchaseOrderID + "\", \"" + approvalRequestID + "\");" }).isHidden = true;
                pContext.form.addButton({ id: "custpage_resend_portal_email", label: "Resend Portal Email", functionName: "resendPortalEmail(\"" + purchaseOrderID + "\");" }).isHidden = true;
                // Create dropdown with the possible actions
                var actionsDropdown = createActionsDropdown();
                // Add the dropdown
                pContext.form.addField({
                    id: "custpage_mw_vendor_portal_actions",
                    label: "null",
                    type: serverWidget.FieldType.INLINEHTML,
                }).defaultValue = "\n            <img class=\"inject_html_image\" src=\"\" onerror=\"javascript: \n                jQuery(jQuery('#tbl_custpage_see_on_portal').parent()).after(`" + actionsDropdown + "`);\n                jQuery('#vendor-portal-actions').change(function() {\n                    var action = this.value;\n                    if (action == 'see') {\n                        jQuery('#tbl_custpage_see_on_portal #custpage_see_on_portal').click();\n                        jQuery('#vendor-portal-actions').val('default-option');\n                    }\n                    else if (action == 'refresh') {\n                        document.getElementById('vendor-portal-actions').style.display = 'none';\n                        document.getElementById('vendor-actions-loading-label').style.display = 'block';\n                        jQuery('#tbl_custpage_refresh_portal #custpage_refresh_portal').click();\n                    }\n                    else if (action == 'resend') {\n                        document.getElementById('vendor-portal-actions').style.display = 'none';\n                        document.getElementById('vendor-actions-loading-label').style.display = 'block';\n                        jQuery('#tbl_custpage_resend_portal_email #custpage_resend_portal_email').click();\n                    }\n                });\"\n            />";
            }
            return true;
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.beforeLoad = beforeLoad;
    // Create a dropdown with the different options
    function createActionsDropdown() {
        var dropdown = "\n    <style>\n        #vendor-actions-loading-label {\n            display: none;\n        }\n        .ball-text {\n            margin-right: 17px;\n            display: inline-block;\n            width: auto;\n            font-size: 14px;\n            font-weight: 600;\n            text-align: center;\n            color: black;\n            opacity: 0.8;\n            animation: pulse 1s infinite alternate ease-in-out;\n            /*text-shadow: 0 0 5px rgba(33, 150, 243, .25), 0 0 5px rgba(33, 150, 243, .25), 0 0 5px rgba(33, 150, 243, .25);*/\n        }\n        @keyframes pulse {\n            0% {\n                opacity: 0.8;\n            }\n            100% {\n                opacity: 0.1;\n            }\n        }\n        @keyframes spin {\n            0% {\n                transform:rotate(0deg);\n            }\n            100% { \n                transform:rotate(360deg); \n            }\n        }\n    </style>\n    <button id='vendor-actions-loading-label' class='ball-text'>Loading...</button>\n    <td style='padding-right: 16px;'>\n        <select id='vendor-portal-actions' style='margin-right:17px; padding-left:4px; cursor:pointer; height:27.5px; border-color:#b2b2b2 !important; border-radius:3px; background:linear-gradient(to bottom, #fafafa 0%,#e5e5e5 100%) !important; color:#333333 !important; font-size:14px !important; font-weight:600;'>\n            <option value='default-option' selected disabled hidden>Vendor Portal Actions</option>\n            <option value='see'>See On Portal</option>\n            <option value='refresh'>Refresh Portal</option>\n            <option value='resend'>Resend Email</option>\n        </select>\n    </td>";
        return dropdown;
    }
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
