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
        textToAdd = 'سرویس';
    } else if (item.data.lockType == "serviceWithToope") {
        textToAdd = 'سرویس با توپی';
    } else if (item.data.lockType == "winDoorType") {
        textToAdd = 'قفل دوطرفه';
    } else if (item.data.lockType == "doorWinlock") {
        textToAdd = 'قفل وین درب بیرون‌بازشو';
    } else if (item.data.lockType == "doorWinlock2") {
        textToAdd = 'قفل وین درب داخل‌بازشو';
    }
    let text = new state.paper.PointText(
        item.bounds.center
    );
    
    text.content = textToAdd;
    text.fillColor = state.glColor;
    text.justification = "center";
    text.fontFamily = "IRANSansWeb";
    text.fontSize = 35;
    text.name = "lock";
    
    item.parent.addChild(text);
}