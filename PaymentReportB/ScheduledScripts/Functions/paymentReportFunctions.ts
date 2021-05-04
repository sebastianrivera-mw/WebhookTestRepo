import { STATES } from "./../../Constants/Constants";
/**
 * @author Midware
 * @developer Bryan Badilla
 * @contact contact@midware.net
 */

import * as task from "N/task";
import * as runtime from "N/runtime";
import * as file from "N/file";
import * as search from "N/search";
import * as record from "N/record";
import * as format from "N/format";
import * as email from "N/email";
import * as log from "N/log";

import * as constants from "../../Constants/Constants";

export function checkPaymentReport(pStep) {
  //First step create task csv and record import data
  if (pStep === "first") {
    log.debug("Fist Step", pStep);
    createCSVImport();
  } else if (pStep === "second") {
    log.debug("Second Step", pStep);
    importCSVFile();
  } else if (pStep === "third") {
    log.debug("Third Step", pStep);
    failImported();
  } else if (pStep === "fourth") {
    log.debug("Fourth Step", pStep);
    reportProcess();
  } else {
    return;
  }
}

function createCSVImport() {
  //Params for create record and go to second state
  let fileId = runtime.getCurrentScript().getParameter({ name: "custscript_mw_file_sch_bryan" });
  let currentUserEmail = runtime.getCurrentScript().getParameter({ name: "custscript_mw_email_sch_bryan" });
  let currentUserName = runtime.getCurrentScript().getParameter({ name: "custscript_mw_name_sch_bryan" });
  let useSalesOrder = runtime.getCurrentScript().getParameter({ name: "custscript_mw_use_sales_orders_sch_b" });
  let useInvoices = runtime.getCurrentScript().getParameter({ name: "custscript_mw_use_involves_sch_bryan" });
  let fileLoaded = file.load({ id: fileId.toString() });

  log.debug("File Id", `${fileId} was loaded`);

  // Cretae task CSV_Import
  let csvTask = task
    .create({
      taskType: task.TaskType.CSV_IMPORT,
      importFile: fileLoaded,
      mappingId: constants.GENERAL.MAPPING_ID,
    })
    .submit();

  log.debug("Created", `Task ${csvTask} was created`);

  //Create a record import data
  let newRecord = record.create({ type: "customrecord_mw_payment_rep_imp_data_b" });
  newRecord.setValue({ fieldId: "name", value: fileLoaded.name });
  newRecord.setValue({ fieldId: "custrecord_mw_task_import_data", value: csvTask });
  newRecord.setValue({ fieldId: "custrecord_mw_initial_report_data", value: fileId });
  newRecord.setValue({ fieldId: "custrecord_mw_status_data", value: constants.STATES.HALT });
  newRecord.setValue({ fieldId: "custrecord_mw_data_data", value: "{}" });

  let taskRecord = newRecord.save();

  log.debug("Created", `Record ${taskRecord} was created`);

  //Scheduled percent
  runtime.getCurrentScript().percentComplete = 25;

  // Task for scheduled second state
  task
    .create({
      taskType: task.TaskType.SCHEDULED_SCRIPT,
      scriptId: runtime.getCurrentScript().id,
      deploymentId: runtime.getCurrentScript().deploymentId,
      params: {
        custscript_mw_step_sch_bryan: "second",
        custscript_mw_file_sch_bryan: fileId,
        custscript_mw_task_sch_bryan: csvTask,
        custscript_mw_record_sch_bryan: taskRecord,
        custscript_mw_last_page_processed_sch_b: "0",
        custscript_mw_last_payment_process_sch_b: "0",
        custscript_mw_email_sch_bryan: currentUserEmail,
        custscript_mw_name_sch_bryan: currentUserName,
        custscript_mw_use_sales_orders_sch_b: useSalesOrder,
        custscript_mw_use_involves_sch_bryan: useInvoices,
      },
    })
    .submit();
}

