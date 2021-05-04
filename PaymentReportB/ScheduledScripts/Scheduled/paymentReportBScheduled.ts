/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */

import { EntryPoints } from "N/types";

import * as log from "N/log";
import * as runtime from "N/runtime";
import * as paymentReportFunctions from "../Functions/paymentReportFunctions";
import * as constants from "../../Constants/Constants";

export function execute(pContext: EntryPoints.Scheduled.executeContext) {
  try {
    let test = runtime.getCurrentScript().getParameter({ name: "custscript_mw_step_sch_bryan" });
    log.debug("Scheduled", `Enter to scheduled script ${test}`);
    log.debug("Step", test);
    paymentReportFunctions.checkPaymentReport(runtime.getCurrentScript().getParameter({ name: "custscript_mw_step_sch_bryan" }));
  } catch (pError) {
    handleError(pError);
  }
}

function handleError(pError: Error) {
  log.error({ title: "Error", details: pError.message });

  log.error({ title: "Stack", details: JSON.stringify(pError) });
}

