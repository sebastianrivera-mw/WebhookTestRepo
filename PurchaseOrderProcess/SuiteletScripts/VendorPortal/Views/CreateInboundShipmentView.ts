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
import * as createPLmodel from '../Models/CreateLPModel'


// Get the view of the ETA Section of the Vendor
export function getCreateInboudShipmentView(purchaseOrdersSearch, pVendorID)
{
    // Variables of all necesary data
    let optionsPO = generateOptionsPO(purchaseOrdersSearch); 
    let dataInfo = getFieldData(purchaseOrdersSearch);
    let optionsPOModal = generateOptionsPOModalTable(purchaseOrdersSearch);

    // Rows of main table
    let rows = `
    <tr class="item-line createlp-item-line">
        <td class="purchase-order-number"> 
            <select id='pos0' style="height:19px; width:110px; text-align:center;" name="po-options" onchange="isFirst(id, \`${dataInfo}\`)">
            <option id="po" ></option>
                ${optionsPO}
            </select> 
        </td>
        <td class="item-sku"> 
            <select id='item-selector0' style="height:19px; width:110px; text-align:center;" name="item-options" onchange="setFields(id)">
                <option id="item" ></option>
            </select> 
        </td>
        <td class="item-name" id="item-name0"> <span></span> </td>
        <td class="receiving-location" id="receiving-location0"> <span></span> </td>
        <td class="quantity-expected"> <input type="number" id="quantity-expected0" disabled="true" max="" min="" style="width: 4em"  onchange="calculated(id, max)"/> </td>
        <td class="quantity-remaining"> <input type="number" id="quantity-remaining0" style="width: 4em" disabled="true" /> </td>
        <td class="expected-rate" > <input type="number" id="expected-rate0" disabled="true" style="width: 7em" onchange="calculatedAmount(id)"/> </td>
        <td class="amount" > <input type="number" id="amount0" style="width: 7em" disabled="true"/> </td>
        <td class="location" id="location-number0" style="display: none;"> <span></span> </td>
        <td><button type="button" class="btn" id="delete-btn" onclick="remove(this)"><i class="fa fa-trash"></i></button></td>
        </tr>
    `;

    // Main View
    let view = `
    <div class="create-isn-view">
        <div id="buttons-area">
            <button type="button" value="Submit" id="btn-edit-data" class="btn btn-primary" style="display: true;" onclick="createLPHandleSubmit(${pVendorID})">Save</button>
        </div>
        </br>
        </br>

        <div>
            ${infoForCreateIS()}
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
            
            <!-- The Modal -->
            <div id="modal-table" class="modal">

                <!-- Modal content -->
                <div class="modal-content">
                    <span class="close">&times;</span>
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
                                    <th><input type="checkbox" id="global-checkbox" name="global-check"></th>
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

            <button type="button" class="btn btn-light btn-adds" id="btn-add-line"  onclick="addLine(\`${optionsPO}\`)">Add Row</button>
            <button type="button" class="btn btn-light btn-adds" id="btn-add-group-items" onclick="getOptions(\`${optionsPO}\`, \`${dataInfo}\` )">Add Multiple Lines</button>
        </div>
    </div>
    `
    return view;
}

// Get fields from NS (Date and Bill of lading)
function infoForCreateIS()
{
    return `
    <div id="orders-search-wrapper" class="orders-search-wrapper">
        <label for="bill-of-lading" class="orders-search-label">Bill of Lading</label>
        <input id="bill-of-lading" name="bill-of-lading"/>
        <label for="ready-date" class="orders-search-label">Expected Ready Date</label>
        <input type="date" id="ready-date" name="ready-date"/>
        <label for="departure-date" class="orders-search-label">Departure Ready Date</label>
        <input type="date" id="departure-date" name="departure-date"/>
    </div>
    `;
}

// Generate option for select
function generateOptionsPO(purchaseOrdersSearch)
{
    let options = "";
    let cont = 0;
    for(let i = 0; i<purchaseOrdersSearch.length; i++)
    {
        if (purchaseOrdersSearch[i].flag == "po")
        {
            options+=`<option id='${purchaseOrdersSearch[i].po}' value='${purchaseOrdersSearch[i].id}' >${purchaseOrdersSearch[i].po}</option>`
            cont ++;
        }
    }
    return options;
}

// Generate Data fields for tables
function getFieldData(purchaseOrdersSearch)
{
    let data = [];
    let cont = 0;
    for(let i = 0; i<purchaseOrdersSearch.length; i++)
    {
        if (purchaseOrdersSearch[i].flag != "po")
        {
            let quantity = Number(purchaseOrdersSearch[i].quantity) - Number(purchaseOrdersSearch[i].quantityShipment);
            data[cont] = `${purchaseOrdersSearch[i].po},${purchaseOrdersSearch[i].itemText},${purchaseOrdersSearch[i].itemValue},${quantity},${purchaseOrdersSearch[i].description},${purchaseOrdersSearch[i].locationText},${purchaseOrdersSearch[i].locationValue},${purchaseOrdersSearch[i].rate}`;
            cont++;
        } 
    }
    log.debug("Data", data);
    return data;

}

// Generate Options Modal table
function generateOptionsPOModalTable(purchaseOrdersSearch)
{
    let options = "";
    let cont = 0;
    for(let i = 0; i<purchaseOrdersSearch.length; i++)
    {
        if (purchaseOrdersSearch[i].flag == "po")
        {
            options+=` <label for="one"><input type="checkbox" id='check-${purchaseOrdersSearch[i].po}' name="po" style="margin-right:5px;" value="${purchaseOrdersSearch[i].po}"/>${purchaseOrdersSearch[i].po}</label>`
            cont ++;
        }
    }
    return options;
}
