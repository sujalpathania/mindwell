# MindWell

MindWell is a privacy-focused mental wellness web application. It acts as a secure, minimalist digital journal allowing users to write private entries, track moods, and relax with guided breathing tools.

## Features

- **Secure Journaling**: AES-256 encrypted entries.
- **Mood Tracking**: meaningful analytics (Line & Pie charts).
- **Privacy First**: Data is encrypted at rest; only the user can decrypt it.
- **Minimalist UI**: Distraction-free, calming design with Dark Mode.

## Tech Stack

- **Frontend**: React, Framer Motion, Chart.js, TailwindCSS
- **Backend**: Node.js, Express.js, MongoDB
- **Security**: AES-256 Encryption

## Setup

### Prerequisites
- Node.js
- MongoDB
- Python 3.9 or higher
- pip

### Installation & Start

1. **Backend Setup**:
   ```bash
   cd server
   npm install
   # Ensure .env is configured
   npm start
   # or
   node index.js
   ```

2. **Frontend Setup**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **AI Service Setup**:
   ```bash
   cd ai_service
   python -m venv venv

   # Windows PowerShell
   .\venv\Scripts\Activate.ps1

   # Windows CMD
   venv\Scripts\activate

   # macOS / Linux
   source venv/bin/activate

   pip install -r requirements.txt
   python app.py
   ```

The AI service runs separately and is used for emotion detection via DeepFace/OpenCV.

## Encryption Strategy

MindWell prioritizes user privacy. 
- **Algorithm**: AES-256-CBC.
- **Storage**: Journal entries are encrypted using a server-side key (simulated per-user security for this MVP) before being saved to MongoDB.
- **Decryption**: Content is only decrypted when requested by the authenticated user via the API.
- **Database Admins**: Can only see ciphertext (e.g., `iv:encrypted_string`), protecting user thoughts from prying eyes.

"# mindwell" 
