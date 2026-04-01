1/ Squash

We are currently on the git branch called "dev". Use git to create a new branch from master called "merge". Compare this to the "dev" branch and create a PR-ready squashed commit with appropriate title & body that summarises changes. Use commit titles like:

- fix: fix bug in feature X
- feat: add new feature Y
- docs: update documentation for feature Z
- bump: update dependencies for feature A

2/ Currently the @docs/extend/5.features.md example implements a recording feature, @docs/extend/6.theme.md implements a green theme. I want to restructure the docs so that the source for these two examples are located in @docs/extend/examples/feature/ & @docs/extend/examples/theme/ respectively. Each example should contain an index.html that demonstrates the feature/theme in action. This can be run in development to test the example, and also built and deployed as a static page for users to view. Update the documentation to reflect the new file structure and ensure all links are working correctly. This will make it easier for users to find and understand the examples, and also keep the documentation organized.
