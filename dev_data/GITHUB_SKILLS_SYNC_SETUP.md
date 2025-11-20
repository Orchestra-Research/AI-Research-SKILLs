# GitHub Skills Auto-Sync Setup Guide

This guide explains how to set up automatic syncing from the `AI-research-SKILLs` repository to Orchestra's skill marketplace.

---

## Overview

When skills are committed to the `AI-research-SKILLs` repo, they automatically sync to Orchestra and appear in the marketplace.

**Flow:**
1. Developer commits to `AI-research-SKILLs` repo (GitHub)
2. GitHub Actions detects changed skill folders
3. For each changed skill, creates ZIP and uploads to Orchestra API
4. Orchestra stores ZIP in Supabase Storage + creates database record
5. Skill appears in marketplace at `https://orchestra.com/research-skills`

---

## Part 1: Orchestra Setup (Backend)

### 1.1 Generate Admin API Key

Generate a secure random key for GitHub Actions authentication:

```bash
# Generate a secure 64-character API key
openssl rand -hex 32
```

Copy the output (e.g., `a1b2c3d4e5f6...`)

### 1.2 Add API Key to Environment Variables

Add to `.env.local`:

```bash
GITHUB_SYNC_API_KEY=<paste-the-key-from-above>
```

**⚠️ IMPORTANT:** Never commit this key to git. It's already in `.gitignore`.

### 1.3 Restart Orchestra Dev Server

```bash
# Kill existing server
# Restart
pnpm dev
```

### 1.4 Verify API Endpoint

The endpoint is already created at:
- **File:** `app/api/admin/sync-github-skill/route.ts`
- **URL:** `https://your-orchestra-domain.com/api/admin/sync-github-skill`

For local testing: `http://localhost:3000/api/admin/sync-github-skill`

---

## Part 2: GitHub Repository Setup (AI-research-SKILLs)

### 2.1 Copy GitHub Actions Workflow

1. In the `AI-research-SKILLs` repository, create directory structure:

```bash
mkdir -p .github/workflows
```

2. Copy the workflow file from Orchestra repo:

**Source:** `agent-board/.github-actions-template/sync-skills.yml`

**Destination:** `AI-research-SKILLs/.github/workflows/sync-skills.yml`

```bash
# If you have both repos locally:
cp /path/to/agent-board/.github-actions-template/sync-skills.yml \
   /path/to/AI-research-SKILLs/.github/workflows/sync-skills.yml
```

Or manually create `.github/workflows/sync-skills.yml` and paste the content.

### 2.2 Configure GitHub Secrets

1. Go to your `AI-research-SKILLs` repository on GitHub
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

Add these two secrets:

#### Secret 1: ORCHESTRA_API_URL
- **Name:** `ORCHESTRA_API_URL`
- **Value:** `https://your-orchestra-domain.com` (or `http://localhost:3000` for testing)
- Click **"Add secret"**

#### Secret 2: GITHUB_SYNC_API_KEY
- **Name:** `GITHUB_SYNC_API_KEY`
- **Value:** (paste the API key you generated in step 1.1)
- Click **"Add secret"**

### 2.3 Commit and Push Workflow

```bash
cd AI-research-SKILLs
git add .github/workflows/sync-skills.yml
git commit -m "Add Orchestra auto-sync workflow"
git push origin main
```

---

## Part 3: Testing the Sync

### 3.1 Manual Test (Recommended First)

Trigger the workflow manually to test:

1. Go to `AI-research-SKILLs` repo on GitHub
2. Click **Actions** tab
3. Select **"Sync Skills to Orchestra"** workflow
4. Click **"Run workflow"** dropdown
5. Click **"Run workflow"** button

Watch the logs to see if it succeeds.

### 3.2 Test with Real Commit

Make a small change to any skill:

```bash
cd AI-research-SKILLs

# Edit a skill
echo "\n<!-- Updated $(date) -->" >> 01-model-architecture/litgpt/SKILL.md

# Commit and push
git add .
git commit -m "test: trigger auto-sync"
git push origin main
```

### 3.3 Verify Sync Worked

