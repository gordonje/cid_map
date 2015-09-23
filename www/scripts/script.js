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

// set up map, center on Business Loop at zoom level 15
var map = L.map('map').setView([38.965, -92.335], 15);

// global variables
var mapBounds;
var countVoters = 0;

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'gordonje.fcef19c2',
    accessToken: 'pk.eyJ1IjoiZ29yZG9uamUiLCJhIjoiY2E4ZjhlODc3ZjA2OWFiMjJiOTcxMmM2YTJkZTBlNjQifQ.pTjkHSCU8l6v_7O0H_5c-g'
}).addTo(map);

// color for CID shapes
var shapeStyle = {
    "color": "#FE9A2E",
};

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

// // probably lose this cause it doesn't take that long to load
// var progress = document.getElementById('progress');
// var progressBar = document.getElementById('progress-bar');

// function updateProgressBar(processed, total, elapsed, layersArray) {
// 	if (elapsed > 1000) {
// 		// if it takes more than a second to load, display the progress bar:
// 		progress.style.display = 'block';
// 		progressBar.style.width = Math.round(processed/total*100) + '%';
// 	}

// 	if (processed === total) {
// 		// all markers processed - hide the progress bar:
// 		progress.style.display = 'none';
// 	}
// }

// d3.csv('data/downtown_cid_voters.csv', function(d) {
// 		return L.marker([+d.lat, +d.lng]).bindPopup(d.vr_id).addTo(map);
// 	}, function(data) {
// 		console.log('Downtown voters loaded.');
// 	}
// );

// set up cluster group for markers outside of CID
var outCIDMarkers = L.markerClusterGroup({ 
	  chunkedLoading: true
	, iconCreateFunction: function(cluster) {
		return new L.DivIcon({
			  html: '<div><span>' + cluster.getChildCount() + '</span></div>'
			, className: 'marker-cluster marker-cluster-out'
			, iconSize: new L.Point(40, 40)
			// html: '<div class="leaflet-marker-icon marker-cluster marker-cluster-out leaflet-zoom-animated leaflet-clickable" style="margin-left: -20px; margin-top: -20px; width: 40px; height: 40px; transform: translate3d(869px, 4px, 0px); z-index: 4;"><div><span>' + cluster.getChildCount() + '</span></div></div>'
			// html: '<div style="text-align:center;color:#fff;background:#2164A1">' + cluster.getChildCount() + '</div>'
		});
	}
	// , chunkProgress: updateProgressBar
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
	// , chunkProgress: updateProgressBar
});

// pass in a number and add commas for every three digits
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// pass in the current bounds of the map, load the voters who are outside of the CIDs
function showOutVoters(mapBounds) {

	d3.csv('data/geocodes.csv', function(d) {

		if (
			   +mapBounds.getSouth() < +d.lat 
			&& +d.lat < +mapBounds.getNorth() 
			&& +mapBounds.getWest() < +d.lng 
			&& +d.lng < +mapBounds.getEast()
			&& d.cid == 'No'
		) {
			return L.marker([+d.lat, +d.lng], {icon: blueMarker}).bindPopup(d.vr_id)
		};

	}, function(data) {

		countVoters += data.length;
		center = map.getCenter();
		zoom = map.getZoom();

		console.log('Num Out Voters:' + data.length);
		$("#voter-count").text(numberWithCommas(countVoters));
		outCIDMarkers.addLayers(data);
		map.addLayer(outCIDMarkers);

	});
};

// pass in the current bounds of the map, load the voters who are inside of the CIDs
function showInVoters(mapBounds) {

	d3.csv('data/geocodes.csv', function(d) {

		if (
			   +mapBounds.getSouth() < +d.lat 
			&& +d.lat < +mapBounds.getNorth() 
			&& +mapBounds.getWest() < +d.lng 
			&& +d.lng < +mapBounds.getEast()
			&& d.cid != 'No'
		) {
			return L.marker([+d.lat, +d.lng], {icon: greenMarker}).bindPopup(d.vr_id)
		};

	}, function(data) {

		countVoters += data.length;
		center = map.getCenter();
		zoom = map.getZoom();

		console.log('Num In Voters:' + data.length);
		$("#voter-count").text(numberWithCommas(countVoters));
		inCIDMarkers.addLayers(data);
		map.addLayer(inCIDMarkers);

	});
};

// pass in the map bounds and it returns the calculated geographic area
function getArea(mapBounds) {

	var height = mapBounds.getSouthEast().distanceTo(mapBounds.getNorthEast());
	var width = mapBounds.getNorthEast().distanceTo(mapBounds.getNorthWest());

	return Math.round(((height * width) * 0.000000386102) * 10 ) / 10;

};

$(document).ready(function() {

	mapBounds = map.getBounds();
	showOutVoters(mapBounds);
	showInVoters(mapBounds);
	$("#sq-miles").text(getArea(mapBounds));

});

map.on('dragstart', function(e) {
		
	inCIDMarkers.clearLayers();
	outCIDMarkers.clearLayers();
	countVoters = 0;

});

map.on('dragend', function(e) {

	if (map.getZoom() > 13) {
		
		mapBounds = map.getBounds();
		showOutVoters(mapBounds);
		showInVoters(mapBounds);
		
	} 
});

map.on('viewreset', function(e) {

	inCIDMarkers.clearLayers();
	outCIDMarkers.clearLayers();
	countVoters = 0;

	if (map.getZoom() > 13) {

		mapBounds = map.getBounds();
		showOutVoters(mapBounds);
		showInVoters(mapBounds);
		$("sq-miles").text(getArea(mapBounds));

	} 
});

map.on('zoomend', function(e) {

	if (map.getZoom() > 13) {
		mapBounds = map.getBounds();
		$("#sq-miles").text(getArea(mapBounds));
		
	} 
});

// not sure why this isn't working, seems to make to many callbacks?
// map.on('resize', function(e) {

// 	inCIDMarkers.clearLayers();
// 	outCIDMarkers.clearLayers();
// 	countVoters = 0;

// 	if (map.getZoom() > 13) {

// 		mapBounds = map.getBounds();
// 		$("sq-miles").text(getArea(mapBounds));

// 	} 
// });

$("button").on('click', function() {
	map.setView(
		  $(this).attr("data-position").split(',')
		, +$(this).attr("data-zoom")
	);
});



