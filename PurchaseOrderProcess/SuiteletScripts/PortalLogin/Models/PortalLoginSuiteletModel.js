/**
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "N/search", "N/encode", "N/record", "N/email", "N/render", "../../../Global/forge.js", "../../../Global/Constants"], function (require, exports, log, search, encode, record, email, render, forge, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
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
    exports.generateRandomToken = generateRandomToken;
    function generateAccessToken(pToken, pUserEmail) {
        var accessToken = "";
        accessToken += pToken + "|" + pUserEmail;
        accessToken = encode.convert({
            string: accessToken,
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64,
        });
        return accessToken;
    }
    exports.generateAccessToken = generateAccessToken;
    function submitToken(pUserID, pToken) {
        var _a;
        record.submitFields({ type: record.Type.CONTACT, id: pUserID, values: (_a = {}, _a[constants.CONTACT.FIELDS.PORTAL_ACCESS_TOKEN] = pToken, _a) });
    }
    exports.submitToken = submitToken;
    //Generates a reset password token and its expiration date
    function generateResetPasswordToken(pUserID) {
        var _a;
        var token = generateRandomToken(pUserID);
        var expiration = new Date();
        expiration.setDate(expiration.getDate() + 1);
        record.submitFields({ type: record.Type.CONTACT, id: pUserID, values: (_a = {},
                _a[constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION] = expiration,
                _a[constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN] = token,
                _a) });
        return token;
    }
    exports.generateResetPasswordToken = generateResetPasswordToken;
    //Validates if the user is a contact with an email, either an admin or user portal password,
    //has a vendor related
    function validateEmailPassword(pUserEmail, pPassword) {
        var password = "";
        var adminPassword = "";
        var internalid = 0;
        var hashedPassword = encodePassword(pPassword);
        search.create({
            type: "contact",
            filters: [
                ["email", "is", pUserEmail],
                "AND",
                [
                    ["custentity_mw_contact_portal_pass", "isnotempty", ""],
                    "OR",
                    ["custentity_mw_portal_admin_pass", "isnotempty", ""]
                ],
                "AND",
                [
                    ["company.type", "anyof", "Vendor"],
                    "OR",
                    ["custentity_mw_contact_related_employee", "isnotempty", ""]
                ]
            ],
            columns: [
                constants.CONTACT.FIELDS.PORTAL_PASSWORD,
                constants.CONTACT.FIELDS.PORTAL_ADMIN_PASSWORD,
                "internalid"
            ]
        }).run().each(function (contact) {
            if (password === "") {
                password = contact.getValue(constants.CONTACT.FIELDS.PORTAL_PASSWORD);
                adminPassword = contact.getValue(constants.CONTACT.FIELDS.PORTAL_ADMIN_PASSWORD);
                internalid = contact.getValue("internalid");
            }
            return true;
        });
        adminPassword = encodePassword(adminPassword);
        log.debug("contacct", { password: password, adminPassword: adminPassword, hashedPassword: hashedPassword });
        if (internalid === 0)
            return { state: constants.LOGIN_STATE.ACCOUNT_NOT_FOUND };
        if (password || adminPassword)
            if (password == hashedPassword || adminPassword == hashedPassword)
                return { state: constants.LOGIN_STATE.SUCCESSFUL, userID: internalid };
        return { state: constants.LOGIN_STATE.PASSWORD_ERROR };
    }
    exports.validateEmailPassword = validateEmailPassword;
    //Validates if the user is registered in the Vendor Portal
    //If the same email is registered twice or more, it takes the first one 
    function validateContact(pUserEmail) {
        var internalid = 0;
        search.create({
            type: "contact",
            filters: [
                ["email", "is", pUserEmail],
                "AND",
                [constants.CONTACT.FIELDS.VENDOR_PORTAL, "is", "T"],
                "AND",
                [
                    ["company.type", "anyof", "Vendor"],
                    "OR",
                    ["custentity_mw_contact_related_employee", "isnotempty", ""]
                ]
            ],
            columns: [
                "internalid"
            ]
        }).run().each(function (contact) {
            if (internalid == 0)
                internalid = contact.getValue("internalid");
            return true;
        });
        return internalid;
    }
    exports.validateContact = validateContact;
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
    exports.sendEmailTemplate = sendEmailTemplate;
    function validateResetPasswordToken(pUserID, pToken) {
        var contact = record.load({ type: record.Type.CONTACT, id: pUserID, isDynamic: false });
        var token = contact.getValue({ fieldId: constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN });
        var expiration = contact.getValue({ fieldId: constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION });
        var time = new Date().getTime();
        if (token == pToken && expiration.getTime() > time) {
            return true;
        }
        else {
            return false;
        }
    }
    exports.validateResetPasswordToken = validateResetPasswordToken;
    function resetPassword(pUserID, pPassword) {
        var _a;
        var hashedPassword = encodePassword(pPassword);
        record.submitFields({ type: record.Type.CONTACT, id: pUserID, values: (_a = {},
                _a[constants.CONTACT.FIELDS.PORTAL_PASSWORD] = hashedPassword,
                _a[constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN] = null,
                _a[constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION] = null,
                _a) });
    }
    exports.resetPassword = resetPassword;
    function encodePassword(pPassword) {
        var messageDigest = forge.md.sha256.create();
        messageDigest.update(pPassword);
        var hashedPassword = messageDigest.digest().toHex();
        return hashedPassword;
    }
});
