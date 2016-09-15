sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"mm/util/b2b/Calculator"
], function(Controller, B2BCalculator) {
	"use strict";

	return Controller.extend("mm.controller.Index", {
		onInit: function() {
			this.oB2B = new B2BCalculator(this);
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
			
			switch(selectedTypeOfSettlement) {
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