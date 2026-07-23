export const KING_COUNTY_ZIP_CODES = new Set([
  "98001","98002","98003","98004","98005","98006","98007","98008","98009","98010","98011","98013","98014","98015","98019","98022","98023","98024","98025","98027","98028","98029","98030","98031","98032","98033","98034","98035","98038","98039","98040","98041","98042","98045","98047","98050","98051","98052","98053","98054","98055","98056","98057","98058","98059","98062","98063","98064","98065","98070","98071","98072","98073","98074","98075","98077","98083","98089","98092","98093","98101","98102","98103","98104","98105","98106","98107","98108","98109","98111","98112","98113","98114","98115","98116","98117","98118","98119","98121","98122","98124","98125","98126","98127","98129","98131","98132","98133","98134","98136","98138","98139","98141","98144","98145","98146","98148","98151","98154","98155","98158","98160","98161","98164","98165","98166","98168","98170","98171","98174","98175","98177","98178","98181","98184","98185","98188","98190","98191","98194","98195","98198","98199","98224","98251","98288","98354"
]);

export enum ClaimType {
  PropertyDamage = "Property Damage",
  PersonalInjury = "Personal Injury",
  BreachOfContract = "Breach of Contract",
  LeaseAgreement = "Lease Agreement",
  Wages = "Wages",
  Loan = "Loan",
  Rent = "Rent",
  GoodsAndServices = "Goods and Services",
  AutomobileAccident = "Automobile Accident",
  DamageDeposit = "Damage Deposit",
  OpenAccount = "Open Account",
  ServiceRendered = "Service Rendered",
  WrittenInstrument = "Written Instrument",
  Other = "Other"
}

export enum Ethnicity {
  Asian = "Asian",
  Black = "African American",
  Hispanic = "Hispanic or Latino",
  NativeAmerican = "Native American or Alaska Native",
  PacificIslander = "Native Hawaiian or Other Pacific Islander",
  White = "Caucasian",
  Other = "Other"
}

export class EligibilityForm {
  // Define the properties and methods for the eligibility form
  private age: number;
  private claimNature: string;
  private claimAmount: number;
  private claimType: string;
  private defendantType: string;
  private defendantEthnicity: string;
  private plaintiffType: string;
  private plaintiffEthnicity: string;
  private incidentDate: Date;
  private settlementAttempts: boolean;
  private canPayFees: boolean;
  private selfRepresentation: boolean;
  private zipCode: string;
  private hasGuardian: boolean;
  private hasDefendantInfo: boolean;
  private defendantNotBankrupted: boolean;
  private firstClaimAgainstDefendant: boolean;
  private hasFewerThan12Claims: boolean;
  private understandsCourtAttendance: boolean;
  constructor(public input: string) {
    try {
      const data = JSON.parse(input);

      this.age = data.age;
      this.claimNature = data.claimNature;
      this.claimAmount = data.claimAmount;
      this.claimType = data.claimType;
      this.defendantType = data.defendantType;
      this.defendantEthnicity = data.defendantEthnicity;
      this.plaintiffType = data.plaintiffType;
      this.plaintiffEthnicity = data.plaintiffEthnicity;
      this.incidentDate = data.incidentDate ? new Date(data.incidentDate) : undefined;
      this.settlementAttempts = data.settlementAttempts;
      this.canPayFees = data.canPayFee;
      this.selfRepresentation = data.selfRepresentation;
      this.zipCode = data.zipCode;
      this.hasGuardian = data.hasGuardian;
      this.hasDefendantInfo = data.hasDefendantInfo;
      this.defendantNotBankrupted = data.defendantInBankruptcy;
      this.firstClaimAgainstDefendant = data.firstClaimAgainstDefendant;
      this.hasFewerThan12Claims = data.hasMoreThan12Claims;
      this.understandsCourtAttendance = data.understandsCourtAttendance;
    } catch (e) {
      throw new Error("Invalid input JSON string for EligibilityForm");
    }
  }

