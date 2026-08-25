(function () {

  /* =========================================================
     จัดการโครงสร้างการตั้งชื่อไฟล์ — แยกตามส่วนจริงของระบบ
     (ต้องตรงกับ data-cf-target ในหน้า index.html และ
     ตัวเลือก "แสดงผลในหน้าใด" ใน custom-fields.js)
     ========================================================= */

  const STORAGE_PREFIX = "nameflow_naming_structure__";
  const OLD_STORAGE_KEY = "nameflow_naming_structure"; // key เดิม (ก่อนแยกตามส่วน)
  const MIGRATION_FLAG = "nameflow_naming_structure_migrated_v2";

  /* ---------- 1) รายชื่อ "ส่วน" ของระบบที่มีโครงสร้างชื่อไฟล์เป็นของตัวเอง ---------- */

  const structureContexts = [

    {
      id: "single",
      label: "ไฟล์เดี่ยว — ทุกประเภท"
    },

    {
      id: "single-draft",
      label: "ไฟล์เดี่ยว — ร่างหนังสือ"
    },

    {
      id: "single-signed",
      label: "ไฟล์เดี่ยว — หนังสือลงนามแล้ว"
    },

    {
      id: "bundle-common",
      label: "ชุดเอกสาร — ข้อมูลส่วนกลาง"
    },

    {
      id: "bundle-memo",
      label: "ชุดเอกสาร — บันทึก(เอกสารหลักที่เสนอ)"
    },

    {
      id: "bundle-attachments",
      label: "ชุดเอกสาร — เอกสารแนบ"
    },

    {
      id: "bundle-draft-letter",
      label: "ชุดเอกสาร — หนังสือ(ร่าง)"
    }

  ];

  /* ---------- 2) โครงสร้างเริ่มต้นของแต่ละส่วน ---------- */
  /* อิงตามฟิลด์ที่ใช้จริงในแต่ละส่วนของหน้า "ตั้งชื่อไฟล์" */

  const fieldCatalog = {
    date:       "วันที่ของเอกสาร",
    doctype:    "ประเภทเอกสาร",
    division:   "กอง / ศูนย์ / กลุ่ม",
    dept:       "กลุ่มงาน / ฝ่าย",
    "dept-code":"รหัสส่วนราชการ",
    order:      "ลำดับหนังสือส่งออก",
    "letter-no":"เลขที่หนังสือส่งออก",
    session:    "ครั้งที่",
    signer:     "ผู้มีอำนาจลงนาม (S)",
    title:      "ชื่อเรื่อง",
    recipient:  "ถึง / ผู้รับ"
  };

  function field(id) {
    return { id: id, label: fieldCatalog[id], enabled: true };
  }

  const defaultStructures = {

    single: [
      field("date"),
      field("division"),
      field("dept"),
      field("doctype"),
      field("signer"),
      field("title"),
      field("recipient")
    ],

    "single-draft": [
      field("date"),
      field("dept-code"),
      field("order"),
      field("signer"),
      field("title"),
      field("recipient")
    ],

    "single-signed": [
      field("date"),
      field("dept-code"),
      field("letter-no"),
      field("order"),
      field("recipient")
    ],

    "bundle-common": [
      field("date"),
      field("division"),
      field("dept"),
      field("session")
    ],

    "bundle-memo": [
      field("signer"),
      field("recipient"),
      field("title")
    ],

    "bundle-attachments": [
      field("doctype"),
      field("title")
    ],

    "bundle-draft-letter": [
      field("dept-code"),
      field("order"),
      field("signer"),
      field("recipient"),
      field("title")
    ]

  };

  /* ---------- 3) สถานะแท็บที่กำลังเปิดอยู่ ---------- */

  let activeContext = structureContexts[0].id;

  /* ---------- 4) Storage ---------- */

  function storageKey(contextId) {
    return STORAGE_PREFIX + contextId;
  }

  function migrateOldStructureOnce() {

    if (localStorage.getItem(MIGRATION_FLAG)) return;

    try {

      const old = JSON.parse(
        localStorage.getItem(OLD_STORAGE_KEY)
      );

      if (Array.isArray(old) && old.length) {
        // ค่าที่บันทึกไว้แบบเดิม ใช้เป็นค่าเริ่มต้นของ "ไฟล์เดี่ยว — ทุกประเภท"
        localStorage.setItem(
          storageKey("single"),
          JSON.stringify(old)
        );
      }

    } catch (error) {}

    localStorage.setItem(MIGRATION_FLAG, "1");

  }

  function loadStructure(contextId) {

    migrateOldStructureOnce();

    try {

      const saved = JSON.parse(
        localStorage.getItem(storageKey(contextId))
      );

      if (Array.isArray(saved) && saved.length) {
        return saved;
      }

    } catch (error) {}

    const fallback = defaultStructures[contextId] || [];

    return JSON.parse(JSON.stringify(fallback));

  }

  function saveStructure(contextId, list) {

    localStorage.setItem(
      storageKey(contextId),
      JSON.stringify(list)
    );

  }

  function resetStructure(contextId) {

    localStorage.removeItem(
      storageKey(contextId)
    );

    renderStructurePage();

  }

  /* ---------- 5) Render ---------- */

  function renderStructurePage() {

    const host =
      document.getElementById(
        "page-structure"
      );

    if (!host) return;

    host.innerHTML = `

      <div class="page-title-row">

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M4 7h16"/>
          <path d="M4 12h16"/>
          <path d="M4 17h16"/>
        </svg>

        <div class="page-title">
          จัดการโครงสร้างการตั้งชื่อไฟล์
        </div>

      </div>


      <div class="panel">

        <div class="cf-page-intro">

          กำหนดลำดับของข้อมูลที่ใช้ในการสร้างชื่อไฟล์
          แยกตามแต่ละส่วนของระบบ เนื่องจากแต่ละส่วนใช้ข้อมูล
          และรูปแบบชื่อไฟล์ที่ไม่เหมือนกัน

          <br><br>

          เลือกส่วนที่ต้องการจัดการโครงสร้างจากแท็บด้านล่าง
          จากนั้นสามารถเปิดหรือปิดฟิลด์ และเลื่อนลำดับก่อน/หลังได้

          <br><br>

          การตั้งค่านี้ใช้สำหรับกำหนด
          <b>โครงสร้างหลักของชื่อไฟล์ในแต่ละส่วน</b>
          ส่วนฟิลด์เพิ่มเติมจะสามารถเลือกตำแหน่ง
          เพื่อแทรกเข้าไปในโครงสร้างนี้ได้
          (กำหนดที่หน้า "จัดการฟิลด์เพิ่มเติม" โดยเลือก
          "แสดงผลในหน้าใด" ให้ตรงกับส่วนเดียวกันนี้)

        </div>


        <div
          id="structureTabs"
          class="ns-tabs"
        ></div>


        <div
          id="structurePreview"
          style="
            padding:14px 16px;
            border:1px dashed var(--line);
            border-radius:12px;
            margin:18px 0;
            font-size:13px;
          "
        ></div>


        <div
          id="structureList"
          style="
            display:flex;
            flex-direction:column;
            gap:10px;
          "
        ></div>


        <div
          style="
            display:flex;
            gap:10px;
            margin-top:20px;
          "
        >

          <button
            class="btn-add-field"
            id="saveStructureBtn"
            type="button"
          >
            บันทึกโครงสร้าง
          </button>


          <button
            class="btn-ghost"
            id="resetStructureBtn"
            type="button"
          >
            คืนค่าเริ่มต้น (เฉพาะส่วนนี้)
          </button>

        </div>

      </div>

    `;

    renderTabs();
    renderList();

  }

  function renderTabs() {

    const tabWrap =
      document.getElementById(
        "structureTabs"
      );

    if (!tabWrap) return;

    tabWrap.innerHTML = structureContexts
      .map(function (ctx) {

        return `
          <button
            type="button"
            class="ns-tab${ctx.id === activeContext ? " active" : ""}"
            data-context="${ctx.id}"
          >
            ${ctx.label}
          </button>
        `;

      })
      .join("");

    tabWrap
      .querySelectorAll("[data-context]")
      .forEach(function (btn) {

        btn.addEventListener("click", function () {

          activeContext = btn.dataset.context;

          renderTabs();
          renderList();

        });

      });

  }

  function renderList() {

    const wrap =
      document.getElementById(
        "structureList"
      );

    if (!wrap) return;

    const list =
      loadStructure(activeContext);

    wrap.innerHTML = "";

    list.forEach(
      function (
        item,
        index
      ) {

        const row =
          document.createElement(
            "div"
          );


        row.style.cssText = `
          display:flex;
          align-items:center;
          gap:12px;
          padding:14px;
          border:1px solid var(--line);
          border-radius:12px;
          background:#fff;
        `;


        row.innerHTML = `

          <div
            style="
              width:30px;
              font-weight:800;
              color:var(--teal-700);
            "
          >
            ${index + 1}
          </div>


          <div
            style="
              flex:1;
            "
          >

            <div
              style="
                font-weight:700;
              "
            >
              ${item.label}
            </div>

          </div>


          <label
            style="
              display:flex;
              align-items:center;
              gap:6px;
              font-size:12px;
              cursor:pointer;
            "
          >

            <input
              type="checkbox"
              data-enable="${item.id}"
              ${item.enabled ? "checked" : ""}
            >

            ใช้งาน

          </label>


          <button
            type="button"
            data-up="${item.id}"
            class="btn-ghost"
          >
            ↑
          </button>


          <button
            type="button"
            data-down="${item.id}"
            class="btn-ghost"
          >
            ↓
          </button>

        `;


        wrap.appendChild(
          row
        );

      }
    );


    updatePreview();


    wrap
      .querySelectorAll(
        "[data-enable]"
      )
      .forEach(
        function (checkbox) {

          checkbox.addEventListener(
            "change",

            function () {

              const list =
                loadStructure(activeContext);


              const item =
                list.find(
                  x =>
                    x.id ===
                    checkbox.dataset.enable
                );


              if (item) {

                item.enabled =
                  checkbox.checked;

              }


              saveStructure(
                activeContext,
                list
              );


              updatePreview();

            }

          );

        }
      );


    wrap
      .querySelectorAll(
        "[data-up]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",

            function () {

              const list =
                loadStructure(activeContext);


              const index =
                list.findIndex(
                  x =>
                    x.id ===
                    button.dataset.up
                );


              if (index > 0) {

                const temp =
                  list[index - 1];


                list[index - 1] =
                  list[index];


                list[index] =
                  temp;


                saveStructure(
                  activeContext,
                  list
                );


                renderList();

              }

            }

          );

        }
      );


    wrap
      .querySelectorAll(
        "[data-down]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",

            function () {

              const list =
                loadStructure(activeContext);


              const index =
                list.findIndex(
                  x =>
                    x.id ===
                    button.dataset.down
                );


              if (
                index <
                list.length - 1
              ) {

                const temp =
                  list[index + 1];


                list[index + 1] =
                  list[index];


                list[index] =
                  temp;


                saveStructure(
                  activeContext,
                  list
                );


                renderList();

              }

            }

          );

        }
      );


    const saveBtn =
      document.getElementById(
        "saveStructureBtn"
      );

    if (saveBtn) {

      saveBtn.onclick = function () {

        alert(
          "บันทึกโครงสร้างการตั้งชื่อไฟล์เรียบร้อย"
        );

      };

    }


    const resetBtn =
      document.getElementById(
        "resetStructureBtn"
      );

    if (resetBtn) {

      resetBtn.onclick = function () {

        resetStructure(activeContext);

      };

    }

  }


  function updatePreview() {

    const preview =
      document.getElementById(
        "structurePreview"
      );


    if (!preview) return;


    const list =
      loadStructure(activeContext)
        .filter(
          item =>
            item.enabled
        );


    preview.innerHTML = `

      <b>
        ตัวอย่างโครงสร้างชื่อไฟล์
      </b>

      <br><br>

      ${list
        .map(
          item =>
            `<span
              style="
                display:inline-block;
                padding:5px 9px;
                margin:2px;
                border-radius:8px;
                background:var(--teal-100);
                color:var(--teal-700);
                font-size:12px;
              "
            >
              ${item.label}
            </span>`
        )
        .join(
          '<span style="margin:0 4px;">_</span>'
        )}

    `;

  }

  /* ---------- 6) CSS สำหรับแท็บ ---------- */

  var style = document.createElement("style");
  style.textContent = `
    .ns-tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;margin-bottom:4px;}
    .ns-tab{flex:0 0 auto;white-space:nowrap;background:var(--teal-100);color:var(--teal-700);border:none;padding:9px 14px;border-radius:9px;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s;}
    .ns-tab:hover{opacity:.85;}
    .ns-tab.active{background:var(--teal-700);color:#fff;}
  `;
  document.head.appendChild(style);


  window.renderStructurePage =
    renderStructurePage;


  /* getNamingStructure(contextId?) — ไม่ระบุ = ใช้ context "single" */
  window.getNamingStructure = function (contextId) {
    return loadStructure(contextId || "single");
  };

  /* รายชื่อ context ทั้งหมด เผื่อไฟล์อื่นต้องใช้ */
  window.getNamingStructureContexts = function () {
    return structureContexts.slice();
  };

})();