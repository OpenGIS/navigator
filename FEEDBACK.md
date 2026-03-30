1. Plugins can't register their own UI

This is the biggest one. The Recordings feature requires three separate wiring points in the consumer's create()
call:

Navigator.create({
buttons: [{ id: 'record', component: RecordButton, panel: { component: RecordingsPanel } }],
plugins: [RecordingsPlugin],
})

The plugin manages all state, persistence, and map layers — but it can't declare its own button or panel. A
self-contained plugin API would let you distribute a feature as a single import:

// Hypothetical: plugin registers everything itself
plugins: [RecordingsPlugin]

The install() context could expose something like addButton() / addPanel() so a plugin can register its own UI
components without the consumer manually wiring buttons config.

---

2. useUI docs contradict the actual API

The internal docs (4.ui.md) describe openPanel(id, component) and togglePanel(id, component) — taking an id and
component as parameters. But the actual exported useUI has:

- openPanel() — no parameters, just opens the panel
- setActivePanel(id) — separate function to set which tab is active

The extending docs (8.extending.md) correctly show setActivePanel + openPanel as separate calls. The 4.ui.md docs
should be updated to match.

---

3. app.provide() boilerplate in plugins

Every plugin that shares state with Vue components must manually call app.provide('key', ...) and every component
must inject('key'). The plugin context could offer a shorthand:

// Current — manual provide
install({ app }) {
app.provide('recordings', { state, start, pause, ... });
}

// Possible — context.provide() shorthand
install({ provide }) {
provide('recordings', { state, start, pause, ... });
}

Minor, but it reinforces the pattern and makes plugins feel less like they're reaching into Vue internals.

---

4. Per-instance plugins don't receive options

Navigator.use(plugin, options) passes options as the second argument to install(), but per-instance plugins in the
plugins array don't:

// Global — options work
Navigator.use(RecordingsPlugin, { maxDuration: 3600 });

// Per-instance — no options mechanism
plugins: [RecordingsPlugin] // install() gets context only

Supporting plugins: [{ plugin: RecordingsPlugin, options: { ... } }] (or a tuple syntax) would make per-instance
plugins configurable without needing factory functions.

---

5. @vitejs/plugin-vue is a hidden prerequisite

The docs recommend Vue SFCs as the "preferred" approach for buttons and panels, but @vitejs/plugin-vue isn't
mentioned until the very bottom of the extending docs. A consumer following the example will get an opaque Vite
transform error. Options: surface this earlier in the docs, or detect the missing plugin at build time with a
helpful error message.
