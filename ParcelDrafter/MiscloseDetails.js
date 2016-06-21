define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./MiscloseDetails.html',
  'dojo/_base/lang',
  'dojo/Evented',
  'dojo/dom-class',
  'dojo/dom-attr'
], function (
  declare,
  BaseWidget,
  _WidgetsInTemplateMixin,
  MiscloseDetailsTemplate,
  lang,
  Evented,
  domClass,
  domAttr
) {
  return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
    baseClass: 'jimu-widget-ParcelDrafter-MisclosedDetails',
    templateString: MiscloseDetailsTemplate,
    details: null,

    constructor: function (options) {
      lang.mixin(this, options);
    },

    postCreate: function () {
      this.inherited(arguments);
      domClass.add(this.domNode, "esriCTFullWidth");
    },

    /**
    * Returns the misclose info
    * @memberOf widgets/ParcelDrafter/MiscloseDetails
    **/
    getMiscloseDetails: function(){
      return this.details;
    },

    /**
    * Set's the misclose info in respcetive node accordingly
    * @memberOf widgets/ParcelDrafter/MiscloseDetails
    **/
    updateAccordingToPlanSettings: function (miscloseDetailsInfo) {
      domAttr.set(this.miscloseBearingNode, "innerHTML", miscloseDetailsInfo.miscloseBearing);
      domAttr.set(this.miscloseDistanceNode, "innerHTML", miscloseDetailsInfo.miscloseDistance);
      domAttr.set(this.calculatedAreaNode, "innerHTML", miscloseDetailsInfo.calculatedArea);
    },

    /**
    * Set's the misclose info in respcetive node and also set's its visibility accordingly
    * @memberOf widgets/ParcelDrafter/MiscloseDetails
    **/
    setMiscloseDetails: function (details) {
      this.details = details;
      if (details) {
        domAttr.set(this.miscloseBearingNode, "innerHTML", details.miscloseBearing);
        domAttr.set(this.miscloseDistanceNode, "innerHTML", details.miscloseDistance);
        //set misclose ratio
        if (details.miscloseRatio !== 0) {
          domClass.remove(this.traverseMiscloseRatioNode, "esriCTHidden");
          domAttr.set(this.miscloseRatioNode, "innerHTML", details.miscloseRatio);
        } else {
          domClass.add(this.traverseMiscloseRatioNode, "esriCTHidden");
        }
        //set accuracy
        if (details.accuracy) {
          domClass.add(this.traverseMiscloseRatioNode, "esriCTHidden");
          domClass.remove(this.traverseAccuracyNode, "esriCTHidden");
        } else {
          domClass.add(this.traverseAccuracyNode, "esriCTHidden");
        }
        //set calculated area
        if (details.calculatedArea) {
          domAttr.set(this.calculatedAreaNode, "innerHTML", details.calculatedArea);
          domClass.remove(this.traverseCalculatedAreaNode, "esriCTHidden");
        } else {
          domClass.add(this.traverseCalculatedAreaNode, "esriCTHidden");
        }
        domClass.add(this.noMiscloseCalculated, "esriCTHidden");
        domClass.remove(this.miscloseDetailsContainer, "esriCTHidden");
      } else {
        domClass.add(this.miscloseDetailsContainer, "esriCTHidden");
        domClass.remove(this.noMiscloseCalculated, "esriCTHidden");
      }
    }
  });
});