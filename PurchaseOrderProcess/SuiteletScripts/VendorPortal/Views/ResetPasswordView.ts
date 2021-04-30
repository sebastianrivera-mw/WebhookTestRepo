/**
 * @author Midware
 * @Website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */

import * as log from 'N/log';

import * as model from '../Models/VendorPortalModel';
import * as vendorPortalView from '../Views/VendorPortalView';
import * as constants from '../../../Global/Constants';
import * as functions from '../../../Global/Functions';

// Get the view of the Reset Password Page
export function getResetPasswordView(pUserID, pVendorData, pVendorApprovalRequestData, pPageID) 
{
    let titleData = vendorPortalView.getTitleData(pPageID);

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
                ${vendorPortalView.getSidebarView(pVendorApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${vendorPortalView.getHomePageLink()}" class="vendor-portal-title"><h3>Vendor Portal</h3></a>
                        ${pVendorData ? `<span class="vendor-header">${pVendorData[constants.VENDOR.FIELDS.ALTNAME]}</span>` : ""}
                    </div>
                    ${pVendorData && pVendorData[constants.VENDOR.FIELDS.LOGO] && pVendorData[constants.VENDOR.FIELDS.LOGO][0] && pVendorData[constants.VENDOR.FIELDS.LOGO][0].text  ?
                    `<div>
                        <img class="vendor-logo" src="${pVendorData[constants.VENDOR.FIELDS.LOGO][0].text}">
                    </div>` : ""}
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
                    <form action="${functions.getCurrentSuiteletURL(true)}&userID=${pUserID}&page=${constants.PAGES_IDS.RESET_PASSWORD}" method="post">
                        <p>Please type in your new password.</p>
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="*******" required>
                        <input class="button" type="submit" value="Set password">
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Get the view of the Reset Password Page
export function getResetPasswordSuccessView(pVendorData, pVendorApprovalRequestData, pPageID) 
{
    let titleData = vendorPortalView.getTitleData(pPageID);

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
                ${vendorPortalView.getSidebarView(pVendorApprovalRequestData)}
            </div>
            <div class="body">
                <div class="header">
                    <div class="main-title">
                        <a href="${vendorPortalView.getHomePageLink()}" class="vendor-portal-title"><h3>Vendor Portal</h3></a>
                        ${pVendorData ? `<span class="vendor-header">${pVendorData[constants.VENDOR.FIELDS.ALTNAME]}</span>` : ""}
                    </div>
                    ${pVendorData && pVendorData[constants.VENDOR.FIELDS.LOGO] && pVendorData[constants.VENDOR.FIELDS.LOGO][0] && pVendorData[constants.VENDOR.FIELDS.LOGO][0].text  ?
                    `<div>
                        <img class="vendor-logo" src="${pVendorData[constants.VENDOR.FIELDS.LOGO][0].text}">
                    </div>` : ""}
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
                    <p>Your password has been set successfully.</p>
               </div>
            </div>
        </div>
    `;
}