function importCSVFile() {
  //Params for decide next stament
  let taskId = runtime.getCurrentScript().getParameter({ name: "custscript_mw_task_sch_bryan" });
  let fileId = runtime.getCurrentScript().getParameter({ name: "custscript_mw_file_sch_bryan" });
  let recordId = runtime.getCurrentScript().getParameter({ name: "custscript_mw_record_sch_bryan" });
  let currentUserEmail = runtime.getCurrentScript().getParameter({ name: "custscript_mw_email_sch_bryan" });
  let currentUserName = runtime.getCurrentScript().getParameter({ name: "custscript_mw_name_sch_bryan" });
  let useSalesOrder = runtime.getCurrentScript().getParameter({ name: "custscript_mw_use_sales_orders_sch_b" });
  let useInvoices = runtime.getCurrentScript().getParameter({ name: "custscript_mw_use_involves_sch_bryan" });

  // Get status
  let taskStatus = task.checkStatus({ taskId: taskId.toString() });

  // Check if it is still being pending or processed, it is cycled
  if (taskStatus.status === task.TaskStatus.PENDING || taskStatus.status === task.TaskStatus.PROCESSING) {
    log.debug("In process or pending", `The task ${taskId} is in ${taskStatus.status}`);

    task
      .create({
        taskType: task.TaskType.SCHEDULED_SCRIPT,
        scriptId: runtime.getCurrentScript().id,
        deploymentId: runtime.getCurrentScript().deploymentId,
        params: {
          custscript_mw_step_sch_bryan: "second",
          custscript_mw_file_sch_bryan: fileId,
          custscript_mw_task_sch_bryan: taskId,
          custscript_mw_record_sch_bryan: recordId,
          custscript_mw_last_page_processed_sch_b: "0",
          custscript_mw_last_payment_process_sch_b: "0",
          custscript_mw_email_sch_bryan: currentUserEmail,
          custscript_mw_name_sch_bryan: currentUserName,
          custscript_mw_use_sales_orders_sch_b: useSalesOrder,
          custscript_mw_use_involves_sch_bryan: useInvoices,
        },
      })
      .submit();
    // Check if it is failed, go to fail status
  } else if (taskStatus.status === task.TaskStatus.FAILED) {
    log.debug("Fail", `The task ${taskId} is in ${taskStatus.status}`);

    // Put in the record error status
    record.submitFields({
      type: "customrecord_mw_payment_rep_imp_data_b",
      id: recordId.toString(),
      values: {
        custrecord_mw_status_data: constants.STATES.ERROR,
      },
    });

    // Task for go to third status, fail process
    task
      .create({
        taskType: task.TaskType.SCHEDULED_SCRIPT,
        scriptId: runtime.getCurrentScript().id,
        deploymentId: runtime.getCurrentScript().deploymentId,
        params: {
          custscript_mw_step_sch_bryan: "third",
          custscript_mw_file_sch_bryan: fileId,
          custscript_mw_task_sch_bryan: taskId,
          custscript_mw_record_sch_bryan: "0",
          custscript_mw_last_page_processed_sch_b: "0",
          custscript_mw_last_payment_process_sch_b: "0",
          custscript_mw_email_sch_bryan: currentUserEmail,
          custscript_mw_name_sch_bryan: currentUserName,
          custscript_mw_use_sales_orders_sch_b: useSalesOrder,
          custscript_mw_use_involves_sch_bryan: useInvoices,
        },
      })
      .submit();
    //If finish the import?
  } else {
    log.debug("Completed", `The task ${taskId} is in ${taskStatus.status} status`);

    record.submitFields({
      type: "customrecord_mw_payment_rep_imp_data_b",
      id: recordId.toString(),
      values: {
        custrecord_mw_status_data: constants.STATES.RUNNING,
      },
    });

    task
      .create({
        taskType: task.TaskType.SCHEDULED_SCRIPT,
        scriptId: runtime.getCurrentScript().id,
        deploymentId: runtime.getCurrentScript().deploymentId,
        params: {
          custscript_mw_step_sch_bryan: "fourth",
          custscript_mw_file_sch_bryan: fileId,
          custscript_mw_task_sch_bryan: "0",
          custscript_mw_record_sch_bryan: recordId,
          custscript_mw_last_page_processed_sch_b: "0",
          custscript_mw_last_payment_process_sch_b: "0",
          custscript_mw_email_sch_bryan: currentUserEmail,
          custscript_mw_name_sch_bryan: currentUserName,
          custscript_mw_use_sales_orders_sch_b: useSalesOrder,
          custscript_mw_use_involves_sch_bryan: useInvoices,
        },
      })
      .submit();
  }
}

