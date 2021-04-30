/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as log from 'N/log';
import * as search from 'N/search';

import * as etaModel from '../Models/ETAPageModel';
import * as vendorPortalView from './VendorPortalView';
import * as constants from '../../../Global/Constants';
import * as functions from '../../../Global/Functions';


// Get the view of the ETA Section of the Vendor
export function getEditInboudShipmentView(pPurchaseOrdersSearch, pIsnData, pisnFields)
{

    // Variables with all necesary data
    let optionsPO = generateOptionsPO(pPurchaseOrdersSearch, pIsnData); 
    let dataInfo = getFieldData(pPurchaseOrdersSearch, pIsnData);
    let optionsPOModal = generateOptionsPOModalTable(pPurchaseOrdersSearch, pIsnData);
    let isnOptionsTable = putIsnOptions(pIsnData);
    let isnOptionsTableNotEdit = putIsnOptionsNotEdit(pIsnData);
    let dataField = infoForCreateIS(pisnFields);

    // Rows of Principal Table
    let rows = `
    ${isnOptionsTable}
    <tr class="item-line createlp-item-line">
        <td class="purchase-order-number"> 
            <select id='pos${pIsnData.length}' style="height:19px; width:110px; text-align:center;" name="po-options" onchange="isFirst(id, \`${dataInfo}\`, \`${pIsnData.length+1}\`)">
            <option id="po" ></option>
                ${optionsPO}
            </select> 
        </td>
        <td class="item-sku"> 
            <select id='item-selector${pIsnData.length }' style="height:19px; width:110px; text-align:center;" name="item-options" onchange="setFields(id)">
                <option id="item" ></option>
            </select> 
        </td>
        <td class="item-name" id="item-name${pIsnData.length }"> <span></span> </td>
        <td class="receiving-location" id="receiving-location${pIsnData.length }"> <span></span> </td>
        <td class="quantity-expected"> <input type="number" id="quantity-expected${pIsnData.length }" disabled="true" max="" min="" style="width: 4em" onchange="calculated(id, max)"/> </td>
        <td class="quantity-remaining"> <input type="number" id="quantity-remaining${pIsnData.length }" style="width: 4em" disabled="true" /> </td>
        <td class="expected-rate" > <input type="number" id="expected-rate${pIsnData.length }" disabled="true" style="width: 7em" onchange="calculatedAmount(id)"/> </td>
        <td class="amount" > <input type="number" id="amount${pIsnData.length }" style="width: 7em" disabled="true"/> </td>
        <td class="location" id="location-number${pIsnData.length }" style="display: none;"> <span></span> </td>
        <td><button type="button" class="btn" id="delete-btn" onclick="remove(this)"><i class="fa fa-trash"></i></button></td>
        </tr>
    `;

    // View of Principal Table
    let view = `
    <div class="create-isn-view">  
        <div>
            ${dataField}
        </div>
        <div class="table-responsive createlp-table">
            <table class="table text-nowrap" style="width: 100%; margin-left: auto; margin-right: auto;">
                <thead>
                    <tr>
                        <th><span>PO #</span></th>
                        <th><span>Item</span></th>
                        <th><span>Description</span></th>
                        <th><span>Receiving Location</span></th>
                        <th><span>Quantity Expected</span></th>
                        <th><span>Quantity Remaining</span></th>
                        <th><span>Expected Rate</span></th>
                        <th><span>Amount</span></th>
                        <th><span></span></th>
                    </tr>
                </thead>
                <tbody id="item-lines" class="item-lines">
                    ${rows}
                </tbody>
            </table>
            <button type="button" class="btn btn-light btn-adds" id="btn-add-line" style="margin-left:20px; margin-top:-10px;" onclick="addLine(\`${optionsPO}\`, \`${pIsnData.length+1}\`)">Add Row</button>
            
            <!-- The Modal -->
            <div id="modal-table" class="modal">

                <!-- Modal content -->
                <div class="modal-content">
                    <span class="close" onclick="closeModal();" >&times;</span>
                    </br>
                    <div class="multiselect">
                        <div class="selectBox" onclick="showCheckboxes()">
                            <label>Purchase Order (PO)      </label>
                            <select>
                                <option>Select an option</option>
                            </select>
                            <div class="overSelect"></div>
                        </div>
                        <div id="checkboxes">
                            ${optionsPOModal}
                            <button type="button" class="btn btn-light btn-selector-modal btn-adds" onclick="getValueOptions();">Select</button>
                        </div>
                    </div>
                    <div class="table-responsive shipments-table eta-table">
                        <table class="table text-nowrap" id="modal-table-body" style="width:50%;">
                            <thead >
                                <tr>
                                    <th><input type="checkbox" id="global-checkbox" name="global-check" onchange="selectGlobalCheck()"></th>
                                    <th><span>PO #</span></th>
                                    <th><span>Item</span></th>
                                    <th><span>Description</span></th>
                                    <th><span>Receiving Location</span></th>
                                    <th><span>Quantity Expected</span></th>
                                    <th><span>Quantity Remaining</span></th>
                                    <th><span>Expected Rate</span></th>
                                    <th><span>Amount</span></th>
                                </tr>
                            </thead>
                            <tbody id="item-lines" class="modal-item-lines">
                            </tbody>
                        </table>
                        <button type="button" class="btn btn-light btn-adds" id="btn-item-modal" onclick="moveModalTable(\`${optionsPO}\`);">OK</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `

    // View of not editable table
    let viewNotEdit = `<div class=\'create-isn-view\'>
        <div class=\'table-responsive createlp-table\'>
            <table class=\'table text-nowrap\' style=\'width: 100%\'>
                <thead>
                    <tr>
                        <th><span>PO #</span></th>
                        <th><span>Item</span></th>
                        <th><span>Description</span></th>
                        <th><span>Receiving Location</span></th>
                        <th><span>Quantity Expected</span></th>
                        <th><span>Quantity Remaining</span></th>
                        <th><span>Expected Rate</span></th>
                        <th><span>Amount</span></th>
                    </tr>
                </thead>
                <tbody id=\'item-lines\' class=\'item-lines\'>
                ${isnOptionsTableNotEdit}
                </tbody>
            </table>
        </div>
    </div>`

    // Result JSON object with Views and Data
    let result = 
    {
        editable: view, 
        notEditable: viewNotEdit,
        data:
        {
            options: optionsPO,
            dataInfo: dataInfo,
            initCont: pIsnData.length + 1
        }
    };
    return result;
}

