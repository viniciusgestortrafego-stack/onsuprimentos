const whatsappNumber='5511998278080';
const whatsappUrl='https://wa.me/'+whatsappNumber+'?text=Ol%C3%A1%20vim%20do%20an%C3%BAncio%20e%20quero%20fazer%20um%20or%C3%A7amento';
const waLink=text=>'https://wa.me/'+whatsappNumber+'?text='+encodeURIComponent(text);
const track=(event,data)=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...data});};
document.querySelectorAll('[data-wa]').forEach(a=>{a.href=whatsappUrl;a.target='_blank';a.rel='noopener noreferrer'});

// URL do app da Web do Google Apps Script (scripts/google-apps-script.gs) que grava na planilha de leads.
const leadEndpoint='https://script.google.com/macros/s/AKfycbxAoy4dqn2MpZLo4XkhukZwYf2-eS-BAtvqsi4C2YQEbd872dRHULfAUbyQXZ_CAz7S/exec';
// Origem do acesso (anúncios), guardada na sessão para não se perder ao navegar.
const attribution=(()=>{const keys=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'];const params=new URLSearchParams(location.search);let saved={};try{saved=JSON.parse(sessionStorage.getItem('on_attribution')||'{}');}catch{}keys.forEach(k=>{if(params.get(k))saved[k]=params.get(k);});try{sessionStorage.setItem('on_attribution',JSON.stringify(saved));}catch{}return saved;})();
// Envio sem esperar resposta: o WhatsApp abre na hora e a planilha recebe em segundo plano.
const sendLead=lead=>{if(!leadEndpoint)return;try{fetch(leadEndpoint,{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...attribution,...lead,brand:'on-suprimentos',pagina:location.href})});}catch{}};

// Nome, telefone e e-mail antes de seguir para a cotação no WhatsApp.
const modal=document.getElementById('lead-modal');
const gate=document.getElementById('lead-gate');
let ctaSource='';
if(modal&&typeof modal.showModal==='function'){
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-wa]');if(!link)return;
    event.preventDefault();
    ctaSource=(link.textContent||'').replace('↗','').trim();
    track('cta_cotacao_click',{cta_text:ctaSource});
    modal.showModal();gate.querySelector('input').focus();
  });
  modal.querySelector('[data-close]').addEventListener('click',()=>modal.close());
  modal.addEventListener('click',event=>{if(event.target===modal)modal.close();});
  gate.addEventListener('submit',event=>{
    event.preventDefault();
    const data=Object.fromEntries(new FormData(gate));
    const list=document.getElementById('quote-list');
    const products=list&&!list.hidden?[...document.querySelectorAll('#selected-products li > span')].map(li=>li.textContent).join('; '):'';
    const items=products?'\n\n'+document.getElementById('quote-text').value:'';
    const text=`Olá! Vim do site e quero fazer uma cotação.\n\nNome: ${data.nome}\nTelefone: ${data.telefone}\nE-mail: ${data.email}${items}`;
    sendLead({origem:'Botão: '+ctaSource,nome:data.nome,telefone:data.telefone,email:data.email,produtos:products});
    // Sem dados pessoais no dataLayer: apenas o evento de conversão.
    track('lead_cotacao',{cta_text:ctaSource,has_product_list:!!items});
    window.open(waLink(text),'_blank','noopener');
    modal.close();gate.reset();
  });
}

const form=document.getElementById('lead-form');
form.addEventListener('submit',event=>{
  event.preventDefault();
  const status=document.getElementById('form-status');
  const data=Object.fromEntries(new FormData(form));
  sendLead({origem:'Formulário de orçamento',nome:data.nome,telefone:data.whatsapp,email:data.email,empresa:data.empresa,necessidade:data.necessidade});
  track('lead_cotacao',{cta_text:'Formulário de orçamento',has_product_list:false});
  window.open(waLink(`Olá! Vim do site e quero fazer uma cotação.\n\nNome: ${data.nome}\nEmpresa: ${data.empresa}\nTelefone: ${data.whatsapp}\nE-mail: ${data.email}\n\nO que precisamos:\n${data.necessidade}`),'_blank','noopener');
  status.textContent='Recebemos sua solicitação e abrimos o WhatsApp com ela preenchida. É só enviar a mensagem para a nossa equipe.';
  form.reset();
});
