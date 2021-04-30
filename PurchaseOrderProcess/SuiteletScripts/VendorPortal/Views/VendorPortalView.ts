/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as log from 'N/log';

import * as model from '../Models/VendorPortalModel';
import * as constants from '../../../Global/Constants';
import * as functions from '../../../Global/Functions';

// Get the view of the Home Page
export function getHomePage(pVendors, pVendorData, pVendorApprovalRequestData) {
    // Get the link to the home page
    let homePageLink = getHomePageLink();

    // Get the data for the notification on the categories
    let categoriesNotificationsData = getCategoriesNotificationsData(pVendorApprovalRequestData, pVendors, pVendorData);

    return `
        <head>
            <title>Vendor Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.HOME.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.JS)}"></script>
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
                ${getSidebarView(pVendorApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="vendor-portal-title"><h3>Vendor Portal</h3></a>
                        ${pVendorData ? `<span class="vendor-header">${pVendorData[constants.VENDOR.FIELDS.ALTNAME]}</span>` : ""}
                    </div>
                    ${pVendorData && pVendorData[constants.VENDOR.FIELDS.LOGO] && pVendorData[constants.VENDOR.FIELDS.LOGO][0] && pVendorData[constants.VENDOR.FIELDS.LOGO][0].text ?
                    `<div>
                        <img class="vendor-logo" src="${pVendorData[constants.VENDOR.FIELDS.LOGO][0].text}">
                    </div>` : ""}
                    <div>
                        <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                    </div>
                </div>
                <div class="vendor-portal home-page">
                    ${getCategoriesView(categoriesNotificationsData)}
                </div>
            </div>
        </div>
    `;
}

// Get the data for the notification on the categories
function getCategoriesNotificationsData(pVendorApprovalRequestData, pVendors, pVendorData) {
    let processedApprovalRequests = [];
    let pendingVendor = 0;
    let pendingTOV = 0;
    let pendingPIFIle = 0;
    let pendingLoadPlan = 0;
    let pendingPartsOrders = 0;
    let approved = 0;

    // Get the quantity of each category
    for (let i = 0; i < pVendorApprovalRequestData.length; i++) {
        let approvalRequestID = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID];

        let isApproved = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
        let PIFileUploaded = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
        let loadPlanUploaded = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
        let isnComplete = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        let vendorOrTOVSide = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
        let isPartsOrder = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT];

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

    // Validate if pending ETA submission
    let pendingETASubmission = pVendors.length === 1 ? pVendorData && pVendorData[constants.VENDOR.FIELDS.PENDING_ETA_SUBMISSION] : checkIfSomeVendorWithPendingETA(pVendors);

    return {
        "pendingVendor": pendingVendor !== 0 ? pendingVendor : "",
        "pendingTOV": pendingTOV !== 0 ? pendingTOV : "",
        "pendingPIFIle": pendingPIFIle !== 0 ? pendingPIFIle : "",
        "pendingLoadPlan": pendingLoadPlan !== 0 ? pendingLoadPlan : "",
        "pendingPartsOrders": pendingPartsOrders !== 0 ? pendingPartsOrders : "",
        "approved": approved !== 0 ? approved : "",
        "pendingETASubmission": pendingETASubmission
    };
}

// Validate if some of the Vendors is pending to submit the ETA data
function checkIfSomeVendorWithPendingETA(pVendors)
{
    let pendingETASubmission = false;
    for (let i = 0; i < pVendors.length; i++)
    {
        let vendorID = pVendors[i];
        let vendorData = model.getVendorData(vendorID);
        let vendorIsPendingETASubmission = vendorData[constants.VENDOR.FIELDS.PENDING_ETA_SUBMISSION];
        if (vendorIsPendingETASubmission)
        {
            pendingETASubmission = true;
            break;
        }
    }

    return pendingETASubmission;
}

// Get the view of the navbar
export function getSidebarView(pVendorApprovalRequestData) {
    let searchItemsArray = getSearchItemsArray(pVendorApprovalRequestData, "home");

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
                    <li><a href="${functions.getCurrentSuiteletURL(true)}&page=${constants.PAGES_IDS.CREATE_LOAD_PLAN}">Create New ISN</a></li>
                    <li><a href="${functions.getCurrentSuiteletURL(true)}&page=${constants.PAGES_IDS.RESET_PASSWORD}">Reset Password</a></li>
                    <li><a href="${functions.getSuiteletURL(constants.SCRIPTS.PORTAL_LOGIN.ID, constants.SCRIPTS.PORTAL_LOGIN.DEPLOY, true)}&logout=true">Log Out</a></li>
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
function getSearchItemsArray(pVendorApprovalRequestData, pPageID) {
    let processedNames = [];
    let itemsObj = {
        "names": [],
        "data": {}
    };

    for (let i = 0; i < pVendorApprovalRequestData.length; i++) {
        let link = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PAGE_LINK];
        (pPageID) ? link += `&page=${pPageID}` : {};
        let name = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] : '';

        if (processedNames.indexOf(name) === -1) {
            itemsObj["names"].push(name);
            itemsObj["data"][name] = {
                "pageLink": link
            };

            processedNames.push(name);
        }
    }

    return itemsObj;
}

// Get the view of the categories grid
function getCategoriesView(pCategoriesNotificationsData) {
    return `
    <div class="categories">
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.PENDING_VENDOR}">
                <div class="circle pink">
                    ${!pCategoriesNotificationsData.pendingVendor ? "" : `
                    <div class="circle-notification">
                        <span>${pCategoriesNotificationsData.pendingVendor}</span>
                    </div>`}
                    <i class="${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_VENDOR].ICON_CLASS}"></i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_VENDOR].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.PENDING_TOV}">
                <div class="circle pink">
                    ${!pCategoriesNotificationsData.pendingTOV ? "" : `
                    <div class="circle-notification">
                        <span>${pCategoriesNotificationsData.pendingTOV}</span>
                    </div>`}
                    <i class="tov-logo">T O V</i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_TOV].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.PENDING_PI}">
                <div class="circle pink">
                    ${!pCategoriesNotificationsData.pendingPIFIle ? "" : `
                    <div class="circle-notification">
                        <span>${pCategoriesNotificationsData.pendingPIFIle}</span>
                    </div>`}
                    <i class="${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_PI].ICON_CLASS}"></i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_PI].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.PENDING_LOAD_PLAN}">
                <div class="circle pink">
                    ${!pCategoriesNotificationsData.pendingLoadPlan ? "" : `
                    <div class="circle-notification">
                        <span>${pCategoriesNotificationsData.pendingLoadPlan}</span>
                    </div>`}
                    <i class="${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_LOAD_PLAN].ICON_CLASS}"></i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PENDING_LOAD_PLAN].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.LOAD_PLANS}">
                <div class="circle pink">
                    ${!pCategoriesNotificationsData.pendingETASubmission ? "" : `
                    <div class="circle-notification">
                        <span>!</span>
                    </div>`}
                    <i class="${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.LOAD_PLANS].ICON_CLASS}"></i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.LOAD_PLANS].TITLE}</span>
            </div>
        </div>
        <div class="category-wrapper">
            <div class="category" id="${constants.PAGES_IDS.PARTS_ORDERS}">
                <div class="circle pink">
                    ${!pCategoriesNotificationsData.pendingPartsOrders ? "" : `
                    <div class="circle-notification">
                        <span>${pCategoriesNotificationsData.pendingPartsOrders}</span>
                    </div>`}
                    <i class="${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PARTS_ORDERS].ICON_CLASS}"></i>
                </div>
                <span class="category-title">${constants.TITLE_DATA_BY_CATEGORY[constants.PAGES_IDS.PARTS_ORDERS].TITLE}</span>
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
    </div>
    `;
}

// Get the view of the Approval Requests of the Vendor
export function getLoadPlansView(pVendorApprovalRequestData, pVendorData, pIsMultipleVendors, pETASection, pPageID) {
    // Get the data for the title based on the page that is being visited
    let titleData = getTitleData(pPageID);

    // Get the link to the home page
    let homePageLink = getHomePageLink();

    // Get the orders view
    let ordersView = getShipmentsListView(pVendorApprovalRequestData, pETASection, pPageID);

    return `
        <head>
            <title>Vendor Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.ETA_PAGE.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.SIDEBAR.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.ETA_PAGE.JS)}"></script>
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
                ${getSidebarView(pVendorApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="vendor-portal-title"><h3>Vendor Portal</h3></a>
                        ${!pIsMultipleVendors && pVendorData ? `<span class="vendor-header">${pVendorData[constants.VENDOR.FIELDS.ALTNAME]}</span>` : ""}
                        <div>
                            ${getBackButton("Back")}
                        </div>
                    </div>
                    ${!pIsMultipleVendors && pVendorData[constants.VENDOR.FIELDS.LOGO] && pVendorData[constants.VENDOR.FIELDS.LOGO][0] && pVendorData[constants.VENDOR.FIELDS.LOGO][0].text ?
                    `<div>
                        <img class="vendor-logo" src="${pVendorData[constants.VENDOR.FIELDS.LOGO][0].text}">
                    </div>`
                    : "" }
                    <div>
                        <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                    </div>
                </div>
                <div class="vendor-portal">
                    <div class="category-title-wrapper">
                        <div class="circle category-title pink">
                            ${titleData.icon}
                        </div>
                        <span class="category-title">${titleData.title}</span>
                        <a class="btn-create-isn-link" style="position:absolute; right:20px;" href="${functions.getCurrentSuiteletURL(true)}&page=${constants.PAGES_IDS.CREATE_LOAD_PLAN}"><i class="fa fa-plus" aria-hidden="true"></i> Create New ISN</a>
                    </div>
                    ${filterForShipmentsView()}
                    <div id="category-lines-wrapper">
                        ${ordersView}
                    </div>
                    ${getLoadingModal()}
                </div>
            </div>
        </div>
    `;
}

