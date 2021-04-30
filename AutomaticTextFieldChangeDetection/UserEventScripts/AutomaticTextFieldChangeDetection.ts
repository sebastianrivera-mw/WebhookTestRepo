/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Gerardo Zeledón
 * @contact contact@midware.net
 */

import { EntryPoints } from "N/types";

import * as email from "N/email";
import * as runtime from "N/runtime";

import * as log from "N/log";

const FIELD_ID = "custbody_mw_customernamefield";
export function afterSubmit(pContext: EntryPoints.UserEvent.afterSubmitContext) {
  try {
    let test = "test1";
    log.audit({
      title: "Start Checking",
      details: "Checking changes in Text Field",
    });
    if (pContext.type != pContext.UserEventType.DELETE && pContext.type != pContext.UserEventType.CREATE) {
      //Gets old value
      let oldFieldText = pContext.oldRecord.getValue({
        fieldId: FIELD_ID,
      });
      log.debug({ title: "Old Field Value", details: oldFieldText });
      //Gets new value
      let newFieldText = pContext.newRecord.getValue({
        fieldId: FIELD_ID,
      });
      log.debug({ title: "Old Field Value", details: newFieldText });

      if ((oldFieldText || newFieldText) && oldFieldText !== newFieldText) {
        log.debug({
          title: "Changed",
          details: "The value of Field has changed",
        });
        let userEmail = runtime.getCurrentUser().email;
        let msg =
          "The field Customer Name has changed. Its previous value was: " +
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
  } catch (error) {
    handleError(error);
  }
}

function handleError(pError: Error) {
  log.error({ title: "Error", details: pError.message });

  log.error({ title: "Stack", details: JSON.stringify(pError) });
}
