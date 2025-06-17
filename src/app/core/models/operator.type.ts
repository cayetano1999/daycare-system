import { Country } from "./country.type";

export type Operator = {
  country: Country;
  logo: string;
  name: string;
  id: number;
  service: {
    id: number;
    name: string;
  }
}