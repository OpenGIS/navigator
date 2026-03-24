# To-Do List

## Modals

1/ There should be screenshots for the @docs/features/locate.md "Confirmation modal" & "Permission denied modal" sections
2/ The modals should display over all other content. Currently the navbar obscures the modal on small screens. Use bootstrap conventions to fix, likely using css z-index.
3/ Currently on first load an @src/components/ui/top/alerts.vue is displayed. I want to remove the alerts completely, and instead I want to create an "About" modal. This will be displayed to the user on first load, and will also be accessible via an "About" button @src/components/ui/side/menu.vue (to appear after the Settings button).
4/ Update @docs/core.md First load section, create tests and add a screenshot of the about modal (follow "document first" approach @README.md)
