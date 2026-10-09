import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Square, AlertCircle, Check, RotateCcw } from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../lib/translations';

interface VoiceControlsProps {
  language: Language;
  onTranscriptionComplete?: (text: string) => void;
  textToRead?: string;
  className?: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  language,
  onTranscriptionComplete,
  textToRead,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const strings = UI_STRINGS[language];

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getLanguageLocale = (lang: Language) => {
    switch (lang) {
      case 'mr':
        return 'mr-IN';
      case 'hi':
        return 'hi-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  };

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setErrorMessage(
        language === 'mr'
          ? 'तुमच्या ब्राऊझरमध्ये व्हॉईस इनपुट उपलब्ध नाही. मजकूर वापरा.'
          : language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया लिखकर टाइप करें।'
          : 'Voice speech recognition is not supported in this browser. Please use text typing.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = getLanguageLocale(language);
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscribedText(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage(
            language === 'mr'
              ? 'मायक्रोफोन परवानगी नाकारली गेली. सेटिंग्ज तपासा.'
              : language === 'hi'
              ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। सेटिंग्स जांचें।'
              : 'Microphone permission denied. Please allow microphone access.'
          );
        } else {
          setErrorMessage(`Audio input issue (${event.error}). Try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcribedText.trim().length > 0) {
          setShowConfirmModal(true);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setErrorMessage('Could not initialize microphone. Please check permissions.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const confirmTranscription = () => {
    if (onTranscriptionComplete && transcribedText.trim()) {
      onTranscriptionComplete(transcribedText.trim());
    }
    setShowConfirmModal(false);
    setTranscribedText('');
  };

  const cancelTranscription = () => {
    setShowConfirmModal(false);
    setTranscribedText('');
  };

  const toggleSpeakText = () => {
    if (!('speechSynthesis' in window)) {
      setErrorMessage('Text-to-speech audio reader is not supported in your browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!textToRead) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = getLanguageLocale(language);
    utterance.rate = 0.9; // clear, gentle pace for rural/elderly accessibility

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Speak / Audio Playback Button */}
        {textToRead && (
          <button
            type="button"
            onClick={toggleSpeakText}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-2 flex items-center gap-2 rounded-xl text-xs font-semibold border transition-all ${
              isPlayingAudio
                ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
            }`}
            title={isPlayingAudio ? strings.voiceStop : strings.voiceSpeak}
            aria-label={isPlayingAudio ? strings.voiceStop : strings.voiceSpeak}
          >
            {isPlayingAudio ? (
              <>
                <Square className="w-4 h-4 fill-amber-800 text-amber-800" />
                <span className="hidden sm:inline">{strings.voiceStop}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-800" />
                <span className="hidden sm:inline">{strings.voiceSpeak}</span>
              </>
            )}
          </button>
        )}

        {/* Microphone Recording Button */}
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`min-h-[44px] min-w-[44px] px-4 py-2 flex items-center gap-2 rounded-xl text-xs font-semibold transition-all ${
            isListening
              ? 'bg-rose-600 text-white shadow-md ring-4 ring-rose-200 animate-pulse'
              : 'bg-emerald-900 text-white hover:bg-emerald-800 shadow-xs'
          }`}
          title={isListening ? strings.voiceListening : strings.voiceAssistant}
          aria-label={isListening ? strings.voiceListening : strings.voiceAssistant}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span className="font-bold">{strings.voiceListening}</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">{strings.voiceAssistant}</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Spoken Word Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <Mic className="w-5 h-5 text-emerald-800" />
              <h3 className="text-base font-semibold">{strings.voiceConfirmTitle}</h3>
            </div>
            <p className="text-xs text-stone-500">
              You can review or edit what was heard before submitting:
            </p>
            <textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              rows={3}
              className="w-full text-sm p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800 text-stone-900 bg-stone-50"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={cancelTranscription}
                className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {strings.voiceCancelBtn}
              </button>
              <button
                type="button"
                onClick={confirmTranscription}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                {strings.voiceConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
