"use client"; // Required for hooks in Next.js 13+
import { useState } from 'react';

export default function SpeechToText() {
  const [text, setText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    };

    recognition.start();
  };

  return (
    <div className="p-4">
      <button 
        onClick={startListening}
        className={`px-4 py-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white`}
      >
        {isListening ? 'Stop Listening' : '🎤 Speak'}
      </button>
      <p className="mt-4 p-2 border rounded">{text || "Transcript will appear here..."}</p>
    </div>
  );
}