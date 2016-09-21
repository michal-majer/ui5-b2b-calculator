sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"mm/util/b2b/Calculator",
	'sap/ui/model/json/JSONModel'
], function(Controller, B2BCalculator, JSONModel) {
	"use strict";

	return Controller.extend("mm.controller.Index", {

		oSettlementModel: new JSONModel(),
		oTaxFreeDataModel: new JSONModel(),

		onInit: function() {
			this.oB2B = new B2BCalculator(this);

			var mSettlementData = {
				pages: [{
					pageId: "settlmentIdPage",
					header: "Wybór formy opodatkowania:",
					groups: [{
						heading: "Progresywna skala podatkowa",
						elements: [{
							label: "Opis",
							value: "Opodatkowanie na zasadach ogólnych według skali podatkowej polega na opłaceniu podatku w wysokości 18% od podstawy opodatkowania nieprzekraczającej 85 528 zł oraz według stawki 32% od nadwyżki ponad 85 528 zł. Warto zaznaczyć, że w przypadku podatku obliczanego według skali, podstawę opodatkowania można obniżyć o kwotę wolną o podatku wynoszącą 556,02 zł."
						}, {
							label: "Skala I",
							value: "18% od podstawy opodatkowania nieprzekraczającej 85 528 zł."
						}, {
							label: "Skala II",
							value: "32% od nadwyżki ponad 85 528 zł."
						}]
					}, {
						heading: "Podatek liniowy",
						elements: [{
							label: "Opis",
							value: "Podczas opodatkowania podatkiem liniowym podatek opłaca się według stałej stawki 19% bez względu na wysokość osiąganego dochodu. Rozliczając się podatkiem liniowym tracimy możliwość skorzystania z ulg podatkowych oraz uwzględnienia kwoty wolnej od podatku."
						}]
					}]
				}]
			};
			
			var mTaxFreeData = {
				pages: [{
					pageId: "taxFreeIdPage",
					header: "Kwota wolna od podatku:",
					groups: [{
						heading: "Kwota wolna od podatku",
						elements: [{
							label: "Opis",
							value: "Kwota jest wolna od opodatkowania jeśli nie przekracza 3091 zł w skali roku. Możliwość zmniejszenia podatku o 556,02 zł tylko gdy formą opodatkowania jest skala podatkowa."
						}]
					}]
				}]
			};

			// set the data for the model
			this.oSettlementModel.setData(mSettlementData);
			this.oTaxFreeDataModel.setData(mTaxFreeData);
		},

		openQuickView: function(oEvent, oModel) {
			if (!this._oQuickView) {
				this._oQuickView = sap.ui.xmlfragment("mm.view.QuickView", this);
				this.getView().addDependent(this._oQuickView);
			}

			this._oQuickView.setModel(oModel);

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._oQuickView.openBy(oButton);
			});
		},

		handleGenericQuickViewPress: function(oEvent) {
			this.openQuickView(oEvent, this.oSettlementModel);
		},
		
		handleTaxFreeQuickViewPress: function(oEvent) {
			this.openQuickView(oEvent, this.oTaxFreeDataModel);	
		},

		handlePopoverPress: function(oEvent) {
			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("mm.view.Popover", this);
				this.getView().addDependent(this._oPopover);
				//this._oPopover.bindElement("/ProductCollection/0");
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._oPopover.openBy(oButton);
			});
		},

		onIncomeChange: function(oEvent) {
			this.oB2B.setNetIncome(oEvent.getSource().getValue());
		},

		onVatRateChange: function(oEvent) {
			this.oB2B.setVatRate(oEvent.getSource().getSelectedKey());
		},

		onTaxFreeChange: function(oEvent) {
			this.oB2B.setTaxFree(oEvent.getSource().getState());
		},

		onTypeOfSettlementChange: function(oEvent) {

			var enableTaxFreeSwitch = function(app) {
				app.byId("idTaxFreeAmount").setEnabled(true);
			};

			var disableTaxFreeSwitch = function(app) {
				app.byId("idTaxFreeAmount").setEnabled(false);
				app.byId("idTaxFreeAmount").setState(false);
			};

			var switchToProgressiveSettlment = function(app) {
				app.byId('idListItem18').setVisible(true);
				app.byId('idListItem19').setVisible(false);
				app.byId('idListItem32').setVisible(true);
				enableTaxFreeSwitch(app);
			};

			var switchToLinearSettlement = function(app) {
				app.byId('idListItem18').setVisible(false);
				app.byId('idListItem19').setVisible(true);
				app.byId('idListItem32').setVisible(false);
				disableTaxFreeSwitch(app);
			};

			var selectedTypeOfSettlement = oEvent.getSource().getSelectedKey();
			this.oB2B.setTypeOfSettlement(selectedTypeOfSettlement);

			switch (selectedTypeOfSettlement) {
				case "18":
					switchToProgressiveSettlment(this);
					break;

				case "19":
					switchToLinearSettlement(this);
					break;
			}

		},

		onNetExpensesChange: function(oEvent) {
			this.oB2B.setNetExpenses(oEvent.getSource().getValue());
		},

		onVatExpensesChange: function(oEvent) {
			this.oB2B.setVatExpenses(oEvent.getSource().getValue());
		},

		onSocialSecurityChange: function(oEvent) {
			this.oB2B.setSocialType(oEvent.getSource().getState());
		},

		onSocialSicknessChange: function(oEvent) {
			this.oB2B.setSocialSicknes(oEvent.getSource().getState());
		}

	});

});