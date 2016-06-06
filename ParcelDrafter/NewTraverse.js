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
  'esri/SpatialReference'
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
    SpatialReference
  ) {
    return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-widget-ParcelDrafter',
      templateString: NewTraverseTemplate,
      _itemList: [], //to contain parcel line data
      _nodes: [], //To contain dnd nodes
      _dndContainer: null, //To contain dojo dnd container
      startPoint: null,//To contain start point geometry
      _startPointForNextLine: null,//To contain start point for next line
      parcelLinesGraphicsLayer: null,
      parcelPointsGraphicsLayer: null,
      parcelPolygonGraphicsLayer: null,
      _planSettings: null, // to store updated plan settings
      _arrayOfAllBoundaryLines: [], //to store polylines of boundary type

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
        this.own(on(this.addButton, "click", lang.hitch(this, this._addButtonClicked)));
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
      _handleBlurEventsOnInitialRow: function(){
        // to validate bearing on focus out of bearing input control
        this.own(on(this.bearingNode, "blur", lang.hitch(this, function () {
          var bearingValue;
          bearingValue = this.bearingNode.get("value");
          //check if entered bearing is * then copy the value from last entry
          if (bearingValue === "*" && this._itemList.length > 0) {
            bearingValue = this._itemList[this._itemList.length - 1].Bearing;
            this.bearingNode.set("value", bearingValue);
          }
          if (!this._validateBearing(bearingValue)) {
            //TODO: show message form nls
            this._showMessage("Invalid Bearing");
          }
        })));

        // to validate distance on focus out of length input control
        this.own(on(this.lengthNode, "blur", lang.hitch(this, function () {
          var lengthValue;
          lengthValue  = this.lengthNode.get("value");
          //check if entered length is * then copy the value from last entry
          if (lengthValue === "*" && this._itemList.length > 0) {
            lengthValue = this._itemList[this._itemList.length - 1].Length;
            this.lengthNode.set("value", lengthValue);
          }
          if (!this._validateLength(lengthValue)) {
            //TODO: show message form nls
            this._showMessage("Invalid Length");
          }
        })));

        // to validate distance on focus out of length input control
        this.own(on(this.radiusNode, "blur", lang.hitch(this, function () {
          var radiusValue;
          radiusValue  = this.radiusNode.get("value");
          //check if entered radius is * then copy the value from last entry
          if (radiusValue === "*" && this._itemList.length > 0) {
            radiusValue = this._itemList[this._itemList.length - 1].Radius;
            this.radiusNode.set("value", radiusValue);
          }
          //don't validate if radius is empty
          if (radiusValue === "") {
            return;
          }
          if (!this._validateLength(radiusValue)) {
            //TODO: show message form nls
            this._showMessage("Invalid Radius");
          }
        })));
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
      _validateLength: function (length) {
        var lengthData;
        lengthData = utils.categorizeLengthFormat(length,
        this._planSettings.distanceAndLengthUnits);
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
                //validate if radius and distance are in proportion
                //TODO: consider if negative value is entered in radius
                if ((parseInt(Math.abs(values.RadiusConversions.meters), 10) * 2) <
                  parseInt(values.LengthConversions.meters, 10)) {
                  //TODO: show this error msg
                  //alert("invalid radius or chord Length");
                  return null;
                }
              } else {
                return null;
              }
            } else {
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
        this._setExtentToLayer(this.parcelLinesGraphicsLayer);
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
      * Attach 'click' event on add button to add new row to the grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _addButtonClicked: function () {
        var values, radius;
        values = this._getValidatedValues();
        if (values) {
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
          //TDO: show msg from nls
          this._showMessage("Please enter valid values");
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
      },

      /**
      * Creates Plan Info instance
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createPlanInfo: function () {
        this._planInfoInstance = new PlanInfo({
          map: this.map,
          nls: this.nls,
          config: this.config
        }, domConstruct.create("div", {}, this.planInfoNode));
        //Handle click event of parcelInfo cancel button
        this._planInfoInstance.on("cancelTraversedParcel", lang.hitch(this, function () {
          this.emit("cancelTraverse");
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
      },

      /**
      * Create new row with fields in grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createRow: function (values, i) {
        var row, node;
        row = domConstruct.create("div", { "class": "dojoDndItem esriCTRow", "rowIndex": i });
        node = domConstruct.create("div", { "rowIndex": i }, row);
        this._createLineSelector(node, values.LineSymbol, i);
        this._createFieldInputs(row,
        this._getBearingAccordingToPlanSettings(values.BearingConversions), "esriCTBearingRow");
        this._createFieldInputs(row,
        values.LengthConversions[this._planSettings.distanceAndLengthUnits], "esriCTLengthRow");
        this._createFieldInputs(row, values.Radius, "esriCTRadiusRow");
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
        if(updatedValue){
          updatedValue = lang.trim(updatedValue.toString());
        } else{
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
            //TODO: Update all other textBoxes as per plan settings, now considering updating of
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
              updatedValueAsPerPlanSettings =
              values.RadiusConversions[this._planSettings.distanceAndLengthUnits];
              //update the value in itemList
              values.Radius = updatedValueAsPerPlanSettings;
              //show the entered value in textbox according to planSettings
              inputTextBox.set('value', updatedValueAsPerPlanSettings);
            }
            //Finally set start point it will redraw everything
            this.setStartPoint(this.startPoint);
          } else {
            this._resetToPreviousValues(values, prevValue, updatedCol, inputTextBox);
            //TDO: show msg from nls
            this._showMessage("Please enter valid values");
          }
        }
      },

      /**
      * Reset the entered value in textbox and values object according to updated col.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _resetToPreviousValues: function (values, prevValue, updatedCol, inputTextBox) {
        //if entered value is not valid resetting the value to prev value.
        if (updatedCol === "Bearing") {
          values.Bearing = prevValue;
        } else if (updatedCol === "Length") {
          values.Length = prevValue;
        } else if (updatedCol === "Radius") {
          values.Radius = prevValue;
        }
        //also reset the previous value in textbox also
        inputTextBox.set('value', prevValue);
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
      _getBearingAccordingToPlanSettings: function (bearingData) {
        if (this._planSettings.directionOrAngleType === "northAzimuth" &&
        this._planSettings.directionOrAngleUnits === "decimalDegree") {
          return bearingData.naDD;
        } else if (this._planSettings.directionOrAngleType === "northAzimuth" &&
         this._planSettings.directionOrAngleUnits === "degreeMinuteSeconds") {
          return bearingData.naDMS;
        } else if (this._planSettings.directionOrAngleType === "southAzimuth" &&
         this._planSettings.directionOrAngleUnits === "decimalDegree") {
          return bearingData.saDD;
        } else if (this._planSettings.directionOrAngleType === "southAzimuth" &&
         this._planSettings.directionOrAngleUnits === "degreeMinuteSeconds") {
          return bearingData.saDMS;
        } else if (this._planSettings.directionOrAngleType === "quadrantBearing" &&
         this._planSettings.directionOrAngleUnits === "decimalDegree") {
          return bearingData.qb3DD;
        } else if (this._planSettings.directionOrAngleType === "quadrantBearing" &&
         this._planSettings.directionOrAngleUnits === "degreeMinuteSeconds") {
          return bearingData.qb3DMS;
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
            //Add if it is boundary lines in array
            if (values.LineSymbol.type === this.config.BoundaryLineType) {
              for (var i = 0; i < polyLine.paths.length; i++) {
                this._arrayOfAllBoundaryLines.push(polyLine.paths[i]);
              }
            }
            graphic = new Graphic(polyLine, jsonUtils.fromJson(values.LineSymbol.symbol));
            //draw line
            this._addProjctedGraphic(this.parcelLinesGraphicsLayer, graphic, setExtentToLayer);
            //set current endPoint as previous point
            this._startPointForNextLine = lang.clone(endpoint);
            //draw endPoint on map
            this._drawPoint(endpoint);
            //TODO:store conversion data
          } else {
            //TODO: get string from nls
            this._showMessage("Unable to draw line");
          }
        } else {
          //TODO: get string from nls
          this._showMessage("Invalid End-Point, unable to draw line");
        }
      },

      /**
      * Draw's straight line for the specified values and set the extent of map to layer if asked.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _drawStraightLine: function(values, setExtentToLayer){
        var endpoint, bearing;
        //always consider bearing from north and in dd
        bearing = values.BearingConversions.naDD;
        //get end point
        endpoint = geometryUtils.getDestinationPoint(this._startPointForNextLine,
        bearing, values.LengthConversions.meters);
        values.startPoint = lang.clone(this._startPointForNextLine);
        values.endpoint = lang.clone(endpoint);
        //draw line and end point on layer
        this._drawLineAndEndPoint(endpoint, [this._startPointForNextLine, endpoint],
        values , setExtentToLayer);
      },

      /**
      * Draw's arc for the specified values and set the extent of map to layer if asked.
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _drawArc: function (values, setExtentToLayer) {
        var radius, distance, initBearing, arcLength, arcLengthOfSemiCircle,
        theta, chordLength, chordStartPoint, chordEndPoint, midDistance,
        chordMidPoint, centerAndChordDistance, arcGeometryPointsArray, param, arcParams;

        //get the entered values for radius, distance, and bearing
        radius = values.RadiusConversions.meters;
        distance = values.LengthConversions.meters;
        initBearing = values.BearingConversions.naDD;//always consider bearing from north and in dd

        // check whether the distance is of 'ArcLength' or 'ChordLength',
        // if 'ArcLength' is given then find 'ChordLength' from it.
        if (this._planSettings.circularCurveParameters === "radiusAndArcLength") {
          arcLength = Math.abs(distance);
          // using formula 'Math.PI * radius' for calculating circumference of a semi-circle.
          arcLengthOfSemiCircle = Math.PI * Math.abs(radius);
          // calculating angle for half of the triangle
          theta = Math.abs(arcLength) / Math.abs(radius);
          // calculate chordLength(perpendicular in our case) using formula 'sin(theta) = perpendicular / hypotenuse', so,
          // perpendicular = hypotenuse * sin(theta)
          chordLength = Math.abs(radius) * Math.sin(theta / 2);
          if (arcLength <= arcLengthOfSemiCircle) {
            distance = chordLength * 2;
          } else {
            distance = chordLength * (-2);
          }
          // this distance is the 'ChordLength'
        }
        //start point for the acr will be _startPointForNextLine
        chordStartPoint = this._startPointForNextLine;
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
        values.startPoint = lang.clone(this._startPointForNextLine);
        values.endpoint = lang.clone(chordEndPoint);
        //draw arc's geometry and endpoint on layer
        this._drawLineAndEndPoint(chordEndPoint, arcGeometryPointsArray,
        values, setExtentToLayer);
      },

      /**
      * Set's the map's extent to the graphic layer
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _setExtentToLayer: function (graphicsLayer) {
        this.map.setExtent(graphicsUtils.graphicsExtent(graphicsLayer.graphics).expand(1.5));
      },

      /**
      * Emit's the showMessage event
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _showMessage: function (msg) {
        this.emit("showMessage", msg);
      },

      /**
      * Regenerate's the traverse grid with updated planSettings
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      updateAccordingToPlanSettings: function (updatedSettings) {
        this._planSettings = updatedSettings;
        this.bearingNode.set("placeHolder", this.nls.planSettings
        [updatedSettings.directionOrAngleUnits].abbreviation);
        this.lengthNode.set("placeHolder", this.nls.planSettings
        [updatedSettings.distanceAndLengthUnits].abbreviation);
        this.radiusNode.set("placeHolder", this.nls.planSettings
        [updatedSettings.distanceAndLengthUnits].abbreviation);
        this._reGenerateTraverseGrid();
      },

      /**
      * Disables on screen digitization widget
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      deActivateDigitizationTool: function(){
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
        quadrantAngle = utils.getQuadrantAngleFromNADD(angle);
        this.bearingNode.set("value", quadrantAngle);
        //returned distance will always be in meters, based on plan settings convert if required
        if(this._planSettings.distanceAndLengthUnits === "uSSurveyFeet"){
          distance  = utils.metersToFeets(distance);
        }
        this.lengthNode.set("value", distance);
        //as we can only create straight lines from screen digitization always pass empty radius
        this.radiusNode.set("value", "");
        this._addButtonClicked();
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
        var miscloseDetails, parcelCloseDetails;
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
        } else {
          //hide the parcel tools
          this._parcelToolInstance.showHideTools(false);
          //clear misclose info
          this._misCloseDetailsInstance.setMiscloseDetails(null);
        }
      },

      /**
      * This function will return an object with details containing
      * miscloseDistance, miscloseBearing, miscloseRatio, accuracy & calculatedArea
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      getCalculatedMiscloseDetails: function (compassStartPoint, compassEndPoint) {
        var bearingData, lengthData, miscloseDetails = {}, miscloseDistance = 0,
        miscloseBearing = 0, miscloseRatio = 0, accuracy = false, calculatedArea, highRatio;
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
          // get bearingData according to all formats based on current plan settings
          bearingData = utils.categorizeBearingFormat(miscloseBearing, this._planSettings);
          if (bearingData) {
            miscloseBearing = this._getBearingAccordingToPlanSettings(bearingData);
            miscloseBearing = this._getFixedValue(miscloseBearing);
            miscloseDetails.miscloseBearing = miscloseBearing;
          }
          // get calculated area of the polygon
          calculatedArea = this._getCalculatedArea();
          // get misclose ratio
          miscloseRatio = this._getMiscloseRatio(miscloseDistance);
          //get length data according to all format from meters
          lengthData = utils.categorizeLengthFormat(miscloseDistance, "meters");
          //set midDistance accroding to current plan settings
          miscloseDistance = lengthData[this._planSettings.distanceAndLengthUnits];
          miscloseDistance = this._getFixedValue(miscloseDistance);
          //set accuracy if miscloseRatio is greater or equal to highRatio
          if (miscloseRatio >= highRatio) {
            accuracy = true;
          }
          miscloseDetails.miscloseDistance = miscloseDistance;
          miscloseDetails.miscloseRatio = miscloseRatio;
          miscloseDetails.accuracy = accuracy;
          miscloseDetails.calculatedArea = calculatedArea;
          //TODO: add logic for clculating  MiscloseDetails using compas adjustments
          /*
            // misclose will be 0 if closure failed
            bool adjustPoints = parcelData.CompassRuleApplied = (miscloseDistance > 0) &&
              ((miscloseDistance <= _xmlConfiguation.MiscloseDistanceSnap) || (miscloseRatio >= _xmlConfiguation.MiscloseRatioSnap));
          */
        }
        return miscloseDetails;
      },

      /**
      * Returns calculated area
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _getCalculatedArea: function () {
        var calculatedArea, boundaryPolygon;
        if (this._arrayOfAllBoundaryLines && this._arrayOfAllBoundaryLines.length > 0) {
          /** calculate area of the polygon **/
          boundaryPolygon = geometryUtils.getPolygonFromPolyLines(this._arrayOfAllBoundaryLines);
          calculatedArea = geometryUtils.getAreaOfGeometry(boundaryPolygon);
          calculatedArea = calculatedArea[this._planSettings.distanceAndLengthUnits];
          calculatedArea = this._getFixedValue(calculatedArea);
        }
        return calculatedArea;
      },

      /**
      * Returns miscloseRatio for miscloseDistance
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _getMiscloseRatio: function (miscloseDistance) {
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
        return miscloseRatio;
      },

      _getFixedValue: function (value) {
        //return fixed value
        if (!isNaN(parseFloat(value))) {
          value = value.toFixed(3);
        }
        return value;
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
        //set default symbol in symbol selector
        this._symbolSelector.setDefault();
        //deactivate digitization tool
        domClass.remove(this.screenDigitizationNode,"esriCTEnableButton");
        //hide the parcel tools as everything is cleared we will not have closed polygon
        this._parcelToolInstance.showHideTools(false);
        //clear misclose info
        this._misCloseDetailsInstance.setMiscloseDetails(null);
        //reset boundary lines array
        this._arrayOfAllBoundaryLines = [];
      }
    });
  });