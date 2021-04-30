/**
 * @author Midware
 * @website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as search from 'N/search';
import * as runtime from 'N/runtime';
import * as url from 'N/url';
import * as file from 'N/file';
import * as encode from "N/encode"
import * as log from "N/log"

import * as constants from '../Global/Constants';

// Get the URL of the current suitelet
export function getCurrentSuiteletURL(pReturnExternalUrl)
{
    let link = url.resolveScript({
        scriptId: runtime.getCurrentScript().id,
        deploymentId: runtime.getCurrentScript().deploymentId,
        returnExternalUrl: pReturnExternalUrl
    });

    return link;
}

// Get the URL of a specific suitelet
export function getSuiteletURL(pScriptID, pDeploymentID, pReturnExternalUrl)
{
    let link = url.resolveScript({
        scriptId: pScriptID,
        deploymentId: pDeploymentID,
        returnExternalUrl: pReturnExternalUrl
    });

    return link;
}

// Get the URL of a specific file
export function getFileUrl(pFileId)
{
    return `https://${url.resolveDomain({accountId: runtime.accountId, hostType: url.HostType.APPLICATION })}${file.load({ id: pFileId }).url}`
}

// Get the link of a domain
export function getDomainLink()
{
    return `https://${url.resolveDomain({accountId: runtime.accountId, hostType: url.HostType.APPLICATION })}`;
}

// Get the link
export function getRecordLink(pRecordType, pRecordID)
{
    return url.resolveRecord({ recordType: pRecordType, recordId: pRecordID });
}

// Get the employees subscribed to receive emails
export function getEmailSubscribers(pModules)
{
    let emailSubscribers = [];

    // Search for the Email Subscriptions
    let emailSubscriptionsSearch = search.create({
        type: constants.EMAIL_SUBSCRIPTIONS.ID,
        filters:
        [
            search.createFilter({ name: constants.EMAIL_SUBSCRIPTIONS.FIELDS.MODULE, operator: search.Operator.ANYOF, values: pModules })
        ],
        columns:
        [
            search.createColumn({ name: constants.EMAIL_SUBSCRIPTIONS.FIELDS.EMPLOYEE }),
            search.createColumn({ name: constants.EMAIL_SUBSCRIPTIONS.FIELDS.EMAIL })
        ]
    });

    let emailSubscriptionsResults = emailSubscriptionsSearch.runPaged({ pageSize: 1000 });
    for(let i = 0; i < emailSubscriptionsResults.pageRanges.length; i++)
    {
        let page = emailSubscriptionsResults.fetch({index: emailSubscriptionsResults.pageRanges[i].index});
        for(let j = 0; j < page.data.length; j++)
        {
            let result = page.data[j];
            let element = result.getValue(constants.EMAIL_SUBSCRIPTIONS.FIELDS.EMPLOYEE) || result.getValue(constants.EMAIL_SUBSCRIPTIONS.FIELDS.EMAIL);
            emailSubscribers.push(element);
        }
    }

    return emailSubscribers;
}

// Decodes the access token into a JSON OBject with Portal Access Token and Contact Email fields
export function decodeAccessToken(pToken) 
{
    try 
    {
        let decodedToken = encode.convert({
            string: pToken,
            inputEncoding: encode.Encoding.BASE_64,
            outputEncoding: encode.Encoding.UTF_8
        });

        let tokenArray = decodedToken.split("|");
        return {token : tokenArray[0], email : tokenArray[1]};
        
    } 
    catch (error) 
    {
        log.error('ERROR', `An error occured while decoding the access token : ${error.message}`);
        log.debug('ERROR Stack', JSON.stringify(error));
    }
}

// Parses the cookie and returns a JSON Object
export function getCookieData(name, cookies) 
{
    var data = cookies.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    data = data ? data[2] : null;

    return data;
}

// Validate the Portal Access Token with the Contact Access Token 
export function validateAccessToken(pUserEmail, pAccessToken) 
{
    let token = null;
    search.create({
        type: "contact",
        filters:
        [
           ["email","is", pUserEmail],
           "AND",
           [constants.CONTACT.FIELDS.PORTAL_ACCESS_TOKEN, "is", pAccessToken]
        ],
        columns:
        [
           constants.CONTACT.FIELDS.PORTAL_ACCESS_TOKEN
        ]
     }).run().each(function(contact){
        token = contact.getValue(constants.CONTACT.FIELDS.PORTAL_ACCESS_TOKEN)
        return true;
     });

    if (token) if (token == pAccessToken) return true;
    
    return null;
}

export function validateSession(pCookies)
{
    let cookies = null;
    
    if (pCookies) cookies = getCookieData(constants.GENERAL.ACCESS_TOKEN, pCookies);

    //If the access token cookie is present
    if (cookies) 
    {
        let {email, token} = decodeAccessToken(cookies);

        //If the access token has both email and portal access token, validate the access token and return email and token
        if (email && token) 
        {
            if (validateAccessToken(email, token)) return {valid : true, email, token};
        } 
    }
    
    return {valid : false};
}

// Receives a base url and a params object and returns a string url with query params
export function buildURL(pURL, pParams) 
{
    let keys = Object.keys(pParams);
    let params = "?";
    keys.forEach((key, i) => 
    {
        if (i > 0) params += "&";
        params += `${key}=${pParams[key]}`;
    });

    return pURL += params;
}

export function getEncoded(pValue) 
{
    let value = "";

    value = encode.convert({
        string: pValue,
        inputEncoding: encode.Encoding.UTF_8,
        outputEncoding: encode.Encoding.BASE_64,
    });
    
    return value;
}

export function getDecoded(pValue) 
{
    let value = "";

    value = encode.convert({
        string: pValue,
        inputEncoding: encode.Encoding.BASE_64,
        outputEncoding: encode.Encoding.UTF_8,
    });
    
    return value;
}

export function removeElementFromArray(pArray, pElement)
{
    for (let i = 0; i < pArray.length; i++)
    {
        let actualElement = pArray[i];
        if (actualElement == pElement)
        {
            pArray.splice(i, 1);
            break;
        }
    }

    return pArray;
}
