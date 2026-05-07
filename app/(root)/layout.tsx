import Header from "@/components/Header";
import { getAuth } from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {connectToDatabase} from "@/database/mongoose";
import { OmniSearch } from "@/src/features/terminal/components/OmniSearch";

const Layout = async ({ children }: { children : React.ReactNode }) => {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    if(!session?.user) redirect('/sign-in');

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    const dbUser = await db?.collection('user').findOne({ 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $or: [{ id: session.user.id }, { _id: session.user.id as any }] 
    });

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
