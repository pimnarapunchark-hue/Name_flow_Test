/* =========================================================
   custom-fields.js
   ---------------------------------------------------------
   ฟีเจอร์ "จัดการฟิลด์เพิ่มเติม" แบบแยกไฟล์ออกจาก index.html
   - ทุกคนที่ล็อกอินเข้าระบบสามารถ เพิ่ม / แก้ไข / ลบ ฟิลด์เอง
     และกำหนดตัวเลือกใน dropdown ได้เอง โดยไม่ต้องพึ่งผู้พัฒนาระบบ
   - ทำงานร่วมกับ index.html ผ่าน:
       1) <script src="custom-fields.js"></script> ต่อท้าย index.html
       2) index.html ต้องมี <div class="page" id="page-fields"></div>
          และ <div id="customFieldsContainer"></div> อยู่แล้ว (มีอยู่แล้ว)
       3) index.html เรียกใช้ฟังก์ชันต่อไปนี้ที่ไฟล์นี้ประกาศไว้บน window:
          - renderCustomFieldsInCreatePage()
          - getCustomFieldValues()
          - resetCustomFieldValues()
          - renderFieldsPage()   (เรียกตอนกดเมนู "จัดการฟิลด์เพิ่มเติม")
   ข้อควรทราบ: ข้อมูลฟิลด์ถูกเก็บไว้ใน localStorage ของเบราว์เซอร์แต่ละเครื่อง
   (คีย์ custom_fields) เหมือนข้อมูล users/history อื่น ๆ ของระบบนี้ ดังนั้น
   "ทุกคน" ในที่นี้หมายถึงทุกคนที่ใช้เบราว์เซอร์/อุปกรณ์เดียวกัน หากต้องการให้
   ฟิลด์ที่เพิ่มมองเห็นตรงกันข้ามเครื่อง/ข้ามผู้ใช้จริง จะต้องต่อกับฐานข้อมูล
   ฝั่งเซิร์ฟเวอร์เพิ่มเติม (ดูหมายเหตุท้ายไฟล์)
   ========================================================= */
