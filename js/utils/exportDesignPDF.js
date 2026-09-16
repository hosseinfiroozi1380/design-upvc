// js/utils/exportDesignPDF.js
import state from "../core/state.js";
/*
 * تبدیل SVG به Data URL
 */
function svgToDataUrl(svg) {
 if (!svg) {
  return null;
 }
 try {
  const encoded =
   encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
 } catch (error) {
  console.error(
   "خطا در تبدیل SVG:",
   error
  );
  return null;
 }
}
function createInlineSVG(svgFragment, width, height) {
 if (!svgFragment) {
  return null;
 }
 const svgRoot = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "svg"
 );
 svgRoot.setAttribute("xmlns", "http://www.w3.org/2000/svg");
 const svgWidth = Number(width) || 1000;
 const svgHeight = Number(height) || 1000;
 svgRoot.setAttribute(
  "viewBox",
  `0 0 ${svgWidth} ${svgHeight}`
 );
 svgRoot.setAttribute("width", "100%");
 svgRoot.setAttribute("height", "100%");
 svgRoot.setAttribute(
  "preserveAspectRatio",
  "xMidYMid meet"
 );
 svgRoot.style.display = "block";
 const temp = document.createElement("div");
 temp.innerHTML = svgFragment;
 Array.from(temp.childNodes).forEach((node) => {
  svgRoot.appendChild(node.cloneNode(true));
 });
 return svgRoot;
}
/*
 * ============================================================
 * گرفتن نام option از select
 * ============================================================
 */
function getOptionText(
 selector,
 value
) {
 if (
  value === undefined ||
  value === null ||
  value === ""
 ) {
  return "-";
 }
 const option =
  document.querySelector(
   `${selector} option[value="${CSS.escape(String(value))}"]`
  );
 if (!option) {
  return String(value);
 }
 return (
  option.textContent ||
  option.innerText ||
  value
 ).trim();
}
/*
 * ============================================================
 * گرفتن اطلاعات یک طراحی
 * ============================================================
 */
function getDesignData(item) {
 const data =
  item?.unitData || {};
 const width =
  item?.width ??
  data?.width ??
  data?.itemWidth ??
  data?.abcd?.[0] ??
  0;
 const height =
  item?.height ??
  data?.height ??
  data?.itemHeight ??
  data?.abcd?.[1] ??
  0;
 const profileId =
  data?.profile_id ??
  data?.profileId ??
  "";
 const glassId =
  data?.glass_id ??
  data?.glassId ??
  "";
 const accessoryId =
  data?.accessory_id ??
  data?.accessoryId ??
  "";
 const profileName =
  data?.profile_name ||
  data?.profileName ||
  getOptionText(
   "#profile_id",
   profileId
  );
 const glassName =
  data?.glass_name ||
  data?.glassName ||
  getOptionText(
   "#glass_id",
   glassId
  );
 const accessoryName =
  data?.accessory_name ||
  data?.accessoryName ||
  getOptionText(
   "#accessory_id",
   accessoryId
  );
 return {
  id:
   item?.id,
  name:
   item?.name ||
   data?.name ||
   "طراحی",
  width:
   width,
  height:
   height,
  system:
   item?.system ||
   data?.system ||
   "UPVC",
  profile:
   profileName,
  glass:
   glassName,
  accessory:
   accessoryName,
  quantity:
   data?.quantity ||
   1,
  svg:
   item?.svg ||
   null
 };
}
/*
 * ============================================================
 * ساخت HTML فاکتور
 * ============================================================
 */
