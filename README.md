# Clinical Trial Site Reconciliation - Agentic AI Demo

AI-powered site payments reconciliation demo

## Tech Stack

**Backend:**
- Flask + CrewAI + Claude Sonnet 4.5
- Python 3.11+

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS + Recharts

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

