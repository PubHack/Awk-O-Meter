var __awks_o_meter = (function(){

	var coordinates = {
		lat : undefined,
		lon : undefined
	};

	var localAwkLevel = 0;

	/*function status(message){
		
	}*/

	function submitNewAwkwardIncident(values){

		console.log(values, coordinates);

		jQuery.ajax({
			type : "GET",
			url : window.location.origin + "/situation/new/" + values.description + "/" + values.awkLevel + "/" + coordinates.lat + "/" + coordinates.lon,
			success : function(e){
				console.log(e);
				// alert("SUCCESS");
				document.getElementById('newSit').reset();
				showCurrentAwks();
			}
		})

	}

	function displayAwksLevel(awks){

		var ratingDisplay = document.getElementById('rating'),
			status = document.getElementById('status'),
			advice = document.getElementById('action');

		ratingDisplay.innerHTML = awks;
		status.innerHTML = "STATUS: "
		advice.innerHTML = "ACTION: "

		if(awks > 0 && awks <= 3){
			status.innerHTML += "LEVELS TOLERABLE";
			advice.innerHTML += "PROCEED WITH CAUTION";
		} else if(awks > 3 && awks <= 7){
			status.innerHTML += "LEVELS DANGEROUS";
			advice.innerHTML += "LIMIT EXPOSURE TO SITUATION";
		} else if(awks > 7){
			status.innerHTML += "LEVELS INTOLERABLE";
			advice.innerHTML += "ABORT. ABORT. ABORT.";
		}

		var levels = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

		document.getElementById('meterReading').setAttribute('data-level', levels[awks]);
		// document.getElementsByTagName('audio')[0].play();

		document.getElementById('geiger').play();

		if(awks >= 8){
			document.getElementById('alarm').play();			
			ratingDisplay.setAttribute('data-redalert', 'true');
		}

	}

	function displaySituations(situations){

		var situationHolder = document.getElementById('situationHolder'),
			situFrag = document.createDocumentFragment();

		for(var g = 0; g < situations.length; g += 1){

			var aSituation = document.createElement('li'),
				description = document.createElement('p'),
				rating = document.createElement('a');

			aSituation.setAttribute('class', 'aSituation');
			description.innerHTML = situations[g].description;
			rating.innerHTML = situations[g].rating;
			
			aSituation.appendChild(description);
			aSituation.appendChild(rating);

			situFrag.appendChild(aSituation);

		}

		situationHolder.innerHTML = "";
		situationHolder.appendChild(situFrag);

		document.getElementById('displayReading').setAttribute('data-display', 'true');
		document.getElementById('getLocation').style.display = "none";

	}


	var status = (function(){

		var st = document.getElementById('showStatus');

		function showStatus(message){

			st.style.innerHTML = message;
			st.style.display = "block";
		}

		function hideStatus(){
			st.style.innerHTML = "";
			st.style.display = "none";
		}

		return {
			show : showStatus,
			hide : hideStatus
		}

	})();

	function showCurrentAwks(){

		jQuery.ajax({
			type : "GET",
			url : window.location.origin + "/situation/check/" + coordinates.lat + "/" + coordinates.lon,
			cache : false,
			success : function(e){
				console.log(e);
				displaySituations(e.situations);
				localAwkLevel = e.awkLevel;
				displayAwksLevel(Math.round(e.awkLevel));
				status.hide();
				document.getElementById('newSituationOverlay').setAttribute('data-display', 'false');
			}
		})

	}

	function handleLocationSuccess(data, callback){
		console.log(data);
		coordinates.lat = data.coords.latitude;
		coordinates.lon = data.coords.longitude;

		if(callback !== undefined){
			callback();
		}

	}

	function handleLocationError(err){
		console.log(err);
		alert("Couldn't get your location :(");
	}

	function assignEvents(){

		document.getElementById('getLocation').addEventListener('click', function(){

			if(navigator.geolocation !== undefined){

				status.show("Getting position...");

				navigator.geolocation.getCurrentPosition(function(data){
					handleLocationSuccess(data, function(){
						showCurrentAwks();
					})
				}, handleLocationError, {
					enableHighAccuracy: true,
					timeout: 5000,
					maximumAge: 1000
				});
			}

		}, false);

		document.getElementById('newSituationButton').addEventListener('click', function(){
			// alert("Boop");
			document.getElementById('newSituationOverlay').setAttribute('data-display', 'true');
		}, false);

		document.getElementById('newSit').addEventListener('submit', function(e){
			e.preventDefault();

			var description = document.getElementById('currentDescription').value,
				awkLevel = document.getElementById('howAwks').value;

				submitNewAwkwardIncident({
					description : description,
					awkLevel : awkLevel
				})

		}, false);

		document.getElementById('closeNewSit').addEventListener('click', function(){
			document.getElementById('newSituationOverlay').setAttribute('data-display', 'false');
		}, false);

	}

	function init(){
		console.log("Initialised");

		assignEvents();

		if(navigator.geolocation !== undefined){

			status.show("Getting position...");

			navigator.geolocation.getCurrentPosition(function(data){
				handleLocationSuccess(data, function(){
					/*jQuery.ajax({
						type : "GET",
						url : window.location.origin + "/situation/check/" + coordinates.lat + "/" + coordinates.lon,
						success : function(e){
							console.log(e);
							displaySituations(e.situations);
							localAwkLevel = e.awkLevel;
							displayAwksLevel(Math.round(e.awkLevel));
							status.hide();
						}
					})*/

					showCurrentAwks();
				})
			}, handleLocationError, {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 1000
			});
		}

	}

	return{
		init : init
	};

})();

(function(){
	__awks_o_meter.init();
})();