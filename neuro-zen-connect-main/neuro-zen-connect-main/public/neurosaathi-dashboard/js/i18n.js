/* i18n.js — lightweight translation layer. Add keys as needed. */
(function (global) {
  "use strict";
  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी (Hindi)" },
    { code: "as", label: "অসমীয়া (Assamese)" },
    { code: "bn", label: "বাংলা (Bengali)" },
    { code: "mni", label: "Manipuri (Meiteilon)" },
    { code: "kha", label: "Khasi (Meghalaya)" },
    { code: "lus", label: "Mizo" },
    { code: "nag", label: "Nagamese" },
    { code: "trp", label: "Kokborok (Tripuri)" },
    { code: "njz", label: "Nyishi (Arunachali)" },
  ];

  const translations = {
    en: { dashboard: "Dashboard", games: "Games", reminders: "Reminders", appointments: "Appointments", progress: "Progress", settings: "Settings", startGame: "Start Game", complete: "Complete", snooze: "Snooze", next: "Next", back: "Back", logout: "Log out", help: "Help" },
    hi: { dashboard: "डैशबोर्ड", games: "खेल", reminders: "अनुस्मारक", appointments: "अपॉइंटमेंट", progress: "प्रगति", settings: "सेटिंग्स", startGame: "खेल शुरू करें", complete: "पूर्ण", snooze: "बाद में", next: "आगे", back: "पीछे", logout: "लॉग आउट", help: "सहायता" },
    as: { dashboard: "ডেশব’ৰ্ড", games: "খেল", reminders: "মনত পেলোৱা", appointments: "সাক্ষাৎ", progress: "অগ্ৰগতি", settings: "ছেটিংছ", startGame: "খেল আৰম্ভ কৰক", complete: "সম্পূৰ্ণ", snooze: "পিছত", next: "পৰৱৰ্তী", back: "উভতি যাওক", logout: "লগ আউট", help: "সহায়" },
    bn: { dashboard: "ড্যাশবোর্ড", games: "খেলা", reminders: "রিমাইন্ডার", appointments: "অ্যাপয়েন্টমেন্ট", progress: "অগ্রগতি", settings: "সেটিংস", startGame: "খেলা শুরু", complete: "সম্পন্ন", snooze: "পরে", next: "পরবর্তী", back: "পিছনে", logout: "লগ আউট", help: "সাহায্য" },
    mni: { dashboard: "ড্যাশবোর্ড", games: "সান্নবা", reminders: "নিংশিংবা", appointments: "উনবা", progress: "মাংলোমবা", settings: "সেটিংস", startGame: "সান্নবা হৌবা", complete: "লোইরে", snooze: "কোনবা", next: "মথং", back: "হন্দোকপা", logout: "লগ আউট", help: "মতেং" },
    kha: { dashboard: "Ka Dashboard", games: "Ki Kai", reminders: "Ki Jingkynmaw", appointments: "Ki Jingiakynduh", progress: "Jingmihpat", settings: "Ki Setting", startGame: "Sdang Kai", complete: "La dep", snooze: "Sngewbha ap", next: "Uwei pat", back: "Phin wan", logout: "Mih noh", help: "Jingiarap" },
    lus: { dashboard: "Dashboard", games: "Infiamna", reminders: "Hriattirna", appointments: "Inhmuhna", progress: "Hmasawnna", settings: "Siamrem", startGame: "Infiam tan", complete: "Zawh", snooze: "Nghak rehh", next: "A dang", back: "Kir leh", logout: "Chhuak", help: "Tanpuina" },
    nag: { dashboard: "Dashboard", games: "Khel", reminders: "Yaad dilai", appointments: "Milne ke time", progress: "Age barise", settings: "Setting", startGame: "Khel suru koro", complete: "Hoi gise", snooze: "Pisot koro", next: "Agla", back: "Pisot", logout: "Bahar jabo", help: "Modot" },
    trp: { dashboard: "Dashboard", games: "Chukhurung", reminders: "Sikhung", appointments: "Nukhung", progress: "Thangnai", settings: "Setting", startGame: "Chukhurung hamjak", complete: "Thangkha", snooze: "Nasa", next: "Uni", back: "Phaidi", logout: "Log out", help: "Bhorsa" },
    njz: { dashboard: "Dashboard", games: "Games", reminders: "Reminders", appointments: "Appointments", progress: "Progress", settings: "Settings", startGame: "Start Game", complete: "Complete", snooze: "Snooze", next: "Next", back: "Back", logout: "Log out", help: "Help" },
  };

  const getLang = () => (NS.storage.getData(NS.storage.KEYS.settings, {}) || {}).language || "en";
  const t = (key) => (translations[getLang()] && translations[getLang()][key]) || translations.en[key] || key;
  const setLang = (code) => {
    NS.storage.updateData(NS.storage.KEYS.settings, { language: code });
    applyTranslations();
  };
  const applyTranslations = () => {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
  };

  global.NS = global.NS || {};
  global.NS.i18n = { LANGUAGES, translations, t, setLang, getLang, applyTranslations };
})(window);
