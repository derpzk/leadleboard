import Leaderboard from "@/components/Leaderboard";
import { samplePlayers } from "@/data/samplePlayers";
import ResultForm from "@/components/ResultForm";
import Link from "next/link";

type AppIntroProps = {
  tagline: string;
};

// Intro component
const AppIntro = ({ tagline }: AppIntroProps) => {
  return (
    <div>
      <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        leadleboard
      </h1>
      <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {tagline}
      </p>
    </div>
  );
};

const Home = () => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-between py-12 px-6 bg-white dark:bg-black sm:items-start sm:px-10 sm:py-20">
        <AppIntro tagline="Crown the true goat of daily games." />
        <nav aria-label="Page navigation" className="my-6">
          <Link href="/results" className="underline underline-offset-4">All results</Link>
        </nav>
        <section className="w-full min-w-0">
          <h2 className="text-2xl font-bold">Enter a game result</h2>
          <ResultForm />
        </section>
        <Leaderboard players={samplePlayers} />
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sample player standings. Points and streaks are not calculated from submissions yet.
        </p>
      </main>
    </div>
  );
};

export default Home;
