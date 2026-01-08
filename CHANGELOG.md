# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.6.0] - 2026-01-08

### Added
- **Secure Key Vault**: Fully implemented local API key storage with XOR + Base64 obfuscation
  - Keys stored in IndexedDB `secureKeys` table (never transmitted to any server)
  - Automatic key rotation priority: local storage first, then environment variables
  - Input validation for provider names and key values
- **Terminal Key Management Commands**: Complete CLI interface for API key operations
  - `set-key <provider> <key>` - Store API keys with automatic obfuscation
  - `test-key <provider>` - Verify stored keys with live API calls
  - `list-keys` - Display all configured providers (not the keys themselves)
  - `delete-key <provider>` - Remove stored API keys
- **Database Schema Migration**: Upgraded from v1 to v2
  - Added `secureKeys` table with provider, obfuscatedKey, and createdAt fields
  - Automatic migration handled by Dexie.js
- **Enhanced Security**:
  - Key masking in Terminal output (only first 4 and last 4 characters shown)
  - Provider name validation (alphanumeric, hyphens, underscores only)
  - Error handling for corrupted or invalid keys

### Changed
- Updated `geminiService.ts` to prioritize local stored keys over environment variables
- Modified `createAiClient()` to be async and check IndexedDB before env vars
- Enhanced Terminal help text with complete command reference
- Updated all documentation (README.md, ARCHITECTURE.md) to reflect implemented features
- Version bump from v2.5 to v2.6 across all metadata files

### Security
- Implemented XOR cipher with rotating seed for key obfuscation
- Keys are only deobfuscated in memory during API client initialization
- No logging of actual key values (only masked versions shown)
- Client-side only storage - keys never transmitted to backend

## [2.5.0] - Previous Release

### Added
- Dark mode support with theme persistence
- Service Worker registration improvements
- IndexedDB migration from localStorage
- Profile management

### Changed
- Updated font family to 'Plus Jakarta Sans'
- Improved service worker URL construction for cross-origin compatibility