function failImported() {
  //Params for decide next stament
  let taskId = runtime.getCurrentScript().getParameter({ name: "custscript_mw_task_sch_bryan" });
  let fileId = runtime.getCurrentScript().getParameter({ name: "custscript_mw_file_sch_bryan" });
  let currentUserEmail = runtime.getCurrentScript().getParameter({ name: "custscript_mw_email_sch_bryan" });
  let currentUserName = runtime.getCurrentScript().getParameter({ name: "custscript_mw_name_sch_bryan" });
  let useSalesOrder = runtime.getCurrentScript().getParameter({ name: "custscript_mw_use_sales_orders_sch_b" });
  let useInvoices = runtime.getCurrentScript().getParameter({ name: "custscript_mw_use_involves_sch_bryan" });

  //File loaded
  let loadedFile = file.load({ id: fileId.toString() });

  let reset = false;
  //Search for not processed reports imports
  let searchReportImports = search
    .create({
      type: "customrecord_mw_payment_rep_imp_b",
      //Filter: all records that process is false
      filters: [["custrecord_mw_payment_rep_processed", "is", "F"]],
      columns: [search.createColumn({ name: "internalid" })],
    })
    .runPaged({ pageSize: 1000 });

  //Last Page and Las payment processed
  let last_page = Number(runtime.getCurrentScript().getParameter({ name: "custscript_mw_last_page_processed_sch_b" }));
  let last_payment = Number(runtime.getCurrentScript().getParameter({ name: "custscript_mw_last_payment_process_sch_b" }));

  for (let i = last_page; i < searchReportImports.pageRanges.length; i++) {
    // Retrieve a page of results by index
    let page = searchReportImports.fetch({ index: searchReportImports.pageRanges[i].index });

    for (let j = reset === false ? last_payment : 0; j < page.data.length; j++) {
      try {
        //Returns the number of units remaining for the currently executing script.
        //Re-scheduled
        if (runtime.getCurrentScript().getRemainingUsage() < 1000) {
          log.debug("Not execution units", `Scheduled for another iteration in deleting import data step`);

          // Go to same state for delete
          task
            .create({
              taskType: task.TaskType.SCHEDULED_SCRIPT,
              scriptId: runtime.getCurrentScript().id,
              deploymentId: runtime.getCurrentScript().deploymentId,
              params: {
                custscript_mw_step_sch_bryan: "third",
                custscript_mw_file_sch_bryan: "0",
                custscript_mw_task_sch_bryan: "0",
                custscript_mw_record_sch_bryan: "0",
                custscript_mw_last_page_processed_sch_b: "0",
                custscript_mw_last_payment_process_sch_b: "0",
                custscript_mw_email_sch_bryan: currentUserEmail,
                custscript_mw_name_sch_bryan: currentUserName,
                custscript_mw_use_sales_orders_sch_b: useSalesOrder,
                custscript_mw_use_involves_sch_bryan: useInvoices,
              },
            })
            .submit();
          return;
        } else {
          let internalId = page.data[j].getValue({ name: "internalid" });
          //Delete Record
          record.delete({ type: "customrecord_mw_payment_rep_imp_b", id: internalId.toString() });
        }
      } catch (e) {
        log.error("Delete Error", e);
      }
    }
    reset = true;
  }
  // Send Email
  sendEmail(
    constants.GENERAL.AUTHOR,
    currentUserEmail,
    "Result Report - Payment Report Import",
    `Hi ${currentUserName}<br/><br/>The import of file ${loadedFile.name} could not be completed successfully due to an error in the input data, for more information check the last result for the CSV import 'MW Payment Report - Import' executed by the task ${taskId}`,
    [],
  );
}

