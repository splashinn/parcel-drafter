define([
  'esri/geometry/Point',
  'esri/geometry/Polyline',
  'esri/geometry/Polygon',
  'esri/geometry/webMercatorUtils',
  'dojo/Deferred',
  'dojo/_base/array',
  'dojo/_base/lang',
  'esri/geometry/geometryEngine',
  'esri/SpatialReference'
],
  function (
    Point,
    Polyline,
    Polygon,
    webMercatorUtils,
    Deferred,
    array,
    lang,
    geometryEngine,
    SpatialReference) {
    var mo = {};

    mo.getProjectedGeometry = function (geometry, outSR, geometryService) {
      var deferred, result;
      deferred = new Deferred();
      if (webMercatorUtils.canProject(geometry, outSR)) {
        result = webMercatorUtils.project(geometry, outSR);
        deferred.resolve(result);
      } else {
        geometryService.project([geometry], outSR, function (projectedgeometries) {
          result = projectedgeometries[0];
          deferred.resolve(result);
        });
      }
      return deferred.promise;
    };

    mo.getDestinationPoint = function (startPoint, bearing, distance) {
      var startX, startY, angle, endX, endY;
      if (startPoint === null){
        return null;
      }
      startX = startPoint.x;
      startY = startPoint.y;
      //if distance is 0 it means return same point as start point
      if(distance === 0){
        return new Point(startX, startY, startPoint.spatialReference);
      }
      angle = Math.PI / 2 - (bearing * Math.PI / 180);
      //calculate endX and endY
      endX = startX + distance * Math.cos(angle);
      endY = startY + distance * Math.sin(angle);
      //return if endX or endY is not valid
      if (isNaN(endX) || isNaN(endY)) {
        return null;
      }
      return new Point(endX, endY, startPoint.spatialReference);
    };

    mo.getLineBetweenPoints = function (pointsArray) {
      var polyline, pathsArray = [];
      //itterate throug all the points and create paths array
      array.forEach(pointsArray, lang.hitch(this, function (point) {
        pathsArray.push([point.x, point.y]);
      }));
      //check if paths exist and create polyline object form it
      if (pathsArray.length > 0) {
        polyline = new Polyline({
          "paths": [
            pathsArray
          ], "spatialReference": {
            "wkid": 102100
          }
        });
      }
      return polyline;
    };

    mo.getAngleBetweenPoints = function (originPoint, chordPoint) {
      var dx, dy, XByY, YByX;
      dx = chordPoint.x - originPoint.x;
      dy = chordPoint.y - originPoint.y;

      XByY = Math.atan2(Math.abs(dx), Math.abs(dy)) * 180 / Math.PI;
      YByX = Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI;

      if (dy === 0) {
        if (dx === 0) {
          return 0;
        } else if (dx > 0) {
          return 90;
        } else if (dx < 0) {
          return 270;
        }
      } else if (dy > 0) {
        if (dx === 0) {
          return 0;
        } else if (dx > 0) {
          return XByY;
        } else if (dx < 0) {
          return 270 + YByX;
        }
      } else if (dy < 0) {
        if (dx === 0) {
          return 180;
        } else if (dx > 0) {
          return 90 + YByX;
        } else if (dx < 0) {
          return 180 + XByY;
        }
      }
    };

    mo.getDistanceBetweeenPoints = function (startPoint, endPoint) {
      var distance = geometryEngine.distance(startPoint, endPoint, 9001);
      return distance;
    };

    mo.getLengthOfGeometry = function (geometry) {
      var lengthInMeters, simplifiedGeometry;
      simplifiedGeometry = geometryEngine.simplify(geometry);
      lengthInMeters = geometryEngine.planarLength(simplifiedGeometry, 9001);
      return lengthInMeters;
    };

    mo.getAreaOfGeometry = function (geometry) {
      var areaMeters, areaUSSFoot, simplifiedGeometry;
      simplifiedGeometry = geometryEngine.simplify(geometry);
      areaMeters = geometryEngine.planarArea(simplifiedGeometry, 109404);
      areaUSSFoot = geometryEngine.planarArea(simplifiedGeometry, 109406);
      return {"meters": areaMeters, "uSSurveyFeet": areaUSSFoot};
    };

    mo.getPolyLineFromPaths = function (pathsArray) {
      var polyline, i;
      //create polyline in 102100 spatial reference
      polyline = new Polyline(new SpatialReference({ wkid: 102100 }));
      for (i = 0; i < pathsArray.length; i++) {
        polyline.addPath(pathsArray[i]);
      }
      return polyline;
    };

    mo.getPolygonFromPolyLines = function (pathsArray) {
      var ring, polygon, i, j;
      ring = [];
      //create polygon in 102100 spatial reference
      polygon = new Polygon(new SpatialReference({ wkid: 102100 }));
      for (i = 0; i < pathsArray.length; i++) {
        for (j = 0; j < pathsArray[i].length; j++) {
          ring.push(pathsArray[i][j]);
        }
      }
      //to close the polygon add its first point as last point
      ring.push(lang.clone(ring[0]));
      polygon.addRing(ring);
      return polygon;
    };

    mo.getPointsForArc = function (startAngle, endAngle, centerPoint, radius) {
      var i, pointArray = [], angleOfArc, segments, unitAngle, bearingForEachPoint, point;
      angleOfArc = endAngle - startAngle;
      segments = parseInt(angleOfArc, 10);
      unitAngle = Math.abs(angleOfArc) / Math.abs(segments);
      for (i = 0; i < Math.abs(segments) + 1; i++) {
        bearingForEachPoint = startAngle + (unitAngle * i);
        point = mo.getDestinationPoint(centerPoint, bearingForEachPoint, Math.abs(radius));
        if (point) {
          pointArray.push(point);
        }
      }
      return pointArray;
    };

    mo.getArcParam = function (param) {
      var returnValue;
      returnValue = {};
      if (param.distance < 0) { //major arc
        if (param.radius > 0) { // right side of chord
          returnValue.bearing = param.initBearing + 90;
          returnValue.centerPoint = mo.getDestinationPoint(param.chordMidPoint, returnValue.bearing,
           param.centerAndChordDistance);
          returnValue.startAngle = mo.getAngleBetweenPoints(returnValue.centerPoint,
          param.chordEndPoint);
          returnValue.endAngle = mo.getAngleBetweenPoints(returnValue.centerPoint,
          param.chordStartPoint);

        } else { // left side of chord
          returnValue.bearing = param.initBearing - 90;
          returnValue.centerPoint = mo.getDestinationPoint(param.chordMidPoint, returnValue.bearing,
           param.centerAndChordDistance);
          returnValue.startAngle = mo.getAngleBetweenPoints(returnValue.centerPoint,
          param.chordStartPoint);
          returnValue.endAngle = mo.getAngleBetweenPoints(returnValue.centerPoint,
          param.chordEndPoint);

        }
      } else { //minor arc
        if (param.radius > 0) { // right side of chord
          returnValue.bearing = param.initBearing + 90;
          returnValue.centerPoint = mo.getDestinationPoint(param.chordMidPoint, returnValue.bearing,
           param.centerAndChordDistance);
          returnValue.startAngle = mo.getAngleBetweenPoints(returnValue.centerPoint,
          param.chordStartPoint);
          returnValue.endAngle = mo.getAngleBetweenPoints(returnValue.centerPoint,
          param.chordEndPoint);

        } else { // left side of chord
          returnValue.bearing = param.initBearing - 90;
          returnValue.centerPoint = mo.getDestinationPoint(param.chordMidPoint,
          returnValue.bearing, param.centerAndChordDistance);
          returnValue.startAngle = mo.getAngleBetweenPoints(returnValue.centerPoint,
          param.chordEndPoint);
          returnValue.endAngle = mo.getAngleBetweenPoints(returnValue.centerPoint,
          param.chordStartPoint);

        }
      }
      return returnValue;
    };
    return mo;
  });