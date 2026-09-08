const groq = require('../config/groq');

const checkSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim().length < 3) {
      return res.status(400).json({
        message: 'Please describe your symptoms'
      });
    }

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: `You are a helpful medical assistant at MediCare Hospital in Sri Lanka. 
          Based on the patient's symptoms, suggest which type of specialist doctor they should see.
          Always respond in this exact JSON format:
          {
            "possibleConditions": ["condition1", "condition2"],
            "recommendedSpecialist": "Doctor Specialization",
            "urgencyLevel": "Low/Medium/High",
            "advice": "Brief advice for the patient",
            "warning": "Any important warning if needed"
          }
          Keep responses concise and helpful. Always recommend seeing a doctor.
          Never diagnose definitively. Available specializations at our hospital:
          Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, 
          Psychiatrist, Dentist, General Physician, Gynecologist, 
          Ophthalmologist, ENT Specialist, Urologist`
        },
        {
          role: 'user',
          content: `My symptoms are: ${symptoms}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const responseText = completion.choices[0]?.message?.content || '';

    let result;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch[0]);
    } catch (e) {
      result = {
        possibleConditions: ['Unable to determine'],
        recommendedSpecialist: 'General Physician',
        urgencyLevel: 'Medium',
        advice: responseText,
        warning: 'Please consult a doctor for proper diagnosis'
      };
    }

    res.json(result);
  } catch (error) {
    console.log('AI error:', error.message);
    res.status(500).json({ message: 'AI service unavailable' });
  }
};

// AI Chatbot
const chatbot = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Build conversation history
    const messages = [
      {
        role: 'system',
        content: `You are a helpful hospital assistant for MediCare Hospital in Sri Lanka.
        You help patients with:
        - Information about our services and departments
        - How to book appointments
        - General health questions
        - Hospital location and contact info
        - Doctor specializations available
        
        Hospital Info:
        - Address: No. 45, Palaali Road, Jaffna, Sri Lanka        - Phone: +94 11 234 5678
        - Email: info@medicare.lk
        - Open: 24/7 for emergencies
        - Reg No: MOH/2024/0123
        
        Available Specializations: Cardiologist, Dermatologist, Neurologist, 
        Orthopedic, Pediatrician, Psychiatrist, Dentist, General Physician,
        Gynecologist, Ophthalmologist, ENT Specialist, Urologist
        
        Keep responses short, friendly and helpful.
        Always encourage users to book an appointment or contact the hospital for serious issues.
        Do not provide specific medical diagnoses.`
      },
      ...(history || []),
      {
        role: 'user',
        content: message
      }
    ];

    const completion = await groq.chat.completions.create({
     model: 'openai/gpt-oss-120b',
      messages,
      temperature: 0.7,
      max_tokens: 300
    });

    const reply = completion.choices[0]?.message?.content || 
      'I apologize, I could not process your request. Please contact us at +94 11 234 5678.';

    res.json({ reply });
  } catch (error) {
    console.log('Chatbot error:', error.message);
    res.status(500).json({
      message: 'Chatbot service unavailable'
    });
  }
};

module.exports = { checkSymptoms, chatbot };