import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/app/lib/amadeus';
import { FlightSearchParams } from '@/app/lib/types';

export async function POST(request: NextRequest) {
  try {
    const params: FlightSearchParams = await request.json();
    
    // Validate required fields
    if (!params.origin || !params.destination || !params.departureDate) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, departureDate' },
        { status: 400 }
      );
    }

    // Validate adults
    if (!params.adults || params.adults < 1 || params.adults > 9) {
      return NextResponse.json(
        { error: 'Adults must be between 1 and 9' },
        { status: 400 }
      );
    }

    const result = await searchFlights(params);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Flight search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
