/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "../Models/CountryManagerPortalModel", "../../../Global/Constants", "../../../Global/Functions"], function (require, exports, model, constants, functions) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Get the view of the Home Page
    function getHomePage(pPendingApprovalRequestData, pUniqueKey) {
        // Get the link to the home page
        var homePageLink = getHomePageLink(pUniqueKey);
        // Get the quantity of records by category
        var categoriesQuantities = getCategoriesQuantities(pPendingApprovalRequestData);
        return "\n        <head>\n            <title>Country Manager Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.GLOBAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.HOME.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.GLOBAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.HOME.JS) + "\"></script>\n        </head>\n        <div aria-live=\"polite\"  role=\"alert\" aria-atomic=\"true\" >\n            <div role=\"alert\" class=\"toast\" style=\"position: absolute; top: 5px; right: 5px; min-width: 200px;\" data-delay=\"10000\">\n                <div class=\"toast-header\" style=\"background-color: #FAD2D2;\">\n                <strong class=\"mr-auto\">Error</strong>\n                </div>\n                <div class=\"toast-body\" id=\"error-message\">\n                </div>\n            </div>\n        </div>\n        <div class=\"wrapper\">\n            <div class=\"sidebar-view\">\n                " + getSidebarView(pPendingApprovalRequestData) + "\n            </div>\n            <div class=\"body\">\n                <div class= \"header\">\n                    <div class=\"main-title\">\n                        <a href=\"" + homePageLink + "\" class=\"country-manager-portal-title\"><h3>Country Manager Portal</h3></a>\n                    </div>\n                    <div>\n                        <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n                    </div>\n                </div>\n                <div class=\"country-manager-portal home-page\">\n                    " + getCategoriesView(categoriesQuantities) + "\n                </div>\n            </div>\n        </div>\n    ";
    }
    exports.getHomePage = getHomePage;
    // Get the quantity of orders by category
    function getCategoriesQuantities(pPendingApprovalRequestData) {
        var processedApprovalRequests = [];
        var pendingVendor = 0;
        var pendingTOV = 0;
        var pendingPIFIle = 0;
        var pendingLoadPlan = 0;
        var loadPlan = 0;
        var approved = 0;
        for (var i = 0; i < pPendingApprovalRequestData.length; i++) {
            var approvalRequestID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID];
            var isApproved = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
            var PIFileUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
            var loadPlanUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
            var isnComplete = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
            var vendorOrTOVSide = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
            if (!isApproved && vendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.VENDOR) {
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingVendor++ : {};
            }
            else if (!isApproved && vendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.TOV) {
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingTOV++ : {};
            }
            else if (isApproved && !PIFileUploaded) {
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingPIFIle++ : {};
            }
            else if (isApproved && PIFileUploaded && (!loadPlanUploaded || !isnComplete)) {
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingLoadPlan++ : {};
            }
            else if (isApproved && PIFileUploaded && loadPlanUploaded && isnComplete) {
                loadPlan++;
                (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? approved++ : {};
            }
            processedApprovalRequests.push(approvalRequestID);
        }
        return {
            "pendingVendor": pendingVendor,
            "pendingTOV": pendingTOV,
            "pendingPIFIle": pendingPIFIle,
            "pendingLoadPlan": pendingLoadPlan,
            "loadPlan": loadPlan,
            "approved": approved
        };
    }
    // Get the view of the navbar
    function getSidebarView(pPendingApprovalRequestData) {
        var searchItemsArray = getSearchItemsArray(pPendingApprovalRequestData, "home");
        return "\n        <nav id=\"sidebar\">\n            <div class=\"sidebar-header\">\n                <div id=\"nav-icon\">\n                    <span></span>\n                    <span></span>\n                    <span></span>\n                </div>\n                <div id=\"search-icon\">\n                    <i class=\"fas fa-search\"></i>\n                </div>\n            </div>\n            <div id=\"sidebar-content-links\" class=\"sidebar-content\" style=\"display: none;\">\n                <ul class=\"sidebar-options\">\n                    <li>Vendor Information</li>\n                    <li>Purchase Order History</li>\n                    <li>Items Information</li>\n                    <li>Containers Information</li>\n                </ul>\n            </div>\n            <div id=\"sidebar-content-search\" class=\"sidebar-content\" style=\"display: none;\">\n                <div id=\"nav-bar-search-items-array\" style=\"display: none;\">" + JSON.stringify(searchItemsArray) + "</div>\n                <input id=\"nav-bar-search\" oninput=\"updateResult(this.value)\" type=\"search\" placeholder=\"Search\" />\n                <ul id=\"nav-bar-search-results\">\n                </ul>\n            </div>\n        </nav>\n    ";
    }
    // Get the items to use on the portal search
    function getSearchItemsArray(pPendingApprovalRequestData, pPageID) {
        var itemsObj = {
            "names": [],
            "data": {}
        };
        for (var i = 0; i < pPendingApprovalRequestData.length; i++) {
            var link = functions.getCurrentSuiteletURL(false);
            link = link + ("&id=" + pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID] + "&po=" + pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER]);
            (pPageID) ? link += "&page=" + pPageID : {};
            var name_1 = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] : '';
            itemsObj["names"].push(name_1);
            itemsObj["data"][name_1] = {
                "pageLink": link
            };
        }
        return itemsObj;
    }
    // Get the view of the categories grid
    function getCategoriesView(pCategoriesQuantities) {
        return "\n    <div class=\"categories\">\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.PENDING_VENDOR + "\">\n                <div class=\"circle pink\">\n                    " + (pCategoriesQuantities.pendingVendor === 0 ? "" : "\n                    <div class=\"circle-notification\">\n                        <span>" + pCategoriesQuantities.pendingVendor + "</span>\n                    </div>\n                    ") + "\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_VENDOR].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_VENDOR].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.PENDING_TOV + "\">\n                <div class=\"circle pink\">\n                    " + (pCategoriesQuantities.pendingTOV === 0 ? "" : "\n                    <div class=\"circle-notification\">\n                        <span>" + pCategoriesQuantities.pendingTOV + "</span>\n                    </div>\n                    ") + "\n                    <i class=\"tov-logo\">T O V</i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_TOV].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.PENDING_PI + "\">\n                <div class=\"circle pink\">\n                    " + (pCategoriesQuantities.pendingPIFIle === 0 ? "" : "\n                    <div class=\"circle-notification\">\n                        <span>" + pCategoriesQuantities.pendingPIFIle + "</span>\n                    </div>\n                    ") + "\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_PI].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_PI].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.PENDING_LOAD_PLAN + "\">\n                <div class=\"circle pink\">\n                    " + (pCategoriesQuantities.pendingLoadPlan === 0 ? "" : "\n                    <div class=\"circle-notification\">\n                        <span>" + pCategoriesQuantities.pendingLoadPlan + "</span>\n                    </div>\n                    ") + "\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_LOAD_PLAN].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_LOAD_PLAN].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.LOAD_PLANS + "\">\n                <div class=\"circle pink\">\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.LOAD_PLANS].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.LOAD_PLANS].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n            <div class=\"category\" id=\"" + constants.PAGES_IDS.APPROVED_ORDERS + "\">\n                <div class=\"circle pink\">\n                    <i class=\"" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.APPROVED_ORDERS].ICON_CLASS + "\"></i>\n                </div>\n                <span class=\"category-title\">" + constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.APPROVED_ORDERS].TITLE + "</span>\n            </div>\n        </div>\n        <div class=\"category-wrapper\">\n        </div>\n    </div>\n    ";
    }
    // Get the view of the Pending Approval Requests
    function getPendingApprovalRequestsView(pPendingApprovalRequestData, pUniqueKey, pPageID) {
        // Get the data for the title based on the page that is being visited
        var titleData = getTitleData(pPageID);
        // Get the filters to show the orders regarding the page
        var ordersFilters = getOrdersFiltersForPage(pPageID);
        // Get the link to the home page
        var homePageLink = getHomePageLink(pUniqueKey);
        return "\n        <head>\n            <title>Country Manager Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.GLOBAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.GLOBAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.JS) + "\"></script>\n        </head>\n        <div aria-live=\"polite\"  role=\"alert\" aria-atomic=\"true\" >\n            <div role=\"alert\" class=\"toast\" style=\"position: absolute; top: 5px; right: 5px; min-width: 200px;\" data-delay=\"10000\">\n                <div class=\"toast-header\" style=\"background-color: #FAD2D2;\">\n                <strong class=\"mr-auto\">Error</strong>\n                </div>\n                <div class=\"toast-body\" id=\"error-message\">\n                </div>\n            </div>\n        </div>\n        <div class=\"wrapper\">\n            <div class=\"sidebar-view\">\n                " + getSidebarView(pPendingApprovalRequestData) + "\n            </div>\n            <div class=\"body\">\n                <div class= \"header\">\n                    <div class=\"main-title\">\n                        <a href=\"" + homePageLink + "\" class=\"country-manager-portal-title\"><h3>Country Manager Portal</h3></a>\n                        <div>\n                            " + getBackButton("Back") + "\n                        </div>\n                    </div>\n                    <div>\n                        <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n                    </div>\n                </div>\n                <div class=\"country-manager-portal\">\n                    <div class=\"category-title-wrapper\">\n                        <div class=\"circle category-title pink\">\n                            " + titleData.icon + "\n                        </div>\n                        <span class=\"category-title\">" + titleData.title + "</span>\n                    </div>\n                    <div id=\"category-lines-wrapper\">\n                        " + getOrdersListView(pPendingApprovalRequestData, pPageID, ordersFilters.vendorOrTOVSide, ordersFilters.returnPendingPIFile, ordersFilters.returnPendingLoadPlan, ordersFilters.returnLoadPlan, ordersFilters.returnApproved, pUniqueKey) + "\n                    </div>\n                </div>\n            </div>\n        </div>\n    ";
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
        var vendorOrTOVSide;
        var returnPendingPIFile;
        var returnPendingLoadPlan;
        var returnLoadPlan;
        var returnApproved;
        switch (pPageID) {
            case (constants.PAGES_IDS.PENDING_VENDOR):
                vendorOrTOVSide = constants.VENDOR_OR_TOV_TEXT.VENDOR;
                returnPendingPIFile = false;
                returnPendingLoadPlan = false;
                returnLoadPlan = false;
                returnApproved = false;
                break;
            case (constants.PAGES_IDS.PENDING_TOV):
                vendorOrTOVSide = constants.VENDOR_OR_TOV_TEXT.TOV;
                returnPendingPIFile = false;
                returnPendingLoadPlan = false;
                returnLoadPlan = false;
                returnApproved = false;
                break;
            case (constants.PAGES_IDS.PENDING_PI):
                vendorOrTOVSide = null;
                returnPendingPIFile = true;
                returnPendingLoadPlan = false;
                returnLoadPlan = false;
                returnApproved = false;
                break;
            case (constants.PAGES_IDS.PENDING_LOAD_PLAN):
                vendorOrTOVSide = null;
                returnPendingPIFile = false;
                returnPendingLoadPlan = true;
                returnLoadPlan = false;
                returnApproved = false;
                break;
            case (constants.PAGES_IDS.LOAD_PLANS):
                vendorOrTOVSide = null;
                returnPendingPIFile = false;
                returnPendingLoadPlan = false;
                returnLoadPlan = true;
                returnApproved = false;
                break;
            case (constants.PAGES_IDS.APPROVED_ORDERS):
                vendorOrTOVSide = null;
                returnPendingPIFile = false;
                returnPendingLoadPlan = false;
                returnLoadPlan = false;
                returnApproved = true;
                break;
            default:
                break;
        }
        return {
            "vendorOrTOVSide": vendorOrTOVSide,
            "returnPendingPIFile": returnPendingPIFile,
            "returnPendingLoadPlan": returnPendingLoadPlan,
            "returnLoadPlan": returnLoadPlan,
            "returnApproved": returnApproved
        };
    }
    // Get the list of orders based on some filters
    function getOrdersListView(pPendingApprovalRequestData, pPageID, pVendorOrTOVSide, pReturnPendingPIFile, pReturnPendingLoadPlan, pReturnLoadPlan, pReturnApproved, pUniqueKey) {
        var processedApprovalRequests = [];
        var ordersRows = '';
        for (var i = 0; i < pPendingApprovalRequestData.length; i++) {
            var approvalRequestID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID];
            var approved = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
            var PIFileUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
            var loadPlanUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
            var isnComplete = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
            var vendorOrTOVSide = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
            // Return the orders regarding the filters of the page
            var noApprovedCondition = !pReturnApproved && !approved && vendorOrTOVSide === pVendorOrTOVSide;
            var pendingPIFileCondition = pReturnPendingPIFile && approved && !PIFileUploaded;
            var pendingLoadPlanCondition = pReturnPendingLoadPlan && approved && PIFileUploaded && (!loadPlanUploaded || !isnComplete);
            var loadPlanCondition = pReturnLoadPlan && approved && PIFileUploaded && loadPlanUploaded && isnComplete;
            var approvedCondition = pReturnApproved && approved && PIFileUploaded && loadPlanUploaded && isnComplete;
            if ((noApprovedCondition || pendingPIFileCondition || pendingLoadPlanCondition || approvedCondition) && processedApprovalRequests.indexOf(approvalRequestID) === -1) {
                processedApprovalRequests.push(approvalRequestID);
                var purchaseOrderID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
                var link = functions.getCurrentSuiteletURL(false) + "&key=" + pUniqueKey + "&id=" + approvalRequestID + "&po=" + purchaseOrderID + "&page=" + pPageID;
                var date = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE] ? String(pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE]).split(' ')[0] : '';
                var purchaseOrderName = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] : '';
                var expectedShipDate = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] : '';
                var shipAddressee = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE] ? String(pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE]).replace(' Stock', '') : '';
                var total = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_TOTAL] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_TOTAL] : '';
                var approvalStatus = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] : '';
                var vendorName = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] : '';
                var isReplacement = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT];
                var isDropship = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_DROPSHIP];
                var isRenegade = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_RENEGADE];
                var nonRegularOrderSpan = '';
                if (isReplacement) {
                    nonRegularOrderSpan = '<span class="parts-order">Parts</span>';
                }
                else if (isDropship) {
                    nonRegularOrderSpan = '<span class="dropship-order">Dropship</span>';
                }
                else if (isRenegade) {
                    nonRegularOrderSpan = "<img style=\"width: 35px;\" src=\"" + constants.RENEGADE_LOGO_URL + "\"></img>";
                }
                ordersRows += "\n            <tr class=\"item-line\">\n                <td class=\"order-link\"> <a class=\"view-order-link\" href=\"" + link + "\">View</a> </td>\n                <td class=\"order-date\"> <span>" + date + "</span> </td>\n                <td class=\"order-name\"> <span>" + purchaseOrderName + "</span> </td>\n                <td class=\"order-ship-date\"> <span>" + expectedShipDate + "</span> </td>\n                <td class=\"order-shipaddres\"> <span>" + shipAddressee + "</span> </td>\n                <td class=\"order-total\"> <span>$" + total + "</span> </td>\n                <td class=\"order-approval-status\"> <span>" + approvalStatus + "</span> </td>\n                <td class=\"order-vendor\"> <span>" + vendorName + "</span> </td>\n                " + (isReplacement || isDropship || isRenegade ? "<td class=\"order-is-nonregular\"> " + nonRegularOrderSpan + " </td>" : '<td></td>') + "\n            </tr>\n            ";
            }
            else if (loadPlanCondition) {
                var inboundShipmentID = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.ISN_INTERNALID];
                var link = functions.getCurrentSuiteletURL(false);
                link = link + ("&id=" + pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID] + "&po=" + pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER] + "&isn=" + inboundShipmentID);
                (pPageID) ? link += "&page=" + pPageID : {};
                var inboundShipmentNumber = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_NUMBER];
                var currentReadyDate = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.CURRENT_READY_DATE];
                var destination = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.DESTINATION_LOCATION];
                var bookingStatus = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.BOOKING_STATUS];
                var shipmentStatus = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_STATUS];
                ordersRows += "\n            <tr class=\"item-line\">\n                <td class=\"order-link\"> <a class=\"view-order-link\" href=\"" + link + "\">View</a> </td>\n                <td class=\"order-name\"> <span>" + inboundShipmentNumber + "</span> </td>\n                <td class=\"order-date\"> <span>" + currentReadyDate + "</span> </td>\n                <td class=\"order-destination\"> <span>" + destination + "</span> </td>\n                <td class=\"order-booking-status\"> <span>" + bookingStatus + "</span> </td>\n                <td class=\"order-shipment-status\"> <span>" + shipmentStatus + "</span> </td>\n            </tr>\n            ";
            }
        }
        var ordersView = ordersRows.length > 0 ? "\n    <div class=\"table-responsive country-manager-orders-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                    <th></th>\n                    " + (pReturnLoadPlan ? "\n                    <th><span>ISN #</span></th>\n                    <th><span>Current Ready Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Booking Status</span></th>\n                    <th><span>Shipment Status</span></th>\n                    " : "\n                    <th><span>Date</span></th>\n                    <th><span>PO #</span></th>\n                    <th><span>Expected Ready Date</span></th>\n                    <th><span>Destination Location</span></th>\n                    <th><span>Amount</span></th>\n                    <th><span>Approval Status</span></th>\n                    <th><span>Vendor</span></th>\n                    ") + "\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + ordersRows + "\n            </tbody>\n        </table>\n    </div>\n    " : "<h5 style=\"text-align: center;\"> No Orders Here! </h5>";
        return ordersView;
    }
    // Get the view of a specific Purchase Order
    function getPurchaseOrderView(pPendingApprovalRequestData, pApprovalRequestData, pPurchaseOrderData, pApprovalRequestCommentsData, pUniqueKey, pPageID) {
        var requestApproved = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED];
        var PIFileUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
        var loadPlanUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
        var isnComplete = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        var PIFile = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE];
        var loadPlan = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN];
        var homePageLink = getHomePageLink(pUniqueKey);
        var isPendingLoadPlanPage = pPageID === "pending-load-plan";
        return "\n        <head>\n            <title>Country Manager Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.GLOBAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.GLOBAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.JS) + "\"></script>\n        </head>\n        <div aria-live=\"polite\"  role=\"alert\" aria-atomic=\"true\" >\n            <div role=\"alert\" class=\"toast\" style=\"position: absolute; top: 5px; right: 5px; min-width: 200px;\" data-delay=\"10000\">\n                <div class=\"toast-header\" style=\"background-color: #FAD2D2;\">\n                <strong class=\"mr-auto\">Error</strong>\n                </div>\n                <div class=\"toast-body\" id=\"error-message\">\n                </div>\n            </div>\n        </div>\n        <div class=\"wrapper\">\n            <div class=\"sidebar-view\">\n                " + getSidebarView(pPendingApprovalRequestData) + "\n            </div>\n            <div class=\"body\">\n                <div class=\"header\">\n                    <div class=\"main-title\">\n                        <a href=\"" + homePageLink + "\" class=\"country-manager-portal-title\"><h3>Country Manager Portal</h3></a>\n                        <span class=\"vendor-header\">" + pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME] + "</span>\n                        <div>\n                            " + getBackButton("Back") + "\n                        </div>\n                    </div>\n                    <div>\n                    " + (pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO] ?
            "<div>\n                            <img class=\"vendor-logo\" src=\"" + functions.getFileUrl(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO]) + "\">\n                        </div>"
            : "") + "\n                    </div>\n                    <div>\n                        <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n                    </div>\n                </div>\n                <div class=\"country-manager-portal\">\n                    <div class=\"summary-area\">\n                        " + getSummaryView(pPurchaseOrderData, pApprovalRequestData, requestApproved) + "\n                    </div>\n                    <div id=\"items-area\">\n                        " + getItemsView(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.ITEMS], isPendingLoadPlanPage) + "\n                    </div>\n                    <div id=\"general-comment-area\">\n                        <p><strong>General Comment:</strong></p>\n                        <p id=\"general-comment-body\"></p>\n                    </div>\n                    " + getMainButtonsView(requestApproved, PIFileUploaded, loadPlanUploaded, isnComplete) + "\n                    <div id=\"comments-area\">\n                        <nav>\n                            <div class=\"nav nav-tabs\" id=\"nav-tab\" role=\"tablist\">\n                                <a class=\"nav-item nav-link active\" id=\"nav-last-tab\" data-toggle=\"tab\" href=\"#nav-last\" role=\"tab\" aria-controls=\"nav-last\" aria-selected=\"true\">Last Message</a>\n                                <a class=\"nav-item nav-link\" id=\"nav-history-tab\" data-toggle=\"tab\" href=\"#nav-history\" role=\"tab\" aria-controls=\"nav-history\" aria-selected=\"false\">Interaction History</a>\n                                " + (PIFileUploaded ? "<a class=\"nav-item nav-link\" id=\"nav-pi-file-tab\" data-toggle=\"tab\" href=\"#nav-pi-file\" role=\"tab\" aria-controls=\"nav-pi-file\" aria-selected=\"false\">PI File</a>" : "") + "\n                                " + (loadPlanUploaded ? "<a class=\"nav-item nav-link\" id=\"nav-load-plan-file-tab\" data-toggle=\"tab\" href=\"#nav-load-plan-file\" role=\"tab\" aria-controls=\"nav-load-plan-file\" aria-selected=\"false\">Load Plan</a>" : "") + "\n                            </div>\n                        </nav>\n                        <div class=\"tab-content\" id=\"nav-tabContent\">\n                            " + getLastCommentView(pApprovalRequestCommentsData[0]) + "\n                            " + getCommentsInteractionView(pApprovalRequestCommentsData) + "\n                            " + (PIFileUploaded ? getPIFileView(PIFile) : "") + "\n                            " + (loadPlanUploaded ? getLoadPlanFileView(loadPlan) : "") + "\n                        </div>\n                    </div>\n                    <div class=\"terms-and-conditions-area\">\n                        <div class=\"terms-and-conditions-title\">\n                            " + constants.TERMS_AND_CONDITIONS.TITLE + "\n                        </div>\n                        <div class=\"terms-and-conditions-text\">\n                            " + constants.TERMS_AND_CONDITIONS.TEXT + "\n                        </div>\n                    </div>\n                    " + getViewCommentModal() + "\n                    " + getAddGeneralCommentModal() + "\n                    " + getLoadingModal() + "\n                </div>\n            </div>\n        </div>\n    ";
    }
    exports.getPurchaseOrderView = getPurchaseOrderView;
    // Get the view of a specific Purchase Order
    function getInboundShipmentView(pPendingApprovalRequestData, pApprovalRequestData, pInboundShipmentData, pApprovalRequestCommentsData, pUniqueKey) {
        var requestApproved = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED];
        var PIFileUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
        var loadPlanUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
        var isnComplete = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        var PIFile = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE];
        var loadPlan = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN];
        var homePageLink = getHomePageLink(pUniqueKey);
        return "\n        <head>\n            <title>Country Manager Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.GLOBAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.GLOBAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.JS) + "\"></script>\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.SIDEBAR.JS) + "\"></script>\n        </head>\n        <div aria-live=\"polite\"  role=\"alert\" aria-atomic=\"true\" >\n            <div role=\"alert\" class=\"toast\" style=\"position: absolute; top: 5px; right: 5px; min-width: 200px;\" data-delay=\"10000\">\n                <div class=\"toast-header\" style=\"background-color: #FAD2D2;\">\n                <strong class=\"mr-auto\">Error</strong>\n                </div>\n                <div class=\"toast-body\" id=\"error-message\">\n                </div>\n            </div>\n        </div>\n        <div class=\"wrapper\">\n            <div class=\"sidebar-view\">\n                " + getSidebarView(pPendingApprovalRequestData) + "\n            </div>\n            <div class=\"body\">\n                <div class=\"header\">\n                    <div class=\"main-title\">\n                        <a href=\"" + homePageLink + "\" class=\"country-manager-portal-title\"><h3>Country Manager Portal</h3></a>\n                        <span class=\"vendor-header\">" + pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME] + "</span>\n                        <div>\n                            " + getBackButton("Back") + "\n                        </div>\n                    </div>\n                    <div>\n                    " + (pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.LOGO] ?
            "<div>\n                            <img class=\"vendor-logo\" src=\"" + functions.getFileUrl(pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.LOGO]) + "\">\n                        </div>"
            : "") + "\n                    </div>\n                    <div>\n                        <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n                    </div>\n                </div>\n                <div class=\"country-manager-portal\">\n                    <div class=\"summary-area\">\n                        " + getInboundShipmentSummaryView(pInboundShipmentData) + "\n                    </div>\n                    <div id=\"items-area\">\n                        " + getInboundShipmentItemsView(pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.ITEMS]) + "\n                    </div>\n                    <div id=\"general-comment-area\">\n                        <p><strong>General Comment:</strong></p>\n                        <p id=\"general-comment-body\"></p>\n                    </div>\n                    " + getMainButtonsView(requestApproved, PIFileUploaded, loadPlanUploaded, isnComplete) + "\n                    <div id=\"comments-area\">\n                        <nav>\n                            <div class=\"nav nav-tabs\" id=\"nav-tab\" role=\"tablist\">\n                                <a class=\"nav-item nav-link active\" id=\"nav-last-tab\" data-toggle=\"tab\" href=\"#nav-last\" role=\"tab\" aria-controls=\"nav-last\" aria-selected=\"true\">Last Message</a>\n                                <a class=\"nav-item nav-link\" id=\"nav-history-tab\" data-toggle=\"tab\" href=\"#nav-history\" role=\"tab\" aria-controls=\"nav-history\" aria-selected=\"false\">Interaction History</a>\n                                " + (PIFileUploaded ? "<a class=\"nav-item nav-link\" id=\"nav-pi-file-tab\" data-toggle=\"tab\" href=\"#nav-pi-file\" role=\"tab\" aria-controls=\"nav-pi-file\" aria-selected=\"false\">PI File</a>" : "") + "\n                                " + (loadPlanUploaded ? "<a class=\"nav-item nav-link\" id=\"nav-load-plan-file-tab\" data-toggle=\"tab\" href=\"#nav-load-plan-file\" role=\"tab\" aria-controls=\"nav-load-plan-file\" aria-selected=\"false\">Load Plan</a>" : "") + "\n                            </div>\n                        </nav>\n                        <div class=\"tab-content\" id=\"nav-tabContent\">\n                            " + getLastCommentView(pApprovalRequestCommentsData[0]) + "\n                            " + getCommentsInteractionView(pApprovalRequestCommentsData) + "\n                            " + (PIFileUploaded ? getPIFileView(PIFile) : "") + "\n                            " + (loadPlanUploaded ? getLoadPlanFileView(loadPlan) : "") + "\n                        </div>\n                    </div>\n                    <div class=\"terms-and-conditions-area\">\n                        <div class=\"terms-and-conditions-title\">\n                            " + constants.TERMS_AND_CONDITIONS.TITLE + "\n                        </div>\n                        <div class=\"terms-and-conditions-text\">\n                            " + constants.TERMS_AND_CONDITIONS.TEXT + "\n                        </div>\n                    </div>\n                    " + getViewCommentModal() + "\n                    " + getAddGeneralCommentModal() + "\n                    " + getLoadingModal() + "\n                </div>\n            </div>\n        </div>\n    ";
    }
    exports.getInboundShipmentView = getInboundShipmentView;
    // Get the link to the home page
    function getHomePageLink(pUniqueKey) {
        var link = functions.getCurrentSuiteletURL(false) + "&key=" + pUniqueKey;
        return link;
    }
    // Get the Back button
    function getBackButton(pButtonText) {
        return "<a onclick=\"getBackLink()\" class=\"btn btn-light go-back-link\">" + pButtonText + "</a>";
    }
    // Get the summary view for Purchase Orders
    function getSummaryView(pPurchaseOrderData, pApprovalRequestData, pRequestApproved) {
        var newShipDate = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE];
        var subTotal = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SUBTOTAL]);
        var vendorDiscount = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_DISCOUNT]);
        var cbm = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM]);
        var containerCount = Math.ceil(cbm / constants.GENERAL.CONTAINER_COUNT_LIMIT);
        var isReplacement = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT];
        var isDropship = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER];
        var isRenegade = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO];
        var summaryView = "\n    <div>\n        <span class=\"po-number\"> " + pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TRANID] + " - " + pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME] + "</span>\n        " + (isReplacement ? "\n        <div class=\"order-is-replacement\">\n            <span class=\"parts-order\">Parts</span>\n        </div>\n        " : "") + "\n        " + (isDropship ? "\n        <div class=\"order-is-dropship\">\n            <span class=\"dropship-order\">Dropship</span>\n        </div>\n        " : "") + "\n        " + (isRenegade ? "\n        <div class=\"order-is-renegade\">\n            <img style=\"width: 35px; margin: 0 10px 0 0;\" src=\"" + constants.RENEGADE_LOGO_URL + "\"></img>\n        </div>\n        " : "") + "\n        " + (pRequestApproved ? "\n        <div class=\"order-is-approved\">\n            <div class=\"alert alert-success\" role=\"alert\">\n                This order is already approved!\n            </div>\n        </div>\n    " : "") + "\n    </div>\n    <div class=\"summary-tables-section\">        \n        <table class=\"table table-bordered summary-table delivery-details-table\">\n            <thead>\n                <tr>\n                    <th colspan=\"5\" class=\"summary-head\">Delivery Details</th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr>\n                    <td>\n                        <strong>Destination Address:<br></strong>" + pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SHIPADDRESS] + "\n                    </td>\n                </tr>\n                <tr>\n                    <td class=\"summary-ship-date\">\n                    <strong>Latest Cargo Ship Date: </strong>\n                    <div class=\"line-actual-shipdate-wrapper\">\n                        <span class=\"line-actual-shipdate\">" + newShipDate + "</span>\n                    </div>\n                    </td>\n                </tr>\n            </tbody>\n        </table>\n        <table class=\"table table-bordered summary-table\">\n            <thead>\n                <tr>\n                    <th colspan=\"5\" class=\"summary-head\">Order Summary</th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr>\n                    <td>\n                        <strong>Subtotal: </strong>$" + subTotal + "\n                    </td>\n                </tr>\n                <tr>\n                    <td>\n                        <strong>Vendor Discount: </strong>-$" + vendorDiscount + "\n                    </td>\n                </tr>\n                <tr>\n                    <td>\n                        <strong>Total: </strong>$" + pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL] + "\n                    </td>\n                </tr>\n                <tr>\n                    <td>\n                        <strong>Total CBM: </strong>" + cbm + "\n                    </td>\n                </tr>\n                <tr>\n                    <td>\n                        <strong>Average Container Count: </strong>" + containerCount + "\n                    </td>\n                </tr>\n            </tbody>\n        </table>\n    </div>\n    ";
        return summaryView;
    }
    // Get the summary view for Inbound Shipments
    function getInboundShipmentSummaryView(pInboundShipmentData) {
        var summaryView = "\n    <div>\n        <span class=\"po-number\"> Inbound Shipment: " + pInboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER] + " </span>\n    </div>    \n    ";
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
            var lineKey = pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_KEY] ? pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_KEY] : '';
            var itemID = pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_ID] ? pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_ID] : '';
            var itemName = pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_NAME] ? pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_NAME] : '';
            var itemDisplayName = pData[i][constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME] ? pData[i][constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME] : '';
            var quantityOnShipments = pData[i][constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS] ? pData[i][constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS] : 0;
            var purchasePrice = pData[i][constants.PURCHASE_ORDER_OBJECT.PURCHASE_PRICE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.PURCHASE_PRICE] : '';
            var tariffDiscount = pData[i][constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT] ? pData[i][constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT] : '';
            var amount = pData[i][constants.PURCHASE_ORDER_OBJECT.AMOUNT] ? pData[i][constants.PURCHASE_ORDER_OBJECT.AMOUNT] : '';
            var cbm = pData[i][constants.PURCHASE_ORDER_OBJECT.CBM] ? pData[i][constants.PURCHASE_ORDER_OBJECT.CBM] : '';
            var fabricCode = pData[i][constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE] : '';
            var tovComments = !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.VENDOR ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] : '';
            var requiredChanges = !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.TOV ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] : '';
            itemsRows += "\n        <tr class=\"item-line\">\n            <td class=\"line-key\" style=\"display: none\"> <span>" + lineKey + "</span> </td>\n            <td class=\"item-id\" style=\"display: none\"> <span>" + itemID + "</span> </td>\n            <td class=\"item-name\"> <span>" + itemName + "</span> </td>\n            <td class=\"item-display-name\"> <span>" + itemDisplayName + "</span> </td>\n            <td class=\"line-quantity\">\n                <span class=\"line-actual-quantity\">" + pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] + "</span>\n            </td>\n            " + (pIsPendingLoadPlanPage ? "\n            <td class=\"line-quantity-shipments\"> <span>" + quantityOnShipments + "</span> </td>\n            " : "") + "\n            <td class=\"line-purchase-price\"> <span>" + purchasePrice + "</span> </td>\n            <td class=\"line-tariff-discount\"> <span>" + tariffDiscount + "</span> </td>\n            <td class=\"line-rate\">\n                <span class=\"line-actual-rate\">" + pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE] + "</span>\n            </td>\n            <td class=\"line-amount\"> <span>" + amount + "</span> </td>\n            <td class=\"line-fabric-code\"> <span>" + fabricCode + "</span> </td>\n            <td class=\"line-cbm\"> <span>" + cbm + "</span> </td>\n            <td class=\"line-status\"> <span>" + status_1 + "</span> </td>\n            <td class=\"line-tov-changes\"><span>" + tovComments + "</span></td>\n            <td class=\"line-vendor-changes\"> <span>" + requiredChanges + "</span> </td>\n            <td class=\"line-action-selected\" style=\"display: none\">" + status_1 + "</td>\n        </tr>\n        ";
        }
        // Remove line comments cell if no TOV comments
        if (!thereAreVendorChanges) {
            itemsRows = itemsRows.replace(/<td class="line-vendor-changes">(.*?)<\/td>/g, '');
        }
        var itemsView = "\n    <div class=\"table-responsive country-manager-items-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                <th><span>Item</span></th>\n                <th><span>Description</span></th>\n                <th><span>Quantity</span></th>\n                " + (pIsPendingLoadPlanPage ? "<th><span>Quantity On Shipments</span></th>" : "") + "\n                <th><span>Purchase Price</span></th>\n                <th><span>Tariff Discount</span></th>\n                <th><span>Rate</span></th>\n                <th><span>Amount</span></th>\n                <th><span>Fabric Code</span></th>\n                <th><span>CBM</span></th>\n                <th><span>Status</span></th>\n                <th><span>TOV Changes</span></th>\n                " + (thereAreVendorChanges ? "<th><span>Vendor Changes</span></th>" : '') + "\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + itemsRows + "\n            </tbody>\n        </table>\n    </div>\n    ";
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
        var itemsView = "\n    <div class=\"table-responsive country-manager-items-table\">\n        <table class=\"table text-nowrap\">\n            <thead>\n                <tr>\n                <th><span>Item</span></th>\n                <th><span>Description</span></th>\n                <th><span>Purchase Order</span></th>\n                <th><span>Quantity</span></th>\n                </tr>\n            </thead>\n            <tbody id=\"item-lines\">\n                " + itemsRows + "\n            </tbody>\n        </table>\n    </div>\n    ";
        return itemsView;
    }
    // Get the view of the main buttons
    function getMainButtonsView(pRequestApproved, pPIFileUploaded, pLoadPlanUploaded, pISNComplete) {
        var mainButtonsView;
        if (pRequestApproved) {
            if (!pPIFileUploaded) {
                mainButtonsView = "\n            <div style=\"text-align: center; margin: 0 0 15px 0;\">\n                <div class=\"alert alert-warning\" role=\"alert\">All lines were approved but still pending the PI File from Vendor.</div>\n            </div>\n            ";
            }
            else if (!pLoadPlanUploaded) {
                mainButtonsView = "\n            <div style=\"text-align: center; margin: 0 0 15px 0;\">\n                <div class=\"alert alert-warning\" role=\"alert\">All lines were approved and the PI File was uploaded but still pending the Load Plan from Vendor.</div>\n            </div>\n            ";
            }
            else if (!pISNComplete) {
                mainButtonsView = "\n            <div style=\"text-align: center; margin: 0 0 15px 0;\">\n                <div class=\"alert alert-warning\" role=\"alert\">All lines were approved, the PI File and Load Plan were uploaded, still pending the creation of the Inbound Shipment for this order!</div>\n            </div>\n            ";
            }
            else {
                mainButtonsView = "";
            }
        }
        else {
            mainButtonsView = "";
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
    // Get the view for the PI file
    function getPIFileView(pPIFile) {
        var PIFIleName = "";
        var PIFIleURL = "";
        if (pPIFile) {
            var fileData = model.getFileData(pPIFile);
            PIFIleName = fileData.name;
            PIFIleURL = fileData.url;
        }
        var PIFileView = "\n    <div class=\"tab-pane fade\" id=\"nav-pi-file\" role=\"tabpanel\" aria-labelledby=\"nav-pi-file-tab\">\n        <p class=\"pi-file-name\">" + PIFIleName + "</p>\n        <a id=\"btn-download-pi\" href=\"" + PIFIleURL + "\" target=\"_blank\" class=\"badge badge-secondary\">Download</a>\n    </div>\n    ";
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
        var loadPlanFileView = "\n    <div class=\"tab-pane fade\" id=\"nav-load-plan-file\" role=\"tabpanel\" aria-labelledby=\"nav-load-plan-file-tab\">\n        <p class=\"load-plan-file-name\">" + loadPlanFileName + "</p>\n        <a id=\"btn-download-load-plan\" href=\"" + loadPlanFileURL + "\" target=\"_blank\" class=\"badge badge-secondary\">Download</a>\n    </div>\n    ";
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
    // Get the loading modal
    function getLoadingModal() {
        var loadingModal = "\n    <div class=\"modal\" id=\"loading-modal\" role=\"dialog\">\n        <div class=\"modal-dialog modal-md modal-dialog-centered\" role=\"document\">\n            <div class=\"modal-content\">\n                <div class=\"spinner-border text-light\" role=\"status\">\n                    <span class=\"sr-only\">Loading...</span>\n                </div>\n            </div>        \n        </div>\n    </div>\n    ";
        return loadingModal;
    }
    // Get thanks page after submitting the data
    function getErrorPage(pErrorMessage, pSmallText) {
        var errorHtml = "\n        <head>\n            <title>Country Manager Portal</title>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js\"></script>\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css\">\n\n            <link rel=\"stylesheet\" type=\"text/css\" href=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.CSS) + "\">\n            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css\" />\n            <script type='text/javascript' src=\"" + functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.JS) + "\"></script>\n        </head>\n        <div class= \"header\">\n        <div class=\"main-title\">\n            <h3>Country Manager Portal</h3>\n        </div>\n            <div>\n                <img class=\"logo-tov\" src=\"https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg\">\n            </div>\n        </div>\n        <body>\n            <div class=\"error-message\">\n                " + (pSmallText ? "<p>" + pErrorMessage + "</p>" : "<h3>" + pErrorMessage + "</h3>") + "\n            </div>\n        </body>";
        return errorHtml;
    }
    exports.getErrorPage = getErrorPage;
});
