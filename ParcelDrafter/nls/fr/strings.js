define({
  root: ({
   _widgetLabel: "@fr@ Parcel Drafter",
    "newTraverseButtonLabel": "@fr@ Start New Traverse", //Shown as label to Start New Traverse button onLoad
    "editTraverseButtonLabel": "@fr@ Edit Traverse", //Shown as label to Edit Traverse button onLoad
    "mapTooltipForStartNewTraverse": "@fr@ Please select a point on map to begin", //Shown as tooltip when mouse move over the map once start new traverse is selceted
    "mapTooltipForEditNewTraverse": "@fr@ Please select a parcel to edit", //Shown as tooltip when mouse move over the map once edit new traverse is selceted
    "mapTooltipForUpdateStartpoint": "@fr@ Click to update start point", // Shown as tooltip when mouse move over the map once traverse grid page is shown
    "backButtonTooltip": "@fr@ Back", //Shown as tooltip on back buttons
    "newTraverseTitle": "@fr@ New Traverse", //Shown as title for new traverse page
    "planSettings": {
      "planSettingsTitle": "@fr@ Plan Settings", //Shown as Title for Plan Settings page
      "directionOrAngleTypeLabel": "@fr@ Direction or Angle Type", //Shown as label to set Direction or Angle Type
      "directionOrAngleUnitsLabel": "@fr@ Direction or Angle Units",  //Shown as label to set Direction or Angle Units
      "distanceAndLengthUnitsLabel": "@fr@ Distance and Length Units", //Shown as label to set Distance and Length Units
      "areaUnitsLabel": "@fr@ Area Units", //Shown as label to set Area Units
      "circularCurveParameters": "@fr@ Circular Curve Parameters", //Shown as label to set Circular Curve Parameters
      "northAzimuth": "@fr@ North Azimuth", //Shown as label for north azimuth in direction or angle type dropdown
      "southAzimuth": "@fr@ South Azimuth", //Shown as label for south azimuth in direction or angle type dropdown
      "quadrantBearing": "@fr@ Quadrant Bearing", //Shown as label for Quadrant Bearing in direction or angle type dropdown
      "decimalDegree": { "label": "@fr@ Decimal Degree", "abbreviation": "dd" }, //Shown as label for Decimal Degree in direction or angle unit dropdown
      "degreeMinuteSeconds": { "label": "@fr@ Degree Minute Seconds", "abbreviation": "dms" }, //Shown as label for Degree Minute Seconds in direction or angle unit dropdown
      "uSSurveyFeet": { "label": "@fr@ US Survey Feet", "abbreviation": "usft" }, //Shown as label for US Survey Feet in direction or angle unit dropdown
      "meters": { "label": "@fr@ Meters", "abbreviation": "m" }, //Shown as label for Meters in direction or angle unit dropdown
      "squareFeet": { "label": "@fr@ Square Feet", "abbreviation": "sqft" }, //Shown as label for Square Feet in distance and length units dropdown
      "acres": { "label": "@fr@ Acres", "abbreviation": "ac" }, //Shown as label for Acres in distance and length units  dropdown
      "squareMeters": { "label": "@fr@ Square Meters", "abbreviation": "sqm" }, //Shown as label for Square Meters in distance and length units  dropdown
      "radiusAndChordLength": "@fr@ Radius and Chord Length", //Shown as label for Radius And Chord Length in circular curve parameters dropdown
      "radiusAndArcLength": "@fr@ Radius and Arc Length", //Shown as label for Radius And Arc Length in circular curve parameters dropdown
      "expandGridTooltipText": "@fr@ Expand grid", // Show on hover of the expand grid button
      "collapseGridTooltipText": "@fr@ Collapse grid", // Show on hover of the collapse grid button
      "zoomToLocationTooltipText": "@fr@ Zoom to location", // Show on hover of the zoomToLocation button
      "onScreenDigitizationTooltipText": "@fr@ Digitization", // Show on hover of the zoomToLocation button
    },
    "traverseSettings": {
      "bearingLabel": "@fr@ Bearing", //Shown as label for bearing column in traverse grid
      "lengthLabel": "@fr@ Length", //Shown as label for length column in traverse grid
      "radiusLabel": "@fr@ Radius", //Shown as label for radius column in traverse grid
      "noMiscloseCalculated" : "@fr@ Misclose  not calculated",
      "traverseMiscloseBearing": "@fr@ Misclose  Bearing",
      "traverseAccuracy": "@fr@ Accuracy",
      "traverseDistance": "@fr@ Distance",
      "traverseMiscloseRatio": "@fr@ Misclose  Ratio",
      "traverseStatedArea": "@fr@ Stated Area",
      "traverseCalculatedArea": "@fr@ Calculated Area"
    },
    "parcelTools": {
      "rotationToolLabel": "@fr@ Angle", //Shown as label to Rotate of selected parcel
      "scaleToolLabel": "@fr@ Scale" //Shown as label to scale of selected parcel
    },
    "parcelInfos":{
      "parcelNamePlaceholderText": "@fr@ Parcel name (required)", //Shown as Place Holder for Parcel name
      "parcelDocumentTypeText": "@fr@ Document type (optional)", //Shown as Place Holder for Document type
      "planNamePlaceholderText": "@fr@ Plan name (optional)",  //Shown as Place Holder for Plan name
      "cancelButtonLabel" : "@fr@ Cancel", //Shown as label of cancel button
      "saveButtonLabel" : "@fr@ Save" //Shown as label of Save button
    }
  })
});
