define({
  root: ({
    _widgetLabel: "Parcel Drafter",
    "newTraverseButtonLabel": "Start New Traverse", //Shown as label to Start New Traverse button onLoad
    "geometryServiceURLNotFoundMSG": "Unable to get Geometry Service URL", //Shown as error msg in widget panel if geometry service url is not found in WAB app config
    "editTraverseButtonLabel": "Edit Traverse", //Shown as label to Edit Traverse button onLoad
    "mapTooltipForStartNewTraverse": "Please select a point on map to begin", //Shown as tooltip when mouse move over the map once start new traverse is selceted
    "mapTooltipForEditNewTraverse": "Please select a parcel to edit", //Shown as tooltip when mouse move over the map once edit new traverse is selceted
    "mapTooltipForUpdateStartpoint": "Click to update start point", // Shown as tooltip when mouse move over the map once traverse grid page is shown
    "mapTooltipForScreenDigitization": "Click to add parcel point",// Shown as tooltip when mouse move over the map once screen digitization tool is activated
    "backButtonTooltip": "Back", //Shown as tooltip on back buttons
    "newTraverseTitle": "New Traverse", //Shown as title for new traverse page
    "clearingDataConfirmationMessage": "All the enterd data will be cleared, Do you want to proceed.",
    "confirmationBoxYESButtonLabel": "Yes",
    "confirmationBoxNOButtonLabel": "No",
    "unableToFetchParcelMessage": "Unable to fetch parcel.",
    "unableToFetchParcelLinesMessage": "Unable to fetch parcel lines.",
    "planSettings": {
      "planSettingsTitle": "Plan Settings", //Shown as Title for Plan Settings page
      "directionOrAngleTypeLabel": "Direction or Angle Type", //Shown as label to set Direction or Angle Type
      "directionOrAngleUnitsLabel": "Direction or Angle Units",  //Shown as label to set Direction or Angle Units
      "distanceAndLengthUnitsLabel": "Distance and Length Units", //Shown as label to set Distance and Length Units
      "areaUnitsLabel": "Area Units", //Shown as label to set Area Units
      "circularCurveParameters": "Circular Curve Parameters", //Shown as label to set Circular Curve Parameters
      "northAzimuth": "North Azimuth", //Shown as label for north azimuth in direction or angle type dropdown
      "southAzimuth": "South Azimuth", //Shown as label for south azimuth in direction or angle type dropdown
      "quadrantBearing": "Quadrant Bearing", //Shown as label for Quadrant Bearing in direction or angle type dropdown
      "decimalDegree": { "label": "Decimal Degree", "abbreviation": "dd" }, //Shown as label for Decimal Degree in direction or angle unit dropdown
      "degreeMinuteSeconds": { "label": "Degree Minute Seconds", "abbreviation": "dms" }, //Shown as label for Degree Minute Seconds in direction or angle unit dropdown
      "uSSurveyFeet": { "label": "US Survey Feet", "abbreviation": "ftUS" }, //Shown as label for US Survey Feet in direction or angle unit dropdown
      "meters": { "label": "Meters", "abbreviation": "m" }, //Shown as label for Meters in direction or angle unit dropdown
      "squareUsFeet": { "label": "Square Feet US", "abbreviation": "sqftUS" }, //Shown as label for Square Feet in distance and length units dropdown
      "acres": { "label": "Acres", "abbreviation": "ac" }, //Shown as label for Acres in distance and length units  dropdown
      "squareMeters": { "label": "Square Meters", "abbreviation": "sqm" }, //Shown as label for Square Meters in distance and length units  dropdown
      "radiusAndChordLength": "Radius and Chord Length", //Shown as label for Radius And Chord Length in circular curve parameters dropdown
      "radiusAndArcLength": "Radius and Arc Length", //Shown as label for Radius And Arc Length in circular curve parameters dropdown
      "expandGridTooltipText": "Expand grid", // Show on hover of the expand grid button
      "collapseGridTooltipText": "Collapse grid", // Show on hover of the collapse grid button
      "zoomToLocationTooltipText": "Zoom to location", // Show on hover of the zoomToLocation button
      "onScreenDigitizationTooltipText": "Digitization" // Show on hover of the zoomToLocation button
    },
    "traverseSettings": {
      "bearingLabel": "Bearing", //Shown as label for bearing column in traverse grid
      "lengthLabel": "Length", //Shown as label for length column in traverse grid
      "radiusLabel": "Radius", //Shown as label for radius column in traverse grid
      "noMiscloseCalculated": "Misclose not calculated",
      "traverseMiscloseBearing": "Misclose Bearing",
      "traverseAccuracy": "Accuracy",
      "accuracyHigh": "High",
      "traverseDistance": "Misclose Distance",
      "traverseMiscloseRatio": "Misclose Ratio",
      "traverseStatedArea": "Stated Area",
      "traverseCalculatedArea": "Calculated Area",
      "addButtonTitle": "Add",
      "deleteButtonTitle": "Remove"
    },
    "parcelTools": {
      "rotationToolLabel": "Angle", //Shown as label to Rotate of selected parcel
      "scaleToolLabel": "Scale" //Shown as label to scale of selected parcel
    },
    "parcelInfos": {
      "parcelNamePlaceholderText": "Parcel name (required)", //Shown as Place Holder for Parcel name
      "parcelDocumentTypeText": "Document type (optional)", //Shown as Place Holder for Document type
      "planNamePlaceholderText": "Plan name (optional)",  //Shown as Place Holder for Plan name
      "cancelButtonLabel": "Cancel", //Shown as label of cancel button
      "saveButtonLabel": "Save" //Shown as label of Save button
    },
    "newTraverse": {
      "invalidBearingMessage": "Invalid Bearing.",
      "invalidLengthMessage": "Invalid Length.",
      "invalidRadiusMessage": "Invalid Radius.",
      "enterValidValuesMessage": "Please enter valid values.",
      "enterValidParcelInfoMessage": "Please enter some valid parcel info to save.",
      "unableToDrawLineMessage": "Unable to draw line.",
      "invalidEndPointMessage": "Invalid End-Point, unable to draw line."
    },
    "planInfo": {
      "saveNonClosedParcelConfirmationMessage": "The enterd parcel is not closed, do you still want to proceed and save only parcel lines?",
      "confirmationBoxYESButtonLabel": "Yes", // Confirmation box's YES button label
      "confirmationBoxNOButtonLabel": "No", // Confirmation box's NO button label
      "unableToCratePolygonParcel": "Unable to create parcel polygon.",
      "unableToSavePolygonParcel": "Unable to save parcel polygon.",
      "unableToSaveParcelLines": "Unable to save parcel lines.",
      "unableToUpdateParcelLines": "Unable to update parcel lines.",
      "parcelSavedSuccessMessage": "Parcel saved successfully.",
      "enterValidParcelNameMessage": "Please enter valid parcel name."
    }
  }),
  "fr": 1
});
