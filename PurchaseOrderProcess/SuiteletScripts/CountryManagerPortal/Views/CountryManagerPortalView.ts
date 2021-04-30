/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as model from '../Models/CountryManagerPortalModel';
import * as constants from '../../../Global/Constants';
import * as functions from '../../../Global/Functions';

// Get the view of the Home Page
export function getHomePage(pPendingApprovalRequestData, pUniqueKey)
{
    // Get the link to the home page
    let homePageLink = getHomePageLink(pUniqueKey);

    // Get the quantity of records by category
    let categoriesQuantities = getCategoriesQuantities(pPendingApprovalRequestData);

    return `
        <head>
            <title>Country Manager Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.HOME.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.SIDEBAR.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.HOME.JS)}"></script>
        </head>
        <div aria-live="polite"  role="alert" aria-atomic="true" >
            <div role="alert" class="toast" style="position: absolute; top: 5px; right: 5px; min-width: 200px;" data-delay="10000">
                <div class="toast-header" style="background-color: #FAD2D2;">
                <strong class="mr-auto">Error</strong>
                </div>
                <div class="toast-body" id="error-message">
                </div>
            </div>
        </div>
        <div class="wrapper">
            <div class="sidebar-view">
                ${getSidebarView(pPendingApprovalRequestData)}
            </div>
            <div class="body">
                <div class= "header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="country-manager-portal-title"><h3>Country Manager Portal</h3></a>
                    </div>
                    <div>
                        <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                    </div>
                </div>
                <div class="country-manager-portal home-page">
                    ${getCategoriesView(categoriesQuantities)}
                </div>
            </div>
        </div>
    `;
}

