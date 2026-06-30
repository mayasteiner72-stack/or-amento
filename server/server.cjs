
const express=require('express'),cors=require('cors'),fs=require('fs'),path=require('path');
const app=express();app.use(cors());app.use(express.json({limit:'30mb'}));
const DATA=path.join(__dirname,'data'); const BACKUPS=path.join(__dirname,'backups');
if(!fs.existsSync(DATA)) fs.mkdirSync(DATA,{recursive:true});
if(!fs.existsSync(BACKUPS)) fs.mkdirSync(BACKUPS,{recursive:true});
function file(n){return path.join(DATA,n+'.json')}
function read(n){if(!fs.existsSync(file(n)))fs.writeFileSync(file(n),'[]');return JSON.parse(fs.readFileSync(file(n),'utf8')||'[]')}
function write(n,d){fs.writeFileSync(file(n),JSON.stringify(d,null,2))}
function crud(n){
 app.get('/api/'+n,(req,res)=>res.json(read(n)));
 app.post('/api/'+n,(req,res)=>{let d=read(n),item={id:Date.now(),createdAt:new Date().toISOString(),...req.body};d.unshift(item);write(n,d);res.json(item)});
 app.put('/api/'+n+'/:id',(req,res)=>{let id=Number(req.params.id),d=read(n),i=d.findIndex(x=>x.id===id);if(i<0)return res.status(404).json({error:'not found'});d[i]={...d[i],...req.body,id,updatedAt:new Date().toISOString()};write(n,d);res.json(d[i])});
 app.delete('/api/'+n+'/:id',(req,res)=>{write(n,read(n).filter(x=>x.id!==Number(req.params.id)));res.json({ok:true})});
}
const resources=['usuarios','clientes','produtos','orcamentos','recibos','contratos','garantias','producao','agenda','financeiro','estoque','fornecedores','compras','historico','posvenda','notificacoes','backuplog'];
resources.forEach(crud);

const CLIENTES_FIXOS = [{"id": 1782506203580, "nome": "LARISSA BRITTO", "telefone": "", "whatsapp": "21 97566-0778", "email": "", "cpf_cnpj": "", "bairro": "Paciência", "endereco": "Rio de Janeiro", "observacoes": ""}, {"id": 1782506104026, "nome": "SONIA LARA", "telefone": "", "whatsapp": "21 98350-8831", "email": "", "cpf_cnpj": "", "bairro": "Campo Grande", "endereco": "Rio de Janeiro", "observacoes": ""}, {"id": 1, "nome": "ADAILSON GOMES", "telefone": "", "whatsapp": "21 96539-5491", "bairro": "Campo Grande", "endereco": "Rio de Janeiro", "observacoes": "Cliente inicial"}];
const PRODUTOS_FIXOS = [{"id": 1782506669395, "nome": "Fechamento - PLATIBANDA GALVANIZADA", "categoria": "Cobertura", "preco_m2": "R$ 90,00", "custo_m2": "R$ 45,00", "tempo": "10 Dias", "descricao": "Instalado"}, {"id": 1782505933415, "nome": "Forro / Drywall", "categoria": "Forro", "preco_m2": "R$ 120,00", "custo_m2": "R$ 60,00", "tempo": "10 Dias", "descricao": "Instalado"}, {"id": 1782505888822, "nome": "Cobertura - POLICARBONATO", "categoria": "Cobertura", "preco_m2": "R$ 650,00", "custo_m2": "R$ 300,00", "tempo": "10 Dias", "descricao": "Instalado"}, {"id": 1782505834840, "nome": "Cobertura de ZINCO / GALVALUME", "categoria": "Cobertura", "preco_m2": "R$ 220,00", "custo_m2": "R$ 100,00", "tempo": "10 Dias", "descricao": "Instalado"}, {"id": 1782505752251, "nome": "Letreiro TELHA GALVANIZADA + LOGO + ILUMINAÇÃO", "categoria": "Letreiro", "preco_m2": "R$ 350,00", "custo_m2": "R$ 150,00", "tempo": "10 Dias", "descricao": "Instalado"}, {"id": 1782505670585, "nome": "Letreiro ACM + LOGO + ILUMINAÇÃO", "categoria": "Letreiro", "preco_m2": "R$ 550,00", "custo_m2": "R$ 200,00", "tempo": "10 Dias", "descricao": "Instalado"}, {"id": 1782505567567, "nome": "Toldo cortina", "categoria": "Toldo", "preco_m2": "R$ 180,00", "custo_m2": "R$ 80,00", "tempo": "10 Dias", "descricao": "Instalado"}, {"id": 2, "nome": "Toldo Capota - Articulado", "categoria": "Capota", "preco_m2": "R$ 550,00", "custo_m2": "R$ 200,00", "tempo": "7 Dias", "descricao": "Capota sob medida"}, {"id": 3, "nome": "Forro PVC", "categoria": "PVC", "preco_m2": "R$ 95,00", "custo_m2": "R$ 45,00", "tempo": "3 Dias", "descricao": "Forro PVC instalado"}];
function chaveCadastro(x) {
  return String(x.whatsapp || x.telefone || x.nome || '').replace(/\D/g, '') || String(x.nome || '').trim().toLowerCase();
}
function mergeFixos(nomeArquivo, fixos) {
  const atuais = read(nomeArquivo);
  const mapa = new Map();
  for (const item of atuais) mapa.set(chaveCadastro(item), item);
  for (const item of fixos) {
    const chave = chaveCadastro(item);
    mapa.set(chave, { ...item, ...(mapa.get(chave) || {}) });
  }
  const final = Array.from(mapa.values());
  if (JSON.stringify(final) !== JSON.stringify(atuais)) write(nomeArquivo, final);
}
mergeFixos('clientes', CLIENTES_FIXOS);
mergeFixos('produtos', PRODUTOS_FIXOS);


