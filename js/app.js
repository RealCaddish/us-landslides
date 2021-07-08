(function () {
  // application goes here
  var map = L.map("map", {
    zoomSnap: 0.1,
    center: [28.1667, 84.25],
    zoom: 7,
    minZoom: 6,
    maxZoom: 9,
  });

  // mapbox API access token
  var accessToken =
    "pk.eyJ1IjoiZGVhdG5uciIsImEiOiJja29vZzNxdXkwOWNwMm9yeDc1eDIyaWZlIn0.GYqw7WL4cQHfboID4_ADgg";

  // request a mapbox raster tile layer and add to map
  L.tileLayer(
    `https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`,
    {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 22,
      id: "light-v10",
      accessToken: accessToken,
    }
  ).addTo(map);

  omnivore
    .csv("../data/landslides.csv")
    .on("ready", function (e) {
      drawMap(e.target.toGeoJSON());
      drawLegend(e.target.toGeoJSON());
    })
    .on("error", function (e) {
      console.log(e.error[0].message);
    });

  function drawMap(data) {
    const options = {
      pointToLayer: function (feature, ll) {
        return L.circleMarker(ll, {
          opacity: 1,
          weight: 2,
          fillOpacity: 0,
        });
      },
    };
    // create landslide layer from GeoJSON data
    const landslides = L.geoJson(data, options).addTo(map);

    landslides.setStyle({
      color: "#D96D02",
    });

    console.log(landslides);

    resizeCircles(landslides, 1);
    sequenceUI(landslides);
  }

  function calcRadius(val) {
    const radius = Math.sqrt(val / Math.PI);
    return radius * 12; // adjust .5 as scale factor
  }

  // resize function for landslide circles
  function resizeCircles(landslides, sizes) {
    landslides.eachLayer(function (layer) {
      var sizes = layer.feature.properties.size_numeric; 
      console.log(sizes);
      const radius = calcRadius(
        Number(sizes)
      );
      layer.setRadius(radius);
    });
  }

  function sequenceUI(landslides) {
    //Leaflet control for slider
    const sliderControl = L.control({
      position: "bottomleft",
    });

    sliderControl.onAdd = function (map) {
      const controls = L.DomUtil.get("slider");
      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);

      return controls;
    };
    // add slider to map
    sliderControl.addTo(map);
    
    var sliderDescriber = L.control({
      position:'bottomleft'
    });

    //text added above slider describing year of landslide
    sliderDescriber.onAdd = function (map) {
      const year = L.DomUtil.get("slider-text");
      L.DomEvent.disableScrollPropagation(year);
      L.DomEvent.disableClickPropagation(year);

      return year;
    };
    sliderDescriber.addTo(map);

    //select slider's input and listen for change

    $("#slider input[type=range]").on("input", function () {
      //current value of slider on year of occurence

      var year = this.value;
      console.log(`<b> Year: ${year} </b>`);
      // add info for size of landslide
      var sd = document.querySelector("#slider-text h2");
      sd.innerHTML = `<b>Year: ${year}</b>`;
      console.log(sd);

      //resize circles with updated size level
      resizeCircles(landslides, size_numeric);
    });
  }
})();
