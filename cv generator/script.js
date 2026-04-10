// Utility: escape HTML
function escapeHtml(s){
  if(!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

/* -------------------------
   Dynamic field builders
   ------------------------- */
function createExperienceBlock(data = {}) {
  const id = 'exp_' + Date.now() + Math.floor(Math.random()*1000);
  const div = document.createElement('div');
  div.className = 'mb-3 border rounded p-2';
  div.dataset.id = id;
  div.innerHTML = `
    <div class="d-flex justify-content-between align-items-start mb-2">
      <strong>Experience</strong>
      <div>
        <button type="button" class="btn btn-sm btn-outline-danger remove-exp">Remove</button>
      </div>
    </div>
    <div class="row g-2">
      <div class="col-md-6"><input class="form-control exp-role" placeholder="Job title" value="${data.title||''}"></div>
      <div class="col-md-6"><input class="form-control exp-company" placeholder="Company, Location" value="${data.company||''}"></div>
      <div class="col-md-6"><input class="form-control exp-period" placeholder="Period (e.g., 2019 - Present)" value="${data.period||''}"></div>
      <div class="col-md-6"><input class="form-control exp-location" placeholder="City, Country" value="${data.location||''}"></div>
      <div class="col-12"><textarea class="form-control exp-desc" rows="2" placeholder="Short responsibilities / achievements">${data.description||''}</textarea></div>
    </div>`;
  return div;
}

function createEducationBlock(data = {}) {
  const id = 'edu_' + Date.now() + Math.floor(Math.random()*1000);
  const div = document.createElement('div');
  div.className = 'mb-3 border rounded p-2';
  div.dataset.id = id;
  div.innerHTML = `
    <div class="d-flex justify-content-between align-items-start mb-2">
      <strong>Education</strong>
      <div>
        <button type="button" class="btn btn-sm btn-outline-danger remove-edu">Remove</button>
      </div>
    </div>
    <div class="row g-2">
      <div class="col-md-6"><input class="form-control edu-degree" placeholder="Degree (e.g., MSc Computer Science)" value="${data.degree||''}"></div>
      <div class="col-md-6"><input class="form-control edu-institution" placeholder="Institution" value="${data.institution||''}"></div>
      <div class="col-md-6"><input class="form-control edu-year" placeholder="Year or period" value="${data.year||''}"></div>
      <div class="col-12"><textarea class="form-control edu-desc" rows="2" placeholder="Notes / thesis / honors">${data.notes||''}</textarea></div>
    </div>`;
  return div;
}

/* -------------------------
   DOM refs & initial state
   ------------------------- */
const experienceList = document.getElementById('experienceList');
const educationList = document.getElementById('educationList');
const addExperience = document.getElementById('addExperience');
const addEducation = document.getElementById('addEducation');
const clearExperience = document.getElementById('clearExperience');
const clearEducation = document.getElementById('clearEducation');
const cvForm = document.getElementById('cvForm');
const cvPreview = document.getElementById('cvPreview');
const emptyPreview = document.getElementById('emptyPreview');
const cvContent = document.getElementById('cvContent');
const previewToggle = document.getElementById('previewToggle');
const downloadPdf = document.getElementById('downloadPdf');
const printCv = document.getElementById('printCv');
const resetForm = document.getElementById('resetForm');
const editBtn = document.getElementById('editBtn');

const pickLocationBtn = document.getElementById('pickLocationBtn');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');
const locationInput = document.getElementById('location');
const pickModalEl = document.getElementById('mapModal');
const useLocationBtn = document.getElementById('useLocationBtn');

const accentColorInput = document.getElementById('accentColor');
const presetColors = document.getElementById('presetColors');

/* initial blocks */
experienceList.appendChild(createExperienceBlock());
educationList.appendChild(createEducationBlock());

/* add/remove handlers */
addExperience.addEventListener('click', ()=> experienceList.appendChild(createExperienceBlock()));
addEducation.addEventListener('click', ()=> educationList.appendChild(createEducationBlock()));
clearExperience.addEventListener('click', ()=> experienceList.innerHTML = '');
clearEducation.addEventListener('click', ()=> educationList.innerHTML = '');

document.addEventListener('click', (e)=>{
  if(e.target.matches('.remove-exp')) e.target.closest('[data-id]').remove();
  if(e.target.matches('.remove-edu')) e.target.closest('[data-id]').remove();
});

/* preview toggle */
previewToggle.addEventListener('click', ()=>{
  cvPreview.classList.toggle('d-none');
  emptyPreview.classList.toggle('d-none');
});

/* reset */
resetForm.addEventListener('click', ()=>{
  if(confirm('Reset the form?')) {
    cvForm.reset();
    experienceList.innerHTML = '';
    educationList.innerHTML = '';
    experienceList.appendChild(createExperienceBlock());
    educationList.appendChild(createEducationBlock());
    cvPreview.classList.add('d-none');
    emptyPreview.classList.remove('d-none');
    cvContent.innerHTML = '';
    latInput.value = '';
    lngInput.value = '';
  }
});

/* preset color quick select */
presetColors.addEventListener('change', ()=>{
  if(presetColors.value) accentColorInput.value = presetColors.value;
});

/* -------------------------
   Map integration (Leaflet)
   ------------------------- */
let map, marker, mapModal;
function initMapModal() {
  if(map) return;
  map = L.map('map', { center: [31.0, 73.0], zoom: 6 }); // default Pakistan view
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  marker = L.marker([31.0,73.0], {draggable:true}).addTo(map);

  // update lat/lng when marker moved
  marker.on('move', (e)=>{
    const p = e.latlng;
    latInput.value = p.lat.toFixed(6);
    lngInput.value = p.lng.toFixed(6);
  });

  // click map to move marker
  map.on('click', (e)=>{
    marker.setLatLng(e.latlng);
    latInput.value = e.latlng.lat.toFixed(6);
    lngInput.value = e.latlng.lng.toFixed(6);
  });
}

// show modal and initialize map
pickLocationBtn.addEventListener('click', ()=>{
  const bsModal = new bootstrap.Modal(pickModalEl);
  bsModal.show();
  setTimeout(()=> {
    initMapModal();
    map.invalidateSize();
    // if lat/lng present, center marker
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    if(!isNaN(lat) && !isNaN(lng)) {
      marker.setLatLng([lat,lng]);
      map.setView([lat,lng], 12);
    }
  }, 250);
});

// use selected location: fill inputs and close modal
useLocationBtn.addEventListener('click', ()=>{
  const pos = marker.getLatLng();
  latInput.value = pos.lat.toFixed(6);
  lngInput.value = pos.lng.toFixed(6);
  // reverse-geocode lightly: set location text to lat,lng (user can edit)
  locationInput.value = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
  bootstrap.Modal.getInstance(pickModalEl).hide();
});

/* -------------------------
   Read form values
   ------------------------- */
async function readForm() {
  const values = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    location: document.getElementById('location').value.trim(),
    lat: document.getElementById('lat').value.trim(),
    lng: document.getElementById('lng').value.trim(),
    nationality: document.getElementById('nationality').value.trim(),
    dob: document.getElementById('dob').value,
    role: document.getElementById('role').value.trim(),
    summary: document.getElementById('summary').value.trim(),
    skills: document.getElementById('skills').value.trim(),
    languages: document.getElementById('languages').value.trim(),
    certs: document.getElementById('certs').value.trim(),
    linkedin: document.getElementById('linkedin').value.trim(),
    github: document.getElementById('github').value.trim(),
    template: document.getElementById('template').value,
    accent: document.getElementById('accentColor').value
  };

  values.experiences = Array.from(experienceList.querySelectorAll('[data-id]')).map(node=>{
    return {
      title: node.querySelector('.exp-role').value.trim(),
      company: node.querySelector('.exp-company').value.trim(),
      period: node.querySelector('.exp-period').value.trim(),
      location: node.querySelector('.exp-location').value.trim(),
      description: node.querySelector('.exp-desc').value.trim()
    };
  });

  values.educations = Array.from(educationList.querySelectorAll('[data-id]')).map(node=>{
    return {
      degree: node.querySelector('.edu-degree').value.trim(),
      institution: node.querySelector('.edu-institution').value.trim(),
      year: node.querySelector('.edu-year').value.trim(),
      notes: node.querySelector('.edu-desc').value.trim()
    };
  });

  // photo
  const photoInput = document.getElementById('photo');
  if(photoInput.files && photoInput.files[0]) {
    values.photoData = await readFileAsDataURL(photoInput.files[0]);
  } else values.photoData = null;

  return values;
}

function readFileAsDataURL(file) {
  return new Promise((res, rej)=>{
    const fr = new FileReader();
    fr.onload = ()=> res(fr.result);
    fr.onerror = ()=> rej('error');
    fr.readAsDataURL(file);
  });
}

/* -------------------------
   Build CV HTML (with map link)
   ------------------------- */
function buildCVHtml(values) {
  // set accent color variable on container
  const accent = values.accent || '#0d6efd';
  const photoHtml = values.photoData ? `<img src="${values.photoData}" class="cv-photo" alt="photo">` : `<div style="width:96px;height:96px;border-radius:8px;background:#e9ecef;display:flex;align-items:center;justify-content:center;color:#6c757d">No Photo</div>`;

  // experiences & education
  let experienceHtml = '';
  values.experiences.forEach(exp=>{
    experienceHtml += `<div class="list-item">
      <div class="job-title">${escapeHtml(exp.title||'')}</div>
      <div class="job-meta">${escapeHtml(exp.company||'')} • ${escapeHtml(exp.period||'')}</div>
      <div class="small">${escapeHtml(exp.description||'')}</div>
    </div>`;
  });

  let educationHtml = '';
  values.educations.forEach(ed=>{
    educationHtml += `<div class="list-item">
      <div class="job-title">${escapeHtml(ed.degree||'')}</div>
      <div class="job-meta">${escapeHtml(ed.institution||'')} • ${escapeHtml(ed.year||'')}</div>
      <div class="small">${escapeHtml(ed.notes||'')}</div>
    </div>`;
  });

  const skillsHtml = (values.skills||'').split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<span class="badge-skill" style="background:${hexToRgba(accent,0.08)};border:1px solid ${hexToRgba(accent,0.18)};color:${accent}">${escapeHtml(s)}</span>`).join(' ');
  const langsHtml = (values.languages||'').split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<div>${escapeHtml(s)}</div>`).join('');

  // Map link: if lat/lng present, create Google Maps link and OSM link
  let mapLinks = '';
  if(values.lat && values.lng) {
    const lat = encodeURIComponent(values.lat);
    const lng = encodeURIComponent(values.lng);
    const google = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const osm = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`;
    mapLinks = `<div class="small"><i class="fa fa-map-marker-alt me-2"></i><a href="${google}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a> • <a href="${osm}" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></div>`;
  } else if(values.location) {
    mapLinks = `<div class="small"><i class="fa fa-map-marker-alt me-2"></i>${escapeHtml(values.location)}</div>`;
  }

  // Template variations
  if(values.template === 'professional') {
    return `
      <div style="--accent-color:${accent}" class="template-professional">
        <div class="prof-left">
          <div class="cv-header">
            ${photoHtml}
            <div>
              <div class="name">${escapeHtml(values.name||'')}</div>
              <div class="role">${escapeHtml(values.role||'')}</div>
              ${mapLinks}
            </div>
          </div>

          <div>
            <div class="section-title">Professional summary</div>
            <div class="small">${escapeHtml(values.summary||'')}</div>

            <div class="section-title">Experience</div>
            ${experienceHtml || '<div class="small">No experience added</div>'}

            <div class="section-title">Education</div>
            ${educationHtml || '<div class="small">No education added</div>'}
          </div>
        </div>

        <aside class="prof-right">
          <div class="section-title">Contact</div>
          <div class="small"><i class="fa fa-envelope me-2"></i>${escapeHtml(values.email||'')}</div>
          <div class="small"><i class="fa fa-phone me-2"></i>${escapeHtml(values.phone||'')}</div>

          <div class="section-title">Skills</div>
          <div>${skillsHtml}</div>

          <div class="section-title">Languages</div>
          <div class="small">${langsHtml}</div>

          <div class="section-title">Certifications</div>
          <div class="small">${escapeHtml(values.certs||'')}</div>

          <div class="section-title">Links</div>
          <div class="small">${values.linkedin?`<i class="fa fa-linkedin me-2"></i><a href="${escapeHtml(values.linkedin)}" target="_blank" rel="noopener noreferrer">${escapeHtml(values.linkedin)}</a>`:''}</div>
          <div class="small">${values.github?`<i class="fa fa-github me-2"></i><a href="${escapeHtml(values.github)}" target="_blank" rel="noopener noreferrer">${escapeHtml(values.github)}</a>`:''}</div>
        </aside>
      </div>
    `;
  }

  if(values.template === 'creative') {
    return `
      <div style="--accent-color:${accent}" class="template-creative">
        <div class="cv-header">
          ${photoHtml}
          <div>
            <div class="name">${escapeHtml(values.name||'')}</div>
            <div class="role">${escapeHtml(values.role||'')}</div>
            ${mapLinks}
          </div>
        </div>

        <div class="section-title">Summary</div>
        <div class="small">${escapeHtml(values.summary||'')}</div>

        <div class="section-title">Experience</div>
        ${experienceHtml || '<div class="small">No experience added</div>'}

        <div class="section-title">Education</div>
        ${educationHtml || '<div class="small">No education added</div>'}

        <div class="section-title">Skills</div>
        <div>${skillsHtml}</div>

        <div class="section-title">Certifications</div>
        <div class="small">${escapeHtml(values.certs||'')}</div>

        <div class="section-title">Links</div>
        <div class="small">${values.linkedin?`<i class="fa fa-linkedin me-2"></i><a href="${escapeHtml(values.linkedin)}" target="_blank" rel="noopener noreferrer">${escapeHtml(values.linkedin)}</a>`:''}</div>
        <div class="small">${values.github?`<i class="fa fa-github me-2"></i><a href="${escapeHtml(values.github)}" target="_blank" rel="noopener noreferrer">${escapeHtml(values.github)}</a>`:''}</div>
      </div>
    `;
  }

  if(values.template === 'modern') {
    return `
      <div style="--accent-color:${accent}" class="template-modern">
        <div class="cv-header">
          ${photoHtml}
          <div>
            <div class="name">${escapeHtml(values.name||'')}</div>
            <div class="role">${escapeHtml(values.role||'')}</div>
            ${mapLinks}
          </div>
        </div>

        <div>
          <div class="section-title">Profile</div>
          <div class="small">${escapeHtml(values.summary||'')}</div>

          <div class="section-title">Experience</div>
          ${experienceHtml || '<div class="small">No experience added</div>'}

          <div class="section-title">Education</div>
          ${educationHtml || '<div class="small">No education added</div>'}

          <div class="section-title">Skills</div>
          <div>${skillsHtml}</div>

          <div class="section-title">Certifications & Languages</div>
          <div class="small">${escapeHtml(values.certs||'')}</div>
          <div class="small">${langsHtml}</div>

          <div class="section-title">Contact & Links</div>
          <div class="small"><i class="fa fa-envelope me-2"></i>${escapeHtml(values.email||'')}</div>
          <div class="small"><i class="fa fa-phone me-2"></i>${escapeHtml(values.phone||'')}</div>
          <div class="small">${values.linkedin?`<i class="fa fa-linkedin me-2"></i><a href="${escapeHtml(values.linkedin)}" target="_blank" rel="noopener noreferrer">${escapeHtml(values.linkedin)}</a>`:''}</div>
          <div class="small">${values.github?`<i class="fa fa-github me-2"></i><a href="${escapeHtml(values.github)}" target="_blank" rel="noopener noreferrer">${escapeHtml(values.github)}</a>`:''}</div>
        </div>
      </div>
    `;
  }

  if(values.template === 'colorful') {
    return `
      <div style="--accent-color:${accent}" class="template-colorful">
        <div class="cv-header">
          ${photoHtml}
          <div>
            <div class="name">${escapeHtml(values.name||'')}</div>
            <div class="role">${escapeHtml(values.role||'')}</div>
            ${mapLinks}
          </div>
        </div>

        <div class="section-title">About</div>
        <div class="small">${escapeHtml(values.summary||'')}</div>

        <div class="section-title">Work</div>
        ${experienceHtml || '<div class="small">No experience added</div>'}

        <div class="section-title">Education</div>
        ${educationHtml || '<div class="small">No education added</div>'}

        <div class="section-title">Skills</div>
        <div>${skillsHtml}</div>

        <div class="section-title">Extras</div>
        <div class="small">${escapeHtml(values.certs||'')}</div>
        <div class="small">${langsHtml}</div>

        <div class="section-title">Connect</div>
        <div class="small"><i class="fa fa-envelope me-2"></i>${escapeHtml(values.email||'')}</div>
        <div class="small"><i class="fa fa-phone me-2"></i>${escapeHtml(values.phone||'')}</div>
        <div class="small">${values.linkedin?`<i class="fa fa-linkedin me-2"></i><a href="${escapeHtml(values.linkedin)}" target="_blank" rel="noopener noreferrer">${escapeHtml(values.linkedin)}</a>`:''}</div>
        <div class="small">${values.github?`<i class="fa fa-github me-2"></i><a href="${escapeHtml(values.github)}" target="_blank" rel="noopener noreferrer">${escapeHtml(values.github)}</a>`:''}</div>
      </div>
    `;
  }

  // minimal
  return `
    <div style="--accent-color:${accent}" class="template-minimal">
      <div class="cv-header">
        ${photoHtml}
        <div>
          <div class="name">${escapeHtml(values.name||'')}</div>
          <div class="role">${escapeHtml(values.role||'')}</div>
          ${mapLinks}
        </div>
      </div>

      <div class="section-title">Profile</div>
      <div class="small">${escapeHtml(values.summary||'')}</div>

      <div class="section-title">Experience</div>
      ${experienceHtml || '<div class="small">No experience added</div>'}

      <div class="section-title">Education</div>
      ${educationHtml || '<div class="small">No education added</div>'}

      <div class="section-title">Skills & Languages</div>
      <div>${skillsHtml}</div>
      <div class="small">${langsHtml}</div>

      <div class="section-title">Contact</div>
      <div class="small">${escapeHtml(values.email||'')} • ${escapeHtml(values.phone||'')}</div>
      <div class="small">${values.linkedin?`LinkedIn: <a href="${escapeHtml(values.linkedin)}" target="_blank" rel="noopener noreferrer">${escapeHtml(values.linkedin)}</a>`:''}</div>
    </div>
  `;
}

