// js/events/setZoom.js
import state from "../core/state.js";
export function setZoom() {
    const canvas = document.getElementById("myCanvas");
    if (!canvas || !state.paper) {
        return;
    }
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const project = state.paper.project;
    const activeLayer = project?.activeLayer;
    if (!activeLayer) {
        return;
    }
    let design = null;
    if (
        state.mainSection &&
        state.mainSection.isInserted
    ) {
        design = state.mainSection;
    }
    if (!design && state.currentDesignID) {
        const sections = activeLayer.getItems({
            name: "section"
        });
        const targetSection = sections.find(
            section => {
                const designID =
                    section?.data?.designID;
                return (
                    String(designID) ===
                    String(state.currentDesignID)
                );
            }
        );
        if (targetSection) {
            design = targetSection;
        }
    }
    if (!design) {
        const sections = activeLayer.getItems({
            name: "section"
        });
        if (sections.length === 1) {
            design = sections[0];
        }
    }
    if (!design) {
        const mainFrames = activeLayer.getItems({
            name: "mainFrame"
        });
        if (mainFrames.length === 1) {
            design = mainFrames[0];
        }
    }
    if (!design) {
        return;
    }
    const bounds = design.bounds.clone();
    const hasBounds =
        bounds &&
        bounds.width > 0 &&
        bounds.height > 0;
    if (!hasBounds) {
        return;
    }
    const designWidth = bounds.width;
    const designHeight = bounds.height;
    const isMobile =
        window.matchMedia("(max-width: 768px)").matches;
    let padding;
    if (isMobile) {
        padding = 0.65;
    } else {
        padding = 0.45;
    }
    // نسبت Canvas
    const canvasRatio =
        cssWidth / cssHeight;

    // نسبت طراحی
    const designRatio =
        designWidth / designHeight;

    // فضای اصلی برای نمایش
    const baseSize =
        Math.min(
            cssWidth,
            cssHeight
        ) * padding;

    // محاسبه زوم بر اساس ضلع کوتاه طراحی
    let scale;

    if (designRatio >= 1) {

        // طراحی افقی
        scale =
            baseSize / designHeight;

    } else {

        // طراحی عمودی
        scale =
            baseSize / designWidth;
    }
    state.paper.view.zoom = scale;
    state.paper.view.center =
        bounds.center;
    state.paper.view.update();
    $("#rangeInput").val(scale);
    $("#myCanvas")
        .off("mousewheel.setZoom")
        .on(
            "mousewheel.setZoom",
            function (event) {
                event.preventDefault();
                const oldZoom =
                    state.paper.view.zoom;
                const newZoom =
                    event.deltaY > 0
                        ? oldZoom * 1.1
                        : oldZoom / 1.1;
                state.paper.view.zoom =
                    newZoom;
                $("#rangeInput").val(newZoom);
            }
        );
}