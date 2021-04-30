/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as email from 'N/email';
import * as render from 'N/render';
import * as search from "N/search"
import * as encode from "N/encode";
import * as record from "N/record"

import * as constants from '../Global/Constants';
import * as functions from '../Global/Functions';

export function execute(pContext: EntryPoints.Scheduled.executeContext)
{    
    try 
    {
        let newUsers = getNewUsers();

        newUsers.forEach(userID => {

            let email = search.lookupFields({type : search.Type.CONTACT, id : userID, columns : [constants.CONTACT.FIELDS.EMAIL]})[constants.CONTACT.FIELDS.EMAIL];
            
            let token = generateRandomToken(email);
            let date = new Date();

            //Set an expiration date of 7 days
            date.setDate(date.getDate() + 7);
            
            let link = `${functions.getSuiteletURL(constants.SCRIPTS.PORTAL_LOGIN.ID, constants.SCRIPTS.PORTAL_LOGIN.DEPLOY, true)}&resetpassword=true&userID=${userID}&token=${token}`;

            record.submitFields({type : record.Type.CONTACT, id : userID, values : {[constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN] : token, [constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION] : date, [constants.CONTACT.FIELDS.VENDOR_PORTAL] : true}});
            
            let emailObject = {
                recipients : [email],
                cc : null,
                templateID : 806,
                userID : userID,
                attachments : null,
                link : link
            }

            sendEmailTemplate(emailObject)
        });
    } 
    catch (error) 
    {
        handleError(error);
    }
}

function getNewUsers() 
{
    let newUsers = [];

    search.create({
        type: "contact",
        filters:
        [
            [constants.CONTACT.FIELDS.VENDOR_PORTAL,"is", "T"]
        ],
        columns:
        [
           "internalid"
        ]
     }).run().each(function(contact)
     {
        let internalid = contact.getValue("internalid");
        newUsers.push(internalid);

        return true;
     });
   
    log.debug("newUsers",newUsers)
    return newUsers;
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
    let login_url_regex = /{login_url}/gi;

    let body = myMergeResult.body.replace(url_regex, link)

    body = body.replace(login_url_regex, functions.getSuiteletURL(constants.SCRIPTS.PORTAL_LOGIN.ID, constants.SCRIPTS.PORTAL_LOGIN.DEPLOY, true));

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

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
