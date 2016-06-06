define([], function () {
  var mo = {};

  /**
  * This function is used to get quadrant from quadrant shortcut.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getQuadrant = function (quadrantShortcut) {
    var quadrantObj;
    quadrantObj = { "-1": "NE", "-2": "SE", "-3": "SW", "-4": "NW" };
    return quadrantObj[quadrantShortcut];
  };

  /**
  * This function is used to get quadrant shortcut from quadrant.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getQuadrantShortcut = function (quadrant) {
    var quadrantObj;
    quadrant = quadrant.toUpperCase();
    quadrantObj = { "NE": "-1", "SE": "-2", "SW": "-3", "NW": "-4" };
    return quadrantObj[quadrant];
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
  * This function is used to get quadrant from north azimuth angle
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getQuadrantAngleFromNADD = function (angle) {
    var quadrantInfo;
    quadrantInfo = mo.getQuadrantAngleAndShortcut(angle);
    return quadrantInfo.quadrant.charAt(0) + quadrantInfo.quadrantAngle +
    quadrantInfo.quadrant.charAt(1);
  };

  /**
  * This function is used to get south azimuth bearing from north azimuth bearing
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getSouthAzimuthFromNorthAzimuth = function (northAzimuthAngle) {
    var southAzimuthAngle;
    if (northAzimuthAngle > 180) {
      southAzimuthAngle = northAzimuthAngle - 180;
    } else if (northAzimuthAngle < 180) {
      southAzimuthAngle = northAzimuthAngle + 180;
    } else if (northAzimuthAngle === 180) {
      southAzimuthAngle = 0;
    }
    return southAzimuthAngle;
  };

  /**
  * This function is used to convert DMS to DD.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.DMStoDD = function (dmsObj) {
    var DD = parseFloat(dmsObj.degree) + (parseFloat(dmsObj.minutes) / 60) +
    (parseFloat(dmsObj.seconds) / 3600);
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
    seconds = parseInt(seconds * 100, 10);
    dmsObj = {
      "degree": degree,
      "minutes": minutes,
      "seconds": seconds
    };
    return dmsObj;
  };

  /**
  * This function is used to convert meters to us survey feets.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.metersToFeets = function (meterValue) {
    var feetValue;
    meterValue = Number(meterValue);
    feetValue = meterValue * 3.28083333333;
    return feetValue;
  };

  /**
  * This function is used to convert us survey feets to meters.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.feetsToMeters = function (feetValue) {
    var meterValue;
    feetValue = Number(feetValue);
    meterValue = feetValue * 0.304800609601;
    return meterValue;
  };

  /**
  * This function is used to get bearing details from bearing format 0.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat0 = function (res) {
    var bearingObj, secondsArr;
    bearingObj = {};
    bearingObj.degree = parseInt(res[1], 10);
    bearingObj.minutes = parseInt(res[2] || 0, 10);
    if (res[3]) {
      secondsArr = res[3].split(".");
      if (secondsArr[1]) {
        bearingObj.seconds = parseInt(secondsArr[0], 10) + (parseInt(secondsArr[1], 10) / 100);
        bearingObj.seconds = parseInt(bearingObj.seconds * 100, 10);
      } else if (secondsArr[0]) {
        bearingObj.seconds = secondsArr[0];
      }
    } else {
      bearingObj.seconds = 0;
    }
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
    var bearingObj, secondsArr;
    bearingObj = {};
    bearingObj.degree = parseInt(res[2], 10);
    bearingObj.minutes = parseInt(res[3] || 0, 10);
    if (res[4]) {
      secondsArr = res[4].split(".");
      if (secondsArr[1]) {
        bearingObj.seconds = parseInt(secondsArr[0], 10) + (parseInt(secondsArr[1], 10) / 100);
        bearingObj.seconds = parseInt(bearingObj.seconds * 100, 10);
      } else if (secondsArr[0]) {
        bearingObj.seconds = secondsArr[0];
      }
    } else {
      bearingObj.seconds = 0;
    }
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
    var bearingObj;
    bearingObj = {};
    bearingObj.degree = parseInt(res[2], 10);
    bearingObj.minutes = parseInt(res[3] || 0, 10);
    bearingObj.seconds = parseInt(res[4] || 0, 10);
    if (res[5]) {
      bearingObj.seconds = parseInt(res[4] || 0, 10) + (parseInt(res[5], 10) / 100);
      bearingObj.seconds = parseInt(bearingObj.seconds * 100, 10);
    }
    bearingObj.quadrant = res[1] + res[6];
    bearingObj.quadrantShortcut = mo.getQuadrantShortcut(res[1] + res[6]);
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
    var bearingObj, secondsArr;
    bearingObj = {};
    bearingObj.degree = parseInt(res[1], 10);
    bearingObj.minutes = parseInt(res[2] || 0, 10);
    if (res[3]) {
      secondsArr = res[3].split(".");
      if (secondsArr[1]) {
        bearingObj.seconds = parseInt(secondsArr[0], 10) + (parseInt(secondsArr[1], 10) / 100);
        bearingObj.seconds = parseInt(bearingObj.seconds * 100, 10);
      } else if (secondsArr[0]) {
        bearingObj.seconds = secondsArr[0];
      }
    } else {
      bearingObj.seconds = 0;
    }
    bearingObj.quadrantShortcut = mo.getQuadrantShortcutFromDD(bearingObj.decimalDegrees);
    bearingObj.quadrant = mo.getQuadrant(bearingObj.quadrantShortcut);
    bearingObj.decimalDegrees = mo.DMStoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "seconds": bearingObj.seconds
    });
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
  * This function is used to get bearing details from bearing format 5.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat5 = function (res) {
    var bearingObj, secondsArr;
    bearingObj = {};
    bearingObj.degree = parseInt(res[1], 10);
    bearingObj.minutes = parseInt(res[2] || 0, 10);
    if (res[3]) {
      secondsArr = res[3].split(".");
      if (secondsArr[1]) {
        bearingObj.seconds = parseInt(secondsArr[0], 10) + (parseInt(secondsArr[1], 10) / 100);
        bearingObj.seconds = parseInt(bearingObj.seconds * 100, 10);
      } else if (secondsArr[0]) {
        bearingObj.seconds = secondsArr[0];
      }
    } else {
      bearingObj.seconds = 0;
    }
    bearingObj.quadrantShortcut = mo.getQuadrantShortcutFromDD(bearingObj.decimalDegrees);
    bearingObj.quadrant = mo.getQuadrant(bearingObj.quadrantShortcut);
    bearingObj.decimalDegrees = mo.DMStoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "seconds": bearingObj.seconds
    });
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 6.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat6 = function (res) {
    var bearingObj;
    bearingObj = {};
    bearingObj.degree = parseInt(res[1], 10);
    bearingObj.minutes = parseInt(res[2] || 0, 10);
    bearingObj.seconds = parseInt(res[3] || 0, 10);
    if (res[4]) {
      bearingObj.seconds = parseInt(res[3] || 0, 10) + (parseInt(res[4], 10) / 100);
      bearingObj.seconds = parseInt(bearingObj.seconds * 100, 10);
    }
    bearingObj.quadrantShortcut = res[5];
    bearingObj.quadrant = mo.getQuadrant(bearingObj.quadrantShortcut);
    bearingObj.decimalDegrees = mo.DMStoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "seconds": bearingObj.seconds
    });
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 7.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat7 = function (res) {
    var bearingObj, dmsObj;
    bearingObj = {};
    bearingObj.decimalDegrees = res[2];
    dmsObj = mo.DDtoDMS({
      "angle": bearingObj.decimalDegrees
    });
    bearingObj.degree = parseInt(dmsObj.degree, 10);
    bearingObj.minutes = parseInt(dmsObj.minutes || 0, 10);
    bearingObj.seconds = parseInt(dmsObj.seconds || 0, 10);
    bearingObj.quadrant = res[1] + res[3];
    bearingObj.quadrantShortcut = mo.getQuadrantShortcut(bearingObj.quadrant);
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 8.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat8 = function (res) {
    var bearingObj, dmsObj;
    bearingObj = {};
    bearingObj.decimalDegrees = res[1];
    dmsObj = mo.DDtoDMS({
      "angle": bearingObj.decimalDegrees
    });
    bearingObj.degree = parseInt(dmsObj.degree, 10);
    bearingObj.minutes = parseInt(dmsObj.minutes || 0, 10);
    bearingObj.seconds = parseInt(dmsObj.seconds || 0, 10);
    bearingObj.quadrantShortcut = res[2];
    bearingObj.quadrant = mo.getQuadrant(bearingObj.quadrantShortcut);
    return bearingObj;
  };

  /**
  * This function is used to get length details from bearing format 0.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getLengthObjForFormat0 = function (res, distanceAndLengthUnits) {
    var lengthObj;
    lengthObj = {};
    if (distanceAndLengthUnits === "uSSurveyFeet") {
      lengthObj.uSSurveyFeet = Number(res[0]);
      lengthObj.meters = mo.feetsToMeters(res[0]);
    } else if (distanceAndLengthUnits === "meters") {
      lengthObj.uSSurveyFeet = mo.metersToFeets(res[0]);
      lengthObj.meters = Number(res[0]);
    }
    return lengthObj;
  };

  /**
  * This function is used to get length details from bearing format 1(feets).
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getLengthObjForFormat1 = function (res) {
    var lengthObj;
    lengthObj = {};
    lengthObj.uSSurveyFeet = Number(res[2]);
    lengthObj.meters = mo.feetsToMeters(res[2]);
    return lengthObj;
  };

  /**
  * This function is used to get length details from bearing format 2(meters).
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getLengthObjForFormat2 = function (res) {
    var lengthObj;
    lengthObj = {};
    lengthObj.uSSurveyFeet = mo.metersToFeets(res[2]);
    lengthObj.meters = Number(res[2]);
    return lengthObj;
  };

  /**
  * This function is used to quadrant angle and quadrant from north azimuth angle
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getQuadrantAngleAndShortcut = function (decimalDegree) {
    var quadrantObj = {};
    if (decimalDegree >= 0 && decimalDegree <= 90) {
      quadrantObj.quadrantAngle = decimalDegree;
      quadrantObj.quadrant = "NE";
    } else if (decimalDegree > 90 && decimalDegree <= 180) {
      quadrantObj.quadrantAngle = 180 - decimalDegree;
      quadrantObj.quadrant = "SE";
    } else if (decimalDegree > 180 && decimalDegree <= 270) {
      quadrantObj.quadrantAngle = decimalDegree - 180;
      quadrantObj.quadrant = "SW";
    } else if (decimalDegree > 270 && decimalDegree <= 360) {
      quadrantObj.quadrantAngle = 360 - decimalDegree;
      quadrantObj.quadrant = "NW";
    }
    return quadrantObj;
  };

  /**
  * This function is used to convert bearing to all possible output formats.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.convertBearingToOutputFormats = function (bearingObj) {
    var dmsObj, bearingFormat, quadrantObj, quadarantDD;
    dmsObj = {};
    bearingFormat = {};
    bearingFormat.naDD = bearingObj.decimalDegrees;
    bearingFormat.naDMS = bearingObj.degree + "-" + bearingObj.minutes + "-" + bearingObj.seconds;
    quadrantObj = mo.getQuadrantAngleAndShortcut(bearingObj.degree);
    bearingFormat.qb3DMS = quadrantObj.quadrant.charAt(0) + quadrantObj.quadrantAngle + "." +
    bearingObj.minutes + bearingObj.seconds + quadrantObj.quadrant.charAt(1);
    quadarantDD = mo.DMStoDD({
      "degree": quadrantObj.quadrantAngle,
      "minutes": bearingObj.minutes,
      "seconds": bearingObj.seconds
    });
    bearingFormat.qb3DD = quadrantObj.quadrant.charAt(0) + quadarantDD +
    quadrantObj.quadrant.charAt(1);
    bearingFormat.saDD = mo.getSouthAzimuthFromNorthAzimuth(bearingFormat.naDD);
    dmsObj = mo.DDtoDMS({
      "angle": bearingFormat.saDD
    });
    bearingFormat.saDMS = dmsObj.degree + "." + dmsObj.minutes + dmsObj.seconds;
    return bearingFormat;
  };

  /**
  * This function is used to get bearing details from different formats
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
      case 5:
        bearingObj = mo.getBearingObjForFormat5(res);
        break;
      case 6:
        bearingObj = mo.getBearingObjForFormat6(res);
        break;
      case 7:
        bearingObj = mo.getBearingObjForFormat7(res);
        break;
      case 8:
        bearingObj = mo.getBearingObjForFormat8(res);
        break;
    }
    return mo.convertBearingToOutputFormats(bearingObj);

  };

  /**
  * This function is used to get length details of required format.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getLengthOfRequiredFormat = function (res, i, distanceAndLengthUnits) {
    var lengthObj = {};
    switch (i) {
      case 0:
        lengthObj = mo.getLengthObjForFormat0(res, distanceAndLengthUnits);
        break;
      case 1:
        lengthObj = mo.getLengthObjForFormat1(res);
        break;
      case 2:
        lengthObj = mo.getLengthObjForFormat2(res);
        break;
    }
    return lengthObj;
  };

  /**
  * This function is used to create array of regex of valid bearings
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingFormatArr = function () {
    var formatRegExArr = [];
    // dd-mm-ss.ss-[1234]
    formatRegExArr.push({ "regex": /^((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\-(0|[0-5]?\d)\-((?:0|[0-5]?\d)(?:\.\d{1,2})?))?\-([1-4])$/, "type": "degreeMinuteSeconds" });
    // [NS]dd-mm-ss.ss[EW]
    formatRegExArr.push({ "regex": /^([nNsS])(?:\-)?(3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(?:\-(0|[0-5]?\d)\-((?:0|[0-5]?\d)(?:\.\d{1,2})?))?([eEwW])$/, "type": "degreeMinuteSeconds" });
    // [NS]dd.mmssss[EW]
    formatRegExArr.push({ "regex": /^([nNsS])((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\.([0-5]\d)(?:([0-5]\d)(\d{1,2})?)?)?([eEwW])$/, "type": "degreeMinuteSeconds" });
    // dd.mmss[ss]
    formatRegExArr.push({ "regex": /^((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\.([0-5]\d)(?:([0-5]\d)(\d{1,2})?)?)?$/, "type": "degreeMinuteSeconds" });
    // dd.dddd
    formatRegExArr.push({ "regex": /^((?:(?:\-?)(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(?:\.\d+)?)|(?:\-?)(?:\.\d+))$/, "type": "decimalDegree" });
    // dd-mm-ss[.ss]
    formatRegExArr.push({ "regex": /^(?:\-)?(3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(?:\-(0|[0-5]?\d)\-((?:0|[0-5]?\d)(?:\.\d{1,2})?))?$/, "type": "degreeMinuteSeconds" });
    // 'dd.mmssss-[1234]
    formatRegExArr.push({ "regex": /^((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\.([0-5]\d)(?:([0-5]\d)(\d{1,2})?)?)?(\-[1-4])$/, "type": "degreeMinuteSeconds" });
    // [NS]dd.dddd[EW]
    formatRegExArr.push({ "regex": /^([nNsS])((?:(?:\-?)(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(?:\.\d+)?)|(?:\-?)(?:\.\d+))([eEwW])$/, "type": "decimalDegree" });
    // dd.dddd-[1234]
    formatRegExArr.push({ "regex": /^((?:(?:\-?)(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(?:\.\d+)?)|(?:\-?)(?:\.\d+))(\-[1-4])$/, "type": "decimalDegree" });
    return formatRegExArr;
  };

  /**
  * This function is used to re-calculate degree on basis of quadrant
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getNorthAzimuthAngle = function (angle, quadrant) {
    var degree;
    quadrant = quadrant.toUpperCase();
    switch (quadrant) {
      case "-1":
      case "NE":
        degree = (Number(angle) + 360) % 360;
        return degree;
      case "-2":
      case "SE":
        degree = (-(Number(angle)) + 180 + 360) % 360;
        return degree;
      case "-3":
      case "SW":
        degree = (Number(angle) + 180 + 360) % 360;
        return degree;
      case "-4":
      case "NW":
        degree = (-(Number(angle)) + 360) % 360;
        return degree;
    }
  };

  /**
  * This function is used to convert bearing to north azimuth.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.convertBearingToNorthAzimuth = function (res, regExFormatArrIndex, planSettings) {
    switch (regExFormatArrIndex) {
      case 0:
        res[1] = mo.getNorthAzimuthAngle(res[1], "-" + res[4]);
        return res;
      case 1:
        res[2] = mo.getNorthAzimuthAngle(res[2], (res[1] + res[5]));
        return res;
      case 2:
        res[2] = mo.getNorthAzimuthAngle(res[2], (res[1] + res[6]));
        break;
      case 3:
        if ((planSettings.directionOrAngleType === "northAzimuth") ||
        (planSettings.directionOrAngleType === "quadrantBearing")) {
          res[1] = mo.getNorthAzimuthAngle(res[1], "-1");
        } else if (planSettings.directionOrAngleType === "southAzimuth") {
          res[1] = mo.getNorthAzimuthAngle(res[1], "-3");
        }
        return res;
      case 4:
        if ((planSettings.directionOrAngleType === "northAzimuth") ||
        (planSettings.directionOrAngleType === "quadrantBearing")) {
          res[1] = mo.getNorthAzimuthAngle(res[1], "-1");
        } else if (planSettings.directionOrAngleType === "southAzimuth") {
          res[1] = mo.getNorthAzimuthAngle(res[1], "-3");
        }
        break;
      case 5:
        if (planSettings.directionOrAngleType === "northAzimuth") {
          res[1] = mo.getNorthAzimuthAngle(res[1], "-1");
        } else if (planSettings.directionOrAngleType === "southAzimuth") {
          res[1] = mo.getNorthAzimuthAngle(res[1], "-3");
        }
        return res;
      case 6:
        res[1] = mo.getNorthAzimuthAngle(res[1], res[5]);
        return res;
      case 7:
        res[2] = mo.getNorthAzimuthAngle(res[2], (res[1] + res[3]));
        break;
      case 8:
        res[1] = mo.getNorthAzimuthAngle(res[1], res[2]);
        break;
    }
    return res;
  };

  /**
  * This function is used to get format of bearing.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.categorizeBearingFormat = function (bearing, planSettings) {
    var formatRegExArr, res, i, returnValue;
    bearing = bearing.toString();
    formatRegExArr = mo.getBearingFormatArr();
    for (i = 0; i < formatRegExArr.length; i++) {
      if (formatRegExArr[i].type === planSettings.directionOrAngleUnits) {
        res = formatRegExArr[i].regex.exec(bearing.trim());
        if (res && res.length > 0) {
          res = mo.convertBearingToNorthAzimuth(res, i, planSettings);
          break;
        }
      }
    }
    if (!res) {
      returnValue = null;
    } else {
      returnValue = mo.getBearingDetailsOfRequiredFormat(res, i);
    }
    return returnValue;
  };

  /**
  * This function is used to get format of distance.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.categorizeLengthFormat = function (length, distanceAndLengthUnits) {
    var formatRegExArr, res, returnValue, i;
    formatRegExArr = [];
    length = length.toString();
    formatRegExArr.push(/^((\-?)((0?|([1-9]\d*))(\.\d+)?))$/); // 46, 46.50
    formatRegExArr.push(/^(((\-?)((0?|([1-9]\d*))(\.\d+)?))(ft|FT|fT|Ft))$/); // 46ft, 46FT, 46fT, 46Ft
    formatRegExArr.push(/^(((\-?)((0?|([1-9]\d*))(\.\d+)?))(m|M))$/); // 46m, 46M
    for (i = 0; i < formatRegExArr.length; i++) {
      res = formatRegExArr[i].exec(length.trim());
      if (res && res.length > 0) {
        break;
      }
    }
    if (!res) {
      returnValue = null;
    } else {
      returnValue = mo.getLengthOfRequiredFormat(res, i, distanceAndLengthUnits);
    }
    return returnValue;
  };

  return mo;
});