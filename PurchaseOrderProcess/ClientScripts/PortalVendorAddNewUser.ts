/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author Midware
 * @developer David González
 * @contact contact@midware.net
 */

import {EntryPoints} from 'N/types'

import * as dialog from "N/ui/dialog"
import * as record from "N/record"

import * as constants from '../Global/Constants';

export function pageInit(pContext : EntryPoints.Client.pageInitContext)
{
   
}

export function fieldChanged(pContext : EntryPoints.Client.fieldChangedContext)
{
    if(pContext.fieldId === constants.CONTACT.FIELDS.VENDOR_PORTAL)
    {
        dialog.confirm({
            title : "Add to the Vendor Portal", 
            message: "Add this contact to the Vendor Portal? Saving this contact with the Vendor Portal field checked will send a welcome email to the contact and will give him access to the Vendor Portal."
        }).then(success)
    }
    else
    {
        return true;
    }
}

function success(result) { 
    console.log("Success with value " + result); 
}

/*
export function addUser(pUserId)
{
    console.log(pUserId);
    portalVendorAddNewUserUE.addUser(pUserId);
}
*/
