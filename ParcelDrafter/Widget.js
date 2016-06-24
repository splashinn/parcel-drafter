define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'dojo/_base/lang',
  'dojo/dom-class',
  'dojo/dom-attr',
  'dojo/dom-construct',
  'dojo/on',
  './PlanSettings',
  './NewTraverse',
  './MapTooltipHandler',
  'esri/tasks/GeometryService',
  'jimu/dijit/Message',
  'jimu/dijit/LoadingIndicator',
  'esri/tasks/query',
  'esri/layers/FeatureLayer'
],
  function (
    declare,
    BaseWidget,
    lang,
    domClass,
    domAttr,
    domConstruct,
    on,
    PlanSettings,
    NewTraverse,
    MapTooltipHandler,
    GeometryService,
    Message,
    LoadingIndicator,
    Query,
    FeatureLayer
  ) {
    return declare([BaseWidget], {

      baseClass: 'jimu-widget-ParcelDrafter',
      _prevOpenPanel: "mainPage", //flag to hold last open panel, by default main page will be loaded
      _newTraverseInstance: null, //Object to hold traverse selectings instance
      _planSettingsInstance: null, //Object to hold Plan Settings instance
      _mapTooltipHandler: null, //Object to hold MapTooltipHandler instance
      _startPoint: null, //Holds the selected start point
      geometryService: null, //Holds an instance of geometryService
      _lineLayerSpatialReference: null, // to store spatial reference of line layer
      _polygonLayerSpatialReference: null, //to store spatial reference of polygon layer
      _isUpdateStartPoint: null,
      postCreate: function () {
        this.inherited(arguments);
        //create instance of geometryService
        if (this.appConfig.geometryService) {
          this.geometryService = new GeometryService(this.appConfig.geometryService);
        } else {
          this._showErrorInWidgetPanel(this.nls.geometryServiceURLNotFoundMSG);
          return;
        }
        //Initialize loading widget
        this._initLoading();
        //Handle click events for different controls
        this._handleClickEvents();
        //Create maptool tip handler
        this._createMapTooltipHandler();
        //Create New Traverse instance
        this._createNewTraverse();
        //Create Plan settings instance
        this._createPlanSettings();
      },

      startup: function () {
        this.inherited(arguments);
        //override the panel styles
        domClass.add(this.domNode.parentElement, "esriCTOverridePanelStyle");
        this._getSpatialReferenceOfParcelLayers();
      },

      /**
      * This function used for loading indicator
      * @memberOf widgets/ParcelDrafter/Widget
      */
      _initLoading: function () {
        this.loading = new LoadingIndicator({
          hidden: true
        });
        this.loading.placeAt(this.domNode);
        this.loading.startup();
      },

      /**
       * Resize the widget components and connect map click on widget open
       * @memberOf widgets/ParcelDrafter/Widget
       */
      onOpen: function () {
        //if current open panel is not mainPage  connect tooltip to update start point
        if (this._mapTooltipHandler && this._prevOpenPanel !== "mainPage") {
          this._mapTooltipHandler.connectEventHandler(this.nls.mapTooltipForUpdateStartpoint);
          this._toggleSnapping(true);
        }
      },

      /**
      * This function is used to get spatial reference of parcel layers(line & polygon)
      * @memberOf widgets/ParcelDrafter/Widget
      */
      _getSpatialReferenceOfParcelLayers: function () {
        var lineLayer, polygonLayer;
        lineLayer = new FeatureLayer(this.config.polylineLayer.layerURL);
        polygonLayer = new FeatureLayer(this.config.polygonLayer.layerURL);
        this._lineLayerSpatialReference = lineLayer.spatialReference;
        this._polygonLayerSpatialReference = polygonLayer.spatialReference;
        this._newTraverseInstance.lineLayerSpatialReference = this._lineLayerSpatialReference;
        this._newTraverseInstance.polygonLayerSpatialReference = this._polygonLayerSpatialReference;
      },

      /**
      * disconnect map click on widget close
      * @memberOf widgets/ParcelDrafter/Widget
      */
      onClose: function () {
        //disconnect map click hadler if active and deavtivate all tools
        if (this._mapTooltipHandler) {
          this._toggleSnapping(false);
          this._mapTooltipHandler.disconnectEventHandler();
          domClass.replace(this.newTraverseButton, "esriCTNewTraverseButton",
            "esriCTNewTraverseActive");
          domClass.replace(this.editTraverseButton, "esriCTEditTraverseButton",
            "esriCTEditTraverseActive");
          this.newTraverseSelectMessageNode.innerHTML = "";
          this._newTraverseInstance.deActivateDigitizationTool();
          this._newTraverseInstance.deactivateParcelTools();
        }
      },

      /**
      * Handle click events for different controls
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _handleClickEvents: function () {

        //handle plan Settings button click
        on(this.planSettingsButton, "click", lang.hitch(this, function () {
          this._showPanel("planSettingsPage");
        }));

        //handle start traverse button click
        on(this.newTraverseButton, "click", lang.hitch(this, function () {
          this._mapTooltipHandler.disconnectEventHandler();
          this._newTraverseInstance.clearAll();
          //check if button is active or not
          if (domClass.contains(this.newTraverseButton, "esriCTNewTraverseActive")) {
            this._toggleSnapping(false);
            domClass.replace(this.newTraverseButton, "esriCTNewTraverseButton",
              "esriCTNewTraverseActive");
            this.newTraverseSelectMessageNode.innerHTML = "";
          } else {
            domClass.replace(this.editTraverseButton, "esriCTEditTraverseButton",
              "esriCTEditTraverseActive");
            domClass.replace(this.newTraverseButton, "esriCTNewTraverseActive",
              "esriCTNewTraverseButton");
            this._mapTooltipHandler.connectEventHandler(this.nls.mapTooltipForStartNewTraverse);
            this._toggleSnapping(true);
            this.newTraverseSelectMessageNode.innerHTML = this.nls.mapTooltipForStartNewTraverse;
          }
        }));

        //handle start traverse button click
        on(this.editTraverseButton, "click", lang.hitch(this, function () {
          this._mapTooltipHandler.disconnectEventHandler();
          this._newTraverseInstance.clearAll();
          //check if button is active or not
          if (domClass.contains(this.editTraverseButton, "esriCTEditTraverseActive")) {
            domClass.replace(this.editTraverseButton, "esriCTEditTraverseButton",
              "esriCTEditTraverseActive");
            this.newTraverseSelectMessageNode.innerHTML = "";
          } else {
            domClass.replace(this.newTraverseButton, "esriCTNewTraverseButton",
              "esriCTNewTraverseActive");
            domClass.replace(this.editTraverseButton, "esriCTEditTraverseActive",
              "esriCTEditTraverseButton");
            this._mapTooltipHandler.connectEventHandler(this.nls.mapTooltipForEditNewTraverse);
            this.newTraverseSelectMessageNode.innerHTML = this.nls.mapTooltipForEditNewTraverse;
          }
        }));

        //Handle click event of plan settings back button
        on(this.planSettingsPanelBackButton, "click", lang.hitch(this, function () {
          this._planSettingsInstance.onClose();
          this._showPanel("traversePage");
        }));

        //Handle click event of plan settings back button
        this.own(on(this.traversePanelBackButton, "click", lang.hitch(this,
          this._confirmCancelTraverse)));
      },

      /**
      * Set snapping layers
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _setSnappingLayers: function () {
        var layerInfos = [], snappingLayer, i;
        //allow snapping with configured layers
        if (this.config.snappingLayers && this.config.snappingLayers.length) {
          for (i = 0; i < this.config.snappingLayers.length; i++) {
            snappingLayer = this.map.getLayer(this.config.snappingLayers[i]);
            if (snappingLayer) {
              layerInfos.push({ layer: snappingLayer });
            }
          }
        }
        if (!this._isUpdateStartPoint) {
          //allow snapping with point grphics layer
          if (this._newTraverseInstance.parcelPointsGraphicsLayer) {
            layerInfos.push({ layer: this._newTraverseInstance.parcelPointsGraphicsLayer });
          }
        }
        this.map.snappingManager.setLayerInfos(layerInfos);
      },

      /**
      * Toggle snapping on map
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _toggleSnapping: function (isEnable) {
        //TODO: snap to only configured layers
        if (isEnable) {
          this.map.enableSnapping({
            tolerance: this.config.snappingTolerance,
            snapToEdge: true,
            snapToPoint: true,
            snapToVertex: true,
            alwaysSnap: true
          });
          this._setSnappingLayers();
          this.map.snappingManager._setUpSnapping();
        } else {
          if (this.map.snappingManager) {
            this.map.snappingManager._deactivateSnapping();
            this.map.disableSnapping();
          }
        }
      },
      /**
      * Confirms if user wants to cancel the traverse, and if yes reset to main page.
      * before cancelling traversed parcel
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _confirmCancelTraverse: function () {
        var confirmationBox;
        confirmationBox = new Message({
          message: this.nls.clearingDataConfirmationMessage,
          type: "question",
          buttons: [{
            "label": this.nls.confirmationBoxYESButtonLabel,
            "onClick": lang.hitch(this, function () {
              confirmationBox.close();
              this._resetOnBackToMainPage();
            })
          }, { "label": this.nls.confirmationBoxNOButtonLabel }]
        });
      },

      /**
      * This function resets everting on navigating back to main page
      * @memberOf widgets/ParcelDrafter/Widget
      */
      _resetOnBackToMainPage: function () {
        this._startPoint = null;
        //reset the tools
        domClass.replace(this.newTraverseButton, "esriCTNewTraverseButton",
          "esriCTNewTraverseActive");
        domClass.replace(this.editTraverseButton, "esriCTEditTraverseButton",
          "esriCTEditTraverseActive");
        this.newTraverseSelectMessageNode.innerHTML = "";
        this._toggleSnapping(false);
        //disconnect the map handlers
        this._mapTooltipHandler.disconnectEventHandler();
        this._newTraverseInstance.clearAll();
        //navigate to main page
        this._showPanel("mainPage");
      },

      /**
      * This function initialize the MapTooltipHandler
      * @memberOf widgets/ParcelDrafter/Widget
      */
      _createMapTooltipHandler: function () {
        // create an instance of MapTooltipHandler
        this._mapTooltipHandler = new MapTooltipHandler({
          toolTipText: this.nls.mapTooltipForStartNewTraverse,
          map: this.map
        });
        //handle clicked event
        this._mapTooltipHandler.on("clicked", lang.hitch(this, function (evt) {
          var mapPoint;
          if (this.map.snappingManager && this.map.snappingManager._snappingPoint) {
            mapPoint = this.map.snappingManager._snappingPoint;
          } else {
            mapPoint = evt.mapPoint;
          }
          // if map tooltip handler text is set to screen digitization widget
          // add parcel points on map
          if (this._mapTooltipHandler.toolTipText === this.nls.mapTooltipForScreenDigitization) {
            this._newTraverseInstance.pointAddedFromDigitization(mapPoint);
          } else {
            if (!this._startPoint) {
              if (this._mapTooltipHandler.toolTipText === this.nls.mapTooltipForEditNewTraverse) {
                this._startPoint = mapPoint;
                // get polygon that needs to be edited
                this._getPolygonForEdits(evt);
              } else {
                //after selecting start point for first time show new traverse page
                this._showPanel("traversePage");
                this._mapTooltipHandler.updateTooltip(this.nls.mapTooltipForUpdateStartpoint);
              }
            } else {
              //TODO: update the travrese as start point is changed
            }
            this._startPoint = mapPoint;
            this._newTraverseInstance.setStartPoint(this._startPoint);
          }
        }));
        this._mapTooltipHandler.on("dragging", lang.hitch(this, function (evt) {
          if (this._startPoint) {
            //set rotation angle for selected parcel
            this._newTraverseInstance.setRotation(evt.mapPoint);
          }
        }));
        // once widget is created call its startup method
        this._mapTooltipHandler.startup();
      },

      /**
      * This function is used to get polygons that needs to be edited
      * @memberOf widgets/ParcelDrafter/Widget
      */
      _getPolygonForEdits: function (evt) {
        var featureQuery, polygonLayer, currentDateTime;
        this.loading.show();
        currentDateTime = new Date().getTime();
        featureQuery = new Query();
        featureQuery.geometry = evt.mapPoint;
        featureQuery.outSpatialReference = this.map.spatialReference;
        featureQuery.returnGeometry = false;
        featureQuery.outFields = ["*"];
        featureQuery.where = currentDateTime + "=" + currentDateTime;
        polygonLayer = this.map.getLayer(this.config.polygonLayer.layerId);
        if (polygonLayer) {
          polygonLayer.queryFeatures(featureQuery, lang.hitch(this, function (featureSet) {
            var i;
            this.loading.hide();
            //if no parcel found at the selected location display error
            //else proced to get the lines and navigat to traverse page
            if (featureSet && featureSet.features.length > 0) {
              this._newTraverseInstance.polygonDeleteArr = featureSet.features;
              for (i = 0; i < featureSet.features.length; i++) {
                this._getLinesForEdits(featureSet.features[i]);
                break;
              }
            } else {
              this._startPoint = null;
              this._showMessage(this.nls.unableToFetchParcelMessage);
            }

          }), function () {
            this.loading.hide();
            this._startPoint = null;
            this._showMessage(this.nls.unableToFetchParcelMessage);
          });
        } else {
          this.loading.hide();
          this._startPoint = null;
          this._showMessage(this.nls.unableToFetchParcelMessage);
        }
      },

      /**
      * This function is used to get lines that needs to be edited
      * @memberOf widgets/ParcelDrafter/Widget
      */
      _getLinesForEdits: function (polygon) {
        var featureQuery, lineLayer, guid, editBearingDataArr;
        this.loading.show();
        editBearingDataArr = [];
        guid = polygon.attributes[this.config.polygonLayer.relatedGUID];
        featureQuery = new Query();
        featureQuery.outSpatialReference = this.map.spatialReference;
        featureQuery.returnGeometry = true;
        featureQuery.outFields = ["*"];
        featureQuery.where = this.config.polylineLayer.relatedGUID + "='" + guid + "'";
        lineLayer = this.map.getLayer(this.config.polylineLayer.layerId);
        if (lineLayer) {
          lineLayer.queryFeatures(featureQuery, lang.hitch(this, function (featureSet) {
            this.loading.hide();
            if (featureSet && featureSet.features.length > 0) {
              this._newTraverseInstance.polylineDeleteArr = featureSet.features;
              //set the start point as the first point of polyline
              this._startPoint = featureSet.features[0].geometry.getPoint(0, 0);
              this._newTraverseInstance.initEditing(this._startPoint, featureSet,
                this._lineLayerSpatialReference);
              this._toggleSnapping(true);
              //after fetching all the lines for editing show traverse page
              this._showPanel("traversePage");
              this._mapTooltipHandler.updateTooltip(this.nls.mapTooltipForUpdateStartpoint);
            } else {
              this._startPoint = null;
              this._showMessage(this.nls.unableToFetchParcelLinesMessage);
            }
          }), function () {
            this.loading.hide();
            this._startPoint = null;
            this._showMessage(this.nls.unableToFetchParcelLinesMessage);
          });
        } else {
          this.loading.hide();
          this._startPoint = null;
          this._showMessage(this.nls.unableToFetchParcelLinesMessage);
        }
      },

      /**
      * Creates New Traverse
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _createNewTraverse: function () {
        this._newTraverseInstance = new NewTraverse({
          nls: this.nls,
          config: this.config,
          map: this.map,
          loading: this.loading,
          geometryService: this.geometryService,
          appConfig: this.appConfig
        }, this.traverseNode);
        this._newTraverseInstance.on("showMessage", lang.hitch(this, this._showMessage));
        this._newTraverseInstance.on("activateDigitizationTool", lang.hitch(this, function () {
          this._mapTooltipHandler.updateTooltip(this.nls.mapTooltipForScreenDigitization);
          this._isUpdateStartPoint = true;
        }));
        this._newTraverseInstance.on("deActivateDigitizationTool", lang.hitch(this, function () {
          this._mapTooltipHandler.updateTooltip(this.nls.mapTooltipForUpdateStartpoint);
          this._isUpdateStartPoint = false;
        }));
        //Handle click event of parcelInfo cancel button
        this._newTraverseInstance.on("cancelTraverse", lang.hitch(this, function () {
          this._confirmCancelTraverse();
        }));
        // to display main page once parcel is saved
        this._newTraverseInstance.on("displayMainPageAfterSave", lang.hitch(this, function () {
          this._resetOnBackToMainPage();
        }));
        this._newTraverseInstance.on("toggleRotating", lang.hitch(this, function (isEnable) {
          this._toggleRotating(isEnable);
        }));
      },

      /**
      * toggle rotating functionality
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _toggleRotating: function (isEnable) {
        if (isEnable) {
          this._mapTooltipHandler.connectMouseDragHandler(this.nls.mapTooltipForRotate);
        } else {
          this._mapTooltipHandler.disconnectEventHandler();
          this._mapTooltipHandler.connectEventHandler(this.nls.mapTooltipForUpdateStartpoint);
        }
        this._toggleSnapping(!isEnable);
      },

      /**
      * toggle scaling functionality
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _toggleScaling: function (isEnable) {
        if (isEnable) {
          this._mapTooltipHandler.connectMouseDragHandler(this.nls.mapTooltipForScale);
        } else {
          this._mapTooltipHandler.disconnectEventHandler();
          this._mapTooltipHandler.connectEventHandler(this.nls.mapTooltipForUpdateStartpoint);
        }
        this._toggleSnapping(!isEnable);
      },

      /**
      * Creates plan settings
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _createPlanSettings: function () {
        //Create PlanSettings Instance
        this._planSettingsInstance = new PlanSettings({
          nls: this.nls,
          config: this.config,
          appConfig: this.appConfig
        }, domConstruct.create("div", {}, this.planSettingsNode));
        this._planSettingsInstance.on("planSettingsChanged", lang.hitch(this,
          function (updatedSettings) {
            this._newTraverseInstance.updateAccordingToPlanSettings(
              updatedSettings);
          }));
        this._planSettingsInstance.startup();
      },

      /**
      * Displays selected panel
      * @param {string} panel name
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _showPanel: function (currentPanel) {
        var prevNode, currentNode;
        //check if previous panel exist and hide it
        if (this._prevOpenPanel) {
          prevNode = this._getNodeByName(this._prevOpenPanel);
          domClass.add(prevNode, "esriCTHidden");
        }
        //get current panel to be displayed and show it
        currentNode = this._getNodeByName(currentPanel);
        domClass.remove(currentNode, "esriCTHidden");
        //set the current panel as previous panel
        this._prevOpenPanel = currentPanel;
      },

      /**
      * This function creates and show alert message.
      * @param {string} msg
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _showMessage: function (msg) {
        var alertMessage = new Message({
          message: msg
        });
        alertMessage.message = msg;
      },

      /**
      * This function shows the msg in widget panel and hide the widgets other nodes
      * @param {string} msg
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _showErrorInWidgetPanel: function (msg) {
        domAttr.set(this.widgetErrorNode, "innerHTML", msg);
        domClass.add(this.widgetMainNode, "esriCTHidden");
        domClass.remove(this.widgetErrorNode, "esriCTHidden");
      },

      /**
      * Get panel node from panel name
      * @param {string} panel name
      * @memberOf widgets/ParcelDrafter/Widget
      **/
      _getNodeByName: function (panelName) {
        var node;
        switch (panelName) {
          case "mainPage":
            node = this.mainPageNode;
            break;
          case "traversePage":
            node = this.traversePageNode;
            break;
          case "planSettingsPage":
            node = this.planSettingsPageNode;
            break;
        }
        return node;
      }
    });
  });