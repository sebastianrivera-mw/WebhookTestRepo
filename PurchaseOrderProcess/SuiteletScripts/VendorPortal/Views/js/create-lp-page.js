// Javascript functions for the Create LP Page on the Vendor Portal

// ------------------------------------------------------ Variables ------------------------------------//

// Control of ids
var cont = 1;
// Data provide to NS
var jsonData = [];
// If is first time to complete line
var first = true;
// Options for select
var globalOptions = "";
// Flag indicates if all data already on Front-End logic
var ifData = false;


// ########################################### Logic ################################################### //

// **************************************** Editable Table ************************************************* //
//Functions of modal of multiple selection POs on table
// Checkbox logic 
// Control select global check box
$(document).ready(function() {
    $("#btn-add-group-items").on("click", function() {
        $("#modal-table").show();
        $("#modal-table-body").find('tbody').remove().end();
        $("#modal-table-body").append(`<tbody id="item-lines" class="modal-item-lines"></tbody>`);
    });
  
    $(".close").on("click", function() {
      $("#modal-table").hide();
    });

    $("#global-checkbox").change(function() {
        let isSelected = false;
        if ($("#global-checkbox").is(":checked"))
        {
            isSelected = true;
        }
        selectAllCheckbox(isSelected);
    });
});

// Select or unselect all checkbox of table
function selectAllCheckbox(isSelected)
{
    let linesCount = jQuery(".modal-lines").length;
    for(let i = 0; i < linesCount; i++)
    {
        let actualRow = jQuery(".modal-lines").eq(i);
        actualRow.find("#checkbox").prop('checked', isSelected);
    }
}

// Change global checkbox if all checks are selected
function changeGlobalCheckbox()
{
    let linesCount = jQuery(".modal-lines").length;
    for(let i = 0; i < linesCount; i++)
    {
        let actualRow = jQuery(".modal-lines").eq(i);
        let value = actualRow.find("#checkbox").is(":checked");
        if(!value)
        {
            $("#global-checkbox").prop('checked', false);
            return;
        }
        $("#global-checkbox").prop('checked', true);
    }
}

// Get options of select
function getOptions(options, lineInfo)
{
    // Global gets options value
    globalOptions = options;
    // if Data dont exist in front end
    if(!ifData)
    {
        // Generate JSON object with data from NS 
        convertToJsonData(lineInfo);
        jQuery(".createlp-item-line").eq(0).remove()
        ifData = true;
    }
}

// Show 
var expanded = false;

// Show or hide checkbox select section in modal
function showCheckboxes() 
{
    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
        checkboxes.style.display = "block";
        expanded = true;
    } else {
        checkboxes.style.display = "none";
        expanded = false;
    }
}

// Get PO options for modal table
function getValueOptions()
{
    var checkboxes = document.getElementById("checkboxes");
    checkboxes.style.display = "none";
    expanded = false;
    
    // Restart value of global checkbox
    $("#global-checkbox").prop('checked', false);
    // Clean modal table
    $("#modal-table-body").find('tbody').remove().end();
    $("#modal-table-body").append(`<tbody id="item-lines" class="modal-item-lines"></tbody>`);

    // For each select option
    $.each($("input[name='po']:checked"), function(){
        let optionPo = $(this).val();
        
        // For each line obtained from NS
        for(let i = 0; i < jsonData.length; i++){
            if(optionPo == jsonData[i].purchaseOrder){
                addLineModal(jsonData[i], globalOptions);
            }
        }
    });
}

