# leadleboard: project and learning guide

## Project goal

Build a web app that tracks scores from popular daily games and maintains ongoing leaderboards among groups of friends.

Planned games:
- Wordle
- NYT Mini
- Connections
- Krillion

Planned capabilities:
- User accounts and authentication
- Friend groups and group memberships
- Manual score submissions
- Automated parsing of pasted game share results
- Daily and weekly group leaderboards

## Accepted product direction

Terminology updated October 31, 2026: **result** means the complete inputted play/submission; **score** means only its standardized numeric value. Use `Result<TResult>`, result components/data, for records; the former `/my-results` route is currently removed pending a user-led rebuild. Keep numeric `score` and `standardScore` names.

Clarified by the user on October 30, 2026; this is planned behavior, not a claim of completed implementation.

- The homepage directly mounts one `ResultForm` containing player name and a multiline pasted game-result field. The user restored the name input and requested no extra `GameScoreForm` wrapper. Names are temporary display text, not authenticated identity. The eventual form should accept all supported games.
- A parsing layer identifies the game, delegates to its parser, and produces a structured score record for storage. Only games with implemented parsing support are accepted.
- Each game has its own class responsible for its custom standardized-score calculation. The original planned scale was 1–100; Wordle now uses an agreed 0–100 exception. Keep game-specific interpretation and scoring separate from the reusable form and leaderboard presentation.
- The homepage also contains a player leaderboard derived from players' score records across supported games. The formula for combining records is still undecided.
- The chronological submission list and the player leaderboard are separate concepts. Removing ranks from submission cards did not remove the planned player leaderboard.
- Wordle scoring is agreed and implemented: solved results score 100/90/80/70/60/50 for one through six guesses; unsuccessful `X/6` results earn 10 points per green tile in the final row. A valid failed row has at most four greens (0–40 actual points); five greens are a win. Wordle uses 0–100, an exception to the original 1–100 plan.
- Storage backend, other-game scoring formulas and failure handling, weighting, time windows, and aggregation remain to be implemented or decided. Do not invent these rules or complete the architecture automatically.

### Planned form workflow

Recorded from the user's workflow discussion on October 30, 2026. This describes the intended next behavior; the current form still previews only after its button is clicked and does not save.

1. The user enters a player name and pastes a game share result into the multiline text field.
2. Changes to the result text trigger local game detection and validation. Each supported game's class interprets its own format.
3. As soon as the input is valid, show the appropriate game-specific card inside the shared `ResultCard` shell for review. Editing the result updates or removes the preview so it reflects the current input.
4. Enable Submit when the player name and result are valid. Submit means save the previewed result, rather than first generating its preview.
5. Send the submission to the server, validate it there, and save the score record. Show confirmation only after a successful save. On failure, preserve the input and preview for retry.
6. Later, authentication supplies a stable player ID rather than trusting an entered display name as identity.

### Input and storage reasoning

- Accept valid content whether pasted, typed, or corrected. Do not impose a paste-only restriction: it does not prove authenticity and would interfere with corrections and assistive input.
- Immediate local parsing is the proposed implementation approach. A full paste normally produces one change event, and the supported share texts are small. No debounce is currently needed; revisit only if parsing becomes expensive.
- Derive the preview from current input rather than storing a separate submitted-input snapshot. This local preview behavior is now implemented; saving remains unconnected.
- Avoid showing errors on every incomplete edit; show a preview once valid. Exact invalid-input messaging remains a UI detail to refine.
- Parsing during edits must not save or issue server requests. Reserve server submission for Submit.
- Game classes own recognition, parsing/validation, formatting, and game-specific standardized scoring. They produce plain typed data; database records are not class instances and do not store methods.
- Use `Result<TResult>` for shared submission fields plus a typed game-specific `result` such as `WordleResult`. The current record fields are id, playerId, gameName, datePlayed, submitTime, score, and result. The React-free `lib/games/generateResult.ts` helper creates complete records only on the server. Submit sends only playerName, gameName, and the structured result to `POST /api/results`; the server validates nested game data and creates calculated fields, then the form saves the returned record to browser localStorage, not a shared backend. Authentication/account linkage, database schema, and other-game standardized scoring formulas remain unresolved; Wordle puzzle-date calculation exists.
- The server must validate submitted values and calculate trusted game-specific values before storage. Client-side parsing is for feedback and does not establish trust.

## Primary objective: learn full-stack development

The user wants to learn how and why the application works, not have an AI generate the entire application. Act as a coding mentor.

