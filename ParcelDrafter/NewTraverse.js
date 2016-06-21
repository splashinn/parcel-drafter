define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/Evented',
  'dojo/text!./NewTraverse.html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dnd/Source',
  'dojo/on',
  'dijit/form/TextBox',
  './SymbolSelector',
  './MiscloseDetails',
  './ParcelTools',
  './PlanInfo',
  './geometryUtils',
  './utils',
  'esri/graphic',
  'esri/symbols/jsonUtils',
  'esri/layers/GraphicsLayer',
  'esri/graphicsUtils',
  'dojo/dom-attr',
  'dojo/query',
  'esri/SpatialReference',
  'esri/geometry/scaleUtils',
  'dojo/keys',
  'dijit/focus'
],
  function (
    declare,
    BaseWidget,
    _WidgetsInTemplateMixin,
    Evented,
    NewTraverseTemplate,
    lang,
    array,
    domClass,
    domConstruct,
    Source,
    on,
    ValidationTextBox,
    SymbolSelector,
    MiscloseDetails,
    ParcelTools,
    PlanInfo,
    geometryUtils,
    utils,
    Graphic,
    jsonUtils,
    GraphicsLayer,
    graphicsUtils,
    domAttr,
    query,
    SpatialReference,
    scaleUtils,
    keys,
    focusUtil
  ) {
    return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-widget-ParcelDrafter',
      templateString: NewTraverseTemplate,
      parcelLinesGraphicsLayer: null,
      parcelPointsGraphicsLayer: null,
      parcelPolygonGraphicsLayer: null,
      _itemList: [], //to contain parcel line data
      _nodes: [], //To contain dnd nodes
      _dndContainer: null, //To contain dojo dnd container
      startPoint: null,//To contain start point geometry
      _startPointForNextLine: null,//To contain start point for next line
      _planSettings: null, // to store updated plan settings
      _arrayOfAllBoundaryLines: [], //to store polylines of boundary type
      _rotationAngle: 0, //to store the rotation angle
      _scaleValue: 1, //to store the scale
      lineLayerSpatialReference: null, // to store spatial reference of line layer
      polygonLayerSpatialReference: null, //to store spatial reference of polygon layer
      polygonDeleteArr: [], // to store polygon that needs to be deleted before saving edited one
      polylineDeleteArr: [], // to store polyline that needs to be deleted before saving edited one

      postCreate: function () {
        domClass.add(this.domNode, "esriCTNewTraverseGrid");
        //create graphics layer for geometries
        this._addGraphicsLayer();
        //Create New Traverse instance
        this._createTraverseGrid();
        //handle blur events on initial row text-boxes
        this._handleBlurEventsOnInitialRow();
        //Display symbol selector div for new row
        this._symbolSelector = this._createLineSelector(this.lineSymbolNode, null);
        this.own(on(this.screenDigitizationNode, "click", lang.hitch(this,
          this._onDigitizationButtonClicked)));
        this.own(on(this.zoomToNode, "click", lang.hitch(this, this._onZoomButtonClicked)));
        this.own(on(this.expandCollapseNode, "click", lang.hitch(this,
          this._onExpandCollapseClicked)));
        this.own(on(this.addButton, "click", lang.hitch(this, function () {
          //send flag added from screen digitization as false, as user is clicking on add button.
          this._addNewItem(false);
        })));
        //Create misclosed Details instance
        this._createMiscloseDetails();
        //Initiates parcel tools
        this._createParcelTools();
        //Create Plan information instance
        this._createPlanInfo();
      },

      /**
      * This function will add graphics layers for all the geometry types
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _addGraphicsLayer: function () {
        this.parcelPolygonGraphicsLayer = new GraphicsLayer();
        this.parcelLinesGraphicsLayer = new GraphicsLayer();
        this.parcelPointsGraphicsLayer = new GraphicsLayer();
        this.map.addLayer(this.parcelPolygonGraphicsLayer);
        this.map.addLayer(this.parcelLinesGraphicsLayer);
        this.map.addLayer(this.parcelPointsGraphicsLayer);
      },

      /**
      * Function to handle blur events for the textboxes in initial row.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _handleBlurEventsOnInitialRow: function () {
        // to validate bearing on tab/enter key pressed in bearing node
        this.own(on(this.bearingNode, "keypress", lang.hitch(this, this._bearingValueEntered)));
        // to validate distance on tab/enter key pressed in length node
        this.own(on(this.lengthNode, "keypress", lang.hitch(this, this._lengthValueEntered)));
        // to validate radius on tab/enter key pressed in radius node
        this.own(on(this.radiusNode, "keypress", lang.hitch(this, this._radiusValueEntered)));
      },

      /**
      * Validates bearing on tab/enter key pressed in bearing node
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _bearingValueEntered: function (evt) {
        var charOrCode, bearingValue;
        charOrCode = evt.charCode || evt.keyCode;
        //Check for ENTER key
        if (charOrCode === keys.ENTER || charOrCode === keys.TAB) {
          bearingValue = this.bearingNode.get("value");
          //check if entered bearing is * then copy the value from last entry
          if (bearingValue === "*" && this._itemList.length > 0) {
            bearingValue = this._itemList[this._itemList.length - 1].Bearing;
            this.bearingNode.set("value", bearingValue);
          }
          if (!this._validateBearing(bearingValue)) {
            this._showMessage(this.nls.newTraverse.invalidBearingMessage);
          } else {
            if (charOrCode === keys.ENTER) {
              focusUtil.focus(this.lengthNode);
            }
          }
        }
      },

      /**
      * Validates lenght on tab/enter key pressed in length node
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _lengthValueEntered: function (evt) {
        var charOrCode, lengthValue;
        charOrCode = evt.charCode || evt.keyCode;
        //Check for ENTER key
        if (charOrCode === keys.ENTER || charOrCode === keys.TAB) {
          lengthValue = this.lengthNode.get("value");
          //check if entered length is * then copy the value from last entry
          if (lengthValue === "*" && this._itemList.length > 0) {
            lengthValue = this._itemList[this._itemList.length - 1].Length;
            this.lengthNode.set("value", lengthValue);
          }
          if (!this._validateLength(lengthValue)) {
            this._showMessage(this.nls.newTraverse.invalidLengthMessage);
          } else {
            if (charOrCode === keys.ENTER) {
              focusUtil.focus(this.radiusNode);
            }
          }
        }
      },

      /**
      * Validates radius on tab/enter key pressed in radius node
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _radiusValueEntered: function (evt) {
        var charOrCode, radiusValue;
        charOrCode = evt.charCode || evt.keyCode;
        //Check for ENTER key
        if (charOrCode === keys.ENTER || charOrCode === keys.TAB) {
          radiusValue = this.radiusNode.get("value");
          //check if entered radius is * then copy the value from last entry
          if (radiusValue === "*" && this._itemList.length > 0) {
            radiusValue = this._itemList[this._itemList.length - 1].Radius;
            this.radiusNode.set("value", radiusValue);
          }
          //don't validate if radius is empty
          if (radiusValue === "") {
            this._addNewItem();
            focusUtil.focus(this.bearingNode);
            return;
          }
          if (!this._validateLength(radiusValue)) {
            this._showMessage(this.nls.newTraverse.invalidRadiusMessage);
          } else {
            this._addNewItem();
            focusUtil.focus(this.bearingNode);
          }
        }
      },

      /**
      * This function is used to validate bearing
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _validateBearing: function (bearingValue) {
        var bearingData;
        bearingData = utils.categorizeBearingFormat(bearingValue, this._planSettings);
        if (!bearingData) {
          return null;
        } else {
          return bearingData;
        }
      },

      /**
      * This function is used to validate length
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _validateLength: function (length, units) {
        var lengthData;
        switch (units) {
          case "feets":
            lengthData = utils.categorizeLengthFormatForFeet(length);
            break;
          case "meters":
            lengthData = utils.categorizeLengthFormat(length, "meters");
            break;
          case "uSSurveyFeet":
            lengthData = utils.categorizeLengthFormat(length, "uSSurveyFeet");
            break;
          default:
            lengthData = utils.categorizeLengthFormat(length,
              this._planSettings.distanceAndLengthUnits);
        }
        if (!lengthData) {
          return null;
        } else {
          return lengthData;
        }
      },

      /**
      * This function is used to validate all the fields,
      * and return the values object if all the values are valid else it will return null.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _getValidatedValues: function (updatedValues) {
        var values = {}, bearingConversions, lengthConversions, radiusConversions;
        if (updatedValues) {
          values = updatedValues;
        } else {
          values.LineSymbol = this._symbolSelector.selectedSymbol;
          values.Bearing = this.bearingNode.get("value");
          values.Length = this.lengthNode.get("value");
          values.Radius = this.radiusNode.get("value");
        }
        //if all the values are empty return null
        if (lang.trim(values.Bearing.toString()) === "" &&
          lang.trim(values.Length.toString()) === "" &&
          lang.trim(values.Radius.toString()) === "") {
          return null;
        } else {
          bearingConversions = this._validateBearing(values.Bearing);
          //if valid bearing then check if length or radius is set
          if (bearingConversions) {
            values.BearingConversions = bearingConversions;
            //if bearing is entered but both the length & radius is not entered return null
            if (lang.trim(values.Length.toString()) === "" &&
              lang.trim(values.Radius.toString()) === "") {
              return null;
            }
            //if length is entered validate it
            if (lang.trim(values.Length.toString()) !== "") {
              lengthConversions = this._validateLength(values.Length);
              if (lengthConversions) {
                values.LengthConversions = lengthConversions;
              } else {
                return null;
              }
            }
            //if radius is entered validate it
            if (lang.trim(values.Radius.toString()) !== "") {
              radiusConversions = this._validateLength(values.Radius);
              if (radiusConversions) {
                values.RadiusConversions = radiusConversions;
                //validate if radius and distance are in proportion only when radius is not zero
                if (values.RadiusConversions.meters !== 0 &&
                  ((parseInt(Math.abs(values.RadiusConversions.meters), 10) * 2) <
                    parseInt(values.LengthConversions.meters, 10))) {
                  return null;
                }
              } else {
                return null;
              }
            } else {
              //as radius is empty set radiusConversions to null
              values.RadiusConversions = null;
              //TODO: check if it is required, added AS PER PRATIK'S COMMENT
              //if radius is not entered then length cannot be negative
              if (parseInt(values.LengthConversions.meters, 10) < 0) {
                return null;
              }
            }
          } else {
            return null;
          }
        }
        return values;
      },

      /**
      * zooms map extent to the drawn parcel
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _onZoomButtonClicked: function () {
        //set map extent to lines graphic layer
        this._setExtentToLayer(this.parcelLinesGraphicsLayer, true);
      },

      /**
      * for hide/show traverse grid and expand/collapse button
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _onExpandCollapseClicked: function () {
        domClass.toggle(this.traverseGrid, "esriCTHidden");
        if (domClass.contains(this.expandCollapseNode, "esriCTExpand")) {
          domAttr.set(this.expandCollapseNode, "title",
            this.nls.planSettings.collapseGridTooltipText);
          domClass.replace(this.expandCollapseNode, "esriCTCollapse", "esriCTExpand");
        } else {
          domAttr.set(this.expandCollapseNode, "title",
            this.nls.planSettings.expandGridTooltipText);
          domClass.replace(this.expandCollapseNode, "esriCTExpand", "esriCTCollapse");
        }
      },

      /**
      * Add new row to the grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _addNewItem: function (isAddedFromScreenDigitization) {
        var values, radius, newBearing;
        values = this._getValidatedValues();
        if (values) {
          //substract the rotation form actual bearing in case of screen digitization
          //and update the bearing conversions accordingly
          if (isAddedFromScreenDigitization) {
            if (this._rotationAngle) {
              newBearing = values.BearingConversions.naDD - this._rotationAngle;
              values.Bearing = newBearing;
              values.BearingConversions = this._validateBearing(newBearing);
            }
          }
          this._itemList.push(values);
          this._createRow(values, this._itemList.length - 1);
          this._resetEntryRow();
          radius = lang.trim(values.Radius.toString());
          //if radius is not set it means draw line else draw arc
          if (radius === "" || radius === 0) {
            //draw new line and set the extent to line layer
            this._drawStraightLine(values, true);
            // show traverse tools zoom and expandCollapse
            this._showHideTraverseTools();
          } else {
            this._drawArc(values, true);
            // show traverse tools zoom and expandCollapse
            this._showHideTraverseTools();
          }
        } else {
          this._showMessage(this.nls.newTraverse.enterValidValuesMessage);
        }
      },

      /**
      * enables on screen digitization widget
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _onDigitizationButtonClicked: function () {
        // enables/disables on screen digitization tool
        domClass.toggle(this.screenDigitizationNode, "esriCTEnableButton");
        // if screen digitization tool enabled the activates tool
        // else disables the digitization tool
        if (domClass.contains(this.screenDigitizationNode, "esriCTEnableButton")) {
          this.emit("activateDigitizationTool");
        } else {
          this.emit("deActivateDigitizationTool");
        }
      },


      /**
      * Creates Misclose Details instance
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createMiscloseDetails: function () {
        //Create PlanSettings Instance
        this._misCloseDetailsInstance = new MiscloseDetails({
          nls: this.nls,
          config: this.config
        }, domConstruct.create("div", {}, this.misCloseDetailsNode));
        //on load no misclose info
        this._misCloseDetailsInstance.setMiscloseDetails(null);
      },

      /**
      * Initiates parcel tools
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createParcelTools: function () {
        this._parcelToolInstance = new ParcelTools({
          nls: this.nls,
          config: this.config
        }, domConstruct.create("div", {}, this.parcelToolsNode));
        //by default hide the tools
        this._parcelToolInstance.showHideTools(false);
        this._parcelToolInstance.on("rotateGeometries", lang.hitch(this, function (rotationAngle) {
          if (rotationAngle !== this._rotationAngle) {
            this._rotationAngle = rotationAngle;
            if (this._itemList && this._itemList.length > 0) {
              this.setStartPoint(this.startPoint);
            }
          }
        }));
        this._parcelToolInstance.on("scaleGeometries", lang.hitch(this, function (scaleValue) {
          if (scaleValue !== this._scaleValue) {
            this._scaleValue = scaleValue;
            if (this._itemList && this._itemList.length > 0) {
              this.setStartPoint(this.startPoint);
            }
          }
        }));
      },

      /**
      * Creates Plan Info instance
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createPlanInfo: function () {
        this._planInfoInstance = new PlanInfo({
          map: this.map,
          nls: this.nls,
          config: this.config,
          loading: this.loading,
          geometryService: this.geometryService,
          parcelPolygonGraphicsLayer: this.parcelPolygonGraphicsLayer,
          parcelLinesGraphicsLayer: this.parcelLinesGraphicsLayer,
          polylineLayerUnit: this._getUnitValueForSR(this.lineLayerSpatialReference),
          polygonLayerUnit: this._getUnitValueForSR(this.polygonLayerSpatialReference)
        }, domConstruct.create("div", {}, this.planInfoNode));
        //Handle click event of parcelInfo cancel button
        this._planInfoInstance.on("cancelTraversedParcel", lang.hitch(this, function () {
          this.emit("cancelTraverse");
        }));
        //Handle show message event of parcelInfo
        this._planInfoInstance.on("showMessage", lang.hitch(this, function (msg) {
          this._showMessage(msg);
        }));
        //Handle click event of parcelInfo save button
        this._planInfoInstance.on("saveTraversedParcel", lang.hitch(this, function () {
          var dataObj;
          if (this._itemList && this._itemList.length > 0) {
            var parcelValidationDetails;
            parcelValidationDetails = this._planInfoInstance.validateParcelDetails();
            if (parcelValidationDetails.status) {
              dataObj = {};
              dataObj.itemList = this._itemList;
              dataObj.statedArea = this._misCloseDetailsInstance.traverseStatedArea.get("value");
              dataObj.rotation = this._rotationAngle;
              dataObj.scale = this._scaleValue;
              dataObj.appliedCompassRule = this.appliedCompassRule;
              dataObj.miscloseDetails = this._misCloseDetailsInstance.getMiscloseDetails();
              dataObj.polygonDeleteArr = this.polygonDeleteArr;
              dataObj.polylineDeleteArr = this.polylineDeleteArr;
              dataObj.planSettings = this._planSettings;
              this._planInfoInstance.saveData(dataObj);
            } else {
              this._showMessage(parcelValidationDetails.message);
            }
          } else {
            //TODO: wether to disable save button or show error if no traverse added
            this._showMessage(this.nls.newTraverse.enterValidParcelInfoMessage);
          }
        }));
        // to display main page once parcel is saved
        this._planInfoInstance.on("displayMainPageAfterSave", lang.hitch(this, function () {
          this.emit("displayMainPageAfterSave");
        }));
      },

      /**
      * Creates rows for traverse grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createTraverseGrid: function () {
        var i;
        this._nodes = [];
        //empty traverse grid node
        domConstruct.empty(this.traverseGrid);
        this._dndContainer = new Source(this.traverseGrid, {
          skipForm: true
        });
        for (i = 0; i < this._itemList.length; i++) {
          this._createRow(this._itemList[i], i);
        }
        this._dndContainer.on('DndDrop', lang.hitch(this, this._onDndDrop));
        this._dndContainer.insertNodes(false, this._nodes);
      },

      /**
      * Creates input fields for grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createFieldInputs: function (nodeContainer, value, className) {
        var inputTextBox = new ValidationTextBox({
          "value": value,
          "class": className ? className : ""
        });
        inputTextBox.placeAt(nodeContainer);
        this.own(on(inputTextBox, "blur", lang.hitch(this, function () {
          var index = parseInt(domAttr.get(nodeContainer, "rowIndex"), 10);
          this._updatePracelValues(inputTextBox, index);
        })));

        this.own(on(inputTextBox, "keypress", lang.hitch(this, function (evt) {
          var charOrCode, index;
          charOrCode = evt.charCode || evt.keyCode;
          //Check for ENTER key
          if (charOrCode === keys.ENTER) {
            index = parseInt(domAttr.get(nodeContainer, "rowIndex"), 10);
            this._updatePracelValues(inputTextBox, index);
          }
        })));
      },

      /**
      * Create new row with fields in grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createRow: function (values, i) {
        var row, node, radius, radiusConversions;
        row = domConstruct.create("div", { "class": "dojoDndItem esriCTRow", "rowIndex": i });
        node = domConstruct.create("div", { "rowIndex": i }, row);
        this._createLineSelector(node, values.LineSymbol, i);
        this._createFieldInputs(row,
          this._getBearingAccordingToPlanSettings(values.BearingConversions), "esriCTBearingRow");
        this._createFieldInputs(row,
          values.LengthConversions[this._planSettings.distanceAndLengthUnits + "Round"],
          "esriCTLengthRow");
        //create radius entry box
        radiusConversions = values.RadiusConversions;
        if (radiusConversions) {
          radius = values.RadiusConversions[this._planSettings.distanceAndLengthUnits + "Round"];
        } else {
          radius = "";
        }
        this._createFieldInputs(row, radius, "esriCTRadiusRow");
        this._createDeleteButton(row, i);
        this._nodes.push(row);
        this._dndContainer.clearItems();
        this._dndContainer.insertNodes(false, this._nodes);
      },

      /**
      * Creates line selector field for grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createLineSelector: function (node, symbol, index) {
        var symbolSelectorPopup, lineTypesData;
        lineTypesData = this.config.lineTypes;
        symbolSelectorPopup = new SymbolSelector({
          "hideOnSelect": true,
          "symbolData": lineTypesData
        }, node);
        domClass.add(symbolSelectorPopup.domNode, "esriCTSymbolContainer");
        if (symbol) {
          symbolSelectorPopup.selectSymbol(symbol);
          domAttr.set(symbolSelectorPopup.domNode, "rowIndex", index);
          symbolSelectorPopup.onSelect = lang.hitch(this, function (selectedSymbol) {
            var values, index;
            index = parseInt(domAttr.get(symbolSelectorPopup.domNode, "rowIndex"), 10);
            values = this._itemList[index];
            //update selected symbol in the item list
            values.LineSymbol = selectedSymbol;
            //on updating symbol set start point it will redraw everything
            this.setStartPoint(this.startPoint);
          });
        } else {
          symbolSelectorPopup.setDefault();
        }
        return symbolSelectorPopup;
      },

      /**
      * Attach 'click' event on delete button to delete row from grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createDeleteButton: function (row, index) {
        var deleteIcon, deleteButton;
        deleteButton = domConstruct.create("div", { "class": "esriCTDeleteRow" }, row);
        deleteIcon = domConstruct.create("div",
          {
            "class": "esriCTDeleteIcon",
            "rowIndex": index,
            "title": this.nls.traverseSettings.deleteButtonTitle
          }, deleteButton);
        on(deleteIcon, "click", lang.hitch(this, function (evt) {
          var rowIndex = parseInt(domAttr.get(evt.currentTarget, "rowIndex"), 10);
          this._deleteRow(row, rowIndex);
        }));
      },

      /**
      * Delete row from grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _deleteRow: function (row, index) {
        if (this._itemList.length) {
          this._dndContainer.delItem(row.id);
          domConstruct.destroy(row);
          this._nodes.splice(index, 1);
          this._itemList.splice(index, 1);
          this._dndContainer.sync();
          this._updateRowIndexes();
          //as we have removed the point now redraw everything
          this.setStartPoint(this.startPoint);
          this._showHideTraverseTools();
        }
      },

      /**
      * Update row index in attributes of the dom elements.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _updateRowIndexes: function () {
        var allRows;
        allRows = query(".esriCTRow", this.traverseGrid);
        array.forEach(allRows, lang.hitch(this, function (row, index) {
          var deleteBtn, symbolNode;
          domAttr.set(row, "rowIndex", index);
          // Update delete button index
          deleteBtn = query(".esriCTDeleteIcon", row)[0];
          if (deleteBtn) {
            domAttr.set(deleteBtn, "rowIndex", index);
          }
          //Update symbol selector node index
          symbolNode = query(".esriCTSymbolContainer", row)[0];
          if (symbolNode) {
            domAttr.set(symbolNode, "rowIndex", index);
          }
        }));
      },

      /**
      * Callback handler called on node dragged and dropped
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _onDndDrop: function () {
        var allNodes, updateItemList = [];
        this._dndContainer.sync();
        allNodes = this._dndContainer.getAllNodes();
        allNodes.forEach(lang.hitch(this, function (currentNode) {
          var item, rowIndex;
          rowIndex = parseInt(domAttr.get(currentNode, "rowIndex"), 10);
          item = this._itemList[rowIndex];
          //push items in updated sequence
          updateItemList.push(item);
        }));
        this._nodes = allNodes;
        this._itemList = [];
        //update item list with updated item sequence
        this._itemList = updateItemList;
        this._updateRowIndexes();
        this.setStartPoint(this.startPoint);
      },

      /**
      * Update values for respective row
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _updatePracelValues: function (inputTextBox, index) {
        var values, updatedCol, updatedValue, updatedValueAsPerPlanSettings,
          validatedValues, isUpdated = false, prevValue;
        //get values for selected row
        values = this._itemList[index];
        //get updated value
        updatedValue = inputTextBox.get("value");
        //trim the value if it exist
        if (updatedValue) {
          updatedValue = lang.trim(updatedValue.toString());
        } else {
          updatedValue = "";
        }
        //check which attribute value is changed
        if (domClass.contains(inputTextBox.domNode, "esriCTBearingRow") &&
          values.Bearing !== updatedValue) {
          updatedCol = "Bearing";
          //capture previous value before updating the new entered one
          prevValue = values.Bearing;
          //if bearing value is changed
          values.Bearing = updatedValue;
          isUpdated = true;
        } else if (domClass.contains(inputTextBox.domNode, "esriCTLengthRow") &&
          values.Length !== updatedValue) {
          updatedCol = "Length";
          //capture previous value before updating the new entered one
          prevValue = values.Length;
          //if length value is changed
          values.Length = updatedValue;
          isUpdated = true;
        } else if (domClass.contains(inputTextBox.domNode, "esriCTRadiusRow") &&
          values.Radius !== updatedValue) {
          updatedCol = "Radius";
          //capture previous value before updating the new entered one
          prevValue = values.Radius;
          //if radius value is changed
          values.Radius = updatedValue;
          isUpdated = true;
        }
        //if value is updated then only redraw the parcel
        if (isUpdated) {
          //validate updated values to draw parcel
          validatedValues = this._getValidatedValues(values);
          if (validatedValues) {
            if (updatedCol === "Bearing") {
              updatedValueAsPerPlanSettings =
                this._getBearingAccordingToPlanSettings(validatedValues.BearingConversions);
              //update the value in itemList
              values.Bearing = updatedValueAsPerPlanSettings;
              //show the entered value in textbox according to planSettings
              inputTextBox.set('value', updatedValueAsPerPlanSettings);
            } else if (updatedCol === "Length") {
              updatedValueAsPerPlanSettings =
                values.LengthConversions[this._planSettings.distanceAndLengthUnits];
              //update the value in itemList
              values.Length = updatedValueAsPerPlanSettings;
              //show the entered value in textbox according to planSettings
              inputTextBox.set('value', updatedValueAsPerPlanSettings);
            } else if (updatedCol === "Radius") {
              if (values.RadiusConversions) {
                updatedValueAsPerPlanSettings =
                  values.RadiusConversions[this._planSettings.distanceAndLengthUnits];
              } else {
                updatedValueAsPerPlanSettings = "";
              }
              //update the value in itemList
              values.Radius = updatedValueAsPerPlanSettings;
              //show the entered value in textbox according to planSettings
              inputTextBox.set('value', updatedValueAsPerPlanSettings);
            }
            //Finally set start point it will redraw everything
            this.setStartPoint(this.startPoint);
          } else {
            this._updateValues(values, updatedCol, inputTextBox);
            this._showMessage(this.nls.newTraverse.enterValidValuesMessage);
          }
        }
      },

      /**
      * Reset the entered value in textbox and values object according to updated col.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _updateValues: function (values, updatedCol, inputTextBox) {
        var updatedValue;
        //if entered value is not valid resetting the value to prev value.
        if (updatedCol === "Bearing") {
          values.Bearing = this._getBearingAccordingToPlanSettings(values.BearingConversions);
          updatedValue = values.Bearing;
        } else if (updatedCol === "Length") {
          values.Length = values.LengthConversions[this._planSettings.distanceAndLengthUnits];
          updatedValue = values.Length;
        } else if (updatedCol === "Radius") {
          if (values.RadiusConversions) {
            values.Radius =
              values.RadiusConversions[this._planSettings.distanceAndLengthUnits];
          } else {
            values.Radius = "";
          }
          updatedValue = values.Radius;
        }
        //also  show the value in textbox
        inputTextBox.set('value', updatedValue);
      },

      /**
      * Function to show/hide traverse tools
      * If any parcel points are entered then only, show zoom and expand/collapse grid button
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _showHideTraverseTools: function () {
        if (this._itemList && this._itemList.length > 0) {
          // show traverse tools zoom and expandCollapse
          domClass.remove(this.expandCollapseNode, "esriCTHidden");
          domClass.remove(this.zoomToNode, "esriCTHidden");
        } else {
          domClass.add(this.expandCollapseNode, "esriCTHidden");
          domClass.add(this.zoomToNode, "esriCTHidden");
        }
      },

      /**
      * Returns the bearing info object according to plan settings
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _getBearingAccordingToPlanSettings: function (bearingData, returnCompletValue) {
        if (this._planSettings.directionOrAngleType === "northAzimuth" &&
          this._planSettings.directionOrAngleUnits === "decimalDegree") {
          return returnCompletValue ? bearingData.naDD : bearingData.naDDRound;
        } else if (this._planSettings.directionOrAngleType === "northAzimuth" &&
          this._planSettings.directionOrAngleUnits === "degreeMinuteSeconds") {
          return bearingData.naDMC;
        } else if (this._planSettings.directionOrAngleType === "southAzimuth" &&
          this._planSettings.directionOrAngleUnits === "decimalDegree") {
          return returnCompletValue ? bearingData.saDD : bearingData.saDDRound;
        } else if (this._planSettings.directionOrAngleType === "southAzimuth" &&
          this._planSettings.directionOrAngleUnits === "degreeMinuteSeconds") {
          return bearingData.saDMC;
        } else if (this._planSettings.directionOrAngleType === "quadrantBearing" &&
          this._planSettings.directionOrAngleUnits === "decimalDegree") {
          return returnCompletValue ? bearingData.qb3DD : bearingData.qb3DDRound;
        } else if (this._planSettings.directionOrAngleType === "quadrantBearing" &&
          this._planSettings.directionOrAngleUnits === "degreeMinuteSeconds") {
          return bearingData.qb3DMC;
        }
      },

      /**
      * Reset filed value in grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _resetEntryRow: function () {
        this.bearingNode.set("value", "");
        this.lengthNode.set("value", "");
        this.radiusNode.set("value", "");
      },

      /**
      * Regenerate traverse grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _reGenerateTraverseGrid: function () {
        if (this._dndContainer) {
          this._dndContainer.destroy();
          this._dndContainer = null;
        }
        domConstruct.empty(this.traverseGrid);
        this._createTraverseGrid();
      },

      /**
      * Redraw's the parcel points and line with the already entered values
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _reDrawParcel: function () {
        this.parcelLinesGraphicsLayer.clear();
        this.parcelPointsGraphicsLayer.clear();
        //reset the boundary lines array
        this._arrayOfAllBoundaryLines = [];
        //draw start point as we cleared graphics layer
        this._drawPoint(this.startPoint);
        array.forEach(this._itemList, lang.hitch(this, function (value) {
          if (value.Radius === "" || value.Radius === 0) {
            this._drawStraightLine(value, false);
          } else {
            this._drawArc(value, false);
          }
        }));
        //set map extent to lines graphic layer
        this._setExtentToLayer(this.parcelLinesGraphicsLayer);
        //on draw complete set the parcel close status
        this.setParcelClosure();
      },

      /**
      * Set's start-point and if additional parcel points are added,
      * it will redraw the parcel considering update in start point.
      * Note: It will always set the start point in 102100 as.
      * we are using meters for calculating the endpoints.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      setStartPoint: function (startPoint) {
        var defaultStartPointSpatialRef = new SpatialReference(102100);
        geometryUtils.getProjectedGeometry(startPoint, defaultStartPointSpatialRef,
          this.geometryService).then(
          lang.hitch(this, function (projectedGeometry) {
            //set new start point
            this.startPoint = projectedGeometry;
            //as start point is changed this will be the start-point for next line
            this._startPointForNextLine = lang.clone(projectedGeometry);
            this._orgStartPointForNextLine = lang.clone(projectedGeometry);
            //clear applied compass rule flag
            this.appliedCompassRule = false;
            //if already some point are added redraw the parcel
            if (this._itemList.length > 0) {
              this._reDrawParcel();
            } else {
              //before drawing the start point clear layers
              this.parcelPointsGraphicsLayer.clear();
              this.parcelLinesGraphicsLayer.clear();
              //reset the boundary lines array
              this._arrayOfAllBoundaryLines = [];
              //draw new start point
              this._drawPoint(startPoint);
            }
          }));
      },

      /**
      * Add the  graphic on layer in map's spatial ref, if required it will project the geometry
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _addProjctedGraphic: function (layer, graphic, setExtentToLayer) {
        var newGraphic;
        if (this.map.spatialReference.wkid !== 102100) {
          geometryUtils.getProjectedGeometry(graphic.geometry, this.map.spatialReference,
            this.geometryService).then(lang.hitch(this, function (projectedGeometry) {
              if (projectedGeometry) {
                newGraphic = new Graphic(projectedGeometry, graphic.symbol);
                layer.add(newGraphic);
                //set map extent to lines graphic layer
                if (setExtentToLayer) {
                  this._setExtentToLayer(layer);
                  //on draw complete set the parcel close status
                  this.setParcelClosure();
                }
              }
            }));
        } else {
          layer.add(graphic);
          //set map extent to lines graphic layer
          if (setExtentToLayer) {
            this._setExtentToLayer(layer);
            //on draw complete set the parcel close status
            this.setParcelClosure();
          }
        }
      },

      /**
      * Draw's point on layer with the configured symbol and in map's spatial ref.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _drawPoint: function (point) {
        var graphic = new Graphic(point, jsonUtils.fromJson(this.config.pointSymbol));
        this._addProjctedGraphic(this.parcelPointsGraphicsLayer, graphic, false);
      },

      /**
      * Draw's Endpoint and line(straight/arc) for the specified values and,
      * set the extent of map to layer if asked.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _drawLineAndEndPoint: function (endpoint, linesPathArray, values, setExtentToLayer) {
        var polyLine, graphic;
        //check if valid end point then create line
        if (endpoint) {
          polyLine = geometryUtils.getLineBetweenPoints(linesPathArray);
          if (polyLine) {
            graphic = new Graphic(polyLine, jsonUtils.fromJson(values.LineSymbol.symbol));
            //draw line
            this._addProjctedGraphic(this.parcelLinesGraphicsLayer, graphic, setExtentToLayer);
            //set current endPoint as previous point
            this._startPointForNextLine = lang.clone(endpoint);
            //draw endPoint on map
            this._drawPoint(endpoint);
            //TODO:store conversion data
          } else {
            this._showMessage(this.nls.newTraverse.unableToDrawLineMessage);
          }
        } else {
          this._showMessage(this.nls.newTraverse.invalidEndPointMessage);
        }
      },

      /**
      * Set data required for calculating misclose info.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      setInfoForCalulatingMisclose: function (values, endPoint, arcGeometryPointsArray) {
        var polyline;
        values.startPoint = lang.clone(this._orgStartPointForNextLine);
        values.endpoint = lang.clone(endPoint);
        polyline = geometryUtils.getLineBetweenPoints(arcGeometryPointsArray);
        //Add if it is boundary lines in array
        if (values.LineSymbol.type === this.config.BoundaryLineType) {
          for (var i = 0; i < polyline.paths.length; i++) {
            this._arrayOfAllBoundaryLines.push(polyline.paths[i]);
          }
        }
        //set current endPoint as previous point
        this._orgStartPointForNextLine = lang.clone(endPoint);
        return values;
      },

      /**
      * Returns the data required to draw the arc.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      getArcInfo: function (chordStartPoint, initBearing, radius, distance) {
        var arcLength, arcLengthOfSemiCircle,
          theta, chordLength, chordEndPoint, midDistance,
          chordMidPoint, centerAndChordDistance, arcGeometryPointsArray, param, arcParams;
        // check whether the distance is of 'ArcLength' or 'ChordLength',
        // if 'ArcLength' is given then find 'ChordLength' from it.
        if (this._planSettings.circularCurveParameters === "radiusAndArcLength") {
          arcLength = Math.abs(distance);
          // using formula 'Math.PI * radius' for calculating circumference of a semi-circle.
          arcLengthOfSemiCircle = Math.PI * Math.abs(radius);
          // calculating angle for half of the triangle
          theta = Math.abs(arcLength) / Math.abs(radius);
          // calculate chordLength(perpendicular in our case) using formula
          //sin(theta) = perpendicular / hypotenuse,
          //so, perpendicular = hypotenuse * sin(theta)
          chordLength = Math.abs(radius) * Math.sin(theta / 2);
          if (arcLength <= arcLengthOfSemiCircle) {
            distance = chordLength * 2;
          } else {
            distance = chordLength * (-2);
          }
        }
        //get the end point of the chord
        chordEndPoint = geometryUtils.getDestinationPoint(chordStartPoint, initBearing, distance);
        //get mid distance
        midDistance = Math.abs(distance) / 2;
        //get the mid point of the chord
        chordMidPoint = geometryUtils.getDestinationPoint(chordStartPoint, initBearing,
          midDistance);
        //get the distance between center and chord
        centerAndChordDistance = Math.sqrt(Math.abs((radius * radius) -
          (midDistance * midDistance)));
        //create the param object for getting arc
        param = {
          "distance": distance,
          "radius": radius,
          "initBearing": initBearing,
          "chordMidPoint": chordMidPoint,
          "centerAndChordDistance": centerAndChordDistance,
          "chordEndPoint": chordEndPoint,
          "chordStartPoint": chordStartPoint
        };
        // get the required param for creating arc
        arcParams = geometryUtils.getArcParam(param);
        // set the start angle always less than the end angle
        arcParams.startAngle = arcParams.startAngle > arcParams.endAngle ?
          arcParams.startAngle - 360 : arcParams.startAngle;
        //using startAngle, endAngle, centerPoint and radius get the points array for arc
        arcGeometryPointsArray = geometryUtils.getPointsForArc(arcParams.startAngle,
          arcParams.endAngle, arcParams.centerPoint, radius);
        return { "endPoint": chordEndPoint, "arcGeometryPointsArray": arcGeometryPointsArray };
      },

      /**
      * Draw's straight line for the specified values and set the extent of map to layer if asked.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _drawStraightLine: function (values, setExtentToLayer) {
        var endpoint, bearing, distance, endPointForMisCloseCalculation;
        //always consider bearing from north and in dd
        bearing = values.BearingConversions.naDD;
        //set the distance in meters
        distance = values.LengthConversions.meters;

        //if misclose is adjusted then adjustPoints
        if (values.adjustedValues && this.adjustPoints) {
          bearing = values.adjustedValues.adjustedBearing;
          if (values.BearingConversions.qb3DDRound.charAt(0) === "S") {
            bearing = values.adjustedValues.adjustedBearingNADD;
          } else if (values.adjustedValues.lat < 0) {
            bearing = values.adjustedValues.adjustedBearingNADD;
          }
          distance = values.adjustedValues.adjustedLength;
          this.appliedCompassRule = true;
        }

        //apply rotation
        if (this._rotationAngle) {
          bearing = Number(bearing) + this._rotationAngle;
        }
        //apply scale
        if (this._scaleValue) {
          distance = distance * this._scaleValue;
        }
        endPointForMisCloseCalculation =
          geometryUtils.getDestinationPoint(this._orgStartPointForNextLine,
            values.BearingConversions.naDD, values.LengthConversions.meters);
        //get end point
        endpoint = geometryUtils.getDestinationPoint(this._startPointForNextLine,
          bearing, distance);
        //set info required for calculating misclose details
        values = this.setInfoForCalulatingMisclose(values, endPointForMisCloseCalculation,
          [this._orgStartPointForNextLine, endPointForMisCloseCalculation]);
        //draw line and end point on layer
        this._drawLineAndEndPoint(endpoint, [this._startPointForNextLine, endpoint], values,
          setExtentToLayer);
      },

      /**
      * Draw's arc for the specified values and set the extent of map to layer if asked.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _drawArc: function (values, setExtentToLayer) {
        var radius, distance, initBearing, arcInfo, orgArcInfo;
        //always consider bearing from north and in dd
        initBearing = values.BearingConversions.naDD;
        //get the entered values for radius, distance, and bearing
        radius = values.RadiusConversions.meters;
        distance = values.LengthConversions.meters;
        //if misclose is adjusted then adjustPoints
        if (values.adjustedValues && this.adjustPoints) {
          initBearing = values.adjustedValues.adjustedBearing;
          if (values.BearingConversions.qb3DDRound.charAt(0) === "S") {
            initBearing = values.adjustedValues.adjustedBearingNADD;
          } else if (values.adjustedValues.lat < 0) {
            initBearing = values.adjustedValues.adjustedBearingNADD;
          }
          distance = values.adjustedValues.adjustedLength;
          this.appliedCompassRule = true;
        }
        //apply rotation
        if (this._rotationAngle) {
          initBearing = Number(initBearing) + this._rotationAngle;
        }
        //apply scale
        if (this._scaleValue) {
          distance = distance * this._scaleValue;
          radius = radius * this._scaleValue;
        }
        //get arc info according to org values in grid i.e. without applying roation and scaling
        orgArcInfo = this.getArcInfo(this._orgStartPointForNextLine, values.BearingConversions.naDD,
          values.RadiusConversions.meters, values.LengthConversions.meters);
        values = this.setInfoForCalulatingMisclose(values, orgArcInfo.endPoint,
          orgArcInfo.arcGeometryPointsArray);
        //get arcinfo to draw with honouring the roation and scaling
        arcInfo = this.getArcInfo(this._startPointForNextLine, initBearing, radius, distance);
        //draw arc's geometry and endpoint on layer
        this._drawLineAndEndPoint(arcInfo.endPoint, arcInfo.arcGeometryPointsArray,
          values, setExtentToLayer);
      },

      /**
      * Set's the map's extent to the graphic layer
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _setExtentToLayer: function (graphicsLayer, forceZoom) {
        var newExtent;
        newExtent = graphicsUtils.graphicsExtent(graphicsLayer.graphics).expand(1.5);
        //set the new extent only if it is out of current map's extent
        if (forceZoom || !this.map.extent.contains(newExtent)) {
          this.map.setExtent(newExtent);
        }
      },

      /**
      * Emit's the showMessage event
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _showMessage: function (msg) {
        this.emit("showMessage", msg);
      },

      /**
      * Regenerate's the traverse grid misclose info according to updated plan settings
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      updateAccordingToPlanSettings: function (updatedSettings) {
        var miscloseDetails, miscloseDetailsInfo;
        this._planSettings = updatedSettings;
        this.bearingNode.set("placeHolder", this.nls.planSettings
        [updatedSettings.directionOrAngleUnits].abbreviation);
        this.lengthNode.set("placeHolder", this.nls.planSettings
        [updatedSettings.distanceAndLengthUnits].abbreviation);
        this.radiusNode.set("placeHolder", this.nls.planSettings
        [updatedSettings.distanceAndLengthUnits].abbreviation);
        //regenerate traverse grid, it will honour the updated plan settings.
        this._reGenerateTraverseGrid();
        //update misclose info if available
        if (this._misCloseDetailsInstance) {
          miscloseDetails = this._misCloseDetailsInstance.getMiscloseDetails();
          if (miscloseDetails) {
            miscloseDetailsInfo = this._getMiscloseDetailsAccordingToPlanSettings(miscloseDetails);
            this._misCloseDetailsInstance.updateAccordingToPlanSettings(miscloseDetailsInfo);
          }
        }
      },

      /**
      * Disables on screen digitization widget
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      deActivateDigitizationTool: function () {
        //disables on screen digitization tool
        domClass.remove(this.screenDigitizationNode, "esriCTEnableButton");
      },

      /**
      * Draw point on map with screen digitization widget
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      pointAddedFromDigitization: function (mapPoint) {
        var angle, distance, quadrantAngle;
        angle = geometryUtils.getAngleBetweenPoints(this._startPointForNextLine, mapPoint);
        distance = geometryUtils.getDistanceBetweeenPoints(this._startPointForNextLine, mapPoint);
        //returned angle will always be in NA DD so convert it to quadrant format so that it will not get override in case of SA
        quadrantAngle = this.getAngleFromDDTOQB(angle);
        this.bearingNode.set("value", quadrantAngle);
        //returned distance will always be in meters, based on plan settings convert if required
        if (this._planSettings.distanceAndLengthUnits === "uSSurveyFeet") {
          distance = utils.metersToUSSurveyFeet(distance);
        }
        this.lengthNode.set("value", distance);
        //as we can only create straight lines from screen digitization always pass empty radius
        this.radiusNode.set("value", "");
        //set the added from screenDigitization flag to true
        this._addNewItem(true);
      },

      /**
      * This function will return an object with details containing if parcel isClosed or not and
      * compassStartPoint - start point from where boundary lines started
      * compassEndPoint - point where boundary lines ended
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      getParcelCloseDetails: function () {
        var boundaryLinesCount, parcelCloseDetails, isValid, compassStartPoint, compassEndPoint;
        //set dafult return object
        parcelCloseDetails = {
          isClosed: false,
          compassStartPoint: null,
          compassEndPoint: null
        };
        //set default values in vars
        isValid = true;
        boundaryLinesCount = 0;
        //loop through all the entered items
        array.forEach(this._itemList, lang.hitch(this, function (item, index) {
          //update count of boundary lines and set the compas start & end point
          if (item.LineSymbol.type === this.config.BoundaryLineType) {
            if (boundaryLinesCount === 0) {
              compassStartPoint = item.startPoint;
            } else {
              compassEndPoint = item.endpoint;
            }
            boundaryLinesCount++;
          } else if (index > 0 && boundaryLinesCount !== 0) {
            isValid = false;
          }
        }));
        //If entered data has more than 1 Boundary line and,
        //boundary line is not followed by any other category of line then it is valid
        if (boundaryLinesCount > 1 && isValid) {
          parcelCloseDetails.isClosed = true;
          parcelCloseDetails.compassStartPoint = compassStartPoint;
          parcelCloseDetails.compassEndPoint = compassEndPoint;
        }
        return parcelCloseDetails;
      },

      /**
      * Function to show/hide the misclose details and parcel tools if parcl is closed
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      setParcelClosure: function () {
        var miscloseDetails, parcelCloseDetails, resetStartPoint;
        resetStartPoint = false;
        parcelCloseDetails = this.getParcelCloseDetails();
        if (parcelCloseDetails.isClosed) {
          //calculate misclose details on parcel close details
          miscloseDetails = this.getCalculatedMiscloseDetails(
            parcelCloseDetails.compassStartPoint,
            parcelCloseDetails.compassEndPoint
          );
          //show the parcel tools to rotate and scale
          this._parcelToolInstance.showHideTools(true);
          //set misclose info
          this._misCloseDetailsInstance.setMiscloseDetails(miscloseDetails);
          //apply compass rule corrections and again redraw if it is saying to adjust the points
          if (miscloseDetails.adjustPoints) {
            this.adjustPoints = this._applyCompassRule(miscloseDetails);
            if (this.adjustPoints && !this.appliedCompassRule) {
              this.setStartPoint(this.startPoint);
            }
          } else {
            this.adjustPoints = false;
            if (this.appliedCompassRule) {
              this.setStartPoint(this.startPoint);
            }
          }
        } else {
          //hide the parcel tools
          this._parcelToolInstance.showHideTools(false);
          //clear misclose info
          this._misCloseDetailsInstance.setMiscloseDetails(null);
          //clear flag to adjustPoints and appliedCompassRule
          this.adjustPoints = false;

          //if current angle is not 0 or scale is not 1,
          //then we need to redraw everything as parcel is not closed,
          //also remove previously applied rotation and scale.
          if (this._rotationAngle !== 0 || this._scaleValue !== 1) {
            //reset the rotation angle and scale
            this._rotationAngle = 0;
            this._scaleValue = 1;
            resetStartPoint = true;
          }
          if (this.appliedCompassRule) {
            this.appliedCompassRule = false;
            resetStartPoint = true;
          }
          if (resetStartPoint) {
            this.setStartPoint(this.startPoint);
          }
        }
      },

      /**
      * Returns the object of misclose bearing, distance, area according to plan settings.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _getMiscloseDetailsAccordingToPlanSettings: function (miscloseDetails) {
        var returnVal, calculatedArea, miscloseDistance;
        returnVal = {};
        if (miscloseDetails.BearingConversions) {
          returnVal.miscloseBearing =
            this._getBearingAccordingToPlanSettings(miscloseDetails.BearingConversions);
        }
        //get the distance according to current plan settings and add it's abbrivation to it.
        miscloseDistance =
          miscloseDetails.LengthConversions[this._planSettings.distanceAndLengthUnits + "Round"];
        returnVal.miscloseDistance = miscloseDistance + " " +
          this.nls.planSettings[this._planSettings.distanceAndLengthUnits].abbreviation;
        //get calculated area according to planSettings
        calculatedArea = miscloseDetails.AreaConversions[this._planSettings.areaUnits];
        //fix the value to be shown
        if (!isNaN(parseFloat(calculatedArea))) {
          calculatedArea = parseFloat(calculatedArea).toFixed(3);
        }
        calculatedArea = calculatedArea + " " +
          this.nls.planSettings[this._planSettings.areaUnits].abbreviation;
        returnVal.calculatedArea = calculatedArea;
        return returnVal;
      },


      /**
      * This function will return an object with details containing
      * miscloseDistance, miscloseBearing, miscloseRatio, accuracy & calculatedArea
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      getCalculatedMiscloseDetails: function (compassStartPoint, compassEndPoint) {
        var bearingData, lengthData, miscloseDetails = {}, miscloseDistance = 0,
          miscloseBearing = 0, miscloseRatio = 0, accuracy = false, highRatio,
          miscloseRatioInfo;
        highRatio = 100000;
        if (compassEndPoint && compassStartPoint) {
          //get bearing between  End and Start of the boundary lines
          miscloseBearing = geometryUtils.getAngleBetweenPoints(
            compassEndPoint,
            compassStartPoint
          );
          //get length between End and Start of the boundary lines
          miscloseDistance = geometryUtils.getDistanceBetweeenPoints(
            compassEndPoint,
            compassStartPoint
          );
          //returned angle will always be in NA DD so convert it to quadrant format so that it will not get override in case of SA
          miscloseBearing = this.getAngleFromDDTOQB(miscloseBearing);
          // get bearingData according to all formats based on current plan settings
          bearingData = utils.categorizeBearingFormat(miscloseBearing, this._planSettings);
          if (bearingData) {
            miscloseDetails.BearingConversions = bearingData;
          }
          // get calculated area's data of the polygon
          miscloseDetails.AreaConversions = this._getCalculatedArea();
          // get misclose ratio
          miscloseRatioInfo = this._getMiscloseRatioInfo(miscloseDistance);
          miscloseRatio = miscloseRatioInfo.miscloseRatio;
          //get length data according to all format from meters
          lengthData = utils.categorizeLengthFormat(miscloseDistance, "meters");
          //keep the misclose distance data
          miscloseDetails.LengthConversions = lengthData;
          //set midDistance accroding to current plan settings in rounded format
          miscloseDistance = lengthData[this._planSettings.distanceAndLengthUnits + "Round"];

          //set accuracy if miscloseRatio is greater or equal to highRatio
          if (miscloseRatio >= highRatio) {
            accuracy = true;
          }
          miscloseDetails.miscloseRatio = miscloseRatio;
          miscloseDetails.accuracy = accuracy;
          //get misclose bearing, distance, area according to plansettings
          miscloseDetails = lang.mixin(miscloseDetails,
            this._getMiscloseDetailsAccordingToPlanSettings(miscloseDetails));

          //TODO: consider units configration for snap distance
          if ((miscloseDistance > 0 &&
            miscloseDistance <= this.config.miscloseSnapDistance) ||
            (isFinite(miscloseRatio) && miscloseRatio >= this.config.miscloseRatioSnap)) {
            miscloseDetails.adjustPoints = true;
            miscloseDetails.compassCompleteLength = miscloseRatioInfo.compassCompleteLength;
          }
        }
        return miscloseDetails;
      },

      /**
      * Returns calculated area
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _getCalculatedArea: function () {
        var calculatedArea, boundaryPolygon, boundaryGraphic;
        if (this._arrayOfAllBoundaryLines && this._arrayOfAllBoundaryLines.length > 0) {
          // calculate area of the polygon
          boundaryPolygon = geometryUtils.getPolygonFromPolyLines(
            this._arrayOfAllBoundaryLines, true);
          if (boundaryPolygon) {
            boundaryGraphic = new Graphic(boundaryPolygon);
            this.parcelPolygonGraphicsLayer.clear();
            this.parcelPolygonGraphicsLayer.add(boundaryGraphic);
            calculatedArea = geometryUtils.getAreaOfGeometry(boundaryPolygon);
          }
        }
        return calculatedArea;
      },

      /**
      * Returns weather to apply compass rule or not
      * Compass rule need to be applied it will also create adjusted data.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _applyCompassRule: function (miscloseDetails) {
        var length, values, i, sumOfLat, sumOfDep, objectToAdjustLatDep,
          sumOfAdjustedLat, sumOfAdjustedDep;
        sumOfLat = 0;
        sumOfDep = 0;
        objectToAdjustLatDep = {};
        //Calculate Lats and Deps for each entry of boundary type
        for (i = 0; i < this._itemList.length; i++) {
          values = this._itemList[i];
          if (values.LineSymbol.type === this.config.BoundaryLineType) {
            length = values.LengthConversions.meters;
            values.lat = length * Math.cos(values.BearingConversions.naDD * (Math.PI / 180));
            values.dep = length * Math.sin(values.BearingConversions.naDD * (Math.PI / 180));
            sumOfLat += values.lat;
            sumOfDep += values.dep;
          }
        }
        //create object to get adjusted values
        objectToAdjustLatDep.sumOfLat = sumOfLat;
        objectToAdjustLatDep.sumOfDep = sumOfDep;
        objectToAdjustLatDep.sumOfAllLinesLength = miscloseDetails.compassCompleteLength;
        //get adjusted bearing and length for each entry of boundary type
        for (i = 0; i < this._itemList.length; i++) {
          values = this._itemList[i];
          length = values.LengthConversions.meters;
          if (values.LineSymbol.type === this.config.BoundaryLineType) {
            //get and store the adjusted bearing and distance
            values.adjustedValues = this._adjustBearingAndDistance(
              values.lat, values.dep, length, objectToAdjustLatDep);
          }
        }
        //Check the closure condition if sum of lats & dep is zero or not
        sumOfAdjustedLat = 0;
        sumOfAdjustedDep = 0;
        for (i = 0; i < this._itemList.length; i++) {
          values = this._itemList[i];
          if (values.LineSymbol.type === this.config.BoundaryLineType) {
            sumOfAdjustedLat += parseFloat(values.adjustedValues.lat.toFixed(2));
            sumOfAdjustedDep += parseFloat(values.adjustedValues.dep.toFixed(2));
            sumOfAdjustedLat = parseFloat(sumOfAdjustedLat.toFixed(2));
            sumOfAdjustedDep = parseFloat(sumOfAdjustedDep.toFixed(2));
          }
        }
        if (parseInt(sumOfAdjustedLat, 10) === 0 && parseInt(sumOfAdjustedDep, 10) === 0) {
          return true;
        }
        return false;
      },


      /**
      * Returns adjusted bearing and distance using compass rule adjustment
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _adjustBearingAndDistance: function (lat, dep, lineLength, info) {
        //TODO: calculate sumOfLat & sumOfDep & sumOfAllLinesLength(total length)
        var adjustedValues, latCorrection, depCorrection, adjustedLat, adjustedDep, adjustedLength,
          adjustedBearing, conversions;
        adjustedValues = {};
        // fix the values to only 6 digits after decimal to avoid errors in case of exponentials
        lat = parseFloat(lat.toFixed(6));
        dep = parseFloat(dep.toFixed(6));
        lineLength = parseFloat(lineLength.toFixed(6));

        //Calculate Lats and Deps correction
        latCorrection = ((-info.sumOfLat) / info.sumOfAllLinesLength) * lineLength;
        depCorrection = ((-info.sumOfDep) / info.sumOfAllLinesLength) * lineLength;

        latCorrection = parseFloat(latCorrection.toFixed(6));
        depCorrection = parseFloat(depCorrection.toFixed(6));

        //Adjust the Lats and Deps
        adjustedLat = lat + latCorrection;
        adjustedDep = dep + depCorrection;

        adjustedLat = parseFloat(adjustedLat.toFixed(6));
        adjustedDep = parseFloat(adjustedDep.toFixed(6));

        //Compute adjusted lengths and directions
        adjustedLength = Math.sqrt(Math.pow(adjustedLat, 2) + Math.pow(adjustedDep, 2));
        adjustedBearing = Math.atan(adjustedDep / adjustedLat);
        //to fix an issue where adjustedBearing may have exponential value
        adjustedBearing = parseFloat(adjustedBearing.toFixed(6));
        //set adjusted values in return object
        adjustedValues.lat = adjustedLat;
        adjustedValues.dep = adjustedDep;
        adjustedValues.adjustedLength = adjustedLength;
        adjustedValues.adjustedBearing = adjustedBearing * (180 / Math.PI);
        //if bearing is value is in south azimuth then keep the north azimuth converted value
        conversions = utils.categorizeBearingFormat(adjustedValues.adjustedBearing, {
          "directionOrAngleType": "southAzimuth", "directionOrAngleUnits": "decimalDegree"
        });
        adjustedValues.adjustedBearingNADD = conversions.naDD;
        return adjustedValues;
      },

      /**
      * Returns miscloseRatio for miscloseDistance
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _getMiscloseRatioInfo: function (miscloseDistance) {
        var boundaryPolyLine, compassCompleteLength = 0, miscloseRatio = 0, lowRatio, highRatio;
        //set the constant values for high and low Ratio
        lowRatio = 10;
        highRatio = 100000;
        /** calculate miscloseratio and accuracy **/
        if (this._arrayOfAllBoundaryLines && this._arrayOfAllBoundaryLines.length > 0) {
          //Create polyline for all boundary lines to get it's complete length.
          boundaryPolyLine = geometryUtils.getPolyLineFromPaths(this._arrayOfAllBoundaryLines);
          //get length of boundary line in meters
          compassCompleteLength = geometryUtils.getLengthOfGeometry(boundaryPolyLine);
          //based on compassCompleteLength(boundary Lines comelete length) caculate ratio
          if (compassCompleteLength > 0) {
            miscloseRatio = 1 / (miscloseDistance / compassCompleteLength);
            if (miscloseRatio < lowRatio) {
              miscloseRatio = 0;
            } else if (miscloseRatio < highRatio) {
              miscloseRatio = "1:" + parseInt(miscloseRatio, 10);
            }
          }
        }
        return { "miscloseRatio": miscloseRatio, "compassCompleteLength": compassCompleteLength };
      },

      /**
      * This function is used to get quadrant bearing angle from north azimuth angle
      * @memberOf widgets/ParcelDrafter/NewTraverse
      */
      getAngleFromDDTOQB: function (bearing) {
        var returnValue, planSettingsNADD, bearingData;
        //first get data according to north Azimuth DD
        planSettingsNADD = lang.clone(this._planSettings);
        planSettingsNADD.directionOrAngleType = "northAzimuth";
        planSettingsNADD.directionOrAngleUnits = "decimalDegree";
        bearingData = utils.categorizeBearingFormat(bearing, planSettingsNADD);
        if (bearingData) {
          returnValue = bearingData.qb3DMC;
        }
        return returnValue;
      },

      /**
      * This function is used to sort feature accordingly to sequence ID of feature
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _sortFeatureAccToSequenceID: function (features) {
        var sequenceID;
        sequenceID = this.config.polylineLayer.sequenceId;
        features.sort(function (a, b) {
          return a.attributes[sequenceID] - b.attributes[sequenceID];
        });
        return features;
      },

      /**
      * This function is used to create object that is needed while displaying bearing in grid.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      initEditing: function (startPoint, featureSet, lineLayerSpatialReference) {
        var i, obj, lineSymbol, editBearingDataArr, units, planSettingsNADD, scale, rotation;
        this._planInfoInstance.setParcelInformation(this.polygonDeleteArr);
        //set Rotation and scale
        rotation = this.polygonDeleteArr[0].attributes[this.config.polygonLayer.rotation];
        scale = this.polygonDeleteArr[0].attributes[this.config.polygonLayer.scale];
        this._parcelToolInstance.setRotation(rotation);
        this._parcelToolInstance.setScale(scale);
        editBearingDataArr = [];
        //get units according to layers
        units = this._getUnitValueForSR(lineLayerSpatialReference);
        //create plan settings according to north Azimuth DD
        planSettingsNADD = lang.clone(this._planSettings);
        planSettingsNADD.directionOrAngleType = "northAzimuth";
        planSettingsNADD.directionOrAngleUnits = "decimalDegree";
        featureSet.features = this._sortFeatureAccToSequenceID(featureSet.features);
        for (i = 0; i < featureSet.features.length; i++) {
          obj = {};
          obj.Bearing = featureSet.features[i].attributes[this.config.polylineLayer.bearing];
          obj.BearingConversions = utils.categorizeBearingFormat(obj.Bearing, planSettingsNADD);
          //update bearing according to plansettings
          obj.Bearing = this._getBearingAccordingToPlanSettings(obj.BearingConversions, true);
          // check for distance
          obj.Length = featureSet.features[i].attributes[this.config.polylineLayer.distance];
          // consider distance if there is value in it
          if (obj.Length !== null && obj.Length !== "") {
            obj.LengthConversions = this._validateLength(obj.Length, units);
            //update length according to plansettings
            obj.Length = obj.LengthConversions[this._planSettings.distanceAndLengthUnits];
          }
          lineSymbol = this.getLineSymbolForType(
            featureSet.features[i].attributes[this.config.polylineLayer.lineType]);
          if (lineSymbol) {
            obj.LineSymbol = lineSymbol;
          }
          obj.Radius = featureSet.features[i].attributes[this.config.polylineLayer.radius];
          if (obj.Radius !== null && obj.Radius !== "") {
            obj.RadiusConversions = this._validateLength(obj.Radius, units);
            //update radius according to plansettings
            obj.Radius = obj.RadiusConversions[this._planSettings.distanceAndLengthUnits];
            //in case of straight lines radius will not be stored so clear it
          } else {
            obj.Radius = "";
            obj.RadiusConversions = null;
          }
          // check for arclength
          if (featureSet.features[i].attributes[this.config.polylineLayer.arcLength] !== null &&
            featureSet.features[i].attributes[this.config.polylineLayer.arcLength] !== "") {
            obj.Length = featureSet.features[i].attributes[this.config.polylineLayer.arcLength];
            if (obj.Length !== null && obj.Length !== "") {
              // consider arclength if there is value in it
              obj.LengthConversions = this._validateLength(obj.Length, units);
              //update length according to plansettings
              obj.Length = obj.LengthConversions[this._planSettings.distanceAndLengthUnits];
            }
          }
          // check for chordlength
          if (featureSet.features[i].attributes[this.config.polylineLayer.chordLength] !== null &&
            featureSet.features[i].attributes[this.config.polylineLayer.chordLength] !== "") {
            obj.Length = featureSet.features[i].attributes[this.config.polylineLayer.chordLength];
            if (obj.Length !== null && obj.Length !== "") {
              // consider chordlength if there is value in it
              obj.LengthConversions = this._validateLength(obj.Length, units);
              //update length according to plansettings
              obj.Length = obj.LengthConversions[this._planSettings.distanceAndLengthUnits];
            }
          }
          editBearingDataArr.push(obj);
        }
        this._itemList = editBearingDataArr;
        //regenerate the grid with new data
        this._reGenerateTraverseGrid();
        //to show the traverse tools
        this._showHideTraverseTools();
        //draw the parcel on map with new data
        this.setStartPoint(startPoint);
      },

      /**
      * This function is used to get unit value of spatialReference
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _getUnitValueForSR: function (spatialReference) {
        var mapUnit;
        mapUnit = scaleUtils.getUnitValueForSR(spatialReference);
        switch (mapUnit) {
          case 1: // meters
            return "meters";
          case 111194.87428468118: // degrees
            return "meters";
          case 0.3048: // feet
            return "feet";
          case 0.3048006096: // us survey feet
            return "uSSurveyFeet";
        }
      },

      /**
      * This function is used to get line symbol based on its type.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      getLineSymbolForType: function (lineType) {
        var selectedLineSymbol;
        array.some(this.config.lineTypes, lang.hitch(this, function (lineInfo) {
          if (lineInfo.type === lineType) {
            selectedLineSymbol = lang.clone(lineInfo);
            return true;
          }
        }));
        return selectedLineSymbol;
      },

      /**
      * Clears all the traverse information and reset the objets
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      clearAll: function () {
        //clear all te graphic layers
        this.parcelLinesGraphicsLayer.clear();
        this.parcelPointsGraphicsLayer.clear();
        this.parcelPolygonGraphicsLayer.clear();
        //Reset entry row
        this._resetEntryRow();
        //clear dnd node
        this._dndContainer.clearItems();
        //empty traverseGrid container
        domConstruct.empty(this.traverseGrid);
        //empty item list
        this._itemList = [];
        //empty dnd node list
        this._nodes = [];
        //to hide the traverse tools
        this._showHideTraverseTools();
        //clear start point
        this.startPoint = null;
        //clear start point for next line
        this._startPointForNextLine = null;
        this._orgStartPointForNextLine = null;
        //reset the rotation angle and scale
        this._rotationAngle = 0;
        this._scaleValue = 1;
        //set default symbol in symbol selector
        this._symbolSelector.setDefault();
        //deactivate digitization tool
        domClass.remove(this.screenDigitizationNode, "esriCTEnableButton");
        //hide the parcel tools as everything is cleared we will not have closed polygon
        this._parcelToolInstance.showHideTools(false);
        //clear misclose info
        this._misCloseDetailsInstance.setMiscloseDetails(null);
        //reset boundary lines array
        this._arrayOfAllBoundaryLines = [];
        // reset edited polygon data
        this.polygonDeleteArr = [];
        // reset edited polyline data
        this.polylineDeleteArr = [];
        //reset the scroll position to top
        this.domNode.scrollTop = 0;
        // reset parcel name
        this._planInfoInstance.parcelNameTextBox.set("value", null);
        // reset plan name
        this._planInfoInstance.planNameTextBox.set("value", null);
        // reset document type
        this._planInfoInstance.documentTypeDropdown.set("item", null);
      }
    });
  });