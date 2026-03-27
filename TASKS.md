#Tasks

1/ Rename @src/panels/locate.vue view.vue and update all references. Underneath the copy this link button should be a subtle dividerand then two, secondary buttons:

- View on OSM: This button should open the current map view on the OpenStreetMap website. The URL should be in the format https://www.openstreetmap.org/#map={zoom}/{lat}/{lng} where zoom, lat, and lng are replaced with the current map view values.

- Edit on OSM: This button should open the current map view in the OpenStreetMap editor. The URL should be in the format https://www.openstreetmap.org/edit#map={zoom}/{lat}/{lng} where zoom, lat, and lng are replaced with the current map view values.

2/ The Navigator.init() API should accept an appName parameter that can be used to specify a name other than "Navigator" (default).
