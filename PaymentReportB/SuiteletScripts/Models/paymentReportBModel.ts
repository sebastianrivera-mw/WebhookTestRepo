/**
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */

import * as log from "N/log";
import * as search from "N/search";
import * as error from "N/error";
import * as task from "N/task";
import * as runtime from "N/runtime";

import * as constants from "../../Constants/Constants";

export function updatePayments(pData) {
  let searchImport = search
    .create({
      type: "customrecord_mw_payment_rep_imp_data_b",
      filters: [["custrecord_mw_status_data", "anyof", [constants.STATES.HALT, constants.STATES.RUNNING]]],
      columns: [search.createColumn({ name: "internalid" })],
    })
    .run()
    .getRange({ start: 0, end: 1 });

  log.debug("Search Result", searchImport);

  //Exist execution in this moment
  if (searchImport && searchImport.length > 0) {
    return constants.STATUS_CODES.CURRENT_EXECUTION;
  } else {
    log.debug(
      "Checkbox Value",
      `Invoice ${pData.parameters["check_box_invoice"]} and Sales Orders ${pData.parameters["check_box_sales_orders"]}`,
    );

    // Validate checkbox
    if (pData.parameters["check_box_invoice"] === "F" && pData.parameters["check_box_sales_orders"] === "F") {
      return constants.STATUS_CODES.AT_LEAST_ONE;
    } else if (pData.parameters["check_box_invoice"] === "T" && pData.parameters["check_box_sales_orders"] === "T") {
      return constants.STATUS_CODES.ONE;

      //If selected one
    } else {
      try {
        //Save CSV in especific folder
        let newFile = pData.files["csv_file"];
        newFile.folder = constants.GENERAL.FOLDER;
        let newFileId = newFile.save();

        log.debug("Created", `Upload File ${newFileId}`);

        // Task for scheduled script
        task
          .create({
            taskType: task.TaskType.SCHEDULED_SCRIPT,
            scriptId: "1917",
            deploymentId: "customdeploy_mw_payment_rep_imp_sch_b_d",
            params: {
              custscript_mw_step_sch_bryan: "first",
              custscript_mw_file_sch_bryan: newFileId,
              custscript_mw_task_sch_bryan: "0",
              custscript_mw_record_sch_bryan: "0",
              custscript_mw_last_page_processed_sch_b: "0",
              custscript_mw_last_payment_process_sch_b: "0",
              custscript_mw_email_sch_bryan: runtime.getCurrentUser().email,
              custscript_mw_name_sch_bryan: runtime.getCurrentUser().name,
              custscript_mw_use_sales_orders_sch_b: pData.parameters["check_box_sales_orders"],
              custscript_mw_use_involves_sch_bryan: pData.parameters["check_box_invoice"],
            },
          })
          .submit();

        //Indicates that scheduled script init
        return constants.STATUS_CODES.CREATED;
      } catch (e) {
        log.error("Error", `Error generating the report: ${e.message}`);
        return constants.STATUS_CODES.UNKNOWN;
      }
    }
  }
}

