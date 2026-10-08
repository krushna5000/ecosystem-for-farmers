# FramsEasy

# Feature-Wise Code Push Guide

To maintain a clean and organized workflow, **no one should push code directly to the `main` branch**.  
Instead, follow this feature-wise branch system 

---

## 1) Get the latest code

Before starting any work, make sure your local code is up to date:

```bash
git checkout main
git pull origin main
```
---

## 2) Create a new branch for your feature

Create a branch specifically for your feature or fix:

```bash
git checkout -b feature/<your-feature-name>
```

### Example

```
feature/login-page
feature/careers-ui
fix/navbar-bug
update/readme
```

**Note:**
- Use lowercase letters and hyphens (-) instead of spaces.
- Branch names should clearly describe the task.

## 3) Do your changes

Make your code updates, add new files, etc...

## 4) Stage and Commit your changes

Once done with your updates:

```bash
git add .
git commit -m "your message"
```

`Use meaningful commit messages that describe your work.`

## 5) Push your feature branch

Push your branch to the remote repository:

```bash
git push origin feature/<your-feature-name>
```

## 6) Create a Pull Request (PR)

1. Go to the GitHub repo page.
2. Click “Compare & pull request”.
3. Make sure:
   - Base branch: main
   - Compare branch: feature/<your-feature-name>.
4. Add a clear title and description of your changes.
5. Click “Create pull request”.
