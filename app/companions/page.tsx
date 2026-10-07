import { auth } from "@clerk/nextjs/server";
import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import {
    getAllCompanions,
    getBookmarkedCompanions,
    getUserSessions,
} from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";

const Page = async () => {
    const { userId } = await auth();

    const [companions, recentSessionsCompanions, bookmarkedCompanions] =
        await Promise.all([
            getAllCompanions({ limit: 3 }),
            userId ? getUserSessions(userId, 10) : Promise.resolve([]),
            userId ? getBookmarkedCompanions(userId) : Promise.resolve([]),
        ]);

    // IDs of companions already bookmarked by the signed-in user.
    const bookmarkedIds = new Set(
        bookmarkedCompanions.map((companion) => companion.id)
    );

    // A companion may have several completed sessions.
    // Show it once in the recent-sessions list to avoid duplicate React keys.
    const uniqueRecentSessionsCompanions = Array.from(
        new Map(
            recentSessionsCompanions.map((companion) => [
                companion.id,
                companion,
            ])
        ).values()
    );

    return (
        <main>
            <h1>Popular Companions</h1>

            <section className="home-section">
                {companions.map((companion) => (
                    <CompanionCard
                        key={companion.id}
                        {...companion}
                        color={getSubjectColor(companion.subject)}
                        bookmarked={bookmarkedIds.has(companion.id)}
                    />
                ))}
            </section>

            <section className="home-section">
                <CompanionsList
                    title="Recently completed sessions"
                    companions={uniqueRecentSessionsCompanions}
                    classNames="w-2/3 max-lg:w-full"
                />
                <CTA />
            </section>
        </main>
    );
};

export default Page;