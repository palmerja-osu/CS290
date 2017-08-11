/*

Albert Chang CS290-400 Final? Assignment
This JavaScript file is also for the client's side.

The form listener is mostly the same, but there's a new addition to grab the hidden ID field from this form.

The reason I'm handling the editing with AJAX instead of just a normal HTTP form (which I did, originally) is I found that the regular HTTP form seemed to send unwanted data at times with the POST.

Data relating to the differences between a '' and null.
After spending some time trying to manage that, I decided it would be better to work with what I know.
That is, with AJAX, since I have full control (kind of) over what's sent when I make the AJAX request.

The redirect back to the main page is handled with a "window.location" change after a successful edit.

This may seem like unnecessary work, but the proper nulling of nulls was important to me.

The upshot is that with JavaScript running on the edit page as well, I can now put in my little error messages.
Still in the "tinytext" section that I made for my Giant Bomb stuff and have continued to use since then.

I like having a standard look (style-wise) to everything I write. Maybe not the prettiest look, but it's my look.

*/


function addFormListener() {
  var submitButton = document.getElementById("submitEditButton");

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

    var hiddenID = document.getElementById("hiddenID").value;

    var newTask = {name: newName, reps: newRep, weight: newGrav, date: newDate, lbs: newUnit, taskID: hiddenID};

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
    if (newGrav && newGrav < 0) {
      document.getElementById("error-message").textContent = "You using negative weights? No pain, no gain, bro.";
      var dummyVar = true;
    }


    var req = new XMLHttpRequest();
    req.open("POST", "http://52.37.241.45:55931/edit", true);
    req.setRequestHeader("content-type","application/json");

    req.addEventListener("load", function() {
      if (req.status >= 200 && req.status < 400) {
        console.log("success at editing");
        if (!dummyVar) {
          document.getElementById("error-message").textContent = "Your workout was edited. Keep it up.";
        }
        document.getElementById("error-message").textContent += " Redirecting back to the main table in a second.";
        setTimeout(function() {
          window.location = "http://52.37.241.45:55931/";
        }, 1000);
      }
      else {
        console.log("Error in network request: " + req.statusText);
      }
    });
    req.send(JSON.stringify(newTask) );
  });
}



function initialiser() {
  addFormListener();
}

document.addEventListener("DOMContentLoaded", initialiser);