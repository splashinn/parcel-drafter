define([], function () {
  var mo = {};

  /**
  * This function is used to get quadrant from quadrant shortcut.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getQuadrant = function (quadrantShortcut) {
    var quadrant;
    switch (quadrantShortcut) {
      case "-1":
        quadrant = "NE";
        break;
      case "-2":
        quadrant = "SE";
        break;
      case "-3":
        quadrant = "SW";
        break;
      case "-4":
        quadrant = "NW";
        break;
    }
    return quadrant;
  };

  /**
  * This function is used to get quadrant shortcut from quadrant.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getQuadrantShortcut = function (quadrant) {
    var quadrantShortcut;
    switch (quadrant) {
      case "NE":
        quadrantShortcut = "-1";
        break;
      case "SE":
        quadrantShortcut = "-2";
        break;
      case "SW":
        quadrantShortcut = "-3";
        break;
      case "NW":
        quadrantShortcut = "-4";
        break;
    }
    return quadrantShortcut;
  };

  /**
  * This function is used to get quadrant shortcut from decimal degree.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getQuadrantShortcutFromDD = function (decimalDegree) {
    var quadrantShortcut;
    if (decimalDegree >= 0 && decimalDegree <= 90) {
      quadrantShortcut = "-1";
    } else if (decimalDegree > 90 && decimalDegree <= 180) {
      quadrantShortcut = "-2";
    } else if (decimalDegree > 180 && decimalDegree <= 270) {
      quadrantShortcut = "-3";
    } else if (decimalDegree > 270 && decimalDegree <= 360) {
      quadrantShortcut = "-4";
    }
    return quadrantShortcut;
  };

  /**
  * This function is used to get south azimuth bearing from north azimuth bearing
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getSouthAzimuthFromNorthAzimuth = function (northAzimuthAngle) {
    var southAzimuthAngle;
    if (northAzimuthAngle > 180) {
      southAzimuthAngle = northAzimuthAngle - 180;
    } else {
      southAzimuthAngle = northAzimuthAngle + 180;
    }
    return southAzimuthAngle;
  };

  /**
  * This function is used to get north azimuth bearing from south azimuth bearing
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getNorthAzimuthFromSouthAzimuth = function (southAzimuthAngle) {
    var northAzimuthAngle;
    if (southAzimuthAngle > 180) {
      northAzimuthAngle = southAzimuthAngle - 180;
    } else {
      northAzimuthAngle = southAzimuthAngle + 180;
    }
    return northAzimuthAngle;
  };

  /**
  * This function is used to get bearing on basis north azimuth.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getNorthAzimuthBearing = function (quadrant, angle) {
    var calculatedAngle;
    switch (quadrant) {
      case "NE":
        calculatedAngle = angle;
        break;
      case "SE":
        calculatedAngle = angle - 180;
        break;
      case "SW":
        calculatedAngle = angle + 180;
        break;
      case "NW":
        calculatedAngle = 360 - angle;
        break;
    }
    return calculatedAngle;
  };

  /**
  * This function is used to convert DMS to DD.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.DMStoDD = function(dmsObj) {
    var DD = parseFloat(dmsObj.degree) + (parseFloat(dmsObj.minutes) / 60) + (
      parseFloat(dmsObj.seconds) / 3600);
    return DD;
  };

  /**
  * This function is used to convert DD to DMS.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.DDtoDMS = function (ddObj) {
    var dmsObj, degree, minutes, seconds;
    degree = parseInt(ddObj.angle, 10);
    minutes = parseInt(((ddObj.angle - degree) * 60), 10);
    seconds = (ddObj.angle - degree - minutes / 60) * 3600;
    dmsObj = {
      "degree": degree,
      "minutes": minutes,
      "seconds": Math.round(seconds)
    };
    if (dmsObj.seconds > 59) {
      dmsObj.seconds = 0;
      dmsObj.minutes++;
      if (dmsObj.minutes > 59) {
        dmsObj.minutes = 0;
        dmsObj.degree++;
      }
    }
    return dmsObj;
  };

  /**
  * This function is used to get bearing details from bearing format 0.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat0 = function (res) {
    var bearingObj = {};
    bearingObj.degree = parseInt(res[1], 10);
    bearingObj.minutes = parseInt(res[2] || 0, 10);
    bearingObj.seconds = parseInt(res[3] || 0, 10);
    bearingObj.quadrant = mo.getQuadrant("-" + res[4]);
    bearingObj.quadrantShortcut = "-" + res[4];
    bearingObj.decimalDegrees = mo.DMStoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "seconds": bearingObj.seconds
    });
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 1.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat1 = function (res) {
    var bearingObj = {};
    bearingObj.degree = parseInt(res[2], 10);
    bearingObj.minutes = parseInt(res[3] || 0, 10);
    bearingObj.seconds = parseInt(res[4] || 0, 10);
    bearingObj.quadrant = res[1] + res[5];
    bearingObj.quadrantShortcut = mo.getQuadrantShortcut(res[1] + res[5]);
    bearingObj.decimalDegrees = mo.DMStoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "seconds": bearingObj.seconds
    });
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 2.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat2 = function (res) {
    var bearingObj = {};
    bearingObj.degree = parseInt(res[2], 10);
    bearingObj.minutes = parseInt(res[3] || 0, 10);
    bearingObj.seconds = parseInt(res[4] || 0, 10);
    bearingObj.quadrant = res[1] + res[5];
    bearingObj.quadrantShortcut = mo.getQuadrantShortcut(res[1] + res[5]);
    bearingObj.decimalDegrees = mo.DMStoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "seconds": bearingObj.seconds
    });
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 3.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat3 = function (res) {
    var bearingObj = {};
    bearingObj.degree = parseInt(res[2], 10);
    bearingObj.minutes = parseInt(res[4] || 0, 10);
    bearingObj.seconds = parseInt(res[5] || 0, 10);
    bearingObj.decimalDegrees = mo.DMStoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "seconds": bearingObj.seconds
    });
    bearingObj.quadrantShortcut = mo.getQuadrantShortcutFromDD(bearingObj.decimalDegrees);
    bearingObj.quadrant = mo.getQuadrant(bearingObj.quadrantShortcut);
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 4.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat4 = function (res) {
    var dmsObj, bearingObj;
    dmsObj = mo.DDtoDMS({
      "angle": res[1]
    });
    bearingObj = {};
    bearingObj.degree = dmsObj.degree;
    bearingObj.minutes = dmsObj.minutes;
    bearingObj.seconds = dmsObj.seconds;
    bearingObj.decimalDegrees = res[1];
    bearingObj.quadrantShortcut = mo.getQuadrantShortcutFromDD(bearingObj.decimalDegrees);
    bearingObj.quadrant = mo.getQuadrant(bearingObj.quadrantShortcut);
    return bearingObj;
  };

  /**
  * This function is used to convert bearing to all possible output formats.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.convertBearingToOutputFormats = function(bearingObj) {
  var dmsObj, bearingFormat, calculatedAngle;
  dmsObj = {};
  bearingFormat = {};
  bearingFormat.qb1DMS = bearingObj.degree + "-" + bearingObj.minutes + "-" +
    bearingObj.seconds + bearingObj.quadrantShortcut;
  bearingFormat.qb2DMS = bearingObj.quadrant.charAt(0) +
    bearingObj.degree + "-" +
    bearingObj.minutes + "-" +
    bearingObj.seconds +
    bearingObj.quadrant.charAt(1);
  bearingFormat.qb3DMS = bearingObj.quadrant.charAt(0) + bearingObj.degree +
    "." + bearingObj.minutes + bearingObj.seconds + bearingObj.quadrant.charAt(
      1);
  bearingFormat.qb3DD = bearingObj.quadrant.charAt(0) + bearingObj.decimalDegrees +
    bearingObj.quadrant.charAt(1);
  // this commented code will be removed once calculation is finalized
  //bearingFormat.naDD = mo.getNorthAzimuthBearing(bearingObj.quadrant, bearingObj.decimalDegrees);
  bearingFormat.naDD = bearingObj.decimalDegrees;
  dmsObj = mo.DDtoDMS({
    "angle": bearingFormat.naDD
  });
  bearingFormat.naDMS = dmsObj.degree + "." + dmsObj.minutes + dmsObj.seconds;
  calculatedAngle = bearingFormat.naDD;
  bearingFormat.saDD = mo.getSouthAzimuthFromNorthAzimuth(calculatedAngle);
  dmsObj = mo.DDtoDMS({
    "angle": bearingFormat.saDD
  });
  bearingFormat.saDMS = dmsObj.degree + "." + dmsObj.minutes + dmsObj.seconds;
  return bearingFormat;
};

  /**
  * This function is used to get bearing details of required format.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingDetailsOfRequiredFormat = function (res, i) {
    var bearingObj = {};
    switch (i) {
      case 0:
        bearingObj = mo.getBearingObjForFormat0(res);
        break;
      case 1:
        bearingObj = mo.getBearingObjForFormat1(res);
        break;
      case 2:
        bearingObj = mo.getBearingObjForFormat2(res);
        break;
      case 3:
        bearingObj = mo.getBearingObjForFormat3(res);
        break;
      case 4:
        bearingObj = mo.getBearingObjForFormat4(res);
        break;
    }
    return mo.convertBearingToOutputFormats(bearingObj);

  };

  /**
  * This function is used to get format of bearing.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.categorizeBearingFormat = function (bearing, planSettings) {
    var formatRegExArr, res, i, returnValue;
    formatRegExArr = [];
    formatRegExArr.push(/^([0-8][0-9]?)(\-([0-5][0-9])\-([0-5][0-9]))?\-([1-4])$/); // 20-25-25-3
    formatRegExArr.push(/([NSns])([0-8][0-9])\-([0-5][0-9])\-([0-5][0-9])([EWew])/); // S20-25-25W
    formatRegExArr.push(/([NSns])([0-8][0-9])\.([0-5][0-9])([0-5][0-9])([EWew])/); // S20.2525W
    formatRegExArr.push(/^(\-?)(0|[1-9]\d?|[12]\d{2}|3[0-5]\d)(\.([0-5][0-9])([0-5][0-9]))?$/); // 200.4859
    formatRegExArr.push(/^((\-?)(3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(\.\d+)?)$/); // 200.9997
    for (i = 0; i < formatRegExArr.length; i++) {
      res = formatRegExArr[i].exec(bearing);
      if (res && res.length > 0) {
        if ((i === 3) && (planSettings.directionOrAngleType === "southAzimuth")) {
          var northAzimuthAngle = mo.getNorthAzimuthFromSouthAzimuth(Number(bearing));
          res = formatRegExArr[i].exec(northAzimuthAngle);
        }
        break;
      }
    }
    if (!res) {
      returnValue = null;
    } else {
      returnValue = mo.getBearingDetailsOfRequiredFormat(res, i);
    }
    return returnValue;
  };

  return mo;
});