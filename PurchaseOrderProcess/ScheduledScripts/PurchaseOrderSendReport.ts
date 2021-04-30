/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * @author Midware
 * @Website www.midware.net
 * @Developer Roy Cordero
 * @contact contact@midware.net
 */

import { EntryPoints } from 'N/types';

import * as log from 'N/log';
import * as search from 'N/search';
import * as email from 'N/email';
import * as render from 'N/render';
import * as file from 'N/file';

import * as constants from '../Global/Constants';

export function execute(pContext: EntryPoints.Scheduled.executeContext)
{    
    try
    {
        log.debug("Running", "Starting process!");

        // Get the pending Approval Requests
        let approvalRequests = getApprovalRequests();
        log.debug("Purchase Orders", "Quantity of Purchase Orders: " + approvalRequests.length);

        // Create the report file
        let reportFile = createReportFile(approvalRequests);

        // Send the email
        sendEmail(reportFile);

        log.debug("Running", "All finished!");
    }
    catch(error)
    {
        handleError(error);
    }
}

// Get the Approval Requests to send reminders
function getApprovalRequests()
{
    let approvalRequestData = [];

    // Search for the Purchase Order
    let approvalRequestSearch = search.create({
        type: constants.APPROVAL_REQUEST.ID,
        filters:
        [
            [constants.APPROVAL_REQUEST.FIELDS.APPROVED, "is", "F"],
            "AND",
            ["custrecord_mw_purchase_order.mainline","is","T"]
        ],
        columns:
        [
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.DATE }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.TRANID, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.PURCHASE_ORDER.FIELDS.DATE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER }),
            search.createColumn({ name: constants.VENDOR.FIELDS.ALTNAME, join: constants.APPROVAL_REQUEST.FIELDS.VENDOR }),
            search.createColumn({ name: constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE }),
        ]
    });

    approvalRequestSearch.run().each(function(result) {

        let approvalRequestDataObj = {};

        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.DATE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.DATE);
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.REMINDERS_SENT] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.REMINDERS_SENT) || 0;
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.PURCHASE_ORDER] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER);
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.PO_TRANID] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.TRANID, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.PO_DATE] = result.getValue({ name: constants.PURCHASE_ORDER.FIELDS.DATE, join: constants.APPROVAL_REQUEST.FIELDS.PURCHASE_ORDER });
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.VENDOR] = result.getValue({ name: constants.VENDOR.FIELDS.ALTNAME, join: constants.APPROVAL_REQUEST.FIELDS.VENDOR });
        approvalRequestDataObj[constants.APPROVAL_REQUEST_OBJECT.VENDOR_OR_TOV_SIDE] = result.getValue(constants.APPROVAL_REQUEST.FIELDS.VENDOR_OR_TOV_SIDE);

        approvalRequestData.push(approvalRequestDataObj);

        return true;
    });

    return approvalRequestData;
}

// Create the file for the report
function createReportFile(pApprovalRequests)
{
    let finalCSV = "";
    if (pApprovalRequests.length > 0)
    {
        finalCSV = `Pending Action From,Date Created,Vendor Name,Purchase Order Date,Purchase Order Number\r\n`;
        for (let i = 0; i < pApprovalRequests.length; i++)
        {
            let pendingActionFrom = pApprovalRequests[i][constants.APPROVAL_REQUEST_OBJECT.VENDOR_OR_TOV_SIDE];
            let dateCreated = pApprovalRequests[i][constants.APPROVAL_REQUEST_OBJECT.DATE];
            let vendorName = pApprovalRequests[i][constants.APPROVAL_REQUEST_OBJECT.VENDOR];
            let purchaseOrderDate = pApprovalRequests[i][constants.APPROVAL_REQUEST_OBJECT.PO_DATE];
            let purchaseOrderNumber = pApprovalRequests[i][constants.APPROVAL_REQUEST_OBJECT.PO_TRANID];

            finalCSV += `${pendingActionFrom},${dateCreated},"${vendorName}",${purchaseOrderDate},${purchaseOrderNumber}\r\n`;
        }

        let today = new Date();
        let todayFormatted = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;

        let reportFile = file.create({
            name : `Pending Approval Purchase Orders - ${todayFormatted}.csv`,
            encoding : file.Encoding.UTF8,
            contents : finalCSV,
            fileType : file.Type.CSV,
        });

        return reportFile;
    }
    else
    {
        return null;
    }
}

// Send the email with the report
function sendEmail(pReportFile)
{
    // Merge the email
    let emailRender = render.mergeEmail({
        templateId : constants.EMAIL_TEMPLATES.REPORT
    });

    // Set the subject and body
    let subject = emailRender.subject;
    let body = emailRender.body;

    log.debug("Email Body", emailRender.body);
    log.debug("Email Subject", emailRender.subject);

    // Send the email
    email.send({
        author: 6151,
        recipients: [ "roy.cordero@midware.net" ],
        subject: subject,
        body: body,
        attachments: [ pReportFile ]
    });

    log.debug("Email Sent", "Email Sent");
}

// Handle errors
function handleError(pError : Error)
{
    log.error({ title : "Error", details : pError.message });
    log.error({ title : "Stack", details : JSON.stringify(pError) });
}
