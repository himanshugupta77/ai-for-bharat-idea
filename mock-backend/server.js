/**
 * Mock Backend Server for Bharat Sahayak
 * 
 * This is a simple Express server that mocks the AWS Lambda backend
 * for local development without requiring SAM CLI or Docker.
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for sessions
const sessions = new Map();

// Mock schemes data
const schemes = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    nameTranslations: {
      hi: 'प्रधानमंत्री किसान सम्मान निधि',
      en: 'PM-KISAN'
    },
    description: 'Income support for farmer families',
    descriptionTranslations: {
      hi: 'किसान परिवारों के लिए आय सहायता',
      en: 'Income support for farmer families'
    },
    category: 'agriculture',
    eligibilitySummary: 'Small and marginal farmers with land up to 2 hectares',
    eligibilitySummaryTranslations: {
      hi: '2 हेक्टेयर तक की भूमि वाले छोटे और सीमांत किसान',
      en: 'Small and marginal farmers with land up to 2 hectares'
    },
    applicationSteps: [
      'Visit PM-KISAN portal',
      'Register with Aadhaar',
      'Fill application form',
      'Submit land records'
    ],
    applicationStepsTranslations: {
      hi: [
        'PM-KISAN पोर्टल पर जाएं',
        'आधार से पंजीकरण करें',
        'आवेदन पत्र भरें',
        'भूमि रिकॉर्ड जमा करें'
      ],
      en: [
        'Visit PM-KISAN portal',
        'Register with Aadhaar',
        'Fill application form',
        'Submit land records'
      ]
    },
    benefits: '₹6000 per year in three installments',
    benefitsTranslations: {
      hi: 'तीन किस्तों में प्रति वर्ष ₹6000',
      en: '₹6000 per year in three installments'
    },
    officialLink: 'https://pmkisan.gov.in'
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat',
    nameTranslations: {
      hi: 'आयुष्मान भारत',
      en: 'Ayushman Bharat'
    },
    description: 'Health insurance scheme for poor families',
    descriptionTranslations: {
      hi: 'गरीब परिवारों के लिए स्वास्थ्य बीमा योजना',
      en: 'Health insurance scheme for poor families'
    },
    category: 'health',
    eligibilitySummary: 'Families below poverty line',
    applicationSteps: [
      'Check eligibility online',
      'Visit nearest Ayushman Mitra',
      'Get Ayushman card',
      'Use at empanelled hospitals'
    ],
    benefits: '₹5 lakh health cover per family per year',
    officialLink: 'https://pmjay.gov.in'
  },
  {
    id: 'mgnrega',
    name: 'MGNREGA',
    nameTranslations: {
      hi: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम',
      en: 'MGNREGA'
    },
    description: 'Employment guarantee scheme for rural households',
    descriptionTranslations: {
      hi: 'ग्रामीण परिवारों के लिए रोजगार गारंटी योजना',
      en: 'Employment guarantee scheme for rural households'
    },
    category: 'employment',
    eligibilitySummary: 'Rural households willing to do unskilled manual work',
    applicationSteps: [
      'Apply at local Gram Panchayat',
      'Get job card',
      'Apply for work when needed',
      'Receive wages in bank account'
    ],
    benefits: '100 days of guaranteed wage employment per year',
    officialLink: 'https://nrega.nic.in'
  },
  {
    id: 'pmjdy',
    name: 'Pradhan Mantri Jan Dhan Yojana',
    nameTranslations: {
      hi: 'प्रधानमंत्री जन धन योजना',
      en: 'Pradhan Mantri Jan Dhan Yojana'
    },
    description: 'Financial inclusion scheme providing bank accounts',
    descriptionTranslations: {
      hi: 'बैंक खाते प्रदान करने वाली वित्तीय समावेशन योजना',
      en: 'Financial inclusion scheme providing bank accounts'
    },
    category: 'financial',
    eligibilitySummary: 'All Indian citizens without bank account',
    applicationSteps: [
      'Visit nearest bank branch',
      'Fill account opening form',
      'Submit Aadhaar and address proof',
      'Receive RuPay debit card'
    ],
    benefits: 'Zero balance account, ₹10,000 overdraft facility, accident insurance',
    officialLink: 'https://pmjdy.gov.in'
  },
  {
    id: 'pmuy',
    name: 'Pradhan Mantri Ujjwala Yojana',
    nameTranslations: {
      hi: 'प्रधानमंत्री उज्ज्वला योजना',
      en: 'Pradhan Mantri Ujjwala Yojana'
    },
    description: 'Free LPG connection for BPL families',
    descriptionTranslations: {
      hi: 'बीपीएल परिवारों के लिए मुफ्त एलपीजी कनेक्शन',
      en: 'Free LPG connection for BPL families'
    },
    category: 'welfare',
    eligibilitySummary: 'Women from BPL families',
    applicationSteps: [
      'Check eligibility with BPL card',
      'Visit LPG distributor',
      'Fill application form',
      'Submit documents',
      'Get free LPG connection'
    ],
    benefits: 'Free LPG connection worth ₹1600, first refill support',
    officialLink: 'https://pmuy.gov.in'
  },
  {
    id: 'pmay',
    name: 'Pradhan Mantri Awas Yojana',
    nameTranslations: {
      hi: 'प्रधानमंत्री आवास योजना',
      en: 'Pradhan Mantri Awas Yojana'
    },
    description: 'Housing for all - affordable housing scheme',
    descriptionTranslations: {
      hi: 'सभी के लिए आवास - किफायती आवास योजना',
      en: 'Housing for all - affordable housing scheme'
    },
    category: 'housing',
    eligibilitySummary: 'Families without pucca house, income up to ₹18 lakh',
    applicationSteps: [
      'Visit PMAY portal',
      'Check eligibility',
      'Fill online application',
      'Submit income and property documents',
      'Get subsidy on home loan'
    ],
    benefits: 'Interest subsidy up to ₹2.67 lakh on home loans',
    officialLink: 'https://pmaymis.gov.in'
  },
  {
    id: 'atal-pension',
    name: 'Atal Pension Yojana',
    nameTranslations: {
      hi: 'अटल पेंशन योजना',
      en: 'Atal Pension Yojana'
    },
    description: 'Pension scheme for unorganized sector workers',
    descriptionTranslations: {
      hi: 'असंगठित क्षेत्र के श्रमिकों के लिए पेंशन योजना',
      en: 'Pension scheme for unorganized sector workers'
    },
    category: 'pension',
    eligibilitySummary: 'Citizens aged 18-40 years with bank account',
    applicationSteps: [
      'Visit your bank',
      'Fill APY registration form',
      'Choose pension amount (₹1000-5000)',
      'Link Aadhaar',
      'Start monthly contributions'
    ],
    benefits: 'Guaranteed pension of ₹1000-5000 per month after 60 years',
    officialLink: 'https://npscra.nsdl.co.in/atal-pension-yojana.php'
  },
  {
    id: 'sukanya-samriddhi',
    name: 'Sukanya Samriddhi Yojana',
    nameTranslations: {
      hi: 'सुकन्या समृद्धि योजना',
      en: 'Sukanya Samriddhi Yojana'
    },
    description: 'Savings scheme for girl child education and marriage',
    descriptionTranslations: {
      hi: 'बालिका शिक्षा और विवाह के लिए बचत योजना',
      en: 'Savings scheme for girl child education and marriage'
    },
    category: 'education',
    eligibilitySummary: 'Parents/guardians of girl child below 10 years',
    applicationSteps: [
      'Visit post office or authorized bank',
      'Fill account opening form',
      'Submit girl child birth certificate',
      'Deposit minimum ₹250',
      'Continue deposits till 15 years'
    ],
    benefits: 'High interest rate (8%+), tax benefits, maturity at 21 years',
    officialLink: 'https://www.nsiindia.gov.in'
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    nameTranslations: {
      hi: 'प्रधानमंत्री फसल बीमा योजना',
      en: 'Pradhan Mantri Fasal Bima Yojana'
    },
    description: 'Crop insurance scheme for farmers',
    descriptionTranslations: {
      hi: 'किसानों के लिए फसल बीमा योजना',
      en: 'Crop insurance scheme for farmers'
    },
    category: 'agriculture',
    eligibilitySummary: 'All farmers growing notified crops',
    applicationSteps: [
      'Visit bank or CSC center',
      'Fill crop insurance form',
      'Pay nominal premium (2% for Kharif)',
      'Get insurance coverage',
      'Claim in case of crop loss'
    ],
    benefits: 'Full insurance coverage for crop loss due to natural calamities',
    officialLink: 'https://pmfby.gov.in'
  },
  {
    id: 'pmkvy',
    name: 'Pradhan Mantri Kaushal Vikas Yojana',
    nameTranslations: {
      hi: 'प्रधानमंत्री कौशल विकास योजना',
      en: 'Pradhan Mantri Kaushal Vikas Yojana'
    },
    description: 'Skill development and training program',
    descriptionTranslations: {
      hi: 'कौशल विकास और प्रशिक्षण कार्यक्रम',
      en: 'Skill development and training program'
    },
    category: 'employment',
    eligibilitySummary: 'Youth aged 15-45 years, school/college dropouts',
    applicationSteps: [
      'Visit PMKVY portal',
      'Register online',
      'Choose training course',
      'Attend training at center',
      'Get certified and placement support'
    ],
    benefits: 'Free skill training, ₹8000 average monetary reward, placement assistance',
    officialLink: 'https://www.pmkvyofficial.org'
  }
];

// Helper function to get or create session
function getOrCreateSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = uuidv4();
    sessions.set(sessionId, {
      sessionId,
      messages: [],
      language: 'en',
      createdAt: Date.now()
    });
  }
  return sessions.get(sessionId);
}

// Mock AI responses
function generateMockResponse(message, language) {
  const responses = {
    en: {
      greeting: "Hello! I'm Bharat Sahayak, your AI-powered welfare assistant. I can help you discover government schemes that you may be eligible for. What kind of assistance are you looking for?",
      agriculture: "Here are some agriculture-related schemes that might help you:\n\n1. PM-KISAN: Provides ₹6000 per year to small and marginal farmers\n2. Kisan Credit Card: Easy credit for farmers\n3. Soil Health Card Scheme: Free soil testing\n\nWould you like to know more about any of these schemes?",
      health: "I can help you with health-related schemes:\n\n1. Ayushman Bharat: ₹5 lakh health cover for poor families\n2. Pradhan Mantri Suraksha Bima Yojana: Accident insurance\n3. Janani Suraksha Yojana: Maternity benefits\n\nWhich one would you like to learn more about?",
      employment: "Here are employment schemes that might interest you:\n\n1. MGNREGA: 100 days guaranteed employment for rural households\n2. Pradhan Mantri Kaushal Vikas Yojana: Skill development training\n3. Stand Up India: Loans for SC/ST and women entrepreneurs\n\nShall I provide more details on any of these?",
      default: "I understand you're looking for information about government welfare schemes. I can help you with:\n\n• Agriculture schemes\n• Health insurance\n• Employment programs\n• Education benefits\n• Housing schemes\n\nWhat area are you most interested in?"
    },
    hi: {
      greeting: "नमस्ते! मैं भारत सहायक हूं, आपका AI-संचालित कल्याण सहायक। मैं आपको सरकारी योजनाओं के बारे में जानकारी देने में मदद कर सकता हूं। आप किस प्रकार की सहायता की तलाश में हैं?",
      agriculture: "यहां कुछ कृषि संबंधी योजनाएं हैं जो आपकी मदद कर सकती हैं:\n\n1. पीएम-किसान: छोटे और सीमांत किसानों को प्रति वर्ष ₹6000 प्रदान करता है\n2. किसान क्रेडिट कार्ड: किसानों के लिए आसान ऋण\n3. मृदा स्वास्थ्य कार्ड योजना: मुफ्त मिट्टी परीक्षण\n\nक्या आप इनमें से किसी योजना के बारे में अधिक जानना चाहेंगे?",
      health: "मैं आपको स्वास्थ्य संबंधी योजनाओं में मदद कर सकता हूं:\n\n1. आयुष्मान भारत: गरीब परिवारों के लिए ₹5 लाख का स्वास्थ्य कवर\n2. प्रधानमंत्री सुरक्षा बीमा योजना: दुर्घटना बीमा\n3. जननी सुरक्षा योजना: मातृत्व लाभ\n\nआप किसके बारे में अधिक जानना चाहेंगे?",
      employment: "यहां रोजगार योजनाएं हैं जो आपकी रुचि की हो सकती हैं:\n\n1. मनरेगा: ग्रामीण परिवारों के लिए 100 दिन की गारंटीकृत रोजगार\n2. प्रधानमंत्री कौशल विकास योजना: कौशल विकास प्रशिक्षण\n3. स्टैंड अप इंडिया: SC/ST और महिला उद्यमियों के लिए ऋण\n\nक्या मैं इनमें से किसी पर अधिक विवरण प्रदान करूं?",
      default: "मैं समझता हूं कि आप सरकारी कल्याण योजनाओं के बारे में जानकारी चाह रहे हैं। मैं आपकी मदद कर सकता हूं:\n\n• कृषि योजनाएं\n• स्वास्थ्य बीमा\n• रोजगार कार्यक्रम\n• शिक्षा लाभ\n• आवास योजनाएं\n\nआप किस क्षेत्र में सबसे अधिक रुचि रखते हैं?"
    }
  };

  const lang = language || 'en';
  const langResponses = responses[lang] || responses.en;
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.match(/hello|hi|hey|namaste|नमस्ते/)) {
    return langResponses.greeting;
  } else if (lowerMessage.match(/agriculture|farming|farmer|कृषि|किसान/)) {
    return langResponses.agriculture;
  } else if (lowerMessage.match(/health|medical|hospital|स्वास्थ्य|चिकित्सा/)) {
    return langResponses.health;
  } else if (lowerMessage.match(/employment|job|work|रोजगार|नौकरी/)) {
    return langResponses.employment;
  } else {
    return langResponses.default;
  }
}

function getRelevantSchemes(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.match(/agriculture|farming|farmer|crop|कृषि|किसान|फसल/)) {
    return schemes.filter(s => s.category === 'agriculture');
  } else if (lowerMessage.match(/health|medical|hospital|insurance|स्वास्थ्य|चिकित्सा|बीमा/)) {
    return schemes.filter(s => s.category === 'health');
  } else if (lowerMessage.match(/employment|job|work|skill|training|रोजगार|नौकरी|कौशल/)) {
    return schemes.filter(s => s.category === 'employment');
  } else if (lowerMessage.match(/housing|home|house|आवास|घर/)) {
    return schemes.filter(s => s.category === 'housing');
  } else if (lowerMessage.match(/pension|retirement|पेंशन|सेवानिवृत्ति/)) {
    return schemes.filter(s => s.category === 'pension');
  } else if (lowerMessage.match(/education|school|study|girl|daughter|शिक्षा|बेटी/)) {
    return schemes.filter(s => s.category === 'education');
  } else if (lowerMessage.match(/bank|account|financial|बैंक|खाता/)) {
    return schemes.filter(s => s.category === 'financial');
  } else if (lowerMessage.match(/lpg|gas|cooking|एलपीजी|गैस/)) {
    return schemes.filter(s => s.category === 'welfare');
  }
  
  // Return first 4 schemes as default (increased from 2)
  return schemes.slice(0, 4);
}

// Helper function to translate scheme data based on language
function translateScheme(scheme, language) {
  if (!language || language === 'en') {
    return scheme; // Return as-is for English
  }

  return {
    ...scheme,
    name: scheme.nameTranslations[language] || scheme.name,
    description: scheme.descriptionTranslations[language] || scheme.description,
    eligibilitySummary: scheme.eligibilitySummaryTranslations?.[language] || scheme.eligibilitySummary,
    benefits: scheme.benefitsTranslations?.[language] || scheme.benefits,
    applicationSteps: scheme.applicationStepsTranslations?.[language] || scheme.applicationSteps,
  };
}

// ==================== API ENDPOINTS ====================

// POST /chat - Chat endpoint
app.post('/chat', (req, res) => {
  try {
    const { message, language } = req.body;
    const sessionId = req.headers['x-session-id'];

    console.log('💬 Chat request received');
    console.log('   Message:', message);
    console.log('   Language:', language);
    console.log('   Session ID:', sessionId);

    if (!message || message.trim().length === 0) {
      console.log('❌ Validation error: Empty message');
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Message cannot be empty'
      });
    }

    const session = getOrCreateSession(sessionId);
    session.language = language || session.language;

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });

    // Generate mock response
    const response = generateMockResponse(message, session.language);
    const relevantSchemes = getRelevantSchemes(message);
    
    // Translate schemes based on selected language
    const translatedSchemes = relevantSchemes.map(scheme => translateScheme(scheme, session.language));

    console.log('✅ Generated response');
    console.log('   Response length:', response.length, 'chars');
    console.log('   Schemes found:', relevantSchemes.length);

    // Add assistant message to session
    session.messages.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
      schemes: relevantSchemes.map(s => s.id)
    });

    res.json({
      response,
      language: session.language,
      schemes: translatedSchemes,
      sessionId: session.sessionId
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      error: 'InternalError',
      message: 'An error occurred while processing your request'
    });
  }
});

// GET /schemes - List all schemes
app.get('/schemes', (req, res) => {
  try {
    const { category } = req.query;
    
    let filteredSchemes = schemes;
    if (category) {
      filteredSchemes = schemes.filter(s => s.category === category);
    }

    res.json({
      schemes: filteredSchemes
    });
  } catch (error) {
    console.error('Schemes error:', error);
    res.status(500).json({
      error: 'InternalError',
      message: 'An error occurred while fetching schemes'
    });
  }
});

// GET /schemes/:id - Get specific scheme
app.get('/schemes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const scheme = schemes.find(s => s.id === id);

    if (!scheme) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Scheme not found'
      });
    }

    res.json(scheme);
  } catch (error) {
    console.error('Scheme detail error:', error);
    res.status(500).json({
      error: 'InternalError',
      message: 'An error occurred while fetching scheme details'
    });
  }
});

// POST /eligibility-check - Check eligibility
app.post('/eligibility-check', (req, res) => {
  try {
    const { schemeId, userInfo } = req.body;

    if (!schemeId || !userInfo) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Scheme ID and user info are required'
      });
    }

    const scheme = schemes.find(s => s.id === schemeId);
    if (!scheme) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Scheme not found'
      });
    }

    // Define eligibility criteria based on scheme
    let criteria = [];
    
    if (schemeId === 'pm-kisan') {
      criteria = [
        {
          criterion: 'Age Requirement',
          required: '18-60 years',
          userValue: `${userInfo.age} years`,
          met: userInfo.age >= 18 && userInfo.age <= 60
        },
        {
          criterion: 'Land Ownership',
          required: 'Must own agricultural land up to 2 hectares',
          userValue: userInfo.ownsLand ? `Owns ${userInfo.landSize || 0} hectares` : 'Does not own land',
          met: userInfo.ownsLand && userInfo.landSize <= 2
        },
        {
          criterion: 'Occupation',
          required: 'Must be a farmer',
          userValue: userInfo.occupation,
          met: userInfo.occupation.toLowerCase().includes('farmer') || userInfo.occupation.toLowerCase().includes('agriculture')
        }
      ];
    } else if (schemeId === 'ayushman-bharat') {
      criteria = [
        {
          criterion: 'Income Requirement',
          required: 'Annual income ≤ ₹3,00,000',
          userValue: `₹${userInfo.income}`,
          met: userInfo.income <= 300000
        },
        {
          criterion: 'BPL Status',
          required: 'Must be Below Poverty Line',
          userValue: userInfo.isBPL ? 'Yes' : 'No',
          met: userInfo.isBPL
        }
      ];
    } else {
      // Default criteria for other schemes
      criteria = [
        {
          criterion: 'Age Requirement',
          required: '18-60 years',
          userValue: `${userInfo.age} years`,
          met: userInfo.age >= 18 && userInfo.age <= 60
        },
        {
          criterion: 'Income Requirement',
          required: 'Annual income ≤ ₹3,00,000',
          userValue: `₹${userInfo.income}`,
          met: userInfo.income <= 300000
        }
      ];
    }

    // Check if all criteria are met
    const eligible = criteria.every(c => c.met);

    res.json({
      eligible,
      explanation: {
        criteria,
        summary: eligible 
          ? 'You meet all the eligibility criteria for this scheme!' 
          : 'You do not meet all eligibility criteria.'
      },
      schemeDetails: {
        name: scheme.name,
        benefits: scheme.benefits || 'Benefits information not available',
        applicationProcess: scheme.applicationSteps || [],
        requiredDocuments: ['Aadhaar Card', 'Income Certificate', 'Bank Account Details', 'Address Proof']
      }
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({
      error: 'InternalError',
      message: 'An error occurred while checking eligibility'
    });
  }
});

// POST /voice-to-text - Mock voice to text
app.post('/voice-to-text', (req, res) => {
  try {
    console.log('📢 Voice-to-text request received');
    console.log('   Audio data size:', req.body.audioData ? req.body.audioData.length : 0, 'bytes');
    console.log('   Format:', req.body.format);
    
    const transcript = 'Hello, I want to know about agriculture schemes';
    
    console.log('✅ Returning mock transcript:', transcript);
    
    res.json({
      transcript,
      detectedLanguage: 'en',
      confidence: 0.95
    });
  } catch (error) {
    console.error('❌ Voice to text error:', error);
    res.status(500).json({
      error: 'InternalError',
      message: 'An error occurred during transcription'
    });
  }
});

// POST /text-to-speech - Mock text to speech
app.post('/text-to-speech', (req, res) => {
  try {
    res.json({
      audioData: 'base64-encoded-audio-data',
      format: 'mp3',
      duration: 3.5,
      sizeBytes: 56000
    });
  } catch (error) {
    console.error('Text to speech error:', error);
    res.status(500).json({
      error: 'InternalError',
      message: 'An error occurred during speech synthesis'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Bharat Sahayak Mock Backend Server');
  console.log('='.repeat(50));
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Chat endpoint: POST http://localhost:${PORT}/chat`);
  console.log(`✅ Schemes endpoint: GET http://localhost:${PORT}/schemes`);
  console.log('='.repeat(50));
  console.log('📝 This is a MOCK backend for local development');
  console.log('   It simulates AWS Lambda functions without requiring SAM CLI');
  console.log('='.repeat(50));
});
