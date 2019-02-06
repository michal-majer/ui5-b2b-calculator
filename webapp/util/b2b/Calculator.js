sap.ui.define(['sap/ui/model/json/JSONModel'], function(JSONModel) {
  var LOW_SOCIAL = 197.03,
    LOW_SOCIAL_WITH_SICKNESS = 213.57,
    HIGH_SOCIAL = 834.55,
    HIGH_SOCIAL_WITH_SICKNESS = 904.06,
    HEALTH = 342.32,
    LABOR_FUND = 70.05,
    LOW_SOCIAL_TYPE = true,
    HIGH_SOCIAL_TYPE = false,
    WITHOUT_SICKNESS = false,
    WITH_SICKNESS = true,
    TAX_SCALE = '18',
    TAX_SCALE_LVL_2 = 85528.0,
    TAX_FLAT = '19',
    TAXFREE_ALLOWANCE = 556.02,
    CALC_MONTH = 1;

  /* Could be used in future: */
  //CALC_QUARTER = 3,
  //CALC_YEAR  = 12;

  var B2BCalculator = function(app) {
    this.app = app;
    this.calcPeriod = CALC_MONTH;

    /* Starting Parameters */
    this.setSocialType(LOW_SOCIAL_TYPE);
    this.setSocialSicknes(WITH_SICKNESS);
    this.setTypeOfSettlement(TAX_SCALE);

    this.setHealthContribution();
    this.netExpenses = 0;

    /* Tests */
    this.setNetIncome(3000);
    this.setVatRate(23);
    this.setVatExpenses(0);
    this.recalculate();
  };

  B2BCalculator.prototype.buildUI5Model = function() {
    var app = this;

    var oData = {
      netValue: this.netValue,
      netIncome: this.netIncome,
      vatRate: this.vatRate,
      vatValue: (this.vatValue * -1).toFixed(2),
      clearIncome: this.clearIncome.toFixed(2),
      typeOfSettlement: this.typeOfSettlement,
      taxFree: this.taxFree,
      donation18: (this.donation18 * -1).toFixed(2),
      donation19: (this.donation19 * -1).toFixed(2),
      donation32: this.donation32.toFixed(2),
      donationTotal: (this.donationTotal * -1).toFixed(2),
      socialType: this.socialType,
      socialSickness: this.socialSickness,
      socialContributionValue: (this.socialContributionValue * -1).toFixed(2),
      healthContributionValue: (this.healthContributionValue * -1).toFixed(2),
      laborFundContributionValue: (
        this.laborFundContributionValue * -1
      ).toFixed(2),
      totalSocialContributionValue: (
        this.totalSocialContributionValue * -1
      ).toFixed(2),
      netExpenses: this.netExpenses,
      vatExpenses: this.vatExpenses
    };

    var oModel = new sap.ui.model.json.JSONModel(oData);
    this.app.getView().setModel(oModel);

    var binding = new sap.ui.model.Binding(oModel, '/', oModel.getContext('/'));
    binding.attachChange(function() {
      console.log('Recalculate!');
      app.recalculate();
    });
  };

  B2BCalculator.prototype.recalculate = function() {
    this.calculateSocialSecurityContributions();
    this.calcVat();
    this.calcIncomeTax();
    this.calcClearIncome();

    this.buildUI5Model();
  };

  /* Clear Income */

  B2BCalculator.prototype.calcClearIncome = function() {
    this.clearIncome =
      this.grossValue -
      this.vatValue -
      this.totalSocialContributionValue -
      this.donationTotal -
      this.netExpenses;
  };

  /* Income TAX */

  B2BCalculator.prototype.calcIncomeTax = function() {
    if (this.checkIfIncomeTax()) {
      switch (this.typeOfSettlement) {
        case TAX_SCALE:
          this.calcIncomeTaxScale();
          break;

        case TAX_FLAT:
          this.taxFree = false;
          this.calcIncomeTaxFlat();
          break;
      }
    } else {
      this.donationTotal = 0;
      this.donation18 = 0;
      this.donation19 = 0;
      this.donation32 = 0;
    }
  };

  B2BCalculator.prototype.calcIncomeTaxScale = function() {
    var income =
      this.netIncome - this.netExpenses - this.socialContributionValue;

    var income18 = 0,
      income32 = 0;

    if (income > TAX_SCALE_LVL_2) {
      income18 = TAX_SCALE_LVL_2;
      income32 = income - income18;

      this.donation18 = this.calcPercentOfValue(18, income18);
      this.donation32 = this.calcPercentOfValue(32, income32);
    } else {
      income18 = income;
      this.donation18 = this.calcPercentOfValue(18, income18);
      this.donation32 = 0;
    }

    if (
      this.donation32 !== 0 &&
      this.donation32 >= this.healthContributeTaxReduce
    ) {
      this.donation32 -= this.healthContributeTaxReduce;
    } else if (this.donation18 >= this.healthContributeTaxReduce) {
      this.donation18 -= this.healthContributeTaxReduce;
    } else {
      this.donation18 = 0;
    }

    if (this.taxFree) {
      if (this.donation32 !== 0 && this.donation32 >= TAXFREE_ALLOWANCE) {
        this.donation32 -= TAXFREE_ALLOWANCE;
      } else if (this.donation18 >= TAXFREE_ALLOWANCE) {
        this.donation18 -= TAXFREE_ALLOWANCE;
      } else {
        this.donation18 = 0;
      }
    }

    this.donationTotal = this.donation18 + this.donation32;
  };

  B2BCalculator.prototype.checkIfIncomeTax = function() {
    if (this.netIncome - this.netExpenses - this.socialContributionValue >= 0) {
      return true;
    }
    return false;
  };

  B2BCalculator.prototype.calcIncomeTaxFlat = function() {
    this.donation19 = this.calcPercentOfValue(
      TAX_FLAT,
      this.netIncome - this.netExpenses - this.socialContributionValue
    );
    if (this.donation19 >= this.healthContributeTaxReduce) {
      this.donation19 -= this.healthContributeTaxReduce;
    } else {
      this.donation19 = 0;
    }

    this.donationTotal = this.donation19;
  };

  /* VAT */

  B2BCalculator.prototype.calcVat = function() {
    this.vatValue = this.calcPercentOfValue(this.vatRate, this.netIncome);
    this.grossValue = parseFloat(this.netIncome) + this.vatValue;
    this.vatValue -= this.vatExpenses;
  };

  /* Social Sacurity Contribution*/

  B2BCalculator.prototype.calculateSocialSecurityContributions = function() {
    this.calculateSocialContribution();
    this.setHealthContribution();
    this.calculateLaborFundContribution();

    /* Change period */
    this.socialContributionValue *= this.calcPeriod;
    this.healthContributionValue *= this.calcPeriod;
    this.laborFundContributionValue *= this.calcPeriod;

    /* Total Calculation */
    this.totalSocialContributionValue =
      this.socialContributionValue +
      this.healthContributionValue +
      this.laborFundContributionValue;
  };

  B2BCalculator.prototype.calculateSocialContribution = function() {
    if (this.socialType === LOW_SOCIAL_TYPE) {
      if (this.socialSickness === WITH_SICKNESS) {
        this.socialContributionValue = LOW_SOCIAL_WITH_SICKNESS;
      } else if (this.socialSickness === WITHOUT_SICKNESS) {
        this.socialContributionValue = LOW_SOCIAL;
      }
    } else if (this.socialType === HIGH_SOCIAL_TYPE) {
      if (this.socialSickness === WITH_SICKNESS) {
        this.socialContributionValue = HIGH_SOCIAL_WITH_SICKNESS;
      } else if (this.socialSickness === WITHOUT_SICKNESS) {
        this.socialContributionValue = HIGH_SOCIAL;
      }
    }
  };

  B2BCalculator.prototype.calculateLaborFundContribution = function() {
    if (this.socialType === HIGH_SOCIAL_TYPE) {
      this.laborFundContributionValue = LABOR_FUND;
    } else {
      this.laborFundContributionValue = 0;
    }
  };

  /* Util */

  B2BCalculator.prototype.calcPercentOfValue = function(percent, value) {
    return (percent * value) / 100;
  };

  /* Setters */

  B2BCalculator.prototype.setNetIncome = function(netIncome) {
    this.netValue = netIncome;
    //this.netIncome = netIncome * this.calcPeriod;
    this.netIncome = netIncome;
  };

  B2BCalculator.prototype.setVatRate = function(vatRate) {
    this.vatRate = vatRate;
  };

  B2BCalculator.prototype.setTypeOfSettlement = function(typeOfSettlement) {
    this.typeOfSettlement = typeOfSettlement;
  };

  B2BCalculator.prototype.setSocialType = function(socialType) {
    this.socialType = socialType;
  };

  B2BCalculator.prototype.setSocialSicknes = function(socialSickness) {
    this.socialSickness = socialSickness;
  };

  B2BCalculator.prototype.setHealthContribution = function() {
    this.healthContributionValue = HEALTH;
    this.calcHealthContributeTaxReduceValue();
  };

  B2BCalculator.prototype.calcHealthContributeTaxReduceValue = function() {
    this.healthContributeTaxReduce = (HEALTH * 7.75) / 9;
  };

  B2BCalculator.prototype.setLaborFund = function(laborFund) {
    this.laborFund = laborFund;
  };

  B2BCalculator.prototype.setTaxFree = function(taxFree) {
    this.taxFree = taxFree;
  };

  B2BCalculator.prototype.setNetExpenses = function(netExpenses) {
    this.netExpenses = netExpenses;
  };

  B2BCalculator.prototype.getNetExpenses = function() {
    return this.netExpenses;
  };

  B2BCalculator.prototype.setVatExpenses = function(vatExpenses) {
    this.vatExpenses = vatExpenses;
  };

  B2BCalculator.prototype.getVatExpenses = function() {
    return this.vatExpenses;
  };

  return B2BCalculator;
});
