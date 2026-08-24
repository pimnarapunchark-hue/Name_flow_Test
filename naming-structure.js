(function () {

  const STORAGE_KEY =
    "nameflow_naming_structure";


  const defaultStructure = [

    {
      id: "date",
      label: "วันที่ของเอกสาร",
      enabled: true
    },

    {
      id: "doctype",
      label: "ประเภทเอกสาร",
      enabled: true
    },

    {
      id: "division",
      label: "กอง / ศูนย์ / กลุ่ม",
      enabled: true
    },

    {
      id: "dept",
      label: "กลุ่มงาน / ฝ่าย",
      enabled: true
    },

    {
      id: "dept-code",
      label: "รหัสส่วนราชการ",
      enabled: true
    },

    {
      id: "order",
      label: "ลำดับหนังสือส่งออก",
      enabled: true
    },

    {
      id: "letter-no",
      label: "เลขที่หนังสือส่งออก",
      enabled: true
    },

    {
      id: "title",
      label: "ชื่อเรื่อง",
      enabled: true
    },

    {
      id: "recipient",
      label: "ถึง / ผู้รับ",
      enabled: true
    }

  ];


  function loadStructure() {

    try {

      const saved =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          )
        );


      if (
        Array.isArray(saved) &&
        saved.length
      ) {
        return saved;
      }

    } catch (error) {}


    return JSON.parse(
      JSON.stringify(
        defaultStructure
      )
    );

  }


  function saveStructure(list) {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(list)
    );

  }


  function resetStructure() {

    localStorage.removeItem(
      STORAGE_KEY
    );

    renderStructurePage();

  }


  function renderStructurePage() {

    const host =
      document.getElementById(
        "page-structure"
      );


    if (!host) return;


    const list =
      loadStructure();


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

          <br><br>

          สามารถเปิดหรือปิดฟิลด์
          และเลื่อนลำดับก่อนหรือหลังได้

          <br><br>

          การตั้งค่านี้ใช้สำหรับกำหนด
          <b>โครงสร้างหลักของชื่อไฟล์</b>

          ส่วนฟิลด์เพิ่มเติมจะสามารถเลือกตำแหน่ง
          เพื่อแทรกเข้าไปในโครงสร้างนี้ได้

        </div>


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
            คืนค่าเริ่มต้น
          </button>

        </div>

      </div>

    `;


    const wrap =
      document.getElementById(
        "structureList"
      );


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
                loadStructure();


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
                loadStructure();


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
                  list
                );


                renderStructurePage();

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
                loadStructure();


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
                  list
                );


                renderStructurePage();

              }

            }

          );

        }
      );


    document
      .getElementById(
        "saveStructureBtn"
      )
      .addEventListener(
        "click",

        function () {

          alert(
            "บันทึกโครงสร้างการตั้งชื่อไฟล์เรียบร้อย"
          );

        }

      );


    document
      .getElementById(
        "resetStructureBtn"
      )
      .addEventListener(
        "click",

        function () {

          resetStructure();

        }

      );

  }


  function updatePreview() {

    const preview =
      document.getElementById(
        "structurePreview"
      );


    if (!preview) return;


    const list =
      loadStructure()
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


  window.renderStructurePage =
    renderStructurePage;


  window.getNamingStructure =
    loadStructure;

})();