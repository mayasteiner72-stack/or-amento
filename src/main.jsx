const STATUS_OPTIONS=['Pendente','Enviado','Aprovado','Concluído','Cancelado'];
const RECIBO_STATUS_OPTIONS=['Parcial','Quitado','Cancelado'];
const PAGAMENTO_OPTIONS=['PIX','Dinheiro','Cartão de Crédito','Cartão de Débito','Transferência','Boleto'];

import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {
  Home,Users,Package,FileText,Receipt,Factory,CalendarDays,Wallet,Boxes,BarChart3,
  Settings,Plus,Trash2,Edit,Printer,Send,Phone,Search,LogOut,ShieldCheck,
  FileSignature,BadgeCheck,Truck,ShoppingCart,History,Archive,Brain, Bell, CheckCircle
} from 'lucide-react';
import './style.css';

const API='/api';
const resources=['usuarios','clientes','produtos','orcamentos','recibos','contratos','garantias','producao','agenda','financeiro','estoque','fornecedores','compras','historico','posvenda','notificacoes','backuplog'];

const empty={
 usuarios:{nome:'',email:'',perfil:'Vendedor',senha:'123456',ativo:'Sim'},
 clientes:{nome:'',telefone:'',whatsapp:'',email:'',cpf_cnpj:'',bairro:'',endereco:'',observacoes:''},
 produtos:{nome:'',categoria:'Toldo',preco_m2:'',custo_m2:'',tempo:'',descricao:''},
 orcamentos:{numero:'',data_orcamento:'',clienteId:'',produtoId:'',largura:'',altura:'',quantidade:'1',desconto:'0',frete:'0',status:'Pendente',forma_pagamento:'50% entrada + 50% entrega',observacoes:'',itens:[{produtoId:'',ambiente:'',descricao:'',largura:'',altura:'',quantidade:'1',preco:''}]},
 recibos:{numero:'',orcamento:'',data:'',cliente:'',telefone:'',endereco:'',bairro:'',servico:'',valor:'',valor_pago:'',saldo:'',forma:'PIX',status:'Parcial',observacoes:''},
 contratos:{cliente:'',telefone:'',servico:'',valor:'',prazo:'10 a 15 dias úteis',garantia:'3 meses',condicoes:'50% entrada e 50% na entrega',observacoes:''},
 garantias:{cliente:'',telefone:'',servico:'',data_inicio:'',validade:'3 meses',observacoes:'Garantia contra defeitos de fabricação.'},
 producao:{cliente:'',servico:'',etapa:'Aguardando',responsavel:'',previsao:'',prioridade:'Normal',observacoes:''},
 agenda:{cliente:'',tipo:'Instalação',data:'',hora:'',endereco:'',status:'Agendado',observacoes:''},
 financeiro:{descricao:'',tipo:'Receita',valor:'',vencimento:'',status:'Pendente',forma:'PIX',cliente:'',parcela:'1/1'},
 estoque:{material:'',categoria:'Lona',quantidade:'',minimo:'',unidade:'m²',custo:'',fornecedor:''},
 fornecedores:{nome:'',telefone:'',whatsapp:'',categoria:'Materiais',endereco:'',observacoes:''},
 compras:{fornecedor:'',material:'',quantidade:'',valor:'',data:'',status:'Pendente',observacoes:''},
 historico:{cliente:'',tipo:'Atendimento',descricao:'',data:''},
 posvenda:{cliente:'',telefone:'',servico:'',data:'',status:'Pendente',avaliacao:'',observacoes:''},
 notificacoes:{titulo:'',tipo:'Lembrete',data:'',status:'Pendente',descricao:''}
};

const menu=[
 ['dashboard','Dashboard',Home],['usuarios','Usuários',ShieldCheck],['clientes','CRM',Users],['produtos','Produtos',Package],
 ['orcamentos','Orçamentos',FileText],['recibos','Recibos',Receipt],['contratos','Contratos',FileSignature],['garantias','Garantias',BadgeCheck],
 ['producao','Produção',Factory],['agenda','Agenda',CalendarDays],['financeiro','Financeiro',Wallet],['estoque','Estoque',Boxes],
 ['fornecedores','Fornecedores',Truck],['compras','Compras',ShoppingCart],['historico','Histórico',History],
 ['posvenda','Pós-venda',CheckCircle],['notificacoes','Notificações',Bell],['ia','IA Ideal',Brain],['backup','Backup',Archive],
 ['relatorios','Relatórios',BarChart3],['configuracoes','Configurações',Settings]
];

