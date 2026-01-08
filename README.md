
# AutoArchitect v2.6 PWA-Native

Production-grade suite for AI automation architecture. Now featuring a robust, offline-capable IndexedDB backbone and a fully implemented Secure API Key Vault.

## 🌟 Key Updates (v2.6)
- **Secure Key Vault**: ✅ **NEW** - API keys are obfuscated (XOR + Base64) and stored locally in IndexedDB. Never sent to a backend.
- **Key Management Terminal Commands**: ✅ **NEW** - Full CLI for API key management (`set-key`, `test-key`, `list-keys`, `delete-key`).
- **Structured Persistence**: Moved from localStorage to IndexedDB (Dexie.js) with versioned schema.
- **Production CLI**: Fully functional `API Terminal` view with command parsing.
- **Service Worker v2**: Stale-while-revalidate caching for ultra-fast startup.

## 🚀 Installation
1. Open the app in a supported browser (Chrome/Edge/Safari).
2. Click the 'Install' icon in the address bar to add to your Desktop/Home Screen.

## 🛠 Terminal Usage
Access the `API Terminal` and type `help` to see available commands.

### Setting Up Your API Key
```bash
# Store your Google AI (Gemini) API key securely
set-key gemini AIza...YOUR_ACTUAL_KEY

# Verify the key works
test-key gemini

# List configured providers
list-keys

# Execute AI operations
exec Create a Zapier flow for Shopify orders
```

### Key Management Commands
- `set-key <provider> <api_key>` - Store an API key with obfuscation
- `test-key <provider>` - Verify a stored key works with the API
- `list-keys` - Show which providers have keys configured
- `delete-key <provider>` - Remove a stored API key
- `exec <prompt>` - Execute AI model with your prompt
- `help` - Show available commands
- `clear` - Clear terminal history

## 📁 Architecture
- `services/storageService.ts`: IndexedDB logic with Secure Key Vault (v2 schema with `secureKeys` table).
- `services/geminiService.ts`: AI orchestration with local key priority (checks IndexedDB first, then env vars).
- `views/TerminalView.tsx`: CLI implementation with full key management commands.

## 🔒 Security
- **Key Obfuscation**: API keys are obfuscated using XOR cipher + Base64 encoding before storage.
- **Client-Side Only**: Keys never leave your browser or device.
- **No Backend Transmission**: All storage and retrieval happens locally via IndexedDB.
- **Masked Display**: Keys are never displayed in full (only first 4 and last 4 characters shown).
