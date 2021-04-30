/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer David González
 * @contact contact@midware.net
 */

import {EntryPoints} from 'N/types'

import * as dialog from "N/ui/dialog";
import * as https from "N/https";
import * as url from "N/url";
import * as log from 'N/log';
import * as message from 'N/ui/message';

import * as constants from '../Global/Constants';

export function pageInit(pContext : EntryPoints.Client.pageInitContext)
{
   
}

export function fieldChanged(pContext : EntryPoints.Client.fieldChangedContext)
{
    if(pContext.fieldId === constants.CONTACT.FIELDS.VENDOR_PORTAL)
    {
        let vendorPortalCheckbox = pContext.currentRecord.getValue({fieldId: constants.CONTACT.FIELDS.VENDOR_PORTAL});

        if (vendorPortalCheckbox == true) 
        {
            dialog.confirm({
                title : "Add to the Vendor Portal", 
                message: "Add this contact to the Vendor Portal? \n Saving this contact with the Vendor Portal field checked on will send a welcome email to the contact and will give him access to the Vendor Portal."
            }).then(result => handleChange(pContext, result, vendorPortalCheckbox));
        }
    }
    else
    {
        return true;
    }
}

function handleChange(pContext : EntryPoints.Client.fieldChangedContext, pResult, pValue) 
{ 
    if (!pResult) {
        pContext.currentRecord.setValue({fieldId:constants.CONTACT.FIELDS.VENDOR_PORTAL, value: !pValue})
    }
}

export function addUser(pUserID) 
{
    console.log(pUserID);

    let sUrl = url.resolveScript({
        scriptId : '1859',
        deploymentId : '1',
        params : {
            user : pUserID
        }
    });

    let response = https.get({
        url : sUrl
    });

    if ( response && response.code == 200 && response.body == 'true' )
    {
        // Show message for the user with duration of 5 seconds
        message.create({
            title: "Action",
            message: "The email was sent",
            type: message.Type.CONFIRMATION
        }).show({ duration: 5000 });

        // Reload page after 5 seconds
        setTimeout(() => { location.reload(true) }, 5000);
    } 
    else 
    {
        // Show message for the user with duration of 5 seconds
        message.create({
            title: "Action",
            message: "The email could not be sent",
            type: message.Type.ERROR
        }).show({ duration: 5000 });

        // Reload page after 5 seconds
        setTimeout(() => { location.reload(true) }, 5000);
    }
}
