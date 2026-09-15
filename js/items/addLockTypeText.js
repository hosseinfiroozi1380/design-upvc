// src/items/addLockTypeText.js
import state from '../core/state.js';
// add lock type text
export function addLockTypeText(item) {
    const firstDoorFramelock = item.parent.children.find(child => child.name === 'lock');
    if (firstDoorFramelock) {
        firstDoorFramelock.remove();
    }
    let textToAdd = '';
    if (item.data.lockType == "service") {
        textToAdd = 'Service';
    } else if (item.data.lockType == "serviceWithToope") {
        textToAdd = 'Service with Plug';
    } else if (item.data.lockType == "winDoorType") {
        textToAdd = 'Two Side Lock';
    } else if (item.data.lockType == "doorWinlock") {
        textToAdd = 'Win Lock on Door outwards';
    } else if (item.data.lockType == "doorWinlock2") {
        textToAdd = 'Win Lock on Door inwards';
    }
    let text = new paper.PointText(new state.paper.Point(item.bounds.centerX, item.bounds.centerY + 50));
    text.content = textToAdd;
    text.fillColor = "red";
    text.justification = "center";
    text.fontSize = 35;
    text.name = 'lock';
    item.parent.addChild(text);
}