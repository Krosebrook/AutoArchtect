
# AutoArchitect v2.5 PWA-Native

Production-grade suite for AI automation architecture. Now featuring a robust, offline-capable IndexedDB backbone and a secure API Terminal.

## 🌟 Key Updates
- **Structured Persistence**: Moved from localStorage to IndexedDB (Dexie.js).
- **Secure Key Vault**: API keys are obfuscated and stored locally. Never sent to a backend.
- **Production CLI**: Fully functional `API Terminal` view with command parsing.
- **Service Worker v2**: Stale-while-revalidate caching for ultra-fast startup.

## 🚀 Installation
1. Open the app in a supported browser (Chrome/Edge/Safari).
2. Click the 'Install' icon in the address bar to add to your Desktop/Home Screen.

## 🛠 Terminal Usage
Access the `API Terminal` and type `help` to see available commands.
Example to initialize your session:
`set-key gemini YOUR_GOOGLE_AI_KEY`
`test-key gemini`
`exec Create a Zapier flow for Shopify orders`

## 📁 Architecture
- `services/storageService.ts`: IndexedDB logic and Key Vault.
- `services/geminiService.ts`: AI orchestration prioritizing Local Keys.
- `views/TerminalView.tsx`: CLI implementation.