// Get the view of the Approval Requests of the Vendor
export function getVendorApprovalRequestsView(pVendorApprovalRequestData, pVendorData, pIsMultipleVendors, pPageID) {
    // Get the data for the title based on the page that is being visited
    let titleData = getTitleData(pPageID);

    // Get the link to the home page
    let homePageLink = getHomePageLink();

    // Get the filters to show the orders regarding the page
    let ordersFilters = getOrdersFiltersForPage(pPageID);

    // Get the orders view
    let ordersView = "";
    if (ordersFilters.returnApprovedParts) {
        ordersView = getPartsOrdersListView(pVendorApprovalRequestData, pIsMultipleVendors, pPageID);
    }
    else if (ordersFilters.returnLoadPlan) {
        // ordersView = getShipmentsListView(pVendorApprovalRequestData, pPageID);
    }
    else {
        ordersView = getOrdersListView(pVendorApprovalRequestData, pIsMultipleVendors, pPageID, ordersFilters);
    }

    return `
        <head>
            <title>Vendor Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.JS)}"></script>
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
                ${getSidebarView(pVendorApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="vendor-portal-title"><h3>Vendor Portal</h3></a>
                        ${pVendorData ? `<span class="vendor-header">${pVendorData[constants.VENDOR.FIELDS.ALTNAME]}</span>` : ""}
                        <div>
                            ${getBackButton("Back")}
                        </div>
                    </div>
                    ${pVendorData && pVendorData[constants.VENDOR.FIELDS.LOGO] && pVendorData[constants.VENDOR.FIELDS.LOGO][0] && pVendorData[constants.VENDOR.FIELDS.LOGO][0].text ?
                    `<div>
                        <img class="vendor-logo" src="${pVendorData[constants.VENDOR.FIELDS.LOGO][0].text}">
                    </div>`
                    : "" }
                    <div>
                        <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                    </div>
                </div>
                <div class="vendor-portal">
                    <div class="category-title-wrapper ${ordersFilters.returnApprovedParts ? 'parts-orders' : ''}">
                        <div class="circle category-title pink">
                            ${titleData.icon}
                        </div>
                        <span class="category-title">${titleData.title}</span>
                    </div>
                    ${ordersFilters.returnLoadPlan ? `
                        ${filterForShipmentsView()}
                    ` : ""}
                    <div id="category-lines-wrapper">
                        ${ordersView}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get the data for the title based on the page that is being visited
export function getTitleData(pPageID) {
    let title = constants.TITLE_DATA_BY_CATEGORY[pPageID].TITLE;
    let icon;
    if (pPageID === constants.PAGES_IDS.PENDING_TOV) {
        icon = '<i class="tov-logo">T O V</i>';
    }
    else {
        icon = `<i class="${constants.TITLE_DATA_BY_CATEGORY[pPageID].ICON_CLASS}"></i>`;
    }

    return {
        "title": title,
        "icon": icon
    }
}

// Get the filters to show the orders regarding the page
function getOrdersFiltersForPage(pPageID) {
    let vendorOrTOVSide = null;
    let returnPendingPIFile = false;
    let returnPendingLoadPlan = false;
    let returnLoadPlan = false;
    let returnApproved = false;
    let returnApprovedParts = false;
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
    }
}

// Create the filters for the shipments page
function filterForShipmentsView()
{
    return `
    <div id="orders-search-wrapper" class="orders-search-wrapper">
        <label for="orders-search-input" class="orders-search-label">ISN #</label>
        <input id="orders-search-input" name="orders-search-input" onkeyup="updateOrdersSearchResult('isnNumber', '.shipment-number span')" onsearch="updateOrdersSearchResult('isnNumber', '.shipment-number span')" type="search" placeholder="Search" />
        <label for="booking-status-filter" class="orders-search-label">Booking Status</label>
        <select id="booking-status-filter" onchange="updateOrdersSearchResult('bookingStatus', '.order-booking-status span')">
            <option value="none"></option>
            <option value="booking-approved">Booking Approved</option>
            <option value="booking-denied">Booking Denied-Pending changes</option>
            <option value="pending-booking">Pending Booking</option>
        </select>
    </div>
    `;
}

// Get the list of orders based on some filters
function getOrdersListView(pVendorApprovalRequestData, pIsMultipleVendors, pPageID, pFilters) {
    let processedApprovalRequests = [];
    let ordersRows = '';

    for (let i = 0; i < pVendorApprovalRequestData.length; i++) {
        // Get data of the approval request
        let approvalRequestID = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID];
        let approved = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
        let PIFileUploaded = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
        let loadPlanUploaded = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
        let isnComplete = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        let vendorOrTOVSide = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
        let isPartsOrder = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT];

        // Return the orders regarding the filters of the page
        let noApprovedCondition = !pFilters.returnApproved && !isPartsOrder && !approved && vendorOrTOVSide === pFilters.vendorOrTOVSide;
        let pendingPIFileCondition = pFilters.returnPendingPIFile && !isPartsOrder && approved && !PIFileUploaded;
        let pendingLoadPlanCondition = pFilters.returnPendingLoadPlan && !isPartsOrder && approved && PIFileUploaded && (!loadPlanUploaded || !isnComplete);
        let loadPlanCondition = pFilters.returnLoadPlan && !isPartsOrder && approved && PIFileUploaded && loadPlanUploaded && isnComplete;
        let approvedCondition = pFilters.returnApproved && !isPartsOrder && approved && PIFileUploaded && loadPlanUploaded && isnComplete;
        
        if (processedApprovalRequests.indexOf(approvalRequestID) === -1 && !loadPlanCondition) {
            processedApprovalRequests.push(approvalRequestID);

            // Get data of the order
            let purchaseOrderID = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
            let link = `${functions.getCurrentSuiteletURL(true)}&po=${purchaseOrderID}&page=${pPageID}`;
            let date = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE] ? String(pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE]).split(' ')[0] : '';
            let purchaseOrderName = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] : '';
            let expectedShipDate = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] : '';
            let shipAddressee = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE] ? String(pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE]).replace(' Stock', '') : '';
            let total = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.TOTAL] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.TOTAL] : '';
            let approvalStatus = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] : '';
            let vendorName = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] : '';

            if (noApprovedCondition || pendingPIFileCondition || pendingLoadPlanCondition || approvedCondition) {

                // Check if it is a non-regular order
                let nonRegularOrderSpan = '';
                let isDropship = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_DROPSHIP];
                let isRenegade = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_RENEGADE];
 
                if (isDropship) {
                    nonRegularOrderSpan = '<span class="dropship-order">Dropship</span>';
                }
                else if (isRenegade) {
                    nonRegularOrderSpan = `<img style="width: 35px;" src="${constants.RENEGADE_LOGO_URL}"></img>`;
                }

                // Add the order to the orders view
                ordersRows += `
                <tr class="item-line">
                    <td class="order-link"> <a class="view-order-link" href="${link}">View</a> </td>
                    <td class="order-date"> <span>${date}</span> </td>
                    <td class="order-name"> <span>${purchaseOrderName}</span> </td>
                    <td class="order-ship-date"> <span>${expectedShipDate}</span> </td>
                    <td class="order-shipaddres"> <span>${shipAddressee}</span> </td>
                    <td class="order-total"> <span>$${total}</span> </td>
                    <td class="order-approval-status"> <span>${approvalStatus}</span> </td>
                    ${pIsMultipleVendors ? `<td class="order-vendor"> <span>${vendorName}</span> </td>` : ""}
                    ${nonRegularOrderSpan ? `<td class="order-is-nonregular"> ${nonRegularOrderSpan} </td>` : '<td></td>'}
                </tr>`;
            }
        }
    }

    // Set the wrapper of the orders view
    let ordersView = ordersRows.length > 0 ? `
    <div class="table-responsive vendor-orders-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    <th><span>Date</span></th>
                    <th><span>PO #</span></th>
                    <th><span>Expected Ready Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Amount</span></th>
                    <th><span>Approval Status</span></th>
                    ${pIsMultipleVendors ? "<th><span>Vendor</span></th>" : ""}
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

// Get the list of orders based on some filters
function getPartsOrdersListView(pVendorApprovalRequestData, pIsMultipleVendors, pPageID) {
    let processedApprovalRequests = [];
    let unapprovedOrdersRows = '';
    let approvedOrdersRows = '';
    let shippedOrdersRows = '';

    for (let i = 0; i < pVendorApprovalRequestData.length; i++) {
        let approvalRequestID = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.INTERNALID];
        let approved = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
        let isnComplete = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        let vendorOrTOVSide = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
        let isPartsOrder = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT];
        let isnShipped = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_SHIPPED];
        
        if (processedApprovalRequests.indexOf(approvalRequestID) === -1) {
            processedApprovalRequests.push(approvalRequestID);

            let purchaseOrderID = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
            let link = `${functions.getCurrentSuiteletURL(true)}&po=${purchaseOrderID}&page=${pPageID}`;

            let date = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE] ? String(pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.DATE]).split(' ')[0] : '';
            let purchaseOrderName = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_NAME] : '';
            let expectedShipDate = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_EXPECTED_SHIP_DATE] : '';
            let shipAddressee = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE] ? String(pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_SHIPADDRESSEE]).replace(' Stock', '') : '';
            let total = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.TOTAL] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.TOTAL] : '';
            let approvalStatus = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_APPROVAL_STATUS] : '';
            let vendorName = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.VENDOR] : '';

            if (isPartsOrder) {
                let partsShipMethod = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_PARTS_SHIP_METHOD] ? pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_PARTS_SHIP_METHOD] : '';
                let orderStatus = isnShipped ? "Shipped" : isnComplete ? "Completed" : "Pending";

                let row = `
                <tr class="item-line">
                    <td class="order-link"> <a class="view-order-link" href="${link}">View</a> </td>
                    <td class="order-date"> <span>${date}</span> </td>
                    <td class="order-name"> <span>${purchaseOrderName}</span> </td>
                    <td class="order-ship-date"> <span>${expectedShipDate}</span> </td>
                    <td class="order-shipaddres"> <span>${shipAddressee}</span> </td>
                    <td class="order-total"> <span>$${total}</span> </td>
                    <td class="order-approval-status"> <span>${approvalStatus}</span> </td>
                    ${pIsMultipleVendors ? `<td class="order-vendor"> <span>${vendorName}</span> </td>` : ""}
                    <td> <span>${partsShipMethod}</span> </td>
                    <td> <span>${orderStatus}</span> </td>
                    ${!approved ? `<td class="order-vendor-tov-side"> <span>${vendorOrTOVSide}</span> </td>` : ""}
                </tr>`;

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
    let unapprovedOrdersView = unapprovedOrdersRows.length > 0 ? `
    <div class="table-responsive vendor-orders-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    <th><span>Date</span></th>
                    <th><span>PO #</span></th>
                    <th><span>Expected Ready Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Amount</span></th>
                    <th><span>Approval Status</span></th>
                    ${pIsMultipleVendors ? "<th><span>Vendor</span></th>" : ""}
                    <th><span>Ship Method</span></th>
                    <th><span>Status</span></th>
                    <th><span>Pending Action</span></th>
                </tr>
            </thead>
            <tbody id="item-lines">
                ${unapprovedOrdersRows}
            </tbody>
        </table>
    </div>
    ` : `<h5 style="text-align: center;"> No Orders Here! </h5>`;

    // Approved orders view
    let approvedOrdersView = approvedOrdersRows.length > 0 ? `
    <div class="table-responsive vendor-orders-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    <th><span>Date</span></th>
                    <th><span>PO #</span></th>
                    <th><span>Expected Ready Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Amount</span></th>
                    <th><span>Approval Status</span></th>
                    ${pIsMultipleVendors ? "<th><span>Vendor</span></th>" : ""}
                    <th><span>Ship Method</span></th>
                    <th><span>Status</span></th>
                </tr>
            </thead>
            <tbody id="item-lines">
                ${approvedOrdersRows}
            </tbody>
        </table>
    </div>
    ` : `<h5 style="text-align: center;"> No Orders Here! </h5>`;

    // Shipped orders view
    let shippedOrdersView = shippedOrdersRows.length > 0 ? `
    <div class="table-responsive vendor-orders-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    <th><span>Date</span></th>
                    <th><span>PO #</span></th>
                    <th><span>Expected Ready Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Amount</span></th>
                    <th><span>Approval Status</span></th>
                    ${pIsMultipleVendors ? "<th><span>Vendor</span></th>" : ""}
                    <th><span>Ship Method</span></th>
                    <th><span>Status</span></th>
                </tr>
            </thead>
            <tbody id="item-lines">
                ${shippedOrdersRows}
            </tbody>
        </table>
    </div>
    ` : `<h5 style="text-align: center;"> No Orders Here! </h5>`;

    // Return the complete parts orders list view
    let partsOrdersListView = `
    <div id="parts-order-tables-area">
        <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                <a class="nav-item nav-link active" id="nav-pending-approval-tab" data-toggle="tab" href="#nav-pending-approval" role="tab" aria-controls="nav-pending-approval" aria-selected="true">Pending Approval</a>
                <a class="nav-item nav-link" id="nav-approved-tab" data-toggle="tab" href="#nav-approved" role="tab" aria-controls="nav-approved" aria-selected="true">Approved</a>
                <a class="nav-item nav-link" id="nav-shipped-tab" data-toggle="tab" href="#nav-shipped" role="tab" aria-controls="nav-shipped" aria-selected="true">Shipped</a>
            </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show parts-order-tab-pane active" id="nav-pending-approval" role="tabpanel" aria-labelledby="nav-pending-approval-tab">
                ${unapprovedOrdersView}
            </div>
            <div class="tab-pane fade show parts-order-tab-pane" id="nav-approved" role="tabpanel" aria-labelledby="nav-approved-tab">
                ${approvedOrdersView}
            </div>
            <div class="tab-pane fade show parts-order-tab-pane" id="nav-shipped" role="tabpanel" aria-labelledby="nav-shipped-tab">
                ${shippedOrdersView}
            </div>
        </div>
    </div>
    `;

    return partsOrdersListView;
}

