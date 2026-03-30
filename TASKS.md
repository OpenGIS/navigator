# Squash

We are currently on the git branch called "dev". Use git to create a new branch from master called "merge". Compare this to the "dev" branch and create a PR-ready squashed commit with appropriate title & body that summarises changes. Use commit titles like:

- fix: fix bug in feature X
- feat: add new feature Y
- docs: update documentation for feature Z
- bump: update dependencies for feature A

# Vue

Improve the panel api documented in @docs/dev/1.config.md with to support for Vue JS components. Currently the panels and buttons only support native dom elements. The consuming library should be able to provide native vue components. Update developer documentation to use vue, as this is the preferred method of integration. Update @docs/dev/8.extending.md to use vue components as examples for extending the navigator.

# Menu

# Panel Nvigation

# Extending

Let's improve the developer docs, specifically the @docs/dev/7.features.md . I want you to rewrite the "Adding Features to Navigator" section to highight the integration methods documented in @docs/dev/8.extending.md . By way of example, create a new Recordings feature that integrates as a vue plugin. The full plugin code should be included in the documentation, like with the green theme sass example @docs/dev/6.theme.md so that developers could copy and paste the code to create their own feature. As you build this example,
