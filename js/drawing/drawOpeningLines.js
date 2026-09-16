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
        const handlePoint =
            handlePositions[handlePosition] ?? itemGroup.bounds.center;
        const handleOffset = 25;
        let adjustedHandlePoint = handlePoint;
        if (handlePosition === "right") {
            adjustedHandlePoint = new state.paper.Point(
                handlePoint.x - handleOffset,
                handlePoint.y
            );
        } else if (handlePosition === "left") {
            adjustedHandlePoint = new state.paper.Point(
                handlePoint.x + handleOffset,
                handlePoint.y
            );
        } else if (handlePosition === "top") {
            adjustedHandlePoint = new state.paper.Point(
                handlePoint.x,
                handlePoint.y + handleOffset
            );
        } else if (handlePosition === "bottom") {
            adjustedHandlePoint = new state.paper.Point(
                handlePoint.x,
                handlePoint.y - handleOffset
            );
        }
        olPath.lineTo(adjustedHandlePoint);
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

        const handleOffset = 25;
    
        const leftTip = new state.paper.Point(
            itemGroup.bounds.leftCenter.x + handleOffset,
            itemGroup.bounds.leftCenter.y
        );
    
        const rightTip = new state.paper.Point(
            itemGroup.bounds.rightCenter.x - handleOffset,
            itemGroup.bounds.rightCenter.y
        );
    
        const topTip = new state.paper.Point(
            itemGroup.bounds.topCenter.x,
            itemGroup.bounds.topCenter.y + handleOffset
        );
    
        if (handlePosition === "left") {
    
            olPath = new state.paper.Path();
    
            olPath.moveTo(
                hingePositions["right"][0] ?? itemGroup.bounds.topRight
            );
    
            olPath.lineTo(leftTip);
    
            olPath.lineTo(
                hingePositions["right"][hingePositions["right"].length - 1]
                ?? itemGroup.bounds.bottomRight
            );
    
            olPath.strokeColor = state.olColor;
            olPath.strokeWidth = 2;
            olPath.name = "ol";
            itemGroup.addChild(olPath);
    
        } else {
    
            olPath = new state.paper.Path();
    
            olPath.moveTo(
                hingePositions["left"][0] ?? itemGroup.bounds.topLeft
            );
    
            olPath.lineTo(rightTip);
    
            olPath.lineTo(
                hingePositions["left"][hingePositions["left"].length - 1]
                ?? itemGroup.bounds.bottomLeft
            );
    
            olPath.strokeColor = state.olColor;
            olPath.strokeWidth = 2;
            olPath.name = "ol";
            itemGroup.addChild(olPath);
        }
    
        olPath = new state.paper.Path();
    
        olPath.moveTo(
            hingePositions["bottom"][0] ?? itemGroup.bounds.bottomLeft
        );
    
        olPath.lineTo(topTip);
    
        olPath.lineTo(
            hingePositions["bottom"][hingePositions["bottom"].length - 1]
            ?? itemGroup.bounds.bottomRight
        );
    
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = "ol";
    
        itemGroup.addChild(olPath);
    }
    else if (["radial"].includes(olType)) {
        const offset = 25;
        const bottom = new state.paper.Point(
            handlePositions["bottom"]?.x,
            handlePositions["bottom"]?.y - offset
        );
        const left = new state.paper.Point(
            handlePositions["left"]?.x + offset,
            handlePositions["left"]?.y
        );
        const top = new state.paper.Point(
            handlePositions["top"]?.x,
            handlePositions["top"]?.y + offset
        );
        const right = new state.paper.Point(
            handlePositions["right"]?.x - offset,
            handlePositions["right"]?.y
        );
        olPath = new state.paper.Path();
        olPath.moveTo(bottom);
        olPath.lineTo(left);
        olPath.lineTo(top);
        olPath.lineTo(right);
        olPath.lineTo(bottom);
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        olPath.name = "ol";
        itemGroup.addChild(olPath);
    }
    else if (["volkswagen"].includes(olType)) {
        const offset = 25;
        if (handlePosition === "left") {
            const left = handlePositions["left"] ?? itemGroup.bounds.center;
            const top = handlePositions["top"] ?? itemGroup.bounds.center;
            const right = handlePositions["right"] ?? itemGroup.bounds.center;
            olPath = new state.paper.Path();
            olPath.moveTo(
                new state.paper.Point(
                    left.x + offset,
                    left.y
                )
            );
            olPath.lineTo(top);
            olPath.lineTo(
                new state.paper.Point(
                    top.x,
                    left.y
                )
            );
            olPath.lineTo(
                new state.paper.Point(
                    right.x - offset,
                    right.y
                )
            );
            olPath.lineTo([
                right.x - 100,
                right.y - 100
            ]);
            olPath.strokeColor = state.olColor;
            olPath.strokeWidth = 2;
            olPath.name = "ol";
            itemGroup.addChild(olPath);
        } else if (handlePosition === "right") {
            const right = handlePositions["right"] ?? itemGroup.bounds.center;
            const top = handlePositions["top"] ?? itemGroup.bounds.center;
            const left = handlePositions["left"] ?? itemGroup.bounds.center;
            olPath = new state.paper.Path();
            olPath.moveTo(
                new state.paper.Point(
                    right.x - offset,
                    right.y
                )
            );
            olPath.lineTo(top);
            olPath.lineTo([
                top.x,
                right.y
            ]);
            olPath.lineTo(
                new state.paper.Point(
                    left.x + offset,
                    left.y
                )
            );
            olPath.lineTo([
                left.x + 100,
                left.y - 100
            ]);
            olPath.strokeColor = state.olColor;
            olPath.strokeWidth = 2;
            olPath.name = "ol";
            itemGroup.addChild(olPath);
        }
    }
}