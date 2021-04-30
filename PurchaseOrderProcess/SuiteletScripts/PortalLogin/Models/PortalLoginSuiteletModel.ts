/**
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */

import * as log from 'N/log'
import * as search from 'N/search'
import * as encode from "N/encode"
import * as record from "N/record"
import * as email from "N/email"
import * as render from "N/render"

import * as forge from '../../../Global/forge.js'
import * as constants from '../../../Global/Constants'

export function generateRandomToken(pSalt) 
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

export function generateAccessToken(pToken, pUserEmail) 
{
    let accessToken = "";
    
    accessToken += `${pToken}|${pUserEmail}`;
    accessToken = encode.convert({
        string: accessToken,
        inputEncoding: encode.Encoding.UTF_8,
        outputEncoding: encode.Encoding.BASE_64,
    });
    
    return accessToken;
}

export function submitToken(pUserID, pToken) 
{
    record.submitFields({type : record.Type.CONTACT, id : pUserID, values : {[constants.CONTACT.FIELDS.PORTAL_ACCESS_TOKEN] : pToken}});
}

//Generates a reset password token and its expiration date
export function generateResetPasswordToken(pUserID) 
{
    let token = generateRandomToken(pUserID);
    let expiration = new Date();
    expiration.setDate(expiration.getDate() + 1);

    record.submitFields({type : record.Type.CONTACT, id : pUserID, values : {
        [constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION] : expiration,
        [constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN] : token
    }});

    return token;
}

//Validates if the user is a contact with an email, either an admin or user portal password,
//has a vendor related
export function validateEmailPassword(pUserEmail, pPassword) 
{
    let password = "";
    let adminPassword = "";
    let internalid = 0;

    let hashedPassword = encodePassword(pPassword);

    search.create({
        type: "contact",
        filters:
        [
            ["email","is", pUserEmail],
            "AND",
            [
                ["custentity_mw_contact_portal_pass","isnotempty",""],
                "OR",
                ["custentity_mw_portal_admin_pass","isnotempty", ""]
            ],
            "AND",
            [
                ["company.type","anyof","Vendor"],
                "OR",
                ["custentity_mw_contact_related_employee","isnotempty", ""]
            ]
        ],
        columns:
        [
            constants.CONTACT.FIELDS.PORTAL_PASSWORD,
            constants.CONTACT.FIELDS.PORTAL_ADMIN_PASSWORD,
           "internalid"
        ]
     }).run().each(function(contact)
     {
        if (password === "") 
        {
            password = contact.getValue(constants.CONTACT.FIELDS.PORTAL_PASSWORD);
            adminPassword = contact.getValue(constants.CONTACT.FIELDS.PORTAL_ADMIN_PASSWORD);
            internalid = contact.getValue("internalid");
        }
        return true;
     });

    adminPassword = encodePassword(adminPassword);

    log.debug("contacct", {password, adminPassword, hashedPassword})

    if (internalid === 0) return {state : constants.LOGIN_STATE.ACCOUNT_NOT_FOUND};
    
    if (password || adminPassword) if (password == hashedPassword || adminPassword == hashedPassword ) return {state : constants.LOGIN_STATE.SUCCESSFUL, userID : internalid};
    
    return {state : constants.LOGIN_STATE.PASSWORD_ERROR};
}

//Validates if the user is registered in the Vendor Portal
//If the same email is registered twice or more, it takes the first one 
export function validateContact(pUserEmail) 
{
    let internalid = 0;

    search.create({
        type: "contact",
        filters:
        [
            ["email","is", pUserEmail],
            "AND",
            [constants.CONTACT.FIELDS.VENDOR_PORTAL,"is","T"],
            "AND",
            [
                ["company.type","anyof","Vendor"],
                "OR",
                ["custentity_mw_contact_related_employee","isnotempty", ""]
            ]
        ],
        columns:
        [
           "internalid"
        ]
     }).run().each(function(contact)
     {
        if (internalid == 0) internalid = contact.getValue("internalid");

        return true;
     });

    return internalid;
}

export function sendEmailTemplate(pTemplate) 
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

export function validateResetPasswordToken(pUserID, pToken) 
{
    let contact = record.load({type : record.Type.CONTACT, id : pUserID, isDynamic : false});    
    let token = contact.getValue({fieldId : constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN});
    let expiration = contact.getValue({fieldId : constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION});
    let time = new Date().getTime()
    
    if (token == pToken && expiration.getTime() > time) {
        return true;
    } else {
        return false;
    }
}

export function resetPassword(pUserID, pPassword) 
{
    let hashedPassword = encodePassword(pPassword);
    
    record.submitFields({type : record.Type.CONTACT, id : pUserID, values : { 
        [constants.CONTACT.FIELDS.PORTAL_PASSWORD] : hashedPassword, 
        [constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN] : null, 
        [constants.CONTACT.FIELDS.PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION] : null
    }});
}

function encodePassword(pPassword) 
{
    let messageDigest = forge.md.sha256.create();
    messageDigest.update(pPassword);
    let hashedPassword = messageDigest.digest().toHex();

    return hashedPassword;
}
