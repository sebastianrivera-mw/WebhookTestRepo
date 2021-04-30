/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer David González
 * @contact contact@midware.net
 */
define(["require", "exports", "N/ui/dialog", "N/https", "N/url", "N/ui/message", "../Global/Constants"], function (require, exports, dialog, https, url, message, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function pageInit(pContext) {
    }
    exports.pageInit = pageInit;
    function fieldChanged(pContext) {
        if (pContext.fieldId === constants.CONTACT.FIELDS.VENDOR_PORTAL) {
            var vendorPortalCheckbox_1 = pContext.currentRecord.getValue({ fieldId: constants.CONTACT.FIELDS.VENDOR_PORTAL });
            if (vendorPortalCheckbox_1 == true) {
                dialog.confirm({
                    title: "Add to the Vendor Portal",
                    message: "Add this contact to the Vendor Portal? \n Saving this contact with the Vendor Portal field checked on will send a welcome email to the contact and will give him access to the Vendor Portal."
                }).then(function (result) { return handleChange(pContext, result, vendorPortalCheckbox_1); });
            }
        }
        else {
            return true;
        }
    }
    exports.fieldChanged = fieldChanged;
    function handleChange(pContext, pResult, pValue) {
        if (!pResult) {
            pContext.currentRecord.setValue({ fieldId: constants.CONTACT.FIELDS.VENDOR_PORTAL, value: !pValue });
        }
    }
    function addUser(pUserID) {
        console.log(pUserID);
        var sUrl = url.resolveScript({
            scriptId: '1859',
            deploymentId: '1',
            params: {
                user: pUserID
            }
        });
        var response = https.get({
            url: sUrl
        });
        if (response && response.code == 200 && response.body == 'true') {
            // Show message for the user with duration of 5 seconds
            message.create({
                title: "Action",
                message: "The email was sent",
                type: message.Type.CONFIRMATION
            }).show({ duration: 5000 });
            // Reload page after 5 seconds
            setTimeout(function () { location.reload(true); }, 5000);
        }
        else {
            // Show message for the user with duration of 5 seconds
            message.create({
                title: "Action",
                message: "The email could not be sent",
                type: message.Type.ERROR
            }).show({ duration: 5000 });
            // Reload page after 5 seconds
            setTimeout(function () { location.reload(true); }, 5000);
        }
    }
    exports.addUser = addUser;
});
