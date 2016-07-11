define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./PlanInfo.html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Evented',
  'dojo/dom-class',
  'dijit/form/TextBox',
  'dojo/store/Memory',
  'dijit/form/ComboBox',
  'dojo/on',
  'esri/geometry/Polyline',
  'esri/graphic',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'jimu/dijit/Message',
  './geometryUtils'
],
  function (
    declare,
    BaseWidget,
    _WidgetsInTemplateMixin,
    PlanInfoTemplate,
    lang,
    array,
    Evented,
    domClass,
    ValidationTextBox,
    Memory,
    ComboBox,
    on,
    Polyline,
    Graphic,
    Query,
    QueryTask,
    Message,
    geometryUtils
  ) {
    return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-widget-ParcelDrafter-PlanInfo',
      templateString: PlanInfoTemplate,
      _itemList: null, // to store parcel lines
      _polygonLayer: null, // to store parcel polygon layer
      parcelNameTextBox: null, // to store parcel name textbox
      planNameTextBox: null, // to store plan name textbox
      documentTypeDropdown: null, // to store document type dropdown
      planSettings: null, // to store plan settings

      constructor: function (options) {
        lang.mixin(this, options);
      },

      postCreate: function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "esriCTFullWidth");
        this.documentTypeDropdown = this._createFieldSelect(
          this.documentType,
          this.nls.parcelInfos.parcelDocumentTypeText);
        this.parcelNameTextBox = this._createFieldInputs(
          this.parcelName,
          this.nls.parcelInfos.parcelNamePlaceholderText,
          false);
        this.planNameTextBox = this._createFieldInputs(this.planName,
          this.nls.parcelInfos.planNamePlaceholderText, false);
        //Handle click event of parcelInfo cancel button
        this.own(on(this.parcelInfoCancelButton, "click",
          lang.hitch(this, function () {
            this.emit("cancelTraversedParcel");
          })));
        // Handle click event of parcelInfo save button
        this.own(on(this.parcelInfoSaveButton, "click",
          lang.hitch(this, function () {
            this.emit("saveTraversedParcel");
          })));
        // to validate whether value searched by user in document type dropdown is valid or not.
        this.own(on(this.documentTypeDropdown, "change",
          lang.hitch(this, function (newValue) {
            if (newValue !== "" && newValue !== null && newValue !== undefined) {
              var foundValue;
              foundValue = this.documentTypeDropdown.store.data.some(function (dataObject) {
                return dataObject.name === newValue;
              });
              if (!foundValue) {
                this.documentTypeDropdown.set("item", null);
                this._showMessage(this.nls.planInfo.enterValidDocumentTyeMessage);
              }
            }
          })));
      },

      /**
      * Emit the showMessage event
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _showMessage: function (msg) {
        this.emit("showMessage", msg);
      },

      /**
      * Creates input fields
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _createFieldInputs: function (nodeContainer, placeHolderText, isRequired) {
        var inputTextBox = new ValidationTextBox({
          placeHolder: placeHolderText,
          "class": "esriCTFullWidth",
          required: isRequired
        });
        inputTextBox.placeAt(nodeContainer);
        return inputTextBox;
      },

      /**
      * Creates combobox fields for document type
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _createFieldSelect: function (nodeContainer, placeHolderText) {
        var docTypeDataArr, documentTypeStore;
        docTypeDataArr = this._createDocTypeDataArr();
        documentTypeStore = new Memory({ data: docTypeDataArr });
        this.selectBox = new ComboBox({
          placeHolder: placeHolderText,
          "class": "esriCTFullWidth",
          store: documentTypeStore
        }, nodeContainer);
        return this.selectBox;
      },

      /**
      * create data-array for combobox
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _createDocTypeDataArr: function () {
        var options = [], documentTypeLayerId, documentTypeFieldName;
        documentTypeLayerId = this.config.polygonLayer.layerId;
        documentTypeFieldName = this.config.documentTypeField;
        // if Document type layer configured
        if (this.map && this.map._layers && this.map._layers[documentTypeLayerId]) {
          // looping through configured documentType layer fields
          array.forEach(this.map._layers[documentTypeLayerId].fields, lang.hitch(this, function
        (field) {
            // if configured field and field on layer is same
            // then loop through the field array to create array of option object
            if (field.name === documentTypeFieldName && field.domain && field.domain.codedValues) {
              //loop through the fields domain coded values array to create array of option object
              array.forEach(field.domain.codedValues, lang.hitch(this, function (domainValue) {
                options.push({ name: domainValue.name, id: domainValue.code });
              }));
            }
          }));
        }
        return options;
      },

      /**
      * This function is used to save parcel polygon, polyline.
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      saveData: function (dataObj) {
        //check if parcel is closed or not, if it is not closed confirm if still user wants to save the parcel.
        if (dataObj.miscloseDetails &&
          (dataObj.miscloseDetails.LengthConversions.meters === 0 || dataObj.appliedCompassRule)) {
          this._saveParcel(dataObj);
        } else {
          var confirmationBox;
          confirmationBox = new Message({
            message: this.nls.planInfo.saveNonClosedParcelConfirmationMessage,
            type: "question",
            buttons: [{
              "label": this.nls.planInfo.confirmationBoxYESButtonLabel,
              "onClick": lang.hitch(this, function () {
                confirmationBox.close();
                this._saveParcel(dataObj);
              })
            }, { "label": this.nls.planInfo.confirmationBoxNOButtonLabel }]
          });
        }
      },

      /**
      * This function is used to save polygon parcel.
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _saveParcel: function (dataObj) {
        this._itemList = dataObj.itemList;
        this.planSettings = dataObj.planSettings;
        //if parcel is closed then save the polygon and poly-lines
        //else only save poly-lines
        if (dataObj.miscloseDetails &&
          (dataObj.miscloseDetails.LengthConversions.meters === 0 || dataObj.appliedCompassRule)) {
          if (dataObj.polygonDeleteArr.length === 0) {
            this._createPolygonData(dataObj);
          } else {
            this._deletePolygonBeforeSaving(dataObj);
          }
        } else {
          // Suppose, If user has edited closed parcel & then modified it to open parcel & then
          // tried to save it. In this, 1st delete that closed parcel & then just save the lines
          // of open parcel.
          if (dataObj.polygonDeleteArr.length > 0) {
            this._deletePolygonBeforeSaving(dataObj);
          } else {
            this._createPolylineData(null);
          }
        }
      },

      /**
      * This function is used to create polygon geometry according to boundary lines.
      * it will also save graphic on graphicLayer and return the graphic geometry.
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _createParcelPolygon: function () {
        var i, j, boundaryLinesArray, lineFeatures, parcelPolygon, polygonGraphic;
        boundaryLinesArray = [];
        lineFeatures = this.parcelLinesGraphicsLayer.graphics;
        //loop through all the line features and only consider boundary lines for creating polygon
        for (i = 0; i < lineFeatures.length; i++) {
          //Add if it is boundary lines in array
          if (this._itemList[i].LineSymbol.type === this.config.BoundaryLineType) {
            for (j = 0; j < lineFeatures[i].geometry.paths.length; j++) {
              boundaryLinesArray.push(lineFeatures[i].geometry.paths[j]);
            }
          }
        }
        //create polygon geometry and add it to the graphic layer
        if (boundaryLinesArray.length > 0) {
          parcelPolygon = geometryUtils.getPolygonFromPolyLines(
            boundaryLinesArray, false, true);
          if (parcelPolygon) {
            this.parcelPolygonGraphicsLayer.clear();
            polygonGraphic = new Graphic(parcelPolygon);
            this.parcelPolygonGraphicsLayer.add(polygonGraphic);
            parcelPolygon = this.parcelPolygonGraphicsLayer.graphics[0].geometry;
          }
        }
        return parcelPolygon;
      },

      /**
      * This function is used to create polygon & modify its data before saving.
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _createPolygonData: function (dataObj) {
        var addsFeatureArr, attributes, polygon, selectedDocumentType, polygonGraphic, units;
        if (dataObj.miscloseDetails &&
          (dataObj.miscloseDetails.LengthConversions.meters === 0 || dataObj.appliedCompassRule)) {
          this.loading.show();
          addsFeatureArr = [];
          attributes = {};
          units = this.polygonLayerUnit;
          //get selected document type from dropdown
          if (this.documentTypeDropdown.hasOwnProperty("item") &&
            this.documentTypeDropdown.item && this.documentTypeDropdown.item.hasOwnProperty("id")) {
            selectedDocumentType = this.documentTypeDropdown.item.id;
          } else {
            selectedDocumentType = null;
          }
          //get the parcel polygon from boundary lines
          polygon = this._createParcelPolygon();
          if (polygon) {
            //Add all the attributes for parcel polygon
            attributes[this.config.polygonLayer.parcelName.name] =
              this.parcelNameTextBox.get("value");
            attributes[this.config.polygonLayer.statedArea.name] = dataObj.statedArea;
            attributes[this.config.polygonLayer.rotation.name] = dataObj.rotation;
            attributes[this.config.polygonLayer.scale.name] = dataObj.scale;
            attributes[this.config.polygonLayer.miscloseRatio.name] =
              dataObj.miscloseDetails.miscloseValue;
            attributes[this.config.polygonLayer.miscloseDistance.name] =
            this._getValueAccToFeatureLayerUnit(
                units,dataObj.miscloseDetails, "LengthConversions");
            attributes[this.config.polygonLayer.planName.name] = this.planNameTextBox.get("value");
            attributes[this.config.polygonLayer.documentType.name] = selectedDocumentType;
            polygonGraphic = new Graphic(polygon, null, attributes);
            addsFeatureArr.push(polygonGraphic);
            this._saveParcelPolygon(addsFeatureArr);
          } else {
            this._showMessage(this.nls.planInfo.unableToCreatePolygonParcel);
          }
        } else {
          this._createPolylineData(null);
        }
      },

      /**
      * This function is used to set parcel information like name, document type & plan name while * editing.
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      setParcelInformation: function (polygon) {
        var documentTypeValue;
        documentTypeValue = polygon[0].attributes[this.config.polygonLayer.documentType.name];
        this.parcelNameTextBox.set("value",
          polygon[0].attributes[this.config.polygonLayer.parcelName.name]);
        this.planNameTextBox.set("value",
          polygon[0].attributes[this.config.polygonLayer.planName.name]);
        if (documentTypeValue !== null &&
          documentTypeValue !== "" && documentTypeValue !== undefined) {
          this.documentTypeDropdown.set("item",
            this.documentTypeDropdown.store.get(documentTypeValue));
        }
      },

      /**
      * This function is used to delete polygon before saving
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _deletePolygonBeforeSaving: function (dataObj) {
        this._polygonLayer = this.map.getLayer(this.config.polygonLayer.layerId);
        if (this._polygonLayer) {
          this._polygonLayer.applyEdits(null, null, dataObj.polygonDeleteArr,
            lang.hitch(this, function () {
              this._deleteLinesBeforeSaving(dataObj);
            }), lang.hitch(this, function () {
              this._showMessage(this.nls.planInfo.unableToSavePolygonParcel);
            }));
        } else {
          this._showMessage(this.nls.planInfo.unableToSavePolygonParcel);
        }
      },

      /**
      * This function is used to delete lines before saving
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _deleteLinesBeforeSaving: function (dataObj) {
        var polylineLayer;
        polylineLayer = this.map.getLayer(this.config.polylineLayer.layerId);
        if (polylineLayer) {
          polylineLayer.applyEdits(null, null, dataObj.polylineDeleteArr,
            lang.hitch(this, function () {
              this._createPolygonData(dataObj);
            }), lang.hitch(this, function () {
              this._showMessage(this.nls.planInfo.unableToUpdateParcelLines);
            }));
        } else {
          this._showMessage(this.nls.planInfo.unableToUpdateParcelLines);
        }
      },

      /**
      * This function is used to save parcel polygon.
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _saveParcelPolygon: function (addsFeatureArr) {
        this._polygonLayer = this.map.getLayer(this.config.polygonLayer.layerId);
        if (this._polygonLayer) {
          this._polygonLayer.applyEdits(addsFeatureArr, null, null,
            lang.hitch(this, function (adds) {
              var query;
              this._polygonLayer.refresh();
              query = new Query();
              query.objectIds = [adds[0].objectId];
              query.returnGeometry = false;
              query.outFields = [this.config.polygonLayer.relatedGUID.name];
              var queryTask = new QueryTask(this._polygonLayer.url);
              queryTask.execute(query, lang.hitch(this, function (result) {
                this.loading.hide();
                this._createPolylineData(
                  result.features[0].attributes[this.config.polygonLayer.relatedGUID.name]);
              }), lang.hitch(this, function () {
                this.loading.hide();
                this._showMessage(this.nls.planInfo.unableToSaveParcelLines);
              }));
            }), lang.hitch(this, function () {
              this.loading.hide();
              this._showMessage(this.nls.planInfo.unableToSavePolygonParcel);
            }));
        } else {
          this.loading.hide();
          this._showMessage(this.nls.planInfo.unableToSavePolygonParcel);
        }
      },

      /**
      * This function is used to get value of distance, length accordingly to feature layer unit
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _getValueAccToFeatureLayerUnit: function (units, values, valueAttribute) {
        if (values.hasOwnProperty(valueAttribute) && values[valueAttribute]) {
          switch (units) {
            case "meters":
            case "degrees":
              return values[valueAttribute].meters;
            case "feet":
              return values[valueAttribute].feet;
            case "uSSurveyFeet":
              return values[valueAttribute].uSSurveyFeet;
            default:
              return null;
          }
        } else {
          return null;
        }
      },

      /**
      * This function is used to create polyline & modify its data before saving.
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _createPolylineData: function (guid) {
        var attributes, values, units, addsFeatureArr, polyline, polylineGraphic,
          polylineJSON, features, itemList;
        this.loading.show();
        features = this.parcelLinesGraphicsLayer.graphics;
        units = this.polylineLayerUnit;
        itemList = this._itemList;
        addsFeatureArr = [];
        for (var i = 0; i < features.length; i++) {
          attributes = {};
          values = itemList[i];
          // save bearing in decimal degree
          attributes[this.config.polylineLayer.bearing.name] = values.BearingConversions.naDD;
          // store distance in layers unit
          attributes[this.config.polylineLayer.distance.name] =
            this._getValueAccToFeatureLayerUnit(units, values, "LengthConversions");
          // save the lineType as drawn by user
          attributes[this.config.polylineLayer.lineType.name] =
            values.LineSymbol.type;
          // store radius in layers unit
          attributes[this.config.polylineLayer.radius.name] =
            this._getValueAccToFeatureLayerUnit(units, values, "RadiusConversions");
          // store arcLength & chordLength
          if (attributes[this.config.polylineLayer.radius.name] !== null &&
            attributes[this.config.polylineLayer.radius.name] !== "" &&
            attributes[this.config.polylineLayer.radius.name] !== undefined) {
            // store arc length in layers unit
            attributes[this.config.polylineLayer.arcLength.name] =
              this._getValueAccToFeatureLayerUnit(units, values, "ArcLengthConversions");
            // store chord length in layers unit
            attributes[this.config.polylineLayer.chordLength.name] =
              this._getValueAccToFeatureLayerUnit(units, values, "ChordLengthConversions");
            attributes[this.config.polylineLayer.distance.name] = null;
          } else {
            attributes[this.config.polylineLayer.arcLength.name] = null;
            attributes[this.config.polylineLayer.chordLength.name] = null;
          }
          attributes[this.config.polylineLayer.relatedGUID.name] = guid;
          // sequence of line
          attributes[this.config.polylineLayer.sequenceId.name] = i;
          // create polyline
          polylineJSON = features[i].geometry.toJson();
          polyline = new Polyline(polylineJSON);
          polylineGraphic = new Graphic(polyline, null, attributes, null);
          addsFeatureArr.push(polylineGraphic);
        }
        this._saveParcelLines(addsFeatureArr);
      },

      /**
      * This function is used to save parcel lines.
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      _saveParcelLines: function (addsFeatureArr) {
        var polylineLayer;
        polylineLayer = this.map.getLayer(this.config.polylineLayer.layerId);
        if (polylineLayer) {
          polylineLayer.applyEdits(addsFeatureArr, null, null,
            lang.hitch(this, function () {
              this.loading.hide();
              this._showMessage(this.nls.planInfo.parcelSavedSuccessMessage);
              this.emit("displayMainPageAfterSave");
            }), lang.hitch(this, function () {
              this.loading.hide();
              this._showMessage(this.nls.planInfo.unableToSaveParcelLines);
            }));
        } else {
          this.loading.hide();
          this._showMessage(this.nls.planInfo.unableToSaveParcelLines);
        }
      },

      /**
      * This function is used to validate parcel details before saving
      * @memberOf widgets/ParcelDrafter/PlanInfo
      **/
      validateParcelDetails: function (statedArea) {
        var parcelName, dataObj, isStatedAreaValid;
        dataObj = {};
        isStatedAreaValid = false;
        parcelName = this.parcelNameTextBox.get("value").trim();
        if (parcelName !== null && parcelName !== "") {
          if (statedArea !== null && statedArea !== "") {
            switch (this.config.polygonLayer.statedArea.type) {
              case "esriFieldTypeString":
                isStatedAreaValid = true;
                break;
              case "esriFieldTypeDouble":
              case "esriFieldTypeInteger":
                if (!isNaN(statedArea)) {
                  isStatedAreaValid = true;
                }
                break;
            }
            if (isStatedAreaValid) {
              dataObj.status = true;
              return dataObj;
            } else {
              dataObj.status = false;
              dataObj.message = this.nls.planInfo.enterValidStatedAreaNameMessage;
              return dataObj;
            }
          } else {
            dataObj.status = true;
            return dataObj;
          }
        } else {
          dataObj.status = false;
          dataObj.message = this.nls.planInfo.enterValidParcelNameMessage;
          return dataObj;
        }
      }
    });
  });