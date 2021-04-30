/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as error from 'N/error';
import * as http from 'N/http';
import * as render from 'N/render';
import * as record from 'N/record';

import * as constants from '../../Global/Constants';
import * as functions from '../../Global/Functions';

export function onRequest(pContext: EntryPoints.Suitelet.onRequestContext) {
    try {
        // Event router pattern design
        var eventMap = {};
        eventMap[http.Method.GET] = handleGet;

        eventMap[pContext.request.method] ? eventMap[pContext.request.method](pContext) : httpRequestError();
    }
    catch (error) {
        handleError(error);
    }
}

// Handle the get requests
function handleGet(pContext: EntryPoints.Suitelet.onRequestContext) {
    try {
        // Get data from params
        let params = pContext.request.parameters;
        let purchaseOrderID = params.po;
        let inboundShipmentID = params.isn;

        log.debug("Purchase Order ID", purchaseOrderID);

        if (purchaseOrderID) {
            // Get the Purchase Order PDF
            let purchaseOrderPDF = render.transaction({
                entityId: Number(purchaseOrderID),
                printMode: render.PrintMode.PDF
            });

            // Return the PDF
            pContext.response.writeFile({ file: purchaseOrderPDF, isInline: true });

            log.debug("All finished!", "All finished!");
        } else if(inboundShipmentID){
            //Get the packing slip PDF
            let inboundShipmentPDF = getPackingSlipPDF(inboundShipmentID);
            // Return the PDF
            pContext.response.writeFile({ file: inboundShipmentPDF, isInline: true });
        } else {
            let errorPage = getErrorPage("Invalid Link!", false);
            pContext.response.write(errorPage);
        }
    }
    catch (error) {
        let errorPage = getErrorPage("Invalid Link!", false);
        pContext.response.write(errorPage);
    }
}

// Get errorsnu page after submitting the data
function getErrorPage(pErrorMessage, pSmallText) {
    let errorHtml = `
        <head>
            <title>Vendor Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.JS)}"></script>
        </head>
        <div class= "header">
        <div class="main-title">
            <h3>Vendor Portal</h3>
        </div>
            <div>
                <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
            </div>
        </div>
        <body>
            <div class="error-message">
                ${pSmallText ? `<p>${pErrorMessage}</p>` : `<h3>${pErrorMessage}</h3>`}
            </div>
        </body>`;

    return errorHtml;
}

// Unsupported request type error
function httpRequestError() {
    throw error.create({
        name: "MW_UNSUPPORTED_REQUEST_TYPE",
        message: "Suitelet only supports GET and POST request",
        notifyOff: true
    });
}

// Handle the errors
function handleError(pError: Error) {
    log.error({ title: "Error", details: pError.message });
    log.error({ title: "Stack", details: JSON.stringify(pError) });
}

//
function getPackingSlipPDF(pTransactionId){
    let transaction = record.load({ type: constants.INBOUND_SHIPMENT.ID, id: pTransactionId, isDynamic: true });

        log.debug("Record data ", JSON.stringify(transaction));

        let transactionRender = render.create();

        transactionRender.setTemplateById({ id: constants.PDF_TEMPLATES.ISN_PACKING_SLIP });
        transactionRender.addRecord({ templateName: "record", record: transaction });

        let transactionString = transactionRender.renderAsString().replace(/&c/g, "&amp;c").replace(/&h/g, "&amp;h");

        let filePDF = render.xmlToPdf({ xmlString: transactionString });
        filePDF.name = transaction.getValue({fieldId: constants.INBOUND_SHIPMENT.FIELDS.COINTAINER_NUMBER}) + ".pdf";

        return filePDF;
}
