// src/drawing/drawOpeningLines.js
import state from "../core/state.js";
export function drawOpeningLines(
    olType,
    handlePosition,
    handlePositions,
    hingePsition,
    hingePositions,
    itemGroup
) {
    if (handlePosition === "invisible") {
        switch (hingePsition) {
            case "left":
                handlePosition = "right";
                break;
            case "right":
                handlePosition = "left";
                break;
            case "top":
                handlePosition = "bottom";
                break;
            case "bottom":
                handlePosition = "top";
                break;
        }
    }
    let olPath;
    if (["normal"].includes(olType)) {
        olPath = new state.paper.Path();
        olPath.moveTo(
            hingePositions[hingePsition][0] ?? itemGroup.bounds.center
        );
        olPath.lineTo(
            handlePositions[handlePosition] ?? itemGroup.bounds.center
        );
        olPath.lineTo(
            hingePositions[hingePsition][hingePositions[hingePsition].length - 1]
            ?? itemGroup.bounds.center
        );
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = "ol";
        itemGroup.addChild(olPath);
    }
    else if (["dual"].includes(olType)) {
        if (handlePosition === "left") {
            olPath = new state.paper.Path();
            olPath.moveTo(itemGroup.bounds.topRight);
            olPath.lineTo(itemGroup.bounds.leftCenter);
            olPath.lineTo(itemGroup.bounds.bottomRight);
            olPath.strokeColor = state.olColor;
            olPath.strokeWidth = 2;
            olPath.name = "ol";
            itemGroup.addChild(olPath);
        } else {
            olPath = new state.paper.Path();
            olPath.moveTo(itemGroup.bounds.topLeft);
            olPath.lineTo(itemGroup.bounds.rightCenter);
            olPath.lineTo(itemGroup.bounds.bottomLeft);
            olPath.strokeColor = state.olColor;
            olPath.strokeWidth = 2;
            olPath.name = "ol";
            itemGroup.addChild(olPath);
        }
        olPath = new state.paper.Path();
        olPath.moveTo(itemGroup.bounds.bottomLeft);
        olPath.lineTo(itemGroup.bounds.topCenter);
        olPath.lineTo(itemGroup.bounds.bottomRight);
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = "ol";
        itemGroup.addChild(olPath);
    }
    else if (["radial"].includes(olType)) {
        olPath = new state.paper.Path();
        olPath.moveTo(
            handlePositions["bottom"] ?? itemGroup.bounds.center
        );
        olPath.lineTo(
            handlePositions["left"] ?? itemGroup.bounds.center
        );
        olPath.lineTo(
            handlePositions["top"] ?? itemGroup.bounds.center
        );
        olPath.lineTo(
            handlePositions["right"] ?? itemGroup.bounds.center
        );
        olPath.lineTo(
            handlePositions["bottom"] ?? itemGroup.bounds.center
        );
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = "ol";
        itemGroup.addChild(olPath);
    }
    else if (["volkswagen"].includes(olType)) {
        if (handlePosition === "left") {
            olPath = new state.paper.Path();
            olPath.moveTo(
                handlePositions["left"] ?? itemGroup.bounds.center
            );
            olPath.lineTo(
                handlePositions["top"] ?? itemGroup.bounds.center
            );
            olPath.lineTo(
                handlePositions["top"] && handlePositions["left"]
                    ? [
                        handlePositions["top"].x,
                        handlePositions["left"].y
                      ]
                    : itemGroup.bounds.center
            );
            olPath.lineTo(
                handlePositions["right"] ?? itemGroup.bounds.center
            );
            olPath.lineTo([
                handlePositions["right"].x - 100,
                handlePositions["right"].y - 100
            ]);
            olPath.strokeColor = state.olColor;
            olPath.strokeWidth = 2;
            olPath.name = "ol";
            itemGroup.addChild(olPath);
        }
        else if (handlePosition === "right") {
            olPath = new state.paper.Path();
            olPath.moveTo(
                handlePositions["right"] ?? itemGroup.bounds.center
            );
            olPath.lineTo(
                handlePositions["top"] ?? itemGroup.bounds.center
            );
            olPath.lineTo([
                handlePositions["top"].x,
                handlePositions["right"].y
            ]);
            olPath.lineTo(
                handlePositions["left"]
            );
            olPath.lineTo([
                handlePositions["left"].x + 100,
                handlePositions["left"].y - 100
            ]);
            olPath.strokeColor = state.olColor;
            olPath.strokeWidth = 2;
            olPath.name = "ol";
            itemGroup.addChild(olPath);
        }
    }
}