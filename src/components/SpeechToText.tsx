"use client";
import { useState, useRef } from 'react';
import axios from 'axios';

export default function SpeechToText() {
  const [text, setText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [fullTranscript, setFullTranscript] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  const translateText = async (text: string) => {
    try {
      setIsTranslating(true);
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'user',
              content: `Translate this medical text to Spanish: "${text}". Return ONLY the translation.`,
            },
          ],
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Translation error:", error);
      return "Translation failed. Please check your API key and try again.";
    } finally {
      setIsTranslating(false);
    }
  };

  const speakTranslation = () => {
    if (!translatedText) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = 'es-ES'; // Spanish
    utterance.rate = 0.9; // Slightly slower for medical terms
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setFullTranscript("");
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setText(interimTranscript);
      setFullTranscript(prev => prev + finalTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current.start();
      }
    };

    recognitionRef.current.start();
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Translate the full transcript when finished
      if (fullTranscript) {
        const translated = await translateText(fullTranscript);
        setTranslatedText(translated);
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex gap-2 mb-4">
        <button 
          onClick={startListening}
          disabled={isListening || isTranslating}
          className={`px-4 py-2 rounded-full ${
            isListening ? 'bg-gray-400' : 'bg-blue-500'
          } text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2`}
        >
          🎤 Start Recording
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
            {text || (isListening ? "Listening..." : "Press Start Recording to begin")}
          </p>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700">Full Transcript:</h3>
          <p className="mt-1 p-3 border rounded-lg bg-gray-100 min-h-12">
            {fullTranscript || "Your complete transcript will appear here"}
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