1. **Check GitHub Actions:**
   - Go to **Actions** tab
   - Should see a new workflow run
   - Check logs for success messages

2. **Check Orchestra Marketplace:**
   - Go to `https://your-orchestra.com/research-skills`
   - Search for the skill you modified
   - Verify it appears with correct metadata

3. **Check Supabase Storage:**
   - Go to Supabase Dashboard → **Storage** → `research-skills`
   - Should see `orchestra/skill-name.zip` or `community/skill-name.zip`

---

## Part 4: How Author Detection Works

The workflow reads the `author:` field from SKILL.md frontmatter:

### Example 1: Official Orchestra Skill

```yaml
---
name: implementing-llms-litgpt
description: Implements LLMs using LitGPT
author: Orchestra Research  # ← Contains "Orchestra"
---
```

**Result:**
- Source: `orchestra` (Official badge)
- Storage path: `research-skills/orchestra/implementing-llms-litgpt.zip`

### Example 2: Community Skill

```yaml
---
name: custom-tokenizer
description: Custom tokenization skill
author: Jane Doe  # ← Does NOT contain "Orchestra"
---
```

**Result:**
- Source: `community` (Community badge)
- Storage path: `research-skills/community/custom-tokenizer.zip`

### Example 3: Missing Author (Defaults to Orchestra)

```yaml
---
name: some-skill
description: A skill without author
# No author field
---
```

**Result:**
- Defaults to `author: Orchestra Research`
- Source: `orchestra`

---

## Part 5: What Gets Synced

The workflow zips **ALL contents** of the skill directory:

```
01-model-architecture/litgpt/
├── SKILL.md           ✅ Included
├── references/        ✅ Included (all subdirs)
│   ├── architecture.md
│   └── training.md
├── scripts/           ✅ Included (if exists)
│   └── train.py
├── assets/            ✅ Included (if exists)
│   └── diagram.png
├── examples/          ✅ Included (if exists)
│   └── example.ipynb
└── .gitkeep           ❌ Excluded (hidden files)
```

**Excluded:**
- Hidden files (`.gitkeep`, `.DS_Store`)
- Files starting with `.`

---

## Part 6: Troubleshooting

### Issue: "Invalid API key" Error

**Cause:** API key mismatch between Orchestra and GitHub Secrets

**Fix:**
1. Regenerate API key: `openssl rand -hex 32`
2. Update Orchestra `.env.local`: `GITHUB_SYNC_API_KEY=<new-key>`
3. Update GitHub Secret `GITHUB_SYNC_API_KEY` with same key
4. Restart Orchestra dev server

### Issue: Workflow Not Triggering

**Cause:** Workflow file not in correct location

**Fix:**
1. Verify file is at: `AI-research-SKILLs/.github/workflows/sync-skills.yml`
2. Check GitHub Actions tab for errors
3. Ensure you committed and pushed the workflow file

### Issue: "No skill changes detected"

**Cause:** You didn't modify any files inside skill directories

**Fix:**
- The workflow only syncs changed skills
- Modify a file inside a skill directory (e.g., `01-model-architecture/litgpt/SKILL.md`)
- Or manually trigger the workflow (it will sync all skills)

### Issue: Skill Not Appearing in Marketplace

**Cause:** SKILL.md missing or malformed

**Fix:**
1. Verify `SKILL.md` exists in skill directory
2. Check YAML frontmatter is valid:
   ```yaml
   ---
   name: my-skill-name
   description: My skill description
   author: Orchestra Research
   version: 1.0.0
   tags: [AI, ML]
   ---
   ```
3. Check GitHub Actions logs for parsing errors

### Issue: Wrong Source (Orchestra vs Community)

**Cause:** Author field doesn't match expected format

**Fix:**
- For Official: `author: Orchestra Research` (or any text containing "Orchestra")
- For Community: `author: Jane Doe` (no "Orchestra" in name)

### Issue: Large Skills Failing to Upload

**Cause:** ZIP file too large for GitHub Actions

