Aspekte B1+ Interactive v1.4.0 — Expanded Vocabulary
====================================================

This is the consolidated standalone Aspekte B1+ study app. It keeps the same
independent B1 progress storage used by earlier Aspekte B1 builds, so an update
does not require resetting existing progress.

Interactive study flow
----------------------
- One exercise at a time with a scrollable exercise list.
- Original exercise/source crop plus Full page view.
- Previous / Next navigation with synchronized active highlighting.
- Answer workbench, save/check behavior and official supplied solutions where available.
- Global floating German-letter keyboard: ä ö ü ß, usable in text fields.
- Full-width, resizable writing and speaking work areas.
- Desktop sidebar collapse plus mobile navigation behavior.

Home, streak and contribution
-----------------------------
- Home dashboard with real completion statistics and an adaptive next-activity plan.
- 364-day contribution heatmap.
- Eight contribution areas: Practice, Reading, Listening, Vocabulary, Word Test,
  Grammar, Writing and Speaking.
- Each area contributes at most one heat level per day.
- Current streak remains visually pending/dim until today's activity is recorded.

Vocabulary Bank
---------------
- 1,552 translated study items in total.
- 792 cleaned official Kapitelwortschatz items.
- 760 Book/material Discovery items from Lehrbuch/Arbeitsbuch and curated Redemittel coverage.
- v1.4 adds 150 curated gaps after a full-material audit: 106 lexical words and 44 Redemittel/phrases.
- German / English / Arabic search.
- First-appearance ordering across Lehrbuch and Arbeitsbuch.
- Words and Phrases/Sentences views.
- Chapter, origin, test-inclusion and learning-state filters.
- Learning states: New, Seen, Confirmed, Strong, Mastered and Needs review.
- Add a missing word manually and edit its meaning.
- Book Discovery items can be added to or excluded from testing.
- Official/basic words can also be excluded from Vocabulary Testing and restored later.
- Again / Hard / Good scheduled review.

Vocabulary Testing
------------------
- Words and Phrases/Sentences as separate pools.
- Modes: Full recall (default), Mixed, Missing letters, Sentence gap and Article test.
- Sources: Seen during study, Seen but not learned, Learned, or all included items.
- Origin and chapter filters.
- Missing-letter mode fills letters directly inside the word.
- I don't know, feedback, change mode and End test controls.
- Continuous cycling through the eligible pool.
- Only correct Full recall confirms an item as learned.
- Excluded words never enter a test.

Grammar and final assessment
----------------------------
- Grammar Reference for all 10 chapters.
- B1 Final Check: 22 pages total:
  * 10 grammar pages (30 objective points)
  * 10 vocabulary pages (20 objective points)
  * Writing task
  * Speaking task
- Objective total: 50 points, with page-by-page checking and Previous / Next navigation.
- Writing and Speaking are saved for self-review.
- The uploaded Aspekte package does not contain a separate official Goethe B1 final-exam
  document. The B1 Final Check is therefore app-created from supplied course content and
  is clearly labelled as such.

Course content and references
-----------------------------
- 10 chapters and 826 segmented exercise cards.
- 300 integrated source pages: 160 Lehrbuch + 140 Arbeitsbuch study pages.
- 199 official Lehrbuch solution blocks from the supplied Lösungsheft.
- 166 interactive Selbsteinschätzung items.
- Search across OCR text of Lehrbuch and Arbeitsbuch.
- Reference Library: Redemittel, Lehrbuch solutions, Lehrbuch transcript and DVD transcript.
- Audio Library: supplied Lehrbuch Audio-CD 1 Tracks 01–36 plus 7 supplied Arbeitsbuch audio files.
  No Audio-CD 2 was present in the uploaded package, so no false links are created.

Progress, backup and sync
-------------------------
- Local progress key remains: aspekte-b1-study-v1.
- Existing Aspekte B1 progress remains compatible.
- Progress page includes chapter progress, contribution heatmap, vocabulary states
  and B1 Final Check status.
- JSON export/import and B1-only reset.
- Optional private Google Drive sync using the included Aspekte_B1_Cloud_Backend_Code.gs.

Running
-------
Open index.html for ordinary local use. For service-worker/PWA installation and full
browser security features, serve the folder over localhost/HTTPS or publish it to a
static HTTPS host.

Cloud setup
-----------
See CLOUD_SYNC_SETUP.txt and Aspekte_B1_Cloud_Backend_Code.gs. Keep your sync key private.
