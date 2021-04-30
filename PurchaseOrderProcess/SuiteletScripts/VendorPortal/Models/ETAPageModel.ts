/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as log from 'N/log';
import * as search from 'N/search';
import * as record from 'N/record';
import * as task from 'N/task';

import * as constants from '../../../Global/Constants';

// Get Vendor ID using unique code from parameters
export function getVendorID(pUniqueKey, pGroupedPageID, pGroupedPageVendor)
{
    let filters = [];
    if (pGroupedPageID)
    {
        filters.push(search.createFilter({ join: constants.VENDOR.FIELDS.TOV_REP, name: constants.EMPLOYEE.FIELDS.UNIQUE_KEY, operator: search.Operator.IS, values: pUniqueKey }))
        filters.push(search.createFilter({ name: constants.VENDOR.FIELDS.TOV_REP, operator: search.Operator.IS, values: pGroupedPageID }))
        filters.push(search.createFilter({ name: constants.VENDOR.FIELDS.INTERNALID, operator: search.Operator.ANYOF, values: [pGroupedPageVendor] }))
    }
    else
    {
        filters.push(search.createFilter({ name: constants.VENDOR.FIELDS.ETA_PAGE_KEY, operator: search.Operator.IS, values: pUniqueKey }))
    }

    let vendorID = null;
    let vendorsSearch = search.create({
        type: search.Type.VENDOR,
        filters: filters,
        columns: [ search.createColumn({ name: "internalid" }) ]
    }).run().getRange({ start: 0, end: 1 });
    vendorID = vendorsSearch[0] ? vendorsSearch[0].id : null;

    return vendorID;
}

// Load search to get the data of the Purchase Order lines
export function getPurchaseOrdersSearch(pVendorID)
{
    let existingItemsSearch = search.load({ id : constants.SEARCHES.PREVIOUS_TBS_ITEMS });

    if (pVendorID)
    {
        let vendorFilterFormula = `REGEXP_INSTR({custitem_mw_tbs_report_data}, '"vendorId":"${pVendorID.toString()}"')`;
        let vendorFilter = search.createFilter({ name : "formulatext", formula: vendorFilterFormula, operator : search.Operator.ISNOT, values : "0" });
        existingItemsSearch.filters.push(vendorFilter);
    }

    return existingItemsSearch;
}

// Set the link of the Vendor as viewed
export function setLinkAsViewed(pVendorsList)
{
    let records = [];
    search.create({
        type: constants.VENDOR_ETA_EMAIL_SENT.ID,
        filters: [
            search.createFilter({ name: constants.VENDOR_ETA_EMAIL_SENT.FIELDS.VENDOR, operator: search.Operator.ANYOF, values: pVendorsList }),
            search.createFilter({ name: constants.VENDOR_ETA_EMAIL_SENT.FIELDS.LINK_OPENED, operator: search.Operator.IS, values: false }),
            search.createFilter({ name: constants.VENDOR_ETA_EMAIL_SENT.FIELDS.MOST_RECENT_EMAIL, operator: search.Operator.IS, values: true })
        ],
        columns: [
            search.createColumn({ name: "internalid" })
        ]
    }).run().each(function (result) {
        records.push(result.id);
        return true;
    });

    for (let i = 0; i < records.length; i++)
    {
        record.submitFields({
            type: constants.VENDOR_ETA_EMAIL_SENT.ID,
            id: records[i],
            values: {
                [constants.VENDOR_ETA_EMAIL_SENT.FIELDS.LINK_OPENED] : true
            }
        });
    }
}

// Get the list of delay types
export function getDelayTypes()
{
    let delayTypes = [];

    // Search for the list of Delay Types
    let delayTypeSearch = search.create({
        type: constants.DELAY_TYPE_LIST.ID,
        columns: [
            search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
            search.createColumn({ name: 'name' })
        ]
    });

    // Create HTML with values of list
    delayTypeSearch.run().each(function (result) {

        delayTypes.push({
            "id": result.getValue('internalid'),
            "name": result.getValue('name')
        });

        return true;
    });

    return delayTypes;
}

// Get the name of a Vendor
export function getVendorName(pVendorID)
{
    return search.lookupFields({ type: search.Type.VENDOR, id: pVendorID, columns: [constants.VENDOR.FIELDS.COMPANY_NAME] })[constants.VENDOR.FIELDS.COMPANY_NAME];
}

// Create Purchase Orders to Update record and call scheduled script to process them
export function updatePurchaseOrders(pLinesData, pGeneralData, pVendorID)
{
    try
    {
        // Create Purchase Orders to Update record with data to upload
        createPurchaseOrdersToUpdateRecord(pLinesData, pGeneralData, pVendorID);
    
        // Call scheduled script to process the data
        task.create({
            taskType : task.TaskType.SCHEDULED_SCRIPT,
            scriptId : constants.SCRIPTS.IMPORT_SCHEDULED_SCRIPT.ID,
            deploymentId : constants.SCRIPTS.IMPORT_SCHEDULED_SCRIPT.DEPLOY
        }).submit();
    }
    catch(error)
    {
        log.error('ERROR' , JSON.stringify(error));
        log.error('An error has occured.', error.message);
    }
}

// Create Purchase Orders to Update record with data to upload
function createPurchaseOrdersToUpdateRecord(pLinesData, pGeneralData, pVendorID)
{
    // Store details data
    let objectToStore = {};
    for (let i = 0; i < pLinesData.length; i++)
    {
        let line = pLinesData[i];
        let shipmentNumber = line.shipmentNumber;
        let purchaseOrderID = line.purchaseOrderID;
        let isPendingLine = line.isPendingLine;
        shipmentNumber == "Dropship Order" ? shipmentNumber = `Dropship Order / ${purchaseOrderID}` : shipmentNumber;
        let itemSku = line.itemSku;
        let currentReadyDate = line.currentReadyDate;
        let currentDepartureDate = line.currentDepartureDate;
        let expectedToPort = line.expectedToPort;
        let delayType = line.delayType;
        let notes = line.notes;

        !objectToStore[shipmentNumber] ? objectToStore[shipmentNumber] = {} : {};

        let lineKey = `${itemSku}/${purchaseOrderID}`;
        objectToStore[shipmentNumber][lineKey] = {
            [constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.PURCHASE_ORDER_ID]: purchaseOrderID,
            [constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.IS_PENDING_LINE]: isPendingLine,
            [constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.CURRENT_SHIP_DATE]: currentReadyDate,
            [constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.CURRENT_DEPARTURE_DATE]: currentDepartureDate,
            [constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.EXPECTED_TO_PORT]: expectedToPort,
            [constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.DELAY_TYPE]: delayType,
            [constants.PO_TO_UPDATE_RECORD.DETAILS_IDS.NOTES]: notes
        };
    }

    let newRecord = record.create({ type: constants.PO_TO_UPDATE_RECORD.RECORD_ID });
    newRecord.setValue(constants.PO_TO_UPDATE_RECORD.FIELDS.GENERAL_DATA, JSON.stringify(pGeneralData));
    newRecord.setValue(constants.PO_TO_UPDATE_RECORD.FIELDS.DETAILS, JSON.stringify(objectToStore));
    newRecord.setValue(constants.PO_TO_UPDATE_RECORD.FIELDS.VENDOR, pVendorID);
    newRecord.save();
}
