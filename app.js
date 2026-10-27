"use strict";
// [назва, колір, ключ The Odds API, код football-data.org, id ліги в API-Football]
var LG=[["Champions League","#4f7cff","soccer_uefa_champs_league","CL",2],["Europa League","#ff8a3d","soccer_uefa_europa_league",null,3],["Premier League","#b06bff","soccer_epl","PL",39],["Serie A","#2fd0b4","soccer_italy_serie_a","SA",135],["Ligue 1","#d9c933","soccer_france_ligue_one","FL1",61],["Bundesliga","#ff5a5f","soccer_germany_bundesliga","BL1",78]];
var $=function(i){return document.getElementById(i)},N=8,D=[],F=-1,cur=null,ah=0,aa=0,ST={},msgs=[],info="";
var S={k:{o:"",f:"",a:""},on:[1,1,1,1,1,1]};
try{var s0=JSON.parse(localStorage.getItem("md_s"));if(s0&&s0.k)S=s0}catch(e){}
function sv(){try{localStorage.setItem("md_s",JSON.stringify(S))}catch(e){}}
function cg(k,ttl){try{var c=JSON.parse(localStorage.getItem(k));if(c&&Date.now()-c.t<ttl)return c.d}catch(e){}return null}
function cs(k,d){try{localStorage.setItem(k,JSON.stringify({t:Date.now(),d:d}))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ferr(e){return /fetch|network/i.test(e.message)?"немає зв’язку або браузер заблокував запит (CORS)":e.message}

/* ---------- математика ---------- */
function pa(l){var a=[],p=Math.exp(-l);a.push(p);for(var i=1;i<N;i++){p*=l/i;a.push(p)}return a}
var PA=[];for(var q=0;q<=90;q++)PA.push(pa(q*.05));
function cell(x,y,full){var h=0,d=0,a=0,o=0,b=0,g=[],i,j,p;
 for(i=0;i<N;i++)for(j=0;j<N;j++){p=x[i]*y[j];if(i>j)h+=p;else if(i===j)d+=p;else a+=p;if(i+j>2)o+=p;if(i&&j)b+=p;if(full)g.push([p,i,j])}
 var t=h+d+a;if(full)g.forEach(function(c){c[0]/=t});return{h:h/t,d:d/t,a:a/t,o:o/t,b:b/t,g:g}}
function calc(lh,la,full){return cell(pa(lh),pa(la),full)}
function fit(p){var best=9,bl=1.4,bm=1.1,i,j,r,e;
 for(i=4;i<=84;i++)for(j=4;j<=84;j++){r=cell(PA[i],PA[j]);e=Math.pow(r.h-p[0],2)+Math.pow(r.d-p[1],2)+Math.pow(r.a-p[2],2);if(e<best){best=e;bl=i*.05;bm=j*.05}}
 return[bl,bm]}
function pick(r,H,A){var o=r.h>=r.d&&r.h>=r.a?0:r.a>=r.d?2:1,b=null;
 r.g.forEach(function(c){var w=c[1]>c[2]?0:c[1]===c[2]?1:2;if(w===o&&(!b||c[0]>b[0]))b=c});
 var p=[r.h,r.d,r.a][o];
 return{s:b,p:p,txt:o===0?"Перемога: "+H:o===2?"Перемога: "+A:"Нічия",cf:p>=.6?"висока":p>=.45?"середня":"низька"}}

/* ---------- порівняння назв команд ---------- */
var STOP=" fc afc cf sc ac as ssc us sv fk rc ud cd fsv club de calcio and ";
function tk(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/internazionale|inter milan|inter milano/g,"inter").replace(/munchen/g,"munich").replace(/koln/g,"cologne").replace(/[^a-z0-9]+/g," ").split(" ").filter(function(w){return w&&!/^\d+$/.test(w)&&STOP.indexOf(" "+w+" ")<0})}
function nm(s){return tk(s).join(" ")}
function find(map,name){var a=tk(name),b=null,bs=0;if(!a.length)return null;
 for(var k in map){var t=k.split(" "),i=a.filter(function(x){return t.indexOf(x)>=0}).length;if(!i)continue;
  var c=i/Math.min(a.length,t.length),j=i/(a.length+t.length-i),s=c>.99?1+j:0;if(s>bs){bs=s;b=map[k]}}
 return b}
function same(a,b){var x=tk(a),y=tk(b),i=x.filter(function(w){return y.indexOf(w)>=0}).length;return i>0&&i/Math.min(x.length,y.length)>.99}

/* ---------- API: football-data.org (статистика ліг) ---------- */
async function loadStats(){
 var c=cg("md_st",432e5);if(c){ST=c;return}
 if(!S.k.f)return;
 var T={},codes=[];
 LG.forEach(function(l,i){if(l[3]&&S.on[i])codes.push(l[3])});
 codes.sort(function(a,b){return(a==="CL")-(b==="CL")});
 for(var n=0;n<codes.length;n++){var code=codes[n];
  try{var r=await fetch("https://api.football-data.org/v4/competitions/"+code+"/standings",{headers:{"X-Auth-Token":S.k.f}});
   if(!r.ok)throw new Error("HTTP "+r.status);
   var j=await r.json(),rows=[],gf=0,gp=0;
   (j.standings||[]).forEach(function(s){if(s.type==="TOTAL")rows=rows.concat(s.table)});
   rows.forEach(function(t){gf+=t.goalsFor;gp+=t.playedGames});
   if(!gp)continue;
   var avg=gf/gp;
   rows.forEach(function(t){var p=t.playedGames,k=nm(t.team.name);if(T[k])return;
    T[k]={att:(t.goalsFor/avg+6)/(p+6),def:(t.goalsAgainst/avg+6)/(p+6),g:avg,c:code,gp:p,gf:t.goalsFor,ga:t.goalsAgainst}});
  }catch(e){msgs.push("football-data ("+code+"): "+ferr(e))}}
 ST=T;if(Object.keys(T).length)cs("md_st",T)}

/* ---------- API: The Odds API (матчі та коефіцієнти) ---------- */
async function loadOdds(force){
 var c=!force&&cg("md_od",108e5);if(c)return c;
 if(!S.k.o)throw new Error("додайте ключ The Odds API у налаштуваннях");
 var out=[],rem="?",errs=[];
 await Promise.all(LG.map(async function(l,i){if(!S.on[i])return;
  try{var r=await fetch("https://api.the-odds-api.com/v4/sports/"+l[2]+"/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey="+encodeURIComponent(S.k.o));
   rem=r.headers.get("x-requests-remaining")||rem;
   if(!r.ok)throw new Error("HTTP "+r.status);
   (await r.json()).forEach(function(g){var s=[0,0,0],n=0;
    (g.bookmakers||[]).forEach(function(b){(b.markets||[]).forEach(function(m){if(m.key!=="h2h")return;
     var o={};m.outcomes.forEach(function(x){o[x.name]=x.price});
     if(o[g.home_team]&&o[g.away_team]&&o.Draw){var v=[1/o[g.home_team],1/o.Draw,1/o[g.away_team]],t=v[0]+v[1]+v[2];for(var k=0;k<3;k++)s[k]+=v[k]/t;n++}})});
    if(n)out.push({id:g.id,lg:i,t:g.commence_time,H:g.home_team,A:g.away_team,mk:s.map(function(x){return x/n})})})
  }catch(e){errs.push(l[0]+": "+ferr(e))}}));
 var res={m:out,rem:rem,errs:errs,ts:Date.now()};if(out.length)cs("md_od",res);return res}

/* ---------- API: API-Football (прогноз, травми) ---------- */
async function loadAF(m){
 if(!S.k.a||m.af!==undefined)return;
 var c=cg("md_af"+m.id,216e5);if(c){m.af=c;return}
 m.af=null;m.afs="Завантажую аналіз API-Football…";
 try{var H={headers:{"x-apisports-key":S.k.a}},B="https://v3.football.api-sports.io/",d=m.t.toISOString().slice(0,10),y=m.t.getUTCFullYear()-(m.t.getUTCMonth()<6?1:0);
  var r=await(await fetch(B+"fixtures?league="+LG[m.lg][4]+"&season="+y+"&date="+d,H)).json();
  var er=r.errors&&Object.values(r.errors)[0];if(er)throw new Error(er);
  var f=(r.response||[]).filter(function(x){return same(x.teams.home.name,m.H)&&same(x.teams.away.name,m.A)})[0];
  if(!f)throw new Error("матч не знайдено в API-Football");
  var id=f.fixture.id,hid=f.teams.home.id;
  var rs=await Promise.all([fetch(B+"predictions?fixture="+id,H).then(function(x){return x.json()}),fetch(B+"injuries?fixture="+id,H).then(function(x){return x.json()})]);
  var pr=rs[0].response&&rs[0].response[0],inj=rs[1].response||[],o={inj:[0,0],names:[[],[]],p:null,adv:""};
  if(pr){var pc=pr.predictions.percent,v=[parseFloat(pc.home),parseFloat(pc.draw),parseFloat(pc.away)];
   if(v.every(function(x){return x>=0}))o.p=v.map(function(x){return x/(v[0]+v[1]+v[2])});o.adv=pr.predictions.advice||""}
  inj.forEach(function(x){var s=x.team.id===hid?0:1;o.inj[s]+=x.player.type==="Questionable"?.5:1;if(o.names[s].length<4)o.names[s].push(x.player.name)});
  m.af=o;m.afs="";cs("md_af"+m.id,o)
 }catch(e){m.af=null;m.afs="API-Football: "+ferr(e)}}

/* ---------- модель ---------- */
function recalc(m){
 var sg=[["Ринок (коефіцієнти)",m.mk,.6]];
 if(m.st)sg.push(["Статистика ліги",m.st.p,m.st.w]);
 if(m.af&&m.af.p)sg.push(["API-Football",m.af.p,.2]);
 var tw=0,f=[0,0,0];sg.forEach(function(s){tw+=s[2];for(var i=0;i<3;i++)f[i]+=s[1][i]*s[2]});
 f=f.map(function(x){return x/tw});m.sg=sg;m.tw=tw;m.fin=f;var l=fit(f);m.l0=l[0];m.l1=l[1]}
function view(m,x,y){var f=m.af&&m.af.inj||[0,0],lh=m.l0*(1+.07*x)*Math.max(.8,1-.03*f[0]),la=m.l1*(1+.07*y)*Math.max(.8,1-.03*f[1]),r=calc(lh,la,true);return{r:r,k:pick(r,m.H,m.A),lh:lh,la:la}}

async function refresh(force){
 $("bar").textContent="Оновлюю дані…";msgs=[];
 try{
  if(force)try{localStorage.removeItem("md_st")}catch(e){}
  await loadStats();
  var o=await loadOdds(force),lim=Date.now()-72e5;msgs=msgs.concat(o.errs);
  D=o.m.map(function(g){var m={id:g.id,lg:g.lg,t:new Date(g.t),H:g.H,A:g.A,mk:g.mk};
    var a=find(ST,m.H),b=find(ST,m.A);
    if(a&&b){var r=calc(a.g*a.att*b.def*1.1,b.g*b.att*a.def*.92);m.st={p:[r.h,r.d,r.a],w:a.c===b.c?.25:.1,x:[a,b]}}
    m.af=cg("md_af"+m.id,216e5)||undefined;recalc(m);m.k=view(m,0,0).k;return m})
   .filter(function(m){return m.t.getTime()>lim}).sort(function(a,b){return a.t-b.t});
  info="Матчів: <b>"+D.length+"</b> · кредитів Odds API залишилось: <b>"+o.rem+"</b> · оновлено "+new Date(o.ts||Date.now()).toLocaleTimeString("uk-UA",{hour:"2-digit",minute:"2-digit"})+(Object.keys(ST).length?" · статистика: "+Object.keys(ST).length+" команд":"");
 }catch(e){D=[];info="";msgs.push("The Odds API: "+ferr(e))}
 $("bar").innerHTML=info+(msgs.length?'<br><span class="err">'+msgs.map(esc).join("<br>")+"</span>":"");
 tabs();list()}

/* ---------- інтерфейс ---------- */
function hue(n){var h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%360;return h}
function bd(n){return'<span class="bd" style="background:hsl('+hue(n)+' 42% 30%)">'+esc(tk(n).join("").slice(0,3).toUpperCase())+"</span>"}
function pc(v){return Math.round(v*100)}
function hm(d){return d.toLocaleTimeString("uk-UA",{hour:"2-digit",minute:"2-digit"})}
function dlabel(d){var n=new Date(),df=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/864e5),s=d.toLocaleDateString("uk-UA",{weekday:"long",day:"numeric",month:"long"});
 return df===0?["Сьогодні",s]:df===1?["Завтра",s]:[s.charAt(0).toUpperCase()+s.slice(1),""]}
