define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./ParcelTools.html',
  'dojo/_base/lang',
  'dojo/Evented',
  'dojo/dom-class',
  'dojo/on',
  'dojo/keys',
  'dijit/form/NumberTextBox'
],
  function (
    declare,
    BaseWidget,
    _WidgetsInTemplateMixin,
    ParcelToolsTemplate,
    lang,
    Evented,
    domClass,
    on,
    keys
  ) {
    return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-widget-ParcelDrafter-ParcelTools',
      templateString: ParcelToolsTemplate,
      rotationAngle: 0, // to store rotation angle
      scaledValue: 1.0, // to store scale value

      constructor: function (options) {
        lang.mixin(this, options);
      },

      postCreate: function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "esriCTFullWidth");
        //set constraints on the number textboxes
        this.rotationTxt.constraints = { min: -360, max: 360, places: 3 };
        //set constraints on the number textboxes
        this.scaleTxt.constraints = { places: 3 };
        //set default values in the textboxes
        this.rotationTxt.set("value", this.rotationAngle);
        this.scaleTxt.set('value', this.scaledValue);

        //set value after focus out
        on(this.rotationTxt, "blur", lang.hitch(this, function () {
          this.setRotation(this.rotationTxt.displayedValue);
        }));

        //attach 'click' event on rotate button to enable rotating feature
        on(this.rotateButton, "click", lang.hitch(this, function () {
          this._toggleRotating();
        }));

        on(this.scaleTxt, "blur", lang.hitch(this, function () {
          this.setScale(this.scaleTxt.displayedValue);
        }));

        //attach 'click' event on scale button to enable scaling feature
        on(this.scaleButton, "click", lang.hitch(this, function () {
          this._toggleScaling();
        }));
        //set value in textbox once enter or tab key os pressed
        this.own(on(this.rotationTxt, "keypress", lang.hitch(this, function (evt) {
          var charOrCode;
          charOrCode = evt.charCode || evt.keyCode;
          //Check for ENTER key
          if (charOrCode === keys.ENTER) {
            this.setRotation(this.rotationTxt.displayedValue);
          }
        })));

        this.own(on(this.scaleTxt, "keypress", lang.hitch(this, function (evt) {
          var charOrCode;
          charOrCode = evt.charCode || evt.keyCode;
          //Check for ENTER key
          if (charOrCode === keys.ENTER) {
            this.setScale(this.scaleTxt.displayedValue);
          }
        })));
      },

      /**
      * sets the scale and
      * calls the method to emit the event to apply scale on geometries.
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      setScale: function (scaleValue) {
        var lastValue = this.scaledValue;
        //if entered value is number set it
        if (!isNaN(Number(scaleValue))) {
          this.scaleTxt.set("value", Number(scaleValue));
          this.scaleTxt.set("value", Number(this.scaleTxt.displayedValue));
        }
        //check if value entered is valid then set the scaling else keep the previous value
        if (this.scaleTxt.isValid()) {
          this.scaleGeometries();
        } else {
          this.scaleTxt.set("value", Number(lastValue));
          this.scaleTxt.set("value", Number(this.scaleTxt.displayedValue));
        }
      },

      /**
      * Gets the scale and emits the event to apply scale on geometries.
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      scaleGeometries: function () {
        var scaleValue;
        scaleValue = Number(this.scaleTxt.get("value"));
        if (!isNaN(scaleValue)) {
          this.scaledValue = scaleValue;
          this.emit("scaleGeometries", scaleValue);
        }
      },

      /**
      * sets the rotation angle and
      * calls the method to emit the event to apply rotation on geometries.
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      setRotation: function (rotationAngle) {
        var lastValue = this.rotationAngle;
        //if entered value is number set it
        if (!isNaN(Number(rotationAngle))) {
          this.rotationTxt.set("value", Number(rotationAngle));
          this.rotationTxt.set("value", Number(this.rotationTxt.displayedValue));
        }
        //check if value enterd is valid then set the rotation else keep the previous value
        if (this.rotationTxt.isValid()) {
          this.rotateGeometries();
        } else {
          this.rotationTxt.set("value", Number(lastValue));
          this.rotationTxt.set("value", Number(this.rotationTxt.displayedValue));
        }
      },

      /**
      * Gets the rotation angle and emits the event to apply rotation on geometries.
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      rotateGeometries: function () {
        var rotationAngle;
        rotationAngle = Number(this.rotationTxt.get("value"));
        if (!isNaN(rotationAngle)) {
          this.rotationAngle = rotationAngle;
          this.emit("rotateGeometries", rotationAngle);
        }
      },

      /**
      * Based on the flag set's the visibility of the widget node
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      showHideTools: function (show) {
        if (show) {
          domClass.remove(this.domNode, "esriCTHidden");
        } else {
          this.rotationTxt.set("value", Number(0));
          this.scaleTxt.set("value", Number(1));
          domClass.add(this.domNode, "esriCTHidden");
        }
      },

      /**
      * toggle rotaion feature
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      _toggleRotating: function () {
        if (domClass.contains(this.rotateButton, "esriCTDisableButton")) {
          domClass.remove(this.rotateButton, "esriCTDisableButton");
          this.emit("toggleRotating", true);
        } else {
          this.disableRotating();
          this.emit("toggleRotating", false);
        }
      },

      /**
      * toggle scaling feature
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      _toggleScaling: function () {
        if (domClass.contains(this.scaleButton, "esriCTDisableButton")) {
          domClass.remove(this.scaleButton, "esriCTDisableButton");
          this.emit("toggleScaling", true);
        } else {
          this.disableScaling();
          this.emit("toggleScaling", false);
        }
      },

      /**
      * disable button
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      disableRotating: function () {
        domClass.add(this.rotateButton, "esriCTDisableButton");
      },

      /**
     * disable button
     * @memberOf widgets/ParcelDrafter/ParcelTools
     **/
      disableScaling: function () {
        domClass.add(this.scaleButton, "esriCTDisableButton");
      }
    });
  });

