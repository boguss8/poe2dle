import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameBoard from "@/components/game/GameBoard";
import HowToPlayModal from "@/components/modals/HowToPlayModal";

export default function Home() {
  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <Header />
        <h5>Welcome to PoE2dle!</h5>
        <p>This is the home page.</p>
        <GameBoard />
        <HowToPlayModal />
        <Footer />
      </main>
    </div>
  );
}