/* small helper to convert hex to rgba */
function hexToRgba(hex, alpha=1){
  if(!hex) return `rgba(0,0,0,${alpha})`;
  const h = hex.replace('#','');
  const bigint = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* -------------------------
   Generate & export handlers
   ------------------------- */
cvForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  // basic validation
  if(!document.getElementById('name').value.trim() || !document.getElementById('email').value.trim() || !document.getElementById('phone').value.trim()){
    alert('Please fill required fields: name, email, phone.');
    return;
  }

  const values = await readForm();
  const html = buildCVHtml(values);
  cvContent.innerHTML = html;
  // apply accent color to rendered container
  cvContent.querySelectorAll('*').forEach(()=>{}); // noop to ensure DOM updated
  cvPreview.classList.remove('d-none');
  emptyPreview.classList.add('d-none');
  window.scrollTo({top:0, behavior:'smooth'});
});

// helper to regenerate preview if already visible
async function refreshPreview() {
  if(!cvContent.innerHTML.trim()) return;
  const values = await readForm();
  cvContent.innerHTML = buildCVHtml(values);
}

// watch template and colour inputs to update preview dynamically
const templateSelect = document.getElementById('template');
if(templateSelect) templateSelect.addEventListener('change', refreshPreview);
accentColorInput.addEventListener('input', refreshPreview);
presetColors.addEventListener('change', ()=>{
  if(presetColors.value) accentColorInput.value = presetColors.value;
  refreshPreview();
});


