const WEDDING_DATE = new Date('2026-10-25T08:00:00+07:00');
const WISH_KEY = 'weddingWishes';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function toast(msg){
    const t = $('toast'); if(!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove('show'),2500);
}

/* Nama tamu dari URL */
const guest = new URLSearchParams(location.search).get('to');
if(guest){
    const g = $('guestName'); if(g) g.textContent = guest;
    const w = $('w-name');    if(w && !w.value) w.value = guest;
}

/* Countdown */
function tick(){
    const d = $('cd-d'); if(!d) return;
    const diff = Math.max(0, WEDDING_DATE - new Date());
    $('cd-d').textContent = String(Math.floor(diff/864e5)).padStart(2,'0');
    $('cd-h').textContent = String(Math.floor(diff/36e5)%24).padStart(2,'0');
    $('cd-m').textContent = String(Math.floor(diff/6e4)%60).padStart(2,'0');
    $('cd-s').textContent = String(Math.floor(diff/1e3)%60).padStart(2,'0');
}
tick(); setInterval(tick,1000);

/* Buka amplop */
if($('openBtn')){
    $('openBtn').addEventListener('click',()=>{
        $('cover').classList.add('opened');
        setTimeout(()=>{
            const bgm = $('bgm');
            if(bgm) bgm.play().then(()=>$('musicBtn').classList.add('playing')).catch(()=>{});
        },300);
    });
}

/* Musik */
if($('musicBtn') && $('bgm')){
    $('musicBtn').addEventListener('click',()=>{
        const bgm = $('bgm');
        if(bgm.paused){ bgm.play(); $('musicBtn').classList.add('playing'); }
        else { bgm.pause(); $('musicBtn').classList.remove('playing'); }
    });
}

/* Reveal on scroll */
const io = new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* Copy rekening */
document.querySelectorAll('.btn-copy').forEach(btn=>{
    btn.addEventListener('click',async()=>{
        const n = btn.dataset.copy;
        try{
            await navigator.clipboard.writeText(n);
            btn.classList.add('copied');
            const old = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Tersalin';
            toast('Nomor rekening disalin ✓');
            setTimeout(()=>{btn.classList.remove('copied');btn.innerHTML=old},2200);
        }catch{toast('Gagal menyalin ❌')}
    });
});

/* Ucapan */
function renderWishes(){
    const list = $('wishList'); if(!list) return;
    const data = JSON.parse(localStorage.getItem(WISH_KEY)||'[]');
    list.innerHTML = data.length ? '' : '<p class="empty">Jadilah yang pertama mengirim doa 🌿</p>';
    data.forEach(w=>{
        const div = document.createElement('div'); div.className='wish';
        div.innerHTML = `<div class="wish-head"><b>${esc(w.name)}</b>
            <span class="badge ${w.attend==='Hadir'?'yes':'no'}">${w.attend}</span></div>
            <p>"${esc(w.msg)}"</p><small>${w.time}</small>`;
        list.appendChild(div);
    });
}
renderWishes();

if($('wishForm')){
    $('wishForm').addEventListener('submit',e=>{
        e.preventDefault();
        const name = $('w-name').value.trim();
        const msg = $('w-msg').value.trim();
        const attend = $('w-attend').value;
        if(!name || !msg) return;
        const data = JSON.parse(localStorage.getItem(WISH_KEY)||'[]');
        data.unshift({
            name, msg, attend,
            time: new Date().toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})
        });
        localStorage.setItem(WISH_KEY, JSON.stringify(data));
        renderWishes();
        $('wishForm').reset();
        if(guest) $('w-name').value = guest;
        toast('Doa terkirim 🤲');
    });
}