/*

Albert Chang CS290-400 Final? Assignment
This JavaScript file is for the client's side. The other file, "edit.js", is like a cut down version of this without the table-building part.

There are checks for the main form (up top on the home.handlebars template) before submission occurs.

If name is blank, that means name is null, and name can't be null.
Other fields can all be null, but they can't be invalid.
For repetitions, that means less than 1 (0 reps means no exercise).
For weight, that means less than 0 (negative weight is magic).

The tinytext section handles the error messages.
They are logged to console first, but I can't assume the user will open the console.

Upon success, the tinytext section will display a success message for ten seconds.

The rest of the code isn't too special.
buildTable is taken from my previous work with the DOM assignment way back then, with minor modifications to support the new required features.

*/

var headers = ["workout name", "number of reps", "weight", "date of pumping", "lbs(1) or kg(0)"]

//A very slightly modified form of the assignment 5 table builder.
//As before, the headers argument takes an optional list of headers.
function buildTable(data, ID, headers) {
  var newTable = document.createElement("table");
  var newTHead = document.createElement("thead");
  var newTHeadRow = document.createElement("tr");
  
  if (!headers) {
    var keyNames = Object.keys(data[0]);
    for (var index = 0; index < keyNames.length; index++) {
      if (keyNames[index] !== "id") {
        var newHeader = document.createElement("th");
        newHeader.textContent = keyNames[index];
        newHeader.style.textAlign = "center";
        newHeader.style.border = "1px solid";
        newTHeadRow.appendChild(newHeader);
      }
    }
  }
  else {
    for (var index = 0; index < headers.length; index++) {
      var newHeader = document.createElement("th");
      newHeader.textContent = headers[index];
      newHeader.style.textAlign = "center";
      newHeader.style.border = "1px solid";
      newTHeadRow.appendChild(newHeader);
    }
  }
  
  newTHead.appendChild(newTHeadRow);
  
  var newTBody = document.createElement("tbody");
  
  //This check might be necessary for an empty table.
  if (data) {
    for (var index = 0; index < data.length; index++) {
      var newRow = rowBuilder(data[index]);
      newTBody.appendChild(newRow);
    }
  }
  
  newTable.appendChild(newTHead);
  newTable.appendChild(newTBody);
  newTable.id = ID;
  
  return newTable;
}



//Moved this part of buildTable to a separate function. Seemed like a good idea.
function rowBuilder(data) {
  var newRow = document.createElement("tr");
  for (var property in data) {
    if (property !== "id") {
      var newCell = document.createElement("td");
      newCell.textContent = data[property];
      if (property === "date") {
        if (newCell.textContent.length >= 24)
        newCell.textContent = newCell.textContent.slice(0, -14);
        //Cleaning up that unnecessary timestamp.
      }
      newCell.style.textAlign = "center";
      newCell.style.border = "1px solid";
      newRow.appendChild(newCell);
    }
  }
  var formCell = document.createElement("td");
  formCell.class = "form-cell";

  var rowForm = document.createElement("form");
  rowForm.method = "POST";
  rowForm.action = "/";

  var hiddenID = document.createElement("input");
  hiddenID.type = "hidden";
  hiddenID.name = "taskID";
  hiddenID.value = data.id;
  hiddenID.id = "hidden-number-" + data.id;
  //I added the "hidden-number-#" IDs for fun. They don't do anything. Same with the button IDs below.

  var editButton = document.createElement("button");
  editButton.class = "edit-button";
  editButton.textContent = "edit me";
  editButton.type = "submit";
  editButton.id = "edit-number-" + data.id;
  //The editing will be done on a separate page, so the form values aren't really important here besides hiddenID.value = data.id. I realise the use of multiple "id" is getting confusing.

  //I've decided to make the delete button a "dummy" button. AJAX will happen, but it won't actually do anything for the form.
  var delButton = document.createElement("button");
  delButton.class = "delete-button";
  delButton.textContent = "delete me";
  delButton.id = "delete-number-" + data.id;
  delButton.value = data.id;
  //The delButton value isn't necessary. I just have it set here because it makes the subsequent event listener easier to understand.

  delButton.addEventListener("click", function(event) {
    event.preventDefault();

    var req = new XMLHttpRequest();
    req.open("POST", "http://52.37.241.45:55931/deleteTask", true);
    req.setRequestHeader("content-type","application/json");

    var payload = {taskID: delButton.value};
    console.log(payload);

    req.addEventListener("load", function() {
      if (req.status >= 200 && req.status < 400) {
        var tbody = document.getElementById("theTable").children[1];
        tbody.removeChild(document.getElementById("taskRow" + delButton.value) );
        //children[1] gets to the tbody, "taskRowID" gets the proper row
        //probably don't need all these getElementById with the current variables in place, but good to be careful
        document.getElementById("error-message").textContent = "That exercise was deleted. Hope you really felt the burn with that one.";
        console.log("success at deletion, maybe. have to check the server to know for sure");
        setTimeout(function() {
          document.getElementById("error-message").textContent = "Error messages will appear here.";
        }, 5000);
      }
      else {
        console.log("Error in network request: " + req.statusText);
      }
    });
    req.send(JSON.stringify(payload) );
  });

  rowForm.appendChild(hiddenID);
  rowForm.appendChild(editButton);
  rowForm.appendChild(delButton);

  formCell.appendChild(rowForm);

  newRow.appendChild(formCell);
  newRow.id = "taskRow" + data.id;

  return newRow;
}



