# 🤖 AI Contract Review Platform

A powerful AI-powered platform for contract analysis, risk assessment, and intelligent document review. Built with React, FastAPI, and OpenAI.

## ✨ Features

- **📄 Document Upload**: Support for PDF, DOCX, and TXT files
- **🔍 AI Analysis**: Comprehensive contract analysis with risk scoring
- **💬 Smart Chat**: Ask questions about your contracts with context-aware responses
- **📊 Dashboard**: Visual analytics and contract portfolio management
- **🔐 Secure**: JWT authentication and secure file handling
- **📱 Responsive**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- MongoDB Atlas account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-contract-review-platform.git
   cd ai-contract-review-platform
   ```

2. **Set up environment variables**
   ```bash
   cp environment.example .env
   # Edit .env with your actual values
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Run the application**
   ```bash
   # Backend (Terminal 1)
   cd backend
   uvicorn main:app --reload
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **FastAPI** - Web framework
- **Python 3.8+** - Runtime
- **MongoDB** - Database
- **Beanie** - ODM
- **OpenAI API** - AI services
- **JWT** - Authentication

### AI & ML
- **OpenAI GPT-4** - Contract analysis
- **LangChain** - AI framework (optional)
- **Vector Store** - Document embeddings (optional)

## 📁 Project Structure

```
ai-contract-review-platform/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── models/        # Data models
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utilities
│   ├── uploads/           # Uploaded files
│   └── requirements.txt
├── docs/                   # Documentation
├── deployment/             # Deployment configs
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
OPENAI_API_KEY=your_openai_api_key
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
SECRET_KEY=your_jwt_secret_key
CORS_ORIGINS=http://localhost:5173
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000
```

## 🚀 Deployment

### Free Hosting Options

- **Frontend**: Vercel (Free)
- **Backend**: Railway (Free)
- **Database**: MongoDB Atlas (Free)

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy Backend to Railway**
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically

3. **Deploy Frontend to Vercel**
   - Import GitHub repository
   - Set build settings
   - Deploy automatically

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📖 API Documentation

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Contracts
- `POST /api/v1/contracts/upload` - Upload document
- `GET /api/v1/contracts/` - List contracts
- `GET /api/v1/contracts/{id}` - Get contract details
- `POST /api/v1/contracts/{id}/analyze` - Analyze contract
- `DELETE /api/v1/contracts/{id}` - Delete contract

### Chat
- `POST /api/v1/chat/send` - Send message
- `GET /api/v1/chat/{document_id}` - Get chat history

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for the GPT-4 API
- FastAPI for the excellent web framework
- React team for the amazing UI library
- MongoDB for the database service

## 📞 Support

If you have any questions or need help:

1. Check the [documentation](docs/)
2. Open an [issue](https://github.com/yourusername/ai-contract-review-platform/issues)
3. Contact the maintainers

## 🎯 Roadmap

- [ ] Multi-document comparison
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Advanced AI models

---

**Made with ❤️ by [Your Name]**"# AI-Contract-Review-Platform" 
