import { Header } from '@/components/Header';
import { Wall } from '@/components/Wall';
import { Footer } from '@/components/Footer';
import { FeatureSlot } from '@/components/FeatureSlot';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-12">
        <Wall />
        {/* Features in the "main" slot render here — registered in features/registry.ts */}
        <FeatureSlot name="main" />
      </main>
      <Footer />
    </div>
  );
}