// Get the quantity of orders by category
function getCategoriesQuantities(pPendingApprovalRequestData)
{
    let processedApprovalRequests = [];
    let pendingVendor = 0;
    let pendingTOV = 0;
    let pendingPIFIle = 0;
    let pendingLoadPlan = 0;
    let loadPlan = 0;
    let approved = 0;

    for (let i = 0; i < pPendingApprovalRequestData.length; i++)
    {
        let approvalRequestID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID];

        let isApproved = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
        let PIFileUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
        let loadPlanUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
        let isnComplete = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        let vendorOrTOVSide = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];

        if (!isApproved && vendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.VENDOR)
        {
            (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingVendor++ : {};
        }
        else if (!isApproved && vendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.TOV)
        {
            (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingTOV++ : {};
        }
        else if (isApproved && !PIFileUploaded)
        {
            (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingPIFIle++ : {};
        }
        else if (isApproved && PIFileUploaded && (!loadPlanUploaded || !isnComplete))
        {
            (processedApprovalRequests.indexOf(approvalRequestID) === -1) ? pendingLoadPlan++ : {};
        }
        else if (isApproved && PIFileUploaded && loadPlanUploaded && isnComplete)
        {
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
function getSidebarView(pPendingApprovalRequestData)
{
    let searchItemsArray = getSearchItemsArray(pPendingApprovalRequestData, "home");

    return `
        <nav id="sidebar">
            <div class="sidebar-header">
                <div id="nav-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div id="search-icon">
                    <i class="fas fa-search"></i>
                </div>
            </div>
            <div id="sidebar-content-links" class="sidebar-content" style="display: none;">
                <ul class="sidebar-options">
                    <li>Vendor Information</li>
                    <li>Purchase Order History</li>
                    <li>Items Information</li>
                    <li>Containers Information</li>
                </ul>
            </div>
            <div id="sidebar-content-search" class="sidebar-content" style="display: none;">
                <div id="nav-bar-search-items-array" style="display: none;">${JSON.stringify(searchItemsArray)}</div>
                <input id="nav-bar-search" oninput="updateResult(this.value)" type="search" placeholder="Search" />
                <ul id="nav-bar-search-results">
                </ul>
            </div>
        </nav>
    `;
}

// Get the items to use on the portal search
function getSearchItemsArray(pPendingApprovalRequestData, pPageID)
{
    let itemsObj = {
        "names": [],
        "data": {}
    };

    for (let i = 0; i < pPendingApprovalRequestData.length; i++)
    {
        let link = functions.getCurrentSuiteletURL(false);
        link = link + `&id=${pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID]}&po=${pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER]}`;
        (pPageID) ? link += `&page=${pPageID}` : {};
        let name = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] : '';

        itemsObj["names"].push(name);
        itemsObj["data"][name] = {
            "pageLink": link
        };
    }

    return itemsObj;
}

// Get the view of the categories grid
function getCategoriesView(pCategoriesQuantities)
{
    return `
    <div class="categories">
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.PENDING_VENDOR}">
                <div class="circle pink">
                    ${pCategoriesQuantities.pendingVendor === 0 ? "" : `
                    <div class="circle-notification">
                        <span>${pCategoriesQuantities.pendingVendor}</span>
                    </div>
                    `}
                    <i class="${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_VENDOR].ICON_CLASS}"></i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_VENDOR].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.PENDING_TOV}">
                <div class="circle pink">
                    ${pCategoriesQuantities.pendingTOV === 0 ? "" : `
                    <div class="circle-notification">
                        <span>${pCategoriesQuantities.pendingTOV}</span>
                    </div>
                    `}
                    <i class="tov-logo">T O V</i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_TOV].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.PENDING_PI}">
                <div class="circle pink">
                    ${pCategoriesQuantities.pendingPIFIle === 0 ? "" : `
                    <div class="circle-notification">
                        <span>${pCategoriesQuantities.pendingPIFIle}</span>
                    </div>
                    `}
                    <i class="${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_PI].ICON_CLASS}"></i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_PI].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.PENDING_LOAD_PLAN}">
                <div class="circle pink">
                    ${pCategoriesQuantities.pendingLoadPlan === 0 ? "" : `
                    <div class="circle-notification">
                        <span>${pCategoriesQuantities.pendingLoadPlan}</span>
                    </div>
                    `}
                    <i class="${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_LOAD_PLAN].ICON_CLASS}"></i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_LOAD_PLAN].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.LOAD_PLANS}">
                <div class="circle pink">
                    <i class="${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.LOAD_PLANS].ICON_CLASS}"></i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.LOAD_PLANS].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.APPROVED_ORDERS}">
                <div class="circle pink">
                    <i class="${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.APPROVED_ORDERS].ICON_CLASS}"></i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.APPROVED_ORDERS].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
        </div>
    </div>
    `;
}

// Get the view of the Pending Approval Requests
export function getPendingApprovalRequestsView(pPendingApprovalRequestData, pUniqueKey, pPageID)
{
    // Get the data for the title based on the page that is being visited
    let titleData = getTitleData(pPageID);

    // Get the filters to show the orders regarding the page
    let ordersFilters = getOrdersFiltersForPage(pPageID);

    // Get the link to the home page
    let homePageLink = getHomePageLink(pUniqueKey);

    return `
        <head>
            <title>Country Manager Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.SIDEBAR.JS)}"></script>
        </head>
        <div aria-live="polite"  role="alert" aria-atomic="true" >
            <div role="alert" class="toast" style="position: absolute; top: 5px; right: 5px; min-width: 200px;" data-delay="10000">
                <div class="toast-header" style="background-color: #FAD2D2;">
                <strong class="mr-auto">Error</strong>
                </div>
                <div class="toast-body" id="error-message">
                </div>
            </div>
        </div>
        <div class="wrapper">
            <div class="sidebar-view">
                ${getSidebarView(pPendingApprovalRequestData)}
            </div>
            <div class="body">
                <div class= "header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="country-manager-portal-title"><h3>Country Manager Portal</h3></a>
                        <div>
                            ${getBackButton("Back")}
                        </div>
                    </div>
                    <div>
                        <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                    </div>
                </div>
                <div class="country-manager-portal">
                    <div class="category-title-wrapper">
                        <div class="circle category-title pink">
                            ${titleData.icon}
                        </div>
                        <span class="category-title">${titleData.title}</span>
                    </div>
                    <div id="category-lines-wrapper">
                        ${getOrdersListView(pPendingApprovalRequestData, pPageID, ordersFilters.vendorOrTOVSide, ordersFilters.returnPendingPIFile, ordersFilters.returnPendingLoadPlan, ordersFilters.returnLoadPlan, ordersFilters.returnApproved, pUniqueKey)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get the data for the title based on the page that is being visited
function getTitleData(pPageID)
{
    let title = constants.TITLE_DATA_BY_CATEGORY[pPageID].TITLE;
    let icon;
    if (pPageID === constants.PAGES_IDS.PENDING_TOV)
    {
        icon = '<i class="tov-logo">T O V</i>';
    }
    else
    {
        icon = `<i class="${constants.TITLE_DATA_BY_CATEGORY[pPageID].ICON_CLASS}"></i>`;
    }
    
    return {
        "title": title,
        "icon": icon
    }
}

// Get the filters to show the orders regarding the page
function getOrdersFiltersForPage(pPageID)
{
    let vendorOrTOVSide;
    let returnPendingPIFile;
    let returnPendingLoadPlan;
    let returnLoadPlan;
    let returnApproved;
    switch(pPageID)
    {
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
    }
}

// Get the list of orders based on some filters
function getOrdersListView(pPendingApprovalRequestData, pPageID, pVendorOrTOVSide, pReturnPendingPIFile, pReturnPendingLoadPlan, pReturnLoadPlan, pReturnApproved, pUniqueKey)
{
    let processedApprovalRequests = [];
    let ordersRows = '';

    for (let i = 0; i < pPendingApprovalRequestData.length; i++)
    {
        let approvalRequestID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID];
        let approved = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
        let PIFileUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
        let loadPlanUploaded = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
        let isnComplete = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        let vendorOrTOVSide = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];

        // Return the orders regarding the filters of the page
        let noApprovedCondition = !pReturnApproved && !approved && vendorOrTOVSide === pVendorOrTOVSide;
        let pendingPIFileCondition = pReturnPendingPIFile && approved && !PIFileUploaded;
        let pendingLoadPlanCondition = pReturnPendingLoadPlan && approved && PIFileUploaded && (!loadPlanUploaded || !isnComplete);
        let loadPlanCondition = pReturnLoadPlan && approved && PIFileUploaded && loadPlanUploaded && isnComplete;
        let approvedCondition = pReturnApproved && approved && PIFileUploaded && loadPlanUploaded && isnComplete;
        if ((noApprovedCondition || pendingPIFileCondition || pendingLoadPlanCondition || approvedCondition) && processedApprovalRequests.indexOf(approvalRequestID) === -1)
        {
            processedApprovalRequests.push(approvalRequestID);

            let purchaseOrderID = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
            let link = `${functions.getCurrentSuiteletURL(false)}&key=${pUniqueKey}&id=${approvalRequestID}&po=${purchaseOrderID}&page=${pPageID}`;

            let date = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE] ? String(pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE]).split(' ')[0] : '';
            let purchaseOrderName = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] : '';
            let expectedShipDate = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] : '';
            let shipAddressee = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE] ? String(pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE]).replace(' Stock', '') : '';
            let total = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_TOTAL] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_TOTAL] : '';
            let approvalStatus = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] : '';
            let vendorName = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] ? pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] : '';
            let isReplacement = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT];
            let isDropship = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_DROPSHIP];
            let isRenegade = pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_RENEGADE];

            let nonRegularOrderSpan = '';
            if (isReplacement)
            {
                nonRegularOrderSpan = '<span class="parts-order">Parts</span>';
            }
            else if (isDropship)
            {
                nonRegularOrderSpan = '<span class="dropship-order">Dropship</span>';
            }
            else if (isRenegade)
            {
                nonRegularOrderSpan = `<img style="width: 35px;" src="${constants.RENEGADE_LOGO_URL}"></img>`;
            }
    
            ordersRows += `
            <tr class="item-line">
                <td class="order-link"> <a class="view-order-link" href="${link}">View</a> </td>
                <td class="order-date"> <span>${date}</span> </td>
                <td class="order-name"> <span>${purchaseOrderName}</span> </td>
                <td class="order-ship-date"> <span>${expectedShipDate}</span> </td>
                <td class="order-shipaddres"> <span>${shipAddressee}</span> </td>
                <td class="order-total"> <span>$${total}</span> </td>
                <td class="order-approval-status"> <span>${approvalStatus}</span> </td>
                <td class="order-vendor"> <span>${vendorName}</span> </td>
                ${isReplacement || isDropship || isRenegade ? `<td class="order-is-nonregular"> ${nonRegularOrderSpan} </td>` : '<td></td>'}
            </tr>
            `;
        }
        else if (loadPlanCondition)
        {
            let inboundShipmentID = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.ISN_INTERNALID];
            let link = functions.getCurrentSuiteletURL(false);
            link = link + `&id=${pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID]}&po=${pPendingApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER]}&isn=${inboundShipmentID}`;
            (pPageID) ? link += `&page=${pPageID}` : {};

            let inboundShipmentNumber = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_NUMBER];
            let currentReadyDate = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.CURRENT_READY_DATE];
            let destination = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.DESTINATION_LOCATION];
            let bookingStatus = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.BOOKING_STATUS];
            let shipmentStatus = pPendingApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_STATUS];

            ordersRows += `
            <tr class="item-line">
                <td class="order-link"> <a class="view-order-link" href="${link}">View</a> </td>
                <td class="order-name"> <span>${inboundShipmentNumber}</span> </td>
                <td class="order-date"> <span>${currentReadyDate}</span> </td>
                <td class="order-destination"> <span>${destination}</span> </td>
                <td class="order-booking-status"> <span>${bookingStatus}</span> </td>
                <td class="order-shipment-status"> <span>${shipmentStatus}</span> </td>
            </tr>
            `;
        }
    }

    let ordersView = ordersRows.length > 0 ? `
    <div class="table-responsive country-manager-orders-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    ${pReturnLoadPlan ? `
                    <th><span>ISN #</span></th>
                    <th><span>Current Ready Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Booking Status</span></th>
                    <th><span>Shipment Status</span></th>
                    ` : `
                    <th><span>Date</span></th>
                    <th><span>PO #</span></th>
                    <th><span>Expected Ready Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Amount</span></th>
                    <th><span>Approval Status</span></th>
                    <th><span>Vendor</span></th>
                    `}
                </tr>
            </thead>
            <tbody id="item-lines">
                ${ordersRows}
            </tbody>
        </table>
    </div>
    ` : `<h5 style="text-align: center;"> No Orders Here! </h5>`;

    return ordersView;
}

// Get the view of a specific Purchase Order
export function getPurchaseOrderView(pPendingApprovalRequestData, pApprovalRequestData, pPurchaseOrderData, pApprovalRequestCommentsData, pUniqueKey, pPageID)
{
    let requestApproved = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED];
    let PIFileUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
    let loadPlanUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
    let isnComplete = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
    let PIFile = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE];
    let loadPlan = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN];

    let homePageLink = getHomePageLink(pUniqueKey);
    let isPendingLoadPlanPage = pPageID === "pending-load-plan";

    return `
        <head>
            <title>Country Manager Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.SIDEBAR.JS)}"></script>
        </head>
        <div aria-live="polite"  role="alert" aria-atomic="true" >
            <div role="alert" class="toast" style="position: absolute; top: 5px; right: 5px; min-width: 200px;" data-delay="10000">
                <div class="toast-header" style="background-color: #FAD2D2;">
                <strong class="mr-auto">Error</strong>
                </div>
                <div class="toast-body" id="error-message">
                </div>
            </div>
        </div>
        <div class="wrapper">
            <div class="sidebar-view">
                ${getSidebarView(pPendingApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="country-manager-portal-title"><h3>Country Manager Portal</h3></a>
                        <span class="vendor-header">${pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME]}</span>
                        <div>
                            ${getBackButton("Back")}
                        </div>
                    </div>
                    <div>
                    ${pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO] ?
                        `<div>
                            <img class="vendor-logo" src="${functions.getFileUrl(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO])}">
                        </div>` 
                        : ""
                    }
                    </div>
                    <div>
                        <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                    </div>
                </div>
                <div class="country-manager-portal">
                    <div class="summary-area">
                        ${getSummaryView(pPurchaseOrderData, pApprovalRequestData, requestApproved)}
                    </div>
                    <div id="items-area">
                        ${getItemsView(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.ITEMS], isPendingLoadPlanPage)}
                    </div>
                    <div id="general-comment-area">
                        <p><strong>General Comment:</strong></p>
                        <p id="general-comment-body"></p>
                    </div>
                    ${getMainButtonsView(requestApproved, PIFileUploaded, loadPlanUploaded, isnComplete)}
                    <div id="comments-area">
                        <nav>
                            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                                <a class="nav-item nav-link active" id="nav-last-tab" data-toggle="tab" href="#nav-last" role="tab" aria-controls="nav-last" aria-selected="true">Last Message</a>
                                <a class="nav-item nav-link" id="nav-history-tab" data-toggle="tab" href="#nav-history" role="tab" aria-controls="nav-history" aria-selected="false">Interaction History</a>
                                ${PIFileUploaded ? `<a class="nav-item nav-link" id="nav-pi-file-tab" data-toggle="tab" href="#nav-pi-file" role="tab" aria-controls="nav-pi-file" aria-selected="false">PI File</a>` : ""}
                                ${loadPlanUploaded ? `<a class="nav-item nav-link" id="nav-load-plan-file-tab" data-toggle="tab" href="#nav-load-plan-file" role="tab" aria-controls="nav-load-plan-file" aria-selected="false">Load Plan</a>` : ""}
                            </div>
                        </nav>
                        <div class="tab-content" id="nav-tabContent">
                            ${getLastCommentView(pApprovalRequestCommentsData[0])}
                            ${getCommentsInteractionView(pApprovalRequestCommentsData)}
                            ${PIFileUploaded ? getPIFileView(PIFile) : ""}
                            ${loadPlanUploaded ? getLoadPlanFileView(loadPlan) : ""}
                        </div>
                    </div>
                    <div class="terms-and-conditions-area">
                        <div class="terms-and-conditions-title">
                            ${constants.TERMS_AND_CONDITIONS.TITLE}
                        </div>
                        <div class="terms-and-conditions-text">
                            ${constants.TERMS_AND_CONDITIONS.TEXT}
                        </div>
                    </div>
                    ${getViewCommentModal()}
                    ${getAddGeneralCommentModal()}
                    ${getLoadingModal()}
                </div>
            </div>
        </div>
    `;
}

