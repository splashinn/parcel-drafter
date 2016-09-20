///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define({
  root: ({
    _widgetLabel: "@fr@ Parcel Drafter", // Label of widget
    "newTraverseButtonLabel": "@fr@ Start New Traverse", // Shown as label to Start New Traverse button onLoad
    "invalidConfigMsg": "@fr@ Invalid Configuration", // Shown as error msg in widget panel if configuration is not valid
    "geometryServiceURLNotFoundMSG": "@fr@ Unable to get Geometry Service URL", // Shown as error msg in widget panel if geometry service url is not found in WAB app config
    "editTraverseButtonLabel": "@fr@ Edit Traverse", // Shown as label to Edit Traverse button onLoad
    "mapTooltipForStartNewTraverse": "@fr@ Please select a point on map to begin", // Shown as tooltip when mouse move over the map once start new traverse is selected
    "mapTooltipForEditNewTraverse": "@fr@ Please select a parcel to edit", // Shown as tooltip when mouse move over the map once edit new traverse is selected
    "mapTooltipForUpdateStartPoint": "@fr@ Click to update start point", // Shown as tooltip when mouse move over the map once traverse grid page is shown
    "mapTooltipForScreenDigitization": "@fr@ Click to add parcel point",// Shown as tooltip when mouse move over the map once screen digitization tool is activated
    "mapTooltipForRotate": "@fr@ Drag to rotate", // Shown as tooltip when mouse drag over the map once rotation tool is activated
    "mapTooltipForScale": "@fr@ Drag to scale", // Shown as tooltip when mouse drag over the map once scaling tool is activated
    "backButtonTooltip": "@fr@ Back", // Shown as tooltip on back buttons
    "newTraverseTitle": "@fr@ New Traverse", // Shown as title for new traverse page
    "clearingDataConfirmationMessage": "@fr@ All the entered data will be cleared, Do you want to proceed.", // Shown as warning message when user wants to clear all the parcel data
    "confirmationBoxYESButtonLabel": "@fr@ Yes", // Shown as label for yes button of confirmation box
    "confirmationBoxNOButtonLabel": "@fr@ No", // Shown as label for no button of confirmation box
    "unableToFetchParcelMessage": "@fr@ Unable to fetch parcel.", // Shown when error occurs while  fetching parcel polyline for editing it
    "unableToFetchParcelLinesMessage": "@fr@ Unable to fetch parcel lines.", // Shown when error occurs while  fetching parcel polyline for editing it
    "planSettings": {
      "planSettingsTitle": "@fr@ Settings", // Shown as Title for Plan Settings page
      "directionOrAngleTypeLabel": "@fr@ Direction or Angle Type", // Shown as label to set Direction or Angle Type
      "directionOrAngleUnitsLabel": "@fr@ Direction or Angle Units",  // Shown as label to set Direction or Angle Units
      "distanceAndLengthUnitsLabel": "@fr@ Distance and Length Units", // Shown as label to set Distance and Length Units
      "areaUnitsLabel": "@fr@ Area Units", // Shown as label to set Area Units
      "circularCurveParameters": "@fr@ Circular Curve Parameters", // Shown as label to set Circular Curve Parameters
      "northAzimuth": "@fr@ North Azimuth", // Shown as label for north azimuth in direction or angle type dropdown
      "southAzimuth": "@fr@ South Azimuth", // Shown as label for south azimuth in direction or angle type dropdown
      "quadrantBearing": "@fr@ Quadrant Bearing", // Shown as label for Quadrant Bearing in direction or angle type dropdown
      "decimalDegree": { "label": "@fr@ Decimal Degree", "abbreviation": "@fr@ dd" }, // Shown as label for Decimal Degree in direction or angle unit dropdown
      "degreeMinuteSeconds": { "label": "@fr@ Degree Minute Seconds", "abbreviation": "@fr@ dms" }, // Shown as label for Degree Minute Seconds in direction or angle unit dropdown
      "uSSurveyFeet": { "label": "@fr@ US Survey Feet", "abbreviation": "@fr@ ftUS" }, // Shown as label for US Survey Feet in direction or angle unit dropdown
      "meters": { "label": "@fr@ Meters", "abbreviation": "@fr@ m" }, // Shown as label for Meters in direction or angle unit dropdown
      "squareUsFeet": { "label": "@fr@ Square Feet US", "abbreviation": "@fr@ sqftUS" }, // Shown as label for Square Feet in distance and length units dropdown
      "acres": { "label": "@fr@ Acres", "abbreviation": "@fr@ ac" }, // Shown as label for Acres in distance and length units  dropdown
      "squareMeters": { "label": "@fr@ Square Meters", "abbreviation": "@fr@ sqm" }, // Shown as label for Square Meters in distance and length units  dropdown
      "radiusAndChordLength": "@fr@ Radius and Chord Length", // Shown as label for Radius And Chord Length in circular curve parameters dropdown
      "radiusAndArcLength": "@fr@ Radius and Arc Length", // Shown as label for Radius And Arc Length in circular curve parameters dropdown
      "expandGridTooltipText": "@fr@ Expand grid", // Show on hover of the expand grid button
      "collapseGridTooltipText": "@fr@ Collapse grid", // Show on hover of the collapse grid button
      "zoomToLocationTooltipText": "@fr@ Zoom to location", // Show on hover of the zoomToLocation button
      "onScreenDigitizationTooltipText": "@fr@ Digitize" // Show on hover of the Digitization button
    },
    "traverseSettings": {
      "bearingLabel": "@fr@ Bearing", // Shown as label for bearing column in traverse grid
      "lengthLabel": "@fr@ Length", // Shown as label for length column in traverse grid
      "radiusLabel": "@fr@ Radius", // Shown as label for radius column in traverse grid
      "noMiscloseCalculated": "@fr@ Misclose not calculated", // Shown when misclose is not calculated
      "traverseMiscloseBearing": "@fr@ Misclose Bearing",  // Shown as label for misclose bearing
      "traverseAccuracy": "@fr@ Accuracy",  // Shown as label for accuracy
      "accuracyHigh": "@fr@ High",  // Shown as label for high accuracy
      "traverseDistance": "@fr@ Misclose Distance",  // Shown as label for misclose distance
      "traverseMiscloseRatio": "@fr@ Misclose Ratio",  // Shown as label for misclose ratio
      "traverseStatedArea": "@fr@ Stated Area", // Shown as label for stated area
      "traverseCalculatedArea": "@fr@ Calculated Area", // Shown as label for calculated area
      "addButtonTitle": "@fr@ Add", // Shown as title on add button
      "deleteButtonTitle": "@fr@ Remove" // Shown as title on delete button
    },
    "parcelTools": {
      "rotationToolLabel": "@fr@ Angle", // Shown as label to Rotate of selected parcel
      "scaleToolLabel": "@fr@ Scale" // Shown as label to scale of selected parcel
    },
    "parcelInfos": {
      "parcelNamePlaceholderText": "@fr@ Parcel name (required)", // Shown as Place Holder for Parcel name
      "parcelDocumentTypeText": "@fr@ Document type (optional)", // Shown as Place Holder for Document type
      "planNamePlaceholderText": "@fr@ Plan name (optional)",  // Shown as Place Holder for Plan name
      "cancelButtonLabel": "@fr@ Cancel", // Shown as label of cancel button
      "saveButtonLabel": "@fr@ Save" // Shown as label of Save button
    },
    "newTraverse": {
      "invalidBearingMessage": "@fr@ Invalid Bearing.", // Shown when invalid bearing is entered
      "invalidLengthMessage": "@fr@ Invalid Length.", // Shown when invalid length is entered
      "invalidRadiusMessage": "@fr@ Invalid Radius.", // Shown when invalid radius is entered
      "negativeLengthMessage": "@fr@ Valid only for curves", // Show when negative value is entered in length
      "enterValidValuesMessage": "@fr@ Please enter valid values.", // Shown when invalid value is there in bearing grid column & user tries to add a new bearing row
      "enterValidParcelInfoMessage": "@fr@ Please enter some valid parcel info to save.", // Shown when invalid parcel info is there and user tries to save parcel
      "unableToDrawLineMessage": "@fr@ Unable to draw line.", // Shown when parcel lines unable to render
      "invalidEndPointMessage": "@fr@ Invalid End-Point, unable to draw line." // Shown when user tries to draw line at invalid end point
    },
    "planInfo": {
      "saveNonClosedParcelConfirmationMessage": "@fr@ The entered parcel is not closed, do you still want to proceed and save only parcel lines?", // Shown when user tries to save unclosed polygon
      "confirmationBoxYESButtonLabel": "@fr@ Yes", // Confirmation box YES button label
      "confirmationBoxNOButtonLabel": "@fr@ No", // Confirmation box NO button label
      "unableToCreatePolygonParcel": "@fr@ Unable to create parcel polygon.", // Shown when error occurs while creating data of polygon for saving it
      "unableToSavePolygonParcel": "@fr@ Unable to save parcel polygon.", // Shown when error occurs while saving parcel polygon
      "unableToSaveParcelLines": "@fr@ Unable to save parcel lines.", // Shown when error occurs while saving parcel lines
      "unableToUpdateParcelLines": "@fr@ Unable to update parcel lines.", // Shown when error occurs while updating parcel lines
      "parcelSavedSuccessMessage": "@fr@ Parcel saved successfully.", // Shown when parcel is saved successfully
      "enterValidParcelNameMessage": "@fr@ Please enter valid parcel name.", // Shown as error message when parcel name is invalid
      "enterValidDocumentTyeMessage": "@fr@ Please select valid document type.", // Shown as error message when document type is invalid
      "enterValidStatedAreaNameMessage": "@fr@ Please add valid stated area." // Shown as error message when stated area is invalid
    }
  })
});
