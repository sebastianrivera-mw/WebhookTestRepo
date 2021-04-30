/**
 * @author Midware
 * @website www.midware.net
 * @developer Roy Cordero
 * @contact contact@midware.net
 */
define(["require", "exports", "N/runtime"], function (require, exports, runtime) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var _a, _b;
    // General
    exports.GENERAL = {
        PI_FILES_FOLDER_ID: runtime.envType == runtime.EnvType.SANDBOX ? 1157321 : 1219836,
        LOAD_PLANS_FOLDER_ID: runtime.envType == runtime.EnvType.SANDBOX ? 1172635 : 1219837,
        REPLACEMENT_FORM: runtime.envType == runtime.EnvType.SANDBOX ? "152" : "152",
        CONTAINER_COUNT_LIMIT: 66,
        PURCHASING_EMAIL_AUTHOR: runtime.envType == runtime.EnvType.SANDBOX ? 116916 : 120809,
        SHIPMENT_EMAIL_AUTHOR: runtime.envType == runtime.EnvType.SANDBOX ? 116917 : 120913,
        INDIAN_VENDORS_TOV_REP: 74126,
        ACCESS_TOKEN: "accessToken",
        ACCESS_TOKEN_MAX_AGE: 604800,
        VENDOR_PORTAL_URL: "https://vendors.tovfurniture.com"
    };
    exports.ETA_GENERAL = {
        /*AUTHOR : 5975,
        MAPPING_ID : 252,
        FOLDER: 283565,
        ETA_UPDATED_FOLDER: 760345,
        STATUS_FLAG : "status",
        VENDOR_EMAIL_TEMPLATE: 759,
        VENDOR_EMAIL_TEMPLATE_AUTO: 766,
        VENDOR_EMAIL_TEMPLATE_EMP: 782,
        BAILA_EMP_ID: 11,
        MARK_EMP_ID: 75555,*/
        QUANTITY_PER_PAGE: 100,
    };
    exports.TERMS_AND_CONDITIONS = {
        TITLE: "Terms of PO:",
        TEXT: "\n    Payment Terms:<br>\n    <br>\n    Shipping Instructions: Confirm with TOV before shipment for preferred method of shipping<br>\n    <br>\n    Packaging:<br>\n    <br>\n    In signing and accepting this PO, the factory agrees with the terms and the delivery date within. All PO requests are to be acknowledged within 48 hours of date being issued<br>\n    <br>\n    The PO is expected to be ready and released from the factory by the expected ship date issued on this PO. If a container ships past the expected ship date, TOV has the right to deduct according to the following:<br>\n    <br>\n    6-10 days 1% of invoice value<br>\n    11-15 day 1.5%<br>\n    16-20 days 2% and reserves the right to delay shipment for up to 45 days<br>\n    More then days 3% and reserves the to cancel with out penalty\n    "
    };
    exports.LOCATIONS = {
        DROPSHIP: runtime.envType == runtime.EnvType.SANDBOX ? 655 : 655,
    };
    exports.FORMS = {
        PARTS_ORDER: "153"
    };
    exports.EMPLOYEES = {
        BRUCE: -5,
        BAILA: 11,
        MARK: 75555,
        MENDY: "mendy@renegadefurniture.com",
        ARI: "ari@renegadefurniture.com"
    };
    exports.EMAIL_MODULES = {
        ALL_PURCHASE_ORDERS: runtime.envType == runtime.EnvType.SANDBOX ? 19 : 17,
        RENEGADE_PURCHASE_ORDERS: runtime.envType == runtime.EnvType.SANDBOX ? 20 : 18,
        PARTS_PURCHASE_ORDERS: runtime.envType == runtime.EnvType.SANDBOX ? 22 : 20,
        SHIPMENTS: runtime.envType == runtime.EnvType.SANDBOX ? 23 : 22,
    };
    exports.RENEGADE_LOGO_URL = runtime.envType == runtime.EnvType.SANDBOX ? "/core/media/media.nl?id=2808385&c=4057217_SB1&h=9a63b90e42929ac96c6e" : "/core/media/media.nl?id=2767799&c=4057217&h=34b43011526b9dd5da11";
    // Values
    exports.VENDOR_OR_TOV_TEXT = {
        TOV: "TOV",
        VENDOR: "Vendor"
    };
    exports.PAGES_IDS = {
        PENDING_VENDOR: "pending-vendor",
        PENDING_TOV: "pending-tov",
        PENDING_PI: "pending-pi",
        PENDING_LOAD_PLAN: "pending-load-plan",
        LOAD_PLANS: "load-plans",
        APPROVED_ORDERS: "approved-orders",
        PARTS_ORDERS: "parts-orders",
        RESET_PASSWORD: "reset-password",
        ETA_PAGE: "eta-page",
        CREATE_LOAD_PLAN: "create-load-plan",
    };
    exports.TITLE_DATA_BY_CATEGORY = (_a = {},
        _a[exports.PAGES_IDS.PENDING_VENDOR] = {
            TITLE: "Pending Vendor Action",
            ICON_CLASS: "fas fa-industry"
        },
        _a[exports.PAGES_IDS.PENDING_TOV] = {
            TITLE: "Pending TOV Action",
            ICON_CLASS: ""
        },
        _a[exports.PAGES_IDS.PENDING_PI] = {
            TITLE: "Pending PI File",
            ICON_CLASS: "far fa-file"
        },
        _a[exports.PAGES_IDS.PENDING_LOAD_PLAN] = {
            TITLE: "Pending Load Plan",
            ICON_CLASS: "far fa-file"
        },
        _a[exports.PAGES_IDS.LOAD_PLANS] = {
            TITLE: "Load Plans",
            ICON_CLASS: "fas fa-ship"
        },
        _a[exports.PAGES_IDS.APPROVED_ORDERS] = {
            TITLE: "Approved Orders",
            ICON_CLASS: "fas fa-check"
        },
        _a[exports.PAGES_IDS.PARTS_ORDERS] = {
            TITLE: "Parts Orders",
            ICON_CLASS: "fas fa-check"
        },
        _a[exports.PAGES_IDS.RESET_PASSWORD] = {
            TITLE: "Reset Password",
            ICON_CLASS: "fas fa-key"
        },
        _a[exports.PAGES_IDS.ETA_PAGE] = {
            TITLE: "ETA Page",
            ICON_CLASS: "fas fa-key"
        },
        _a[exports.PAGES_IDS.CREATE_LOAD_PLAN] = {
            TITLE: "Create Load Plans",
            ICON_CLASS: "fas fa-ship"
        },
        _a);
    exports.FILE_TITLE_BY_ID = {
        "tsca-regulation-file": "TSCA Regulation",
        "packing-slip-file": "Packing Slip & Commercial Invoice",
        "loading-report-file": "Loading Report",
        "other-shipment-file": "Other"
    };
    // Netsuite Records and Fields
    exports.PURCHASE_ORDER = {
        FIELDS: {
            STATUS: "custbody_mw_purchase_order_status",
            VENDOR: "entity",
            TRANID: "tranid",
            DATE: "trandate",
            TOTAL: "total",
            SHIPADDRESS: "shipaddress",
            SHIPADDRESSEE: "shipaddressee",
            LOCATION: "location",
            CUSTOMFORM: "customform",
            EXPECTED_SHIP_DATE: "custbody_mw_expected_ship_date",
            REQUEST_EMAIL_SENT: "custbody_mw_request_email_sent",
            APPROVAL_REQUEST: "custbody_mw_approval_request",
            APPROVAL_STATUS: "approvalstatus",
            REPLACEMENTE_PARENT_PO: "custbody_mw_replac_related_po",
            DEPOSIT_PAID: "custbody_mw_po_deposit_paid",
            IS_REPLACEMENT: "custbody_mw_is_replacement_po",
            IS_DROPSHIP_ORDER: "custbodytov_dropship",
            RENEGADE_PO: "custbodyrenegade_po",
            PARTS_SHIP_METHOD: "custbodyparts_ship_method"
        },
        ITEM_SUBLIST: {
            ID: "item",
            FIELDS: {
                LINE_KEY: "lineuniquekey",
                ITEM_TYPE: "itemtype",
                ITEM: "item",
                QUANTITY: "quantity",
                QUANTITY_ON_SHIPMENTS: "quantityonshipments",
                TARIFF_RATE: "custcol_mw_tariff_rate_original",
                ORIGINAL_TOTAL: "custcol_mw_tariff_amount_original",
                TARIFF_DISCOUNT: "custcol_mw_tariff_discount",
                RATE: "rate",
                AMOUNT: "amount",
                CBF: "custcol_tov_item_cbf",
                CBM: "custcol_tov_cbm",
                FABRIC_CODE: "custcol_mw_swatch_fabric_number",
                EXPECTED_RECEIPT_DATE: "expectedreceiptdate",
                VENDOR: "vendor",
                APPROVAL_REQUEST_LINE: "custcol_mw_approval_request_line",
                ITEM_COLLAB: "custcol_mw_item_collab"
            }
        }
    };
    exports.PURCHASE_ORDER_STATUS_LIST = {
        ID: "customrecord_mw_purchase_order_statuses",
        FIELDS: {
            NAME: "name",
            ID: "internalid",
            POSITION_JSON: "position",
            IS_REGULAR_STATUS: "custrecord_mw_regular_status",
            POSITION: "custrecord_mw_position",
            NEXT_STATUSES: "custrecord_mw_next_statuses",
            UNIQUE_STATE_STATUS: "custrecord_mw_unique_state_status",
            ACTIVE_UNIQUE_STATE_STATUS: "active_unique_state_status",
            IS_REPLACEMENT_STATUS: "custrecord_mw_replacement_status",
            REPLACEMENT_POSITION: "custrecord_mw_replacement_position"
        }
    };
    exports.PURCHASE_ORDER_STATUSES = {
        DRAFT: runtime.envType == runtime.EnvType.SANDBOX ? 1 : 1,
        VENDOR_ACTION: runtime.envType == runtime.EnvType.SANDBOX ? 2 : 2,
        TOV_ACTION: runtime.envType == runtime.EnvType.SANDBOX ? 3 : 3,
        PENDING_LOAD_PLAN: runtime.envType == runtime.EnvType.SANDBOX ? 5 : 4,
        APPROVED: runtime.envType == runtime.EnvType.SANDBOX ? 4 : 5,
        PARTS_ORDERED: runtime.envType == runtime.EnvType.SANDBOX ? 7 : 6,
        DEPOSIT_PAID: runtime.envType == runtime.EnvType.SANDBOX ? 8 : 8
    };
    exports.PURCHASE_ORDER_STATUSES_TEXT = (_b = {},
        _b[exports.PURCHASE_ORDER_STATUSES.DRAFT] = "Draft",
        _b[exports.PURCHASE_ORDER_STATUSES.VENDOR_ACTION] = "Vendor Action",
        _b[exports.PURCHASE_ORDER_STATUSES.TOV_ACTION] = "TOV Action",
        _b[exports.PURCHASE_ORDER_STATUSES.PENDING_LOAD_PLAN] = "Pending Load Plan",
        _b[exports.PURCHASE_ORDER_STATUSES.APPROVED] = "Approved",
        _b[exports.PURCHASE_ORDER_STATUSES.PARTS_ORDERED] = "Parts Ordered",
        _b[exports.PURCHASE_ORDER_STATUSES.DEPOSIT_PAID] = "Deposit Paid",
        _b);
    exports.PURCHASE_ORDER_APPROVAL_STATUSES = {
        APPROVED: runtime.envType == runtime.EnvType.SANDBOX ? 2 : 2
    };
    exports.VENDOR = {
        FIELDS: {
            INTERNALID: "internalid",
            UNIQUE_KEY: "custentity_mw_update_po_page_key",
            ETA_PAGE_KEY: "custentity_mw_update_page_key",
            ALTNAME: "altname",
            COMPANY_NAME: "companyname",
            LOGO: "custentityvendor_logo",
            VENDOR_PORTAL_ACCESS: "custentity_mw_vendor_portal_access",
            TOV_REP: "custentity4",
            PENDING_ETA_SUBMISSION: "custentity_mw_pending_eta_submission",
            WEEK_ETA_SUBMITTED: "custentity_mw_week_eta_submitted"
        },
        KEYS: {
            PORTAL_UNIQUE_KEY: "portal"
        }
    };
    exports.CONTACT = {
        FIELDS: {
            INTERNALID: "internalid",
            COMPANY: "company",
            EMAIL: "email",
            VENDOR_PORTAL_KEY: "custentity_mw_vendor_portal_key",
            COPY_NEW_PO_EMAIL: "custentitynew_po_email",
            COPY_VENDOR_PORTAL_UPDATES: "custentityche",
            PORTAL_ACCESS_TOKEN: "custentity_mw_portal_access_token",
            PORTAL_PASSWORD: "custentity_mw_contact_portal_pass",
            PORTAL_ADMIN_PASSWORD: "custentity_mw_portal_admin_pass",
            VENDOR_PORTAL: "custentity_mw_contact_portal",
            PORTAL_RESET_PASSWORD_TOKEN: "custentity_mw_portal_pass_reset_token",
            PORTAL_RESET_PASSWORD_TOKEN_EXPIRATION: "custentity_mw_portal_pass_exp",
            RELATED_EMPLOYEE: "custentity_mw_contact_related_employee"
        }
    };
    exports.EMPLOYEE = {
        FIELDS: {
            INTERNALID: "internalid",
            EMAIL: "email",
            CM_PORTAL_KEY: "custentity_mw_cm_portal_key",
            UNIQUE_KEY: "custentity_mw_update_page_key_emp"
        }
    };
    exports.ITEM = {
        FIELDS: {
            ITEM_NAME: "itemid",
            DISPLAY_NAME: "displayname",
            PURCHASE_PRICE: "cost",
            TBS_DATA: "custitem_mw_tbs_report_data"
        }
    };
    exports.APPROVAL_REQUEST = {
        ID: "customrecord_mw_po_approval_request",
        FIELDS: {
            INTERNALID: "internalid",
            PURCHASE_ORDER: "custrecord_mw_purchase_order",
            PURCHASE_ORDER_NAME: "purchase_order_name",
            PURCHASE_ORDER_DATE: "purchase_order_date",
            PURCHASE_ORDER_EXPECTED_SHIP_DATE: "purchase_order_shipdate",
            PURCHASE_ORDER_SHIPADDRESS: "purchase_order_shippaddress",
            PURCHASE_ORDER_SHIPADDRESSEE: "purchase_order_shippaddressee",
            PURCHASE_ORDER_LOCATION: "purchase_order_location",
            PURCHASE_ORDER_TOTAL: "purchase_order_total",
            PURCHASE_ORDER_APPROVAL_STATUS: "purchase_order_approval_status",
            PURCHASE_ORDER_IS_REPLACEMENT: "purchase_order_is_replacement",
            PURCHASE_ORDER_IS_DROPSHIP: "purchase_order_is_dropship",
            PURCHASE_ORDER_IS_RENEGADE: "purchase_order_is_renegade",
            PURCHASE_ORDER_PARTS_SHIP_METHOD: "purchase_order_parts_ship_method",
            VENDOR: "custrecord_mw_related_vendor",
            LAST_SHIP_DATE: "custrecord_mw_last_po_ship_date",
            NEW_SHIP_DATE: "custrecord_mw_new_po_ship_date",
            SHIPDATE_CHANGE_REASON: "custrecord_mw_shipdate_change_reason",
            TOTAL: "custrecord_mw_po_total",
            DATE: "custrecord_mw_date_sent",
            PAGE_LINK: "custrecord_mw_page_link",
            PLANNER_PAGE_LINK: "custrecord_mw_po_planner_link",
            VENDOR_ANSWERED_ORIGINAL_REQUEST: "custrecord_mw_answered_original_request",
            REMINDERS_SENT: "custrecord_mw_reminders_sent",
            VENDOR_OR_TOV_SIDE: "custrecord_mw_vendor_or_tov_side",
            PI_FILE_UPLOADED: "custrecord_mw_pi_file_uploaded",
            LOAD_PLAN_UPLOADED: "custrecord_mw_load_plan_uploaded",
            ISN_COMPLETE: "custrecord_mw_isn_complete",
            PI_FILE: "custrecord_mw_pi_file",
            LOAD_PLAN: "custrecord_mw_load_plan",
            RELATED_ISNS: "custrecord_mw_related_isns",
            APPROVED: "custrecord_mw_approved",
            MOST_RECENT_REQUEST: "custrecord_mw_most_recent_request",
            ISN_SHIPPED: "custrecord_mw_isn_shipped",
            SHIPMENT_RELATED_FILES: "custrecord_mw_shipment_related_files"
        }
    };
    exports.APPROVAL_REQUEST_COMMENTS = {
        ID: "customrecord_mw_po_approval_request_comm",
        FIELDS: {
            APPROVAL_REQUEST: "custrecord_mw_comm_approval_req",
            COMMENT_DATE: "custrecord_mw_comment_date",
            GENERAL_COMMENT: "custrecord_mw_general_comment",
            ITEMS_COMMENT: "custrecord_mw_items_comment",
            VENDOR_OR_TOV: "custrecord_mw_vendor_or_tov"
        }
    };
    exports.APPROVAL_REQUEST_LINES = {
        ID: "customrecord_mw_po_approval_request_line",
        FIELDS: {
            INTERNALID: "internalid",
            APPROVAL_REQUEST: "custrecord_mw_line_approval_req",
            LINE_UNIQUE_KEY: "custrecord_mw_line_unique_key",
            REQUEST_DATE: "custrecord_mw_request_date",
            ITEM: "custrecord_mw_request_item",
            ITEM_NAME: "item_name",
            DISPLAY_NAME: "display_name",
            LAST_QTY: "custrecord_mw_request_last_quantity",
            NEW_QTY: "custrecord_mw_request_new_quantity",
            LAST_PURCH_PRICE: "custrecord_mw_request_last_purch_price",
            NEW_PURCH_PRICE: "custrecord_mw_request_new_purch_price",
            LAST_RATE: "custrecord_mw_request_last_rate",
            NEW_RATE: "custrecord_mw_request_new_rate",
            AMOUNT: "custrecord_mw_request_amount",
            LAST_CBM: "custrecord_mw_request_last_cbm",
            NEW_CBM: "custrecord_mw_request_new_cbm",
            CBF: "custrecord_mw_request_cbf",
            EXPECTED_RECEIPT_DATE: "custrecord_mw_request_receipt_date",
            REQUIRED_CHANGES: "custrecord_mw_request_changes",
            VENDOR_OR_TOV_SIDE: "custrecord_mw_line_vendor_or_tov_side",
            ACCEPTED_BY_VENDOR: "custrecord_mw_accepted_by_vendor_line",
            ACCEPTED_BY_TOV: "custrecord_mw_accepted_by_tov_line",
            APPROVED: "custrecord_mw_approved_line"
        }
    };
    exports.APPROVAL_REQUEST_EMAIL = {
        ID: "customrecord_mw_po_approval_request_em",
        FIELDS: {
            INTERNALID: "internalid",
            PURCHASE_ORDER: "custrecord_mw_appr_email_po",
            IN_QUEUE: "custrecord_mw_appr_email_queue",
            SENT: "custrecord_mw_appr_email_sent",
            RESENT_EMAIL: "custrecord_mw_appr_email_resent_email"
        }
    };
    exports.INBOUND_SHIPMENT = {
        ID: "inboundshipment",
        FIELDS: {
            INTERNALID: "internalid",
            SHIPMENT_NUMBER: "shipmentnumber",
            CREATED_DATE: "shipmentcreateddate",
            EXPECTED_READY_DATE: "custrecord_mw_expected_ready_date",
            CURRENT_READY_DATE: "custrecordcurrent_ready_date",
            CONFIRMED_DEPARTURE_DATE: "custrecordconfirmed_departure",
            DESTINATION_LOCATION: "receivinglocation",
            BOOKING_STATUS: "custrecordbooking_status",
            SHIPMENT_STATUS: "status",
            STATUS: "shipmentstatus",
            COINTAINER_NUMBER: "vesselnumber",
            TSCA_FILE: "custrecord_mw_isn_tsca_reg_file",
            PACK_SLIP_FILE: "custrecord_mw_pckslip_comminv_file",
            LOADING_REPORT_FILE: "custrecord_mw_loading_report_file",
            OTHER_FILE: "custrecord_mw_other_shipment_file"
        },
        ITEM_SUBLIST: {
            ID: "item",
            FIELDS: {
                ITEM: "item",
                QUANTITY_EXPECTED: "quantityexpected",
                PURCHASE_ORDER: "purchaseorder",
                VENDOR: "vendor",
                RATE: "expectedrate",
                AMOUNT: "poamount"
            }
        }
    };
    exports.EMAIL_SUBSCRIPTIONS = {
        ID: "customrecord_mw_email_recipients",
        FIELDS: {
            MODULE: "custrecord_mw_related_email_module",
            EMPLOYEE: "custrecord_mw_related_employee",
            EMAIL: "custrecord_mw_related_email"
        }
    };
    exports.VENDOR_ETA_EMAIL_SENT = {
        ID: "customrecord_mw_vendor_eta_email_sent",
        FIELDS: {
            VENDOR: "custrecord_mw_vendor",
            LINK_OPENED: "custrecord_mw_link_opened",
            DATA_SUBMITTED: "custrecord_mw_data_submitted",
            GROUPED_PAGE: "custrecord_mw_grouped_page",
            MOST_RECENT_EMAIL: "custrecord_mw_most_recent_email",
            SUBMISSION_DATA_RECORD: "custrecord_mw_submission_data_record",
            DATA_CHANGES_SUMMARY: "custrecord_mw_data_changes_summary",
            DATA_CHANGES_TABLE: "custrecord_mw_eta_data_changes_table"
        }
    };
    exports.DELAY_TYPE_LIST = {
        ID: "customlist_mw_delay_types",
    };
    exports.PO_TO_UPDATE_RECORD = {
        RECORD_ID: "customrecord_mw_po_to_update",
        FIELDS: {
            DATE_CREATED: "created",
            DETAILS: "custrecord_mw_details",
            GENERAL_DATA: "custrecord_mw_potoupdate_general",
            PROCESSED: "custrecord_mw_processed",
            VENDOR: "custrecord_mw_vendor_id"
        },
        DETAILS_IDS: {
            SHIPMENT_ID: "shipmentId",
            PURCHASE_ORDER_ID: "purchaseOrderId",
            IS_PENDING_LINE: "isPendingLine",
            CURRENT_SHIP_DATE: "currentShipDate",
            CURRENT_DEPARTURE_DATE: "currentDepartureDate",
            EXPECTED_TO_PORT: "expectedToPort",
            DELAY_TYPE: "delayType",
            DELAY_TYPE_TEXT: "delayTypeText",
            NOTES: "notes"
        }
    };
    // Objects used
    exports.PURCHASE_ORDER_OBJECT = {
        TRANID: "tranid",
        SUBTOTAL: "subtotal",
        VENDOR_DISCOUNT: "vendor_discount",
        TOTAL: "total",
        TOTAL_CBM: "total_cbm",
        SHIPADDRESS: "shipaddress",
        PO_EXPECTED_SHIP_DATE: "po_expected_ship_date",
        VENDOR_NAME: "vendor_name",
        VENDOR_UNIQUE_KEY: "vendor_unique_key",
        VENDOR_ID: "vendor_id",
        LINE_KEY: "lineuniquekey",
        LOGO: "logo",
        ITEMS: "items",
        ITEM_ID: "item_id",
        ITEM_NAME: "item_name",
        DISPLAY_NAME: "display_name",
        QUANTITY: "quantity",
        QUANTITY_ON_SHIPMENTS: "quantity_on_shipments",
        PURCHASE_PRICE: "purchase_price",
        TARIFF_RATE: "tariff_rate",
        TARIFF_DISCOUNT: "tariff_discount",
        RATE: "rate",
        AMOUNT: "amount",
        CBF: "cbf",
        CBM: "cbm",
        FABRIC_CODE: "fabric_code",
        EXPECTED_RECEIPT_DATE: "expected_receipt_date",
        ITEM_COLLAB: "item_collab",
        REQ_LAST_QTY: "req_last_qty",
        REQ_NEW_QTY: "req_new_qty",
        REQ_LAST_PURCH_PRICE: "req_last_purch_price",
        REQ_NEW_PURCH_PRICE: "req_new_purch_price",
        REQ_LAST_RATE: "req_last_rate",
        REQ_NEW_RATE: "req_new_rate",
        REQ_LAST_CBM: "req_last_cbm",
        REQ_NEW_CBM: "req_new_cbm",
        REQ_EXPECTED_RECEIPT_DATE: "req_expected_receipt_date",
        REQUIRED_CHANGES: "required_changes",
        VENDOR_OR_TOV_SIDE: "vendor_tov_side",
        LINE_ACCEPTED_BY_VENDOR: "line_accepted_by_vendor",
        LINE_ACCEPTED_BY_TOV: "line_accepted_by_tov",
        LINE_APPROVED: "line_approved"
    };
    exports.APPROVAL_REQUEST_OBJECT = {
        INTERNALID: "internalid",
        DATE: "date",
        PAGE_LINK: "page_link",
        REMINDERS_SENT: "reminders_sent",
        PURCHASE_ORDER: "purchase_order",
        PO_TRANID: "po_tranid",
        PO_DATE: "po_date",
        VENDOR: "vendor",
        VENDOR_LOGO: "vendor_logo",
        AGE_IN_HOURS: "age_in_hours",
        VENDOR_OR_TOV_SIDE: "vendor_or_tov_side"
    };
    exports.APPROVAL_REQUEST_LINES_OBJECT = {
        TRANID: "tranid",
        VENDOR_NAME: "vendor_name",
        VENDOR_ID: "vendor_id",
        ITEMS: "items",
        ITEM_ID: "item_id",
        ITEM_NAME: "item_name",
        DISPLAY_NAME: "display_name",
        QUANTITY: "quantity",
        RATE: "rate",
        AMOUNT: "amount",
        CBF: "CBF",
        EXPECTED_RECEIPT_DATE: "expected_receipt_date"
    };
    exports.INBOUND_SHIPMENT_OBJECT = {
        ISN_INTERNALID: "isn_internalid",
        SHIPMENT_NUMBER: "shipment_number",
        EXPECTED_READY_DATE: "expected_ready_date",
        CURRENT_READY_DATE: "current_ready_date",
        CONFIRMED_DEPARTURE_DATE: "confirmed_departure_date",
        DESTINATION_LOCATION: "destination_location",
        BOOKING_STATUS: "booking_status",
        SHIPMENT_STATUS: "shipment_status",
        PURCHASE_ORDER: "purchase_order",
        PO_LOCATION: "purchase_order_location",
        TOTAL: "total",
        TOTAL_CBM: "total_cbm",
        SHIPADDRESS: "shipaddress",
        PO_EXPECTED_SHIP_DATE: "po_expected_ship_date",
        VENDOR_NAME: "vendor_name",
        VENDOR_UNIQUE_KEY: "vendor_unique_key",
        VENDOR_ID: "vendor_id",
        LINE_KEY: "lineuniquekey",
        LOGO: "logo",
        ITEMS: "items",
        ITEM_ID: "item_id",
        ITEM_NAME: "item_name",
        DISPLAY_NAME: "display_name",
        QUANTITY_EXPECTED: "quantity_expected",
        QUANTITY_ON_SHIPMENTS: "quantity_on_shipments",
        RATE: "rate",
        AMOUNT: "amount",
        CBF: "cbf",
        CBM: "cbm",
        FABRIC_CODE: "fabric_code",
        EXPECTED_RECEIPT_DATE: "expected_receipt_date",
        ITEM_COLLAB: "item_collab",
        REQ_LAST_QTY: "req_last_qty",
        REQ_NEW_QTY: "req_new_qty",
        REQ_LAST_RATE: "req_last_rate",
        REQ_NEW_RATE: "req_new_rate",
        REQ_EXPECTED_RECEIPT_DATE: "req_expected_receipt_date",
        REQUIRED_CHANGES: "required_changes",
        VENDOR_OR_TOV_SIDE: "vendor_tov_side",
        LINE_ACCEPTED_BY_VENDOR: "line_accepted_by_vendor",
        LINE_ACCEPTED_BY_TOV: "line_accepted_by_tov",
        LINE_APPROVED: "line_approved"
    };
    exports.ETA_TBS_DATA_IDS = {
        ITEM_SKU: "sku",
        ITEM_NAME: "name",
        LOCATION_NAME: "locationName",
        LOCATION_ID: "locationId",
        VENDOR_ID: "vendorId",
        VENDOR_NAME: "vendorName",
        QUANTITY_EXPECTED: "quantityExpected",
        EXPECTED_SHIP_DATE: "expectedShipDate",
        CURRENT_SHIP_DATE: "currentShipDate",
        CURRENT_READY_DATE: "currentReadyDate",
        EXPECTED_TO_PORT_DATE: "expectedToPortDate",
        ITEM_TYPE: "type",
        PO_ID: "purchaseOrderId",
        PO_DATE: "purchaseOrderDate",
        MANUFACTURED_COUNTRY: "countryofmanufacture",
        SHIPMENT_ID: "shipmentId",
        SHIPMENT_NAME: "shipmentName",
        SHIPMENT_DATE: "shipmentDate",
        LOCATION_STATE: "locationState",
        VENDOR_COUNTRY: "vendorCountry",
        BOOKING_STATUS: "bookingStatus"
    };
    // Scripts
    exports.SCRIPTS = {
        VENDOR_PORTAL_SUITELET: {
            ID: runtime.envType == runtime.EnvType.SANDBOX ? "1389" : "1396",
            DEPLOY: runtime.envType == runtime.EnvType.SANDBOX ? "customdeploy_mw_po_vendor_portal_d" : "customdeploy_mw_po_vendor_portal_d"
        },
        PO_PLANNER_PORTAL_SUITELET: {
            ID: runtime.envType == runtime.EnvType.SANDBOX ? "1390" : "1397",
            DEPLOY: runtime.envType == runtime.EnvType.SANDBOX ? "customdeploy_mw_po_planner_portal_d" : "customdeploy_mw_po_planner_portal_d"
        },
        COUNTRY_MANAGER_PORTAL_SUITELET: {
            ID: runtime.envType == runtime.EnvType.SANDBOX ? "1453" : "1726",
            DEPLOY: runtime.envType == runtime.EnvType.SANDBOX ? "customdeploy_mw_country_manager_portal_d" : "customdeploy_mw_country_manager_portal_d"
        },
        RETURN_PDF_SUITELET: {
            ID: runtime.envType == runtime.EnvType.SANDBOX ? "1463" : "1729",
            DEPLOY: runtime.envType == runtime.EnvType.SANDBOX ? "customdeploy_mw_po_return_pdf_d" : "customdeploy_mw_po_return_pdf_d"
        },
        PORTAL_ACTIONS: {
            ID: runtime.envType == runtime.EnvType.SANDBOX ? "1481" : "1736",
            DEPLOY: runtime.envType == runtime.EnvType.SANDBOX ? "customdeploy_mw_po_portal_actions_ss_d" : "customdeploy_mw_po_portal_actions_ss_d"
        },
        CREATE_APPROVAL_SCHEDULED: {
            ID: runtime.envType == runtime.EnvType.SANDBOX ? "1385" : "1395",
            DEPLOY: runtime.envType == runtime.EnvType.SANDBOX ? "customdeploy_mw_po_send_request_sch_d" : "customdeploy_mw_po_send_request_sch_d",
            PARAMS: {
                PURCHASE_ORDER_ID: "custscript_mw_purchase_order_id"
            }
        },
        PORTAL_LOGIN: {
            ID: runtime.envType === runtime.EnvType.SANDBOX ? "1564" : "1771",
            DEPLOY: runtime.envType === runtime.EnvType.SANDBOX ? "customdeploy_mw_portal_login_dp" : "customdeploy_mw_portal_login_dp"
        },
        NEW_VENDOR_REQUESTS: {
            ID: runtime.envType === runtime.EnvType.SANDBOX ? "1454" : "2702",
            DEPLOY: runtime.envType === runtime.EnvType.SANDBOX ? "customdeploy_mw_accept_new_vendor_d" : "customdeploy_mw_accept_new_vendor_d"
        },
        IMPORT_SCHEDULED_SCRIPT: {
            ID: runtime.envType == runtime.EnvType.SANDBOX ? "1244" : "1244",
            DEPLOY: "customdeploy_mw_vendor_eta_import_sch_d",
            PARAMS: {
                LAST_IND_PROC: "custscript_mw_last_index_processed",
                PO_NUMBERS_PROCESSED: "custscript_mw_po_numbers_processed",
                DATA_CHANGES: "custscript_mw_eta_update_data_changes"
            }
        },
        UPDATE_PO_APPROVED: {
            ID: runtime.envType == runtime.EnvType.SANDBOX ? "customscript_mw_update_po_approved" : "",
            DEPLOY: runtime.envType == runtime.EnvType.SANDBOX ? "customdeploy_mw_update_po_approved_d" : ""
        },
    };
    // Searches
    exports.SEARCHES = {
        VALID_ITEMS_TBS: "customsearch_mw_tbs_report_2",
        PREVIOUS_TBS_ITEMS: "customsearch_mw_tbs_report_3",
        TBS_ITEMS_DATA: "customsearch_mw_tbs_report_4"
    };
    // Emails
    exports.EMAIL_TEMPLATES = {
        FIRST_REQUEST: runtime.envType == runtime.EnvType.SANDBOX ? 778 : 778,
        DATA_REFRESHED: runtime.envType == runtime.EnvType.SANDBOX ? 807 : 1299,
        REMINDER: runtime.envType == runtime.EnvType.SANDBOX ? 779 : 779,
        APPROVED_BY_VENDOR_TO_TOV: runtime.envType == runtime.EnvType.SANDBOX ? 773 : 773,
        APPROVED_BY_VENDOR_TO_VENDOR: runtime.envType == runtime.EnvType.SANDBOX ? 787 : 784,
        APPROVED_BY_TOV: runtime.envType == runtime.EnvType.SANDBOX ? 774 : 774,
        APPROVED_BY_TOV_PENDING_FILE: runtime.envType == runtime.EnvType.SANDBOX ? 775 : 775,
        CHANGE_BY_VENDOR: runtime.envType == runtime.EnvType.SANDBOX ? 777 : 777,
        CHANGE_BY_TOV: runtime.envType == runtime.EnvType.SANDBOX ? 776 : 776,
        VENDOR_UPLOADED_PI: runtime.envType == runtime.EnvType.SANDBOX ? 781 : 781,
        VENDOR_UPLOADED_LOAD_PLAN: runtime.envType == runtime.EnvType.SANDBOX ? 789 : 785,
        REPORT: runtime.envType == runtime.EnvType.SANDBOX ? 780 : 780,
        VENDOR_WELCOME: runtime.envType == runtime.EnvType.SANDBOX ? 803 : 1295,
        RESET_PASSWORD: runtime.envType == runtime.EnvType.SANDBOX ? 804 : 1296
    };
    exports.CC_REMINDERS = [
        15984
    ];
    // Files
    exports.FILES = {
        GLOBAL: {
            CSS: runtime.envType === runtime.EnvType.SANDBOX ? 2530359 : 2818718,
            JS: runtime.envType === runtime.EnvType.SANDBOX ? 2529459 : 2818318
        },
        SIDEBAR: {
            CSS: runtime.envType === runtime.EnvType.SANDBOX ? 2530361 : 2818720,
            JS: runtime.envType === runtime.EnvType.SANDBOX ? 2530362 : 2818320
        },
        HOME: {
            CSS: runtime.envType === runtime.EnvType.SANDBOX ? 2530360 : 2818719,
            JS: runtime.envType === runtime.EnvType.SANDBOX ? 2529460 : 2818319
        },
        VENDOR_PORTAL: {
            CSS: runtime.envType === runtime.EnvType.SANDBOX ? 2530463 : 2818722,
            JS: runtime.envType === runtime.EnvType.SANDBOX ? 2529474 : 2818624
        },
        PO_PLANNER_PORTAL: {
            CSS: runtime.envType === runtime.EnvType.SANDBOX ? 2530462 : 2818721,
            JS: runtime.envType === runtime.EnvType.SANDBOX ? 2529565 : 2818328
        },
        COUNTRY_MANAGER_PORTAL: {
            CSS: runtime.envType === runtime.EnvType.SANDBOX ? 2808786 : 2959163,
            JS: runtime.envType === runtime.EnvType.SANDBOX ? 2808588 : 2958965
        },
        PORTAL_LOGIN: {
            CSS: runtime.envType === runtime.EnvType.SANDBOX ? 2904235 : 0
        },
        ETA_PAGE: {
            JS: runtime.envType === runtime.EnvType.SANDBOX ? 3136777 : 0,
            CSS: runtime.envType === runtime.EnvType.SANDBOX ? 3136977 : 0
        },
        CREATE_IS: {
            JS: runtime.envType === runtime.EnvType.SANDBOX ? 3233943 : 0,
            CSS: runtime.envType === runtime.EnvType.SANDBOX ? 3243937 : 0
        },
        EDIT_IS: {
            JS: runtime.envType === runtime.EnvType.SANDBOX ? 3254373 : 0,
        }
    };
    exports.PDF_TEMPLATES = {
        ISN_PACKING_SLIP: runtime.envType === runtime.EnvType.SANDBOX ? 113 : 0,
    };
    exports.LOGIN_STATE = {
        SUCCESSFUL: 1,
        ACCOUNT_NOT_FOUND: 2,
        PASSWORD_ERROR: 3,
        NOT_STARTED: 4
    };
});
