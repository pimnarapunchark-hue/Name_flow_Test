/* =========================================================
   custom-fields.js (System Fields & Custom Fields Manager)
   ========================================================= */
(function(){

  /* ---------- 1) Inject CSS ---------- */
  var style = document.createElement('style');
  style.textContent = `
    .cf-toolbar{display:flex;justify-content:flex-end;margin-bottom:14px;}
    .btn-add-field{background:linear-gradient(135deg, var(--teal-600), var(--teal-700));color:#fff;border:none;padding:10px 18px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;}
    .btn-add-field:hover{opacity:.92;}
    .cf-card{border:1.5px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:12px;background:#fff;}
    .cf-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;}
    .cf-card-title{font-size:14px;font-weight:800;color:var(--ink-900);}
    .cf-card-type{font-size:11px;font-weight:700;color:var(--teal-700);background:var(--teal-100);padding:2px 9px;border-radius:20px;margin-left:8px;}
    .cf-card-target{font-size:11px;font-weight:700;color:#6b21a8;background:#f3e8ff;padding:2px 9px;border-radius:20px;margin-left:4px;}
    .cf-card-actions{display:flex;gap:8px;flex-shrink:0;}
    .cf-card-actions button{border:1.5px solid var(--line);background:#fff;border-radius:7px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;color:var(--ink-700);}
    .cf-card-actions button:hover{border-color:var(--teal-500);color:var(--teal-700);}
    .cf-card-actions button.danger:hover{border-color:var(--red);color:var(--red);}
    .cf-options-wrap{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;}
    .cf-chip{background:var(--teal-50,#f0fdfa);border:1px solid var(--teal-100);color:var(--teal-700);font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;}
    .cf-option-row{display:flex;gap:8px;margin-bottom:8px;align-items:center;}
    .cf-option-row input{flex:1;padding:9px 12px;border:1.5px solid var(--line);border-radius:8px;font-size:13px;outline:none;}
    .cf-option-row input:focus{border-color:var(--teal-500);}
    .cf-option-remove{background:none;border:none;color:var(--ink-300);cursor:pointer;padding:4px;flex-shrink:0;}
    .cf-option-remove:hover{color:var(--red);}
    .cf-empty{text-align:center;color:var(--ink-300);font-size:13px;padding:30px 0;}
    .cf-page-intro{font-size:12.5px;color:var(--ink-500);margin-bottom:14px;}
    .cf-rule-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;}
    .cf-rule-grid .field{margin-bottom:0!important;}
    .cf-rule-help{font-size:11px;color:var(--ink-500);margin-top:5px;line-height:1.5;}
    .cf-system-badge{font-size:11px;font-weight:700;color:#925f09;background:var(--gold-100);padding:2px 9px;border-radius:20px;margin-left:4px;}
    .cf-required-badge{font-size:11px;font-weight:700;color:#b91c1c;background:#fee2e2;padding:2px 9px;border-radius:20px;margin-left:4px;}
    .cf-locked-badge{font-size:11px;font-weight:700;color:#475569;background:#e2e8f0;padding:2px 9px;border-radius:20px;margin-left:4px;}
    .cf-card-rules{font-size:11.5px;color:var(--ink-500);margin-top:10px;}
    .cf-locked-note{font-size:12px;line-height:1.6;color:#925f09;background:var(--gold-100);border-radius:9px;padding:10px 13px;margin-top:4px;}
    .cf-section-title{font-size:13.5px;font-weight:800;color:var(--ink-900);margin:26px 0 10px;display:flex;align-items:center;gap:8px;}
    .cf-trash-card{opacity:.92;}
    @media(max-width:600px){.cf-rule-grid{grid-template-columns:1fr;}}
    /* Forces a field hidden even when core page logic later toggles its inline style.display */
    .cf-field-removed{display:none!important;}
  `;
  document.head.appendChild(style);

  /* ---------- 2) Inject Field Modals ---------- */
  // เช็คและลบ Modal เก่าทิ้งก่อนเพื่อป้องกัน ID ซ้ำซ้อน
  var oldModals = document.getElementById('cf-injected-modals');
  if(oldModals) oldModals.remove();

  var modalWrap = document.createElement('div');
  modalWrap.id = 'cf-injected-modals'; // กำหนด ID ให้ตัวคุมทั้งหมด
  modalWrap.innerHTML = `
    <!-- แก้ไข/เพิ่ม ฟิลด์ Modal -->
    <div class="modal-overlay" id="fieldModal">
      <div class="modal-card">
        <div class="modal-head">
          <div class="modal-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M12 5v14M5 12h14"/></svg>
            <span id="fieldModalTitle">เพิ่ม/แก้ไข ฟิลด์</span>
          </div>
          <button class="modal-close" type="button" id="cfCloseModalBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cfEditId" value="">
          <div class="field" style="margin-bottom:14px;">
            <label>ชื่อฟิลด์ (ป้ายกำกับ)</label>
            <input type="text" id="cfLabel" placeholder="เช่น หมายเลขโครงการ, สถานที่จัดประชุม">
          </div>
          <div class="field" id="cfTargetPageRow" style="margin-bottom:14px;">
            <label>แสดงผลในหน้าใด</label>
            <select id="cfTargetPage">
              <option value="both">ทุกส่วนของระบบ</option>
              <option value="single">ตั้งชื่อไฟล์เดี่ยว — ทุกประเภท</option>
              <option value="single-draft">ตั้งชื่อไฟล์เดี่ยว — ร่างหนังสือ</option>
              <option value="single-signed">ตั้งชื่อไฟล์เดี่ยว — หนังสือลงนามแล้ว</option>
              <option value="bundle">ชุดเอกสารครบชุด — ทุกส่วน</option>
              <option value="bundle-common">ชุดเอกสารครบชุด — ข้อมูลส่วนกลาง</option>
              <option value="bundle-attachments">ชุดเอกสารครบชุด — เอกสารแนบ</option>
              <option value="bundle-draft-letter">ชุดเอกสารครบชุด — หนังสือ(ร่าง)</option>
            </select>
          </div>
          <div class="field" id="cfTypeRow" style="margin-bottom:14px;">
            <label>ประเภทฟิลด์</label>
            <select id="cfType">
              <option value="text">ช่องข้อความอิสระ</option>
              <option value="select">ช่องแบบเลือกตัวเลือก (Dropdown)</option>
            </select>
          </div>
          <div class="cf-locked-note" id="cfLockedNote" style="display:none;"></div>
          <div id="cfRulesBlock">
            <label style="display:block;font-size:12.5px;font-weight:700;color:var(--ink-700);margin-bottom:7px;">กติกาการกรอกข้อมูล</label>
            <div class="cf-rule-grid">
              <div class="field">
                <label>ชนิดข้อมูล</label>
                <select id="cfInputMode">
                  <option value="any">ตัวเลขและตัวอักษร</option>
                  <option value="number">ตัวเลขเท่านั้น</option>
                  <option value="letters">ตัวอักษรเท่านั้น</option>
                </select>
              </div>
              <div class="field">
                <label>จำนวนตัวเลขสูงสุด</label>
                <input type="number" id="cfMaxDigits" min="0" step="1" placeholder="ไม่จำกัด">
              </div>
              <div class="field">
                <label>จำนวนตัวอักษรสูงสุด</label>
                <input type="number" id="cfMaxLetters" min="0" step="1" placeholder="ไม่จำกัด">
              </div>
            </div>
            <div class="cf-rule-help">เว้นว่างหากไม่ต้องการจำกัดจำนวน ตัวอักษรภาษาไทยและช่องว่างนับเป็นข้อความ</div>
          </div>
          <div id="cfOptionsBlock" style="display:none;">
            <label style="display:block;font-size:12.5px;font-weight:700;color:var(--ink-700);margin-bottom:7px;">ตัวเลือกใน Dropdown</label>
            <div id="cfOptionsList"></div>
            <button class="btn-add-attach" id="cfAddOptionBtn" type="button">+ เพิ่มตัวเลือก</button>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-ghost" type="button" id="cfCancelModalBtn">ยกเลิก</button>
          <button class="btn-ghost solid" id="submitFieldBtn" type="button">บันทึกฟิลด์</button>
        </div>
      </div>
    </div>

    <!-- ลบ/ซ่อน ฟิลด์ Modal -->
    <div class="modal-overlay" id="deleteFieldModal">
      <div class="modal-card">
        <div class="modal-head">
          <div class="modal-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>
            <span>ลบ/ซ่อน ฟิลด์</span>
          </div>
          <button class="modal-close" type="button" id="closeDelModalBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="delFieldId" value="">
          <div style="margin-bottom:15px; font-size:13.5px;">คุณกำลังจัดการฟิลด์: <b id="delFieldName" style="color:var(--teal-700);"></b></div>
          <div class="field" style="margin-bottom:14px;">
            <label>รูปแบบการลบ/ซ่อน</label>
            <select id="delActionType">
              <option value="trash">ลบออกจากระบบทั้งหมด (ย้ายไปถังขยะ)</option>
              <option value="hide">ลบ/ซ่อนจากบางส่วน (คงไว้ในหน้าที่ต้องการแทน)</option>
            </select>
          </div>
          <div class="field" id="delTargetWrap" style="display:none; margin-bottom:14px;">
            <label>เลือกหน้าที่ยังต้องการให้แสดงผล (ที่เหลือจะถูกซ่อน)</label>
            <select id="delTargetPage">
              <option value="both">ทุกส่วนของระบบ</option>
              <option value="single">ตั้งชื่อไฟล์เดี่ยว — ทุกประเภท</option>
              <option value="single-draft">ตั้งชื่อไฟล์เดี่ยว — ร่างหนังสือ</option>
              <option value="single-signed">ตั้งชื่อไฟล์เดี่ยว — หนังสือลงนามแล้ว</option>
              <option value="bundle">ชุดเอกสารครบชุด — ทุกส่วน</option>
              <option value="bundle-common">ชุดเอกสารครบชุด — ข้อมูลส่วนกลาง</option>
              <option value="bundle-attachments">ชุดเอกสารครบชุด — เอกสารแนบ</option>
              <option value="bundle-draft-letter">ชุดเอกสารครบชุด — หนังสือ(ร่าง)</option>
            </select>
          </div>
          <div class="cf-rule-help" id="delWarning" style="color:var(--red); display:none; font-weight:700;">
            ⚠️ ฟิลด์นี้จำเป็นต่อการสร้างชื่อไฟล์ หากลบหรือซ่อน อาจทำให้สร้างชื่อไฟล์ไม่ได้ในบางกรณี
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-ghost" type="button" id="cancelDelModalBtn">ยกเลิก</button>
          <button class="btn-ghost solid" style="background:var(--red);" id="confirmDelBtn" type="button">ยืนยัน</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalWrap);

  /* ---------- Delete Modal Logic ---------- */
  document.getElementById('delActionType').addEventListener('change', function(){
    document.getElementById('delTargetWrap').style.display = this.value === 'hide' ? 'block' : 'none';
  });
  function closeDelModal(){ document.getElementById('deleteFieldModal').classList.remove('open'); }
  document.getElementById('closeDelModalBtn').addEventListener('click', closeDelModal);
  document.getElementById('cancelDelModalBtn').addEventListener('click', closeDelModal);

  document.getElementById('confirmDelBtn').addEventListener('click', function(){
    var id = document.getElementById('delFieldId').value;
    var action = document.getElementById('delActionType').value;
    var list = loadCustomFields();
    var idx = list.findIndex(function(f){ return f.id === id; });
    if(idx === -1) return;

    var field = list[idx];

    if(action === 'trash'){
      list.splice(idx, 1);
      saveCustomFields(list);
      addToTrash(field);
    } else {
      // Changed to 'hide' -> just update the targetPage
      field.targetPage = document.getElementById('delTargetPage').value;
      saveCustomFields(list);
    }

    closeDelModal();
    renderFieldsPage();
    renderCustomFieldsInCreatePage();
  });

  /* ---------- 3) Setup Page Host ---------- */
  var pageHost = document.getElementById('page-fields');
  if(pageHost){
    pageHost.innerHTML = `
      <div class="page-title-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        <div class="page-title">จัดการฟิลด์ทั้งหมด (รวมฟิลด์เริ่มต้น)</div>
      </div>
      <div class="panel">
        <div class="cf-page-intro">
          กำหนดฟิลด์กรอกข้อมูลในหน้าต่างๆ ได้ทุกช่อง แก้ไขป้ายกำกับ ลบ/ซ่อน หรือกู้คืนฟิลด์ที่เคยลบไปแล้ว<br>
          ฟิลด์ที่มีป้าย <span class="cf-locked-badge" style="margin-left:0;">ล็อกโครงสร้าง</span> ผูกกับตรรกะการสร้างชื่อไฟล์ (เช่น ตัวเลือกในดรอปดาวน์) จึงไม่สามารถลบได้และแก้ไขได้เฉพาะป้ายกำกับ
        </div>
        <div class="cf-toolbar">
          <button class="btn-add-field" id="addFieldBtn" type="button">+ เพิ่มฟิลด์ใหม่</button>
        </div>
        <div id="adminFieldsList"></div>
        <div class="cf-empty" id="adminFieldsEmpty" style="display:none;">ยังไม่มีฟิลด์ในระบบ — กดปุ่ม "เพิ่มฟิลด์ใหม่" เพื่อเริ่มต้น</div>
      </div>

      <!-- แยกบล็อค ฟิลด์ที่ถูกลบ ตามความต้องการที่ 1 -->
      <div class="panel" style="margin-top: 24px;">
        <div class="cf-section-title" style="margin-top: 0;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:17px;height:17px;"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>
          ฟิลด์ที่ถูกลบ (กู้คืนได้)
        </div>
        <div id="deletedFieldsList"></div>
        <div class="cf-empty" id="deletedFieldsEmpty" style="display:none;">ยังไม่มีฟิลด์ที่ถูกลบ</div>
      </div>
    `;
  }

  /* ---------- 4) Default System Fields & Storage ---------- */
  var defaultFields = [
    /* --- ฟิลด์หลัก ที่ผูกกับโครงสร้างการสร้างชื่อไฟล์ (ล็อกโครงสร้าง) --- */
    { id: 'sys_date',     label: 'วันที่ของเอกสาร',     targetPage: 'both', type: 'date',   isSystem: true, locked: true, required: true },
    { id: 'sys_doctype',  label: 'ประเภทเอกสาร',        targetPage: 'both', type: 'select', isSystem: true, locked: true, required: true },
    { id: 'sys_division', label: 'กอง / ศูนย์ / กลุ่ม',   targetPage: 'both', type: 'select', isSystem: true, locked: true, required: true },
    { id: 'sys_dept',     label: 'กลุ่มงาน / ฝ่าย',       targetPage: 'both', type: 'select', isSystem: true, locked: true, required: false },
    { id: 'sys_category', label: 'หมวดหมู่เรื่อง',       targetPage: 'both', type: 'select', isSystem: true, locked: true, required: false },
    /* --- ฟิลด์ข้อความ แก้ไข/ลบ/ซ่อน ได้ (ไม่ล็อคโครงสร้าง) --- */
    { id: 'sys_mdes',     label: 'รหัสส่วนราชการ',      targetPage: 'both', type: 'text', inputMode: 'any', maxDigits: 0, maxLetters: 0, isSystem: true, locked: false, required: false },
    { id: 'sys_order',    label: 'ลำดับหนังสือส่งออก',  targetPage: 'both', type: 'text', inputMode: 'any', maxDigits: 0, maxLetters: 0, isSystem: true, locked: false, required: false },
    { id: 'sys_letterno', label: 'เลขที่หนังสือส่งออก',  targetPage: 'both', type: 'text', inputMode: 'any', maxDigits: 0, maxLetters: 0, isSystem: true, locked: false, required: false },
    { id: 'sys_title',    label: 'ชื่อเรื่อง',            targetPage: 'both', type: 'text', inputMode: 'any', maxDigits: 0, maxLetters: 0, isSystem: true, locked: false, required: false },
    { id: 'sys_session',  label: 'ครั้งที่', targetPage: 'both', type: 'text', inputMode: 'number', maxDigits: 3, maxLetters: 0, isSystem: true, locked: false, required: false },
    { id: 'sys_to',       label: 'ถึง / ผู้รับ', targetPage: 'both', type: 'text', inputMode: 'any', maxDigits: 0, maxLetters: 100, isSystem: true, locked: false, required: false },
    { id: 'sys_signer',   label: 'ผู้มีอำนาจลงนาม (S)', targetPage: 'both', type: 'text', inputMode: 'any', maxDigits: 0, maxLetters: 100, isSystem: true, locked: false, required: false }
  ];

  var systemFieldBindings = {
    sys_date:     { inputId: 'f-date',      fieldId: 'field-date' },
    sys_doctype:  { inputId: 'f-doctype',   fieldId: 'field-doctype' },
    sys_division: { inputId: 'f-division',  fieldId: 'field-division' },
    sys_dept:     { inputId: 'f-dept',      fieldId: 'field-dept' },
    sys_category: { inputId: 'f-category',  fieldId: 'field-category' },
    sys_mdes:     { inputId: 'f-mdes',      fieldId: 'field-mdes' },
    sys_order:    { inputId: 'f-order',     fieldId: 'field-order' },
    sys_letterno: { inputId: 'f-letter-no', fieldId: 'field-letter-no' },
    sys_title:    { inputId: 'f-title',     fieldId: 'field-title' },
    sys_session:  { inputId: 'f-session',   fieldId: 'field-session' },
    sys_to:       { inputId: 'f-to',        fieldId: null },
    sys_signer:   { inputId: 'f-signer',    fieldId: 'field-signer' }
  };

  /* ผูกฟิลด์ระบบกับช่องกรอกในหน้า "ชุดเอกสารครบชุด" (set-*) ด้วย
     เพื่อให้การแก้ไขป้ายกำกับ / ลบ / ซ่อน / กติกาการกรอก มีผลกับหน้า set ด้วย
     (ฟิลด์ที่ไม่มีช่องเทียบในหน้า set เช่น ประเภทเอกสาร หมวดหมู่ เลขที่หนังสือส่งออก จะไม่ผูก) */
  var bundleFieldBindings = {
    sys_date:     { inputIds: ['set-date'] },
    sys_division: { inputIds: ['set-division'] },
    sys_dept:     { inputIds: ['set-dept'] },
    sys_session:  { inputIds: ['set-session'] },
    sys_mdes:     { inputIds: ['set-mdes'] },
    sys_order:    { inputIds: ['set-order'] },
    sys_to:       { inputIds: ['set-memo-to', 'set-letter-to'] },
    sys_signer:   { inputIds: ['set-memo-signer', 'set-letter-signer'] },
    sys_title:    { inputIds: ['set-memo-title', 'set-letter-title'] }
  };

  var MIGRATION_FLAG = 'system_fields_migrated_v4';

  function normalizeField(f){
    f.inputMode = f.inputMode || 'any';
    f.maxDigits = Number.isFinite(Number(f.maxDigits)) ? Math.max(0, Number(f.maxDigits)) : 0;
    f.maxLetters = Number.isFinite(Number(f.maxLetters)) ? Math.max(0, Number(f.maxLetters)) : 0;
    f.locked = !!f.locked;
    f.required = !!f.required;
    return f;
  }

  function loadCustomFields(){
    var raw = localStorage.getItem('custom_fields');
    if(!raw){
      saveCustomFields(defaultFields);
      localStorage.setItem(MIGRATION_FLAG, '1');
      return defaultFields;
    }
    try{
      var list = JSON.parse(raw).map(normalizeField);
      if(!localStorage.getItem(MIGRATION_FLAG)){
        defaultFields.forEach(function(def){
          if(!list.some(function(f){ return f.id === def.id; })){
            list.push(def);
          }
        });
        saveCustomFields(list);
        localStorage.setItem(MIGRATION_FLAG, '1');
      }
      return list;
    }catch(e){ return defaultFields; }
  }

  function saveCustomFields(list){
    localStorage.setItem('custom_fields', JSON.stringify(list));
  }

  /* ---------- 4b) Trash (Deleted Fields) Storage ---------- */
  function loadTrashedFields(){
    try{ return JSON.parse(localStorage.getItem('deleted_custom_fields') || '[]'); }
    catch(e){ return []; }
  }

  function saveTrashedFields(list){
    localStorage.setItem('deleted_custom_fields', JSON.stringify(list));
  }

  function addToTrash(field){
    var trash = loadTrashedFields().filter(function(t){ return t.id !== field.id; });
    var snapshot = Object.assign({}, field, { deletedAt: Date.now() });
    trash.unshift(snapshot);
    saveTrashedFields(trash);
  }

  function restoreField(id){
    var trash = loadTrashedFields();
    var idx = trash.findIndex(function(t){ return t.id === id; });
    if(idx === -1) return;
    var field = Object.assign({}, trash[idx]);
    delete field.deletedAt;
    trash.splice(idx, 1);
    saveTrashedFields(trash);
    var list = loadCustomFields();
    if(!list.some(function(f){ return f.id === field.id; })){
      list.push(normalizeField(field));
      saveCustomFields(list);
    }
  }

  function purgeTrashedField(id){
    saveTrashedFields(loadTrashedFields().filter(function(t){ return t.id !== id; }));
  }

  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function toggleModal(open){
    var m = document.getElementById('fieldModal');
    if(!m) return;
    if(open) m.classList.add('open');
    else m.classList.remove('open');
  }

  /* ---------- 5) Render Fields Page ---------- */
  function fieldTypeLabel(f){
    if(f.type === 'select') return 'Dropdown';
    if(f.type === 'date') return 'วันที่';
    return 'ข้อความ';
  }

  function renderFieldsPage(){
    var list = loadCustomFields();
    var wrap = document.getElementById('adminFieldsList');
    var empty = document.getElementById('adminFieldsEmpty');
    if(!wrap) return;
    if(!list.length){ wrap.innerHTML=''; if(empty) empty.style.display='block'; renderTrashSection(); return; }
    if(empty) empty.style.display='none';

    var targetText = { 
      'both': 'ทั้งสองหน้า', 
      'single': 'ไฟล์เดี่ยว (ทุกประเภท)', 
      'single-draft': 'ไฟล์เดี่ยว (ร่าง)', 
      'single-signed': 'ไฟล์เดี่ยว (ลงนาม)',
      'bundle': 'ชุดเอกสาร (ทุกส่วน)',
      'bundle-common': 'ชุดเอกสาร (ส่วนกลาง)',
      'bundle-attachments': 'ชุดเอกสาร (เอกสารแนบ)',
      'bundle-draft-letter': 'ชุดเอกสาร (ร่างหนังสือ)'
    };

    wrap.innerHTML = list.map(function(f){
      return `
      <div class="cf-card">
        <div class="cf-card-head">
          <div>
            <span class="cf-card-title">${escapeHtml(f.label)}</span>
            <span class="cf-card-type">${fieldTypeLabel(f)}</span>
            <span class="cf-card-target">${targetText[f.targetPage || 'both'] || 'ปรับแต่งแล้ว'}</span>
            ${f.isSystem?'<span class="cf-system-badge">ฟิลด์ระบบ</span>':''}
            ${f.required?'<span class="cf-required-badge">จำเป็น</span>':''}
            ${f.locked?'<span class="cf-locked-badge">ล็อกโครงสร้าง</span>':''}
          </div>
          <div class="cf-card-actions">
            <button data-edit="${f.id}" type="button">แก้ไข</button>
            <button data-del="${f.id}" class="danger" type="button">ลบ</button>
          </div>
        </div>
        ${f.type==='select'?`<div class="cf-options-wrap">${(f.options||[]).map(function(o){return `<span class="cf-chip">${escapeHtml(o)}</span>`;}).join('')||'<span class="cf-chip">ยังไม่มีตัวเลือก</span>'}</div>`:''}
        ${f.type==='text'?`<div class="cf-card-rules">${f.inputMode==='number'?'ตัวเลขเท่านั้น':f.inputMode==='letters'?'ตัวอักษรเท่านั้น':'ตัวเลขและตัวอักษร'} · ตัวเลขสูงสุด ${f.maxDigits||'ไม่จำกัด'} · ตัวอักษรสูงสุด ${f.maxLetters||'ไม่จำกัด'}</div>`:''}
      </div>`;
    }).join('');

    wrap.querySelectorAll('[data-edit]').forEach(function(btn){
      btn.addEventListener('click', function(){ openFieldModal(btn.dataset.edit); });
    });
    
    // ผูก Event ปุ่มลบ ไปยัง Delete Modal (Goal 2)
    wrap.querySelectorAll('[data-del]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var field = list.find(function(f){ return f.id === btn.dataset.del; });
        if(!field) return;

        document.getElementById('delFieldId').value = field.id;
        document.getElementById('delFieldName').textContent = field.label;
        document.getElementById('delActionType').value = 'trash';
        document.getElementById('delTargetWrap').style.display = 'none';
        document.getElementById('delTargetPage').value = field.targetPage || 'both';

        if(field.required){
          document.getElementById('delWarning').style.display = 'block';
        } else {
          document.getElementById('delWarning').style.display = 'none';
        }

        document.getElementById('deleteFieldModal').classList.add('open');
      });
    });

    renderTrashSection();
  }

  /* ---------- 5b) Render Trash Section ---------- */
  function renderTrashSection(){
    var wrap = document.getElementById('deletedFieldsList');
    var empty = document.getElementById('deletedFieldsEmpty');
    if(!wrap) return;
    var trash = loadTrashedFields();
    if(!trash.length){ wrap.innerHTML=''; if(empty) empty.style.display='block'; return; }
    if(empty) empty.style.display='none';

    wrap.innerHTML = trash.map(function(f){
      var d = new Date(f.deletedAt);
      var dateStr = isNaN(d.getTime()) ? '' : d.toLocaleDateString('th-TH', {year:'numeric', month:'short', day:'numeric'});
      return `
      <div class="cf-card cf-trash-card">
        <div class="cf-card-head">
          <div>
            <span class="cf-card-title">${escapeHtml(f.label)}</span>
             <span class="cf-card-type">${fieldTypeLabel(f)}</span>
             ${f.isSystem?'<span class="cf-system-badge">ฟิลด์ระบบ</span>':''}
             ${f.required?'<span class="cf-required-badge">จำเป็น</span>':''}
          </div>
          <div class="cf-card-actions">
            <button data-restore="${f.id}" type="button">กู้คืน</button>
            <button data-purge="${f.id}" class="danger" type="button">ลบถาวร</button>
          </div>
        </div>
        <div class="cf-card-rules">ลบเมื่อ ${dateStr || 'ไม่ทราบวันที่'}</div>
      </div>`;
    }).join('');

    wrap.querySelectorAll('[data-restore]').forEach(function(btn){
      btn.addEventListener('click', function(){
        restoreField(btn.dataset.restore);
        renderFieldsPage();
        renderCustomFieldsInCreatePage();
      });
    });
    wrap.querySelectorAll('[data-purge]').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(!confirm('ลบฟิลด์นี้ออกจากถังถาวร จะไม่สามารถกู้คืนได้อีก ต้องการดำเนินการต่อหรือไม่?')) return;
        purgeTrashedField(btn.dataset.purge);
        renderTrashSection();
      });
    });
  }

  /* ---------- 6) Modal Actions ---------- */
  function cfAddOptionRow(value){
    var row = document.createElement('div');
    row.className = 'cf-option-row';
    row.innerHTML = `<input type="text" value="${escapeHtml(value||'')}" placeholder="เช่น ห้องประชุม 1">
      <button type="button" class="cf-option-remove" title="ลบตัวเลือกนี้">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>`;
    row.querySelector('.cf-option-remove').addEventListener('click', function(){ row.remove(); });
    document.getElementById('cfOptionsList').appendChild(row);
  }

  document.getElementById('cfAddOptionBtn').addEventListener('click', function(){ cfAddOptionRow(''); });
  document.getElementById('cfCloseModalBtn').addEventListener('click', function(){ toggleModal(false); });
  document.getElementById('cfCancelModalBtn').addEventListener('click', function(){ toggleModal(false); });

  document.getElementById('cfType').addEventListener('change', function(){
    var isSelect = (this.value === 'select');
    document.getElementById('cfOptionsBlock').style.display = isSelect ? 'block' : 'none';
    document.getElementById('cfRulesBlock').style.display = isSelect ? 'none' : 'block';
    if(isSelect && document.getElementById('cfOptionsList').children.length === 0){
      cfAddOptionRow('');
    }
  });

  function openFieldModal(editId){
    document.getElementById('cfEditId').value = editId || '';
    document.getElementById('cfOptionsList').innerHTML = '';
    var lockedNote = document.getElementById('cfLockedNote');
    var targetRow = document.getElementById('cfTargetPageRow');
    var typeRow = document.getElementById('cfTypeRow');

    if(editId){
      var f = loadCustomFields().find(function(x){ return x.id === editId; });
      if(!f) return;
      document.getElementById('fieldModalTitle').textContent = 'แก้ไขฟิลด์';
      document.getElementById('cfLabel').value = f.label;
      document.getElementById('cfTargetPage').value = f.targetPage || 'both';

      // ฟิลด์ระบบประเภทที่ไม่ถูกล็อก (เช่น ถึง/ผู้รับ) สามารถแก้ TargetPage ได้ (Goal 2) 
      // แต่ไม่สามารถเปลี่ยน Type ได้ เพราะผูกกับ HTML พื้นฐาน
      targetRow.style.display = f.locked ? 'none' : ''; 
      typeRow.style.display = f.isSystem ? 'none' : '';

      if(f.locked){
        lockedNote.style.display = 'block';
        lockedNote.textContent = 'ฟิลด์นี้ผูกกับโครงสร้างการสร้างชื่อไฟล์ของระบบ (เช่น รายการตัวเลือกที่ตายตัว) จึงแก้ไขได้เฉพาะป้ายกำกับเท่านั้น' +
          (f.required ? ' ⚠️ ฟิลด์นี้จำเป็นต่อการสร้างชื่อไฟล์' : '');
        document.getElementById('cfOptionsBlock').style.display = 'none';
        document.getElementById('cfRulesBlock').style.display = 'none';
      } else {
        lockedNote.style.display = 'none';
        document.getElementById('cfType').value = f.type;
        document.getElementById('cfOptionsBlock').style.display = (f.type === 'select') ? 'block' : 'none';
        document.getElementById('cfRulesBlock').style.display = (f.type === 'select') ? 'none' : 'block';
        document.getElementById('cfInputMode').value = f.inputMode || 'any';
        document.getElementById('cfMaxDigits').value = f.maxDigits || '';
        document.getElementById('cfMaxLetters').value = f.maxLetters || '';
        (f.options||[]).forEach(function(o){ cfAddOptionRow(o); });
        if(f.type === 'select' && !(f.options||[]).length) cfAddOptionRow('');
      }
    } else {
      document.getElementById('fieldModalTitle').textContent = 'เพิ่มฟิลด์ใหม่';
      document.getElementById('cfLabel').value = '';
      document.getElementById('cfTargetPage').value = 'both';
      document.getElementById('cfType').value = 'text';
      lockedNote.style.display = 'none';
      targetRow.style.display = '';
      typeRow.style.display = '';
      document.getElementById('cfOptionsBlock').style.display = 'none';
      document.getElementById('cfRulesBlock').style.display = 'block';
      document.getElementById('cfInputMode').value = 'any';
      document.getElementById('cfMaxDigits').value = '';
      document.getElementById('cfMaxLetters').value = '';
      cfAddOptionRow('');
    }
    toggleModal(true);
  }

  var addBtn = document.getElementById('addFieldBtn');
  if(addBtn) addBtn.addEventListener('click', function(){ openFieldModal(null); });

  document.getElementById('submitFieldBtn').addEventListener('click', function(){
    var label = document.getElementById('cfLabel').value.trim();
    if(!label){ alert('กรุณากรอกชื่อฟิลด์'); return; }

    var editId = document.getElementById('cfEditId').value;
    var list = loadCustomFields();

    if(editId){
      var f = list.find(function(x){ return x.id === editId; });
      if(!f) return;
      f.label = label;

      // ฟิลด์ล็อกโครงสร้าง (Dropdown ผูกตรรกะ): แก้ไขได้เฉพาะป้ายกำกับ
      // ตัวเลือกถูกซ่อนไว้ใน Modal และคงค่าเดิมไว้ (เดิมโค้ดพยายามอ่านตัวเลือกจากกล่องที่ซ่อน
      // ซึ่งว่างเสมอ → บันทึกป้ายกำกับไม่ได้เลย)
      if(f.locked && f.type === 'select'){
        // คง f.options เดิมไว้ — ไม่ต้องทำอะไร
      }
      
      // ถ้าฟิลด์ไม่ได้ล็อก สามารถแก้ไข targetPage และกฎการกรอกได้ (Goal 3)
      if(!f.locked){
        var targetPage = document.getElementById('cfTargetPage').value;
        var inputMode = document.getElementById('cfInputMode').value;
        var maxDigits = parseInt(document.getElementById('cfMaxDigits').value, 10) || 0;
        var maxLetters = parseInt(document.getElementById('cfMaxLetters').value, 10) || 0;

        f.targetPage = targetPage;
        f.inputMode = inputMode;
        f.maxDigits = maxDigits;
        f.maxLetters = maxLetters;

        // ไม่ให้แก้ Type หากเป็นฟิลด์ระบบ
        if(!f.isSystem) {
          var type = document.getElementById('cfType').value;
          var options = [];
          if(type === 'select'){
            options = Array.from(document.querySelectorAll('#cfOptionsList input'))
                           .map(function(i){ return i.value.trim(); })
                           .filter(Boolean);
            if(!options.length){ alert('กรุณาเพิ่มตัวเลือกอย่างน้อย 1 รายการสำหรับฟิลด์แบบ Dropdown'); return; }
          }
          f.type = type;
          f.options = options;
        }
      }
    } else {
      var targetPage2 = document.getElementById('cfTargetPage').value;
      var type2 = document.getElementById('cfType').value;
      var inputMode2 = document.getElementById('cfInputMode').value;
      var maxDigits2 = parseInt(document.getElementById('cfMaxDigits').value, 10) || 0;
      var maxLetters2 = parseInt(document.getElementById('cfMaxLetters').value, 10) || 0;

      var options2 = [];
      if(type2 === 'select'){
        options2 = Array.from(document.querySelectorAll('#cfOptionsList input'))
                       .map(function(i){ return i.value.trim(); })
                       .filter(Boolean);
        if(!options2.length){ alert('กรุณาเพิ่มตัวเลือกอย่างน้อย 1 รายการสำหรับฟิลด์แบบ Dropdown'); return; }
      }

      list.push({
        id: 'cf_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
        label: label,
        targetPage: targetPage2,
        type: type2,
        options: options2,
        inputMode: inputMode2,
        maxDigits: maxDigits2,
        maxLetters: maxLetters2,
        isSystem: false,
        locked: false,
        required: false
      });
    }

    saveCustomFields(list);
    toggleModal(false);
    renderFieldsPage();
    renderCustomFieldsInCreatePage();
  });

  /* ---------- 7) Render Dynamic Fields in Form ---------- */
  function applyInputRules(el, f){
    if(!el || f.type !== 'text') return;
    el.dataset.inputMode = f.inputMode || 'any';
    el.dataset.maxDigits = f.maxDigits || 0;
    el.dataset.maxLetters = f.maxLetters || 0;
    el.inputMode = f.inputMode === 'number' ? 'numeric' : 'text';
    function clean(){
      var value = el.value || '';
      var mode = el.dataset.inputMode;
      if(mode === 'number') value = value.replace(/[^\d]/g, '');
      if(mode === 'letters') value = value.replace(/[^\p{L}\s]/gu, '');
      var digits = 0, letters = 0, out = '';
      Array.from(value).forEach(function(ch){
        var isDigit = /\d/.test(ch);
        var isLetter = /\p{L}/u.test(ch);
        if(isDigit && Number(el.dataset.maxDigits) > 0 && digits >= Number(el.dataset.maxDigits)) return;
        if(isLetter && Number(el.dataset.maxLetters) > 0 && letters >= Number(el.dataset.maxLetters)) return;
        if(isDigit) digits++;
        if(isLetter) letters++;
        out += ch;
      });
      if(el.value !== out) el.value = out;
    }
    el.addEventListener('input', clean);
    el.addEventListener('paste', function(){ setTimeout(clean, 0); });
    clean();
  }

  function applySystemFieldSettings(list){
    var present = {};
    list.forEach(function(f){ if(f.isSystem) present[f.id] = f; });

    // ตรวจสอบโหมดปัจจุบัน (Single/Bundle) เพื่อซ่อนฟิลด์ระบบตามตั้งค่า TargetPage
    var activeModeTab = document.querySelector('.mode-tab.active');
    var currentMode = activeModeTab ? activeModeTab.dataset.mode : 'single'; // 'single' หรือ 'set'

    function applyBinding(id, binding){
      var f = present[id];
      var inputIds = binding.inputIds || [binding.inputId];

      inputIds.forEach(function(inputId){
        var input = document.getElementById(inputId);
        // host = กล่องที่ครอบฟิลด์ (ใช้ fieldId ที่ผูกไว้ ถ้าไม่มีใน HTML ก็ใช้ closest('.field'))
        var host = (binding.fieldId && document.getElementById(binding.fieldId)) || (input && input.closest('.field'));

        if(f){
          var page = f.targetPage || 'both';
          var shouldShow = true;

          if (currentMode === 'single' && page.startsWith('bundle')) {
            shouldShow = false;
          } else if (currentMode === 'set' && page.startsWith('single')) {
            shouldShow = false;
          }

          if (shouldShow) {
            if(host) host.classList.remove('cf-field-removed');
            applyInputRules(input, f);
            var label = (input && input.closest('.field') && input.closest('.field').querySelector('label')) ||
                        (host && host.querySelector('label'));
            if(label && label.firstChild && label.firstChild.nodeType === 3) {
               label.firstChild.nodeValue = f.label + ' ';
            }
          } else {
            if(host) host.classList.add('cf-field-removed');
          }
        } else {
          // ฟิลด์ถูกลบจากระบบ → ซ่อนช่องที่ผูกไว้ทุกหน้า
          if(host) host.classList.add('cf-field-removed');
        }
      });
    }

    // ใช้กับทั้งหน้าไฟล์เดี่ยว (f-*) และหน้าชุดเอกสารครบชุด (set-*)
    Object.keys(systemFieldBindings).forEach(function(id){ applyBinding(id, systemFieldBindings[id]); });
    Object.keys(bundleFieldBindings).forEach(function(id){ applyBinding(id, bundleFieldBindings[id]); });
  }

  function renderCustomFieldsInCreatePage(){
    var containers = document.querySelectorAll('#customFieldsContainer, .customFieldsContainer');
    if(!containers.length) return;

    var list = loadCustomFields();
    applySystemFieldSettings(list);

    containers.forEach(function(container){
      var target = container.dataset.cfTarget || 'single';
      var filteredList = list.filter(function(f){
        if(f.isSystem) return false;
        var page = f.targetPage || 'both';
        
        if(page === 'both') return true;
        if(page === 'single') return target === 'single';
        if(page === 'single-draft') return target === 'single-draft';
        if(page === 'single-signed') return target === 'single-signed';
        
        if(page === 'bundle'){
          return (target === 'bundle-common' || target === 'bundle-attachments' || target === 'bundle-draft-letter');
        }
        if(page === 'bundle-common') return target === 'bundle-common';
        if(page === 'bundle-attachments') return target === 'bundle-attachments';
        if(page === 'bundle-draft-letter') return target === 'bundle-draft-letter';
        
        return false;
      });

      if(!filteredList.length){
        container.innerHTML = '';
        return;
      }

      container.innerHTML = '<div class="field-grid2"></div>';
      var grid = container.querySelector('.field-grid2');

      filteredList.forEach(function(f){
        var wrap = document.createElement('div');
        wrap.className = 'field';
        if(f.type === 'select'){
          wrap.innerHTML = `
            <label>${escapeHtml(f.label)}<span style="font-weight:400;color:var(--ink-300);"> (ไม่บังคับ)</span></label>
            <select id="cf-input-${f.id}">
              <option value="">— เลือก ${escapeHtml(f.label)} —</option>
              ${(f.options || []).map(function(option){
                return `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`;
              }).join('')}
            </select>
          `;
        } else {
          wrap.innerHTML = `
            <label>${escapeHtml(f.label)}<span style="font-weight:400;color:var(--ink-300);"> (ไม่บังคับ)</span></label>
            <input type="text" id="cf-input-${f.id}" placeholder="ระบุ${escapeHtml(f.label)}">
          `;
        }
        grid.appendChild(wrap);
        applyInputRules(wrap.querySelector('input'), f);
      });
    });
  }

  function getCustomFieldValues(){
    return loadCustomFields().map(function(f){
      var el = document.getElementById('cf-input-' + f.id);
      return el ? el.value.trim() : '';
    }).filter(Boolean);
  }

  function resetCustomFieldValues(){
    loadCustomFields().forEach(function(f){
      var el = document.getElementById('cf-input-' + f.id);
      if(el) el.value = '';
    });
  }

  /* ---------- 8) Expose Global Functions ---------- */
  window.renderFieldsPage = renderFieldsPage;
  window.renderCustomFieldsInCreatePage = renderCustomFieldsInCreatePage;
  window.getCustomFieldValues = getCustomFieldValues;
  window.resetCustomFieldValues = resetCustomFieldValues;

  /* ---------- 9) Init & Event Listeners ---------- */
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      renderFieldsPage();
      renderCustomFieldsInCreatePage();
    });
  } else {
    renderFieldsPage();
    renderCustomFieldsInCreatePage();
  }

  // Refresh dynamic fields UI anytime a tab/mode is clicked (Goal 2)
  document.addEventListener('click', function(e){
    if(e.target.closest('.nav-item') || e.target.closest('[data-page]') || e.target.closest('.mode-tab') || e.target.closest('.doc-sub-tab')){
      setTimeout(function(){
        renderCustomFieldsInCreatePage();
        if(document.querySelector('#page-fields.active')){
          renderFieldsPage();
        }
      }, 50);
    }
  });
})();
