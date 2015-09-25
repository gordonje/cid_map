
// set up map, center on Business Loop at zoom level 15
var map = L.map('map').setView([38.965, -92.335], 15);

// custom marker colors and icons (via glyphicon, bootstrap and awesome makers)
// green is for in CID
var greenMarker = L.AwesomeMarkers.icon({
	icon: 'glyphicon glyphicon-star',
	markerColor: 'green'
});
// blue is for not in CID
var blueMarker = L.AwesomeMarkers.icon({
	icon: 'glyphicon glyphicon-star',
	markerColor: 'blue'
});

// global variables
var mapBounds;
var countVoters = 0;

// color for CID shapes
var shapeStyle = {
    "color": "#FE9A2E",
};

// set up cluster group for markers outside of CID
var outCIDMarkers = L.markerClusterGroup({ 
	  chunkedLoading: true
	, iconCreateFunction: function(cluster) {
		return new L.DivIcon({
			  html: '<div><span>' + cluster.getChildCount() + '</span></div>'
			, className: 'marker-cluster marker-cluster-out'
			, iconSize: new L.Point(40, 40)
		});
	}
});

// set up cluster group for markers inside of CID
var inCIDMarkers = L.markerClusterGroup({ 
	  chunkedLoading: true
	, iconCreateFunction: function(cluster) {
		return new L.DivIcon({
			  html: '<div><span>' + cluster.getChildCount() + '</span></div>'
			, className: 'marker-cluster marker-cluster-in'
			, iconSize: new L.Point(40, 40)
			// html: '<div class="leaflet-marker-icon marker-cluster marker-cluster-in leaflet-zoom-animated leaflet-clickable" style="margin-left: -20px; margin-top: -20px; width: 40px; height: 40px; transform: translate3d(869px, 4px, 0px); z-index: 4;"><div><span>' + cluster.getChildCount() + '</span></div></div>'
			// html: '<div style="text-align:center;color:#fff;background:#008141">' + cluster.getChildCount() + '</div>'
		});
	}
});

// pass in a number
// return a string version of the number with commas inserted every three digits
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// pass in the current bounds of the map and boolean for voters in our out of the CID
// return and array of markers
function getMarkers(mapBounds, inCID) {
	
	var filters = function(model) {
		var lat = +model.get('lat');
		var lng = +model.get('lng');

		if (inCID) {
			return +mapBounds.getSouth() < lat
				&& lat < +mapBounds.getNorth() 
				&& +mapBounds.getWest() < lng 
				&& lng < +mapBounds.getEast()
				&& model.get('cid') != 'No'
		} else {
			return +mapBounds.getSouth() < lat
				&& lat < +mapBounds.getNorth() 
				&& +mapBounds.getWest() < lng 
				&& lng < +mapBounds.getEast()
				&& model.get('cid') == 'No'
		}
	}

	var voters = window.data.filter(filters);

	var markers = _.map(voters, function(voter) { 
		var lat = +voter.get('lat');
		var lng = +voter.get('lng');

		if (inCID) {
			return L.marker([lat, lng], {icon: greenMarker})
		} else {
			return L.marker([lat, lng], {icon: blueMarker})
		}
	} );
		
	return markers;

};

// pass in the map bounds
// returns the calculated geographic area
function getArea(mapBounds) {

	var height = mapBounds.getSouthEast().distanceTo(mapBounds.getNorthEast());
	var width = mapBounds.getNorthEast().distanceTo(mapBounds.getNorthWest());

	return Math.round(((height * width) * 0.000000386102) * 10 ) / 10;

};

// gets markers, adds them to layers and adds layers to the map
// sets the global countVoters var
function render() {
	
	mapBounds = map.getBounds();
	var inCID = getMarkers(mapBounds, Boolean(true));
	var outCID = getMarkers(mapBounds, Boolean(false));

	inCIDMarkers.addLayers(inCID);
	outCIDMarkers.addLayers(outCID);
	
	map.addLayer(inCIDMarkers);
	map.addLayer(outCIDMarkers);

	countVoters = inCID.length + outCID.length;

};

