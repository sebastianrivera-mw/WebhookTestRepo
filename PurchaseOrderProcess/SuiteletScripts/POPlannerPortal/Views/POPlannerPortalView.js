/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "../Models/POPlannerPortalModel", "../../../Global/Constants", "../../../Global/Functions"], function (require, exports, model, constants, functions) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get the view of the Home Page
    function getHomePage(pPendingApprovalRequestData) {
        // Get the link to the home page
        var homePageLink = getHomePageLink();
        // Get the quantity of records by category
        var categoriesQuantities = getCategoriesQuantities(pPendingApprovalRequestData);
        return "\n        <head>\n            <title>PO Planner Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.GLOBAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.HOME.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.GLOBAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.HOME.JS) + "\"></script>\n        </head>\n        <div aria-live=\"polite\"  role=\"alert\" aria-atomic=\"true\" >\n            <div role=\"alert\" class=\"toast\" style=\"position: absolute; top: 5px; right: 5px; min-width: 200px;\" data-delay=\"10000\">\n                <div class=\"toast-header\" style=\"background-color: #FAD2D2;\">\n                <strong class=\"mr-auto\">Error</strong>\n                </div>\n                <div class=\"toast-body\" id=\"error-message\">\n                </div>\n            </div>\n        </div>\n        <div class=\"wrapper\">\n            <div class=\"sidebar-view\">\n                " + getSidebarView(pPendingApprovalRequestData) + "\n            </div>\n            <div class=\"body\">\n                <div class= \"header\">\n                    <div class=\"main-title\">\n                        <a href=\"" + homePageLink + "\" class=\"po-planner-portal-title\"><h3>PO Planner Portal</h3></a>\n                    </div>\n                    <div>\n                        <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n                    </div>\n                </div>\n                <div class=\"po-planner-portal home-page\">\n                    " + getCategoriesView(categoriesQuantities) + "\n                </div>\n            </div>\n        </div>\n    ";
    }
    exports.getHomePage = getHomePage;
    // Get the quantity of orders by category
    function getCategoriesQuantities(pPendingApprovalRequestData) {
        var processedApprovalRequests = [];
        var pendingVendor = 0;
        var pendingTOV = 0;
        var pendingPIFIle = 0;
        var pendingLoadPlan = 0;
        var pendingPartsOrders = 0;
        var approved = 0;
        for (var i = 0; i < pPendingApprovalRequestData.length; i++) {
            var approvalRequestID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID];
            var isApproved = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
            var PIFileUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
            var loadPlanUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
            var isnComplete = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
            var vendorOrTOVSide = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
            var isPartsOrder = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT];
            if (!isApproved && !isPartsOrder && vendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.VENDOR) {
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingVendor++ : {};
            }
            else if (!isApproved && !isPartsOrder && vendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.TOV) {
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingTOV++ : {};
            }
            else if (isApproved && !isPartsOrder && !PIFileUploaded) {
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingPIFIle++ : {};
            }
            else if (isApproved && !isPartsOrder && PIFileUploaded && (!loadPlanUploaded || !isnComplete)) {
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingLoadPlan++ : {};
            }
            else if (!isApproved && isPartsOrder) {
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingPartsOrders++ : {};
            }
            else if (isApproved && !isPartsOrder && PIFileUploaded && loadPlanUploaded && isnComplete) {
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? approved++ : {};
            }
            processedApprovalRequests.push(approvalRequestID);
        }
        return {
            "pendingVendor": pendingVendor,
            "pendingTOV": pendingTOV,
            "pendingPIFIle": pendingPIFIle,
            "pendingLoadPlan": pendingLoadPlan,
            "pendingPartsOrders": pendingPartsOrders,
            "approved": approved
        };
    }
    // Get the view of the navbar
    function getSidebarView(pPendingApprovalRequestData) {
        var searchItemsArray = getSearchItemsArray(pPendingApprovalRequestData, "home");
        var newVendorsReqScriptID = constants.SCRIPTS.NEW_VENDOR_REQUESTS.ID;
        var newVendorsReqDeployID = constants.SCRIPTS.NEW_VENDOR_REQUESTS.DEPLOY;
        var newVendorsReqURL = functions.getSuiteletURL(newVendorsReqScriptID, newVendorsReqDeployID, false);
        return "\n        <nav id=\"sidebar\">\n            <div class=\"sidebar-header\">\n                <div id=\"nav-icon\">\n                    <span></span>\n                    <span></span>\n                    <span></span>\n                </div>\n                <div id=\"search-icon\">\n                    <i class=\"fas fa-search\"></i>\n                </div>\n            </div>\n            <div id=\"sidebar-content-links\" class=\"sidebar-content\" style=\"display: none;\">\n                <ul class=\"sidebar-options\">\n                    <li>Vendor Information</li>\n                    <li>Purchase Order History</li>\n                    <li>Items Information</li>\n                    <li>Containers Information</li>\n                    <li><a href=\"" + newVendorsReqURL + "\">New Vendor Requests</a></li>\n                </ul>\n            </div>\n            <div id=\"sidebar-content-search\" class=\"sidebar-content\" style=\"display: none;\">\n                <div id=\"nav-bar-search-items-array\" style=\"display: none;\">" + JSON.stringify(searchItemsArray) + "</div>\n                <input id=\"nav-bar-search\" oninput=\"updateResult(this.value)\" type=\"search\" placeholder=\"Search\" />\n                <ul id=\"nav-bar-search-results\">\n                </ul>\n            </div>\n        </nav>\n    ";
    }
    // Get the items to use on the portal search
    function getSearchItemsArray(pPendingApprovalRequestData, pPageID) {
        var processedNames = [];
        var itemsObj = {
            "names": [],
            "data": {}
        };
        for (var i = 0; i < pPendingApprovalRequestData.length; i++) {
            var link = functions.getCurrentSuiteletURL(false);
            link = link + ("&id=" + pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID] + "&po=" + pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER]);
            (pPageID) ? link += "&page=" + pPageID : {};
            var name_1 = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] : '';
            if (processedNames.indexOf(name_1) === -1) {
                itemsObj["names"].push(name_1);
                itemsObj["data"][name_1] = {
                    "pageLink": link
                };
                processedNames.push(name_1);
            }
        }
        return itemsObj;
    }
    // Get the view of the categories grid
    function getCategoriesView(pCategoriesQuantities) {
        return "\n    <div class=\"categories\">\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.PENDING_VENDOR + "\">\n                <div class=\"circle pink\">\n                    " + (pCategoriesQuantities.pendingVendor === 0 ? "" : "\n                    <div class=\"circle-notification\">\n                        <span>" + pCategoriesQuantities.pendingVendor + "</span>\n                    </div>\n                    ") + "\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_VENDOR].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_VENDOR].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.PENDING_TOV + "\">\n                <div class=\"circle pink\">\n                    " + (pCategoriesQuantities.pendingTOV === 0 ? "" : "\n                    <div class=\"circle-notification\">\n                        <span>" + pCategoriesQuantities.pendingTOV + "</span>\n                    </div>\n                    ") + "\n                    <i class=\"tov-logo\">T O V</i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_TOV].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.PENDING_PI + "\">\n                <div class=\"circle pink\">\n                    " + (pCategoriesQuantities.pendingPIFIle === 0 ? "" : "\n                    <div class=\"circle-notification\">\n                        <span>" + pCategoriesQuantities.pendingPIFIle + "</span>\n                    </div>\n                    ") + "\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_PI].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_PI].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.PENDING_LOAD_PLAN + "\">\n                <div class=\"circle pink\">\n                    " + (pCategoriesQuantities.pendingLoadPlan === 0 ? "" : "\n                    <div class=\"circle-notification\">\n                        <span>" + pCategoriesQuantities.pendingLoadPlan + "</span>\n                    </div>\n                    ") + "\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_LOAD_PLAN].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_LOAD_PLAN].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.LOAD_PLANS + "\">\n                <div class=\"circle pink\">\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.LOAD_PLANS].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.LOAD_PLANS].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.PARTS_ORDERS + "\">\n                <div class=\"circle pink\">\n                    " + (pCategoriesQuantities.pendingPartsOrders === 0 ? "" : "\n                    <div class=\"circle-notification\">\n                        <span>" + pCategoriesQuantities.pendingPartsOrders + "</span>\n                    </div>") + "\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PARTS_ORDERS].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PARTS_ORDERS].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.APPROVED_ORDERS + "\">\n                <div class=\"circle pink\">\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.APPROVED_ORDERS].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.APPROVED_ORDERS].TITLE + "</span>\n            </div>\n        </div>\n    </div>\n    ";
    }
    // Get the view of the Pending Approval Requests
    function getPendingApprovalRequestsView(pPendingApprovalRequestData, pPageID) {
        // Get the data for the title based on the page that is being visited
        var titleData = getTitleData(pPageID);
        // Get the link to the home page
        var homePageLink = getHomePageLink();
        // Get the filters to show the orders regarding the page
        var ordersFilters = getOrdersFiltersForPage(pPageID);
        // Get the orders view
        var ordersView = "";
        if (ordersFilters.returnApprovedParts) {
            ordersView = getPartsOrdersListView(pPendingApprovalRequestData, pPageID);
        }
        else if (ordersFilters.returnLoadPlan) {
            ordersView = getShipmentsListView(pPendingApprovalRequestData, pPageID, ordersFilters);
        }
        else {
            ordersView = getOrdersListView(pPendingApprovalRequestData, pPageID, ordersFilters);
        }
        return "\n        <head>\n            <title>PO Planner Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.GLOBAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.GLOBAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.JS) + "\"></script>\n        </head>\n        <div aria-live=\"polite\"  role=\"alert\" aria-atomic=\"true\" >\n            <div role=\"alert\" class=\"toast\" style=\"position: absolute; top: 5px; right: 5px; min-width: 200px;\" data-delay=\"10000\">\n                <div class=\"toast-header\" style=\"background-color: #FAD2D2;\">\n                <strong class=\"mr-auto\">Error</strong>\n                </div>\n                <div class=\"toast-body\" id=\"error-message\">\n                </div>\n            </div>\n        </div>\n        <div class=\"wrapper\">\n            <div class=\"sidebar-view\">\n                " + getSidebarView(pPendingApprovalRequestData) + "\n            </div>\n            <div class=\"body\">\n                <div class= \"header\">\n                    <div class=\"main-title\">\n                        <a href=\"" + homePageLink + "\" class=\"po-planner-portal-title\"><h3>PO Planner Portal</h3></a>\n                        <div>\n                            " + getBackButton("Back") + "\n                        </div>\n                    </div>\n                    <div>\n                        <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n                    </div>\n                </div>\n                <div class=\"po-planner-portal\">\n                    <div class=\"category-title-wrapper " + (ordersFilters.returnApprovedParts ? 'parts-orders' : '') + "\">\n                        <div class=\"circle category-title pink\">\n                            " + titleData.icon + "\n                        </div>\n                        <span class=\"category-title\">" + titleData.title + "</span>\n                    </div>\n                    " + (ordersFilters.returnLoadPlan ? "\n                        " + filterForShipmentsView() + "\n                    " : "") + "\n                    <div id=\"category-lines-wrapper\">\n                        " + ordersView + "\n                    </div>\n                </div>\n            </div>\n        </div>\n    ";
    }
    exports.getPendingApprovalRequestsView = getPendingApprovalRequestsView;
    // Get the data for the title based on the page that is being visited
    function getTitleData(pPageID) {
        var title = constants.TITLE_DATA_BY_CATEGORY[pPageID].TITLE;
        var icon;
        if (pPageID === constants.PAGES_IDS.PENDING_TOV) {
            icon = '<i class="tov-logo">T O V</i>';
        }
        else {
            icon = "<i class=\"" + constants.TITLE_DATA_BY_CATEGORY[pPageID].ICON_CLASS + "\"></i>";
        }
        return {
            "title": title,
            "icon": icon
        };
    }
    // Get the filters to show the orders regarding the page
    function getOrdersFiltersForPage(pPageID) {
        var vendorOrTOVSide = null;
        var returnPendingPIFile = false;
        var returnPendingLoadPlan = false;
        var returnLoadPlan = false;
        var returnApproved = false;
        var returnApprovedParts = false;
        switch (pPageID) {
            case (constants.PAGES_IDS.PENDING_VENDOR):
                vendorOrTOVSide = constants.VENDOR_OR_TOV_TEXT.VENDOR;
                break;
            case (constants.PAGES_IDS.PENDING_TOV):
                vendorOrTOVSide = constants.VENDOR_OR_TOV_TEXT.TOV;
                break;
            case (constants.PAGES_IDS.PENDING_PI):
                returnPendingPIFile = true;
                break;
            case (constants.PAGES_IDS.PENDING_LOAD_PLAN):
                returnPendingLoadPlan = true;
                break;
            case (constants.PAGES_IDS.LOAD_PLANS):
                returnLoadPlan = true;
                break;
            case (constants.PAGES_IDS.APPROVED_ORDERS):
                returnApproved = true;
                break;
            case (constants.PAGES_IDS.PARTS_ORDERS):
                returnApprovedParts = true;
                break;
            default:
                break;
        }
        return {
            "vendorOrTOVSide": vendorOrTOVSide,
            "returnPendingPIFile": returnPendingPIFile,
            "returnPendingLoadPlan": returnPendingLoadPlan,
            "returnLoadPlan": returnLoadPlan,
            "returnApproved": returnApproved,
            "returnApprovedParts": returnApprovedParts
        };
    }
    // Create the filters for the shipments page
    function filterForShipmentsView() {
        return "\n    <div id=\"orders-search-wrapper\" class=\"orders-search-wrapper\">\n        <label for=\"orders-search-input\" class=\"orders-search-label\">ISN #</label>\n        <input id=\"orders-search-input\" name=\"orders-search-input\" onkeyup=\"updateOrdersSearchResult('isnNumber', '.order-name span')\" type=\"search\" placeholder=\"Search\" />\n        <label for=\"vendor-search-input\" class=\"orders-search-label\">Vendor</label>\n        <input id=\"vendor-search-input\" name=\"vendor-search-input\" onkeyup=\"updateOrdersSearchResult('vendor', '.order-vendor span')\" type=\"search\" placeholder=\"Search\" />\n        <label for=\"booking-status-filter\" class=\"orders-search-label\">Booking Status</label>\n        <select id=\"booking-status-filter\" onchange=\"updateOrdersSearchResult('bookingStatus', '.order-booking-status span')\">\n            <option value=\"none\"></option>\n            <option value=\"booking-approved\">Booking Approved</option>\n            <option value=\"booking-denied\">Booking Denied-Pending changes</option>\n            <option value=\"pending-booking\">Pending Booking</option>\n        </select>\n    </div>\n    ";
    }
    // Get the list of orders based on some filters
    function getOrdersListView(pPendingApprovalRequestData, pPageID, pFilters) {
        var processedApprovalRequests = [];
        var ordersRows = '';
        for (var i = 0; i < pPendingApprovalRequestData.length; i++) {
            var approvalRequestID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID];
            var approved = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
            var PIFileUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
            var loadPlanUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
            var isnComplete = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
            var vendorOrTOVSide = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
            var isPartsOrder = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT];
            // Return the orders regarding the filters of the page
            var noApprovedCondition = !pFilters.returnApproved && !isPartsOrder && !approved && vendorOrTOVSide === pFilters.vendorOrTOVSide;
            var pendingPIFileCondition = pFilters.returnPendingPIFile && !isPartsOrder && approved && !PIFileUploaded;
            var pendingLoadPlanCondition = pFilters.returnPendingLoadPlan && !isPartsOrder && approved && PIFileUploaded && (!loadPlanUploaded || !isnComplete);
            var loadPlanCondition = pFilters.returnLoadPlan && !isPartsOrder && approved && PIFileUploaded && loadPlanUploaded && isnComplete;
            var approvedCondition = pFilters.returnApproved && !isPartsOrder && approved && PIFileUploaded && loadPlanUploaded && isnComplete;
            if (processedApprovalRequests.indexOf(approvalRequestID) === -1 && !loadPlanCondition) {
                processedApprovalRequests.push(approvalRequestID);
                var purchaseOrderID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
                var link = functions.getCurrentSuiteletURL(false) + "&id=" + approvalRequestID + "&po=" + purchaseOrderID + "&page=" + pPageID;
                var date = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE] ? String(pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE]).split(' ')[0] : '';
                var purchaseOrderName = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] : '';
                var expectedShipDate = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] : '';
                var shipAddressee = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE] ? String(pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE]).replace(' Stock', '') : '';
                var total = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.TOTAL] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.TOTAL] : '';
                var approvalStatus = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] : '';
                var vendorName = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] : '';
                if (noApprovedCondition || pendingPIFileCondition || pendingLoadPlanCondition || approvedCondition) {
                    var isDropship = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_DROPSHIP];
                    var isRenegade = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_RENEGADE];
                    var nonRegularOrderSpan = '';
                    if (isDropship) {
                        nonRegularOrderSpan = '<span class="dropship-order">Dropship</span>';
                    }
                    else if (isRenegade) {
                        nonRegularOrderSpan = "<img style=\"width: 35px;\" src=\"" + constants.RENEGADE_LOGO_URL + "\"></img>";
                    }
                    ordersRows += "\n                <tr class=\"item-line\">\n                    <td class=\"order-link\"> <a class=\"view-order-link\" href=\"" + link + "\">View</a> </td>\n                    <td class=\"order-date\"> <span>" + date + "</span> </td>\n                    <td class=\"order-name\"> <span>" + purchaseOrderName + "</span> </td>\n                    <td class=\"order-ship-date\"> <span>" + expectedShipDate + "</span> </td>\n                    <td class=\"order-shipaddres\"> <span>" + shipAddressee + "</span> </td>\n                    <td class=\"order-total\"> <span>$" + total + "</span> </td>\n                    <td class=\"order-approval-status\"> <span>" + approvalStatus + "</span> </td>\n                    <td class=\"order-vendor\"> <span>" + vendorName + "</span> </td>\n                    " + (nonRegularOrderSpan ? "<td class=\"order-is-nonregular\"> " + nonRegularOrderSpan + " </td>" : '<td></td>') + "\n                </tr>\n                ";
                }
            }
        }
        var ordersView = ordersRows.length > 0 ? "\n    <div class=\"table-responsive po-planner-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th><span>Date</span></th>\n                    <th><span>PO #</span></th>\n                    <th><span>Expected Ready Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Amount</span></th>\n                    <th><span>Approval Status</span></th>\n                    <th><span>Vendor</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + ordersRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Orders Here! </h5>";
        return ordersView;
    }
    // Get the list of orders based on some filters
    function getPartsOrdersListView(pPendingApprovalRequestData, pPageID) {
        var processedApprovalRequests = [];
        var unapprovedOrdersRows = '';
        var approvedOrdersRows = '';
        var shippedOrdersRows = '';
        for (var i = 0; i < pPendingApprovalRequestData.length; i++) {
            var approvalRequestID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID];
            var approved = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
            var isnComplete = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
            var vendorOrTOVSide = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
            var isPartsOrder = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT];
            var isnShipped = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED];
            if (processedApprovalRequests.indexOf(approvalRequestID) === -1) {
                processedApprovalRequests.push(approvalRequestID);
                var purchaseOrderID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
                var link = functions.getCurrentSuiteletURL(false) + "&id=" + approvalRequestID + "&po=" + purchaseOrderID + "&page=" + pPageID;
                var date = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE] ? String(pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE]).split(' ')[0] : '';
                var purchaseOrderName = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] : '';
                var expectedShipDate = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] : '';
                var shipAddressee = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE] ? String(pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE]).replace(' Stock', '') : '';
                var total = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.TOTAL] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.TOTAL] : '';
                var approvalStatus = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] : '';
                var vendorName = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] : '';
                if (isPartsOrder) {
                    var partsShipMethod = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_PARTS_SHIP_METHOD] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_PARTS_SHIP_METHOD] : '';
                    var orderStatus = isnShipped ? "Shipped" : isnComplete ? "Completed" : "Pending";
                    var row = "\n                <tr class=\"item-line\">\n                    <td class=\"order-link\"> <a class=\"view-order-link\" href=\"" + link + "\">View</a> </td>\n                    <td class=\"order-date\"> <span>" + date + "</span> </td>\n                    <td class=\"order-name\"> <span>" + purchaseOrderName + "</span> </td>\n                    <td class=\"order-ship-date\"> <span>" + expectedShipDate + "</span> </td>\n                    <td class=\"order-shipaddres\"> <span>" + shipAddressee + "</span> </td>\n                    <td class=\"order-total\"> <span>$" + total + "</span> </td>\n                    <td class=\"order-approval-status\"> <span>" + approvalStatus + "</span> </td>\n                    <td> <span>" + partsShipMethod + "</span> </td>\n                    <td> <span>" + orderStatus + "</span> </td>\n                    <td class=\"order-vendor\"> <span>" + vendorName + "</span> </td>\n                    " + (!approved ? "<td class=\"order-vendor-tov-side\"> <span>" + vendorOrTOVSide + "</span> </td>" : "") + "\n                </tr>";
                    if (!approved) {
                        unapprovedOrdersRows += row;
                    }
                    else if (approved && !isnShipped) {
                        approvedOrdersRows += row;
                    }
                    else if (approved && isnShipped) {
                        shippedOrdersRows += row;
                    }
                }
            }
        }
        // Not approved orders view
        var unapprovedOrdersView = unapprovedOrdersRows.length > 0 ? "\n    <div class=\"table-responsive po-planner-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th><span>Date</span></th>\n                    <th><span>PO #</span></th>\n                    <th><span>Expected Ready Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Amount</span></th>\n                    <th><span>Approval Status</span></th>\n                    <th><span>Ship Method</span></th>\n                    <th><span>Status</span></th>\n                    <th><span>Vendor</span></th>\n                    <th><span>Pending Action</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + unapprovedOrdersRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Orders Here! </h5>";
        // Approved orders view
        var approvedOrdersView = approvedOrdersRows.length > 0 ? "\n    <div class=\"table-responsive po-planner-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th><span>Date</span></th>\n                    <th><span>PO #</span></th>\n                    <th><span>Expected Ready Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Amount</span></th>\n                    <th><span>Approval Status</span></th>\n                    <th><span>Ship Method</span></th>\n                    <th><span>Status</span></th>\n                    <th><span>Vendor</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + approvedOrdersRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Orders Here! </h5>";
        // Shipped orders view
        var shippedOrdersView = shippedOrdersRows.length > 0 ? "\n    <div class=\"table-responsive po-planner-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th><span>Date</span></th>\n                    <th><span>PO #</span></th>\n                    <th><span>Expected Ready Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Amount</span></th>\n                    <th><span>Approval Status</span></th>\n                    <th><span>Ship Method</span></th>\n                    <th><span>Status</span></th>\n                    <th><span>Vendor</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + shippedOrdersRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Orders Here! </h5>";
        // Return the complete parts orders list view
        var partsOrdersListView = "\n    <div id=\"parts-order-tables-area\">\n        <nav>\n            <div class=\"nav nav-tabs\" id=\"nav-tab\" role=\"tablist\">\n                <a class=\"nav-item nav-link active\" id=\"nav-pending-approval-tab\" data-toggle=\"tab\" href=\"#nav-pending-approval\" role=\"tab\" aria-controls=\"nav-pending-approval\" aria-selected=\"true\">Pending Approval</a>\n                <a class=\"nav-item nav-link\" id=\"nav-approved-tab\" data-toggle=\"tab\" href=\"#nav-approved\" role=\"tab\" aria-controls=\"nav-approved\" aria-selected=\"true\">Approved</a>\n                <a class=\"nav-item nav-link\" id=\"nav-shipped-tab\" data-toggle=\"tab\" href=\"#nav-shipped\" role=\"tab\" aria-controls=\"nav-shipped\" aria-selected=\"true\">Shipped</a>\n            </div>\n        </nav>\n        <div class=\"tab-content\" id=\"nav-tabContent\">\n            <div class=\"tab-pane fade show parts-order-tab-pane active\" id=\"nav-pending-approval\" role=\"tabpanel\" aria-labelledby=\"nav-pending-approval-tab\">\n                " + unapprovedOrdersView + "\n            </div>\n            <div class=\"tab-pane fade show parts-order-tab-pane\" id=\"nav-approved\" role=\"tabpanel\" aria-labelledby=\"nav-approved-tab\">\n                " + approvedOrdersView + "\n            </div>\n            <div class=\"tab-pane fade show parts-order-tab-pane\" id=\"nav-shipped\" role=\"tabpanel\" aria-labelledby=\"nav-shipped-tab\">\n                " + shippedOrdersView + "\n            </div>\n        </div>\n    </div>\n    ";
        return partsOrdersListView;
    }
    // Get the list of shipments based on some filters
    function getShipmentsListView(pPendingApprovalRequestData, pPageID, pFilters) {
        var processedInboundShipments = [];
        var toBeShippedShipRows = '';
        var inTransitShipRows = '';
        var partReceivedShipRows = '';
        var receivedShipRows = '';
        var closedShipRows = '';
        for (var i = 0; i < pPendingApprovalRequestData.length; i++) {
            // Get data of the approval request
            var approved = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
            var PIFileUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
            var loadPlanUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
            var isnComplete = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
            var isPartsOrder = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT];
            var inboundShipmentID = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.ISN_INTERNALID];
            // Return the orders regarding the filters of the page
            var loadPlanCondition = pFilters.returnLoadPlan && !isPartsOrder && approved && PIFileUploaded && loadPlanUploaded && isnComplete;
            if (loadPlanCondition && inboundShipmentID && processedInboundShipments.indexOf(inboundShipmentID) === -1) {
                processedInboundShipments.push(inboundShipmentID);
                // Get data of the shipments
                var purchaseOrderID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
                var link = functions.getCurrentSuiteletURL(false);
                link = link + ("&id=" + pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID] + "&po=" + pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER] + "&isn=" + inboundShipmentID);
                (pPageID) ? link += "&page=" + pPageID : {};
                var inboundShipmentNumber = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_NUMBER];
                var currentReadyDate = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.CURRENT_READY_DATE];
                var confirmedDepartureDate = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.CONFIRMED_DEPARTURE_DATE];
                var destination = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.DESTINATION_LOCATION];
                var bookingStatus = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.BOOKING_STATUS];
                var shipmentStatus = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_STATUS];
                var vendor = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR];
                // Add the shipment to the orders view
                var row = "\n            <tr class=\"item-line\">\n                <td class=\"order-link\"> <a class=\"view-order-link\" href=\"" + link + "\">View</a> </td>\n                <td class=\"order-name\"> <span>" + inboundShipmentNumber + "</span> </td>\n                <td class=\"order-date\"> <span>" + currentReadyDate + "</span> </td>\n                <td class=\"departure-date\"> <span>" + confirmedDepartureDate + "</span> </td>\n                <td class=\"order-destination\"> <span>" + destination + "</span> </td>\n                <td class=\"order-booking-status\"> <span>" + bookingStatus + "</span> </td>\n                <td class=\"order-shipment-status\"> <span>" + shipmentStatus + "</span> </td>\n                <td class=\"order-vendor\"> <span>" + vendor + "</span> </td>\n            </tr>\n            ";
                if (shipmentStatus === "To Be Shipped") {
                    toBeShippedShipRows += row;
                }
                else if (shipmentStatus === "In Transit") {
                    inTransitShipRows += row;
                }
                else if (shipmentStatus === "Partially Received") {
                    partReceivedShipRows += row;
                }
                else if (shipmentStatus === "Received") {
                    receivedShipRows += row;
                }
                else if (shipmentStatus === "Closed") {
                    closedShipRows += row;
                }
            }
        }
        // To be shipped view
        var toBeShippedShipView = toBeShippedShipRows.length > 0 ? "\n    <div class=\"table-responsive po-planner-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th><span>ISN #</span></th>\n                    <th><span>Current Ready Date</span></th>\n                    <th><span>Confirmed Departure Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Booking Status</span></th>\n                    <th><span>Shipment Status</span></th>\n                    <th><span>Vendor</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + toBeShippedShipRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Shipments Here! </h5>";
        // In transit view
        var inTransitShipView = inTransitShipRows.length > 0 ? "\n    <div class=\"table-responsive po-planner-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th><span>ISN #</span></th>\n                    <th><span>Current Ready Date</span></th>\n                    <th><span>Confirmed Departure Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Booking Status</span></th>\n                    <th><span>Shipment Status</span></th>\n                    <th><span>Vendor</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + inTransitShipRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Shipments Here! </h5>";
        // Partially received view
        var partReceivedShipView = partReceivedShipRows.length > 0 ? "\n    <div class=\"table-responsive po-planner-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th><span>ISN #</span></th>\n                    <th><span>Current Ready Date</span></th>\n                    <th><span>Confirmed Departure Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Booking Status</span></th>\n                    <th><span>Shipment Status</span></th>\n                    <th><span>Vendor</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + partReceivedShipRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Shipments Here! </h5>";
        // Received view
        var receivedShipView = receivedShipRows.length > 0 ? "\n    <div class=\"table-responsive po-planner-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th><span>ISN #</span></th>\n                    <th><span>Current Ready Date</span></th>\n                    <th><span>Confirmed Departure Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Booking Status</span></th>\n                    <th><span>Shipment Status</span></th>\n                    <th><span>Vendor</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + receivedShipRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Shipments Here! </h5>";
        // Closed view
        var closedShipView = closedShipRows.length > 0 ? "\n    <div class=\"table-responsive po-planner-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th><span>ISN #</span></th>\n                    <th><span>Current Ready Date</span></th>\n                    <th><span>Confirmed Departure Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Booking Status</span></th>\n                    <th><span>Shipment Status</span></th>\n                    <th><span>Vendor</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + closedShipRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Shipments Here! </h5>";
        // Return the complete parts orders list view
        var shipmentsListView = "\n    <div id=\"load-plans-tables-area\">\n        <nav>\n            <div class=\"nav nav-tabs\" id=\"nav-tab\" role=\"tablist\">\n                <a class=\"nav-item nav-link active\" id=\"nav-to-be-shipped-tab\" data-toggle=\"tab\" href=\"#nav-to-be-shipped\" role=\"tab\" aria-controls=\"nav-to-be-shipped\" aria-selected=\"true\">To Be Shipped</a>\n                <a class=\"nav-item nav-link\" id=\"nav-in-transit-tab\" data-toggle=\"tab\" href=\"#nav-in-transit\" role=\"tab\" aria-controls=\"nav-in-transit\" aria-selected=\"true\">In Transit</a>\n                <a class=\"nav-item nav-link\" id=\"nav-partially-received-tab\" data-toggle=\"tab\" href=\"#nav-partially-received\" role=\"tab\" aria-controls=\"nav-partially-received\" aria-selected=\"true\">Partially Received</a>\n                <a class=\"nav-item nav-link\" id=\"nav-received-tab\" data-toggle=\"tab\" href=\"#nav-received\" role=\"tab\" aria-controls=\"nav-received\" aria-selected=\"true\">Received</a>\n                <a class=\"nav-item nav-link\" id=\"nav-closed-tab\" data-toggle=\"tab\" href=\"#nav-closed\" role=\"tab\" aria-controls=\"nav-closed\" aria-selected=\"true\">Closed</a>\n            </div>\n        </nav>\n        <div class=\"tab-content\" id=\"nav-tabContent\">\n            <div class=\"tab-pane fade show shipment-tab-pane active\" id=\"nav-to-be-shipped\" role=\"tabpanel\" aria-labelledby=\"nav-to-be-shipped-tab\">\n                " + toBeShippedShipView + "\n            </div>\n            <div class=\"tab-pane fade show shipment-tab-pane\" id=\"nav-in-transit\" role=\"tabpanel\" aria-labelledby=\"nav-in-transit-tab\">\n                " + inTransitShipView + "\n            </div>\n            <div class=\"tab-pane fade show shipment-tab-pane\" id=\"nav-partially-received\" role=\"tabpanel\" aria-labelledby=\"nav-partially-received-tab\">\n                " + partReceivedShipView + "\n            </div>\n            <div class=\"tab-pane fade show shipment-tab-pane\" id=\"nav-received\" role=\"tabpanel\" aria-labelledby=\"nav-received-tab\">\n                " + receivedShipView + "\n            </div>\n            <div class=\"tab-pane fade show shipment-tab-pane\" id=\"nav-closed\" role=\"tabpanel\" aria-labelledby=\"nav-closed-tab\">\n                " + closedShipView + "\n            </div>\n        </div>\n    </div>\n    ";
        return shipmentsListView;
    }
    // Get the view of a specific Purchase Order
    function getPurchaseOrderView(pPendingApprovalRequestData, pApprovalRequestData, pPurchaseOrderData, pApprovalRequestCommentsData, pPageID) {
        var approvalID = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.INTERNALID];
        var requestApproved = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED];
        var vendorOrTOVSide = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
        var PIFileUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
        var loadPlanUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
        var isnComplete = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        var PIFile = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE];
        var loadPlan = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN];
        var relatedInbounds = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS];
        var isDropship = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER];
        var homePageLink = getHomePageLink();
        var isPendingLoadPlanPage = pPageID === "pending-load-plan";
        return "\n        <head>\n            <title>PO Planner Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.GLOBAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.GLOBAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.JS) + "\"></script>\n        </head>\n        <div aria-live=\"polite\"  role=\"alert\" aria-atomic=\"true\" >\n            <div role=\"alert\" class=\"toast\" style=\"position: absolute; top: 5px; right: 5px; min-width: 200px;\" data-delay=\"10000\">\n                <div class=\"toast-header\" style=\"background-color: #FAD2D2;\">\n                <strong class=\"mr-auto\">Error</strong>\n                </div>\n                <div class=\"toast-body\" id=\"error-message\">\n                </div>\n            </div>\n        </div>\n        <div class=\"wrapper\">\n            <div class=\"sidebar-view\">\n                " + getSidebarView(pPendingApprovalRequestData) + "\n            </div>\n            <div class=\"body\">\n                <div class=\"header\">\n                    <div class=\"main-title\">\n                        <a href=\"" + homePageLink + "\" class=\"po-planner-portal-title\"><h3>PO Planner Portal</h3></a>\n                        <span class=\"vendor-header\">" + pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME] + "</span>\n                        <div>\n                            " + getBackButton("Back") + "\n                        </div>\n                    </div>\n                    <div>\n                    " + (pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO] ?
            "<div>\n                            <img class=\"vendor-logo\" src=\"" + functions.getFileUrl(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO]) + "\">\n                        </div>"
            : "") + "\n                    </div>\n                    <div>\n                        <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n                    </div>\n                </div>\n                <div class=\"po-planner-portal\">\n                    <div class=\"summary-area\">\n                        " + getSummaryView(pPurchaseOrderData, pApprovalRequestData, requestApproved) + "\n                    </div>\n                    " + getMainButtonsView(requestApproved, vendorOrTOVSide, PIFileUploaded, loadPlanUploaded, isnComplete) + "\n                    <div id=\"items-area\">\n                        " + getItemsView(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.ITEMS], isPendingLoadPlanPage) + "\n                    </div>\n                    <div id=\"general-comment-area\">\n                        <p><strong>General Comment:</strong></p>\n                        <p id=\"general-comment-body\"></p>\n                    </div>\n                    <div id=\"comments-area\">\n                        <nav>\n                            <div class=\"nav nav-tabs\" id=\"nav-tab\" role=\"tablist\">\n                                <a class=\"nav-item nav-link active\" id=\"nav-last-tab\" data-toggle=\"tab\" href=\"#nav-last\" role=\"tab\" aria-controls=\"nav-last\" aria-selected=\"true\">Last Message</a>\n                                <a class=\"nav-item nav-link\" id=\"nav-history-tab\" data-toggle=\"tab\" href=\"#nav-history\" role=\"tab\" aria-controls=\"nav-history\" aria-selected=\"false\">Interaction History</a>\n                                <a class=\"nav-item nav-link\" id=\"nav-related-isn-tab\" data-toggle=\"tab\" href=\"#nav-related-isn\" role=\"tab\" aria-controls=\"nav-related-isn\" aria-selected=\"false\">Load Plans</a>\n                                " + (PIFileUploaded ? "<a class=\"nav-item nav-link\" id=\"nav-pi-file-tab\" data-toggle=\"tab\" href=\"#nav-pi-file\" role=\"tab\" aria-controls=\"nav-pi-file\" aria-selected=\"false\">PI File</a>" : "") + "\n                                " + (loadPlanUploaded && !isDropship ? "<a class=\"nav-item nav-link\" id=\"nav-load-plan-file-tab\" data-toggle=\"tab\" href=\"#nav-load-plan-file\" role=\"tab\" aria-controls=\"nav-load-plan-file\" aria-selected=\"false\">Load Plan File</a>" : "") + "\n                            </div>\n                        </nav>\n                        <div class=\"tab-content\" id=\"nav-tabContent\">\n                            " + getLastCommentView(pApprovalRequestCommentsData[0]) + "\n                            " + getCommentsInteractionView(pApprovalRequestCommentsData) + "\n                            " + getRelatedInboundView({
            inboundShipmentData: relatedInbounds,
            poId: pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER],
            approvalID: approvalID,
            pageID: pPageID
        }) + "\n                            " + (PIFileUploaded ? getPIFileView(PIFile) : "") + "\n                            " + (loadPlanUploaded && !isDropship ? getLoadPlanFileView(loadPlan) : "") + "\n                        </div>\n                    </div>\n                    <div class=\"terms-and-conditions-area\">\n                        <div class=\"terms-and-conditions-title\">\n                            " + constants.TERMS_AND_CONDITIONS.TITLE + "\n                        </div>\n                        <div class=\"terms-and-conditions-text\">\n                            " + constants.TERMS_AND_CONDITIONS.TEXT + "\n                        </div>\n                    </div>\n                    " + getViewCommentModal() + "\n                    " + getAddGeneralCommentModal() + "\n                    " + getShipdateChangeReasonModal() + "\n                    " + getLoadingModal() + "\n                    " + getUploadPIFileModal() + "\n                    " + getUploadLoadPlanModal() + "\n                </div>\n            </div>\n        </div>\n    ";
    }
    exports.getPurchaseOrderView = getPurchaseOrderView;
    // Get the view of a specific Purchase Order
    function getInboundShipmentView(pPendingApprovalRequestData, pApprovalRequestData, pInboundShipmentData, pApprovalRequestCommentsData, pPageID) {
        var requestApproved = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED];
        var vendorOrTOVSide = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
        var PIFileUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
        var loadPlanUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
        var isnComplete = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        var shipmentRelatedFiles = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES];
        var homePageLink = getHomePageLink();
        return "\n        <head>\n            <title>PO Planner Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.GLOBAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.GLOBAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.JS) + "\"></script>\n        </head>\n        <div aria-live=\"polite\"  role=\"alert\" aria-atomic=\"true\" >\n            <div role=\"alert\" class=\"toast\" style=\"position: absolute; top: 5px; right: 5px; min-width: 200px;\" data-delay=\"10000\">\n                <div class=\"toast-header\" style=\"background-color: #FAD2D2;\">\n                <strong class=\"mr-auto\">Error</strong>\n                </div>\n                <div class=\"toast-body\" id=\"error-message\">\n                </div>\n            </div>\n        </div>\n        <div class=\"wrapper\">\n            <div class=\"sidebar-view\">\n                " + getSidebarView(pPendingApprovalRequestData) + "\n            </div>\n            <div class=\"body\">\n                <div class=\"header\">\n                    <div class=\"main-title\">\n                        <a href=\"" + homePageLink + "\" class=\"po-planner-portal-title\"><h3>PO Planner Portal</h3></a>\n                        <span class=\"vendor-header\">" + pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME] + "</span>\n                        <div>\n                            " + getBackButton("Back") + "\n                        </div>\n                    </div>\n                    <div>\n                    " + (pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.LOGO] ?
            "<div>\n                            <img class=\"vendor-logo\" src=\"" + functions.getFileUrl(pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.LOGO]) + "\">\n                        </div>"
            : "") + "\n                    </div>\n                    <div>\n                        <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n                    </div>\n                </div>\n                <div class=\"po-planner-portal\">\n                    <div class=\"summary-area\">\n                        " + getInboundShipmentSummaryView(pInboundShipmentData, pApprovalRequestData, requestApproved) + "\n                    </div>\n                    <div id=\"items-area\">\n                        " + getInboundShipmentItemsView(pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.ITEMS]) + "\n                    </div>\n                    <div id=\"general-comment-area\">\n                        <p><strong>General Comment:</strong></p>\n                        <p id=\"general-comment-body\"></p>\n                    </div>\n                    <div id=\"comments-area\">\n                        <nav>\n                            <div class=\"nav nav-tabs\" id=\"nav-tab\" role=\"tablist\">\n                                <a class=\"nav-item nav-link active\" id=\"nav-last-tab\" data-toggle=\"tab\" href=\"#nav-last\" role=\"tab\" aria-controls=\"nav-last\" aria-selected=\"true\">Last Message</a>\n                                <a class=\"nav-item nav-link\" id=\"nav-history-tab\" data-toggle=\"tab\" href=\"#nav-history\" role=\"tab\" aria-controls=\"nav-history\" aria-selected=\"false\">Interaction History</a>\n                                " + (shipmentRelatedFiles.length > 0 ? "<a class=\"nav-item nav-link\" id=\"nav-shipment-files-tab\" data-toggle=\"tab\" href=\"#nav-shipment-files\" role=\"tab\" aria-controls=\"nav-shipment-files\" aria-selected=\"false\">Shipment Related Files</a>" : "") + "\n                            </div>\n                        </nav>\n                        <div class=\"tab-content\" id=\"nav-tabContent\">\n                            " + getLastCommentView(pApprovalRequestCommentsData[0]) + "\n                            " + getCommentsInteractionView(pApprovalRequestCommentsData) + "\n                            " + (shipmentRelatedFiles.length > 0 ? getShipmentRelatedFilesView(JSON.parse(shipmentRelatedFiles)) : "") + "\n                        </div>\n                    </div>\n                    <div class=\"terms-and-conditions-area\">\n                        <div class=\"terms-and-conditions-title\">\n                            " + constants.TERMS_AND_CONDITIONS.TITLE + "\n                        </div>\n                        <div class=\"terms-and-conditions-text\">\n                            " + constants.TERMS_AND_CONDITIONS.TEXT + "\n                        </div>\n                    </div>\n                    " + getViewCommentModal() + "\n                    " + getUploadRelatedShipmentFilesModal() + "\n                    " + getLoadingModal() + "\n                </div>\n            </div>\n        </div>\n    ";
    }
    exports.getInboundShipmentView = getInboundShipmentView;
    // Get the link to the home page
    function getHomePageLink() {
        var link = functions.getCurrentSuiteletURL(false);
        return link;
    }
    // Get the Back button
    function getBackButton(pButtonText) {
        return "<a onclick=\"getBackLink()\" class=\"btn btn-light go-back-link\">" + pButtonText + "</a>";
    }
    // Get the summary view for Purchase Orders
    function getSummaryView(pPurchaseOrderData, pApprovalRequestData, pRequestApproved) {
        var shipAddress = pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SHIPADDRESS];
        var shipMethod = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.PARTS_SHIP_METHOD];
        var newShipDate = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE];
        var lastShipDate = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE];
        var shipDateChangeReason = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON];
        var subTotal = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SUBTOTAL]);
        var vendorDiscount = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_DISCOUNT]);
        var total = pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL];
        var cbm = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM]);
        var containerCount = Math.ceil(cbm / constants.GENERAL.CONTAINER_COUNT_LIMIT);
        var isReplacement = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT];
        var isDropship = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER];
        var isRenegade = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO];
        var summaryView = "\n    <div>\n        <span class=\"po-number\"> " + pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TRANID] + " - " + pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME] + "</span>\n        " + (isReplacement ? "\n        <div class=\"order-is-replacement\">\n            <span class=\"parts-order\">Parts</span>\n        </div>\n        " : "") + "\n        " + (isDropship ? "\n        <div class=\"order-is-dropship\">\n            <span class=\"dropship-order\">Dropship</span>\n        </div>\n        " : "") + "\n        " + (isRenegade ? "\n        <div class=\"order-is-renegade\">\n            <img style=\"width: 35px; margin: 0 10px 0 0;\" src=\"" + constants.RENEGADE_LOGO_URL + "\"></img>\n        </div>\n        " : "") + "\n        " + (pRequestApproved ? "\n        <div class=\"order-is-approved\">\n            <div class=\"alert alert-success\" role=\"alert\">\n                This order is already approved!\n            </div>\n        </div>\n    " : "") + "\n    </div>\n    <div class=\"summary-tables-section\">\n        " + (pRequestApproved ? "" : "\n        <button type=\"button\" class=\"btn btn-danger btn-edit-shipdate\" style=\"display: block;\"><i class=\"far fa-edit\"></i></button>\n        <button type=\"button\" class=\"btn btn-success btn-sm btn-accept-change-shipdate\" style=\"display: none;\"><i class=\"fas fa-check\"></i></button>\n        <button type=\"button\" class=\"btn btn-danger btn-sm btn-cancel-change-shipdate\" style=\"display: none;\"><i class=\"fas fa-times\"></i></button>\n        ") + "\n        <table class=\"table table-bordered summary-table delivery-details-table\">\n            <thead>\n                <tr>\n                    <th colspan=\"5\" class=\"summary-head\">Delivery Details</th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr>\n                    <td>\n                        <div><strong>Destination Address:<br></strong>" + shipAddress + "</div>\n                    </td>\n                </tr>\n                " + (shipMethod ? "\n                <tr>\n                    <td>\n                        <div><strong>Shipping Method:<br></strong>" + shipMethod + "</div>\n                    </td>\n                </tr>\n                " : "") + "\n                <tr>\n                    <td class=\"summary-ship-date\">\n                    <strong>Latest Cargo Ship Date: </strong>\n                    " + (!pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED] && pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] && pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] !== pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] ? "\n                    <div class=\"line-last-shipdate-wrapper\">\n                        <span class=\"line-last-shipdate-label\">Req</span>\n                        <span class=\"line-last-shipdate\">" + lastShipDate + "</span>\n                    </div>\n                    <div class=\"line-new-shipdate-wrapper\">\n                        <span class=\"line-new-shipdate-label\">New</span>\n                        <span class=\"line-new-shipdate\">" + newShipDate + "</span>\n                    </div>\n                    <span class=\"change-reason-label\">\n                        <strong>Change Reason: </strong>\n                    </span>\n                    <div class=\"shipdate-change-reason-wrapper\">\n                        <span class=\"shipdate-change-reason\">" + shipDateChangeReason + "</span>\n                    </div>" : "\n                    <div class=\"line-actual-shipdate-wrapper\">\n                        <span class=\"line-actual-shipdate\">" + newShipDate + "</span>\n                    </div>\n                    ") + "\n                    </td>\n                </tr>\n            </tbody>\n        </table>\n        <table class=\"table table-bordered summary-table\">\n            <thead>\n                <tr>\n                    <th colspan=\"5\" class=\"summary-head\">Order Summary</th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr class=\"subtotal\">\n                    <td>\n                        <strong>Subtotal: </strong><span>$" + subTotal + "</span>\n                    </td>\n                </tr>\n                <tr class=\"vendor-discount\">\n                    <td>\n                        <strong>Vendor Discount: </strong><span>" + (vendorDiscount !== 0 ? "-$" + vendorDiscount : "$" + vendorDiscount) + "</span>\n                    </td>\n                </tr>\n                <tr class=\"total\">\n                    <td>\n                        <strong>Total: </strong><span>$" + total + "</span>\n                    </td>\n                </tr>\n                <tr class=\"total-cbm\">\n                    <td>\n                        <strong>Total CBM: </strong><span>" + cbm + "</span>\n                    </td>\n                </tr>\n                <tr class=\"container-count\">\n                    <td>\n                        <strong>Average Container Count: </strong><span>" + containerCount + "</span>\n                    </td>\n                </tr>\n            </tbody>\n        </table>\n    </div>\n    ";
        return summaryView;
    }
    // Get the summary view for Inbound Shipments
    function getInboundShipmentSummaryView(pInboundShipmentData, pApprovalRequestData, pRequestApproved) {
        var newShipDate = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE];
        var lastShipDate = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE];
        var summaryView = "\n    <div>\n        <span class=\"po-number\"> Inbound Shipment: " + pInboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER] + " </span>\n    </div>\n    <!--\n    <div class=\"summary-tables-section\">\n        " + (pRequestApproved || pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.TOV ? "" : "\n        <button type=\"button\" class=\"btn btn-danger btn-edit-shipdate\" style=\"display: block;\"><i class=\"far fa-edit\"></i></button>\n        <button type=\"button\" class=\"btn btn-success btn-sm btn-accept-change-shipdate\" style=\"display: none;\"><i class=\"fas fa-check\"></i></button>\n        <button type=\"button\" class=\"btn btn-danger btn-sm btn-cancel-change-shipdate\" style=\"display: none;\"><i class=\"fas fa-times\"></i></button>\n        ") + "\n        <table class=\"table table-bordered summary-table delivery-details-table\">\n            <thead>\n                <tr>\n                    <th colspan=\"5\" class=\"summary-head\">Delivery Details</th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr>\n                    <td>\n                        <div><strong>Destination Address:<br></strong>" + pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.SHIPADDRESS] + "</div>\n                    </td>\n                </tr>\n                <tr>\n                    <td class=\"summary-ship-date\">\n                        <strong>Latest Cargo Ship Date: </strong>\n                        " + (!pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED] && pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] && pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] !== pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] ? "\n                        <div class=\"line-last-shipdate-wrapper\">\n                            <span class=\"line-last-shipdate-label\">Req</span>\n                            <span class=\"line-last-shipdate\">" + lastShipDate + "</span>\n                        </div>\n                        <div class=\"line-new-shipdate-wrapper\">\n                            <span class=\"line-new-shipdate-label\">New</span>\n                            <span class=\"line-new-shipdate\">" + newShipDate + "</span>\n                        </div>" : "\n                        <div class=\"line-actual-shipdate-wrapper\">\n                            <span class=\"line-actual-shipdate\">" + newShipDate + "</span>\n                        </div>\n                        ") + "\n                    </td>\n                </tr>\n            </tbody>\n        </table>\n        <table class=\"table table-bordered summary-table\">\n            <thead>\n                <tr>\n                    <th colspan=\"5\" class=\"summary-head\">Order Summary</th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr>\n                    <td>\n                        <strong>Total: </strong>$" + pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.TOTAL] + "\n                    </td>\n                </tr>\n                <tr>\n                    <td>\n                        <strong>Total CBM: </strong>" + pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM] + "\n                    </td>\n                </tr>\n                <tr>\n                    <td>\n                        <strong>Average Container Count: </strong>" + pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM] + "\n                    </td>\n                </tr>\n            </tbody>\n        </table>\n    </div>\n    -->\n    ";
        return summaryView;
    }
    // Get the view for the items of the Purchase Order
    function getItemsView(pData, pIsPendingLoadPlanPage) {
        var itemsRows = '';
        var thereAreVendorChanges = false;
        for (var i = 0; i < pData.length; i++) {
            if (!pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.TOV) {
                thereAreVendorChanges = true;
            }
            var status_1 = void 0;
            if (pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED]) {
                status_1 = "Approved";
            }
            else if (pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR]) {
                status_1 = "Accepted by Vendor";
            }
            else {
                status_1 = "Pending";
            }
            // let showButtons = (status == "Pending" || status == "Accepted by Vendor") && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.TOV;
            var lineKey = pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_KEY] ? pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_KEY] : '';
            var itemID = pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_ID] ? pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_ID] : '';
            var itemName = pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_NAME] ? pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_NAME] : '';
            var itemDisplayName = pData[i][constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME] ? pData[i][constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME] : '';
            var lastQuantity = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] : '';
            var newQuantity = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] : '';
            var quantityOnShipments = pData[i][constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS] ? pData[i][constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS] : 0;
            var lastPurchasePrice = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_PURCH_PRICE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_PURCH_PRICE] : '';
            var newPurchasePrice = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_PURCH_PRICE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_PURCH_PRICE] : '';
            var tariffDiscount = pData[i][constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT] ? pData[i][constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT] : '';
            var newRate = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE] : '';
            var amount = pData[i][constants.PURCHASE_ORDER_OBJECT.AMOUNT] ? pData[i][constants.PURCHASE_ORDER_OBJECT.AMOUNT] : '';
            var lastCBM = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_CBM] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_CBM] : '';
            var newCBM = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_CBM] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_CBM] : '';
            var fabricCode = pData[i][constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE] : '';
            var tovComments = !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.VENDOR ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] : '';
            var requiredChanges = !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.TOV ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] : '';
            itemsRows += "\n        <tr class=\"item-line\">\n            <td class=\"line-key\" style=\"display: none\"> <span>" + lineKey + "</span> </td>\n            <td class=\"item-id\" style=\"display: none\"> <span>" + itemID + "</span> </td>\n            <td class=\"item-name\"> <span>" + itemName + "</span> </td>\n            <td class=\"item-display-name\"> <span>" + itemDisplayName + "</span> </td>\n            <td class=\"line-quantity\"> " + (!pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] !== pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] ?
                "<div class=\"line-last-quantity-wrapper\">\n                    <span class=\"line-last-quantity-label\">Req</span>\n                    <span class=\"line-last-quantity\">" + lastQuantity + "</span>\n                </div>\n                <div class=\"line-new-quantity-wrapper\">\n                    <span class=\"line-new-quantity-label\">New</span>\n                    <span class=\"line-new-quantity\">" + newQuantity + "</span>\n                </div>" :
                "<span class=\"line-actual-quantity\">" + newQuantity + "</span>") + "\n            </td>\n            " + (pIsPendingLoadPlanPage ? "\n            <td class=\"line-quantity-shipments\"> <span>" + quantityOnShipments + "</span> </td>\n            " : "") + "\n            <td class=\"line-purchase-price\"> " + (!pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_RATE] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_RATE] !== pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE] ?
                "<div class=\"line-last-purchase-price-wrapper\">\n                    <span class=\"line-last-purchase-price-label\">Req</span>\n                    <span class=\"line-last-purchase-price\">" + lastPurchasePrice + "</span>\n                </div>\n                <div class=\"line-new-purchase-price-wrapper\">\n                    <span class=\"line-new-purchase-price-label\">New</span>\n                    <span class=\"line-new-purchase-price\">" + newPurchasePrice + "</span>\n                </div>" :
                "<span class=\"line-actual-purchase-price\">" + newPurchasePrice + "</span>") + "\n            </td>\n            <td class=\"line-tariff-discount\"> <span>" + tariffDiscount + "</span> </td>\n            <td class=\"line-rate\"> <span>" + newRate + "</span> </td>\n            <td class=\"line-amount\"> <span>" + amount + "</span> </td>\n            <td class=\"line-fabric-code\"> <span>" + fabricCode + "</span> </td>\n            <td class=\"line-cbm\"> " + (!pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_CBM] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_CBM] !== pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_CBM] ?
                "<div class=\"line-last-cbm-wrapper\">\n                    <span class=\"line-last-cbm-label\">Req</span>\n                    <span class=\"line-last-cbm\">" + lastCBM + "</span>\n                </div>\n                <div class=\"line-new-cbm-wrapper\">\n                    <span class=\"line-new-cbm-label\">New</span>\n                    <span class=\"line-new-cbm\">" + newCBM + "</span>\n                </div>" :
                "<span class=\"line-actual-cbm\">" + newCBM + "</span>") + "\n            </td>\n            <td class=\"line-status\"> <span>" + status_1 + "</span> </td>\n            <td class=\"line-tov-changes\"><span>" + tovComments + "</span></td>\n            <td class=\"line-vendor-changes\"> <span>" + requiredChanges + "</span> </td>\n            <td class=\"line-action\">\n                <button type=\"button\" class=\"btn btn-primary btn-sm btn-approve-line\" style=\"display:none;\">Approve</button>\n                <button type=\"button\" class=\"btn btn-primary btn-sm btn-change-line\" style=\"display:none;\">Change</button>\n                <button type=\"button\" class=\"btn btn-success btn-sm btn-accept-change\" style=\"display: none;\"><i class=\"fas fa-check\"></i></button>\n                <button type=\"button\" class=\"btn btn-danger btn-sm btn-cancel-change\" style=\"display: none;\"><i class=\"fas fa-times\"></i></button>\n                <div id=\"line-approved-alert\" class=\"alert alert-success\" role=\"alert\" style=\"display: none;\">Approved!</div>\n                <button type=\"button\" class=\"btn btn-danger btn-cancel-approved\" style=\"display: none;\"><i class=\"fas fa-times\"></i></button>\n                <div id=\"line-changed-alert\" class=\"alert alert-success\" role=\"alert\" style=\"display: none;\">Changed!</div>\n                <button type=\"button\" class=\"btn btn-danger btn-cancel-changed\" style=\"display: none;\"><i class=\"far fa-edit\"></i></button>\n                <div id=\"line-denied-alert\" class=\"alert alert-success\" role=\"alert\" style=\"display: none;\">Denied!</div>\n                <input type=\"checkbox\" class=\"approve-check-input\" id=\"approve-line-check-" + i + "\" style=\"display: none;\" " + (status_1 == "Approved" ? "checked" : "") + ">\n                <!-- <label class=\"approve-check-input-label\" for=\"approve-line-check-" + i + "\" style=\"display: none;\">Approve</label> -->\n            </td>\n            <td class=\"line-action-selected\" style=\"display: none\">" + status_1 + "</td>\n        </tr>\n        ";
        }
        // Remove line comments cell if no TOV comments
        if (!thereAreVendorChanges) {
            itemsRows = itemsRows.replace(/<td class="line-vendor-changes">(.*?)<\/td>/g, '');
        }
        var itemsView = "\n    <div class=\"table-responsive po-planner-items-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                <th><span>Item</span></th>\n                <th><span>Description</span></th>\n                <th><span>Quantity</span></th>\n                " + (pIsPendingLoadPlanPage ? "<th><span>Quantity On Shipments</span></th>" : "") + "\n                <th><span>Purchase Price</span></th>\n                <th><span>Tariff Discount</span></th>\n                <th><span>Rate</span></th>\n                <th><span>Amount</span></th>\n                <th><span>Fabric Code</span></th>\n                <th><span>CBM</span></th>\n                <th><span>Status</span></th>\n                <th><span>TOV Changes</span></th>\n                " + (thereAreVendorChanges ? "<th><span>Vendor Changes</span></th>" : '') + "\n                <th id=\"action-header\"><span>Action</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + itemsRows + "\n            </tbody>\n        </table>\n    </div>\n    ";
        return itemsView;
    }
    // Get the view for the items of the Inbound Shipment
    function getInboundShipmentItemsView(pData) {
        var itemsRows = '';
        for (var i = 0; i < pData.length; i++) {
            var itemID = pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_ID] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_ID] : '';
            var itemName = pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_NAME] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_NAME] : '';
            var itemDisplayName = pData[i][constants.INBOUND_SHIPMENT_OBJECT.DISPLAY_NAME] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.DISPLAY_NAME] : '';
            var purchaseOrder = pData[i][constants.INBOUND_SHIPMENT_OBJECT.PURCHASE_ORDER] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.PURCHASE_ORDER] : '';
            var quantityExpected = pData[i][constants.INBOUND_SHIPMENT_OBJECT.QUANTITY_EXPECTED] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.QUANTITY_EXPECTED] : 0;
            itemsRows += "\n        <tr class=\"item-line\">\n            <td class=\"item-id\" style=\"display: none\"> <span>" + itemID + "</span> </td>\n            <td class=\"item-name\"> <span>" + itemName + "</span> </td>\n            <td class=\"item-display-name\"> <span>" + itemDisplayName + "</span> </td>\n            <td class=\"item-purchase-order\"> <span>" + purchaseOrder + "</span> </td>\n            <td class=\"line-quantity\"> <span>" + quantityExpected + "</span> </td>\n        </tr>\n        ";
        }
        var itemsView = "\n    <div class=\"table-responsive po-planner-items-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                <th><span>Item</span></th>\n                <th><span>Description</span></th>\n                <th><span>Purchase Order</span></th>\n                <th><span>Quantity</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + itemsRows + "\n            </tbody>\n        </table>\n    </div>\n    ";
        return itemsView;
    }
    // Get the view of the main buttons
    function getMainButtonsView(pRequestApproved, pVendorOrTOVSide, pPIFileUploaded, pLoadPlanUploaded, pISNComplete) {
        var mainButtonsView;
        if (pRequestApproved) {
            if (!pPIFileUploaded) {
                mainButtonsView = "\n            <div style=\"text-align: center; margin: 0 0 15px 0;\">\n                <div class=\"alert alert-warning\" role=\"alert\">All lines were approved but still pending the PI File from Vendor.</div>\n            </div>\n            ";
            }
            else if (!pLoadPlanUploaded) {
                mainButtonsView = "\n            <div style=\"text-align: center; margin: 0 0 15px 0;\">\n                <div class=\"alert alert-warning\" role=\"alert\">All lines were approved and the PI File was uploaded. Please upload the Load Plan!</div>\n            </div>\n            <div id=\"buttons-area\">\n                <div class=\"general-buttons-area\">\n                    <button type=\"button\" id=\"btn-add-general-comment\" class=\"btn btn-primary\">Add General Comment</button>\n                </div>\n                <div class=\"submit-buttons-area\">\n                    <button type=\"button\" id=\"btn-submit-data\" class=\"btn btn-primary upload-plan-btn\">Upload Load Plan</button>\n                </div>\n            </div>\n            ";
            }
            else if (!pISNComplete) {
                mainButtonsView = "\n            <div style=\"text-align: center; margin: 0 0 15px 0;\">\n                <div class=\"alert alert-warning\" role=\"alert\">All lines were approved, the PI File and Load Plan were uploaded, please proceed to create or complete the Inbound Shipment for this order!</div>\n            </div>\n            ";
            }
            else {
                mainButtonsView = "";
            }
        }
        else {
            if (pVendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.TOV) {
                mainButtonsView = "\n            <div id=\"buttons-area\">\n                <div class=\"general-buttons-area\">\n                    <button type=\"button\" id=\"btn-print-order\" class=\"btn btn-primary\">Print Order</button>\n                    <button type=\"button\" id=\"btn-change-all-lines\" class=\"btn btn-primary\">Edit PO</button>\n                    <button type=\"button\" id=\"btn-refresh-all-lines\" class=\"btn btn-primary\" style=\"display: none;\">Apply Changes</button>\n                    <button type=\"button\" id=\"btn-approve-all-lines\" class=\"btn btn-primary\">Approve All Lines</button>\n                    <button type=\"button\" id=\"btn-add-general-comment\" class=\"btn btn-primary\">Add General Comment</button>\n                </div>\n                <div class=\"submit-buttons-area\">\n                    <button type=\"button\" id=\"btn-submit-data\" class=\"btn btn-primary\">Submit Data</button>\n                </div>\n            </div>";
            }
            else {
                mainButtonsView = "";
            }
        }
        return mainButtonsView;
    }
    // Get the view for the last comment
    function getLastCommentView(pApprovalRequestLastComment) {
        var lastCommentView = '<div class="tab-pane fade show active last-comment-view" id="nav-last" role="tabpanel" aria-labelledby="nav-last-tab">';
        if (pApprovalRequestLastComment) {
            lastCommentView += "\n            <p>" + pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT] + "</p>\n            <br />\n            " + (pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] ? "<p><strong>General Comment:</strong> " + pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] + "</p> <br />" : '') + "\n            <p class=\"comment-from\"><b style=\"margin-right: 5px;\">\u00B7</b>From <strong>" + pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV] + "</strong> on <strong>" + pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE] + "</strong></p>\n        ";
        }
        else {
            lastCommentView += '<p style="font-size: 16px;">No Comments!</p>';
        }
        lastCommentView += '</div>';
        return lastCommentView;
    }
    // Get the view for the comments interaction
    function getCommentsInteractionView(pApprovalRequestCommentsData) {
        var itemsRows = '';
        for (var i = 0; i < pApprovalRequestCommentsData.length; i++) {
            itemsRows += "\n        <tr>\n            <td id=\"comment-view\"><span>View Details</span></td>\n            <td id=\"comment-date\">" + (pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE] : '') + "</td>\n            <td id=\"comment-from\">" + (pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV] : '') + "</td>\n            <td id=\"general-comment\">" + (pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] : '') + "</td>\n            <td id=\"hidden-items-comments\" style=\"display: none;\"> " + (pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT] : '') + "</td>\n        </tr>\n        ";
        }
        var commentsInteractionView = '<div class="tab-pane fade" id="nav-history" role="tabpanel" aria-labelledby="nav-history-tab">';
        if (pApprovalRequestCommentsData.length > 0) {
            commentsInteractionView += "\n            <table class=\"table table-bordered table-striped comments-table\">\n                <thead>\n                    <tr>\n                        <th><span>View</span></th>\n                        <th><span>Date</span></th>\n                        <th><span>From</span></th>\n                        <th><span>General Comment</span></th>\n                    </tr>\n                </thead>\n                <tbody>\n                    " + itemsRows + "\n                </tbody>\n            </table>\n        ";
        }
        else {
            commentsInteractionView += '<p>No Comments!</p>';
        }
        commentsInteractionView += '</div>';
        return commentsInteractionView;
    }
    //Get the related inbound shipments view
    function getRelatedInboundView(pArgs) {
        var ordersRows = '';
        var orders = pArgs.inboundShipmentData;
        for (var i = 0; i < orders.length; i++) {
            var inboundShipmentID = orders[i][constants.INBOUND_SHIPMENT_OBJECT.ISN_INTERNALID];
            var purchaseOrderID = pArgs.poId;
            var link = functions.getCurrentSuiteletURL(false) + "&id=" + pArgs.approvalID + "&po=" + purchaseOrderID + "&isn=" + inboundShipmentID + "&page=" + pArgs.pageID;
            var inboundShipmentNumber = orders[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_NUMBER];
            var currentReadyDate = orders[i][constants.INBOUND_SHIPMENT_OBJECT.CURRENT_READY_DATE];
            var destination = orders[i][constants.INBOUND_SHIPMENT_OBJECT.DESTINATION_LOCATION];
            var bookingStatus = orders[i][constants.INBOUND_SHIPMENT_OBJECT.BOOKING_STATUS];
            var shipmentStatus = orders[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_STATUS];
            var downloadLink = functions.getSuiteletURL(constants.SCRIPTS.RETURN_PDF_SUITELET.ID, constants.SCRIPTS.RETURN_PDF_SUITELET.DEPLOY, true);
            ordersRows += "\n                <tr class=\"item-line\">\n                    <td class=\"order-link\"> <a class=\"view-order-link\" href=\"" + link + "\">View</a> </td>\n                    <td class=\"order-name\"> <span>" + inboundShipmentNumber + "</span> </td>\n                    <td class=\"order-date\"> <span>" + currentReadyDate + "</span> </td>\n                    <td class=\"order-destination\"> <span>" + destination + "</span> </td>\n                    <td class=\"order-booking-status\"> <span>" + bookingStatus + "</span> </td>\n                    <td class=\"order-shipment-status\"> <span>" + shipmentStatus + "</span> </td>\n                    <td class=\"order-link\"> <a class=\"view-order-link\" href=\"" + (downloadLink + '&isn=' + inboundShipmentID) + "\" target=\"_blank\" >Packing Slip</a> </td>\n                </tr>\n                ";
        }
        var ordersView = ordersRows.length > 0 ? "\n    <div class=\"table-responsive po-planner-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    <th><span>ISN #</span></th>\n                    <th><span>Current Ready Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Booking Status</span></th>\n                    <th><span>Shipment Status</span></th>\n                    <th></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + ordersRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Orders Here! </h5>";
        var relatedISNView = "<div class=\"tab-pane fade\" id=\"nav-related-isn\" role=\"tabpanel\" aria-labelledby=\"nav-related-isn-tab\">\n            " + ordersView + "\n        </div>";
        return relatedISNView;
    }
    // Get the view for the PI file
    function getPIFileView(pPIFile) {
        var PIFIleName = "";
        var PIFIleURL = "";
        if (pPIFile) {
            var fileData = model.getFileData(pPIFile);
            PIFIleName = fileData.name;
            PIFIleURL = fileData.url;
        }
        var PIFileView = "\n    <div class=\"tab-pane fade\" id=\"nav-pi-file\" role=\"tabpanel\" aria-labelledby=\"nav-pi-file-tab\">\n        <p class=\"pi-file-name\">" + PIFIleName + "</p>\n        <a id=\"btn-download-pi\" href=\"" + PIFIleURL + "\" target=\"_blank\" class=\"badge badge-secondary\">Download</a>\n        <button type=\"button\" id=\"btn-new-pi\" class=\"btn btn-primary\">Upload New</button>\n    </div>\n    ";
        return PIFileView;
    }
    // Get the view for the Load Plan
    function getLoadPlanFileView(pLoadPlanFile) {
        var loadPlanFileName = "";
        var loadPlanFileURL = "";
        if (pLoadPlanFile) {
            var fileData = model.getFileData(pLoadPlanFile);
            loadPlanFileName = fileData.name;
            loadPlanFileURL = fileData.url;
        }
        var loadPlanFileView = "\n    <div class=\"tab-pane fade\" id=\"nav-load-plan-file\" role=\"tabpanel\" aria-labelledby=\"nav-load-plan-file-tab\">\n        <p class=\"load-plan-file-name\">" + loadPlanFileName + "</p>\n        <a id=\"btn-download-load-plan\" href=\"" + loadPlanFileURL + "\" target=\"_blank\" class=\"badge badge-secondary\">Download</a>\n        <button type=\"button\" id=\"btn-new-load-plan\" class=\"btn btn-primary\">Upload New</button>\n    </div>\n    ";
        return loadPlanFileView;
    }
    // Get the view for the Shipment Related files
    function getShipmentRelatedFilesView(pShipmentRelatedFiles) {
        var shipmentRelatedFilesSection = "";
        var relatedFileTypes = Object.keys(pShipmentRelatedFiles);
        for (var i = 0; i < relatedFileTypes.length; i++) {
            if (relatedFileTypes[i] === "other-shipment-file") {
                for (var j = 0; j < pShipmentRelatedFiles[relatedFileTypes[i]].length; j++) {
                    var fileData = model.getFileData(pShipmentRelatedFiles[relatedFileTypes[i]][j]);
                    shipmentRelatedFilesSection += "\n                    <div class=\"related-shipment-file-wrapper\">\n                        <p class=\"related-shipment-file-name\">" + constants.FILE_TITLE_BY_ID[relatedFileTypes[i]] + " - " + fileData.name + "</p>\n                        <a href=\"" + fileData.url + "\" target=\"_blank\" class=\"badge badge-secondary btn-download-related-shipment-file\">Download</a>\n                    </div>\n                ";
                }
            }
            else {
                var fileData = model.getFileData(pShipmentRelatedFiles[relatedFileTypes[i]]);
                shipmentRelatedFilesSection += "\n                <div class=\"related-shipment-file-wrapper\">\n                    <p class=\"related-shipment-file-name\">" + constants.FILE_TITLE_BY_ID[relatedFileTypes[i]] + " - " + fileData.name + "</p>\n                    <a href=\"" + fileData.url + "\" target=\"_blank\" class=\"badge badge-secondary btn-download-related-shipment-file\">Download</a>\n                </div>\n            ";
            }
        }
        var loadPlanFileView = "\n    <div class=\"tab-pane fade\" id=\"nav-shipment-files\" role=\"tabpanel\" aria-labelledby=\"nav-shipment-files-tab\">\n        " + shipmentRelatedFilesSection + "\n        <button id=\"btn-new-related-shipment-file\" type=\"button\" class=\"btn btn-primary\">Upload New Files</button>\n    </div>\n    ";
        return loadPlanFileView;
    }
    // Get the modal for the View Comment
    function getViewCommentModal() {
        var viewCommentModal = "\n    <div class=\"modal\" id=\"see-comment-modal\" role=\"dialog\">\n        <div class=\"modal-dialog modal-lg modal-dialog-centered\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header\">\n                    <h5 class=\"modal-title\">Comment</h5>\n                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                        <span aria-hidden=\"true\">&times;</span>\n                    </button>\n                </div>\n                <div class=\"modal-body\">\n                    <p id=\"modal-items-comment\"></p>\n                    <p id=\"modal-general-comment\"></p>\n                    <p id=\"modal-comment-date-and-from\"></p>\n                </div>\n            </div>\n        </div>\n    </div>\n    ";
        return viewCommentModal;
    }
    // Get the modal for add a General Comment
    function getAddGeneralCommentModal() {
        var addGeneralCommentModal = "\n    <div class=\"modal add-general-comment-modal\" id=\"add-general-comment-modal\" role=\"dialog\">\n        <div class=\"modal-dialog modal-lg modal-dialog-centered\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header\">\n                    <h5 class=\"modal-title\">Add General Comment</h5>\n                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                        <span aria-hidden=\"true\">&times;</span>\n                    </button>\n                </div>\n                <div class=\"modal-body\" style=\"text-align: center;\">\n                    <span>Add a comment for the Vendor</span>\n                    <textarea rows=\"8\"></textarea>\n                    <button type=\"button\" id=\"btn-save-general-comment\" class=\"btn btn-primary\">Save</button>\n                </div>\n            </div>\n        </div>\n    </div>\n    ";
        return addGeneralCommentModal;
    }
    // Get the modal for add a General Comment
    function getShipdateChangeReasonModal() {
        var shipdateChangeReasonModal = "\n    <div class=\"modal shipdate-change-reason-modal\" id=\"shipdate-change-reason-modal\" role=\"dialog\">\n        <div class=\"modal-dialog modal-lg modal-dialog-centered\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header\">\n                    <h5 class=\"modal-title\">Change Reason</h5>\n                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                        <span aria-hidden=\"true\">&times;</span>\n                    </button>\n                </div>\n                <div class=\"modal-body\" style=\"text-align: center;\">\n                    <span>Add a reason for the latest cargo ship date change.</span>\n                    <textarea rows=\"4\"></textarea>\n                    <button type=\"button\" id=\"btn-save-shipdate-change-reason\" class=\"btn btn-primary\">Save</button>\n                </div>\n            </div>\n        </div>\n    </div>\n    ";
        return shipdateChangeReasonModal;
    }
    // Get the modal to upload the PI File
    function getUploadPIFileModal() {
        var piFileModal = "\n    <div class=\"modal\" id=\"upload-pi-file-modal\" role=\"dialog\">\n        <div class=\"modal-dialog modal-md modal-dialog-centered\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header\">\n                    <h5 class=\"modal-title\">Upload PI File</h5>\n                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                        <span aria-hidden=\"true\">&times;</span>\n                    </button>\n                </div>\n                <div class=\"modal-body\">\n                    <label for=\"pi-file\">Upload PI File</label>\n                    <input type=\"file\" class=\"pi-file form-control-file\" id=\"pi-file\" name=\"pi-file\" onchange=\"handleFileContents('pi-file', '')\">\n                    <button type=\"button\" id=\"btn-upload-pi-file\" class=\"btn btn-primary\" style=\"display: block; margin: 20px auto 0 auto;\">Accept</button>\n                </div>\n            </div>\n        </div>\n    </div>\n    ";
        return piFileModal;
    }
    // Get the modal to upload the Load Plan
    function getUploadLoadPlanModal() {
        var loadPlanModal = "\n    <div class=\"modal\" id=\"upload-load-plan-modal\" role=\"dialog\">\n        <div class=\"modal-dialog modal-md modal-dialog-centered\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header\">\n                    <h5 class=\"modal-title\">Upload Load Plan</h5>\n                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                        <span aria-hidden=\"true\">&times;</span>\n                    </button>\n                </div>\n                <div class=\"modal-body\">\n                    <label for=\"load-plan-file\">Upload Load Plan</label>\n                    <input type=\"file\" class=\"load-plan-file form-control-file\" id=\"load-plan-file\" name=\"load-plan-file\" onchange=\"handleFileContents('load-plan-file', '')\">\n                    <button type=\"button\" id=\"btn-upload-load-plan\" class=\"btn btn-primary\" style=\"display: block; margin: 20px auto 0 auto;\">Accept</button>\n                </div>\n            </div>\n        </div>\n    </div>\n    ";
        return loadPlanModal;
    }
    // Get the modal to upload related shipment files
    function getUploadRelatedShipmentFilesModal() {
        var piFileModal = "\n    <div class=\"modal\" id=\"upload-related-shipments-files-modal\" role=\"dialog\">\n        <div class=\"modal-dialog modal-md modal-dialog-centered\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header\">\n                    <h5 class=\"modal-title\"></h5>\n                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                        <span aria-hidden=\"true\">&times;</span>\n                    </button>\n                </div>\n                <div class=\"modal-body\">\n                    <label for=\"tsca-regulation-file\" class=\"file-input-label\">TSCA Regulation</label>\n                    <input type=\"file\" class=\"tsca-regulation-file form-control-file\" id=\"tsca-regulation-file\" name=\"tsca-regulation-file\" onchange=\"handleFileContents('tsca-regulation-file', 'related-shipment-file-input')\">\n                    <label for=\"packing-slip-file\" class=\"file-input-label\">Packing Slip & Commercial Invoice</label>\n                    <input type=\"file\" class=\"packing-slip-file form-control-file\" id=\"packing-slip-file\" name=\"packing-slip-file\" onchange=\"handleFileContents('packing-slip-file', 'related-shipment-file-input')\">\n                    <label for=\"loading-report-file\" class=\"file-input-label\">Loading Report</label>\n                    <input type=\"file\" class=\"loading-report-file form-control-file\" id=\"loading-report-file\" name=\"loading-report-file\" onchange=\"handleFileContents('loading-report-file', 'related-shipment-file-input')\">\n                    <label for=\"other-shipment-file\" class=\"file-input-label\">Other</label>\n                    <input type=\"file\" class=\"other-shipment-file form-control-file\" id=\"other-shipment-file\" name=\"other-shipment-file\" onchange=\"handleFileContents('other-shipment-file', 'related-shipment-file-input')\" multiple>\n                    <button type=\"button\" id=\"btn-upload-related-shipments-files\" class=\"btn btn-primary\" style=\"display: block; margin: 20px auto 0 auto;\">Accept</button>\n                </div>\n            </div>\n        </div>\n    </div>\n    ";
        return piFileModal;
    }
    // Get the loading modal
    function getLoadingModal() {
        var loadingModal = "\n    <div class=\"modal\" id=\"loading-modal\" role=\"dialog\">\n        <div class=\"modal-dialog modal-md modal-dialog-centered\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class=\"spinner-border text-light\" role=\"status\">\n                    <span class=\"sr-only\">Loading...</span>\n                </div>\n            </div>        \n        </div>\n    </div>\n    ";
        return loadingModal;
    }
    // Get thanks page after submitting the data
    function getErrorPage(pErrorMessage, pSmallText) {
        var errorHtml = "\n        <head>\n            <title>PO Planner Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.JS) + "\"></script>\n        </head>\n        <div class= \"header\">\n        <div class=\"main-title\">\n            <h3>PO Planner Portal</h3>\n        </div>\n            <div>\n                <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n            </div>\n        </div>\n        <body>\n            <div class=\"error-message\">\n                " + (pSmallText ? "<p>" + pErrorMessage + "</p>" : "<h3>" + pErrorMessage + "</h3>") + "\n            </div>\n        </body>";
        return errorHtml;
    }
    exports.getErrorPage = getErrorPage;
});
