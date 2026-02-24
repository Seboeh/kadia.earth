import { getTeamForUser } from '@/lib/db/queries';
import { isLandingOnlyMode } from '@/lib/config/runtime';

export async function GET() {
  if (isLandingOnlyMode()) {
    return new Response('Not found', { status: 404 });
  }
  const team = await getTeamForUser();
  return Response.json(team);
}
