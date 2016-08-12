var travelReveal = window.travelReveal = {};

travelReveal.data = [
  {
    "class": "first-tag",
    "iconUrl": "",
    "thumbnailUrl": "",
    "title": "Horse Ranch Mountain",
    "subtext": "Summit - 8,726ft",
    "cta": "Learn More",
    "modal": "first"
  },
  {
    "class": "second-tag",
    "iconUrl": "",
    "thumbnailUrl": "",
    "title": "Springdate, Utah",
    "subtext": "Partly Sunny, 63°",
    "cta": "See Forecast",
    "modal": "first"
  },
  {
    "class": "third-tag",
    "iconUrl": "",
    "thumbnailUrl": "",
    "title": "Zion National Park",
    "subtext": "nps.gov/zion",
    "cta": "Get Tickets",
    "modal": "first"
  },
  {
    "class": "fourth-tag",
    "iconUrl": "",
    "thumbnailUrl": "",
    "title": "SF Baseball Cap",
    "subtext": "$49 | Habiliment",
    "cta": "Shop",
    "modal": "first"
  },
  {
    "class": "fifth-tag",
    "iconUrl": "",
    "thumbnailUrl": "",
    "title": "Campus Backpack",
    "subtext": "$99 | Habiliment",
    "cta": "Shop",
    "modal": "first"
  }
];

travelReveal.modals = [
  {
    "attribute": 'data-modal-first',
    "close": "close",
    "title": "Shoppable content, right where your customers are.",
    "content": "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum ",
    "cta": "Learn more",
    "link" : ""
  }
]

travelReveal.createMarker = function(place) {
  var that = this;
  var request = { reference: place.reference };
  this.service.getDetails(request, function(details, status) {
    //only add click handlers and markers if the api has returned properly, there's some kind of dumb (smart) query limit for getDetails()
    //this is to stop users from clicking on markers before they had the proper data returned, seems like bad form to load markers that are not clickable
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      var marker = new google.maps.Marker({
        map: that.map,
        position: place.geometry.location
      });
      google.maps.event.addListener(marker, 'click', function() {
        that.infowindow.setContent(details.name + "<br />" + details.formatted_address +"<br />" + details.formatted_phone_number);
        that.infowindow.open(map, this);
      });
    } else {
      setTimeout(function() {
        that.createMarker(place);
      }, 300);
    }
  });
};

travelReveal.formWeatherCall = function(endpoint, data, apiKey) {
  console.log(data);
  return endpoint + '?lat=' + data.lat + '&lon=' + data.lng + '&appid=' + apiKey + '&units=imperial';
};

travelReveal.formLocCall = function(endpoint, data, apiKey) {
  return endpoint + 'latlng=' + data.latitude + ',' + data.longitude + '&key=' + apiKey;
};

