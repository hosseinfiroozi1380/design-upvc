// js/events/setZoom.js
import state from "../core/state.js";
export function setZoom() {
    const canvas = document.getElementById("myCanvas");
    if (!canvas || !state.paper) {
        return;
    }
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const actualWidth = canvas.width;
    const actualHeight = canvas.height;
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
    const hasBounds =
        design &&
        design.bounds &&
        design.bounds.width > 0 &&
        design.bounds.height > 0;
    const designWidth =
        hasBounds
            ? design.bounds.width
            : 2000;
    const designHeight =
        hasBounds
            ? design.bounds.height
            : 2000;
    const isMobile =
        window.matchMedia("(max-width: 768px)").matches;
        const isSmallDesktop =
        !isMobile &&
        window.innerWidth <= 1050 &&
        window.innerWidth >= 950;
    
    const usableWidth =
        isSmallDesktop
            ? cssWidth * 0.30
            : isMobile
                ? cssWidth * 0.72
                : cssWidth * 0.4;
    
    const usableHeight =
        isSmallDesktop
            ? cssHeight * 0.58
            : isMobile
                ? cssHeight * 0.78
                : cssHeight * 0.7;
    const scaleX =
        usableWidth / designWidth;
    const scaleY =
        usableHeight / designHeight;
    const scale =
        Math.min(
            scaleX,
            scaleY
        );
    state.paper.view.zoom = scale;
    state.paper.view.center =
        hasBounds
            ? design.bounds.center
            : new state.paper.Point(
                actualWidth / 2,
                actualHeight / 2
            );
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