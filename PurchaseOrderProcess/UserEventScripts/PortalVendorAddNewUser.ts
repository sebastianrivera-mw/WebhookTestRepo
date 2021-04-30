/**
* @NApiVersion 2.0
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* @author Midware
* @developer Bailin Huang
* @contact contact@midware.net
*/

import { EntryPoints } from "N/types"

import * as log from 'N/log'
import * as email from 'N/email';
import * as render from 'N/render';
import * as search from "N/search"
import * as encode from "N/encode";
import * as record from "N/record"

import * as constants from '../Global/Constants';
import * as functions from '../Global/Functions';


export function beforeLoad(pContext : EntryPoints.UserEvent.beforeLoadContext)
{
    let vendorPortalA = pContext.newRecord.getValue({fieldId : constants.CONTACT.FIELDS.VENDOR_PORTAL});

    if ( vendorPortalA )
    {
        pContext.form.clientScriptModulePath = '../ClientScripts/PortalVendorAddNewUserClientScript';

        let userID = pContext.newRecord.getValue({fieldId : "id"}).toString();

        pContext.form.addButton({ id : 'custpage_mw_add_user', label : 'Re-Send Portal Welcome Email', functionName : `addUser( "${userID}")` });
    }
}

export function afterSubmit(pContext : EntryPoints.UserEvent.afterSubmitContext) 
{
    try 
    {
        log.debug("Running", "Running");
        
        if (pContext.type === pContext.UserEventType.EDIT)
        {
            log.debug("EDIT", "EDIT");

            let newVendorPortal = pContext.newRecord.getValue({fieldId : constants.CONTACT.FIELDS.VENDOR_PORTAL});
            let oldVendorPortal = pContext.oldRecord.getValue({fieldId : constants.CONTACT.FIELDS.VENDOR_PORTAL});
            if (newVendorPortal)
            {
                if (newVendorPortal != oldVendorPortal) 
                {
                    let userID = pContext.newRecord.getValue({fieldId : "id"});
                    addUser(userID);
                }
            }
        }
        else if (pContext.type === pContext.UserEventType.CREATE)
        {
            log.debug("CREATE", "CREATE");

            let newVendorPortal = pContext.newRecord.getValue({fieldId : constants.CONTACT.FIELDS.VENDOR_PORTAL});
            if (newVendorPortal)
            {
                let userID = pContext.newRecord.getValue({fieldId : "id"});
                addUser(userID);
            }
        }
    } 
    catch (error) 
    {
        handleError(error);
    }
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

        return true;
    } 
    catch (error) 
    {
        handleError(error);   
        
        return false;
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

function handleError(pError : Error) 
{
    log.error({ title : "Error", details : pError.message });

    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
