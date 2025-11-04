# CI/CD Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline ensures code quality, type safety, and successful builds before code is merged or deployed.

## 🚀 Quick Start

### For Developers

1. **Push your changes** - CI runs automatically on push/PR
2. **Check status** - Look for the ✅ or ❌ status on your PR
3. **Fix issues** - CI provides detailed error messages

### For Maintainers

1. **Review CI results** - All checks must pass before merging
2. **Deploy manually** - Use the Deploy workflow from Actions tab
3. **Set secrets** - Configure GitHub Secrets for deployment

## 📋 Workflows

### 1. CI (`ci.yml`)
Main continuous integration workflow.

**When it runs:**
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

**What it does:**
1. ✅ Checks out code
2. 📦 Sets up Node.js 20.x with npm caching
3. 💾 Caches `node_modules` for faster runs
4. 📥 Installs dependencies with `npm ci`
5. 🏗️ Caches Next.js build artifacts
6. 🔍 Runs ESLint (`npm run lint`)
7. 🔧 Type checks with TypeScript (`tsc --noEmit`)
8. 🏗️ Builds the Next.js project (`npm run build`)
9. 📦 Uploads build artifacts (retained 7 days)

**Caching:**
- npm cache: Automatic via `setup-node@v4`
- node_modules: Cached by `package-lock.json` hash
- Next.js: Cached by source file hashes

**Environment Variables:**
- `BLOCKFROST_API_KEY`: Uses GitHub Secret or dummy value for CI
- `BLOCKFROST_NETWORK`: Uses GitHub Secret or defaults to `mainnet`

### 2. Code Quality (`quality.yml`)
Weekly quality checks and dependency audits.

**When it runs:**
- Weekly on Mondays at 9 AM UTC
- Manual trigger (Actions → Code Quality → Run workflow)
- Push to `main` branch (only TS/JS files)

**What it does:**
1. 🔍 Runs linting with zero warnings tolerance
2. 🔧 Strict TypeScript checking
3. 📊 Checks for outdated dependencies
4. 💡 Provides quality summary in GitHub Actions

### 3. PR Checks (`pr-checks.yml`)
Enhanced checks for pull requests.

**When it runs:**
- PR opened, updated, or reopened

**What it does:**
1. 🔍 Lints PR code
2. 🔧 Type checks PR code
3. 📏 Analyzes build size
4. ✅ Checks for common issues:
   - `console.log` statements
   - `TODO`/`FIXME` comments
5. 📊 Posts summary in PR comments

### 4. Deploy (`deploy.yml`)
Production deployment workflow.

**When it runs:**
- Manual trigger with environment selection
- Version tags (e.g., `v1.0.0`)

**What it does:**
1. 🏗️ Builds production bundle
2. 📦 Packages deployment artifacts
3. 🚀 Ready for hosting provider deployment
4. ✅ Creates deployment summary

**Environments:**
- `staging`: For testing deployments
- `production`: For live deployments

## 🔐 Required Secrets

Set these in: `Settings` → `Secrets and variables` → `Actions`

### For CI/Build
```bash
BLOCKFROST_API_KEY=your_blockfrost_project_id
BLOCKFROST_NETWORK=mainnet  # or 'preview' for testnet
```

### For Deployment (Optional)
Choose based on your hosting provider:

**Vercel:**
```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

**Netlify:**
```bash
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id
```

## 🔧 Local Testing

Test CI checks locally before pushing:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build

# Validate CI setup
./scripts/validate-ci.sh
```

## 📊 Status Badges

Add to your README.md:

```markdown
![CI](https://github.com/your-org/govtwool/workflows/CI/badge.svg)
```

## 🐛 Troubleshooting

### Build Fails in CI

1. **Check logs**: Click on the failed workflow → failed job → failed step
2. **Reproduce locally**: Run `npm run build` locally
3. **Check environment**: Ensure required env vars are set in secrets
4. **Clear cache**: Sometimes Next.js cache causes issues (cache will auto-clear on dependency changes)

### Type Errors

1. **Run locally**: `npx tsc --noEmit`
2. **Check tsconfig.json**: Ensure paths and includes are correct
3. **Install dependencies**: Run `npm ci` to ensure lock file matches

### Linter Errors

1. **Auto-fix**: `npm run lint -- --fix` (fixes many issues automatically)
2. **Check rules**: Review `.eslintrc.json` or Next.js ESLint config
3. **Ignore if needed**: Add `// eslint-disable-next-line` for legitimate cases

### Slow CI Runs

1. **Cache hit**: Check if caches are being used (shown in workflow logs)
2. **Dependencies**: Large `node_modules` slow down installation
3. **Build time**: Next.js builds can take time; caching helps subsequent runs

## 🎯 Best Practices

### For Commits
- ✅ Keep commits focused and atomic
- ✅ Write descriptive commit messages
- ✅ Test locally before pushing
- ❌ Don't commit secrets or `.env` files
- ❌ Don't skip CI checks (use `[skip ci]` only when necessary)

### For PRs
- ✅ Ensure all CI checks pass before requesting review
- ✅ Address PR check warnings (console.log, TODO comments)
- ✅ Keep PRs focused and reviewable size
- ✅ Rebase on main before merging

### For Deployment
- ✅ Test in staging first
- ✅ Use version tags for production releases
- ✅ Monitor deployment logs
- ✅ Verify deployment after completion

## 📈 Metrics & Monitoring

### CI Metrics to Track
- **Build time**: Should stay under 5 minutes (cached)
- **Pass rate**: Aim for >95% pass rate
- **Cache hit rate**: Should be >80% after first run

### View Metrics
1. Go to `Actions` tab
2. Click on a workflow
3. View run time and cache statistics

## 🔄 Workflow Updates

To modify workflows:

1. **Edit workflow files** in `.github/workflows/`
2. **Test locally** using `./scripts/validate-ci.sh`
3. **Test in PR** - Create a PR to see if changes work
4. **Merge carefully** - Workflow changes affect all future runs

## 📚 Additional Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions for Node.js](https://docs.github.com/en/actions/guides/building-and-testing-nodejs)

## 🆘 Getting Help

If CI/CD issues persist:

1. Check workflow logs thoroughly
2. Search GitHub Actions issues
3. Ask in team chat/slack
4. Review this documentation

---

**Last Updated**: 2024-11-04  
**Maintained by**: DevOps Team
