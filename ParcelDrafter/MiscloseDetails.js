define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./MiscloseDetails.html',
  'dojo/_base/lang',
  'dojo/Evented',
  'dojo/dom-class'
], function (
  declare,
  BaseWidget,
  _WidgetsInTemplateMixin,
  MiscloseDetailsTemplate,
  lang,
  Evented,
  domClass
) {
  return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
    baseClass: 'jimu-widget-ParcelDrafter-MisclosedDetails',
    templateString: MiscloseDetailsTemplate,

    constructor: function (options) {
      lang.mixin(this, options);
    },

    postCreate: function () {
      this.inherited(arguments);
      domClass.add(this.domNode, "esriCTFullWidth");
    }
  });
});