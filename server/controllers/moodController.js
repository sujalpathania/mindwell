const MoodLog = require('../models/MoodLog');
const User = require('../models/User');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─────────────────────────────────────────────
// Existing Controllers
// ─────────────────────────────────────────────

const getMoodLogs = async (req, res) => {
    try {
        const logs = await MoodLog.find({ user: req.user._id }).sort({ createdAt: 1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createMoodLog = async (req, res) => {
    const { mood, energy, note } = req.body;

    if (!mood) {
        return res.status(400).json({ message: 'Mood level is required' });
    }

    try {
        const log = await MoodLog.create({
            user: req.user._id,
            mood,
            energy,
            note
        });

        const user = await User.findById(req.user._id);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastCI = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
        if (lastCI) lastCI.setHours(0, 0, 0, 0);

        const diffDays = lastCI
            ? Math.round((today - lastCI) / (1000 * 60 * 60 * 24))
            : null;

        let newStreak = user.streak;

        if (diffDays === 0) {
            // Already checked in today — no change
        } else if (diffDays === 1) {
            newStreak = user.streak + 1;
        } else {
            newStreak = 1;
        }

        const newIsPremium = user.isPremium || newStreak >= 1;

        await User.updateOne(
            { _id: req.user._id },
            { streak: newStreak, isPremium: newIsPremium, lastCheckIn: new Date() }
        );

        res.status(201).json({
            log,
            streak: newStreak,
            isPremium: newIsPremium
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getStreak = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('streak isPremium lastCheckIn');
        res.json({
            streak: user.streak,
            isPremium: user.isPremium,
            lastCheckIn: user.lastCheckIn
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ─────────────────────────────────────────────
// AI Face Mood Detection Controller
// ─────────────────────────────────────────────

/**
 * Emotion → friendly label map
 */
const EMOTION_LABELS = {
    happy:    'Happy 😄',
    sad:      'Sad 😢',
    angry:    'Angry 😠',
    fear:     'Anxious 😰',
    surprise: 'Surprised 😲',
    disgust:  'Uncomfortable 😒',
    neutral:  'Calm / Neutral 😐',
};

/**
 * POST /api/mood/detect-face
 * Premium-only: forwards a base64 image to the Python Flask AI service,
 * gets back the dominant emotion, then calls Gemini for wellness suggestions.
 */
const detectFaceMood = async (req, res) => {
    const { image, energy, energyLabel } = req.body;

    if (!image) {
        return res.status(400).json({ message: 'No image provided.' });
    }

    // ── 1. Check premium status ───────────────────────────────────────────
    try {
        const user = await User.findById(req.user._id).select('isPremium');
        if (!user.isPremium) {
            return res.status(403).json({
                message: 'Mood Detection is a premium feature. Complete a 2-day streak to unlock it.'
            });
        }
    } catch (err) {
        console.error('User lookup error:', err.message);
        return res.status(500).json({ message: 'Server error checking premium status.' });
    }

    // ── 2. Call Python Flask AI service ──────────────────────────────────
    let emotion   = 'neutral';
    let scores    = {};
    let face_rect = null;
    let img_dims  = null;

    try {
        const flaskUrl = process.env.FLASK_SERVICE_URL || 'http://localhost:8000';
        const { data } = await axios.post(`${flaskUrl}/analyze-emotion`, { image }, {
            timeout: 60000   // 60 s — DeepFace can be slow on first call or on low-end hardware
        });

        emotion   = data.emotion   || 'neutral';
        scores    = data.scores    || {};
        face_rect = data.face_rect || null;
        img_dims  = data.img_dims  || null;
    } catch (err) {
        // Surface Flask's own error message if available
        const flaskMsg = err.response?.data?.error;
        if (flaskMsg) {
            // e.g. "No face detected"
            return res.status(422).json({ message: flaskMsg });
        }
        console.error('Flask service error:', err.message);
        return res.status(503).json({
            message: 'AI service is unavailable. Make sure the Python Flask server is running on port 8000.'
        });
    }

    // ── 3. Generate wellness suggestions via Gemini ───────────────────────
    let suggestions = [];

    // Derive energy from emotion if not provided by the frontend
    const EMOTION_ENERGY_MAP = {
        happy:    { e: 8, l: 'High' },
        sad:      { e: 3, l: 'Low' },
        angry:    { e: 9, l: 'High' },
        fear:     { e: 7, l: 'High' },
        surprise: { e: 8, l: 'High' },
        disgust:  { e: 4, l: 'Low' },
        neutral:  { e: 5, l: 'Moderate' },
    };
    const derived = EMOTION_ENERGY_MAP[emotion] || { e: 5, l: 'Moderate' };
    const finalEnergy = energy || derived.e;
    const finalLabel = energyLabel || derived.l;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
The user's face has been analyzed using AI.

Detected Mood: "${emotion}"
Detected Energy Level: "${finalLabel}" (${finalEnergy}/10)

You are a smart and caring AI wellness assistant inside a mood detection dashboard.

Your task is to provide personalized wellness suggestions according to BOTH:
1. the user's mood
2. the user's energy level

Guidelines:

- If the mood is sad and energy is low:
  Give comforting, calming, and supportive suggestions.

- If the mood is angry:
  Suggest breathing exercises, relaxation, calming activities, and taking breaks.

- If the mood is fearful or stressed:
  Suggest mindfulness, meditation, hydration, rest, and emotional support.

- If the mood is happy and energy is high:
  Encourage productivity, positivity, workouts, learning, or social activities.

- If the mood is neutral:
  Suggest focus, mindfulness, healthy habits, and self-improvement.

Rules:
- Give exactly 3 personalized suggestions.
- Keep responses short and human-like.
- Use simple and friendly English.
- Sound emotionally supportive and caring.
- Do not sound robotic.
- Do not give medical advice.
- Each suggestion should be one sentence only.

Return ONLY a JSON array.

Example:
[
  "Take a short walk outside to refresh your mind.",
  "Drink water and listen to calming music.",
  "Try deep breathing for a few minutes to relax."
]
        `.trim();

        const result = await model.generateContent(prompt);
        const text   = result.response.text().trim();

        // Parse the JSON array from Gemini's response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            suggestions = JSON.parse(jsonMatch[0]);
        } else {
            // Fallback if JSON format fails
            suggestions = [text];
        }
    } catch (err) {
        console.error('Gemini error:', err.message);
        // Fall back to built-in suggestions — don't fail the whole request
        suggestions = getDefaultSuggestions(emotion);
    }

    // Ensure we always send exactly 3 suggestions
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
        suggestions = getDefaultSuggestions(emotion);
    }

    return res.json({
        emotion,
        emotionLabel: EMOTION_LABELS[emotion] || emotion,
        scores,
        suggestions,
        face_rect,
        img_dims
    });
};

/**
 * Fallback suggestions when Gemini is unavailable or key is missing.
 */
function getDefaultSuggestions(emotion) {
    const defaults = {
        happy:    [
            'Channel your positive energy into helping someone else today — happiness is contagious!',
            'Take a moment to journal what made you feel this way so you can revisit it later.',
            'Consider sharing your good mood with a friend or loved one through a kind message.'
        ],
        sad:      [
            'Be gentle with yourself — it\'s okay to feel sad. Take a few slow, deep breaths.',
            'Try a short walk outside; even 10 minutes of gentle movement can lift your mood.',
            'Reach out to a trusted friend or write down your feelings in a journal.'
        ],
        angry:    [
            'Take 5 deep breaths before responding to anything — pause and reset.',
            'Step away from the situation briefly and try the 4-7-8 breathing technique.',
            'Write down what triggered you — identifying the cause helps you process it faster.'
        ],
        fear:     [
            'Ground yourself with the 5-4-3-2-1 technique: name 5 things you can see, 4 you can touch...',
            'Remind yourself that anxiety often magnifies risk — challenge one anxious thought.',
            'Try a 5-minute guided breathing session to calm your nervous system.'
        ],
        surprise: [
            'Give yourself a moment to process — it\'s okay to pause before reacting.',
            'Write down the unexpected event and your first feelings about it.',
            'Talk to someone you trust about what surprised you today.'
        ],
        disgust:  [
            'Notice and name the feeling — acknowledging it is the first step to moving past it.',
            'Distance yourself from the trigger if possible, even briefly.',
            'Engage in something you find pleasant or comforting to reset your mood.'
        ],
        neutral:  [
            'This is a great time to set an intention for the rest of your day.',
            'Use this balanced state to tackle something you\'ve been putting off.',
            'A short mindfulness check-in can help you stay present and focused.'
        ],
    };

    return defaults[emotion] || defaults.neutral;
}

/**
 * GET /api/mood/smart-suggestions
 * Generates 3 AI wellness suggestions based on a 1-10 mood score.
 */
const getSmartSuggestions = async (req, res) => {
    try {
        const { mood, energy } = req.query;
        const moodScore = parseInt(mood) || 5;
        const energyScore = parseInt(energy) || 5;
        console.log(`AI Suggestions requested for mood: ${moodScore}, energy: ${energyScore}`);

        // Map 1-10 to descriptive labels for Gemini
        const moodLabel = moodScore <= 2 ? 'Rough' : moodScore <= 4 ? 'Low' : moodScore <= 6 ? 'Okay' : moodScore <= 8 ? 'Good' : 'Excellent';
        const energyLabel = energyScore <= 2 ? 'Drained' : energyScore <= 4 ? 'Low' : energyScore <= 6 ? 'Moderate' : energyScore <= 8 ? 'Energized' : 'Charged';

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            console.warn('GEMINI_API_KEY is not set correctly. Using fallbacks.');
            return res.json({ suggestions: getDefaultSuggestions(moodScore <= 3 ? 'sad' : moodScore <= 6 ? 'neutral' : 'happy') });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
A user's mood score is ${moodScore}/10 (which is "${moodLabel}").
Their energy score is ${energyScore}/10 (which is "${energyLabel}").
You are an AI wellness assistant. Give 3 short personalized wellness suggestions based on BOTH their mood and energy level.
Each suggestion should be 1 short sentence.
Return response in JSON array format: ["s1", "s2", "s3"]
        `.trim();

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        console.log('Gemini Response:', text);

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        let suggestions = [];
        if (jsonMatch) {
            try {
                suggestions = JSON.parse(jsonMatch[0]);
            } catch (e) {
                suggestions = [text];
            }
        } else {
            suggestions = text.split('\n').filter(line => line.trim()).slice(0, 3);
        }

        return res.json({ suggestions: suggestions.length > 0 ? suggestions : getDefaultSuggestions(moodScore <= 3 ? 'sad' : moodScore <= 6 ? 'neutral' : 'happy') });
    } catch (err) {
        console.error('Gemini Smart Suggestions error:', err.message);
        const moodScore = parseInt(req.query.mood) || 5;
        const tier = moodScore <= 3 ? 'low' : moodScore <= 6 ? 'medium' : 'high';
        return res.json({ suggestions: getDefaultSuggestions(tier === 'low' ? 'sad' : tier === 'medium' ? 'neutral' : 'happy') });
    }
};

module.exports = { getMoodLogs, createMoodLog, getStreak, detectFaceMood, getSmartSuggestions };
