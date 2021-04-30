/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer David González
 * @contact contact@midware.net
 */
define(["require", "exports", "N/ui/dialog", "../Global/Constants"], function (require, exports, dialog, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function pageInit(pContext) {
    }
    exports.pageInit = pageInit;
    function fieldChanged(pContext) {
        if (pContext.fieldId === constants.CONTACT.FIELDS.VENDOR_PORTAL) {
            dialog.confirm({
                title: "Add to the Vendor Portal",
                message: "Add this contact to the Vendor Portal? Saving this contact with the Vendor Portal field checked will send a welcome email to the contact and will give him access to the Vendor Portal."
            }).then(success);
        }
        else {
            return true;
        }
    }
    exports.fieldChanged = fieldChanged;
    function success(result) {
        console.log("Success with value " + result);
    }
});
/*
export function addUser(pUserId)
{
    console.log(pUserId);
    portalVendorAddNewUserUE.addUser(pUserId);
}
*/ 
