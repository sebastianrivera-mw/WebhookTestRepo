/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "../Models/POPlannerPortalModel", "../Views/POPlannerPortalView", "../../../Global/Constants"], function (require, exports, model, view, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // ------------------------------------------------------------------------
    // GET Functions
    // ------------------------------------------------------------------------
    // Get the view of a specific purchase order
    function getPurchaseOrderView(pApprovalRequestID, pPageID) {
        // Get the data of the specific Approval Request being accessed
        var approvalRequestData = model.getApprovalRequestData(pApprovalRequestID);
        var vendorID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR];
        var purchaseOrderID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
        if (vendorID && purchaseOrderID) {
            // Get the data of all the Pending Approval Requests
            var pendingApprovalRequestData = model.getPendingApprovalRequestsData();
            // Get the data of the Purchase Order
            var purchaseOrderData = model.getPurchaseOrderData(vendorID, purchaseOrderID);
            var approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);
            // Return the view of a specific Purchase Order
            return view.getPurchaseOrderView(pendingApprovalRequestData, approvalRequestData, purchaseOrderData, approvalRequestCommentsData, pPageID);
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getPurchaseOrderView = getPurchaseOrderView;
    // Get the view of a specific inbound shipment
    function getInboundShipmentView(pApprovalRequestID, pInboundShipmentID, pPageID) {
        // Get the data of the specific Approval Request being accessed
        var approvalRequestData = model.getApprovalRequestData(pApprovalRequestID);
        var vendorID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR];
        var purchaseOrderID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
        if (vendorID && purchaseOrderID) {
            // Get the data of all the Pending Approval Requests
            var pendingApprovalRequestData = model.getPendingApprovalRequestsData();
            // Get the data of the Inbound Shipment
            var inboundShipmentData = model.getInboundShipmentData(vendorID, pInboundShipmentID);
            var approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);
            // Return the view of a specific Purchase Order
            return view.getInboundShipmentView(pendingApprovalRequestData, approvalRequestData, inboundShipmentData, approvalRequestCommentsData, pPageID);
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getInboundShipmentView = getInboundShipmentView;
    // Get the view of a specific page
    function getPageView(pPageID) {
        // Get the data of the Pending Approval Requests
        var pendingApprovalRequestData = model.getPendingApprovalRequestsData();
        // Return the view of the Pending Approval Requests
        return view.getPendingApprovalRequestsView(pendingApprovalRequestData, pPageID);
    }
    exports.getPageView = getPageView;
    // Get the view of the home page
    function getHomePageView() {
        // Get the data of the Pending Approval Requests
        var pendingApprovalRequestData = model.getPendingApprovalRequestsData();
        // Return the view of the Pending Approval Requests
        return view.getHomePage(pendingApprovalRequestData);
    }
    exports.getHomePageView = getHomePageView;
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
        var purchaseOrderID = pParameters.po;
        var piFileContent = pBody.piFileContent;
        var loadPlanContent = pBody.loadPlanContent;
        if (linesData && linesData.length > 0) {
            model.updatePurchaseOrderData(purchaseOrderID, generalData, linesData, generalComment);
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
    function uploadShipmentFiles(pBody, pParameters) {
        var purchaseOrderID = pParameters.po;
        var filesContents = pBody.filesContents;
        // Upload and attach the shipment related files
        var fileIDs = model.attachShipmentRelatedFiles(filesContents);
        // Store the file IDs on the approval request
        model.storeShipmentRelatedFilesIDs(purchaseOrderID, fileIDs);
    }
    exports.uploadShipmentFiles = uploadShipmentFiles;
});
