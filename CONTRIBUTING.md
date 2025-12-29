# Contributing to AutoArchitect

Thank you for your interest in contributing to AutoArchitect! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- **Report bugs** via GitHub Issues
- **Suggest features** or enhancements
- **Improve documentation**
- **Submit pull requests** for bug fixes or features
- **Review pull requests** from other contributors
- **Share feedback** on UX and design

## 📋 Before You Start

1. **Check existing issues** to see if your bug/feature has already been reported
2. **Read the README** and **ARCHITECTURE.md** to understand the project
3. **Review the RECOMMENDATIONS.md** for best practices and coding standards
4. **Set up your development environment** following the setup instructions

## 🚀 Getting Started

### Prerequisites
- Node.js v14.x or newer
- npm or yarn
- Git
- A Google Gemini API key for testing (see README.md)

### Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/AutoArchitect.git
cd AutoArchitect

# Install dependencies
npm install

# Set up environment variables (copy from .env.example)
cp .env.example .env
# Edit .env and add your API key

# Start development server
npm run dev

# Build for production
npm run build
```

## 💻 Development Workflow

### 1. Create a Branch
Create a feature branch from `main`:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/modifications
- `chore/` - Maintenance tasks

### 2. Make Your Changes
- Follow the coding standards in RECOMMENDATIONS.md
- Write clean, self-documenting code
- Add comments for complex logic
- Ensure TypeScript strict mode compliance
- Follow existing patterns in the codebase

### 3. Test Your Changes
```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build to ensure no build errors
npm run build
```

### 4. Commit Your Changes
We follow conventional commit messages:
```bash
git commit -m "feat: add new automation template feature"
git commit -m "fix: resolve IndexedDB quota exceeded error"
git commit -m "docs: update API documentation for geminiService"
git commit -m "refactor: optimize service worker caching strategy"
git commit -m "test: add unit tests for storageService"
```

Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub:
1. Go to the repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template completely
5. Request review from maintainers

## 📝 Coding Standards

### TypeScript
- Enable strict mode
- Use explicit types, avoid `any`
- Use `interface` for object shapes
- Document public APIs with JSDoc
- Follow existing patterns

### React
- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Use meaningful component and prop names
- Keep components focused and reusable

### File Organization
```
src/
├── components/    # Reusable UI components
├── views/         # Page-level components
├── services/      # Business logic and API calls
├── hooks/         # Custom React hooks
├── utils/         # Helper functions
├── types/         # TypeScript types
└── __tests__/     # Test files
```

### Naming Conventions
- Components: PascalCase (`AutomationView.tsx`)
- Hooks: camelCase with 'use' prefix (`useAutomation.ts`)
- Services: camelCase with 'Service' suffix (`geminiService.ts`)
- Types: PascalCase (`AutomationResult`)
- Files: Match primary export name

### Style Guide
- Use Tailwind CSS utility classes
- Follow existing component patterns
- Ensure responsive design (mobile-first)
- Maintain accessibility standards (ARIA, semantic HTML)
- Test in multiple browsers

## 🧪 Testing Requirements

### Required Tests
- Unit tests for all services
- Component tests for UI components
- Integration tests for key workflows
- E2E tests for critical user journeys

### Test Guidelines
- Test behavior, not implementation
- Use descriptive test names
- Mock external dependencies
- Cover happy path and error cases
- Ensure tests are deterministic

## 📚 Documentation

### When to Update Documentation
- Adding new features
- Changing APIs
- Modifying architecture
- Fixing bugs that affect usage
- Improving setup/deployment

### Documentation Files
- `README.md` - Overview and quick start
- `ARCHITECTURE.md` - System architecture
- `RECOMMENDATIONS.md` - Best practices and standards
- JSDoc comments in code
- Inline comments for complex logic

## 🔍 Code Review Process

### What We Look For
- Code quality and readability
- Test coverage
- Performance implications
- Security considerations
- Documentation completeness
- Adherence to coding standards

### Responding to Feedback
- Be open to suggestions
- Ask questions if unclear
- Make requested changes promptly
- Update tests and docs as needed
- Mark conversations as resolved

## 🐛 Reporting Bugs

Use the bug report template and include:
- Clear description of the issue
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable
- Environment details (browser, OS, etc.)
- Console errors if available

## 💡 Suggesting Features

Use the feature request template and include:
- Clear description of the feature
- Problem it solves
- Proposed solution
- Use cases and benefits
- Implementation considerations

## ⚖️ Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome diverse perspectives
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing others' private information
- Other conduct that would be inappropriate in a professional setting

### Enforcement
Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report issues to project maintainers.

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🙏 Recognition

Contributors will be:
- Listed in the contributors section
- Credited in release notes
- Mentioned in documentation updates

## 📞 Getting Help

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check README.md and RECOMMENDATIONS.md

## 🎯 Good First Issues

Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - Contributions especially welcome
- `documentation` - Documentation improvements needed

## 🔄 Release Process

1. All changes go through pull request review
2. CI/CD tests must pass
3. Code review approval required
4. Maintainer merges to main
5. Automated deployment to production
6. Release notes generated

## 📊 Quality Standards

Before submitting:
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] TypeScript compiles without errors
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Self-reviewed code
- [ ] No security vulnerabilities introduced

## ✨ Tips for Great Contributions

- **Start small** - Small, focused PRs are easier to review
- **Communicate early** - Discuss large changes before implementing
- **Test thoroughly** - Test edge cases and error conditions
- **Write good commit messages** - Clear, descriptive commits help reviewers
- **Be patient** - Reviews take time, maintainers are volunteers
- **Learn from feedback** - Use reviews as learning opportunities

---

Thank you for contributing to AutoArchitect! Your efforts help make this project better for everyone. 🚀
