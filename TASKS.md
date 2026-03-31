# Squash

We are currently on the git branch called "dev". Use git to create a new branch from master called "merge". Compare this to the "dev" branch and create a PR-ready squashed commit with appropriate title & body that summarises changes. Use commit titles like:

- fix: fix bug in feature X
- feat: add new feature Y
- docs: update documentation for feature Z
- bump: update dependencies for feature A

# Vue

Improve the panel api documented in @docs/core/1.config.md with to support for Vue JS components. Currently the panels and buttons only support native dom elements. The consuming library should be able to provide native vue components. Update developer documentation to use vue, as this is the preferred method of integration. Update @docs/extend/2.buttons-panels.md to use vue components as examples for extending the navigator.

# Menu

Update the app top navigation bar to be more flexible. Currently @src/components/ui/top.vue the navbar has a left/middle/right positioned icon buttons. I want to make this more programtic, so that developers can modify/add/remove/replace icon buttons in the navbar as vue components. This can also be used to completely change the navbar dynamically, for example a consuming app may want to add their own custom navbar. I would also like to make this more friendly for reording, to support both RLS and LTR languages (a future consideration) for example. So the concept of start/end instead of left/right. The top nav should be able to accept any number of buttons, with the first aligned to the start, and the last aligned to the end (use bootstrap best practises). 3+ buttons will be added to the middle, evenly spaced. Update the documentation @docs/extend/2.buttons-panels.md to reflect these changes, and provide an example of how you would add a centered icon button to the navbar using the new API. Add a github-style alert to the @docs/core/5.locale.md about the future support for RTL languages, and how the new navbar API will support this when it arrives.

# Testing

# Extending

Let's improve the developer docs, specifically the @docs/extend/5.features.md . I want you to rewrite the "Adding Features to Navigator" section to highight the integration methods documented in @docs/extend/README.md . By way of example, create a new Recordings feature that integrates as a vue plugin. The full plugin code should be included in the documentation, like with the green theme sass example @docs/extend/6.theme.md so that developers could copy and paste the code to create their own feature. The recordings plugin should be a complete, but minimal feature. It should have:

- A centre-aligned Record Button in the top navbar that toggles recording on/off. The button starts/pauses recording, and changes label and color to indicate the recording state (e.g. red when recording, grey when paused). When pause is presses, this should open a simple Recordings panel.

- The Recordings panel should display simple information about the current recording track, such as duration and distance. It should also have "Pause/Resume", "Discard", "Save" button that saves the recording data to localStorage (using @src/composables/useStorage.js) If there is an active recording, it should also be saved to local storage so that it can be resumed if the user accidentally refreshes the page.

- When a recording is active, the map should display a blue (primary brand sass colour @docs/core/6.theme.md) line showing the path of the recording. This line should update in real time as the recording progresses. When the recording is paused, the line should turn grey.

- The recordings panel should show a list of past recordings saved in localStorage, with the option to show/delete/download(as GPX) them. Each recording should display its duration, distance, and a timestamp of when it was recorded.

Remember to include the full plugin code in the documentation, and to update the "Adding Features to Navigator" section to highlight this new integration method.
