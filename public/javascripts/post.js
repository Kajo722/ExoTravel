// Mapbox map setup
mapboxgl.accessToken = 'pk.eyJ1Ijoia2FqbzcyIiwiYSI6ImNqb2g0ZG5iMTBrOGkza211N2lsdWMzMnMifQ.EhYPwo83KVpsXbrdT2WVPA';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: post.coordinates,
  zoom: 4
});

  // create a HTML element for our location
  var el = document.createElement('div');
  el.className = 'marker';

  // make a marker for location and add to map
  new mapboxgl.Marker(el)
  .setLngLat(post.coordinates)
  .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
  .setHTML('<h3>' + post.name + '</h3><p>' + post.location + '</p>'))
  .addTo(map);


document.getElementById('geocoder').appendChild(geocoder.onAdd(map));