  public getAge() {
    return this.age
  }
  public getClaimNature() {
    return this.claimNature
  }
  public getClaimAmount() {
    return this.claimAmount
  }
  public getClaimType() {
    return this.claimType
  }
  public getDefendantType() {
    return this.defendantType
  }
  public getDefendantEthnicity() {
    return this.defendantEthnicity
  }
  public getPlaintiffType() {
    return this.plaintiffType
  }
  public getPlaintiffEthnicity() {
    return this.plaintiffEthnicity
  }
  public getIncidentDate() {
    return this.incidentDate
  }
  public getSettlementAttempts() {
    return this.settlementAttempts
  }
  public getCanPayFees() {
    return this.canPayFees
  }
  public getSelfRepresentation() {
    return this.selfRepresentation
  }
  public getZipCode() {
    return this.zipCode
  }
  public getHasGuardian() {
    return this.hasGuardian
  }
  public getHasDefendantInfo() {
    return this.hasDefendantInfo
  }
  public getDefendantInBankruptcy() {
    return this.defendantNotBankrupted
  }
  public getFirstClaimAgainstDefendant() {
    return this.firstClaimAgainstDefendant
  }
  public getHasMoreThan12Claims() {
    return this.hasFewerThan12Claims
  }
  public getUnderstandsCourtAttendance() {
    return this.understandsCourtAttendance
  }

  public isEligible(): [boolean, string[]] {
    // Implement eligibility logic here
    let inEligibleMessages: string[] = []
    let isEligible = true
    console.log("Incident Date:", this.incidentDate);
    if (this.age < 18 && !this.hasGuardian) {
      inEligibleMessages.push("The claimant must be at least 18 years old or have a guardian appointed to file a claim.");
      isEligible = false;
    }
    if (this.claimAmount > 10000) {
      inEligibleMessages.push("The claim amount exceeds the maximum limit for small claims.");
      isEligible = false;
    }
    if (this.claimAmount > 5000 && this.defendantType !== 'individual') {
      inEligibleMessages.push("Claims over $5000 can only be filed against individuals.");
      isEligible = false;
    }
    if (this.claimAmount > 5000 && this.plaintiffType !== 'individual') {
      inEligibleMessages.push("Claims over $5000 can only be filed by individuals.");
      isEligible = false;
    }
    if (!KING_COUNTY_ZIP_CODES.has(this.zipCode)) {
      inEligibleMessages.push("The claimant must reside in King County to file a claim.");
      isEligible = false;
    }
    if (this.claimType === 'Other') {
      inEligibleMessages.push("Not in the list of accepted claim types.");
      isEligible = false;
    }
    if (!this.selfRepresentation) {
      inEligibleMessages.push("The claimant must represent themselves in small claims court.");
      isEligible = false;
    }
    if (this.incidentDate) {
      const today = new Date();
      const sixYearsAgo = new Date(
        today.getFullYear() - 6,
        today.getMonth(),
        today.getDate()
      );
      if (this.incidentDate < sixYearsAgo) {
        inEligibleMessages.push(`The incident date of ${this.incidentDate.toDateString()} is more than 6 years old to the date.`);
        isEligible = false;
      }
    }
    if (!this.settlementAttempts) {
      inEligibleMessages.push("Parties must attempt to resolve the dispute before filing. ");
      isEligible = false;
    }
    if (!this.hasDefendantInfo) {
      inEligibleMessages.push("The claimant must have the defendant's legal name and valid residential address.");
      isEligible = false;
    }
    if (!this.defendantNotBankrupted) {
      inEligibleMessages.push("The claimant cannot file a claim if the defendant is currently in bankruptcy.");
      isEligible = false;
    }
    if (!this.firstClaimAgainstDefendant) {
      inEligibleMessages.push("The claimant can only file one claim against the same defendant in a 12 month period.");
      isEligible = false;
    }
    if (!this.canPayFees) {
      inEligibleMessages.push("The claimant must be able to pay the court filing fees.");
      isEligible = false;
    }
    if (!this.hasFewerThan12Claims) {
      inEligibleMessages.push("The claimant cannot have filed more than 12 claims in the past year.");
      isEligible = false;
    }
    if (!this.understandsCourtAttendance) {
      inEligibleMessages.push("The claimant must understand that they are required to attend the court hearing.");
      isEligible = false;
    }

    return [isEligible, inEligibleMessages];
  }
}


// export function isEligibleForSmallClaim(input: string): boolean {
// //   // Define the criteria for small claim eligibility
// //   const maxClaimAmount = 5000; // Example threshold for small claims
// //   const claimAmount = parseFloat(input);

// //   // Check if the input is a valid number and within the threshold
//     console.log("Checking eligibility for small claim with input:", input);
//     return true

// }