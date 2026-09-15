// src/utils/setItemProfileName.js

import state from '../core/state.js';

export function setItemProfileName() {

    $('.profileName').text(
        $('#profile_id option[value=' + state.unitData.profile_id + ']').text()
    );

    $('.glassName').text(
        $('#glass_id option[value=' + state.unitData.glass_id + ']').text()
    );

    $('.accessoryName').text(
        $('#accessory_id option[value=' + state.unitData.accessory_id + ']').text()
    );

}