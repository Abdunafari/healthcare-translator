'use client'; // Must be first line since we're using hooks

import { useState } from 'react';
import axios from 'axios';
import { useSpeechRecognition } from 'react-speech-recognition';
import SpeechRecognition from 'react-speech-recognition';

export default function HomePage() {
  // Speech recognition hooks
  const {
    transcript,
    listening: isListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // State management
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [fullTranscript, setFullTranscript] = useState('');

  // Translation function
  const translateText = async (text: string) => {
    try {
      setIsTranslating(true);
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo',
          messages: [{
            role: 'user',
            content: `As a medical translator, convert this to Spanish: '${text}'. Return ONLY the translation.`,
          }],
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices?.[0]?.message?.content || 'Translation failed.';
    } catch (error) {
      console.error("Translation error:", error);
      return "Translation failed. Please check your API key.";
    } finally {
      setIsTranslating(false);
    }
  };

  // Speech synthesis
  const speakTranslation = () => {
    if (!translatedText) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    synth.speak(utterance);
  };

  // Start/stop handlers
  const startListening = () => {
    resetTranscript();
    setFullTranscript('');
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = async () => {
    SpeechRecognition.stopListening();
    if (transcript) {
      setFullTranscript(transcript);
      const translated = await translateText(transcript);
      setTranslatedText(translated);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-4 text-red-500">
        Your browser doesn&apos;t support speech recognition.
      </div>
    );
  }
  

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Healthcare Translator</h1>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={startListening}
          disabled={isListening || isTranslating}
          className={`px-4 py-2 rounded-full ${
            isListening ? 'bg-gray-400' : 'bg-blue-500'
          } text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2`}
        >
          🎤 {isListening ? 'Recording...' : 'Start Recording'}
        </button>
        
        <button 
          onClick={stopListening}
          disabled={!isListening}
          className={`px-4 py-2 rounded-full ${
            !isListening ? 'bg-gray-400' : 'bg-red-500'
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
  );
}
