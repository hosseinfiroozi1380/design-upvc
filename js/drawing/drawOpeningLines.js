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
        // خط بازشوی راست / چپ
        if (handlePosition === "left") {
            olPath = new state.paper.Path();
            olPath.moveTo(
                hingePositions["right"][0] ?? itemGroup.bounds.topRight
            );
            olPath.lineTo(leftTip);
            olPath.lineTo(
                hingePositions["right"][
                hingePositions["right"].length - 1
                ] ?? itemGroup.bounds.bottomRight
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
                hingePositions["left"][
                hingePositions["left"].length - 1
                ] ?? itemGroup.bounds.bottomLeft
            );
            olPath.strokeColor = state.olColor;
            olPath.strokeWidth = 2;
            olPath.name = "ol";
            itemGroup.addChild(olPath);
        }
        // فقط خط بازشوی رو به بالا
        olPath = new state.paper.Path();
        olPath.moveTo(
            hingePositions["bottom"][0] ??
            itemGroup.bounds.bottomLeft
        );
        olPath.lineTo(topTip);
        olPath.lineTo(
            hingePositions["bottom"][
            hingePositions["bottom"].length - 1
            ] ?? itemGroup.bounds.bottomRight
        );
        olPath.strokeColor = state.olColor;
        olPath.strokeWidth = 2;
        // فقط همین خط خط‌چین باشد
        olPath.style.dashArray = [60, 25];
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
        const tipLength = 60;
        const tipHeight = 60;
        const bounds = itemGroup.bounds;
    
        // پیدا کردن محدوده واقعی شیشه
        const glass = itemGroup.getItems({
            name: "flat",
            recursive: true
        })[0];
    
        const glassBounds = glass ? glass.bounds : bounds;
    
        // نقطه وسط بالای فاصله بین فریم اصلی و شیشه
        const topPoint = new state.paper.Point(
            glassBounds.center.x,
            bounds.top + (glassBounds.top - bounds.top) / 2
        );
    
        if (handlePosition === "left") {
            // شروع دقیقاً از کف شیشه در سمت چپ
            const startPoint = new state.paper.Point(
                glassBounds.left,
                glassBounds.bottom
            );
    
            // نقطه میانی کمی سمت راست مرکز شیشه
            const middlePoint = new state.paper.Point(
                glassBounds.center.x + glassBounds.width * 0.20,
                glassBounds.center.y
            );
    
            // انتهای مسیر در سمت راست
            const handlePoint = new state.paper.Point(
                glassBounds.right - offset,
                middlePoint.y
            );
    
            // مسیر اصلی؛ همه خطوط حفظ شده‌اند
            olPath = new state.paper.Path();
            olPath.add(startPoint);
            olPath.add(topPoint);
            olPath.add(middlePoint);
            olPath.add(handlePoint);
    
            olPath.style = {
                strokeColor: state.olColor,
                strokeWidth: 2,
                fillColor: null
            };
    
            olPath.name = "ol";
            itemGroup.addChild(olPath);
    
            // مثلث فلش کامل با سه ضلع
            const arrowPath = new state.paper.Path();
    
            const arrowTop = new state.paper.Point(
                handlePoint.x - tipLength,
                handlePoint.y - tipHeight
            );
    
            const arrowBottom = new state.paper.Point(
                handlePoint.x - tipLength,
                handlePoint.y + tipHeight
            );
    
            arrowPath.add(arrowTop);
            arrowPath.add(handlePoint);
            arrowPath.add(arrowBottom);
            arrowPath.add(arrowTop);
    
            arrowPath.style = {
                strokeColor: state.olColor,
                strokeWidth: 2,
                fillColor: null
            };
    
            arrowPath.name = "olArrow";
            itemGroup.addChild(arrowPath);
    
        } else if (handlePosition === "right") {
            // شروع دقیقاً از کف شیشه در سمت راست
            const startPoint = new state.paper.Point(
                glassBounds.right,
                glassBounds.bottom
            );
    
            // نقطه میانی کمی سمت چپ مرکز شیشه
            const middlePoint = new state.paper.Point(
                glassBounds.center.x - glassBounds.width * 0.20,
                glassBounds.center.y
            );
    
            // انتهای مسیر در سمت چپ
            const handlePoint = new state.paper.Point(
                glassBounds.left + offset,
                middlePoint.y
            );
    
            // مسیر اصلی؛ همه خطوط حفظ شده‌اند
            olPath = new state.paper.Path();
            olPath.add(startPoint);
            olPath.add(topPoint);
            olPath.add(middlePoint);
            olPath.add(handlePoint);
    
            olPath.style = {
                strokeColor: state.olColor,
                strokeWidth: 2,
                fillColor: null
            };
    
            olPath.name = "ol";
            itemGroup.addChild(olPath);
    
            // مثلث فلش کامل با سه ضلع
            const arrowPath = new state.paper.Path();
    
            arrowPath.add(
                new state.paper.Point(
                    handlePoint.x + tipLength,
                    handlePoint.y - tipHeight
                )
            );
    
            arrowPath.add(handlePoint);
    
            arrowPath.add(
                new state.paper.Point(
                    handlePoint.x + tipLength,
                    handlePoint.y + tipHeight
                )
            );
    
            arrowPath.add(
                new state.paper.Point(
                    handlePoint.x + tipLength,
                    handlePoint.y - tipHeight
                )
            );
    
            arrowPath.style = {
                strokeColor: state.olColor,
                strokeWidth: 2,
                fillColor: null
            };
    
            arrowPath.name = "olArrow";
            itemGroup.addChild(arrowPath);
        }
    }
}