function reportProcess() {
  let fileId = runtime.getCurrentScript().getParameter({ name: "custscript_mw_file_sch_bryan" });
  let recordId = runtime.getCurrentScript().getParameter({ name: "custscript_mw_record_sch_bryan" });
  let currentUserEmail = runtime.getCurrentScript().getParameter({ name: "custscript_mw_email_sch_bryan" });
  let currentUserName = runtime.getCurrentScript().getParameter({ name: "custscript_mw_name_sch_bryan" });
  let useSalesOrder = runtime.getCurrentScript().getParameter({ name: "custscript_mw_use_sales_orders_sch_b" });
  let useInvoices = runtime.getCurrentScript().getParameter({ name: "custscript_mw_use_involves_sch_bryan" });

  //File loaded
  let loadedFile = file.load({ id: fileId.toString() });

  log.debug("Process", `Processing the report ${recordId}`);

  // Search data in record
  let dataString = search.lookupFields({
    type: "customrecord_mw_payment_rep_imp_data_b",
    id: recordId.toString(),
    columns: ["custrecord_mw_data_data"],
  });
  let currentData = JSON.parse(dataString["custrecord_mw_data_data"]);

  log.debug("Current Data", `The current data is ${currentData}`);

  let reset = false;
  // Get data from report imports not processed
  let searchReportImports = search
    .create({
      type: "customrecord_mw_payment_rep_imp_b",
      //Filter: all records that process is false
      filters: [["custrecord_mw_payment_rep_processed", "is", "F"]],
      columns: [
        search.createColumn({ name: "internalid" }),
        "custrecord_mw_payment_rep_date",
        "custrecord_mw_payment_rep_number",
        "custrecord_mw_payment_rep_amount",
        "custrecord_mw_payment_rep_check_number",
      ],
    })
    .runPaged({ pageSize: 1000 });

  let last_page = Number(runtime.getCurrentScript().getParameter({ name: "custscript_mw_last_page_processed_sch_b" }));
  let last_payment = Number(runtime.getCurrentScript().getParameter({ name: "custscript_mw_last_payment_process_sch_b" }));

  for (let i = last_page; i < searchReportImports.pageRanges.length; i++) {
    let page = searchReportImports.fetch({ index: searchReportImports.pageRanges[i].index });

    for (let j = reset === false ? last_payment : 0; j < page.data.length; j++) {
      try {
        //Returns the number of units remaining for the currently executing script.
        //Re-scheduled
        if (runtime.getCurrentScript().getRemainingUsage() < 1000) {
          log.debug("Not execution units", `Scheduled for another iteration in processing report`);

          task
            .create({
              taskType: task.TaskType.SCHEDULED_SCRIPT,
              scriptId: runtime.getCurrentScript().id,
              deploymentId: runtime.getCurrentScript().deploymentId,
              params: {
                custscript_mw_step_sch_bryan: "fourth",
                custscript_mw_file_sch_bryan: fileId,
                custscript_mw_task_sch_bryan: "0",
                custscript_mw_record_sch_bryan: recordId,
                custscript_mw_last_page_processed_sch_b: "0",
                custscript_mw_last_payment_process_sch_b: "0",
                custscript_mw_email_sch_bryan: currentUserEmail,
                custscript_mw_name_sch_bryan: currentUserName,
                custscript_mw_use_sales_orders_sch_b: useSalesOrder,
                custscript_mw_use_involves_sch_bryan: useInvoices,
              },
            })
            .submit();
          return;
        } else {
          //get values from report import record
          let internalId = page.data[j].getValue({ name: "internalid" });
          let date = page.data[j].getValue({ name: "custrecord_mw_payment_rep_date" });
          let numberInvoiceOrSale = page.data[j].getValue({ name: "custrecord_mw_payment_rep_number" });
          let amount = page.data[j].getValue({ name: "custrecord_mw_payment_rep_amount" });
          let checkNumber = page.data[j].getValue({ name: "custrecord_mw_payment_rep_check_number" });

          log.debug(
            "Data be process",
            `Date ${date}, Invoice or Sales Order ${numberInvoiceOrSale}, Amount ${amount}, Check Number ${checkNumber}`,
          );
          // Init the process payment
          processPayment(useSalesOrder, useInvoices, date, numberInvoiceOrSale, amount, checkNumber, currentData);

          log.debug("Here", "Pass trhe function");
          record.submitFields({
            type: "customrecord_mw_payment_rep_imp_b",
            id: internalId.toString(),
            values: {
              custrecord_mw_payment_rep_processed: true,
            },
          });

          record.submitFields({
            type: "customrecord_mw_payment_rep_imp_data_b",
            id: recordId.toString(),
            values: {
              custrecord_mw_data_data: JSON.stringify(currentData),
            },
          });
        }
      } catch (e) {
        log.error("Error", `Error processing the data imported: ${e.message}`);
      }
    }
    reset = true;
  }
  log.debug("End", "All the report was processed");

  let generatedFile = generateFile(currentData, loadedFile, useInvoices);

  log.debug("Generated", `The result file with id ${generatedFile} was generated`);

  // Indicates the finish state
  record.submitFields({
    type: "customrecord_mw_payment_rep_imp_data_b",
    id: recordId.toString(),
    values: {
      custrecord_mw_status_data: constants.STATES.FINISHED,
      custrecord_mw_final_report_data: generatedFile,
    },
  });

  // Send email
  sendEmail(
    constants.GENERAL.AUTHOR,
    currentUserEmail,
    "Result Report - Payment Report Import",
    `Hi ${currentUserName}<br/><br/>Attached in the following email you will find the result report for the imported file: ${loadedFile.name}`,
    [generatedFile],
  );
}