// Get the view of a specific Purchase Order
export function getInboundShipmentView(pPendingApprovalRequestData, pApprovalRequestData, pInboundShipmentData, pApprovalRequestCommentsData, pUniqueKey)
{
    let requestApproved = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED];
    let PIFileUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
    let loadPlanUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
    let isnComplete = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
    let PIFile = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE];
    let loadPlan = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN];

    let homePageLink = getHomePageLink(pUniqueKey);

    return `
        <head>
            <title>Country Manager Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.COUNTRY_MANAGER_PORTAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.SIDEBAR.JS)}"></script>
        </head>
        <div aria-live="polite"  role="alert" aria-atomic="true" >
            <div role="alert" class="toast" style="position: absolute; top: 5px; right: 5px; min-width: 200px;" data-delay="10000">
                <div class="toast-header" style="background-color: #FAD2D2;">
                <strong class="mr-auto">Error</strong>
                </div>
                <div class="toast-body" id="error-message">
                </div>
            </div>
        </div>
        <div class="wrapper">
            <div class="sidebar-view">
                ${getSidebarView(pPendingApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="country-manager-portal-title"><h3>Country Manager Portal</h3></a>
                        <span class="vendor-header">${pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME]}</span>
                        <div>
                            ${getBackButton("Back")}
                        </div>
                    </div>
                    <div>
                    ${pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.LOGO] ?
                        `<div>
                            <img class="vendor-logo" src="${functions.getFileUrl(pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.LOGO])}">
                        </div>` 
                        : ""
                    }
                    </div>
                    <div>
                        <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                    </div>
                </div>
                <div class="country-manager-portal">
                    <div class="summary-area">
                        ${getInboundShipmentSummaryView(pInboundShipmentData)}
                    </div>
                    <div id="items-area">
                        ${getInboundShipmentItemsView(pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.ITEMS])}
                    </div>
                    <div id="general-comment-area">
                        <p><strong>General Comment:</strong></p>
                        <p id="general-comment-body"></p>
                    </div>
                    ${getMainButtonsView(requestApproved, PIFileUploaded, loadPlanUploaded, isnComplete)}
                    <div id="comments-area">
                        <nav>
                            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                                <a class="nav-item nav-link active" id="nav-last-tab" data-toggle="tab" href="#nav-last" role="tab" aria-controls="nav-last" aria-selected="true">Last Message</a>
                                <a class="nav-item nav-link" id="nav-history-tab" data-toggle="tab" href="#nav-history" role="tab" aria-controls="nav-history" aria-selected="false">Interaction History</a>
                                ${PIFileUploaded ? `<a class="nav-item nav-link" id="nav-pi-file-tab" data-toggle="tab" href="#nav-pi-file" role="tab" aria-controls="nav-pi-file" aria-selected="false">PI File</a>` : ""}
                                ${loadPlanUploaded ? `<a class="nav-item nav-link" id="nav-load-plan-file-tab" data-toggle="tab" href="#nav-load-plan-file" role="tab" aria-controls="nav-load-plan-file" aria-selected="false">Load Plan</a>` : ""}
                            </div>
                        </nav>
                        <div class="tab-content" id="nav-tabContent">
                            ${getLastCommentView(pApprovalRequestCommentsData[0])}
                            ${getCommentsInteractionView(pApprovalRequestCommentsData)}
                            ${PIFileUploaded ? getPIFileView(PIFile) : ""}
                            ${loadPlanUploaded ? getLoadPlanFileView(loadPlan) : ""}
                        </div>
                    </div>
                    <div class="terms-and-conditions-area">
                        <div class="terms-and-conditions-title">
                            ${constants.TERMS_AND_CONDITIONS.TITLE}
                        </div>
                        <div class="terms-and-conditions-text">
                            ${constants.TERMS_AND_CONDITIONS.TEXT}
                        </div>
                    </div>
                    ${getViewCommentModal()}
                    ${getAddGeneralCommentModal()}
                    ${getLoadingModal()}
                </div>
            </div>
        </div>
    `;
}

