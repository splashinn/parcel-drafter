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
      if (startPoint === null) {
        return null;
      }
      startX = startPoint.x;
      startY = startPoint.y;
      //if distance is 0 it means return same point as start point
      if (distance === 0) {
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
      //as thier could be very small distance betwwen points,
      //geometryEngine will return values in negative exponent which means
      // it is equivalent to zero so removeNegativeExponents from values
      return mo.removeNegativeExponents(distance);
    };

    mo.getLengthOfGeometry = function (geometry) {
      var lengthInMeters, simplifiedGeometry;
      simplifiedGeometry = geometryEngine.simplify(geometry);
      lengthInMeters = geometryEngine.planarLength(simplifiedGeometry, 9001);
      return lengthInMeters;
    };

    mo.getAreaOfGeometry = function (geometry) {
      var simplifiedGeometry, areaConversions;
      simplifiedGeometry = geometryEngine.simplify(geometry);
      areaConversions = {};
      if (simplifiedGeometry) {
        areaConversions.acres = geometryEngine.planarArea(simplifiedGeometry, 109402);
        areaConversions.squareMeters = geometryEngine.planarArea(simplifiedGeometry, 109404);
        areaConversions.squareFeet = geometryEngine.planarArea(simplifiedGeometry, 109405);
        areaConversions.squareUsFeet = geometryEngine.planarArea(simplifiedGeometry, 109406);
      } else {
        areaConversions.acres = 0;
        areaConversions.squareMeters = 0;
        areaConversions.squareFeet = 0;
        areaConversions.squareUsFeet = 0;
      }
      return areaConversions;
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

    mo.getPolygonFromPolyLines = function (pathsArray, addLastPoint, updateLastPoint) {
      var ring, polygon, i, j;
      ring = [];
      //create polygon in 102100 spatial reference
      polygon = new Polygon(new SpatialReference({ wkid: 102100 }));
      for (i = 0; i < pathsArray.length; i++) {
        for (j = 0; j < pathsArray[i].length; j++) {
          ring.push(pathsArray[i][j]);
        }
      }
      if (addLastPoint) {
        ring.push(lang.clone(ring[0]));
      } else if (updateLastPoint) {
        ring[ring.length - 1][0] = ring[0][0];
        ring[ring.length - 1][1] = ring[0][1];
      }
      //if ring is not in clockwise direction reverse the ring
      if (!polygon.isClockwise(ring)) {
        ring.reverse();
      }
      polygon.addRing(ring);
      return polygon;
    };

    mo.getPointsForArc = function (startAngle, endAngle, centerPoint, radius) {
      var i, pointArray = [], angleOfArc, segments, unitAngle, bearingForEachPoint, point;
      angleOfArc = endAngle - startAngle;
      segments = parseInt(angleOfArc, 10);
      //in case if angle is in between 0 to 1, segments parseInt value will be 0,
      //but we would require atleast 1 segment to draw arc
      if (segments <= 0) {
        segments = 1;
      }
      unitAngle = Math.abs(angleOfArc) / Math.abs(segments);
      //unit angle is zero then we cannot calculate points of arc
      if (unitAngle > 0) {
        for (i = 0; i < Math.abs(segments) + 1; i++) {
          bearingForEachPoint = startAngle + (unitAngle * i);
          point = mo.getDestinationPoint(centerPoint, bearingForEachPoint, Math.abs(radius));
          if (point) {
            pointArray.push(point);
          }
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

    mo.removeNegativeExponents = function (num) {
      var returnValue;
      if (num.toString().toLowerCase().split('e-').length > 1) {
        returnValue = 0;
      } else {
        returnValue = num;
      }
      return returnValue;
    };

    mo.getChordLenghtFormArcLength = function (arcLength, radius) {
      var chordLength, arcLengthOfSemiCircle, theta;
      arcLength = Math.abs(arcLength);
      // using formula 'Math.PI * radius' for calculating circumference of a semi-circle.
      arcLengthOfSemiCircle = Math.PI * Math.abs(radius);
      // calculating angle for half of the triangle
      theta = Math.abs(arcLength) / Math.abs(radius);
      // calculate chordLength(perpendicular in our case) using formula
      //sin(theta) = perpendicular / hypotenuse,
      //so, perpendicular = hypotenuse * sin(theta)
      chordLength = Math.abs(radius) * Math.sin(theta / 2);
      if (arcLength <= arcLengthOfSemiCircle) {
        chordLength = chordLength * 2;
      } else {
        chordLength = chordLength * (-2);
      }
      return chordLength;
    };

    mo.getArcLenghtFormChordLength = function (chordLength, radius) {
      var arcLength;
      chordLength = Math.abs(chordLength);
      radius = Math.abs(radius);
      arcLength = (2 * Math.asin(chordLength / (2 * radius)) * radius);
      return arcLength;
    };

    return mo;
  });