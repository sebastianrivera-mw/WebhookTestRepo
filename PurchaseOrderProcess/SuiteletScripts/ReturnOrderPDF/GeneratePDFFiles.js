/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/error", "N/http", "N/render", "N/record", "../../Global/Constants", "../../Global/Functions"], function (require, exports, log, error, http, render, record, constants, functions) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRequest(pContext) {
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
    exports.onRequest = onRequest;
    // Handle the get requests
    function handleGet(pContext) {
        try {
            // Get data from params
            var params = pContext.request.parameters;
            var purchaseOrderID = params.po;
            var inboundShipmentID = params.isn;
            log.debug("Purchase Order ID", purchaseOrderID);
            if (purchaseOrderID) {
                // Get the Purchase Order PDF
                var purchaseOrderPDF = render.transaction({
                    entityId: Number(purchaseOrderID),
                    printMode: render.PrintMode.PDF
                });
                // Return the PDF
                pContext.response.writeFile({ file: purchaseOrderPDF, isInline: true });
                log.debug("All finished!", "All finished!");
            }
            else if (inboundShipmentID) {
                //Get the packing slip PDF
                var inboundShipmentPDF = getPackingSlipPDF(inboundShipmentID);
                // Return the PDF
                pContext.response.writeFile({ file: inboundShipmentPDF, isInline: true });
            }
            else {
                var errorPage = getErrorPage("Invalid Link!", false);
                pContext.response.write(errorPage);
            }
        }
        catch (error) {
            var errorPage = getErrorPage("Invalid Link!", false);
            pContext.response.write(errorPage);
        }
    }
    // Get errorsnu page after submitting the data
    function getErrorPage(pErrorMessage, pSmallText) {
        var errorHtml = "\n        <head>\n            <title>Vendor Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.VENDOR_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.VENDOR_PORTAL.JS) + "\"></script>\n        </head>\n        <div class= \"header\">\n        <div class=\"main-title\">\n            <h3>Vendor Portal</h3>\n        </div>\n            <div>\n                <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n            </div>\n        </div>\n        <body>\n            <div class=\"error-message\">\n                " + (pSmallText ? "<p>" + pErrorMessage + "</p>" : "<h3>" + pErrorMessage + "</h3>") + "\n            </div>\n        </body>";
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
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
    //
    function getPackingSlipPDF(pTransactionId) {
        var transaction = record.load({ type: constants.INBOUND_SHIPMENT.ID, id: pTransactionId, isDynamic: true });
        log.debug("Record data ", JSON.stringify(transaction));
        var transactionRender = render.create();
        transactionRender.setTemplateById({ id: constants.PDF_TEMPLATES.ISN_PACKING_SLIP });
        transactionRender.addRecord({ templateName: "record", record: transaction });
        var transactionString = transactionRender.renderAsString().replace(/&c/g, "&amp;c").replace(/&h/g, "&amp;h");
        var filePDF = render.xmlToPdf({ xmlString: transactionString });
        filePDF.name = transaction.getValue({ fieldId: constants.INBOUND_SHIPMENT.FIELDS.COINTAINER_NUMBER }) + ".pdf";
        return filePDF;
    }
});