// === SAMPLE DATA SUPPORT ===
const sampleData = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '+1 555 123 4567',
  location: 'San Francisco, USA',
  lat: '',
  lng: '',
  nationality: 'American',
  dob: '1990-05-14',
  role: 'Senior UX Designer',
  summary: 'Creative and detail-oriented UX designer with 8+ years of experience creating user-centered designs for web and mobile applications.',
  skills: 'UX Design, Figma, Sketch, HTML, CSS, Accessibility',
  languages: 'English (Native), Spanish (Intermediate)',
  certs: 'Certified UX Professional (CUP), Adobe Certified Expert',
  linkedin: 'https://linkedin.com/in/janedoe',
  github: 'https://github.com/janedoe',
  template: 'modern',
  accent: '#20c997',
  experiences: [
    {
      title: 'Lead UX Designer',
      company: 'Acme Corp',
      period: '2020 - Present',
      location: 'Remote',
      description: 'Led UX team to redesign flagship product, increasing user satisfaction by 30%.'
    },
    {
      title: 'UX Designer',
      company: 'Tech Solutions',
      period: '2016 - 2020',
      location: 'San Francisco, CA',
      description: 'Collaborated with cross-functional teams to create wireframes and prototypes for mobile apps.'
    }
  ],
  educations: [
    {
      degree: 'BSc in Interaction Design',
      institution: 'University of California, Berkeley',
      year: '2014',
      notes: 'Graduated with honors'
    }
  ]
};

