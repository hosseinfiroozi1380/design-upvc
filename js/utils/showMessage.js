// js/utils/showMessage.js
let messageTimer = null;
function convertNumbersToPersian(text) {
    return String(text).replace(/\d/g, function (digit) {
        return "۰۱۲۳۴۵۶۷۸۹"[digit];
    });
}
export function showMessage(
    textMsg,
    type = "success",
    timer = 2200
) {
    const oldMessage =
        document.querySelector(
            ".wd-system-message"
        );
    if (oldMessage) {
        oldMessage.remove();
    }
    if (messageTimer) {
        clearTimeout(messageTimer);
    }
    textMsg = convertNumbersToPersian(textMsg);
    let icon = "<i class='lni lni-checkmark-circle'></i>";
    let iconClass = "success";
    if (type === "error") {
        icon = "<i class='lni lni-cross-circle'></i>";
        iconClass = "error";
    }
    if (type === "warning") {
        icon = "!";
        iconClass = "warning";
    }
    if (type === "info") {
        icon = "<i class='wd-info-icon'>i</i>";
        iconClass = "info";
    }
    const message =
        document.createElement("div");
    message.className =
        "wd-system-message";
    message.innerHTML = `
        <div class="wd-system-message-box">
            <div class="wd-system-message-icon ${iconClass}">
                <span>${icon}</span>
            </div>
            <div class="wd-system-message-text">
                ${textMsg}
            </div>
        </div>
    `;
    document.body.appendChild(message);
    requestAnimationFrame(() => {
        message.classList.add("show");
    });
    messageTimer = setTimeout(() => {
        message.classList.remove("show");
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 250);
    }, timer);
}