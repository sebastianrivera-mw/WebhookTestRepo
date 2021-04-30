/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/runtime", "N/log", "N/ui/serverWidget", "N/search", "../Global/Constants"], function (require, exports, runtime, log, serverWidget, search, constants) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function beforeLoad(pContext) {
        try {
            log.debug("Running", "Running beforeLoad");
            if (runtime.executionContext === runtime.ContextType.USER_INTERFACE && pContext.type !== pContext.UserEventType.CREATE && pContext.type !== pContext.UserEventType.COPY) {
                var purchaseOrderID = pContext.newRecord.id;
                var purchaseOrderForm = search.lookupFields({ type: "purchaseorder", id: pContext.newRecord.id.toString(), columns: "customform" });
                // let isReplacement = (purchaseOrderForm["customform"][0]["value"].toString() == constants.GENERAL.REPLACEMENT_FORM) ? true : false;
                var isReplacement = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.IS_REPLACEMENT);
                var depositPaid = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.DEPOSIT_PAID);
                var statusList = getPurchaseOrderStatusList(isReplacement);
                statusList = checkUniqueStateStatusActive(statusList, purchaseOrderID, pContext);
                log.debug("Status List", JSON.stringify(statusList));
                var currentStatusID = pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.STATUS);
                log.debug("Current Status ID", currentStatusID);
                if (currentStatusID) {
                    // let position = currentStatus.toString();
                    // for(var i = 0; i < statusList.length; i++)
                    // {
                    // position = statusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID] == position ?  statusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.POSITION_JSON] : position;
                    // }
                    pContext.form.addField({ id: "custpage_mw_show_status_banner", label: "null", type: serverWidget.FieldType.INLINEHTML })
                        .defaultValue = "\n                <img class=\"inject_html_image\" src=\"\" onerror=\"javascript:\n                    jQuery(jQuery('.uir-page-title-secondline')).after(`" + getBannerView(statusList, currentStatusID) + "`);\n                    jQuery('#status-unique-" + constants.PURCHASE_ORDER_STATUSES.DEPOSIT_PAID + "').on('click', function (){\n                        var submitF=require('N/record');\n                        submitF.submitFields.promise({type:'purchaseorder', id:'" + pContext.newRecord.id + "', values:{'custbody_mw_po_deposit_paid':" + (depositPaid ? 'false' : 'true') + "}}).then(function(){ location.reload(); }).catch(function(pError){ console.error('Error'); });\n                    });\"\n                />";
                }
            }
            return true;
        }
        catch (error) {
            handleError(error);
        }
    }
    exports.beforeLoad = beforeLoad;
    // Get the list of Purchase Order Statuses
    function getPurchaseOrderStatusList(pIsReplacement) {
        log.debug("IsReplacement", pIsReplacement);
        var statusList = [];
        var poStatusSearch = search.create({
            type: constants.PURCHASE_ORDER_STATUS_LIST.ID,
            filters: [],
            columns: [
                search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID }),
                search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NAME }),
                search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.REPLACEMENT_POSITION }),
                search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.POSITION, sort: search.Sort.ASC }),
                search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.UNIQUE_STATE_STATUS })
            ]
        });
        poStatusSearch.filters.push(search.createFilter({ name: pIsReplacement ? constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.IS_REPLACEMENT_STATUS : constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.IS_REGULAR_STATUS, operator: search.Operator.IS, values: "T" }));
        poStatusSearch.run().each(function (result) {
            var _a;
            statusList.push((_a = {},
                _a[constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID] = result.getValue(constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID),
                _a[constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NAME] = result.getValue(constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NAME),
                _a[constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.POSITION_JSON] = pIsReplacement ? result.getValue(constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.REPLACEMENT_POSITION) : result.getValue(constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.POSITION),
                _a[constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.UNIQUE_STATE_STATUS] = result.getValue(constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.UNIQUE_STATE_STATUS),
                _a[constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ACTIVE_UNIQUE_STATE_STATUS] = false,
                _a));
            return true;
        });
        return statusList;
    }
    // Check if each unique state status is active
    function checkUniqueStateStatusActive(pStatusList, pPurchaseOrderID, pContext) {
        for (var i = 0; i < pStatusList.length; i++) {
            var statusID = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID];
            if (Number(statusID) === constants.PURCHASE_ORDER_STATUSES.PARTS_ORDERED) {
                if (checkPartsOrdered(pPurchaseOrderID)) {
                    pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ACTIVE_UNIQUE_STATE_STATUS] = true;
                }
            }
            else if (Number(statusID) === constants.PURCHASE_ORDER_STATUSES.DEPOSIT_PAID) {
                if (pContext.newRecord.getValue(constants.PURCHASE_ORDER.FIELDS.DEPOSIT_PAID)) {
                    pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ACTIVE_UNIQUE_STATE_STATUS] = true;
                }
            }
        }
        return pStatusList;
    }
    // Check if there are order parts purchase orders
    function checkPartsOrdered(pPurchaseOrderID) {
        var orderPartsSearch = search.create({
            type: search.Type.PURCHASE_ORDER,
            filters: [
                search.createFilter({ name: constants.PURCHASE_ORDER.FIELDS.REPLACEMENTE_PARENT_PO, operator: search.Operator.ANYOF, values: [pPurchaseOrderID] }),
                search.createFilter({ name: constants.PURCHASE_ORDER.FIELDS.APPROVAL_STATUS, operator: search.Operator.ANYOF, values: [constants.PURCHASE_ORDER_APPROVAL_STATUSES.APPROVED] })
            ],
            columns: [
                search.createColumn({ name: constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID })
            ]
        });
        var orderPartsSearchResults = orderPartsSearch.runPaged().count;
        return orderPartsSearchResults > 0;
    }
    // Get the view of the banner
    function getBannerView(pStatusList, pCurrentStatusID) {
        return "\n    <style>\n        " + getBannerStyle() + "\n    </style>\n    <div class='banner-container'>\n        <div class='steps-wrapper'>\t\n            <div class='arrow-steps clearfix'>\n                " + getStepsBannerSection(pStatusList, pCurrentStatusID) + "\n            </div>\n        </div>\n        <div class='unique-state-status-wrapper'>\n            <div class='unique-state-statuses'>\n                " + getUniqueStateBannerSection(pStatusList) + "\n            </div>\n        </div>\n    </div>\n    ";
    }
    // Create the style tag for the new banner
    function getBannerStyle() {
        return "\n    .clearfix:after {\n        clear: both;\n        content: '';\n        display: block;\n        height: 0;\n    }\n    \n    .banner-container {\n        display: flex;\n        justify-content: flex-start;\n        align-items: center;\n        margin: 10px 0 15px 0;\n        font-family: 'Lato', sans-serif;\n    }\n    \n    .arrow-steps .step {\n        font-size: 14px;\n        text-align: center;\n        color: #666;\n        margin: 0 3px;\n        padding: 10px 10px 10px 30px;\n        min-width: 180px;\n        float: left;\n        position: relative;\n        background-color: #eee;\n        -webkit-user-select: none;\n        -moz-user-select: none;\n        -ms-user-select: none;\n        user-select: none; \n        transition: background-color 0.2s ease;\n    }\n    \n    .arrow-steps .step:after,\n    .arrow-steps .step:before {\n        content: ' ';\n        position: absolute;\n        top: 0;\n        right: -17px;\n        width: 0;\n        height: 0;\n        border-top: 19px solid transparent;\n        border-bottom: 17px solid transparent;\n        border-left: 17px solid #eee;\n        z-index: 2;\n        transition: border-color 0.2s ease;\n    }\n    \n    .arrow-steps .step:before {\n        right: auto;\n        left: 0;\n        border-left: 17px solid #fff;\t\n        z-index: 0;\n    }\n\n    .arrow-steps .step:first-child {\n        border-top-left-radius: 25px;\n        border-bottom-left-radius: 25px;\n    }\n    \n    .arrow-steps .step:first-child:before {\n        border: none;\n    }\n\n    .arrow-steps .step:last-child {\n        border-top-right-radius: 25px;\n        border-bottom-right-radius: 25px;\n    }\n\n    .arrow-steps .step:last-child:after {\n        border: none;\n    }\n\n    .arrow-steps .step.done {\n        color: #fff;\n        background-color: #00bb2d;\n    }\n\n    .arrow-steps .step.done:after {\n        border-left: 17px solid #00bb2d;\t\n    }\n\n    .arrow-steps .step.current {\n        color: #fff;\n        background-color: #23468c;\n    }\n    \n    .arrow-steps .step.current:after {\n        border-left: 17px solid #23468c;\t\n    }\n\n    .arrow-steps .step span {\n        position: relative;\n        font-weight: bold;\n    }\n\n    .arrow-steps .step span.done-icon {\n        display: none;\n    }\n    \n    .arrow-steps .step span.done-icon:before {\n        content: '\u2714';\n        position: absolute;\n        color: #fff;\n        font-weight: bold;\n    }\n\n    .arrow-steps .step.done span.done-icon {\n        display: block;\n        color: #00bb2d;\n    }\n\n    .arrow-steps .step.done span.step-text.hidden-text {\n        display: none;\n    }\n\n    .unique-state-statuses .status {\n        font-size: 14px;\n        text-align: center;\n        color: #666;\n        margin: 0 3px;\n        padding: 10px;\n        min-width: 180px;\n        float: left;\n        background-color: #eee;\n        border-radius: 25px;\n    }\n\n    .unique-state-statuses .status.clickable {\n        cursor: pointer;\n    }\n\n    .unique-state-statuses .status.clickable:hover {\n        background: #e6e6e6;\n    }\n\n    .unique-state-statuses .status.active.clickable:hover {\n        background: #183162;\n    }\n\n    .unique-state-statuses .status.active {\n        color: #fff;\n        background-color: #23468c;\n    }\n\n    .unique-state-statuses .status span {\n        font-weight: bold;\n    }\n\n    .unique-state-statuses .status.active span:before {\n        content: '\u2714';\n        color: #fff;\n        font-weight: bold;\n        margin-right: 5px;\n    }\n    ";
    }
    // Get the banner of the section related to the steps
    function getStepsBannerSection(pStatusList, pCurrentStatusID) {
        var currentStatusFound = false;
        var htmlCode = "";
        for (var i = 0; i < pStatusList.length; i++) {
            var statusPosition = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.POSITION_JSON];
            var uniqueStateStatus = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.UNIQUE_STATE_STATUS];
            if (statusPosition && !uniqueStateStatus) {
                var statusText = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NAME];
                var statusID = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID];
                (statusID === pCurrentStatusID) ? currentStatusFound = true : {};
                if (!currentStatusFound) {
                    if (Number(statusID) === constants.PURCHASE_ORDER_STATUSES.DRAFT) {
                        htmlCode += "<div id='status-arrow-" + statusID + "' class='step done'> <span class='done-icon'>-</span> <span class='step-text hidden-text'>" + statusText + "</span> </div>";
                    }
                    else {
                        htmlCode += "<div id='status-arrow-" + statusID + "' class='step done'> <span class='step-text'>" + statusText + "</span> </div>";
                    }
                }
                else if (statusID === pCurrentStatusID) {
                    htmlCode += "<div id='status-arrow-" + statusID + "' class='step current'> <span class='step-text'>" + statusText + "</span> </div>";
                }
                else {
                    htmlCode += "<div id='status-arrow-" + statusID + "' class='step'> <span class='step-text'>" + statusText + "</span> </div>";
                }
            }
        }
        return htmlCode;
    }
    // Get the banner of the section related to the steps
    function getUniqueStateBannerSection(pStatusList) {
        var htmlCode = "";
        for (var i = 0; i < pStatusList.length; i++) {
            var uniqueStateStatus = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.UNIQUE_STATE_STATUS];
            if (uniqueStateStatus) {
                var statusText = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.NAME];
                var statusID = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ID];
                var isActive = pStatusList[i][constants.PURCHASE_ORDER_STATUS_LIST.FIELDS.ACTIVE_UNIQUE_STATE_STATUS];
                if (isActive) {
                    if (Number(statusID) === constants.PURCHASE_ORDER_STATUSES.DEPOSIT_PAID) {
                        htmlCode += "<div id='status-unique-" + statusID + "' class='status active clickable'> <span class='step-text'>" + statusText + "</span> </div>";
                    }
                    else {
                        htmlCode += "<div id='status-unique-" + statusID + "' class='status active'> <span class='step-text'>" + statusText + "</span> </div>";
                    }
                }
                else {
                    if (Number(statusID) === constants.PURCHASE_ORDER_STATUSES.DEPOSIT_PAID) {
                        htmlCode += "<div id='status-unique-" + statusID + "' class='status clickable'> <span class='step-text'>" + statusText + "</span> </div>";
                    }
                    else {
                        htmlCode += "<div id='status-unique-" + statusID + "' class='status'> <span class='step-text'>" + statusText + "</span> </div>";
                    }
                }
            }
        }
        return htmlCode;
    }
    // Handle errors
    function handleError(pError) {
        log.error({ title: "Error", details: pError.message });
        log.error({ title: "Stack", details: JSON.stringify(pError) });
    }
});
