
var drawingManager;
allSelections = [];
latLngs = [];

function initMap() {

    var latlng = new google.maps.LatLng(19.0821978, 72.7410998);
    var map = new google.maps.Map(document.getElementById('map'), {
        center: latlng,
        zoom: 6
    });
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['circle', 'polygon', 'rectangle']
        }
    });

    drawingManager.setMap(map);

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
                        map: map,
                        bounds: bounds
                    });
                    //set on map
                    rectangularSelection.setMap(map);
                    console.log(rectangularSelection);
                    console.log(rectangularSelection.getBounds());

                    setupMapData({type: google.maps.drawing.OverlayType.RECTANGLE, overlay: rectangularSelection});

                } else if (eachArea.type == "Polygon") {
                    let polygonCoords = [];
                    for (let j = 0; j < eachArea.latLngInfo.length; j++) {
                        polygonCoords.push({lat: eachArea.latLngInfo[j].lat, lng: eachArea.latLngInfo[j].lng});
                    }
                    var polygonSelection = new google.maps.Polygon({
                        map: map,
                        paths: polygonCoords
                    });
                    polygonSelection.setMap(map);
                    console.log("polygonSelection");
                    console.log(polygonSelection);
                    console.log(polygonSelection.getPath());
                    setupMapData({type: google.maps.drawing.OverlayType.POLYGON, overlay: polygonSelection});
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
                        map: map,
                        center: centre,
                        radius: radius
                    });
                    circleSelection.setMap(map);
                    console.log("circleSelection");
                    console.log(circleSelection);
                    console.log(circleSelection.type);
                    setupMapData({type: google.maps.drawing.OverlayType.CIRCLE, overlay: circleSelection});
                }
            }
        }
    });
}

//initialise map
initMap();
$("#clearSelection").on('click', () => {
    for (var i = 0; i < allSelections.length; i++) {
        allSelections[i].overlay.setMap(null);
    }
    allSelections = [];
    drawingManager.setDrawingMode(null);
    $("#tbody").empty();
    $("#noData").show();
});

$("#saveSelection").on('click', () => {
    $.post('/saveMapData', {data: latLngs}, (response) => {
        if (response.error == 1) {
            alert("Error in Save", response.data);
        } else {
            alert("Saved Successfully");
        }
    });
});

function setupMapData(e) {
    var markup = "";
    allSelections.push(e);

    if (e.type == google.maps.drawing.OverlayType.POLYGON) {
        let constMvcArray = e.overlay.getPath();
        //create table html
        markup = "<tr><td>" + allSelections.length + "</td><td>Polygon</td><td>";
        let tempArray = [];
        constMvcArray.forEach((eachPath, iterator) => {
            tempArray.push({lat: eachPath.lat(), lng: eachPath.lng()});
            markup = markup + "Point " + (iterator + 1) + ": " + eachPath.lat() + ", " + eachPath.lng() + "<br/>";
        });
        latLngs.push({type: "Polygon", latLngInfo: tempArray});
        markup = markup + "</td><td class='action'><a href='javascript:void(0)' title='Remove' class='removeSelection'><span class='fa fa-trash'></span></a></td></tr>";
    } else if (e.type == google.maps.drawing.OverlayType.CIRCLE) {
        latLngs.push({lat: e.overlay.getCenter().lat(), lng: e.overlay.getCenter().lng(), radius: e.overlay.getRadius(), type: "Circle"});
        //create table html
        markup = "<tr><td>" + allSelections.length + "</td><td>" + latLngs[(latLngs.length - 1)].type + "</td><td> Centre(lat, lng) " + latLngs[(latLngs.length - 1)].lat + "," + latLngs[(latLngs.length - 1)].lng + "<br/>Radius: " + latLngs[(latLngs.length - 1)].radius + "</td><td class='action'><a href='javascript:void(0)' title='Remove' class='removeSelection'><span class='fa fa-trash'></span></a></td></tr>";
    } else if (e.type == google.maps.drawing.OverlayType.RECTANGLE) {
        latLngs.push({lat1: e.overlay.getBounds().getNorthEast().lat(), lng1: e.overlay.getBounds().getNorthEast().lng(), lat2: e.overlay.getBounds().getSouthWest().lat(), lng2: e.overlay.getBounds().getSouthWest().lng(), type: "Rectangle"});
        //create table html
        markup = "<tr><td>" + allSelections.length + "</td><td>" + latLngs[(latLngs.length - 1)].type + "</td><td> NorthEast(lat, lng) " + latLngs[(latLngs.length - 1)].lat1 + "," + latLngs[(latLngs.length - 1)].lng1 + "<br/>SouthWest(lat, lng) " + latLngs[(latLngs.length - 1)].lat2 + "," + latLngs[(latLngs.length - 1)].lng2 + "</td><td class='action'><a href='javascript:void(0)' title='Remove' class='removeSelection'><span class='fa fa-trash'></span></a></td></tr>";
    }
    console.log("latLngs");
    console.log(latLngs);
    $("#noData").hide();
    $("#tbody").append(markup);
}

//use event delegation to handle evnts on run time additional buttons
$('#selectedRegions').on('click', '.removeSelection', function (e) {
    e.preventDefault();
    alert("Coming Soon");
});

$(".help").on('click', () => {
    alert("Coming Soon");
});


//events
google.maps.event.addListener(drawingManager, 'overlaycomplete', (e) => {
    console.log("Event called");
    console.log("e");
    console.log(e);
    setupMapData(e);
});
