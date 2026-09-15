// src/core/init.js
console.log("INIT FILE:", import.meta.url);
import state from "./state.js";
import {
    VIEW_ZOOM,
    FRAME_SIZE,
    PANEL_SIZE,
    MOVE_STEP,
    COLORS,
    LACE_SIZE,
    COUPLING_SIZE,
    GLASS_MARGIN_INSIDE_PROFILE,
    MULLIAN_EXTEND,
    OVER_HUNG_MINUS_LENGTH,
    WELD_SIZE,
    DEFAULT_OVERLAP
} from "../config/constants.js";
import {
    setupPaper
} from "./paperSetup.js";
import {
    setZoom
} from "../events/setZoom.js";
export function initApplication() {
    // Setup Paper
    if (!state.paper) {
        const paperReady = setupPaper();
        if (!paperReady) {
            console.error(
                "Paper setup failed"
            );
            return false;
        }
    }
    // Default Data
    state.unitData = {};
    state.currentDesignID = 0;
    state.calculations = {
        mainFrame: {},
        windowFrame: {},
        doorFrame: {},
        mullian: {}
    };
    // Paper Objects
    if (!state.tool) {
        state.tool =
            new state.paper.Tool();
    }
    state.activeLayer =
        state.paper.project.activeLayer;
    // View / Size Config
    state.viewZoom =
        VIEW_ZOOM;
    state.frameSize =
        FRAME_SIZE;
    state.panelSize =
        PANEL_SIZE;
    state.moveStepFactor =
        MOVE_STEP;
    // Colors
    if (COLORS) {
        state.frameColor =
            new state.paper.Color(
                COLORS.frame
            );
        state.glassColor =
            new state.paper.Color(
                COLORS.glass
            );
    }
    // Main Objects Reset
    state.mainSection = null;
    state.mainFrame = null;
    state.mainFlat = null;
    state.selectedItem = null;
    state.previousSelectedItem = null;
    state.addNewItemType = null;
    // Groups
    state.dbG = null;
    state.glG = null;
    state.vMGL = null;
    state.vMGLT = null;
    state.vMGRT = null;
    state.hMGL = null;
    state.hMGTT = null;
    state.hMGBT = null;
    // Runtime
    state.removedDependenceMemory = [];
    state.mulliansToRedraw = [];
    state.othersToRedraw = [];
    // History
    state.history = [];
    state.history_index = 0;
    // Save
    state.somethingChanged = false;
    state.saveTimeout = null;
    state.currentSaveRequest = null;
    // Flags
    state.tryingToDrag = false;
    state.changeMullianPositionFlag = false;
    state.changeWindowDoorPanelPositionFlag = false;
    state.waitingToAddItemFlag = false;
    state.deleteMode = false;
    state.firstLayerLoad = true;
    // Input
    state.shiftKeyPressed = false;
    state.ctrlKeyPressed = false;
    console.log(
        "Design application initialized",
        state.paper.project
    );
    // Zoom
    setZoom();
    // Open New Unit Menu
    // First Load
    // if (
    //     !state.unitData ||
    //     Object.keys(state.unitData).length === 0
    // ) {
    //     setTimeout(() => {
    //         $('#ofcAddNew')
    //             .offcanvas('show');
    //     }, 100);
    // }
    return state;
}
export default initApplication;