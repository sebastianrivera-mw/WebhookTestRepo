import * as log from 'N/log';
import * as search from 'N/search';
import * as record from 'N/record';
import * as task from 'N/task';

import * as constants from '../../../Global/Constants';

// Get Purchase Orders
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
                        itemValue: x.getValue("item"),
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

/// Get Inbound Shipment
// Lookupfields for fields ISN
export function getFieldsISN(pIsnNumber)
{
    let fields = [];
    let fieldsInboundShipment = search.lookupFields({
        type: "inboundshipment",
        id: pIsnNumber.slice(4, pIsnNumber.length),
        columns: ["billoflading", "custrecord_mw_expected_ready_date", "expectedshippingdate"]
    })
    fields.push({
        billoflading: fieldsInboundShipment.billoflading,
        readyDate: fieldsInboundShipment.custrecord_mw_expected_ready_date,
        departureDate: fieldsInboundShipment.expectedshippingdate
    })
    return fields;
}

// Get Rows of inbound shipment
export function getInboundShipmentEditData(pIsnNumber)
{
    let isnData = [];

    let inboundshipmentSearchObj = search.create({
        type: "inboundshipment",
        filters:
        [
            ["shipmentnumber","anyof",pIsnNumber], 
            // "AND", 
            // ["status","anyof","toBeShipped"]
        ],
        columns:
        [
            "item",
            search.createColumn({
                name: "purchaseorder",
                sort: search.Sort.ASC
            }),
            "internalid",
            "quantityexpected",
            search.createColumn({
                name: "quantity",
                join: "purchaseOrder"
             }),
            "receivinglocation",
            "expectedrate"
        ]
     });
     let searchResultCount = inboundshipmentSearchObj.runPaged().count;
     log.debug("inboundshipmentSearchObj result count",searchResultCount);
     inboundshipmentSearchObj.run().each(function(result){
        // .run().each has a limit of 4,000 results
        if (isnData.length == 0)
        {
            isnData.push({
                po: result.getValue("purchaseorder"),
                poText: result.getText("purchaseorder"),
                flag: "po"
            })
        }

        for (let i = 0; i < isnData.length; i++)
        {
            if(isnData[i].flag == "po")
            {
                if(isnData[i].po == result.getValue("purchaseorder"))
                {
                    break;
                }
            }
            else if (i == isnData.length-1)
            {
                log.debug("Here", i)
                isnData.push({
                    po: result.getValue("purchaseorder"),
                    poText: result.getText("purchaseorder"),
                    flag: "po"
                })
            }
        }
        

        // Get Name of Items
        let inventoryitemSearchObj = search.create({
            type: "inventoryitem",
            filters:
            [
               ["type","anyof","InvtPart"], 
               "AND", 
               ["internalidnumber","equalto",result.getValue("item")]
            ],
            columns:
            [
               "displayname"
            ]
        });
        
        let searchResultCount = inventoryitemSearchObj.runPaged().count;
            inventoryitemSearchObj.run().each(function(y){
                // .run().each has a limit of 4,000 results
                log.debug("Result", result);
                {
                    // Json Object information Item
                    isnData.push({
                        po: result.getValue("purchaseorder"),
                        poText: result.getText("purchaseorder"),
                        itemText: result.getText("item"),
                        itemValue: result.getValue("item"),
                        quantity: result.getValue("quantityexpected"),
                        quantityShipment: result.getValue({name: "quantity", join: "purchaseOrder"}),
                        description: y.getValue("displayname"),
                        locationText: result.getText("receivinglocation"),
                        locationValue: result.getValue("receivinglocation"),
                        rate: result.getValue("expectedrate")
                    })
                }
                
                return true;
            });

        return true;
    });

    log.debug("Array ISN", isnData);

    return isnData;
}

// Update Load Plans
export function updateLoadPlan(pBody)
{
    // ISN Id
    let idINS = Number(pBody.isnNumber.slice(4, pBody.isnNumber.length));

    let inboundShipmentUpdate = record.load({
        type: "inboundshipment",
        id: idINS,
        isDynamic: true
    });

    let lengthItemList = inboundShipmentUpdate.getLineCount({sublistId: 'items'});

    // Delete lines of the INS
    for (let i = 0; i < lengthItemList; i++)
    {     
        log.debug("Here", 0)
        inboundShipmentUpdate.removeLine({
            sublistId: "items",
            line: 0, 
            ignoreRecalc: true
        })
    }
    

    // Update lines of the INS
     // Add lines for POs
     let itemLineUnique;
     for(let i = 0; i<pBody.lines.length; i++)
     {
          // Search Items Lineuniquekey
          let purchaseorderSearchObj = search.create({
            type: "purchaseorder",
            filters:
            [
               ["type","anyof","PurchOrd"], 
               "AND", 
               ["mainline","is","F"], 
               "AND", 
               ["internalid","is", pBody.lines[i].purchaseOrder]
            ],
            columns:
            [
               "item",
               "lineuniquekey"
            ]
        });
        let searchResultCount = purchaseorderSearchObj.runPaged().count;
        purchaseorderSearchObj.run().each(function(result){
            if(pBody.lines[i].item == result.getValue("item"))
            {
                itemLineUnique = result.getValue("lineuniquekey");
                log.debug("Item", itemLineUnique);
            }
            return true;
        })

        // Select new line and save data
        inboundShipmentUpdate.selectNewLine({
             sublistId: 'items'
         });
         inboundShipmentUpdate.setCurrentSublistValue({
             sublistId: 'items',
             fieldId: 'purchaseorder',
             value: pBody.lines[i].purchaseOrder
         });
 
         inboundShipmentUpdate.setCurrentSublistValue({
             sublistId: 'items',
             fieldId: 'shipmentitem',
             value: itemLineUnique
         });

         inboundShipmentUpdate.setCurrentSublistValue({
            sublistId: 'items',
            fieldId: 'receivinglocation',
            value: Number(pBody.lines[i].location)
        });
        inboundShipmentUpdate.setCurrentSublistValue({
            sublistId: 'items',
            fieldId: 'quantityexpected',
            value: Number(pBody.lines[i].quantityExpected)
        });
        inboundShipmentUpdate.setCurrentSublistValue({
            sublistId: 'items',
            fieldId: 'expectedrate',
            value: Number(pBody.lines[i].expectedRate)
        });
 
         inboundShipmentUpdate.commitLine({
             sublistId: 'items'
         });
     }    

    inboundShipmentUpdate.save();
}

