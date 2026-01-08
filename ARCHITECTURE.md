
# System Architecture

## 1. Persistence Layer (IndexedDB)
We utilize `Dexie.js` for an ACID-compliant local database. 
- **Database Version**: 2 (migrated from v1)
- **Stores**: 
  - `blueprints`: Versioned automation logic (id, name, platform, timestamp).
  - `profile`: Local user persona data (id).
  - `secureKeys`: ✅ **IMPLEMENTED** - Local-only provider credentials (provider, obfuscatedKey, createdAt).

## 2. Security Patterns
### Zero-Cloud Key Storage (IMPLEMENTED v2.6)
API keys provided via the `Terminal` view are stored in the `secureKeys` table using the following security approach:

**Obfuscation Method:**
- XOR cipher with rotating seed pattern (`AutoArchitect-SecureVault-2026`)
- Base64 encoding for safe storage in IndexedDB
- Reversible obfuscation (not encryption) to prevent casual inspection
- Keys are deobfuscated only in memory during `createAiClient` call

**Key Priority:**
1. Local stored keys (IndexedDB via `storage.getSecureKey()`)
2. Environment variables (fallback for deployment scenarios)

**Input Validation:**
- Provider names: alphanumeric, hyphens, underscores only
- Keys: non-empty string validation
- Masked display in Terminal (first 4 + last 4 characters only)

**Terminal Commands:**
- `set-key <provider> <key>` - Store obfuscated key
- `test-key <provider>` - Verify key with live API call
- `list-keys` - Show configured providers (not actual keys)
- `delete-key <provider>` - Remove stored key

## 3. PWA Strategy
### Offline Availability
- **Static Content**: Service Worker caches all Tailwind and Font assets.
- **Data**: All saved blueprints are available for inspection and export while offline.
- **AI Logic**: Synthesis and Auditing require an active network connection (Network-First approach).

## 4. API Terminal Kernel
The terminal uses a synchronous command parser with full key management capabilities. It acts as:
- **Direct AI Bridge**: Direct connection to `@google/genai` SDK for rapid prototyping
- **Key Management Interface**: Primary interface for secure API key storage and testing
- **Command Processor**: Handles both key management and AI execution commands
- **Security Layer**: Validates inputs, masks sensitive data, and provides clear error messages

### Implemented Commands (v2.6)
- `help` - Display command reference
- `clear` - Clear terminal history
- `set-key <provider> <key>` - Store API key with obfuscation
- `test-key <provider>` - Verify stored key with live API test
- `list-keys` - List configured providers
- `delete-key <provider>` - Remove stored key
- `exec <prompt>` - Execute AI model with custom prompt
- Default: Any unrecognized command executes as AI prompt
