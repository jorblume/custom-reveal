var travelReveal = window.travelReveal = {};

travelReveal.data = [
  {
    "class": 'first-tag',
    "iconUrl": "//s3.amazonaws.com/curalate-public-assets/curalate-widget-customizations/custom-homepage-reveal/images/Blog.svg",
    "thumbnailUrl": "//s3.amazonaws.com/curalate-public-assets/curalate-widget-customizations/custom-homepage-reveal/images/coffee.jpg",
    "title": "Horse Ranch Mountain",
    "subtext": "Summit - 8,726ft",
    "cta": "Learn More",
    "link": ""
  },
  {
    "class": 'second-tag',
    "iconUrl": "//s3.amazonaws.com/curalate-public-assets/curalate-widget-customizations/custom-homepage-reveal/images/Cloud.svg",
    "thumbnailUrl": "//s3.amazonaws.com/curalate-public-assets/curalate-widget-customizations/custom-homepage-reveal/images/weather.jpg",
    "title": "Springdate, Utah",
    "subtext": "Partly Sunny, 63°",
    "cta": "See Forecast",
    "link": ""
  },
  {
    "class": 'third-tag',
    "iconUrl": "//s3.amazonaws.com/curalate-public-assets/curalate-widget-customizations/custom-homepage-reveal/images/Ticket.svg",
    "thumbnailUrl": "//s3.amazonaws.com/curalate-public-assets/curalate-widget-customizations/custom-homepage-reveal/images/dest.jpg",
    "title": "Zion National Park",
    "subtext": "nps.gov/zion",
    "cta": "Get Tickets",
    "link": ""
  },
  {
    "class": 'fourth-tag',
    "iconUrl": "//s3.amazonaws.com/curalate-public-assets/curalate-widget-customizations/custom-homepage-reveal/images/Tag.svg",
    "thumbnailUrl": "//s3.amazonaws.com/curalate-public-assets/curalate-widget-customizations/custom-homepage-reveal/images/hat.jpg",
    "title": "SF Baseball Cap",
    "subtext": "$49 | Habiliment",
    "cta": "Shop",
    "link": ""
  },
  {
    "class": 'fifth-tag',
    "iconUrl": "//s3.amazonaws.com/curalate-public-assets/curalate-widget-customizations/custom-homepage-reveal/images/Tag.svg",
    "thumbnailUrl": "//s3.amazonaws.com/curalate-public-assets/curalate-widget-customizations/custom-homepage-reveal/images/backpack.jpg",
    "title": "Campus Backpack",
    "subtext": "$99 | Habiliment",
    "cta": "Shop",
    "link": ""
  }
];

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

travelReveal.formWeatherCall = function(endpoint, data, yql) {
  return endpoint + yql + '"(' + data.lat + ',' + data.lng + ')")&format=json';
};

travelReveal.formLocCall = function(endpoint, data, apiKey) {
  return endpoint + 'latlng=' + data.latitude + ',' + data.longitude + '&key=' + apiKey;
};

travelReveal.apiCalls = function() {
  var that = this;
  var GEOIP_ENDPOINT = '//freegeoip.net/json/';
  var WEATHER_ENDPOINT = '//query.yahooapis.com/v1/public/yql?q=';
  var WEATHER_YQL = 'select * from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text=';
  var GMAPS_API_KEY = 'AIzaSyCDuEW4yfbf4YrP3mrAGxJcvSuCHzQRiUE';
  var GMAPS_LOC_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json?';
  var GMAPS_LOCATION_KEY = 'AIzaSyDFooO1X9-FoPHqXuKiMgB6kae3YNHqJto';

  var request = $.ajax(GEOIP_ENDPOINT, { dataType: "jsonp" }),
      gmapsRequest = request.then(function(response) {
            that.lat = response.latitude;
            that.lon = response.longitude;
            return $.getScript('https://maps.googleapis.com/maps/api/js?key=' + GMAPS_API_KEY + '&libraries=places');
          },
          locRequest = request.then(function(response) {
            return $.ajax(travelReveal.formLocCall(GMAPS_LOC_ENDPOINT, response, GMAPS_LOCATION_KEY));
          })
      );

  gmapsRequest.done(function() {
    var $tag = $('.first-tag .tag-content');

    $tag.append('<div id="map"></div>');
    var loc = new google.maps.LatLng(that.lat, that.lon);
    that.infowindow = new google.maps.InfoWindow();


    $tag.find('.tag-title').text('Coffee Shops');

    var zip = '';

    $tag.find('.tag-subtext').text('Locations Near:' + zip);

    that.map = new google.maps.Map($('#map')[0], {
      center: loc,
      zoom: 12
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
    that.location = response.results[0];
    return $.ajax(travelReveal.formWeatherCall(WEATHER_ENDPOINT, that.location.geometry.location, WEATHER_YQL));
  });

  weatherRequest.done(function( data ) {
    var dataObj = data.query.results.channel;
    var temp = dataObj.item.condition.temp;
    var description = dataObj.item.condition.text;
    var address = that.location.address_components[1].short_name + ' ' + that.location.address_components[4].long_name;
    var $container = $('.second-tag');
    $container.find('.tag-title').text(address);
    $container.find('.tag-subtext').text(description + ', ' + temp);
  });

};

travelReveal.appendHtml = function(tag) {
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
      '<a class="tag-button" href="' + tag.link + '">' + tag.cta + '</a>' +
      '</div>' +
      '</div>' +
      '</div>';

  this.$widget.append(html);

  this.$widget.on('mouseover', '.tag-icon-wrapper', function() {
    $(this).addClass('active');
    $(this).siblings('.tag-content').addClass('active');
  });

  this.$widget.on('mouseleave', '.tag', function() {
    $(this).find('.tag-icon-wrapper').removeClass('active');
    $(this).find('.tag-content').removeClass('active');
  });

};


$(window).load(function() {
  travelReveal.$widget = $('.curalate-widget-image');

  //start it up cap'n
  travelReveal.apiCalls();

  travelReveal.data.forEach(function(tag) {
    travelReveal.appendHtml(tag);
  });

});