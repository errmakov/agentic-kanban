import { Header } from '@/components/Header';
import { Wall } from '@/components/Wall';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <Wall />
        <CountdownTimer />
      </main>
      <Footer />
    </div>
  );
}