function createPDFDocument(
 designs
) {
 const wrapper =
  document.createElement("div");
 wrapper.id =
  "wd-pdf-document";
 wrapper.dir =
  "rtl";
 wrapper.style.cssText = `
  position: absolute;
  left: 0;
  top: 0;
  width: 794px;
  min-height: 1123px;
  background: #ffffff;
  color: #111827;
  font-family: Arial, Tahoma, sans-serif;
  direction: rtl;
  box-sizing: border-box;
  display: block;
  visibility: visible;
  opacity: 1;
  z-index: 9999;
`;
 /*
  * ========================================================
  * هدر فاکتور
  * ========================================================
  */
 const header =
  document.createElement("div");
 header.style.cssText = `
        padding: 28px 35px 20px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        direction: rtl;
        box-sizing: border-box;
    `;
 header.innerHTML = `
        <div style="
            text-align:right;
        ">
            <div style="
                font-size:24px;
                font-weight:700;
                color:#111827;
                margin-bottom:6px;
            ">
                عایق فیروز
            </div>
            <div style="
                font-size:13px;
                color:#6b7280;
            ">
                طراحی آنلاین درب و پنجره
            </div>
        </div>
        <div style="
            text-align:left;
        ">
            <div style="
                font-size:20px;
                font-weight:700;
                color:#111827;
            ">
                پیش فاکتور
            </div>
            <div style="
                margin-top:6px;
                font-size:12px;
                color:#6b7280;
            ">
                تعداد آیتم‌ها: ${designs.length}
            </div>
        </div>
    `;
 wrapper.appendChild(
  header
 );
 /*
  * ========================================================
  * آیتم‌ها
  * ========================================================
  */
 designs.forEach(
  (
   design,
   index
  ) => {
   const item =
    document.createElement("div");
   item.style.cssText = `
                margin: 20px 35px;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                overflow: hidden;
                background: #ffffff;
                page-break-inside: avoid;
                break-inside: avoid;
                direction: rtl;
            `;
   /*
    * شماره آیتم
    */
   const itemHeader =
    document.createElement("div");
   itemHeader.style.cssText = `
                height: 42px;
                padding: 0 16px;
                background: #f8fafc;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
            `;
   itemHeader.innerHTML = `
                <span style="
                    font-size:14px;
                    font-weight:700;
                    color:#111827;
                ">
                    ${escapeHTML(
    design.name
   )}
                </span>
                <span style="
                    font-size:12px;
                    color:#6b7280;
                ">
                    آیتم ${index + 1}
                </span>
            `;
   item.appendChild(
    itemHeader
   );
   /*
    * بدنه آیتم
    */
   const body =
    document.createElement("div");
   body.style.cssText = `
                display:flex;
                flex-direction:row;
                direction:rtl;
                min-height:250px;
                box-sizing:border-box;
            `;
   /*
    * =================================================
    * سمت راست - طراحی
    * =================================================
    */
   const preview =
    document.createElement("div");
   preview.style.cssText = `
                width:48%;
                min-height:250px;
                padding:18px;
                display:flex;
                align-items:center;
                justify-content:center;
                box-sizing:border-box;
                border-left:1px solid #e5e7eb;
                background:#ffffff;
            `;
   if (design.svg) {
    const svgWrapper = document.createElement("div");
    svgWrapper.style.cssText = `
                 width: 100%;
                 height: 220px;
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 overflow: hidden;
                 background: #ffffff;
                 box-sizing: border-box;
             `;
    const svgElement = createInlineSVG(
     design.svg,
     design.width,
     design.height
    );
    if (svgElement) {
     svgElement.style.width = "100%";
     svgElement.style.height = "100%";
     svgElement.style.display = "block";
     svgWrapper.appendChild(svgElement);
    }
    preview.appendChild(svgWrapper);
   } else {
    preview.innerHTML = `
                    <div style="
                        width:100%;
                        height:220px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:#9ca3af;
                        font-size:12px;
                        border:1px dashed #d1d5db;
                        border-radius:8px;
                    ">
                        تصویر طراحی موجود نیست
                    </div>
                `;
   }
   /*
    * =================================================
    * سمت چپ - اطلاعات
    * =================================================
    */
   const details =
    document.createElement("div");
   details.style.cssText = `
                width:52%;
                padding:18px 20px;
                box-sizing:border-box;
            `;
   details.innerHTML = `
                <div style="
                    font-size:15px;
                    font-weight:700;
                    margin-bottom:16px;
                    color:#111827;
                ">
                    مشخصات طراحی
                </div>
                ${createInfoRow(
    "ابعاد",
    `${formatNumber(design.width)} × ${formatNumber(design.height)}`
   )}
                ${createInfoRow(
    "پروفیل",
    design.profile
   )}
                ${createInfoRow(
    "شیشه",
    design.glass
   )}
                ${createInfoRow(
    "یراق",
    design.accessory
   )}
                ${createInfoRow(
    "سیستم",
    design.system
   )}
                ${createInfoRow(
    "تعداد",
    design.quantity
   )}
            `;
   body.appendChild(
    preview
   );
   body.appendChild(
    details
   );
   item.appendChild(
    body
   );
   wrapper.appendChild(
    item
   );
  }
 );
 /*
  * ========================================================
  * فوتر
  * ========================================================
  */
 const footer =
  document.createElement("div");
 footer.style.cssText = `
        margin: 25px 35px 30px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
        text-align:center;
        color:#9ca3af;
        font-size:11px;
    `;
 footer.textContent =
  "عایق فیروز © طراحی درب و پنجره";
 wrapper.appendChild(
  footer
 );
 return wrapper;
}
/*
 * ============================================================
 * ساخت یک ردیف اطلاعات
 * ============================================================
 */
function createInfoRow(
 label,
 value
) {
 return `
        <div style="
            display:flex;
            align-items:center;
            min-height:34px;
            border-bottom:1px solid #f1f5f9;
            font-size:12px;
            direction:rtl;
        ">
            <span style="
                width:85px;
                color:#6b7280;
                flex-shrink:0;
            ">
                ${escapeHTML(label)}
            </span>
            <span style="
                flex:1;
                color:#111827;
                font-weight:500;
                text-align:right;
                word-break:break-word;
            ">
                ${escapeHTML(value)}
            </span>
        </div>
    `;
}
/*
 * ============================================================
 * فرمت عدد
 * ============================================================
 */
