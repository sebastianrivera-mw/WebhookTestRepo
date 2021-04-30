/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as log from 'N/log';

import * as model from '../Models/VendorPortalModel';
import * as etaModel from '../Models/ETAPageModel';
import * as etaView from '../Views/ETAPageView';
import * as view from '../Views/VendorPortalView';
import * as redirectView from '../Views/RedirectView';
import * as resetPasswordView from '../Views/ResetPasswordView';
import * as createLPView from '../Views/CreateInboundShipmentView';
import * as createLPModel from '../Models/CreateLPModel';
import * as editLPModel from '../Models/EditLPModel';
import * as editLPView from '../Views/EditInboundShipmentView';

import * as constants from '../../../Global/Constants';

// ------------------------------------------------------------------------
// GET Functions
// ------------------------------------------------------------------------

// Get the view of a specific purchase order
export function getPurchaseOrderView(pCookie, pPurchaseOrderID, pPageID) 
{
    // Get Vendor IDs using values from the cookies
    let vendors = model.getVendors(pCookie);
    if (vendors.length > 0) {
        // Get the data of the purchase order
        let purchaseOrderData = model.getPurchaseOrderData(pPurchaseOrderID);
        if (purchaseOrderData) {
            // Get the data of the approval requests of the Vendor
            let vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);

            // Get the data of this specific approval request
            let approvalRequestData = model.getApprovalRequestData(vendors, pPurchaseOrderID);

            // Get the data of the comments related to this approval request
            let approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);

            // Return the main view
            return view.getPurchaseOrderView(purchaseOrderData, vendorApprovalRequestData, approvalRequestData, approvalRequestCommentsData, pCookie, pPageID);
        }
        else {
            let errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    else {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

// Get the view of a specific inbound shipment
export function getInboundShipmentView(pCookie, pPurchaseOrderID, pInboundShipmentID, editView) 
{
    // Get Vendor IDs using values from the cookies
    let vendors = model.getVendors(pCookie);
    if (vendors.length > 0) {
        // Get the data of the inbound shipment
        let inboundShipmentData = model.getInboundShipmentData(pInboundShipmentID);
        if (inboundShipmentData) {
            // Get the data of the approval requests of the Vendor
            let vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);

            // Get the data of this specific approval request
            let approvalRequestData = model.getApprovalRequestData(vendors, pPurchaseOrderID);

            // Get the data of the comments related to this approval request
            let approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);

            log.debug("Returning Inbound Shipment View", "Returning Inbound Shipment View");

            // Return the main view
            return view.getInboundShipmentView(inboundShipmentData, vendorApprovalRequestData, approvalRequestData, approvalRequestCommentsData, editView);
        }
        else {
            let errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    else {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

// Get the view of a specific page
export function getLoadPlansView(pCookie, pParameters, pPageID) 
{
    let vendorID = pParameters.vendor;

    // Get Vendor IDs using values from the cookies
    let vendors = model.getVendors(pCookie);
    if (vendors.length > 0) {
        // Get the Vendor ID if not present on the params
        if (!vendorID) vendorID = vendors[0];

        // Set the ETA email as viewed
        etaModel.setLinkAsViewed(vendors);

        // Get the data of the Pending Approval Requests
        let vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);

        // Get the data of the Vendor
        let vendorData = model.getVendorData(vendorID);
        log.debug("vendorData", vendorData);

        // Get the data of the Vendor's Purchase Orders
        let purchaseOrdersSearch = etaModel.getPurchaseOrdersSearch(vendorID);

        // Get the view of the ETA Section of the Vendor
        let etaSection = etaView.getETASectionView(vendors, vendorID, vendorData, purchaseOrdersSearch, pPageID);

        // Return the view of the specific page
        return view.getLoadPlansView(vendorApprovalRequestData, vendorData, vendors.length > 1, etaSection, pPageID);
    }
    else {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

// Get the view of a specific page
export function getVendorApprovalRequestsView(pCookie, pPageID) 
{
    // Get Vendor IDs using values from the cookies
    let vendors = model.getVendors(pCookie);
    if (vendors.length > 0) {
        // Get the data of the Pending Approval Requests
        let vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);

        // Get the data of the Vendor
        let vendorData = vendors.length === 1 ? model.getVendorData(vendors[0]) : null;

        // Return the view of the specific page
        return view.getVendorApprovalRequestsView(vendorApprovalRequestData, vendorData, vendors.length > 1, pPageID);
    }
    else {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

// Get the view of the home page
export function getHomePageView(pCookie) 
{
    // Get Vendor IDs using values from the cookies
    let vendors = model.getVendors(pCookie);
    if (vendors.length > 0) {
        // Get the data of the Pending Approval Requests
        let vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);

        // Get the data of the Vendor
        let vendorData = vendors.length === 1 ? model.getVendorData(vendors[0]) : null;

        // Return the view of the Home Page
        return view.getHomePage(vendors, vendorData, vendorApprovalRequestData);
    }
    else {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

// Get the view of the thanks page
export function getThanksPage(pCookie) 
{
    // Get Vendor IDs using values from the cookies
    let vendors = model.getVendors(pCookie);
    if (vendors.length > 0) {
        // Get the data of the Pending Approval Requests
        let vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);

        // Get the data of the Vendor
        let vendorData = vendors.length === 1 ? model.getVendorData(vendors[0]) : null;

        return view.getThanksPage(vendorData, vendorApprovalRequestData);
    }
}

// Get the view of the reset password page
export function getResetPasswordView(pCookie, pPageID) 
{
    // Get Vendor IDs using values from the cookies
    let vendors = model.getVendors(pCookie);
    if (vendors.length > 0) {
        // Get the data of the Pending Approval Requests
        let vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);

        // Get the data of the Vendor
        let vendorData = vendors.length === 1 ? model.getVendorData(vendors[0]) : null;

        // Return the view of the Reset Password Page
        let userID = model.validateContact(pCookie.email);
        return resetPasswordView.getResetPasswordView(userID, vendorData, vendorApprovalRequestData, pPageID);
    }
    else {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

//Shows a loading spinner while redirects to a new URL
export function getRedirectView(pURL) 
{
    return redirectView.redirect(pURL);
}

/// Added 15/02/2021 by Bryan Badilla
// Get Create Inbound Shipment View
export function getCreateInboundShipmentView(pCookie, pParameters, pPageID)
{
    let vendorID = pParameters.vendor;
    // Get Vendor IDs using values from the cookies
    let vendors = model.getVendors(pCookie);
    if (vendors.length > 0) {
        // Get the Vendor ID if not present on the params
        if (!vendorID) vendorID = vendors[0];

        // Get the data of the Pending Approval Requests
        let vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);

        // Get the data of the Vendor
        let vendorData = model.getVendorData(vendorID);
        log.debug("vendorData", vendorData);

        // Get the data of the Vendor's Purchase Orders
        let purchaseOrdersSearch = createLPModel.searchPO(vendorID);

        log.debug("POs", purchaseOrdersSearch);
        log.debug("Vendor Controller", vendorID);

        let section = createLPView.getCreateInboudShipmentView(purchaseOrdersSearch, vendorID);
        return view.getCreateLoadPlansView(vendorApprovalRequestData, vendorData, vendors.length > 1, section, pPageID);;
    }
    else {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
}

// 22-02-2021 Get Edit Inbound Shipment View
export function getEditInboundShipmentView(pCookie, pParameters, pPageID, pIsnNumber)
{
    let vendorID = pParameters.vendor;
    // Get Vendor IDs using values from the cookies
    let vendors = model.getVendors(pCookie);
    if (vendors.length > 0) {
        // Get the Vendor ID if not present on the params
        if (!vendorID) vendorID = vendors[0];

        // Get the data of the Vendor's Purchase Orders
        let purchaseOrdersSearch = editLPModel.searchPO(vendorID);

        // Get data of inbound shipment
        let isnData = editLPModel.getInboundShipmentEditData(pIsnNumber);
        let isnFields = editLPModel.getFieldsISN(pIsnNumber)

        let section = editLPView.getEditInboudShipmentView(purchaseOrdersSearch, isnData, isnFields);
        return section;    
    }
    else 
    {
        let errorMessage = "Error: The link is not valid!";
        return view.getErrorPage(errorMessage, false);
    }
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
    let piFileContent = pBody.piFileContent;
    let loadPlanContent = pBody.loadPlanContent;
    let purchaseOrderID = pParameters.po;

    log.debug("piFileContent", piFileContent);
    log.debug("loadPlanContent", loadPlanContent);

    if (linesData && linesData.length > 0) {
        model.updatePurchaseOrderData(purchaseOrderID, generalData, linesData, generalComment, piFileContent, loadPlanContent);
    }
    else if (piFileContent) {
        model.uploadPIFile(purchaseOrderID, piFileContent);
    }
    else if (loadPlanContent) {
        model.uploadLoadPlan(purchaseOrderID, loadPlanContent);
    }
}

// Mark the shipment as In Transit and upload the related files
export function markShipmentAsInTransit(pBody, pParameters) 
{
    let inboundShipmentID = pParameters.isn;
    let purchaseOrderID = pParameters.po;
    let filesContents = pBody.filesContents;
    let containerNumber = pBody.containerNumber;

    // Upload and attach the shipment related files
    let fileIDs = model.attachShipmentRelatedFiles(filesContents);

    // Store the file IDs on the approval request
    model.storeShipmentRelatedFilesIDs(purchaseOrderID, fileIDs);

    // Mark the Inbound Shipment as In Transit
    model.markShipmentAsInTransit(inboundShipmentID, purchaseOrderID, containerNumber, fileIDs);
}

// Mark the shipment as In Transit and upload the related files
export function uploadShipmentFiles(pBody, pParameters) 
{
    let purchaseOrderID = pParameters.po;
    let filesContents = pBody.filesContents;

    // Upload and attach the shipment related files
    let fileIDs = model.attachShipmentRelatedFiles(filesContents);

    // Store the file IDs on the approval request
    model.storeShipmentRelatedFilesIDs(purchaseOrderID, fileIDs);
}

// Reset the password on the contact record
export function resetPassword(pCookie, pPageID, pUserID, pPassword) 
{
    // Reset the password on the contact record
    model.resetPassword(pUserID, pPassword);

    // Get Vendor IDs using values from the cookies
    let vendors = model.getVendors(pCookie);

    // Get the data of the Pending Approval Requests
    let vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);

    // Get the data of the Vendor
    let vendorData = vendors.length === 1 ? model.getVendorData(vendors[0]) : null;

    return resetPasswordView.getResetPasswordSuccessView(vendorData, vendorApprovalRequestData, pPageID);
}

// Update the Purchase Order data after submission
export function updateETAData(pBody)
{
    // Get params from request
    let generalData = pBody.general;
    let linesData = pBody.lines;
    let vendorID = generalData.vendorID;

    // Update the Purchase Order
    etaModel.updatePurchaseOrders(linesData, generalData, vendorID);
}

// Save new inbound shipment on netsuite
export function saveLoadPlan(pbody)
{
    log.debug("Body", pbody);
    createLPModel.saveLoadPlan(pbody);
}

// Save new inbound shipment on netsuite
export function updateLoadPlan(pbody)
{
    log.debug("Body", pbody);
    editLPModel.updateLoadPlan(pbody);
}