//You'll see almost the exact same function in "edit.js".
function addFormListener() {
  var submitButton = document.getElementById("submitNewButton");

  submitButton.addEventListener("click", function() {
    event.preventDefault();

    var newName = document.getElementById("nameField").value;
    var newRep = document.getElementById("repField").value;
    var newGrav = document.getElementById("weightField").value;
    var newUnit;
    if (document.getElementById("pound").checked) {
      newUnit = 1;
    }
    if (document.getElementById("kilo").checked) {
      newUnit = 0;
    }
    var newDate = document.getElementById("dateField").value;

    var newTask = {name: newName, reps: newRep, weight: newGrav, date: newDate, lbs: newUnit};

    if (newName.length < 1) {
      console.log("empty name, aborting");
      document.getElementById("error-message").textContent = "The name field can't be empty.";
      return;
      //no blank names allowed
    }
    if (newRep && newRep < 1) {
      document.getElementById("error-message").textContent = "You can't have less than one rep. You have to feel the burn.";
      console.log("less than 1 rep, aborting");
      return;
    }
    if ( (newRep && newRep % 1 !== 0) ||  (newGrav && newGrav % 1 !== 0) ) {
      document.getElementById("error-message").textContent = "Sorry, but the database only takes integer input. Half-ups (or quarter-ups, if you like to do half-crunches) and half-pounds won't work.";
      console.log("fractional value, aborting");
      return;
    }
    var extraTimeout = 0;
    if (newGrav && newGrav < 0) {
      document.getElementById("error-message").textContent = "You using negative weights? No pain, no gain, bro.";
      console.log("less than 0 weight. not aborting, but not cool bro")
      extraTimeout = 2000;
    }

    var req = new XMLHttpRequest();
    req.open("POST", "http://52.37.241.45:55931/newTask", true);
    req.setRequestHeader("content-type","application/json");

    req.addEventListener("load", function() {
      if (req.status >= 200 && req.status < 400) {
        newTask.id = JSON.parse(req.responseText);
        console.log(newTask);
        var newRow = rowBuilder(newTask);
        document.getElementById("theTable").children[1].appendChild(newRow);
        console.log("success at adding, probably");
        setTimeout( function() {
          var successString = "Your workout was added. "; 
          if (extraTimeout > 0) {
            successString += "You have to move on to positive weights, bro."
          }
          else {
            successString += "Keep it up."
          }
          document.getElementById("error-message").textContent = successString;
          setTimeout(function() {
            document.getElementById("error-message").textContent = "Error messages will appear here.";
          }, 5000);
        }, extraTimeout);
      }
      else {
        console.log("Error in network request: " + req.statusText);
      }
    });
    req.send(JSON.stringify(newTask) );
  });
}



//This function is only called once on page load. (Each page load, so it will be called multiple times if you keep editing stuff.)
function getTableFromServer() {
  var req = new XMLHttpRequest();
  req.open("POST", "http://52.37.241.45:55931/getData", true);
  req.setRequestHeader("content-type","application/json");
  //kind of a lazy post, but it's just a simple object saying "give me the data"

  req.addEventListener("load", function() {
    if (req.status >= 200 && req.status < 400) {
      var response = JSON.parse(req.responseText);
      console.log(response);
      var newTable = buildTable(response, "theTable", headers);
      document.getElementById("table-div").appendChild(newTable);
    }
    else {
      console.log("Error in network request: " + req.statusText);
    }
  });
  req.send(JSON.stringify({getData: true}) );
  //Here's the simple object. The "getData" property is never actually used.
  //I just didn't want to send a request without an object in the body.
}



function initialiser() {
  getTableFromServer();
  addFormListener();
}

document.addEventListener("DOMContentLoaded", initialiser);