// Add line on table
function addLineModal(data, options)
{
    // Get table modal and append lines 
    tableBody = $(".modal-item-lines");
    tableBody.append(`<tr class="item-line createlp-item-line modal-lines" id="modal-lines${cont}">
    <td class="checkbox-column"><input type="checkbox" id="checkbox" name="check" onclick="changeGlobalCheckbox();"></td>
    <td class="purchase-order-number" style="display: none;"> 
        <select id='pos${cont}' style="height:19px; width:110px; text-align:center;" onchange="getValuePOid(id)">
            <option id="po" ></option>
            ${options}
        </select>  
    </td>
    <td class="item-sku" style="display: none;"> <span></span> 
        <select id='item-selector${cont}' style="height:19px; width:110px; text-align:center;" onchange="setFields(id)">
            <option id="item" ></option>
        </select> 
    </td>
    <td class="purchase-order-number-span" id='pos-span${cont}'> <span>${data.purchaseOrder}</span></td>
    <td class="item-sku-span" id="item-selector-span${cont}"> <span>${data.item.itemText}</span> </td>
    <td class="item-name" id="item-name${cont}"> <span>${data.description}</span> </td>
    <td class="receiving-location" id="receiving-location${cont}"> <span>${data.location.textLocation}</span> </td>
    <td class="quantity-expected"> <input type="number" id="quantity-expected${cont}" max="${data.quantity}" min="1" style="width: 4em" onchange="calculated(id, max)" value="${data.quantity}"/> </td>
    <td class="quantity-remaining"> <input type="number" id="quantity-remaining${cont}" disabled="false" style="width: 4em" value="0"/> </td>
    <td class="expected-rate" > <input type="number" id="expected-rate${cont}" onchange="calculatedAmount(id)" style="width: 7em" value="${data.expectedRate}"/> </td>
    <td class="amount" > <input type="number" id="amount${cont}" disabled="true" style="width: 7em" value="${Number(data.quantity)*Number(data.expectedRate)}"/> </td>
    <td class="location" id="location-number${cont}" style="display: none;"> <span>${data.location.valueLocation}</span> </td>
    <td><button type="button" class="btn" id="delete-btn" style="display: none;" onclick="remove(this)"><i class="fa fa-trash"></i></button></td>
    </tr>`);
    
    // Increase cont
    cont++;
    
    
    // Set option selector with correspond value
    $(`#pos${cont-1} option[id='${data.purchaseOrder}']`).attr("selected", "selected");
    getValuePOidModal(`pos${cont-1}`);

    // Set item selector with correspond value
    $(`#item-selector${cont-1} option[value='${data.item.itemValue}']`).attr("selected", "selected");
    setFields(`item-selector${cont-1}`);
    
}

// Get value from PO options 
function getValuePOidModal(id)
{
    // Value of option selected
    let value = $(`#${id} option:selected`).text();
    let aux = id.slice(3, id.length);
  
    for(let i = 0; i < jsonData.length; i++)
    {
        if(jsonData[i].purchaseOrder == value)
        {
             // Append correspond items
            $("#item-selector"+aux).append(`<option value="${jsonData[i].item.itemValue}">${jsonData[i].item.itemText}</option>`);  
        }
    }
}

// Move modal table into main table
function moveModalTable(options)
{
    // Get length of table
    let linesCount = jQuery(".modal-lines").length;
    // get specific area of table
    let tableBody = $(".item-lines");;
    for(let i = 0; i < linesCount; i++)
    {
        let actualRow = jQuery(".modal-lines").eq(i);
         // Show cells with selectors and Hide span cells
        if(actualRow.find("#checkbox").is(":checked"))
        {
            actualRow.find(".purchase-order-number").show();
            actualRow.find(".item-sku").show();
            actualRow.find(".btn").show();
            actualRow.find(".purchase-order-number-span").hide();
            actualRow.find(".item-sku-span").hide();   
            actualRow.find(".checkbox-column").hide();   
            tableBody.append(actualRow);
        }
    }
    
    // Uncheck checkboxes
    $('input[type=checkbox][name=po]').each(function(){
        $("#"+this.id).prop('checked', false);
    });
    $("#global-checkbox").prop('checked', false);
    $("#modal-table").hide();
}

// ****************************************** Main Table ************************************************* //
// Main table functions

