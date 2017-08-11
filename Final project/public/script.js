var wForm = document.getElementById("newWorkout");

wForm.addEventListener("submit",function(e){
    e.preventDefault();          //Stops the DOM from updating
    
	

    
	//set up the parameters
	var pParam = "wName="+wForm.elements.wName.value+
				"&reps="+wForm.elements.reps.value+
				"&weight="+wForm.elements.weight.value+
				"&date="+wForm.elements.date.value+
				"&lbs="+wForm.elements.lbs.value;
    
    //Make the call
    var req = new XMLHttpRequest();
	req.open("POST", "http://52.37.241.45:55931/newTask", true);
    req.setRequestHeader("content-type","application/json");
    req.addEventListener('load',function(){
	if(req.status >= 200 && req.status < 400){
	    console.log('create req sent');
	    var response = JSON.parse(req.responseText);
	    var id = response.workouts;         	//id for the work out
	    //UPDATE DOM

	    var tbl = document.getElementById("tabledata"); 
	    var newRow = tbl.insertRow(-1);			//Add row at end of table
		
	    //ID
	    var idCell = document.createElement('td');
	    idCell.textContent = id;
	    idCell.style.display="none";
	    newRow.appendChild(idCell);
	    
	    //NAME
	    var nameCell = document.createElement('td');
	    nameCell.textContent =wForm.elements.wName.value;
	    newRow.appendChild(nameCell);

	    //Reps
	    var repCell = document.createElement('td');
	    repCell.textContent = wForm.elements.reps.value;
	    newRow.appendChild(repCell);

	    //Weight
	    var weightCell = document.createElement('td');
	    weightCell.textContent = wForm.elements.weight.value;
	    newRow.appendChild(weightCell);

	    //KGS/LBS
	    var lbsCell = document.createElement('td');
	    lbsCell.textContent = wForm.elements.lbs.value;
	    newRow.appendChild(lbsCell);

	    //Date
	    var dateCell = document.createElement('td');
	    dateCell.textContent =wForm.elements.date.value;
	    newRow.appendChild(dateCell);

	    //Edit Button
	    var editBtnCell = document.createElement('td');
	    editBtnCell.innerHTML = '<a href="/updateWorkout?id='+id+'"><input type="button" value="Edit"></a>';
	    newRow.appendChild(editBtnCell);

	    //Delete Button
	    var deleteBtnCell = document.createElement('td');
	    deleteBtnCell.innerHTML = '<input type="button" value="Delete" onclick="deleteWorkout(\'workoutTbl\', this, '+ id +')">';
	    newRow.appendChild(deleteBtnCell);			//Append cells at the end of the row

	} else {
	    console.log('there was an error');
	}
    });
    req.send(qStr + "?" + pParam);
});

function deleteWorkout(tbl,currRow,rowID){
    
    var table = document.getElementById(tbl);
    var rowCount = table.rows.length;

    var req = new XMLHttpRequest();
    var qStr = '/delete';

    //Make GET Delete Request
    req.open("GET", qStr + "?id=" + rowID,true);
    req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    req.addEventListener('load',function(){
	if(req.status >= 200 && req.status < 400){
	    console.log('del req sent');
	} else {
	    console.log('there was an error');
	}
    });
    req.send(qStr + "?id=" + rowID);
    //update the DOM
    for(var i = 0; i < rowCount; i++){
	var row = table.rows[i];

	if(row==currRow.parentNode.parentNode){
	    table.deleteRow(i);
	}
    }
}