// Get the link to the home page
function getHomePageLink(pUniqueKey)
{
    let link = `${functions.getCurrentSuiteletURL(false)}&key=${pUniqueKey}`;
    return link;
}

// Get the Back button
function getBackButton(pButtonText)
{
    return `<a onclick="getBackLink()" class="btn btn-light go-back-link">${pButtonText}</a>`;
}

// Get the summary view for Purchase Orders
function getSummaryView(pPurchaseOrderData, pApprovalRequestData, pRequestApproved)
{
    let newShipDate = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE];
    let subTotal = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SUBTOTAL]);
    let vendorDiscount = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_DISCOUNT]);
    let cbm = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM]);
    let containerCount = Math.ceil(cbm / constants.GENERAL.CONTAINER_COUNT_LIMIT);
    let isReplacement = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT];
    let isDropship = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER];
    let isRenegade = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO];

    let summaryView = `
    <div>
        <span class="po-number"> ${pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TRANID]} - ${pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME]}</span>
        ${isReplacement ? `
        <div class="order-is-replacement">
            <span class="parts-order">Parts</span>
        </div>
        ` : ""}
        ${isDropship ? `
        <div class="order-is-dropship">
            <span class="dropship-order">Dropship</span>
        </div>
        ` : ""}
        ${isRenegade ? `
        <div class="order-is-renegade">
            <img style="width: 35px; margin: 0 10px 0 0;" src="${constants.RENEGADE_LOGO_URL}"></img>
        </div>
        ` : ""}
        ${pRequestApproved ? `
        <div class="order-is-approved">
            <div class="alert alert-success" role="alert">
                This order is already approved!
            </div>
        </div>
    ` : ""}
    </div>
    <div class="summary-tables-section">        
        <table class="table table-bordered summary-table delivery-details-table">
            <thead>
                <tr>
                    <th colspan="5" class="summary-head">Delivery Details</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>Destination Address:<br></strong>${pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SHIPADDRESS]}
                    </td>
                </tr>
                <tr>
                    <td class="summary-ship-date">
                    <strong>Latest Cargo Ship Date: </strong>
                    <div class="line-actual-shipdate-wrapper">
                        <span class="line-actual-shipdate">${newShipDate}</span>
                    </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-bordered summary-table">
            <thead>
                <tr>
                    <th colspan="5" class="summary-head">Order Summary</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>Subtotal: </strong>$${subTotal}
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Vendor Discount: </strong>-$${vendorDiscount}
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Total: </strong>$${pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL]}
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Total CBM: </strong>${cbm}
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Average Container Count: </strong>${containerCount}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `;

    return summaryView;
}

