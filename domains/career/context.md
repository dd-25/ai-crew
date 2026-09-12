# Career domain

Owner: `career-assistant`. Live pipeline: `../jopply` (separate repo, its own skills).

## What Dhruv is looking for

Fresher-level software roles, under 1 year of experience. Salary stated and at or above
15 LPA — unstated is a reject. Posted within the last 48 hours. Remote or India. Modern
stack preferred: MERN, Go, Python, Nest. Java is acceptable but Java-only legacy shops
score lower.

Not wanted, and previously leaked into the queue by weak filters: SDE 2, Software Engineer
II, senior, lead, staff, anything with 2+ years, and hardware or product-engineering roles
that use the word "engineer" without any software in them.

## Where things live in ../jopply

- `queue/jobs_to_apply.md` — the numbered checklist, warm jobs first. **Generated.** Never
  hand-edit; `rebuild_queue_md()` rewrites the whole file from the jsonl ledger.
- `queue/jobs_to_apply.jsonl` — the ledger that actually holds the jobs.
- `queue/people_to_contact.md` — engineers to connect with, never recruiters.
- `queue/people_with_emails.csv` — contacts where an email was found, with a remark.
- `queue/applications/<n>-<company>.md` — a built pack, ready to paste.
- `logs/applied.jsonl` — where a job goes when it is done. Moving it there and rebuilding
  is how a job leaves the queue.
- `profile.json` — identity, compensation, availability, and the answer bank. Gitignored.
- `docs/worklog.md` — **contains private notes that never go outward.** Gitignored.

## Standing constraints

Never submit a form. Never send an email. Never send a LinkedIn connection or message.
Never attach a session cookie to a LinkedIn guest request. Never invent a fact on a resume.

Dhruv has said he may grant submit authority later. He has not. Until he says the words,
every path ends with him clicking the button.

## Open questions for Dhruv

- Total experience on forms: `profile.json` says 6 months, the Policybazaar form got 1.
  Which is the answer?
- `willing_to_relocate: true` contradicts `target_arrangement: "remote-only"`.
- USD 45k and 22 LPA are stated as the same expectation. They are not.
- Google Forms resume upload is a Drive picker with no file input. Unsolved.