travelReveal.apiCalls = function() {
  var that = this;
  var GEOIP_ENDPOINT = '//freegeoip.net/json/';
  var WEATHER_ENDPOINT = '//api.openweathermap.org/data/2.5/weather';
  var GMAPS_API_KEY = 'AIzaSyCDuEW4yfbf4YrP3mrAGxJcvSuCHzQRiUE';
  var GMAPS_LOC_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json?';
  var GMAPS_LOCATION_KEY = 'AIzaSyDFooO1X9-FoPHqXuKiMgB6kae3YNHqJto';
  var WEATHER_API_KEY = 'aa67d47c2cc3840547b7ebe3e0b2914c';
  var lat,
      lon;

  var request = $.ajax(GEOIP_ENDPOINT, { dataType: "jsonp" }),
      gmapsRequest = request.then(function(response) {
            lat = response.latitude;
            lon = response.longitude;
            return $.getScript('https://maps.googleapis.com/maps/api/js?key=' + GMAPS_API_KEY + '&libraries=places');
          },
          locRequest = request.then(function(response) {
            return $.ajax(travelReveal.formLocCall(GMAPS_LOC_ENDPOINT, response, GMAPS_LOCATION_KEY));
          })
      );

  gmapsRequest.done(function() {
    var $tag = $('.first-tag .tag-content');
    $tag.append('<div id="map"></div>');
    var loc = new google.maps.LatLng(lat, lon);
    that.infowindow = new google.maps.InfoWindow();

    console.log($tag);

    that.map = new google.maps.Map($('#map')[0], {
      center: loc,
      zoom: 15
    });

    var request = {
      location: loc,
      rankBy: google.maps.places.RankBy.DISTANCE,
      keyword: ['coffee'],
      types: ['food']
    };

    that.service = new google.maps.places.PlacesService(that.map);

    that.service.nearbySearch(request, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        $.each(results, function(index, item) {
          that.createMarker(item);
        });
      }
    });

  });

  var weatherRequest = locRequest.then(function(response) {
    console.log(response);
    that.location = response.results[0];
    return $.ajax(travelReveal.formWeatherCall(WEATHER_ENDPOINT, that.location.geometry.location, WEATHER_API_KEY));
  });

  weatherRequest.done(function( data ) {
    console.log(that.location);
    var temp = data.main.temp;
    var description = data.weather[0].description;
    var address = that.location.address_components[1].short_name + ' ' + that.location.address_components[4].long_name;
    console.log(address);
    var $container = $('.second-tag');
    $container.find('.tag-title').text(address);
    $container.find('.tag-subtext').text(description + ', ' + temp);
  });

};

travelReveal.appendTags = function(tag) {
  var html =
      '<div class="tag ' + tag.class + '">' +
      '<div class="tag-icon-wrapper">' +
      '<img class="tag-icon" src="' + tag.iconUrl + '"/>' +
      '</div>' +
      '<div class="tag-content">' +
      '<img class="tag-thumbnail" src="' + tag.thumbnailUrl + '"/>' +
      '<div class="tag-text">' +
      '<h3 class="tag-title">' + tag.title + '</h3>' +
      '<p class="tag-subtext">' + tag.subtext + '</p>' +
      '</div>' +
      '<div class="tag-button-wrapper">' +
      '<button class="tag-button" data-modal="' + tag.modal + '">' + tag.cta + '</button>' +
      '</div>' +
      '</div>' +
      '</div>';

  this.$widget.append(html);
  this.$widget.on('mouseover', '.tag-icon-wrapper', function() {
    $(this).addClass('active');
  });
  this.$widget.on('mouseout', '.tag-icon-wrapper', function() {
    $(this).removeClass('active');
  });
  this.$widget.on('click', '.tag-icon-wrapper', function() {
    $(this).siblings('.tag-content').addClass('active');
  });
};

travelReveal.appendModals = function(modal) {
  var html =
    '<div class="modal-overlay"' + modal.attribute + '>' +
    '<div class="modal">' +
    '<div class="modal-close">' + modal.close + '</div>' +
    '<h3 class="modal-title">' + modal.title + '</h3>' +
    '<p class="modal-content">' + modal.content + '</p>' +
    '<a class="modal-button" href="' + modal.link + '">' + modal.cta + '</a>' +
    '</div>'
    '</div>'

  this.$widget.append(html);
  this.$widget.on('click', '.tag-button', function() {
    var modalAttr = $(this).data('modal');
    $('.modal-overlay[data-modal-' + modalAttr + ']').addClass('active');
  });
  this.$widget.on('click', '.modal-close', function() {
    $(this).parents('.modal-overlay').removeClass('active');
  });
};


$(window).load(function() {
  travelReveal.$widget = $('.curalate-widget-image');

  //start it up cap'n
  travelReveal.apiCalls();

  travelReveal.data.forEach(function(tag) {
    travelReveal.appendTags(tag);
  });

  travelReveal.modals.forEach(function(modal) {
    travelReveal.appendModals(modal);
  });
});