// Manipulate Fields Data from NS (Dates and biil of lading)
function infoForCreateIS(pisnFields)
{
    // Convert date to correct format
    let readyDate = pisnFields[0].readyDate.split("/");
    let departureDate = pisnFields[0].departureDate.split("/");

    if(readyDate[0].length == 1) readyDate[0]="0"+readyDate[0];
    if(readyDate[1].length == 1) readyDate[1]="0"+readyDate[1];

    if(departureDate != "")
    {
        if(departureDate[0].length == 1) departureDate[0]="0"+departureDate[0];
        if(departureDate[1].length == 1) departureDate[1]="0"+departureDate[1];
        departureDate = `${departureDate[2]}-${departureDate[0]}-${departureDate[1]}`
    }
    
    readyDate = `${readyDate[2]}-${readyDate[0]}-${readyDate[1]}`
    
    // Return fields section
    return `
    <div id="orders-search-wrapper" class="orders-search-wrapper">
        <label for="bill-of-lading" class="orders-search-label">Bill of Lading</label>
        <input id="bill-of-lading" name="bill-of-lading" value"${pisnFields[0].billoflading}"/>
        <label for="ready-date" class="orders-search-label">Expected Ready Date</label>
        <input type="date" id="ready-date" name="ready-date" value='${readyDate}'/>
        <label for="departure-date" class="orders-search-label">Expected Departure Date</label>
        <input type="date" id="departure-date" name="departure-date" value="${departureDate}"/>
    </div>
    `;
}

