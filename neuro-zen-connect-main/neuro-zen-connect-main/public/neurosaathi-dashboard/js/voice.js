/* voice.js — voice assistant (Web Speech API) with text fallback.
   Later: swap recognition for a server-side speech API supporting NER languages. */
(function (global) {
  "use strict";
  const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
  let recog = null, listening = false;

  const speak = (text) => {
    if (!("speechSynthesis" in global)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  };
  const voiceEnabled = () => (NS.storage.getData(NS.storage.KEYS.settings, {}) || {}).voice !== false;
  const speakIfEnabled = (t) => { if (voiceEnabled()) speak(t); };

  /** Interpret a spoken/typed command and act on it. */
  const handleCommand = (raw) => {
    const t = String(raw || "").toLowerCase();
    const S = NS.storage;
    const say = (msg) => { setTranscript(msg); speakIfEnabled(msg); NS.showToast(msg, "info", "Voice assistant"); };

    if (/game|play|khel/.test(t)) { say("Opening cognitive games."); setTimeout(() => (location.href = "games.html"), 800); return; }
    if (/reminder|medicine|medic/.test(t)) {
      const next = (S.getData(S.KEYS.reminders, []) || []).filter((r) => r.status === "pending").sort((a, b) => a.time.localeCompare(b.time))[0];
      say(next ? `Your next reminder is ${next.title} at ${next.time}.` : "You have no pending reminders right now.");
      return;
    }
    if (/routine|schedule|day/.test(t)) {
      const list = (S.getData(S.KEYS.routine, []) || []).slice(0, 4).map((r) => `${r.label} at ${r.time}`).join(", ");
      say("Today: " + list + ".");
      return;
    }
    if (/appointment|doctor/.test(t)) {
      const a = (S.getData(S.KEYS.appointments, []) || []).filter((x) => x.date >= S.today()).sort((x, y) => x.date.localeCompare(y.date))[0];
      say(a ? `Next appointment: ${a.doctor} on ${a.date} at ${a.time}.` : "No upcoming appointments.");
      return;
    }
    if (/water|hydrat/.test(t)) {
      const h = S.getData(S.KEYS.hydration, { goal: 6, current: 0 });
      say(`You have had ${h.current} of ${h.goal} glasses of water today.`);
      return;
    }
    if (/emergency|help me|call/.test(t)) { say("Opening emergency contacts."); NS.openEmergency(); return; }
    if (/progress|score/.test(t)) { say("Opening your progress."); setTimeout(() => (location.href = "progress.html"), 800); return; }
    if (/help|what can you/.test(t)) { say("You can say: next reminder, open games, read my routine, my appointments, water, or emergency."); return; }
    say("Sorry, I did not understand that. Say help to hear the options.");
  };

  const setStatus = (txt) => { const el = document.getElementById("voice-status"); if (el) el.textContent = txt; };
  const setTranscript = (txt) => { const el = document.getElementById("voice-transcript"); if (el) el.textContent = txt; };

  const startListening = () => {
    if (!SR) {
      NS.openModal("Voice command", `
        <p class="muted">Speech recognition is not available in this browser. Type a command instead.</p>
        <div class="field"><label for="vc">Command</label><input id="vc" placeholder="next reminder"></div>
        <button class="btn btn-lg btn-block" id="vc-go">Run command</button>`, (body) => {
        body.querySelector("#vc-go").addEventListener("click", () => {
          const v = body.querySelector("#vc").value;
          NS.closeModal();
          handleCommand(v);
        });
      });
      return;
    }
    if (listening) return;
    recog = new SR();
    recog.lang = "en-IN";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onstart = () => { listening = true; setStatus("Listening…"); setTranscript("Speak now."); };
    recog.onerror = () => { listening = false; setStatus("Idle"); setTranscript("Microphone not available. You can use the buttons instead."); };
    recog.onend = () => { listening = false; setStatus("Idle"); };
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript("You said: " + text);
      handleCommand(text);
    };
    try { recog.start(); } catch (e) { setStatus("Idle"); }
  };
  const stopListening = () => { if (recog) { try { recog.stop(); } catch (e) {} } listening = false; setStatus("Idle"); };

  const init = () => {
    const s = document.getElementById("voice-start");
    const st = document.getElementById("voice-stop");
    if (s) s.addEventListener("click", startListening);
    if (st) st.addEventListener("click", stopListening);
    setStatus(SR ? "Idle" : "Type mode");
  };

  global.NS = global.NS || {};
  global.NS.voice = { init, speak, speakIfEnabled, handleCommand, startListening, stopListening };
})(window);
