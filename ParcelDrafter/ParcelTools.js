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

      constructor: function (options) {
        lang.mixin(this, options);
      },

      postCreate: function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "esriCTFullWidth");
        //set constraints on the number textboxes
        this.rotationTxt.constraints = { min: 0, max: 359, places: 3 };
        //set constraints on the number textboxes
        this.scaleTxt.constraints = { places: 3 };

        //set default values in the textboxes
        this.rotationTxt.set("value", 0);
        this.scaleTxt.set('value', 1.0);

        //set value after focus out
        on(this.rotationTxt, "blur", lang.hitch(this, function () {
          this.setRotation(this.rotationTxt.displayedValue);
        }));

        on(this.scaleTxt, "blur", lang.hitch(this, function () {
          this.setScale(this.scaleTxt.displayedValue);
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
        this.scaleTxt.set("value", Number(scaleValue));
        this.scaleTxt.set("value", Number(this.scaleTxt.displayedValue));
        this.scaleGeometries();
      },

      /**
      * Gets the scale and emits the event to apply scale on geometries.
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      scaleGeometries: function () {
        var scaleValue;
        scaleValue = Number(this.scaleTxt.get("value"));
        if (!isNaN(scaleValue)) {
          this.emit("scaleGeometries", scaleValue);
        }
      },

      /**
      * sets the rotation angle and
      * calls the method to emit the event to apply rotation on geometries.
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      setRotation: function (rotationAngle) {
        this.rotationTxt.set("value", Number(rotationAngle));
        this.rotationTxt.set("value", Number(this.rotationTxt.displayedValue));
        this.rotateGeometries();
      },

      /**
      * Gets the rotation angle and emits the event to apply rotation on geometries.
      * @memberOf widgets/ParcelDrafter/ParcelTools
      **/
      rotateGeometries: function () {
        var rotationAngle;
        rotationAngle = Number(this.rotationTxt.get("value"));
        if (!isNaN(rotationAngle)) {
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
      }
    });
  });