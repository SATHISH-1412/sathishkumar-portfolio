function goto(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'})}
document.getElementById('ham').addEventListener('click',function(){
  const nm=document.getElementById('topnav');
  nm.classList.toggle('mob-open');
});
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('v')});
},{threshold:.1});
document.querySelectorAll('.fi').forEach(el=>obs.observe(el));
