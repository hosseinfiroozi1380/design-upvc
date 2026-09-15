import state from "./state.js";
export function setupPaper() {
    const canvas =
        document.getElementById("myCanvas");
    if (!canvas) {
        console.error(
            "Canvas #myCanvas not found"
        );
        return false;
    }
    state.canvas = canvas;
    // initialize paper.js
    paper.setup(canvas);
    state.paper = paper;
    // Create Paper Objects
    state.tool =
        new state.paper.Tool();
    // Sizes
    state.windowHingSize =
        new state.paper.Size(20, 70);
    state.windowHandleSize =
        new state.paper.Size(25, 50);
    state.windowHandle2Size =
        new state.paper.Size(16, 80);
    state.doorHingSize =
        new state.paper.Size(20, 70);
    state.doorHandleSize =
        new state.paper.Size(40, 120);
    state.doorHandle2Size =
        new state.paper.Size(16, 90);
    // Colors
    state.strokeColor =
        new state.paper.Color("#000000");
        state.frameColor =
        new state.paper.Color("#e6e6e6");
    state.tweenFillColor =
        new state.paper.Color("#f0ffe4");
    // رنگ پر ابی خط ها > <
    state.olColor =
        new state.paper.Color("#0611dd");
    state.mainBarColor =
        new state.paper.Color("#000000");
    state.otherBarColor =
        new state.paper.Color("#000000");
    state.flatColor =
        new state.paper.Color("#8acde8");
    state.flatHoverColor =
        new state.paper.Color("#00000015");
    state.panelColor =
        new state.paper.Color("#ffffff");
    state.laceColor =
        new state.paper.Color("#999999");
    state.glColor =
        new state.paper.Color("#0611dd");
    state.shadowColor =
        new state.paper.Color("#999999");
    // Paper Layer
    state.activeLayer =
        state.paper.project.activeLayer;
    console.log(
        "Paper setup complete",
        state.paper.project
    );
    return true;
}
export default setupPaper;