// Get the summary view for Inbound Shipments
function getInboundShipmentSummaryView(pInboundShipmentData)
{

    let summaryView = `
    <div>
        <span class="po-number"> Inbound Shipment: ${pInboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER]} </span>
    </div>    
    `;

    return summaryView;
}

// Get the view for the items of the Purchase Order
function getItemsView(pData, pIsPendingLoadPlanPage)
{
    let itemsRows = '';
    let thereAreVendorChanges = false;

    for (let i = 0; i < pData.length; i++)
    {
        if (!pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.TOV)
        {
            thereAreVendorChanges = true;
        }

        let status;
        if (pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED])
        {
            status = "Approved";
        }
        else if (pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR])
        {
            status = "Accepted by Vendor";
        }
        else
        {
            status = "Pending";
        }

        let lineKey = pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_KEY] ? pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_KEY] : '';
        let itemID = pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_ID] ? pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_ID] : '';
        let itemName = pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_NAME] ? pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_NAME] : '';
        let itemDisplayName = pData[i][constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME] ? pData[i][constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME] : '';
        let quantityOnShipments = pData[i][constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS] ? pData[i][constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS] : 0;
        let purchasePrice = pData[i][constants.PURCHASE_ORDER_OBJECT.PURCHASE_PRICE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.PURCHASE_PRICE] : '';
        let tariffDiscount = pData[i][constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT] ? pData[i][constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT] : '';
        let amount = pData[i][constants.PURCHASE_ORDER_OBJECT.AMOUNT] ? pData[i][constants.PURCHASE_ORDER_OBJECT.AMOUNT] : '';
        let cbm = pData[i][constants.PURCHASE_ORDER_OBJECT.CBM] ? pData[i][constants.PURCHASE_ORDER_OBJECT.CBM] : '';
        let fabricCode = pData[i][constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE] : '';
        let tovComments = !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.VENDOR ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] : '';
        let requiredChanges = !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.TOV ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] : '';

        itemsRows += `
        <tr class="item-line">
            <td class="line-key" style="display: none"> <span>${lineKey}</span> </td>
            <td class="item-id" style="display: none"> <span>${itemID}</span> </td>
            <td class="item-name"> <span>${itemName}</span> </td>
            <td class="item-display-name"> <span>${itemDisplayName}</span> </td>
            <td class="line-quantity">
                <span class="line-actual-quantity">${pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY]}</span>
            </td>
            ${pIsPendingLoadPlanPage ? `
            <td class="line-quantity-shipments"> <span>${quantityOnShipments}</span> </td>
            ` : ""}
            <td class="line-purchase-price"> <span>${purchasePrice}</span> </td>
            <td class="line-tariff-discount"> <span>${tariffDiscount}</span> </td>
            <td class="line-rate">
                <span class="line-actual-rate">${pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE]}</span>
            </td>
            <td class="line-amount"> <span>${amount}</span> </td>
            <td class="line-fabric-code"> <span>${fabricCode}</span> </td>
            <td class="line-cbm"> <span>${cbm}</span> </td>
            <td class="line-status"> <span>${status}</span> </td>
            <td class="line-tov-changes"><span>${tovComments}</span></td>
            <td class="line-vendor-changes"> <span>${requiredChanges}</span> </td>
            <td class="line-action-selected" style="display: none">${status}</td>
        </tr>
        `;
    }

    // Remove line comments cell if no TOV comments
    if (!thereAreVendorChanges)
    {
        itemsRows = itemsRows.replace(/<td class="line-vendor-changes">(.*?)<\/td>/g, '');
    }

    let itemsView = `
    <div class="table-responsive country-manager-items-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                <th><span>Item</span></th>
                <th><span>Description</span></th>
                <th><span>Quantity</span></th>
                ${pIsPendingLoadPlanPage ? "<th><span>Quantity On Shipments</span></th>" : ""}
                <th><span>Purchase Price</span></th>
                <th><span>Tariff Discount</span></th>
                <th><span>Rate</span></th>
                <th><span>Amount</span></th>
                <th><span>Fabric Code</span></th>
                <th><span>CBM</span></th>
                <th><span>Status</span></th>
                <th><span>TOV Changes</span></th>
                ${thereAreVendorChanges ? `<th><span>Vendor Changes</span></th>` : ''}
                </tr>
            </thead>
            <tbody id="item-lines">
                ${itemsRows}
            </tbody>
        </table>
    </div>
    `;

    return itemsView;
}

