/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/runtime", "../Functions/paymentReportFunctions"], function (require, exports, log, runtime, paymentReportFunctions) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function execute(pContext) {
        try {
            var test = runtime.getCurrentScript().getParameter({ name: "custscript_mw_step_sch_bryan" });
            log.debug("Scheduled", "Enter to scheduled script " + test);
            log.debug("Step", test);
            paymentReportFunctions.checkPaymentReport(runtime.getCurrentScript().getParameter({ name: "custscript_mw_step_sch_bryan" }));
        }
        catch (pError) {
            handleError(pError);
        }
    }
    exports.execute = execute;
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});

