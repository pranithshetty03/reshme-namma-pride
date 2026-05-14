export type Lang = "en" | "kn";

const t = {
  en: {
    // Nav
    navHome: "Home",
    navBatches: "Batches",
    navClimate: "Climate",
    navAdvice: "Advice",
    navHistory: "History",
    signOut: "Sign out",

    // Dashboard
    dashboard: "Dashboard",
    welcomeTitle: "Welcome to Reshme-Namma Pride 🐛",
    welcomeSub: "No active batch found. Start by creating your first silkworm batch.",
    noActiveBatches: "You don't have any active batches yet.",
    createFirstBatch: "+ Create First Batch",
    cycleProgress: "Cycle progress",
    toHarvest: "to harvest",
    noReadingToday: "No climate reading yet today.",
    latestAdvice: "Latest Advice",
    viewFullAdvice: "View full advice →",
    logClimate: "Log Climate",
    manageBatches: "Manage Batches",
    day: "Day",
    temperature: "Temperature",
    humidity: "Humidity",
    slot: "Slot",
    aiAdvice: "✨ AI Advice",
    offlineAdvice: "📋 Offline",

    // Climate page
    batch: "Batch",
    advice: "Advice",
    logAnotherReading: "Log Another Reading",
    temperatureLabel: "Temperature (°C)",
    humidityLabel: "Humidity (%)",
    timeSlot: "Time Slot",
    submitReading: "Submit Reading",
    gettingAdvice: "Getting advice…",
    createBatchFirst: "Create a batch first to log climate readings.",
    idealForInstar: "Ideal for Instar",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    offlineRules: "📋 Offline Rules",

    // Batches page
    batchesTitle: "Batches",
    newBatch: "New Batch",
    newSilkwormBatch: "New Silkworm Batch",
    batchName: "Batch Name",
    breedLabel: "Breed",
    startDate: "Start Date",
    notesOptional: "Notes (optional)",
    creating: "Creating…",
    createBatch: "Create Batch",
    cancel: "Cancel",
    activeLabel: "Active",
    noActiveBatchesList: "No active batches",
    archivedLabel: "Archived",
    harvestReady: "🌟 Harvest ready",
    failedToCreate: "Failed to create batch.",
    instar: "Instar",
    dToHarvest: "d to harvest",

    // Advice page
    adviceLog: "Advice Log",
    noAdviceYet: "No advice yet. Log a climate reading to get started.",

    // History page
    climateHistory: "Climate History",
    safe: "Safe",
    caution: "Caution",
    danger: "Danger",
    noClimateReadings: "No climate readings yet.",
  },
  kn: {
    // Nav
    navHome: "ಮನೆ",
    navBatches: "ಬ್ಯಾಚ್‌ಗಳು",
    navClimate: "ಹವಾಮಾನ",
    navAdvice: "ಸಲಹೆ",
    navHistory: "ಇತಿಹಾಸ",
    signOut: "ಸೈನ್ ಔಟ್",

    // Dashboard
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    welcomeTitle: "ರೇಷ್ಮೆ ನಮ್ಮ ಹೆಮ್ಮೆಗೆ ಸ್ವಾಗತ 🐛",
    welcomeSub: "ಯಾವುದೇ ಸಕ್ರಿಯ ಬ್ಯಾಚ್ ಕಂಡುಬಂದಿಲ್ಲ. ನಿಮ್ಮ ಮೊದಲ ರೇಷ್ಮೆ ಬ್ಯಾಚ್ ರಚಿಸಿ.",
    noActiveBatches: "ನಿಮ್ಮಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಸಕ್ರಿಯ ಬ್ಯಾಚ್‌ಗಳಿಲ್ಲ.",
    createFirstBatch: "+ ಮೊದಲ ಬ್ಯಾಚ್ ರಚಿಸಿ",
    cycleProgress: "ಚಕ್ರದ ಪ್ರಗತಿ",
    toHarvest: "ಕೊಯ್ಲಿಗೆ",
    noReadingToday: "ಇಂದು ಇನ್ನೂ ಹವಾಮಾನ ದಾಖಲೆ ಇಲ್ಲ.",
    latestAdvice: "ಇತ್ತೀಚಿನ ಸಲಹೆ",
    viewFullAdvice: "ಸಂಪೂರ್ಣ ಸಲಹೆ ನೋಡಿ →",
    logClimate: "ಹವಾಮಾನ ದಾಖಲಿಸಿ",
    manageBatches: "ಬ್ಯಾಚ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
    day: "ದಿನ",
    temperature: "ತಾಪಮಾನ",
    humidity: "ತೇವಾಂಶ",
    slot: "ಸ್ಲಾಟ್",
    aiAdvice: "✨ AI ಸಲಹೆ",
    offlineAdvice: "📋 ಆಫ್‌ಲೈನ್",

    // Climate page
    batch: "ಬ್ಯಾಚ್",
    advice: "ಸಲಹೆ",
    logAnotherReading: "ಮತ್ತೊಂದು ರೀಡಿಂಗ್ ದಾಖಲಿಸಿ",
    temperatureLabel: "ತಾಪಮಾನ (°C)",
    humidityLabel: "ತೇವಾಂಶ (%)",
    timeSlot: "ಸಮಯ ಸ್ಲಾಟ್",
    submitReading: "ರೀಡಿಂಗ್ ಸಲ್ಲಿಸಿ",
    gettingAdvice: "ಸಲಹೆ ಪಡೆಯುತ್ತಿದೆ…",
    createBatchFirst: "ಹವಾಮಾನ ದಾಖಲಿಸಲು ಮೊದಲು ಒಂದು ಬ್ಯಾಚ್ ರಚಿಸಿ.",
    idealForInstar: "ಇನ್ಸ್ಟಾರ್‌ಗೆ ಸೂಕ್ತ",
    morning: "ಬೆಳಿಗ್ಗೆ",
    afternoon: "ಮಧ್ಯಾಹ್ನ",
    evening: "ಸಂಜೆ",
    offlineRules: "📋 ಆಫ್‌ಲೈನ್ ನಿಯಮಗಳು",

    // Batches page
    batchesTitle: "ಬ್ಯಾಚ್‌ಗಳು",
    newBatch: "ಹೊಸ ಬ್ಯಾಚ್",
    newSilkwormBatch: "ಹೊಸ ರೇಷ್ಮೆ ಬ್ಯಾಚ್",
    batchName: "ಬ್ಯಾಚ್ ಹೆಸರು",
    breedLabel: "ತಳಿ",
    startDate: "ಆರಂಭ ದಿನಾಂಕ",
    notesOptional: "ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)",
    creating: "ರಚಿಸಲಾಗುತ್ತಿದೆ…",
    createBatch: "ಬ್ಯಾಚ್ ರಚಿಸಿ",
    cancel: "ರದ್ದು",
    activeLabel: "ಸಕ್ರಿಯ",
    noActiveBatchesList: "ಸಕ್ರಿಯ ಬ್ಯಾಚ್‌ಗಳಿಲ್ಲ",
    archivedLabel: "ಆರ್ಕೈವ್",
    harvestReady: "🌟 ಕೊಯ್ಲಿಗೆ ತಯಾರು",
    failedToCreate: "ಬ್ಯಾಚ್ ರಚಿಸಲು ವಿಫಲವಾಯಿತು.",
    instar: "ಇನ್ಸ್ಟಾರ್",
    dToHarvest: "ದಿ ಕೊಯ್ಲಿಗೆ",

    // Advice page
    adviceLog: "ಸಲಹೆ ದಾಖಲೆ",
    noAdviceYet: "ಇನ್ನೂ ಸಲಹೆ ಇಲ್ಲ. ಪ್ರಾರಂಭಿಸಲು ಹವಾಮಾನ ದಾಖಲಿಸಿ.",

    // History page
    climateHistory: "ಹವಾಮಾನ ಇತಿಹಾಸ",
    safe: "ಸುರಕ್ಷಿತ",
    caution: "ಎಚ್ಚರಿಕೆ",
    danger: "ಅಪಾಯ",
    noClimateReadings: "ಇನ್ನೂ ಹವಾಮಾನ ದಾಖಲೆಗಳಿಲ್ಲ.",
  },
} as const;

export type TKeys = keyof typeof t.en;
export default t;
