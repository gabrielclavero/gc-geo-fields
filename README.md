# README

## gc-geo-fields

This project is an angular module you can use to quickly add geographical location fields to your web forms. 
It also contains a demo you can check to see the component in action.

## About the JSON data

The geographical data provided in this project in several JSON files was extracted from www.geonames.org. 
You can take a look at the script that outputs the json files in the World Geo Parser project [https://github.com/gabrielclavero/world-geo-parser](https://github.com/gabrielclavero/world-geo-parser). 
Both the World Geo Parser project and www.geonames.org content are licensed under a Creative Commons Attribution 3.0 License [http://creativecommons.org/licenses/by/3.0/](http://creativecommons.org/licenses/by/3.0/) 

## Usage

You can get it from [Bower](http://bower.io/)

```sh
bower install gc-geo-fields
```

Load the script files in your application:

```html
<script src="bower_components/gc-geo-fields/dist/geofields.js"></script>
```

Add the specific module to your dependencies:

```javascript
angular.module('myApp', ['gc.geo.fields', ...])
```

Make sure you leave the json data folder and the template.html file in the same location than the geofields.js file. 