# NeuroSaathi - Cognitive Gaming & Memory Assistance Platform

🧠 **AI-powered cognitive support for healthier, connected ageing**

An intelligent, offline-friendly cognitive gaming and memory assistance platform designed specifically for elderly users and caregivers in the North Eastern Region of India.

---

## 🎯 About NeuroSaathi

NeuroSaathi is a Smart India Hackathon project addressing Problem Statement 26003:

> "AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)"

**Important:** NeuroSaathi is a support and engagement platform. It does not diagnose or treat any medical condition.
---

## ✨ Key Features

- 🧠 **Adaptive Cognitive Games** - Four interactive activities that adjust difficulty based on user performance
- ⏰ **Smart Reminders** - Gentle notifications for medicines, meals, water intake, and appointments
- 👥 **Caregiver Dashboard** - Monitor patient activity, access health insights, and generate reports
- 📶 **Offline-First** - Works seamlessly without internet; syncs data when connection returns
- 🗣️ **Voice Support** - Speech recognition and text-to-speech in 10+ regional languages
- 🌍 **Multilingual** - English, Hindi, Assamese, Bengali, Manipuri, and more
- ♿ **Accessible Design** - Large text, high contrast, keyboard navigation, and voice control

---

## 🛠 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive, accessible styling
- **Vanilla JavaScript** - No frameworks for optimal performance
- **LocalStorage** - Offline data persistence
- **Web Speech API** - Voice recognition and synthesis

### Backend Ready
- Designed for easy integration with:
  - **Node.js + Express**
  - **Firebase**
  - **PostgreSQL/MongoDB**

---

## 📁 Project Structure

```
neuro-zen-connect/
├── public/neurosaathi-dashboard/
│   ├── index.html                 # Login page
│   ├── patient.html               # Patient dashboard
│   ├── caregiver.html             # Caregiver dashboard
│   ├── games.html                 # Games hub
│   ├── game-memory.html           # Memory matching game
│   ├── game-pattern.html          # Pattern recognition game
│   ├── game-attention.html        # Attention/focus game
│   ├── game-recall.html           # Daily routine recall
│   ├── reminders.html             # Reminder management
│   ├── appointments.html          # Appointment tracking
│   ├── progress.html              # Cognitive progress & trends
│   ├── alerts.html                # Caregiver alerts
│   ├── settings.html              # User preferences
│   ├── css/                       # Stylesheets
│   ├── js/                        # JavaScript modules
│   ├── data/                      # Mock JSON data
│   └── assets/                    # Images & icons
│
├── src/                           # React/TypeScript source
│   ├── routes/                    # File-based routing
│   ├── components/                # UI components
│   ├── lib/                       # Utilities
│   └── styles.css                 # Global styles
│
└── README.md                      # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ or Bun
- Modern web browser with ES6 support

### Installation

```bash
# Clone the repository
git clone https://github.com/sakshi122006/neuro-zen-connect.git
cd neuro-zen-connect

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

### Demo Credentials

**Patient Login:**
- Username: `patient`
- Password: `patient123`

**Caregiver Login:**
- Username: `caregiver`
- Password: `care123`

---

## 🎮 Cognitive Games

### 1. **Memory Match**
Classic memory matching game with 12 cards (6 pairs). Tracks attempts, accuracy, and completion time.

### 2. **Pattern Recognition**
Visual sequences that users complete. Difficulty adapts based on performance.

### 3. **Attention Focus**
Identify and tap target objects among distractors. Measures accuracy and response time.

### 4. **Daily Routine Recall**
Arrange daily activities in correct order. Supports routine adherence and memory training.

---

## 👥 User Roles

### Patient
- Practice cognitive games daily
- Receive medication and activity reminders
- Track personal progress
- Voice-assisted navigation
- Large, accessible interface

### Caregiver
- Monitor multiple patients
- View cognitive engagement metrics
- Manage reminders and appointments
- Receive alerts for concerning patterns
- Generate downloadable reports

---

## 📊 Key Metrics

The platform tracks **Cognitive Engagement Scores** using:
- **Accuracy** - Percentage of correct answers
- **Response Time** - Speed of task completion
- **Consistency** - Performance over time
- **Difficulty Progression** - Game difficulty level

**Important:** These metrics measure *cognitive engagement and activity performance*, not medical diagnosis.

---

## 🌐 Multilingual Support

Supported languages:
- English
- Hindi (हिन्दी)
- Assamese (অসমীয়া)
- Bengali (বাংলা)
- Manipuri (মৈতৈ)
- Meghalayan
- Mizo
- Nagamese
- Tripuri
- Khasi
- Arunachali

---

## 💾 Offline Functionality

The app stores all data locally using **LocalStorage** and **IndexedDB**:
- Games and scores sync when offline
- Reminders queue locally
- Patient activity logs persist
- Automatic sync when connection returns

Perfect for rural areas in NER with limited connectivity.

---

## 🔒 Privacy & Security

- **No cloud uploads** - All data stays on device by default
- **No tracking** - No analytics or telemetry
- **Simple authentication** - Demo mode for testing
- **Local storage only** - No API calls for demo

Ready for backend integration with proper authentication.

---

## 🎨 Design Philosophy

- **Elderly-Friendly** - Large fonts (18px+), high contrast, simple navigation
- **Minimal Clutter** - Focus on essential actions
- **Accessible** - Keyboard navigation, screen reader support, voice control
- **Responsive** - Works on tablets, phones, and desktop
- **Supportive** - Positive feedback, no shame or negativity

---

## 📈 Development Roadmap

- [ ] Backend integration (Node.js + Firebase)
- [ ] Real authentication system
- [ ] Data encryption and HIPAA compliance
- [ ] Advanced analytics dashboard
- [ ] More cognitive game varieties
- [ ] Integration with wearables (heart rate, sleep)
- [ ] Video call support for virtual consultations
- [ ] SMS/WhatsApp reminders
- [ ] Caregiver mobile app

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly
4. Submit a pull request

---

## 📝 License

This project is part of Smart India Hackathon 2024.

---

## ⚠️ Disclaimer

**NeuroSaathi is a support and engagement tool.**

- ❌ Does NOT diagnose dementia or any medical condition
- ❌ Does NOT replace professional medical care
- ❌ Scores are for activity monitoring only, not clinical measurement
- ✅ Should be used alongside professional medical support
- ✅ Designed to enhance quality of life and social engagement

Always consult healthcare professionals for medical concerns.

---

## 📞 Support

For questions, issues, or suggestions:
- 📧 Email: revajesakshi@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/sakshi122006/neuro-zen-connect/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/sakshi122006/neuro-zen-connect/discussions)

---

## 👏 Acknowledgments

Built with ❤️ for the elderly community in North Eastern India.

---

**Made with care by Team NeuroSaathi** 🧠✨
