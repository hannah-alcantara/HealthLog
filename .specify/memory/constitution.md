<!--
============================================================================
SYNC IMPACT REPORT
============================================================================
Version change: [Initial] → 1.0.0
Modified principles: None (initial creation)
Added sections:
  - Core Principles (5 principles)
  - Performance Standards
  - Quality Gates
  - Governance

Removed sections: None (initial creation)

Templates requiring updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section aligns
  ✅ .specify/templates/spec-template.md - Success Criteria aligns with performance standards
  ✅ .specify/templates/tasks-template.md - Test-first and quality gate alignment
  ⚠ CLAUDE.md - Should reference constitution principles

Follow-up TODOs: None
============================================================================
-->

# Health Log Application Constitution

## Core Principles

### I. Code Quality First

**Every line of code MUST meet quality standards before merging.**

- TypeScript strict mode enabled with zero `any` types unless explicitly justified
- ESLint rules enforced with zero warnings allowed in production code
- All components MUST use TypeScript interfaces for props with JSDoc comments
- Functions exceeding 50 lines MUST be refactored into smaller, focused units
- Naming conventions: React components PascalCase, utilities camelCase, constants UPPER_SNAKE_CASE
- No console.log statements in production builds (use proper logging utilities)
- Dead code (unused imports, functions, variables) MUST be removed before commit

**Rationale**: Code quality directly impacts maintainability, debugging speed, and
onboarding efficiency. Strict standards prevent technical debt accumulation.

### II. Testing Standards (NON-NEGOTIABLE)

**All user-facing features MUST have corresponding tests.**

- **Test Types Required**:
  - Component tests: All interactive components using React Testing Library
  - Integration tests: All user journeys defined in spec.md acceptance scenarios
  - E2E tests: Critical paths (authentication, data persistence, primary workflows)
- **Test Coverage Minimums**:
  - 80% coverage for utility functions and services
  - 90% coverage for business logic and state management
  - 100% coverage for authentication and data validation code
- **Test Quality Standards**:
  - Tests MUST be deterministic (no flaky tests allowed)
  - Tests MUST run in isolation (no shared state between tests)
  - Test descriptions MUST follow "should [expected behavior] when [condition]" format
  - Mocks MUST be properly typed and validated
- **When Tests Are Optional**: Simple presentational components with no logic, type-only files

**Rationale**: Testing prevents regression, documents expected behavior, and enables
confident refactoring. User-facing features without tests create unacceptable risk.

### III. User Experience Consistency

**All UI components MUST follow established patterns and accessibility standards.**

- **Design System Compliance**:
  - Use only theme variables from globals.css (--background, --foreground, --font-*)
  - Spacing MUST use Tailwind's standard scale (p-4, m-2, gap-6, etc.)
  - Color usage MUST support both light and dark modes with proper contrast ratios
  - Typography MUST use Geist font variables consistently
- **Accessibility Requirements (WCAG 2.1 AA)**:
  - All interactive elements MUST be keyboard navigable
  - Color contrast ratio MUST meet 4.5:1 for text, 3:1 for large text
  - All images MUST have descriptive alt text
  - Form inputs MUST have associated labels
  - Focus indicators MUST be visible and clear
  - ARIA labels required for icon-only buttons
- **Responsive Design**:
  - Mobile-first approach (design for 375px width minimum)
  - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
  - Touch targets MUST be minimum 44x44px on mobile
  - Text MUST remain readable without horizontal scrolling

**Rationale**: Consistency reduces cognitive load, accessibility ensures inclusivity,
and responsive design maximizes reach. UX debt is as costly as technical debt.

### IV. Performance Requirements

**Application MUST meet performance budgets to ensure excellent user experience.**

- **Page Load Performance**:
  - First Contentful Paint (FCP): < 1.8 seconds
  - Largest Contentful Paint (LCP): < 2.5 seconds
  - Time to Interactive (TTI): < 3.5 seconds
  - Cumulative Layout Shift (CLS): < 0.1
- **Bundle Size Limits**:
  - Initial JavaScript bundle: < 200KB (gzipped)
  - CSS bundle: < 50KB (gzipped)
  - Images optimized via Next.js Image component (WebP/AVIF preferred)
