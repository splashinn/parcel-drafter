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
    } else if (decimalDegree > 180 && decimalDegree < 270) {
      quadrantShortcut = "-3";
    } else if (decimalDegree >= 270 && decimalDegree < 360) {
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
  * This function is used to convert DMC to DD.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.DMCtoDD = function (dmcObj) {
    var DD = Math.abs(parseFloat(dmcObj.degree)) + (parseFloat(dmcObj.minutes) / 60) +
      (parseFloat(dmcObj.centiseconds) / 360000);
    if (dmcObj.isNegative) {
      DD = DD * -1;
    }
    return DD;
  };

  /**
 * This function is used to convert DD to DMC.
 * @memberOf widgets/ParcelDrafter/utils
 */
  mo.DDtoDMC = function (ddObj) {
    var dmcObj, degree, minutes, centiseconds;
    degree = Math.floor(ddObj.angle);
    minutes = Math.floor(((ddObj.angle - degree) * 60));
    centiseconds = (ddObj.angle - degree - (minutes / 60)) * 60 * 60 * 100;
    dmcObj = {
      "degree": degree,
      "minutes": minutes,
      "centiseconds": centiseconds
    };
    return dmcObj;
  };

  /**
  * This function is used to get bearing details from bearing format 0.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat0 = function (res) {
    var bearingObj, isNegative;
    bearingObj = {};
    bearingObj.degree = parseInt(res[1], 10);
    bearingObj.minutes = parseInt(res[2] || 0, 10);
    if (res[3]) {
      bearingObj.centiseconds = Math.round(parseFloat(res[3]) * 100);
    } else {
      bearingObj.centiseconds = 0;
    }
    bearingObj.quadrant = mo.getQuadrant("-" + res[4]);
    bearingObj.quadrantShortcut = "-" + res[4];
    if (typeof res[1] === "string") {
      isNegative = res[1].charAt(0) === '-';
    }
    bearingObj.decimalDegrees = mo.DMCtoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "centiseconds": bearingObj.centiseconds,
      "isNegative": isNegative
    });
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 1.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat1 = function (res) {
    var bearingObj, isNegative;
    bearingObj = {};
    bearingObj.degree = parseInt(res[2], 10);
    bearingObj.minutes = parseInt(res[3] || 0, 10);
    if (res[4]) {
      bearingObj.centiseconds = Math.round(parseFloat(res[4]) * 100);
    } else {
      bearingObj.centiseconds = 0;
    }
    bearingObj.quadrant = res[1] + res[5];
    bearingObj.quadrantShortcut = mo.getQuadrantShortcut(res[1] + res[5]);
    if (typeof res[2] === "string") {
      isNegative = res[2].charAt(0) === '-';
    }
    bearingObj.decimalDegrees = mo.DMCtoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "centiseconds": bearingObj.centiseconds,
      "isNegative": isNegative
    });
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 2.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat2 = function (res) {
    var bearingObj, isNegative;
    bearingObj = {};
    bearingObj.degree = parseInt(res[2], 10);
    bearingObj.minutes = parseInt(res[3] || 0, 10);
    if (res[5]) {
      bearingObj.centiseconds = Math.round((parseInt(res[4] || 0, 10) + "." +
        parseInt(res[5] || 0, 10)) * 100);
    } else {
      bearingObj.centiseconds = Math.round((parseInt(res[4] || 0, 10)) * 100);
    }
    bearingObj.quadrant = res[1] + res[6];
    bearingObj.quadrantShortcut = mo.getQuadrantShortcut(res[1] + res[6]);
    if (typeof res[2] === "string") {
      isNegative = res[2].charAt(0) === '-';
    }
    bearingObj.decimalDegrees = mo.DMCtoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "centiseconds": bearingObj.centiseconds,
      "isNegative": isNegative
    });
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 3.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat3 = function (res) {
    var bearingObj, isNegative;
    bearingObj = {};
    bearingObj.degree = parseInt(res[1], 10);
    bearingObj.minutes = parseInt(res[2] || 0, 10);
    if (res[4]) {
      bearingObj.centiseconds = Math.round((parseInt(res[3] || 0, 10) + "." +
        parseInt(res[4] || 0, 10)) * 100);
    } else {
      bearingObj.centiseconds = Math.round((parseInt(res[3] || 0, 10)) * 100);
    }
    if (typeof res[1] === "string") {
      isNegative = res[1].charAt(0) === '-';
    }
    bearingObj.decimalDegrees = mo.DMCtoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "centiseconds": bearingObj.centiseconds,
      "isNegative": isNegative
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
    var dmcObj, bearingObj;
    dmcObj = mo.DDtoDMC({
      "angle": res[1]
    });
    bearingObj = {};
    bearingObj.degree = dmcObj.degree;
    bearingObj.minutes = dmcObj.minutes;
    bearingObj.centiseconds = dmcObj.centiseconds;
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
    var bearingObj, isNegative;
    bearingObj = {};
    bearingObj.degree = parseInt(res[1], 10);
    bearingObj.minutes = parseInt(res[2] || 0, 10);
    if (res[3]) {
      bearingObj.centiseconds = Math.round(parseFloat(res[3]) * 100);
    } else {
      bearingObj.centiseconds = 0;
    }
    if (typeof res[1] === "string") {
      isNegative = res[1].charAt(0) === '-';
    }
    bearingObj.decimalDegrees = mo.DMCtoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "centiseconds": bearingObj.centiseconds,
      "isNegative": isNegative
    });
    bearingObj.quadrantShortcut = mo.getQuadrantShortcutFromDD(bearingObj.decimalDegrees);
    bearingObj.quadrant = mo.getQuadrant(bearingObj.quadrantShortcut);
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 6.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat6 = function (res) {
    var bearingObj, isNegative;
    bearingObj = {};
    bearingObj.degree = parseInt(res[1], 10);
    bearingObj.minutes = parseInt(res[2] || 0, 10);
    if (res[4]) {
      bearingObj.centiseconds = Math.round((parseInt(res[3] || 0, 10) + "." +
        parseInt(res[4] || 0, 10)) * 100);
    } else {
      bearingObj.centiseconds = Math.round((parseInt(res[3] || 0, 10)) * 100);
    }
    bearingObj.quadrantShortcut = res[5];
    bearingObj.quadrant = mo.getQuadrant(bearingObj.quadrantShortcut);
    if (typeof res[1] === "string") {
      isNegative = res[1].charAt(0) === '-';
    }
    bearingObj.decimalDegrees = mo.DMCtoDD({
      "degree": bearingObj.degree,
      "minutes": bearingObj.minutes,
      "centiseconds": bearingObj.centiseconds,
      "isNegative": isNegative
    });
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 7.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat7 = function (res) {
    var bearingObj, dmcObj;
    bearingObj = {};
    bearingObj.decimalDegrees = res[2];
    dmcObj = mo.DDtoDMC({
      "angle": bearingObj.decimalDegrees
    });
    bearingObj.degree = parseInt(dmcObj.degree, 10);
    bearingObj.minutes = parseInt(dmcObj.minutes || 0, 10);
    bearingObj.centiseconds = parseInt(dmcObj.centiseconds || 0, 10);
    bearingObj.quadrant = res[1] + res[3];
    bearingObj.quadrantShortcut = mo.getQuadrantShortcut(bearingObj.quadrant);
    return bearingObj;
  };

  /**
  * This function is used to get bearing details from bearing format 8.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingObjForFormat8 = function (res) {
    var bearingObj, dmcObj;
    bearingObj = {};
    bearingObj.decimalDegrees = res[1];
    dmcObj = mo.DDtoDMC({
      "angle": bearingObj.decimalDegrees
    });
    bearingObj.degree = parseInt(dmcObj.degree, 10);
    bearingObj.minutes = parseInt(dmcObj.minutes || 0, 10);
    bearingObj.centiseconds = parseInt(dmcObj.centiseconds || 0, 10);
    bearingObj.quadrantShortcut = res[2];
    bearingObj.quadrant = mo.getQuadrant(bearingObj.quadrantShortcut);
    return bearingObj;
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
    } else if (decimalDegree > 180 && decimalDegree < 270) {
      quadrantObj.quadrantAngle = decimalDegree - 180;
      quadrantObj.quadrant = "SW";
    } else if (decimalDegree >= 270 && decimalDegree < 360) {
      quadrantObj.quadrantAngle = 360 - decimalDegree;
      quadrantObj.quadrant = "NW";
    }
    return quadrantObj;
  };

  /**
  * This function is used to check whether number is integer or float
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.isInt = function (n) {
    return n % 1 === 0;
  };

  /**
  * This function is used to do rounding calculation for centiseconds
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.roundCentiseconds = function (centiseconds) {
    centiseconds = Number(centiseconds);
    if (!mo.isInt(centiseconds)) {
      centiseconds = parseInt(centiseconds, 10);
    }
    if (centiseconds < 1000) {
      centiseconds = "0" + centiseconds;
    } else if (centiseconds < 100) {
      centiseconds = "00" + centiseconds;
    }
    return centiseconds;
  };

  /**
  * This function is used to convert bearing to all possible output formats.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.convertBearingToOutputFormats = function (bearingObj) {
    var dmcObj, bearingFormat, quadrantObj, naMinutes, naCentiseconds,
      saMinutes, saCentiseconds, saDD, naDD, qbDMCObj, qbMinutes, qbCentiseconds;
    dmcObj = {};
    bearingFormat = {};
    // output for naDD
    naDD = bearingObj.decimalDegrees;
    bearingFormat.naDD = naDD;
    bearingFormat.naDDRound = (Math.round(naDD * 10000)) / 10000;
    // output for naDMC
    naMinutes = bearingObj.minutes < 10 ? "0" + bearingObj.minutes : bearingObj.minutes;
    naCentiseconds = bearingObj.centiseconds;
    // display minutes & centiseconds if its greater than 0
    if ((Number(naMinutes) > 0) && (Number(mo.roundCentiseconds(naCentiseconds)) > 0)) {
      // handled centiseconds while display
      // handled centiseconds while display
      bearingFormat.naDMC = bearingObj.degree + "." + naMinutes +
        mo.roundCentiseconds(naCentiseconds);
      // display minutes & centiseconds if centiseconds is greater than 0
    } else if ((Number(naMinutes) === 0) && (Number(mo.roundCentiseconds(naCentiseconds)) > 0)) {
      // handled centiseconds while display
      // handled centiseconds while display
      bearingFormat.naDMC = bearingObj.degree + "." + naMinutes +
        mo.roundCentiseconds(naCentiseconds);
      // display only minutes if its greater than 0 & centiseconds is 0
    } else if ((Number(naMinutes) > 0) && (Number(mo.roundCentiseconds(naCentiseconds)) === 0)) {
      // handled centiseconds while display
      bearingFormat.naDMC = bearingObj.degree + "." + naMinutes;
      // display only degree if minutes & centiseconds is 0
    } else if ((Number(naMinutes) === 0) && (Number(mo.roundCentiseconds(naCentiseconds)) === 0)) {
      // handled centiseconds while display
      bearingFormat.naDMC = bearingObj.degree;
    }
    // output for qb3DD
    quadrantObj = mo.getQuadrantAngleAndShortcut(naDD);
    bearingFormat.qb3DD = quadrantObj.quadrant.charAt(0) + quadrantObj.quadrantAngle +
      quadrantObj.quadrant.charAt(1);
    bearingFormat.qb3DDRound = quadrantObj.quadrant.charAt(0) +
      ((Math.round(quadrantObj.quadrantAngle * 10000)) / 10000) +
      quadrantObj.quadrant.charAt(1);
    // output for qb3DMC
    qbDMCObj = mo.DDtoDMC({
      "angle": quadrantObj.quadrantAngle
    });
    qbMinutes = qbDMCObj.minutes < 10 ? "0" + qbDMCObj.minutes : qbDMCObj.minutes;
    qbCentiseconds = qbDMCObj.centiseconds;
    // display minutes & centiseconds if its greater than 0
    if ((Number(qbMinutes) > 0) && (Number(mo.roundCentiseconds(qbCentiseconds)) > 0)) {
      // handled centiseconds while display
      // handled centiseconds while display
      bearingFormat.qb3DMC = quadrantObj.quadrant.charAt(0) + qbDMCObj.degree + "." + qbMinutes +
        mo.roundCentiseconds(qbCentiseconds) + quadrantObj.quadrant.charAt(1);
      // display minutes & centiseconds if centiseconds is greater than 0
    } else if ((Number(qbMinutes) === 0) && (Number(mo.roundCentiseconds(qbCentiseconds)) > 0)) {
      // handled centiseconds while display
      // handled centiseconds while display
      bearingFormat.qb3DMC = quadrantObj.quadrant.charAt(0) + qbDMCObj.degree + "." + qbMinutes +
        mo.roundCentiseconds(qbCentiseconds) + quadrantObj.quadrant.charAt(1);
      // display only minutes if its greater than 0 & centiseconds is 0
    } else if ((Number(qbMinutes) > 0) && (Number(mo.roundCentiseconds(qbCentiseconds)) === 0)) {
      // handled centiseconds while display
      bearingFormat.qb3DMC = quadrantObj.quadrant.charAt(0) + qbDMCObj.degree + "." + qbMinutes +
        quadrantObj.quadrant.charAt(1);
      // display only degree if minutes & centiseconds is 0
    } else if ((Number(qbMinutes) === 0) && (Number(mo.roundCentiseconds(qbCentiseconds)) === 0)) {
      // handled centiseconds while display
      bearingFormat.qb3DMC = quadrantObj.quadrant.charAt(0) + qbDMCObj.degree +
        quadrantObj.quadrant.charAt(1);
    }
    // output for saDD
    saDD = mo.getSouthAzimuthFromNorthAzimuth(naDD);
    bearingFormat.saDD = saDD;
    bearingFormat.saDDRound = (Math.round(saDD * 10000)) / 10000;
    // output for saDMC
    dmcObj = mo.DDtoDMC({
      "angle": saDD
    });
    saMinutes = dmcObj.minutes < 10 ? "0" + dmcObj.minutes : dmcObj.minutes;
    saCentiseconds = dmcObj.centiseconds;
    // display minutes & centiseconds if its greater than 0
    if ((Number(saMinutes) > 0) && (Number(mo.roundCentiseconds(saCentiseconds)) > 0)) {
      // handled centiseconds while display
      // handled centiseconds while display
      bearingFormat.saDMC = dmcObj.degree + "." + saMinutes + mo.roundCentiseconds(saCentiseconds);
      // display minutes & centiseconds if centiseconds is greater than 0
    } else if ((Number(saMinutes) === 0) && (Number(mo.roundCentiseconds(saCentiseconds)) > 0)) {
      // handled centiseconds while display
      // handled centiseconds while display
      bearingFormat.saDMC = dmcObj.degree + "." + saMinutes + mo.roundCentiseconds(saCentiseconds);
      // display only minutes if its greater than 0 & centiseconds is 0
    } else if ((Number(saMinutes) > 0) && (Number(mo.roundCentiseconds(saCentiseconds)) === 0)) {
      // handled centiseconds while display
      bearingFormat.saDMC = dmcObj.degree + "." + saMinutes;
      // display only degree if minutes & centiseconds is 0
    } else if ((Number(saMinutes) === 0) && (Number(mo.roundCentiseconds(saCentiseconds)) === 0)) {
      // handled centiseconds while display
      bearingFormat.saDMC = dmcObj.degree;
    }
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
  * This function is used to create array of regex of valid bearings
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getBearingFormatArr = function () {
    var formatRegExArr = [];
    // dd-mm-ss.ss-[1234]  (0)
    formatRegExArr.push({ "regex": /^((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\-(0|[0-5]?\d)\-((?:0|[0-5]?\d)(?:\.\d{1,2})?))?\-([1-4])$/, "type": "degreeMinuteSeconds" });
    // [NS]dd-mm-ss.ss[EW]  (1)
    formatRegExArr.push({ "regex": /^([nNsS])((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\-(0|[0-5]?\d)\-((?:0|[0-5]?\d)(?:\.\d{1,2})?))?([eEwW])$/, "type": "degreeMinuteSeconds" });
    // [NS]dd.mmssss[EW]  (2)
    formatRegExArr.push({ "regex": /^([nNsS])((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\.([0-5]\d)(?:([0-5]\d)(\d{1,2})?)?)?([eEwW])$/, "type": "degreeMinuteSeconds" });
    // dd.mmss[ss]  (3)
    formatRegExArr.push({ "regex": /^((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\.([0-5]\d)(?:([0-5]\d)(\d{1,2})?)?)?$/, "type": "degreeMinuteSeconds" });
    // dd.dddd
    formatRegExArr.push({ "regex": /^((?:(?:\-?)(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(?:\.\d+)?)|(?:\-?)(?:\.\d+))$/, "type": "decimalDegree" });
    // dd-mm-ss[.ss]  (5)
    formatRegExArr.push({ "regex": /^(?:\-)?(3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(?:\-(0|[0-5]?\d)\-((?:0|[0-5]?\d)(?:\.\d{1,2})?))?$/, "type": "degreeMinuteSeconds" });
    // 'dd.mmssss-[1234]  (6)
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
    var bearingObj, northAzimuthDD, dmcObj;
    switch (regExFormatArrIndex) {
      case 0:
        // get DD of user entered bearing
        bearingObj = mo.getBearingObjForFormat0(res);
        // get DD on basis of north azimuth
        northAzimuthDD = mo.getNorthAzimuthAngle(bearingObj.decimalDegrees, "-" + res[4]);
        // get DMC of new DD which is on basis of north azimuth
        dmcObj = mo.DDtoDMC({
          "angle": northAzimuthDD
        });
        // assign new dmc data to existing object
        res[1] = dmcObj.degree;
        res[2] = dmcObj.minutes;
        res[3] = dmcObj.centiseconds;
        return res;
      case 1:
        // get DD of user entered bearing
        bearingObj = mo.getBearingObjForFormat1(res);
        // get DD on basis of north azimuth
        northAzimuthDD = mo.getNorthAzimuthAngle(bearingObj.decimalDegrees, (res[1] + res[5]));
        // get DMC of new DD which is on basis of north azimuth
        dmcObj = mo.DDtoDMC({
          "angle": northAzimuthDD
        });
        // assign new dmc data to existing object
        res[2] = dmcObj.degree;
        res[3] = dmcObj.minutes;
        res[4] = dmcObj.centiseconds;
        return res;
      case 2:
        // get DD of user entered bearing
        bearingObj = mo.getBearingObjForFormat2(res);
        // get DD on basis of north azimuth
        northAzimuthDD = mo.getNorthAzimuthAngle(bearingObj.decimalDegrees, (res[1] + res[6]));
        // get DMC of new DD which is on basis of north azimuth
        dmcObj = mo.DDtoDMC({
          "angle": northAzimuthDD
        });
        // assign new dmc data to existing object
        res[2] = dmcObj.degree;
        res[3] = dmcObj.minutes;
        res[4] = 0;
        res[5] = dmcObj.centiseconds;
        break;
      case 3:
        if ((planSettings.directionOrAngleType === "northAzimuth") ||
          (planSettings.directionOrAngleType === "quadrantBearing")) {
          // get DD of user entered bearing
          bearingObj = mo.getBearingObjForFormat3(res);
          // get DD on basis of north azimuth
          northAzimuthDD = mo.getNorthAzimuthAngle(bearingObj.decimalDegrees, "-1");
          // get DMC of new DD which is on basis of north azimuth
          dmcObj = mo.DDtoDMC({
            "angle": northAzimuthDD
          });
          // assign new dmc data to existing object
          res[1] = dmcObj.degree;
          res[2] = dmcObj.minutes;
          res[3] = 0;
          res[4] = dmcObj.centiseconds;
        } else if (planSettings.directionOrAngleType === "southAzimuth") {
          // get DD of user entered bearing
          bearingObj = mo.getBearingObjForFormat3(res);
          // get DD on basis of north azimuth
          northAzimuthDD = mo.getNorthAzimuthAngle(bearingObj.decimalDegrees, "-3");
          // get DMC of new DD which is on basis of north azimuth
          dmcObj = mo.DDtoDMC({
            "angle": northAzimuthDD
          });
          // assign new dmc data to existing object
          res[1] = dmcObj.degree;
          res[2] = dmcObj.minutes;
          res[3] = 0;
          res[4] = dmcObj.centiseconds;
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
          // get DD of user entered bearing
          bearingObj = mo.getBearingObjForFormat5(res);
          // get DD on basis of north azimuth
          northAzimuthDD = mo.getNorthAzimuthAngle(bearingObj.decimalDegrees, "-3");
          // get DMC of new DD which is on basis of north azimuth
          dmcObj = mo.DDtoDMC({
            "angle": northAzimuthDD
          });
          // assign new dmc data to existing object
          res[1] = dmcObj.degree;
          res[2] = dmcObj.minutes;
          res[3] = dmcObj.centiseconds;
        }
        return res;
      case 6:
        // get DD of user entered bearing
        bearingObj = mo.getBearingObjForFormat6(res);
        // get DD on basis of north azimuth
        northAzimuthDD = mo.getNorthAzimuthAngle(bearingObj.decimalDegrees, res[5]);
        // get DMC of new DD which is on basis of north azimuth
        dmcObj = mo.DDtoDMC({
          "angle": northAzimuthDD
        });
        // assign new dmc data to existing object
        res[1] = dmcObj.degree;
        res[2] = dmcObj.minutes;
        res[3] = 0;
        res[4] = dmcObj.centiseconds;
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
  * This function is used to convert meters to us survey feets.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.metersToUSSurveyFeet = function (meterValue) {
    var feetValue;
    meterValue = Number(meterValue);
    feetValue = meterValue * 3.28083333333;
    return feetValue;
  };

  /**
  * This function is used to convert us survey feets to meters.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.usSurveyFeetToMeters = function (feetValue) {
    var meterValue;
    feetValue = Number(feetValue);
    meterValue = feetValue * 0.304800609601;
    return meterValue;
  };

  /**
  * This function is used to convert feet to US Survey feet
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.feetToUSSurveyFeet = function (feetValue) {
    var usSurveyFeetValue, meterValue;
    feetValue = Number(feetValue);
    meterValue = feetValue * 0.3048;
    usSurveyFeetValue = mo.metersToUSSurveyFeet(meterValue);
    return usSurveyFeetValue;
  };

  /**
  * This function is used to convert feet to Meters
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.feetToMeters = function (feetValue) {
    var meterValue;
    feetValue = Number(feetValue);
    meterValue = feetValue * 0.3048;
    return meterValue;
  };

  /**
  * This function is used to convert us survey feet to feet.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.usSurveyFeetToFeet = function (usSurveyFeetValue) {
    var feetValue, meterValue;
    usSurveyFeetValue = Number(usSurveyFeetValue);
    meterValue = usSurveyFeetValue * 0.304800609601;
    feetValue = meterValue * 3.280839895;
    return feetValue;
  };

  /**
  * This function is used to convert meters to feet.
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.metersToFeet = function (meterValue) {
    var feetValue;
    meterValue = Number(meterValue);
    feetValue = meterValue * 3.280839895;
    return feetValue;
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
      lengthObj.uSSurveyFeetRound = (Math.round(lengthObj.uSSurveyFeet * 10000)) / 10000;
      lengthObj.meters = mo.usSurveyFeetToMeters(res[0]);
      lengthObj.metersRound = (Math.round(lengthObj.meters * 10000)) / 10000;
      lengthObj.feet = mo.usSurveyFeetToFeet(lengthObj.uSSurveyFeet);
      lengthObj.feetRound = (Math.round(lengthObj.feet * 10000)) / 10000;
    } else if (distanceAndLengthUnits === "meters") {
      lengthObj.uSSurveyFeet = mo.metersToUSSurveyFeet(res[0]);
      lengthObj.uSSurveyFeetRound = (Math.round(lengthObj.uSSurveyFeet * 10000)) / 10000;
      lengthObj.meters = Number(res[0]);
      lengthObj.metersRound = (Math.round(lengthObj.meters * 10000)) / 10000;
      lengthObj.feet = mo.metersToFeet(lengthObj.meters);
      lengthObj.feetRound = (Math.round(lengthObj.feet * 10000)) / 10000;
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
    lengthObj.uSSurveyFeetRound = (Math.round(lengthObj.uSSurveyFeet * 10000)) / 10000;
    lengthObj.meters = mo.usSurveyFeetToMeters(res[2]);
    lengthObj.metersRound = (Math.round(lengthObj.meters * 10000)) / 10000;
    lengthObj.feet = mo.usSurveyFeetToFeet(lengthObj.uSSurveyFeet);
    lengthObj.feetRound = (Math.round(lengthObj.feet * 10000)) / 10000;
    return lengthObj;
  };

  /**
  * This function is used to get length details from bearing format 2(meters).
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getLengthObjForFormat2 = function (res) {
    var lengthObj;
    lengthObj = {};
    lengthObj.uSSurveyFeet = mo.metersToUSSurveyFeet(res[2]);
    lengthObj.uSSurveyFeetRound = (Math.round(lengthObj.uSSurveyFeet * 10000)) / 10000;
    lengthObj.meters = Number(res[2]);
    lengthObj.metersRound = (Math.round(lengthObj.meters * 10000)) / 10000;
    lengthObj.feet = mo.metersToFeet(lengthObj.meters);
    lengthObj.feetRound = (Math.round(lengthObj.feet * 10000)) / 10000;
    return lengthObj;
  };

  /**
  * This function is used to get length details from bearing format 3(feet).
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.getLengthObjForFormat3 = function (res) {
    var lengthObj;
    lengthObj = {};
    lengthObj.uSSurveyFeet = mo.feetToUSSurveyFeet(res[2]);
    lengthObj.uSSurveyFeetRound = (Math.round(lengthObj.uSSurveyFeet * 10000)) / 10000;
    lengthObj.meters = mo.feetToMeters(res[2]);
    lengthObj.metersRound = (Math.round(lengthObj.meters * 10000)) / 10000;
    lengthObj.feet = Number(res[2]);
    lengthObj.feetRound = (Math.round(lengthObj.feet * 10000)) / 10000;
    return lengthObj;
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
      if (returnValue && isNaN(returnValue.meters)) {
        returnValue = null;
      }
    }
    return returnValue;
  };

  /**
  * This function is used to get details of length when it is entered in feet
  * @memberOf widgets/ParcelDrafter/utils
  */
  mo.categorizeLengthFormatForFeet = function (length) {
    var formatRegExArr, res, returnValue, i;
    formatRegExArr = [];
    length = length.toString();
    formatRegExArr.push(/^((\-?)((0?|([1-9]\d*))(\.\d+)?))$/); // 46, 46.50
    for (i = 0; i < formatRegExArr.length; i++) {
      res = formatRegExArr[i].exec(length.trim());
      if (res && res.length > 0) {
        break;
      }
    }
    if (!res) {
      returnValue = null;
    } else {
      returnValue = mo.getLengthObjForFormat3(res);
    }
    return returnValue;
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

  return mo;
});