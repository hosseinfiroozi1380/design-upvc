// js/utils/exportDesignPDF.js
import state from "../core/state.js";
async function paperJSONToPNGDataURL(paperJSON) {

    if (!paperJSON) {
        return null;
    }

    let tempScope = null;

    try {

        // --------------------------------
        // Canvas خروجی
        // --------------------------------

        const canvasWidth = 1000;
        const canvasHeight = 1000;

        const tempCanvas =
            document.createElement("canvas");

        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;

        tempScope =
            new paper.PaperScope();

        tempScope.setup(tempCanvas);

        tempScope.project.importJSON(paperJSON);

        const project =
            tempScope.project;

        const activeLayer =
            project.activeLayer;

        if (!activeLayer) {
            return null;
        }

        // --------------------------------
        // اصلاح فریم اصلی
        // --------------------------------

        const mainFrames =
            activeLayer.getItems({
                name: "mainFrame"
            });

        mainFrames.forEach((item) => {

            item.strokeColor =
                new tempScope.Color("#000000");

            item.strokeWidth = 2;

            item.strokeScaling = true;

        });

        // --------------------------------
        // پیدا کردن محدوده واقعی طراحی
        // --------------------------------

        const items =
            activeLayer.children.filter((item) => {

                return (
                    item.visible !== false &&
                    item.name !== "dimensions" &&
                    item.name !== "dimension" &&
                    item.name !== "guide" &&
                    item.name !== "glG"
                );

            });

        if (!items.length) {
            return null;
        }

        // --------------------------------
        // Bounds واقعی کل طراحی
        // --------------------------------

        let bounds = null;

        items.forEach((item) => {

            if (
                !item.bounds ||
                item.bounds.width <= 0 ||
                item.bounds.height <= 0
            ) {
                return;
            }

            if (!bounds) {

                bounds =
                    item.bounds.clone();

            } else {

                bounds =
                    bounds.unite(
                        item.bounds
                    );

            }

        });

        if (
            !bounds ||
            bounds.width <= 0 ||
            bounds.height <= 0
        ) {
            return null;
        }

        // --------------------------------
        // فضای امن
        // --------------------------------

        const padding = 70;

        const availableWidth =
            canvasWidth -
            padding * 2;

        const availableHeight =
            canvasHeight -
            padding * 2;

        // --------------------------------
        // Scale
        // --------------------------------

        const scaleX =
            availableWidth /
            bounds.width;

        const scaleY =
            availableHeight /
            bounds.height;

        const scale =
            Math.min(
                scaleX,
                scaleY
            );

        // --------------------------------
        // مرکز واقعی Canvas
        // --------------------------------

        const canvasCenter =
            new tempScope.Point(
                canvasWidth / 2,
                canvasHeight / 2
            );

        // --------------------------------
        // Scale حول مرکز واقعی
        // --------------------------------

        activeLayer.scale(
            scale,
            bounds.center
        );

        // --------------------------------
        // Bounds بعد از Scale
        // --------------------------------

        bounds =
            activeLayer.bounds.clone();

        // --------------------------------
        // انتقال دقیق به مرکز
        // --------------------------------

        const centerOffset =
            canvasCenter.subtract(
                bounds.center
            );

        activeLayer.translate(
            centerOffset
        );

        // --------------------------------
        // اصلاح نهایی
        // --------------------------------

        bounds =
            activeLayer.bounds.clone();

        const finalOffset =
            canvasCenter.subtract(
                bounds.center
            );

        activeLayer.translate(
            finalOffset
        );

        // --------------------------------
        // تنظیم View
        // --------------------------------

        tempScope.view.viewSize =
            new tempScope.Size(
                canvasWidth,
                canvasHeight
            );

        tempScope.view.zoom = 1;

        tempScope.view.center =
            canvasCenter;

        tempScope.view.update();

        tempScope.view.draw();

        // --------------------------------
        // خروجی
        // --------------------------------

        const png =
            tempCanvas.toDataURL(
                "image/png"
            );

        // --------------------------------
        // پاکسازی
        // --------------------------------

        tempScope.project.remove();

        tempScope = null;

        return png;

    } catch (error) {

        if (tempScope) {

            try {
                tempScope.project.remove();
            } catch (e) {
                // ignore
            }

        }

        return null;
    }
}
export async function exportDesignPDF() {
    const { jsPDF } = window.jspdf;
    const canvas = state.canvas;
    if (!canvas) {
        console.error("Canvas پیدا نشد");
        return;
    }
    // const designImage = createPDFDesignImage();
    const projectName = "پروژه حسین";
    const projectNumber = "311/1055/1766";
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const invoiceDate = `${year}/${month}/${day}`;
    // اطلاعات یونیت‌ها
    const designs = Array.isArray(state.tempDesigns)
        ? state.tempDesigns
        : [];
    let totalInvoice = 0;
    let totalUnits = 0;
    let totalArea = 0;
    let totalOpeningArea = 0;
    // ساخت یونیت‌ها
    let unitsHTML = "";
    for (const [index, item] of designs.entries()) {
        const data = item.unitData || {};
        console.log("PDF ITEM:", index + 1, item);
        const width = Number(
            item.width ||
            data.width ||
            0
        );
        const height = Number(
            item.height ||
            data.height ||
            0
        );
        const quantity = Number(
            data.quantity ||
            item.quantity ||
            1
        );
        const price = Number(
            data.price ||
            item.price ||
            0
        );
        const unitTotal = price * quantity;
        totalInvoice += unitTotal;
        totalUnits += quantity;
        const area =
            (width * height / 1000000) * quantity;
        totalArea += area;
        const system =
            data.system ||
            "UPVC";
        const profile =
            data.profile_name ||
            data.profile ||
            (
                data.profile_id
                    ? $(`#profile_id option[value="${data.profile_id}"]`).text()
                    : ""
            ) ||
            "-";
        const glass =
            data.glass_name ||
            data.glass ||
            (
                data.glass_id
                    ? $(`#glass_id option[value="${data.glass_id}"]`).text()
                    : ""
            ) ||
            "-";
        const accessory =
            data.accessory_name ||
            data.accessory ||
            (
                data.accessory_id
                    ? $(`#accessory_id option[value="${data.accessory_id}"]`).text()
                    : ""
            ) ||
            "-";
        const unitName =
            item.name ||
            data.name ||
            "پنجره";
        const unitDesignImage =
            await paperJSONToPNGDataURL(
                item.paperJSON
            );
        console.log(
            "PDF DESIGN IMAGE:",
            index + 1,
            unitDesignImage
                ? "OK"
                : "EMPTY"
        );
        unitsHTML += `
            <tr>
                <td>
                    ${index + 1}
                </td>
                <td style="
                text-align:center;
                vertical-align:middle;
                padding:10px;
            ">
            
                <div
                    class="invoice-item"
                    style="
                        width:100%;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        text-align:center;
                        margin:0 auto;
                    "
                >
            
                    <img
                        class="invoice-item-image"
                        src="${unitDesignImage || ""}"
                        alt="طرح ${unitName}"
                        style="
                            display:block;
                            width:250px;
                            height:250px;
                            object-fit:contain;
                            object-position:center center;
                            margin:0 auto;
                        "
                    >
            
                </div>
            
            </td>
                <td>
                    <div class="invoice-item">
                        <div class="invoice-item-info">
                            <div class="invoice-item-title">
                                ${index + 1} - ${unitName} - ${system}
                            </div>
                            <div class="invoice-item-detail">
                                ابعاد: ${width || "-"} × ${height || "-"}
                            </div>
                            <div class="invoice-item-detail">
                                تعداد: ${quantity}
                            </div>
                            <div class="invoice-item-detail">
                                پروفیل: ${profile}
                            </div>
                            <div class="invoice-item-detail">
                                شیشه: ${glass}
                            </div>
                            <div class="invoice-item-detail">
                                یراق: ${accessory}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                ${area.toFixed(2)}
                </td>
                <td>
                    متر مربع
                </td>
                <td>
                    ${price.toLocaleString()}
                </td>
                <td>
                    ${unitTotal.toLocaleString()}
                </td>
            </tr>
        `;
    }
    // HTML اصلی فاکتور
    const box =
        document.createElement("div");
    box.style.width = "1100px";
    box.style.padding = "0px";
    box.style.background = "#ffffff";
    box.style.direction = "rtl";
    box.style.fontFamily =
        "IRANSansWeb, Tahoma, sans-serif";
    // HTML جدید فاکتور
    box.innerHTML = `
    <div class="invoice-page">
        <header class="invoice-header">
            <div class="company">
                <div class="company-logo">
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            stroke="currentColor"
                            stroke-width="2"
                        />
                        <path
                            d="M12 3V21M3 12H21"
                            stroke="currentColor"
                            stroke-width="2"
                        />
                    </svg>
                </div>
                <div>
                    <h2 class="company-name">
                        عایق فیروز
                    </h2>
                    <div class="company-subtitle">
                        طراحی درب و پنجره
                    </div>
                </div>
            </div>
            <div class="document-title">
                <h1>
                    پیش‌فاکتور
                </h1>
            </div>
            <div class="project-info">
                <div class="project-row">
                    <span class="project-label">
                        نام پروژه
                    </span>
                    <span class="project-value">
                        ${projectName}
                    </span>
                </div>
                <div class="project-row">
                    <span class="project-label">
                        شماره پروژه
                    </span>
                    <span class="project-value">
                        ${projectNumber}
                    </span>
                </div>
                <div class="project-row">
                    <span class="project-label">
                        تاریخ
                    </span>
                    <span class="project-value">
                        ${invoiceDate}
                    </span>
                </div>
            </div>
        </header>
        <section class="table-section">
            <div class="section-heading">
                <div class="section-title">
                    جزئیات پیش‌فاکتور
                </div>
                <div class="section-caption">
                    مشخصات اقلام
                </div>
            </div>
            <div class="table-box">
                <table class="invoice-table">
                    <colgroup>
                        <col class="col-number">
                        <col class="col-design">
                        <col class="col-title">
                        <col class="col-quantity">
                        <col class="col-unit">
                        <col class="col-unit-price">
                        <col class="col-total">
                    </colgroup>
                    <thead>
                        <tr>
                            <th colspan="2">
                                طراحی
                            </th>
                            <th>
                                عنوان
                            </th>
                            <th>
                                مقدار
                            </th>
                            <th>
                                واحد
                            </th>
                            <th>
                                مبلغ واحد ریال
                            </th>
                            <th>
                                مبلغ کل ریال
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${unitsHTML}
                    </tbody>
                </table>
            </div>
        </section>
        <div class="bottom-section">
            <div class="note">
                این پیش‌فاکتور صرفاً جهت اعلام قیمت صادر شده است.
            </div>
            <div class="total-box">
                <div class="total-row total-grid">
                    <span class="total-label">
                        آیتم
                    </span>
                    <span class="total-label">
                        هزینه
                    </span>
                    <span class="total-label">
                        درصد
                    </span>
                </div>
                <div class="total-row total-grid">
                    <span class="total-label">
                        متریال
                    </span>
                    <span class="total-value">
                        ${totalInvoice.toLocaleString()}
                    </span>
                    <span>
                        100%
                    </span>
                </div>
                <div class="total-row total-grid">
                    <span class="total-label">
                        نصب
                    </span>
                    <span>
                        -
                    </span>
                    <span>
                        -
                    </span>
                </div>
                <div class="total-row total-final total-grid">
                    <span class="total-label">
                        جمع کل فاکتور
                    </span>
                    <span>
                        -
                    </span>
                    <span class="total-value">
                        ${totalInvoice.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
        <footer class="invoice-footer">
            <span class="footer-text">
                عایق فیروز
            </span>
            <span class="footer-text">
                پیش‌فاکتور
            </span>
        </footer>
    </div>
`;
    // Render
    box.style.position = "fixed";
    box.style.left = "-10000px";
    box.style.top = "0";
    document.body.appendChild(box);
    // صبر برای لود شدن CSS
    const styleSheet = box.querySelector(
        'link[rel="stylesheet"]'
    );
    if (styleSheet) {
        await new Promise((resolve) => {
            if (styleSheet.sheet) {
                resolve();
                return;
            }
            styleSheet.onload = resolve;
            styleSheet.onerror = resolve;
        });
    }
    // صبر برای فونت
    if (document.fonts) {
        await document.fonts.ready;
    }
    // تبدیل HTML به تصویر
    const imageCanvas =
        await html2canvas(
            box,
            {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                windowWidth: 1100
            }
        );
    const imgData =
        imageCanvas.toDataURL(
            "image/jpeg",
            0.95
        );
    // ساخت PDF
    const pdf =
        new jsPDF(
            "p",
            "mm",
            "a4"
        );
    const pdfWidth = 190;
    const pageHeight = 277;
    const imageHeight =
        imageCanvas.height *
        pdfWidth /
        imageCanvas.width;
    // صفحات PDF
    let heightLeft = imageHeight;
    let position = 10;
    pdf.addImage(
        imgData,
        "JPEG",
        10,
        position,
        pdfWidth,
        imageHeight
    );
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
        position =
            heightLeft -
            imageHeight +
            10;
        pdf.addPage();
        pdf.addImage(
            imgData,
            "JPEG",
            10,
            position,
            pdfWidth,
            imageHeight
        );
        heightLeft -= pageHeight;
    }
    console.log(
        "========== PDF READY =========="
    );
    pdf.save(
        "pish-factor.pdf"
    );
    box.remove();
}