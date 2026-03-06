---
description: Daily Inzan Athletics Development Routine
---

This is the standard daily workflow for the Inzan Athletics platform. It automates your morning environment checks and your evening code-quality wrap-up tasks. 

You can run this by asking me to "run the daily workflow".

### 🌅 Morning Kick-off
*Start the day by ensuring your codebase is healthy and error-free.*

// turbo
1. Check for any linting errors from previous sessions to ensure a clean slate.
```bash
npm run lint
```

// turbo
2. Verify TypeScript integrity.
```bash
npx tsc --noEmit
```

### 🌇 Evening Wrap-up
*Close out the day by cleaning up your code, formatting it, and preparing for a commit.*

// turbo
3. Format all source files to maintain a consistent code style across the project.
```bash
npx prettier --write "src/**/*.{ts,tsx,css}"
```

// turbo
4. Check Git status to review all the files you've changed today.
```bash
git status
```

### 📝 Final Manual Steps
5. **Commit your changes:** Review the `git status` output and commit your work with a clear message (e.g., `git commit -m "feat(coach): implement schedule view"`).
6. **Generate Next Steps:** Ask me to write a short summary of what we accomplished today, along with the very first technical step you should take tomorrow. Paste that into your notes.
