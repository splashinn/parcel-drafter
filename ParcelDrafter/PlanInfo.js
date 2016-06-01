define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./PlanInfo.html',
  'dojo/_base/lang',
  'dojo/Evented',
  'dojo/dom-class',
  'dijit/form/TextBox',
  'dijit/form/ComboBox'
], function (
  declare,
  BaseWidget,
  _WidgetsInTemplateMixin,
  PlanInfoTemplate,
  lang,
  Evented,
  domClass,
  ValidationTextBox,
  ComboBox
) {
  return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
    baseClass: 'jimu-widget-ParcelDrafter-PlanInfo',
    templateString: PlanInfoTemplate,

    constructor: function (options) {
      lang.mixin(this, options);
    },

    postCreate: function() {
      this.inherited(arguments);
      domClass.add(this.domNode, "esriCTFullWidth");
      this._createFieldSelect(this.documentType, this.nls.parcelInfos.parcelDocumentTypeText);
      this._createFieldInputs(this.parcelName, this.nls.parcelInfos.parcelNamePlaceholderText,
        true);
      this._createFieldInputs(this.planName, this.nls.parcelInfos.planNamePlaceholderText,
        false);
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
    },

    /**
    * Creates select fields
    * @memberOf widgets/ParcelDrafter/PlanInfo
    **/
    _createFieldSelect: function (nodeContainer, placeHolderText) {
      this.selectBox = new ComboBox({
        placeHolder: placeHolderText,
        "class": "esriCTFullWidth"
      }, nodeContainer);
    }
  });
});