// Get the list of shipments based on some filters
function getShipmentsListView(pVendorApprovalRequestData, pETASection, pPageID) {
    let processedInboundShipments = [];
    let toBeShippedShipRows = '';
    let inTransitShipRows = '';
    let partReceivedShipRows = '';
    let receivedShipRows = '';
    let closedShipRows = '';

    for (let i = 0; i < pVendorApprovalRequestData.length; i++) {
        // Get data of the approval request
        let approved = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.APPROVED];
        let PIFileUploaded = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
        let loadPlanUploaded = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
        let isnComplete = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
        let isPartsOrder = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER_IS_REPLACEMENT];
        let inboundShipmentID = pVendorApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.ISN_INTERNALID];

        // Return the orders regarding the filters of the page
        let loadPlanCondition = !isPartsOrder && approved && PIFileUploaded && loadPlanUploaded && isnComplete;
        if (loadPlanCondition && inboundShipmentID && processedInboundShipments.indexOf(inboundShipmentID) === -1) {
            processedInboundShipments.push(inboundShipmentID);

            // Get data of the shipments
            let purchaseOrderID = pVendorApprovalRequestData[i][constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER];
            let link = `${functions.getCurrentSuiteletURL(true)}&po=${purchaseOrderID}&isn=${inboundShipmentID}&page=${pPageID}`;
            let inboundShipmentNumber = pVendorApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_NUMBER];
            let currentReadyDate = pVendorApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.CURRENT_READY_DATE];
            let confirmedDepartureDate = pVendorApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.CONFIRMED_DEPARTURE_DATE];
            let destination = pVendorApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.DESTINATION_LOCATION];
            let bookingStatus = pVendorApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.BOOKING_STATUS];
            let shipmentStatus = pVendorApprovalRequestData[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_STATUS];

            // Add the shipment to the orders view
            let row = `
            <tr class="item-line">
                <td class="order-link"> <a class="view-order-link" href="${link}">View</a> </td>
                <td class="shipment-number"> <span>${inboundShipmentNumber}</span> </td>
                <td class="order-date"> <span>${currentReadyDate}</span> </td>
                <td class="departure-date"> <span>${confirmedDepartureDate}</span> </td>
                <td class="order-destination"> <span>${destination}</span> </td>
                <td class="order-booking-status"> <span>${bookingStatus}</span> </td>
                <td class="order-shipment-status"> <span>${shipmentStatus}</span> </td>
            </tr>
            `;

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
    let toBeShippedShipView = toBeShippedShipRows.length > 0 ? `
    <div class="table-responsive shipments-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    <th><span>ISN #</span></th>
                    <th><span>Current Ready Date</span></th>
                    <th><span>Confirmed Departure Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Booking Status</span></th>
                    <th><span>Shipment Status</span></th>
                </tr>
            </thead>
            <tbody id="item-lines">
                ${toBeShippedShipRows}
            </tbody>
        </table>
    </div>
    ` : `<h5 style="text-align: center;"> No Shipments Here! </h5>`;

    // In transit view
    let inTransitShipView = inTransitShipRows.length > 0 ? `
    <div class="table-responsive shipments-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    <th><span>ISN #</span></th>
                    <th><span>Current Ready Date</span></th>
                    <th><span>Confirmed Departure Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Booking Status</span></th>
                    <th><span>Shipment Status</span></th>
                </tr>
            </thead>
            <tbody id="item-lines">
                ${inTransitShipRows}
            </tbody>
        </table>
    </div>
    ` : `<h5 style="text-align: center;"> No Shipments Here! </h5>`;
    
    // Partially received view
    let partReceivedShipView = partReceivedShipRows.length > 0 ? `
    <div class="table-responsive shipments-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    <th><span>ISN #</span></th>
                    <th><span>Current Ready Date</span></th>
                    <th><span>Confirmed Departure Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Booking Status</span></th>
                    <th><span>Shipment Status</span></th>
                </tr>
            </thead>
            <tbody id="item-lines">
                ${partReceivedShipRows}
            </tbody>
        </table>
    </div>
    ` : `<h5 style="text-align: center;"> No Shipments Here! </h5>`;

    // Received view
    let receivedShipView = receivedShipRows.length > 0 ? `
    <div class="table-responsive shipments-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    <th><span>ISN #</span></th>
                    <th><span>Current Ready Date</span></th>
                    <th><span>Confirmed Departure Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Booking Status</span></th>
                    <th><span>Shipment Status</span></th>
                </tr>
            </thead>
            <tbody id="item-lines">
                ${receivedShipRows}
            </tbody>
        </table>
    </div>
    ` : `<h5 style="text-align: center;"> No Shipments Here! </h5>`;

    // Closed view
    let closedShipView = closedShipRows.length > 0 ? `
    <div class="table-responsive shipments-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    <th><span>ISN #</span></th>
                    <th><span>Current Ready Date</span></th>
                    <th><span>Confirmed Departure Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Booking Status</span></th>
                    <th><span>Shipment Status</span></th>
                </tr>
            </thead>
            <tbody id="item-lines">
                ${closedShipRows}
            </tbody>
        </table>
    </div>
    ` : `<h5 style="text-align: center;"> No Shipments Here! </h5>`;

    // Return the complete parts orders list view
    let shipmentsListView = `
    <div id="load-plans-tables-area">
        <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                <a class="nav-item nav-link active" id="nav-to-be-shipped-tab" data-toggle="tab" href="#nav-to-be-shipped" role="tab" aria-controls="nav-to-be-shipped" aria-selected="true">To Be Shipped</a>
                <a class="nav-item nav-link" id="nav-in-transit-tab" data-toggle="tab" href="#nav-in-transit" role="tab" aria-controls="nav-in-transit" aria-selected="true">In Transit</a>
                <a class="nav-item nav-link" id="nav-partially-received-tab" data-toggle="tab" href="#nav-partially-received" role="tab" aria-controls="nav-partially-received" aria-selected="true">Partially Received</a>
                <a class="nav-item nav-link" id="nav-received-tab" data-toggle="tab" href="#nav-received" role="tab" aria-controls="nav-received" aria-selected="true">Received</a>
                <a class="nav-item nav-link" id="nav-closed-tab" data-toggle="tab" href="#nav-closed" role="tab" aria-controls="nav-closed" aria-selected="true">Closed</a>
            </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show shipment-tab-pane active" id="nav-to-be-shipped" role="tabpanel" aria-labelledby="nav-to-be-shipped-tab">
                ${pETASection}
            </div>
            <div class="tab-pane fade show shipment-tab-pane" id="nav-in-transit" role="tabpanel" aria-labelledby="nav-in-transit-tab">
                ${inTransitShipView}
            </div>
            <div class="tab-pane fade show shipment-tab-pane" id="nav-partially-received" role="tabpanel" aria-labelledby="nav-partially-received-tab">
                ${partReceivedShipView}
            </div>
            <div class="tab-pane fade show shipment-tab-pane" id="nav-received" role="tabpanel" aria-labelledby="nav-received-tab">
                ${receivedShipView}
            </div>
            <div class="tab-pane fade show shipment-tab-pane" id="nav-closed" role="tabpanel" aria-labelledby="nav-closed-tab">
                ${closedShipView}
            </div>
        </div>
    </div>
    `;

    return shipmentsListView;
}

