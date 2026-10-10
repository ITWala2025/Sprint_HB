# SPRINT Q&A dataset review

The verified Q&A dataset is a source-traceable baseline for the chatbot. Each question includes a concrete source file and a verification status so the model can answer from project-backed content rather than generic assumptions.

## Coverage

The dataset includes questions about:

- SPRINT overview and location
- Course catalog coverage
- SPRINT RISE and the Career Accelerator
- Duration and learning format
- Eligibility and beginner guidance
- Contact and admissions information
- Educational technology topics and program selection

## Source files used

- `src/data/programs.js`
- `src/data/courses.js`
- `docs/md/README.md`
- `src/app/about/page.jsx`
- `src/config/site.config.json`

## Verification rules

- Do not invent facts or claim detailed pricing without a verified source.
- Prefer specific program details already represented in the codebase.
- Keep unknown or unverified answers explicit and ask the student to contact admissions.

## Review notes

This is a living dataset. New source-backed facts should be added only after corroboration across the project’s docs or data files.