// Get the view for the items of the Inbound Shipment
function getInboundShipmentItemsView(pData)
{
    let itemsRows = '';

    for (let i = 0; i < pData.length; i++)
    {
        let itemID = pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_ID] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_ID] : '';
        let itemName = pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_NAME] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_NAME] : '';
        let itemDisplayName = pData[i][constants.INBOUND_SHIPMENT_OBJECT.DISPLAY_NAME] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.DISPLAY_NAME] : '';
        let purchaseOrder = pData[i][constants.INBOUND_SHIPMENT_OBJECT.PURCHASE_ORDER] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.PURCHASE_ORDER] : '';
        let quantityExpected = pData[i][constants.INBOUND_SHIPMENT_OBJECT.QUANTITY_EXPECTED] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.QUANTITY_EXPECTED] : 0;

        itemsRows += `
        <tr class="item-line">
            <td class="item-id" style="display: none"> <span>${itemID}</span> </td>
            <td class="item-name"> <span>${itemName}</span> </td>
            <td class="item-display-name"> <span>${itemDisplayName}</span> </td>
            <td class="item-purchase-order"> <span>${purchaseOrder}</span> </td>
            <td class="line-quantity"> <span>${quantityExpected}</span> </td>
        </tr>
        `;
    }

    let itemsView = `
    <div class="table-responsive country-manager-items-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                <th><span>Item</span></th>
                <th><span>Description</span></th>
                <th><span>Purchase Order</span></th>
                <th><span>Quantity</span></th>
                </tr>
            </thead>
            <tbody id="item-lines">
                ${itemsRows}
            </tbody>
        </table>
    </div>
    `;

    return itemsView;
}