function money(v){return brNumber(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function clean(v){return String(v||'').replace(/\D/g,'')}

function brNumber(v){
 if(typeof v==='number')return Number.isFinite(v)?v:0;
 const raw=String(v??'').trim().replace(/[^\d,.-]/g,'');
 if(!raw)return 0;
 const hasComma=raw.includes(','),hasDot=raw.includes('.');
 let normalized=raw;
 if(hasComma&&hasDot){
  normalized=raw.replace(/\./g,'').replace(',','.');
 }else if(hasComma){
  normalized=raw.replace(/\./g,'').replace(',','.');
 }else if(hasDot){
  const parts=raw.split('.');
  const last=parts[parts.length-1]||'';
  normalized=(parts.length>2||last.length===3)?raw.replace(/\./g,''):raw;
 }
 const n=Number(normalized);
 return Number.isFinite(n)?n:0;
}
function calcItemArea(it={}){
 return brNumber(it.largura)*brNumber(it.altura)*(brNumber(it.quantidade||1)||1);
}
function formatArea(v){return brNumber(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function budgetMetricsFromRow(r={}){
 const itens=Array.isArray(r.itens)?r.itens:[];
 const area=itens.length?itens.reduce((s,it)=>s+calcItemArea(it),0):brNumber(r.area||0);
 const subtotal=brNumber(r.subtotal||r.bruto||0);
 const total=brNumber(r.total||0);
 return {area,subtotal,total};
}
function realInput(v){
 const n=String(v||'').replace(/\D/g,'');
 if(!n)return '';
 return 'R$ '+(Number(n)/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function currencyFields(k){
 return ['valor','valor_pago','preco_m2','custo_m2','desconto','frete','preco','quantidade','minimo','custo'].includes(k);
}
function nowLocalInput(){
 const d=new Date(),pad=n=>String(n).padStart(2,'0');
 return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatDateTime(v){
 if(!v)return new Date().toLocaleString('pt-BR');
 const d=new Date(v);
 return isNaN(d)?String(v):d.toLocaleString('pt-BR');
}
function nextBudgetNumber(rows=[]){
 const nums=rows.map(r=>String(r.numero||'').match(/ORC-(\d+)/)?.[1]).filter(Boolean).map(Number);
 const next=(nums.length?Math.max(...nums):rows.length)+1;
 return 'ORC-'+String(next).padStart(6,'0');
}
function nextReceiptNumber(rows=[]){
 const nums=rows.map(r=>String(r.numero||'').match(/REC-(\d+)/)?.[1]).filter(Boolean).map(Number);
 const next=(nums.length?Math.max(...nums):rows.length)+1;
 return 'REC-'+String(next).padStart(6,'0');
}
function normalizeBudgetItems(raw=[],produtos=[]){
 const arr=Array.isArray(raw)&&raw.length?raw:[{produtoId:'',ambiente:'',descricao:'',largura:'',altura:'',quantidade:'1',preco:''}];
 return arr.map((it,idx)=>{
  const produto=produtos.find(p=>String(p.id)===String(it.produtoId));
  const largura=brNumber(it.largura),altura=brNumber(it.altura),quantidade=brNumber(it.quantidade||1)||1;
  const area=calcItemArea(it);
  const preco=brNumber(it.preco||produto?.preco_m2||0);
  const custoM2=brNumber(produto?.custo_m2||0);
  const total=area*preco;
  const custo=area*custoM2;
  return {...it,descricao:it.descricao||produto?.nome||`Serviço ${idx+1}`,largura:it.largura||'',altura:it.altura||'',quantidade:it.quantidade||'1',preco:it.preco||String(produto?.preco_m2||''),area,total,custo,produtoNome:produto?.nome||it.descricao||''};
 });
}

async function api(path,method='GET',body=null){
 const opts={method,headers:{'Content-Type':'application/json'},cache:'no-store'};
 if(body!==null&&body!==undefined)opts.body=JSON.stringify(body);
 const res=await fetch(`${API}/${path}`,opts);
 if(!res.ok){
  const txt=await res.text().catch(()=>'');
  throw new Error('Erro API '+method+' '+path+' - '+res.status+' '+txt);
 }
 return res.json();
}
function openDoc(title, body, mode='simple'){
 const w=window.open('','_blank');
 const premiumCss=`
  @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#eee;font-family:Arial,Helvetica,sans-serif;color:#050505}.orcDoc{width:210mm;min-height:297mm;margin:0 auto;background:white;font-size:14px;line-height:1.35}.orcTop{height:51mm;background:linear-gradient(135deg,#003b82,#0054b8);color:white;display:grid;grid-template-columns:56mm 1fr 52mm;gap:7mm;align-items:center;padding:8mm 7mm}.orcLogoBox{background:white;border-radius:8px;height:42mm;display:flex;align-items:center;justify-content:center;color:#004a9f;text-align:center;overflow:hidden}.orcLogoBox img{max-width:96%;max-height:96%;object-fit:contain}.orcLogoBox b{font-size:34px;display:block}.orcLogoBox small{display:block}.orcCompany h1{font-size:22px;margin:0 0 7mm;font-weight:800}.orcCompany p{font-size:15px;margin:4mm 0}.orcNumber{background:white;color:#071527;border-radius:8px;text-align:center;padding:4mm 4mm;height:42mm}.orcNumber h2{font-size:20px;color:#004a9f;margin:0 0 2mm}.orcNumber b{display:block;color:#004a9f;font-size:15px}.orcNumber hr{border:0;border-top:1px solid #0b4dbb;margin:3mm 0}.orcNumber span{display:block;margin-top:3mm}.orcNumber strong{display:block;font-size:14px}section{padding:0 7mm;margin-top:4mm}section h3{color:#004a9f;font-size:15px;margin:0 0 2mm;font-weight:800}.orcBox{border:1px solid #777;border-radius:7px;padding:4mm;background:white}.two{display:grid;grid-template-columns:1.5fr 1fr;gap:7mm}.dados p,.medidas p{display:grid;grid-template-columns:38mm 1fr;margin:1.6mm 0}.dados b,.medidas b{font-weight:800}.status{border-left:1px solid #777;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.status strong{color:#004a9f;font-size:17px;margin-top:2mm}.medidas hr,.payBox hr{border:0;border-top:2px solid #004a9f;margin:3mm 0}.medidas strong{color:#004a9f}.finance{display:grid;grid-template-columns:86mm 1fr;gap:8mm}.totalBox{background:linear-gradient(135deg,#0042a0,#00347e);color:white;border-radius:7px;min-height:34mm;text-align:center;display:flex;flex-direction:column;justify-content:center}.totalBox span{font-weight:800}.totalBox strong{font-size:30px;margin:3mm 0;border-bottom:1px solid rgba(255,255,255,.8);padding-bottom:2mm}.totalBox em{font-style:normal}.payBox p{margin:2mm 0;display:flex;align-items:center;gap:3mm}.payBox i{border-bottom:1px dotted #777;flex:1;height:1px}.payBox strong{color:#004a9f}.cronos{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5mm}.cronos div{border-right:1px solid #aaa;min-height:25mm;padding:1mm 5mm}.cronos div:last-child{border-right:0}.cronos b{display:block;font-size:14px}.cronos strong{display:block;margin:2mm 0;font-size:13px}.cronos span{font-size:12px}.obs{min-height:14mm}.cond{display:grid;grid-template-columns:1fr 1fr;gap:2mm 10mm}.cond p{margin:1.5mm 0}.signs{display:grid;grid-template-columns:1fr 1fr;gap:20mm;padding:5mm 18mm 6mm;text-align:center}.signs b{color:#004a9f}.signs span{display:block;border-top:1px solid #333;margin:8mm auto 2mm;width:55mm}footer{height:11mm;background:#004a9f;color:white;display:flex;align-items:center;justify-content:space-around;font-size:14px}footer em{font-weight:700}@media print{body{background:white}.orcDoc{margin:0}.printBtn{display:none!important}}
 `;
 const simpleCss=`body{font-family:Arial;padding:34px;color:#111}.head{display:flex;justify-content:space-between;border-bottom:3px solid #0b4dbb;padding-bottom:14px;margin-bottom:25px}h1{margin:0;color:#0b4dbb}.box{border:1px solid #ddd;border-radius:14px;padding:20px;margin:15px 0;line-height:1.7}.sign{margin-top:55px;border-top:1px solid #333;width:300px;text-align:center;padding-top:8px}button{padding:12px 18px;background:#0b4dbb;color:white;border:0;border-radius:8px}`;
 const html=(mode==='orcamentoPremium'||mode==='reciboPremium')
  ? `<html><head><meta charset="UTF-8"><title>${title}</title><style>${premiumCss}</style></head><body>${body}<button class="printBtn" onclick="window.print()" style="position:fixed;right:20px;bottom:20px;padding:12px 18px;background:#004a9f;color:#fff;border:0;border-radius:8px">Salvar em PDF / Imprimir</button></body></html>`
  : `<html><head><meta charset="UTF-8"><title>${title}</title><style>${simpleCss}</style></head><body><div class="head"><div><h1>Ideal Toldos</h1><p>Ideal Toldos protegendo com qualidade.</p></div><div><b>${title}</b><br/>Rio de Janeiro</div></div>${body}<div class="sign">Ideal Toldos & Coberturas</div><br/><button onclick="window.print()">Salvar em PDF / Imprimir</button></body></html>`;
 w.document.write(html);
 w.document.close();
}
function zap(phone,text){
 const tel=clean(phone); if(!tel) return alert('WhatsApp não cadastrado.');
 window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(text)}`,'_blank');
}

function App(){
 const[logged,setLogged]=useState(localStorage.getItem('icp_login')==='1');
 const[user,setUser]=useState('admin'),[pass,setPass]=useState('');
 if(!logged)return <div className="login"><div className="loginBox"><h1>Ideal Control PRO</h1><p>V5 Final · ERP Ideal Toldos</p><input value={user}onChange={e=>setUser(e.target.value)}placeholder="Usuário"/><input value={pass}onChange={e=>setPass(e.target.value)}placeholder="Senha"type="password"/><button onClick={()=>{localStorage.setItem('icp_login','1');setLogged(true)}}>Entrar</button><small>admin / qualquer senha</small></div></div>;
 return <ERP logout={()=>{localStorage.removeItem('icp_login');setLogged(false)}}/>
}

function ERP({logout}){
 const[tab,setTab]=useState('dashboard');
 const[data,setData]=useState(Object.fromEntries(resources.map(r=>[r,[]])));
 const[forms,setForms]=useState(JSON.parse(JSON.stringify(empty)));
 const[edit,setEdit]=useState({});
 const[search,setSearch]=useState('');

 async function load(){
  const entries=await Promise.all(resources.map(async r=>{
   try{return [r,await api(r)]}
   catch(err){console.error('Falha ao carregar '+r,err);return [r,[]]}
  }));
  setData(Object.fromEntries(entries));
 }
 useEffect(()=>{load()},[]);

 function freshEmpty(resource){
  return JSON.parse(JSON.stringify(empty[resource]||{}));
 }

 async function save(resource,extra={}){
  const id=edit[resource];
  const autoExtra=resource==='recibos'?{numero:forms.recibos.numero||nextReceiptNumber(data.recibos),data:forms.recibos.data||new Date().toISOString().slice(0,10),saldo:Math.max(0,brNumber(forms.recibos.valor)-brNumber(forms.recibos.valor_pago))}:{};
  try{
   const saved=await api(resource+(id?`/${id}`:''),id?'PUT':'POST',{...forms[resource],...autoExtra,...extra});
   setData(prev=>{
    const current=Array.isArray(prev[resource])?prev[resource]:[];
    const next=id?current.map(x=>String(x.id)===String(id)?saved:x):[saved,...current];
    return {...prev,[resource]:next};
   });
   setForms(prev=>({...prev,[resource]:freshEmpty(resource)}));
   setEdit(prev=>({...prev,[resource]:null}));
   await load();
  }catch(err){
   console.error(err);
   alert('Erro ao salvar '+resource+'. Veja o console/log.');
  }
 }
 async function del(resource,id){if(confirm('Excluir registro?')){await api(`${resource}/${id}`,'DELETE');await load()}}
 function start(resource,row){setForms({...forms,[resource]:JSON.parse(JSON.stringify(row))});setEdit({...edit,[resource]:row.id});scrollTo({top:0,behavior:'smooth'})}

 const produto=data.produtos.find(p=>String(p.id)===String(forms.orcamentos.produtoId));
 const cliente=data.clientes.find(c=>String(c.id)===String(forms.orcamentos.clienteId));
 const budgetItems=normalizeBudgetItems(forms.orcamentos.itens,data.produtos);
 const area=budgetItems.reduce((s,x)=>s+brNumber(x.area||0),0);
 const bruto=budgetItems.reduce((s,x)=>s+brNumber(x.total||0),0);
 const frete=brNumber(forms.orcamentos.frete||0);
 const total=Math.max(0,bruto-brNumber(forms.orcamentos.desconto||0)+frete);
 const custo=budgetItems.reduce((s,x)=>s+brNumber(x.custo||0),0),lucro=total-custo;
 const produtoResumo=[...new Set(budgetItems.map(x=>x.produtoNome||x.descricao).filter(Boolean))].join(' + ');

 return <div className="app"><aside><h2>Ideal Control <b>PRO V5 FINAL</b></h2>{menu.map(([id,name,Icon])=><button key={id}className={tab===id?'on':''}onClick={()=>setTab(id)}><Icon/>{name}</button>)}<button onClick={logout}><LogOut/>Sair</button></aside>
 <main><header><div><h1>{menu.find(m=>m[0]===tab)?.[1]}</h1><p>ERP final interno · Ideal Toldos & Coberturas</p></div></header>
 {tab==='dashboard'&&<Dashboard data={data}/>}
 {['usuarios','clientes','produtos','recibos','contratos','garantias','financeiro','estoque','fornecedores','compras','historico','posvenda','notificacoes'].includes(tab)&&
  <Crud title={menu.find(m=>m[0]===tab)?.[1]} resource={tab} form={forms[tab]} fields={Object.keys(empty[tab])} setForm={v=>setForms({...forms,[tab]:v})} rows={data[tab]} save={()=>save(tab)} start={r=>start(tab,r)} del={del} search={search} setSearch={setSearch} actions={actionsFor(tab)}/>}
 {tab==='orcamentos'&&<BudgetPage
  form={forms.orcamentos}
  setForm={v=>setForms({...forms,orcamentos:v})}
  clientes={data.clientes}
  produtos={data.produtos}
  rows={data.orcamentos}
  cliente={cliente}
  produto={produto}
  area={area}
  bruto={bruto}
  total={total}
  custo={custo}
  lucro={lucro}
  save={()=>save('orcamentos',{numero:forms.orcamentos.numero||nextBudgetNumber(data.orcamentos),data_orcamento:forms.orcamentos.data_orcamento||nowLocalInput(),status:forms.orcamentos.status||'Pendente',cliente:cliente?.nome||'',telefone:cliente?.whatsapp||cliente?.telefone||'',endereco:cliente?.endereco||'',bairro:cliente?.bairro||'',cidade:cliente?.cidade||'Rio de Janeiro - RJ',produto:produtoResumo||produto?.nome||'',itens:budgetItems,area,bruto,subtotal:bruto,desconto:forms.orcamentos.desconto||'0',frete,total,custo,lucro,forma_pagamento:forms.orcamentos.forma_pagamento||'50% entrada + 50% entrega',observacoes:forms.orcamentos.observacoes||''})}
  start={r=>start('orcamentos',r)}
  del={del}
/>}
 {tab==='producao'&&<><CrudForm title="Ordem de Produção" form={forms.producao} fields={Object.keys(empty.producao)} setForm={v=>setForms({...forms,producao:v})} save={()=>save('producao')}/><Kanban rows={data.producao} start={r=>start('producao',r)} del={del}/></>}
 {tab==='agenda'&&<><CrudForm title="Agenda" form={forms.agenda} fields={Object.keys(empty.agenda)} setForm={v=>setForms({...forms,agenda:v})} save={()=>save('agenda')}/><Calendar rows={data.agenda}/><List resource="agenda" rows={data.agenda} start={r=>start('agenda',r)} del={del}/></>}
 {tab==='ia'&&<IA/>}
 {tab==='backup'&&<Backup logs={data.backuplog} reload={load}/>}
 {tab==='relatorios'&&<Reports data={data}/>}
 {tab==='configuracoes'&&<SettingsPage/>}
 </main></div>
}

function Dashboard({data}){
 const receita=data.financeiro.filter(x=>x.tipo==='Receita'&&x.status==='Pago').reduce((s,x)=>s+brNumber(x.valor||0),0);
 const despesas=data.financeiro.filter(x=>x.tipo==='Despesa').reduce((s,x)=>s+brNumber(x.valor||0),0);
 const aberto=data.financeiro.filter(x=>x.status!=='Pago').reduce((s,x)=>s+brNumber(x.valor||0),0);
 const lucro=data.orcamentos.reduce((s,x)=>s+brNumber(x.lucro||0),0);
 const baixo=data.estoque.filter(x=>brNumber(x.quantidade||0)<=brNumber(x.minimo||0)&&brNumber(x.minimo||0)>0).length;
 return <><section className="cards"><Card t="Clientes" v={data.clientes.length}/><Card t="Orçamentos" v={data.orcamentos.length}/><Card t="Recebido" v={'R$ '+money(receita)}/><Card t="Despesas" v={'R$ '+money(despesas)}/><Card t="A receber" v={'R$ '+money(aberto)}/><Card t="Lucro previsto" v={'R$ '+money(lucro)}/><Card t="Pós-venda" v={data.posvenda.length}/><Card t="Estoque baixo" v={baixo}/></section><Box title="Fluxo principal"><p className="muted">Cliente → Orçamento → Contrato → Produção → Agenda → Recibo → Garantia → Pós-venda.</p></Box></>
}
function Card({t,v}){return <div className="card"><small>{t}</small><b>{v}</b></div>}
function Box({title,children}){return <section className="box"><h3>{title}</h3>{children}</section>}
function CrudForm({title,form,fields,setForm,save,resource,rows}){return <Box title={'Novo / Editar '+title}><form onSubmit={e=>{e.preventDefault();save()}}>{fields.map(k=>{
 const val=form[k]||'';
 if(resource==='recibos'&&k==='numero')return <input key={k}placeholder="NÚMERO DO RECIBO" value={val||nextReceiptNumber(rows)} onChange={e=>setForm({...form,[k]:e.target.value})}/>;
 if(k==='status')return <select key={k} value={val} onChange={e=>setForm({...form,[k]:e.target.value})}>{(resource==='recibos'?RECIBO_STATUS_OPTIONS:STATUS_OPTIONS).map(s=><option key={s}>{s}</option>)}</select>;
 if(k==='forma')return <select key={k} value={val} onChange={e=>setForm({...form,[k]:e.target.value})}>{PAGAMENTO_OPTIONS.map(s=><option key={s}>{s}</option>)}</select>;
 if(k==='observacoes')return <textarea key={k} placeholder={label(k)} value={val} onChange={e=>setForm({...form,[k]:e.target.value})}/>;
 return <input key={k}placeholder={(currencyFields(k)?'R$ ':'')+label(k)}value={val}onChange={e=>setForm({...form,[k]:currencyFields(k)?realInput(e.target.value):e.target.value})}/>;
}) }<button><Plus/>Salvar</button></form></Box>}
function Crud(p){const lista=(p.rows||[]).filter(r=>!p.search||JSON.stringify(r).toLowerCase().includes(p.search.toLowerCase()));return <><CrudForm {...p}/><Box title="Pesquisar"><div className="search"><Search/><input placeholder="Pesquisar..." value={p.search} onChange={e=>p.setSearch(e.target.value)}/></div></Box><List resource={p.resource} rows={lista} start={p.start} del={p.del} actions={p.actions}/></>}
function List({resource,rows,start,del,actions}){return <Box title="Lista">{rows.length===0&&<p className="muted">Nenhum registro.</p>}{rows.map(r=><div className="row"key={r.id}><div><b>{r.nome||r.cliente||r.descricao||r.material||r.produto||r.servico||r.fornecedor||r.titulo||'Registro'}</b><small>{sub(r)}</small></div><div>{actions&&actions(r)}{r.whatsapp&&<a href={'https://wa.me/55'+clean(r.whatsapp)}target="_blank"><Phone/></a>}<button onClick={()=>start(r)}><Edit/></button><button onClick={()=>del(resource,r.id)}><Trash2/></button></div></div>)}</Box>}
function Kanban({rows,start,del}){const etapas=['Aguardando','Corte','Solda','Pintura','Montagem','Pronto','Instalação','Finalizado'];return <div className="kanban">{etapas.map(e=><div className="col"key={e}><h4>{e}</h4>{rows.filter(r=>r.etapa===e).map(r=><div className="task"key={r.id}><b>{r.cliente||r.servico}</b><small>{r.responsavel||'Sem responsável'} · {r.previsao||'sem prazo'}</small><button onClick={()=>start(r)}><Edit/></button><button onClick={()=>del('producao',r.id)}><Trash2/></button></div>)}</div>)}</div>}
function Calendar({rows}){return <Box title="Calendário"><div className="calendar">{rows.map(r=><div className="day"key={r.id}><b>{r.data||'Sem data'}</b><span>{r.hora||''}</span><small>{r.cliente} · {r.tipo} · {r.status}</small></div>)}</div></Box>}

function Field({label:txt,children}){return <label className="budgetField"><span>{txt}</span>{children}</label>}
function BudgetPage({form,setForm,clientes,produtos,rows,cliente,produto,area,bruto,total,custo,lucro,save,start,del}){
 const update=(k,v)=>setForm({...form,[k]:v});
 const numero=form.numero||nextBudgetNumber(rows);
 const dataOrc=form.data_orcamento||nowLocalInput();
 const itens=normalizeBudgetItems(form.itens,produtos);
 const setItem=(idx,key,value)=>{
  const next=[...itens].map(({area,total,custo,produtoNome,...rest})=>rest);
  next[idx]={...next[idx],[key]:value};
  if(key==='produtoId'){
   const p=produtos.find(x=>String(x.id)===String(value));
   next[idx].descricao=p?.nome||next[idx].descricao||'';
   next[idx].preco=String(p?.preco_m2||next[idx].preco||'');
  }
  setForm({...form,numero,data_orcamento:dataOrc,itens:next});
 };
 const addItem=()=>setForm({...form,numero,data_orcamento:dataOrc,itens:[...itens.map(({area,total,custo,produtoNome,...rest})=>rest),{produtoId:'',descricao:'',largura:'',altura:'',quantidade:'1',preco:''}]});
 const removeItem=idx=>setForm({...form,itens:itens.filter((_,i)=>i!==idx).map(({area,total,custo,produtoNome,...rest})=>rest)});
 return <div className="budgetPage budgetV532">
  <section className="budgetHero">
   <div>
    <span className="budgetBadge">V5.3.2 · Orçamento Profissional</span>
    <h2>Novo Orçamento</h2>
    <p>Número automático, status, data, múltiplos serviços, subtotal, desconto, frete e total destacado.</p>
   </div>
   <div className="budgetHeroTotals">
    <small>{numero}</small>
    <b>R$ {money(total)}</b>
    <span>{formatArea(area)} m² · {form.status||'Pendente'}</span>
   </div>
  </section>

  <form className="budgetForm" onSubmit={e=>{e.preventDefault();setForm({...form,numero,data_orcamento:dataOrc});save()}}>
   <div className="budgetLayout">
    <div className="budgetMainCards">
     <section className="budgetCard budgetMeta"><h3>Identificação</h3><div className="budgetFields triple">
      <Field label="Nº orçamento"><input value={numero} onChange={e=>update('numero',e.target.value)} placeholder="ORC-000001"/></Field>
      <Field label="Data e hora"><input type="datetime-local" value={dataOrc} onChange={e=>update('data_orcamento',e.target.value)}/></Field>
      <Field label="Status"><select value={form.status||'Pendente'} onChange={e=>update('status',e.target.value)}>{STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}</select></Field>
     </div></section>

     <section className="budgetCard"><h3>Cliente</h3><div className="budgetFields">
      <Field label="Cliente cadastrado"><select value={form.clienteId} onChange={e=>update('clienteId',e.target.value)}><option value="">Selecione o cliente</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></Field>
      <div className="budgetPreview"><b>{cliente?.nome||'Nenhum cliente selecionado'}</b><small>{cliente?.whatsapp||cliente?.telefone||'Telefone/WhatsApp aparecerá aqui'}</small><small>{cliente?.bairro||cliente?.endereco||'Endereço/bairro aparecerá aqui'}</small></div>
     </div></section>

     <section className="budgetCard"><h3>Obra</h3><div className="budgetFields">
      <Field label="Forma de pagamento"><input value={form.forma_pagamento||''} onChange={e=>update('forma_pagamento',e.target.value)} placeholder="50% entrada + 50% entrega"/></Field>
     </div></section>

     <section className="budgetCard budgetItemsCard"><div className="budgetTitleLine"><h3>Serviços do orçamento</h3><button type="button" onClick={addItem}><Plus/>Adicionar serviço</button></div>
      <div className="budgetItemsTable">
       <div className="budgetItemsHead"><span>Serviço</span><span>Ambiente</span><span>Larg.</span><span>Alt.</span><span>Qtd.</span><span>Área</span><span>Preço/m²</span><span>Total</span><span></span></div>
       {itens.map((it,idx)=><div className="budgetItemRow" key={idx}>
        <select value={it.produtoId||''} onChange={e=>setItem(idx,'produtoId',e.target.value)}><option value="">Serviço</option>{produtos.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}</select>
        <input value={it.ambiente||''} onChange={e=>setItem(idx,'ambiente',e.target.value)} placeholder="Cozinha, sala, loja..."/>
        <input value={it.largura||''} onChange={e=>setItem(idx,'largura',e.target.value)} placeholder="4,00"/>
        <input value={it.altura||''} onChange={e=>setItem(idx,'altura',e.target.value)} placeholder="2,50"/>
        <input value={it.quantidade||'1'} onChange={e=>setItem(idx,'quantidade',e.target.value)} placeholder="1"/>
        <b className="areaBadge">{formatArea(it.area)} m²</b>
        <input value={it.preco||''} onChange={e=>setItem(idx,'preco',realInput(e.target.value))} placeholder="R$ 0,00"/>
        <b>R$ {money(it.total)}</b>
        <button type="button" disabled={itens.length===1} onClick={()=>removeItem(idx)}><Trash2/></button>
        <input className="budgetItemDesc" value={it.descricao||''} onChange={e=>setItem(idx,'descricao',e.target.value)} placeholder="Descrição livre do serviço"/>
       </div>)}
      </div>
     </section>

     <section className="budgetCard"><h3>Observações</h3><div className="budgetFields">
      <textarea value={form.observacoes||''} onChange={e=>update('observacoes',e.target.value)} placeholder="Detalhes da obra, cor, material, prazo combinado..." />
     </div></section>
    </div>

    <section className="budgetSummaryPanel">
     <h3>Resumo financeiro</h3>
     <div className="summaryLine"><span>Subtotal</span><b>R$ {money(bruto)}</b></div>
     <Field label="Desconto"><input value={form.desconto||''} onChange={e=>update('desconto',realInput(e.target.value))} placeholder="R$ 0,00"/></Field>
     <Field label="Frete / deslocamento"><input value={form.frete||''} onChange={e=>update('frete',realInput(e.target.value))} placeholder="R$ 0,00"/></Field>
     <div className="summaryLine"><span>Custo previsto</span><b>R$ {money(custo)}</b></div>
     <div className="summaryLine"><span>Lucro previsto</span><b>R$ {money(lucro)}</b></div>
     <div className="summaryTotal"><small>Total geral</small><strong>R$ {money(total)}</strong></div>
     <div className="budgetActions"><button className="primary"><Plus/>Salvar</button><button type="button" onClick={()=>alert('Salve o orçamento primeiro. Depois use o botão PDF na lista abaixo.')}><Printer/>PDF</button><button type="button" onClick={()=>alert('Salve o orçamento primeiro. Depois use o botão WhatsApp na lista abaixo.')}><Send/>WhatsApp</button></div>
    </section>
   </div>
  </form>

  <BudgetList rows={rows} start={start} del={del}/>
 </div>
}
function BudgetList({rows,start,del}){return <section className="box budgetList"><h3>Orçamentos salvos</h3>{rows.length===0&&<p className="muted">Nenhum orçamento salvo.</p>}{rows.map(r=>{const m=budgetMetricsFromRow(r);return <div className="budgetRow" key={r.id}><div><b>{r.numero||'ORC'} · {r.cliente||'Cliente'}</b><small>{r.produto||'Serviço'} · {formatArea(m.area)} m² · Total R$ {money(m.total)}</small><small>Status: {r.status||'Pendente'} · Data: {formatDateTime(r.data_orcamento)} · Pagamento: {r.forma_pagamento||'A combinar'}</small></div><div className="budgetRowActions"><button title="Gerar PDF" onClick={()=>docOrc(r)}><Printer/></button><button title="Enviar WhatsApp" onClick={()=>zap(r.telefone,msgOrcamento(r))}><Send/></button><button title="Gerar Recibo" onClick={()=>docRec(orctoRecibo(r))}><Receipt/></button><button title="Editar" onClick={()=>start(r)}><Edit/></button><button title="Excluir" onClick={()=>del('orcamentos',r.id)}><Trash2/></button></div></div>})}</section>}


function prazoEntrega(){
 const d=new Date();
 d.setDate(d.getDate()+10);
 return d.toLocaleDateString('pt-BR');
}
function msgOrcamento(r){
 const entrada=(brNumber(r.total)/2).toFixed(2).replace('.',',');
 const saldo=entrada;
 return `*IDEAL TOLDOS & COBERTURAS*

Olá, ${r.cliente||'Cliente'}!

Segue a sua proposta personalizada.

━━━━━━━━━━━━━━━━━━

*PROJETO:* ${String(r.produto||'').toUpperCase()}

*MEDIDAS*
• Área: ${formatArea(budgetMetricsFromRow(r).area)} m²

*VALOR TOTAL*
R$ ${money(r.total)}

*ENTRADA*
R$ ${entrada}

*SALDO NA ENTREGA*
R$ ${saldo}

*FORMA DE PAGAMENTO*
${r.forma_pagamento||'A combinar'}

*PRAZO DE FABRICAÇÃO*
10 a 15 dias úteis

*GARANTIA*
3 meses contra defeitos de fabricação.

O orçamento completo em PDF segue em anexo.

Instagram:
https://www.instagram.com/ideal_toldos/

WhatsApp
(21) 97025-7379

Ideal Toldos protegendo com qualidade.`;
}

function actionsFor(resource){
 if(resource==='orcamentos')return r=><><button onClick={()=>docOrc(r)}><Printer/></button><button onClick={()=>zap(r.telefone,msgOrcamento(r))}><Send/></button></>;
 if(resource==='recibos')return r=><><button onClick={()=>docRec(r)}><Printer/></button><button onClick={()=>zap(r.telefone,msgRecibo(r))}><Send/></button></>;
 if(resource==='contratos')return r=><button onClick={()=>docContrato(r)}><Printer/></button>;
 if(resource==='garantias')return r=><button onClick={()=>docGarantia(r)}><Printer/></button>;
 if(resource==='posvenda')return r=><button onClick={()=>zap(r.telefone,`Olá ${r.cliente}, tudo bem? Aqui é da Ideal Toldos. Estamos passando para saber se ficou satisfeito com o serviço: ${r.servico}.`)}><Send/></button>;
 return null;
}
function dataExtensoCurta(v){
 const d=v?new Date(v):new Date();
 return isNaN(d)?new Date().toLocaleDateString('pt-BR'):d.toLocaleDateString('pt-BR');
}
function statusLabel(v){return String(v||'Pendente').toUpperCase()}
function numeroOrcamento(v){return String(v||'ORC-000001').replace('ORC-','ORC-')}
function docOrc(r){
 const itens=Array.isArray(r.itens)&&r.itens.length?r.itens:[];
 const item=itens[0]||{};
 const servico=(r.produto||item.descricao||item.produtoNome||'Serviço').toString();
 const largura=brNumber(item.largura||r.largura||0);
 const altura=brNumber(item.altura||r.altura||0);
 const area=itens.length?itens.reduce((s,it)=>s+calcItemArea(it),0):brNumber(r.area||item.area||0);
 const total=brNumber(r.total||0);
 const entrada=total/2;
 const saldo=total/2;
 const obs=r.observacoes||'Cor da lona a definir com o cliente. Medidas conferidas pelo cliente. Instalação inclusa. Estrutura metálica com pintura eletrostática.';
 const descricao=item.descricao||`Fornecimento e instalação de ${servico} com estrutura metálica e material de alta qualidade.`;
 const serviceRows=(itens.length?itens:[item]).map((it,idx)=>{
  const nome=it.produtoNome||it.descricao||servico||`Serviço ${idx+1}`;
  const amb=it.ambiente||it.local||it.local_instalacao||r.ambiente||r.local_instalacao||'A definir';
  const larg=brNumber(it.largura||r.largura||0);
  const alt=brNumber(it.altura||r.altura||0);
  const qtd=brNumber(it.quantidade||1)||1;
  const ar=calcItemArea(it);
  const tot=brNumber(it.total||0);
  return `<tr><td>${nome}</td><td>${amb}</td><td>${larg.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})} x ${alt.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>${qtd}</td><td>${formatArea(ar)} m²</td><td>R$ ${money(tot)}</td></tr>`;
 }).join('');
 const html=`
 <div class="orcDoc">
  <div class="orcTop">
   <div class="orcLogoBox"><img src="/logo-ideal.png" onerror="this.style.display='none';this.parentElement.innerHTML='<b>IDEAL</b><small>TOLDOS & COBERTURAS</small>'"/></div>
   <div class="orcCompany">
    <h1>IDEAL TOLDOS & COBERTURAS</h1>
    <p>Local: Rio de Janeiro - RJ</p>
    <p>WhatsApp: (21) 97025-7379</p>
    <p>Instagram: @ideal_toldos</p>
   </div>
   <div class="orcNumber">
    <h2>ORÇAMENTO</h2>
    <b>Nº ${numeroOrcamento(r.numero)}</b>
    <hr/>
    <span>Data de emissão:</span><strong>${dataExtensoCurta(r.data_orcamento)}</strong>
    <span>Validade da proposta:</span><strong>15 dias</strong>
   </div>
  </div>
  <section><h3>DADOS DO CLIENTE</h3><div class="orcBox two">
   <div class="dados">
    <p><b>Nome:</b><span>${r.cliente||'Cliente'}</span></p>
    <p><b>Telefone:</b><span>${r.telefone||''}</span></p>
    <p><b>Endereço:</b><span>${r.endereco||''}</span></p>
    <p><b>Bairro:</b><span>${r.bairro||''}</span></p>
    <p><b>Cidade:</b><span>${r.cidade||'Rio de Janeiro – RJ'}</span></p>
   </div>
   <div class="status"><span>Status do orçamento:</span><strong>${statusLabel(r.status)}</strong></div>
  </div></section>
  <section><h3>DADOS DO SERVIÇO</h3><div class="orcBox">
   <table class="servTable"><thead><tr><th>Serviço</th><th>Ambiente</th><th>Medidas</th><th>Qtd.</th><th>Área</th><th>Total</th></tr></thead><tbody>${serviceRows}</tbody></table>
   <p class="descLine"><b>Descrição:</b> ${descricao}</p>
   <p class="areaLine"><b>Área total:</b> <strong>${formatArea(area)} m²</strong></p>
  </div></section>
  <section><h3>RESUMO FINANCEIRO</h3><div class="orcBox finance">
   <div class="totalBox"><span>VALOR TOTAL</span><strong>R$ ${money(total)}</strong><em>${valorPorExtensoSimples(total)}</em></div>
   <div class="payBox">
    <p><b>Entrada (50%):</b><i></i><span>R$ ${money(entrada)}</span></p>
    <p><b>Saldo na entrega (50%):</b><i></i><span>R$ ${money(saldo)}</span></p>
    <hr/>
    <p><b>Forma de pagamento:</b></p>
    <strong>50% ENTRADA + 50% NA ENTREGA</strong>
    <p>Outras formas:</p><span>PIX, Cartão de Crédito em até 12x ou Dinheiro</span>
   </div>
  </div></section>
  <section><h3>CRONOGRAMA E GARANTIA</h3><div class="orcBox cronos">
   <div><b>Prazo de fabricação</b><strong>10 a 15 dias úteis</strong><span>Após a aprovação do orçamento e confirmação do pagamento da entrada.</span></div>
   <div><b>Previsão de instalação</b><strong>Até 2 dias após a fabricação</strong><span>Sujeito a condições climáticas e disponibilidade de agenda.</span></div>
   <div><b>Garantia</b><strong>3 meses</strong><span>Contra defeitos de fabricação e instalação.</span></div>
  </div></section>
  <section><h3>OBSERVAÇÕES</h3><div class="orcBox obs">${obs}</div></section>
  <section><h3>CONDIÇÕES COMERCIAIS</h3><div class="orcBox cond">
   <p>- Orçamento válido por 15 dias a partir da data de emissão.</p>
   <p>- Materiais de primeira linha e alta durabilidade.</p>
   <p>- Garantia de 3 meses contra defeitos de fabricação e instalação.</p>
   <p>- Alterações no projeto após aprovação podem gerar novo orçamento.</p>
   <p>- Instalação realizada conforme vistoria técnica.</p>
  </div></section>
  <div class="signs"><div><b>IDEAL TOLDOS & COBERTURAS</b><span></span><small>Assinatura e carimbo</small></div><div><b>CLIENTE</b><span></span><small>Assinatura</small></div></div>
  <footer><b>WhatsApp: (21) 97025-7379</b><b>Instagram: @ideal_toldos</b><em>Ideal Toldos protegendo com qualidade.</em></footer>
 </div>`;
 openDoc('ORÇAMENTO '+(r.numero||''),html,'orcamentoPremium');
}
function valorPorExtensoSimples(v){
 const n=Math.round(brNumber(v));
 if(n===600)return 'Seiscentos reais';
 if(n===0)return 'Zero reais';
 return `${n.toLocaleString('pt-BR')} reais`;
}

function numeroRecibo(v){return String(v||'REC-000001').replace('REC-','REC-')}
function orctoRecibo(r){const total=brNumber(r.total||0);const pago=total/2;return {numero:'REC-'+String(r.id||1).padStart(6,'0'),orcamento:r.numero||'',data:new Date().toISOString().slice(0,10),cliente:r.cliente,telefone:r.telefone,endereco:r.endereco,bairro:r.bairro,servico:r.produto||'Serviço',area:budgetMetricsFromRow(r).area,itens:r.itens||[],valor:total,valor_pago:pago,saldo:total-pago,forma:'PIX',status:'Parcial',observacoes:'Recibo referente à entrada do orçamento aprovado.'}}
function msgRecibo(r){return `*RECIBO - IDEAL TOLDOS & COBERTURAS*\n\nOlá, ${r.cliente||'Cliente'}!\n\nRecebemos o pagamento de *R$ ${money(r.valor_pago)}*.\nForma: ${r.forma||'PIX'}\nStatus: ${r.status||'Parcial'}\nSaldo restante: R$ ${money(brNumber(r.saldo||0))}\n\nIdeal Toldos protegendo com qualidade.`}
function docRec(r){
 const valor=brNumber(r.valor||0),pago=brNumber(r.valor_pago||0),saldo=String(r.saldo||'')?brNumber(r.saldo):Math.max(0,valor-pago);
 const status=String(r.status|| (saldo>0?'Parcial':'Quitado')).toUpperCase();
 const html=`
 <div class="orcDoc">
  <div class="orcTop">
   <div class="orcLogoBox"><img src="/logo-ideal.png" onerror="this.style.display='none';this.parentElement.innerHTML='<b>IDEAL</b><small>TOLDOS & COBERTURAS</small>'"/></div>
   <div class="orcCompany">
    <h1>IDEAL TOLDOS & COBERTURAS</h1>
    <p>Local: Rio de Janeiro - RJ</p>
    <p>WhatsApp: (21) 97025-7379</p>
    <p>Instagram: @ideal_toldos</p>
   </div>
   <div class="orcNumber">
    <h2>RECIBO</h2>
    <b>Nº ${numeroRecibo(r.numero)}</b>
    <hr/>
    <span>Data de emissão:</span><strong>${dataExtensoCurta(r.data)}</strong>
    <span>Referência:</span><strong>${r.orcamento||'Orçamento'}</strong>
   </div>
  </div>
  <section><h3>DADOS DO CLIENTE</h3><div class="orcBox two">
   <div class="dados">
    <p><b>Nome:</b><span>${r.cliente||'Cliente'}</span></p>
    <p><b>Telefone:</b><span>${r.telefone||''}</span></p>
    <p><b>Endereço:</b><span>${r.endereco||''}</span></p>
    <p><b>Bairro:</b><span>${r.bairro||''}</span></p>
    <p><b>Cidade:</b><span>Rio de Janeiro – RJ</span></p>
   </div>
   <div class="status"><span>Status do pagamento:</span><strong>${status}</strong></div>
  </div></section>
  <section><h3>DADOS DO RECIBO</h3><div class="orcBox two">
   <div class="dados">
    <p><b>Serviço:</b><span>${r.servico||'Serviço contratado'}</span></p>
    <p><b>Orçamento:</b><span>${r.orcamento||''}</span></p>
    <p><b>Forma de pagamento:</b><span>${r.forma||'PIX'}</span></p>
    <p><b>Descrição:</b><span>Recebimento referente ao serviço contratado junto à Ideal Toldos & Coberturas.</span></p>
   </div>
   <div class="medidas">
    <p><b>Valor total:</b><span>R$ ${money(valor)}</span></p>
    <p><b>Valor recebido:</b><strong>R$ ${money(pago)}</strong></p>
    <hr/>
    <p><b>Saldo restante:</b><strong>R$ ${money(saldo)}</strong></p>
   </div>
  </div></section>
  <section><h3>COMPROVANTE DE RECEBIMENTO</h3><div class="orcBox finance">
   <div class="totalBox"><span>VALOR RECEBIDO</span><strong>R$ ${money(pago)}</strong><em>${valorPorExtensoSimples(pago)}</em></div>
   <div class="payBox">
    <p><b>Recebemos de:</b><i></i><span>${r.cliente||'Cliente'}</span></p>
    <p><b>Forma:</b><i></i><span>${r.forma||'PIX'}</span></p>
    <p><b>Status:</b><i></i><span>${status}</span></p>
    <hr/>
    <strong>RECIBO VÁLIDO COMO COMPROVANTE DE PAGAMENTO</strong>
    <p>Este recibo confirma o valor recebido pela Ideal Toldos & Coberturas.</p>
   </div>
  </div></section>
  <section><h3>OBSERVAÇÕES</h3><div class="orcBox obs">${r.observacoes||'Pagamento recebido conforme combinado com o cliente.'}</div></section>
  <section><h3>CONDIÇÕES</h3><div class="orcBox cond">
   <p>- Recibo emitido pela Ideal Toldos & Coberturas.</p>
   <p>- Garantia padrão dos serviços: 3 meses.</p>
   <p>- Prazo de entrega/fabricação quando aplicável: 10 a 15 dias úteis.</p>
   <p>- Saldo restante deve ser quitado conforme combinado no orçamento.</p>
  </div></section>
  <div class="signs"><div><b>IDEAL TOLDOS & COBERTURAS</b><span></span><small>Assinatura e carimbo</small></div><div><b>CLIENTE</b><span></span><small>Assinatura</small></div></div>
  <footer><b>WhatsApp: (21) 97025-7379</b><b>Instagram: @ideal_toldos</b><em>Ideal Toldos protegendo com qualidade.</em></footer>
 </div>`;
 openDoc('RECIBO '+(r.numero||''),html,'reciboPremium');
}

function docContrato(r){openDoc('CONTRATO DE SERVIÇO',`<div class="box">A Ideal Toldos & Coberturas prestará o serviço de <b>${r.servico}</b> para <b>${r.cliente}</b>, no valor de <b>R$ ${money(r.valor)}</b>.<br><br><b>Prazo:</b> ${r.prazo}<br><b>Condições:</b> ${r.condicoes}<br><b>Garantia:</b> ${r.garantia}<br><b>Observações:</b> ${r.observacoes||''}</div>`)}
function docGarantia(r){openDoc('TERMO DE GARANTIA',`<div class="box">Cliente: <b>${r.cliente}</b><br>Serviço: <b>${r.servico}</b><br>Início: ${r.data_inicio||''}<br>Validade: <b>${r.validade}</b><br><br>${r.observacoes}</div>`)}
function IA(){const[p,setP]=useState('');const[r,setR]=useState('');async function ask(){const out=await api('ia/perguntar','POST',{pergunta:p});setR(out.resposta)}return <Box title="IA Ideal"><p className="muted">Pergunte: lucro, estoque, agenda, produtos...</p><div className="search"><Brain/><input value={p}onChange={e=>setP(e.target.value)}placeholder="Ex: Qual meu lucro?"/><button onClick={ask}>Perguntar</button></div>{r&&<div className="answer">{r}</div>}</Box>}
function Backup({logs,reload}){async function run(){await api('backup/run','POST',{});reload()}return <><Box title="Backup automático/manual"><button onClick={run}><Archive/> Gerar backup agora</button></Box><List resource="backuplog" rows={logs||[]} start={()=>{}} del={()=>{}}/></>}
function Reports({data}){const total=data.orcamentos.reduce((s,x)=>s+Number(x.total||0),0);return <><section className="cards"><Card t="Total orçado" v={'R$ '+money(total)}/><Card t="Contratos" v={data.contratos.length}/><Card t="Garantias" v={data.garantias.length}/><Card t="Compras" v={data.compras.length}/><Card t="Pós-venda" v={data.posvenda.length}/><Card t="Notificações" v={data.notificacoes.length}/></section><Box title="Resumo por módulo">{resources.map(r=><p key={r}>{r}: <b>{data[r].length}</b></p>)}</Box></>}
function SettingsPage(){return <Box title="Configurações"><p className="muted">Empresa: Ideal Toldos & Coberturas · WhatsApp: 21 97025-7379 · Garantia padrão: 3 meses · Preparado para WhatsApp API futura.</p></Box>}
function label(k){return k.replaceAll('_',' ').toUpperCase()}
function sub(r){return [r.bairro,r.telefone,r.whatsapp,r.email,r.categoria,r.status,r.tipo,r.forma,r.valor?'R$ '+money(r.valor):'',r.valor_pago?'Pago R$ '+money(r.valor_pago):'',r.produto,r.servico,r.area?formatArea(r.area)+' m²':'',r.total?'Total R$ '+money(r.total):'',r.quantidade?r.quantidade+' '+(r.unidade||''):'',r.data,r.vencimento,r.arquivo].filter(Boolean).join(' · ')}
createRoot(document.getElementById('root')).render(<App/>);