// handles the text below the map
function writeInfo() {

	mapBounds = map.getBounds();
	zoomLevel = map.getZoom();

	if (zoomLevel > 14) {
		if ( $("#instruct-text").is(":visible") ) {
				$('#instruct-text').fadeOut(function() {
					$('#info-text').fadeIn();
				});
		}

	$("#voter-count").text(numberWithCommas(countVoters));
	$("#sq-miles").text(getArea(mapBounds));

	} else {
		if ( $("#info-text").is(":visible") ) {
				$('#info-text').fadeOut( function() {
					$('#instruct-text').fadeIn();
				});
		}
	}
};

// calls render() and writeInfo()
var delayedRender = _.debounce(function() {

	inCIDMarkers.clearLayers();
	outCIDMarkers.clearLayers();
	countVoters = 0;

	if (map.getZoom() > 14) {
		render();
	} else {
		inCIDMarkers.clearLayers();
		outCIDMarkers.clearLayers();
		countVoters = 0;
	}

	writeInfo();

}, 300);

// do all this stuff when the DOM
$(document).ready(function() {

	// set up the tile layer, coming from OpenStreetMaps, via Mapbox, and add it to the map
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    id: 'gordonje.fcef19c2',
	    accessToken: 'pk.eyJ1IjoiZ29yZG9uamUiLCJhIjoiY2E4ZjhlODc3ZjA2OWFiMjJiOTcxMmM2YTJkZTBlNjQifQ.pTjkHSCU8l6v_7O0H_5c-g'
	}).addTo(map);

	// load the data into backbone collection
	d3.csv('data/geocodes.csv', function(d) { 
		window.data = new Backbone.Collection(d);
		// then render and writeInfo for the first time
		render();
		writeInfo();
	});

	// load each CID .kml file
	$.getJSON("data/downtown_cid.json", function(data){
	// add GeoJSON layer to the map once the file is loaded
		L.geoJson(data, {style: shapeStyle}).addTo(map);
	});

	$.getJSON("data/the_loop_cid.json", function(data){
	// add GeoJSON layer to the map once the file is loaded
		L.geoJson(data, {style: shapeStyle}).addTo(map);
	});

	$.getJSON("data/north_763_cid.json", function(data){
	// add GeoJSON layer to the map once the file is loaded
		L.geoJson(data, {style: shapeStyle}).addTo(map);
	});

});

// below are the map events when we need to update things
map.on('dragstart', function(e) {
		
	inCIDMarkers.clearLayers();
	outCIDMarkers.clearLayers();
	countVoters = 0;

});

map.on('dragend', function(e) {

	if (map.getZoom() > 14) {
		render();
		writeInfo();
	} 
});

// the 'viewreset' map even should be handling zooming out
map.on('viewreset', function(e) {

	inCIDMarkers.clearLayers();
	outCIDMarkers.clearLayers();
	countVoters = 0;

	if (map.getZoom() > 14) {	
		render();
		writeInfo();
	} else {
		$('#info-text').fadeOut(function() {
			$('#instruct-text').fadeIn();
		});
	} 
});

map.on('resize', delayedRender);

// changing the view when clicking the button
$("button").on('click', function() {
	var startZoom = map.getZoom();
	map.setView(
		  $(this).attr("data-position").split(',')
		, +$(this).attr("data-zoom")
	);
	var endZoom = map.getZoom();
	// if the zoom is changing, then view reset will handle this change
	// otherwise we need to clear, render and writeInfo
	if (startZoom == endZoom) {

		inCIDMarkers.clearLayers();
		outCIDMarkers.clearLayers();
		countVoters = 0;
		render();
		writeInfo();
	};
});


// // shouldn't need to handle zoom events because of a) viewreset and b) marker-clusters handling of zooming in

// map.on('zoomstart', function(e) {

// 	console.log('Zoom started!');
		
// 	inCIDMarkers.clearLayers();
// 	outCIDMarkers.clearLayers();
// 	countVoters = 0;

// });

// map.on('zoomend', delayedRender);

