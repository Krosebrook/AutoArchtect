# AutoArchitect v2.5 PWA-Native

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Enabled-brightgreen.svg)](https://web.dev/progressive-web-apps/)

Production-grade suite for AI-powered automation architecture. A Progressive Web Application featuring offline-capable IndexedDB storage, secure local API key management, and Google Gemini AI integration.

## ✨ Features

### Core Capabilities
- 🤖 **AI-Powered Automation**: Generate workflows for Zapier, n8n, LangChain, Make, and more
- 💾 **Offline-First**: Full functionality without internet connection
- 🔒 **Secure & Private**: API keys stored locally, never transmitted to servers
- 📱 **Progressive Web App**: Install on desktop or mobile devices
- ⚡ **Real-Time AI**: Live voice interaction with AI architect
- 🎨 **Modern UI**: Responsive design with Tailwind CSS

### Advanced Features
- **Automation Generator**: Create production-ready workflows with AI assistance
- **Logic Sandbox**: Test and simulate automation logic before deployment
- **Audit View**: Security analysis and cost estimation for workflows
- **Deployment Hub**: Generate CI/CD pipelines and deployment configurations
- **Platform Comparator**: Compare automation platforms for your use case
- **API Terminal**: Command-line interface for power users
- **Blueprint Vault**: Save, version, and manage automation blueprints
- **Image Analysis**: AI-powered visual automation design
- **Text-to-Speech**: Generate voice procedure manuals

## 🌟 Key Updates (v2.5)

- **Structured Persistence**: Migrated from localStorage to IndexedDB (Dexie.js)
- **Secure Key Vault**: API keys obfuscated and stored locally only
- **Production CLI**: Fully functional API Terminal with command parsing
- **Service Worker v2**: Stale-while-revalidate caching for instant startup
- **Enhanced Security**: Zero-cloud storage, local-only key management
- **Offline Capability**: Full feature access without network connection

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 90+, Edge 90+, Safari 14+, Firefox 88+)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Node.js 14+ and npm (for development)

### For Users

#### Option 1: Web Access
1. Visit the hosted application URL
2. Click the install icon in your browser's address bar
3. Follow the on-screen instructions to install as PWA

#### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/Krosebrook/AutoArchtect.git
cd AutoArchtect

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your Gemini API key

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### First Time Setup
1. **Access the API Terminal** view from the sidebar
2. **Set your API key**:
   ```
   set-key gemini YOUR_GOOGLE_AI_KEY
   ```
3. **Test your connection**:
   ```
   test-key gemini
   ```
4. **Start creating**:
   ```
   exec Create a Zapier flow for Shopify orders
   ```

## 📱 Installation as PWA

### Desktop (Chrome/Edge)
1. Visit the application
2. Click the install icon (⊕) in the address bar
3. Click "Install" in the popup

### Mobile (iOS Safari)
1. Visit the application
2. Tap the share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Mobile (Android Chrome)
1. Visit the application
2. Tap the menu (⋮) button
3. Select "Install app" or "Add to Home screen"
4. Tap "Install"

## 🛠 Usage Guide

### Creating Your First Automation

1. **Navigate to Automation Generator**
2. Select your target platform (Zapier, n8n, LangChain, etc.)
3. Describe what you want to automate
4. Review the generated workflow
5. Save to your Vault or export for deployment

### Testing Workflows

1. Open the **Logic Sandbox**
2. Load a blueprint from your Vault
3. Provide sample input data
4. Run the simulation
5. Review step-by-step results

### Security & Cost Analysis

1. Navigate to **Audit View**
2. Load a blueprint
3. Review security score and vulnerabilities
4. Check estimated monthly costs
5. Apply recommended optimizations

### Deployment

1. Open **Deployment Hub**
2. Load your finalized blueprint
3. Configure secrets and environment variables
4. Generate deployment files (Docker, CI/CD, etc.)
5. Export and deploy to your platform

## 🏗 Architecture

