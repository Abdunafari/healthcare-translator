import SpeechToText from '@/src/components/SpeechToText';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Healthcare Translator</h1>
      <SpeechToText />
    </main>
  );
}