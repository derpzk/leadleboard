# Battledle learning notes

These notes record useful explanations and verified outcomes, not a transcript. **Current terminology:** a result is the complete inputted play/submission; a score is only its numeric standardized value. The user renamed components, data, types, and personal-history routes accordingly on October 31. `Result<TResult>` still has numeric `score` and nested parsed `result` fields. The rename itself did not add behavior or saving; later live-preview work is described below. No app checks were run. Suggested commands are distinguished from commands already run. See [the project guide](../AGENTS.md) for the roadmap and mentoring approach.

## Contents

- [Node.js, npm, and project versions](#nodejs-npm-and-project-versions)
- [Automatic version switching in the terminal](#automatic-version-switching-in-the-terminal)
- [Dependency updates and compatibility](#dependency-updates-and-compatibility)
- [Next.js starter and project files](#nextjs-starter-and-project-files)
- [React components, typed props, and JSX](#react-components-typed-props-and-jsx)
- [Static scores, shared files, and submission order](#static-scores-shared-files-and-submission-order)
- [Local state and click events](#local-state-and-click-events)
- [Parsing and validating a Wordle share result](#parsing-and-validating-a-wordle-share-result)
- [Product direction: shared input and player leaderboard](#product-direction-shared-input-and-player-leaderboard)
- [Sortable player leaderboard prototype](#sortable-player-leaderboard-prototype)
- [Personal score history and file-based routing](#personal-score-history-and-file-based-routing)
- [Browser-local saved results and card grid](#browser-local-saved-results-and-card-grid)
- [Tailwind styling and alignment](#tailwind-styling-and-alignment)
- [Git and GitHub workflow](#git-and-github-workflow)
- [Progress and next exercise](#progress-and-next-exercise)

## Node.js, npm, and project versions

These similarly named tools have separate jobs:

- **Node.js is the runtime:** it executes JavaScript outside a web browser. Next.js development tools and server code will run using Node; browser-side code runs in the browser.
- **npm is the package manager:** a package is reusable software, and a dependency is a package a project relies on. npm downloads and manages dependencies such as React and Next.js. It also runs named project scripts: `npm run dev` runs the `dev` entry in [package.json](../package.json).
- **nvm is the version manager:** it installs and selects separate Node installations, each with its own npm and global tools. It helps a school project and a personal project use different Node versions without repeatedly uninstalling and reinstalling Node. It does not manage either project's React or Next.js dependencies.
- **npx runs a package's command:** it comes with npm and can fetch a tool into npm's cache when needed. The setup command was `npx create-next-app@latest battledle-starter --use-npm --no-agents-md`. It runs the Next.js project generator without requiring a global installation. `@latest` requests the package's latest release; `battledle-starter` names a child directory; the flags choose npm and suppress a generated `AGENTS.md`. The user confirmed the generator finished; the generated files were subsequently moved to the project root.

The setup sequence connects the tools: nvm selects Node and its npm; npx runs the project generator; npm then manages the generated project's dependencies and scripts. Refer to [package.json](../package.json) for the actual dependency and script definitions rather than memorizing them.

**Installed versus active:** a version can exist on the computer without being selected in a particular terminal. Each shell has its own environment. Switching Node in one terminal does not automatically change another terminal that is already open.

**Project decision:** [`.nvmrc`](../.nvmrc) pins Battledle to Node **24.22.0**. Naming the version in the project makes its expected runtime explicit and repeatable. That installed Node version currently has npm **12.2.0**. The existing Node **20.17.0** installation can support school projects when it matches their requirements; do not infer a class requirement from its presence.

**npm scope:** npm and packages installed with `npm install -g` belong to the selected Node installation under nvm. Projects selecting the same Node version share that installation's global packages. `.nvmrc` selects Node; it does not independently pin npm. Ordinary project dependencies are tracked in the project's package files and installed locally.

| Command | Where and when to use it | Status |
| --- | --- | --- |
| `pwd` | Any terminal; print the working directory before running project commands. | Suggested user check; user execution not confirmed. |
| `node --version` and `npm --version` | Any terminal; inspect that shell's active tools. | Verified in fresh-shell checks: Node 24.22.0 and npm 12.2.0. |
| `nvm use` | Inside Battledle; select the version recorded in `.nvmrc`. | Available manual alternative to the automatic hook. |
| `nvm use 24.22.0` | Any nvm-enabled shell; explicitly select Battledle's installed version. | Suggested command; installation already exists. |
| `nvm install` | Inside a project with `.nvmrc`; install/select its requested Node version if needed. | Suggested recovery if the requested version is missing. |
| `nvm exec 24.22.0 npm --version` | Run one command with a specified installed Node version. | Run during inspection; returned 12.2.0. |

For a future installation choice, `nvm install --lts` selects the latest LTS release, while `nvm install node` selects the latest release, which may be Current. LTS was recommended for this learning project. Neither command is needed to obtain the already-installed 24.22.0 version.

**References**

- [About npm](https://docs.npmjs.com/about-npm/) — introduces packages, the npm command-line tool, and the registry where packages are published.
- [npx command reference](https://docs.npmjs.com/cli/v11/commands/npx/) — explains running package commands and fetching missing tools into npm's cache.
- [nvm usage and `.nvmrc`](https://github.com/nvm-sh/nvm#nvmrc) — project version files and how nvm uses them.
- [Node.js release history](https://nodejs.org/en/about/previous-releases) — explains release lines and LTS status when choosing a runtime.

## Automatic version switching in the terminal

**Chosen approach:** a `load-nvmrc` function in `/Users/zachk/.zshrc` runs at shell startup and through zsh's `chpwd` hook when the working directory changes. The project version stays in [`.nvmrc`](../.nvmrc); the shell integration lives in the user's shell configuration because it must work across school and personal projects.

The hook finds `.nvmrc` in the current directory or its parents, so moving into a project subfolder still uses the project's version. It selects an installed version. If the version is missing, it asks the user to run `nvm install` rather than downloading automatically. Leaving a directory tree governed by `.nvmrc` restores nvm's default version.

The shell configuration was backed up before editing at `/Users/zachk/.zshrc.battledle-backup-20261015-220336-040377`. Look for `load-nvmrc` and its hook registration in `/Users/zachk/.zshrc` to inspect the implementation; the integration was added before the SDKMAN end block.

**Verification completed:** `zsh -n ~/.zshrc` passed the syntax check. A fresh interactive zsh selected Node 24.22.0/npm 12.2.0 in Battledle. Changing to a temporary school fixture selected Node 20.17.0; returning to Battledle restored 24.22.0/npm 12.2.0. These checks verify the integration, not the state of an already-open VS Code terminal.

**Next user action:** run `source ~/.zshrc` in an existing VS Code zsh terminal to reload the configuration, or open a fresh terminal. Then check `node --version` and `npm --version`. If versions are unexpected, first inspect `pwd`, the nearest `.nvmrc`, and whether this shell has loaded nvm; an installed version alone does not prove it is active.

**References**

- [nvm deeper shell integration](https://github.com/nvm-sh/nvm#deeper-shell-integration) — explains the zsh directory-change integration and its relationship to `.nvmrc`.
- [nvm `.nvmrc` lookup](https://github.com/nvm-sh/nvm#nvmrc) — explains how project version files are located and used by nvm commands.

## Dependency updates and compatibility

**Maintenance checkpoint:** the user requested the latest possible dependencies. Registry inspection and installs updated [package.json](../package.json) and [package-lock.json](../package-lock.json). Reported resolved versions include Next.js 16.4.3, React/React DOM 19.3.1, ESLint 9.39.5, and TypeScript 6.0.3. Node type definitions stay on major 24 to match [`.nvmrc`](../.nvmrc), rather than tracking a newer Node major.

The latest ESLint/TypeScript combination produced peer-dependency warnings: the installed `eslint-plugin-import` and `eslint-plugin-jsx-a11y` declare support through ESLint 9, and the installed TypeScript ESLint tooling declares TypeScript support below 6.1. The chosen compromise kept ESLint on major 9 and TypeScript on 6.0. npm also warned that ESLint 9 is deprecated/unsupported; this compatibility compromise may need revisiting when the Next.js lint-tooling dependency chain supports newer versions. Registry metadata and install success do not establish that application checks pass.

| Command run | Where and purpose |
| --- | --- |
| `npm outdated` | Project root; compare installed, wanted, and latest registry versions. Its initial sandboxed attempt hit a DNS failure; an elevated retry succeeded. |
| `npm install next@latest react@latest react-dom@latest` | Project root; update runtime dependencies to the latest registry releases and refresh the lockfile. |
| `npm install --save-dev eslint@9 typescript@6.0` | Project root; select the compatible lint/type-tooling lines after peer warnings. |

`npm view` was also used to inspect package `peerDependencies` and `engines` metadata before choosing versions. Peer dependencies describe expected companion packages; engines describe supported runtime/tool versions. The remaining development dependencies were updated, with the Node-types exception above. npm's automatic install audit reported zero vulnerabilities. The `unrs-resolver` postinstall script remained blocked. No lint, type, build, or browser checks were run for these updates.

**Post-upgrade debugging:** localhost returned an internal server error while the pre-upgrade development server was still running. Its log showed React 19.3.0 in memory alongside installed React DOM 19.3.1, plus `routeModule.ensureInstrumentation` not being a function after the Next.js update. The running process had old framework code mixed with newly installed files. The agent stopped that development session with `Ctrl-C` and ran `npm run dev` again from the project root; the new server reported Next.js 16.4.3. No source or configuration edits were needed.

When a framework upgrade breaks an already-running server, inspect its terminal errors and restart it before changing application code. Package installation updates files on disk; an existing process can retain earlier modules in memory. A narrow HTTP check, `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000`, returned **200** after an elevated retry (the sandboxed attempt could not connect). Here `-s` suppresses progress output, `-o /dev/null` discards the response body, and `-w` prints the status code. This confirms that the homepage request succeeded, not that browser interactions or production builds pass. No browser, lint, type, or build checks were run for this fix.

**References**

- [npm outdated](https://docs.npmjs.com/cli/v11/commands/npm-outdated) — interpreting installed, wanted, and latest versions.
- [npm view](https://docs.npmjs.com/cli/v11/commands/npm-view) — reading registry metadata such as peer dependencies and engines.
- [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install) — version selectors, development dependencies, and lockfile updates.
- [curl command reference](https://curl.se/docs/manpage.html) — `--silent`, `--output`, and `--write-out` options used for the narrow HTTP status check.

## Next.js starter and project files

**Completed checkpoint:** the user generated a Next.js starter in `battledle-starter`. Using a child folder avoided generator conflicts with existing root files, including `AGENTS.md` and `.nvmrc`. After inspecting for collisions, all generated entries—including hidden entries such as `.git` and `.next`, plus `node_modules`—were moved to the project root, and the empty temporary folder was removed. Existing project documentation and `.nvmrc` were preserved. The project name was updated to `battledle` in the manifest and the lockfile's root package records.

The original starter used Next.js **16.4.2** and React **19.3.0**; see the dependency-update checkpoint above for later versions. Its application directory is `app/` at the root; the earlier roadmap's `src/app/` path was only a proposal. [next.config.ts](../next.config.ts) also contains generated `cacheComponents: true` and `partialPrefetching: true` settings. These generated settings were preserved; no product requirement or user design reasoning is implied by them.

| Project reference | What to look for |
| --- | --- |
| [package.json](../package.json) | The project's name, dependencies, and named scripts. `dev` starts development, `build` creates a production build, `start` serves a production build, and `lint` runs ESLint. |
| [package-lock.json](../package-lock.json) | npm's recorded dependency tree and resolved versions, including dependencies of dependencies. It supports repeatable installation. |
| [app/page.tsx](../app/page.tsx) | The `Home` component supplies the homepage at `/`; this is the first editing exercise. |
| [app/layout.tsx](../app/layout.tsx) | `RootLayout` wraps pages with shared document structure and imports global styles. |
| [app/globals.css](../app/globals.css) | Shared styling and the starter's Tailwind/theme setup. |
| [public/](../public/) | Static assets such as the starter's SVG images. |

**Checks actually run:** `npm run lint` and `npx tsc --noEmit`, both from the project root under Node 24.22.0, passed. Lint checks code against configured rules; TypeScript checks types, and `--noEmit` avoids generating JavaScript output. These checks do not confirm that the app renders in a browser.

**Suggested next command:** run `npm run dev` from `/Users/zachk/Desktop/battledle`, keep that terminal running, and open the local URL it prints. A development server serves the app locally and picks up saved edits. Browser verification remains pending.

**References**

- [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure) — explains the roles of `app/`, `public/`, pages, layouts, and configuration files.
- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) — explains project creation and starting the development server.

## React components, typed props, and JSX

**Implementation reference:** [app/page.tsx](../app/page.tsx), specifically `AppIntroProps`, `AppIntro`, and `Home`. The user extracted the heading and description into `AppIntro`, then replaced its fixed description with a `tagline` supplied by `Home`.

- A **component** groups a piece of interface behind a named function. `Home` composes the page using `AppIntro`, so the introduction has a clear boundary in the page code.
- A **prop** is input passed from parent to child. `Home` chooses the tagline; `AppIntro` controls how it is presented. This pattern makes the same presentation usable with different text without editing the child each time.
- `AppIntroProps` describes the input contract: `tagline` must be a string. The destructured parameter reads that property from the props object. TypeScript can flag a missing prop or an incompatible value during development.
- `{tagline}` in the paragraph tells JSX to render the JavaScript value. Text written directly between tags is literal text; curly braces are needed to read a variable there.
- Project component style: typed arrow-function declarations, with a separate default export when needed. See `AppIntro` and `Home` here and `ResultCard` in [components/ResultCard.tsx](../components/ResultCard.tsx). A prop type describes the function's inputs; the arrow function supplies its implementation.
- JSX whitespace is not a reliable layout tool: source line breaks and indentation do not necessarily produce visible spacing. Use an explicit space when text needs one, and CSS spacing utilities for layout between elements.

**Debugging lesson:** a semicolon placed after a component tag inside returned JSX is text content, so it can appear on the page. The semicolon ending the arrow-function variable declaration belongs after its closing brace, outside the JSX. The user corrected this distinction during the props exercise. When unexpected punctuation renders, inspect the returned markup before treating it as a styling problem.

No lint, type, or browser checks were run for this exercise by the note-taker. The project preference is to perform verification when requested.

**References**

- [React: passing props to a component](https://react.dev/learn/passing-props-to-a-component) — passing values from parent to child and destructuring the props object.
- [React: JavaScript in JSX with curly braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces) — distinguishes literal text from JavaScript expressions in markup.
- [React: using TypeScript](https://react.dev/learn/typescript) — explains typed component props and how types describe expected inputs.

## Static scores, shared files, and submission order

The user has progressed from one component with a text prop to a static scoreboard. The current separation keeps data, its shape, presentation, and ordering understandable independently:

| Project reference | Pattern and purpose |
| --- | --- |
| [types/result.ts](../types/result.ts): `Result<TResult>` | Common record fields plus typed game-specific `result`. Fixtures explicitly use only the guess-count portion of `WordleResult`, not fabricated grids. |
| [data/sampleResults.ts](../data/sampleResults.ts): `sampleResults` | An array of `Result` objects, separate from markup. Sample entries are learning fixtures, not finalized valid-game rules. |
| [components/ResultCard.tsx](../components/ResultCard.tsx): `ResultCard`, `ResultCardProps` | Portrait shell with player/game/date header, central game-specific children and summary, and a prominent standardized-score bubble. |
| `components/ResultRow.tsx` (removed; historical): `ResultRow`, `ResultRowProps` | Table row selecting player, game name, submission timestamp, and message from `Result` through `Pick`. |
| [components/resultCards/WordleResultCard.tsx](../components/resultCards/WordleResultCard.tsx): `WordleResultCard` | Standalone solved-Wordle detail card accepting a real `WordleResult` and optional player, separate from generic table rows. Shown as a valid-result preview directly through `ResultForm`. |
| `components/ResultBoard.tsx` (removed; historical): `ResultBoard`, `ResultBoardProps<T>` | Generic score collection, clear/reset controls, and list rendering through supplied functions. |
| `components/WordleScoreBoard.tsx`: `WordleScoreBoard` (historical; currently absent) | Previously configured the generic board with Wordle sample data, cards, keys, title, and parser feedback. The homepage now uses `ResultForm` directly; the board module was not restored. |
| `components/ResultTable.tsx` (removed; historical): `ResultTable` | Shared semantic table, column headers, caption, and scroll container around score rows. |
| [components/ResultForm.tsx](../components/ResultForm.tsx): `ResultForm` | Owns player-name and pasted-result inputs, validation feedback, and a parsed Wordle preview. |
| [app/page.tsx](../app/page.tsx): `Home` | Composes the introduction, navigation, `ResultForm`, and player leaderboard. No submission table or personal-history navigation appears on the homepage. |

**Current ordering decision:** the user replaced visible guess ranking with a submission-date list. The implementation uses newest-first order, a direction the agent stated as an assumption. `submittedAt` is separate from `datePlayed`: submitting a score later does not change which puzzle it belongs to. The sample timestamps are fixtures on October 15 at 18:00, 19:00, and 20:00 UTC, not actual submission history.

**Generic card message:** at the user's request, records gained `message: string` and the sample records gained display text. `ResultRow` renders the player and that message instead of constructing a guesses sentence. `Pick<Result, ...>` builds its prop type by selecting only the four fields it renders; it does not need game-specific numeric details. The personal-history page uses this row inside `ResultTable`; the former homepage submission table was removed. Future game-specific formatting can supply suitable messages, but no parser was changed to generate them yet. A Bot's eight-guesses fixture is explicitly labeled a sample result; it does not change the solved Wordle parser's 1–6 rule. No app checks were run.

**JavaScript patterns practiced:** `Result[]` describes an array of `Result` objects. Spread creates a shallow copy before `sort`, because `sort` changes its receiver. `ResultBoard` calculates `orderedResults` by subtracting the first parsed timestamp from the second, giving descending chronological order. `Date.parse` turns each timestamp string into a numeric time value. This assumes valid timestamp strings; validation has not been added.

`map` calls a callback for each entry and collects the returned JSX. The board no longer passes an index-based rank to cards. React's `key` identifies items across renders; the historical Wordle board supplied player names, relying on unique fixture names. Revisit keys when real submission identities exist. Guess-based ranking remains a historical exercise rather than the current list behavior.

**Extraction checkpoint:** the user moved ranking and list rendering from `Home` into `ResultBoard` and correctly described the flow as ranking the data, then looping over it to render cards. `ResultBoard` begins with `"use client"`, establishing its client boundary. At that checkpoint the heading read “Wordle Scores,” avoiding a claim that the fixed sample dates are today's results.

**Debugging lessons:** a component arrow function with a brace-delimited body needs an explicit `return` to supply its JSX. Merely writing JSX inside that body does not return it. The user corrected the missing return in `ResultBoard`, along with a heading whose opening and closing tag names differed. When extracting a component, check that it returns its markup and that JSX tags match before investigating layout or data flow.

**References**

- [MDN: Date.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) — converting standardized timestamp strings to numeric time values.
- [React: rendering lists](https://react.dev/learn/rendering-lists) — mapping data to components and choosing keys.
- [JavaScript array sorting](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) — comparator return values and the fact that sorting changes the array being sorted.
- [React: your first component](https://react.dev/learn/your-first-component) — components return JSX and can be composed inside other components.
- [Next.js: use client](https://nextjs.org/docs/app/api-reference/directives/use-client) — the client boundary required for state and event handling; the directive belongs before imports.
- [TypeScript: Pick](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys) — selecting an existing type's fields to describe a component's narrower requirements.
- [React: passing JSX as children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) — composing game-specific card content inside a reusable visual shell.

## Local state and click events

**Implementation reference:** `components/ResultBoard.tsx` (removed; historical), especially `results`, `setResults`, `handleClearResults`, and `handleResetResults`.

The user first introduced `useState(sampleResults)` and changed ranking to use `results`; the generic board now initializes from its `initialResults` prop. `useState` returns the current value and a setter function; array destructuring assigns them the names `results` and `setResults`. The initial array supplies the starting value, while subsequent rendering reads the current state. `orderedResults` is calculated from that state rather than stored separately.

The agent added `handleClearResults`, which passes an empty array to `setResults`, and connected it to one “Clear results” button above the list. The button acts on the whole scoreboard, so it sits outside `map`; a button inside the callback would repeat for every card. Passing the handler to `onClick` lets React call it when clicked. Calling it during rendering would run it immediately. `type="button"` keeps it from acting as a form submit button if placed inside a form later.

The setter requests a new render, where ordering and mapping use the empty array. This changes component memory, not the imported sample data or a database; a fresh page load initializes it from the sample data again. No browser or automated checks were run for this step.

The next small step added `handleResetResults`, which now restores the `initialResults` prop through the same setter without a page refresh. The two buttons share a flex container. An empty-state paragraph is derived from `results`: `length` counts array entries, and `=== 0` is a strict equality comparison that produces a boolean without converting types. The `&&` expression includes “No results yet.” only when that condition is true. Each state update causes the component to calculate ordering and this condition again; neither needs its own state variable. This reset and empty-state step has not been checked in the browser or with automated checks.

**Controlled inputs:** [ResultForm](../components/ResultForm.tsx) has a player-name text input and multiline share-result textarea. Each `value` reads its own state; `onChange` reads `event.target.value` and updates that string. Generated IDs connect labels to inputs. The user restored the name field after briefly requesting result-only input. A name is display text, not authenticated identity.

**Direct form integration requested by the user:** the homepage mounts `ResultForm` directly; the former `GameScoreForm` wrapper and configuration props were removed. The form delegates game selection and preview rendering to `identifyResult` in the registry; `WordleGame` retains parsing rules. The unused generic `ResultBoard` now handles only table data/presentation, with no form or feedback prop. This keeps one mounted homepage form.

**Live result review:** `ResultForm` derives a preview through `identifyResult(shareResult)` during rendering, rather than storing a submitted preview snapshot or importing Wordle behavior. Editing or pasting text updates the card immediately; editing the name updates its displayed player. `canSubmit` requires both a nonempty trimmed name and a valid parsed result. Invalid/incomplete input shows a preview placeholder; helper text and a screen-reader validity status explain the state without treating every edit as a submission error.

The form and card use equal columns from the medium breakpoint and stack on smaller screens. The homepage width and padding were adjusted for that layout. Input changes clear only explicit submission feedback because current parsed preview data is derived, not separately stored. The Submit result button is disabled until valid; its handler now prevents navigation and saves browser-local records as described below. The later browser-local persistence is described below; this adds no server validation. Standard-palette Wordle input is supported, including the later `X/6` addition described below. No app checks were run.

**Function placement discussed:** local handlers live inside `ResultBoard`, where closures let them access the component's state and setters. A closure is a function together with access to the surrounding variables where it was defined. The earlier pure ranking helper illustrated separating reusable logic from React; it is no longer present in the current source. This is a responsibility and scope choice; no performance optimization was needed for these handlers.

Game-specific feedback now lives in `WordleGame`, replacing the earlier standalone `getWordleFeedback` function. The form's `handleSubmit` stays inside `ResultForm` to access input state, the feedback setter, and current parsed input.

**Generic board requested by the user:** `ResultBoardProps<T extends SubmittedResult>` uses `T` as a placeholder for one score's type, shared by the initial array, key selection, and rendering. The constraint requires `submittedAt: string`, enabling common chronological ordering while allowing game-specific fields. The comma in the generic arrow declaration disambiguates it from JSX in a `.tsx` file. Callers supply `getResultKey` and `renderResult`, plus data and a title. `renderResult` returns a `ReactNode`, the type of renderable React content. A keyed `Fragment` gives each result identity without wrapper HTML. The earlier ranking callback and rank argument were removed when chronology replaced ranking.

The historical `WordleScoreBoard` supplied Wordle-specific choices before its removal. Keeping that configuration in a Client Component keeps ordinary function props within the client boundary when `Home` renders it. The generic board assumes a submission timestamp but no guesses field, card design, or parser. This enables future game setups without implementing other games or combined normalization. The partial fixture type still describes Wordle guess results; `ResultRow` requires only common record fields. No app checks were run for this change.

**References**

- [React: useState](https://react.dev/reference/react/useState) — initial state, the returned value/setter pair, and updates that trigger rendering.
- [React: responding to events](https://react.dev/learn/responding-to-events) — defining handlers and passing a function to an event prop without calling it during rendering.
- [React: conditional rendering](https://react.dev/learn/conditional-rendering) — using a boolean condition with `&&` to include JSX only when needed.
- [React: input](https://react.dev/reference/react-dom/components/input) — controlled inputs, change handlers, and associating labels with inputs.
- [React: textarea](https://react.dev/reference/react-dom/components/textarea) — multiline inputs, row sizing, and the controlled value/change pattern.
- [React: useId](https://react.dev/reference/react/useId) — generating unique accessibility IDs when reusable components appear more than once.
- [MDN: status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role) — announcing updated advisory feedback to assistive technology.
- [MDN: closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) — how a nested function accesses variables from its surrounding scope.
- [TypeScript: generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — using a type parameter to preserve relationships between reusable inputs and outputs.
- [React: Fragment](https://react.dev/reference/react/Fragment) — grouping rendered content with a key without adding a DOM wrapper.

## Parsing and validating a Wordle share result

**Implementation references:** [lib/games/WordleGame.ts](../lib/games/WordleGame.ts), `WordleGame.parse`; [types/wordle.ts](../types/wordle.ts), `WordleResult`.

The user supplied an actual example beginning `Wordle 1,946 5/6`, followed by an emoji grid with Discord links. After an initial header-reading step, the user explicitly requested strict emoji and format validation. The parsing method returns numeric `puzzleNumber` and `guesses` plus a `grid` array, or `null` when validation fails. Its union return type (`WordleResult | null`) makes that unsuccessful outcome explicit. The registry calls recognition/parsing for live previews; `getFeedback` remains available within the game class. The form has no game-specific import.

The `parse` method trims the text, normalizes Windows CRLF line endings, and splits it into lines. Its anchored header expression requires the `Wordle N G/6` format, accepting an optional star, a positive puzzle number with valid comma grouping or no commas, and guesses 1–6 or `X` for an unsuccessful six-guess result. Capture groups retain puzzle and guess text as strings; commas are removed before `Number` converts them. `Number.isSafeInteger` rejects puzzle numbers JavaScript cannot represent safely as integers.

The remaining lines form the grid, allowing one empty separator line after the header. Row count must equal the guess count. `every` checks each row against a Unicode regular expression requiring exactly five tiles from the standard black, white, yellow, and green palette. For a numeric guess header, the final row must be all green; for `X/6`, it must not be all green. Neither format permits an earlier all-green row. Failed results retain `guesses: 6`; the final grid row distinguishes them from six-guess wins. Early `null` returns stop processing invalid input instead of returning a partly valid result.

**Class and parsed-data separation:** `WordleGame` groups lightweight `recognizes`, strict `parse`, `resultMessage`, and `getFeedback`. Recognition only identifies a possible Wordle prefix; it does not validate the grid. Formatting handles singular “guess” versus plural “guesses.” `WordleResult` remains a plain parsed-data object without methods. After discussing common metadata on game classes, the user accepted storing that metadata on separate records, as described below.

A shared `wordleGame` instance has no player/result metadata assigned and does not retain submissions. The user requested removal of the old parser wrapper and `lib/parsers` directory after the class refactor; the pre-deletion import search found no remaining consumers. `WordleGame` is now the sole parsing implementation. The registry calls methods through the game instance, preserving its `this` receiver because the methods call other methods through `this`. The scoring contract was initially a `null` placeholder; the accepted Wordle calculation below now supplies numeric scores. No post-change app checks were run.

**Abstract parent and record separation:** the user accepted keeping game behavior separate from individual score records. [lib/games/Game.ts](../lib/games/Game.ts) defines abstract `Game<TResult>` with readonly `gameName` identity and recognition, parsing, formatting, feedback, and standardized-scoring methods. An abstract class cannot be instantiated directly; concrete subclasses supply those members. `WordleGame extends Game<WordleResult>` specifies its parsed-result type and sets `gameName` to Wordle. Its shared instance is stateless. The earlier parent metadata fields and constructors were removed because a game definition should not represent one player's submission.

The `standardScore(result: TResult): number | null` contract requires each concrete game to implement scoring for its own parsed-result type. `null` means uncalculated, distinct from numeric zero. Wordle now returns a number using the user-approved rule below.

**Accepted Wordle scoring (November 7, 2026):** solved results score 100, 90, 80, 70, 60, or 50 for one through six guesses: `100 - (guesses - 1) * 10`. Unsuccessful results score 10 points for each green tile in the **final row**, with no points for yellow tiles. The user clarified that “last column” meant final row. The requested failure scale was 0–50, but a valid failed row has at most four greens, so actual valid failures score 0–40; five greens constitute a win. This makes Wordle a 0–100 exception to the earlier planned 1–100 scale. Other games' formulas and leaderboard aggregation remain undecided.

In `WordleGame.standardScore`, the all-green final row selects the solved calculation; otherwise `Array.from` converts the final row into Unicode code-point entries and `filter` keeps the green tiles for counting. Direct string indexing/length uses UTF-16 code units, so it is unsuitable for counting these emoji tiles. The parser now accepts `X/6` so unsuccessful input can reach this calculation. `resultMessage` and `WordleResultCard` label those results as unsuccessful. Existing preview and result-building calls use the scoring method; previously saved explicit `null` scores remain preserved under the storage rendering rule below. No tests, lint, type, build, or browser checks were run for this change.

**Puzzle-date calculation:** the user requested abstract `dayPlayed(result: TResult): string | null`, returning a puzzle calendar date in `YYYY-MM-DD` form rather than submission time. `WordleGame.dayPlayed` uses puzzle zero's June 19, 2021 epoch and adds the puzzle number in UTC days. `Date.UTC(2021, 5, 19)` uses zero-based months, so 5 means June. UTC arithmetic avoids local daylight-saving and time-zone date shifts. Guards reject unsafe/negative puzzle numbers, invalid resulting dates, and years beyond four digits; `null` means no valid date could be calculated. The epoch was researched, but no runtime date tests or app checks were run. The preview now uses `datePlayed ?? wordleGame.dayPlayed(result) ?? undefined`: an explicitly supplied date takes precedence, otherwise the game calculates it, and an unavailable result preserves the shell's pending fallback. No checks were run for that wiring.

[types/result.ts](../types/result.ts) now defines `Result<TResult = unknown>` with `id`, `playerId`, optional interim `playerName`, `gameName`, `datePlayed`, `submitTime`, nullable standardized `score`, and game-specific `result`. The user revised this schema: display `player` became account-oriented `playerId`, `submittedAt` became `submitTime`, and stored `message` was removed. The generic preserves a game's parsed shape; `Result<WordleResult>` can hold its real puzzle/guess/grid data, while default `unknown` prevents assuming a specific shape. These edits do not establish authenticated identity or a final database schema. Historical fixture/history descriptions above refer to earlier fields and do not establish current schema compatibility.

**Result builder:** [lib/games/registry.tsx](../lib/games/registry.tsx) now exports `generateResult<TResult>(game, playerId, result)`. `Game<TResult>` is the behavior provider; `TResult` is its plain parsed data. The helper trims the player ID and throws for an empty ID or an unavailable puzzle date. It constructs a record with `crypto.randomUUID()`, the game's name/date/standardized score, current ISO `submitTime`, and the parsed result. New Wordle records use the agreed numeric score from `WordleGame.standardScore`.

A valid registry preview also exposes `generateResult(playerId)`, closing over its already paired game and parsed result and delegating to the shared builder. Its general registry boundary returns `Result` with unknown result details; the internal generic pairing remains type-specific. The helper stays in the registry where the user started it, rather than becoming a game method. Building an object is not saving it: the form now calls it only on Submit and uses an explicit temporary local name-based ID for browser storage. Authentication, shared persistence, and server validation are not implemented. No checks were run.

**Current limits:** the parser accepts plain multiline emoji, so the Discord Markdown-linked example is rejected unless pasted as plain tiles. Failed results marked `X/6` are supported; high-contrast palettes remain unsupported. It does not validate puzzle dates or prove that a result is authentic. No parser tests or app checks were run; these describe the implemented rules, not verified outcomes.

**Wordle-specific detail card:** the user requested `WordleResultCard`, which accepts a `WordleResult` plus an optional player. It displays the puzzle number, solved guess count, a summary from `wordleGame.resultMessage`, and the ordered emoji grid. Generated IDs associate its heading; hidden descriptions explain tile meanings while visual emoji are hidden from assistive technology to avoid duplicate announcements. This is a separate detail presentation from `ResultRow` table rows. It supports the parser's solved and unsuccessful result shapes and is rendered directly by the homepage form; no fixture grid was fabricated and no app checks were run.

**Card composition and portrait layout:** the user requested `ResultCard` as a portrait shell with player, game, and puzzle date at the top, dominant game-specific content in the center, and an eye-catching standardized-score bubble at the bottom. Props now include `gameName`, optional `datePlayed`, and required `score: number | null`, alongside player/message/badge and optional `children`. The flex-column shell and growing center keep the footer below the custom game rendering; width/height limits, rounding, and shadow establish the portrait appearance. `ReactNode` describes the renderable children. This is component composition, not class inheritance; `ResultRow` remains separate table markup.

`WordleResultCard` supplies Wordle identity, formatted summary, puzzle/guess badge, and its accessible emoji figure as children. For a live preview it calls `wordleGame.standardScore(result)` and shows the agreed numeric score; saved cards preserve an explicitly supplied number or `null`. The current form supplies no puzzle date, so `WordleResultCard` derives it through `wordleGame.dayPlayed`; an unavailable calculated date still uses “Puzzle date pending.” Player preview is the fallback when no player is supplied. The `dayPlayed` calculation is now wired to this card; no app checks were run for the date wiring.

**Composition clarification:** a requested source read confirmed that `ResultCard` accepts/renders `children` and `WordleResultCard` nests its grid there. The earlier `children`/`resultRender` mismatch is resolved; that read required no code change.

**Homepage integration:** the homepage contains the direct `ResultForm`, player leaderboard, and navigation, without a submission scoreboard. The deleted `GameScoreForm` wrapper is no longer needed. The earlier `ResultRow`/`ResultTable` sample history and `/my-results` route have now been removed at the user's request. Wordle is the only registered game, with solved and unsuccessful recognition, parsing, and preview support. The earlier stale `WordleScoreBoard` import was replaced rather than restoring that missing component. No app checks were run.

**References**

- [MDN: regular-expression groups](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Groups_and_backreferences) — capture groups and reading their matched values.
- [MDN: Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/Number) — converting a captured string into a number without `new`.
- [MDN: Array.every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every) — requiring every grid row to pass the same predicate.
- [MDN: Number.isSafeInteger](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger) — guarding integer values against JavaScript's numeric precision limits.
- [TypeScript: classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) — inheritance, readonly identity fields, and abstract classes.
- [WordFinder: Wordle answer history](https://wordfinder.yourdictionary.com/wordle/answers/) — the researched puzzle-zero date used for Wordle calendar conversion.

## Product direction: shared input and player leaderboard

**Accepted user direction:** the homepage should have one form for share results from any supported game. Parsing should identify the game and produce a structured record suitable for storage. A homepage leaderboard should compare players using their stored records and a standardized score (originally planned as 1–100; Wordle now uses the agreed 0–100 exception). Each game should have its own class containing its custom scoring logic.

The chronological submission list and the player leaderboard serve different purposes: one shows when individual results arrived; the other compares players after game-specific scoring and aggregation. Replacing visible guess ranks in the submission list does not remove the planned leaderboard.

**Implemented game registry:** [lib/games/registry.tsx](../lib/games/registry.tsx) provides `identifyResult`, which tries registered game parsers. Its generic `registerGame` pairs `Game<TResult>` with a card component accepting the same parsed-result type, preserving that relationship before returning a common preview shape. The closure retains the valid parsed result and exposes `renderCard(player)`. `ResultForm` imports this registry function, uses generic instructions/status text, and contains no Wordle-specific language or parsing functions.

**Recognition versus validation feedback:** at the user's request, identification now returns a tagged union with `status` values `empty`, `undetected`, `invalid`, or `valid`. Checking `status` narrows the type so the form can safely access the corresponding message, game name, or preview. Blank input is silent; unsupported/unrecognized text gets detection feedback; a recognized game with malformed content gets format feedback naming that game. The registry keeps the first invalid match while still looking for a valid result, returning that retained format failure only if no parser succeeds. This keeps recognition distinct from full validation.

The form renders a card only for `valid`, derives detection errors for `invalid`/`undetected`, and displays feedback below the textarea with a status role. `aria-describedby` connects the field to instructions/feedback, and `aria-invalid` identifies an invalid value. Correcting input recalculates the state and clears obsolete feedback without a separate error-state setter. Submit remains validity-gated. No parser rules, saving behavior, or other game support changed, and no checks were run.

The registry is a UI integration module because it maps behavior to React card components; game classes remain independent of React. Only Wordle is registered. Adding the registry does not add other-game parsing, saving, date conversion, or a scoring formula. The user's parent method name `resultMessage` is now used consistently by `WordleGame` and its card. No extra form wrapper was restored and no app checks were run.

**Still unresolved:** formulas for games other than Wordle, how multiple records become a player's leaderboard score, participation weighting, and the relevant time windows. Wordle's formula above is agreed; record aggregation remains undecided. Obtain actual share examples for each game before implementing its parser.

**Desired review-and-save workflow:** the user wants to enter a player name and share text, have the form identify/validate the result as it changes, and automatically see the valid game's card for review. Submit should be enabled only with a valid name and supported result. The server should validate again, calculate trusted game scores, and save a plain structured record. Show success only after saving succeeds; retain the input when saving fails. Later authentication should supply a durable account ID rather than trusting the entered display name.

**Design reasoning:** the recommended input flow accepts pasted, typed, and edited text through the same controlled `onChange` flow; do not restrict the field to paste events. The current small local parser can run immediately without a debounce, which would only add delayed work at this stage. Derive detection, validity, and preview from current input instead of keeping a submitted-input snapshot that can become stale; this part is now implemented. Avoid reporting an error on every incomplete edit, and make no server calls until Submit. Revisit debouncing if later processing is measurably expensive or requires remote calls. These choices support prompt review while keeping saving a deliberate action.

Automatic live preview, Submit gating, and browser-local saving are implemented. Success follows the local storage write. Server validation and shared database writes remain planned; local persistence is not a backend save. Game classes remain behavior providers, while `Result<TResult>` is plain submission data for eventual storage; constructing a class instance is not a database save. No application code or checks were performed for this planning discussion.

**References**

- [TypeScript: classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) — class fields and methods for the requested per-game scoring classes; this describes the language tool, not an implemented Battledle scoring design.

## Sortable player leaderboard prototype

**Implementation references:** [components/Leaderboard.tsx](../components/Leaderboard.tsx), `Leaderboard` and `SortField`; [types/player.ts](../types/player.ts), the `Player` projection; [data/samplePlayers.ts](../data/samplePlayers.ts), `samplePlayers`.

The user requested a separate homepage leaderboard containing player name, points, and streak, ordered by a selected field. The leaderboard is separate from submission history, which is displayed on `/my-results`; the homepage submission table has been removed. The client leaderboard accepts player standings as props and keeps only the selected sort field in state, initially total points. A string-literal union limits that field to `totalPoints`, `siteStreak`, or `name`. The select handler checks its string value before setting state, narrowing it to an allowed member.

**Player model evolution:** the user chose explicit `totalPoints`/`totalPlays` names and a submission-ID `bestPlay`. The current [types/player.ts](../types/player.ts) also has per-game `gamePoints`, `gamePlays`, and `gameStreaks`, a site-wide `siteStreak`, and `favoriteGame` in place of the earlier `bestGames`. The earlier tied highest-point-games decision is historical; do not assume it defines `favoriteGame` without clarification. Statistics and best-play tie algorithms remain undefined.

At the user's request, `gamePoints: Partial<Record<GameId, number>>` stores accumulated standardized points separately for each game. The same keyed pattern as streaks supports adding a game without adding a dedicated player field. An omitted key represents no entry for that game, such as when it has not been played. This is a type-shape change only: totals are not calculated or populated yet, and the leaderboard projection is unchanged. No checks were run.

`gameStreaks` is `Partial<Record<GameId, Streak>>`: `Record` maps game IDs to streak data, while `Partial` permits games without an entry. Each `Streak` stores `currentStreak`, `longestStreak`, and nullable `lastPuzzleDate`; this shape does not implement how streaks advance. [types/game.ts](../types/game.ts) defines IDs for planned Wordle, Mini, Connections, and Krillion games; those names do not establish implemented parsing support.

**Schema-migration debugging:** the user removed `PlayerStanding` and added `Streak`/`siteStreak`, but the leaderboard and fixtures still imported the deleted type and accessed a scalar `streak`. The agent updated both consumers to `Pick<Player, "id" | "name" | "totalPoints" | "siteStreak">`, sorted/displayed `siteStreak.currentStreak`, and labeled the column “Site streak.” Existing fixture streak values 2/7/4 were preserved as current and longest values with a null last puzzle date; this does not calculate real streaks or define how they advance. `PlayerStanding` was not restored. No runtime or automated checks were run, so this is a source-level diagnosis and change, not verified runtime recovery.

Reusable lesson: after renaming/removing a shared type or changing a field from a scalar to an object, update imports, fixtures, sort access, and rendered values together. A model can be correct while its old consumers still describe the previous shape. No statistics calculation, authentication, or database behavior was added.

The component copies the players array before sorting. Numeric fields sort highest first using bracket access with the selected field; name sorting uses `localeCompare` for A–Z. Ordering is derived each render, not maintained as a second state array. A labeled select controls the order, generated IDs connect labels/headings, and `aria-sort` marks the active column and direction. Row headers name players; fixture IDs provide React keys. No ordinal ranks or special tie policy were added.

Points and streaks are explicitly display fixtures, not calculated from score records. Fixture IDs are not authenticated account IDs. The sample point totals do not establish how individual standardized 1–100 game scores aggregate into leaderboard points. Streak units/calculation, point aggregation, and time windows remain undecided. This prototype adds no storage, authentication, or derived scoring, and no app checks were run.

**References**

- [TypeScript: narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — using value checks to refine a string to the allowed sort-field union.
- [MDN: aria-sort](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-sort) — exposing the sorted column and direction to assistive technology.

## Personal score history and file-based routing

**Current status:** the user explicitly removed `/my-results`, its homepage navigation link, `ResultBoard`, `ResultRow`, and `ResultTable` to rebuild them from scratch. The descriptions below preserve earlier learning, not existing UI. Rebuilding is pending and must follow the user's next steps; do not autonomously recreate the removed files. Result form/card/Wordle card/leaderboard and result types/fixtures remain. No app checks were run for removal.

**Historical implementation:** `app/my-results/page.tsx` (removed), `MyResults`; the homepage links to it with Next.js `Link`.

The user requested a personal scores page before authentication. In the App Router, the `my-results` folder adds the URL segment and its default-exported `page.tsx` component provides `/my-results`. This page remains a Server Component: it reads fixtures and renders markup without interactive state. A return link navigates home.

`currentPlayer = "ZBot"` is explicitly temporary demo identity. `filter` keeps matching sample records and creates a new array, so the following newest-first `sort` changes that filtered array rather than `sampleResults`. Each record now renders a `ResultRow` row within shared `ResultTable`; the row displays a UTC submission timestamp and `time` carries the machine-readable value through `dateTime`. A conditional empty state handles no matching records.

This displays sample history only. It does not authenticate anyone, persist data, or receive newly submitted results. A player-name comparison is not a durable account ID or an authorization check. Authentication remains a later milestone; no app checks were run for this page.

**References**

- [Next.js: layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) — folder-based routes, page exports, and links between pages.
- [MDN: Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) — selecting matching entries into a new shallow array.

## Browser-local saved results and card grid

**Implementation references:** [lib/resultStorage.ts](../lib/resultStorage.ts); [app/results/page.tsx](../app/results/page.tsx); [components/ResultsGrid.tsx](../components/ResultsGrid.tsx); [components/ResultForm.tsx](../components/ResultForm.tsx).

The user requested a page showing all submitted cards in a grid to inspect stored records. `/results` now supplies the page shell, and client `ResultsGrid` reads browser storage after mounting. Loading storage in a mount effect waits until browser APIs are available. Records order by newest `submitTime` and render one/two/three columns across responsive breakpoints, with loading, empty, and error states. The homepage links to “All results.” The removed personal-history/table components were not restored.

**Result-only storage:** at the user's request, [lib/resultStorage.ts](../lib/resultStorage.ts) now loads/saves `Result[]`, not envelopes or raw share text. The existing `battledle.results.v1` key is retained. Loading checks shared record fields and timestamps. Legacy `{record, playerName, shareText}` entries are converted into plain records only after the entire collection validates, then written back; malformed collections are not silently overwritten. New saves contain no raw share output.

`Result` has an optional `playerName` display snapshot as an interim convenience because profiles do not yet resolve a name from `playerId`. This is not authenticated identity or a finalized database design. Submit builds a record with the temporary local name-based ID, adds the display name, and writes that record. Success follows the storage write; errors preserve inputs. Browser/origin storage remains separate from a shared backend, authentication, and metrics calculation.

**Rendering normalized records:** the registry's `renderSavedResult` selects a renderer by stored `gameName`, checks the stored Wordle result shape, and renders from its structured fields instead of reparsing share text. `ResultsGrid` orders plain records by `submitTime` and displays fallback cards for unsupported/invalid data. `WordleResultCard` accepts an optional saved score: an explicit number or `null` is preserved, and only an omitted (`undefined`) score invokes current calculation. Stored date and display name are also supplied. This prevents future formula changes from silently replacing an explicitly saved score; broader scoring-version policy remains undecided. Only Wordle has a saved-record renderer. No app checks were run and no milestone completion is implied.

**References**

- [React: synchronizing with effects](https://react.dev/learn/synchronizing-with-effects) — using an effect to synchronize a component with an external browser system.
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — browser/origin storage and its string-based persistence API.

## Tailwind styling and alignment

**Implementation references:** `components/ResultRow.tsx` (removed; historical) for row/cell styling; `components/ResultTable.tsx` (removed; historical) for the table and overflow container; [app/page.tsx](../app/page.tsx) for page layout; [app/globals.css](../app/globals.css) for shared global styling.

Tailwind utilities are CSS rules applied through `className`. Result rows use utilities for cell padding, borders, text, and hover backgrounds; the table container supplies rounding and horizontal overflow. Look at the actual class list for examples instead of maintaining a second copy here.

In a flex row, `items-center` aligns children across the row's cross axis (normally vertically). `gap-6` spaces the children; it does not set their alignment. Text alignment and flex-item alignment solve different problems. When a layout looks wrong, identify the parent layout direction and the axis involved before choosing a utility.

**Table presentation requested by the user:** `ResultRow` returns a `tr` with four `td` cells: player, game, date inputted, and message. `ResultTable` owns the shared table, caption, header row, and `tbody`; both `ResultBoard` and `/my-results` put score rows inside that body. Rows belong inside a table row group, not directly inside a list or ordinary layout div. `children` lets each caller supply rows while reusing the same column structure. Column headers use `scope="col"`, and the caption is visually hidden with `sr-only` while remaining available to assistive technology.

“Date inputted” means `submittedAt`, not puzzle `datePlayed`. The implementation explicitly labels UTC and uses `toUTCString()` for consistent rendering; this does not settle the product's puzzle-day or leaderboard time-zone policy. Horizontal overflow keeps wide tables scrollable, and padding/borders align cells across rows. No app checks were run for this presentation change.

Current styling uses utilities on components and shared styling in the global stylesheet. Keep styling choices consistent with the project's accepted convention as it evolves.

The user chose to continue using Tailwind while learning the CSS behind the utilities. Explain the underlying layout or style property alongside the class name. For the pasted-result field, inspect the column flex container, gap, border, rounding, and padding utilities in [ResultForm](../components/ResultForm.tsx).

**References**

- [MDN: HTML table](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table) — table structure, captions, headers, body rows, and accessibility semantics.
- [Tailwind: styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes) — combining utilities to build a component's appearance.

## Git and GitHub workflow

**Git** records version history locally: a commit captures staged changes with a message. **GitHub** hosts a remote repository so that history can be pushed off the computer and shared. Saving a file, committing it, and pushing it are separate actions. The starter supplied local Git history; the user subsequently reported that the GitHub push is complete. The remote and published contents were not independently verified.

Run project Git commands from `/Users/zachk/Desktop/battledle`. The following remain reusable workflow guidance; the user's completed-push report does not establish which exact commands they used. Replace placeholder values before use.

| Suggested command | Purpose and when to use it |
| --- | --- |
| `git status` | See the current branch and which files are changed, staged, or untracked. |
| `git add <paths>` | Stage the intended files for the next commit. Replace `<paths>` with the files being included. |
| `git commit -m "Describe the change"` | Save the staged snapshot in local history, with a meaningful message. |
| `git remote add origin <repository-url>` | First connection only: name the GitHub repository `origin`. Use the actual repository URL; do not repeat if that remote already exists. |
| `git push -u origin main` | Push local `main` to `origin` and establish its upstream association. This assumes the intended local branch is `main`. |

Never commit credentials, tokens, or other secrets. [.gitignore](../.gitignore) records files Git should ignore; it does not remove secrets already recorded in history.

**References**

- [Git command reference](https://git-scm.com/docs) — official details for status, staging, commits, remotes, and pushing.
- [GitHub: Hello World](https://docs.github.com/en/get-started/using-github/hello-world) — introduces repositories, commits, branches, and the collaboration workflow.

## Progress and next exercise

- Environment setup now includes a project Node version file and verified automatic shell switching. User verification in the existing VS Code terminal remains pending.
- Milestone 1 is complete per the project guide: the user ran the development server and customized the homepage. Historical setup checks do not establish that later changes were verified.
- The user has customized the homepage introduction, extracted `AppIntro`, and completed the typed `tagline` prop exercise in [app/page.tsx](../app/page.tsx). This records actual practice, not assumed mastery or a browser check.
- Session checkpoint: the user implemented a typed static scoreboard, extracted `ResultCard`, shared the score type and sample data across files, added pure ranking, displayed positions with the `map` index, and practiced Tailwind layout. These implementation observations do not imply production game rules are settled or that fresh checks passed.
- GitHub checkpoint: the user reports that publishing is complete. The remote and published contents were not independently verified; repeating the initial publishing workflow is no longer the immediate exercise.
- No verification was requested for tonight's checkpoint. No fresh lint, type, build, or browser checks were run by the note-taker. The passing setup checks above are historical and do not certify the later scoreboard changes.
- Latest checkpoint: the user extracted `ResultBoard` and corrected its missing return and mismatched heading tags. No fresh tests, lint, type checks, or browser checks were run for this extraction. Milestone 2 has not been marked complete.
- Local-state checkpoint: generic `ResultBoard` initializes `results` from `initialResults` and orders newest first through supplied rendering/key functions. It is not mounted on the current homepage; `ResultForm` and the player leaderboard are mounted directly. No checks were run for this refactor; no milestone completion is implied.
- Input checkpoint: `ResultForm` derives a live Wordle preview from share text and trimmed name, shown beside the form on wider screens. Submit is enabled only for valid name/result and now saves to browser localStorage, with success only after the write. No app checks were run.
- Mentoring preference update: the user now asks the agent to write each small code change directly in the files and keep explaining it. The guide records this standing preference; the learning roadmap still does not authorize building the whole application at once.
- Parser checkpoint: `WordleGame.parse` validates solved or `X/6` headers and plain standard-palette emoji grids; the registry connects it to the game-neutral form. The unused old parser wrapper/directory were removed at the user's request. High-contrast support remains future work; Wordle scoring and failure parsing are now implemented as described above; no submission policy has been implemented.
- Product checkpoint: the user chose a shared game-identifying input, structured stored records, and a separate player leaderboard with per-game scoring classes producing 1–100 scores. The first Wordle behavior class now exists; the typed game/card registry is implemented with Wordle only, while other-game formulas and leaderboard aggregation remain undecided; Wordle scoring is now implemented as described above. No implementation or checks were performed for this design discussion.
- Personal-history removal checkpoint: the user deleted `/my-results`, `ResultBoard`, `ResultRow`, and `ResultTable` and removed the homepage history link to rebuild them from scratch. Form/card/leaderboard and result data/types remain. Rebuilding is pending; no app checks were run.
- Leaderboard checkpoint: the homepage now has a separate player table with points/streak/name selection and sample standings. Sorting is implemented; calculating those metrics from records remains unresolved and unimplemented. No checks were run.
- Wordle-card checkpoint: standalone `WordleResultCard` renders solved parsed results, and the homepage form now previews valid parsed results. The stale homepage board import was replaced with direct `ResultForm`; the absent board was not restored. No app checks were run.
- On resuming, read the current `Result`, `sampleResults`, `ResultCard`, `ResultForm`, `WordleGame`, and `Home` references above before choosing the next small coding exercise with the user.

**References**

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) — official project creation options and instructions for running the development server.
