'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'gc.geo.fields',
])
.controller('View1Ctrl', ['$scope', '$timeout', '$compile',
    function($scope, $timeout, $compile) {
        
        $scope.selectedAddress = '';
        $scope.notAcceptedGeoTypes = ['street_address', 'route', 'intersection', 'premise', 'subpremise', 'natural_feature', 'airport', 'park'];
        
        $scope.codeAddress = function(country, state, city) {
            var address = (city.length > 0 ? city + ", " : '') + (state.length > 0 ? state + ", " : '') + country;
            $scope.geocoder.geocode( { 'address': address }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var accepted = true;
                    for(var i=0; i<results.length; ++i) {
                        accepted = true;

                        //check that the returned address was not a street or something like that, it must be a locality of some sort
                        for(var j=0; j<results[i].types.length; ++j) {
                            if($scope.notAcceptedGeoTypes.indexOf(results[i].types[j]) !== -1) {
                                accepted = false;
                                break;
                            }
                        }

                        if(accepted === false) continue;

                        $scope.map.panTo(results[i].geometry.location);
                        if(results[i].geometry.viewport) 
                            $scope.map.fitBounds(results[i].geometry.viewport);
                        else 
                            $scope.map.setZoom(14);                                     
                    }

                    //ask again, this time without the city or state until we get a locality. If the state is already empty then 
                    //we failed because asking with only the country name didn't work 
                    if(accepted === false && state.length > 0) {
                        $scope.codeAddress(country, city.length > 0 ? state : '', '');
                    }
                } else {
                    if(state.length > 0 && status === "ZERO_RESULTS") {
                        $scope.codeAddress(country, city.length > 0 ? state : '', '');
                    } else
                        alert("Geocode was not successful for the following reason: " + status);
                }
            });
        };


        $scope.getAddress = function(latLng) {
            $scope.geocoder.geocode({'location': latLng}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var streetNumber = "";
                var streetName = "";

                if(results.length > 0) {
                    //results[0] is google's best guess
                    for(var i=0; i<results[0].address_components.length; ++i) {
                        if(results[0].address_components[i].types[0] === "street_number") {
                            streetNumber = results[0].address_components[i].long_name;
                        } else if(results[0].address_components[i].types[0] === "route") {
                            streetName = results[0].address_components[i].long_name;
                        }
                    }
                    $scope.map.setZoom(17);
                    //console.log(results);return;

                    //you need to add the html content in the infowindow compiling it first if you want the angular directive inside it to work
                    var infoWindowContent = '<div><strong>' + streetName + ' ' + streetNumber + '</strong><br><br><button ng-click="selectAsAddress()" type="button" class="btn btn-primary">Choose this address.</button></div>';
                    var compiled = $compile(infoWindowContent)($scope);
                    $scope.$apply();
                    $scope.infowindow.setContent(compiled[0]);
                    $scope.infowindow.open($scope.map, $scope.marker);

                    $scope.selectedAddress = streetName + " " + streetNumber;
                } else {
                    window.alert('No results found');
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }
          });
        };

        $scope.init = function () {
            
            //create geocoder service
            $scope.geocoder = new google.maps.Geocoder();

            //create map
            $scope.map = new google.maps.Map(document.getElementById('map_canvas'), {
                      zoom: 2,
                      center: {lat: 0, lng: 0}
            });

            //infowindow and marker used by the autocomplete and the click-on-map functionalities
            $scope.infowindow = new google.maps.InfoWindow();
            $scope.marker = new google.maps.Marker({
                map: $scope.map,
                anchorPoint: new google.maps.Point(0, -29)
            });

            //autocomplete
            var input = (document.getElementById('pac-input'));
            var defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(-33.8902, 151.1759),
            new google.maps.LatLng(-33.8474, 151.2631));
            var options = { bounds: defaultBounds, types: [] };
            var autocomplete = new google.maps.places.Autocomplete(input, options);
            autocomplete.bindTo('bounds', $scope.map);

            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                $scope.infowindow.close();
                $scope.marker.setVisible(false);

                var place = autocomplete.getPlace();

                if (!place.geometry) {
                  window.alert("Autocomplete's returned place contains no geometry");
                  return;
                }

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                  $scope.map.fitBounds(place.geometry.viewport);
                } else {
                  $scope.map.setCenter(place.geometry.location);
                  $scope.map.setZoom(17);
                }
                $scope.marker.setIcon(({
                  url: place.icon,
                  size: new google.maps.Size(71, 71),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(17, 34),
                  scaledSize: new google.maps.Size(35, 35)
                }));
                $scope.marker.setPosition(place.geometry.location);
                $scope.marker.setVisible(true);

                //you need to add the html content in the infowindow compiling it first if you want the angular directive inside it to work
                var infoWindowContent = '<div><strong>' + place.name + '</strong><br><br><button ng-click="selectAsAddress()" type="button">Choose this address.</button></div>';
                var compiled = $compile(infoWindowContent)($scope);
                $scope.$apply();
                $scope.infowindow.setContent(compiled[0]);
                $scope.infowindow.open($scope.map, $scope.marker);

                $scope.selectedAddress = place.name;
            });

            //click on map
            google.maps.event.addListener($scope.map, 'click', function(e) {
                $scope.infowindow.close();
                $scope.marker.setVisible(true);
                $scope.marker.setPosition(e.latLng);
                $scope.map.panTo(e.latLng);
                $scope.getAddress(e.latLng);
            });
            
            $scope.$watchGroup(['country', 'state', 'city'], function() {
                if(typeof $scope.country !== 'undefined' && $scope.country.length > 0)
                    $scope.codeAddress($scope.country, $scope.state, $scope.city);
            });
        };

        $scope.selectAsAddress = function() {
            $scope.address = $scope.selectedAddress;
            $scope.infowindow.close();
            $scope.marker.setVisible(false);
        };

        $timeout($scope.init);
}]);


function onGoogleReady() 
{
    angular.bootstrap(document, ['myApp']);
}