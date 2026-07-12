(() => {
  const links = [["/about.html","About"],["/contact.html","Contact"],["/privacy.html","Privacy"],["/terms.html","Terms"],["/disclaimer.html","Disclaimer"],["/cookies.html","Cookies"]];
  function updateFooter(){const nav=document.querySelector(".footer nav");if(!nav)return false;nav.replaceChildren(...links.map(([href,label])=>{const a=document.createElement("a");a.href=href;a.textContent=label;return a;}));return true;}
  if(!updateFooter()){const observer=new MutationObserver(()=>{if(updateFooter())observer.disconnect();});observer.observe(document.documentElement,{childList:true,subtree:true});}
})();
