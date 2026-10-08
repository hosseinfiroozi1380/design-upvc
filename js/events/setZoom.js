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
    const designItems = activeLayer.getItems({
        name: "mainFrame"
    });
    let designBounds = null;
    designItems.forEach(item => {
        if (!item.bounds || item.bounds.width <= 0 || item.bounds.height <= 0) {
            return;
        }
        if (!designBounds) {
            designBounds = item.bounds.clone();
        } else {
            designBounds = designBounds.unite(item.bounds);
        }
    });
    if (!designBounds) {
        const mainFrames = activeLayer.getItems({
            name: "mainFrame"
        });
        if (mainFrames.length === 1 && mainFrames[0].bounds) {
            designBounds = mainFrames[0].bounds.clone();
        }
    }
    const hasBounds =
        designBounds &&
        designBounds.width > 0 &&
        designBounds.height > 0;
    const designWidth =
        hasBounds
            ? designBounds.width
            : 2000;
    const designHeight =
        hasBounds
            ? designBounds.height
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
                : cssWidth * 0.7;
    
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
        designWidth === 1000 && designHeight === 1000
            ? Math.min(
                cssWidth * (isMobile ? 0.70 : 0.4) / designWidth,
                cssHeight * 0.7 / designHeight
            )
            : Math.min(
                scaleX,
                scaleY
            );
    state.paper.view.zoom = scale;
    state.paper.view.center =
        hasBounds
            ? designBounds.center
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
                state.paper.view.zoom = newZoom;
                $("#rangeInput").val(newZoom);
            }
        );
}