function formatNumber(
 value
) {
 if (
  value === undefined ||
  value === null ||
  value === ""
 ) {
  return "0";
 }
 const number =
  Number(value);
 if (
  Number.isNaN(number)
 ) {
  return String(value);
 }
 return number.toLocaleString(
  "en-US"
 );
}
/*
 * ============================================================
 * جلوگیری از ورود HTML داخل اطلاعات
 * ============================================================
 */
function escapeHTML(
 value
) {
 const text =
  String(
   value ??
   "-"
  );
 return text
  .replace(
   /&/g,
   "&amp;"
  )
  .replace(
   /</g,
   "&lt;"
  )
  .replace(
   />/g,
   "&gt;"
  )
  .replace(
   /"/g,
   "&quot;"
  )
  .replace(
   /'/g,
   "&#039;"
  );
}
/*
 * ============================================================
 * انتظار برای لود شدن تصاویر
 * ============================================================
 */
function waitForImages(
 container
) {
 const images =
  Array.from(
   container.querySelectorAll(
    "img"
   )
  );
 return Promise.all(
  images.map(
   image =>
    new Promise(
     resolve => {
      if (
       image.complete
      ) {
       resolve();
       return;
      }
      image.onload =
       resolve;
      image.onerror =
       resolve;
     }
    )
  )
 );
}
/*
 * ============================================================
 * تولید PDF
 * ============================================================
 */
export async function exportDesignPDF() {
 console.log(
  "========== EXPORT PDF =========="
 );
 /*
  * بررسی طراحی‌ها
  */
 if (
  !Array.isArray(
   state.tempDesigns
  ) ||
  state.tempDesigns.length === 0
 ) {
  if (
   window.Swal
  ) {
   await Swal.fire({
    icon: "warning",
    title: "طراحی وجود ندارد",
    text:
     "ابتدا حداقل یک طراحی ایجاد کنید."
   });
  } else {
   alert(
    "ابتدا حداقل یک طراحی ایجاد کنید."
   );
  }
  return;
 }
 /*
  * بررسی html2pdf
  */
 if (
  typeof window.html2pdf !==
  "function"
 ) {
  console.error(
   "html2pdf پیدا نشد."
  );
  if (
   window.Swal
  ) {
   await Swal.fire({
    icon: "error",
    title: "خطا",
    text:
     "کتابخانه تولید PDF بارگذاری نشده است."
   });
  }
  return;
 }
 /*
  * آماده کردن اطلاعات
  */
 const designs =
  state.tempDesigns.map(
   item =>
    getDesignData(
     item
    )
  );
 console.log(
  "PDF DESIGNS:",
  designs
 );
 /*
  * ساخت سند
  */
 const documentElement =
  createPDFDocument(
   designs
  );
 document.body.appendChild(
  documentElement
 );
 console.log("PDF ELEMENT:", documentElement);
 console.log("PDF ELEMENT RECT:", documentElement.getBoundingClientRect());
 console.log("PDF ELEMENT SIZE:", {
  width: documentElement.offsetWidth,
  height: documentElement.offsetHeight
 });
 try {
  /*
   * صبر برای تصاویر
   */
  await waitForImages(
   documentElement
  );
  /*
   * کمی فرصت برای Render
   */
  await new Promise(
   resolve =>
    setTimeout(
     resolve,
     150
    )
  );
  /*
   * تنظیمات PDF
   */
  const options = {
   margin: [
    8,
    8,
    8,
    8
   ],
   filename:
    "design-upvc.pdf",
   image: {
    type: "jpeg",
    quality: 0.98
   },
   html2canvas: {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: true,
    foreignObjectRendering: false,
    windowWidth: 794,
    windowHeight: 1123
   },
   jsPDF: {
    unit: "mm",
    format: "a4",
    orientation:
     "portrait",
    compress: true
   },
   pagebreak: {
    mode: [
     "css",
     "legacy"
    ]
   }
  };
  /*
   * تولید PDF
   */
  await window
   .html2pdf()
   .set(options)
   .from(
    documentElement
   )
   .save();
  console.log(
   "PDF CREATED SUCCESSFULLY"
  );
 } catch (error) {
  console.error(
   "خطا در ساخت PDF:",
   error
  );
  if (
   window.Swal
  ) {
   await Swal.fire({
    icon: "error",
    title: "خطا در ذخیره PDF",
    text:
     "ساخت فایل PDF با مشکل مواجه شد."
   });
  } else {
   alert(
    "ساخت فایل PDF با مشکل مواجه شد."
   );
  }
 } finally {
  /*
   * حذف HTML موقت
   */
  documentElement.remove();
 }
}