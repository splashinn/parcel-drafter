define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./PlanInfo.html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Evented',
  'dojo/dom-class',
  'dijit/form/TextBox',
  'dojo/store/Memory',
  'dijit/form/ComboBox',
  'dojo/on'
], function (
  declare,
  BaseWidget,
  _WidgetsInTemplateMixin,
  PlanInfoTemplate,
  lang,
  array,
  Evented,
  domClass,
  ValidationTextBox,
  Memory,
  ComboBox,
  on
) {
  return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
    baseClass: 'jimu-widget-ParcelDrafter-PlanInfo',
    templateString: PlanInfoTemplate,

    constructor: function (options) {
      lang.mixin(this, options);
    },

    postCreate: function () {
      this.inherited(arguments);
      domClass.add(this.domNode, "esriCTFullWidth");
      this._createFieldSelect(this.documentType, this.nls.parcelInfos.parcelDocumentTypeText);
      this._createFieldInputs(this.parcelName, this.nls.parcelInfos.parcelNamePlaceholderText,
        true);
      this._createFieldInputs(this.planName, this.nls.parcelInfos.planNamePlaceholderText,
        false);

      //Handle click event of parcelInfo cancel button
      this.own(on(this.parcelInfoCancelButton, "click", lang.hitch(this, function () {
        this.emit("cancelTraversedParcel");
      })));
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
    * Creates combobox fields for document type
    * @memberOf widgets/ParcelDrafter/PlanInfo
    **/
    _createFieldSelect: function (nodeContainer, placeHolderText) {
      var docTypeDataArr, documentTypeStore;
      docTypeDataArr = this._createdocTypeDataArr();
      documentTypeStore = new Memory({ data: docTypeDataArr });
      this.selectBox = new ComboBox({
        placeHolder: placeHolderText,
        "class": "esriCTFullWidth",
        store: documentTypeStore
      }, nodeContainer);
    },

    /**
    * create data-array for combobox
    * @memberOf widgets/ParcelDrafter/PlanInfo
    **/
    _createdocTypeDataArr: function () {
      var options = [], documentTypeLayerId, documentTypefieldName;
      documentTypeLayerId = this.config.polygonLayer.layerId;
      documentTypefieldName = this.config.documentTypeField;
      // if Document type layer configured
      if (this.map && this.map._layers && this.map._layers[documentTypeLayerId]) {
        // looping through configured documentType layer fields
        array.forEach(this.map._layers[documentTypeLayerId].fields, lang.hitch(this, function
        (field) {
          // if configured field and field on layer is same
          // then loop through the field array to create array of option object
          if (field.name === documentTypefieldName && field.domain && field.domain.codedValues) {
            //loop through the fields domain coded values array to create array of option object
            array.forEach(field.domain.codedValues, lang.hitch(this, function (domainValue) {
              options.push({ name: domainValue.name, id: domainValue.code });
            }));
          }
        }));
      }
      return options;
    }
  });
});