define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./ParcelTools.html',
  'dojo/_base/lang',
  'dojo/Evented',
  'dojo/dom-class',
  'dojo/on',
  'dijit/form/NumberTextBox'
], function (
  declare,
  BaseWidget,
  _WidgetsInTemplateMixin,
  ParcelToolsTemplate,
  lang,
  Evented,
  domClass,
  on
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
      this.rotationTxt.constraints = { min: -180, max: 180, places: 3};
      //set constraints on the number textboxes
      this.scaleTxt.constraints = { places: 3 };

      //set default values in the textboxes
      this.rotationTxt.set("value", 0);
      this.scaleTxt.set('value', 1.0);

      //set value after focus out
      on(this.rotationTxt, "blur", lang.hitch(this, function () {
        this.rotationTxt.set("value", Number(this.rotationTxt.displayedValue));
      }));

      on(this.scaleTxt, "blur", lang.hitch(this, function () {
        this.scaleTxt.set("value", Number(this.scaleTxt.displayedValue));
      }));
    },

    /**
    * Based on the flag set's the visibility of the widget node
    * @memberOf widgets/ParcelDrafter/ParcelTools
    **/
    showHideTools: function (show) {
      if (show) {
        domClass.remove(this.domNode, "esriCTHidden");
      } else {
        domClass.add(this.domNode, "esriCTHidden");
      }
    }
  });
});