// Get the main view of a purchase order
export function getPurchaseOrderView(pPurchaseOrderData, pVendorApprovalRequestData, pApprovalRequestData, pApprovalRequestCommentsData, pUniqueKey, pPageID) {
    // Get some data required on the view
    let requestApproved = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED];
    let vendorOrTOVSide = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
    let PIFileUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
    let loadPlanUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
    let isnComplete = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
    let PIFile = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE];
    let loadPlan = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN];
    let relatedInbounds = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.RELATED_ISNS];
    let isDropship = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER];

    let homePageLink = getHomePageLink();
    let isPendingLoadPlanPage = pPageID === "pending-load-plan";

    return `
        <head>
            <title>Vendor Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.JS)}"></script>
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
                ${getSidebarView(pVendorApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="vendor-portal-title"><h3>Vendor Portal</h3></a>
                        <span class="vendor-header">${pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_NAME]}</span>
                        <div>
                            ${getBackButton("Back")}
                        </div>
                    </div>
                    <div>
                        ${pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO] 
                            ?`<div>
                                <img class="vendor-logo" src="${functions.getFileUrl(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.LOGO])}">
                             </div>`
                            : "" }
                    </div>
                    <div>
                        <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                    </div>
                </div>
                <div class="vendor-portal">
                    <div class="summary-area">
                        ${getSummaryView(pPurchaseOrderData, pApprovalRequestData, requestApproved)}
                    </div>
                    ${getMainButtonsView(requestApproved, vendorOrTOVSide, PIFileUploaded, loadPlanUploaded, isnComplete)}
                    <div id="items-area">
                        ${getItemsView(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.ITEMS], isPendingLoadPlanPage)}
                    </div>
                    <div id="general-comment-area">
                        <p><strong>General Comment:</strong></p>
                        <p id="general-comment-body"></p>
                    </div>
                    <div id="comments-area">
                        <nav>
                            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                                <a class="nav-item nav-link active" id="nav-last-tab" data-toggle="tab" href="#nav-last" role="tab" aria-controls="nav-last" aria-selected="true">Last Message</a>
                                <a class="nav-item nav-link" id="nav-history-tab" data-toggle="tab" href="#nav-history" role="tab" aria-controls="nav-history" aria-selected="false">Interaction History</a>
                                <a class="nav-item nav-link" id="nav-related-isn-tab" data-toggle="tab" href="#nav-related-isn" role="tab" aria-controls="nav-related-isn" aria-selected="false">Load Plans</a>
                                ${PIFileUploaded ? `<a class="nav-item nav-link" id="nav-pi-file-tab" data-toggle="tab" href="#nav-pi-file" role="tab" aria-controls="nav-pi-file" aria-selected="false">PI File</a>` : ""}
                                ${loadPlanUploaded && !isDropship ? `<a class="nav-item nav-link" id="nav-load-plan-file-tab" data-toggle="tab" href="#nav-load-plan-file" role="tab" aria-controls="nav-load-plan-file" aria-selected="false">Load Plan File</a>` : ""}
                            </div>
                        </nav>
                        <div class="tab-content" id="nav-tabContent">
                            ${getLastCommentView(pApprovalRequestCommentsData[0])}
                            ${getCommentsInteractionView(pApprovalRequestCommentsData)}
                            ${getRelatedInboundView({
                                inboundShipmentData: relatedInbounds, 
                                poId: pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER], 
                                uniqueKey: pUniqueKey, 
                                pageID: pPageID
                            })}
                            ${PIFileUploaded ? getPIFileView(PIFile) : ""}
                            ${loadPlanUploaded && !isDropship ? getLoadPlanFileView(loadPlan) : ""}
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
                    ${getShipdateChangeReasonModal()}
                    ${getAcceptanceConfirmationModal(isDropship)}
                    ${getUploadPIFileModal()}
                    ${getUploadLoadPlanModal()}
                    ${getLoadingModal()}
                </div>
            </div>
        </div>
    `;
}

// Get the main view of a inbound shipment
// Modificate 23 - 02 -2021 by Bryan Badilla
// Add new param to append Edit INS View in portal vendor
export function getInboundShipmentView(pInboundShipmentData, pVendorApprovalRequestData, pApprovalRequestData, pApprovalRequestCommentsData, pEditView) {
    // Get some data required on the view
    let requestApproved = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED];
    let vendorOrTOVSide = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE];
    let PIFileUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE_UPLOADED];
    let loadPlanUploaded = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN_UPLOADED];
    let isnComplete = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.ISN_COMPLETE];
    let PIFile = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.PI_FILE];
    let loadPlan = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LOAD_PLAN];
    let shipmentRelatedFiles = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.SHIPMENT_RELATED_FILES];

    let isn_id = pInboundShipmentData["shipmentnumber"];

    let homePageLink = getHomePageLink();

    return `
        <head>
            <title>Vendor Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.CREATE_IS.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.SIDEBAR.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.EDIT_IS.JS)}"></script>
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
                ${getSidebarView(pVendorApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="vendor-portal-title"><h3>Vendor Portal</h3></a>
                        <span class="vendor-header">${pInboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.VENDOR_NAME]}</span>
                        <div>
                            ${getBackButton("Back")}
                        </div>
                    </div>
                    <div>
                    ${pInboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.LOGO] ?
                    `<div>
                        <img class="vendor-logo" src="${functions.getFileUrl(pInboundShipmentData[constants.INBOUND_SHIPMENT_OBJECT.LOGO])}">
                    </div>` : "" }
                    </div>
                    <div>
                        <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                    </div>
                </div>
                <div class="vendor-portal">
                    <div class="summary-area">
                        ${getInboundShipmentSummaryView(pInboundShipmentData, pApprovalRequestData, requestApproved)}
                    </div>
                    ${getShipmentButtonsView(pInboundShipmentData)}
                    <div id="buttons-area">
                        <div class = "general-buttons-area">
                            <button type="button" class="btn btn-primary" id="btn-edit"  >Edit ISN</button>
                            <button type="button" class="btn btn-primary" style="display: none;" id="btn-cancel" >Cancel</button>
                            <button type="button" class="btn btn-primary" style="display: none;" id="btn-add-line" onclick="addLine(\`${pEditView.data.options}\`, \`${pEditView.data.initCont}\`)">Add Row</button>
                            <button type="button" class="btn btn-primary" style="display: none;" id="btn-add-group-items" onclick="getOptions(\`${pEditView.data.options}\`, \`${pEditView.data.dataInfo}\`, \`${pEditView.data.initCont}\` )">Add Multiple Lines</button>
                        </div>
                        <div class = "submit-buttons-area">
                            <button type="button" class="btn btn-primary" id="btn-save" onclick="createLPHandleSubmit(\`${isn_id}\`)" >Submit Data</button>
                        </div>
                    </div>
                    <div id="items-area">
                        ${pEditView.notEditable}    
                    </div>
                    </br>
                    <span id="editable-data" style="display: none;">${pEditView.editable}</span>
                    <span id="not-editable-data" style="display: none;">${pEditView.notEditable}</span>
                    <div id="general-comment-area">
                        <p><strong>General Comment:</strong></p>
                        <p id="general-comment-body"></p>
                    </div>
                    <div id="submitted-shipment-files-area">
                    </div>
                    <div id="comments-area">
                        <nav>
                            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                                <a class="nav-item nav-link active" id="nav-last-tab" data-toggle="tab" href="#nav-last" role="tab" aria-controls="nav-last" aria-selected="true">Last Message</a>
                                <a class="nav-item nav-link" id="nav-history-tab" data-toggle="tab" href="#nav-history" role="tab" aria-controls="nav-history" aria-selected="false">Interaction History</a>
                                ${PIFile.length > 0 ? `<a class="nav-item nav-link" id="nav-pi-file-tab" data-toggle="tab" href="#nav-pi-file" role="tab" aria-controls="nav-pi-file" aria-selected="false">PI File</a>` : ""}
                                ${loadPlan.length > 0 ? `<a class="nav-item nav-link" id="nav-load-plan-file-tab" data-toggle="tab" href="#nav-load-plan-file" role="tab" aria-controls="nav-load-plan-file" aria-selected="false">Load Plan</a>` : ""}
                                ${shipmentRelatedFiles.length > 0 ? `<a class="nav-item nav-link" id="nav-shipment-files-tab" data-toggle="tab" href="#nav-shipment-files" role="tab" aria-controls="nav-shipment-files" aria-selected="false">Shipment Related Files</a>` : ""}
                            </div>
                        </nav>
                        <div class="tab-content" id="nav-tabContent">
                            ${getLastCommentView(pApprovalRequestCommentsData[0])}
                            ${getCommentsInteractionView(pApprovalRequestCommentsData)}
                            ${PIFile.length > 0 ? getPIFileView(PIFile) : ""}
                            ${loadPlan.length > 0 ? getLoadPlanFileView(loadPlan) : ""}
                            ${shipmentRelatedFiles.length > 0 ? getShipmentRelatedFilesView(JSON.parse(shipmentRelatedFiles)) : "" }
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
                    ${getUploadShipmentFilesModal()}
                    ${getMarkAsInTransitModal()}
                    ${getUploadPIFileModal()}
                    ${getUploadLoadPlanModal()}
                    ${getLoadingModal()}
                </div>
            </div>
        </div>
    `;
}

