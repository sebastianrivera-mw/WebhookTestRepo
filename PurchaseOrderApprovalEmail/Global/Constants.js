/**
 * @author Midware
 * @developer Reinaldo Stephens Chaves
 * @contact contact@midware.net
 */
define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PURCHASE_ORDER_FIELDS = {
        TRANID: "tranid",
        LOCATION: "location",
        APPROVAL_STATUS: "approvalstatus",
        PARENT_PO: "custbody_mw_replac_related_po",
        PURCHASE_ORDER_APPROVAL_STATUS: "custbody_mw_purchase_order_status",
        PURCHASE_ORDER_APPROVED_EMAIL_SENT: "custbody_mw_po_approved_email_sent",
    };
    exports.EMPLOYEE_FIELDS = {
        PO_APPROVE_EMAIL: "custentitypo_approved_email",
    };
    exports.PURCHASE_ORDER_APPROVE_ID = "4";
    exports.EMAIL_RECIPIENTS_CUSTOM_RECORD = {
        IS_EMAIL: "custrecord_mw_isemail",
        EMAIL: "custrecord_mw_related_email",
        IS_EMPLOYEE: "custrecord_mw_isemployee",
        TYPE: "customrecord_mw_email_recipients",
        LOCATION: "custrecord_mw_related_location",
        EMPLOYEE: "custrecord_mw_related_employee",
        MODULE: "custrecord_mw_related_email_module",
        DESCRIPTION: "custrecord_mw_employee_description",
        SEND_ATTACHMENTS: "custrecord_mw_send_attachments",
    };
    exports.EMAIL_MODULES_CUSTOM_RECORD = {
        NAME: "name",
        TYPE: "customrecord_mw_email_module",
        FILTER_BY_LOCATION: "custrecord_mw_require_location",
        SHOW_SEND_ATTACHMENTS_COLUMN: "custrecord_mw_require_send_attachments",
    };
});

