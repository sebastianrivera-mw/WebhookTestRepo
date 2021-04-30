/**
 * @author Midware
 * @website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/search", "N/runtime", "N/url", "N/file", "N/encode", "N/log", "../Global/Constants"], function (require, exports, search, runtime, url, file, encode, log, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get the URL of the current suitelet
    function getCurrentSuiteletURL(pReturnExternalUrl) {
        var link = url.resolveScript({
            scriptId: runtime.getCurrentScript().id,
            deploymentId: runtime.getCurrentScript().deploymentId,
            returnExternalUrl: pReturnExternalUrl
        });
        return link;
    }
    exports.getCurrentSuiteletURL = getCurrentSuiteletURL;
    // Get the URL of a specific suitelet
    function getSuiteletURL(pScriptID, pDeploymentID, pReturnExternalUrl) {
        var link = url.resolveScript({
            scriptId: pScriptID,
            deploymentId: pDeploymentID,
            returnExternalUrl: pReturnExternalUrl
        });
        return link;
    }
    exports.getSuiteletURL = getSuiteletURL;
    // Get the URL of a specific file
    function getFileUrl(pFileId) {
        return "https://" + url.resolveDomain({ accountId: runtime.accountId, hostType: url.HostType.APPLICATION }) + file.load({ id: pFileId }).url;
    }
    exports.getFileUrl = getFileUrl;
    // Get the link of a domain
    function getDomainLink() {
        return "https://" + url.resolveDomain({ accountId: runtime.accountId, hostType: url.HostType.APPLICATION });
    }
    exports.getDomainLink = getDomainLink;
    // Get the link
    function getRecordLink(pRecordType, pRecordID) {
        return url.resolveRecord({ recordType: pRecordType, recordId: pRecordID });
    }
    exports.getRecordLink = getRecordLink;
    // Get the employees subscribed to receive emails
    function getEmailSubscribers(pModules) {
        var emailSubscribers = [];
        // Search for the Email Subscriptions
        var emailSubscriptionsSearch = search.create({
            type: constants.EMAIL_SUBSCRIPTIONS.ID,
            filters: [
                search.createFilter({ name: constants.EMAIL_SUBSCRIPTIONS.FIELDS.MODULE, operator: search.Operator.ANYOF, values: pModules })
            ],
            columns: [
                search.createColumn({ name: constants.EMAIL_SUBSCRIPTIONS.FIELDS.EMPLOYEE }),
                search.createColumn({ name: constants.EMAIL_SUBSCRIPTIONS.FIELDS.EMAIL })
            ]
        });
        var emailSubscriptionsResults = emailSubscriptionsSearch.runPaged({ pageSize: 1000 });
        for (var i = 0; i < emailSubscriptionsResults.pageRanges.length; i++) {
            var page = emailSubscriptionsResults.fetch({ index: emailSubscriptionsResults.pageRanges[i].index });
            for (var j = 0; j < page.data.length; j++) {
                var result = page.data[j];
                var element = result.getValue(constants.EMAIL_SUBSCRIPTIONS.FIELDS.EMPLOYEE) || result.getValue(constants.EMAIL_SUBSCRIPTIONS.FIELDS.EMAIL);
                emailSubscribers.push(element);
            }
        }
        return emailSubscribers;
    }
    exports.getEmailSubscribers = getEmailSubscribers;
    // Decodes the access token into a JSON OBject with Portal Access Token and Contact Email fields
    function decodeAccessToken(pToken) {
        try {
            var decodedToken = encode.convert({
                string: pToken,
                inputEncoding: encode.Encoding.BASE_64,
                outputEncoding: encode.Encoding.UTF_8
            });
            var tokenArray = decodedToken.split("|");
            return { token: tokenArray[0], email: tokenArray[1] };
        }
        catch (error) {
            log.error('ERROR', "An error occured while decoding the access token : " + error.message);
            log.debug('ERROR Stack', JSON.stringify(error));
        }
    }
    exports.decodeAccessToken = decodeAccessToken;
    // Parses the cookie and returns a JSON Object
    function getCookieData(name, cookies) {
        var data = cookies.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        data = data ? data[2] : null;
        return data;
    }
    exports.getCookieData = getCookieData;
    // Validate the Portal Access Token with the Contact Access Token 
    function validateAccessToken(pUserEmail, pAccessToken) {
        var token = null;
        search.create({
            type: "contact",
            filters: [
                ["email", "is", pUserEmail],
                "AND",
                [constants.CONTACT.FIELDS.PORTAL_ACCESS_TOKEN, "is", pAccessToken]
            ],
            columns: [
                constants.CONTACT.FIELDS.PORTAL_ACCESS_TOKEN
            ]
        }).run().each(function (contact) {
            token = contact.getValue(constants.CONTACT.FIELDS.PORTAL_ACCESS_TOKEN);
            return true;
        });
        if (token)
            if (token == pAccessToken)
                return true;
        return null;
    }
    exports.validateAccessToken = validateAccessToken;
    function validateSession(pCookies) {
        var cookies = null;
        if (pCookies)
            cookies = getCookieData(constants.GENERAL.ACCESS_TOKEN, pCookies);
        //If the access token cookie is present
        if (cookies) {
            var _a = decodeAccessToken(cookies), email = _a.email, token = _a.token;
            //If the access token has both email and portal access token, validate the access token and return email and token
            if (email && token) {
                if (validateAccessToken(email, token))
                    return { valid: true, email: email, token: token };
            }
        }
        return { valid: false };
    }
    exports.validateSession = validateSession;
    // Receives a base url and a params object and returns a string url with query params
    function buildURL(pURL, pParams) {
        var keys = Object.keys(pParams);
        var params = "?";
        keys.forEach(function (key, i) {
            if (i > 0)
                params += "&";
            params += key + "=" + pParams[key];
        });
        return pURL += params;
    }
    exports.buildURL = buildURL;
    function getEncoded(pValue) {
        var value = "";
        value = encode.convert({
            string: pValue,
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64,
        });
        return value;
    }
    exports.getEncoded = getEncoded;
    function getDecoded(pValue) {
        var value = "";
        value = encode.convert({
            string: pValue,
            inputEncoding: encode.Encoding.BASE_64,
            outputEncoding: encode.Encoding.UTF_8,
        });
        return value;
    }
    exports.getDecoded = getDecoded;
    function removeElementFromArray(pArray, pElement) {
        for (var i = 0; i < pArray.length; i++) {
            var actualElement = pArray[i];
            if (actualElement == pElement) {
                pArray.splice(i, 1);
                break;
            }
        }
        return pArray;
    }
    exports.removeElementFromArray = removeElementFromArray;
});
