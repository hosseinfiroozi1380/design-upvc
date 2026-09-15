// src/utils/filterAutomateCreationBtns.js
import state from '../core/state.js';
export function filterAutomateCreationBtns() {
    if (!state.unitData || !state.unitData.dimension) {
        return;
    }
    let userWidth = Number(state.unitData.dimension[0]);
    let userHeight = Number(state.unitData.dimension[1]);
    let baseGroups = state.paper.project.activeLayer.getItems({
        name: "baseGroup"
    });
    let hide = true;
    let shouldBeMinimize = baseGroups.length > 0;
    let count = 0;
    $('.automateCreation').each(function () {
        const $btn = $(this);
        let dType = $btn.attr('data-type') || "Turn";
        try {
            const sizeConfig = JSON.parse(
                $btn.attr('data-size')
            );
            const isInRange =
                userWidth >= sizeConfig.minWidth &&
                userWidth <= sizeConfig.maxWidth &&
                userHeight >= sizeConfig.minHeight &&
                userHeight <= sizeConfig.maxHeight &&
                state.unitData.type == dType;
            if (isInRange) {
                $btn.show();
                hide = false;
                count++;
            } else {
                $btn.hide();
            }
        } catch (error) {
            console.error(
                'خطا در خواندن data-size:',
                error
            );
            $btn.hide();
        }
    });
    $('.automationCount').text(count);
    // minimizing
    if (shouldBeMinimize) {
        $('#glassBox').addClass('closed');
        $('#toggleIcon').html(
            '<i class="ti ti-chevron-left"></i>'
        );
    } else {
        $('#glassBox').removeClass('closed');
        $('#toggleIcon').html(
            '<i class="ti ti-chevron-down"></i>'
        );
    }
    // hiding
    if (hide) {
        $('#glassBox').hide();
    } else {
        $('#glassBox').show('fast');
    }
}