/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Walter Bonilla
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/error", "N/http", "N/email", "N/render", "N/search", "N/encode", "N/record", "../../Global/Constants"], function (require, exports, log, error, http, email, render, search, encode, record, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRequest(pContext) {
        try {
            // Event router pattern design
            var eventMap = {};
            eventMap[http.Method.GET] = handleGet;
            eventMap[http.Method.POST] = handlePost;
            eventMap[pContext.request.method] ? eventMap[pContext.request.method](pContext) : httpRequestError();
        }
        catch (error) {
            handleError(error);
            var errorMessage = error.message;
            pContext.response.write(errorMessage);
        }
    }
    exports.onRequest = onRequest;
    // Handle the get requests
    function handleGet(pContext) {
        var userID = pContext.request.parameters.user;
        if (userID) {
            addUser(userID);
            pContext.response.write('true');
        }
        else {
            pContext.response.write('false');
        }
    }
    // Handle the post requests
    function handlePost(pContext) {
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
    function addUser(pUserID) {
        var _a;
        try {
            log.debug("User added", pUserID);
            var email_1 = search.lookupFields({ type: search.Type.CONTACT, id: pUserID, columns: [constants.CONTACT.FIELDS.EMAIL] })[constants.CONTACT.FIELDS.EMAIL];
            log.debug("email", email_1);
            var token = generateRandomToken(email_1);
            var date = new Date();
            //Set an expiration date of 7 days
            date.setDate(date.getDate() + 7);
            var link = constants.GENERAL.VENDOR_PORTAL_URL + "?resetpassword=true&userID=" + pUserID + "&token=" + token;
            record.submitFields({ type: record.Type.CONTACT, id: pUserID, values: (_a = {}, _a[constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN] = token, _a[constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION] = date, _a[constants.CONTACT.FIELDS.VENDOR_PORTAL] = true, _a) });
            var emailObject = {
                recipients: [email_1],
                cc: null,
                templateID: constants.EMAIL_TEMPLATES.VENDOR_WELCOME,
                userID: pUserID,
                attachments: null,
                link: link
            };
            sendEmailTemplate(emailObject);
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.addUser = addUser;
    function generateRandomToken(pSalt) {
        var randomToken = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 10; i++) {
            randomToken += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        if (pSalt)
            randomToken += pSalt;
        randomToken = encode.convert({
            string: randomToken,
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64,
        });
        return randomToken;
    }
    function sendEmailTemplate(pTemplate) {
        var recipients = pTemplate.recipients, cc = pTemplate.cc, attachments = pTemplate.attachments, templateID = pTemplate.templateID, userID = pTemplate.userID, link = pTemplate.link;
        var myMergeResult = render.mergeEmail({
            templateId: templateID,
            entity: { type: "contact", id: parseInt(userID) },
            recipient: null,
            supportCaseId: null,
            transactionId: null,
            customRecord: null
        });
        var url_regex = /{url}/gi;
        var body = myMergeResult.body.replace(url_regex, link);
        email.send({
            author: constants.GENERAL.PURCHASING_EMAIL_AUTHOR,
            recipients: recipients,
            cc: cc,
            subject: myMergeResult.subject,
            body: body,
            attachments: attachments,
            relatedRecords: { entityId: userID }
        });
    }
});
