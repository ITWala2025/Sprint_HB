# SPRINT Q&A dataset review

The chatbot's editable Q&A source is split into topic files in `data/chatbot/`. `sprint-qa-master.json` is the consolidated compatibility/export copy; the chatbot imports the topic files directly through `src/app/chatbot/chatbot-qa-datasets.js`.

## Topic files

- `about_sprint_QA_dataset.json`
- `admission_QA_dataset.json`
- `career_QA_dataset.json`
- `courses_QA_dataset.json`
- `payment_QA_dataset.json`
- `partnerships_events_QA_dataset.json`
- `privacy_security_QA_dataset.json`
- `quality_assurance_QA_dataset.json`
- `registration_QA_dataset.json`
- `scholarship_QA_dataset.json`
- `sprint_dashboard_QA_dataset.json`
- `support_QA_dataset.json`

Each record retains its detailed `category` value, question alternatives, answer, and verification metadata. Use the topic filename for broad organization and the record's `category` for finer-grained topics.
The `_master_order` property is internal ordering metadata; keep it unchanged when editing existing records. New records can omit it and will be appended to the aggregate.

- The topic files contain 1,099 unique FAQs and 9,027 alternative questions: 9 FAQs marked `verified` and 1,090 marked `needs_review`.
- Generated query variants are stored as alternative questions on their parent FAQs.
- Edit the relevant topic file, then run `npm run chatbot:qa:build` to regenerate the aggregate master. The script validates required fields and unique record IDs and preserves existing master ordering.
- The five-row evaluation set is not merged into chatbot knowledge.
- `needs_review` answers remain available for review and traceability, but are never used as facts. If one of their questions matches, the chatbot avoids sending it to the model, says it cannot verify the details, and points visitors to admissions.
- The chatbot supplements Q&A records with published facts from `src/data/courses.js`, `src/data/programs.js`, `src/data/learningPaths.js`, and `src/config/site.config.json`.
- Published office-hour details conflict between sources. The chatbot does not repeat either schedule as authoritative and asks visitors to confirm before visiting.

## Source files used

- `src/app/chatbot/chatbot-service.server.js`
- `src/app/chatbot/chatbot-qa-datasets.js`
- `src/data/programs.js`
- `src/data/courses.js`
- `src/data/learningPaths.js`
- `src/config/site.config.json`
- `docs/md/README.md`
- `src/app/about/page.jsx`

## Verification rules

- Do not invent facts or claim detailed pricing without a verified source.
- Prefer specific program details already represented in the codebase.
- Keep unknown or unverified answers explicit and ask the student to contact admissions.

## Review notes

The Q&A files are broad, but only 9 unique FAQs are currently marked verified. Review the remaining records against current project data or an owner-confirmed source before changing their status. Do not invent fees, payment methods, policies, or outcomes.
