import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/better-auth/auth";

export async function GET(req: Request) {
    const auth = await getAuth();
    const handler = toNextJsHandler(auth);
    return handler.GET!(req);
}

export async function POST(req: Request) {
    const auth = await getAuth();
    const handler = toNextJsHandler(auth);
    return handler.POST!(req);
}