// Generate options of selec
function generateOptionsPO(pPurchaseOrdersSearch, pIsnData)
{
    let options = "";

    for(let i = 0; i<pIsnData.length; i++)
    {
        if (isExistInPO(pIsnData[i].poText, pPurchaseOrdersSearch))
        {
            if (pIsnData[i].flag == "po")
            {
                options+=`<option id='${pIsnData[i].poText}' value='${pIsnData[i].po}' >${pIsnData[i].poText}</option>`
            }
        }    
    }

    for(let i = 0; i<pPurchaseOrdersSearch.length; i++)
    {
        if (pPurchaseOrdersSearch[i].flag == "po")
        {
            options+=`<option id='${pPurchaseOrdersSearch[i].po}' value='${pPurchaseOrdersSearch[i].id}' >${pPurchaseOrdersSearch[i].po}</option>`
        }
    }
    return options;
}

// Generate Data fields for tables
function getFieldData(pPurchaseOrdersSearch, pIsnData)
{
    let data = [];
    let cont = 0;
    log.debug("DataField",pPurchaseOrdersSearch);
    for(let i = 0; i<pIsnData.length; i++)
    {
        if (pIsnData[i].flag != "po")
        {
            let quantity = Number(pIsnData[i].quantityShipment) - Number(pIsnData[i].quantity);
            data[cont] = `${pIsnData[i].poText},${pIsnData[i].itemText},${pIsnData[i].itemValue},${Number(pIsnData[i].quantity)},${quantity},${pIsnData[i].description},${pIsnData[i].locationText},${pIsnData[i].locationValue},${pIsnData[i].rate}`;
            cont++;
        } 
    }
    for(let i = 0; i<pPurchaseOrdersSearch.length; i++)
    {
        if (pPurchaseOrdersSearch[i].flag != "po")
        {
            
            if(repitItem(pIsnData, pPurchaseOrdersSearch[i]))
            {
                let quantity = Number(pPurchaseOrdersSearch[i].quantity) - Number(pPurchaseOrdersSearch[i].quantityShipment);
                data[cont] = `${pPurchaseOrdersSearch[i].po},${pPurchaseOrdersSearch[i].itemText},${pPurchaseOrdersSearch[i].itemValue},${quantity},${0},${pPurchaseOrdersSearch[i].description},${pPurchaseOrdersSearch[i].locationText},${pPurchaseOrdersSearch[i].locationValue},${pPurchaseOrdersSearch[i].rate}`;
                cont++;
            }
        }           
    }
    return data;

}

// Generate Options Modal table
function generateOptionsPOModalTable(pPurchaseOrdersSearch, pIsnData)
{
    let options = "";
    for(let i = 0; i<pIsnData.length; i++)
    {
        if (isExistInPO(pIsnData[i].poText, pPurchaseOrdersSearch))
        {
            if (pIsnData[i].flag == "po")
            {
                options+=` <label for="one"><input type="checkbox" id='check-${pIsnData[i].poText}' name="po" value="${pIsnData[i].poText}"/>${pIsnData[i].poText}</label>`
            }
        }
    }
    for(let i = 0; i<pPurchaseOrdersSearch.length; i++)
    {
        if (pPurchaseOrdersSearch[i].flag == "po")
        {
            options+=` <label for="one"><input type="checkbox" id='check-${pPurchaseOrdersSearch[i].po}' name="po" value="${pPurchaseOrdersSearch[i].po}"/>${pPurchaseOrdersSearch[i].po}</label>`
        }
    }
    return options;
}