- Break work into small, manageable milestones and exercises.
- Explain concepts before introducing them.
- Make each small implementation step directly in the project files, then explain how and why it works. Leave room for user exercises when requested.
- Review their actual code, explain issues, and guide revisions.
- Keep implementation changes focused on the current learning step rather than completing whole milestones at once.
- Do not autonomously scaffold or build the application simply because a roadmap exists.
- Administrative documentation, such as this file, may be written when requested.
- Adapt instruction to the user's demonstrated experience. Their JavaScript and HTML/CSS experience has not yet been established.
- Preferred component style: define React components with typed arrow-function declarations, such as `const Component = () => { ... }`, and place `export default Component;` separately when a default export is needed. Use this style for new components unless the user changes the preference.
- Code guidance preference (updated by the user): directly write code in project files for each small development step, while retaining explanations of the concepts and changes. This authorizes incremental implementation, not autonomous completion of the roadmap.
- Explanation level: explain JavaScript and related concepts as if the user is new to JavaScript but already comfortable with general programming ideas. Define JavaScript-specific syntax and vocabulary, connect it to familiar programming concepts, and avoid assuming prior JavaScript knowledge.

Suggested learning loop: explain a concept → implement a small step in the files → walk through the change → discuss the user's understanding → choose the next small step. Use user-led exercises when requested.

## Standing project preference: verification on request

To save tokens, do not proactively verify work unless the user asks. This applies across future sessions.

- Do not automatically run tests, lint, type checks, builds, browser checks, or post-change inspection commands.
- Do not start separate verification or audit tasks through sub-agents.
- Read files as needed to understand the user's question or make an authorized change, but avoid extra reads solely to confirm the result.
- When reporting work, distinguish changes made from checks actually run. Do not claim unperformed verification succeeded.
- Keep explanations and progress updates focused; do not add verification work just to fill a checklist.
- If a higher-priority instruction requires a specific check, perform only that required check.

## Standing project instruction: note-taking sub-agent

The user explicitly requests a dedicated note-taking sub-agent throughout this project. This instruction applies to future development sessions as well as the current chat.

- At the start of each development session, spawn a note-taking sub-agent, or reuse the existing one in that session. Give it this guide and relevant session context. If sub-agents are unavailable, maintain the same notes directly and briefly disclose the fallback.
- Keep the main agent focused on mentoring and review. The note-taker documents learning; it does not implement application features or complete the user's exercises.
- Store durable notes in `docs/learning-notes.md`, creating the file when there is substantive learning to record. Organize it by topic with a linked table of contents as it grows.
- Send the note-taker concise updates after meaningful exercises, debugging discoveries, and design discussions. Include the actual reasoning and outcomes; do not assume it sees subsequent conversation automatically.
- Have it update notes at meaningful checkpoints and before ending a development session. Review its changes for accuracy and duplication. Avoid multiple agents editing the same notes simultaneously.
- Read the existing notes when resuming work. Persist context in files rather than relying on a sub-agent remaining alive between sessions.

Prioritize these contents:

1. **Recurring commands:** exact command, where to run it, what it does, when to use it, and important flags. Distinguish commands actually run from suggested commands.
2. **Reusable patterns:** patterns encountered repeatedly, their purpose, and how to recognize when to apply them. Reference the user's implementation in the project rather than copying full code examples into the notes.
3. **Design reasoning:** the problem, chosen approach, reasons and tradeoffs, alternatives actually discussed, and conditions that might justify revisiting the decision. Clearly label proposals versus accepted decisions; never invent the user's reasoning.
4. **Debugging lessons:** symptom, cause, fix, and a reusable way to investigate similar problems.
5. **Learning progress:** concepts practiced, remaining questions, and the next small exercise. Record observed progress without assuming mastery.

For each substantive topic section, include a short **References** list with descriptive Markdown links to relevant documentation or tutorials. Prefer official primary documentation, verify that references support the topic, and explain briefly what each link helps with. Add references as topics arise rather than filling the notes with an unrelated reading list.

Keep useful detail in explanations, command guidance, debugging lessons, and design reasoning. Make the notes easy to skim with clear topic sections and consolidate repeated explanations. Do not transcribe the conversation or record every routine edit or intermediate attempt. The content categories above are priorities, not a checklist to fill for every exercise.

Instead of writing out full code examples, link to the actual implementation in the project and name the relevant component, function, type, or other symbol. Explain what the reader should look for and why it matters. Use paths relative to the notes file for durable Markdown links; add line numbers only where supported and helpful, since they can become stale. Verify references when writing or revisiting the topic and update them when code moves. Exact reusable shell commands may still be included directly in the notes. Keep external reference lists focused and relevant. No note update is needed when nothing meaningfully new was learned.

Record milestone status in this guide and selected learning takeaways in the notes. Never include credentials, tokens, or other secrets.

## Planned stack

- TypeScript
- React with Next.js App Router
- Tailwind CSS
- Supabase: PostgreSQL and authentication
- Vercel: deployment
- Git and GitHub: version control and deployment integration
- npm: package management

