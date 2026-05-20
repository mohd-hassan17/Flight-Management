export const AIRPORTS = [
  { code: "BOM", name: "Mumbai", city: "Mumbai", terminal: "T2" },
  { code: "DEL", name: "Delhi", city: "New Delhi", terminal: "T3" },
  { code: "BLR", name: "Bangalore", city: "Bengaluru", terminal: "T2" },
  { code: "MAA", name: "Chennai", city: "Chennai", terminal: "T1" },
  { code: "HYD", name: "Hyderabad", city: "Hyderabad", terminal: "T1" },
  { code: "CCU", name: "Kolkata", city: "Kolkata", terminal: "T2" },
] as const;

export const POPULAR_ROUTES = [
  { from: "BOM", to: "DEL" },
  { from: "DEL", to: "BOM" },
  { from: "BOM", to: "BLR" },
  { from: "BLR", to: "BOM" },
] as const;

export function getAirport(code: string) {
  return AIRPORTS.find((airport) => airport.code === code.toUpperCase());
}

export function getAirportLabel(code: string) {
  const airport = getAirport(code);
  return airport ? `${airport.city} (${airport.code})` : code.toUpperCase();
}
