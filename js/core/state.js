console.log("STATE FILE:", import.meta.url);
const state = {
    tempDesigns: [],
    window_glass_space: 0,
    door_glass_space: 0,
    frame_glass_space: 0,
    // Paper.js
    paper: null,
    canvas: null,
    tool: null,
    // Config / Data
    unitData: {},
    currentDesignID: 0,
    calculations: {},
    // Flags
    tryingToDrag: false,
    changeMullianPositionFlag: false,
    changeWindowDoorPanelPositionFlag: false,
    waitingToAddItemFlag: false,
    deleteMode: false,
    firstLayerLoad: true,
    debug: false,
    drawFirstShapeFlag: false,
    moveItemFlag: false,
    draggingItemFlag: false,
    resizeFrameFlag: false,
    updateDimensionFlag: false,
    // Main Objects
    mainSection: null,
    mainFrame: null,
    mainFlat: null,
    selectedItem: null,
    previousSelectedItem: null,
    addNewItemType: null,
    // Groups
    dbG: null,
    glG: null,
    vMGL: null,
    vMGLT: null,
    vMGRT: null,
    hMGL: null,
    hMGTT: null,
    hMGBT: null,
    // First Objects
    firstGlass: null,
    firstGlassColor: null,
    firstGlassGroup: null,
    firstFrame: null,
    firstFrame_width: 0,
    firstDoorSash: null,
    firstDoorSash_width: 0,
    firstWindowSash: null,
    firstWindowSash_width: 0,
    firstAccessory: null,
    firstAccessoryType: null,
    firstLace: null,
    firstPanel: null,
    firstPanel_width: 0,
    firstMullian: null,
    firstMullian_width: 0,
    firstOverhung: null,
    firstOverhung_width: 0,
    firstGlazing: null,
    firstCoupling: null,
    firstCoupling_width: 0,
    firstCornic: null,
    firstBottomDoor: null,
    firstThreshold: null,
    firstEnterlock: null,
    firstEnterlock_width: 0,
    firstEnterlock_sash_space: 0,
    // Temporary
    flatHover: null,
    mouseHelperClone: null,
    // Runtime Arrays
    removedDependenceMemory: [],
    mulliansToRedraw: [],
    othersToRedraw: [],
    // Sizes
    viewZoom: 0.3,
    frameSize: 60,
    errorInDraw: false,
    panelSize: 120,
    laceSize: 20,
    frameSizeDoor: 80,
    couplingSize: 80,
    glassMarginInsideProfile: 5,
    mullianExtend: 3,
    overHungMinusLenght: 62,
    weldSize: 3,
    defaultOverlap: 8,
    laceOverlap: 3,
    moveStepFactor: 5,
    // Dimension
    DimensionBarTextSize1: 60,
    DimensionBarTextSize2: 45,
    // Paper Sizes
    windowHingSize: null,
    windowHandleSize: null,
    windowHandle2Size: null,
    doorHingSize: null,
    doorHandleSize: null,
    doorHandle2Size: null,
    // Colors
    strokeColor: null,
    frameColor: null,
    tweenFillColor: null,
    olColor: null,
    mainBarColor: null,
    otherBarColor: null,
    flatColor: null,
    flatHoverColor: null,
    panelColor: null,
    laceColor: null,
    glColor: null,
    shadowColor: null,
    shadowBlur: 15,
    glassColor: null,
    strokeWidth: 1,
    // History
    history: [],
    history_index: 0,
    // Save
    somethingChanged: false,
    saveTimeout: null,
    currentSaveRequest: null,
    // Keyboard
    shiftKeyPressed: false,
    ctrlKeyPressed: false,
    // Input
    mousePosition: {
        x: 0,
        y: 0
    },
    // jQuery
    $: window.jQuery,
    // Legacy Global Flags
    // Mouse Runtime
    mouseDownPoint: null,
    mouseDragPoint: null,
    mouseUpPoint: null,
    dragStartItem: null,
    hoverItem: null,
    // Dimension Runtime
    extra_frame_lenght: 0,
    extra_frame_length: 0,
    dimensionItems: [],
    dragThreshold: 10,
    activeLayer: null,
    firstLockType: 0,

};
window.state = state;
Object.defineProperty(state, "addNewItemType", {
    set(value) {
        console.trace("CHANGE TYPE TO:", value);
        this._addNewItemType = value;
    },
    get() {
        return this._addNewItemType;
    }
});
export default state;