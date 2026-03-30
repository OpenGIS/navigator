1. Export useLocale and useSettings

These composables exist internally but aren't exported. They're exactly what plugin authors need:

- The Recordings plugin hardcodes formatDistance() with metric units. If useSettings were available, it could
  respect the user's unit preference (metric vs imperial).
- A plugin adding localized UI has no way to access the current locale or translations — useLocale would solve
  this.

Exporting them (even as "advanced" API) would let plugins integrate more naturally with Navigator's existing UX.