function tabs(){var h='<button class="tab" aria-pressed="'+(F<0)+'" data-f="-1">Усі</button>';
 LG.forEach(function(l,i){if(S.on[i])h+='<button class="tab" aria-pressed="'+(F===i)+'" data-f="'+i+'">'+l[0]+"</button>"});$("tabs").innerHTML=h}
function list(){var L=D.filter(function(x){return F<0||x.lg===F}),h="",cur="";
 if(!L.length){$("list").innerHTML='<p class="empty">'+(S.k.o?"Найближчих матчів немає або API повернув помилку (див. вище).":"Додайте ключі API у налаштуваннях (кнопка «Ключі API»), і тут з’являться матчі.")+"</p>";return}
 L.forEach(function(x){var k=x.t.toDateString();if(k!==cur){cur=k;var d=dlabel(x.t);h+='<div class="day">'+d[0]+(d[1]?"<span>"+d[1]+"</span>":"")+"</div>"}
  var v=view(x,0,0),r=v.r;
  h+='<button class="m" style="--c:'+LG[x.lg][1]+'" data-i="'+D.indexOf(x)+'"><div class="top"><i>'+LG[x.lg][0]+"</i><span>"+hm(x.t)+"</span></div>"+
  '<div class="tt"><div class="t">'+bd(x.H)+"<span>"+esc(x.H)+'</span></div><div class="sc disp">'+v.k.s[1]+":"+v.k.s[2]+'</div><div class="t r">'+bd(x.A)+"<span>"+esc(x.A)+"</span></div></div>"+
  '<div class="rb"><b class="h" style="flex:'+r.h+'"></b><b class="d" style="flex:'+r.d+'"></b><b class="a" style="flex:'+r.a+'"></b></div>'+
  '<div class="pk"><b>'+esc(v.k.txt)+"</b> · "+pc(v.k.p)+"%</div></button>"});
 $("list").innerHTML=h}