(function(){

  /* ---------- 1) inject CSS ---------- */
  var style=document.createElement('style');
  style.textContent=`
    .cf-toolbar{display:flex;justify-content:flex-end;margin-bottom:14px;}
    .btn-add-field{background:linear-gradient(135deg, var(--teal-600), var(--teal-700));color:#fff;border:none;padding:10px 18px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;}
    .btn-add-field:hover{opacity:.92;}
    .cf-card{border:1.5px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:12px;background:#fff;}
    .cf-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;}
    .cf-card-title{font-size:14px;font-weight:800;color:var(--ink-900);}
    .cf-card-type{font-size:11px;font-weight:700;color:var(--teal-700);background:var(--teal-100);padding:2px 9px;border-radius:20px;margin-left:8px;}
    .cf-card-meta{font-size:11.5px;color:var(--ink-300);margin-top:4px;}
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
  `;
  document.head.appendChild(style);

  /* ---------- 2) inject the field-editor modal (add/edit) ---------- */
  var modalWrap=document.createElement('div');
  modalWrap.innerHTML=`
    <div class="modal-overlay" id="fieldModal">
      <div class="modal-card">
        <div class="modal-head">
          <div class="modal-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M12 5v14M5 12h14"/></svg>
            <span id="fieldModalTitle">เพิ่มฟิลด์ใหม่</span>
          </div>
          <button class="modal-close" onclick="closeModal('fieldModal')">
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
            <label>ประเภทฟิลด์</label>
            <select id="cfType">
              <option value="text">ช่องข้อความอิสระ</option>
              <option value="select">ช่องแบบเลือกตัวเลือก (Dropdown)</option>
            </select>
          </div>
          <div id="cfOptionsBlock" style="display:none;">
            <label style="display:block;font-size:12.5px;font-weight:700;color:var(--ink-700);margin-bottom:7px;">ตัวเลือกใน Dropdown</label>
            <div id="cfOptionsList"></div>
            <button class="btn-add-attach" id="cfAddOptionBtn" type="button">+ เพิ่มตัวเลือก</button>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-ghost" onclick="closeModal('fieldModal')">ยกเลิก</button>
          <button class="btn-ghost solid" id="submitFieldBtn">บันทึกฟิลด์</button>
        </div>
      </div>
    </div>
  `;
  // move the actual modal node (built via innerHTML on a wrapper) into <body>
  document.body.appendChild(modalWrap.querySelector('#fieldModal'));

  /* ---------- 3) build the standalone "จัดการฟิลด์เพิ่มเติม" page ---------- */
  var pageHost=document.getElementById('page-fields');
  if(pageHost){
    pageHost.innerHTML=`
      <div class="page-title-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        <div class="page-title">จัดการฟิลด์เพิ่มเติม</div>
      </div>
      <div class="panel">
        <div class="cf-page-intro">
          เพิ่มฟิลด์กรอกข้อมูลเพิ่มเติมในหน้า "ตั้งชื่อไฟล์" ได้เอง เลือกได้ว่าจะเป็นช่องข้อความอิสระ หรือช่องแบบเลือกตัวเลือก (dropdown)
          พร้อมกำหนดตัวเลือกได้เอง โดยไม่ต้องแจ้งผู้พัฒนาระบบ — ทุกคนที่ใช้งานระบบนี้ (บนเครื่อง/เบราว์เซอร์เดียวกัน) แก้ไขได้ร่วมกัน
          ค่าที่กรอก/เลือกจะถูกต่อท้ายชื่อไฟล์ที่สร้างโดยอัตโนมัติ
        </div>
        <div class="cf-toolbar">
          <button class="btn-add-field" id="addFieldBtn" type="button">+ เพิ่มฟิลด์ใหม่</button>
        </div>
        <div id="adminFieldsList"></div>
        <div class="cf-empty" id="adminFieldsEmpty" style="display:none;">ยังไม่มีฟิลด์ที่กำหนดเอง — กดปุ่ม "เพิ่มฟิลด์ใหม่" เพื่อเริ่มต้น</div>
      </div>
    `;
  }

  /* ---------- 4) storage helpers ---------- */
  function loadCustomFields(){
    try{return JSON.parse(localStorage.getItem('custom_fields')||'[]');}catch(e){return [];}
  }
  function saveCustomFields(list){
    localStorage.setItem('custom_fields',JSON.stringify(list));
  }
  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  /* ---------- 5) render: field list page ---------- */
  function renderFieldsPage(){
    var list=loadCustomFields();
    var wrap=document.getElementById('adminFieldsList');
    var empty=document.getElementById('adminFieldsEmpty');
    if(!wrap)return;
    if(!list.length){wrap.innerHTML='';empty.style.display='block';return;}
    empty.style.display='none';
    wrap.innerHTML=list.map(function(f){
      return `
      <div class="cf-card">
        <div class="cf-card-head">
          <div>
            <span class="cf-card-title">${escapeHtml(f.label)}</span>
            <span class="cf-card-type">${f.type==='select'?'Dropdown':'ข้อความ'}</span>
          </div>
          <div class="cf-card-actions">
            <button data-edit="${f.id}" type="button">แก้ไข</button>
            <button data-del="${f.id}" class="danger" type="button">ลบ</button>
          </div>
        </div>
        ${f.type==='select'?`<div class="cf-options-wrap">${(f.options||[]).map(function(o){return `<span class="cf-chip">${escapeHtml(o)}</span>`;}).join('')||'<span class="cf-chip">ยังไม่มีตัวเลือก</span>'}</div>`:''}
      </div>`;
    }).join('');
    wrap.querySelectorAll('[data-edit]').forEach(function(btn){
      btn.addEventListener('click',function(){openFieldModal(btn.dataset.edit);});
    });
    wrap.querySelectorAll('[data-del]').forEach(function(btn){
      btn.addEventListener('click',function(){
        if(!confirm('ต้องการลบฟิลด์นี้หรือไม่? ข้อมูลตัวเลือกทั้งหมดของฟิลด์นี้จะถูกลบไปด้วย'))return;
        saveCustomFields(loadCustomFields().filter(function(f){return f.id!==btn.dataset.del;}));
        renderFieldsPage();
        renderCustomFieldsInCreatePage();
      });
    });
  }

  /* ---------- 6) add/edit modal behaviour ---------- */
  function cfAddOptionRow(value){
    var row=document.createElement('div');
    row.className='cf-option-row';
    row.innerHTML=`<input type="text" value="${escapeHtml(value||'')}" placeholder="เช่น ห้องประชุม 1">
      <button type="button" class="cf-option-remove" title="ลบตัวเลือกนี้">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>`;
    row.querySelector('.cf-option-remove').addEventListener('click',function(){row.remove();});
    document.getElementById('cfOptionsList').appendChild(row);
  }
  document.getElementById('cfAddOptionBtn').addEventListener('click',function(){cfAddOptionRow('');});
  document.getElementById('cfType').addEventListener('change',function(){
    document.getElementById('cfOptionsBlock').style.display=(this.value==='select')?'block':'none';
  });
  function openFieldModal(editId){
    document.getElementById('cfEditId').value=editId||'';
    document.getElementById('cfOptionsList').innerHTML='';
    if(editId){
      var f=loadCustomFields().find(function(x){return x.id===editId;});
      if(!f)return;
      document.getElementById('fieldModalTitle').textContent='แก้ไขฟิลด์';
      document.getElementById('cfLabel').value=f.label;
      document.getElementById('cfType').value=f.type;
      document.getElementById('cfOptionsBlock').style.display=(f.type==='select')?'block':'none';
      (f.options||[]).forEach(function(o){cfAddOptionRow(o);});
      if(f.type==='select'&&!(f.options||[]).length)cfAddOptionRow('');
    } else {
      document.getElementById('fieldModalTitle').textContent='เพิ่มฟิลด์ใหม่';
      document.getElementById('cfLabel').value='';
      document.getElementById('cfType').value='text';
      document.getElementById('cfOptionsBlock').style.display='none';
      cfAddOptionRow('');
    }
    document.getElementById('fieldModal').classList.add('open');
  }
  document.getElementById('addFieldBtn').addEventListener('click',function(){openFieldModal(null);});
  document.getElementById('submitFieldBtn').addEventListener('click',function(){
    var label=document.getElementById('cfLabel').value.trim();
    var type=document.getElementById('cfType').value;
    if(!label){alert('กรุณากรอกชื่อฟิลด์');return;}
    var options=[];
    if(type==='select'){
      options=Array.from(document.querySelectorAll('#cfOptionsList input')).map(function(i){return i.value.trim();}).filter(Boolean);
      if(!options.length){alert('กรุณาเพิ่มตัวเลือกอย่างน้อย 1 รายการสำหรับฟิลด์แบบ Dropdown');return;}
    }
    var editId=document.getElementById('cfEditId').value;
    var list=loadCustomFields();
    if(editId){
      var f=list.find(function(x){return x.id===editId;});
      if(f){f.label=label;f.type=type;f.options=options;}
    } else {
      list.push({id:'cf_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),label:label,type:type,options:options});
    }
    saveCustomFields(list);
    if(typeof closeModal==='function')closeModal('fieldModal');
    else document.getElementById('fieldModal').classList.remove('open');
    renderFieldsPage();
    renderCustomFieldsInCreatePage();
  });

  /* ---------- 7) render: dynamic fields inside "ตั้งชื่อไฟล์" form ---------- */
  function renderCustomFieldsInCreatePage(){
    var container=document.getElementById('customFieldsContainer');
    if(!container)return;
    var list=loadCustomFields();
    if(!list.length){container.innerHTML='';return;}
    container.innerHTML='<div class="field-grid2" id="customFieldsGrid"></div>';
    var grid=document.getElementById('customFieldsGrid');
    list.forEach(function(f){
      var wrap=document.createElement('div');
      wrap.className='field';
      if(f.type==='select'){
        wrap.innerHTML=`<label>${escapeHtml(f.label)} <span style="font-weight:400;color:var(--ink-300);">(ไม่บังคับ)</span></label>
          <select id="cf-input-${f.id}"><option value="">— เลือก ${escapeHtml(f.label)} —</option>
          ${(f.options||[]).map(function(o){return `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`;}).join('')}</select>`;
      } else {
        wrap.innerHTML=`<label>${escapeHtml(f.label)} <span style="font-weight:400;color:var(--ink-300);">(ไม่บังคับ)</span></label>
          <input type="text" id="cf-input-${f.id}" placeholder="ระบุ${escapeHtml(f.label)}">`;
      }
      grid.appendChild(wrap);
    });
  }
  function getCustomFieldValues(){
    return loadCustomFields().map(function(f){
      var el=document.getElementById('cf-input-'+f.id);
      return el?el.value.trim():'';
    }).filter(Boolean);
  }
  function resetCustomFieldValues(){
    loadCustomFields().forEach(function(f){
      var el=document.getElementById('cf-input-'+f.id);
      if(el)el.value='';
    });
  }

  /* ---------- 8) expose hooks that index.html calls ---------- */
  window.renderFieldsPage=renderFieldsPage;
  window.renderCustomFieldsInCreatePage=renderCustomFieldsInCreatePage;
  window.getCustomFieldValues=getCustomFieldValues;
  window.resetCustomFieldValues=resetCustomFieldValues;

  /* ---------- 9) initial render (form fields on the create page) ---------- */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',renderCustomFieldsInCreatePage);
  } else {
    renderCustomFieldsInCreatePage();
  }

})();

/* =========================================================
   หมายเหตุสำหรับการ deploy (GitHub + Render):
   ไฟล์นี้และ index.html เป็น static HTML/CSS/JS ล้วน ๆ ไม่มี build step
   และไม่มี backend จึงอัปโหลดขึ้น GitHub แล้วผูกกับ Render แบบ "Static Site"
   ได้ทันที (publish directory ตั้งเป็น root ที่มีไฟล์ทั้งสองอยู่)

   ข้อควรระวัง: การเก็บ users / ฟิลด์ที่กำหนดเอง / ประวัติ ทั้งหมดใช้
   localStorage ของเบราว์เซอร์แต่ละเครื่อง ข้อมูลจึง "ไม่ซิงก์" ข้ามเครื่อง
   หรือข้ามผู้ใช้จริง ๆ ถ้าต้องการให้ทุกคนเห็นฟิลด์ชุดเดียวกันข้ามอุปกรณ์
   จะต้องมีฐานข้อมูล/เซิร์ฟเวอร์ฝั่ง backend (เช่น Render Web Service +
   ฐานข้อมูล) มาแทนที่ localStorage ในไฟล์นี้
   ========================================================= */
