# Room 115 — AI Basics Passport

A guided ELA AI-literacy badge pathway for Nantucket High School. Static HTML/CSS/JavaScript, no app backend or login.

## Current student experience

**The first/default page is Learning Path, not Resources.** A five-step guided sequence shows ONE current checkpoint and unlocks the next after the student completes the practice question and checks two honest progress statements:

1. Meet AI — Khan Academy *What Is AI?*, optional AI Chatbots video, begin two-column notes.
2. Ask Better Questions — Code.org Humanities Writing Process Level 1 *Crafting Prompts*, add to notes.
3. Question AI and Finish Your Notes — Code.org Humanities Research Process Level 1 *Verifying Quotes*, complete/photograph original handwritten two-column notes.
4. Make Your Own Flashcards — students make original vocabulary flashcards from the teacher's 13-level guide.
5. Your Choice and Test Readiness — students create a third, different study tool, review vocabulary and request the teacher's actual test.

Each checkpoint is roughly **20 minutes inside a 57-minute Studio block**. The first two teach introductory concepts; the final three correspond to the EXISTING three badge-study products, not three extra tasks.

Every checkpoint contains an external resource with a precise instruction, matching teacher-guide level numbers, a two-column note or study-product model (NOT prefilled notes), one original feedback question, an accessible fallback for blocked sites, and a gated completion button. Students can revisit completed checkpoints. The existing Resources tab is a reference library, not their course sequence.

**Official study guide:** https://docs.google.com/document/d/1Kp1XnWhoVCiMLsB7iBQgi8D_zyCHysvX9W6grH-cOEE/edit

## GitHub → Vercel

This project is already in its OWN GitHub repository. It must remain independent from the Lesson Board and Entry Challenge projects.

- Framework Preset: **Other**
- Root Directory: repository root
- Build Command: none
- Output Directory: repository root

Vercel deploys from `main` when the GitHub link and access permissions are active. Preview and production must be independently verified before distributing to students.

## Videos

The website expects these two optional local video assets:

- `videos/ai-01-intro-to-ai.mp4`
- `videos/ai-02-machine-learning.mp4`

**Important:** MP4 binaries are NOT YET committed to this GitHub repository. Upload both originals into `videos/` to enable their embedded players. These videos are supplementary; Khan Academy and Code.org links in the guided pathway work without them. Do not assume the 1080p Google Drive copies have been automatically synced into GitHub.

## What is NOT changed

- The existing 25-question badge assessment is NOT reproduced or modified.
- At least 18/25 correct to pass; teacher's existing retake/correction policies apply.
- Three required student-created study artifacts, emailed test request saved as PDF, original/draft/AI-polished reflection, and teacher approval remain in the official tracker.
- Progress is recorded only via browser localStorage on the student's device; checkmarks do not submit photos, send emails, or log grades.
- Neither a new Code.org certificate nor a new quiz is required.

## Manual QA checklist

- Open the site in an incognito browser, confirm **Learning Path** opens to Checkpoint 1.
- Confirm Khan video/transcript page and Code.org humanities levels open on a school Chromebook.
- Verify no next checkpoint can be selected before completing the current one.
- Answer the embedded practice question, tick both progress checks; verify the next checkpoint unlocks.
- Verify progress persists after refresh on the SAME device and can be cleared under Teacher Notes.
- Verify the blank two-column notes/flashcard print buttons and that no model supplies a completed student study guide.
- Verify the MP4s are present before distributing the Resources video players.
