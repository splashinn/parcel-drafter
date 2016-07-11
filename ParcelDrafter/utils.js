define([
  './math.min'
],
  function (
    math
  ) {
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
    * This is used to identify the quadrant that a particular angle is in while converting to
    * a quadrant bearing.
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
    * This function is used to get bearing in quadrant format from north azimuth bearing format.
    * It is used during screen digitization.
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
        southAzimuthAngle = math.add(math.bignumber(northAzimuthAngle), math.bignumber(-180));
      } else if (northAzimuthAngle < 180) {
        southAzimuthAngle = math.add(math.bignumber(northAzimuthAngle), math.bignumber(180));
        // == is used just to math the data & not its type coz northAzimuthAngle angle is having
        // dataType as bignumber
      } else if (northAzimuthAngle == 180) { // jshint ignore:line
        southAzimuthAngle = math.bignumber(0);
      }
      return southAzimuthAngle;
    };

    /**
    * This function is used to convert DMC to DD.
    * @memberOf widgets/ParcelDrafter/utils
    */
    mo.DMCtoDD = function (dmcObj) {
      var degreeValue, minutesValue, centisecondsValue, ddMinutes, ddCentiseconds, DD;
      degreeValue = math.bignumber(Math.abs(parseFloat(dmcObj.degree)));
      minutesValue = math.bignumber(parseFloat(dmcObj.minutes));
      centisecondsValue = math.bignumber(parseFloat(dmcObj.centiseconds));
      ddMinutes = math.divide(minutesValue, math.bignumber(60));
      ddCentiseconds = math.divide(centisecondsValue, math.bignumber(360000));
      DD = math.add(degreeValue, math.add(ddMinutes, ddCentiseconds));
      if (dmcObj.isNegative) {
        DD = math.multiply(DD, math.bignumber(-1));
      }
      return DD;
    };

    /**
    * This function is used to convert DD to DMC.
    * @memberOf widgets/ParcelDrafter/utils
    */
    mo.DDtoDMC = function (ddObj) {
      var dmcObj, degree, minutes, centiseconds, totalCentiseconds, totalMins;
      totalCentiseconds = math.multiply(math.bignumber(ddObj.angle), math.bignumber(360000));
      centiseconds = math.mod(totalCentiseconds, math.bignumber(6000));
      if ((Math.round(centiseconds * 1) - (centiseconds * 1)) < 1e-2) {
        centiseconds = math.round(centiseconds);
        // == is used just to math the data & not its type coz centiseconds is having
        // dataType as bignumber
        if (centiseconds == 6000) { // jshint ignore:line
          centiseconds = math.bignumber(0);
        }
      }
      totalMins = math.divide(math.add(totalCentiseconds,
        math.multiply(math.bignumber(-1), centiseconds)), math.bignumber(6000));
      minutes = math.mod(totalMins, math.bignumber(60));
      if ((Math.round(minutes * 1) - (minutes * 1)) < 1e-2) {
        minutes = math.round(minutes);
        // == is used just to math the data & not its type coz minutes is having
        // dataType as bignumber
        if (minutes == 60) { // jshint ignore:line
          minutes = math.bignumber(0);
        }
      }
      degree = math.divide(math.add(totalMins,
        math.multiply(math.bignumber(-1), minutes)), math.bignumber(60));
      if ((Math.round(degree * 1) - (degree * 1)) < 1e-2) {
        degree = math.round(degree);
      }
      dmcObj = {
        "degree": Math.abs(degree * 1),
        "minutes": minutes * 1,
        "centiseconds": centiseconds * 1
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
        // convert seconds to centiseconds
        bearingObj.centiseconds = Math.round(parseFloat(res[3]) * 100);
      } else {
        // assign centiseconds
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
        // convert seconds to centiseconds
        bearingObj.centiseconds = Math.round(parseFloat(res[4]) * 100);
      } else {
        // assign centiseconds
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
        // assign centiseconds
        bearingObj.centiseconds = parseInt(res[5] || 0, 10);
      } else {
        // convert seconds to centiseconds
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
        // assign centiseconds
        bearingObj.centiseconds = parseInt(res[4] || 0, 10);
      } else {
        // convert seconds to centiseconds
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
        // convert seconds to centiseconds
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
        // assign centiseconds
        bearingObj.centiseconds = parseInt(res[4] || 0, 10);
      } else {
        // convert seconds to centiseconds
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
        quadrantObj.quadrantAngle = math.add(math.bignumber(180),
          math.multiply(decimalDegree, math.bignumber(-1)));
        quadrantObj.quadrant = "SE";
      } else if (decimalDegree > 180 && decimalDegree < 270) {
        quadrantObj.quadrantAngle = math.add(decimalDegree, math.bignumber(-180));
        quadrantObj.quadrant = "SW";
      } else if (decimalDegree >= 270 && decimalDegree < 360) {
        quadrantObj.quadrantAngle = math.add(math.bignumber(360),
          math.multiply(decimalDegree, math.bignumber(-1)));
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
    * This function is used to normalize seconds & centiseconds
    * @memberOf widgets/ParcelDrafter/utils
    */
    mo.normalizeSecValue = function (value) {
      var secondsAndCentisecondsArr, revisedValue;
      secondsAndCentisecondsArr = value.toString().split(".");
      // seconds
      if (secondsAndCentisecondsArr[0].toString().length === 1) {
        secondsAndCentisecondsArr[0] = "0" + secondsAndCentisecondsArr[0];
      }
      // centiseconds
      if (secondsAndCentisecondsArr[1]) {
        if (secondsAndCentisecondsArr[1].toString().length === 1) {
          secondsAndCentisecondsArr[1] = secondsAndCentisecondsArr[1] + "0";
        }
        revisedValue = secondsAndCentisecondsArr[0] + "." + secondsAndCentisecondsArr[1];
      } else {
        revisedValue = secondsAndCentisecondsArr[0];
      }
      return revisedValue;
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
        bearingFormat.naDMC = bearingObj.degree + "-" + naMinutes + "-" +
          mo.normalizeSecValue((Number(mo.roundCentiseconds(naCentiseconds)) / 100));
        // display minutes & centiseconds if centiseconds is greater than 0
      } else if ((Number(naMinutes) === 0) && (Number(mo.roundCentiseconds(naCentiseconds)) > 0)) {
        bearingFormat.naDMC = bearingObj.degree + "-" + naMinutes + "-" +
          mo.normalizeSecValue((Number(mo.roundCentiseconds(naCentiseconds)) / 100));
        // display only minutes if its greater than 0 & centiseconds is 0
      } else if ((Number(naMinutes) > 0) &&
        (Number(mo.roundCentiseconds(naCentiseconds)) === 0)) {
        bearingFormat.naDMC = bearingObj.degree + "-" + naMinutes + "-" + "00";
        // display only degree if minutes & centiseconds is 0
      } else if ((Number(naMinutes) === 0) &&
        (Number(mo.roundCentiseconds(naCentiseconds)) === 0)) {
        bearingFormat.naDMC = bearingObj.degree + "-" + "00" + "-" + "00";
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
        bearingFormat.qb3DMC = quadrantObj.quadrant.charAt(0) +
          qbDMCObj.degree + "-" + qbMinutes + "-" +
          mo.normalizeSecValue((Number(mo.roundCentiseconds(qbCentiseconds)) / 100)) +
          quadrantObj.quadrant.charAt(1);
        // display minutes & centiseconds if centiseconds is greater than 0
      } else if ((Number(qbMinutes) === 0) && (Number(mo.roundCentiseconds(qbCentiseconds)) > 0)) {
        bearingFormat.qb3DMC = quadrantObj.quadrant.charAt(0) +
          qbDMCObj.degree + "-" + qbMinutes + "-" +
          mo.normalizeSecValue((Number(mo.roundCentiseconds(qbCentiseconds)) / 100)) +
          quadrantObj.quadrant.charAt(1);
        // display only minutes if its greater than 0 & centiseconds is 0
      } else if ((Number(qbMinutes) > 0) && (Number(mo.roundCentiseconds(qbCentiseconds)) === 0)) {
        bearingFormat.qb3DMC = quadrantObj.quadrant.charAt(0) +
          qbDMCObj.degree + "-" + qbMinutes + "-" + "00" + quadrantObj.quadrant.charAt(1);
        // display only degree if minutes & centiseconds is 0
      } else if ((Number(qbMinutes) === 0) &&
        (Number(mo.roundCentiseconds(qbCentiseconds)) === 0)) {
        bearingFormat.qb3DMC = quadrantObj.quadrant.charAt(0) +
          qbDMCObj.degree + "-" + "00" + "-" + "00" + quadrantObj.quadrant.charAt(1);
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
        bearingFormat.saDMC = dmcObj.degree + "-" + saMinutes + "-" +
          mo.normalizeSecValue((Number(mo.roundCentiseconds(saCentiseconds)) / 100));
        // display minutes & centiseconds if centiseconds is greater than 0
      } else if ((Number(saMinutes) === 0) && (Number(mo.roundCentiseconds(saCentiseconds)) > 0)) {
        bearingFormat.saDMC = dmcObj.degree + "-" + saMinutes + "-" +
          mo.normalizeSecValue((Number(mo.roundCentiseconds(saCentiseconds)) / 100));
        // display only minutes if its greater than 0 & centiseconds is 0
      } else if ((Number(saMinutes) > 0) &&
        (Number(mo.roundCentiseconds(saCentiseconds)) === 0)) {
        bearingFormat.saDMC = dmcObj.degree + "-" + saMinutes + "-" + "00";
        // display only degree if minutes & centiseconds is 0
      } else if ((Number(saMinutes) === 0) &&
        (Number(mo.roundCentiseconds(saCentiseconds)) === 0)) {
        bearingFormat.saDMC = dmcObj.degree + "-" + "00" + "-" + "00";
      }
      // to convert number to long value
      bearingFormat.naDD = bearingFormat.naDD * 1;
      if (bearingFormat.naDDRound === 360) {
        bearingFormat.naDDRound = 0;
      }
      if (bearingFormat.saDDRound === 360) {
        bearingFormat.saDDRound = 0;
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
    * This function is used to create array of regex of valid bearings.
    * Assumptions:
    * 1. degrees are within -359 to +359. "+" character is considered invalid.
    * 2. minutes and seconds are 00 to 59 and are optional. single digit are invalid
    * 3. centiseconds are optional and from 00 to 99
    * 4. For Decimal Degrees unlimited precision is supported
    * 5. In Decimal Degrees .5 is invalid and has to preceded with 0 like 0.5
    * 6. Each regex returns result array having its deg, min, sec & centiseconds in different array location
    * @memberOf widgets/ParcelDrafter/utils
    */
    mo.getBearingFormatArr = function () {
      var formatRegExArr = [];
      // dd-mm-ss.ss-[1234]  (0)
      // RESULT OBJ : res[1] = degree; res[2] = minutes; res[3] = seconds;
      formatRegExArr.push({ "regex": /^((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\-(0|[0-5]?\d)\-((?:[0-5]\d)(?:\.\d{2})?))?\-([1-4])$/, "type": "degreeMinuteSeconds" });
      // [NS]dd-mm-ss.ss[EW]  (1)
      // RESULT OBJ : res[1] = quadrant 1st character; res[2] = degree; res[3] = minutes; res[4] = seconds; res[5] = quadrant 2nd character;
      formatRegExArr.push({ "regex": /^([nNsS])((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\-(0|[0-5]?\d)\-((?:[0-5]\d)(?:\.\d{2})?))?([eEwW])$/, "type": "degreeMinuteSeconds" });
      // [NS]dd.mmssss[EW]  (2)
      // RESULT OBJ : res[1] = quadrant 1st character; res[2] = degree; res[3] = minutes; res[4] = // seconds; res[5] = centiseconds; res[6] = quadrant 2nd character;
      formatRegExArr.push({ "regex": /^([nNsS])((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\.([0-5]\d)(?:([0-5]\d)(\d{2})?)?)?([eEwW])$/, "type": "degreeMinuteSeconds" });
      // dd.mmss[ss]  (3)
      // RESULT OBJ : res[1] = degree; res[2] = minutes; res[3] = seconds; res[4] = centiseconds;
      formatRegExArr.push({ "regex": /^((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\.([0-5]\d)(?:([0-5]\d)(\d{2})?)?)?$/, "type": "degreeMinuteSeconds" });
      // dd.dddd (4)
      // RESULT OBJ : res[1] = degree;
      formatRegExArr.push({ "regex": /^((?:(?:\-?)(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(?:\.\d+)?)|(?:\-?)(?:\.\d+))$/, "type": "decimalDegree" });
      // dd-mm-ss[.ss]  (5)
      // RESULT OBJ : res[1] = degree; res[2] = minutes; res[3] = seconds;
      formatRegExArr.push({ "regex": /^((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\-(0|[0-5]?\d)\-((?:[0-5]\d)(?:\.\d{2})?))?$/, "type": "degreeMinuteSeconds" });
      // 'dd.mmssss-[1234]  (6)
      // RESULT OBJ : res[1] = degree; res[2] = minutes; res[3] = seconds; res[4] = centiseconds; // res[5] = quadrant shortcut;
      formatRegExArr.push({ "regex": /^((?:\-)?(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0))(?:\.([0-5]\d)(?:([0-5]\d)(\d{2})?)?)?(\-[1-4])$/, "type": "degreeMinuteSeconds" });
      // [NS]dd.dddd[EW] (7)
      // RESULT OBJ : res[1] = quadrant 1st character; res[2] = degree; res[3] = quadrant 2nd
      // character;
      formatRegExArr.push({ "regex": /^([nNsS])((?:(?:\-?)(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(?:\.\d+)?)|(?:\-?)(?:\.\d+))([eEwW])$/, "type": "decimalDegree" });
      // dd.dddd-[1234] (8)
      // RESULT OBJ : res[1] = degree; res[2] = quadrant shortcut;
      formatRegExArr.push({ "regex": /^((?:(?:\-?)(?:3[0-5]\d|[12]\d{2}|[1-9]\d?|0)(?:\.\d+)?)|(?:\-?)(?:\.\d+))(\-[1-4])$/, "type": "decimalDegree" });
      return formatRegExArr;
    };

    /**
    * This function is used to convert a number from any quadrant to NA DD
    * math.bignumber is used to handle large floating point number & to preserve DMS to DD to DMS
    * values
    * @memberOf widgets/ParcelDrafter/utils
    */
    mo.getNorthAzimuthAngle = function (angle, quadrant) {
      var degree;
      quadrant = quadrant.toUpperCase();
      switch (quadrant) {
        case "-1":
        case "NE": // d = (angle + 360) % 360
          degree = math.add(math.bignumber(angle), math.bignumber(360)).mod(math.bignumber(360));
          return degree;
        case "-2":
        case "SE": // d = ( 360 + 180 - angle) % 360
          degree = math.add(math.bignumber(360 + 180),
            math.bignumber(angle * (-1))).mod(math.bignumber(360));
          return degree;
        case "-3":
        case "SW": // d = ( 360 + 180 + angle) % 360
          degree = math.add(math.bignumber(angle),
            math.bignumber(360 + 180)).mod(math.bignumber(360));
          return degree;
        case "-4":
        case "NW": // d = ( 360 - angle) % 360
          degree = math.add(math.bignumber(360),
            math.bignumber(angle * (-1))).mod(math.bignumber(360));
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
          res[3] = dmcObj.centiseconds / 100; // converting to seconds
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
          res[4] = dmcObj.centiseconds / 100; // converting to seconds
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
          res[4] = 0; // seconds
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
            res[3] = 0; // seconds
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
            res[3] = 0; // seconds
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
            // get DD of user entered bearing
            bearingObj = mo.getBearingObjForFormat5(res);
            // get DD on basis of north azimuth
            northAzimuthDD = mo.getNorthAzimuthAngle(bearingObj.decimalDegrees, "-1");
            // get DMC of new DD which is on basis of north azimuth
            dmcObj = mo.DDtoDMC({
              "angle": northAzimuthDD
            });
            // assign new dmc data to existing object
            res[1] = dmcObj.degree;
            res[2] = dmcObj.minutes;
            res[3] = dmcObj.centiseconds / 100;
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
            res[3] = dmcObj.centiseconds / 100; // converting to seconds
          } else if (planSettings.directionOrAngleType === "quadrantBearing") {
            res = null;
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
          res[3] = 0; // seconds
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
      // first check for all the cases having directionOrAngleUnits based on plan settings
      for (i = 0; i < formatRegExArr.length; i++) {
        if (formatRegExArr[i].type === planSettings.directionOrAngleUnits) {
          res = formatRegExArr[i].regex.exec(bearing.trim());
          if (res && res.length > 0) {
            res = mo.convertBearingToNorthAzimuth(res, i, planSettings);
            break;
          }
        }
      }
      /* next check would be for all the cases in which directionOrAngleUnits is not based on plan  settings */
      if (!res) {
        for (i = 0; i < formatRegExArr.length; i++) {
          if (formatRegExArr[i].type !== planSettings.directionOrAngleUnits) {
            res = formatRegExArr[i].regex.exec(bearing.trim());
            if (res && res.length > 0) {
              res = mo.convertBearingToNorthAzimuth(res, i, planSettings);
              break;
            }
          }
        }
      }
      if (!res) {
        // return null if bearing is invalid
        returnValue = null;
      } else {
        returnValue = mo.getBearingDetailsOfRequiredFormat(res, i);
      }
      // return bearing conversions
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