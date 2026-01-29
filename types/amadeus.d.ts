declare module 'amadeus' {
  interface AmadeusOptions {
    clientId: string;
    clientSecret: string;
    hostname?: string;
    logger?: Console;
  }

  interface LocationResponse {
    data: Array<{
      iataCode: string;
      name: string;
      address?: {
        cityName?: string;
      };
    }>;
  }

  interface FlightOffersResponse {
    data: unknown[];
    result: {
      dictionaries?: {
        carriers?: Record<string, string>;
        aircraft?: Record<string, string>;
      };
    };
  }

  class Amadeus {
    constructor(options: AmadeusOptions);
    shopping: {
      flightOffersSearch: {
        get(params: Record<string, unknown>): Promise<FlightOffersResponse>;
      };
    };
    referenceData: {
      locations: {
        get(params: Record<string, unknown>): Promise<LocationResponse>;
      };
    };
  }

  export = Amadeus;
}
