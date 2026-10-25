import { zee } from "@/zee.config";

export const dynamic = "force-static";

/** What wzee.dev/tools lists this app with. */
export function GET() {
  const { name, description, year, status, translations } = zee;
  return Response.json({ name, description, year, status, translations });
}
