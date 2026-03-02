# Oracle Learn Website

A fully responsive, static Oracle Database learning platform focused on beginner-to-advanced DBA and security-aligned learning.

## Highlights

- Hybrid multi-page static website (GitHub Pages friendly)
- Professional cyber-dark UI with terminal-style components
- Interactive Oracle architecture diagram with animated process/data flow paths
- Animated Oracle data flow model (SELECT / INSERT / UPDATE / DELETE / MERGE / COMMIT / ROLLBACK / DDL)
- DBA Command Center with search, level filters, category filters, and copy actions
- Day-in-the-life Oracle DBA workflows and step-by-step task guides
- 6-week beginner learning roadmap
- Practical labs, flashcards, and 30-question interview quiz
- Oracle Security and hardening section
- Static troubleshooting blog with tag filter + search
- 3 downloadable watermarked study-note PDFs
- Linux-for-DBA command set for real-time production operations
- Dedicated `resources.html` page with official Oracle and trusted learning links

## Project Structure

- `index.html`
- `modules.html`
- `architecture.html`
- `dataflow.html`
- `commands.html`
- `dba-life.html`
- `roadmap.html`
- `labs.html`
- `security.html`
- `blog.html`
- `resources.html`
- `404.html`
- `assets/css/`
- `assets/js/data/`
- `assets/js/features/`
- `assets/img/`
- `assets/pdf/`

## Run Locally

Since this is a static site, you can run any local static server from project root.

Example with Python (if available):

```bash
python3 -m http.server 5500
```

Then open `http://localhost:5500`.

## Deploy to GitHub Pages (Root Publish)

1. Push this repository to GitHub.
2. Go to `Settings` -> `Pages`.
3. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main` (or your default branch)
   - Folder: `/ (root)`
4. Save and wait for deployment.
5. Open the generated Pages URL.

## Content Volumes Included

- Module lessons: `24`
- Command entries: `100`
- Architecture nodes: `34`
- Real DBA tasks: `7`
- Lab items: `24`
- Flashcards: `40`
- Quiz questions: `30`
- Blog posts: `6`
- Watermarked notes: `3` PDF files
# oracle_learn
