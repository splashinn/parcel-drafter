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
  'dijit/registry',
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
  'dojo/query'
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
    registry,
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
    query
  ) {
    return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-widget-ParcelDrafter',
      templateString: NewTraverseTemplate,
      _itemList: [], //to contain parcel line data
      _nodes: [], //To contain dnd nodes
      _dndcontainer: null, //To contain dojo dnd container

      parcelPoints: [], //Holds all the parcel points
      parcelLinesGraphicsLayer: null,
      parcelPointsGraphicsLayer: null,
      parcelPolygonGraphicsLayer: null,
      _planSettings: null, // to store updated plan settings

      postCreate: function() {
        domClass.add(this.domNode, "esriCTNewTraverseGrid");
        //create graphics layer for geometries
        this._addGraphicsLayer();
        //Create New Traverse instance
        this._createTraverseGrid();
        // to validate bearing on focus out of bearing input control
        this.own(on(this.bearingNode, "blur", lang.hitch(this, function() {
          if (!this._validateBearing()) {
            //TODO: show message form nls
            this._showMessage("Invalid Bearing");
          }
        })));
        //Display symbol selector div for new row
        this._createLineSelector(this.lineSymbolNode, null, "lineSymbolSelector");
        this.own(on(this.screenDigitizationNode, "click",
        lang.hitch(this,this._onDigitizationButtonClick)));
        this.own(on(this.zoomToNode, "click", lang.hitch(this, this._onZoomButtonClick)));
        this.own(on(this.expandCollapseNode, "click", lang.hitch(this, this._onExpandCollapse)));
        this._attachAddButtonClick();
        //Create misclosed Details instance
        this._createMiscloseDetails();
        //Initiates parcel tools
        this._initParcelTools();
        //Create Plan information instance
        this._createPlanInfo();
      },

      /**
      * This function is used to validate bearing
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _validateBearing: function() {
        var bearingData;
        bearingData = utils.categorizeBearingFormat(this.bearingNode.get("value"),
          this._planSettings);
        if (!bearingData) {
          return null;
        } else {
          return bearingData;
        }
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
      * enables on screen digitization widget
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _onDigitizationButtonClick: function () {

      },

      /**
      * zooms map extent to the drawn parcel
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _onZoomButtonClick: function () {
        //set map extent to lines graphic layer
        this._setExtentToLayer(this.parcelLinesGraphicsLayer);
      },

      /**
      * for hide/show traverse grid and expand/collapse button
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _onExpandCollapse: function () {
        domClass.toggle(this.traverseGrid, "esriCTHidden");
        if (domClass.contains(this.expandCollapseNode, "esriCTExpand")) {
          domAttr.set(this.expandCollapseNode,
          "title", this.nls.planSettings.collapseGridTooltipText);
          domClass.replace(this.expandCollapseNode, "esriCTCollapse", "esriCTExpand");
        } else {
          domAttr.set(this.expandCollapseNode,
          "title", this.nls.planSettings.expandGridTooltipText);
          domClass.replace(this.expandCollapseNode, "esriCTExpand", "esriCTCollapse");
        }
      },

      /**
      * Creates Misclose Details instance
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createMiscloseDetails: function () {
        //Create PlanSettings Instance
        this._misCloseDetails = new MiscloseDetails({
          nls: this.nls,
          config: this.config
        }, domConstruct.create("div", {}, this.traverseOptions));
      },

      /**
      * Initiates parcel tools
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _initParcelTools: function () {
        this._parcelToolInstance = new ParcelTools({
          nls: this.nls,
          config: this.config
        }, domConstruct.create("div", {}, this.parcelToolsNode));
      },

      /**
      * Creates Plan Info instance
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createPlanInfo: function () {
        this._planInfoInstance = new PlanInfo({
          nls: this.nls,
          config: this.config
        }, domConstruct.create("div", {}, this.planInfoNode));
      },

      /**
      * Creates rows for traverse grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createTraverseGrid: function () {
        var i;
        this._nodes = [];
        for (i = 0; i < this._itemList.length; i++) {
          this._createRow({}, i);
        }
        this._dndContainer = new Source(this.traverseGrid, {
          skipForm: true
        });
        this._dndContainer.insertNodes(false, this._nodes);
      },

      /**
      * Creates input fields for grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createFieldInputs: function (nodeContainer, value, className) {
        var inputTextBox = new ValidationTextBox({
          value: value,
          "class": className ? className : ""
        });
        inputTextBox.placeAt(nodeContainer);
      },

      /**
      * Creates line selector field for grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createLineSelector: function (node, symbol, id) {
        var symbolSelectorPopup, lineTypesData;
        if (registry.byId(id)) {
          registry.byId(id).destroy();
        }
        //TODO: get the line types from config
        lineTypesData = this.config.lineTypes;
        symbolSelectorPopup = new SymbolSelector({
          "hideOnSelect": true,
          "id": id,
          "symbolData": lineTypesData
        }, node);
        domClass.add(symbolSelectorPopup.domNode, "esriCTSymbolContainer");
        if (symbol) {
          symbolSelectorPopup.selectSymbol(symbol);
        } else {
          symbolSelectorPopup.setDefault();
        }
      },

      /**
      * Attach 'click' event on delete button to delete row from grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createDeleteButton: function (row, index) {
        var deleteButton = domConstruct.create("div",
        { "class": "esriCTDeleteRow", "index": index }, row);
        on(deleteButton, "click", lang.hitch(this, function (evt) {
          var rowIndex = domAttr.get(evt.currentTarget, "index");
          this._deleteRow(row, rowIndex);
        }));
      },

      /**
      * Delete row from grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _deleteRow: function (row, index) {
        if (this._itemList.length) {
          domConstruct.destroy(row);
          this._nodes.splice(index, 1);
          this._itemList.splice(index, 1);
          //as we have removed the point now redraw everything
          this.setStartPoint(this.startPoint);
          this._updateDeleteRowIndex();
          this._showHideTraverseTools();
        }
      },

      _updateDeleteRowIndex: function () {
        var allRows;
        allRows = query(".esriCTDeleteRow", this.traverseGrid);
        array.forEach(allRows, lang.hitch(this, function (row, index) {
          domAttr.set(row, "index", index);
        }));
      },
      /**
      * Attach 'click' event on add button to add new row to the grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _attachAddButtonClick: function () {
        on(this.addButton, "click", lang.hitch(this, function () {
          var values;
          values = this._getValidatedValues();
          if (values) {
            //if radius is not set it means draw line else draw arc
            if (lang.trim(values.Radius.toString()) === "") {
              this._itemList.push(values);
              this._createRow(values, this._nodes.length);
              this._resetEntryRow();
              //draw new line and set the extent to line layer
              this._drawLine(values, true);
              // show traverse tools zoom and expandCollapse
              this._showHideTraverseTools();
            } else {
              //TODO: add code for drawing and arc , also remove the message
              this._showMessage("Drawing arcs will be comming soon...");
            }
          } else {
            //TDO: show msg from nls
            this._showMessage("Please enter valid values");
          }
        }));
      },

      _getValidatedValues: function () {
        var lineSymbolSelector, values = {}, bearingConversions;
        lineSymbolSelector = registry.byId("lineSymbolSelector");
        values.LineSymbol = lineSymbolSelector.selectedSymbol;
        values.Bearing = this.bearingNode.get("value").toString();
        values.Length = this.lengthNode.get("value").toString();
        values.Radius = this.radiusNode.get("value").toString();
        //if all the values are empty return null
        if (lang.trim(values.Bearing) === "" &&
          lang.trim(values.Length) === "" &&
          lang.trim(values.Radius) === "") {
          return null;
        } else {
          bearingConversions = this._validateBearing();
          //if valid bearing then check if length or radius is set
          if (bearingConversions) {
            values.BearingConversions = bearingConversions;
            //if bearing is enterd but both the length & radius is not enterd return null
            if (lang.trim(values.Length) === "" && lang.trim(values.Radius) === "") {
              return null;
            }
          } else {
            return null;
          }
        }
        return values;
      },

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
      * This function is used to get bearing according to plan settings
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _getBearingAccordingToPlanSettings: function(bearingData) {
        if (this._planSettings.directionOrAngleType === "northAzimuth" && this._planSettings
          .directionOrAngleUnits === "decimalDegree") {
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
      * Create new row with fields in grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _createRow: function (values, i) {
        var row, node;
        row = domConstruct.create("div", { "class": "dojoDndItem esriCTRow" });
        node = domConstruct.create("div", {}, row);
        this._createLineSelector(node, values.LineSymbol, "Line" + i);
        this._createFieldInputs(row,
        this._getBearingAccordingToPlanSettings(values.BearingConversions), "esriCTBearingRow");
        this._createFieldInputs(row, values.Length);
        this._createFieldInputs(row, values.Radius);
        this._createDeleteButton(row, i);
        this._nodes.push(row);
        this._dndContainer.insertNodes(false, this._nodes);
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
      *  recreate travese grid
      * @memberOf widgets/ParcelDrafter/NewTraverse
      **/
      _reGenerateTraverseGrid: function () {
        if (this._dndContainer) {
          this._dndContainer.destroy();
          this._dndContainer = null;
        }
        this._createTraverseGrid();
      },

      updateAccordingToPlanSettings: function (updatedSettings) {
        this._planSettings = updatedSettings;
        this.bearingNode.set("placeHolder",
        this.nls.planSettings[
          updatedSettings.directionOrAngleUnits]
          .abbreviation);
        this.lengthNode.set("placeHolder",
        this.nls.planSettings[
          updatedSettings.distanceAndLengthUnits]
          .abbreviation);
        this.radiusNode.set("placeHolder",
        this.nls.planSettings[
          updatedSettings.distanceAndLengthUnits]
          .abbreviation);
        //TODO: update all the values in grid according to new settings
      },

      setStartPoint: function (startPoint) {
        //set new start point
        this.startPoint = startPoint;
        //as start point is changed this will be the startpoint for next line
        this._startPointForNextLine = lang.clone(startPoint);
        //if allready some point are added redraw the parcel
        if (this._itemList.length > 0) {
          this._reDrawParcel();
        } else {
          //before drawing the start point clear layers
          this.parcelPointsGraphicsLayer.clear();
          this.parcelLinesGraphicsLayer.clear();
          //draw new start point
          this._drawPoint(startPoint);
        }
      },

      _drawPoint: function (point) {
        var graphic = new Graphic(point, jsonUtils.fromJson(this.config.pointSymbol));
        this.parcelPointsGraphicsLayer.add(graphic);
      },

      _drawLine: function(values, setExtentToLayer) {
        var endpoint, polyLine, graphic;
        endpoint = geometryUtils.getDestinationPoint(this._startPointForNextLine,
          values.BearingConversions.naDD, values.Length);
        //check if valid end point then create line
        if (endpoint) {
          polyLine = geometryUtils.getLineBetweenPoints([this._startPointForNextLine,
            endpoint
          ]);
          if (polyLine) {
            graphic = new Graphic(polyLine, jsonUtils.fromJson(values.LineSymbol.symbol));
            //draw line
            this.parcelLinesGraphicsLayer.add(graphic);
            //set current endPoint as previous point
            this._startPointForNextLine = lang.clone(endpoint);
            //draw endPoint on map
            this._drawPoint(endpoint);
            //TODO:also store conversion data
            this.parcelPoints.push(endpoint);
            //set map extent to lines graphic layer
            if (setExtentToLayer) {
              this._setExtentToLayer(this.parcelLinesGraphicsLayer);
            }
          } else {
            //TODO: get string from nls
            this._showMessage("Unable to draw line");
          }
        } else {
          //TODO: get string from nls
          this._showMessage("Invalid End-Point, unable to draw line");
        }
      },

      _reDrawParcel: function () {
        this.parcelLinesGraphicsLayer.clear();
        this.parcelPointsGraphicsLayer.clear();
        this.parcelPoints = [];
        //draw start point as we cleared graphics layer
        this._drawPoint(this.startPoint);
        array.forEach(this._itemList, lang.hitch(this, function (value) {
          this._drawLine(value, false);
        }));
        //set map extent to lines graphic layer
        this._setExtentToLayer(this.parcelLinesGraphicsLayer);
      },

      _setExtentToLayer: function (graphicsLayer) {
        this.map.setExtent(graphicsUtils.graphicsExtent(graphicsLayer.graphics).expand(1.5));
      },

      _showMessage: function(msg){
        this.emit("showMessage", msg);
      },

      clearAll: function(){
        //clear all te graphic layers
        this.parcelLinesGraphicsLayer.clear();
        this.parcelPointsGraphicsLayer.clear();
        this.parcelPolygonGraphicsLayer.clear();
        //Reset entry row
        this._resetEntryRow();
        //TODO: remove all the rows and reset all the global var like _node, itemList etc
        if(this._itemList.length > 0){

        }
      }
    });
  });