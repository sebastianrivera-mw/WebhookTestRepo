/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */

 import { EntryPoints } from 'N/types'

 import * as http from 'N/http'
 import * as log from 'N/log'
 import * as search from 'N/search'
 import * as error from 'N/error'
 import * as file from 'N/file'
 import * as runtime from 'N/runtime'
 import * as record from 'N/record' 
  
 export function onRequest(pContext : EntryPoints.Suitelet.onRequestContext) {
     try {
         log.debug("Init Execution", "Init Execution");
         var eventMap = {}; //event router pattern design
         eventMap[http.Method.GET] = handleGet;
         eventMap[http.Method.POST] = handlePost;
 
         eventMap[pContext.request.method] ?
             eventMap[pContext.request.method](pContext) :
             httpRequestError();
     
     } catch (error) {
         pContext.response.write(`Unexpected error. Detail: ${error.message}`);
         handleError(error);
     }
 }
 
 function handleGet(pContext : EntryPoints.Suitelet.onRequestContext) {
 }
 
 function handlePost(pContext : EntryPoints.Suitelet.onRequestContext) {
     log.debug("params POST", pContext.request.parameters);
     let idPO = pContext.request.parameters.idPO;
     log.debug("ID PO", idPO);
 
     // Submit fields
     let recordPO = record.submitFields({
         id: idPO,
         type: "purchaseorder",
         values: {"approvalstatus": 2}
         
     });
 
     log.debug("After Update", "After update Finish");
 
 }
 
 function httpRequestError() {
     throw error.create({
         name : "MW_UNSUPPORTED_REQUEST_TYPE",
         message : "Suitelet only supports GET and POST",
         notifyOff : true
     });
 }
 
 function handleError(pError : Error) {
     log.error({ title : "Error", details : pError.message });
     log.error({ title : "Stack", details : JSON.stringify(pError) });
 }
