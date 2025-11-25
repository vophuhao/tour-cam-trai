import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ChatModal from '@/components/modals/chatModal';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <ChatModal />
    </main>
  );
}
