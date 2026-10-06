// js/utils/exportDesignPDF.js
import state from "../core/state.js";
function toPersianNumbers(value) {
    return String(value)
        .replace(/0/g, "۰")
        .replace(/1/g, "۱")
        .replace(/2/g, "۲")
        .replace(/3/g, "۳")
        .replace(/4/g, "۴")
        .replace(/5/g, "۵")
        .replace(/6/g, "۶")
        .replace(/7/g, "۷")
        .replace(/8/g, "۸")
        .replace(/9/g, "۹");
}
// تبدیل تاریخ میلادی به شمسی
function gregorianToJalali(gy, gm, gd) {
    const gDaysInMonth = [
        31, 28, 31, 30, 31, 30,
        31, 31, 30, 31, 30, 31
    ];
    const jDaysInMonth = [
        31, 31, 31, 31, 31, 31,
        30, 30, 30, 30, 30, 29
    ];
    let gy2 = gy - 1600;
    let gm2 = gm - 1;
    let gd2 = gd - 1;
    let gDayNo =
        365 * gy2 +
        Math.floor((gy2 + 3) / 4) -
        Math.floor((gy2 + 99) / 100) +
        Math.floor((gy2 + 399) / 400);
    for (let i = 0; i < gm2; ++i) {
        gDayNo += gDaysInMonth[i];
    }
    if (
        gm2 > 1 &&
        (
            gy % 4 === 0 &&
            gy % 100 !== 0
        ) ||
        gy % 400 === 0
    ) {
        gDayNo++;
    }
    gDayNo += gd2;
    let jDayNo = gDayNo - 79;
    const jNp =
        Math.floor(jDayNo / 12053);
    jDayNo %= 12053;
    let jy =
        979 +
        33 * jNp +
        4 * Math.floor(jDayNo / 1461);
    jDayNo %= 1461;
    if (jDayNo >= 366) {
        jy += Math.floor(
            (jDayNo - 1) / 365
        );
        jDayNo =
            (jDayNo - 1) % 365;
    }
    let jm = 0;
    for (
        let i = 0;
        i < 11 &&
        jDayNo >= jDaysInMonth[i];
        ++i
    ) {
        jDayNo -= jDaysInMonth[i];
        jm++;
    }
    const jd = jDayNo + 1;
    return [
        jy,
        jm + 1,
        jd
    ];
}
function getPersianDate() {
    const now = new Date();
    const [
        year,
        month,
        day
    ] = gregorianToJalali(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
    );
    const date =
        `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    return toPersianNumbers(date);
}
async function paperJSONToPNGDataURL(paperJSON) {
    if (!paperJSON) {
        return null;
    }
    let tempScope = null;
    try {
        // Canvas خروجی
        const canvasWidth = 1000;
        const canvasHeight = 1000;
        const tempCanvas =
            document.createElement("canvas");
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;
        tempScope =
            new paper.PaperScope();
        tempScope.setup(tempCanvas);
        tempScope.project.importJSON(
            paperJSON
        );
        const project =
            tempScope.project;
        const activeLayer =
            project.activeLayer;
        if (!activeLayer) {
            return null;
        }
        // اصلاح فریم اصلی
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
        // پیدا کردن محدوده واقعی طراحی
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
        // Bounds واقعی کل طراحی
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
        // فضای امن
        const padding = 70;
        const availableWidth =
            canvasWidth -
            padding * 2;
        const availableHeight =
            canvasHeight -
            padding * 2;
        // Scale
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
        // مرکز واقعی Canvas
        const canvasCenter =
            new tempScope.Point(
                canvasWidth / 2,
                canvasHeight / 2
            );
        // Scale حول مرکز واقعی
        // ---------------------------------------------
        // Scale بر اساس Bounds واقعی طراحی
        // ---------------------------------------------
        activeLayer.scale(
            scale,
            bounds.center
        );
        // ---------------------------------------------
        // بعد از Scale دوباره فقط آیتم‌های واقعی
        // طراحی را محاسبه می‌کنیم
        // ---------------------------------------------
        let scaledBounds = null;
        items.forEach((item) => {
            if (
                !item.visible ||
                !item.bounds ||
                item.bounds.width <= 0 ||
                item.bounds.height <= 0
            ) {
                return;
            }
            if (!scaledBounds) {
                scaledBounds =
                    item.bounds.clone();
            } else {
                scaledBounds =
                    scaledBounds.unite(
                        item.bounds
                    );
            }
        });
        // اگر Bounds پیدا نشد
        if (
            !scaledBounds ||
            scaledBounds.width <= 0 ||
            scaledBounds.height <= 0
        ) {
            return null;
        }
        // ---------------------------------------------
        // انتقال دقیق مرکز طراحی به مرکز Canvas
        // ---------------------------------------------
        const centerOffset =
            canvasCenter.subtract(
                scaledBounds.center
            );
        activeLayer.translate(
            centerOffset
        );
        // ---------------------------------------------
        // بررسی نهایی فقط بر اساس آیتم‌های واقعی
        // ---------------------------------------------
        scaledBounds = null;
        items.forEach((item) => {
            if (
                !item.visible ||
                !item.bounds ||
                item.bounds.width <= 0 ||
                item.bounds.height <= 0
            ) {
                return;
            }
            if (!scaledBounds) {
                scaledBounds =
                    item.bounds.clone();
            } else {
                scaledBounds =
                    scaledBounds.unite(
                        item.bounds
                    );
            }
        });
        // اصلاح نهایی مرکز
        if (
            scaledBounds &&
            scaledBounds.width > 0 &&
            scaledBounds.height > 0
        ) {
            const finalOffset =
                canvasCenter.subtract(
                    scaledBounds.center
                );
            activeLayer.translate(
                finalOffset
            );
        }
        // تنظیم View
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
        // خروجی
        const png =
            tempCanvas.toDataURL(
                "image/png"
            );
        // پاکسازی
        tempScope.project.remove();
        tempScope = null;
        return png;
    } catch (error) {
        console.error(
            "خطا در ساخت تصویر طراحی:",
            error
        );
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
    try {
        const { jsPDF } =
            window.jspdf;
        const canvas =
            state.canvas;
        if (!canvas) {
            console.error(
                "Canvas پیدا نشد"
            );
            return;
        }
        // اطلاعات پروژه از فرم
        const savedProjectInfo =
            sessionStorage.getItem("projectInfo");

        const projectInfo =
            savedProjectInfo
                ? JSON.parse(savedProjectInfo)
                : {};

        const projectName =
            projectInfo.projectName || "-";

        const projectNumber =
            toPersianNumbers(
                projectInfo.projectCode || "-"
            );
        // تاریخ شمسی
        const invoiceDate =
            getPersianDate();
        // اطلاعات یونیت‌ها
        const designs =
            Array.isArray(state.tempDesigns)
                ? state.tempDesigns
                : [];
        let totalInvoice = 0;
        let totalUnits = 0;
        let totalArea = 0;
        let totalOpeningArea = 0;
        // ساخت یونیت‌ها
        let unitsHTML = "";
        for (
            const [index, item]
            of designs.entries()
        ) {
            const data =
                item.unitData || {};
            console.log(
                "PDF ITEM:",
                index + 1,
                item
            );
            const width =
                Number(
                    item.width ||
                    data.width ||
                    0
                );
            const height =
                Number(
                    item.height ||
                    data.height ||
                    0
                );
            const quantity =
                Number(
                    data.quantity ||
                    item.quantity ||
                    1
                );
            const price =
                Number(
                    data.price ||
                    item.price ||
                    0
                );
            const unitTotal =
                price * quantity;
            totalInvoice +=
                unitTotal;
            totalUnits +=
                quantity;
            const area =
                (
                    width *
                    height /
                    1000000
                ) * quantity;
            totalArea +=
                area;
            const system =
                data.system ||
                "UPVC";
            const profile =
                data.profile_name ||
                data.profile ||
                (
                    data.profile_id
                        ? $(
                            `#profile_id option[value="${data.profile_id}"]`
                        ).text()
                        : ""
                ) ||
                "-";
            const glass =
                data.glass_name ||
                data.glass ||
                (
                    data.glass_id
                        ? $(
                            `#glass_id option[value="${data.glass_id}"]`
                        ).text()
                        : ""
                ) ||
                "-";
            const accessory =
                data.accessory_name ||
                data.accessory ||
                (
                    data.accessory_id
                        ? $(
                            `#accessory_id option[value="${data.accessory_id}"]`
                        ).text()
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
                        ${toPersianNumbers(index + 1)}
                    </td>
                    <td
    style="
        width:270px;
        min-width:270px;
        max-width:270px;
        height:270px;
        padding:10px;
        text-align:center;
        vertical-align:middle;
    "
>
    <div
        style="
            width:250px;
            height:250px;
            margin:0 auto;
            padding:0;
            display:flex;
            align-items:center;
            justify-content:center;
            text-align:center;
            overflow:hidden;
        "
    >
        <img
            src="${unitDesignImage || ""}"
            alt="طرح ${unitName}"
            style="
                display:block;
                width:250px;
                height:250px;
                max-width:250px;
                max-height:250px;
                margin:0 auto;
                padding:0;
                object-fit:contain;
                object-position:center center;
            "
        >
    </div>
</td>
                    <td>
                        <div class="invoice-item">
                            <div class="invoice-item-info">
                                <div class="invoice-item-title">
                                    ${toPersianNumbers(index + 1)}
                                    -
                                    ${unitName}
                                    -
                                    ${system}
                                </div>
                                <div class="invoice-item-detail">
                                    ابعاد:
                                    ${toPersianNumbers(width || "-")}
                                    ×
                                    ${toPersianNumbers(height || "-")}
                                </div>
                                <div class="invoice-item-detail">
                                    تعداد:
                                    ${toPersianNumbers(quantity)}
                                </div>
                                <div class="invoice-item-detail">
                                    پروفیل:
                                    ${profile}
                                </div>
                                <div class="invoice-item-detail">
                                    شیشه:
                                    ${glass}
                                </div>
                                <div class="invoice-item-detail">
                                    یراق:
                                    ${accessory}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        ${toPersianNumbers(
                area.toFixed(2)
            )}
                    </td>
                    <td>
                        متر مربع
                    </td>
                    <td>
                        ${toPersianNumbers(
                price.toLocaleString("en-US")
            )}
                    </td>
                    <td>
                        ${toPersianNumbers(
                unitTotal.toLocaleString("en-US")
            )}
                    </td>
                </tr>
            `;
        }
        // جمع کل فارسی
        const totalInvoiceFormatted =
            toPersianNumbers(
                totalInvoice.toLocaleString("en-US")
            );
        // HTML اصلی فاکتور
        const box =
            document.createElement("div");
        box.style.width = "1100px";
        box.style.padding = "0px";
        box.style.background = "#ffffff";
        box.style.direction = "rtl";
        box.style.fontFamily =
            "IRANSansWeb, Tahoma, sans-serif";
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
                <div
    class="bottom-section"
    style="
        break-inside:avoid;
        page-break-inside:avoid;
    "
>
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
                                ${totalInvoiceFormatted}
                            </span>
                            <span>
                                ۱۰۰٪
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
                                ${totalInvoiceFormatted}
                            </span>
                        </div>
                    </div>
                </div>
                <footer
    class="invoice-footer"
    style="
        break-inside:avoid;
        page-break-inside:avoid;
    "
>
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
        if (document.fonts) {
            await document.fonts.ready;
        }
        const header =
            box.querySelector(".invoice-header");
        const tableSection =
            box.querySelector(".table-section");
        const bottomSection =
            box.querySelector(".bottom-section");
        const invoiceFooter =
            box.querySelector(".invoice-footer");
        const originalTable =
            box.querySelector(".invoice-table");
        const originalTbody =
            originalTable?.querySelector("tbody");
        if (!originalTable || !originalTbody) {
            throw new Error(
                "جدول فاکتور پیدا نشد."
            );
        }
        const rows =
            Array.from(
                originalTbody.querySelectorAll("tr")
            );
        const pages = [];
        if (rows.length > 0) {
            pages.push(
                rows.slice(0, 4)
            );
            for (
                let i = 4;
                i < rows.length;
                i += 5
            ) {
                pages.push(
                    rows.slice(
                        i,
                        i + 5
                    )
                );
            }
        } else {
            pages.push([]);
        }
        const pdf =
            new jsPDF(
                "p",
                "mm",
                "a4"
            );
        const pdfWidth = 190;
        const pdfHeight = 277;
        for (
            let pageIndex = 0;
            pageIndex < pages.length;
            pageIndex++
        ) {
            const currentRows =
                pages[pageIndex];
            const isFirstPage =
                pageIndex === 0;
            const isLastPage =
                pageIndex ===
                pages.length - 1;
            const page =
                document.createElement("div");
            page.style.width = "1100px";
            page.style.padding = "0";
            page.style.margin = "0";
            page.style.background =
                "#ffffff";
            page.style.direction = "rtl";
            page.style.fontFamily =
                "IRANSansWeb, Tahoma, sans-serif";
            page.style.position = "fixed";
            page.style.left = "-10000px";
            page.style.top = "0";
            page.style.boxSizing =
                "border-box";
            if (
                isFirstPage &&
                header
            ) {
                page.appendChild(
                    header.cloneNode(true)
                );
            }
            // جدول
            if (tableSection) {
                const tableSectionClone =
                    tableSection.cloneNode(true);
                const tableClone =
                    tableSectionClone.querySelector(
                        ".invoice-table"
                    );
                const tbodyClone =
                    tableClone?.querySelector(
                        "tbody"
                    );
                if (tbodyClone) {
                    tbodyClone.innerHTML = "";
                    currentRows.forEach(
                        (row) => {
                            tbodyClone.appendChild(
                                row.cloneNode(true)
                            );
                        }
                    );
                }
                page.appendChild(
                    tableSectionClone
                );
            }
            if (isLastPage) {
                if (bottomSection) {
                    const bottomClone =
                        bottomSection.cloneNode(true);
                    bottomClone.style.breakInside =
                        "avoid";
                    bottomClone.style.pageBreakInside =
                        "avoid";
                    page.appendChild(
                        bottomClone
                    );
                }
                if (invoiceFooter) {
                    const footerClone =
                        invoiceFooter.cloneNode(true);
                    footerClone.style.breakInside =
                        "avoid";
                    footerClone.style.pageBreakInside =
                        "avoid";
                    page.appendChild(
                        footerClone
                    );
                }
            }
            document.body.appendChild(page);
            await new Promise(
                (resolve) =>
                    requestAnimationFrame(
                        () => resolve()
                    )
            );
            // تبدیل صفحه به تصویر
            const pageCanvas =
                await html2canvas(
                    page,
                    {
                        scale: 2,
                        useCORS: true,
                        backgroundColor:
                            "#ffffff",
                        logging: false,
                        windowWidth: 1100
                    }
                );
            const pageImg =
                pageCanvas.toDataURL(
                    "image/jpeg",
                    0.95
                );
            const pageImageHeight =
                pageCanvas.height *
                pdfWidth /
                pageCanvas.width;
            if (pageIndex > 0) {
                pdf.addPage();
            }
            if (
                pageImageHeight <=
                pdfHeight
            ) {
                pdf.addImage(
                    pageImg,
                    "JPEG",
                    10,
                    10,
                    pdfWidth,
                    pageImageHeight
                );
            } else {
                let heightLeft =
                    pageImageHeight;
                let position = 10;
                pdf.addImage(
                    pageImg,
                    "JPEG",
                    10,
                    position,
                    pdfWidth,
                    pageImageHeight
                );
                heightLeft -=
                    pdfHeight;
                while (
                    heightLeft > 0
                ) {
                    position =
                        heightLeft -
                        pageImageHeight +
                        10;
                    pdf.addPage();
                    pdf.addImage(
                        pageImg,
                        "JPEG",
                        10,
                        position,
                        pdfWidth,
                        pageImageHeight
                    );
                    heightLeft -=
                        pdfHeight;
                }
            }
            page.remove();
        }
        box.remove();
        pdf.save(
            "pish-factor.pdf"
        );
    } catch (error) {
        console.error(
            "خطا در ساخت PDF:",
            error
        );
        const box =
            document.querySelector(
                ".invoice-page"
            )?.parentElement;
        if (box) {
            box.remove();
        }
        throw error;
    }
}