// Get the view of the main buttons
function getMainButtonsView(pRequestApproved, pPIFileUploaded, pLoadPlanUploaded, pISNComplete)
{
    let mainButtonsView;
    
    if (pRequestApproved)
    {
        if (!pPIFileUploaded)
        {
            mainButtonsView = `
            <div style="text-align: center; margin: 0 0 15px 0;">
                <div class="alert alert-warning" role="alert">All lines were approved but still pending the PI File from Vendor.</div>
            </div>
            `;
        }
        else if (!pLoadPlanUploaded)
        {
            mainButtonsView = `
            <div style="text-align: center; margin: 0 0 15px 0;">
                <div class="alert alert-warning" role="alert">All lines were approved and the PI File was uploaded but still pending the Load Plan from Vendor.</div>
            </div>
            `;
        }
        else if (!pISNComplete)
        {
            mainButtonsView = `
            <div style="text-align: center; margin: 0 0 15px 0;">
                <div class="alert alert-warning" role="alert">All lines were approved, the PI File and Load Plan were uploaded, still pending the creation of the Inbound Shipment for this order!</div>
            </div>
            `;
        }
        else
        {
            mainButtonsView = "";
        }
    }
    else
    {
        mainButtonsView = "";
    }

    return mainButtonsView;
}

// Get the view for the last comment
function getLastCommentView(pApprovalRequestLastComment)
{
    let lastCommentView = '<div class="tab-pane fade show active last-comment-view" id="nav-last" role="tabpanel" aria-labelledby="nav-last-tab">';

    if (pApprovalRequestLastComment)
    {
        lastCommentView += `
            <p>${pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT]}</p>
            <br />
            ${pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] ? `<p><strong>General Comment:</strong> ${pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT]}</p> <br />` : ''}
            <p class="comment-from"><b style="margin-right: 5px;">·</b>From <strong>${pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV]}</strong> on <strong>${pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE]}</strong></p>
        `;
    }
    else
    {
        lastCommentView += '<p style="font-size: 16px;">No Comments!</p>';
    }

    lastCommentView += '</div>';

    return lastCommentView;
}

