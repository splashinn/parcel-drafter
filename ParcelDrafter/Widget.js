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
  'jimu/dijit/Message'
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
  Message
) {
  return declare([BaseWidget], {

    baseClass: 'jimu-widget-ParcelDrafter',
    _prevOpenPanel: "mainPage", //flag to hold last open panel, by default main page will be loaded
    _newTraverseInstance: null, //Object to hold traverse selectings instance
    _planSettingsInstance: null, //Object to hold Plan Settings instance
    _mapTooltipHandler: null, //Object to hold MapTooltipHandler instance
    _startPoint: null, //Holds the selected start point
    geometryService: null, //Holds an instance of geometryService

    postCreate: function () {
      this.inherited(arguments);
      //create instance of geometryService
      if (this.appConfig.geometryService) {
        this.geometryService = new GeometryService(this.appConfig.geometryService);
      } else {
        this._showErrorInWidgetPanel(this.nls.geometryServiceURLNotFoundMSG);
        return;
      }

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
    },

    /**
     * Resize the widget components and connect map click on widget open
     * @memberOf widgets/ParcelDrafter/Widget
     */
    onOpen: function () {
      //if current open panel is not mainPage  connect tooltip to update start point
      if (this._mapTooltipHandler && this._prevOpenPanel !== "mainPage") {
        this._mapTooltipHandler.connectEventHandler(this.nls.mapTooltipForUpdateStartpoint);
      }
    },

    /**
    * disconnect map click on widget close
    * @memberOf widgets/ParcelDrafter/Widget
    */
    onClose: function () {
      //disconnect map click hadler if active and deavtivate all tools
      if (this._mapTooltipHandler) {
        this._mapTooltipHandler.disconnectEventHandler();
        domClass.replace(this.newTraverseButton, "esriCTNewTraverseButton",
        "esriCTNewTraverseActive");
        domClass.replace(this.editTraverseButton, "esriCTEditTraverseButton",
        "esriCTEditTraverseActive");
        this.newTraverseSelectMessageNode.innerHTML = "";
        this._newTraverseInstance.deActivateDigitizationTool();
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
        //check if button is active or not
        if(domClass.contains(this.newTraverseButton, "esriCTNewTraverseActive")){
          domClass.replace(this.newTraverseButton, "esriCTNewTraverseButton",
          "esriCTNewTraverseActive");
          this.newTraverseSelectMessageNode.innerHTML = "";
        }else{
          domClass.replace(this.editTraverseButton, "esriCTEditTraverseButton",
          "esriCTEditTraverseActive");
          domClass.replace(this.newTraverseButton, "esriCTNewTraverseActive",
          "esriCTNewTraverseButton");
          this._mapTooltipHandler.connectEventHandler(this.nls.mapTooltipForStartNewTraverse);
          this.newTraverseSelectMessageNode.innerHTML = this.nls.mapTooltipForStartNewTraverse;
        }
      }));

      //handle start traverse button click
      on(this.editTraverseButton, "click", lang.hitch(this, function () {
        this._mapTooltipHandler.disconnectEventHandler();
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
    * Confirms if user wants to cancel the traverse, and if yes reset to main page.
    * before cancelling traversed parcel
    * @memberOf widgets/ParcelDrafter/Widget
    **/
    _confirmCancelTraverse: function(){
      var confirmationBox;
      //TODO: get strings from nls
      confirmationBox = new Message({
        message: "All the enterd data will be cleared, Do you want to proceed.",
        type: "question",
        buttons: [{
          "label": "Yes", "onClick": lang.hitch(this, function () {
            confirmationBox.close();
            this._resetOnBackToMainPage();
          })
        }, { "label": "No" }]
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
        // if map tooltip handler text is set to screen digitization widget
        // add parcel points on map
        if (this._mapTooltipHandler.toolTipText === this.nls.mapTooltipForScreenDigitization) {
          this._newTraverseInstance.pointAddedFromDigitization(evt.mapPoint);
        } else {
          if (!this._startPoint) {
            //after selecting start point for first time show new traverse page
            this._showPanel("traversePage");
            this._mapTooltipHandler.updateTooltip(this.nls.mapTooltipForUpdateStartpoint);
          } else {
            //TODO: update the travrese as start point is changed
          }
          this._startPoint = evt.mapPoint;
          this._newTraverseInstance.setStartPoint(this._startPoint);
        }
      }));
      // once widget is created call its startup method
      this._mapTooltipHandler.startup();
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
        geometryService: this.geometryService
      }, this.traverseNode);
      this._newTraverseInstance.on("showMessage", lang.hitch(this, this._showMessage));
      this._newTraverseInstance.on("activateDigitizationTool", lang.hitch(this, function () {
        this._mapTooltipHandler.updateTooltip(this.nls.mapTooltipForScreenDigitization);
      }));
      this._newTraverseInstance.on("deActivateDigitizationTool", lang.hitch(this, function () {
        this._mapTooltipHandler.updateTooltip(this.nls.mapTooltipForUpdateStartpoint);
      }));
      //Handle click event of parcelInfo cancel button
      this._newTraverseInstance.on("cancelTraverse", lang.hitch(this, function () {
        this._confirmCancelTraverse();
      }));
    },

    /**
    * Creates plan settings
    * @memberOf widgets/ParcelDrafter/Widget
    **/
    _createPlanSettings: function() {
      //Create PlanSettings Instance
      this._planSettingsInstance = new PlanSettings({
        nls: this.nls,
        config: this.config
      }, domConstruct.create("div", {}, this.planSettingsNode));
      this._planSettingsInstance.on("planSettingsChanged", lang.hitch(this,
        function(updatedSettings) {
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