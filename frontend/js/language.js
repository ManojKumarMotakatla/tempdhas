// ============================================================
// DHAS — language.js
// Full translation support: English, Hindi, Telugu
// Reads dhas_language from localStorage and applies on every page.
// Uses data-i18n attributes: <span data-i18n="fever">Fever</span>
// ============================================================

var TRANSLATIONS = {
  English: {
    dashboard:"Dashboard", symptoms:"Symptoms", reports:"Reports",
    diet:"Diet", remedies:"Remedies", reminders:"Reminders",
    steps:"Activity Tracker", profile:"Profile", language:"Language", logout:"Logout",
    checkSymptoms:"Check My Condition", selectSymptoms:"Select Your Symptoms",
    symptomsSubtitle:"Choose all symptoms you are currently experiencing",
    fever:"Fever", cold:"Cold / Runny Nose", headache:"Headache",
    cough:"Cough", fatigue:"Fatigue / Tiredness", bodyPain:"Body Pain / Ache",
    soreThroat:"Sore Throat", nausea:"Nausea / Vomiting",
    diarrhea:"Diarrhea / Loose Motion", lossOfTaste:"Loss of Taste / Smell",
    chestPain:"Chest Pain", breathlessness:"Breathlessness",
    goodMorning:"morning", goodAfternoon:"afternoon", goodEvening:"evening",
    stepGoal:"Goal", stepsLabel:"Steps", distanceLabel:"Distance", caloriesLabel:"Calories",
    saveReminder:"Save Reminder", medicineName:"Medicine Name",
    uploadReport:"Upload Report",
    noSymptoms:"No symptoms found. Please go back and select your symptoms.",
    selectAtLeastOne:"Please select at least one symptom.",
    profileSaved:"Profile saved successfully.",
    loginTitle:"Sign In", registerTitle:"Create Account",
    emailLabel:"Email Address", passwordLabel:"Password", nameLabel:"Full Name",
    todaySteps:"Today's Stats", weeklyRecord:"This Week's Record",
    healthSnapshot:"Health Snapshot", quickActions:"Quick Actions",
    activeReminders:"Today's Active Reminders", yourResults:"Your Results",
    likelyCond:"Likely Condition", severityLevel:"Severity Level",
    recommendation:"Recommendation", dietGuide:"Diet Guide",
    homeRemedies:"Home Remedies",
    uploadReports:"Upload & manage your health documents securely",
    medicineReminders:"Never miss a dose — set smart medication alerts",
    myPatients:"My Patients", chat:"Chat", myProfile:"My Profile",
    editProfile:"Edit Profile", changePassword:"Change Password",
    findDoctor:"Find Doctor", myDoctors:"My Doctors",
    activityTracker:"Activity Tracker"
  },
  Hindi: {
    dashboard:"डैशबोर्ड", symptoms:"लक्षण", reports:"रिपोर्ट",
    diet:"आहार", remedies:"उपचार", reminders:"अनुस्मारक",
    steps:"गतिविधि ट्रैकर", profile:"प्रोफ़ाइल", language:"भाषा", logout:"लॉग आउट",
    checkSymptoms:"मेरी स्थिति जांचें", selectSymptoms:"अपने लक्षण चुनें",
    symptomsSubtitle:"वर्तमान में अनुभव किए जा रहे सभी लक्षण चुनें",
    fever:"बुखार", cold:"सर्दी / नाक बहना", headache:"सिरदर्द",
    cough:"खांसी", fatigue:"थकान / कमज़ोरी", bodyPain:"शरीर दर्द",
    soreThroat:"गले में खराश", nausea:"मतली / उल्टी",
    diarrhea:"दस्त / पतला मल", lossOfTaste:"स्वाद / गंध की कमी",
    chestPain:"सीने में दर्द", breathlessness:"सांस लेने में कठिनाई",
    goodMorning:"सुबह", goodAfternoon:"दोपहर", goodEvening:"शाम",
    stepGoal:"लक्ष्य", stepsLabel:"कदम", distanceLabel:"दूरी", caloriesLabel:"कैलोरी",
    saveReminder:"अनुस्मारक सहेजें", medicineName:"दवा का नाम",
    uploadReport:"रिपोर्ट अपलोड करें",
    noSymptoms:"कोई लक्षण नहीं मिला। कृपया वापस जाएं और लक्षण चुनें।",
    selectAtLeastOne:"कृपया कम से कम एक लक्षण चुनें।",
    profileSaved:"प्रोफ़ाइल सफलतापूर्वक सहेजी गई।",
    loginTitle:"लॉग इन करें", registerTitle:"खाता बनाएं",
    emailLabel:"ईमेल पता", passwordLabel:"पासवर्ड", nameLabel:"पूरा नाम",
    todaySteps:"आज के आंकड़े", weeklyRecord:"इस सप्ताह का रिकॉर्ड",
    healthSnapshot:"स्वास्थ्य स्नैपशॉट", quickActions:"त्वरित क्रियाएं",
    activeReminders:"आज के सक्रिय अनुस्मारक", yourResults:"आपके परिणाम",
    likelyCond:"संभावित स्थिति", severityLevel:"गंभीरता स्तर",
    recommendation:"सिफारिश", dietGuide:"आहार मार्गदर्शिका",
    homeRemedies:"घरेलू उपचार",
    uploadReports:"अपने स्वास्थ्य दस्तावेज़ सुरक्षित रूप से अपलोड करें",
    medicineReminders:"दवा लेना न भूलें — स्मार्ट अलर्ट सेट करें",
    myPatients:"मेरे मरीज़", chat:"चैट", myProfile:"मेरी प्रोफ़ाइल",
    editProfile:"प्रोफ़ाइल संपादित करें", changePassword:"पासवर्ड बदलें",
    findDoctor:"डॉक्टर खोजें", myDoctors:"मेरे डॉक्टर",
    activityTracker:"गतिविधि ट्रैकर"
  },
  Telugu: {
    dashboard:"డాష్‌బోర్డ్", symptoms:"లక్షణాలు", reports:"నివేదికలు",
    diet:"ఆహారం", remedies:"చికిత్సలు", reminders:"రిమైండర్లు",
    steps:"యాక్టివిటీ ట్రాకర్", profile:"ప్రొఫైల్", language:"భాష", logout:"లాగ్ అవుట్",
    checkSymptoms:"నా స్థితి తనిఖీ చేయండి", selectSymptoms:"మీ లక్షణాలు ఎంచుకోండి",
    symptomsSubtitle:"మీరు ప్రస్తుతం అనుభవిస్తున్న అన్ని లక్షణాలను ఎంచుకోండి",
    fever:"జ్వరం", cold:"జలుబు / ముక్కు కారడం", headache:"తలనొప్పి",
    cough:"దగ్గు", fatigue:"అలసట / నీరసం", bodyPain:"శరీర నొప్పి",
    soreThroat:"గొంతు నొప్పి", nausea:"వికారం / వాంతి",
    diarrhea:"విరేచనాలు", lossOfTaste:"రుచి / వాసన తెలియకపోవడం",
    chestPain:"ఛాతీ నొప్పి", breathlessness:"శ్వాస తీసుకోవడంలో కష్టం",
    goodMorning:"ఉదయం", goodAfternoon:"మధ్యాహ్నం", goodEvening:"సాయంత్రం",
    stepGoal:"లక్ష్యం", stepsLabel:"అడుగులు", distanceLabel:"దూరం", caloriesLabel:"కేలరీలు",
    saveReminder:"రిమైండర్ సేవ్ చేయండి", medicineName:"మందు పేరు",
    uploadReport:"నివేదిక అప్‌లోడ్ చేయండి",
    noSymptoms:"లక్షణాలు కనుగొనబడలేదు. దయచేసి వెనక్కి వెళ్ళి లక్షణాలు ఎంచుకోండి.",
    selectAtLeastOne:"దయచేసి కనీసం ఒక లక్షణం ఎంచుకోండి.",
    profileSaved:"ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది.",
    loginTitle:"లాగిన్ చేయండి", registerTitle:"ఖాతా సృష్టించండి",
    emailLabel:"ఇమెయిల్ చిరునామా", passwordLabel:"పాస్‌వర్డ్", nameLabel:"పూర్తి పేరు",
    todaySteps:"నేటి గణాంకాలు", weeklyRecord:"ఈ వారపు రికార్డు",
    healthSnapshot:"ఆరోగ్య స్నాప్‌షాట్", quickActions:"త్వరిత చర్యలు",
    activeReminders:"నేటి క్రియాశీల రిమైండర్లు", yourResults:"మీ ఫలితాలు",
    likelyCond:"సంభావ్య పరిస్థితి", severityLevel:"తీవ్రత స్థాయి",
    recommendation:"సిఫార్సు", dietGuide:"ఆహార మార్గదర్శి",
    homeRemedies:"ఇంటి చికిత్సలు",
    uploadReports:"మీ ఆరోగ్య పత్రాలు సురక్షితంగా అప్‌లోడ్ చేయండి",
    medicineReminders:"మందు వేయడం మర్చిపోవద్దు — స్మార్ట్ హెచ్చరికలు సెట్ చేయండి",
    myPatients:"నా రోగులు", chat:"చాట్", myProfile:"నా ప్రొఫైల్",
    editProfile:"ప్రొఫైల్ సవరించండి", changePassword:"పాస్‌వర్డ్ మార్చండి",
    findDoctor:"డాక్టర్ కనుగొనండి", myDoctors:"నా డాక్టర్లు",
    activityTracker:"యాక్టివిటీ ట్రాకర్"
  }
};

