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
    .cf-card-rules{font-size:11.5px;color:var(--ink-500);margin-top:10px;}
    @media(max-width:600px){.cf-rule-grid{grid-template-columns:1fr;}}
  `;
  document.head.appendChild(style);

  /* ---------- 2) Inject Field Modal ---------- */
  var modalWrap = document.createElement('div');
  modalWrap.innerHTML = `
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
          <div class="field" style="margin-bottom:14px;">
            <label>แสดงผลในหน้าใด</label>
            <select id="cfTargetPage">
              <option value="both">แสดงทั้งสองหน้า (ไฟล์เดี่ยว & เอกสารครบชุด)</option>
              <option value="single">ตั้งไฟล์เดี่ยว เท่านั้น</option>
              <option value="bundle">เอกสารครบชุด เท่านั้น</option>
            </select>
          </div>
          <div class="field" style="margin-bottom:14px;">
            <label>ประเภทฟิลด์</label>
            <select id="cfType">
              <option value="text">ช่องข้อความอิสระ</option>
              <option value="select">ช่องแบบเลือกตัวเลือก (Dropdown)</option>
            </select>
          </div>
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
  `;
  document.body.appendChild(modalWrap.querySelector('#fieldModal'));

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
          กำหนดฟิลด์กรอกข้อมูลเพิ่มเติม แก้ไข หรือลบฟิลด์เดิมที่มีอยู่ตั้ง แต่เริ่มต้น รวมถึงสลับประเภท และเลือกแสดงผลแยกระหว่าง "ตั้งไฟล์เดี่ยว" หรือ "เอกสารครบชุด" ได้ตามต้องการ
        </div>
        <div class="cf-toolbar">
          <button class="btn-add-field" id="addFieldBtn" type="button">+ เพิ่มฟิลด์ใหม่</button>
        </div>
        <div id="adminFieldsList"></div>
        <div class="cf-empty" id="adminFieldsEmpty" style="display:none;">ยังไม่มีฟิลด์ในระบบ — กดปุ่ม "เพิ่มฟิลด์ใหม่" เพื่อเริ่มต้น</div>
      </div>
    `;
  }

  /* ---------- 4) Default System Fields & Storage ---------- */
  var defaultFields = [
    { id: 'sys_session', label: 'ครั้งที่', targetPage: 'both', type: 'text', inputMode: 'number', maxDigits: 3, maxLetters: 0, isSystem: true },
    { id: 'sys_to', label: 'ถึง / ผู้รับ', targetPage: 'both', type: 'text', inputMode: 'any', maxDigits: 0, maxLetters: 100, isSystem: true },
    { id: 'sys_signer', label: 'ผู้มีอำนาจลงนาม (S)', targetPage: 'both', type: 'text', inputMode: 'any', maxDigits: 0, maxLetters: 100, isSystem: true }
  ];

  var systemFieldBindings = {
    sys_session: { inputId: 'f-session', fieldId: 'field-session' },
    sys_to: { inputId: 'f-to', fieldId: null },
    sys_signer: { inputId: 'f-signer', fieldId: 'field-signer' }
  };

  function normalizeField(f){
    f.inputMode = f.inputMode || 'any';
    f.maxDigits = Number.isFinite(Number(f.maxDigits)) ? Math.max(0, Number(f.maxDigits)) : 0;
    f.maxLetters = Number.isFinite(Number(f.maxLetters)) ? Math.max(0, Number(f.maxLetters)) : 0;
    return f;
  }

  function loadCustomFields(){
    var raw = localStorage.getItem('custom_fields');
    if(!raw){
      saveCustomFields(defaultFields);
      return defaultFields;
    }
    try{
      var list = JSON.parse(raw).map(normalizeField);
      // คืนค่าฟิลด์ระบบเดิมที่ถูกซ่อนจากบั๊กของเวอร์ชันก่อนเพียงครั้งเดียว
      // หลังจาก migration แล้ว ผู้ใช้ยังสามารถลบฟิลด์ระบบจากหน้าจัดการได้ตามปกติ
      if(!localStorage.getItem('system_fields_migrated_v3')){
        defaultFields.forEach(function(def){
          if(!list.some(function(f){ return f.id === def.id; })){
            list.push(def);
          }
        });
        saveCustomFields(list);
        localStorage.setItem('system_fields_migrated_v3','1');
      }
      return list;
    }catch(e){ return defaultFields; }
  }

  function saveCustomFields(list){
    localStorage.setItem('custom_fields', JSON.stringify(list));
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
  function renderFieldsPage(){
    var list = loadCustomFields();
    var wrap = document.getElementById('adminFieldsList');
    var empty = document.getElementById('adminFieldsEmpty');
    if(!wrap) return;
    if(!list.length){ wrap.innerHTML=''; empty.style.display='block'; return; }
    empty.style.display='none';
    
    var targetText = { 'both': 'ทั้งสองหน้า', 'single': 'ไฟล์เดี่ยว', 'bundle': 'เอกสารครบชุด' };

    wrap.innerHTML = list.map(function(f){
      return `
      <div class="cf-card">
        <div class="cf-card-head">
          <div>
            <span class="cf-card-title">${escapeHtml(f.label)}</span>
             <span class="cf-card-type">${f.type==='select'?'Dropdown':'ข้อความ'}</span>
            <span class="cf-card-target">${targetText[f.targetPage || 'both']}</span>
             ${f.isSystem?'<span class="cf-system-badge">ฟิลด์ระบบ</span>':''}
          </div>
          <div class="cf-card-actions">
            <button data-edit="${f.id}" type="button">แก้ไข</button>
            <button data-del="${f.id}" class="danger" type="button">ลบ</button>
          </div>
        </div>
        ${f.type==='select'?`<div class="cf-options-wrap">${(f.options||[]).map(function(o){return `<span class="cf-chip">${escapeHtml(o)}</span>`;}).join('')||'<span class="cf-chip">ยังไม่มีตัวเลือก</span>'}</div>`:''}
        ${f.type!=='select'?`<div class="cf-card-rules">${f.inputMode==='number'?'ตัวเลขเท่านั้น':f.inputMode==='letters'?'ตัวอักษรเท่านั้น':'ตัวเลขและตัวอักษร'} · ตัวเลขสูงสุด ${f.maxDigits||'ไม่จำกัด'} · ตัวอักษรสูงสุด ${f.maxLetters||'ไม่จำกัด'}</div>`:''}
      </div>`;
    }).join('');

    wrap.querySelectorAll('[data-edit]').forEach(function(btn){
      btn.addEventListener('click', function(){ openFieldModal(btn.dataset.edit); });
    });
    wrap.querySelectorAll('[data-del]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var field = list.find(function(f){ return f.id === btn.dataset.del; });
        if(!field) return;
        var message = field.isSystem
          ? 'ฟิลด์นี้เป็นฟิลด์เริ่มต้นของระบบ หากลบแล้วจะถูกซ่อนจากหน้าตั้งชื่อไฟล์ ต้องการลบหรือไม่?'
          : 'ต้องการลบฟิลด์นี้หรือไม่?';
        if(!confirm(message)) return;
        saveCustomFields(loadCustomFields().filter(function(f){ return f.id !== btn.dataset.del; }));
        renderFieldsPage();
        renderCustomFieldsInCreatePage();
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
    
    if(editId){
      var f = loadCustomFields().find(function(x){ return x.id === editId; });
      if(!f) return;
      document.getElementById('fieldModalTitle').textContent = 'แก้ไขฟิลด์';
      document.getElementById('cfLabel').value = f.label;
      document.getElementById('cfTargetPage').value = f.targetPage || 'both';
      document.getElementById('cfType').value = f.type;
      document.getElementById('cfOptionsBlock').style.display = (f.type === 'select') ? 'block' : 'none';
      document.getElementById('cfRulesBlock').style.display = (f.type === 'select') ? 'none' : 'block';
      document.getElementById('cfInputMode').value = f.inputMode || 'any';
      document.getElementById('cfMaxDigits').value = f.maxDigits || '';
      document.getElementById('cfMaxLetters').value = f.maxLetters || '';
      
      (f.options||[]).forEach(function(o){ cfAddOptionRow(o); });
      if(f.type === 'select' && !(f.options||[]).length) cfAddOptionRow('');
    } else {
      document.getElementById('fieldModalTitle').textContent = 'เพิ่มฟิลด์ใหม่';
      document.getElementById('cfLabel').value = '';
      document.getElementById('cfTargetPage').value = 'both';
      document.getElementById('cfType').value = 'text';
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
    var targetPage = document.getElementById('cfTargetPage').value;
    var type = document.getElementById('cfType').value;
    var inputMode = document.getElementById('cfInputMode').value;
    var maxDigits = parseInt(document.getElementById('cfMaxDigits').value, 10) || 0;
    var maxLetters = parseInt(document.getElementById('cfMaxLetters').value, 10) || 0;
    
    if(!label){ alert('กรุณากรอกชื่อฟิลด์'); return; }
    
    var options = [];
    if(type === 'select'){
      options = Array.from(document.querySelectorAll('#cfOptionsList input'))
                     .map(function(i){ return i.value.trim(); })
                     .filter(Boolean);
      if(!options.length){ alert('กรุณาเพิ่มตัวเลือกอย่างน้อย 1 รายการสำหรับฟิลด์แบบ Dropdown'); return; }
    }
    
    var editId = document.getElementById('cfEditId').value;
    var list = loadCustomFields();
    
    if(editId){
      var f = list.find(function(x){ return x.id === editId; });
      if(f){
        f.label = label;
        f.targetPage = targetPage;
        f.type = type;
        f.options = options;
        f.inputMode = inputMode;
        f.maxDigits = maxDigits;
        f.maxLetters = maxLetters;
      }
    } else {
      list.push({
        id: 'cf_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
        label: label,
        targetPage: targetPage,
        type: type,
        options: options,
        inputMode: inputMode,
        maxDigits: maxDigits,
        maxLetters: maxLetters
      });
    }
    
    saveCustomFields(list);
    toggleModal(false);
    renderFieldsPage();
    renderCustomFieldsInCreatePage();
  });

  /* ---------- 7) Render Dynamic Fields in Form ---------- */
  function applyInputRules(el, f){
    if(!el || f.type === 'select') return;
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
    list.filter(function(f){ return f.isSystem; }).forEach(function(f){
      var binding = systemFieldBindings[f.id];
      if(!binding) return;
      var input = document.getElementById(binding.inputId);
      var host = binding.fieldId ? document.getElementById(binding.fieldId) : (input && input.closest('.field'));
      applyInputRules(input, f);
      if(input){
        var label = input.closest('.field')?.querySelector('label');
        if(label && label.firstChild) label.firstChild.nodeValue = f.label + ' ';
      }
    });

    Object.keys(systemFieldBindings).forEach(function(id){
      if(list.some(function(f){ return f.id === id; })) return;
      var binding = systemFieldBindings[id];
      var input = document.getElementById(binding.inputId);
      var host = binding.fieldId ? document.getElementById(binding.fieldId) : (input && input.closest('.field'));
      if(host) host.style.display = 'none';
    });
  }

  function renderCustomFieldsInCreatePage(forcedPageType){
    var currentPage = forcedPageType;
    if(!currentPage){
      var activePageEl = document.querySelector('.page.active');
      if(activePageEl){
        var id = activePageEl.id || '';
        if(id.includes('single') || id.includes('create')) currentPage = 'single';
        else if(id.includes('bundle') || id.includes('batch')) currentPage = 'bundle';
      }
    }

    var containers = document.querySelectorAll('#customFieldsContainer, .customFieldsContainer');
    if(!containers.length) return;

    var list = loadCustomFields();
    applySystemFieldSettings(list);

    containers.forEach(function(container){
      var filteredList = list.filter(function(f){
        // ฟิลด์ระบบมีอยู่ในหน้าแบบฟอร์มเดิมแล้ว ไม่ต้องสร้างซ้ำในกลุ่มฟิลด์เพิ่มเติม
        if(f.isSystem) return false;
        if(!currentPage) return true;
        return !f.targetPage || f.targetPage === 'both' || f.targetPage === currentPage;
      });

      if(!filteredList.length){ container.innerHTML = ''; return; }

      container.innerHTML = '<div class="field-grid2"></div>';
      var grid = container.querySelector('.field-grid2');

      filteredList.forEach(function(f){
        var wrap = document.createElement('div');
        wrap.className = 'field';
        if(f.type === 'select'){
          wrap.innerHTML = `<label>${escapeHtml(f.label)} <span style="font-weight:400;color:var(--ink-300);">(ไม่บังคับ)</span></label>
            <select id="cf-input-${f.id}"><option value="">— เลือก ${escapeHtml(f.label)} —</option>
            ${(f.options||[]).map(function(o){ return `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`; }).join('')}</select>`;
        } else {
          wrap.innerHTML = `<label>${escapeHtml(f.label)} <span style="font-weight:400;color:var(--ink-300);">(ไม่บังคับ)</span></label>
            <input type="text" id="cf-input-${f.id}" placeholder="ระบุ${escapeHtml(f.label)}">`;
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

  document.addEventListener('click', function(e){
    if(e.target.closest('.nav-item') || e.target.closest('[data-page]')){
      setTimeout(function(){
        renderCustomFieldsInCreatePage();
        if(document.querySelector('#page-fields.active')){
          renderFieldsPage();
        }
      }, 50);
    }
  });

})();