function sheet(h){$("det").innerHTML=h;$("sh").classList.add("on");$("sh").scrollTop=0}
function close(){$("sh").classList.remove("on");cur=null}
function sl(v){return["без ключових гравців","є втрати","склад стандартний","сильний склад","повний комплект"][v+2]}
async function open(i){cur=D[i];ah=0;aa=0;draw(true);var m=cur;
 if(S.k.a&&m.af===undefined){await loadAF(m);recalc(m);if(cur===m)draw(false)}}
function draw(anim){var m=cur;if(!m)return;var v=view(m,ah,aa),r=v.r,k=v.k,an=anim?"":' style="animation:none"',c=LG[m.lg][1],a=m.af;
 var tp=r.g.slice().sort(function(x,y){return y[0]-x[0]}).slice(0,4);
 var rows=m.sg.map(function(s){return'<div class="row"><b>'+s[0]+"</b><span>"+pc(s[2]/m.tw)+"%</span><span>"+s[1].map(function(x){return pc(x)}).join(" / ")+"</span></div>"}).join("");
 var st=m.st?"Голів за гру (забиті/пропущені): "+esc(m.H)+" "+(m.st.x[0].gf/Math.max(m.st.x[0].gp,1)).toFixed(2)+"/"+(m.st.x[0].ga/Math.max(m.st.x[0].gp,1)).toFixed(2)+", "+esc(m.A)+" "+(m.st.x[1].gf/Math.max(m.st.x[1].gp,1)).toFixed(2)+"/"+(m.st.x[1].ga/Math.max(m.st.x[1].gp,1)).toFixed(2):"Статистику ліги не підключено або команду не знайдено.";
 var af=!S.k.a?"Додайте ключ API-Football, щоб бачити прогноз сервісу й травми.":a?(a.adv?"Порада сервісу: <b>"+esc(a.adv)+"</b><br>":"")+"Травми: "+esc(m.H)+" — "+(a.inj[0]?a.names[0].map(esc).join(", "):"немає даних")+"; "+esc(m.A)+" — "+(a.inj[1]?a.names[1].map(esc).join(", "):"немає даних"):esc(m.afs||"Завантаження…");
 sheet('<button class="btn" id="cl">Закрити</button><div class="meta" style="--c:'+c+'"><i>'+LG[m.lg][0]+"</i> · "+dlabel(m.t)[0]+", "+hm(m.t)+"</div>"+
 '<div class="vs"><div class="t">'+bd(m.H)+"<span>"+esc(m.H)+'</span></div><div class="t">'+bd(m.A)+"<span>"+esc(m.A)+"</span></div></div>"+
 '<div class="board disp"><div class="dg"><span'+an+">"+k.s[1]+'</span></div><div class="col">:</div><div class="dg"><span'+an+">"+k.s[2]+"</span></div></div>"+
 '<div class="verdict disp">'+esc(k.txt)+'</div><div class="conf">Впевненість моделі: '+k.cf+" ("+pc(k.p)+"%)</div>"+
 '<div class="big"><div class="h" style="flex:'+r.h+'">'+pc(r.h)+'%</div><div class="d" style="flex:'+r.d+'">'+pc(r.d)+'%</div><div class="a" style="flex:'+r.a+'">'+pc(r.a)+"%</div></div>"+
 '<div class="lab"><span>'+esc(m.H)+"</span><span>Нічия</span><span>"+esc(m.A)+"</span></div>"+
 '<div class="tiles"><div class="tile"><b class="disp">'+(v.lh+v.la).toFixed(1)+'</b><span>очікувані голи</span></div><div class="tile"><b class="disp">'+pc(r.o)+'%</b><span>тотал більше 2,5</span></div><div class="tile"><b class="disp">'+pc(r.b)+"%</b><span>обидві заб’ють</span></div></div>"+
 '<h3>Найімовірніші рахунки</h3><div class="chips">'+tp.map(function(x){return'<span class="chip"><b class="disp">'+x[1]+":"+x[2]+"</b>"+(x[0]*100).toFixed(1)+"%</span>"}).join("")+"</div>"+
 '<h3>З яких джерел зібрано прогноз</h3><div class="box">'+rows+"<div>"+st+"</div><div>"+af+"</div></div>"+
 '<h3>Ваші поправки до складу</h3><div class="box"><label>'+esc(m.H)+": <b>"+sl(ah)+'</b><input type="range" id="sa" min="-2" max="2" value="'+ah+'"></label><label>'+esc(m.A)+": <b>"+sl(aa)+'</b><input type="range" id="sb" min="-2" max="2" value="'+aa+'"></label></div>'+
 '<p class="note">Ймовірності джерел показано у порядку: перемога господарів / нічия / перемога гостей. Модель Пуассона перетворює підсумкові ймовірності на очікувані голи, рахунок і тотали. Кожен «втрачений» гравець з API-Football знижує очікувані голи команди на 3%, а повзунок змінює їх на 7% за крок.</p>');
 $("cl").onclick=close;
 $("sa").oninput=function(){ah=+this.value;draw(false);$("sa").focus()};
 $("sb").oninput=function(){aa=+this.value;draw(false);$("sb").focus()}}

