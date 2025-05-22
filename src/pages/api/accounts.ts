import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify([
      { id: '1', name: 'Fidelity Rollover IRA', type: 'IRA', status: 'Complete' },
      { id: '2', name: 'Chase Checking', type: 'Checking Account', status: 'Incomplete' },
      { id: '3', name: 'Vanguard Brokerage', type: 'Brokerage Account', status: 'Complete' }
    ]),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
