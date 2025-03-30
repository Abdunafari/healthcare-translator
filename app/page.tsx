import SpeechToText from '@/src/components/SpeechToText';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Healthcare Translator</h1>
      
      <SpeechToText />

      <div className="p-4 max-w-md mx-auto">
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleStartListening}
            disabled={isListening || isTranslating}
            className={`px-4 py-2 rounded-full ${
              isListening ? "bg-gray-400" : "bg-blue-500"
            } text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            🎤 {isListening ? "Recording..." : "Start Recording"}
          </button>

          <button
            onClick={handleStopListening}
            disabled={!isListening}
            className={`px-4 py-2 rounded-full ${
              !isListening ? "bg-gray-400" : "bg-red-500"
            } text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            ⏹️ Finish
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Live Transcription:</h3>
            <p className="mt-1 p-3 border rounded-lg bg-white min-h-12">
              {transcript || (isListening ? "Listening..." : "Press Start Recording")}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Full Transcript:</h3>
            <p className="mt-1 p-3 border rounded-lg bg-gray-100 min-h-12">
              {fullTranscript || "Transcript will appear here"}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-700">Translation (Spanish):</h3>
              <button
                onClick={speakTranslation}
                disabled={!translatedText || isTranslating}
                className="px-3 py-1 bg-green-500 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                🔊 Play
              </button>
            </div>
            <p className="mt-1 p-3 border rounded-lg bg-gray-50 min-h-12">
              {isTranslating ? "Translating..." : translatedText || "Translation will appear here"}
            </p>
          </div>
        </div>

        {isTranslating && (
          <div className="mt-4 text-sm text-gray-500">
            Translating medical terminology...
          </div>
        )}
      </div>
    </main>
  );
}
