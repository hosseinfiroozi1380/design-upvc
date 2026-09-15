// src/utils/cancelAll.js
import state from "../core/state.js";
import { mouseHelperHide } from "../events/mouseHelperHide.js";
import { hideGLs } from "./hideGLs.js";
export function cancelAll() {
    if (!state.paper) {
        return;
    }
    state.paper.project.deselectAll();
    state.waitingToAddItemFlag = false;
    state.changeMullianPositionFlag = false;
    state.changeWindowDoorPanelPositionFlag = false;
    state.tryingToDrag = false;
    state.paper.project.activeLayer.selected = false;
    state.selectedItem = false;
    state.deleteMode = false;
    $('.dellItem').removeClass('text-danger');
    mouseHelperHide();
    $('.frameConfig').hide();
    $('.doorSashConfig').hide();
    $('.windowSashConfig').hide();
    $('.panelConfig').hide();
    $('.mullianConfig').hide();
    $('.accessoryConfig').hide();
    $('.laceConfig').hide();
    $('.glazingConfig').hide();
    $('.positionConfig').hide();
    $('.glassConfig').hide();
    $('.couplingConfig').hide();
    hideGLs();
}