// Get the view for the comments interaction
function getCommentsInteractionView(pApprovalRequestCommentsData)
{
    let itemsRows = '';

    for (let i = 0; i < pApprovalRequestCommentsData.length; i++)
    {
        itemsRows += `
        <tr>
            <td id="comment-view"><span>View Details</span></td>
            <td id="comment-date">${pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE] : ''}</td>
            <td id="comment-from">${pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV] : ''}</td>
            <td id="general-comment">${pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT]: ''}</td>
            <td id="hidden-items-comments" style="display: none;"> ${pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT]: ''}</td>
        </tr>
        `;
    }

    let commentsInteractionView = '<div class="tab-pane fade" id="nav-history" role="tabpanel" aria-labelledby="nav-history-tab">';

    if (pApprovalRequestCommentsData.length > 0)
    {
        commentsInteractionView += `
            <table class="table table-bordered table-striped comments-table">
                <thead>
                    <tr>
                        <th><span>View</span></th>
                        <th><span>Date</span></th>
                        <th><span>From</span></th>
                        <th><span>General Comment</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
            </table>
        `;
    }
    else
    {
        commentsInteractionView += '<p>No Comments!</p>';
    }

    commentsInteractionView += '</div>'
    return commentsInteractionView;
}

// Get the view for the PI file
function getPIFileView(pPIFile)
{
    let PIFIleName = "";
    let PIFIleURL = "";
    if (pPIFile)
    {
        let fileData = model.getFileData(pPIFile);
        PIFIleName = fileData.name;
        PIFIleURL = fileData.url;
    }

    let PIFileView = `
    <div class="tab-pane fade" id="nav-pi-file" role="tabpanel" aria-labelledby="nav-pi-file-tab">
        <p class="pi-file-name">${PIFIleName}</p>
        <a id="btn-download-pi" href="${PIFIleURL}" target="_blank" class="badge badge-secondary">Download</a>
    </div>
    `;

    return PIFileView;
}

// Get the view for the Load Plan
function getLoadPlanFileView(pLoadPlanFile)
{
    let loadPlanFileName = "";
    let loadPlanFileURL = "";
    if (pLoadPlanFile)
    {
        let fileData = model.getFileData(pLoadPlanFile);
        loadPlanFileName = fileData.name;
        loadPlanFileURL = fileData.url;
    }

    let loadPlanFileView = `
    <div class="tab-pane fade" id="nav-load-plan-file" role="tabpanel" aria-labelledby="nav-load-plan-file-tab">
        <p class="load-plan-file-name">${loadPlanFileName}</p>
        <a id="btn-download-load-plan" href="${loadPlanFileURL}" target="_blank" class="badge badge-secondary">Download</a>
    </div>
    `;

    return loadPlanFileView;
}

// Get the modal for the View Comment
function getViewCommentModal()
{
    let viewCommentModal = `
    <div class="modal" id="see-comment-modal" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Comment</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p id="modal-items-comment"></p>
                    <p id="modal-general-comment"></p>
                    <p id="modal-comment-date-and-from"></p>
                </div>
            </div>
        </div>
    </div>
    `;

    return viewCommentModal;
}

// Get the modal for add a General Comment
function getAddGeneralCommentModal()
{
    let addGeneralCommentModal = `
    <div class="modal add-general-comment-modal" id="add-general-comment-modal" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add General Comment</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <span>Add a comment for the Vendor</span>
                    <textarea rows="8"></textarea>
                    <button type="button" id="btn-save-general-comment" class="btn btn-primary">Save</button>
                </div>
            </div>
        </div>
    </div>
    `;

    return addGeneralCommentModal;
}

// Get the loading modal
function getLoadingModal()
{
    let loadingModal = `
    <div class="modal" id="loading-modal" role="dialog">
        <div class="modal-dialog modal-md modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="spinner-border text-light" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>        
        </div>
    </div>
    `;

    return loadingModal;
}

// Get thanks page after submitting the data
export function getErrorPage(pErrorMessage, pSmallText)
{
    let errorHtml = `
        <head>
            <title>Country Manager Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.PO_PLANNER_PORTAL.JS)}"></script>
        </head>
        <div class= "header">
        <div class="main-title">
            <h3>Country Manager Portal</h3>
        </div>
            <div>
                <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
            </div>
        </div>
        <body>
            <div class="error-message">
                ${pSmallText ? `<p>${pErrorMessage}</p>` : `<h3>${pErrorMessage}</h3>`}
            </div>
        </body>`;

    return errorHtml;
}
