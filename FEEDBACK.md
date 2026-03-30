1. Pre-scoped helpers in the plugin context

This is the biggest friction point. Every call inside install() requires manually threading instanceId:

// Current — repetitive and error-prone
install({ instanceId, on }) {
const stored = useStorage('recordings', { saved: [], active: null }, instanceId);
const map = getMapInstance(instanceId);
// ...every helper call repeats instanceId
}

The fix: provide pre-bound versions on the plugin context itself:

// Proposed — instanceId is already scoped
install({ useStorage, getMap, on }) {
const stored = useStorage('recordings', { saved: [], active: null });
const map = getMap();
}

This eliminates the need for plugin authors to import useStorage or getMapInstance separately and removes a class
of bugs where the wrong ID is passed.

---

2. Reactive map ref on the plugin context

Currently, getMapInstance() returns null until MapLibre loads, so every usage must either live inside an
on('map:ready') callback or defensively null-check. The Recordings plugin has updateLine() which does if (!map ||
!map.getSource(...)) return; on every call.

A reactive shallowRef on the context would let plugin code watch for the map naturally:

install({ map }) {
// map is a shallowRef — null until ready, then the MapLibre instance
watch(map, (m) => {
if (m) {
m.addSource(...);
m.addLayer(...);
}
});
}

This would also compose well with watchEffect for code that needs to re-run when the map becomes available.

---

3. Auto-cleanup for map sources and layers

The Recordings plugin adds a source and layer in map:ready but never removes them in its cleanup function. The
cleanup only clears the timer and geolocation watch. This is a leak on unmount().

Navigator could provide addSource() / addLayer() helpers on the context that automatically remove the source/layer
when the instance unmounts:

install({ onMapReady }) {
onMapReady(({ map, addSource, addLayer }) => {
addSource('recordings-track', { type: 'geojson', data: emptyLine() });
addLayer({ id: 'recordings-track-line', type: 'line', ... });
// Automatically removed on unmount — no cleanup needed
});
}

This would eliminate the most common source of plugin cleanup bugs.

---

4. Expose useLocate / geolocation for reuse

The Recordings plugin reimplements navigator.geolocation.watchPosition from scratch, but Navigator already has an
internal useLocate composable for GPS. If this were exported, plugin authors could reuse it:

import { useLocate } from '@ogis/navigator';
// Reuse existing geolocation infrastructure instead of raw browser API
