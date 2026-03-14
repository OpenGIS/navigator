const colours = [];

colours["primary"] = `#42c635`;

export function getColour(name = "primary") {
    if (colours[name]) {
        return colours[name];
    }

    return false;
}
