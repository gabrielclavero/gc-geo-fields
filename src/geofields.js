/**
*
* Geo Fields
* Author: Gabriel Clavero
* Homepage: https://github.com/gabrielclavero/gc-geo-fields
*
*/

'use strict';

var scripts = document.getElementsByTagName("script")
var currentScriptPath = scripts[scripts.length-1].src;

angular.module('gc.geo.fields', [])
.constant('PATH', currentScriptPath.replace('geofields.js', ''))
.directive('gcGeoFields', ['$http', 'PATH', function($http, PATH) {
    function link(scope) {
        
        var countryNameToIso = [];
        var stateNameToCode = [];
        scope.countries = [];
        scope.states = [];
        scope.cities = [];
        scope.country = '';
        scope.state = '';
        scope.city = '';
        
        function loadCountryList(initialValue) {
            $http.get(PATH+'json/geodata/countries.json').then(function (res) {
                var tmp = [];
                for (var country in res.data) {
                    tmp.push(country);
                }
                
                countryNameToIso = res.data;
                scope.countries = {type: "select", name: "Countries", value: initialValue, values: tmp};
                
                if(typeof initialValue !== "undefined" && initialValue.length > 0) {
                    loadStateList(initialValue, scope.state);
                }
            }).catch(function (res, status) {
                console.log("Error retrieving JSON data!");
            });
        }
        
        function loadStateList(country, initialValue) {           
            $http.get(PATH+'json/geodata/countries/'+countryNameToIso[country]+'.json').then(function (res) {
                stateNameToCode = res.data;
                
                var tmp = [];
                for (var state in res.data) {
                    tmp.push(state);
                }

                scope.states = {type: "select", name: "States", value: initialValue, values: tmp};
                
                if(typeof initialValue !== "undefined" && initialValue.length > 0) {
                    loadCityList(initialValue, scope.city);
                }
            }).catch(function (res, status) {
                console.log("Error retrieving JSON data!");
            });
        }
        
        function loadCityList(state, initialValue) {
            $http.get(PATH+'json/geodata/countries/states/'+countryNameToIso[scope.countries.value]+'.'+stateNameToCode[state]+'.json').then(function (res) {
                scope.cities = {type: "select", name: "Cities", value: initialValue, values: res.data};
            }).catch(function (res, status) {
                console.log("Error retrieving JSON data!");
            });
        }
        
        scope.changeCountry = function (country) {
            if(scope.country === country) return;

            scope.country = country;
            scope.state = '';
            scope.city = '';
            scope.states = [];
            scope.cities = [];

            loadStateList(country, '');
        };

        scope.changeState = function (state) {
            if(scope.state === state) return;

            scope.state = state;
            scope.city = '';
            scope.cities = [];
            
            loadCityList(state, '');
        };

        scope.changeCity = function (city) {
            if(scope.city === city) return;

            scope.city = scope.cities.value;
        };
        
        loadCountryList();
    }
    
    return {
        link: link,
        templateUrl: PATH+'template.html'
    };
}]);
