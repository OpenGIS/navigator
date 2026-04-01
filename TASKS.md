1/ Squash

We are currently on the git branch called "dev". Use git to create a new branch from master called "merge". Compare this to the "dev" branch and create a PR-ready squashed commit with appropriate title & body that summarises changes. Use commit titles like:

- fix: fix bug in feature X
- feat: add new feature Y
- docs: update documentation for feature Z
- bump: update dependencies for feature A

2/ Maplibre GL JS defaults

Currently the default Maplibre gl js mapoptions are defined inline @src/composables/useMap . I think it would be a good idea to move these to a separate file (e.g. @src/defaults/maplibre.js) and export them as an object. This way we can import and reuse the defaults in other places (e.g. in tests) and it will be easier to maintain and update the defaults in the future.

Search for other maplibre defaults in the codebase and update them to import from the new file.
