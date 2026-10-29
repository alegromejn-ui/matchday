"use strict";
// [назва, колір, ключ The Odds API, slug ESPN, id ліги в API-Football, id логотипу ESPN]
var LG=[["Champions League","#4f7cff","soccer_uefa_champs_league","uefa.champions",2,2],["Europa League","#ff8a3d","soccer_uefa_europa_league","uefa.europa",3,2310],["Premier League","#b06bff","soccer_epl","eng.1",39,23],["La Liga","#ff4d8d","soccer_spain_la_liga","esp.1",140,15],["Serie A","#2fd0b4","soccer_italy_serie_a","ita.1",135,12],["Ligue 1","#d9c933","soccer_france_ligue_one","fra.1",61,9],["Bundesliga","#e5484d","soccer_germany_bundesliga","ger.1",78,10]];
var $=function(i){return document.getElementById(i)},N=8,D=[],F=-1,cur=null,ah=0,aa=0,ST={},L={},X=[],msgs=[],info="",Q="",SO="t",FV={};
/* базові ваги джерел; MXS/MXE — множники для матчів між різними лігами */
var DW={mk:.6,st:.25,af:.2,el:.12},MXS=.4,MXE=2.5,RHO=-.1,FW=.35,HL=21,HA=[],EL={};
function hal(i){return HA[i]||[1.1,.92]}
var S={k:{o:"",a:""},on:[1,1,1,1,1,1,1],w:Object.assign({},DW),cal:null};
try{var s0=JSON.parse(localStorage.getItem("md_s"));if(s0&&s0.k&&s0.on&&s0.on.length===7){S=s0;S.k.o=S.k.o||"";S.k.a=S.k.a||"";if(!S.w||!["mk","st","af","el"].every(function(k){return S.w[k]>=0}))S.w=Object.assign({},DW)}}catch(e){}
try{FV=JSON.parse(localStorage.getItem("md_fv"))||{}}catch(e){}
/* ---------- історія прогнозів ---------- */
var HS=[],V="m",HE="",FM={};
try{HS=JSON.parse(localStorage.getItem("md_hist"))||[]}catch(e){}
function hsv(){try{localStorage.setItem("md_hist",JSON.stringify(HS))}catch(e){}}
/* сторонні джерела прогнозів (букмекери, експерти): id виводиться з назви, щоб збігався між пристроями */
var SRC=[];try{SRC=JSON.parse(localStorage.getItem("md_src"))||[]}catch(e){}
function ssv(){try{localStorage.setItem("md_src",JSON.stringify(SRC))}catch(e){}}
function sid(n){return"s_"+n.toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/g,"-")}
function srcName(id){var s=SRC.filter(function(x){return x.id===id})[0];return s?s.name:id}
function syncSrc(){var ch=0;HS.forEach(function(x){if(x.x)Object.keys(x.x).forEach(function(k){if(!SRC.some(function(s){return s.id===k})){SRC.push({id:k,name:x.x[k].n||k});ch=1}})});if(ch)ssv()}
function addSrc(){var n=(prompt("Назва джерела (букмекер, експерт, сайт):")||"").trim().slice(0,30);if(!n)return null;var id=sid(n),f=SRC.filter(function(s){return s.id===id})[0];if(f)return f;f={id:id,name:n};SRC.push(f);ssv();return f}
function delSrc(id){if(!confirm("Видалити джерело «"+srcName(id)+"» і всі його прогнози? Дію не можна скасувати."))return;SRC=SRC.filter(function(s){return s.id!==id});HS.forEach(function(x){if(x.x){delete x.x[id];if(!Object.keys(x.x).length)delete x.x}});ssv();hsv();stats()}
function hfind(m){var t=m.t.getTime(),k=nm(m.H)+"|"+nm(m.A);return HS.filter(function(x){return nm(x.H)+"|"+nm(x.A)===k&&Math.abs(new Date(x.t)-t)<4*864e5})[0]}
function cpOf(m){var c={};(m.sg||[]).forEach(function(s){c[s[3]]=s[1].map(function(x){return Math.round(x*1e3)/1e3})});return c}
function record(){var now=Date.now(),ch=0;
 D.forEach(function(m){if(m.t.getTime()<=now)return;var e=hfind(m);if(e&&(e.res||new Date(e.t).getTime()<=now))return;
  var v=view(m,0,0),r=v.r,k=v.k,n={lg:m.lg,t:m.t.toISOString(),H:m.H,A:m.A,s:[k.s[1],k.s[2]],o:k.s[1]>k.s[2]?0:k.s[1]===k.s[2]?1:2,p:k.p,ph:r.h,pd:r.d,pa:r.a,ov:r.o,bt:r.b,mk:!!m.mk,mx:m.mx?1:0,cp:cpOf(m),res:null};
  if(e){if(e.u!==undefined)n.u=e.u;if(e.x)n.x=e.x;HS.splice(HS.indexOf(e),1)}HS.push(n);ch=1});
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
/* ---------- якість ймовірностей, графіки, сторонні джерела ---------- */
function f3(x){return x.toFixed(3).replace(".",",")}
function pv(x){return typeof x.ph==="number"&&typeof x.pd==="number"&&typeof x.pa==="number"?[x.ph,x.pd,x.pa]:null}
function ms(p,y){var b=0,i;for(i=0;i<3;i++)b+=Math.pow(p[i]-(i===y?1:0),2);return[b,-Math.log(Math.max(p[y],.001))]}
function agg(a){var b=0,l=0;a.forEach(function(z){var m=ms(z[0],z[1]);b+=m[0];l+=m[1]});return a.length?{n:a.length,b:b/a.length,l:l/a.length}:null}
function mpy(R){return R.filter(pv).map(function(x){return[pv(x),r1(x)]})}
function fd(d){return("0"+d.getDate()).slice(-2)+"."+("0"+(d.getMonth()+1)).slice(-2)}
function qualH(R){var A=agg(mpy(R));if(!A)return"";var sk=Math.round((1-A.b/(2/3))*100);
 return'<h3>Якість ймовірностей</h3><div class="tiles"><div class="tile"><b class="disp">'+f3(A.b)+'</b><span>Brier</span></div><div class="tile"><b class="disp">'+f3(A.l)+'</b><span>log loss</span></div><div class="tile"><b class="disp">'+(sk<0?"−":"+")+Math.abs(sk)+'%</b><span>'+(sk<0?"гірше":"краще")+' за рівні шанси</span></div></div>'+
 '<div class="box" style="margin-top:8px"><div>Brier і log loss оцінюють самі ймовірності, а не лише «вгадав/не вгадав»: упевнена помилка карається сильніше за обережну. <b>Чим менше, тим краще.</b> Прогноз «33/33/33» завжди дає Brier 0,667 і log loss 1,099; для футбольних моделей добрим рівнем зазвичай вважають Brier близько 0,57–0,60 і log loss близько 0,95–1,00.</div>'+(A.n<30?'<div class="err">Лише '+A.n+' матчів: на такій вибірці метрики дуже шумні, дивіться на них, коли збереться хоча б 30.</div>':"")+"</div>"}
function weeks(A){var m={},ks=[];A.forEach(function(x){var d=new Date(x.t),k=new Date(d.getFullYear(),d.getMonth(),d.getDate()-(d.getDay()+6)%7).getTime();if(!m[k]){m[k]={t:k,a:[]};ks.push(k)}m[k].a.push(x)});ks.sort(function(a,b){return a-b});
 return ks.map(function(k){var a=m[k].a,h=a.filter(function(x){return x.o===r1(x)}).length,e=a.reduce(function(s,x){return s+x.p},0)/a.length;return{t:k,n:a.length,acc:h/a.length,ex:e,q:agg(mpy(a))}})}
function chartsH(R){var A=R.slice().reverse(),n=A.length;
 if(n<3)return'<h3>Точність у часі</h3><div class="box"><div>Графіки з’являться, коли буде хоча б 3 завершені матчі.</div></div>';
 var W=340,H=172,l=34,r=8,t=10,b=24,cw=W-l-r,ch=H-t-b,X=function(i){return l+i/(n-1)*cw},Y=function(v){return t+(1-v)*ch},K=15,hit=0,ex=0,ca=[],ce=[],hs=[],ro=[],sm=0;
 A.forEach(function(x,i){var y=x.o===r1(x)?1:0;hit+=y;ex+=x.p;ca.push(hit/(i+1));ce.push(ex/(i+1));hs.push(y)});
 hs.forEach(function(y,i){sm+=y;if(i>=K)sm-=hs[i-K];ro.push(i>=K-1?sm/K:undefined)});
 var s0=Math.min(4,n-2),path=function(a,from){var d="",i;for(i=from;i<n;i++)if(a[i]!==undefined)d+=(d?"L":"M")+X(i).toFixed(1)+" "+Y(a[i]).toFixed(1);return d};
 var g=[0,.25,.5,.75,1].map(function(v){return'<line class="gl" x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text x="'+(l-5)+'" y="'+(Y(v)+3)+'" text-anchor="end">'+Math.round(v*100)+"%</text>"}).join("");
 var dd=function(x){return x.toLocaleDateString("uk-UA",{day:"numeric",month:"short"})};
 var h='<h3>Точність у часі</h3><div class="box"><svg class="chart" viewBox="0 0 '+W+" "+H+'" role="img" aria-label="Графік накопиченої точності прогнозів у часі">'+g+
  '<path d="'+path(ce,s0)+'" fill="none" stroke="var(--gold)" stroke-width="1.8" stroke-dasharray="4 3"/>'+
  (n>K?'<path d="'+path(ro,0)+'" fill="none" stroke="var(--ink)" stroke-opacity=".55" stroke-width="1.4" stroke-linejoin="round"/>':"")+
  '<path d="'+path(ca,s0)+'" fill="none" stroke="var(--h)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>'+
  '<text x="'+l+'" y="'+(H-6)+'">'+dd(new Date(A[0].t))+'</text><text x="'+(W-r)+'" y="'+(H-6)+'" text-anchor="end">'+dd(new Date(A[n-1].t))+'</text><text x="'+(l+cw/2)+'" y="'+(H-6)+'" text-anchor="middle">'+n+" матчів</text></svg>"+
  '<div class="leg"><span><i style="background:var(--h)"></i>Фактична точність (накопичена)</span><span><i style="background:var(--gold)"></i>Очікувана моделлю</span>'+(n>K?'<span><i style="background:var(--ink);opacity:.55"></i>Останні '+K+" матчів</span>":"")+'</div><div>Якщо зелена лінія тримається біля золотої, модель чесно оцінює свою впевненість. Перші матчі дають різкі стрибки, бо вибірка мала.</div></div>';
 var wk=weeks(A),WS=wk.slice(-12),S12=12,slot=cw/S12,bw=slot*.62,bt=14,bb=32,ch2=170-bt-bb,Y2=function(v){return bt+(1-v)*ch2};
 var bars=WS.map(function(w,i){var x=l+i*slot+(slot-bw)/2,y=Y2(w.acc);
  return'<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,bt+ch2-y).toFixed(1)+'" rx="2" fill="var(--h)" opacity="'+(w.n<5?".4":"1")+'"/>'+
  '<line x1="'+x.toFixed(1)+'" x2="'+(x+bw).toFixed(1)+'" y1="'+Y2(w.ex).toFixed(1)+'" y2="'+Y2(w.ex).toFixed(1)+'" stroke="var(--gold)" stroke-width="2.2"/>'+
  '<text x="'+(x+bw/2).toFixed(1)+'" y="'+(y-3).toFixed(1)+'" text-anchor="middle" style="font-size:9px">'+Math.round(w.acc*100)+'</text>'+
  '<text x="'+(x+bw/2).toFixed(1)+'" y="'+(170-18)+'" text-anchor="middle" style="font-size:8.5px">'+fd(new Date(w.t))+'</text><text x="'+(x+bw/2).toFixed(1)+'" y="'+(170-6)+'" text-anchor="middle" style="font-size:9px">n='+w.n+"</text>"}).join("");
 var wg=[0,.5,1].map(function(v){return'<line class="gl" x1="'+l+'" x2="'+(W-r)+'" y1="'+Y2(v)+'" y2="'+Y2(v)+'"/><text x="'+(l-5)+'" y="'+(Y2(v)+3)+'" text-anchor="end">'+Math.round(v*100)+"%</text>"}).join("");
 h+='<h3>Точність по тижнях</h3><div class="box"><svg class="chart" viewBox="0 0 '+W+' 170" role="img" aria-label="Точність прогнозів по тижнях">'+wg+bars+'</svg><div class="leg"><span><i style="background:var(--h)"></i>Вгадано за тиждень, % (під стовпцем: понеділок тижня й кількість матчів)</span><span><i style="background:var(--gold)"></i>Очікувано моделлю</span></div><div>Тижні, де менше 5 матчів, виділено блідим: на них результат здебільшого випадковий.</div></div>';
 h+='<div class="box tb" style="margin-top:8px"><div class="tr hd"><span>Тиждень</span><span>Матчів</span><span>Точність</span><span>Brier</span></div>'+wk.slice(-8).reverse().map(function(w){var e=new Date(w.t+6*864e5);return'<div class="tr"><b>'+fd(new Date(w.t))+"–"+fd(e)+"</b><span>"+w.n+"</span><b>"+Math.round(w.acc*100)+"%</b><span>"+(w.q?f3(w.q.b):"—")+"</span></div>"}).join("")+"</div>";
 return h}
function calH(R){var B=[0,.15,.3,.45,.6,.75,1.0001],bn=[0,0,0,0,0,0].map(function(){return{n:0,s:0,y:0}}),tot=0;
 R.forEach(function(x){var p=pv(x);if(!p)return;tot++;var w=r1(x),c,v,i,o;for(c=0;c<3;c++){v=p[c];i=0;while(i<5&&v>=B[i+1])i++;o=bn[i];o.n++;o.s+=v;o.y+=c===w?1:0}});
 if(tot<10)return"";
 var W=340,H=250,l=34,r=10,t=8,b=32,cw=W-l-r,ch=H-t-b,X=function(v){return l+v*cw},Y=function(v){return t+(1-v)*ch},pts=bn.filter(function(o){return o.n>=5}).map(function(o){return{x:o.s/o.n,y:o.y/o.n,n:o.n}});
 var g=[0,.25,.5,.75,1].map(function(v){return'<line class="gl" x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><line class="gl" y1="'+t+'" y2="'+(t+ch)+'" x1="'+X(v)+'" x2="'+X(v)+'"/><text x="'+(l-5)+'" y="'+(Y(v)+3)+'" text-anchor="end">'+Math.round(v*100)+'</text><text x="'+X(v)+'" y="'+(t+ch+13)+'" text-anchor="middle">'+Math.round(v*100)+"</text>"}).join("");
 return'<h3>Калібрування ймовірностей</h3><div class="box"><svg class="chart" viewBox="0 0 '+W+" "+H+'" role="img" aria-label="Калібрувальна діаграма: передбачена ймовірність і фактична частота">'+g+
  '<line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(1)+'" y2="'+Y(1)+'" stroke="var(--mute)" stroke-dasharray="4 3"/>'+
  (pts.length>1?'<path d="'+pts.map(function(o,i){return(i?"L":"M")+X(o.x).toFixed(1)+" "+Y(o.y).toFixed(1)}).join("")+'" fill="none" stroke="var(--gold)" stroke-width="1.6"/>':"")+
  pts.map(function(o){return'<circle cx="'+X(o.x).toFixed(1)+'" cy="'+Y(o.y).toFixed(1)+'" r="'+Math.min(9,3+Math.sqrt(o.n)/1.6).toFixed(1)+'" fill="var(--gold)" stroke="var(--bg)" stroke-width="1.5"/>'}).join("")+
  '<text x="'+(l+cw/2)+'" y="'+(H-3)+'" text-anchor="middle">ймовірність за моделлю, %</text><text x="9" y="'+(t+ch/2)+'" transform="rotate(-90 9 '+(t+ch/2)+')" text-anchor="middle">як часто справдилося, %</text></svg>'+
  '<div>Кожна точка — група прогнозів із близькою ймовірністю (враховано всі три результати кожного матчу; розмір точки — кількість, показано групи від 5). Точки на діагоналі означають, що «60%» справді збувається в 60% випадків. <b>Вище діагоналі</b> — модель занадто обережна, <b>нижче</b> — надто самовпевнена.</div></div>'}
function srcDefs(){var am=function(a){return a[0]>=a[1]&&a[0]>=a[2]?0:a[2]>=a[1]?2:1},cf=function(k){return function(x){var c=x.cp&&x.cp[k];return c?{p:c,o:am(c)}:null}};
 return[{n:"Ринок (букмекери)",g:cf("mk")},{n:"API-Football",g:cf("af")}].concat(SRC.map(function(s){return{n:s.name,id:s.id,g:function(x){var e=x.x&&x.x[s.id];return e?{p:e.p||null,o:e.o}:null}}}))}
function srcH(R){var rows="",any=0;
 srcDefs().forEach(function(d){var it=[];R.forEach(function(x){var g=d.g(x);if(g)it.push([x,g])});if(!it.length)return;any++;
  var sh=it.filter(function(z){return z[1].o===r1(z[0])}).length,mh=it.filter(function(z){return z[0].o===r1(z[0])}).length,pp=it.filter(function(z){return z[1].p&&pv(z[0])}),
   sa=agg(pp.map(function(z){return[z[1].p,r1(z[0])]})),ma=agg(pp.map(function(z){return[pv(z[0]),r1(z[0])]}));
  rows+='<div class="tr tr5"><b>'+esc(d.n)+"</b><span>"+it.length+"</span><b>"+pct(sh,it.length)+"</b><b>"+(sa?f3(sa.b):"—")+"</b><b>"+(sa?f3(sa.l):"—")+"</b></div>"+
   '<div class="tr tr5 sub"><span>↳ модель</span><span></span><span>'+pct(mh,it.length)+"</span><span>"+(ma?f3(ma.b):"—")+"</span><span>"+(ma?f3(ma.l):"—")+"</span></div>"+
   (sa&&pp.length<it.length?'<div class="tr sub"><span style="grid-column:1/-1">Brier і log loss — лише за '+pp.length+" з "+it.length+" матчів, де є коефіцієнти.</span></div>":"")});
 return'<h3>Порівняння зі сторонніми прогнозами</h3><div class="box">'+
  (any?'<div class="tb"><div class="tr tr5 hd"><span>Джерело</span><span>Матчів</span><span>Точність</span><span>Brier</span><span>Log loss</span></div>'+rows+"</div>":"<div>Поки немає завершених матчів зі сторонніми прогнозами.</div>")+
  "<div>Порівняння чесне: рахуються лише завершені матчі, де є прогноз джерела, а модель оцінюється на тих самих матчах («↳ модель»). Ринок і API-Football підтягуються автоматично (якщо задано ключі), інші джерела додаються вручну в картці матчу до початку гри. Різницю варто оцінювати від 30–50 спільних матчів.</div>"+
  '<div class="srcs">'+SRC.map(function(s){return"<span>"+esc(s.name)+' <button class="lnk" data-xd="'+esc(s.id)+'">видалити</button></span>'}).join("")+'<button class="btn" id="xa">+ Додати джерело</button></div></div>'}
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
  h+=qualH(R)+chartsH(R);
  var tr=[["Висока (від 60%)",function(x){return x.p>=.6}],["Середня (45–60%)",function(x){return x.p>=.45&&x.p<.6}],["Низька (до 45%)",function(x){return x.p<.45}]];
  h+='<h3>Чи можна довіряти впевненості моделі</h3><div class="box tb"><div class="tr hd"><span>Впевненість</span><span>Матчів</span><span>Обіцяла</span><span>Збулося</span></div>'+tr.map(function(t){var a=R.filter(t[1]);if(!a.length)return'<div class="tr"><b>'+t[0]+"</b><span>0</span><span>—</span><span>—</span></div>";var pr=a.reduce(function(s,x){return s+x.p},0)/a.length;return'<div class="tr"><b>'+t[0]+"</b><span>"+a.length+"</span><span>"+Math.round(pr*100)+"%</span><b>"+pct(cnt(a,hit),a.length)+"</b></div>"}).join("")+"</div>";
  h+=calH(R);
  var ls=LG.map(function(l,i){var a=R.filter(function(x){return x.lg===i});return a.length?'<div class="tr"><b>'+l[0]+"</b><span>"+a.length+"</span><span>"+cnt(a,hit)+"</span><b>"+pct(cnt(a,hit),a.length)+"</b></div>":""}).join("");
  if(ls)h+='<h3>За турнірами</h3><div class="box tb"><div class="tr hd"><span>Турнір</span><span>Матчів</span><span>Вгадано</span><span>%</span></div>'+ls+"</div>";
  var U=R.filter(function(x){return x.u!==undefined});
  if(U.length){var uh=cnt(U,function(x){return x.u===r1(x)});h+='<h3>Ви проти моделі</h3><div class="tiles"><div class="tile"><b class="disp">'+pct(uh,U.length)+'</b><span>ви ('+uh+"/"+U.length+')</span></div><div class="tile"><b class="disp">'+pct(cnt(U,hit),U.length)+'</b><span>модель</span></div><div class="tile"><b class="disp">'+U.length+"</b><span>спільних матчів</span></div></div>"}
  h+=srcH(R);
  h+='<h3>Історія</h3><div class="box" style="gap:0">'+R.slice(0,40).map(function(x){var y=hit(x);return'<div class="hrow"><span class="dot '+(y?"y":"n")+'">'+(y?"✓":"✕")+'</span><div class="tx"><b>'+esc(x.H)+" — "+esc(x.A)+"</b><small>"+dt(x)+" · прогноз "+x.s[0]+":"+x.s[1]+" · результат "+x.res[0]+":"+x.res[1]+(x.u!==undefined?" · ваш вибір "+(x.u===r1(x)?"✓":"✕"):"")+"</small></div></div>"}).join("")+"</div>"}
 if(P.length)h+='<h3>Очікують результату</h3><div class="box" style="gap:0">'+P.slice(0,12).map(function(x){return'<div class="hrow"><div class="tx"><b>'+esc(x.H)+" — "+esc(x.A)+"</b><small>"+dt(x)+" · прогноз "+x.s[0]+":"+x.s[1]+(x.u!==undefined?" · ваш вибір: "+["перемога господарів","нічия","перемога гостей"][x.u]:"")+"</small></div></div>"}).join("")+"</div>";
 if(HE)h+='<p class="note err">'+esc(HE)+"</p>";
 h+='<div class="acts"><button class="btn gold" id="hr">Оновити результати</button><button class="btn" id="hx">Експорт</button><button class="btn" id="hi2">Імпорт</button><button class="btn" id="hc">Очистити</button></div><input type="file" id="hf" accept="application/json" hidden><p class="note">Прогноз фіксується до початку матчу й надалі не змінюється. Дані зберігаються лише в цьому браузері, тож зробіть експорт, щоб не втратити історію. Рахунок береться з ESPN і може враховувати додатковий час.</p>';
 $("sv2").innerHTML=h}