### Technology Stack
- **Frontend**: React 18.2 with TypeScript 5.8
- **Build Tool**: Vite 6.2
- **Database**: IndexedDB (Dexie 3.2.4)
- **AI Provider**: Google Gemini 3 Pro & Flash
- **UI Framework**: Tailwind CSS
- **Icons**: Lucide React
- **PWA**: Custom Service Worker with Workbox patterns

### Project Structure
```
AutoArchtect/
├── .github/              # GitHub configuration
│   ├── ISSUE_TEMPLATE/   # Issue templates
│   ├── workflows/        # CI/CD workflows
│   ├── CODEOWNERS        # Code ownership
│   └── dependabot.yml    # Dependency updates
├── components/           # Reusable UI components
├── views/                # Page-level components
├── services/             # Business logic & API
│   ├── geminiService.ts  # AI orchestration
│   └── storageService.ts # IndexedDB operations
├── types.ts              # TypeScript definitions
├── App.tsx               # Main application
├── index.tsx             # Entry point
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
└── vite.config.ts        # Build configuration
```

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

## 🔒 Security

### Local-Only Storage
- API keys never leave your device
- No backend servers or cloud storage
- Obfuscated storage to prevent plain-text inspection
- Encryption in memory during API calls

### Best Practices
- Use HTTPS in production (required for PWA)
- Rotate API keys regularly
- Monitor API usage for anomalies
- Keep browser and app updated

See [SECURITY.md](SECURITY.md) for security policy and reporting vulnerabilities.

## 🧪 Development

### Available Scripts
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npx tsc --noEmit

# Run tests (when configured)
npm test
```

### Development Workflow
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📊 Performance

- **First Load**: < 3s on 3G
- **Bundle Size**: < 500KB (gzipped)
- **Lighthouse Score**: 90+ (target)
- **Offline**: Full functionality
- **Cache Strategy**: Stale-while-revalidate

## 🌐 Browser Support

- **Chrome/Edge**: 90+ ✅
- **Safari**: 14+ ✅
- **Firefox**: 88+ ✅
- **Opera**: 76+ ✅

PWA features require HTTPS (localhost exempted for development).

## 🤝 Contributing

We welcome contributions! Please see:
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community standards
- [RECOMMENDATIONS.md](RECOMMENDATIONS.md) - Best practices and coding standards

## 📋 Roadmap

### Version 3.0 (Planned)
- [ ] Enhanced key encryption with user password
- [ ] State management with Zustand
- [ ] Comprehensive test suite (80%+ coverage)
- [ ] Performance optimizations and code splitting
- [ ] Plugin/extension system
- [ ] Advanced offline sync
- [ ] Multi-language support

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design decisions
- [RECOMMENDATIONS.md](RECOMMENDATIONS.md) - Best practices, prompts, and reference repos
- [SECURITY.md](SECURITY.md) - Security policy and practices
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [CHANGELOG.md](CHANGELOG.md) - Version history

## 🐛 Troubleshooting

### Common Issues

**Issue**: "API Key not found"
- **Solution**: Set your key in the Terminal: `set-key gemini YOUR_KEY`

**Issue**: "Quota exceeded" error
- **Solution**: Clear browser storage or reduce saved blueprints

**Issue**: Service worker not updating
- **Solution**: Hard refresh (Ctrl+Shift+R) or clear cache

**Issue**: App won't install as PWA
- **Solution**: Ensure you're on HTTPS (or localhost) and using a supported browser

For more help, [open an issue](https://github.com/Krosebrook/AutoArchtect/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful AI capabilities
- React team for the excellent framework
- Vite team for blazing-fast build tooling
- Open source community for inspiration and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Krosebrook/AutoArchtect/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/AutoArchtect/discussions)
- **Documentation**: [Project Wiki](https://github.com/Krosebrook/AutoArchtect/wiki)

---

**Made with ❤️ by the AutoArchitect Team**

*Empowering developers to build better automation workflows with AI*
