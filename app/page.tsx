import { Header } from '@/components/Header';
import { Wall } from '@/components/Wall';
import { ReactionBar } from '@/components/ReactionBar';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-12">
        <Wall />
        <ReactionBar />
      </main>
      <Footer />
    </div>
  );
}
