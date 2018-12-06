
var marker;
allSelections = [];
latLngs = [];
var map;

function initMap() {
    var myLatlng = new google.maps.LatLng(19.0821978, 72.907268);
    var mapOptions = {
        zoom: 11,
        center: myLatlng
    }
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

// Place a draggable marker on the map
    marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        draggable: true,
        title: "Drag me!"
    });

    //get data from server if any
    $.get('/getMapData', (response) => {
        console.log(response);
        if (response.error == 1) {
            console.log("Something went wrong in fetch from db");
            console.log(response.data);
        } else {
            for (let i = 0; i < response.data.pointsData.length; i++) {
                var eachArea = response.data.pointsData[i];
                if (eachArea.type == "Rectangle") {
                    let bounds = {};
                    for (let j = 0; j < eachArea.latLngInfo.length; j++) {
                        if (eachArea.latLngInfo[j].pointCode == 3) {
                            //northeast
                            bounds["north"] = eachArea.latLngInfo[j].lat;
                            bounds["east"] = eachArea.latLngInfo[j].lng;
                        } else if (eachArea.latLngInfo[j].pointCode == 4) {
                            //southwest
                            bounds["south"] = eachArea.latLngInfo[j].lat;
                            bounds["west"] = eachArea.latLngInfo[j].lng;
                        }
                    }
                    var rectangularSelection = new google.maps.Rectangle({
                        bounds: bounds
                    });
                    allSelections.push({type: 'rectangle', overlay: rectangularSelection});

                } else if (eachArea.type == "Polygon") {
                    let polygonCoords = [];
                    for (let j = 0; j < eachArea.latLngInfo.length; j++) {
                        polygonCoords.push({lat: eachArea.latLngInfo[j].lat, lng: eachArea.latLngInfo[j].lng});
                    }
                    var polygonSelection = new google.maps.Polygon({
                        paths: polygonCoords
                    });

                    allSelections.push({type: 'polygon', overlay: polygonSelection});
                } else if (eachArea.type == "Circle") {
                    let centre, radius;
                    for (let j = 0; j < eachArea.latLngInfo.length; j++) {
                        if (eachArea.latLngInfo[j].pointCode == 1) {
                            centre = {lat: eachArea.latLngInfo[j].lat, lng: eachArea.latLngInfo[j].lng}
                        } else if (eachArea.latLngInfo[j].pointCode == 2) {
                            radius = eachArea.latLngInfo[j].length
                        }
                    }
                    let circleSelection = new google.maps.Circle({
                        center: centre,
                        radius: radius
                    });
                    allSelections.push({type: 'circle', overlay: circleSelection});
                }
            }
        }
    });


}
//initialise map
initMap();

//events
google.maps.event.addListener(marker, 'dragend', function (evt) {
    let lat = evt.latLng.lat();
    let lng = evt.latLng.lng();
    let found = false;
    for (let i = 0; i < allSelections.length; i++) {
        if (allSelections[i].type == 'polygon') {
            if (google.maps.geometry.poly.containsLocation(evt.latLng, allSelections[i].overlay) == true) {
                found = true;
            }
        } else if (allSelections[i].type == 'circle') {
            if (google.maps.geometry.spherical.computeDistanceBetween(evt.latLng, allSelections[i].overlay.getCenter()) <= allSelections[i].overlay.getRadius() == true) {
                found = true;
            }
        } else if (allSelections[i].type == 'rectangle') {
            if (allSelections[i].overlay.getBounds().contains(evt.latLng) == true) {
                found = true;
            }
        }

    }
    if (found) {
        alert("Found in serviceable range");
    } else {
        alert("Not found in serviceable range");
    }
});


$(".checkbox").change(function () {
    if ($(this).prop("checked") == true) {
        for (let i = 0; i < allSelections.length; i++) {
            allSelections[i].overlay.setMap(map);
        }
    } else if ($(this).prop("checked") == false) {
        for (let i = 0; i < allSelections.length; i++) {
            allSelections[i].overlay.setMap(null);
        }
    }
});

//for ideas which had no time to be implemented
$(".help").on('click', () => {
    alert("Coming Soon");
});