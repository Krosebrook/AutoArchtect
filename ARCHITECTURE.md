
# System Architecture

## 1. Persistence Layer (IndexedDB)
We utilize `Dexie.js` for an ACID-compliant local database. 
- **Stores**: 
  - `blueprints`: Versioned automation logic.
  - `profile`: Local user persona data.
  - `secureKeys`: Local-only provider credentials.

## 2. Security Patterns
### Zero-Cloud Key Storage
API keys provided via the `Terminal` or `Profile` views are stored in the `secureKeys` table. We implement a reversible obfuscation shim to prevent plain-text discovery via browser dev-tools inspection of the storage tab. Keys are only decrypted in memory during the `createAiClient` call.

## 3. PWA Strategy
### Offline Availability
- **Static Content**: Service Worker caches all Tailwind and Font assets.
- **Data**: All saved blueprints are available for inspection and export while offline.
- **AI Logic**: Synthesis and Auditing require an active network connection (Network-First approach).

## 4. API Terminal Kernel
The terminal uses a synchronous command parser. It acts as a direct bridge to the `@google/genai` SDK, bypassing the structured UI generator for rapid prototyping.
