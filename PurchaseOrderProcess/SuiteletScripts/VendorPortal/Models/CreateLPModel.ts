import * as log from 'N/log';
import * as search from 'N/search';
import * as record from 'N/record';
import * as task from 'N/task';

import * as constants from '../../../Global/Constants';

// Get Functions

// Search POs and get Items
export function searchPO(pVendorID)
{
    let idPOs = [];
    // Search POs
    let customrecord_mw_po_approval_requestSearchObj = search.create({
        type: "customrecord_mw_po_approval_request",
        filters:
        [
           ["custrecord_mw_related_vendor","anyof",`${pVendorID}`], 
           "AND", 
           ["custrecord_mw_approved","is","T"], 
           "AND", 
           ["custrecord_mw_pi_file_uploaded","is","T"], 
           "AND", 
           ["custrecord_mw_load_plan_uploaded","is","T"], 
           "AND", 
           ["custrecord_mw_isn_complete","is","F"]
        ],
        columns:
        [
           "custrecord_mw_purchase_order",
        ]
     });
     
    let searchResultCount = customrecord_mw_po_approval_requestSearchObj.runPaged().count;
    customrecord_mw_po_approval_requestSearchObj.run().each(function(result){
        // .run().each has a limit of 4,000 results
        let po = result.getText("custrecord_mw_purchase_order")
        let id = result.getValue("custrecord_mw_purchase_order");
  
        po = po.slice(16, po.length);

        // Json Object informations PO
        idPOs.push({
            po: po,
            id: id,
            flag: "po"
        })

        // Search Items
        let purchaseorderSearchObj = search.create({
            type: "purchaseorder",
            filters:
            [
               ["type","anyof","PurchOrd"], 
               "AND", 
               ["mainline","is","F"], 
               "AND", 
               ["numbertext","is",po]
            ],
            columns:
            [
               "item",
               "quantity",
               "quantityonshipments",
               "location",
               "fxrate",
               "lineuniquekey"
            ]
        });
        let searchResultCount = purchaseorderSearchObj.runPaged().count;
        purchaseorderSearchObj.run().each(function(x){
            // .run().each has a limit of 4,000 results

            // Get Name of Items
            let inventoryitemSearchObj = search.create({
                type: "inventoryitem",
                filters:
                [
                   ["type","anyof","InvtPart"], 
                   "AND", 
                   ["internalidnumber","equalto",x.getValue("item")]
                ],
                columns:
                [
                   "displayname"
                ]
            });
            let searchResultCount = inventoryitemSearchObj.runPaged().count;
            inventoryitemSearchObj.run().each(function(y){
                // .run().each has a limit of 4,000 results
                if((Number(x.getValue("quantity")) - Number(x.getValue("quantityonshipments"))) != 0 )
                {
                    // Json Object information Item
                    idPOs.push({
                        po: po,
                        itemText: x.getText("item"),
                        itemValue: x.getValue("lineuniquekey"),
                        quantity: x.getValue("quantity"),
                        quantityShipment: x.getValue("quantityonshipments"),
                        description: y.getValue("displayname"),
                        locationText: x.getText("location"),
                        locationValue: x.getValue("location"),
                        rate: x.getValue("fxrate"),
                    })
                }
                
                return true;
            });
            return true;
        });
    
        return true;
     });
     log.debug("Array", idPOs);

     return idPOs;     
}

// Post Functions

// Save Inbound Shipment on NS
export function saveLoadPlan(pBody)
{

    // Create Inbound Shipment
    let inboundShipment = record.create({
        type: "inboundshipment",
        isDynamic: true
    });

    // Set some fields
    inboundShipment.setValue({
        fieldId: "billoflading",
        value: pBody.fields[0].billOfLading
    })

    inboundShipment.setValue({
        fieldId: "custrecord_mw_expected_ready_date",
        value: new Date(pBody.fields[0].readyDate)
    })

    inboundShipment.setValue({
        fieldId: "expectedshippingdate",
        value: new Date(pBody.fields[0].departureDate)
    })

    // Add lines for POs
    for(let i = 0; i<pBody.lines.length; i++)
    {
        inboundShipment.selectNewLine({
            sublistId: 'items'
        });
        inboundShipment.setCurrentSublistValue({
            sublistId: 'items',
            fieldId: 'purchaseorder',
            value: pBody.lines[i].purchaseOrder
        });

        inboundShipment.setCurrentSublistValue({
            sublistId: 'items',
            fieldId: 'shipmentitem',
            value: pBody.lines[i].item
        });

        inboundShipment.setCurrentSublistValue({
            sublistId: 'items',
            fieldId: 'receivinglocation',
            value: Number(pBody.lines[i].location)
        });
        inboundShipment.setCurrentSublistValue({
            sublistId: 'items',
            fieldId: 'quantityexpected',
            value: Number(pBody.lines[i].quantityExpected)
        });
        inboundShipment.setCurrentSublistValue({
            sublistId: 'items',
            fieldId: 'expectedrate',
            value: Number(pBody.lines[i].expectedRate)
        });

        inboundShipment.commitLine({
            sublistId: 'items'
        });
    }

   inboundShipment.save();
}


