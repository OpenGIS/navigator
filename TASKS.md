1/ Squash

We are currently on the git branch called "dev". Use git to create a new branch from master called "merge". Compare this to the "dev" branch and create a PR-ready squashed commit with appropriate title & body that summarises changes. Use commit titles like:

- fix: fix bug in feature X
- feat: add new feature Y
- docs: update documentation for feature Z
- bump: update dependencies for feature A

2/ Currently the @docs/extend/5.features.md example implements drawing and updating a maplibre Line @docs/extend/feature/recordings.js After implementing the example, I notice that this renders correctly when testing on a desktop browser, but on mobile the line does not render at all. This occurs on multiple mobile browsers. It would appear that data about the track is being collected - distance and duration both have positive values and are incrementing when recording, but no line is drawn.

Instead of just diagnosing this one issue, I want you to create a navigator api for rendering geojson data. I want this to be a thin layer on top of maplibre that abstracts away the details of rendering geojson data (sources and style layers) and provides a simple interface for adding, updating, and removing geojson features. Providing styles for the features should be optional, and if not provided, default styles should be applied. For example line colour could be specified as a geojson "navigator." property on the geojson feature, and if not provided, a default colour. The default colour should be a random bright primary colour variation to help distinguish different features. The API should also provide a way to set the default styles for different geometry types (point, line, polygon) and allow these to be overridden on a per-feature basis using the "navigator." properties.

Backwards compatibility is not required, as the library is in early development - I want to nail the geojson:mablibre rendering API first, then update the existing recording example to use this new API. The API should be documented (I think this should belong in @docs/core/5.geojson.md - change numbered filenames across docs) and include examples of how to use it to render different types of geojson features with custom styles. The implementation should be efficient (i.e. not creating a new source and layer for every feature update, cleaning up old sources and layers when features are removed) and work well on both desktop and mobile browsers.

The geojson api should have full test coverage. Unit tests are currently preferred for efficiency, but if there are any parts of the implementation that are difficult to test with unit tests, you can use e2e tests instead. The tests should cover adding, updating, and removing features, as well as applying custom styles and default styles. You should also include tests for edge cases, such as adding features with invalid geojson or styles.
