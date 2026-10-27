"use strict";
// [назва, колір, ключ The Odds API, slug ESPN, id ліги в API-Football, id логотипу ESPN]
var LG=[["Champions League","#4f7cff","soccer_uefa_champs_league","uefa.champions",2,2],["Europa League","#ff8a3d","soccer_uefa_europa_league","uefa.europa",3,2310],["Premier League","#b06bff","soccer_epl","eng.1",39,23],["La Liga","#ff4d8d","soccer_spain_la_liga","esp.1",140,15],["Serie A","#2fd0b4","soccer_italy_serie_a","ita.1",135,12],["Ligue 1","#d9c933","soccer_france_ligue_one","fra.1",61,9],["Bundesliga","#e5484d","soccer_germany_bundesliga","ger.1",78,10]];
var $=function(i){return document.getElementById(i)},N=8,D=[],F=-1,cur=null,ah=0,aa=0,ST={},L={},X=[],msgs=[],info="",Q="",SO="t",FV={};
var S={k:{o:"",a:""},on:[1,1,1,1,1,1,1]};
try{var s0=JSON.parse(localStorage.getItem("md_s"));if(s0&&s0.k&&s0.on&&s0.on.length===7){S=s0;S.k.o=S.k.o||"";S.k.a=S.k.a||""}}catch(e){}
try{FV=JSON.parse(localStorage.getItem("md_fv"))||{}}catch(e){}
/* ---------- історія прогнозів ---------- */
var HS=[],V="m",HE="";
try{HS=JSON.parse(localStorage.getItem("md_hist"))||[]}catch(e){}
function hsv(){try{localStorage.setItem("md_hist",JSON.stringify(HS))}catch(e){}}
function hfind(m){var t=m.t.getTime(),k=nm(m.H)+"|"+nm(m.A);return HS.filter(function(x){return nm(x.H)+"|"+nm(x.A)===k&&Math.abs(new Date(x.t)-t)<4*864e5})[0]}
function record(){var now=Date.now(),ch=0;
 D.forEach(function(m){if(m.t.getTime()<=now)return;var e=hfind(m);if(e&&(e.res||new Date(e.t).getTime()<=now))return;
  var v=view(m,0,0),r=v.r,k=v.k,n={lg:m.lg,t:m.t.toISOString(),H:m.H,A:m.A,s:[k.s[1],k.s[2]],o:k.s[1]>k.s[2]?0:k.s[1]===k.s[2]?1:2,p:k.p,ph:r.h,pd:r.d,pa:r.a,ov:r.o,bt:r.b,mk:!!m.mk,res:null};
  if(e){if(e.u!==undefined)n.u=e.u;HS.splice(HS.indexOf(e),1)}HS.push(n);ch=1});
 if(ch)hsv()}
async function resolveHS(){var now=Date.now(),p=HS.filter(function(x){return!x.res&&new Date(x.t).getTime()<now-1.8*36e5});HE="";if(!p.length)return 0;
 var by={},n=0,f8=function(t){return new Date(t).toISOString().slice(0,10).replace(/-/g,"")};
 p.forEach(function(x){(by[x.lg]=by[x.lg]||[]).push(x)});
 await Promise.all(Object.keys(by).map(async function(i){var a=by[i],mn=Math.min.apply(null,a.map(function(x){return new Date(x.t).getTime()})),ev;
  try{ev=await sb(LG[i][3],f8(mn-864e5)+"-"+f8(now+864e5))}catch(e){HE="ESPN результати ("+LG[i][0]+"): "+ferr(e);return}
  ev.forEach(function(e){var c=e.competitions&&e.competitions[0];if(!c||!(e.status&&e.status.type&&e.status.type.completed))return;
   var h=c.competitors.filter(function(x){return x.homeAway==="home"})[0],w=c.competitors.filter(function(x){return x.homeAway==="away"})[0];if(!h||!w)return;
   var hs=parseInt(h.score,10),as=parseInt(w.score,10);if(isNaN(hs)||isNaN(as))return;
   a.forEach(function(x){if(!x.res&&same(x.H,h.team.displayName)&&same(x.A,w.team.displayName)&&Math.abs(new Date(e.date)-new Date(x.t))<2*864e5){x.res=[hs,as];n++}})})}));
 if(n)hsv();return n}
