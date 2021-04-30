/**
* @NApiVersion 2.0
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* @author Midware
* @Website www.midware.net
* @developer Roy Cordero
* @contact contact@midware.net
*/

import { EntryPoints } from 'N/types';

import * as runtime from 'N/runtime';
import * as log from 'N/log';
import * as serverWidget from "N/ui/serverWidget";

import * as constants from '../Global/Constants';

export function beforeLoad(pContext: EntryPoints.UserEvent.beforeLoadContext)
{
    try
    {
        if (runtime.executionContext === runtime.ContextType.USER_INTERFACE && pContext.type !== pContext.UserEventType.CREATE && pContext.type !== pContext.UserEventType.COPY)
        {
            let purchaseOrderID = pContext.newRecord.id;
            let approvalRequestID = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.APPROVAL_REQUEST);

            pContext.form.clientScriptModulePath = "../ClientScripts/PurchaseOrderPortalActionsCS.js";

            // Create the buttons of every action
            pContext.form.addButton({ id : "custpage_see_on_portal", label: "See On Portal", functionName: `seeOnPortal("${purchaseOrderID}", "${approvalRequestID}");` }).isHidden = true;
            pContext.form.addButton({ id : "custpage_refresh_portal", label: "Refresh Portal", functionName: `refreshPortal("${purchaseOrderID}", "${approvalRequestID}");` }).isHidden = true;
            pContext.form.addButton({ id : "custpage_resend_portal_email", label: "Resend Portal Email", functionName: `resendPortalEmail("${purchaseOrderID}");` }).isHidden = true;

            // Create dropdown with the possible actions
            let actionsDropdown = createActionsDropdown();

            // Add the dropdown
            pContext.form.addField({
                id: "custpage_mw_vendor_portal_actions",
                label: "null",
                type: serverWidget.FieldType.INLINEHTML,
            }).defaultValue = `
            <img class="inject_html_image" src="" onerror="javascript: 
                jQuery(jQuery('#tbl_custpage_see_on_portal').parent()).after(\`${actionsDropdown}\`);
                jQuery('#vendor-portal-actions').change(function() {
                    var action = this.value;
                    if (action == 'see') {
                        jQuery('#tbl_custpage_see_on_portal #custpage_see_on_portal').click();
                        jQuery('#vendor-portal-actions').val('default-option');
                    }
                    else if (action == 'refresh') {
                        document.getElementById('vendor-portal-actions').style.display = 'none';
                        document.getElementById('vendor-actions-loading-label').style.display = 'block';
                        jQuery('#tbl_custpage_refresh_portal #custpage_refresh_portal').click();
                    }
                    else if (action == 'resend') {
                        document.getElementById('vendor-portal-actions').style.display = 'none';
                        document.getElementById('vendor-actions-loading-label').style.display = 'block';
                        jQuery('#tbl_custpage_resend_portal_email #custpage_resend_portal_email').click();
                    }
                });"
            />`;
        }

        return true;
    }
    catch(error)
    {
        handleError(error);
    }
}

// Create a dropdown with the different options
function createActionsDropdown()
{
    let dropdown = `
    <style>
        #vendor-actions-loading-label {
            display: none;
        }
        .ball-text {
            margin-right: 17px;
            display: inline-block;
            width: auto;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            color: black;
            opacity: 0.8;
            animation: pulse 1s infinite alternate ease-in-out;
            /*text-shadow: 0 0 5px rgba(33, 150, 243, .25), 0 0 5px rgba(33, 150, 243, .25), 0 0 5px rgba(33, 150, 243, .25);*/
        }
        @keyframes pulse {
            0% {
                opacity: 0.8;
            }
            100% {
                opacity: 0.1;
            }
        }
        @keyframes spin {
            0% {
                transform:rotate(0deg);
            }
            100% { 
                transform:rotate(360deg); 
            }
        }
    </style>
    <button id='vendor-actions-loading-label' class='ball-text'>Loading...</button>
    <td style='padding-right: 16px;'>
        <select id='vendor-portal-actions' style='margin-right:17px; padding-left:4px; cursor:pointer; height:27.5px; border-color:#b2b2b2 !important; border-radius:3px; background:linear-gradient(to bottom, #fafafa 0%,#e5e5e5 100%) !important; color:#333333 !important; font-size:14px !important; font-weight:600;'>
            <option value='default-option' selected disabled hidden>Vendor Portal Actions</option>
            <option value='see'>See On Portal</option>
            <option value='refresh'>Refresh Portal</option>
            <option value='resend'>Resend Email</option>
        </select>
    </td>`;

    return dropdown;
}

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
