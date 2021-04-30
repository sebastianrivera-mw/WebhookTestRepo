/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as model from '../Models/POPlannerPortalModel';
import * as view from '../Views/POPlannerPortalView';
import * as constants from '../../../Global/Constants';

// ------------------------------------------------------------------------
// GET Functions
// ------------------------------------------------------------------------

// Get the view of a specific purchase order
export function getPurchaseOrderView(pApprovalRequestID, pPageID)
{
    // Get the data of the specific Approval Request being accessed
    let approvalRequestData = model.getApprovalRequestData(pApprovalRequestID);

    let vendorID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR];
    let purchaseOrderID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
    if (vendorID && purchaseOrderID)
    {
        // Get the data of all the Pending Approval Requests
        let pendingApprovalRequestData = model.getPendingApprovalRequestsData();

        // Get the data of the Purchase Order
        let purchaseOrderData = model.getPurchaseOrderData(vendorID, purchaseOrderID);
        let approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);

        // Return the view of a specific Purchase Order
        return view.getPurchaseOrderView(pendingApprovalRequestData, approvalRequestData, purchaseOrderData, approvalRequestCommentsData, pPageID);
    }
    else
    {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

// Get the view of a specific inbound shipment
export function getInboundShipmentView(pApprovalRequestID, pInboundShipmentID, pPageID)
{
    // Get the data of the specific Approval Request being accessed
    let approvalRequestData = model.getApprovalRequestData(pApprovalRequestID);

    let vendorID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR];
    let purchaseOrderID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
    if (vendorID && purchaseOrderID)
    {
        // Get the data of all the Pending Approval Requests
        let pendingApprovalRequestData = model.getPendingApprovalRequestsData();

        // Get the data of the Inbound Shipment
        let inboundShipmentData = model.getInboundShipmentData(vendorID, pInboundShipmentID);
        let approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);

        // Return the view of a specific Purchase Order
        return view.getInboundShipmentView(pendingApprovalRequestData, approvalRequestData, inboundShipmentData, approvalRequestCommentsData, pPageID);
    }
    else
    {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

// Get the view of a specific page
export function getPageView(pPageID)
{
    // Get the data of the Pending Approval Requests
    let pendingApprovalRequestData = model.getPendingApprovalRequestsData();

    // Return the view of the Pending Approval Requests
    return view.getPendingApprovalRequestsView(pendingApprovalRequestData, pPageID);
}

// Get the view of the home page
export function getHomePageView()
{
    // Get the data of the Pending Approval Requests
    let pendingApprovalRequestData = model.getPendingApprovalRequestsData();

    // Return the view of the Pending Approval Requests
    return view.getHomePage(pendingApprovalRequestData);
}

// Get the view of an error
export function getErrorPage(pErrorMessage, pSmallText)
{
    return view.getErrorPage(pErrorMessage, pSmallText);
}

// ------------------------------------------------------------------------
// POST Functions
// ------------------------------------------------------------------------

// Update the data of the purchase order
export function updatePurchaseOrderData(pBody, pParameters)
{
    let generalData = pBody.general;
    let linesData = pBody.lines;
    let generalComment = pBody.comment;
    let purchaseOrderID = pParameters.po;
    let piFileContent = pBody.piFileContent;
    let loadPlanContent = pBody.loadPlanContent;
    
    if (linesData && linesData.length > 0)
    {
        model.updatePurchaseOrderData(purchaseOrderID, generalData, linesData, generalComment);
    }
    else if (piFileContent) 
    {
        model.uploadPIFile(purchaseOrderID, piFileContent);
    }
    else if (loadPlanContent) 
    {
        model.uploadLoadPlan(purchaseOrderID, loadPlanContent);
    }
}

// Mark the shipment as In Transit and upload the related files
export function uploadShipmentFiles(pBody, pParameters) {
    let purchaseOrderID = pParameters.po;
    let filesContents = pBody.filesContents;

    // Upload and attach the shipment related files
    let fileIDs = model.attachShipmentRelatedFiles(filesContents);

    // Store the file IDs on the approval request
    model.storeShipmentRelatedFilesIDs(purchaseOrderID, fileIDs);
}