// Put in html the rows obneined from NS
function putIsnOptions(pIsnData)
{
    let optionsIsn = "";

    for(let i = 0; i < pIsnData.length; i++)
    {
        if(pIsnData[i].flag != "po")
        {
            let quantity = Number(pIsnData[i].quantityShipment) - Number(pIsnData[i].quantity);
            optionsIsn += `<tr class="item-line createlp-item-line">
            <td class="purchase-order-number"> 
                <select id='pos${i}' style="height:19px; width:110px; text-align:center;" onchange="getValuePOid(id)">
                    <option id="po" ></option>
                    <option id='${pIsnData[i].poText}' value='${pIsnData[i].po}' selected>${pIsnData[i].poText} </option>
                </select>  
            </td>
            <td class="item-sku"> <span></span> 
                <select id='item-selector${i}' style="height:19px; width:110px; text-align:center;" onchange="setFields(id)">
                    <option id="item" ></option>
                    <option value="${pIsnData[i].itemValue}" selected>${pIsnData[i].itemText} </option>
                </select> 
            </td>
            <td class="item-name" id="item-name${i}"> <span>${pIsnData[i].description}</span> </td>
            <td class="receiving-location" id="receiving-location${i}"> <span>${pIsnData[i].locationText}</span> </td>
            <td class="quantity-expected"> <input type="number" id="quantity-expected${i}" max="${Number(pIsnData[i].quantityShipment)}" min="1" style="width: 4em" onchange="calculated(id, max)" value="${Number(pIsnData[i].quantity)}"/> </td>
            <td class="quantity-remaining"> <input type="number" id="quantity-remaining${i}" disabled="false" value="${quantity}" style="width: 4em" name="${Number(pIsnData[i].quantityShipment)}"/> </td>
            <td class="expected-rate" > <input type="number" id="expected-rate${i}" onchange="calculatedAmount(id)" style="width: 7em" value="${Number(pIsnData[i].rate)}"/> </td>
            <td class="amount" > <input type="number" id="amount${i}" disabled="true" style="width: 7em" value="${Number(pIsnData[i].quantity)*Number(pIsnData[i].rate)}"/> </td>
            <td class="location" id="location-number${i}" style="display: none;"> <span>${pIsnData[i].locationValue}</span> </td>
            <td><button type="button" class="btn" id="delete-btn" onclick="remove(this)"><i class="fa fa-trash"></i></button></td>
            </tr>`
        }
    }
    return optionsIsn;
}

// Verifications if Item and PO were selected
function isExistInPO(isnPO, po)
{
    for (let i = 0; i < po.length; i++)
    {
        if (isnPO == po[i].po)
        {
            return false;
        }
        else if(i == po.length-1)
        {
            return true;
        }
    }
}

// If Repit Items
function repitItem(isnPO, po)
{
    for (let i = 0; i < isnPO.length; i++)
    {
        if (isnPO[i].flag != "po")
        {
            if (po.po == isnPO[i].poText)
            {
                if (po.itemText == isnPO[i].itemText)
                {
                    return false;
                }
                else if(i == isnPO.length-1)
                {
                    return true;
                }
                
            }
            else if(i == isnPO.length-1)
            {
                
                return true;
            }
        }  
    }
}

// Put data in not editable table
function putIsnOptionsNotEdit(pIsnData)
{
    let optionsIsn = "";

    for(let i = 0; i < pIsnData.length; i++)
    {
        if(pIsnData[i].flag != 'po')
        {
            let quantity = Number(pIsnData[i].quantityShipment) - Number(pIsnData[i].quantity);
            optionsIsn += `<tr class=\'item-line createlp-item-line-notedit\'>
            <td class=\'purchase-order-number-span\' id=\'pos-span-notedit\'> <span>${pIsnData[i].poText}</span></td>
            <td class=\'item-sku-span\' id=\'item-selector-span-notedit\'> <span>${pIsnData[i].itemText}</span> </td>
            <td class=\'item-name\' id=\'item-name-notedit\'> <span>${pIsnData[i].description}</span> </td>
            <td class=\'receiving-location\' id=\'receiving-location-notedit\'> <span>${pIsnData[i].locationText}</span> </td>
            <td class=\'quantity-expected\' id=\'quantity-expected-notedit\' /><span>${Number(pIsnData[i].quantity)}</span> </td>
            <td class=\'quantity-remaining\' id=\'quantity-remaining-notedit\'/><span>${quantity}</span></td>
            <td class=\'expected-rate\' id=\'expected-rate-notedit\'/><span>${Number(pIsnData[i].rate)}</span></td>
            <td class=\'amount\' id=\'amount-notedit\'/><span>${Number(pIsnData[i].quantity)*Number(pIsnData[i].rate)}</span> </td>
            <td class=\'location\' id=\'location-number-notedit\' style=\'display: none;\'> <span>${pIsnData[i].locationValue}</span> </td>
            </tr>`
        }
    }
    return optionsIsn;
}
