define([
    'esri/SpatialReference',
    'esri/geometry/Point',
    'esri/geometry/Polyline',
    'esri/geometry/webMercatorUtils',
    'dojo/Deferred',
    'dojo/_base/array',
    'dojo/_base/lang'
  ],
  function(
    SpatialReference,
    Point,
    Polyline,
    webMercatorUtils,
    Deferred,
    array,
    lang) {
    var mo = {};

    mo.getProjectedPoint = function(point, wkid) {
      var outSR, deferred, result;
      outSR = new SpatialReference(wkid);
      deferred = new Deferred();
      if (webMercatorUtils.canProject(point, outSR)) {
        result = webMercatorUtils.project(point, outSR);
        deferred.resolve(result);
      } else {
        this.geometryService.project([point], outSR, function(
          projectedPoints) {
          result = projectedPoints[0];
          deferred.resolve(result);
        });
      }
      return deferred.promise;
    };

    mo.getDestinationPoint = function(startPoint, bearing, distance) {
      if ((distance === 0) || (startPoint === null)) {
        return null;
      }

      var startX = startPoint.x;
      var startY = startPoint.y;
      var angle = Math.PI / 2 - (bearing * Math.PI / 180);

      var endX = startX + distance * Math.cos(angle);
      var endY = startY + distance * Math.sin(angle);

      if (isNaN(endX) || isNaN(endY)) {
        return null;
      }
      return new Point(endX, endY, startPoint.spatialReference);
    };

    mo.getLineBetweenPoints = function(pointsArray) {
      var polyline, pathsArray = [];
      //itterate throug all the points and create paths array
      array.forEach(pointsArray, lang.hitch(this, function(point) {
        pathsArray.push([point.x, point.y]);
      }));
      //check if paths exist and create polyline object form it
      if (pathsArray.length > 0) {
        polyline = new Polyline({
          "paths": [
            pathsArray
          ],
          "spatialReference": {
            "wkid": 102100
          }
        });
      }
      return polyline;
    };
    return mo;
  });