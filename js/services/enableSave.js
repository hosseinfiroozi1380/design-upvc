// src/services/enableSave.js
import state from "../core/state.js";
import { saveDesign } from "./saveDesign.js";

// Something changed
export function enableSave(
    delay = 100,
    doSave = true
) {
    state.somethingChanged = true;
    if (doSave) {
        if (state.saveTimeout) {
            clearTimeout(
                state.saveTimeout
            );
        }
        state.saveTimeout =
    setTimeout(() => {

        // طراحی موقت است؛ ذخیره در سرور انجام نشود
        if (
            state.tempDesigns?.some(
                item =>
                    String(item.id) ===
                    String(state.currentDesignID)
            )
        ) {
            return;
        }

        state.saveTimeout = setTimeout(() => {

            if (
                state.tempDesigns?.some(
                    item =>
                        String(item.id) ===
                        String(state.currentDesignID)
                )
            ) {
                return;
            }

            saveDesign(
                state.currentDesignID,
                true
            );

        }, delay);

    }, delay);
    } else {
        $('.saveCard')
            .removeClass(
                'bg-danger'
            );
        $('#saveProject')
            .html(
                '<i class="ti ti-device-floppy icon"></i>'
            );
        $('#saveProject')
            .prop(
                'disabled',
                false
            );
        $('#saveProject')
            .show();
    }
}