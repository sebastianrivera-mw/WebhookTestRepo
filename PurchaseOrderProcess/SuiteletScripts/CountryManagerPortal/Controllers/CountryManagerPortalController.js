/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "../Models/CountryManagerPortalModel", "../Views/CountryManagerPortalView", "../../../Global/Constants"], function (require, exports, model, view, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get the view of a specific purchase order
    function getPurchaseOrderView(pApprovalRequestID, pUniqueKey, pPageID) {
        // Get the data of the specific Approval Request being accessed
        var approvalRequestData = model.getApprovalRequestData(pApprovalRequestID);
        var vendorID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR];
        var purchaseOrderID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
        if (vendorID && purchaseOrderID) {
            // Get the vendors related to the employee
            var vendors = model.getVendorsRelatedToEmp(pUniqueKey);
            // Get the data of all the Pending Approval Requests
            var pendingApprovalRequestData = model.getPendingApprovalRequestsData(vendors);
            // Get the data of the Purchase Order
            var purchaseOrderData = model.getPurchaseOrderData(vendorID, purchaseOrderID);
            var approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);
            // Return the view of a specific Purchase Order
            return view.getPurchaseOrderView(pendingApprovalRequestData, approvalRequestData, purchaseOrderData, approvalRequestCommentsData, pUniqueKey, pPageID);
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getPurchaseOrderView = getPurchaseOrderView;
    // Get the view of a specific inbound shipment
    function getInboundShipmentView(pApprovalRequestID, pInboundShipmentID, pUniqueKey, pPageID) {
        // Get the data of the specific Approval Request being accessed
        var approvalRequestData = model.getApprovalRequestData(pApprovalRequestID);
        var vendorID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR];
        var purchaseOrderID = approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
        if (vendorID && purchaseOrderID) {
            // Get the vendors related to the employee
            var vendors = model.getVendorsRelatedToEmp(pUniqueKey);
            // Get the data of all the Pending Approval Requests
            var pendingApprovalRequestData = model.getPendingApprovalRequestsData(vendors);
            // Get the data of the Inbound Shipment
            var inboundShipmentData = model.getInboundShipmentData(vendorID, pInboundShipmentID);
            var approvalRequestCommentsData = model.getApprovalRequestCommentsData(approvalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID]);
            // Return the view of a specific Purchase Order
            return view.getInboundShipmentView(pendingApprovalRequestData, approvalRequestData, inboundShipmentData, approvalRequestCommentsData, pUniqueKey);
        }
        else {
            var errorMessage = "Error: The link is not valid!";
            return view.getErrorPage(errorMessage, false);
        }
    }
    exports.getInboundShipmentView = getInboundShipmentView;
    // Get the view of the approval requests list
    function getApprovalRequestsView(pUniqueKey, pPageID) {
        // Get the vendors related to the employee
        var vendors = model.getVendorsRelatedToEmp(pUniqueKey);
        // Get the data of the Pending Approval Requests
        var pendingApprovalRequestData = model.getPendingApprovalRequestsData(vendors);
        // Return the view of the Pending Approval Requests
        return view.getPendingApprovalRequestsView(pendingApprovalRequestData, pUniqueKey, pPageID);
    }
    exports.getApprovalRequestsView = getApprovalRequestsView;
    // Get the view of the home page
    function getHomePageView(pUniqueKey) {
        // Get the vendors related to the employee
        var vendors = model.getVendorsRelatedToEmp(pUniqueKey);
        // Get the data of the Pending Approval Requests
        var pendingApprovalRequestData = model.getPendingApprovalRequestsData(vendors);
        // Return the view of the Pending Approval Requests
        return view.getHomePage(pendingApprovalRequestData, pUniqueKey);
    }
    exports.getHomePageView = getHomePageView;
    // Update the data of the purchase order
    function updatePurchaseOrderData(pBody, pParameters) {
        var generalData = pBody.general;
        var linesData = pBody.lines;
        var generalComment = pBody.comment;
        var purchaseOrderID = pParameters.po;
        if (linesData.length > 0) {
            model.updatePurchaseOrderData(purchaseOrderID, generalData, linesData, generalComment);
        }
    }
    exports.updatePurchaseOrderData = updatePurchaseOrderData;
    // Get the view of an error
    function getErrorPage(pErrorMessage, pSmallText) {
        return view.getErrorPage(pErrorMessage, pSmallText);
    }
    exports.getErrorPage = getErrorPage;
});
