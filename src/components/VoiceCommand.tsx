import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, Mic, MicOff, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  confirmPhrase,
  dispatchVoiceEvent,
  parseVoiceCommand,
  VOICE_LANGS,
  type VoiceLang,
} from "@/lib/voiceCommands";

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): SpeechRec | null {
  const Ctor =
    (window as Window & { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec })
      .SpeechRecognition ||
    (window as Window & { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

const LANG_KEY = "dentsaas-voice-lang";

function speak(text: string, lang: VoiceLang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

export function VoiceCommand() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [lang, setLang] = useState<VoiceLang>(() => (localStorage.getItem(LANG_KEY) as VoiceLang) || "en-US");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Click the microphone and speak");
  const [helpOpen, setHelpOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const listeningRef = useRef(false);
  const idleTimer = useRef<number>(0);

  const bumpActivity = () => {
    setCompact(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (!listeningRef.current) setCompact(true);
    }, 60_000);
  };

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  useEffect(() => {
    bumpActivity();
    return () => {
      window.clearTimeout(idleTimer.current);
      recRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (listening || panelOpen) {
      setCompact(false);
      window.clearTimeout(idleTimer.current);
      return;
    }
    bumpActivity();
  }, [listening, panelOpen]);

  const runAction = (spoken: string) => {
    const action = parseVoiceCommand(spoken);
    setStatus(confirmPhrase(action, lang));
    speak(confirmPhrase(action, lang), lang);

    switch (action.kind) {
      case "navigate":
        navigate(action.path);
        break;
      case "search":
        dispatchVoiceEvent({ type: "search", query: action.query });
        break;
      case "search-page":
        navigate(action.path);
        window.setTimeout(() => dispatchVoiceEvent({ type: "search", query: action.query }), 80);
        break;
      case "refresh":
        dispatchVoiceEvent({ type: "refresh" });
        break;
      case "export":
        dispatchVoiceEvent({ type: "export" });
        break;
      case "filter":
        dispatchVoiceEvent({ type: "filter" });
        break;
      case "clear-search":
        dispatchVoiceEvent({ type: "clear-search" });
        break;
      case "back":
        navigate(-1);
        break;
      case "add-patient":
        navigate("/patient?add=1");
        break;
      case "print":
        window.print();
        break;
      case "logout":
        logout();
        navigate("/login");
        break;
      case "help":
        setHelpOpen(true);
        break;
      case "view-add":
        navigate(action.patientId ? `/patient/insurance?id=${encodeURIComponent(action.patientId)}` : "/patient/insurance");
        break;
      default:
        break;
    }
  };

  const stop = () => {
    listeningRef.current = false;
    setListening(false);
    recRef.current?.stop();
  };

  const closePanel = () => {
    stop();
    setPanelOpen(false);
    setTranscript("");
    setStatus("Click the microphone and speak");
  };

  const start = () => {
    setPanelOpen(true);
    const rec = getRecognition();
    if (!rec) {
      setSupported(false);
      setStatus("Voice is not supported in this browser. Use Chrome.");
      return;
    }
    recRef.current?.abort();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const text = last?.[0]?.transcript ?? "";
      setTranscript(text);
      if (last?.isFinal && text.trim()) {
        stop();
        runAction(text);
      }
    };
    rec.onerror = (event) => {
      listeningRef.current = false;
      setListening(false);
      if (event.error === "not-allowed") setStatus("Microphone permission denied");
      else if (event.error === "no-speech") setStatus("No speech heard. Try again.");
      else setStatus("Microphone error. Try again.");
    };
    rec.onend = () => {
      if (listeningRef.current) {
        try {
          rec.start();
        } catch {
          listeningRef.current = false;
          setListening(false);
        }
      }
    };
    recRef.current = rec;
    listeningRef.current = true;
    setTranscript("");
    setStatus(lang === "hi-IN" ? "सुन रहा हूँ…" : lang === "gu-IN" ? "સાંભળું છું…" : "Listening…");
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      setStatus("Could not start microphone");
    }
  };

  return (
    <>
      <div
        className={`voice-dock ${compact ? "compact" : ""}`}
        onMouseEnter={bumpActivity}
        onClick={bumpActivity}
      >
        {panelOpen && (
          <div className="voice-panel">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                {VOICE_LANGS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`voice-lang ${lang === item.id ? "active" : ""}`}
                    onClick={() => setLang(item.id)}
                  >
                    {item.short}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-0.5">
                <button type="button" className="voice-icon-btn" title="Commands" onClick={() => setHelpOpen((v) => !v)}>
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="voice-icon-btn" title="Close" onClick={closePanel} aria-label="Close voice panel">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="voice-status">{listening ? "Listening…" : status}</div>
            {transcript ? <div className="voice-transcript">“{transcript}”</div> : null}
            {!supported ? <div className="text-[10px] text-rose-600">Chrome is required for voice commands.</div> : null}
          </div>
        )}

        {listening ? (
          <button type="button" className="voice-siri" onClick={stop} title="Stop listening" aria-label="Stop listening">
            <span className="voice-siri-ring" />
            <span className="voice-siri-ring delay" />
            <span className="voice-siri-orb">
              <span className="voice-wave">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </span>
          </button>
        ) : (
          <button type="button" className="voice-mic" onClick={start} title="Voice command" aria-label="Start voice command">
            {supported ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
        )}
      </div>

      {helpOpen ? (
        <div className="voice-help-overlay" onClick={() => setHelpOpen(false)}>
          <div className="panel bg-card w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title">Voice commands</div>
              <button type="button" className="btn h-7 px-2" onClick={() => setHelpOpen(false)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-3 pt-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setHelpOpen(false);
                  navigate("/voice-command");
                }}
              >
                Manage Voice Commands
              </button>
            </div>
            <div className="p-3 text-[11px] grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[70vh] overflow-auto">
              <div>
                <div className="font-bold mb-1">English</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Go to dashboard</li>
                  <li>Open patients</li>
                  <li>Open eligibility</li>
                  <li>Search Morell</li>
                  <li>Refresh / Export / Filter</li>
                  <li>Add patient / Go back</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-1">हिंदी</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>डैशबोर्ड खोलो</li>
                  <li>मरीज दिखाओ</li>
                  <li>पात्रता खोलो</li>
                  <li>खोजो मोरेल</li>
                  <li>रीफ्रेश / एक्सपोर्ट</li>
                  <li>नया मरीज / वापस जाओ</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-1">ગુજરાતી</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>ડેશબોર્ડ ખોલો</li>
                  <li>દર્દી બતાવો</li>
                  <li>પાત્રતા ખોલો</li>
                  <li>શોધો મોરેલ</li>
                  <li>રિફ્રેશ / એક્સપોર્ટ</li>
                  <li>નવો દર્દી / પાછા જાઓ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