function processPayment(pUseSalesOrders, pUseInvoices, pDate, pNumberInvoiceOrSale, pAmount, pCheckNumber, pCurrentData) {
  if (pUseSalesOrders === "T") {
    log.debug("Using", `Using sales order`);
    processSalesOrder(pDate, pNumberInvoiceOrSale, pAmount, pCheckNumber, pCurrentData);
  } else if (pUseInvoices === "T") {
    log.debug("Using", `Using invoices`);
    processInvoice(pDate, pNumberInvoiceOrSale, pAmount, pCheckNumber, pCurrentData);
  } else {
    log.error("Error", "Unknow method");
  }
}

function processSalesOrder(pDate, pNumberInvoiceOrSale, pAmount, pCheckNumber, pCurrentData) {
  // Verificate if sales order exist
  log.debug("Number for search", pNumberInvoiceOrSale);
  let salesOrder = search
    .create({
      type: "salesorder",
      filters: [
        ["otherrefnum", search.Operator.EQUALTO, pNumberInvoiceOrSale],
        "OR",
        ["tranid", search.Operator.IS, pNumberInvoiceOrSale],
        "AND",
        ["mainline", search.Operator.IS, "T"],
      ],
      columns: [search.createColumn({ name: "internalid" })],
    })
    .run()
    .getRange({ start: 0, end: 1 });

  log.debug("Hot Fix", salesOrder);

  if (salesOrder && salesOrder.length > 0) {
    let salesOrderNumber = salesOrder[0].getValue("internalid");

    log.debug("Sales Order process", `Sales order found with id ${salesOrderNumber}`);

    let invoice = search
      .create({
        type: "invoice",
        filters: [["createdfrom", search.Operator.ANYOF, salesOrderNumber], "AND", ["mainline", "is", "T"]],
        columns: [search.createColumn({ name: "internalid" }), "amountremaining"],
      })
      .run()
      .getRange({ start: 0, end: 1000 });

    if (invoice && invoice.length === 1) {
      log.debug("Processing", "Processing invoice payment");
      //Final Process
      processFinalPayment(
        invoice[0].getValue("internalid"),
        invoice[0].getValue("amountremaining"),
        pDate,
        pNumberInvoiceOrSale,
        pAmount,
        pCheckNumber,
        pCurrentData,
      );
    } else if (invoice && invoice.length > 1) {
      log.error("Error", "There is more than one invoice associated with the sales order number provided.");
      addToCurrentData(
        pNumberInvoiceOrSale,
        "There is more than one invoice associated with the sales order number provided.",
        pDate,
        pAmount,
        pCheckNumber,
        pCurrentData,
      );
    } else {
      log.error("Error", "There is no invoice associated with the sales order number provided.");
      addToCurrentData(
        pNumberInvoiceOrSale,
        "There is no invoice associated with the sales order number provided.",
        pDate,
        pAmount,
        pCheckNumber,
        pCurrentData,
      );
    }
  } else {
    addToCurrentData(
      pNumberInvoiceOrSale,
      "The sales order number provided does not exists in the system.",
      pDate,
      pAmount,
      pCheckNumber,
      pCurrentData,
    );
  }
}

function processInvoice(pDate, pNumberInvoiceOrSale, pAmount, pCheckNumber, pCurrentData) {
  let invoice = search
    .create({
      type: "invoice",
      filters: [["formulatext: {tranid}", search.Operator.IS, pNumberInvoiceOrSale], "AND", ["mainline", "is", "T"]],
      columns: [search.createColumn({ name: "internalid" }), "amountremaining"],
    })
    .run()
    .getRange({ start: 0, end: 1 });

  if (invoice && invoice.length > 0) {
    log.debug("Processing", "Processing invoice payment");
    //Final Process
    processFinalPayment(
      invoice[0].getValue("internalid"),
      invoice[0].getValue("amountremaining"),
      pDate,
      pNumberInvoiceOrSale,
      pAmount,
      pCheckNumber,
      pCurrentData,
    );
  } else {
    log.error("Error", "The invoice number provided does not exists in the system.");
    addToCurrentData(
      pNumberInvoiceOrSale,
      "The invoice number provided does not exists in the system.",
      pDate,
      pAmount,
      pCheckNumber,
      pCurrentData,
    );
  }
}

