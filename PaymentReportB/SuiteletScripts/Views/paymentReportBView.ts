/**
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */

import * as error from "N/error";
import * as url from "N/url";
import * as serverWidget from "N/ui/serverWidget";
import * as log from "N/log";
import * as currentRecord from "N/currentRecord";

import * as constants from "../../Constants/Constants";

export function mainView(pStatus) {
  log.debug("Status View", pStatus);

  let view = serverWidget.createForm({
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

