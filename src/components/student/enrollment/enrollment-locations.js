/**
 * Country → state/province lists for Step 1 of the enrollment wizard.
 *
 * The option `value` is deliberately the human-readable label itself (e.g.
 * `"India"` rather than a country code): the wizard stores the raw select value
 * in its shared state slice, and that slice is what the success summary echoes
 * back — so the stored answer stays readable everywhere it appears without a
 * lookup table. The same reasoning applies to the state options.
 *
 * Every listed country carries its own subdivision list, so changing country
 * always offers a meaningful State dropdown. `DEFAULT_COUNTRY` seeds the form
 * (the majority of enrollments are domestic) and is what makes the State select
 * usable on first render instead of starting disabled.
 */

/** Ordered exactly as the State dropdown should feel: domestic first. */
export const COUNTRY_OPTIONS = [
  { value: "India", label: "India" },
  { value: "Australia", label: "Australia" },
  { value: "Canada", label: "Canada" },
  { value: "Germany", label: "Germany" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
];

export const DEFAULT_COUNTRY = "India";

/** Every Indian state and union territory — the default country's full list. */
const INDIA_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const AUSTRALIA_STATES = [
  "Australian Capital Territory",
  "New South Wales",
  "Northern Territory",
  "Queensland",
  "South Australia",
  "Tasmania",
  "Victoria",
  "Western Australia",
];

const CANADA_STATES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

const GERMANY_STATES = [
  "Baden-Württemberg",
  "Bavaria",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hesse",
  "Lower Saxony",
  "Mecklenburg-Vorpommern",
  "North Rhine-Westphalia",
  "Rhineland-Palatinate",
  "Saarland",
  "Saxony",
  "Saxony-Anhalt",
  "Schleswig-Holstein",
  "Thuringia",
];

const UAE_STATES = [
  "Abu Dhabi",
  "Ajman",
  "Dubai",
  "Fujairah",
  "Ras Al Khaimah",
  "Sharjah",
  "Umm Al Quwain",
];

const UK_STATES = [
  "England",
  "Northern Ireland",
  "Scotland",
  "Wales",
];

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

/** `country label → [{ value, label }]` in the shape `AuthField` expects. */
export const STATES_BY_COUNTRY = Object.fromEntries(
  [
    ["India", INDIA_STATES],
    ["Australia", AUSTRALIA_STATES],
    ["Canada", CANADA_STATES],
    ["Germany", GERMANY_STATES],
    ["United Arab Emirates", UAE_STATES],
    ["United Kingdom", UK_STATES],
    ["United States", US_STATES],
  ].map(([country, states]) => [
    country,
    states.map((state) => ({ value: state, label: state })),
  ]),
);

/** Options for a country label; an unknown/empty country yields an empty list. */
export const getStatesForCountry = (country = "") =>
  (country && STATES_BY_COUNTRY[country]) || [];
