import Header from "@/components/Header";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {connectToDatabase} from "@/database/mongoose";
import { OmniSearch } from "@/src/features/terminal/components/OmniSearch";

import { ObjectId } from "mongodb";

const Layout = async ({ children }: { children : React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if(!session?.user) redirect('/sign-in');

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    
    // session.user.id might be a string that needs to be converted to ObjectId for _id field
    let userId;
    try {
        userId = new ObjectId(session.user.id);
    } catch {
        userId = session.user.id;
    }

    const dbUser = await db?.collection('user').findOne({ 
        $or: [
            { id: session.user.id }, 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { _id: userId as any }
        ] 
    }) as User | null;

    const user = {
        id: session.user.id,
        name: dbUser?.name || session.user.name,
        email: session.user.email,
        image: dbUser?.image || session.user.image,
        country: dbUser?.country,
        investmentGoals: dbUser?.investmentGoals,
        riskTolerance: dbUser?.riskTolerance,
        preferredIndustry: dbUser?.preferredIndustry,
    }

    return (
        <main className="min-h-screen bg-[#050505]">
            <OmniSearch />
            <Header user={user} />
            {children}
        </main>
    )
}
export default Layout
