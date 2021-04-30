/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/log", "../Models/VendorPortalModel", "../Models/ETAPageModel", "../Views/ETAPageView", "../Views/VendorPortalView", "../Views/RedirectView", "../Views/ResetPasswordView", "../Views/CreateInboundShipmentView", "../Models/CreateLPModel", "../Models/EditLPModel", "../Views/EditInboundShipmentView", "../../../Global/Constants"], function (require, exports, log, model, etaModel, etaView, view, redirectView, resetPasswordView, createLPView, createLPModel, editLPModel, editLPView, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // ------------------------------------------------------------------------
    // GET Functions
    // ------------------------------------------------------------------------
    // Get the view of a specific purchase order
    function getPurchaseOrderView(pCookie, pPurchaseOrderID, pPageID) {
        // Get Vendor IDs using values from the cookies
        var vendors = model.getVendors(pCookie);
        if (vendors.length > 0) {
            // Get the data of the purchase order
            var purchaseOrderData = model.getPurchaseOrderData(pPurchaseOrderID);
            if (purchaseOrderData) {
                // Get the data of the approval requests of the Vendor
                var vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);
                // Get the data of this specific approval request
                var approvalRequestData = model.getApprovalRequestData(vendors, pPurchaseOrderID);
                // Get the data of the comments related to this approval request
                var approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);
                // Return the main view
                return view.getPurchaseOrderView(purchaseOrderData, vendorApprovalRequestData, approvalRequestData, approvalRequestCommentsData, pCookie, pPageID);
            }
            else {
                var errorMessage = "Error: The link is not valid!";
                return view.getErrorPage(errorMessage, false);
            }
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getPurchaseOrderView = getPurchaseOrderView;
    // Get the view of a specific inbound shipment
    function getInboundShipmentView(pCookie, pPurchaseOrderID, pInboundShipmentID, editView) {
        // Get Vendor IDs using values from the cookies
        var vendors = model.getVendors(pCookie);
        if (vendors.length > 0) {
            // Get the data of the inbound shipment
            var inboundShipmentData = model.getInboundShipmentData(pInboundShipmentID);
            if (inboundShipmentData) {
                // Get the data of the approval requests of the Vendor
                var vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);
                // Get the data of this specific approval request
                var approvalRequestData = model.getApprovalRequestData(vendors, pPurchaseOrderID);
                // Get the data of the comments related to this approval request
                var approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);
                log.debug("Returning Inbound Shipment View", "Returning Inbound Shipment View");
                // Return the main view
                return view.getInboundShipmentView(inboundShipmentData, vendorApprovalRequestData, approvalRequestData, approvalRequestCommentsData, editView);
            }
            else {
                var errorMessage = "Error: The link is not valid!";
                return view.getErrorPage(errorMessage, false);
            }
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getInboundShipmentView = getInboundShipmentView;
    // Get the view of a specific page
    function getLoadPlansView(pCookie, pParameters, pPageID) {
        var vendorID = pParameters.vendor;
        // Get Vendor IDs using values from the cookies
        var vendors = model.getVendors(pCookie);
        if (vendors.length > 0) {
            // Get the Vendor ID if not present on the params
            if (!vendorID)
                vendorID = vendors[0];
            // Set the ETA email as viewed
            etaModel.setLinkAsViewed(vendors);
            // Get the data of the Pending Approval Requests
            var vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);
            // Get the data of the Vendor
            var vendorData = model.getVendorData(vendorID);
            log.debug("vendorData", vendorData);
            // Get the data of the Vendor's Purchase Orders
            var purchaseOrdersSearch = etaModel.getPurchaseOrdersSearch(vendorID);
            // Get the view of the ETA Section of the Vendor
            var etaSection = etaView.getETASectionView(vendors, vendorID, vendorData, purchaseOrdersSearch, pPageID);
            // Return the view of the specific page
            return view.getLoadPlansView(vendorApprovalRequestData, vendorData, vendors.length > 1, etaSection, pPageID);
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getLoadPlansView = getLoadPlansView;
    // Get the view of a specific page
    function getVendorApprovalRequestsView(pCookie, pPageID) {
        // Get Vendor IDs using values from the cookies
        var vendors = model.getVendors(pCookie);
        if (vendors.length > 0) {
            // Get the data of the Pending Approval Requests
            var vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);
            // Get the data of the Vendor
            var vendorData = vendors.length === 1 ? model.getVendorData(vendors[0]) : null;
            // Return the view of the specific page
            return view.getVendorApprovalRequestsView(vendorApprovalRequestData, vendorData, vendors.length > 1, pPageID);
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getVendorApprovalRequestsView = getVendorApprovalRequestsView;
    // Get the view of the home page
    function getHomePageView(pCookie) {
        // Get Vendor IDs using values from the cookies
        var vendors = model.getVendors(pCookie);
        if (vendors.length > 0) {
            // Get the data of the Pending Approval Requests
            var vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);
            // Get the data of the Vendor
            var vendorData = vendors.length === 1 ? model.getVendorData(vendors[0]) : null;
            // Return the view of the Home Page
            return view.getHomePage(vendors, vendorData, vendorApprovalRequestData);
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getHomePageView = getHomePageView;
    // Get the view of the thanks page
    function getThanksPage(pCookie) {
        // Get Vendor IDs using values from the cookies
        var vendors = model.getVendors(pCookie);
        if (vendors.length > 0) {
            // Get the data of the Pending Approval Requests
            var vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);
            // Get the data of the Vendor
            var vendorData = vendors.length === 1 ? model.getVendorData(vendors[0]) : null;
            return view.getThanksPage(vendorData, vendorApprovalRequestData);
        }
    }
    exports.getThanksPage = getThanksPage;
    // Get the view of the reset password page
    function getResetPasswordView(pCookie, pPageID) {
        // Get Vendor IDs using values from the cookies
        var vendors = model.getVendors(pCookie);
        if (vendors.length > 0) {
            // Get the data of the Pending Approval Requests
            var vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);
            // Get the data of the Vendor
            var vendorData = vendors.length === 1 ? model.getVendorData(vendors[0]) : null;
            // Return the view of the Reset Password Page
            var userID = model.validateContact(pCookie.email);
            return resetPasswordView.getResetPasswordView(userID, vendorData, vendorApprovalRequestData, pPageID);
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getResetPasswordView = getResetPasswordView;
    //Shows a loading spinner while redirects to a new URL
    function getRedirectView(pURL) {
        return redirectView.redirect(pURL);
    }
    exports.getRedirectView = getRedirectView;
    /// Added 15/02/2021 by Bryan Badilla
    // Get Create Inbound Shipment View
    function getCreateInboundShipmentView(pCookie, pParameters, pPageID) {
        var vendorID = pParameters.vendor;
        // Get Vendor IDs using values from the cookies
        var vendors = model.getVendors(pCookie);
        if (vendors.length > 0) {
            // Get the Vendor ID if not present on the params
            if (!vendorID)
                vendorID = vendors[0];
            // Get the data of the Pending Approval Requests
            var vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);
            // Get the data of the Vendor
            var vendorData = model.getVendorData(vendorID);
            log.debug("vendorData", vendorData);
            // Get the data of the Vendor's Purchase Orders
            var purchaseOrdersSearch = createLPModel.searchPO(vendorID);
            log.debug("POs", purchaseOrdersSearch);
            log.debug("Vendor Controller", vendorID);
            var section = createLPView.getCreateInboudShipmentView(purchaseOrdersSearch, vendorID);
            return view.getCreateLoadPlansView(vendorApprovalRequestData, vendorData, vendors.length > 1, section, pPageID);
            ;
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getCreateInboundShipmentView = getCreateInboundShipmentView;
    // 22-02-2021 Get Edit Inbound Shipment View
    function getEditInboundShipmentView(pCookie, pParameters, pPageID, pIsnNumber) {
        var vendorID = pParameters.vendor;
        // Get Vendor IDs using values from the cookies
        var vendors = model.getVendors(pCookie);
        if (vendors.length > 0) {
            // Get the Vendor ID if not present on the params
            if (!vendorID)
                vendorID = vendors[0];
            // Get the data of the Vendor's Purchase Orders
            var purchaseOrdersSearch = editLPModel.searchPO(vendorID);
            // Get data of inbound shipment
            var isnData = editLPModel.getInboundShipmentEditData(pIsnNumber);
            var isnFields = editLPModel.getFieldsISN(pIsnNumber);
            var section = editLPView.getEditInboudShipmentView(purchaseOrdersSearch, isnData, isnFields);
            return section;
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getEditInboundShipmentView = getEditInboundShipmentView;
    // Get the view of an error
    function getErrorPage(pErrorMessage, pSmallText) {
        return view.getErrorPage(pErrorMessage, pSmallText);
    }
    exports.getErrorPage = getErrorPage;
    // ------------------------------------------------------------------------
    // POST Functions
    // ------------------------------------------------------------------------
    // Update the data of the purchase order
    function updatePurchaseOrderData(pBody, pParameters) {
        var generalData = pBody.general;
        var linesData = pBody.lines;
        var generalComment = pBody.comment;
        var piFileContent = pBody.piFileContent;
        var loadPlanContent = pBody.loadPlanContent;
        var purchaseOrderID = pParameters.po;
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
    exports.updatePurchaseOrderData = updatePurchaseOrderData;
    // Mark the shipment as In Transit and upload the related files
    function markShipmentAsInTransit(pBody, pParameters) {
        var inboundShipmentID = pParameters.isn;
        var purchaseOrderID = pParameters.po;
        var filesContents = pBody.filesContents;
        var containerNumber = pBody.containerNumber;
        // Upload and attach the shipment related files
        var fileIDs = model.attachShipmentRelatedFiles(filesContents);
        // Store the file IDs on the approval request
        model.storeShipmentRelatedFilesIDs(purchaseOrderID, fileIDs);
        // Mark the Inbound Shipment as In Transit
        model.markShipmentAsInTransit(inboundShipmentID, purchaseOrderID, containerNumber, fileIDs);
    }
    exports.markShipmentAsInTransit = markShipmentAsInTransit;
    // Mark the shipment as In Transit and upload the related files
    function uploadShipmentFiles(pBody, pParameters) {
        var purchaseOrderID = pParameters.po;
        var filesContents = pBody.filesContents;
        // Upload and attach the shipment related files
        var fileIDs = model.attachShipmentRelatedFiles(filesContents);
        // Store the file IDs on the approval request
        model.storeShipmentRelatedFilesIDs(purchaseOrderID, fileIDs);
    }
    exports.uploadShipmentFiles = uploadShipmentFiles;
    // Reset the password on the contact record
    function resetPassword(pCookie, pPageID, pUserID, pPassword) {
        // Reset the password on the contact record
        model.resetPassword(pUserID, pPassword);
        // Get Vendor IDs using values from the cookies
        var vendors = model.getVendors(pCookie);
        // Get the data of the Pending Approval Requests
        var vendorApprovalRequestData = model.getVendorApprovalRequestsData(vendors);
        // Get the data of the Vendor
        var vendorData = vendors.length === 1 ? model.getVendorData(vendors[0]) : null;
        return resetPasswordView.getResetPasswordSuccessView(vendorData, vendorApprovalRequestData, pPageID);
    }
    exports.resetPassword = resetPassword;
    // Update the Purchase Order data after submission
    function updateETAData(pBody) {
        // Get params from request
        var generalData = pBody.general;
        var linesData = pBody.lines;
        var vendorID = generalData.vendorID;
        // Update the Purchase Order
        etaModel.updatePurchaseOrders(linesData, generalData, vendorID);
    }
    exports.updateETAData = updateETAData;
    // Save new inbound shipment on netsuite
    function saveLoadPlan(pbody) {
        log.debug("Body", pbody);
        createLPModel.saveLoadPlan(pbody);
    }
    exports.saveLoadPlan = saveLoadPlan;
    // Save new inbound shipment on netsuite
    function updateLoadPlan(pbody) {
        log.debug("Body", pbody);
        editLPModel.updateLoadPlan(pbody);
    }
    exports.updateLoadPlan = updateLoadPlan;
});