- **Runtime Performance**:
  - 60 FPS for animations and interactions
  - API responses rendered within 200ms of data arrival
  - Debounce search/filter inputs (300ms minimum)
  - Virtualization required for lists exceeding 100 items
- **Monitoring Required**:
  - Core Web Vitals tracked in production
  - Performance budget violations MUST be addressed before merge

**Rationale**: Performance directly impacts user satisfaction, SEO rankings, and
accessibility (especially for users on slower devices/networks).

### V. Data Integrity & Security

**User data MUST be handled securely and validated rigorously.**

- **Input Validation**:
  - All user input MUST be validated client-side AND server-side
  - Use Zod or similar schema validation for type safety
  - Sanitize inputs to prevent XSS attacks
  - File uploads MUST validate type, size, and content
- **Data Persistence**:
  - Health data MUST persist across sessions
  - Local storage usage MUST be minimal and non-sensitive only
  - Implement proper error boundaries for data operations
  - Failed writes MUST show clear user feedback
- **Privacy & Security**:
  - No sensitive health data logged to console or analytics
  - Third-party integrations MUST be explicitly approved
  - API keys and secrets in environment variables only (never committed)
  - Content Security Policy configured appropriately

**Rationale**: Health data is sensitive personal information requiring the highest
standards of security, privacy, and reliability.

## Performance Standards

**Specific to Health Log Application Domain**

### Feature-Level Budgets

- **Data Entry Forms**: Submit feedback < 100ms, optimistic UI updates
- **Data Visualization**: Charts render in < 500ms for 30 days of data
- **Search/Filter**: Results display in < 300ms for typical dataset (< 1000 entries)
- **Data Export**: Generate export file in < 2 seconds for 1 year of data

### Optimization Requirements

- Next.js Image component MUST be used for all images (automatic optimization)
- Dynamic imports for heavy components (charts, calendars, rich editors)
- Server components preferred over client components when interactivity not needed
- Database queries optimized (proper indexing for health log timestamps)

## Quality Gates

**Gates that MUST pass before proceeding to next phase**

### Before Implementation Begins

- [ ] Specification validated with zero [NEEDS CLARIFICATION] markers
- [ ] Design artifacts complete (plan.md, data-model.md if applicable)
- [ ] Performance budgets defined for feature
- [ ] Accessibility requirements identified

### Before Pull Request

- [ ] All tests passing with required coverage thresholds
- [ ] ESLint: zero errors, zero warnings
- [ ] TypeScript: zero errors, strict mode enabled
- [ ] Lighthouse score: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 90
- [ ] Manual testing on mobile viewport completed
- [ ] Dark mode visual regression check completed

### Before Merge to Main

- [ ] Code review approved by at least one reviewer
- [ ] All quality gate checklist items verified
- [ ] No performance budget regressions
- [ ] Documentation updated (README, CLAUDE.md, inline JSDoc as needed)

## Governance

**This constitution supersedes all other development practices and conventions.**

### Amendment Process

1. Proposed changes MUST be documented with rationale
2. Team review and approval required (if team exists; otherwise maintainer approval)
3. Version bump following semantic versioning rules
4. Migration plan required for breaking changes
5. Dependent templates and documentation MUST be updated

### Compliance

- All feature specifications (`/speckit.specify`) MUST align with principles
- All implementation plans (`/speckit.plan`) MUST pass Constitution Check
- Code reviews MUST verify compliance with quality standards
- Violations MUST be justified in writing (Complexity Tracking table in plan.md)
- Unjustified complexity or standard violations MUST be rejected

### Versioning Policy

- **MAJOR**: Principle removal/redefinition, new non-negotiable requirements
- **MINOR**: New optional principle, expanded guidance, new quality gate
- **PATCH**: Clarifications, wording improvements, typo fixes

### Runtime Guidance

- Use `CLAUDE.md` for AI-assisted development context
- Refer to this constitution during `/speckit.plan` for Constitution Check
- Quality gates enforced via `/speckit.analyze` consistency checks

**Version**: 1.0.0 | **Ratified**: 2025-12-09 | **Last Amended**: 2025-12-09