// Get the link to the home page
export function getHomePageLink() {
    let link = `${functions.getCurrentSuiteletURL(true)}`;
    return link;
}

// Get the Back button
export function getBackButton(pButtonText) {
    return `<a onclick="getBackLink()" class="btn btn-light go-back-link">${pButtonText}</a>`;
}

// Get the summary view for Purchase Orders
function getSummaryView(pPurchaseOrderData, pApprovalRequestData, pRequestApproved) {
    let shipAddress = pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SHIPADDRESS];
    let shipMethod = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.PARTS_SHIP_METHOD];
    let newShipDate = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE];
    let lastShipDate = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE];
    let shipDateChangeReason = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.SHIPDATE_CHANGE_REASON];
    let subTotal = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.SUBTOTAL]);
    let vendorDiscount = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.VENDOR_DISCOUNT]);
    let total = pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL];
    let cbm = Number(pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM]);
    let containerCount = Number(cbm / constants.GENERAL.CONTAINER_COUNT_LIMIT).toFixed(2);
    let isReplacement = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT];
    let isDropship = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.IS_DROPSHIP_ORDER];
    let isRenegade = pPurchaseOrderData[constants.PURCHASE_ORDER.FIELDS.RENEGADE_PO];

    let summaryView = `
    <div>
        <span class="po-number"> Purchase Order: ${pPurchaseOrderData[constants.PURCHASE_ORDER_OBJECT.TRANID]} </span>
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
        ${pRequestApproved || pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.TOV ? "" : `
        <button type="button" class="btn btn-danger btn-edit-shipdate" style="display: block;"><i class="far fa-edit"></i></button>
        <button type="button" class="btn btn-success btn-sm btn-accept-change-shipdate" style="display: none;"><i class="fas fa-check"></i></button>
        <button type="button" class="btn btn-danger btn-sm btn-cancel-change-shipdate" style="display: none;"><i class="fas fa-times"></i></button>
        `}
        <table class="table table-bordered summary-table delivery-details-table">
            <thead>
                <tr>
                    <th colspan="5" class="summary-head">Delivery Details</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div><strong>Destination Address:<br></strong>${shipAddress}</div>
                    </td>
                </tr>
                ${shipMethod ? `
                <tr>
                    <td>
                        <div><strong>Shipping Method:<br></strong>${shipMethod}</div>
                    </td>
                </tr>
                ` : ""}
                <tr>
                    <td class="summary-ship-date">
                        <strong>Latest Cargo Ship Date: </strong>
                        ${!pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED] && pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] && pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] !== pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] ? `
                        <div class="line-last-shipdate-wrapper">
                            <span class="line-last-shipdate-label">Req</span>
                            <span class="line-last-shipdate">${lastShipDate}</span>
                        </div>
                        <div class="line-new-shipdate-wrapper">
                            <span class="line-new-shipdate-label">New</span>
                            <span class="line-new-shipdate">${newShipDate}</span>
                        </div>
                        <span class="change-reason-label">
                            <strong>Change Reason: </strong>
                        </span>
                        <div class="shipdate-change-reason-wrapper">
                            <span class="shipdate-change-reason">${shipDateChangeReason}</span>
                        </div>` : `
                        <div class="line-actual-shipdate-wrapper">
                            <span class="line-actual-shipdate">${newShipDate}</span>
                        </div>
                        `}
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
                <tr class="subtotal">
                    <td>
                        <strong>Subtotal: </strong><span>$${subTotal}</span>
                    </td>
                </tr>
                <tr class="vendor-discount">
                    <td>
                        <strong>Vendor Discount: </strong><span>${vendorDiscount !== 0 ? `-$${vendorDiscount}` : `$${vendorDiscount}`}</span>
                    </td>
                </tr>
                <tr class="total">
                    <td>
                        <strong>Total: </strong><span>$${total}</span>
                    </td>
                </tr>
                <tr class="total-cbm">
                    <td>
                        <strong>Total CBM: </strong><span>${cbm}</span>
                    </td>
                </tr>
                <tr class="container-count">
                    <td>
                        <strong>Container Count: </strong><span>${containerCount}</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `;

    return summaryView;
}

// Get the summary view for Inbound Shipments
function getInboundShipmentSummaryView(pInboundShipmentData, pApprovalRequestData, pRequestApproved) {
    let newShipDate = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE];
    let lastShipDate = pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE];

    let summaryView = `
    <div>
        <span class="po-number"> Inbound Shipment: ${pInboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_NUMBER]} </span>
    </div>
    <!--
    <div class="summary-tables-section">
        ${pRequestApproved || pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.TOV ? "" : `
        <button type="button" class="btn btn-danger btn-edit-shipdate" style="display: block;"><i class="far fa-edit"></i></button>
        <button type="button" class="btn btn-success btn-sm btn-accept-change-shipdate" style="display: none;"><i class="fas fa-check"></i></button>
        <button type="button" class="btn btn-danger btn-sm btn-cancel-change-shipdate" style="display: none;"><i class="fas fa-times"></i></button>
        `}
        <table class="table table-bordered summary-table delivery-details-table">
            <thead>
                <tr>
                    <th colspan="5" class="summary-head">Delivery Details</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div><strong>Destination Address:<br></strong>${pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.SHIPADDRESS]}</div>
                    </td>
                </tr>
                <tr>
                    <td class="summary-ship-date">
                        <strong>Latest Cargo Ship Date: </strong>
                        ${!pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.APPROVED] && pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] && pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.LAST_SHIP_DATE] !== pApprovalRequestData[constants.APPROVAL_REQUEST.FIELDS.NEW_SHIP_DATE] ? `
                        <div class="line-last-shipdate-wrapper">
                            <span class="line-last-shipdate-label">Req</span>
                            <span class="line-last-shipdate">${lastShipDate}</span>
                        </div>
                        <div class="line-new-shipdate-wrapper">
                            <span class="line-new-shipdate-label">New</span>
                            <span class="line-new-shipdate">${newShipDate}</span>
                        </div>` : `
                        <div class="line-actual-shipdate-wrapper">
                            <span class="line-actual-shipdate">${newShipDate}</span>
                        </div>
                        `}
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
                        <strong>Total: </strong>$${pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.TOTAL]}
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Total CBM: </strong>${pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM]}
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Average Container Count: </strong>${pInboundShipmentData[constants.PURCHASE_ORDER_OBJECT.TOTAL_CBM]}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    -->
    `;

    return summaryView;
}