app.post('/api/backup/run',(req,res)=>{
 const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 const payload={createdAt:new Date().toISOString(),data:{}};
 for(const r of resources){payload.data[r]=read(r)}
 const name=`backup-${stamp}.json`;
 fs.writeFileSync(path.join(BACKUPS,name),JSON.stringify(payload,null,2));
 const logs=read('backuplog'); logs.unshift({id:Date.now(),arquivo:name,data:payload.createdAt,status:'Concluído'}); write('backuplog',logs);
 res.json({ok:true,arquivo:name});
});
app.get('/api/backup/list',(req,res)=>res.json(fs.readdirSync(BACKUPS).filter(x=>x.endsWith('.json')).reverse()));

app.post('/api/ia/perguntar',(req,res)=>{
 const q=String(req.body?.pergunta||'').toLowerCase();
 const clientes=read('clientes'),orc=read('orcamentos'),fin=read('financeiro'),estoque=read('estoque'),prod=read('produtos'),agenda=read('agenda'),producao=read('producao');
 const receita=fin.filter(x=>x.tipo==='Receita'&&x.status==='Pago').reduce((s,x)=>s+Number(x.valor||0),0);
 const aberto=fin.filter(x=>x.status!=='Pago').reduce((s,x)=>s+Number(x.valor||0),0);
 const lucro=orc.reduce((s,x)=>s+Number(x.lucro||0),0);
 const baixo=estoque.filter(x=>Number(x.quantidade||0)<=Number(x.minimo||0)&&Number(x.minimo||0)>0);
 let resposta=`Resumo: ${clientes.length} clientes, ${orc.length} orçamentos, R$ ${receita.toFixed(2)} recebido, R$ ${aberto.toFixed(2)} em aberto.`;
 if(q.includes('lucro')) resposta=`Lucro previsto nos orçamentos: R$ ${lucro.toFixed(2)}.`;
 if(q.includes('estoque')) resposta=baixo.length?`Materiais em estoque baixo: ${baixo.map(x=>x.material).join(', ')}.`:'Nenhum material abaixo do mínimo.';
 if(q.includes('agenda')||q.includes('instala')) resposta=`Existem ${agenda.length} itens na agenda e ${producao.length} ordens em produção.`;
 if(q.includes('produto')) resposta=`Produtos cadastrados: ${prod.map(x=>x.nome).join(', ')}.`;
 res.json({resposta});
});

app.get('/api/health',(req,res)=>res.json({ok:true,app:'Ideal Control Pro',version:'5.0.0'}));
app.get('/',(req,res)=>res.send('IDEAL CONTROL PRO V5 FINAL API ON'));
app.listen(3001,()=>console.log('API ON http://localhost:3001'));
