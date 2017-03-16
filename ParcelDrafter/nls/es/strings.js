define({
  root: ({
    _widgetLabel: "Parcel Drafter", // Label of widget
    "newTraverseButtonLabel": "Iniciar Nuevo Trazado", // Shown as label to Start New Traverse button onLoad
    "invalidConfigMsg": "Configuracion Invalida", // Shown as error msg in widget panel if configuration is not valid
    "geometryServiceURLNotFoundMSG": "No disponible servicio url de geometria", // Shown as error msg in widget panel if geometry service url is not found in WAB app config
    "editTraverseButtonLabel": "Editar Trazado", // Shown as label to Edit Traverse button onLoad
    "mapTooltipForStartNewTraverse": "Por favor seleccione un punto en el mapa", // Shown as tooltip when mouse move over the map once start new traverse is selected
    "mapTooltipForEditNewTraverse": "Editar nueva Trazado", // Shown as tooltip when mouse move over the map once edit new traverse is selected
    "mapTooltipForUpdateStartPoint": "Click para actualizar punto inicio", // Shown as tooltip when mouse move over the map once traverse grid page is shown
    "mapTooltipForScreenDigitization": "Click para agregar punto de parcela",// Shown as tooltip when mouse move over the map once screen digitization tool is activated
    "mapTooltipForRotate": "Arrastrar para rotar", // Shown as tooltip when mouse drag over the map once rotation tool is activated
    "mapTooltipForScale": "Arrastrar para escalar", // Shown as tooltip when mouse drag over the map once scaling tool is activated
    "backButtonTooltip": "Regresar", // Shown as tooltip on back buttons
    "newTraverseTitle": "Nuevo Trazado", // Shown as title for new traverse page
    "editTraverseTitle": "Editar Trazado", // Shown as title for new traverse page
    "clearingDataConfirmationMessage": "Los Cambios seran descartados, ¿quiere usted proceder?", // Shown as warning message when user wants to clear all the parcel data
    "confirmationBoxYESButtonLabel": "Si", // Shown as label for yes button of confirmation box
    "confirmationBoxNOButtonLabel": "No", // Shown as label for no button of confirmation box
    "unableToFetchParcelMessage": "Parcela no encontrada.", // Shown when error occurs while  fetching parcel polyline for editing it
    "unableToFetchParcelLinesMessage": "Parcela-linea No encontrada", // Shown when error occurs while  fetching parcel polyline for editing it
    "planSettings": {
      "planSettingsTitle": "Configuracion", // Shown as Title for Plan Settings page
      "directionOrAngleTypeLabel": "Direccion o tipo de angulo", // Shown as label to set Direction or Angle Type
      "directionOrAngleUnitsLabel": "Unidades de Direccion o Angulo",  // Shown as label to set Direction or Angle Units
      "distanceAndLengthUnitsLabel": "Unidades de Distancia y Longitud", // Shown as label to set Distance and Length Units
      "areaUnitsLabel": "Unidades de Area", // Shown as label to set Area Units
      "circularCurveParameters": "Parametros de Curvas", // Shown as label to set Circular Curve Parameters
      "northAzimuth": "Azimuth Norte", // Shown as label for north azimuth in direction or angle type dropdown
      "southAzimuth": "Azimuth Sur", // Shown as label for south azimuth in direction or angle type dropdown
      "quadrantBearing": "Rumbo de Cuadrante", // Shown as label for Quadrant Bearing in direction or angle type dropdown
      "decimalDegree": { "label": "Grados Decimales", "abbreviation": "dd" }, // Shown as label for Decimal Degree in direction or angle unit dropdown
      "degreeMinuteSeconds": { "Etiqueta": "Grados Minutos Segundos", "abbreviation": "dms" }, // Shown as label for Degree Minute Seconds in direction or angle unit dropdown
      "uSSurveyFeet": { "label": "US Survey Pies", "abbreviation": "ftUS" }, // Shown as label for US Survey Feet in direction or angle unit dropdown
      "meters": { "label": "Metros", "abbreviation": "m" }, // Shown as label for Meters in direction or angle unit dropdown
      "squareUsFeet": { "label": "Pies Cuadrados", "abbreviation": "sqftUS" }, // Shown as label for Square Feet in distance and length units dropdown
      "acres": { "label": "Acres", "abbreviation": "ac" }, // Shown as label for Acres in distance and length units  dropdown
      "squareMeters": { "label": "Metros Cuadrados", "abbreviation": "sqm" }, // Shown as label for Square Meters in distance and length units  dropdown
      "radiusAndChordLength": "Radio y Longitud de Chord", // Shown as label for Radius And Chord Length in circular curve parameters dropdown
      "radiusAndArcLength": "Radio y Longitud de Arco", // Shown as label for Radius And Arc Length in circular curve parameters dropdown
      "expandGridTooltipText": "Expandir grilla", // Show on hover of the expand grid button
      "collapseGridTooltipText": "Colapzar grid", // Show on hover of the collapse grid button
      "zoomToLocationTooltipText": "Zoom a ubicacion", // Show on hover of the zoomToLocation button
      "onScreenDigitizationTooltipText": "Digitalizar" // Show on hover of the Digitization button
    },
    "traverseSettings": {
      "bearingLabel": "Rumbo", // Shown as label for bearing column in traverse grid
      "lengthLabel": "Longitud", // Shown as label for length column in traverse grid
      "radiusLabel": "Radio", // Shown as label for radius column in traverse grid
      "noMiscloseCalculated": "Misclose no calculado", // Shown when misclose is not calculated
      "traverseMiscloseBearing": "Misclose Rumbo",  // Shown as label for misclose bearing
      "traverseAccuracy": "Precision",  // Shown as label for accuracy
      "accuracyHigh": "Altura",  // Shown as label for high accuracy
      "traverseDistance": "Misclose Distancia",  // Shown as label for misclose distance
      "traverseMiscloseRatio": "Misclose Radio",  // Shown as label for misclose ratio
      "traverseStatedArea": "Area reportada", // Shown as label for stated area
      "traverseCalculatedArea": "Calcular Area", // Shown as label for calculated area
      "addButtonTitle": "Agregar", // Shown as title on add button
      "deleteButtonTitle": "Remover" // Shown as title on delete button
    },
    "parcelTools": {
      "rotationToolLabel": "Angulo", // Shown as label to Rotate of selected parcel
      "scaleToolLabel": "Escala" // Shown as label to scale of selected parcel
    },
    "newTraverse": {
      "invalidBearingMessage": "Rumbo Invalido.", // Shown when invalid bearing is entered
      "invalidLengthMessage": "Longitud Invalida.", // Shown when invalid length is entered
      "invalidRadiusMessage": "Radio Invalido.", // Shown when invalid radius is entered
      "negativeLengthMessage": "Valido solo para curvas", // Shown when negative value is entered in length
      "enterValidValuesMessage": "Por favor introduzca valores validos.", // Shown when invalid value is there in bearing grid column & user tries to add a new bearing row
      "enterValidParcelInfoMessage": "Por  favor introduca informacion valida de parcela para salvar.", // Shown when invalid parcel info is there and user tries to save parcel
      "unableToDrawLineMessage": "Imposible Dibujar lineas.", // Shown when parcel lines unable to render
      "invalidEndPointMessage": "End-Point Invalido, imposible dibujar lineas." // Shown when user tries to draw line at invalid end point
    },
    "planInfo": {
      "requiredText": "(requerido)",
      "optionalText": "(optional)",
      "parcelNamePlaceholderText": "Nombre de Parcela", // Shown as Place Holder for Parcel name
      "parcelDocumentTypeText": "Tipo de Documento", // Shown as Place Holder for Document type
      "planNamePlaceholderText": "Nombre del Plan",  // Shown as Place Holder for Plan name
      "cancelButtonLabel": "Cancelar", // Shown as label of cancel button
      "saveButtonLabel": "Guardar", // Shown as label of Save button
      "saveNonClosedParcelConfirmationMessage": "La parcela introducida no esta cerrada, ¿todavia desea continuar y guardar solo las lineas de parcela?", // Shown when user tries to save unclosed polygon
      "confirmationBoxYESButtonLabel": "Si", // Confirmation box YES button label
      "confirmationBoxNOButtonLabel": "No", // Confirmation box NO button label
      "unableToCreatePolygonParcel": "imposible crear poligono de parcela.", // Shown when error occurs while creating data of polygon for saving it
      "unableToSavePolygonParcel": "Imposible guardar poligono de parcela.", // Shown when error occurs while saving parcel polygon
      "unableToSaveParcelLines": "Imposible guardar Lineas parcela.", // Shown when error occurs while saving parcel lines
      "unableToUpdateParcelLines": "Imposible actualizar las lineas de parcela.", // Shown when error occurs while updating parcel lines
      "parcelSavedSuccessMessage": "¡Parcela Guardada!.", // Shown when parcel is saved successfully
      "enterValidParcelNameMessage": "Por favor introduzca un nombre de parcela valido.", // Shown as error message when parcel name is invalid
      "enterValidPlanNameMessage": "Por favor introduzca un nombre de plan valido.", // Shown as error message when parcel name is invalid
      "enterValidDocumentTyeMessage": "Tipo de documento valido.", // Shown as error message when document type is invalid
      "enterValidStatedAreaNameMessage": "Por favor introduzca un area reportada valida." // Shown as error message when stated area is invalid
    }
  })
});