function settings(){cur=null;
 sheet('<button class="btn" id="cl">Закрити</button><h3 style="margin-top:22px">Ключі API</h3><div class="box">'+
 '<label>The Odds API (обов’язковий: матчі та коефіцієнти)<input type="password" id="ko" autocomplete="off" value="'+esc(S.k.o)+'"></label>'+
 '<label>football-data.org (статистика ліг)<input type="password" id="kf" autocomplete="off" value="'+esc(S.k.f)+'"></label>'+
 '<label>API-Football (прогнози та травми)<input type="password" id="ka" autocomplete="off" value="'+esc(S.k.a)+'"></label>'+
 "<div>Ключі зберігаються лише в цьому браузері й надсилаються тільки відповідним сервісам.</div></div>"+
 '<h3>Турніри (кожен витрачає кредити Odds API)</h3><div class="box">'+LG.map(function(l,i){return'<label class="ck"><input type="checkbox" id="lg'+i+'"'+(S.on[i]?" checked":"")+">"+l[0]+"</label>"}).join("")+"</div>"+
 '<p style="margin-top:18px"><button class="btn gold" id="sv">Зберегти й оновити</button></p>'+
 '<p class="note">Де взяти ключі: <a href="https://the-odds-api.com" target="_blank" rel="noopener">the-odds-api.com</a>, <a href="https://www.football-data.org/client/register" target="_blank" rel="noopener">football-data.org</a>, <a href="https://dashboard.api-football.com/register" target="_blank" rel="noopener">api-football.com</a>. Усі мають безкоштовні плани.</p>');
 $("cl").onclick=close;
 $("sv").onclick=function(){S.k={o:$("ko").value.trim(),f:$("kf").value.trim(),a:$("ka").value.trim()};S.on=LG.map(function(l,i){return $("lg"+i).checked?1:0});
  if(F>=0&&!S.on[F])F=-1;sv();try{localStorage.removeItem("md_st")}catch(e){}close();refresh(false)}}

$("tabs").onclick=function(e){var b=e.target.closest(".tab");if(!b)return;F=+b.dataset.f;tabs();list()};
$("list").onclick=function(e){var b=e.target.closest(".m");if(b)open(+b.dataset.i)};
$("gear").onclick=settings;
$("rf").onclick=function(){if(!S.k.o||confirm("Оновлення витратить кредити The Odds API (близько одного на кожен увімкнений турнір). Продовжити?"))refresh(true)};
document.onkeydown=function(e){if(e.key==="Escape")close()};
tabs();list();
if(S.k.o)refresh(false);else{$("bar").textContent="Ключі ще не додано.";settings()}
