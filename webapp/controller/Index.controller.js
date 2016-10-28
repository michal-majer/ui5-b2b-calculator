sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"mm/util/b2b/Calculator",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/ui/commons/Label",
	"sap/m/Input",
	"sap/m/CheckBox",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/ui/layout/form/SimpleForm"
], function(Controller, B2BCalculator, JSONModel, Dialog, Button, Label, Input, CheckBox, Select, Item, SimpleForm) {
	"use strict";
	
	var oB2B;

	return Controller.extend("mm.controller.Index", {
		
		
		
		oQuickViewNettoModel: new JSONModel(),
		oSettlementModel: new JSONModel(),
		oTaxFreeDataModel: new JSONModel(),
		oQuickViewSocialContributeModel: new JSONModel(),
		oQuickViewHealthContributeModel: new JSONModel(),

		onInit: function() {
			this.oB2B = new B2BCalculator(this);
			oB2B = this.oB2B;

			var mQuickViewNettoExplainData = {
				pages: [{
					pageId: "QuickViewNettoExplainId",
					header: "Przychód netto",
					groups: [{
						heading: "Przychód netto",
						elements: [{
							label: "Opis",
							value: "Kwota netto na wystawionych fakturach. Od tej kwoty zostanie obliczony podatek VAT. Suma kwoty netto i VAT stanowi kwotę brutto, którą otrzymasz jako wynagrodznie."
						}]
					}]
				}]
			};

			var mSettlementData = {
				pages: [{
					pageId: "settlmentIdPage",
					header: "Wybór formy opodatkowania",
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
					header: "Kwota wolna od podatku",
					groups: [{
						heading: "Kwota wolna od podatku",
						elements: [{
							label: "Opis",
							value: "Kwota jest wolna od opodatkowania jeśli nie przekracza 3091 zł w skali roku. Możliwość zmniejszenia podatku o 556,02 zł rocznie tylko gdy formą opodatkowania jest skala podatkowa."
						}]
					}]
				}]
			};

			var mQuickViewSocialContributeExplainData = {
				pages: [{
					pageId: "QuickViewSocialContributeExplainId",
					header: "Preferencyjna składka ZUS",
					groups: [{
						heading: "Obniżona składka społeczna",
						elements: [{
							label: "Opis",
							value: "Osoby podejmujące działalność gospodarczą po raz pierwszy od 5 lat mają prawo do ograniczenia wysokości swoich składek ZUS w okresie pierwszych 24 miesięcy kalendarzowych od dnia rozpoczęcia wykonywania działalności gospodarczej."
						}]
					}]
				}]
			};

			var mQuickViewHealthContributeExplainData = {
				pages: [{
					pageId: "QuickViewSocialContributeExplainId",
					header: "Ubezpieczenie chorobowe w ZUS",
					groups: [{
						heading: "Ubezpieczenie chorobowe",
						elements: [{
							label: "Opis",
							value: "Każdy przedsiębiorca, który otwiera własną firmę, musi obowiązkowo zgłosić się z tego tytułu do ubezpieczeń w ZUS. Do ubezpieczenia chorobowego może natomiast przystąpić tylko na swój wyraźny wniosek. Jest ono bowiem dla niego dobrowolne. Aby jednak korzystać ze świadczeń chorobowych, musi m.in. terminowo opłacać składki ubezpieczeniowe."
						}]
					}]
				}]
			};

			// set the data for the model
			this.oQuickViewNettoModel.setData(mQuickViewNettoExplainData);
			this.oSettlementModel.setData(mSettlementData);
			this.oTaxFreeDataModel.setData(mTaxFreeData);
			this.oQuickViewSocialContributeModel.setData(mQuickViewSocialContributeExplainData);
			this.oQuickViewHealthContributeModel.setData(mQuickViewHealthContributeExplainData);
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

		onDraggableDialog: function(oEvent) {
			var dialog = new Dialog({
				title: 'Dodaj koszt',
				contentWidth: "150px",
				contentHeight: "320px",
				draggable: true,
				content:
					new SimpleForm({ 
						layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
						content: [
							new Label ({ text:"Kwota netto" }),
							new Input ({ 
								id: "idDialogExpenseNet",
								type: "Number",
								maxLength: 10,
								change: [this.onDialogExpenseNetChange, this],
								liveChange: this.onDialogExpenseNetChange,
								valueLiveUpdate: true
							}),
							
							new Label ({ text:"Stawka VAT" }),
							new Select ({ 
								id: "idDialogExpensVatRate",
								change: [this.onDialogVatRateChange, this],
								selectedKey: 23,
								items: [
									new Item({ key: 0, text: "0%" }),
									new Item({ key: 5, text: "5%" }),
									new Item({ key: 8, text: "8%" }),
									new Item({ key: 23, text: "23%" })
								]
							}),
							
							new Label ({ text:"Kwota brutto" }),
							new Input ({ 
								id: "idDialogExpenseGross",
								type: "Number",
								maxLength: 10,
								change: [this.onDialogExpenseGrossChange, this],
								liveChange: this.onDialogExpenseGrossChange,
								valueLiveUpdate: true
							}),
							new CheckBox ({
								id: "idDialog50VatCheckBox",
								text: "Odlicz 50% VAT"
							})
						]
					})
				,
				endButton: new Button({
					text: 'Dodaj',
					type: sap.m.ButtonType.Accept,
					press: [function() {
						var currentNetExpenses = this.oB2B.getNetExpenses();
						var currentVatExpenses = this.oB2B.getVatExpenses();
						
						var vatHalfCheck = sap.ui.getCore().byId("idDialog50VatCheckBox").getSelected();
						var vatExpense = parseFloat(sap.ui.getCore().byId("idDialogExpenseGross").getValue()) - (parseFloat(sap.ui.getCore().byId("idDialogExpenseNet").getValue()));
						
						if(vatHalfCheck) {
							var halfVat = vatExpense / 2;
							currentNetExpenses = parseFloat(currentNetExpenses) + parseFloat(sap.ui.getCore().byId("idDialogExpenseNet").getValue());
							currentNetExpenses = parseFloat(currentNetExpenses) + parseFloat(halfVat);
							currentVatExpenses = parseFloat(currentVatExpenses) + parseFloat(halfVat);
						} else {
							var net = parseFloat(sap.ui.getCore().byId("idDialogExpenseNet").getValue());
							var vat = (parseFloat(sap.ui.getCore().byId("idDialogExpenseGross").getValue())) - (parseFloat(sap.ui.getCore().byId("idDialogExpenseNet").getValue()));
							
							if( net !== null) {
								currentNetExpenses = parseFloat(currentNetExpenses) + parseFloat(net);	
							}
							
							if( vat !== null) {
								currentVatExpenses = parseFloat(currentVatExpenses) + parseFloat(vat);
							}
						}
						
						this.oB2B.setNetExpenses((currentNetExpenses).toFixed(2));
						this.oB2B.setVatExpenses((currentVatExpenses).toFixed(2));
						
						this.getView().byId("idExpenses").setValue(currentNetExpenses.toFixed(2));
						this.getView().byId("idExpensesVAT").setValue(currentVatExpenses.toFixed(2));
						
						this.close();
					}, this]
				}),
				beginButton: new Button({
					text: 'Anuluj',
					type: sap.m.ButtonType.Reject,
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			//to get access to the global model
			this.getView().addDependent(dialog);
			dialog.open();
		},
		
		onDialogExpenseNetChange: function(oEvent) {
			var vatRate = sap.ui.getCore().byId("idDialogExpensVatRate").getSelectedKey();
			var net = oEvent.getSource().getValue();
			var vatValue = ( vatRate * net ) / 100;
			sap.ui.getCore().byId("idDialogExpenseGross").setValue((parseFloat(net) + vatValue).toFixed(2));
		},
		
		onDialogVatRateChange: function(oEvent) {
			var net = sap.ui.getCore().byId("idDialogExpenseNet").getValue();
			var vatRate = oEvent.getSource().getSelectedKey();
			var vatValue = ( vatRate * net ) / 100;
			sap.ui.getCore().byId("idDialogExpenseGross").setValue((parseFloat(net) + vatValue).toFixed(2));
		},
		
		onDialogExpenseGrossChange: function(oEvent) {
			var vatRate = parseInt(sap.ui.getCore().byId("idDialogExpensVatRate").getSelectedKey());
			var gross = parseFloat(oEvent.getSource().getValue());
			var netValue = ( gross * 100 ) / (100 + vatRate);
			
			sap.ui.getCore().byId("idDialogExpenseNet").setValue((parseFloat(netValue.toFixed(2))));
		},		
		
		handleNettoQuickViewPress: function(oEvent) {
			this.openQuickView(oEvent, this.oQuickViewNettoModel);
		},

		handleGenericQuickViewPress: function(oEvent) {
			this.openQuickView(oEvent, this.oSettlementModel);
		},

		handleTaxFreeQuickViewPress: function(oEvent) {
			this.openQuickView(oEvent, this.oTaxFreeDataModel);
		},

		handleSocialQuickViewPress: function(oEvent) {
			this.openQuickView(oEvent, this.oQuickViewSocialContributeModel);
		},

		handleHealthQuickViewPress: function(oEvent) {
			this.openQuickView(oEvent, this.oQuickViewHealthContributeModel);
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