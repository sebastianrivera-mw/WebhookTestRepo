/**
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */
import * as log from "N/log";
import * as runtime from "N/runtime";

//import the views
import * as view from "../Views/paymentReportBView";
//import the models
import * as model from "../Models/paymentReportBModel";

import * as constants from "../../Constants/Constants";
import * as suiteMVC from "../../Helpers/suiteMVC";

export function getView() {
  return view.mainView(getCurrentStatus());
}

export function updatePaymentes(pData) {
  let result = model.updatePayments(pData);
  let currentScript = runtime.getCurrentScript();

  return new suiteMVC.SuiteletRedirect(currentScript.id, currentScript.deploymentId, constants.GENERAL.STATUS_FLAG, result);
}

function getCurrentStatus() {
  let currentStatus = runtime.getCurrentSession().get({ name: constants.GENERAL.STATUS_FLAG });
  log.debug("Current Status 1", currentStatus);
  runtime.getCurrentSession().set({ name: constants.GENERAL.STATUS_FLAG, value: null });
  log.debug("Current Status 2", currentStatus);

  return currentStatus;
}

