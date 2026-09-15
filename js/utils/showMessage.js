// src/utils/showMessage.js
//showMessage
export function showMessage(textMsg, timer = 2000) {
    Swal.fire({
        backdrop: false,
        text: textMsg,
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: timer
    })
}