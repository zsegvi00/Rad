var map;
var infoWindow;
var markers = [];
var service;
var currentCoords = { };

function displayLocation(position) {
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;
  
	var pLocation = document.getElementById("location");
	pLocation.innerHTML = latitude + ", " + longitude;
  
	showMap(position.coords);
}

function showMap(coords) {
	currentCoords.latitude = coords.latitude;
	currentCoords.longitude = coords.longitude;

	var googleLatLong = new google.maps.LatLng(coords.latitude, coords.longitude);
	var mapOptions = {
		zoom: 14,
		center: googleLatLong,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
  
	var mapDiv = document.getElementById("map");
	map = new google.maps.Map(mapDiv, mapOptions);
	service = new google.maps.places.PlacesService(map);
	infoWindow = new google.maps.InfoWindow();

	google.maps.event.addListener(map, "click", function(event) {
		var latitude = event.latLng.lat();
		var longitude = event.latLng.lng();
		currentCoords.latitude = latitude;
	    currentCoords.longitude = longitude;
		
		var pLocation = document.getElementById("location");
		pLocation.innerHTML = latitude + ", " + longitude;
		map.panTo(event.latLng);

		
	});

	showForm();
	upload();
}

function makePlacesRequest(lat,lng) {
	var query = document.getElementById("query").value;

	if(query) {
		var placesRequest = {
			location : new google.maps.LatLng(lat,lng),
			radius: 1000 ,
			keyword: query

		};

		service.nearbySearch(placesRequest, function(results,status)
		{
			if(status== google.maps.places.PlacesServiceStatus.OK) {
				results.forEach(function(place) {
					//console.log(place)
					createMarker(place);

				});
			}



		});

	}
	else {
		console.log("No query entered for places search");
	}
}

function createMarker(place) {
	var markerOptions = {
		position: place.geometry.location,
		map: map,
		clickable: true
	};

	var marker = new google.maps.Marker(markerOptions);
	markers.push(marker);

	google.maps.event.addListener(marker, "click", function(place, marker) {
		return function() {
			if (place.vicinity) {
				infoWindow.setContent(place.name + "<br>" + place.vicinity);
			} else {
				infoWindow.setContent(place.name);
			}
			infoWindow.open(map, marker);
		};
	}(place, marker));
}

function clearMarkers() {
	markers.forEach(function(marker) { marker.setMap(null); });
	markers = [];
}

function showForm() {

	var searchForm = document.getElementById("search");
	searchForm.style.visibility = "visible" ;
	var button = document.querySelector("button");
	button.onclick = function (e){
		e.preventDefault();
		clearMarkers();
		makePlacesRequest( currentCoords.latitude, currentCoords.longitude);

		//console.log("Clicked the search button");
		

	};
}

function displayError(error) {
	var errors = ["Unknown error", "Permission denied by user", "Position not available", "Timeout error"];
	var message = errors[error.code];
	console.warn("Error in getting your location: " + message, error.message);
}

window.onload = function() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(displayLocation, displayError);
	} else {
		alert("Sorry, this browser doesn't support geolocation!");
	}
}



function upload () {
	var fileInput = $('#files');
	var uploadButton = $('#upload'); 

	uploadButton.on('click', function(e) {
	    e.preventDefault();
	    clearMarkers();
	    if (!window.FileReader) {
	        alert('Your browser is not supported')
	    }
	    var input = fileInput.get(0);
	    
	    // Create a reader object
	    var reader = new FileReader();
	    if (input.files.length) {
	        var textFile = input.files[0];
	        reader.readAsText(textFile);
	        $(reader).on('load', processFile);
	    } else {
	        alert('Please upload a file before continuing')
	    } 
	});

	function processFile(e) {
	    var file = e.target.result,
	        results;

	    var counter = 0;
	    var content = '<table>';

	    if (file && file.length) {
	        results = file.split("\n");
	        content += 
	        '<tr class ="rows">'+
	        '<td class ="stupac">X</td>' + 
	        '<td class ="stupac">Y</td>' + 
	        '<td class ="stupac">Address</td>' + 
	        '<td class ="stupac">Description</td>'+
	        '<td class ="stupac"></td><tr>';

	        results.forEach(function (result){
	        	
	        	var position= {};
	        	[position.lat, position.lng, position.address, position.desc] = result.split(", ");
	        	if(position.lat!=undefined && position.lng!=undefined && position.address!=undefined && position.desc!=undefined ){
	        		
	        		content += 
	        		'<tr class ="rows">'+
	        		'<td class ="stupac">'+ position.lat + '</td>' + 
	        		'<td class ="stupac">'+ position.lng +'</td>' + 
	        		'<td class ="stupac">'+ position.address +'</td>' + 
	        		'<td class ="stupac">'+ position.desc +'</td>'+
	        		'<td class ="stupac"><button class="center-button" data-lat='+ position.lat +' data-lng='+ position.lng +'>Get Center</button></td></tr>';

	        	}

	        	var myLatLng = { lat: parseFloat(position.lat), lng: parseFloat(position.lng) };
	        	
		        var marker = new google.maps.Marker({
			        position: myLatLng,
			        title: position.address + ", " + position.desc
		        });
		        	
		        marker.setMap(map);
		        markers.push(marker)
		        
	        });

	        content += '</table>'
	        
	        $('#table').append(content);
	        $('#table').addClass('foo');

	        $('.center-button').on('click', function(event){

	        	var $this = $(this);
	        	var latitude = $this.data('lat');
	        	var longitude = $this.data('lng');
	        	$('.yellow').removeClass('yellow');
	        	$(this).closest('tr').addClass('yellow');

	        	var googleLatLong = new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude));
	        	map.panTo(googleLatLong);

	        	markers.forEach(function(marker){

	        		if(marker.position.lat() === googleLatLong.lat() && marker.position.lng() === googleLatLong.lng()){
	        			marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
	        		}
	        		else{
	        			marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
	        		}
	        	});
	        });
	        
	        var bounds = new google.maps.LatLngBounds();
		    for (var i = 0; i < markers.length-1; i++) {
		        bounds.extend(markers[i].getPosition());
		    }

		    map.panTo(bounds.getCenter());
		    map.fitBounds(bounds);   
	    }
	}
}