function applyTranslations(lang) {
  if (!lang) lang = localStorage.getItem("dhas_language") || "English";
  var t = TRANSLATIONS[lang] || TRANSLATIONS["English"];

  document.querySelectorAll("[data-i18n]").forEach(function(el) {
    var key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) el.textContent = t[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el) {
    var key = el.getAttribute("data-i18n-placeholder");
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  document.querySelectorAll("[data-i18n-title]").forEach(function(el) {
    var key = el.getAttribute("data-i18n-title");
    if (t[key] !== undefined) {
      if (el.tagName === "TITLE") el.textContent = t[key] + " — DHAS";
      else el.setAttribute("title", t[key]);
    }
  });

  var pageTitle = document.querySelector("title");
  if (pageTitle) {
    var base = pageTitle.getAttribute("data-i18n-title");
    if (base && t[base]) pageTitle.textContent = t[base] + " — DHAS";
  }

  var langCodes = { English: "en", Hindi: "hi", Telugu: "te" };
  document.documentElement.lang = langCodes[lang] || "en";

  try {
    window.dispatchEvent(new CustomEvent("dhas:language", { detail: { lang: lang } }));
  } catch (e) {}
}

function t(key) {
  var lang = localStorage.getItem("dhas_language") || "English";
  var dict = TRANSLATIONS[lang] || TRANSLATIONS["English"];
  return dict[key] !== undefined ? dict[key] : (TRANSLATIONS["English"][key] || key);
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = "English";
  localStorage.setItem("dhas_language", lang);
  applyTranslations(lang);
  highlightActive(lang);
}

function highlightActive(lang) {
  ["English","Hindi","Telugu"].forEach(function(l) {
    var btn = document.getElementById("btn-" + l);
    if (btn) btn.classList.toggle("active", l === lang);
    var card = document.getElementById("card-" + l);
    if (card) card.classList.toggle("active", l === lang);
  });
}

// Auto-apply on every page that includes this script
(function autoApply() {
  function run() {
    var lang = localStorage.getItem("dhas_language") || "English";
    applyTranslations(lang);
    highlightActive(lang);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  setTimeout(run, 50);
  setTimeout(run, 300);
})();

window.DHAS_LANG = {
  t: t,
  applyTranslations: applyTranslations,
  setLanguage: setLanguage,
  TRANSLATIONS: TRANSLATIONS
};
window.applyTranslations = applyTranslations;
window.setLanguage = setLanguage;
window.t = t;