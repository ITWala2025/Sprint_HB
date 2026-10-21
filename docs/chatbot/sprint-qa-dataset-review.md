# SPRINT Q&A dataset review

`data/chatbot/sprint-qa-master.json` is the chatbot's single consolidated Q&A file.

## Coverage

The source datasets include questions about:

- SPRINT overview and location
- Course catalog coverage
- SPRINT RISE and the Career Accelerator
- Duration and learning format
- Eligibility and beginner guidance
- Contact and admissions information
- Educational technology topics and program selection
- Payments, registration, account support, events, privacy, and technical troubleshooting

## Consolidation and verification

- The consolidated master contains 1,099 unique FAQs and 9,027 alternative questions: 9 FAQs marked `verified` and 1,090 marked `needs_review`.
- Generated query variants are stored as alternative questions on their parent FAQs.
- The original merged source JSONL files were removed after consolidation; keep the master as the canonical Q&A file.
- The five-row evaluation set is not merged into chatbot knowledge.
- `needs_review` answers remain available in the master for review and traceability, but are never used as facts. If one of their questions matches, the chatbot avoids sending it to the model, says it cannot verify the details, and points visitors to admissions.
- The chatbot supplements the master with published facts loaded directly from `src/data/courses.js`, `src/data/programs.js`, `src/data/learningPaths.js`, and `src/config/site.config.json`; this allows it to answer current catalogue and contact questions even though only 9 master FAQ records are verified.
- Published office-hour details conflict between sources. The chatbot does not repeat either schedule as authoritative and asks visitors to confirm before visiting.

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

The master is broad, but only 9 unique FAQs are currently marked verified. Review the remaining records and verify them against current project data or an owner-confirmed source before changing their status. Do not invent fees, payment methods, policies, or outcomes.