function processFinalPayment(
  pInvoiceInternalId,
  pInvoiceTotal,
  pDate,
  pInvoiceSalesOrderNumber,
  pAmount,
  pCheckNumber,
  pCurrentData,
) {
  let totalInvoice = Number(pInvoiceTotal);
  let amountPaid = Number(pAmount);

  log.debug("Total Invoice | Amount Paid", `${totalInvoice} | ${amountPaid}`);
  log.debug("Check Number", pCheckNumber);

  if (amountPaid <= totalInvoice) {
    try {
      // Set to payment state
      let payment = record.transform({
        fromType: "invoice",
        toType: "customerpayment",
        fromId: Number(pInvoiceInternalId),
        isDynamic: true,
      });

      log.debug("Fix for set values", payment);
      payment.setValue({ fieldId: "trandate", value: format.parse({ value: pDate, type: format.Type.DATE }) });
      payment.setValue({ fieldId: "undepfunds", value: "F" });
      payment.setValue({ fieldId: "account", value: constants.GENERAL.CHECKING_1000_ACCOUNT });
      payment.setValue({ fieldId: "custbodytov_check_voucher_number", value: pCheckNumber });

      let invoicesToPayCount = payment.getLineCount({ sublistId: "apply" });

      for (let i = 0; i < invoicesToPayCount; i++) {
        let invoiceInternalId = payment.getSublistValue({ sublistId: "apply", fieldId: "internalid", line: i });

        if (invoiceInternalId.toString() === pInvoiceInternalId.toString()) {
          payment.selectLine({ sublistId: "apply", line: i });
          payment.setCurrentSublistValue({ sublistId: "apply", fieldId: "amount", value: amountPaid });
          payment.commitLine({ sublistId: "apply" });
        } else {
          continue;
        }
      }

      let message = amountPaid < totalInvoice ? "The amount paid is below the total amount of the invoice." : "Successful.";

      payment.save({ ignoreMandatoryFields: true });

      addToCurrentData(pInvoiceSalesOrderNumber, message, pDate, pAmount, pCheckNumber, pCurrentData);

      log.debug("Created", "The payment was created.");
    } catch (e) {
      log.debug("Not process final payment", e);
      addToCurrentData(pInvoiceSalesOrderNumber, e.message, pDate, pAmount, pCheckNumber, pCurrentData);
    }
  } else {
    log.error("Error", "The amount paid is greater than the total amount of the invoice.");

    addToCurrentData(
      pInvoiceSalesOrderNumber,
      "The amount paid is greater than the total amount of the invoice.",
      pDate,
      pAmount,
      pCheckNumber,
      pCurrentData,
    );
  }
}

// In this case not use pUseSalesOrders param
function generateFile(pData, pFileName, pUseInvoices) {
  let orderNumberHeader = pUseInvoices === "T" ? "Invoice #" : "Sales Order #";

  let finalData = `Error, Date, ${orderNumberHeader}, Amount, Check #\r\n`;

  for (let key in pData) {
    finalData += `${pData[key].error},${pData[key].date},${key},${pData[key].amount},${pData[key].checkNumber}\r\n`;
  }

  let resultReportId = file
    .create({
      fileType: file.Type.CSV,
      name: `Result - ${pFileName}`,
      contents: finalData,
      encoding: file.Encoding.UTF8,
      folder: constants.GENERAL.FOLDER,
      description: `Report result for initial file ${pFileName}`,
    })
    .save();

  return resultReportId;
}

function addToCurrentData(pInvoiceSalesOrderNumber, pError, pDate, pAmount, pCheckNumber, pCurrentData) {
  pCurrentData[pInvoiceSalesOrderNumber] = {
    error: pError,
    date: pDate,
    amount: pAmount,
    checkNumber: pCheckNumber,
  };
}

function sendEmail(pAuthor, pRecipient, pSubject, pBody, pAttachments) {
  log.debug(
    "Email Values",
    `Autor: ${pAuthor}|Receipt: ${pRecipient}|Subject: ${pSubject}|Body: ${pBody}|Attachments: ${pAttachments}`,
  );

  let attachments = [];

  for (let i = 0; i < pAttachments.length; i++) {
    attachments.push(file.load({ id: pAttachments[i] }));
  }

  email.send({
    author: pAuthor,
    recipients: pRecipient,
    subject: pSubject,
    body: pBody,
    attachments: attachments,
  });
}