// Add line on table
function addLine(options)
{
    // Validate if all rows are complete
    let validate = validationRow();
    if (!validate) return;

    // Select specific area of table and append
    tableBody = $(".item-lines");
    tableBody.append(`<tr class="item-line createlp-item-line">
    <td class="purchase-order-number"> 
        <select id='pos${cont}' style="height:19px; width:110px; text-align:center;" onchange="getValuePOid(id)">
            <option id="po" ></option>
            ${options}
        </select>  
    </td>
    <td class="item-sku"> <span></span> 
        <select id='item-selector${cont}' style="height:19px; width:110px; text-align:center;" onchange="setFields(id)">
            <option id="item" ></option>
        </select> 
    </td>
    <td class="item-name" id="item-name${cont}"> <span></span> </td>
    <td class="receiving-location" id="receiving-location${cont}"> <span></span> </td>
    <td class="quantity-expected"> <input type="number" id="quantity-expected${cont}" disabled="true" max="" min="" style="width: 4em" onchange="calculated(id, max)"/> </td>
    <td class="quantity-remaining"> <input type="number" id="quantity-remaining${cont}" style="width: 4em" disabled="false" /> </td>
    <td class="expected-rate" > <input type="number" id="expected-rate${cont}" disabled="true" style="width: 7em" onchange="calculatedAmount(id)"/> </td>
    <td class="amount" > <input type="number" id="amount${cont}" style="width: 7em" disabled="true"/> </td>
    <td class="location" id="location-number${cont}" style="display: none;"> <span></span> </td>
    <td><button type="button" class="btn" id="delete-btn" onclick="remove(this)"><i class="fa fa-trash"></i></button></td>
    </tr>`);

    // increase cont
    cont++;
}

