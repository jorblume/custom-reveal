var travelReveal = window.travelReveal = {};

travelReveal.data = [
  {
    "class": 'first-tag',
    "iconUrl": "",
    "thumbnailUrl": "",
    "title": "Horse Ranch Mountain",
    "subtext": "Summit - 8,726ft",
    "cta": "Learn More",
    "link": ""
  },
  {
    "class": 'second-tag',
    "iconUrl": "",
    "thumbnailUrl": "",
    "title": "Springdate, Utah",
    "subtext": "Partly Sunny, 63°",
    "cta": "See Forecast",
    "link": "",
  },
  {
    "class": 'third-tag',
    "iconUrl": "",
    "thumbnailUrl": "",
    "title": "Zion National Park",
    "subtext": "nps.gov/zion",
    "cta": "Get Tickets",
    "link": "",
  },
  {
    "class": 'fourth-tag',
    "iconUrl": "",
    "thumbnailUrl": "",
    "title": "SF Baseball Cap",
    "subtext": "$49 | Habiliment",
    "cta": "Shop",
    "link": "",
  },
  {
    "class": 'fifth-tag',
    "iconUrl": "",
    "thumbnailUrl": "",
    "title": "Campus Backpack",
    "subtext": "$99 | Habiliment",
    "cta": "Shop",
    "link": "",
  },
];

$(window).load(function() {
  var $widget = $('.curalate-widget-image');
  
  travelReveal.data.forEach(function(tag) {
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
    
    $widget.append(html);
    $widget.on('mouseover', '.tag-icon-wrapper', function() {
      $(this).addClass('active');
    });
    $widget.on('mouseout', '.tag-icon-wrapper', function() {
      $(this).removeClass('active');
    });
    $widget.on('click', '.tag-icon-wrapper', function() {
      $(this).siblings('.tag-content').addClass('active');
    });
  });

});