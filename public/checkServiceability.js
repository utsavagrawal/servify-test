
var marker;
allSelections = [];
latLngs = [];

function initMap() {
    var myLatlng = new google.maps.LatLng(19.0821978, 72.907268);
    var mapOptions = {
        zoom: 11,
        center: myLatlng
    }
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

// Place a draggable marker on the map
    marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        draggable: true,
        title: "Drag me!"
    });

}
//initialise map
initMap();

//events
google.maps.event.addListener(marker, 'dragend', function (evt) {
    console.log("dragend");
    console.log(evt);
    let lat = evt.latLng.lat();
    let lng = evt.latLng.lng();
    console.log(lat + " " + lng);
//    document.getElementById('current').innerHTML = '<p>Marker dropped: Current Lat: ' + evt.latLng.lat().toFixed(3) + ' Current Lng: ' + evt.latLng.lng().toFixed(3) + '</p>';
});