function populateForm(data) {
  // basic scalar fields
  Object.entries(data).forEach(([key, val])=>{
    if(['experiences','educations'].includes(key)) return;
    const el = document.getElementById(key);
    if(el) {
      if(el.type === 'color') el.value = val || '#0d6efd';
      else el.value = val || '';
    }
  });
  // experiences
  experienceList.innerHTML = '';
  (data.experiences||[]).forEach(exp=>experienceList.appendChild(createExperienceBlock(exp)));
  if(experienceList.children.length===0) experienceList.appendChild(createExperienceBlock());
  // educations
  educationList.innerHTML = '';
  (data.educations||[]).forEach(ed=>educationList.appendChild(createEducationBlock(ed)));
  if(educationList.children.length===0) educationList.appendChild(createEducationBlock());
}

const loadExample = document.getElementById('loadExample');
if(loadExample) {
  loadExample.addEventListener('click', async ()=>{
    // remember current template selection so we don't always force the
    // sample data's template (which used to be "minimal" in earlier
    // versions).  users expect "Load Example" to fill other fields but
    // keep whatever design they've chosen.
    const currentTemplate = templateSelect.value;

    populateForm(sampleData);

    // restore template choice and update sampleData if needed
    templateSelect.value = currentTemplate;
    sampleData.template = currentTemplate;

    // automatically generate preview using the (possibly restored)
    // template value
    const values = await readForm();
    const html = buildCVHtml(values);
    cvContent.innerHTML = html;
    cvPreview.classList.remove('d-none');
    emptyPreview.classList.add('d-none');
    window.scrollTo({top:0, behavior:'smooth'});
  });
}

// Download PDF
downloadPdf.addEventListener('click', ()=>{
  if(!cvContent.innerHTML.trim()) return alert('Generate the CV first.');
  const opt = {
    margin:       10,
    filename:     (document.getElementById('name').value || 'My_CV') + '.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(cvContent).save();
});

// Print
printCv.addEventListener('click', ()=>{
  if(!cvContent.innerHTML.trim()) return alert('Generate the CV first.');
  const w = window.open('', '_blank');
  const styleSheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(n => n.outerHTML).join('\n');
  w.document.write(`<html><head><title>CV</title>${styleSheets}</head><body>${cvContent.innerHTML}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(()=>{ w.print(); }, 500);
});

// Edit button scrolls to form
editBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

// Simple form validation bootstrap style
(() => {
  'use strict';
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        alert('Please fill required fields (name, email, phone).');
      }
      form.classList.add('was-validated');
    }, false);
  });
})();

