export type Product = {
  id: number;
  name: string;
  description: string;
  type: string;
  source: AmountUnit;
  service: {
    id: number;
    name: string;
  };
  operator: {
    id: number;
    name: string;
    logo: string;
    country: {
      iso_code: string;
      name: string;
      flag: string;
      prefix: string;
    };
  };
  availability_zones: string[];
  accepted_credit_party_identifier_fields: string[];
  accepted_debit_party_identifier_fields: string[];
  required_beneficiary_fields: string[];
  required_sender_fields: string[];
  prices: {
    retail: AmountUnit;
    wholesale: AmountUnit;
  };
  calculation_modes: string[];
}

export type AmountUnit = {
  amount: string;
  unit: string;
  unit_type: string;
}