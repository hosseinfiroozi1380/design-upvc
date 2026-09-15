// src/drawing/rebuildAccessoryMenu.js
import state from "../core/state.js";

export function rebuildAccessoryMenu(
    addNewItemType,
    accessory_id = false
) {
    console.log(
        "rebuildAccessoryMenu received:",
        addNewItemType
    );

    if (!addNewItemType) {
        console.error(
            "addNewItemType is null or undefined"
        );
        return;
    }

    if (!accessory_id) {
        accessory_id = state.unitData.accessory_id;
    }
    let openingType = "window";
    if (addNewItemType.indexOf("door") !== -1) {
        openingType = "door";
    }
    let opening = "simple";
    if (addNewItemType.indexOf("_top") !== -1) {
        opening = "top";
    } else if (addNewItemType.indexOf("_bottom") !== -1) {
        opening = "bottom";
    } else if (addNewItemType.indexOf("dual") !== -1) {
        opening = "dual";
    } else if (addNewItemType.indexOf("radial") !== -1) {
        opening = "radial";
    } else if (addNewItemType.indexOf("volkswagen") !== -1) {
        opening = "volkswagen";
    } else if (addNewItemType.indexOf("french_simple") !== -1) {
        opening = "french_simple";
    } else if (addNewItemType.indexOf("french_dual") !== -1) {
        opening = "french_dual";
    } else if (addNewItemType.indexOf("accordion") !== -1) {
        opening = "accordion";
    } else if (addNewItemType.indexOf("slide") !== -1) {
        opening = "slide";
        if (addNewItemType.indexOf("lift&slide") !== -1) {
            opening = "lift&slide";
        }
    }
    $('.accessoryTypeInput[data-id="accessoryType"] option')
        .hide();
    $('.accessoryTypeInput[data-id="accessoryType"] option')
        .attr("disabled", true);
    $('.accessoryTypeInput[data-id="accessoryType"] option[data-accessoryCompany=' 
        + accessory_id +
        '][data-type=' 
        + openingType +
        '][data-system=' 
        + state.unitData.system +
        '][data-opening=' 
        + opening +
        ']')
        .show();
    $('.accessoryTypeInput[data-id="accessoryType"] option[data-accessoryCompany=' 
        + accessory_id +
        '][data-type=' 
        + openingType +
        '][data-system=' 
        + state.unitData.system +
        '][data-opening=' 
        + opening +
        ']')
        .attr("disabled", false);
}