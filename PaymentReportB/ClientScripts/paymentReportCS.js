/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "../Constants/Constants", "N/ui/message"], function (require, exports, log, constants, message) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function pageInit(pContext) {
        try {
            var status_1 = document.getElementById("status").value;
            console.log(status_1);
            if (status_1 === constants.STATUS_CODES.CURRENT_EXECUTION) {
                message
                    .create({
                    title: "Error",
                    message: "A report is currently being processed, please wait",
                    type: message.Type.ERROR,
                })
                    .show({ duration: 10000 });
            }
            else if (status_1 === constants.STATUS_CODES.CREATED) {
                message
                    .create({
                    title: "Done!!",
                    message: "The report has been sent and will be processed. You will receive an email with the result",
                    type: message.Type.CONFIRMATION,
                })
                    .show({ duration: 10000 });
            }
            else if (status_1 === constants.STATUS_CODES.ONE) {
                message
                    .create({
                    title: "Error",
                    message: "You can only use one type of transaction to execute the import",
                    type: message.Type.ERROR,
                })
                    .show({ duration: 10000 });
            }
            else if (status_1 === constants.STATUS_CODES.AT_LEAST_ONE) {
                message
                    .create({
                    title: "Error",
                    message: "You have to select at least one type of transaction to execute the import",
                    type: message.Type.ERROR,
                })
                    .show({ duration: 10000 });
            }
            else if (status_1 === constants.STATUS_CODES.UNKNOWN) {
                message
                    .create({
                    title: "Error",
                    message: "Internal server error.",
                    type: message.Type.ERROR,
                })
                    .show({ duration: 10000 });
            }
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.pageInit = pageInit;
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});

