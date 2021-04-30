/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as runtime from 'N/runtime';
import * as log from 'N/log';
import * as serverWidget from 'N/ui/serverWidget';
import * as search from 'N/search';

import * as constants from '../Global/Constants';

export function beforeLoad(pContext: EntryPoints.UserEvent.beforeLoadContext)
{    
    try
    {
        log.debug("Running", "Running beforeLoad");

        if (runtime.executionContext === runtime.ContextType.USER_INTERFACE && pContext.type !== pContext.UserEventType.CREATE && pContext.type !== pContext.UserEventType.COPY)
        {
            let purchaseOrderID = pContext.newRecord.id;
            let purchaseOrderForm = search.lookupFields({ type : "purchaseorder", id : pContext.newRecord.id.toString(), columns : "customform" });
            // let isReplacement = (purchaseOrderForm["customform"][0]["value"].toString() == constants.GENERAL.REPLACEMENT_FORM) ? true : false;
            let isReplacement = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT);
            let depositPaid = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.DEPOSIT_PAID);

            let statusList = getPurchaseOrderStatusList(isReplacement);
            statusList = checkUniqueStateStatusActive(statusList, purchaseOrderID, pContext);
            log.debug("Status List", JSON.stringify(statusList));

            let currentStatusID = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
            log.debug("Current Status ID", currentStatusID);

            if (currentStatusID)
            {
                // let position = currentStatus.toString();

                // for(var i = 0; i < statusList.length; i++)
                // {
                    // position = statusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID] == position ?  statusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.POSITION_JSON] : position;
                // }

                pContext.form.addField({ id: "custpage_mw_show_status_banner", label: "null", type: serverWidget.FieldType.INLINEHTML })
                .defaultValue = `
                <img class="inject_html_image" src="" onerror="javascript:
                    jQuery(jQuery('.uir-page-title-secondline')).after(\`${getBannerView(statusList, currentStatusID)}\`);
                    jQuery('#status-unique-${constants.PURCHASE_ORDER_STATUSES.DEPOSIT_PAID}').on('click', function (){
                        var submitF=require('N/record');
                        submitF.submitFields.promise({type:'purchaseorder', id:'${pContext.newRecord.id}', values:{'custbody_mw_po_deposit_paid':${depositPaid ? 'false' : 'true'}}}).then(function(){ location.reload(); }).catch(function(pError){ console.error('Error'); });
                    });"
                />`;
            }
        }

        return true;
    }
    catch(error)
    {
        handleError(error);
    }
}

// Get the list of Purchase Order Statuses
function getPurchaseOrderStatusList(pIsReplacement)
{
    log.debug("IsReplacement", pIsReplacement);

    let statusList = [];

    let poStatusSearch = search.create({
        type : constants.PURCHASE_ORDER_STATUS_LIST.ID,
        filters : [],
        columns : [
            search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID }),
            search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NAME }),
            search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.REPLACEMENT_POSITION }),
            search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.POSITION, sort: search.Sort.ASC }),
            search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.UNIQUE_STATE_STATUS })
        ]
    });

    poStatusSearch.filters.push(search.createFilter({name : pIsReplacement ? constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.IS_REPLACEMENT_STATUS : constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.IS_REGULAR_STATUS, operator : search.Operator.IS, values : "T"}))

    poStatusSearch.run().each(function(result) {
        statusList.push({
            [constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID] : result.getValue(constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID),
            [constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NAME] : result.getValue(constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NAME),
            [constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.POSITION_JSON] : pIsReplacement ? result.getValue(constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.REPLACEMENT_POSITION) : result.getValue(constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.POSITION),
            [constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.UNIQUE_STATE_STATUS] : result.getValue(constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.UNIQUE_STATE_STATUS),
            [constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ACTIVE_UNIQUE_STATE_STATUS] : false
        });
        return true;
    });

    return statusList;
}

