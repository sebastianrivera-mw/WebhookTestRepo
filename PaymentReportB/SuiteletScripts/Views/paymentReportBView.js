/**
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */
define(["require", "exports", "N/ui/serverWidget", "N/log"], function (require, exports, serverWidget, log) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function mainView(pStatus) {
        log.debug("Status View", pStatus);
        var view = serverWidget.createForm({
            title: "Payment Report",
        });
        view.clientScriptModulePath = "../../ClientScripts/paymentReportCS.js";
        view.addField({
            id: "check_box_sales_orders",
            label: "Sales Orders",
            type: serverWidget.FieldType.CHECKBOX,
        });
        view.addField({
            id: "check_box_invoice",
            label: "Invoice",
            type: serverWidget.FieldType.CHECKBOX,
        });
        view.addField({
            id: "csv_file",
            label: "Add CSV",
            type: serverWidget.FieldType.FILE,
        });
        if (pStatus) {
            view
                .addField({
                id: "status",
                type: serverWidget.FieldType.TEXT,
                label: "null",
            })
                .updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN }).defaultValue = pStatus;
        }
        log.debug("Status View", pStatus);
        view.addSubmitButton({ label: "Add CSV" });
        return view;
    }
    exports.mainView = mainView;
});

