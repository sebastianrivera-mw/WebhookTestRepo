/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/email", "N/render", "N/search", "N/encode", "N/record", "../Global/Constants", "../Global/Functions"], function (require, exports, log, email, render, search, encode, record, constants, functions) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function execute(pContext) {
        try {
            var newUsers = getNewUsers();
            newUsers.forEach(function (userID) {
                var _a;
                var email = search.lookupFields({ type: search.Type.CONTACT, id: userID, columns: [constants.CONTACT.FIELDS.EMAIL] })[constants.CONTACT.FIELDS.EMAIL];
                var token = generateRandomToken(email);
                var date = new Date();
                //Set an expiration date of 7 days
                date.setDate(date.getDate() + 7);
                var link = functions.getSuiteletURL(constants.SCRIPTS.PORTAL_LOGIN.ID, constants.SCRIPTS.PORTAL_LOGIN.DEPLOY, true) + "&resetpassword=true&userID=" + userID + "&token=" + token;
                record.submitFields({ type: record.Type.CONTACT, id: userID, values: (_a = {}, _a[constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN] = token, _a[constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION] = date, _a[constants.CONTACT.FIELDS.VENDOR_PORTAL] = true, _a) });
                var emailObject = {
                    recipients: [email],
                    cc: null,
                    templateID: 806,
                    userID: userID,
                    attachments: null,
                    link: link
                };
                sendEmailTemplate(emailObject);
            });
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.execute = execute;
    function getNewUsers() {
        var newUsers = [];
        search.create({
            type: "contact",
            filters: [
                [constants.CONTACT.FIELDS.VENDOR_PORTAL, "is", "T"]
            ],
            columns: [
                "internalid"
            ]
        }).run().each(function (contact) {
            var internalid = contact.getValue("internalid");
            newUsers.push(internalid);
            return true;
        });
        log.debug("newUsers", newUsers);
        return newUsers;
    }
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
        var login_url_regex = /{login_url}/gi;
        var body = myMergeResult.body.replace(url_regex, link);
        body = body.replace(login_url_regex, functions.getSuiteletURL(constants.SCRIPTS.PORTAL_LOGIN.ID, constants.SCRIPTS.PORTAL_LOGIN.DEPLOY, true));
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
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
