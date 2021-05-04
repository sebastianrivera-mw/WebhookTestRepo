/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Gerardo Zeled??n
 * @contact contact@midware.net
 */

import { EntryPoints } from "N/types";

import * as log from "N/log";
import * as error from "N/error";
import * as http from "N/http";

import * as controller from "../Controllers/reactSuiteletController";

import * as constants from "../Constants/Constants";

export function onRequest(pContext: EntryPoints.Suitelet.onRequestContext) {
  try {
    var eventMap = {}; //event router pattern design
    eventMap[http.Method.GET] = handleGet;
    eventMap[http.Method.POST] = handlePost;

    eventMap[pContext.request.method] ? eventMap[pContext.request.method](pContext) : httpRequestError();
  } catch (error) {
    pContext.response.write(`Unexpected error. Detail: ${error.message}`);
    handleError(error);
  }
}

function handleGet(pContext: EntryPoints.Suitelet.onRequestContext) {
  let params = pContext.request.parameters;

  let action = params["action"];

  if (action == "getAppJS") {
    pContext.response.writeFile({ file: controller.getMainScript() });
  } else {
    pContext.response.write({ output: controller.getMainPage() });
  }
}

function handlePost(pContext: EntryPoints.Suitelet.onRequestContext) {}

function httpRequestError() {
  throw error.create({
    name: "MW_UNSUPPORTED_REQUEST_TYPE",
    message: "Suitelet only supports GET and POST",
    notifyOff: true,
  });
}

function handleError(pError: Error) {
  log.error({ title: "Error", details: pError.message });

  log.error({ title: "Stack", details: JSON.stringify(pError) });
}

