# Bugs

1/ There is a bug with Chrome desktop where the map is not zoomable using the mouse scroll wheel. The app works correctly everywhere else tested, including Chrome mobile. Instead of zooming the map, the entire app gets "pulled" up and down, indicating that the browser is treating the gesture as a scroll instead of a zoom. Diagnose this issue and implement a fix.

2/ When testing on a mobile device I can pinch to zoom on the top navbar @top which zooms the entire page. The app is always in fulscreen mode, so zooming the viewport should be disabled, or max view set to 1.

3/ @src/components/ui/top/locate.vue contains an element with id locate-button. However because Navigator support multiple instances, this should be either scoped to the instance or use a class instead of an id.
