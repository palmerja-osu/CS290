document.addEventListener('DOMContentLoaded', bindButtons);

function bindButtons() {
	document.getElementById('weatherSubmit').addEventListener('click', function(e){
		var req = new XMLHttpRequest();
		var url = "http://api.openweathermap.org/data/2.5/weather?";
		var appId = "&appid=fa7d80c48643dfadde2cced1b1be6ca1";
		var cityInput = document.getElementById("citySearch").value;
		var zipInput = document.getElementById("zipSearch").value;
		if (zipInput === '') {
			formInput = "q=" + cityInput;
		} else {
			formInput = "zip=" + zipInput;
		}
		var finalUrl = url + formInput + appId + '&units=imperial';
		req.open("GET", finalUrl, true);
		req.addEventListener('load', function() {
			if (req.status >= 200 && req.status < 400) {
				var res = JSON.parse(req.responseText);
				weatherResponse(res);
			} else {
				var str = "Error in network request: " + res.statusText;
				console.log(str);
				alert(str);
			}
		});
		req.send();
		e.preventDefault();
	});

	document.getElementById('pasteSubmit').addEventListener('click', function(e){
		var req = new XMLHttpRequest();
		var url = "http://httpbin.org/post";
		var payload = {
			'name': null,
			'age': null,
			'weight': null
		};
		payload.name = document.getElementById('in-name').value;
		payload.age = document.getElementById('in-age').value;
		payload.weight = document.getElementById('in-weight').value;
		req.open("POST", url, true);
		req.setRequestHeader('Content-Type', 'application/json');
		req.addEventListener('load', function() {
			if (req.status >= 200 && req.status < 400) {
				var res = JSON.parse(JSON.parse(req.responseText).data);
				console.log(res);
				postResponse(res);
			} else {
				var str = "Error in network request: " + res.statusText;
				console.log(str);
				alert(str);
			}
		});
		req.send(JSON.stringify(payload));
		e.preventDefault();
	});
}

function postResponse(res) {
	document.getElementById('out-name').textContent = res.name;
	document.getElementById('out-age').textContent = res.age;
	document.getElementById('out-weight').textContent = res.weight;
}

function weatherResponse(res) {
	document.getElementById('city').textContent = res.name;
	document.getElementById('temp').textContent = res.main.temp;
	document.getElementById('pressure').textContent = res.main.pressure;
	document.getElementById('humidity').textContent = res.main.humidity;
	document.getElementById('tempMax').textContent = res.main.temp_max;
	document.getElementById('tempMin').textContent = res.main.temp_min;
	console.log(res);
}