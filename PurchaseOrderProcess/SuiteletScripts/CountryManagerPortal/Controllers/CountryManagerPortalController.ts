/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as log from 'N/log';

import * as model from '../Models/CountryManagerPortalModel';
import * as view from '../Views/CountryManagerPortalView';
import * as constants from '../../../Global/Constants';

// Get the view of a specific purchase order
export function getPurchaseOrderView(pApprovalRequestID, pUniqueKey, pPageID)
{
    // Get the data of the specific Approval Request being accessed
    let approvalRequestData = model.getApprovalRequestData(pApprovalRequestID);

    let vendorID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR];
    let purchaseOrderID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
    if (vendorID && purchaseOrderID)
    {
        // Get the vendors related to the employee
        let vendors = model.getVendorsRelatedToEmp(pUniqueKey);

        // Get the data of all the Pending Approval Requests
        let pendingApprovalRequestData = model.getPendingApprovalRequestsData(vendors);

        // Get the data of the Purchase Order
        let purchaseOrderData = model.getPurchaseOrderData(vendorID, purchaseOrderID);
        let approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);

        // Return the view of a specific Purchase Order
        return view.getPurchaseOrderView(pendingApprovalRequestData, approvalRequestData, purchaseOrderData, approvalRequestCommentsData, pUniqueKey, pPageID);
    }
    else
    {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

// Get the view of a specific inbound shipment
export function getInboundShipmentView(pApprovalRequestID, pInboundShipmentID, pUniqueKey, pPageID)
{
    // Get the data of the specific Approval Request being accessed
    let approvalRequestData = model.getApprovalRequestData(pApprovalRequestID);

    let vendorID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR];
    let purchaseOrderID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
    if (vendorID && purchaseOrderID)
    {
        // Get the vendors related to the employee
        let vendors = model.getVendorsRelatedToEmp(pUniqueKey);

        // Get the data of all the Pending Approval Requests
        let pendingApprovalRequestData = model.getPendingApprovalRequestsData(vendors);

        // Get the data of the Inbound Shipment
        let inboundShipmentData = model.getInboundShipmentData(vendorID, pInboundShipmentID);
        let approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);

        // Return the view of a specific Purchase Order
        return view.getInboundShipmentView(pendingApprovalRequestData, approvalRequestData, inboundShipmentData, approvalRequestCommentsData, pUniqueKey);
    }
    else
    {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

// Get the view of the approval requests list
export function getApprovalRequestsView(pUniqueKey, pPageID)
{
    // Get the vendors related to the employee
    let vendors = model.getVendorsRelatedToEmp(pUniqueKey);

    // Get the data of the Pending Approval Requests
    let pendingApprovalRequestData = model.getPendingApprovalRequestsData(vendors);

    // Return the view of the Pending Approval Requests
    return view.getPendingApprovalRequestsView(pendingApprovalRequestData, pUniqueKey, pPageID);
}

// Get the view of the home page
export function getHomePageView(pUniqueKey)
{
    // Get the vendors related to the employee
    let vendors = model.getVendorsRelatedToEmp(pUniqueKey);

    // Get the data of the Pending Approval Requests
    let pendingApprovalRequestData = model.getPendingApprovalRequestsData(vendors);

    // Return the view of the Pending Approval Requests
    return view.getHomePage(pendingApprovalRequestData, pUniqueKey);
}

// Update the data of the purchase order
export function updatePurchaseOrderData(pBody, pParameters)
{
    let generalData = pBody.general;
    let linesData = pBody.lines;
    let generalComment = pBody.comment;
    let purchaseOrderID = pParameters.po;

    if (linesData.length > 0)
    {
        model.updatePurchaseOrderData(purchaseOrderID, generalData, linesData, generalComment);
    }
}

// Get the view of an error
export function getErrorPage(pErrorMessage, pSmallText)
{
    return view.getErrorPage(pErrorMessage, pSmallText);
}