function r1(x){return x.res[0]>x.res[1]?0:x.res[0]===x.res[1]?1:2}
function pct(a,n){return n?Math.round(a/n*100)+"%":"—"}
function stats(){var R=HS.filter(function(x){return x.res}).sort(function(a,b){return new Date(b.t)-new Date(a.t)}),P=HS.filter(function(x){return!x.res}).sort(function(a,b){return new Date(a.t)-new Date(b.t)}),n=R.length,
 cnt=function(arr,f){return arr.filter(f).length},hit=function(x){return x.o===r1(x)},
 dt=function(x){return new Date(x.t).toLocaleDateString("uk-UA",{day:"numeric",month:"short"})};
 var h='';
 if(!HS.length){$("sv2").innerHTML='<p class="empty">Історія почне збиратися автоматично: кожен прогноз фіксується до початку матчу, а після гри результат підтягується з ESPN.<br>Відкрийте вкладку «Матчі» й оновіть дані.</p>';return}
 var h1=cnt(R,hit);
 h+='<div class="hero"><div class="ring" style="--v:'+(n?Math.round(h1/n*100):0)+'"><b class="disp">'+pct(h1,n)+'</b></div><div><b>Вгадано результат (1/X/2)</b><br>'+h1+" з "+n+" завершених матчів"+(P.length?"<br>Очікують результату: "+P.length:"")+"</div></div>";
 if(n){
  h+='<div class="tiles"><div class="tile"><b class="disp">'+pct(cnt(R,function(x){return x.s[0]===x.res[0]&&x.s[1]===x.res[1]}),n)+'</b><span>точний рахунок</span></div><div class="tile"><b class="disp">'+pct(cnt(R,function(x){return(x.ov>=.5)===(x.res[0]+x.res[1]>2)}),n)+'</b><span>тотал 2,5</span></div><div class="tile"><b class="disp">'+pct(cnt(R,function(x){return(x.bt>=.5)===(x.res[0]>0&&x.res[1]>0)}),n)+"</b><span>обидві заб’ють</span></div></div>";
  h+='<h3>Останні прогнози</h3><div class="dots">'+R.slice(0,15).reverse().map(function(x){return'<span class="dot '+(hit(x)?"y":"n")+'">'+(hit(x)?"✓":"✕")+"</span>"}).join("")+"</div>";
  var tr=[["Висока (від 60%)",function(x){return x.p>=.6}],["Середня (45–60%)",function(x){return x.p>=.45&&x.p<.6}],["Низька (до 45%)",function(x){return x.p<.45}]];
  h+='<h3>Чи можна довіряти впевненості моделі</h3><div class="box tb"><div class="tr hd"><span>Впевненість</span><span>Матчів</span><span>Обіцяла</span><span>Збулося</span></div>'+tr.map(function(t){var a=R.filter(t[1]);if(!a.length)return'<div class="tr"><b>'+t[0]+"</b><span>0</span><span>—</span><span>—</span></div>";var pr=a.reduce(function(s,x){return s+x.p},0)/a.length;return'<div class="tr"><b>'+t[0]+"</b><span>"+a.length+"</span><span>"+Math.round(pr*100)+"%</span><b>"+pct(cnt(a,hit),a.length)+"</b></div>"}).join("")+"</div>";
  var ls=LG.map(function(l,i){var a=R.filter(function(x){return x.lg===i});return a.length?'<div class="tr"><b>'+l[0]+"</b><span>"+a.length+"</span><span>"+cnt(a,hit)+"</span><b>"+pct(cnt(a,hit),a.length)+"</b></div>":""}).join("");
  if(ls)h+='<h3>За турнірами</h3><div class="box tb"><div class="tr hd"><span>Турнір</span><span>Матчів</span><span>Вгадано</span><span>%</span></div>'+ls+"</div>";
  var U=R.filter(function(x){return x.u!==undefined});
  if(U.length){var uh=cnt(U,function(x){return x.u===r1(x)});h+='<h3>Ви проти моделі</h3><div class="tiles"><div class="tile"><b class="disp">'+pct(uh,U.length)+'</b><span>ви ('+uh+"/"+U.length+')</span></div><div class="tile"><b class="disp">'+pct(cnt(U,hit),U.length)+'</b><span>модель</span></div><div class="tile"><b class="disp">'+U.length+"</b><span>спільних матчів</span></div></div>"}
  h+='<h3>Історія</h3><div class="box" style="gap:0">'+R.slice(0,40).map(function(x){var y=hit(x);return'<div class="hrow"><span class="dot '+(y?"y":"n")+'">'+(y?"✓":"✕")+'</span><div class="tx"><b>'+esc(x.H)+" — "+esc(x.A)+"</b><small>"+dt(x)+" · прогноз "+x.s[0]+":"+x.s[1]+" · результат "+x.res[0]+":"+x.res[1]+(x.u!==undefined?" · ваш вибір "+(x.u===r1(x)?"✓":"✕"):"")+"</small></div></div>"}).join("")+"</div>"}
 if(P.length)h+='<h3>Очікують результату</h3><div class="box" style="gap:0">'+P.slice(0,12).map(function(x){return'<div class="hrow"><div class="tx"><b>'+esc(x.H)+" — "+esc(x.A)+"</b><small>"+dt(x)+" · прогноз "+x.s[0]+":"+x.s[1]+(x.u!==undefined?" · ваш вибір: "+["перемога господарів","нічия","перемога гостей"][x.u]:"")+"</small></div></div>"}).join("")+"</div>";
 if(HE)h+='<p class="note err">'+esc(HE)+"</p>";
 h+='<div class="acts"><button class="btn gold" id="hr">Оновити результати</button><button class="btn" id="hx">Експорт</button><button class="btn" id="hi2">Імпорт</button><button class="btn" id="hc">Очистити</button></div><input type="file" id="hf" accept="application/json" hidden><p class="note">Прогноз фіксується до початку матчу й надалі не змінюється. Дані зберігаються лише в цьому браузері, тож зробіть експорт, щоб не втратити історію. Рахунок береться з ESPN і може враховувати додатковий час.</p>';
 $("sv2").innerHTML=h}