When scaffolding is requested, the proposed configuration is TypeScript, ESLint, Tailwind CSS, a `src/` directory, App Router, and the default `@/*` import alias. Initially leave React Compiler disabled if offered. Verify current setup instructions when needed; generator prompts and framework behavior can change.

Actual scaffold configuration: the user generated a root-level `app/` directory (no `src/`). `next.config.ts` has `cacheComponents` and `partialPrefetching` enabled. Use the actual project structure and preserve these settings unless a change is discussed; the earlier proposed configuration is not the installed configuration.

## Learning roadmap

Start with Wordle and expand after the core workflow is understood. These milestones are a learning sequence, not authorization to implement them automatically.

| Milestone | Deliverable | Concepts | Completion criterion |
| --- | --- | --- | --- |
| 1. Local setup | Customized homepage | Terminal, npm, project structure, development server, Git | User can run the app and explain their first edit |
| 2. Static scoreboard | Sample Wordle scores rendered from an array | Semantic HTML, CSS, TypeScript objects, React components and props | Sample scores render correctly |
| 3. Result entry | Automatic valid-result preview and explicit Submit, initially with temporary local records | State, derived data, events, forms, validation | Valid input previews before Submit; submitted records appear in result history |
| 4. First deployment | Public prototype | GitHub, build checks, Vercel deployment | App works at a public URL |
| 5. Backend basics | Result submission endpoint | HTTP, JSON, requests and responses, server validation | User can trace a submission from browser to server |
| 6. Persistent data | Results stored in Supabase | SQL, tables, keys, constraints, migrations | Results survive a reload |
| 7. Authentication | Sign-in and personal submissions | Sessions, authentication versus authorization, row-level security | Users can modify only their own scores |
| 8. Friend groups | Groups and memberships | Relational modeling, joins, permissions | Group data is accessible only to members |
| 9. Leaderboards | Homepage player standings from game-specific standardized scores (1–100), with daily/weekly group views | Normalization, aggregation, ranking, dates, time zones | Agreed formulas produce expected rankings from known records |
| 10. More games and parsing | Mini, Connections, Krillion, and pasted share results | Game-specific data models, parsing, meaningful automated tests | Supported formats parse and invalid input produces useful errors |
| 11. Release polish | Reliable deployed application | Error handling, accessibility, production configuration | Core flows work across users and devices |

## Product decisions to make together

Do not silently invent rules for these unresolved questions:
- What is a valid result for each game, including failures?
- How are guesses, elapsed time, and mistakes represented?
- What formula does each remaining game's class use to produce a standardized score? Wordle's accepted 0–100 rule is recorded above.
- How are a player's standardized results combined: averages, totals, best results, or another method? How are game participation, weighting, and time windows handled?
- How are ties and missing submissions handled?
- Which puzzle date and time zone define a day and a week?
- Duplicate submissions are disallowed for the same player/game/puzzle. The browser-local implementation checks `playerId`, `gameName`, and `datePlayed` before saving; Wordle's puzzle date identifies its puzzle. Temporary name-based identity and browser-local storage do not enforce this across devices or authenticated accounts. Whether results can be edited remains unresolved.
- How do users create or join groups?
- Which share formats are supported? Obtain actual examples before designing parsers, especially for Krillion.

Resolve decisions when they become relevant rather than overwhelming the user up front.

## Current state and next exercise

- Rename decision: the user requested exact lowercase **leadleboard** everywhere. GitHub repository rename and local `origin` update to `https://github.com/derpzk/leadleboard.git` succeeded. Package/lockfile root names, homepage heading, and metadata now use `leadleboard`. Vercel has not been renamed or inspected; local folder rename remains pending. Historical paths, commands, and backup filenames below retain their original spelling. No app checks were run for the rename.

Latest learning checkpoint: November 7, 2026. Tool-version observations below are historical.