// Get the view for the items of the Purchase Order
function getItemsView(pData, pIsPendingLoadPlanPage) {
    let itemsRows = '';
    let thereAreTOVChanges = false;

    for (let i = 0; i < pData.length; i++) {
        if (!pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.VENDOR) {
            thereAreTOVChanges = true;
        }

        let status;
        if (pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED]) {
            status = "Approved";
        }
        else if (pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR]) {
            status = "Accepted by Vendor";
        }
        else {
            status = "Pending";
        }

        let showButtons = status == "Pending" && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.VENDOR;

        let lineKey = pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_KEY] ? pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_KEY] : '';
        let itemID = pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_ID] ? pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_ID] : '';
        let itemName = pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_NAME] ? pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_NAME] : '';
        let itemDisplayName = pData[i][constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME] ? pData[i][constants.PURCHASE_ORDER_OBJECT.DISPLAY_NAME] : '';
        let lastQuantity = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] : '';
        let newQuantity = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] : '';
        let quantityOnShipments = pData[i][constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS] ? pData[i][constants.PURCHASE_ORDER_OBJECT.QUANTITY_ON_SHIPMENTS] : 0;
        let lastPurchasePrice = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_PURCH_PRICE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_PURCH_PRICE] : '';
        let newPurchasePrice = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_PURCH_PRICE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_PURCH_PRICE] : '';
        let tariffDiscount = pData[i][constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT] ? pData[i][constants.PURCHASE_ORDER_OBJECT.TARIFF_DISCOUNT] : '';
        let newRate = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE] : '';
        let amount = pData[i][constants.PURCHASE_ORDER_OBJECT.AMOUNT] ? pData[i][constants.PURCHASE_ORDER_OBJECT.AMOUNT] : '';
        let lastCBM = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_CBM] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_CBM] : '';
        let newCBM = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_CBM] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_CBM] : '';
        let fabricCode = pData[i][constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE] ? pData[i][constants.PURCHASE_ORDER_OBJECT.FABRIC_CODE] : '';
        // let itemCollab = pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_COLLAB] ? pData[i][constants.PURCHASE_ORDER_OBJECT.ITEM_COLLAB] : '';
        let tovComments = !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.VENDOR ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] : '';
        let requiredChanges = !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && pData[i][constants.PURCHASE_ORDER_OBJECT.VENDOR_OR_TOV_SIDE] === constants.VENDOR_OR_TOV_TEXT.TOV ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQUIRED_CHANGES] : '';

        itemsRows += `
        <tr class="item-line">
            <td class="line-key" style="display: none"> <span>${lineKey}</span> </td>
            <td class="item-id" style="display: none"> <span>${itemID}</span> </td>
            <td class="item-name"> <span>${itemName}</span> </td>
            <td class="item-display-name"> <span>${itemDisplayName}</span> </td>
            <td class="line-quantity"> ${!pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] !== pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] ?
                `<div class="line-last-quantity-wrapper">
                    <span class="line-last-quantity-label">Req</span>
                    <span class="line-last-quantity">${lastQuantity}</span>
                </div>
                <div class="line-new-quantity-wrapper">
                    <span class="line-new-quantity-label">New</span>
                    <span class="line-new-quantity">${newQuantity}</span>
                </div>` :
                `<span class="line-actual-quantity">${newQuantity}</span>`}
            </td>
            ${pIsPendingLoadPlanPage ? `
            <td class="line-quantity-shipments"> <span>${quantityOnShipments}</span> </td>
            ` : ""}
            <td class="line-purchase-price"> ${!pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_RATE] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_RATE] !== pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_RATE] ?
                `<div class="line-last-purchase-price-wrapper">
                    <span class="line-last-purchase-price-label">Req</span>
                    <span class="line-last-purchase-price">${lastPurchasePrice}</span>
                </div>
                <div class="line-new-purchase-price-wrapper">
                    <span class="line-new-purchase-price-label">New</span>
                    <span class="line-new-purchase-price">${newPurchasePrice}</span>
                </div>` :
                `<span class="line-actual-purchase-price">${newPurchasePrice}</span>`}
            </td>
            <td class="line-tariff-discount"> <span>${tariffDiscount}</span> </td>
            <td class="line-rate"> <span>${newRate}</span> </td>
            <td class="line-amount"> <span>${amount}</span> </td>
            <td class="line-fabric-code"> <span>${fabricCode}</span> </td>
            <td class="line-cbm"> ${!pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_APPROVED] && !pData[i][constants.PURCHASE_ORDER_OBJECT.LINE_ACCEPTED_BY_VENDOR] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_CBM] && pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_CBM] !== pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_CBM] ?
                `<div class="line-last-cbm-wrapper">
                    <span class="line-last-cbm-label">Req</span>
                    <span class="line-last-cbm">${lastCBM}</span>
                </div>
                <div class="line-new-cbm-wrapper">
                    <span class="line-new-cbm-label">New</span>
                    <span class="line-new-cbm">${newCBM}</span>
                </div>` :
                `<span class="line-actual-cbm">${newCBM}</span>`}
            </td>
            <td class="line-item-collab"> <span></span> </td>
            <td class="line-status"> <span>${status}</span> </td>
            <td class="line-tov-changes"> <span>${tovComments}</span> </td>
            <td class="line-vendor-changes"><span>${requiredChanges}</span></td>
            <td class="line-action">
                <button type="button" class="btn btn-primary btn-sm btn-accept-line" style="display:none;">Accept</button>
                <button type="button" class="btn btn-primary btn-sm btn-change-line" style="display:none;">Change</button>
                <button type="button" class="btn btn-success btn-sm btn-accept-change" style="display: none;"><i class="fas fa-check"></i></button>
                <button type="button" class="btn btn-danger btn-sm btn-cancel-change" style="display: none;"><i class="fas fa-times"></i></button>
                <div id="line-accepted-alert" class="alert alert-success" role="alert" style="display: none;">Accepted!</div>
                <button type="button" class="btn btn-danger btn-cancel-accepted" style="display: none;"><i class="fas fa-times"></i></button>
                <div id="line-changed-alert" class="alert alert-success" role="alert" style="display: none;">Changed!</div>
                <button type="button" class="btn btn-danger btn-cancel-changed" style="display: none;"><i class="far fa-edit"></i></button>
            </td>
            <td class="line-action-selected" style="display: none">${status}</td>
        </tr>
        `;
    }

    // Remove line comments cell if no TOV comments
    if (!thereAreTOVChanges) {
        itemsRows = itemsRows.replace(/<td class="line-tov-changes">(.*?)<\/td>/g, '');
    }

    let itemsView = `
    <div class="table-responsive">
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
                <th><span>Item Collaboration</span></th>
                <th><span>Status</span></th>
                ${thereAreTOVChanges ? "<th><span>TOV Changes</span></th>" : ""}
                <th><span>Vendor Changes</span></th>
                <th><span>Action</span></th>
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
function getInboundShipmentItemsView(pData) {
    let itemsRows = '';

    for (let i = 0; i < pData.length; i++) {
        let itemID = pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_ID] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_ID] : '';
        let itemName = pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_NAME] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.ITEM_NAME] : '';
        let itemDisplayName = pData[i][constants.INBOUND_SHIPMENT_OBJECT.DISPLAY_NAME] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.DISPLAY_NAME] : '';
        let purchaseOrder = pData[i][constants.INBOUND_SHIPMENT_OBJECT.PURCHASE_ORDER] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.PURCHASE_ORDER] : '';
        let purchaseOrderLocation = pData[i][constants.INBOUND_SHIPMENT_OBJECT.PO_LOCATION] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.PO_LOCATION] : '';
        let isDropshipOrder = purchaseOrderLocation == constants.LOCATIONS.DROPSHIP;
        let quantityExpected = pData[i][constants.INBOUND_SHIPMENT_OBJECT.QUANTITY_EXPECTED] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.QUANTITY_EXPECTED] : 0;
        let rate = pData[i][constants.INBOUND_SHIPMENT_OBJECT.RATE] ? pData[i][constants.INBOUND_SHIPMENT_OBJECT.RATE]: 0;
        let lastQuantity = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_LAST_QTY] : '';
        let newQuantity = pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] ? pData[i][constants.PURCHASE_ORDER_OBJECT.REQ_NEW_QTY] : '';
        
        itemsRows += `
        <tr class="item-lines">
            <td class="item-id" style="display: none"> <span>${itemID}</span> </td>
            <td class="item-name"> <span>${itemName}</span> </td>
            <td class="item-display-name"> <span>${itemDisplayName}</span> </td>
            <td class="item-purchase-order"> <span>${purchaseOrder}</span> ${isDropshipOrder ? `<div class="order-is-dropship"><span class="dropship-order">Dropship</span></div>` : ""} </td>
            <td class="line-quantity"> <span>${quantityExpected}</span> </td>
            <td class="line-rate"> <span>${rate}</span> </td>
            <td class="line-amount"> <span>${Number(quantityExpected)*Number(rate)}</span> </td>
        </tr>
        `;
    }

    let itemsView = `
    <div class="table-responsive">
        <table class="table text-nowrap">
            <thead>
                <tr>
                <th><span>Item</span></th>
                <th><span>Description</span></th>
                <th><span>Purchase Order</span></th>
                <th><span>Quantity</span></th>
                <th><span>Rate</span></th>
                <th><span>Amount</span></th>
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
function getMainButtonsView(pRequestApproved, pVendorOrTOVSide, pPIFileUploaded, pLoadPlanUploaded, pISNComplete) {
    let mainButtonsView;

    if (pRequestApproved) {
        if (!pPIFileUploaded) {
            mainButtonsView = `
            <div style="text-align: center; margin: 0 0 15px 0;">
                <div class="alert alert-warning" role="alert">All lines were approved. Please upload the PI File!</div>
            </div>
            <div id="buttons-area">
                <div class="general-buttons-area">
                    <button type="button" id="btn-add-general-comment" class="btn btn-primary">Add General Comment</button>
                </div>
                <div class="submit-buttons-area">
                    <button type="button" id="btn-submit-data" class="btn btn-primary upload-pi-btn">Upload PI File</button>
                </div>
            </div>
            `;
        }
        else if (!pLoadPlanUploaded) {
            mainButtonsView = `
            <div style="text-align: center; margin: 0 0 15px 0;">
                <div class="alert alert-warning" role="alert">All lines were approved and the PI File was uploaded. Please upload the Load Plan!</div>
            </div>
            <div id="buttons-area">
                <div class="general-buttons-area">
                    <button type="button" id="btn-add-general-comment" class="btn btn-primary">Add General Comment</button>
                </div>
                <div class="submit-buttons-area">
                    <button type="button" id="btn-submit-data" class="btn btn-primary upload-plan-btn">Upload Load Plan</button>
                </div>
            </div>
            `;
        }
        else if (!pISNComplete) {
            mainButtonsView = `
            <div style="text-align: center; margin: 0 0 15px 0;">
                <div class="alert alert-warning" role="alert">All lines were approved, the PI File and the Load Plan were uploaded, now TOV is pending to create the Inbound Shipment.</div>
            </div>
            `;
        }
        else {
            mainButtonsView = "";
        }
    }
    else {
        if (pVendorOrTOVSide === constants.VENDOR_OR_TOV_TEXT.VENDOR) {
            let printOrderURL = functions.getSuiteletURL(constants.SCRIPTS.RETURN_PDF_SUITELET.ID, constants.SCRIPTS.RETURN_PDF_SUITELET.DEPLOY, true);

            mainButtonsView = `
            <div id="buttons-area">
                <div class="general-buttons-area">
                    <button type="button" id="btn-print-order" class="btn btn-primary" onclick="printOrder('${printOrderURL}');">Print Order</button>
                    <button type="button" id="btn-change-all-lines" class="btn btn-primary">Edit PO</button>
                    <button type="button" id="btn-refresh-all-lines" class="btn btn-primary" style="display: none;">Apply Changes</button>
                    <button type="button" id="btn-accept-all-lines" class="btn btn-primary">Accept All Lines</button>
                    <button type="button" id="btn-add-general-comment" class="btn btn-primary">Add General Comment</button>
                </div>
                <div class="submit-buttons-area">
                    <button type="button" id="btn-submit-data" class="btn btn-primary">Submit Data</button>
                </div>
            </div>`;
        }
        else {
            mainButtonsView = "";
        }
    }

    return mainButtonsView;
}

