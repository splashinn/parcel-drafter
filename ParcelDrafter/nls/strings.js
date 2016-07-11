define({
  root: ({
    _widgetLabel: "Parcel Drafter", // Label of widget
    "newTraverseButtonLabel": "Start New Traverse", // Shown as label to Start New Traverse button onLoad
    "invalidConfigMsg": "Invalid Configuration", // Shown as error msg in widget panel if configuration is not valid
    "geometryServiceURLNotFoundMSG": "Unable to get Geometry Service URL", // Shown as error msg in widget panel if geometry service url is not found in WAB app config
    "editTraverseButtonLabel": "Edit Traverse", // Shown as label to Edit Traverse button onLoad
    "mapTooltipForStartNewTraverse": "Please select a point on map to begin", // Shown as tooltip when mouse move over the map once start new traverse is selected
    "mapTooltipForEditNewTraverse": "Please select a parcel to edit", // Shown as tooltip when mouse move over the map once edit new traverse is selected
    "mapTooltipForUpdateStartPoint": "Click to update start point", // Shown as tooltip when mouse move over the map once traverse grid page is shown
    "mapTooltipForScreenDigitization": "Click to add parcel point",// Shown as tooltip when mouse move over the map once screen digitization tool is activated
    "mapTooltipForRotate": "Drag to rotate", // Shown as tooltip when mouse drag over the map once rotation tool is activated
    "mapTooltipForScale": "Drag to scale", // Shown as tooltip when mouse drag over the map once scaling tool is activated
    "backButtonTooltip": "Back", // Shown as tooltip on back buttons
    "newTraverseTitle": "New Traverse", // Shown as title for new traverse page
    "clearingDataConfirmationMessage": "All the entered data will be cleared, Do you want to proceed.", // Shown as warning message when user wants to clear all the parcel data
    "confirmationBoxYESButtonLabel": "Yes", // Shown as label for yes button of confirmation box
    "confirmationBoxNOButtonLabel": "No", // Shown as label for no button of confirmation box
    "unableToFetchParcelMessage": "Unable to fetch parcel.", // Shown when error occurs while  fetching parcel polyline for editing it
    "unableToFetchParcelLinesMessage": "Unable to fetch parcel lines.", // Shown when error occurs while  fetching parcel polyline for editing it
    "planSettings": {
      "planSettingsTitle": "Settings", // Shown as Title for Plan Settings page
      "directionOrAngleTypeLabel": "Direction or Angle Type", // Shown as label to set Direction or Angle Type
      "directionOrAngleUnitsLabel": "Direction or Angle Units",  // Shown as label to set Direction or Angle Units
      "distanceAndLengthUnitsLabel": "Distance and Length Units", // Shown as label to set Distance and Length Units
      "areaUnitsLabel": "Area Units", // Shown as label to set Area Units
      "circularCurveParameters": "Circular Curve Parameters", // Shown as label to set Circular Curve Parameters
      "northAzimuth": "North Azimuth", // Shown as label for north azimuth in direction or angle type dropdown
      "southAzimuth": "South Azimuth", // Shown as label for south azimuth in direction or angle type dropdown
      "quadrantBearing": "Quadrant Bearing", // Shown as label for Quadrant Bearing in direction or angle type dropdown
      "decimalDegree": { "label": "Decimal Degree", "abbreviation": "dd" }, // Shown as label for Decimal Degree in direction or angle unit dropdown
      "degreeMinuteSeconds": { "label": "Degree Minute Seconds", "abbreviation": "dms" }, // Shown as label for Degree Minute Seconds in direction or angle unit dropdown
      "uSSurveyFeet": { "label": "US Survey Feet", "abbreviation": "ftUS" }, // Shown as label for US Survey Feet in direction or angle unit dropdown
      "meters": { "label": "Meters", "abbreviation": "m" }, // Shown as label for Meters in direction or angle unit dropdown
      "squareUsFeet": { "label": "Square Feet US", "abbreviation": "sqftUS" }, // Shown as label for Square Feet in distance and length units dropdown
      "acres": { "label": "Acres", "abbreviation": "ac" }, // Shown as label for Acres in distance and length units  dropdown
      "squareMeters": { "label": "Square Meters", "abbreviation": "sqm" }, // Shown as label for Square Meters in distance and length units  dropdown
      "radiusAndChordLength": "Radius and Chord Length", // Shown as label for Radius And Chord Length in circular curve parameters dropdown
      "radiusAndArcLength": "Radius and Arc Length", // Shown as label for Radius And Arc Length in circular curve parameters dropdown
      "expandGridTooltipText": "Expand grid", // Show on hover of the expand grid button
      "collapseGridTooltipText": "Collapse grid", // Show on hover of the collapse grid button
      "zoomToLocationTooltipText": "Zoom to location", // Show on hover of the zoomToLocation button
      "onScreenDigitizationTooltipText": "Digitization" // Show on hover of the zoomToLocation button
    },
    "traverseSettings": {
      "bearingLabel": "Bearing", // Shown as label for bearing column in traverse grid
      "lengthLabel": "Length", // Shown as label for length column in traverse grid
      "radiusLabel": "Radius", // Shown as label for radius column in traverse grid
      "noMiscloseCalculated": "Misclose not calculated", // Shown when misclose is not calculated
      "traverseMiscloseBearing": "Misclose Bearing",  // Shown as label for misclose bearing
      "traverseAccuracy": "Accuracy",  // Shown as label for accuracy
      "accuracyHigh": "High",  // Shown as label for high accuracy
      "traverseDistance": "Misclose Distance",  // Shown as label for misclose distance
      "traverseMiscloseRatio": "Misclose Ratio",  // Shown as label for misclose ratio
      "traverseStatedArea": "Stated Area", // Shown as label for stated area
      "traverseCalculatedArea": "Calculated Area", // Shown as label for calculated area
      "addButtonTitle": "Add", // Shown as title on add button
      "deleteButtonTitle": "Remove" // Shown as title on delete button
    },
    "parcelTools": {
      "rotationToolLabel": "Angle", // Shown as label to Rotate of selected parcel
      "scaleToolLabel": "Scale" // Shown as label to scale of selected parcel
    },
    "parcelInfos": {
      "parcelNamePlaceholderText": "Parcel name (required)", // Shown as Place Holder for Parcel name
      "parcelDocumentTypeText": "Document type (optional)", // Shown as Place Holder for Document type
      "planNamePlaceholderText": "Plan name (optional)",  // Shown as Place Holder for Plan name
      "cancelButtonLabel": "Cancel", // Shown as label of cancel button
      "saveButtonLabel": "Save" // Shown as label of Save button
    },
    "newTraverse": {
      "invalidBearingMessage": "Invalid Bearing.", // Shown when invalid bearing is entered
      "invalidLengthMessage": "Invalid Length.", // Shown when invalid length is entered
      "invalidRadiusMessage": "Invalid Radius.", // Shown when invalid radius is entered
      "negativeLengthMessage": "Valid only for curves", // Shown when negative value is entered in length
      "enterValidValuesMessage": "Please enter valid values.", // Shown when invalid value is there in bearing grid column & user tries to add a new bearing row
      "enterValidParcelInfoMessage": "Please enter some valid parcel info to save.", // Shown when invalid parcel info is there and user tries to save parcel
      "unableToDrawLineMessage": "Unable to draw line.", // Shown when parcel lines unable to render
      "invalidEndPointMessage": "Invalid End-Point, unable to draw line." // Shown when user tries to draw line at invalid end point
    },
    "planInfo": {
      "saveNonClosedParcelConfirmationMessage": "The entered parcel is not closed, do you still want to proceed and save only parcel lines?", // Shown when user tries to save unclosed polygon
      "confirmationBoxYESButtonLabel": "Yes", // Confirmation box YES button label
      "confirmationBoxNOButtonLabel": "No", // Confirmation box NO button label
      "unableToCreatePolygonParcel": "Unable to create parcel polygon.", // Shown when error occurs while creating data of polygon for saving it
      "unableToSavePolygonParcel": "Unable to save parcel polygon.", // Shown when error occurs while saving parcel polygon
      "unableToSaveParcelLines": "Unable to save parcel lines.", // Shown when error occurs while saving parcel lines
      "unableToUpdateParcelLines": "Unable to update parcel lines.", // Shown when error occurs while updating parcel lines
      "parcelSavedSuccessMessage": "Parcel saved successfully.", // Shown when parcel is saved successfully
      "enterValidParcelNameMessage": "Please enter valid parcel name.", // Shown as error message when parcel name is invalid
      "enterValidDocumentTyeMessage": "Please select valid document type.", // Shown as error message when document type is invalid
      "enterValidStatedAreaNameMessage": "Please add valid stated area." // Shown as error message when stated area is invalid
    }
  }),
  "fr": 1
});