// Check if each unique state status is active
function checkUniqueStateStatusActive(pStatusList, pPurchaseOrderID, pContext)
{
    for (let i = 0; i < pStatusList.length; i++)
    {
        let statusID = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID];
        if (Number(statusID) === constants.PURCHASE_ORDER_STATUSES.PARTS_ORDERED)
        {
            if (checkPartsOrdered(pPurchaseOrderID))
            {
                pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ACTIVE_UNIQUE_STATE_STATUS] = true;
            }
        }
        else if (Number(statusID) === constants.PURCHASE_ORDER_STATUSES.DEPOSIT_PAID)
        {
            if (pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.DEPOSIT_PAID))
            {
                pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ACTIVE_UNIQUE_STATE_STATUS] = true;
            }
        }
    }

    return pStatusList;
}

// Check if there are order parts purchase orders
function checkPartsOrdered(pPurchaseOrderID)
{
    let orderPartsSearch = search.create({
        type : search.Type.PURCHASE_ORDER,
        filters : [
            search.createFilter({ name: constants.PURCHASE_ORDER.FIELDS.REPLACEMENTE_PARENT_PO, operator: search.Operator.ANYOF, values: [pPurchaseOrderID] }),
            search.createFilter({ name: constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS, operator: search.Operator.ANYOF, values: [constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED] })
        ],
        columns : [
            search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID })
        ]
    });

    let orderPartsSearchResults = orderPartsSearch.runPaged().count;

    return orderPartsSearchResults > 0;
}

// Get the view of the banner
function getBannerView(pStatusList, pCurrentStatusID)
{
    return `
    <style>
        ${getBannerStyle()}
    </style>
    <div class='banner-container'>
        <div class='steps-wrapper'>	
            <div class='arrow-steps clearfix'>
                ${getStepsBannerSection(pStatusList, pCurrentStatusID)}
            </div>
        </div>
        <div class='unique-state-status-wrapper'>
            <div class='unique-state-statuses'>
                ${getUniqueStateBannerSection(pStatusList)}
            </div>
        </div>
    </div>
    `;
}

// Create the style tag for the new banner
function getBannerStyle()
{
    return `
    .clearfix:after {
        clear: both;
        content: '';
        display: block;
        height: 0;
    }
    
    .banner-container {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin: 10px 0 15px 0;
        font-family: 'Lato', sans-serif;
    }
    
    .arrow-steps .step {
        font-size: 14px;
        text-align: center;
        color: #666;
        margin: 0 3px;
        padding: 10px 10px 10px 30px;
        min-width: 180px;
        float: left;
        position: relative;
        background-color: #eee;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none; 
        transition: background-color 0.2s ease;
    }
    
    .arrow-steps .step:after,
    .arrow-steps .step:before {
        content: ' ';
        position: absolute;
        top: 0;
        right: -17px;
        width: 0;
        height: 0;
        border-top: 19px solid transparent;
        border-bottom: 17px solid transparent;
        border-left: 17px solid #eee;
        z-index: 2;
        transition: border-color 0.2s ease;
    }
    
    .arrow-steps .step:before {
        right: auto;
        left: 0;
        border-left: 17px solid #fff;	
        z-index: 0;
    }

    .arrow-steps .step:first-child {
        border-top-left-radius: 25px;
        border-bottom-left-radius: 25px;
    }
    
    .arrow-steps .step:first-child:before {
        border: none;
    }

    .arrow-steps .step:last-child {
        border-top-right-radius: 25px;
        border-bottom-right-radius: 25px;
    }

    .arrow-steps .step:last-child:after {
        border: none;
    }

    .arrow-steps .step.done {
        color: #fff;
        background-color: #00bb2d;
    }

    .arrow-steps .step.done:after {
        border-left: 17px solid #00bb2d;	
    }

    .arrow-steps .step.current {
        color: #fff;
        background-color: #23468c;
    }
    
    .arrow-steps .step.current:after {
        border-left: 17px solid #23468c;	
    }

    .arrow-steps .step span {
        position: relative;
        font-weight: bold;
    }

    .arrow-steps .step span.done-icon {
        display: none;
    }
    
    .arrow-steps .step span.done-icon:before {
        content: '✔';
        position: absolute;
        color: #fff;
        font-weight: bold;
    }

    .arrow-steps .step.done span.done-icon {
        display: block;
        color: #00bb2d;
    }

    .arrow-steps .step.done span.step-text.hidden-text {
        display: none;
    }

    .unique-state-statuses .status {
        font-size: 14px;
        text-align: center;
        color: #666;
        margin: 0 3px;
        padding: 10px;
        min-width: 180px;
        float: left;
        background-color: #eee;
        border-radius: 25px;
    }

    .unique-state-statuses .status.clickable {
        cursor: pointer;
    }

    .unique-state-statuses .status.clickable:hover {
        background: #e6e6e6;
    }

    .unique-state-statuses .status.active.clickable:hover {
        background: #183162;
    }

    .unique-state-statuses .status.active {
        color: #fff;
        background-color: #23468c;
    }

    .unique-state-statuses .status span {
        font-weight: bold;
    }

    .unique-state-statuses .status.active span:before {
        content: '✔';
        color: #fff;
        font-weight: bold;
        margin-right: 5px;
    }
    `;
}