// Get the view of the main buttons for the inbound shipment
function getShipmentButtonsView(pInboundShipmentData) {
    let shipmentStatus = pInboundShipmentData[constants.INBOUND_SHIPMENT.FIELDS.SHIPMENT_STATUS];
    log.debug("shipmentStatus", shipmentStatus);
    let mainButtonsView = "";
    if (true || shipmentStatus == "To Be Shipped") {
        mainButtonsView = `
            <div id="buttons-area">
                <button type="button" id="btn-open-upload-files" class="btn btn-primary">Upload Files</button>
                <button type="button" id="btn-mark-as-in-transit" class="btn btn-primary" style="display: none;">Mark As In Transit</button>
            </div>`;
    }

    return mainButtonsView;
}

// Get the view for the last comment
function getLastCommentView(pApprovalRequestLastComment) {
    let lastCommentView = '<div class="tab-pane fade show active last-comment-view" id="nav-last" role="tabpanel" aria-labelledby="nav-last-tab">';

    if (pApprovalRequestLastComment) {
        lastCommentView += `
            <p>${pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT]}</p>
            <br />
            ${pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] ? `<p><strong>General Comment:</strong> ${pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT]}</p> <br />` : ''}
            <p class="comment-from"><b style="margin-right: 5px;">·</b>From <strong>${pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV]}</strong> on <strong>${pApprovalRequestLastComment[constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE]}</strong></p>
        `;
    }
    else {
        lastCommentView += '<p style="font-size: 16px;">No Comments!</p>';
    }

    lastCommentView += '</div>';

    return lastCommentView;
}

