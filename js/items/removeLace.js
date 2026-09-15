import { enableSave } from '../services/enableSave.js';
// Remove Lace
export function removeLace(selectedItem) {
    if (selectedItem) {
        let lace = selectedItem.parent.getItem({
            name: "lace"
        });
        if (selectedItem.data) {
            selectedItem.data.lace = 0;
        }
        if (lace) {
            lace.remove();
        }
        enableSave();
    }
}