- Project directory: `/Users/zachk/Desktop/leadleboard`.
- The Next.js starter has been scaffolded and moved from the temporary `battledle-starter/` folder into the project root. Existing documentation and `.nvmrc` were preserved, along with the generator's initial Git commit. Package and lockfile names were updated to `battledle`.
- Installed tools observed: Node.js 24.21.0, npm 11.19.0, Git 2.55.0, and the VS Code `code` command.
- These are observations, not pinned version requirements. Recheck when necessary.
- Local Git configuration points `origin` to `https://github.com/derpzk/leadleboard.git`; remote contents and the latest push have not been independently verified. No Supabase project or Vercel deployment has been verified.
- `/results` shows saved browser-local ResultCards in a responsive grid. Storage is plain `Result[]` under `leadleboard.results.v1`, with a validated fallback migration from the retained `battledle.results.v1` backup when the new key is absent, without raw share text/envelopes. Valid legacy envelopes migrate to records only after the whole collection validates. Optional `playerName` is an interim display snapshot, not authenticated identity. Saved cards render normalized result/date/score fields; explicit saved null/number scores are preserved. Submit uses a temporary local name-based ID. No backend/authentication/metrics or app checks are implied.
- The homepage directly shows `ResultForm` and the player leaderboard, without the submission table. A live Wordle preview derives from name/share input and appears beside the form on wider screens (stacked on mobile). Submit requires a nonempty trimmed name and valid result; the handler now saves a plain Result to browser localStorage and confirms success only after that write. Wordle score calculation exists; no server validation or authentication exists; this is browser-local saving only. No app checks were run.
- The homepage includes a separate player leaderboard prototype with name, points, and streak columns and selectable ordering. `samplePlayers` values and IDs are display fixtures, not derived metrics or authenticated users. Point aggregation, streak definition, and time windows remain undecided. No app checks were run for it.
- The user explicitly removed `/my-results`, `ResultBoard`, `ResultRow`, and `ResultTable`, plus the homepage history link, to reimplement them from scratch. Rebuilding is pending and is not authorization to restore those files automatically. `ResultForm`, shared/game-specific cards, `Leaderboard`, and result data/types remain. No app checks were run for removal.
- Milestone 1 (local setup and customized homepage) is complete: the user ran the development server, edited the homepage heading and tagline, learned the starter project structure, and reports that the project has been pushed to GitHub. The remote was not independently verified.
- Milestone 2 (static Wordle scoreboard) is in progress: typed result data, sample data, `ResultCard`, shared type/data modules, Tailwind styling, and generic board/form components are implemented. The user replaced visible guess ranking with submission-date ordering; newest-first is the current implementation assumption. Results carry separate puzzle dates and submission timestamps. The earlier ranking helper is no longer present in the current source. Form feedback parses solved Wordle results, but adding submissions is not implemented; final presentation and understanding remain to be confirmed.
- Milestone 3 (result entry) is complete based on the user's November 7 manual local-site report that the scoring/save workflow works. This is user-reported browser behavior, not automated verification.
- The user reports the site is deployed (November 7). Deployed form/save/reload behavior has not been independently confirmed. Milestone 5 has begun with `app/api/results/route.ts`: `POST /api/results` accepts only playerName/gameName/structured result as its required input, checks name/game fields, and delegates nested result validation to the React-free `validateGameResult` dispatcher and each game’s `validateResult`. It creates ID, temporary player ID, date, timestamp, and score with server-only `generateResult`, returning `saved: false` with the complete validated record. `ResultForm` posts those minimal fields without generating a record and saves the server response through the browser-local duplicate guard; pending fields/button are disabled. Wordle is the only registered game; the frontend card registry remains separate. The server does not persist, authenticate, or enforce duplicates. No app checks were run.
- Environment setup progress: `.nvmrc` pins Node.js 24.22.0 (npm 12.2.0 observed). The user's `~/.zshrc` now loads a project-based nvm auto-switch hook on shell startup and directory changes; switching to a temporary Node 20.17.0 fixture and back was verified. Existing terminals need `source ~/.zshrc` or a new terminal to load the hook. Missing versions prompt the user to run `nvm install` rather than downloading automatically. See `docs/learning-notes.md` for explanation.

The next session should resume with:
1. Continue Milestone 5 incrementally: trace the minimal structured submission, server validation/record creation, and browser-local save flow before adding shared persistence. The user reports deployment complete; deployed behavior remains unconfirmed. Browser-local saving exists; shared backend saving remains a later step.
2. Continue from abstract `Game<TResult>` and its stateless `WordleGame` subclass for behavior, plus plain `Result<TResult>` for individual submissions. Records have common player/game/date/message/standardized-score fields and a typed game-specific `result`; fixtures explicitly use `Result<Pick<WordleResult, "guesses">>`, not full parsed grids. The typed registry in `lib/games/registry.tsx` now dispatches identification and card rendering, with Wordle as its only registration. Keep `ResultForm` game-neutral and game classes independent of React. Extend registered games incrementally. Wordle scoring and solved/unsuccessful parsing are now implemented under the rule above; form-to-record integration and browser-local persistence exist. Authenticated user IDs and shared backend persistence remain unimplemented; the form now calls the supported-game validation endpoint, which creates the complete record before browser-local saving. No app checks were run for the scoring change. Later connect stored records to a separate player leaderboard. Preserve submission-date ordering in any submission list.
3. Continue through small exercises, marking milestones complete only when their completion criteria are satisfied.

Future sessions should inspect the actual files and user changes before deciding where to resume. Update progress here as milestones are completed or requirements change; do not mark suggested work as completed.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Local-folder rename completed November 7, 2026: the current project directory is `/Users/zachk/Desktop/leadleboard`. Earlier `battledle` paths describe historical commands and locations. Reopen this folder in VS Code and restart any development server after the move.