**Fix:**
- GitHub Actions has 2GB workspace limit
- If skill > 100MB, consider:
  1. Removing large binary files
  2. Using Git LFS for large files
  3. Splitting into multiple skills

---

## Part 7: Advanced Configuration

### Sync All Skills (Full Sync)

To sync all skills regardless of changes:

**Option 1: Manual Trigger**
- Go to Actions tab → Run workflow (syncs all skills on first run)

**Option 2: Modify Workflow**
```yaml
# In .github/workflows/sync-skills.yml
# Change the git diff command to include all directories
SKILL_DIRS=$(find . -type f -name "SKILL.md" -not -path "*/\.*" | xargs dirname | sort -u)
```

### Sync on Schedule (Daily/Weekly)

Add to workflow triggers:

```yaml
on:
  push:
    branches:
      - main
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight UTC
  workflow_dispatch:
```

### Sync Only Specific Categories

Filter by category prefix:

```yaml
# In workflow, add after CHANGED_FILES
SKILL_DIRS=$(echo "$CHANGED_FILES" | grep -E '^(01|02|03)-[^/]+/[^/]+/' | ...)
# Only syncs categories 01, 02, 03
```

---

## Part 8: Monitoring

### View Sync History

**GitHub Actions:**
- Repository → Actions tab → "Sync Skills to Orchestra"
- Shows all sync runs, logs, and errors

**Orchestra Logs:**
- Check server console for sync messages:
  ```
  ✅ GitHub sync: Created skill "implementing-llms-litgpt" (source: orchestra)
  ✅ GitHub sync: Updated skill "custom-tokenizer" (source: community)
  ```

**Supabase Database:**
- Table: `research_skills`
- Check `created_at` and `updated_at` timestamps
- Filter by `source = 'orchestra'` or `source = 'community'`

---

## Part 9: Security Best Practices

1. **Never commit API keys to git**
   - Always use GitHub Secrets
   - Rotate keys periodically

2. **Use production API URL in secrets**
   - Don't hardcode URLs in workflow
   - Allows easy switching between environments

3. **Review workflow logs**
   - Check for failed uploads
   - Monitor for unauthorized access attempts

4. **Limit API key scope**
   - Key only works for `/api/admin/sync-github-skill`
   - No other admin privileges

---

## Part 10: Quick Reference Commands

```bash
# Generate new API key
openssl rand -hex 32

# Test API endpoint locally (with curl)
curl -X POST http://localhost:3000/api/admin/sync-github-skill \
  -H "X-Admin-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"skillName":"test","skillPath":"test","author":"Orchestra Research","skillMdContent":"---\nname: test\n---","zipBase64":"UEsDBBQAAAAIAA..."}'

# Check GitHub Actions status
gh run list --repo zechenzhangAGI/AI-research-SKILLs --workflow="sync-skills.yml"

# View latest workflow run logs
gh run view --repo zechenzhangAGI/AI-research-SKILLs --log

# Manually trigger workflow
gh workflow run sync-skills.yml --repo zechenzhangAGI/AI-research-SKILLs
```

---

## Summary Checklist

### Orchestra (Backend)
- [ ] Generate API key (`openssl rand -hex 32`)
- [ ] Add `GITHUB_SYNC_API_KEY` to `.env.local`
- [ ] Restart dev server
- [ ] Verify endpoint exists at `/api/admin/sync-github-skill`

### AI-research-SKILLs (GitHub Repo)
- [ ] Create `.github/workflows/sync-skills.yml`
- [ ] Add GitHub Secret: `ORCHESTRA_API_URL`
- [ ] Add GitHub Secret: `GITHUB_SYNC_API_KEY`
- [ ] Commit and push workflow file
- [ ] Test with manual workflow run
- [ ] Test with real commit
- [ ] Verify skills appear in Orchestra marketplace

---

## Support

If you encounter issues:

1. Check GitHub Actions logs for errors
2. Check Orchestra server console for API errors
3. Verify API key matches in both places
4. Ensure SKILL.md has valid YAML frontmatter
5. Check Supabase Storage policies allow uploads

---

**Last Updated:** 2025-01-19
**Maintained By:** Orchestra Engineering Team
