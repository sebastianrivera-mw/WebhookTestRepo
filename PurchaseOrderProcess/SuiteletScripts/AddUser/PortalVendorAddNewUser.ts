/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @developer Walter Bonilla
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as error from 'N/error';
import * as http from 'N/http';
import * as email from 'N/email';
import * as render from 'N/render';
import * as search from "N/search"
import * as encode from "N/encode";
import * as record from "N/record"

import * as constants from '../../Global/Constants';

export function onRequest(pContext : EntryPoints.Suitelet.onRequestContext)
{
    try
    {
        // Event router pattern design
        var eventMap = {};
        eventMap[http.Method.GET] = handleGet;
        eventMap[http.Method.POST] = handlePost;

        eventMap[pContext.request.method] ? eventMap[pContext.request.method](pContext) : httpRequestError();
    }
    catch (error)
    {
        handleError(error);
        let errorMessage = error.message;
        pContext.response.write(errorMessage);
    }
}

// Handle the get requests
function handleGet(pContext : EntryPoints.Suitelet.onRequestContext)
{
    let userID = pContext.request.parameters.user;

    if ( userID )
    {
        addUser(userID);
        pContext.response.write('true');

    } else {
        pContext.response.write('false');
    }
}

// Handle the post requests
function handlePost(pContext : EntryPoints.Suitelet.onRequestContext)
{
}

// Unsupported request type error
function httpRequestError()
{
    throw error.create({
        name : "MW_UNSUPPORTED_REQUEST_TYPE",
        message : "Suitelet only supports GET and POST request",
        notifyOff : true
    });
}

// Handle the errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}

export function addUser(pUserID) 
{
    try 
    {
        log.debug("User added", pUserID);
        
        let email = search.lookupFields({type : search.Type.CONTACT, id : pUserID, columns : [constants.CONTACT.FIELDS.EMAIL]})[constants.CONTACT.FIELDS.EMAIL];
        log.debug("email", email);
            
        let token = generateRandomToken(email);
        let date = new Date();
    
        //Set an expiration date of 7 days
        date.setDate(date.getDate() + 7);

        let link = `${constants.GENERAL.VENDOR_PORTAL_URL}?resetpassword=true&userID=${pUserID}&token=${token}`;
    
        record.submitFields({type : record.Type.CONTACT, id : pUserID, values : {[constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN] : token, [constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION] : date, [constants.CONTACT.FIELDS.VENDOR_PORTAL] : true}});
        
        let emailObject = {
            recipients : [email],
            cc : null,
            templateID : constants.EMAIL_TEMPLATES.VENDOR_WELCOME,
            userID : pUserID,
            attachments : null,
            link : link
        }
    
        sendEmailTemplate(emailObject);
    } 
    catch (error) 
    {
        handleError(error);    
    }
}

function generateRandomToken(pSalt) 
{
    let randomToken = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 10; i++) 
    {
        randomToken += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    if (pSalt) randomToken += pSalt;
    
    randomToken = encode.convert({
        string: randomToken,
        inputEncoding: encode.Encoding.UTF_8,
        outputEncoding: encode.Encoding.BASE_64,
    });
    

    return randomToken;
}

function sendEmailTemplate(pTemplate) 
{
    let {recipients, cc, attachments, templateID, userID, link} = pTemplate;

    let myMergeResult = render.mergeEmail({
        templateId : templateID,
        entity : {type : "contact", id: parseInt(userID)},
        recipient : null,
        supportCaseId : null,
        transactionId : null,
        customRecord : null
    });

    let url_regex = /{url}/gi;

    let body = myMergeResult.body.replace(url_regex, link)

    email.send({ 
        author : constants.GENERAL.PURCHASING_EMAIL_AUTHOR,
        recipients : recipients,
        cc : cc,
        subject : myMergeResult.subject,
        body : body,
        attachments : attachments,
        relatedRecords : {entityId : userID}
    });
}
