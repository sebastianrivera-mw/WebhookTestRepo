/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Gerardo Zeledón
 * @contact contact@midware.net
 */
define(["require", "exports", "N/email", "N/runtime", "N/log"], function (require, exports, email, runtime, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var FIELD_ID = "custbody_mw_customernamefield";
    function afterSubmit(pContext) {
        try {
            var test = "test1";
            log.audit({
                title: "Start Checking",
                details: "Checking changes in Text Field",
            });
            if (pContext.type != pContext.UserEventType.DELETE && pContext.type != pContext.UserEventType.CREATE) {
                //Gets old value
                var oldFieldText = pContext.oldRecord.getValue({
                    fieldId: FIELD_ID,
                });
                log.debug({ title: "Old Field Value", details: oldFieldText });
                //Gets new value
                var newFieldText = pContext.newRecord.getValue({
                    fieldId: FIELD_ID,
                });
                log.debug({ title: "Old Field Value", details: newFieldText });
                if ((oldFieldText || newFieldText) && oldFieldText !== newFieldText) {
                    log.debug({
                        title: "Changed",
                        details: "The value of Field has changed",
                    });
                    var userEmail = runtime.getCurrentUser().email;
                    var msg = "The field Customer Name has changed. Its previous value was: " +
                        oldFieldText +
                        " and its actual value is: " +
                        newFieldText +
                        ".";
                    email.send({
                        author: runtime.getCurrentUser().id,
                        body: msg,
                        recipients: [userEmail],
                        subject: "Text Field has changed",
                    });
                }
            }
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.afterSubmit = afterSubmit;
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
