/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Bryan Badilla
 * @contact contact@midware.net
*/

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as search from 'N/search';
import * as record from 'N/record';

import * as constants from '../Global/Constants';  
 
export function afterSubmit(pContext: EntryPoints.UserEvent.afterSubmitContext)
{    
    try
    {
        if (pContext.type === pContext.UserEventType.EDIT || pContext.type === pContext.UserEventType.XEDIT)
        {
            log.debug("Init Script", "Init Script")

            // Current and old record
            let currentRecord = pContext.newRecord;
            let oldRecord = pContext.oldRecord;
            
            // Status
            let currentStatusPO = currentRecord.getValue({fieldId: constants.PURCHASE_ORDER.FIELDS.STATUS});
            let oldStatusPO = oldRecord.getValue({fieldId: constants.PURCHASE_ORDER.FIELDS.STATUS});

            log.debug("Status Current and Old", currentStatusPO + "   " + oldStatusPO);

            // if not change status
            if(currentStatusPO == oldStatusPO) return;

            let idPO = currentRecord.id;
            let fieldValue = "";

            log.debug("PO ID", idPO);

            if (String(currentStatusPO) == String(constants.PURCHASE_ORDER_STATUSES.VENDOR_ACTION))
            {
                fieldValue = constants.VENDOR_OR_TOV_TEXT.VENDOR
            }
            else if (String(currentStatusPO) == String(constants.PURCHASE_ORDER_STATUSES.TOV_ACTION))
            {
                fieldValue = constants.VENDOR_OR_TOV_TEXT.TOV
            }
            // Finish execution
            else
            {
                return;
            }

            // Change Field Approval Request and return array of approval request ids
            let arrayIdApproval = changeTOVorVendorField(idPO, fieldValue);
            // Change field in Approval Request Line
            changeLines(arrayIdApproval, fieldValue);
        }
    }
    catch(error)
    {
        handleError(error);
    }
}

// Change TOV or Vendor field
function changeTOVorVendorField(pIdPO, pFieldValue)
{
    let arrayIDApprovalRequest = [];
    // Search Approval Request
    let approvalRequestPO = search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters:
        [
           [constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER,"anyof",pIdPO]
        ],
        columns:
        [
           search.createColumn({
              name: "id",
              sort: search.Sort.ASC
           })
        ]
    });

    approvalRequestPO.run().each(function(result)
    {
        // .run().each has a limit of 4,000 results
        arrayIDApprovalRequest.push({
            idPOApproval: result.getValue("id")
        });

        // Change Field
        record.submitFields({ 
            type: constants.APPROVAL_REQUEST.ID,
            id: String(result.getValue("id")),
            values: {"custrecord_mw_vendor_or_tov_side": pFieldValue}   
        });

        // Checkboxes to False
        // Approved
        record.submitFields({ 
            type: constants.APPROVAL_REQUEST.ID,
            id: String(result.getValue("id")),
            values: {"custrecord_mw_approved": false}   
        });

        // Pi file
        record.submitFields({ 
            type: constants.APPROVAL_REQUEST.ID,
            id: String(result.getValue("id")),
            values: {"custrecord_mw_pi_file_uploaded": false}   
        });

        // Load plan
        record.submitFields({ 
            type: constants.APPROVAL_REQUEST.ID,
            id: String(result.getValue("id")),
            values: {"custrecord_mw_load_plan_uploaded": false}   
        });

        return true;
    });

    return arrayIDApprovalRequest;
}

// Change Approval Request lines
function changeLines(pArrayIdApproval, pFieldValue)
{
    for(let i = 0; i < pArrayIdApproval.length; i++)
    {
        // Search lines 
        let approvalLines = search.create({
            type: constants.APPROVAL_REQUEST_LINES.ID,
            filters:
            [
            [constants.APPROVAL_REQUEST_LINES.FIELDS.APPROVAL_REQUEST,"anyof",pArrayIdApproval[i].idPOApproval]
            ],
            columns:
            [
            search.createColumn({
                name: "id",
                sort: search.Sort.ASC
            }),
            ]
        });
    
        approvalLines.run().each(function(result){
            // .run().each has a limit of 4,000 results
            // Submit field, change field in line
            record.submitFields({ 
                type: constants.APPROVAL_REQUEST_LINES.ID,
                id: String(result.getValue("id")),
                values: {"custrecord_mw_line_vendor_or_tov_side": pFieldValue}   
            });

            // Checkbox to false - Approved
            record.submitFields({ 
                type: constants.APPROVAL_REQUEST_LINES.ID,
                id: String(result.getValue("id")),
                values: {"custrecord_mw_approved_line": false}   
            });

            return true;
        });
    }
}

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