// Get the view for the comments interaction
function getCommentsInteractionView(pApprovalRequestCommentsData) {
    let itemsRows = '';

    for (let i = 0; i < pApprovalRequestCommentsData.length; i++) {
        itemsRows += `
        <tr>
            <td id="comment-view"><span>View Details</span></td>
            <td id="comment-date">${pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.COMMENT_DATE] : ''}</td>
            <td id="comment-from">${pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.VENDOR_OR_TOV] : ''}</td>
            <td id="general-comment">${pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.GENERAL_COMMENT] : ''}</td>
            <td id="hidden-items-comments" style="display: none;"> ${pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT] ? pApprovalRequestCommentsData[i][constants.APPROVAL_REQUEST_COMMENTS.FIELDS.ITEMS_COMMENT] : ''}</td>
        </tr>
        `;
    }

    let commentsInteractionView = '<div class="tab-pane fade" id="nav-history" role="tabpanel" aria-labelledby="nav-history-tab">';

    if (pApprovalRequestCommentsData.length > 0) {
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
    else {
        commentsInteractionView += '<p>No Comments!</p>';
    }

    commentsInteractionView += '</div>'
    return commentsInteractionView;
}

//Get the related inbound shipments view
function getRelatedInboundView(pArgs){

    let ordersRows = '';
    let orders= pArgs.inboundShipmentData;
    for (let i = 0; i < orders.length; i++) {
        let inboundShipmentID = orders[i][constants.INBOUND_SHIPMENT_OBJECT.ISN_INTERNALID];
        let purchaseOrderID = pArgs.poId;
        let link = `${functions.getCurrentSuiteletURL(true)}&po=${purchaseOrderID}&isn=${inboundShipmentID}&page=${pArgs.pageID}`;

        let inboundShipmentNumber = orders[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_NUMBER];
        let currentReadyDate = orders[i][constants.INBOUND_SHIPMENT_OBJECT.CURRENT_READY_DATE];
        let destination = orders[i][constants.INBOUND_SHIPMENT_OBJECT.DESTINATION_LOCATION];
        let bookingStatus = orders[i][constants.INBOUND_SHIPMENT_OBJECT.BOOKING_STATUS];
        let shipmentStatus = orders[i][constants.INBOUND_SHIPMENT_OBJECT.SHIPMENT_STATUS];

        let downloadLink = functions.getSuiteletURL(constants.SCRIPTS.RETURN_PDF_SUITELET.ID, constants.SCRIPTS.RETURN_PDF_SUITELET.DEPLOY, true);

        ordersRows += `
                <tr class="item-line">
                    <td class="order-link"> <a class="view-order-link" href="${link}">View</a> </td>
                    <td class="order-name"> <span>${inboundShipmentNumber}</span> </td>
                    <td class="order-date"> <span>${currentReadyDate}</span> </td>
                    <td class="order-destination"> <span>${destination}</span> </td>
                    <td class="order-booking-status"> <span>${bookingStatus}</span> </td>
                    <td class="order-shipment-status"> <span>${shipmentStatus}</span> </td>
                    <td class="order-link"> <a class="view-order-link" href="${downloadLink+'&isn='+inboundShipmentID}" target="_blank" >Packing Slip</a> </td>
                </tr>
                `;
    }
    
    let ordersView = ordersRows.length > 0 ? `
    <div class="table-responsive vendor-orders-table">
        <table class="table text-nowrap">
            <thead>
                <tr>
                    <th></th>
                    <th><span>ISN #</span></th>
                    <th><span>Current Ready Date</span></th>
                    <th><span>Destination Location</span></th>
                    <th><span>Booking Status</span></th>
                    <th><span>Shipment Status</span></th>
                    <th></th>
                </tr>
            </thead>
            <tbody id="item-lines">
                ${ordersRows}
            </tbody>
        </table>
    </div>
    ` : `<h5 style="text-align: center;"> No Orders Here! </h5>`;

    let relatedISNView = 
        `<div class="tab-pane fade" id="nav-related-isn" role="tabpanel" aria-labelledby="nav-related-isn-tab">
            ${ordersView}
        </div>`

    return relatedISNView
}

// Get the view for the PI file
function getPIFileView(pPIFile) {
    let PIFIleName = "";
    let PIFIleURL = "";
    if (pPIFile) {
        let fileData = model.getFileData(pPIFile);
        PIFIleName = fileData.name;
        PIFIleURL = fileData.url;
    }

    let PIFileView = `
    <div class="tab-pane fade" id="nav-pi-file" role="tabpanel" aria-labelledby="nav-pi-file-tab">
        <p class="pi-file-name">${PIFIleName}</p>
        <a id="btn-download-pi" href="${PIFIleURL}" target="_blank" class="badge badge-secondary">Download</a>
        <button type="button" id="btn-new-pi" class="btn btn-primary">Upload New</button>
    </div>
    `;

    return PIFileView;
}

// Get the view for the Load Plan file
function getLoadPlanFileView(pLoadPlanFile) {
    let loadPlanFileName = "";
    let loadPlanFileURL = "";
    if (pLoadPlanFile) {
        let fileData = model.getFileData(pLoadPlanFile);
        loadPlanFileName = fileData.name;
        loadPlanFileURL = fileData.url;
    }

    let loadPlanFileView = `
    <div class="tab-pane fade" id="nav-load-plan-file" role="tabpanel" aria-labelledby="nav-load-plan-file-tab">
        <p class="load-plan-file-name">${loadPlanFileName}</p>
        <a id="btn-download-load-plan" href="${loadPlanFileURL}" target="_blank" class="badge badge-secondary">Download</a>
        <button type="button" id="btn-new-load-plan" class="btn btn-primary">Upload New</button>
    </div>
    `;

    return loadPlanFileView;
}

// Get the view for the Shipment Related files
function getShipmentRelatedFilesView(pShipmentRelatedFiles) {
    let shipmentRelatedFilesSection = "";
    let relatedFileTypes = Object.keys(pShipmentRelatedFiles);
    for (let i = 0; i < relatedFileTypes.length; i++) {
        if (relatedFileTypes[i] === "other-shipment-file") {
            for (let j = 0; j < pShipmentRelatedFiles[relatedFileTypes[i]].length; j++) {
                let fileData = model.getFileData(pShipmentRelatedFiles[relatedFileTypes[i]][j]);
    
                shipmentRelatedFilesSection += `
                    <div class="related-shipment-file-wrapper">
                        <p class="related-shipment-file-name">${constants.FILE_TITLE_BY_ID[relatedFileTypes[i]]} - ${fileData.name}</p>
                        <a href="${fileData.url}" target="_blank" class="badge badge-secondary btn-download-related-shipment-file">Download</a>
                    </div>
                `;
            }
        }
        else {
            let fileData = model.getFileData(pShipmentRelatedFiles[relatedFileTypes[i]]);
    
            shipmentRelatedFilesSection += `
                <div class="related-shipment-file-wrapper">
                    <p class="related-shipment-file-name">${constants.FILE_TITLE_BY_ID[relatedFileTypes[i]]} - ${fileData.name}</p>
                    <a href="${fileData.url}" target="_blank" class="badge badge-secondary btn-download-related-shipment-file">Download</a>
                </div>
            `;
        }
    }

    let loadPlanFileView = `
    <div class="tab-pane fade" id="nav-shipment-files" role="tabpanel" aria-labelledby="nav-shipment-files-tab">
        ${shipmentRelatedFilesSection}
        <button id="btn-new-related-shipment-file" type="button" class="btn btn-primary">Upload New Files</button>
    </div>
    `;

    return loadPlanFileView;
}

// Get the modal for the View Comment
function getViewCommentModal() {
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
function getAddGeneralCommentModal() {
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
                    <span>Add a comment for the TOV team</span>
                    <textarea rows="8"></textarea>
                    <button type="button" id="btn-save-general-comment" class="btn btn-primary">Save</button>
                </div>
            </div>
        </div>
    </div>
    `;

    return addGeneralCommentModal;
}

// Get the modal for add a General Comment
function getShipdateChangeReasonModal() {
    let shipdateChangeReasonModal = `
    <div class="modal shipdate-change-reason-modal" id="shipdate-change-reason-modal" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Change Reason</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <span>Add a reason for the latest cargo ship date change.</span>
                    <textarea rows="4"></textarea>
                    <button type="button" id="btn-save-shipdate-change-reason" class="btn btn-primary">Save</button>
                </div>
            </div>
        </div>
    </div>
    `;

    return shipdateChangeReasonModal;
}

// Get the modal for the acceptance confirmation
function getAcceptanceConfirmationModal(isDropship) {
    let message = isDropship ?
    "Please upload the PI File, production is expected to submit immediately upon uploading the PI."
    : "Please upload the PI File and the Load Plan if you have it ready, if you don't have a Load Plan ready, you must submit it within 3 days. Deposits will not be paid out without providing the Load Plan however production is expected to submit immediately upon uploading the PI." ;

    let acceptanceConfirmationModal = `
    <div class="modal" id="acceptance-confirmation-modal" role="dialog">
        <div class="modal-dialog modal-md modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Acceptance Confirmation</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <span style="font-size: 12px;">${message}</span>
                    <br>
                    <br>
                    <label for="pi-file" style="margin-bottom: 0;">Upload PI File</label>
                    <input type="file" class="pi-file form-control-file" id="pi-file" name="pi-file" onchange="handleFileContents('pi-file', '')">
                    <br>
                    ${isDropship ? "" : `
                    <label for="load-plan-file" style="margin-bottom: 0;">Upload Load Plan</label>
                    <input type="file" class="load-plan-file form-control-file" id="load-plan-file" name="load-plan-file" onchange="handleFileContents('load-plan-file', '')">
                    `}
                    <button type="button" id="btn-acceptance-confirmation" class="btn btn-primary" style="display: block; margin: 20px auto 0 auto;">Accept</button>
                </div>
            </div>
        </div>
    </div>
    `;

    return acceptanceConfirmationModal;
}

// Get the modal to upload the shipment files to an inbound shipment
function getUploadShipmentFilesModal() {
    let piFileModal = `
    <div class="modal" id="upload-shipment-files-modal" role="dialog">
        <div class="modal-dialog modal-md modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <label for="tsca-regulation-file" class="file-input-label">TSCA Regulation</label>
                    <input type="file" class="tsca-regulation-file form-control-file" id="tsca-regulation-file" name="tsca-regulation-file" onchange="handleFileContents('tsca-regulation-file', 'shipment-file-input')">
                    <label for="packing-slip-file" class="file-input-label">Packing Slip & Commercial Invoice</label>
                    <input type="file" class="packing-slip-file form-control-file" id="packing-slip-file" name="packing-slip-file" onchange="handleFileContents('packing-slip-file', 'shipment-file-input')">
                    <label for="loading-report-file" class="file-input-label">Loading Report</label>
                    <input type="file" class="loading-report-file form-control-file" id="loading-report-file" name="loading-report-file" onchange="handleFileContents('loading-report-file', 'shipment-file-input')">
                    <label for="other-shipment-file" class="file-input-label">Other</label>
                    <input type="file" class="other-shipment-file form-control-file" id="other-shipment-file" name="other-shipment-file" onchange="handleFileContents('other-shipment-file', 'shipment-file-input')" multiple>
                    <label for="container-number" class="container-number-label">Container Number</label>
                    <input type="text" class="container-number-input" id="container-number" name="container-number">
                    <button type="button" id="btn-submit-shipments-files" class="btn btn-primary" style="display: block; margin: 20px auto 0 auto;">Submit</button>
                </div>
            </div>
        </div>
    </div>
    `;

    return piFileModal;
}

// Get the modal to mark the ISN as In Transit
function getMarkAsInTransitModal() {
    let piFileModal = `
    <div class="modal" id="mark-as-intransit-modal" role="dialog">
        <div class="modal-dialog modal-md modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <input class="mark-in-transit-agree" type="checkbox" id="agree-terms" name="agree-terms" value="agree">
                    <label class="mark-in-transit-agree-label" for="agree-terms">Please be sure all the information related to this Inbound Shipment is accurate before proceeding with this step. Submitting inaccurate data is subject to a charge.</label>
                    <button type="button" id="btn-mark-in-transit" class="btn btn-primary" style="display: block; margin: 20px auto 0 auto;">Accept</button>
                </div>
            </div>
        </div>
    </div>
    `;

    return piFileModal;
}

// Get the modal to upload the PI File
function getUploadPIFileModal() {
    let piFileModal = `
    <div class="modal" id="upload-pi-file-modal" role="dialog">
        <div class="modal-dialog modal-md modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Upload PI File</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <label for="pi-file2">Upload PI File</label>
                    <input type="file" class="pi-file form-control-file" id="pi-file2" name="pi-file2" onchange="handleFileContents('pi-file2', '')">
                    <button type="button" id="btn-upload-pi-file" class="btn btn-primary" style="display: block; margin: 20px auto 0 auto;">Accept</button>
                </div>
            </div>
        </div>
    </div>
    `;

    return piFileModal;
}

// Get the modal to upload the Load Plan
function getUploadLoadPlanModal() {
    let loadPlanModal = `
    <div class="modal" id="upload-load-plan-modal" role="dialog">
        <div class="modal-dialog modal-md modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Upload Load Plan</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <label for="load-plan-file2">Upload Load Plan</label>
                    <input type="file" class="load-plan-file form-control-file" id="load-plan-file2" name="load-plan-file2" onchange="handleFileContents('load-plan-file2', '')">
                    <button type="button" id="btn-upload-load-plan" class="btn btn-primary" style="display: block; margin: 20px auto 0 auto;">Accept</button>
                </div>
            </div>
        </div>
    </div>
    `;

    return loadPlanModal;
}

// Get the loading modal
export function getLoadingModal() {
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
export function getThanksPage(pVendorData, pVendorApprovalRequestData) {
    let homePageLink = getHomePageLink();

    let thanksHtml = `
        <head>
            <title>Thank you</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.SIDEBAR.JS)}"></script>
        </head>
        <div class="wrapper">
            <div class="sidebar-view">
                ${getSidebarView(pVendorApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="vendor-portal-title"><h3>Vendor Portal</h3></a>
                        ${pVendorData ? `<span class="vendor-header">${pVendorData[constants.VENDOR.FIELDS.ALTNAME]}</span>` : ""}
                        <div>
                            ${getBackButton("Back")}
                        </div>
                    </div>
                    <div>
                        ${pVendorData && pVendorData[constants.VENDOR.FIELDS.LOGO] && pVendorData[constants.VENDOR.FIELDS.LOGO][0] && pVendorData[constants.VENDOR.FIELDS.LOGO][0].text ?
                        `<img class="vendor-logo" src="${pVendorData[constants.VENDOR.FIELDS.LOGO][0].text}">`
                        : '<img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">' }
                    </div>
                </div>
                <body>
                    <div class="thanks-message">
                        <h3> Thank you, your submission has been successful! </h3>
                    </div>
                </body>
            </div>
        </div>
    `;

    return thanksHtml;
}

// Add 15/02/2021 For create load plans
export function getCreateLoadPlansView(pVendorApprovalRequestData, pVendorData, pIsMultipleVendors, pETASection, pPageID) {
    // Get the data for the title based on the page that is being visited
    let titleData = getTitleData(pPageID);

    // Get the link to the home page
    let homePageLink = getHomePageLink();

    return `
        <head>
            <title>Vendor Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.GLOBAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.SIDEBAR.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.CSS)}">
            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.CREATE_IS.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.GLOBAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.SIDEBAR.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.ETA_PAGE.JS)}"></script>
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.CREATE_IS.JS)}"></script>
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
                ${getSidebarView(pVendorApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${homePageLink}" class="vendor-portal-title"><h3>Vendor Portal</h3></a>
                        ${!pIsMultipleVendors && pVendorData ? `<span class="vendor-header">${pVendorData[constants.VENDOR.FIELDS.ALTNAME]}</span>` : ""}
                        <div>
                            ${getBackButton("Back")}
                        </div>
                    </div>
                    ${!pIsMultipleVendors && pVendorData[constants.VENDOR.FIELDS.LOGO] && pVendorData[constants.VENDOR.FIELDS.LOGO][0] && pVendorData[constants.VENDOR.FIELDS.LOGO][0].text ?
                    `<div>
                        <img class="vendor-logo" src="${pVendorData[constants.VENDOR.FIELDS.LOGO][0].text}">
                    </div>`
                    : "" }
                    <div>
                        <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
                    </div>
                </div>
                <div class="vendor-portal">
                    <div class="category-title-wrapper">
                        <div class="circle category-title pink">
                            ${titleData.icon}
                        </div>
                        <span class="category-title">${titleData.title}</span>
                    </div>
                    <div id="category-lines-wrapper">
                        ${pETASection}
                    </div>
                    ${getLoadingModal()}
                </div>
            </div>
        </div>
    `;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get thanks page after submitting the data
export function getErrorPage(pErrorMessage, pSmallText) {
    let errorHtml = `
        <head>
            <title>Vendor Portal</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.css">

            <link rel="stylesheet" type="text/css" href="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.CSS)}">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
            <script type='text/javascript' src="${functions.getFileUrl(constants.FILES.VENDOR_PORTAL.JS)}"></script>
        </head>
        <div class= "header">
        <div class="main-title">
            <h3>Vendor Portal</h3>
        </div>
            <div>
                <img class="logo-tov" src="https://s3-us-west-1.amazonaws.com/tov-stage/wp-content/uploads/2019/01/Tov-Logo-Update.jpg">
            </div>
        </div>
        <body>
            <div class="error-message">
                ${pSmallText ? `<p>${pErrorMessage}</p>` : `<h3>${pErrorMessage}</h3>`}
                <a style="margin-left: 20px;" href=${functions.getCurrentSuiteletURL(true)}>Return Home</a>
            </div>
        </body>`;

    return errorHtml;
}
