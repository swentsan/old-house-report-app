(function(){
  let archiveDirectory=null;
  async function chooseArchive(){
    if(!window.showDirectoryPicker){alert('此瀏覽器不支援直接歸檔，報告會改以下載方式儲存。');return false}
    try{archiveDirectory=await window.showDirectoryPicker({id:'old-house-archive',mode:'readwrite'});return true}catch(e){return false}
  }
  async function saveReport(blob,name){
    if(!archiveDirectory&&window.showDirectoryPicker){const ok=await chooseArchive();if(!ok)return false}
    if(archiveDirectory){try{const handle=await archiveDirectory.getFileHandle(name,{create:true});const writer=await handle.createWritable();await writer.write(blob);await writer.close();return true}catch(e){archiveDirectory=null}}
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);return false
  }
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const field=k=>document.querySelector(`[data-field="${k}"]`)?.value||'';
  const money=n=>'$'+Math.round(n||0).toLocaleString('zh-TW');
  const overlay=(left,top,value,width=28)=>value?`<div class="pdf-overlay" style="left:${left}%;top:${top}%;width:${width}%">${esc(value)}</div>`:'';
  async function exportPdfTemplate(){
    const type=document.querySelector('input[name=buildingType]:checked')?.value||'townhouse';
    const assets=window.PDF_ASSETS?.[type]||[];
    const total=type==='apartment'?47:23;
    const page=(i,items)=>`<section class="pdf-page"><img class="pdf-bg" src="${assets[i]||''}">${items||''}</section>`;
    const address=[field('city'),field('district'),field('address')].filter(Boolean).join('');
    const applicant=field('applicant');
    const photos=[...document.querySelectorAll('#photoGrid img')].map(e=>e.src);
    const rows=[...document.querySelectorAll('.grant-row')].map((row,i)=>({row,i,cost:+(row.querySelector('[data-cost]')?.value||0),grant:row.querySelector('[data-b]')?.textContent||'$0',checked:row.querySelector('[data-grant]')?.checked})).filter(r=>r.checked||r.cost);
    const pages=[];
    for(let i=0;i<total;i++){
      let items='';
      if(i===0){items+=overlay(17,31,address,66)+overlay(24,54,applicant,55)+overlay(24,59,field('professional'),55)+overlay(24,64,field('contact'),55)+overlay(24,69,field('phone'),55)}
      if(i===1){items+=overlay(35,28,applicant,47)+overlay(35,34,field('applicantId'),47)+overlay(35,41,address,56)+overlay(35,48,field('contact'),47)+overlay(35,54,field('phone'),47)+overlay(35,65,`${field('basementFloors')||0}／${field('aboveFloors')}`,20)+overlay(35,70,field('floorArea')?field('floorArea')+' ㎡':'',24)+overlay(35,76,field('contractor'),47)}
      if(i===2){items+=overlay(38,23,field('permitNo'),34)+overlay(38,39,field('completionDate'),30)+overlay(38,56,field('aboveFloors'),20)+overlay(38,69,field('priority'),42)}
      if(i===3){items+=overlay(42,25,field('evaluation'),33)+overlay(42,31,field('evaluationDate'),33)+overlay(42,37,field('evaluationNo'),33)}
      if(i===4||i===8){rows.slice(0,5).forEach((r,n)=>{items+=overlay(58,28+n*8,money(r.cost),18)+overlay(78,28+n*8,r.grant,18)})}
      const photoPage=type==='townhouse'?19:40;
      if(i===photoPage){photos.slice(0,6).forEach((src,n)=>{const x=n%2?54:8,y=38+Math.floor(n/2)*17;items+=`<img class="pdf-photo" style="left:${x}%;top:${y}%" src="${src}">`})}
      pages.push(page(i,items));
    }
    const html=`<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:0}body{margin:0;background:#fff}.pdf-page{position:relative;width:210mm;height:297mm;page-break-after:always;overflow:hidden}.pdf-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}.pdf-overlay{position:absolute;min-height:4mm;padding:1mm 1.5mm;background:rgba(255,255,255,.82);font-family:DFKai-SB,"標楷體",KaiTi,serif;font-size:10pt;line-height:1.3;overflow:hidden;white-space:nowrap}.pdf-photo{position:absolute;width:38%;height:13%;object-fit:cover;border:1px solid #333;background:#fff}</style></head><body>${pages.join('')}</body></html>`;
    const blob=new Blob(['\ufeff',html],{type:'application/msword'});const name=`老宅延壽申請報告_${type==='apartment'?'公寓':'透天'}_依PDF範例_${total}頁.doc`;const archived=await saveReport(blob,name);
    const toast=document.querySelector('#toast');if(toast){toast.textContent=archived?`報告已歸檔至 AI產出（${total} 頁）`:`報告已下載；請確認歸檔資料夾權限`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}
  }
  const archiveButton=document.querySelector('#chooseArchive');if(archiveButton)archiveButton.addEventListener('click',async()=>{if(await chooseArchive()){const toast=document.querySelector('#toast');toast.textContent='已設定 AI產出為歸檔資料夾';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}});
  ['#exportWord','#previewExport'].forEach(sel=>{const old=document.querySelector(sel);if(old){const fresh=old.cloneNode(true);old.replaceWith(fresh);fresh.addEventListener('click',exportPdfTemplate)}});
})();