var TT={m:["Прогнози на найближчі дні","МАТЧДЕЙ"],f:["Ваші збережені матчі","Обрані"],s:["Облік прогнозів","Статистика"],g:["Ключі, турніри й дані","Налаштування"]};
function setV(v){V=v;var mm=v==="m"||v==="f";Array.prototype.forEach.call($("nav").children,function(b){b.setAttribute("aria-pressed",b.dataset.v===v)});
 $("mv").hidden=!mm;$("sv2").hidden=v!=="s";$("gv").hidden=v!=="g";$("rf").hidden=!mm;$("barw").hidden=!mm;$("mn").hidden=v!=="m";$("so").parentNode.hidden=v==="f";$("tabs").hidden=v==="f";
 $("hp").textContent=TT[v][0];$("ht").textContent=TT[v][1];$("ht").style.fontSize=v==="m"?"":"42px";
 if(mm)list();else if(v==="s")stats();else settings();window.scrollTo(0,0)}
function sv(){try{localStorage.setItem("md_s",JSON.stringify(S))}catch(e){}}
function cg(k,ttl){try{var c=JSON.parse(localStorage.getItem(k));if(c&&Date.now()-c.t<ttl)return c.d}catch(e){}return null}
function cs(k,d){try{localStorage.setItem(k,JSON.stringify({t:Date.now(),d:d}))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ferr(e){return /fetch|network|load failed/i.test(e.message)?"немає зв’язку або браузер заблокував запит (CORS)":e.message}

/* ---------- математика ---------- */
function pa(l){var a=[],p=Math.exp(-l);a.push(p);for(var i=1;i<N;i++){p*=l/i;a.push(p)}return a}
var PA=[];for(var q=0;q<=90;q++)PA.push(pa(q*.05));
/* поправка Діксона-Коулса: коригує ймовірності рахунків 0:0, 1:0, 0:1, 1:1 */
function dct(i,j,lh,la){return i===0?(j===0?1-lh*la*RHO:1+lh*RHO):(j===0?1+la*RHO:1-RHO)}
function cell(x,y,full,lh,la){var h=0,d=0,a=0,o=0,b=0,g=[],i,j,p,dc=lh!==undefined;
 for(i=0;i<N;i++)for(j=0;j<N;j++){p=x[i]*y[j];if(dc&&i<2&&j<2)p*=dct(i,j,lh,la);if(i>j)h+=p;else if(i===j)d+=p;else a+=p;if(i+j>2)o+=p;if(i&&j)b+=p;if(full)g.push([p,i,j])}
 var t=h+d+a;if(full)g.forEach(function(c){c[0]/=t});return{h:h/t,d:d/t,a:a/t,o:o/t,b:b/t,g:g}}
function calc(lh,la,full){return cell(pa(lh),pa(la),full,lh,la)}
function fit(p){var best=9,bl=1.4,bm=1.1,i,j,r,e;
 for(i=4;i<=84;i++)for(j=4;j<=84;j++){r=cell(PA[i],PA[j],false,i*.05,j*.05);e=Math.pow(r.h-p[0],2)+Math.pow(r.d-p[1],2)+Math.pow(r.a-p[2],2);if(e<best){best=e;bl=i*.05;bm=j*.05}}
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

/* ---------- форма за давністю, перевага господарів по лігах, рейтинг Ело (ESPN, останні 8 тижнів) ---------- */
var LOFF={2:50,3:35,4:20,5:0,6:20};/* стартова поправка Ело за силою ліги; команди лише єврокубків: -70 */
function eloSeed(t){var g=Math.max(-2,Math.min(2,(t.gf-t.ga)/t.gp));return 1500+200*g+(t.c==="E"?-70:(LOFF[t.c]||0))}
function elo3(dr){var we=1/(1+Math.pow(10,-dr/400)),d=.05+.24*(1-Math.abs(2*we-1)),p=[Math.max(.01,we-d/2),d,Math.max(.01,1-we-d/2)],t=p[0]+p[1]+p[2];return p.map(function(x){return x/t})}
async function loadForm(){var c=cg("md_fm2",216e5);if(c){FM=c.F;HA=c.H;EL=c.E;return}
 var ms={},ids=[],day=864e5,now=Date.now(),ch=[[56,42],[41,28],[27,14],[13,0]],f8=function(t){return new Date(t).toISOString().slice(0,10).replace(/-/g,"")},bad=0,tot=0;
 LG.forEach(function(l,i){if(S.on[i])ids.push(i)});
 await Promise.all(ids.map(function(i){return Promise.all(ch.map(async function(r){tot++;
  try{(await sb(LG[i][3],f8(now-r[0]*day)+"-"+f8(now-r[1]*day))).forEach(function(e){var c=e.competitions&&e.competitions[0];if(!c||!(e.status&&e.status.type&&e.status.type.completed))return;
   var cp=c.competitors,s=cp.map(function(x){return parseInt(x.score,10)});if(cp.length!==2||isNaN(s[0])||isNaN(s[1]))return;
   var hi=cp[0].homeAway==="away"?1:0;
   ms[e.id]={t:e.date,lg:i,h:cp[hi].team.displayName,a:cp[1-hi].team.displayName,hs:s[hi],as:s[1-hi],nu:!!c.neutralSite}})}catch(e){bad++}}))}));
 var M=Object.keys(ms).map(function(k){return ms[k]}).sort(function(x,y){return new Date(x.t)-new Date(y.t)});
 /* форма: усі матчі вікна з вагою 0,5^(вік/21 день); останні 5 — для показу */
 var ev={};M.forEach(function(m){var t=new Date(m.t).getTime();
  [[m.h,m.hs,m.as],[m.a,m.as,m.hs]].forEach(function(z){var k=nm(z[0]);(ev[k]=ev[k]||[]).push({t:t,gf:z[1],ga:z[2]})})});
 var F2={};Object.keys(ev).forEach(function(k){var a=ev[k],l5=a.slice(-5),f={n:0,gf:0,ga:0,k:a.length,sgf:0,sga:0,r:l5.map(function(x){return x.gf>x.ga?"W":x.gf===x.ga?"D":"L"})};
  a.forEach(function(x){var w=Math.pow(.5,Math.max(0,now-x.t)/(HL*day));f.n+=w;f.gf+=w*x.gf;f.ga+=w*x.ga});
  l5.forEach(function(x){f.sgf+=x.gf;f.sga+=x.ga});F2[k]=f});
 /* перевага господарів: середнє голів господарів і гостей у лізі, зі стягненням до 1,10/0,92 */
 var H2=[],acc={};M.forEach(function(m){if(m.nu)return;var o=acc[m.lg]=acc[m.lg]||{n:0,h:0,a:0};o.n++;o.h+=m.hs;o.a+=m.as});
 Object.keys(acc).forEach(function(i){var o=acc[i],mu=(o.h+o.a)/(2*o.n),K=40;if(!(mu>0))return;H2[i]=[(o.h/o.n/mu*o.n+K*1.1)/(o.n+K),(o.a/o.n/mu*o.n+K*.92)/(o.n+K)]});
 /* Ело: старт від різниці м’ячів сезону, далі оновлення за матчами вікна */
 var E={};Object.keys(ST).forEach(function(k){E[k]=eloSeed(ST[k])});
 var gk=function(nme){var k=nm(nme);if(E[k]===undefined){var f=find(E,nme);E[k]=f!==null?f:1430}return k};
 M.forEach(function(m){var kh=gk(m.h),ka=gk(m.a),dr=E[kh]-E[ka]+(m.nu?0:60),we=1/(1+Math.pow(10,-dr/400)),res=m.hs>m.as?1:m.hs===m.as?.5:0,gd=Math.abs(m.hs-m.as),G=gd<=1?1:gd===2?1.5:(11+gd)/8,dl=14*G*(res-we);E[kh]+=dl;E[ka]-=dl});
 FM=F2;HA=H2;EL=E;if(bad&&bad===tot)msgs.push("ESPN форма команд: недоступна");if(Object.keys(F2).length)cs("md_fm2",{F:F2,H:H2,E:E})}
function ef(t,f){if(!f||f.k<2)return[t.att,t.def];return[(1-FW)*t.att+FW*(f.gf/t.g+3)/(f.n+3),(1-FW)*t.def+FW*(f.ga/t.g+3)/(f.n+3)]}

/* ---------- нагадування: файл календаря (.ics) ---------- */
function icsEsc(x){return String(x).replace(/[\\;,]/g,function(c){return"\\"+c}).replace(/\n/g,"\\n")}
function icsDt(d){return d.toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"")}
function icsDl(list){var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Matchday//UK","CALSCALE:GREGORIAN"];
 list.forEach(function(m){var k=view(m,0,0).k;
  L.push("BEGIN:VEVENT","UID:"+nm(m.H).replace(/ /g,"")+nm(m.A).replace(/ /g,"")+m.t.getTime()+"@matchday","DTSTAMP:"+icsDt(new Date()),"DTSTART:"+icsDt(m.t),"DURATION:PT2H",
   "SUMMARY:"+icsEsc("⚽ "+m.H+" — "+m.A),"DESCRIPTION:"+icsEsc(LG[m.lg][0]+". Прогноз "+k.s[1]+":"+k.s[2]+", "+k.txt+" ("+pc(k.p)+"%)"),
   "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+icsEsc(m.H+" — "+m.A+" за годину"),"TRIGGER:-PT60M","END:VALARM","END:VEVENT")});
 L.push("END:VCALENDAR");var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([L.join("\r\n")],{type:"text/calendar;charset=utf-8"}));a.download="matchday.ics";document.body.appendChild(a);a.click();a.remove()}

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
function recalc(m){var sg=[];m.dv=null;
 if(m.mk&&m.st){var bi=0,i;for(i=1;i<3;i++)if(Math.abs(m.st.p[i]-m.mk[i])>Math.abs(m.st.p[bi]-m.mk[bi]))bi=i;m.dv={i:bi,d:m.st.p[bi]-m.mk[bi]}}
 var w=S.w;
 if(m.mk)sg.push(["Ринок (коефіцієнти)",m.mk,w.mk,"mk"]);
 if(m.st)sg.push(["Статистика та форма (ESPN)",m.st.p,w.st*(m.mx?MXS:1),"st"]);
 if(m.af&&m.af.p)sg.push(["API-Football",m.af.p,w.af,"af"]);
 if(m.el)sg.push(["Рейтинг Ело",m.el,w.el*(m.mx?MXE:1),"el"]);
 var tw=0,f=[0,0,0];sg=sg.filter(function(s){return s[2]>0});sg.forEach(function(s){tw+=s[2];for(var i=0;i<3;i++)f[i]+=s[1][i]*s[2]});
 f=f.map(function(x){return x/tw});m.sg=sg;m.tw=tw;m.fin=f;var l=fit(f);m.l0=l[0];m.l1=l[1]}
function view(m,x,y){var f=m.af&&m.af.inj||[0,0],lh=m.l0*(1+.07*x)*Math.max(.8,1-.03*f[0]),la=m.l1*(1+.07*y)*Math.max(.8,1-.03*f[1]),r=calc(lh,la,true);return{r:r,k:pick(r,m.H,m.A),lh:lh,la:la}}

async function refresh(force){
 $("bar").textContent="Оновлюю дані…";msgs=[];
 try{
  if(force)try{localStorage.removeItem("md_es2");localStorage.removeItem("md_fm2")}catch(e){}
  await loadESPN();
  try{await loadForm()}catch(e){msgs.push("ESPN форма команд: "+ferr(e))}
  var o={m:[],rem:"—",errs:[]};
  if(S.k.o){try{o=await loadOdds(force);msgs=msgs.concat(o.errs)}catch(e){msgs.push("The Odds API: "+ferr(e))}}
  var all=o.m.slice(),lim=Date.now()-72e5;
  X.forEach(function(f){if(!all.some(function(m){return m.lg===f.lg&&same(m.H,f.H)&&same(m.A,f.A)}))all.push({id:"e"+f.lg+nm(f.H)+f.t.slice(0,10),lg:f.lg,t:f.t,H:f.H,A:f.A,mk:null})});
  D=all.filter(function(g){return S.on[g.lg]}).map(function(g){var m={id:g.id,lg:g.lg,t:new Date(g.t),H:g.H,A:g.A,mk:g.mk};
    var a=find(ST,m.H),b=find(ST,m.A);
    if(a&&b){var fa=find(FM,m.H),fb=find(FM,m.A),ea=ef(a,fa),eb=ef(b,fb),ha=hal(m.lg),r=calc(a.g*ea[0]*eb[1]*ha[0],b.g*eb[0]*ea[1]*ha[1]);m.mx=a.c!==b.c;m.st={p:[r.h,r.d,r.a],x:[a,b]};m.fm=[fa&&fa.k>=2?fa:null,fb&&fb.k>=2?fb:null];
     var xa=find(EL,m.H),xb=find(EL,m.A);if(xa&&xb){m.ev=[Math.round(xa),Math.round(xb)];m.el=elo3(xa-xb+60)}}
    if(!m.mk&&!m.st)return null;
    m.af=cg("md_af"+m.id,216e5)||undefined;recalc(m);return m})
   .filter(function(m){return m&&m.t.getTime()>lim}).sort(function(a,b){return a.t-b.t});
  info="Матчів: <b>"+D.length+"</b>"+(S.k.o?" · кредитів Odds API: <b>"+o.rem+"</b>":"")+" · команд зі статистикою: "+Object.keys(ST).length;
 }catch(e){D=[];info="";msgs.push(ferr(e))}
 if(!S.k.o)msgs.push("Додайте ключ The Odds API, щоб врахувати коефіцієнти (точніше).");
 $("bar").innerHTML=info+(msgs.length?' · <button class="lnk" id="wn">⚠ '+msgs.length+"</button>":"");
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
function tabs(){var h='<button class="tab" aria-pressed="'+(F===-1)+'" data-f="-1">Усі</button><button class="tab" aria-pressed="'+(F===-3)+'" data-f="-3">⚡ Розбіжності</button>';
 LG.forEach(function(l,i){if(S.on[i])h+='<button class="tab" aria-pressed="'+(F===i)+'" data-f="'+i+'">'+li(i)+l[0]+"</button>"});$("tabs").innerHTML=h}
function card(x){var v=x.v,r=v.r,fav=!!FV[fk(x)];
 return'<div class="m" role="button" tabindex="0" style="--c:'+LG[x.lg][1]+'" data-i="'+D.indexOf(x)+'"><div class="top"><i>'+li(x.lg)+LG[x.lg][0]+"</i><span>"+(x.mk?"":"лише статистика · ")+(SO==="t"?"":dlabel(x.t)[0]+", ")+hm(x.t)+'<button class="st" data-k="'+esc(fk(x))+'" aria-pressed="'+fav+'" aria-label="В обрані">★</button></span></div>'+
 '<div class="tt"><div class="t">'+bd(x.H)+"<span>"+esc(x.H)+'</span></div><div class="sc disp">'+v.k.s[1]+":"+v.k.s[2]+'</div><div class="t r">'+bd(x.A)+"<span>"+esc(x.A)+"</span></div></div>"+
 '<div class="rb"><b class="h" style="flex:'+r.h+'"></b><b class="d" style="flex:'+r.d+'"></b><b class="a" style="flex:'+r.a+'"></b></div>'+
 '<div class="pk"><b>'+esc(v.k.txt)+"</b> · "+pc(v.k.p)+"%"+(x.dv&&Math.abs(x.dv.d)>=.1?'<span class="dvb">⚡ '+(x.dv.d>0?"+":"−")+Math.round(Math.abs(x.dv.d)*100)+" п.п. до ринку</span>":"")+"</div></div>"}
function list(){var FF=V==="f"?-2:F,q=FF===-2?"":Q.trim().toLowerCase(),L2=D.filter(function(x){return(FF===-1||(FF===-2?FV[fk(x)]:FF===-3?(x.dv&&Math.abs(x.dv.d)>=.1):x.lg===FF))&&(!q||(x.H+" "+x.A).toLowerCase().indexOf(q)>=0)});
 L2.forEach(function(x){x.v=view(x,0,0)});
 if(!L2.length){$("list").innerHTML='<p class="empty">'+(FF===-2?"Позначте матчі зірочкою ★, і вони з’являться тут.":FF===-3?"Зараз немає матчів, де статистика розходиться з ринком більш ніж на 10 п.п. Для цієї вкладки потрібен ключ The Odds API.":q?"Нічого не знайдено.":"Матчів не знайдено. Спробуйте «Оновити» або перевірте повідомлення про помилки в розділі «Ще».")+"</p>";return}
 var h="";
 if(SO==="t"){var cd="";L2.forEach(function(x){var k=x.t.toDateString();if(k!==cd){cd=k;var d=dlabel(x.t);h+='<div class="day">'+d[0]+(d[1]?"<span>"+d[1]+"</span>":"")+"</div>"}h+=card(x)})}
 else{L2.slice().sort(function(a,b){return SO==="c"?b.v.k.p-a.v.k.p:(b.v.lh+b.v.la)-(a.v.lh+a.v.la)}).forEach(function(x){h+=card(x)})}
 if(FF===-2){var up2=L2.filter(function(x){return x.t.getTime()>Date.now()}).length;if(up2)h='<div class="acts" style="margin:8px 2px"><button class="btn gold" id="favcal">Нагадування в календар ('+up2+")</button></div>"+h}
 $("list").innerHTML=h}
function sheet(h){$("det").innerHTML=h;$("sh").classList.add("on");$("sh").scrollTop=0}
function hide(){$("sh").classList.remove("on");cur=null}
function close(){if(history.state&&history.state.d)history.back();else hide()}
window.addEventListener("popstate",hide);
function sl(v){return["без ключових гравців","є втрати","склад стандартний","сильний склад","повний комплект"][v+2]}
async function open(i){try{history.pushState({d:1},"")}catch(e){}cur=D[i];ah=0;aa=0;draw(true);var m=cur;
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
 '<div class="acts"><button class="btn gold" id="sim1">Зіграти матч</button><button class="btn" id="sim100">Зіграти 100 разів</button><button class="btn" id="shr">Поділитися</button>'+(m.t.getTime()>Date.now()?'<button class="btn" id="cal">У календар</button>':"")+'</div><p class="note" id="sr"></p>'}
function xst(z){return z&&z.p?"Ймовірності: 1 — "+pc(z.p[0])+"%, X — "+pc(z.p[1])+"%, 2 — "+pc(z.p[2])+"%":""}
function xh(e){var h='<h3>Сторонні прогнози</h3><div class="box">';
 if(!SRC.length)h+="<div>Додайте джерело (букмекера, експерта, сайт) і вносьте його прогноз до початку матчу. Порівняння з моделлю буде у вкладці «Статистика».</div>";
 SRC.forEach(function(s){var z=e.x&&e.x[s.id]||{},k=z.k||[];
  h+='<div class="xs" data-xs="'+esc(s.id)+'"><b>'+esc(s.name)+'</b><div class="pick3">'+["1","X","2"].map(function(t,i){return'<button data-xo="'+i+'" aria-pressed="'+(z.o===i&&!z.p)+'">'+t+"</button>"}).join("")+'</div><div class="odds3">'+[0,1,2].map(function(i){return'<input type="text" inputmode="decimal" class="od" data-xi="'+i+'" placeholder="кеф. '+["1","X","2"][i]+'" value="'+(k[i]||"")+'" aria-label="Коефіцієнт '+esc(s.name)+", "+["перемога господарів","нічия","перемога гостей"][i]+'">'}).join("")+'</div><small class="xh">'+xst(z)+"</small></div>"});
 return h+'<div><button class="btn" id="xa">+ Додати джерело</button></div><div class="note" style="margin:0">Оберіть результат (1 — господарі, X — нічия, 2 — гості) або введіть три коефіцієнти: тоді рахуватимуться Brier і log loss. Маржа букмекера прибирається автоматично.</div></div>'}
function draw(anim){var m=cur;if(!m)return;var a=m.af,e0=hfind(m),up=e0&&m.t.getTime()>Date.now()?'<h3>Ваш прогноз</h3><div class="pick3">'+[m.H,"Нічия",m.A].map(function(t,i){return'<button data-u="'+i+'" aria-pressed="'+(e0.u===i)+'">'+esc(t)+"</button>"}).join("")+'</div><p class="note">Ваші вгадування порівняються з моделлю у вкладці «Статистика».</p>':"",nmx=["Перемога: "+m.H,"Нічия","Перемога: "+m.A],dvh="",fmh="",xb=e0&&m.t.getTime()>Date.now()?'<div id="xb">'+xh(e0)+"</div>":"";
 if(m.dv){dvh='<h3>Модель проти ринку</h3><div class="box"><div class="tb"><div class="tr hd"><span>Результат</span><span>Різн.</span><span>Ринок</span><span>Статистика</span></div>'+[0,1,2].map(function(i){var d=m.st.p[i]-m.mk[i],b=i===m.dv.i&&Math.abs(d)>=.1;return'<div class="tr"><'+(b?"b":"span")+">"+esc(nmx[i])+"</"+(b?"b":"span")+"><span>"+(d>0?"+":d<0?"−":"")+Math.round(Math.abs(d)*100)+'</span><span>'+pc(m.mk[i])+"%</span><span>"+pc(m.st.p[i])+"%</span></div>"}).join("")+"</div><div>"+(Math.abs(m.dv.d)>=.1?"Найбільша розбіжність: <b>"+esc(nmx[m.dv.i])+"</b>. ":"Ринок і статистика майже збігаються. ")+"Ринок знає про склад, травми й мотивацію, чого не бачить статистика, тому розбіжність — привід перевірити новини, а не готовий сигнал.</div></div>"}
 if(m.fm&&(m.fm[0]||m.fm[1])){var fl=function(n,f){if(!f)return"<div><b>"+esc(n)+"</b><small> немає даних</small></div>";return'<div class="fm"><b>'+esc(n)+'</b><div class="dots">'+f.r.map(function(z){return'<span class="dot '+(z==="W"?"y":z==="L"?"n":"d")+'">'+(z==="W"?"П":z==="L"?"Пр":"Н")+"</span>"}).join("")+"<small>голи "+f.sgf+":"+f.sga+"</small></div></div>"};
  fmh='<h3>Форма: останні матчі</h3><div class="box">'+fl(m.H,m.fm[0])+fl(m.A,m.fm[1])+'<div>П — перемога, Н — нічия, Пр — поразка (від старіших до новіших). Форма враховується в статистичній частині з вагою 35%: свіжіші матчі важать більше (вага зменшується вдвічі кожні 3 тижні).</div></div>'}
 var rows=m.sg.map(function(s){return'<div class="row"><b>'+s[0]+"</b><span>"+pc(s[2]/m.tw)+"%</span><span>"+s[1].map(function(x){return pc(x)}).join(" / ")+"</span></div>"}).join("");
 var st=m.st?"Голів за гру (забиті/пропущені): "+esc(m.H)+" "+(m.st.x[0].gf/m.st.x[0].gp).toFixed(2)+"/"+(m.st.x[0].ga/m.st.x[0].gp).toFixed(2)+", "+esc(m.A)+" "+(m.st.x[1].gf/m.st.x[1].gp).toFixed(2)+"/"+(m.st.x[1].ga/m.st.x[1].gp).toFixed(2):"Статистику не знайдено для однієї з команд.";
 var af=!S.k.a?"Додайте ключ API-Football, щоб бачити прогноз сервісу й травми.":a?(a.adv?"Порада сервісу: <b>"+esc(a.adv)+"</b><br>":"")+"Травми: "+esc(m.H)+" — "+(a.inj[0]?a.names[0].map(esc).join(", "):"немає даних")+"; "+esc(m.A)+" — "+(a.inj[1]?a.names[1].map(esc).join(", "):"немає даних"):esc(m.afs||"Завантаження…");
 sheet('<button class="btn" id="cl">Закрити</button><div class="meta" style="--c:'+LG[m.lg][1]+'"><i>'+li(m.lg)+LG[m.lg][0]+"</i> · "+dlabel(m.t)[0]+", "+hm(m.t)+"</div>"+
 '<div class="vs"><div class="t">'+bd(m.H)+"<span>"+esc(m.H)+'</span></div><div class="t">'+bd(m.A)+"<span>"+esc(m.A)+"</span></div></div><div id=\"dyn\"></div>"+
 '<h3>З яких джерел зібрано прогноз</h3><div class="box">'+rows+"<div>"+st+(m.ev?"<br>Рейтинг Ело: "+esc(m.H)+" "+m.ev[0]+", "+esc(m.A)+" "+m.ev[1]:"")+"</div><div>"+af+"</div></div>"+
 dvh+fmh+up+xb+'<h3>Ваші поправки до складу</h3><div class="box"><label>'+esc(m.H)+": <b id=\"la\">"+sl(ah)+'</b><input type="range" id="sa" min="-2" max="2" value="'+ah+'"></label><label>'+esc(m.A)+": <b id=\"lb\">"+sl(aa)+'</b><input type="range" id="sb" min="-2" max="2" value="'+aa+'"></label></div>'+
 '<p class="note">Ймовірності джерел: перемога господарів / нічия / перемога гостей. Модель Пуассона перетворює підсумок на очікувані голи, рахунок і тотали. Кожен «втрачений» гравець з API-Football знижує очікувані голи на 3%, повзунок змінює їх на 7% за крок.</p>');
 upd(anim)}
function samp(r){var u=Math.random(),s=0,i;for(i=0;i<r.g.length;i++){s+=r.g[i][0];if(u<=s)return r.g[i]}return r.g[0]}
$("det").onclick=function(e){var t=e.target,m=cur;if(t.closest("#cl")){close();return}if(!m)return;
 var xo=t.closest("[data-xo]");if(xo){var e2=hfind(m);if(!e2||m.t.getTime()<=Date.now())return;var id=xo.closest("[data-xs]").dataset.xs,o=+xo.dataset.xo,z=e2.x&&e2.x[id];e2.x=e2.x||{};
  if(z&&z.o===o&&!z.p)delete e2.x[id];else e2.x[id]={n:srcName(id),o:o};if(!Object.keys(e2.x).length)delete e2.x;hsv();$("xb").innerHTML=xh(e2);return}
 if(t.closest("#xa")){var e3=hfind(m);if(!e3||m.t.getTime()<=Date.now())return;if(addSrc())$("xb").innerHTML=xh(e3);return}
 var ub=t.closest("[data-u]");if(ub){var e1=hfind(m),i=+ub.dataset.u;if(!e1||m.t.getTime()<=Date.now())return;if(e1.u===i)delete e1.u;else e1.u=i;hsv();Array.prototype.forEach.call(ub.parentNode.children,function(b){b.setAttribute("aria-pressed",+b.dataset.u===e1.u)});return}
 var hc=t.closest(".hc");if(hc){var c=m.vr.r.g[+hc.dataset.i*N+ +hc.dataset.j];$("hi").innerHTML="Рахунок <b>"+c[1]+":"+c[2]+"</b>: "+(c[0]*100).toFixed(1)+"% (приблизно 1 шанс із "+Math.round(1/c[0])+")";return}
 if(t.closest("#cal")){icsDl([m]);return}
 if(t.closest("#sim1")){var s=samp(m.vr.r);$("sr").innerHTML='Симуляція: <b class="disp roll">'+s[1]+":"+s[2]+"</b>";return}
 if(t.closest("#sim100")){var w=[0,0,0],gh=0,ga=0,k;for(k=0;k<100;k++){var z=samp(m.vr.r);w[z[1]>z[2]?0:z[1]===z[2]?1:2]++;gh+=z[1];ga+=z[2]}
  $("sr").innerHTML="100 матчів: перемог господарів <b>"+w[0]+"</b>, нічиїх <b>"+w[1]+"</b>, перемог гостей <b>"+w[2]+"</b>. Середній рахунок "+(gh/100).toFixed(1)+" : "+(ga/100).toFixed(1)+".";return}
 if(t.closest("#shr")){var k2=m.vr.k,tx=m.H+" — "+m.A+": прогноз "+k2.s[1]+":"+k2.s[2]+", "+k2.txt+" ("+pc(k2.p)+"%)";
  if(navigator.share)navigator.share({text:tx}).catch(function(){});else if(navigator.clipboard){navigator.clipboard.writeText(tx);$("sr").textContent="Прогноз скопійовано."}}};
$("det").onchange=function(e){var t=e.target;if(!t.classList||!t.classList.contains("od"))return;var m=cur,e1=m&&hfind(m);if(!e1||m.t.getTime()<=Date.now())return;
 var row=t.closest("[data-xs]"),id=row.dataset.xs,st=row.querySelector(".xh"),k=[].map.call(row.querySelectorAll(".od"),function(i){return parseFloat(i.value.replace(",","."))});e1.x=e1.x||{};
 if(k.every(function(v){return v>1})){var v=k.map(function(z){return 1/z}),sm=v[0]+v[1]+v[2],p=v.map(function(z){return Math.round(z/sm*1e3)/1e3});e1.x[id]={n:srcName(id),o:p[0]>=p[1]&&p[0]>=p[2]?0:p[2]>=p[1]?2:1,p:p,k:k};st.textContent=xst(e1.x[id]);
  Array.prototype.forEach.call(row.querySelectorAll("[data-xo]"),function(b){b.setAttribute("aria-pressed","false")})}
 else if(k.every(isNaN)){delete e1.x[id];st.textContent=""}
 else{st.textContent=e1.x[id]&&e1.x[id].p?"Введіть усі три коефіцієнти більші за 1, інакше збережеться попередній прогноз.":"Введіть усі три коефіцієнти (кожен більший за 1).";return}
 if(!Object.keys(e1.x).length)delete e1.x;hsv()};
$("det").oninput=function(e){if(e.target.id==="sa"){ah=+e.target.value;$("la").textContent=sl(ah);upd(false)}else if(e.target.id==="sb"){aa=+e.target.value;$("lb").textContent=sl(aa);upd(false)}};

/* ---------- калібрування ваг на власній історії ---------- */
var CK=["mk","st","af","el"];
function mixLoss(R,w){var L=0;R.forEach(function(x){var p=[0,0,0],t=0;CK.forEach(function(k){var c=x.cp[k];if(!c)return;var q=w[k]*(x.mx?(k==="st"?MXS:k==="el"?MXE:1):1);if(!(q>0))return;t+=q;for(var i=0;i<3;i++)p[i]+=c[i]*q});
 L-=Math.log(t?Math.max(p[r1(x)]/t,.02):1/3)});return L/R.length}
function calCount(){return HS.filter(function(x){return x.res&&x.cp&&Object.keys(x.cp).length}).length}
function calib(){var R=HS.filter(function(x){return x.res&&x.cp&&Object.keys(x.cp).length}),n=R.length;if(n<100)return null;
 var G=[0,.1,.2,.3,.45,.6,.8,1],o={};CK.forEach(function(k){o[k]=R.filter(function(x){return x.cp[k]}).length<30?[DW[k]]:G});
 var l0=mixLoss(R,DW),best=l0,bw=Object.assign({},DW);
 o.mk.forEach(function(a){o.st.forEach(function(b){o.af.forEach(function(c){o.el.forEach(function(d){var w={mk:a,st:b,af:c,el:d},l=mixLoss(R,w);if(l<best-1e-6){best=l;bw=w}})})})});
 var fw={};CK.forEach(function(k){fw[k]=Math.round((.5*bw[k]+.5*DW[k])*1e3)/1e3});/* стягування до стандартних: захист від перепідгонки */
 var l1=mixLoss(R,fw);return{n:n,l0:l0,l1:l1,w:fw,ok:l1<l0-1e-4}}
function wsh(k){var t=CK.reduce(function(s,x){return s+S.w[x]},0);return Math.round(S.w[k]/t*100)+"%"}
function calBox(){var n=calCount(),c=S.cal,msg="";
 if(c)msg=c.ok?"Остання калібровка: "+c.n+" матчів, лог-втрата "+c.l0.toFixed(3)+" → "+c.l1.toFixed(3)+" (менше — краще). Ваги застосовано.":"Остання калібровка: "+c.n+" матчів, суттєвого покращення немає (лог-втрата "+c.l0.toFixed(3)+" → "+c.l1.toFixed(3)+"). Залишено стандартні ваги.";
 return'<h3>Калібрування ваг</h3><div class="box"><div>Матчів зі збереженими складовими прогнозу: <b>'+n+'</b> (потрібно від 100). Складові записуються лише для нових прогнозів, старі записи історії для цього не годяться.</div>'+
 '<div>Поточні базові ваги: ринок '+wsh("mk")+", статистика "+wsh("st")+", API-Football "+wsh("af")+", Ело "+wsh("el")+".</div>"+(msg?"<div>"+msg+"</div>":"")+
 '<div class="acts"><button class="btn gold" id="cb"'+(n<100?" disabled":"")+'>Підібрати ваги</button><button class="btn" id="cr">Стандартні ваги</button></div></div>'}
function applyW(w,c){S.w=Object.assign({},w);S.cal=c;sv();D.forEach(recalc);list()}
function settings(){cur=null;
 $("gv").innerHTML='<h3 style="margin-top:6px">Стан даних</h3><div class="box"><div>'+(info||"Дані ще не завантажено.")+"</div>"+(msgs.length?'<div class="err">'+msgs.map(esc).join("<br>")+"</div>":"<div>Помилок немає.</div>")+'<div><button class="btn" id="rf2">Оновити дані</button></div></div>'+
 '<h3>Ключі API</h3><div class="box">'+
 '<label>The Odds API (коефіцієнти: точніший прогноз)<input type="password" id="ko" autocomplete="off" value="'+esc(S.k.o)+'"></label>'+
 '<label>API-Football (прогноз сервісу та травми, за бажанням)<input type="password" id="ka" autocomplete="off" value="'+esc(S.k.a)+'"></label>'+
 "<div>Розклад, таблиці, форма й логотипи беруться з ESPN без ключа. Ключі зберігаються лише в цьому браузері.</div></div>"+
 '<h3>Турніри (кожен витрачає кредит Odds API)</h3><div class="box">'+LG.map(function(l,i){return'<label class="ck"><input type="checkbox" id="lg'+i+'"'+(S.on[i]?" checked":"")+">"+l[0]+"</label>"}).join("")+"</div>"+
 '<p style="margin-top:18px"><button class="btn gold" id="sv">Зберегти й оновити</button></p>'+
 '<h3>Як складається прогноз</h3><div class="box"><div><b>Ринок (базова вага '+wsh("mk")+')</b>: коефіцієнти букмекерів без маржі.</div><div><b>Статистика й форма ('+wsh("st")+', для матчів між різними лігами в 2,5 раза менше)</b>: голи сезону плюс форма за 8 тижнів, де свіжіші матчі важать більше. Модель Пуассона з поправкою Діксона-Коулса для низьких рахунків і окремою перевагою господарів для кожного турніру.</div><div><b>API-Football ('+wsh("af")+')</b>: прогноз сервісу, травми знижують очікувані голи.</div><div><b>Рейтинг Ело ('+wsh("el")+', для єврокубків у 2,5 раза більше)</b>: рахується в застосунку за матчами ESPN, стартові значення беруться з різниці м’ячів сезону.</div><div>Результат: найімовірніший рахунок, а також тотали та «обидві заб’ють».</div></div>'+calBox()+
 '<p class="note">Ключі: <a href="https://the-odds-api.com" target="_blank" rel="noopener">the-odds-api.com</a>, <a href="https://dashboard.api-football.com/register" target="_blank" rel="noopener">api-football.com</a>. Є безкоштовні плани.</p>';
 $("cb").onclick=function(){var r=calib();if(!r)return;applyW(r.ok?r.w:DW,{n:r.n,l0:r.l0,l1:r.l1,ok:r.ok});settings()};
 $("cr").onclick=function(){applyW(DW,null);settings()};
 $("rf2").onclick=function(){var r=doRefresh();if(r)r.then(function(){if(V==="g")settings()})};
 $("sv").onclick=function(){S.k={o:$("ko").value.trim(),a:$("ka").value.trim()};S.on=LG.map(function(l,i){return $("lg"+i).checked?1:0});
  if(F>=0&&!S.on[F])F=-1;sv();try{localStorage.removeItem("md_es2");localStorage.removeItem("md_fm2");localStorage.removeItem("md_od")}catch(e){}setV("m");refresh(false)}}

$("tabs").onclick=function(e){var b=e.target.closest(".tab");if(!b)return;F=+b.dataset.f;tabs();list()};
$("list").onclick=function(e){if(e.target.closest("#favcal")){icsDl(D.filter(function(x){return FV[fk(x)]&&x.t.getTime()>Date.now()}));return}var s=e.target.closest(".st");
 if(s){var k=s.dataset.k;if(FV[k])delete FV[k];else FV[k]=1;try{localStorage.setItem("md_fv",JSON.stringify(FV))}catch(x){}if(V==="f")list();else s.setAttribute("aria-pressed",!!FV[k]);return}
 var b=e.target.closest(".m");if(b)open(+b.dataset.i)};
$("list").onkeydown=function(e){if((e.key==="Enter"||e.key===" ")&&e.target.classList.contains("m")){e.preventDefault();open(+e.target.dataset.i)}};
$("q").oninput=function(){Q=this.value;list()};
$("so").onclick=function(e){var b=e.target.closest("button");if(!b)return;SO=b.dataset.s;Array.prototype.forEach.call($("so").children,function(x){x.setAttribute("aria-pressed",x===b)});list()};
function doRefresh(){if(!S.k.o||confirm("Оновлення витратить кредити The Odds API (близько одного на кожен увімкнений турнір). Продовжити?"))return refresh(true)}
$("rf").onclick=doRefresh;
$("bar").onclick=function(e){if(e.target.id==="wn")setV("g")};
document.onkeydown=function(e){if(e.key==="Escape")close()};
$("nav").onclick=function(e){var b=e.target.closest("button");if(!b)return;if($("sh").classList.contains("on"))hide();setV(b.dataset.v)};
$("sv2").onclick=function(e){var t=e.target;
 if(t.id==="hr"){t.textContent="Перевіряю…";resolveHS().then(function(){stats()});return}
 if(t.id==="xa"){if(addSrc())stats();return}
 var xd=t.closest("[data-xd]");if(xd){delSrc(xd.dataset.xd);return}
 if(t.id==="hx"){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(HS)],{type:"application/json"}));a.download="matchday-history.json";document.body.appendChild(a);a.click();a.remove();return}
 if(t.id==="hi2"){$("hf").click();return}
 if(t.id==="hc"){if(confirm("Видалити всю історію прогнозів? Дію не можна скасувати.")){HS=[];hsv();stats()}}};
$("sv2").onchange=function(e){if(e.target.id!=="hf"||!e.target.files[0])return;var fr=new FileReader();fr.onload=function(){try{var a=JSON.parse(fr.result);if(!Array.isArray(a))throw 0;var add=0,mg=0;a.forEach(function(x){if(!(x&&x.H&&x.A&&x.t&&x.s))return;var y=HS.filter(function(y){return nm(y.H)===nm(x.H)&&nm(y.A)===nm(x.A)&&Math.abs(new Date(y.t)-new Date(x.t))<2*864e5})[0];
  if(!y){HS.push(x);add++}else if(x.x){y.x=y.x||{};Object.keys(x.x).forEach(function(k){if(!y.x[k]){y.x[k]=x.x[k];mg++}})}});syncSrc();hsv();stats();alert("Додано прогнозів: "+add+(mg?", сторонніх прогнозів до наявних матчів: "+mg:""))}catch(er){alert("Не вдалося прочитати файл.")}};fr.readAsText(e.target.files[0])};
syncSrc();tabs();list();refresh(false);