// Remove line on table
function remove(line)
{
    let row = line.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

//function decide if is first o second action
function isFirst(id, data)
{
    if (first){
        if(!ifData)
        {
            // Create JSON Object with NS data
            convertToJsonData(data);
            ifData = true;
        }
    }
    first = false;
    getValuePOid(id);
    
}

// Convert array string to Json Object
function convertToJsonData(data)
{
    let parseArray = data.split(",");
    
    for(let i = 0; i < parseArray.length; i += 8)
    {
        jsonData.push({
            "purchaseOrder": parseArray[i],
            "item": {itemText: parseArray[i+1], itemValue: parseArray[i+2]},
            "quantity": Number(parseArray[i+3]),
            "description": parseArray[i+4],
            "location": {textLocation:parseArray[i+5], valueLocation: parseArray[i+6]},
            "expectedRate": Number(parseArray[i+7]),
        });
    }    
}

// Get value from PO options 
function getValuePOid(id)
{
    // Value of slected option
    let value = $(`#${id} option:selected`).text();
    let aux = id.slice(3, id.length);

    // Clean row 
    $("#item-selector"+aux).find('option').remove().end();
    $("#item-selector"+aux).append(`<option value=""></option>`);
    $("#quantity-expected"+aux).prop("disabled", true);
    $("#expected-rate"+aux).prop("disabled", true);
    $("#receiving-location"+aux).text("");
    $("#item-name"+aux).text("");
    $("#quantity-expected"+aux).val("");
    $("#quantity-remaining"+aux).val("");
  
    for(let i = 0; i < jsonData.length; i++)
    {
        if(jsonData[i].purchaseOrder == value)
        {
            // Append item-selector
            $("#item-selector"+aux).append(`<option value="${jsonData[i].item.itemValue}">${jsonData[i].item.itemText}</option>`);  
        }
    }
}


// Set fields of table 
function setFields(id){
    // Value of item selector
    let value = $(`#${id} option:selected`).text();
    let aux = id.slice(13, id.length);
    let poValue  = $(`#pos${aux} option:selected`).text();
    
    // If PO and Item already have selected
    if(validationSelect(poValue, value, aux)) 
    {
        // Clean Row
        $("#quantity-expected"+aux).prop("disabled", true);
        $("#expected-rate"+aux).prop("disabled", true);
        $("#receiving-location"+aux).text("");
        $("#item-name"+aux).text("");
        $("#quantity-expected"+aux).val("");
        $("#quantity-remaining"+aux).val("");
        $("#expected-rate"+aux).val("");
        $("#amount"+aux).val("");
        return;
    }

    // If not
    // Complete cells of the Row
    for(let i = 0; i < jsonData.length; i++)
    {
        if(jsonData[i].purchaseOrder == poValue)
        {
       
            if(jsonData[i].item.itemText == value)
            {
                // Complete Specifics Cells
                $("#quantity-expected"+aux).attr("value", jsonData[i].quantity);
                $("#quantity-expected"+aux).val(jsonData[i].quantity);
                $("#item-name"+aux).text(jsonData[i].description);
                $("#receiving-location"+aux).text(jsonData[i].location.textLocation);
                $("#location-number"+aux).text(jsonData[i].location.valueLocation);
                $("#expected-rate"+aux).attr("value", Number(jsonData[i].expectedRate));
                $("#expected-rate"+aux).val(Number(jsonData[i].expectedRate));
                
                // Quantity remaining
                $("#quantity-remaining"+aux).attr("value", 0);
                $("#quantity-remaining"+aux).val(0);
                $("#quantity-expected"+aux).attr({
                    "max" : jsonData[i].quantity,        
                    "min" : 1,        
                });

                // Able inputs 
                $("#quantity-expected"+aux).prop("disabled", false);
                $("#expected-rate"+aux).prop("disabled", false);

                // Calculate Amount
                $("#amount"+aux).attr("value", Number($("#quantity-expected"+aux).val())*Number($("#expected-rate"+aux).val()));
                $("#amount"+aux).val(Number($("#quantity-expected"+aux).val())*Number($("#expected-rate"+aux).val()));
                break;
            }
        }
    }
}

// Calculate quantity remaining
function calculated(id, max)
{
    // Value of quantity expected
    let value = $(`#${id}`).val();
    let aux = id.slice(17, id.length);

    $("#quantity-expected"+aux).attr("value", Number(value));
    $("#quantity-remaining"+aux).attr("value", Number(max)-Number(value));
    $("#quantity-remaining"+aux).val(Number(max)-Number(value));

    let rate = document.getElementById("expected-rate"+aux).value;
    $("#amount"+aux).attr("value", Number(rate)*Number(value));
    $("#amount"+aux).val(Number(rate)*Number(value));
}

// Calculate Amount
function calculatedAmount(id)
{
    let aux = id.slice(13, id.length);
    let rate = $(`#${id}`).val();
    let quantity = document.getElementById("quantity-expected"+aux).value;
    $("#expected-rate"+aux).attr("value", Number(rate));
    $("#expected-rate"+aux).val(Number(rate));
    $("#amount"+aux).attr("value", Number(rate)*Number(quantity));
    $("#amount"+aux).val(Number(rate)*Number(quantity));
    
}

// Validation function if Item and Po have selected
function validationSelect(poId, itemSku, aux)
{
    for(let i = 0; i < cont; i++)
    {
        // Validate if PO and Item have already selected
        if(poId == $(`#pos${i-1} option:selected`).text() && itemSku == $(`#item-selector${i-1} option:selected`).text())
        {
            alert(`This order ${poId} has already been selected with this item ${itemSku}`);
            $(`#check-${poId}`).prop('checked', false);
            $('#modal-lines'+aux).remove();
            return true;
        }    
    }
    return false;
}

// Validation add row with before incomplete
function validationRow()
{
    let linesCount = jQuery(".createlp-item-line").length;

    for (let i = 0; i < linesCount; i++)
    {
        let actualRow = jQuery(".createlp-item-line").eq(i);

        // Get data of fields
        let poSelect = actualRow.find(".purchase-order-number option:selected").val();
        let itemSku = actualRow.find(".item-sku option:selected").val();
        let description = actualRow.find(".item-name").text();
        let location = actualRow.find(".location").text();
        let quantityExpected = actualRow.find(".quantity-expected input[type='number']").val();
        let quantityRemaining = actualRow.find(".quantity-remaining input[type='number']").val();
        let expectedRate = actualRow.find(".expected-rate input[type='number']").val();
        let amount = actualRow.find(".amount input[type='number']").val();

        // Validate if fiels have data
        if (!poSelect || !itemSku || !description || !location || !quantityExpected || !quantityRemaining || !expectedRate || !amount)
        {
            alert(`Please complete or delete the row ${i+1}`);
            return false;
        }
    }
    return true;
}

// ****************************************** POST Function  ********************************************** //

// Post Function for save ISN

// Handle if the Submit button is pressed
function createLPHandleSubmit(pVendorID)
{
    //Fields
    let billOfLading = jQuery("#bill-of-lading").val();
    let readyDate = jQuery("#ready-date").val();
    let departureDate = jQuery("#departure-date").val();
    let fieldsData =[];

    // Lines
    let poSelect = "";
    let itemSku = "";
    let description = "";
    let location = "";
    let quantityExpected = "";
    let quantityRemaining = "";
    let expectedRate = "";
    let amount = "";
    let linesData = [];

    // Check if fields have data
    if(!billOfLading || !readyDate || !departureDate){
        alert(`Insert the data in fields`);
        return;
    }

    // Format of Date in NS
    readyDate = readyDate.replace("-","/").replace("-","/");
    departureDate = departureDate.replace("-","/").replace("-","/");

    fieldsData.push({
        "billOfLading": billOfLading,
        "readyDate": readyDate,
        "departureDate": departureDate,
    });

    // Loop through lines to check data
    let linesCount = jQuery(".createlp-item-line").length;

    for (let i = 0; i < linesCount; i++)
    {
        let actualRow = jQuery(".createlp-item-line").eq(i);

        // Get data of fields
        poSelect = actualRow.find(".purchase-order-number option:selected").val();
        itemSku = actualRow.find(".item-sku option:selected").val();
        description = actualRow.find(".item-name").text();
        location = actualRow.find(".location").text();
        quantityExpected = actualRow.find(".quantity-expected input[type='number']").val();
        quantityRemaining = actualRow.find(".quantity-remaining input[type='number']").val();
        expectedRate = actualRow.find(".expected-rate input[type='number']").val();
        amount = actualRow.find(".amount input[type='number']").val();

        // Validate if fiels have data
        if (!poSelect || !itemSku || !description || !location || !quantityExpected || !quantityRemaining || !expectedRate || !amount)
        {
            alert(`Data is missing in the row: ${i+1}`);
            return;
        }
        // Insert in array data
        else 
        {
            linesData.push({
                "purchaseOrder": poSelect,
                "item": itemSku,
                "description": description,
                "location": location,
                "quantityExpected": quantityExpected,
                "quantityRemaining": quantityRemaining,
                "expectedRate": expectedRate,
                "amount": amount,
            });
        }
    }

    if (linesCount.length == 0)
    {
        alert(`Add a row and insert the data`);
    }
    else
    {
        let result =  {"fieldsData":fieldsData ,"linesData": linesData}
        console.log(result);
        submitCreateLPData(pVendorID, result);
    }
}

// Send the data to store it in Netsuite
function submitCreateLPData(pVendorID, linesDataResult)
{
    jQuery('#loading-modal').modal("show");

    // Get the general and lines data
    let generalData = getGeneralData(pVendorID);
    // let linesData = getLinesData();


    var body = {
        "saveCreateLPData": true,
        "general": generalData,
        "fields": linesDataResult.fieldsData,
        "lines": linesDataResult.linesData
    };
 

    var url = window.location.href;

    var requestData = {
        requestType: "POST",
        url: url,
        body: body
    };

    makeARequest(requestData).then(function(response) {
        jQuery('#loading-modal').modal("hide");

        let requestResponse = JSON.parse(response.response)
        if(requestResponse.status === 'success')
        {
            
            var url = window.location.href + "&action=thanks";
            location.replace(url);
        }
        else
        {
            console.error("Server Error");
            alert(`Server Error`);
        }
        
    }).catch(function(response) {
        console.log("Request Error ");
        alert(`Request Error`);
    });
}

// Get the general data of submission
function getGeneralData(pVendorID)
{
    let generalData = {};

    generalData["vendorID"] = pVendorID;

    return generalData;
}