// Get the banner of the section related to the steps
function getStepsBannerSection(pStatusList, pCurrentStatusID)
{
    let currentStatusFound = false;
    let htmlCode = "";
    for (let i = 0; i < pStatusList.length; i++)
    {
        let statusPosition = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.POSITION_JSON];
        let uniqueStateStatus = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.UNIQUE_STATE_STATUS];
        if (statusPosition && !uniqueStateStatus)
        {
            let statusText = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NAME];
            let statusID = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID];
            (statusID === pCurrentStatusID) ? currentStatusFound = true : {};
            
            if (!currentStatusFound)
            {
                if (Number(statusID) === constants.PURCHASE_ORDER_STATUSES.DRAFT)
                {
                    htmlCode += `<div id='status-arrow-${statusID}' class='step done'> <span class='done-icon'>-</span> <span class='step-text hidden-text'>${statusText}</span> </div>`;
                }
                else
                {
                    htmlCode += `<div id='status-arrow-${statusID}' class='step done'> <span class='step-text'>${statusText}</span> </div>`;
                }
            }
            else if (statusID === pCurrentStatusID)
            {
                htmlCode += `<div id='status-arrow-${statusID}' class='step current'> <span class='step-text'>${statusText}</span> </div>`;
            }
            else
            {
                htmlCode += `<div id='status-arrow-${statusID}' class='step'> <span class='step-text'>${statusText}</span> </div>`;
            }
        }
    }

    return htmlCode;
}

// Get the banner of the section related to the steps
function getUniqueStateBannerSection(pStatusList)
{
    let htmlCode = "";
    for (let i = 0; i < pStatusList.length; i++)
    {
        let uniqueStateStatus = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.UNIQUE_STATE_STATUS];
        if (uniqueStateStatus)
        {
            let statusText = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NAME];
            let statusID = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID];
            let isActive = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ACTIVE_UNIQUE_STATE_STATUS];
            
            if (isActive)
            {
                if (Number(statusID) === constants.PURCHASE_ORDER_STATUSES.DEPOSIT_PAID)
                {
                    htmlCode += `<div id='status-unique-${statusID}' class='status active clickable'> <span class='step-text'>${statusText}</span> </div>`;
                }
                else
                {
                    htmlCode += `<div id='status-unique-${statusID}' class='status active'> <span class='step-text'>${statusText}</span> </div>`;
                }
            }
            else
            {
                if (Number(statusID) === constants.PURCHASE_ORDER_STATUSES.DEPOSIT_PAID)
                {
                    htmlCode += `<div id='status-unique-${statusID}' class='status clickable'> <span class='step-text'>${statusText}</span> </div>`;    
                }
                else
                {
                    htmlCode += `<div id='status-unique-${statusID}' class='status'> <span class='step-text'>${statusText}</span> </div>`;
                }
            }
        }
    }

    return htmlCode;
}

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
