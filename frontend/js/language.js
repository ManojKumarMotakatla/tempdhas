// ============================================================
// DHAS — language.js  (FULL APP COVERAGE)
// English / Hindi / Telugu — every page
// 1) data-i18n / data-i18n-placeholder / data-i18n-title
// 2) Exact-match fallback: any visible text that equals an
//    English dictionary value is replaced (covers pages without
//    data-i18n attributes).
// ============================================================

var TRANSLATIONS = {
  English: {
    // —— Nav / common ——
    dashboard: "Dashboard",
    symptoms: "Symptoms",
    reports: "Reports",
    diet: "Diet",
    remedies: "Remedies",
    reminders: "Reminders",
    steps: "Activity Tracker",
    activityTracker: "Activity Tracker",
    profile: "Profile",
    language: "Language",
    logout: "Logout",
    chat: "Chat",
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    changePassword: "Change Password",
    findDoctor: "Find Doctor",
    myDoctors: "My Doctors",
    myPatients: "My Patients",
    overview: "OVERVIEW",
    settings: "Settings",
    account: "Account",
    notifications: "Notifications",
    clearAll: "Clear all",
    noNotifications: "No notifications yet",
    cancel: "Cancel",
    loading: "Loading…",
    all: "All",
    connected: "Connected",
    pending: "Pending",
    total: "Total",
    dark: "Dark",
    light: "Light",
    back: "Back",
    save: "Save",
    delete: "Delete",
    confirm: "Confirm",
    close: "Close",
    search: "Search",
    viewAll: "View all →",
    manage: "Manage →",
    viewProfile: "View profile →",
    backToList: "Back to List",
    backToProfile: "Back to Profile",
    backToHome: "← Back to Home",
    // —— Dashboard ——
    healthSnapshot: "Health Snapshot",
    quickActions: "Quick Actions",
    activeReminders: "Today's Active Reminders",
    connectDoctor: "Connect with a Doctor",
    myDoctorsLink: "My doctors →",
    enterInviteCode: "Enter an Invite Code",
    inviteCodeSub: "Get the code from your doctor and connect instantly",
    connect: "Connect",
    patients: "Patients",
    totalSymptoms: "Total Symptoms",
    totalReports: "Total Reports",
    connectedPatients: "Connected Patients",
    symptomsLogged: "Symptoms logged",
    remindersActive: "Reminders active",
    reportsSaved: "Reports saved",
    welcomeBack: "WELCOME BACK",
    yourPatientInviteCode: "YOUR PATIENT INVITE CODE",
    healthDataMissing: "Health data missing. Complete your profile to see your snapshot.",
    completeProfile: "Complete →",
    weight: "Weight",
    height: "Height",
    notSet: "Not set",
    bloodGroup: "Blood Group",
    // —— Symptoms ——
    checkSymptoms: "Check My Condition",
    selectSymptoms: "Select Your Symptoms",
    symptomsSubtitle: "Choose all symptoms you are currently experiencing",
    symptomChecker: "Symptom Checker",
    symptomHistory: "Symptom History",
    fever: "Fever",
    cold: "Cold / Runny Nose",
    headache: "Headache",
    cough: "Cough",
    fatigue: "Fatigue / Tiredness",
    bodyPain: "Body Pain / Ache",
    soreThroat: "Sore Throat",
    nausea: "Nausea / Vomiting",
    diarrhea: "Diarrhea / Loose Motion",
    lossOfTaste: "Loss of Taste / Smell",
    chestPain: "Chest Pain",
    breathlessness: "Breathlessness",
    noSymptoms: "No symptoms found. Please go back and select your symptoms.",
    selectAtLeastOne: "Please select at least one symptom.",
    // —— Results ——
    yourResults: "Your Results",
    likelyCond: "Likely Condition",
    severityLevel: "Severity Level",
    recommendation: "Recommendation",
    dietGuide: "Diet Guide",
    homeRemedies: "Home Remedies",
    low: "Low",
    medium: "Medium",
    high: "High",
    // —— Steps / activity ——
    stepTracker: "Step Tracker",
    stepGoal: "Goal",
    stepsLabel: "Steps",
    distanceLabel: "Distance",
    caloriesLabel: "Calories",
    todaySteps: "Today's Stats",
    weeklyRecord: "This Week's Record",
    activeDays: "Active Days",
    totalSteps: "Total Steps",
    totalDistance: "Total Distance",
    totalCalories: "Total Calories",
    goodMorning: "morning",
    goodAfternoon: "afternoon",
    goodEvening: "evening",
    // —— Reminders ——
    saveReminder: "Save Reminder",
    medicineName: "Medicine Name",
    medicineReminders: "Never miss a dose — set smart medication alerts",
    medicineRemindersTitle: "Medicine Reminders",
    // —— Reports ——
    uploadReport: "Upload Report",
    uploadReports: "Upload & manage your health documents securely",
    medicalReports: "Medical Reports",
    uploadedReports: "Uploaded Reports",
    noReportsYet: "No reports uploaded yet.",
    uploadFirstReport: "Upload your first medical report above.",
    chooseFile: "Choose File",
    noFileChosen: "No file chosen",
    selectFile: "SELECT FILE (PDF / IMAGE, MAX 4 MB)",
    // —— Auth ——
    loginTitle: "Sign In",
    registerTitle: "Create Account",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    nameLabel: "Full Name",
    forgotPassword: "Forgot Password",
    sendResetLink: "Send reset link",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    updatePassword: "Update Password",
    keepSecure: "Keep your account secure with a strong password",
    atLeast6: "At least 6 characters",
    oneUpper: "One uppercase letter (A–Z)",
    oneLower: "One lowercase letter (a–z)",
    oneNumber: "One number (0–9)",
    sendOtp: "Send OTP",
    verify: "Verify",
    emailVerified: "✓ Email verified",
    emailVerifyHint: "We will email a 6-digit code. Verify it before creating your account.",
    emailVerification: "Email verification",
    signInMethod: "Sign-in Method",
    memberSince: "Member Since",
    deleteAccount: "Delete Account",
    cannotUndo: "This action cannot be undone.",
    // —— Profile ——
    profileSaved: "Profile saved successfully.",
    personalInfo: "Personal Information",
    phoneNumber: "Phone Number",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    healthInfo: "Health Information",
    heightWeight: "Height & Weight",
    profilePhoto: "Profile Photo",
    uploadPhoto: "Upload Photo",
    photoHint: "JPG or PNG, max 2 MB. Visible to patients.",
    professionalInfo: "PROFESSIONAL INFO",
    speciality: "Speciality",
    specialityUpper: "SPECIALITY",
    experienceYears: "EXPERIENCE (YEARS)",
    hospitalClinic: "Hospital / Clinic",
    city: "CITY",
    state: "STATE",
    languagesSpoken: "LANGUAGES (COMMA-SEPARATED)",
    languagesHint: "English · Hindi · Telugu",
    // —— Find doctor ——
    findADoctor: "Find a Doctor",
    findYourDoctor: "Find Your Doctor",
    browseDoctors: "Browse verified doctors and connect with their invite code",
    doctors: "Doctors",
    specialities: "Specialities",
    searchDoctor: "Search by name or speciality...",
    copyCode: "Copy Code",
    profileBtn: "Profile",
    inviteCode: "Invite Code",
    generalPhysician: "General Physician",
    cardiologist: "Cardiologist",
    dermatologist: "Dermatologist",
    neurologist: "Neurologist",
    psychiatrist: "Psychiatrist",
    entSpecialist: "ENT Specialist",
    ophthalmologist: "Ophthalmologist",
    // —— Misc pages ——
    pageNotFound: "Page not found",
    digitalHealth: "Digital Health Assistant System",
    dhasDoctor: "DHAS Doctor",
    checkingAccount: "Checking your account…",
    passwordChangeNA: "Password Change Not Available"
  },

  Hindi: {
    dashboard: "डैशबोर्ड",
    symptoms: "लक्षण",
    reports: "रिपोर्ट",
    diet: "आहार",
    remedies: "उपचार",
    reminders: "अनुस्मारक",
    steps: "गतिविधि ट्रैकर",
    activityTracker: "गतिविधि ट्रैकर",
    profile: "प्रोफ़ाइल",
    language: "भाषा",
    logout: "लॉग आउट",
    chat: "चैट",
    myProfile: "मेरी प्रोफ़ाइल",
    editProfile: "प्रोफ़ाइल संपादित करें",
    changePassword: "पासवर्ड बदलें",
    findDoctor: "डॉक्टर खोजें",
    myDoctors: "मेरे डॉक्टर",
    myPatients: "मेरे मरीज़",
    overview: "अवलोकन",
    settings: "सेटिंग्स",
    account: "खाता",
    notifications: "सूचनाएँ",
    clearAll: "सभी हटाएँ",
    noNotifications: "अभी कोई सूचना नहीं",
    cancel: "रद्द करें",
    loading: "लोड हो रहा है…",
    all: "सभी",
    connected: "जुड़े",
    pending: "लंबित",
    total: "कुल",
    dark: "डार्क",
    light: "लाइट",
    back: "वापस",
    save: "सहेजें",
    delete: "हटाएँ",
    confirm: "पुष्टि करें",
    close: "बंद करें",
    search: "खोजें",
    viewAll: "सभी देखें →",
    manage: "प्रबंधित करें →",
    viewProfile: "प्रोफ़ाइल देखें →",
    backToList: "सूची पर वापस",
    backToProfile: "प्रोफ़ाइल पर वापस",
    backToHome: "← होम पर वापस",
    healthSnapshot: "स्वास्थ्य स्नैपशॉट",
    quickActions: "त्वरित क्रियाएं",
    activeReminders: "आज के सक्रिय अनुस्मारक",
    connectDoctor: "डॉक्टर से जुड़ें",
    myDoctorsLink: "मेरे डॉक्टर →",
    enterInviteCode: "आमंत्रण कोड दर्ज करें",
    inviteCodeSub: "अपने डॉक्टर से कोड लें और तुरंत जुड़ें",
    connect: "जुड़ें",
    patients: "मरीज़",
    totalSymptoms: "कुल लक्षण",
    totalReports: "कुल रिपोर्ट",
    connectedPatients: "जुड़े मरीज़",
    symptomsLogged: "लक्षण दर्ज",
    remindersActive: "सक्रिय अनुस्मारक",
    reportsSaved: "रिपोर्ट सहेजी",
    welcomeBack: "वापसी पर स्वागत है",
    yourPatientInviteCode: "आपका मरीज़ आमंत्रण कोड",
    healthDataMissing: "स्वास्थ्य डेटा गायब है। अपना स्नैपशॉट देखने के लिए प्रोफ़ाइल पूरा करें।",
    completeProfile: "पूरा करें →",
    weight: "वज़न",
    height: "ऊँचाई",
    notSet: "सेट नहीं",
    bloodGroup: "रक्त समूह",
    checkSymptoms: "मेरी स्थिति जांचें",
    selectSymptoms: "अपने लक्षण चुनें",
    symptomsSubtitle: "वर्तमान में अनुभव किए जा रहे सभी लक्षण चुनें",
    symptomChecker: "लक्षण जाँचकर्ता",
    symptomHistory: "लक्षण इतिहास",
    fever: "बुखार",
    cold: "सर्दी / नाक बहना",
    headache: "सिरदर्द",
    cough: "खांसी",
    fatigue: "थकान / कमज़ोरी",
    bodyPain: "शरीर दर्द",
    soreThroat: "गले में खराश",
    nausea: "मतली / उल्टी",
    diarrhea: "दस्त / पतला मल",
    lossOfTaste: "स्वाद / गंध की कमी",
    chestPain: "सीने में दर्द",
    breathlessness: "सांस लेने में कठिनाई",
    noSymptoms: "कोई लक्षण नहीं मिला। कृपया वापस जाएं और लक्षण चुनें।",
    selectAtLeastOne: "कृपया कम से कम एक लक्षण चुनें।",
    yourResults: "आपके परिणाम",
    likelyCond: "संभावित स्थिति",
    severityLevel: "गंभीरता स्तर",
    recommendation: "सिफारिश",
    dietGuide: "आहार मार्गदर्शिका",
    homeRemedies: "घरेलू उपचार",
    low: "कम",
    medium: "मध्यम",
    high: "अधिक",
    stepTracker: "कदम ट्रैकर",
    stepGoal: "लक्ष्य",
    stepsLabel: "कदम",
    distanceLabel: "दूरी",
    caloriesLabel: "कैलोरी",
    todaySteps: "आज के आंकड़े",
    weeklyRecord: "इस सप्ताह का रिकॉर्ड",
    activeDays: "सक्रिय दिन",
    totalSteps: "कुल कदम",
    totalDistance: "कुल दूरी",
    totalCalories: "कुल कैलोरी",
    goodMorning: "सुबह",
    goodAfternoon: "दोपहर",
    goodEvening: "शाम",
    saveReminder: "अनुस्मारक सहेजें",
    medicineName: "दवा का नाम",
    medicineReminders: "दवा लेना न भूलें — स्मार्ट अलर्ट सेट करें",
    medicineRemindersTitle: "दवा अनुस्मारक",
    uploadReport: "रिपोर्ट अपलोड करें",
    uploadReports: "अपने स्वास्थ्य दस्तावेज़ सुरक्षित रूप से अपलोड करें",
    medicalReports: "मेडिकल रिपोर्ट",
    uploadedReports: "अपलोड की गई रिपोर्ट",
    noReportsYet: "अभी कोई रिपोर्ट अपलोड नहीं हुई।",
    uploadFirstReport: "ऊपर अपनी पहली मेडिकल रिपोर्ट अपलोड करें।",
    chooseFile: "फ़ाइल चुनें",
    noFileChosen: "कोई फ़ाइल नहीं चुनी गई",
    selectFile: "फ़ाइल चुनें (PDF / छवि, अधिकतम 4 MB)",
    loginTitle: "लॉग इन करें",
    registerTitle: "खाता बनाएं",
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    nameLabel: "पूरा नाम",
    forgotPassword: "पासवर्ड भूल गए",
    sendResetLink: "रीसेट लिंक भेजें",
    currentPassword: "वर्तमान पासवर्ड",
    newPassword: "नया पासवर्ड",
    confirmNewPassword: "नया पासवर्ड पुष्टि करें",
    updatePassword: "पासवर्ड अपडेट करें",
    keepSecure: "मज़बूत पासवर्ड से अपना खाता सुरक्षित रखें",
    atLeast6: "कम से कम 6 अक्षर",
    oneUpper: "एक बड़ा अक्षर (A–Z)",
    oneLower: "एक छोटा अक्षर (a–z)",
    oneNumber: "एक संख्या (0–9)",
    sendOtp: "OTP भेजें",
    verify: "सत्यापित करें",
    emailVerified: "✓ ईमेल सत्यापित",
    emailVerifyHint: "हम 6 अंकों का कोड ईमेल करेंगे। खाता बनाने से पहले इसे सत्यापित करें।",
    emailVerification: "ईमेल सत्यापन",
    signInMethod: "साइन-इन विधि",
    memberSince: "सदस्यता से",
    deleteAccount: "खाता हटाएँ",
    cannotUndo: "यह क्रिया पूर्ववत नहीं की जा सकती।",
    profileSaved: "प्रोफ़ाइल सफलतापूर्वक सहेजी गई।",
    personalInfo: "व्यक्तिगत जानकारी",
    phoneNumber: "फ़ोन नंबर",
    dateOfBirth: "जन्म तिथि",
    gender: "लिंग",
    healthInfo: "स्वास्थ्य जानकारी",
    heightWeight: "ऊँचाई और वज़न",
    profilePhoto: "प्रोफ़ाइल फ़ोटो",
    uploadPhoto: "फ़ोटो अपलोड करें",
    photoHint: "JPG या PNG, अधिकतम 2 MB। मरीज़ों को दिखेगा।",
    professionalInfo: "व्यावसायिक जानकारी",
    speciality: "विशेषज्ञता",
    specialityUpper: "विशेषज्ञता",
    experienceYears: "अनुभव (वर्ष)",
    hospitalClinic: "अस्पताल / क्लिनिक",
    city: "शहर",
    state: "राज्य",
    languagesSpoken: "भाषाएँ (अल्पविराम से अलग)",
    languagesHint: "अंग्रेज़ी · हिंदी · तेलुगु",
    findADoctor: "डॉक्टर खोजें",
    findYourDoctor: "अपना डॉक्टर खोजें",
    browseDoctors: "सत्यापित डॉक्टरों को देखें और उनके आमंत्रण कोड से जुड़ें",
    doctors: "डॉक्टर",
    specialities: "विशेषज्ञताएँ",
    searchDoctor: "नाम या विशेषज्ञता से खोजें...",
    copyCode: "कोड कॉपी करें",
    profileBtn: "प्रोफ़ाइल",
    inviteCode: "आमंत्रण कोड",
    generalPhysician: "जनरल फिजिशियन",
    cardiologist: "कार्डियोलॉजिस्ट",
    dermatologist: "डर्मेटोलॉजिस्ट",
    neurologist: "न्यूरोलॉजिस्ट",
    psychiatrist: "साइकियाट्रिस्ट",
    entSpecialist: "ईएनटी विशेषज्ञ",
    ophthalmologist: "नेत्र विशेषज्ञ",
    pageNotFound: "पेज नहीं मिला",
    digitalHealth: "डिजिटल हेल्थ असिस्टेंट सिस्टम",
    dhasDoctor: "DHAS डॉक्टर",
    checkingAccount: "आपका खाता जाँचा जा रहा है…",
    passwordChangeNA: "पासवर्ड बदलना उपलब्ध नहीं"
  },

  Telugu: {
    dashboard: "డాష్‌బోర్డ్",
    symptoms: "లక్షణాలు",
    reports: "నివేదికలు",
    diet: "ఆహారం",
    remedies: "చికిత్సలు",
    reminders: "రిమైండర్లు",
    steps: "యాక్టివిటీ ట్రాకర్",
    activityTracker: "యాక్టివిటీ ట్రాకర్",
    profile: "ప్రొఫైల్",
    language: "భాష",
    logout: "లాగ్ అవుట్",
    chat: "చాట్",
    myProfile: "నా ప్రొఫైల్",
    editProfile: "ప్రొఫైల్ సవరించండి",
    changePassword: "పాస్‌వర్డ్ మార్చండి",
    findDoctor: "డాక్టర్ కనుగొనండి",
    myDoctors: "నా డాక్టర్లు",
    myPatients: "నా రోగులు",
    overview: "అవలోకనం",
    settings: "సెట్టింగ్‌లు",
    account: "ఖాతా",
    notifications: "నోటిఫికేషన్లు",
    clearAll: "అన్నీ క్లియర్ చేయండి",
    noNotifications: "ఇంకా నోటిఫికేషన్లు లేవు",
    cancel: "రద్దు",
    loading: "లోడ్ అవుతోంది…",
    all: "అన్నీ",
    connected: "కనెక్ట్ అయినవి",
    pending: "పెండింగ్",
    total: "మొత్తం",
    dark: "డార్క్",
    light: "లైట్",
    back: "వెనుకకు",
    save: "సేవ్",
    delete: "తొలగించు",
    confirm: "నిర్ధారించు",
    close: "మూసివేయి",
    search: "శోధించు",
    viewAll: "అన్నీ చూడండి →",
    manage: "నిర్వహించండి →",
    viewProfile: "ప్రొఫైల్ చూడండి →",
    backToList: "జాబితాకు తిరిగి",
    backToProfile: "ప్రొఫైల్‌కు తిరిగి",
    backToHome: "← హోమ్‌కు తిరిగి",
    healthSnapshot: "ఆరోగ్య స్నాప్‌షాట్",
    quickActions: "త్వరిత చర్యలు",
    activeReminders: "నేటి క్రియాశీల రిమైండర్లు",
    connectDoctor: "డాక్టర్‌తో కనెక్ట్ అవ్వండి",
    myDoctorsLink: "నా డాక్టర్లు →",
    enterInviteCode: "ఆహ్వాన కోడ్ నమోదు చేయండి",
    inviteCodeSub: "మీ డాక్టర్ నుండి కోడ్ తీసుకుని వెంటనే కనెక్ట్ అవ్వండి",
    connect: "కనెక్ట్",
    patients: "రోగులు",
    totalSymptoms: "మొత్తం లక్షణాలు",
    totalReports: "మొత్తం నివేదికలు",
    connectedPatients: "కనెక్ట్ అయిన రోగులు",
    symptomsLogged: "లక్షణాలు నమోదు",
    remindersActive: "క్రియాశీల రిమైండర్లు",
    reportsSaved: "నివేదికలు సేవ్",
    welcomeBack: "తిరిగి స్వాగతం",
    yourPatientInviteCode: "మీ రోగి ఆహ్వాన కోడ్",
    healthDataMissing: "ఆరోగ్య డేటా లేదు. మీ స్నాప్‌షాట్ చూడటానికి ప్రొఫైల్ పూర్తి చేయండి.",
    completeProfile: "పూర్తి చేయండి →",
    weight: "బరువు",
    height: "ఎత్తు",
    notSet: "సెట్ కాలేదు",
    bloodGroup: "రక్త వర్గం",
    checkSymptoms: "నా స్థితి తనిఖీ చేయండి",
    selectSymptoms: "మీ లక్షణాలు ఎంచుకోండి",
    symptomsSubtitle: "మీరు ప్రస్తుతం అనుభవిస్తున్న అన్ని లక్షణాలను ఎంచుకోండి",
    symptomChecker: "లక్షణ తనిఖీ",
    symptomHistory: "లక్షణ చరిత్ర",
    fever: "జ్వరం",
    cold: "జలుబు / ముక్కు కారడం",
    headache: "తలనొప్పి",
    cough: "దగ్గు",
    fatigue: "అలసట / బలహీనత",
    bodyPain: "శరీర నొప్పి",
    soreThroat: "గొంతు నొప్పి",
    nausea: "వికారం / వాంతులు",
    diarrhea: "విరేచనాలు",
    lossOfTaste: "రుచి / వాసన కోల్పోవడం",
    chestPain: "ఛాతీ నొప్పి",
    breathlessness: "ఊపిరి తీసుకోవడంలో కష్టం",
    noSymptoms: "లక్షణాలు కనుగొనబడలేదు. దయచేసి వెనక్కి వెళ్ళి లక్షణాలు ఎంచుకోండి.",
    selectAtLeastOne: "దయచేసి కనీసం ఒక లక్షణం ఎంచుకోండి.",
    yourResults: "మీ ఫలితాలు",
    likelyCond: "సంభావ్య పరిస్థితి",
    severityLevel: "తీవ్రత స్థాయి",
    recommendation: "సిఫార్సు",
    dietGuide: "ఆహార మార్గదర్శి",
    homeRemedies: "ఇంటి చికిత్సలు",
    low: "తక్కువ",
    medium: "మధ్యస్థ",
    high: "ఎక్కువ",
    stepTracker: "అడుగుల ట్రాకర్",
    stepGoal: "లక్ష్యం",
    stepsLabel: "అడుగులు",
    distanceLabel: "దూరం",
    caloriesLabel: "కేలరీలు",
    todaySteps: "నేటి గణాంకాలు",
    weeklyRecord: "ఈ వారపు రికార్డు",
    activeDays: "క్రియాశీల రోజులు",
    totalSteps: "మొత్తం అడుగులు",
    totalDistance: "మొత్తం దూరం",
    totalCalories: "మొత్తం కేలరీలు",
    goodMorning: "ఉదయం",
    goodAfternoon: "మధ్యాహ్నం",
    goodEvening: "సాయంత్రం",
    saveReminder: "రిమైండర్ సేవ్ చేయండి",
    medicineName: "మందు పేరు",
    medicineReminders: "మందు వేయడం మర్చిపోవద్దు — స్మార్ట్ హెచ్చరికలు సెట్ చేయండి",
    medicineRemindersTitle: "మందు రిమైండర్లు",
    uploadReport: "నివేదిక అప్‌లోడ్ చేయండి",
    uploadReports: "మీ ఆరోగ్య పత్రాలు సురక్షితంగా అప్‌లోడ్ చేయండి",
    medicalReports: "వైద్య నివేదికలు",
    uploadedReports: "అప్‌లోడ్ చేసిన నివేదికలు",
    noReportsYet: "ఇంకా నివేదికలు అప్‌లోడ్ కాలేదు.",
    uploadFirstReport: "పైన మీ మొదటి వైద్య నివేదికను అప్‌లోడ్ చేయండి.",
    chooseFile: "ఫైల్ ఎంచుకోండి",
    noFileChosen: "ఫైల్ ఎంచుకోలేదు",
    selectFile: "ఫైల్ ఎంచుకోండి (PDF / చిత్రం, గరిష్టం 4 MB)",
    loginTitle: "లాగిన్ చేయండి",
    registerTitle: "ఖాతా సృష్టించండి",
    emailLabel: "ఇమెయిల్ చిరునామా",
    passwordLabel: "పాస్‌వర్డ్",
    nameLabel: "పూర్తి పేరు",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయాను",
    sendResetLink: "రీసెట్ లింక్ పంపండి",
    currentPassword: "ప్రస్తుత పాస్‌వర్డ్",
    newPassword: "కొత్త పాస్‌వర్డ్",
    confirmNewPassword: "కొత్త పాస్‌వర్డ్ నిర్ధారించండి",
    updatePassword: "పాస్‌వర్డ్ అప్‌డేట్ చేయండి",
    keepSecure: "బలమైన పాస్‌వర్డ్‌తో మీ ఖాతాను సురక్షితంగా ఉంచండి",
    atLeast6: "కనీసం 6 అక్షరాలు",
    oneUpper: "ఒక పెద్ద అక్షరం (A–Z)",
    oneLower: "ఒక చిన్న అక్షరం (a–z)",
    oneNumber: "ఒక సంఖ్య (0–9)",
    sendOtp: "OTP పంపండి",
    verify: "ధృవీకరించండి",
    emailVerified: "✓ ఇమెయిల్ ధృవీకరించబడింది",
    emailVerifyHint: "మేము 6 అంకెల కోడ్ ఇమెయిల్ చేస్తాము. ఖాతా సృష్టించే ముందు ధృవీకరించండి.",
    emailVerification: "ఇమెయిల్ ధృవీకరణ",
    signInMethod: "సైన్-ఇన్ పద్ధతి",
    memberSince: "సభ్యత్వం నుండి",
    deleteAccount: "ఖాతా తొలగించండి",
    cannotUndo: "ఈ చర్యను రద్దు చేయలేము.",
    profileSaved: "ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది.",
    personalInfo: "వ్యక్తిగత సమాచారం",
    phoneNumber: "ఫోన్ నంబర్",
    dateOfBirth: "పుట్టిన తేదీ",
    gender: "లింగం",
    healthInfo: "ఆరోగ్య సమాచారం",
    heightWeight: "ఎత్తు & బరువు",
    profilePhoto: "ప్రొఫైల్ ఫోటో",
    uploadPhoto: "ఫోటో అప్‌లోడ్ చేయండి",
    photoHint: "JPG లేదా PNG, గరిష్టం 2 MB. రోగులకు కనిపిస్తుంది.",
    professionalInfo: "వృత్తిపరమైన సమాచారం",
    speciality: "ప్రత్యేకత",
    specialityUpper: "ప్రత్యేకత",
    experienceYears: "అనుభవం (సంవత్సరాలు)",
    hospitalClinic: "ఆసుపత్రి / క్లినిక్",
    city: "నగరం",
    state: "రాష్ట్రం",
    languagesSpoken: "భాషలు (కామాతో వేరు)",
    languagesHint: "ఇంగ్లీష్ · హిందీ · తెలుగు",
    findADoctor: "డాక్టర్ కనుగొనండి",
    findYourDoctor: "మీ డాక్టర్‌ను కనుగొనండి",
    browseDoctors: "ధృవీకరించబడిన డాక్టర్లను బ్రౌజ్ చేసి వారి ఆహ్వాన కోడ్‌తో కనెక్ట్ అవ్వండి",
    doctors: "డాక్టర్లు",
    specialities: "ప్రత్యేకతలు",
    searchDoctor: "పేరు లేదా ప్రత్యేకతతో శోధించండి...",
    copyCode: "కోడ్ కాపీ చేయండి",
    profileBtn: "ప్రొఫైల్",
    inviteCode: "ఆహ్వాన కోడ్",
    generalPhysician: "జనరల్ ఫిజిషియన్",
    cardiologist: "కార్డియాలజిస్ట్",
    dermatologist: "డెర్మటాలజిస్ట్",
    neurologist: "న్యూరాలజిస్ట్",
    psychiatrist: "సైకియాట్రిస్ట్",
    entSpecialist: "ENT నిపుణుడు",
    ophthalmologist: "కంటి వైద్యుడు",
    pageNotFound: "పేజీ కనుగొనబడలేదు",
    digitalHealth: "డిజిటల్ హెల్త్ అసిస్టెంట్ సిస్టమ్",
    dhasDoctor: "DHAS డాక్టర్",
    checkingAccount: "మీ ఖాతాను తనిఖీ చేస్తున్నాము…",
    passwordChangeNA: "పాస్‌వర్డ్ మార్పు అందుబాటులో లేదు"
  }
};