function setV(v){V=v;Array.prototype.forEach.call($("vw").children,function(b){b.setAttribute("aria-pressed",b.dataset.v===v)});$("mv").hidden=v!=="m";$("sv2").hidden=v!=="s";if(v==="s")stats();window.scrollTo(0,0)}
function sv(){try{localStorage.setItem("md_s",JSON.stringify(S))}catch(e){}}
function cg(k,ttl){try{var c=JSON.parse(localStorage.getItem(k));if(c&&Date.now()-c.t<ttl)return c.d}catch(e){}return null}
function cs(k,d){try{localStorage.setItem(k,JSON.stringify({t:Date.now(),d:d}))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ferr(e){return /fetch|network|load failed/i.test(e.message)?"немає зв’язку або браузер заблокував запит (CORS)":e.message}

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

/* ---------- ESPN (без ключа): таблиці, логотипи, розклад ---------- */
function stat(e,n){var s=(e.stats||[]).filter(function(x){return x.name===n})[0];return s?+s.value:NaN}
/* розклад ESPN: кілька варіантів запиту, бо деякі параметри інколи дають HTTP 400 */
async function sbGet(u){var r=await fetch(u);if(!r.ok)throw new Error("HTTP "+r.status);return(await r.json()).events||[]}
async function sb(s,rng){var B="https://site.api.espn.com/apis/site/v2/sports/soccer/"+s+"/scoreboard",err;
 var tries=[B+"?dates="+rng,B+"?dates="+rng+"&limit=100",B];
 for(var k=0;k<tries.length;k++){try{return await sbGet(tries[k])}catch(e){err=e}}
 var out=[],seen={},f8=function(t){return new Date(t).toISOString().slice(0,10).replace(/-/g,"")},days=[],q=rng.split("-"),u=function(x){return Date.UTC(+x.slice(0,4),+x.slice(4,6)-1,+x.slice(6,8))};
 for(var t=u(q[0]),e2=u(q[1]||q[0]);t<=e2&&days.length<21;t+=864e5)days.push(f8(t));
 await Promise.all(days.map(async function(d){try{(await sbGet(B+"?dates="+d)).forEach(function(e){if(!seen[e.id]){seen[e.id]=1;out.push(e)}})}catch(e){}}));
 if(out.length)return out;throw err}
async function loadESPN(){
 var c=cg("md_es2",216e5);if(c){ST=c.T;L=c.L;X=c.X;return}
 var T={},lg={},fx=[],res={},f8=function(d){return d.toISOString().slice(0,10).replace(/-/g,"")},rng=f8(new Date())+"-"+f8(new Date(Date.now()+10*864e5)),ids=[];
 LG.forEach(function(l,i){if(S.on[i])ids.push(i)});
 await Promise.all(ids.map(async function(i){var s=LG[i][3],rows=[];
  try{var r=await fetch("https://site.api.espn.com/apis/v2/sports/soccer/"+s+"/standings");if(!r.ok)throw new Error("HTTP "+r.status);
   var j=await r.json(),gr=j.children||[j];
   gr.forEach(function(g){((g.standings&&g.standings.entries)||[]).forEach(function(e){var gf=stat(e,"pointsFor"),ga=stat(e,"pointsAgainst");if(isNaN(gf)){gf=stat(e,"goalsFor");ga=stat(e,"goalsAgainst")}
    rows.push({n:e.team.displayName,logo:e.team.logos&&e.team.logos[0]?e.team.logos[0].href:"",gp:stat(e,"gamesPlayed"),gf:gf,ga:ga})})})
  }catch(e){msgs.push("ESPN таблиця ("+LG[i][0]+"): "+ferr(e))}
  try{var ev=await sb(s,rng);
   ev.forEach(function(e){var c=e.competitions&&e.competitions[0];if(!c||(e.status&&e.status.type&&e.status.type.state==="post"))return;
    var h=c.competitors.filter(function(x){return x.homeAway==="home"})[0],a=c.competitors.filter(function(x){return x.homeAway==="away"})[0];if(!h||!a)return;
    fx.push({lg:i,t:e.date,H:h.team.displayName,A:a.team.displayName});
    if(h.team.logo)lg[nm(h.team.displayName)]=h.team.logo;if(a.team.logo)lg[nm(a.team.displayName)]=a.team.logo})
  }catch(e){msgs.push("ESPN розклад ("+LG[i][0]+"): "+ferr(e))}
  res[i]=rows}));
 ids.sort(function(a,b){return(a<2)-(b<2)}).forEach(function(i){var rows=res[i].filter(function(t){return t.gp>0&&!isNaN(t.gf)});if(!rows.length)return;
  var gf=0,gp=0;rows.forEach(function(t){gf+=t.gf;gp+=t.gp});var avg=gf/gp;
  rows.forEach(function(t){var k=nm(t.n);if(t.logo)lg[k]=t.logo;if(T[k])return;
   T[k]={att:(t.gf/avg+6)/(t.gp+6),def:(t.ga/avg+6)/(t.gp+6),g:avg,c:i<2?"E":i,gp:t.gp,gf:t.gf,ga:t.ga}})});
 ST=T;L=lg;X=fx;if(Object.keys(T).length||fx.length)cs("md_es2",{T:T,L:lg,X:fx})}

/* ---------- The Odds API ---------- */
async function loadOdds(force){
 var c=!force&&cg("md_od",108e5);if(c)return c;
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

/* ---------- API-Football (за бажанням) ---------- */
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
function recalc(m){var sg=[];
 if(m.mk)sg.push(["Ринок (коефіцієнти)",m.mk,.6]);
 if(m.st)sg.push(["Статистика ліги (ESPN)",m.st.p,m.st.w]);
 if(m.af&&m.af.p)sg.push(["API-Football",m.af.p,.2]);
 var tw=0,f=[0,0,0];sg.forEach(function(s){tw+=s[2];for(var i=0;i<3;i++)f[i]+=s[1][i]*s[2]});
 f=f.map(function(x){return x/tw});m.sg=sg;m.tw=tw;m.fin=f;var l=fit(f);m.l0=l[0];m.l1=l[1]}
function view(m,x,y){var f=m.af&&m.af.inj||[0,0],lh=m.l0*(1+.07*x)*Math.max(.8,1-.03*f[0]),la=m.l1*(1+.07*y)*Math.max(.8,1-.03*f[1]),r=calc(lh,la,true);return{r:r,k:pick(r,m.H,m.A),lh:lh,la:la}}

async function refresh(force){
 $("bar").textContent="Оновлюю дані…";msgs=[];
 try{
  if(force)try{localStorage.removeItem("md_es2")}catch(e){}
  await loadESPN();
  var o={m:[],rem:"—",errs:[]};
  if(S.k.o){try{o=await loadOdds(force);msgs=msgs.concat(o.errs)}catch(e){msgs.push("The Odds API: "+ferr(e))}}
  var all=o.m.slice(),lim=Date.now()-72e5;
  X.forEach(function(f){if(!all.some(function(m){return m.lg===f.lg&&same(m.H,f.H)&&same(m.A,f.A)}))all.push({id:"e"+f.lg+nm(f.H)+f.t.slice(0,10),lg:f.lg,t:f.t,H:f.H,A:f.A,mk:null})});
  D=all.filter(function(g){return S.on[g.lg]}).map(function(g){var m={id:g.id,lg:g.lg,t:new Date(g.t),H:g.H,A:g.A,mk:g.mk};
    var a=find(ST,m.H),b=find(ST,m.A);
    if(a&&b){var r=calc(a.g*a.att*b.def*1.1,b.g*b.att*a.def*.92);m.st={p:[r.h,r.d,r.a],w:a.c===b.c?.25:.1,x:[a,b]}}
    if(!m.mk&&!m.st)return null;
    m.af=cg("md_af"+m.id,216e5)||undefined;recalc(m);return m})
   .filter(function(m){return m&&m.t.getTime()>lim}).sort(function(a,b){return a.t-b.t});
  info="Матчів: <b>"+D.length+"</b>"+(S.k.o?" · кредитів Odds API: <b>"+o.rem+"</b>":"")+" · команд зі статистикою: "+Object.keys(ST).length;
 }catch(e){D=[];info="";msgs.push(ferr(e))}
 if(!S.k.o)msgs.push("Додайте ключ The Odds API, щоб врахувати коефіцієнти (точніше).");
 $("bar").innerHTML=info+(msgs.length?'<br><span class="err">'+msgs.map(esc).join("<br>")+"</span>":"");
 tabs();list();record();
 resolveHS().then(function(n){if(V==="s")stats()}).catch(function(){})}

/* ---------- інтерфейс ---------- */
function hue(n){var h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%360;return h}
function bd(n){var u=find(L,n);return'<span class="bd'+(u?" lg":"")+'" style="background:hsl('+hue(n)+' 42% 30%)">'+(u?'<img src="'+esc(u)+'" alt="" loading="lazy" onerror="this.parentNode.classList.remove(\'lg\');this.remove()">':"")+esc(tk(n).join("").slice(0,3).toUpperCase())+"</span>"}
function li(i){return'<img class="lgi" src="https://a.espncdn.com/i/leaguelogos/soccer/500/'+LG[i][5]+'.png" alt="" onerror="this.remove()">'}
function pc(v){return Math.round(v*100)}
function hm(d){return d.toLocaleTimeString("uk-UA",{hour:"2-digit",minute:"2-digit"})}
function fk(m){return m.H+"|"+m.A}
function dlabel(d){var n=new Date(),df=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/864e5),s=d.toLocaleDateString("uk-UA",{weekday:"long",day:"numeric",month:"long"});
 return df===0?["Сьогодні",s]:df===1?["Завтра",s]:[s.charAt(0).toUpperCase()+s.slice(1),""]}
function tabs(){var h='<button class="tab" aria-pressed="'+(F===-1)+'" data-f="-1">Усі</button><button class="tab" aria-pressed="'+(F===-2)+'" data-f="-2">★ Обрані</button>';
 LG.forEach(function(l,i){if(S.on[i])h+='<button class="tab" aria-pressed="'+(F===i)+'" data-f="'+i+'">'+li(i)+l[0]+"</button>"});$("tabs").innerHTML=h}
function card(x){var v=x.v,r=v.r,fav=!!FV[fk(x)];
 return'<div class="m" role="button" tabindex="0" style="--c:'+LG[x.lg][1]+'" data-i="'+D.indexOf(x)+'"><div class="top"><i>'+li(x.lg)+LG[x.lg][0]+"</i><span>"+(x.mk?"":"лише статистика · ")+(SO==="t"?"":dlabel(x.t)[0]+", ")+hm(x.t)+'<button class="st" data-k="'+esc(fk(x))+'" aria-pressed="'+fav+'" aria-label="В обрані">★</button></span></div>'+
 '<div class="tt"><div class="t">'+bd(x.H)+"<span>"+esc(x.H)+'</span></div><div class="sc disp">'+v.k.s[1]+":"+v.k.s[2]+'</div><div class="t r">'+bd(x.A)+"<span>"+esc(x.A)+"</span></div></div>"+
 '<div class="rb"><b class="h" style="flex:'+r.h+'"></b><b class="d" style="flex:'+r.d+'"></b><b class="a" style="flex:'+r.a+'"></b></div>'+
 '<div class="pk"><b>'+esc(v.k.txt)+"</b> · "+pc(v.k.p)+"%</div></div>"}
function list(){var q=Q.trim().toLowerCase(),L2=D.filter(function(x){return(F===-1||(F===-2?FV[fk(x)]:x.lg===F))&&(!q||(x.H+" "+x.A).toLowerCase().indexOf(q)>=0)});
 L2.forEach(function(x){x.v=view(x,0,0)});
 if(!L2.length){$("list").innerHTML='<p class="empty">'+(F===-2?"Позначте матчі зірочкою ★, і вони з’являться тут.":q?"Нічого не знайдено.":"Матчів не знайдено. Спробуйте «Оновити» або перевірте повідомлення про помилки вище.")+"</p>";return}
 var h="";
 if(SO==="t"){var cd="";L2.forEach(function(x){var k=x.t.toDateString();if(k!==cd){cd=k;var d=dlabel(x.t);h+='<div class="day">'+d[0]+(d[1]?"<span>"+d[1]+"</span>":"")+"</div>"}h+=card(x)})}
 else{L2.slice().sort(function(a,b){return SO==="c"?b.v.k.p-a.v.k.p:(b.v.lh+b.v.la)-(a.v.lh+a.v.la)}).forEach(function(x){h+=card(x)})}
 $("list").innerHTML=h}
function sheet(h){$("det").innerHTML=h;$("sh").classList.add("on");$("sh").scrollTop=0}
function close(){$("sh").classList.remove("on");cur=null}
function sl(v){return["без ключових гравців","є втрати","склад стандартний","сильний склад","повний комплект"][v+2]}
async function open(i){cur=D[i];ah=0;aa=0;draw(true);var m=cur;
 if(S.k.a&&m.af===undefined){await loadAF(m);recalc(m);if(cur===m)draw(false)}}
function upd(anim){var m=cur;if(!m)return;var v=view(m,ah,aa),r=v.r,k=v.k,an=anim?"":' style="animation:none"',tp=r.g.slice().sort(function(x,y){return y[0]-x[0]}).slice(0,4);m.vr=v;
 var mx=0,cells="",i,j;for(i=0;i<6;i++)for(j=0;j<6;j++)mx=Math.max(mx,r.g[i*N+j][0]);
 cells='<span></span>';for(j=0;j<6;j++)cells+="<span>"+j+"</span>";
 for(i=0;i<6;i++){cells+="<span>"+i+"</span>";for(j=0;j<6;j++){var p=r.g[i*N+j][0];cells+='<button class="hc'+(i===k.s[1]&&j===k.s[2]?" pk2":"")+'" data-i="'+i+'" data-j="'+j+'" style="--o:'+(p/mx*.85).toFixed(2)+'" aria-label="'+i+":"+j+'"></button>'}}
 $("dyn").innerHTML='<div class="board disp"><div class="dg"><span'+an+">"+k.s[1]+'</span></div><div class="col">:</div><div class="dg"><span'+an+">"+k.s[2]+"</span></div></div>"+
 '<div class="verdict disp">'+esc(k.txt)+'</div><div class="conf">Впевненість моделі: '+k.cf+" ("+pc(k.p)+"%)</div>"+
 '<div class="big"><div class="h" style="flex:'+r.h+'">'+pc(r.h)+'%</div><div class="d" style="flex:'+r.d+'">'+pc(r.d)+'%</div><div class="a" style="flex:'+r.a+'">'+pc(r.a)+"%</div></div>"+
 '<div class="lab"><span>'+esc(m.H)+"</span><span>Нічия</span><span>"+esc(m.A)+"</span></div>"+
 '<div class="tiles"><div class="tile"><b class="disp">'+(v.lh+v.la).toFixed(1)+'</b><span>очікувані голи</span></div><div class="tile"><b class="disp">'+pc(r.o)+'%</b><span>тотал більше 2,5</span></div><div class="tile"><b class="disp">'+pc(r.b)+"%</b><span>обидві заб’ють</span></div></div>"+
 '<h3>Найімовірніші рахунки</h3><div class="chips">'+tp.map(function(x){return'<span class="chip"><b class="disp">'+x[1]+":"+x[2]+"</b>"+(x[0]*100).toFixed(1)+"%</span>"}).join("")+"</div>"+
 '<h3>Карта рахунків (торкніться клітинки)</h3><div class="hmx">'+cells+'</div><p class="note" id="hi" style="margin-top:8px">Рядки: голи господарів, стовпці: голи гостей.</p>'+
 '<div class="acts"><button class="btn gold" id="sim1">Зіграти матч</button><button class="btn" id="sim100">Зіграти 100 разів</button><button class="btn" id="shr">Поділитися</button></div><p class="note" id="sr"></p>'}
function draw(anim){var m=cur;if(!m)return;var a=m.af,e0=hfind(m),up=e0&&m.t.getTime()>Date.now()?'<h3>Ваш прогноз</h3><div class="pick3">'+[m.H,"Нічия",m.A].map(function(t,i){return'<button data-u="'+i+'" aria-pressed="'+(e0.u===i)+'">'+esc(t)+"</button>"}).join("")+'</div><p class="note">Ваші вгадування порівняються з моделлю у вкладці «Статистика».</p>':"";
 var rows=m.sg.map(function(s){return'<div class="row"><b>'+s[0]+"</b><span>"+pc(s[2]/m.tw)+"%</span><span>"+s[1].map(function(x){return pc(x)}).join(" / ")+"</span></div>"}).join("");
 var st=m.st?"Голів за гру (забиті/пропущені): "+esc(m.H)+" "+(m.st.x[0].gf/m.st.x[0].gp).toFixed(2)+"/"+(m.st.x[0].ga/m.st.x[0].gp).toFixed(2)+", "+esc(m.A)+" "+(m.st.x[1].gf/m.st.x[1].gp).toFixed(2)+"/"+(m.st.x[1].ga/m.st.x[1].gp).toFixed(2):"Статистику не знайдено для однієї з команд.";
 var af=!S.k.a?"Додайте ключ API-Football, щоб бачити прогноз сервісу й травми.":a?(a.adv?"Порада сервісу: <b>"+esc(a.adv)+"</b><br>":"")+"Травми: "+esc(m.H)+" — "+(a.inj[0]?a.names[0].map(esc).join(", "):"немає даних")+"; "+esc(m.A)+" — "+(a.inj[1]?a.names[1].map(esc).join(", "):"немає даних"):esc(m.afs||"Завантаження…");
 sheet('<button class="btn" id="cl">Закрити</button><div class="meta" style="--c:'+LG[m.lg][1]+'"><i>'+li(m.lg)+LG[m.lg][0]+"</i> · "+dlabel(m.t)[0]+", "+hm(m.t)+"</div>"+
 '<div class="vs"><div class="t">'+bd(m.H)+"<span>"+esc(m.H)+'</span></div><div class="t">'+bd(m.A)+"<span>"+esc(m.A)+"</span></div></div><div id=\"dyn\"></div>"+
 '<h3>З яких джерел зібрано прогноз</h3><div class="box">'+rows+"<div>"+st+"</div><div>"+af+"</div></div>"+
 up+'<h3>Ваші поправки до складу</h3><div class="box"><label>'+esc(m.H)+": <b id=\"la\">"+sl(ah)+'</b><input type="range" id="sa" min="-2" max="2" value="'+ah+'"></label><label>'+esc(m.A)+": <b id=\"lb\">"+sl(aa)+'</b><input type="range" id="sb" min="-2" max="2" value="'+aa+'"></label></div>'+
 '<p class="note">Ймовірності джерел: перемога господарів / нічия / перемога гостей. Модель Пуассона перетворює підсумок на очікувані голи, рахунок і тотали. Кожен «втрачений» гравець з API-Football знижує очікувані голи на 3%, повзунок змінює їх на 7% за крок.</p>');
 upd(anim)}
function samp(r){var u=Math.random(),s=0,i;for(i=0;i<r.g.length;i++){s+=r.g[i][0];if(u<=s)return r.g[i]}return r.g[0]}
$("det").onclick=function(e){var t=e.target,m=cur;if(t.closest("#cl")){close();return}if(!m)return;
 var ub=t.closest("[data-u]");if(ub){var e1=hfind(m),i=+ub.dataset.u;if(!e1||m.t.getTime()<=Date.now())return;if(e1.u===i)delete e1.u;else e1.u=i;hsv();Array.prototype.forEach.call(ub.parentNode.children,function(b){b.setAttribute("aria-pressed",+b.dataset.u===e1.u)});return}
 var hc=t.closest(".hc");if(hc){var c=m.vr.r.g[+hc.dataset.i*N+ +hc.dataset.j];$("hi").innerHTML="Рахунок <b>"+c[1]+":"+c[2]+"</b>: "+(c[0]*100).toFixed(1)+"% (приблизно 1 шанс із "+Math.round(1/c[0])+")";return}
 if(t.closest("#sim1")){var s=samp(m.vr.r);$("sr").innerHTML='Симуляція: <b class="disp roll">'+s[1]+":"+s[2]+"</b>";return}
 if(t.closest("#sim100")){var w=[0,0,0],gh=0,ga=0,k;for(k=0;k<100;k++){var z=samp(m.vr.r);w[z[1]>z[2]?0:z[1]===z[2]?1:2]++;gh+=z[1];ga+=z[2]}
  $("sr").innerHTML="100 матчів: перемог господарів <b>"+w[0]+"</b>, нічиїх <b>"+w[1]+"</b>, перемог гостей <b>"+w[2]+"</b>. Середній рахунок "+(gh/100).toFixed(1)+" : "+(ga/100).toFixed(1)+".";return}
 if(t.closest("#shr")){var k2=m.vr.k,tx=m.H+" — "+m.A+": прогноз "+k2.s[1]+":"+k2.s[2]+", "+k2.txt+" ("+pc(k2.p)+"%)";
  if(navigator.share)navigator.share({text:tx}).catch(function(){});else if(navigator.clipboard){navigator.clipboard.writeText(tx);$("sr").textContent="Прогноз скопійовано."}}};
$("det").oninput=function(e){if(e.target.id==="sa"){ah=+e.target.value;$("la").textContent=sl(ah);upd(false)}else if(e.target.id==="sb"){aa=+e.target.value;$("lb").textContent=sl(aa);upd(false)}};

function settings(){cur=null;
 sheet('<button class="btn" id="cl">Закрити</button><h3 style="margin-top:22px">Ключі API</h3><div class="box">'+
 '<label>The Odds API (коефіцієнти: точніший прогноз)<input type="password" id="ko" autocomplete="off" value="'+esc(S.k.o)+'"></label>'+
 '<label>API-Football (прогноз сервісу та травми, за бажанням)<input type="password" id="ka" autocomplete="off" value="'+esc(S.k.a)+'"></label>'+
 "<div>Розклад, таблиці й логотипи беруться з ESPN без ключа. Ключі зберігаються лише в цьому браузері.</div></div>"+
 '<h3>Турніри (кожен витрачає кредит Odds API)</h3><div class="box">'+LG.map(function(l,i){return'<label class="ck"><input type="checkbox" id="lg'+i+'"'+(S.on[i]?" checked":"")+">"+l[0]+"</label>"}).join("")+"</div>"+
 '<p style="margin-top:18px"><button class="btn gold" id="sv">Зберегти й оновити</button></p>'+
 '<p class="note">Ключі: <a href="https://the-odds-api.com" target="_blank" rel="noopener">the-odds-api.com</a>, <a href="https://dashboard.api-football.com/register" target="_blank" rel="noopener">api-football.com</a>. Є безкоштовні плани.</p>');
 $("sv").onclick=function(){S.k={o:$("ko").value.trim(),a:$("ka").value.trim()};S.on=LG.map(function(l,i){return $("lg"+i).checked?1:0});
  if(F>=0&&!S.on[F])F=-1;sv();try{localStorage.removeItem("md_es2");localStorage.removeItem("md_od")}catch(e){}close();refresh(false)}}

$("tabs").onclick=function(e){var b=e.target.closest(".tab");if(!b)return;F=+b.dataset.f;tabs();list()};
$("list").onclick=function(e){var s=e.target.closest(".st");
 if(s){var k=s.dataset.k;if(FV[k])delete FV[k];else FV[k]=1;try{localStorage.setItem("md_fv",JSON.stringify(FV))}catch(x){}if(F===-2)list();else s.setAttribute("aria-pressed",!!FV[k]);return}
 var b=e.target.closest(".m");if(b)open(+b.dataset.i)};
$("list").onkeydown=function(e){if((e.key==="Enter"||e.key===" ")&&e.target.classList.contains("m")){e.preventDefault();open(+e.target.dataset.i)}};
$("q").oninput=function(){Q=this.value;list()};
$("so").onclick=function(e){var b=e.target.closest("button");if(!b)return;SO=b.dataset.s;Array.prototype.forEach.call($("so").children,function(x){x.setAttribute("aria-pressed",x===b)});list()};
$("gear").onclick=settings;
$("rf").onclick=function(){if(!S.k.o||confirm("Оновлення витратить кредити The Odds API (близько одного на кожен увімкнений турнір). Продовжити?"))refresh(true)};
document.onkeydown=function(e){if(e.key==="Escape")close()};
$("vw").onclick=function(e){var b=e.target.closest("button");if(b)setV(b.dataset.v)};
$("sv2").onclick=function(e){var t=e.target;
 if(t.id==="hr"){t.textContent="Перевіряю…";resolveHS().then(function(){stats()});return}
 if(t.id==="hx"){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(HS)],{type:"application/json"}));a.download="matchday-history.json";document.body.appendChild(a);a.click();a.remove();return}
 if(t.id==="hi2"){$("hf").click();return}
 if(t.id==="hc"){if(confirm("Видалити всю історію прогнозів? Дію не можна скасувати.")){HS=[];hsv();stats()}}};
$("sv2").onchange=function(e){if(e.target.id!=="hf"||!e.target.files[0])return;var fr=new FileReader();fr.onload=function(){try{var a=JSON.parse(fr.result);if(!Array.isArray(a))throw 0;var add=0;a.forEach(function(x){if(x&&x.H&&x.A&&x.t&&x.s&&!HS.some(function(y){return nm(y.H)===nm(x.H)&&nm(y.A)===nm(x.A)&&Math.abs(new Date(y.t)-new Date(x.t))<2*864e5})){HS.push(x);add++}});hsv();stats();alert("Додано прогнозів: "+add)}catch(er){alert("Не вдалося прочитати файл.")}};fr.readAsText(e.target.files[0])};
tabs();list();refresh(false);
