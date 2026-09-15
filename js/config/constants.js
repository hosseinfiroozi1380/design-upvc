// src/config/constants.js
// View
export const VIEW_ZOOM = 0.3;
// Default Sizes
export const FRAME_SIZE = 60;
export const PANEL_SIZE = 120;
export const LACE_SIZE = 20;
export const COUPLING_SIZE = 80;
export const MULLIAN_SIZE = 60;
// Movement
export const MOVE_STEP = 5;
// Canvas / Drawing
export const DESIGN_DEFAULT_WIDTH = 2000;
export const DESIGN_DEFAULT_HEIGHT = 1000;
// Geometry / Calculation
export const GLASS_MARGIN_INSIDE_PROFILE = 5;
export const MULLIAN_EXTEND = 3;
export const OVER_HUNG_MINUS_LENGTH = 62;
export const WELD_SIZE = 3;
export const DEFAULT_OVERLAP = 8;
export const LACE_OVERLAP = 8;
// Shadow
export const SHADOW_BLUR = 15;
// Colors
export const COLORS = {
    stroke: "#000000",
    frame: "#ffffff",
    glass: "#4fc3f7",
    flat: "#4fc3f724",
    panel: "#ffffff",
    mullian: "#999999",
    shadow: "#999999",
    selected: "#ff9800"
};
// Text Sizes
export const TEXT_SIZE = {
    small: 20,
    normal: 35,
    large: 60
};
// Default Values
export const DEFAULTS = {
    frameSize: FRAME_SIZE,
    panelSize: PANEL_SIZE,
    laceSize: LACE_SIZE,
    couplingSize: COUPLING_SIZE,
    zoom: VIEW_ZOOM
};
// Debug
export const DEBUG_MODE = false;
// Handles
export const windowHandleSize = {
    width: 25,
    height: 50
};
export const windowHandle2Size = {
    width: 16,
    height: 80
};
export const doorHandleSize = {
    width: 40,
    height: 120
};
export const doorHandle2Size = {
    width: 16,
    height: 90
};
// Hinges
export const windowHingSize = {
    width: 20,
    height: 70
};
export const doorHingSize = {
    width: 20,
    height: 70
};
// Default Export
export default {
    VIEW_ZOOM,
    FRAME_SIZE,
    PANEL_SIZE,
    LACE_SIZE,
    COUPLING_SIZE,
    MULLIAN_SIZE,
    MOVE_STEP,
    DESIGN_DEFAULT_WIDTH,
    DESIGN_DEFAULT_HEIGHT,
    COLORS,
    TEXT_SIZE,
    DEFAULTS,
    DEBUG_MODE,
    windowHandleSize,
    windowHandle2Size,
    doorHandleSize,
    doorHandle2Size,
    windowHingSize,
    doorHingSize,
    GLASS_MARGIN_INSIDE_PROFILE,
    MULLIAN_EXTEND,
    OVER_HUNG_MINUS_LENGTH,
    WELD_SIZE,
    DEFAULT_OVERLAP,
    LACE_OVERLAP,
    SHADOW_BLUR
};