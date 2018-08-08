var map;
var marker;
var pastPosition = Array();
var numDeltas = 100;
var delay =10; 
var i = 0;
var deltaLat;
var deltaLng;
var myLatLng = {lat: 24.8607343, lng: 67.0011364};
function initMap() {
	var card = document.getElementById('map-card');
	var input = document.getElementById('map-input');
	var locationButton = document.getElementById('location-getter');
	var doneButton = document.getElementById('done');
	var options = {componentRestrictions: {	country: 'pk'}};
	var infowindow = new google.maps.InfoWindow();
	var geocoder = new google.maps.Geocoder;
	map = new google.maps.Map(document.getElementById('map'), {
		center: myLatLng,
		zoom: 13
	});
	marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		draggable:true,
		// icon:'customer.png',
		animation: google.maps.Animation.DROP,
		anchorPoint: new google.maps.Point(0, -29)
	});
	var autocomplete = new google.maps.places.Autocomplete(input, options);
	autocomplete.setFields(
		['address_components', 'geometry', 'icon', 'name']);
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(card);
	// ===================Events===================
	// ==========Event for get current location==========
	locationButton.addEventListener('click', function() {
		if ("geolocation" in navigator){
			navigator.geolocation.getCurrentPosition(function(position){ 
				var currentLatitude = position.coords.latitude;
				var currentLongitude = position.coords.longitude;
				pastPosition = Array(marker.position.lat(), marker.position.lng()); 
				transition(currentLatitude, currentLongitude);
				geocodeLatLng(geocoder, map, marker, infowindow, input, currentLatitude, currentLongitude);
			});
		}
	});
	// ==========Event for get current location==========
	// ==========Event for location done==========
	doneButton.addEventListener('click', function() {
		var newPos = {lat: marker.position.lat(), lng: marker.position.lng()};
		geocoder = new google.maps.Geocoder();
		geocoder.geocode({latLng: newPos}, 
			function(results, status) 
			{
				if (status == google.maps.GeocoderStatus.OK) 
				{
					var data = {latLng: newPos, address: results[0].formatted_address}; 
					console.log(data);
					map.setCenter(newPos);
					marker.setPosition(newPos);
					infowindow.setContent(results[0].formatted_address);
					infowindow.open(map, marker);		
					input.value = '';
					input.value = results[0].formatted_address;
				} 
				else 
				{
					console.log('error occured');
				}
			}
			);
	});
	// ==========Event for location done==========
	// =======Event for autocomplete place change=======
	autocomplete.addListener('place_changed', function(event) {
		var place = autocomplete.getPlace();
		geocodeLatLng(geocoder, map, marker, infowindow, input, place.geometry.location.lat(), place.geometry.location.lng());
	});
    // =======Event for autocomplete place change=======
    //===========Event fo dragging of locator==========
    google.maps.event.addListener(marker, 'dragend', function(event) 
    {
    	var newPos = marker.getPosition()
    	geocoder = new google.maps.Geocoder();
    	geocoder.geocode({latLng: newPos}, 
    		function(results, status) 
    		{
    			if (status == google.maps.GeocoderStatus.OK) 
    			{
                // alert(event.latLng.lat());
                // alert(event.latLng.lng());
                infowindow.setContent(results[0].formatted_address);
                infowindow.open(map, marker);
                input.value = '';
                input.value = results[0].formatted_address;
            } 
            else 
            {
            	console.log('error occured');
            }
        }
        );
    });
    //===========Event fo dragging of locator==========
    //=========Event for settong location on click========
    google.maps.event.addListener(map, 'click', function(event) {
    	geocodeLatLng(geocoder, map, marker, infowindow, input, event.latLng.lat(), event.latLng.lng());
    });

    //=========Event for settong location on click========
	// ===================Events===================
}

 // Function for marker animation calculation
 function transition(lat, lng){
 	i = 0;
 	deltaLat = (lat - pastPosition[0])/numDeltas;
 	deltaLng = (lng - pastPosition[1])/numDeltas;
 	moveMarker();
 }
// Function for moving marker animation
function moveMarker(){
	pastPosition[0] += deltaLat;
	pastPosition[1] += deltaLng;
	var latlng = {lat: pastPosition[0], lng: pastPosition[1]}
	map.setCenter(latlng);
	marker.setPosition(latlng);
	if(i!=numDeltas){
		i++;
		setTimeout(moveMarker, delay);
	}
}
// Reverse geocoding for getting address from latlong
function geocodeLatLng(geocoder, map, marker, infowindow, input, currentLatitude, currentLongitude) {
	var latlng = {lat: currentLatitude, lng: currentLongitude};
	geocoder.geocode({'location': latlng}, function(results, status) {
		if (status === 'OK') {
			if (results[0]) {
				map.setCenter(latlng);
				marker.setPosition(latlng);
				infowindow.setContent(results[0].formatted_address);
				infowindow.open(map, marker);		
				input.value = '';
				input.value = results[0].formatted_address;
			} else {
				window.alert('No results found');
			}
		} else {
			window.alert('Geocoder failed due to: ' + status);
		}
	});
}