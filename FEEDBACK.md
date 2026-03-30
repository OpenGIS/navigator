1. useStorage should be exported for plugin authors

The recordings plugin has ~20 lines of boilerplate for storageKey(), loadStorage(), saveStorage() — reimplementing
the navigator*{namespace}*{instanceId} convention that useStorage already handles internally. If useStorage were
exported (like useUI and getMapInstance), the plugin shrinks significantly and the key convention stays
consistent.

2. Export a useMap() composable

Components currently need two steps: inject('navigatorId') → getMapInstance(id). A useMap() composable that
resolves both internally would be more Vue-idiomatic and less error-prone. The internal composable already exists
— it just needs an external-facing export.

3. Document the @vitejs/plugin-vue prerequisite

The feature example shows .vue SFC files but doesn't mention that consumers need @vitejs/plugin-vue in their Vite
config. This was a build-breaking blocker with no clear error message. A note in the extending docs (or a Vite
plugin preset) would prevent this.

4. Document available SVG sprite icons

RecordButton.vue uses <use href="#record-btn-fill" /> — but there's no list of available icon names anywhere.
Plugin authors are guessing. A simple icon reference (even just a list) in the docs would help.

5. Add once to the plugin context

NavigatorInstance exposes once(), but the plugin install context only gets on/off/emit. Plugins that need one-time
setup (like map:ready) would benefit from once too.

6. Add a plugin cleanup lifecycle

There's no destroy/teardown hook for plugins. If the instance is unmounted, plugins can't clean up timers,
geolocation watches, or map layers. A on('destroy', fn) event or a return-value convention (install returns a
cleanup function) would prevent leaks.

7. Minimum version annotations in docs

useUI was added in 1.0.20, but the feature docs referenced it while the package was at 1.0.19. Adding @since
annotations to the API tables would save debugging time.
