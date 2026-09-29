// js/utils/showMessage.js

let messageTimer = null;

export function showMessage(
    textMsg,
    type = "success",
    timer = 2200
) {

    // اگر پیام قبلی وجود دارد حذف شود

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

    // رنگ و آیکون پیام

    let icon = "✓";
    let iconClass = "success";

    if (type === "error") {
        icon = "!";
        iconClass = "error";
    }

    if (type === "warning") {
        icon = "!";
        iconClass = "warning";
    }

    if (type === "info") {
        icon = "i";
        iconClass = "info";
    }

    // ساخت پیام

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

    // نمایش پیام

    requestAnimationFrame(() => {

        message.classList.add("show");

    });

    // حذف بعد از زمان مشخص

    messageTimer = setTimeout(() => {

        message.classList.remove("show");

        setTimeout(() => {

            if (message.parentNode) {
                message.remove();
            }

        }, 250);

    }, timer);
}