// Build reverse map: English text → key (longest first to avoid partial issues)
var _enToKey = null;
function _buildEnMap() {
  if (_enToKey) return _enToKey;
  _enToKey = {};
  var en = TRANSLATIONS.English;
  Object.keys(en).forEach(function (k) {
    _enToKey[en[k]] = k;
  });
  return _enToKey;
}

function _shouldSkipNode(el) {
  if (!el || !el.tagName) return true;
  var tag = el.tagName.toUpperCase();
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "CODE" || tag === "PRE") return true;
  if (el.isContentEditable) return true;
  if (el.closest && el.closest("script, style, noscript, code, pre, [contenteditable=true]")) return true;
  return false;
}

function applyTranslations(lang) {
  if (!lang) lang = localStorage.getItem("dhas_language") || "English";
  if (!TRANSLATIONS[lang]) lang = "English";
  var dict = TRANSLATIONS[lang];
  var en = TRANSLATIONS.English;
  var enMap = _buildEnMap();

  // 1) Explicit data-i18n
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
    var key = el.getAttribute("data-i18n-html");
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    var key = el.getAttribute("data-i18n-placeholder");
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });

  document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
    var key = el.getAttribute("data-i18n-title");
    if (dict[key] !== undefined) {
      if (el.tagName === "TITLE") el.textContent = dict[key] + " — DHAS";
      else el.setAttribute("title", dict[key]);
    }
  });

  var pageTitle = document.querySelector("title");
  if (pageTitle) {
    var base = pageTitle.getAttribute("data-i18n-title");
    if (base && dict[base]) pageTitle.textContent = dict[base] + " — DHAS";
  }

  // 2) Exact-match fallback — leaf elements AND text nodes (icon + label buttons)
  function resolveKey(raw) {
    if (!raw) return null;
    var key = enMap[raw];
    if (key) return key;
    Object.keys(TRANSLATIONS).forEach(function (L) {
      if (key) return;
      var d = TRANSLATIONS[L];
      Object.keys(d).forEach(function (k) {
        if (d[k] === raw) key = k;
      });
    });
    return key || null;
  }

  var selectors = "a, button, label, span, div, h1, h2, h3, h4, h5, h6, p, li, td, th, option, legend, small, strong, b, em";
  document.querySelectorAll(selectors).forEach(function (el) {
    if (_shouldSkipNode(el)) return;
    if (el.hasAttribute("data-i18n") || el.hasAttribute("data-i18n-html")) return;

    // Pure text leaf
    if (!el.children || el.children.length === 0) {
      var raw = (el.textContent || "").trim();
      if (!raw || raw.length > 120) return;
      var key = resolveKey(raw);
      if (key && dict[key] !== undefined) el.textContent = dict[key];
      return;
    }

    // Mixed children (e.g. <button><i></i> Upload Report</button>): translate text nodes only
    var nodes = [];
    for (var i = 0; i < el.childNodes.length; i++) nodes.push(el.childNodes[i]);
    nodes.forEach(function (n) {
      if (n.nodeType !== 3) return; // text node
      var t = (n.nodeValue || "").trim();
      if (!t || t.length > 120) return;
      var key = resolveKey(t);
      if (key && dict[key] !== undefined) {
        // preserve surrounding whitespace
        n.nodeValue = (n.nodeValue || "").replace(t, dict[key]);
      }
    });
  });

  // 3) Placeholders without data-i18n-placeholder
  document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(function (el) {
    if (el.hasAttribute("data-i18n-placeholder")) return;
    var ph = el.getAttribute("placeholder");
    if (!ph) return;
    var key = enMap[ph];
    if (!key) {
      Object.keys(TRANSLATIONS).forEach(function (L) {
        if (key) return;
        var d = TRANSLATIONS[L];
        Object.keys(d).forEach(function (k) {
          if (d[k] === ph) key = k;
        });
      });
    }
    if (key && dict[key] !== undefined) el.placeholder = dict[key];
  });

  // 4) Theme labels
  document.querySelectorAll(".theme-label").forEach(function (el) {
    var isDark = document.documentElement.classList.contains("dark") ||
                 (document.body && document.body.classList.contains("dark"));
    el.textContent = isDark ? (dict.light || "Light") : (dict.dark || "Dark");
  });

  var langCodes = { English: "en", Hindi: "hi", Telugu: "te" };
  document.documentElement.lang = langCodes[lang] || "en";

  try {
    window.dispatchEvent(new CustomEvent("dhas:language", { detail: { lang: lang } }));
  } catch (e) {}
}

function t(key) {
  var lang = localStorage.getItem("dhas_language") || "English";
  var dict = TRANSLATIONS[lang] || TRANSLATIONS.English;
  return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.English[key] || key);
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = "English";
  localStorage.setItem("dhas_language", lang);
  applyTranslations(lang);
  highlightActive(lang);
}

function highlightActive(lang) {
  ["English", "Hindi", "Telugu"].forEach(function (l) {
    var btn = document.getElementById("btn-" + l);
    if (btn) btn.classList.toggle("active", l === lang);
    var card = document.getElementById("card-" + l);
    if (card) card.classList.toggle("active", l === lang);
  });
}

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
  // Late content / dynamic sections
  setTimeout(run, 50);
  setTimeout(run, 300);
  setTimeout(run, 800);
  setTimeout(run, 1500);
  // Re-apply when DOM changes (lists, AJAX cards)
  if (typeof MutationObserver !== "undefined") {
    var timer = null;
    var obs = new MutationObserver(function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 120);
    });
    if (document.body) {
      obs.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        obs.observe(document.body, { childList: true, subtree: true });
      });
    }
  }
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
