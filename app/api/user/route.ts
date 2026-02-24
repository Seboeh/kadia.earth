import { getUser } from '@/lib/db/queries';
import { isLandingOnlyMode } from '@/lib/config/runtime';

export async function GET() {
  if (isLandingOnlyMode()) {
    return new Response('Not found', { status: 404 });
  }
  const user = await getUser();
  return Response.json(user);
}
