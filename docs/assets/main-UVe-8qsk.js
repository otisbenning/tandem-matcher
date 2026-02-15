(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(i){if(i.ep)return;i.ep=!0;const a=s(i);fetch(i.href,a)}})();const F={PROFILES:"swaf_profiles",TANDEMS:"swaf_tandems",GAMIFICATION:"swaf_gamification_stats",PLZ_CACHE:"swaf_plz_cache",SETTINGS:"swaf_settings"};let $=[],T=[],O=bt(),Y=new Map;function bt(){return{totalMatches:0,todayMatches:0,lastMatchDate:"",streak:0,qualityScores:[],achievements:[],totalPoints:0}}async function zt(){try{const e=localStorage.getItem(F.PROFILES);e&&($=JSON.parse(e));const t=localStorage.getItem(F.TANDEMS);t&&(T=JSON.parse(t));const s=localStorage.getItem(F.GAMIFICATION);s&&(O={...bt(),...JSON.parse(s)});const n=localStorage.getItem(F.PLZ_CACHE);if(n){const i=JSON.parse(n);Y=new Map(Object.entries(i))}console.log(`Storage initialized: ${$.length} profiles, ${T.length} tandems`)}catch(e){console.error("Error loading storage:",e)}}function U(){return[...$]}function be(e){return $.find(t=>t.id===e)}function Pt(e){const t=new Set($.map(n=>n.id)),s=new Set($.map(n=>Ae(n.name)));for(const n of e){if(t.has(n.id))continue;const i=Ae(n.name);if(s.has(i)){const a=$.find(r=>Ae(r.name)===i);if(a){xt(a,n);continue}}$.push(n),t.add(n.id),s.add(i)}Ie()}function xt(e,t){const s=new Set(e.fields.map(n=>n.question));for(const n of t.fields)s.has(n.question)||e.fields.push(n);e.pageType="Merged",e.timestamp=Math.max(e.timestamp,t.timestamp)}function Ae(e){return e.toLowerCase().trim().replace(/\s+/g," ")}function Nt(e){$=$.filter(t=>t.id!==e),Ie()}function Bt(){$=[],Ie()}function Ie(){localStorage.setItem(F.PROFILES,JSON.stringify($)),window.dispatchEvent(new CustomEvent("profiles-updated"))}function Q(){return[...T]}function qt(e){T.push(e),Se(),O.totalMatches++,O.todayMatches++,O.lastMatchDate=new Date().toISOString().split("T")[0],O.qualityScores.push(e.matchScore),vt()}function wt(e){T=T.filter(t=>t.id!==e),Se()}function Dt(e,t){const s=T.findIndex(n=>n.id===e);s!==-1&&(T[s]={...T[s],...t},Se())}function ce(){const e=new Set;for(const t of T)e.add(t.profile1.id),e.add(t.profile2.id);return e}function re(e){return T.find(t=>t.profile1.id===e||t.profile2.id===e)}function Se(){localStorage.setItem(F.TANDEMS,JSON.stringify(T)),window.dispatchEvent(new CustomEvent("tandems-updated"))}function Rt(){return{...O}}function vt(){localStorage.setItem(F.GAMIFICATION,JSON.stringify(O))}function Ht(e){return Y.get(e)}function qe(e,t){Y.set(e,t);const s=Object.fromEntries(Y);localStorage.setItem(F.PLZ_CACHE,JSON.stringify(s))}function _t(e){if(!e.profiles||!Array.isArray(e.profiles))throw new Error("Ungültiges Datenformat");const t=$.length;return Pt(e.profiles),$.length-t}function Ft(){return JSON.stringify({profiles:$,tandems:T,gamificationStats:O,plzCache:Object.fromEntries(Y),exportedAt:new Date().toISOString(),version:"2.0"})}function Ot(e){const t=JSON.parse(e);t.profiles&&($=t.profiles),t.tandems&&(T=t.tandems),t.gamificationStats&&(O=t.gamificationStats),t.plzCache&&(Y=new Map(Object.entries(t.plzCache))),Ie(),Se(),vt(),localStorage.setItem(F.PLZ_CACHE,JSON.stringify(Object.fromEntries(Y)))}function Z(e){const t=e.fields.find(s=>s.question.toLowerCase().includes("plz")||s.question.toLowerCase().includes("postleitzahl"));if(t!=null&&t.answer){const s=t.answer.match(/\d{5}/);return s?s[0]:null}for(const s of e.fields){const n=s.answer.match(/\b\d{5}\b/);if(n)return n[0]}return null}function me(e){const t=[/newcomer/i,/geflüchtet/i,/migrant/i,/zugewandert/i,/immigrant/i,/einwander/i,/neuankommend/i,/geflohene?/i,/refugee/i,/asyl/i,/zuwander/i],s=[/\blocal\b/i,/einheimisch/i,/hier.*geboren/i,/alteingesessen/i,/ortsansässig/i],n=a=>t.some(r=>r.test(a)),i=a=>s.some(r=>r.test(a));if(e.pageType){if(n(e.pageType))return"newcomer";if(i(e.pageType))return"local"}if(e.name){if(n(e.name))return"newcomer";if(i(e.name))return"local"}if(e.url){if(n(e.url))return"newcomer";if(i(e.url))return"local"}for(const a of e.fields){const r=a.question.toLowerCase(),o=a.answer;if(r.includes("gruppe")||r.includes("status")||r.includes("wer bist")||r.includes("local")||r.includes("newcomer")||r.includes("herkunft")||r.includes("aufnahme")||r.includes("teilnehmer")){if(n(o))return"newcomer";if(i(o))return"local"}}for(const a of e.fields)if(n(a.answer))return"newcomer";return"local"}function le(e){const t=e.fields.find(n=>n.question.toLowerCase().includes("alter")&&!n.question.toLowerCase().includes("unterschied")&&!n.question.toLowerCase().includes("präferenz"));if(t!=null&&t.answer){const n=t.answer.match(/\d+/);if(n){const i=parseInt(n[0]);if(i>=16&&i<=100)return i}}const s=e.fields.find(n=>n.question.toLowerCase().includes("geboren")||n.question.toLowerCase().includes("geburtsjahr"));if(s!=null&&s.answer){const n=s.answer.match(/(19|20)\d{2}/);if(n){const i=parseInt(n[0]),r=new Date().getFullYear()-i;if(r>=16&&r<=100)return r}}return null}function we(e){const t=e.fields.find(s=>s.question.toLowerCase().includes("geschlecht")&&!s.question.toLowerCase().includes("präferenz")&&!s.question.toLowerCase().includes("partner"));if(t!=null&&t.answer){const s=t.answer.toLowerCase();if(s.includes("männlich")||s.includes("mann")||s==="m")return"male";if(s.includes("weiblich")||s.includes("frau")||s==="w"||s==="f")return"female";if(s.includes("divers")||s.includes("sonstig")||s.includes("andere"))return"other"}return null}const Gt={sport:["sport","fitness","training","gym","workout"],fussball:["fußball","fussball","soccer","kicken"],musik:["musik","music","konzert","singen","instrument"],lesen:["lesen","bücher","reading","books"],kochen:["kochen","cooking","backen","küche"],reisen:["reisen","travel","urlaub","reise"],kino:["kino","filme","movies","cinema","film"],gaming:["gaming","videospiele","spiele","zocken","games"],wandern:["wandern","hiking","spazieren","natur"],fotografie:["fotografie","photography","fotos","fotografieren"],kunst:["kunst","art","malen","zeichnen","museum"],tanzen:["tanzen","dance","dancing","tanz"],yoga:["yoga","meditation","entspannung"],schwimmen:["schwimmen","swimming","baden"],radfahren:["radfahren","fahrrad","cycling","bike","rad"],laufen:["laufen","joggen","running","jogging"],sprachen:["sprachen","languages","sprachkurs"],essen:["essen","food","kulinarik","restaurant"],feiern:["feiern","party","ausgehen","club","bar"],natur:["natur","nature","garten","pflanzen","outdoor"]};function et(e){const t=e.toLowerCase().trim();for(const[s,n]of Object.entries(Gt))if(n.some(i=>t.includes(i)))return s;return t.replace(/[^a-zäöüß]/gi,"")}const jt={"01":{lat:51.05,lng:13.74,city:"Dresden"},"02":{lat:51.15,lng:14.97,city:"Görlitz"},"03":{lat:51.76,lng:14.33,city:"Cottbus"},"04":{lat:51.34,lng:12.38,city:"Leipzig"},"05":{lat:51.22,lng:6.78,city:"Düsseldorf"},"06":{lat:51.48,lng:11.97,city:"Halle"},"07":{lat:50.93,lng:11.59,city:"Jena"},"08":{lat:50.72,lng:12.49,city:"Zwickau"},"09":{lat:50.83,lng:12.92,city:"Chemnitz"},10:{lat:52.52,lng:13.41,city:"Berlin Mitte"},11:{lat:52.52,lng:13.41,city:"Berlin"},12:{lat:52.45,lng:13.43,city:"Berlin Süd"},13:{lat:52.57,lng:13.35,city:"Berlin Nord"},14:{lat:52.39,lng:13.07,city:"Potsdam"},15:{lat:52.34,lng:14.55,city:"Frankfurt/Oder"},16:{lat:52.98,lng:13.79,city:"Oranienburg"},17:{lat:53.91,lng:13.38,city:"Greifswald"},18:{lat:54.09,lng:12.14,city:"Rostock"},19:{lat:53.63,lng:11.41,city:"Schwerin"},20:{lat:53.55,lng:10,city:"Hamburg"},21:{lat:53.47,lng:9.78,city:"Hamburg Süd"},22:{lat:53.6,lng:10.05,city:"Hamburg Nord"},23:{lat:53.87,lng:10.69,city:"Lübeck"},24:{lat:54.32,lng:10.14,city:"Kiel"},25:{lat:53.87,lng:9.09,city:"Itzehoe"},26:{lat:53.14,lng:8.22,city:"Oldenburg"},27:{lat:53.08,lng:8.81,city:"Bremen Nord"},28:{lat:53.08,lng:8.81,city:"Bremen"},29:{lat:52.97,lng:10.57,city:"Celle"},30:{lat:52.37,lng:9.74,city:"Hannover"},31:{lat:52.23,lng:9.52,city:"Hannover Süd"},32:{lat:52.02,lng:8.53,city:"Herford"},33:{lat:51.93,lng:8.38,city:"Bielefeld"},34:{lat:51.31,lng:9.5,city:"Kassel"},35:{lat:50.56,lng:8.67,city:"Gießen"},36:{lat:50.55,lng:9.68,city:"Fulda"},37:{lat:51.53,lng:9.93,city:"Göttingen"},38:{lat:52.27,lng:10.52,city:"Braunschweig"},39:{lat:52.13,lng:11.63,city:"Magdeburg"},40:{lat:51.23,lng:6.78,city:"Düsseldorf"},41:{lat:51.19,lng:6.44,city:"Mönchengladbach"},42:{lat:51.26,lng:7.15,city:"Wuppertal"},43:{lat:51.36,lng:7.35,city:"Hagen"},44:{lat:51.51,lng:7.47,city:"Dortmund"},45:{lat:51.45,lng:7.01,city:"Essen"},46:{lat:51.54,lng:6.77,city:"Oberhausen"},47:{lat:51.43,lng:6.76,city:"Duisburg"},48:{lat:51.96,lng:7.63,city:"Münster"},49:{lat:52.28,lng:8.05,city:"Osnabrück"},50:{lat:50.94,lng:6.96,city:"Köln"},51:{lat:50.99,lng:7.13,city:"Köln Ost"},52:{lat:50.78,lng:6.08,city:"Aachen"},53:{lat:50.73,lng:7.1,city:"Bonn"},54:{lat:49.75,lng:6.64,city:"Trier"},55:{lat:50,lng:8.27,city:"Mainz"},56:{lat:50.36,lng:7.6,city:"Koblenz"},57:{lat:50.87,lng:8.02,city:"Siegen"},58:{lat:51.36,lng:7.47,city:"Hagen"},59:{lat:51.66,lng:8.38,city:"Hamm"},60:{lat:50.11,lng:8.68,city:"Frankfurt"},61:{lat:50.22,lng:8.62,city:"Frankfurt Nord"},62:{lat:50.1,lng:8.77,city:"Bad Homburg"},63:{lat:50,lng:8.96,city:"Offenbach"},64:{lat:49.87,lng:8.65,city:"Darmstadt"},65:{lat:50.08,lng:8.24,city:"Wiesbaden"},66:{lat:49.24,lng:7,city:"Saarbrücken"},67:{lat:49.45,lng:8.44,city:"Ludwigshafen"},68:{lat:49.49,lng:8.47,city:"Mannheim"},69:{lat:49.41,lng:8.69,city:"Heidelberg"},70:{lat:48.78,lng:9.18,city:"Stuttgart"},71:{lat:48.73,lng:9.11,city:"Stuttgart Süd"},72:{lat:48.52,lng:9.05,city:"Tübingen"},73:{lat:48.8,lng:9.47,city:"Esslingen"},74:{lat:49.14,lng:9.22,city:"Heilbronn"},75:{lat:48.89,lng:8.69,city:"Pforzheim"},76:{lat:49.01,lng:8.4,city:"Karlsruhe"},77:{lat:48.47,lng:7.94,city:"Offenburg"},78:{lat:47.99,lng:8.52,city:"Villingen"},79:{lat:47.99,lng:7.85,city:"Freiburg"},80:{lat:48.14,lng:11.58,city:"München"},81:{lat:48.11,lng:11.6,city:"München Süd"},82:{lat:48.05,lng:11.47,city:"München West"},83:{lat:47.86,lng:11.97,city:"Rosenheim"},84:{lat:48.44,lng:12.12,city:"Landshut"},85:{lat:48.4,lng:11.74,city:"Freising"},86:{lat:48.37,lng:10.9,city:"Augsburg"},87:{lat:47.73,lng:10.31,city:"Kempten"},88:{lat:47.66,lng:9.48,city:"Friedrichshafen"},89:{lat:48.4,lng:10,city:"Ulm"},90:{lat:49.45,lng:11.08,city:"Nürnberg"},91:{lat:49.6,lng:11.01,city:"Erlangen"},92:{lat:49.02,lng:12.1,city:"Amberg"},93:{lat:49.02,lng:12.1,city:"Regensburg"},94:{lat:48.57,lng:13.45,city:"Passau"},95:{lat:50.06,lng:11.78,city:"Bayreuth"},96:{lat:50.1,lng:10.88,city:"Bamberg"},97:{lat:49.79,lng:9.95,city:"Würzburg"},98:{lat:50.68,lng:10.93,city:"Suhl"},99:{lat:50.98,lng:11.03,city:"Erfurt"}};function yt(e,t,s,n){const a=ge(s-e),r=ge(n-t),o=Math.sin(a/2)*Math.sin(a/2)+Math.cos(ge(e))*Math.cos(ge(s))*Math.sin(r/2)*Math.sin(r/2);return 6371*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}function ge(e){return e*(Math.PI/180)}let Me=0;const tt=1e3;async function X(e){var i;if(!e||e.length<2)return null;const t=e.replace(/\D/g,"").substring(0,5);if(t.length<5)return nt(t);const s=Ht(t);if(s)return s;const n=nt(t);if(n)return qe(t,n),n;try{const a=Date.now();a-Me<tt&&await new Promise(c=>setTimeout(c,tt-(a-Me))),Me=Date.now(),console.log(`🌐 Lade PLZ ${t} von OpenStreetMap...`);const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&country=DE&postalcode=${t}&limit=1`,{headers:{"User-Agent":"SwaF Tandem Matcher v2.0"}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const o=await r.json();if(o&&o.length>0){const c={lat:parseFloat(o[0].lat),lng:parseFloat(o[0].lon),city:((i=o[0].display_name)==null?void 0:i.split(",")[0])||void 0};return qe(t,c),console.log(`✅ PLZ ${t} gefunden:`,c),c}}catch(a){console.warn(`⚠️ Nominatim API Fehler für PLZ ${t}:`,a)}return null}function nt(e){const t=e.substring(0,2),s=jt[t];if(!s)return null;let n=0,i=0;if(e.length>=5){const r=parseInt(e.substring(2,5),10)||0,o=r*2.399963,c=.02+r%100*3e-4;n=c*Math.cos(o),i=c*Math.sin(o)*1.4}const a={lat:s.lat+n,lng:s.lng+i,city:s.city};return qe(e,a),a}async function Kt(e,t){if(e===t)return 0;const s=await X(e),n=await X(t);if(!(!s||!n))return yt(s.lat,s.lng,n.lat,n.lng)}const pe=new Map;async function Ut(e,t){if(!e||!t)return null;if(e===t)return{distanceKm:0,drivingMinutes:0,transitMinutes:0,cyclingMinutes:0,walkingMinutes:0};const s=`${e}-${t}`,n=pe.get(s);if(n)return n;const i=`${t}-${e}`,a=pe.get(i);if(a)return a;const r=await X(e),o=await X(t);if(!r||!o)return null;try{const f=`https://router.project-osrm.org/route/v1/driving/${r.lng},${r.lat};${o.lng},${o.lat}?overview=false`;console.log(`🚗 Berechne Entfernung ${e} → ${t}...`);const b=await fetch(f);if(!b.ok)throw new Error(`HTTP ${b.status}`);const E=await b.json();if(E.code==="Ok"&&E.routes&&E.routes.length>0){const M=E.routes[0],z=M.distance/1e3,J=Math.round(M.duration/60),ee=Math.round(J*1.8),te=Math.round(z*4),u=Math.round(z*12),m={distanceKm:Math.round(z*10)/10,drivingMinutes:J,transitMinutes:ee,cyclingMinutes:te,walkingMinutes:u};return pe.set(s,m),console.log(`✅ Entfernung: ${m.distanceKm} km`),m}}catch(f){console.warn("⚠️ OSRM API Fehler:",f)}const c=yt(r.lat,r.lng,o.lat,o.lng),d=Math.round(c*1.3*10)/10,h={distanceKm:d,drivingMinutes:Math.round(d*1.2),transitMinutes:Math.round(d*2.2),cyclingMinutes:Math.round(d*4),walkingMinutes:Math.round(d*12)};return pe.set(s,h),h}function Wt(e){if(e.distanceKm===0)return"Gleiche PLZ";const t=[];return t.push(`${e.distanceKm} km Entfernung`),e.drivingMinutes<=120&&t.push(`ca. ${$e(e.drivingMinutes)} mit Auto`),e.transitMinutes<=180&&t.push(`ca. ${$e(e.transitMinutes)} mit ÖPNV`),e.walkingMinutes<=45&&t.push(`ca. ${$e(e.walkingMinutes)} zu Fuß`),t.join(", ")}function $e(e){if(e<60)return`${e} min`;const t=Math.floor(e/60),s=e%60;return s===0?`${t} h`:`${t}:${s.toString().padStart(2,"0")} h`}function Vt(e,t){const s=`https://www.google.com/maps/dir/${e.lat},${e.lng}/${t.lat},${t.lng}`,n=`https://www.bvg.de/de/verbindungen/verbindungssuche?start=${e.lat},${e.lng}&destination=${t.lat},${t.lng}`;return{google:s,bvg:n,mvv:"https://www.mvv-muenchen.de/fahrplanauskunft/index.html#routing",hvv:"https://www.hvv.de/de/fahrplaene/abruf-fahrplaninfos/"}}let B=null,W=new Map,Ke=null;function Zt(){document.getElementById("map")&&(B=L.map("map").setView([51.1657,10.4515],6),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:18}).addTo(B),st(),window.addEventListener("profiles-updated",st),window.addEventListener("tandems-updated",Jt),window.addEventListener("profile-selected",t=>{en(t.detail.profileId)}),window.addEventListener("profile-deselected",()=>{tn()}))}function Jt(){const e=ce();W.forEach((t,s)=>{var i;const n=(i=t.getElement())==null?void 0:i.querySelector(".marker-icon");n&&(e.has(s)?n.classList.add("matched"):n.classList.remove("matched"))})}async function st(){if(!B)return;W.forEach(s=>s.remove()),W.clear();const e=U(),t=new Map;for(const s of e){const n=Z(s);n&&(t.has(n)||t.set(n,[]),t.get(n).push(s))}for(const[s,n]of t){const i=await X(s);if(!(!i||!isFinite(i.lat)||!isFinite(i.lng)))for(let a=0;a<n.length;a++){const r=n[a],o=Qt(a,n.length),c=i.lat+o.lat,l=i.lng+o.lng,d=Yt(r,c,l);d.addTo(B),W.set(r.id,d)}}}function Qt(e,t){if(t===1)return{lat:0,lng:0};const s=.002,n=.001*Math.floor(e/8),i=s+n,r=e*2.399963;return{lat:i*Math.cos(r),lng:i*Math.sin(r)*1.4}}function Yt(e,t,s){const n=me(e),i=e.name.split(" ").map(h=>h[0]).join("").substring(0,2).toUpperCase(),r=ce().has(e.id),o=r?"matched":"",c=L.divIcon({className:"marker-wrapper",html:`<div class="marker-icon ${n} ${o}" data-profile-id="${e.id}">${i}</div>`,iconSize:[30,30],iconAnchor:[15,15]}),l=L.marker([t,s],{icon:c}),d=Xt(e,n,r);return l.bindPopup(d,{maxWidth:300}),l.on("click",()=>{window.dispatchEvent(new CustomEvent("profile-clicked",{detail:{profileId:e.id}}))}),l}function Xt(e,t,s=!1){const n=le(e),i=Z(e),a=we(e),r=Ce(e,["hobby","hobbies","freizeit","interessen"]),o=Ce(e,["sprache","sprachen","language"]),c=Ce(e,["beruf","arbeit","job","tätigkeit","beschäftigung"]),l=a==="male"?"M":a==="female"?"W":a==="other"?"D":"",d=t==="local"?"Local":"Newcomer",h=t==="local"?"local":"newcomer";let f=`
    <div class="marker-popup">
      <div class="popup-header">
        <strong>${de(e.name)}</strong>
        <span class="group-badge ${h}">${d}</span>
        ${s?'<span class="matched-badge">✓ Vermittelt</span>':""}
      </div>
      <div class="popup-meta">
        ${n?`<span>${n} Jahre</span>`:""}
        ${l?`<span>${l}</span>`:""}
        ${i?`<span>PLZ ${i}</span>`:""}
      </div>
  `;if(s){const b=re(e.id);if(b){const E=b.profile1.id===e.id?b.profile2.name:b.profile1.name;f+=`<div class="popup-field tandem-info"><strong>Tandem mit:</strong> ${de(E)}</div>`}}return c&&(f+=`<div class="popup-field"><strong>Beruf:</strong> ${de(Te(c,50))}</div>`),o&&(f+=`<div class="popup-field"><strong>Sprachen:</strong> ${de(Te(o,80))}</div>`),r&&(f+=`<div class="popup-field"><strong>Interessen:</strong> ${de(Te(r,80))}</div>`),f+=`
      <div class="popup-action">
        ${s?"<em>Bereits vermittelt</em>":"<em>Klicken für Smart Match</em>"}
      </div>
    </div>
  `,f}function Te(e,t){return e.length<=t?e:e.substring(0,t-3)+"..."}function de(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Ce(e,t){for(const s of t){const n=new RegExp(s,"i"),i=e.fields.find(a=>n.test(a.question));if(i!=null&&i.answer)return i.answer}return null}function en(e){Ke=e,W.forEach((s,n)=>{var a;const i=(a=s.getElement())==null?void 0:a.querySelector(".marker-icon");i&&i.classList.toggle("selected",n===e)});const t=W.get(e);t&&B&&B.setView(t.getLatLng(),Math.max(B.getZoom(),10))}function tn(){Ke=null,W.forEach(e=>{var s;const t=(s=e.getElement())==null?void 0:s.querySelector(".marker-icon");t&&t.classList.remove("selected","compatible","incompatible","top-match")})}function nn(e,t,s){W.forEach((n,i)=>{var r;if(i===Ke)return;const a=(r=n.getElement())==null?void 0:r.querySelector(".marker-icon");a&&(a.classList.remove("compatible","incompatible","top-match"),s.includes(i)?a.classList.add("compatible","top-match"):e.includes(i)?a.classList.add("compatible"):t.includes(i)&&a.classList.add("incompatible"))})}function sn(){B&&setTimeout(()=>{B==null||B.invalidateSize()},100)}window.addEventListener("map-needs-resize",sn);let N={},k=new Set,V=!1;function rn(){H(),an();const e=document.getElementById("filter-gender"),t=document.getElementById("filter-group"),s=document.getElementById("filter-search");e==null||e.addEventListener("change",()=>{N.gender=e.value,H()}),t==null||t.addEventListener("change",()=>{N.group=t.value,H()}),s==null||s.addEventListener("input",()=>{N.searchText=s.value,H()}),window.addEventListener("profiles-updated",H),window.addEventListener("tandems-updated",H),window.addEventListener("profile-clicked",n=>{Et(n.detail.profileId)})}function an(){const e=document.querySelector(".sidebar-header");if(!e||document.getElementById("manualMatchBtn"))return;const t=document.createElement("button");t.id="manualMatchBtn",t.className="btn btn-sm",t.innerHTML="👆 Manuell matchen",t.title="Zwei Profile zum Matchen auswählen",t.addEventListener("click",()=>{V=!V,k.clear(),window.dispatchEvent(new CustomEvent("profile-deselected")),De(),H()}),e.appendChild(t)}function De(){const e=document.getElementById("manualMatchBtn");e&&(V?(e.classList.add("active"),e.innerHTML=k.size===0?"✋ Wähle 2 Profile...":k.size===1?"✋ Noch 1 wählen...":"✅ Matchen!"):(e.classList.remove("active"),e.innerHTML="👆 Manuell matchen"))}function H(){const e=document.getElementById("profileList"),t=document.getElementById("profileCount");if(!e)return;const s=on();if(t&&(t.textContent=String(s.length)),s.length===0){e.innerHTML='<p class="empty-state">Keine Profile gefunden. Importiere Profile über den Button oben.</p>';return}e.innerHTML=s.map(n=>cn(n)).join(""),e.querySelectorAll(".profile-card").forEach(n=>{n.addEventListener("click",()=>{const i=n.getAttribute("data-profile-id");i&&Et(i)})})}function on(){let e=U();if(N.gender&&N.gender!=="all"&&(e=e.filter(t=>we(t)===N.gender)),N.group&&N.group!=="all"&&(e=e.filter(t=>me(t)===N.group)),N.searchText){const t=N.searchText.toLowerCase();e=e.filter(s=>{const n=Z(s)||"";return s.name.toLowerCase().includes(t)||n.includes(t)})}return e}function cn(e){const t=Z(e)||"-",s=me(e),n=le(e),i=k.has(e.id),r=ce().has(e.id),o=r?re(e.id):null,c=o?o.profile1.id===e.id?o.profile2.name:o.profile1.name:null,l=V&&i?Array.from(k).indexOf(e.id)+1:0;return`
    <div class="profile-card ${i?"selected":""} ${r?"matched":""} ${V?"manual-mode":""}" data-profile-id="${e.id}">
      ${l>0?`<div class="selection-number">${l}</div>`:""}
      <div class="name">${it(e.name)}</div>
      <div class="meta">
        <span class="group-badge ${s}">${s==="local"?"Local":"Newcomer"}</span>
        <span>PLZ: ${t}</span>
        ${n?`<span>${n} Jahre</span>`:""}
      </div>
      ${r?`
        <div class="matched-info">
          <span class="matched-badge">✓ Vermittelt</span>
          ${c?`<span class="partner-name">mit ${it(c.split(" ")[0])}</span>`:""}
        </div>
      `:""}
    </div>
  `}function Et(e){const t=be(e);if(!t)return;const s=re(e);if(s&&!V){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:s.id,tandem:s,profileId:e}}));return}if(V){if(k.has(e))k.delete(e);else{if(k.size>=2){const n=Array.from(k)[0];k.delete(n)}k.add(e)}if(De(),k.size===2){const n=Array.from(k),i=be(n[0]),a=be(n[1]);if(i&&a){const r=re(i.id),o=re(a.id);if(r||o){alert("Eines der Profile ist bereits in einem Tandem. Bitte zuerst das bestehende Tandem auflösen.");return}window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:i,profile2:a}})),V=!1,k.clear(),De()}}H();return}if(k.has(e))k.delete(e),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:e}}));else{if(k.size>0){const n=Array.from(k)[0];k.clear(),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:n}}))}k.add(e),window.dispatchEvent(new CustomEvent("profile-selected",{detail:{profileId:e,profile:t}}))}H()}function it(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const ln=["vorname","nachname","name","vollständiger name","e-mail-adresse","e-mail","email","telefonnummer","telefon","id","user-id","teilnehmer-id","profil-id","gruppe","standort","region","west","ost","nord","süd","vermittler","vermittler*in","durchgeführt von","durchgeführt","datum/uhrzeit","datum","uhrzeit","termin","terminart","status","bearbeitungsstatus","anmeldestatus","infoabend","infonachmittag","format","aufnahmegespräch","standort-newsletter","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","portal-link","wie wirkt die person auf dich","eindruck","bewertung","wie schätzt du ein","einschätzung","beurteilung","sind weitere schritte nötig","nächste schritte","follow-up","aufnahmegespräch datum","gespräch datum","plz","postleitzahl","ort","stadt","köln","berlin","münchen","ausgeschlossen","ausgetreten","pausiert","vermittelt","unvermittelt","angemeldet","beginn","ende"];function dn(e){const t=e.toLowerCase().trim();return t.length<3||t==="geschlecht"||t==="dein geschlecht"?!0:ln.some(s=>t.includes(s)||s.includes(t))}function I(e,t){for(const s of t){const n=new RegExp(s,"i"),i=e.fields.find(a=>n.test(a.question)&&!dn(a.question));if(i!=null&&i.answer)return i.answer}return null}function Ue(e,t){const s=[],n=me(e),i=me(t);if(n===i)return{compatible:!1,score:0,failReason:"same_group",failDetails:`Beide sind ${n==="local"?"Locals":"Newcomer"} - nur interkulturelle Matches möglich`,softFactsScore:0,softFactsMax:15};const a=un(e,t);if(!a.pass)return{compatible:!1,score:0,failReason:"age_preference",failDetails:a.reason,softFactsScore:0,softFactsMax:15};const r=mn(e,t);if(!r.pass)return{compatible:!1,score:0,failReason:"gender_preference",failDetails:r.reason,softFactsScore:0,softFactsMax:15};const o=hn(e,t);if(!o.pass)return{compatible:!1,score:0,failReason:"time_overlap",failDetails:o.reason,softFactsScore:0,softFactsMax:15};const c=[],l=fn(e,t,s,c),d=15;return{compatible:!0,score:Math.min(5,Math.round(l/d*5)),softFactsScore:l,softFactsMax:d,details:s.join("; "),positiveFactors:c.slice(0,3)}}function un(e,t){const s=le(e),n=le(t);if(!s||!n)return{pass:!0};const i=Math.abs(s-n),a=I(e,["alter.*unterschied","alter.*tandem","wie groß.*alter"]),r=I(t,["alter.*unterschied","alter.*tandem","wie groß.*alter"]);if(a){const o=a.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${i} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${i} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&n<s)return{pass:!1,reason:`${e.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&n>s)return{pass:!1,reason:`${e.name}: Präferiert jüngeren Partner`}}if(r){const o=r.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${i} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${i} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&s<n)return{pass:!1,reason:`${t.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&s>n)return{pass:!1,reason:`${t.name}: Präferiert jüngeren Partner`}}return{pass:!0}}function mn(e,t){const s=we(e),n=we(t),i=I(e,["geschlecht.*tandem","geschlecht.*partner"]),a=I(t,["geschlecht.*tandem","geschlecht.*partner"]);if(i&&n){const r=i.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&n!=="female")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${i}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&n!=="male")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${i}" nicht erfüllt`}}}if(a&&s){const r=a.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&s!=="female")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${a}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&s!=="male")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${a}" nicht erfüllt`}}}return{pass:!0}}function hn(e,t){const s=I(e,["zeit.*treffen","zeit.*tandem","wann.*zeit"]),n=I(t,["zeit.*treffen","zeit.*tandem","wann.*zeit"]);if(!s||!n)return{pass:!0};const i=s.toLowerCase(),a=n.toLowerCase();return i.includes("flexibel")||a.includes("flexibel")?{pass:!0}:["morgens","mittags","nachmittags","abends","unter der woche","wochenende"].filter(c=>i.includes(c)&&a.includes(c)).length===0?{pass:!1,reason:"Keine gemeinsamen Zeitfenster gefunden"}:{pass:!0}}function fn(e,t,s,n){let i=0;const a=Z(e),r=Z(t);if(a&&r){const g=parseInt(a.substring(0,2)),v=parseInt(r.substring(0,2)),S=Math.abs(g-v);a===r?(i+=3,s.push("Gleiche PLZ"),n.push("Gleiche PLZ")):S===0?(i+=2.5,s.push("Gleiche Region (< 10 km)"),n.push("Nah beieinander")):S===1?(i+=2,s.push("Benachbarte Region"),n.push("Benachbarte Region")):S<=3?(i+=1.5,s.push("Nahe Region")):S<=5?i+=1:i+=.5}const o=le(e),c=le(t);if(o&&c){const g=Math.abs(o-c);g<=3?(i+=2,s.push(`Sehr ähnliches Alter (±${g} Jahre)`),n.push(g===0?"Gleich alt":`Nur ${g}J Unterschied`)):g<=5?(i+=1.8,s.push(`Ähnliches Alter (±${g} Jahre)`),n.push("Ähnliches Alter")):g<=10?i+=1.5:g<=15?i+=1:g<=20&&(i+=.5)}const l=I(e,["geschlecht.*tandem","geschlecht.*partner"]),d=I(t,["geschlecht.*tandem","geschlecht.*partner"]);(l||d)&&(i+=1,s.push("Geschlechtspräferenz erfüllt")),i+=1,s.push("Interkulturell");const h=I(e,["hobby","hobbies","hobbys"]),f=I(t,["hobby","hobbies","hobbys"]);if(h&&f){const g=gn(h,f);if(g.length>0){const v=Math.min(2,g.length*.4);i+=v,g.length>=3?(s.push("Viele gemeinsame Hobbys"),n.push("Viele gemeinsame Hobbys")):g.length>=2?(s.push("Mehrere gemeinsame Hobbys"),n.push("Gemeinsame Hobbys")):s.push("Gemeinsame Hobby-Interessen")}}const b=I(e,["freizeit(?!.*vermittler)"]),E=I(t,["freizeit(?!.*vermittler)"]);if(b&&E){const g=rt(b,E);g.length>=3?(i+=1.5,s.push("Ähnliche Freizeitinteressen")):g.length>=1&&(i+=.75)}const M=I(e,["themen.*interessieren","interess.*themen"]),z=I(t,["themen.*interessieren","interess.*themen"]);if(M&&z){const g=["politik","kunst","kultur","technologie","sport","musik","natur","reisen","essen","kochen","wissenschaft","geschichte","literatur"],v=M.toLowerCase(),S=z.toLowerCase(),P=g.filter(q=>v.includes(q)&&S.includes(q));P.length>=2?(i+=1.5,s.push("Mehrere gemeinsame Interessensgebiete"),n.push("Ähnliche Interessen")):P.length===1&&(i+=.75,s.push("Gemeinsame Interessensgebiete"))}const J=I(e,["freundschaft.*wichtig","wichtig.*freundschaft"]),ee=I(t,["freundschaft.*wichtig","wichtig.*freundschaft"]);if(J&&ee){const g=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","loyalität","treue"],v=J.toLowerCase(),S=ee.toLowerCase(),P=g.filter(q=>v.includes(q)&&S.includes(q));P.length>=2?(i+=1.5,s.push("Ähnliche Wertvorstellungen"),n.push("Ähnliche Werte")):P.length===1&&(i+=.75)}const te=I(e,["tandem.*vorstellung(?!.*geschlecht)"]),u=I(t,["tandem.*vorstellung(?!.*geschlecht)"]);if(te&&u){const g=rt(te,u);g.length>=2?(i+=1,s.push("Ähnliche Tandem-Vorstellungen")):g.length>=1&&(i+=.5)}const m=I(e,["community-event","event.*unternehmen"]),p=I(t,["community-event","event.*unternehmen"]);if(m&&p){const g=m.toLowerCase(),v=p.toLowerCase();(g.includes("ja")||g.includes("gerne"))&&(v.includes("ja")||v.includes("gerne"))&&(i+=.5)}return i}function gn(e,t){const s=e.split(/[,;]/).map(i=>et(i.trim())).filter(Boolean),n=t.split(/[,;]/).map(i=>et(i.trim())).filter(Boolean);return s.filter(i=>n.some(a=>i===a))}function rt(e,t){const s=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","mich","gerne","sehr","auch","aber","dass","wenn","weil","nicht","mehr","noch","schon","immer"]),n=e.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!s.has(a)),i=t.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!s.has(a));return n.filter(a=>i.some(r=>a===r||a.includes(r)||r.includes(a)))}let C=null,ae=[];function pn(){document.getElementById("smartMatchPanel");const e=document.getElementById("closeSmartMatch");e==null||e.addEventListener("click",()=>{at(),window.dispatchEvent(new CustomEvent("profile-deselected"))}),window.addEventListener("profile-selected",async t=>{C=t.detail.profile;const n=re(C.id);if(n){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:n.id,tandem:n,profileId:C.id}})),C=null;return}await bn(),wn(),kn()}),window.addEventListener("profile-deselected",()=>{C=null,ae=[],at()})}async function bn(){if(!C)return;const e=U(),t=ce(),s=[];for(const n of e){if(n.id===C.id||t.has(n.id))continue;const i=Ue(C,n),a=Z(C),r=Z(n);let o,c;a&&r&&(o=await Kt(a,r),o!==void 0&&(c=o<1?"<1 km":`${Math.round(o)} km`)),s.push({profile:n,matchResult:i,distance:o,distanceText:c})}s.sort((n,i)=>n.matchResult.compatible!==i.matchResult.compatible?n.matchResult.compatible?-1:1:n.matchResult.compatible?i.matchResult.score-n.matchResult.score:0),ae=s}function wn(){const e=document.getElementById("smartMatchPanel"),t=document.getElementById("selectedProfileName"),s=document.getElementById("smartMatchContent");!e||!t||!s||!C||(t.textContent=C.name,s.innerHTML=vn(),e.classList.add("visible"),s.querySelectorAll(".match-item").forEach(n=>{n.addEventListener("click",()=>{const i=n.getAttribute("data-profile-id");i&&En(i)})}))}function at(){const e=document.getElementById("smartMatchPanel");e==null||e.classList.remove("visible")}function vn(){if(ae.length===0)return'<p class="empty-state">Keine anderen Profile zum Matchen vorhanden.</p>';const e=ae.filter(n=>n.matchResult.compatible),t=ae.filter(n=>!n.matchResult.compatible);let s="";return e.length>0&&(s+='<div class="match-section"><h4>Passende Matches</h4>',s+=e.map(n=>ot(n,!0)).join(""),s+="</div>"),t.length>0&&(s+='<div class="match-section"><h4>Unpassend (Hard Facts)</h4>',s+=t.map(n=>ot(n,!1)).join(""),s+="</div>"),s}function ot(e,t){const{profile:s,matchResult:n,distanceText:i}=e,a=yn(n.score);let r="";if(!t&&n.failReason){const c={age_preference:"🎂",gender_preference:"⚧️",time_overlap:"⏰",same_group:"👥"},l={age_preference:"Alter-Präferenz",gender_preference:"Geschlecht-Präferenz",time_overlap:"Keine Zeit-Überschneidung",same_group:"Gleiche Gruppe"},d=c[n.failReason]||"⚠️",h=l[n.failReason]||n.failReason;let f="";n.failDetails&&(f=`<div class="reason-details">${ze(n.failDetails)}</div>`),r=`
      <div class="reason-box">
        <span class="reason-icon">${d}</span>
        <span class="reason-label">${h}</span>
        ${f}
      </div>
    `}let o="";return t&&n.positiveFactors&&n.positiveFactors.length>0&&(o=`
      <div class="positive-factors">
        ${n.positiveFactors.slice(0,2).map(c=>`<span class="factor">✓ ${ze(c)}</span>`).join("")}
      </div>
    `),`
    <div class="match-item ${t?"":"incompatible"}" data-profile-id="${s.id}">
      <div class="stars">${t?a:"---"}</div>
      <div class="info">
        <div class="name">${ze(s.name)}</div>
        <div class="match-meta">
          ${i?`<span class="distance">📍 ${i}</span>`:""}
        </div>
        ${o}
        ${r}
      </div>
    </div>
  `}function yn(e){let t="";for(let s=0;s<5;s++)t+=`<span class="star ${s<e?"":"empty"}">★</span>`;return t}function En(e){const t=be(e);!t||!C||window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:C,profile2:t}}))}function kn(){const e=[],t=[],s=[];for(const n of ae)n.matchResult.compatible?(e.push(n.profile.id),n.matchResult.score>=4&&s.push(n.profile.id)):t.push(n.profile.id);nn(e,t,s)}function ze(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let oe=null;function Ln(){const e=document.getElementById("importModal"),t=document.getElementById("importBtn"),s=document.getElementById("closeImportModal"),n=document.getElementById("pasteClipboard"),i=document.getElementById("dropZone"),a=document.getElementById("fileInput"),r=document.getElementById("cancelImport"),o=document.getElementById("confirmImport"),c=document.getElementById("importPreview");t==null||t.addEventListener("click",()=>ct()),s==null||s.addEventListener("click",()=>Pe()),e==null||e.addEventListener("click",l=>{l.target===e&&Pe()}),n==null||n.addEventListener("click",async()=>{try{const l=await navigator.clipboard.readText();Re(l)}catch{alert("Fehler beim Lesen der Zwischenablage. Bitte erlaube den Zugriff.")}}),i==null||i.addEventListener("click",()=>a==null?void 0:a.click()),i==null||i.addEventListener("dragover",l=>{l.preventDefault(),i.classList.add("dragover")}),i==null||i.addEventListener("dragleave",()=>{i.classList.remove("dragover")}),i==null||i.addEventListener("drop",l=>{var h;l.preventDefault(),i.classList.remove("dragover");const d=(h=l.dataTransfer)==null?void 0:h.files[0];d&&lt(d)}),a==null||a.addEventListener("change",()=>{var d;const l=(d=a.files)==null?void 0:d[0];l&&lt(l)}),r==null||r.addEventListener("click",()=>{oe=null,c&&(c.hidden=!0)}),o==null||o.addEventListener("click",()=>{if(oe)try{const l=_t(oe);alert(`${l} neue Profile importiert!`),Pe()}catch(l){alert("Fehler beim Import: "+l.message)}}),window.addEventListener("import-from-clipboard",l=>{const d=l;ct(),Re(d.detail)})}function ct(){const e=document.getElementById("importModal"),t=document.getElementById("importPreview");e==null||e.classList.add("visible"),t&&(t.hidden=!0),oe=null}function Pe(){const e=document.getElementById("importModal");e==null||e.classList.remove("visible"),oe=null}function lt(e){if(!e.name.endsWith(".json")){alert("Bitte eine JSON-Datei auswählen.");return}const t=new FileReader;t.onload=s=>{var i;const n=(i=s.target)==null?void 0:i.result;Re(n)},t.onerror=()=>{alert("Fehler beim Lesen der Datei.")},t.readAsText(e)}function Re(e){try{let t;if(e.includes("SWAF_PROFILE_START")?t=In(e):t=JSON.parse(e),!t.profiles||!Array.isArray(t.profiles))throw new Error("Ungültiges Format: profiles Array nicht gefunden");oe=t,Sn(t)}catch(t){alert("Fehler beim Verarbeiten der Daten: "+t.message)}}function In(e){const t=[],s=/SWAF_PROFILE_START([\s\S]*?)SWAF_PROFILE_END/g;let n;for(;(n=s.exec(e))!==null;)try{const i=JSON.parse(n[1].trim());t.push({id:crypto.randomUUID(),url:i.url||"",name:i.name||"Unbekannt",pageType:i.pageType||"Hauptprofil",timestamp:i.timestamp||Date.now(),fields:i.fields||[]})}catch{}return{version:"1.0",exportedAt:new Date().toISOString(),profiles:t}}function Sn(e){const t=document.getElementById("importPreview"),s=document.getElementById("previewCount"),n=document.getElementById("previewList");!t||!s||!n||(s.textContent=String(e.profiles.length),n.innerHTML=e.profiles.slice(0,10).map(i=>`<div class="preview-item">${An(i.name)} (${i.fields.length} Felder)</div>`).join(""),e.profiles.length>10&&(n.innerHTML+=`<div class="preview-item">... und ${e.profiles.length-10} weitere</div>`),t.hidden=!1)}function An(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const We="https://api.swaf.koeln/ollama",Mn="ollama",$n="Tandem2026Matcher";function Ve(){return{"Content-Type":"application/json",Authorization:"Basic "+btoa(`${Mn}:${$n}`)}}async function kt(){try{console.log("🤖 Prüfe Ollama-Verfügbarkeit...");const e=await fetch(`${We}/api/tags`,{method:"GET",headers:Ve(),signal:AbortSignal.timeout(5e3)});return console.log(`🤖 Ollama Response: ${e.status} ${e.statusText}`),e.ok}catch(e){return console.warn("🤖 Ollama nicht erreichbar:",e),!1}}async function Lt(){var e;try{const t=await fetch(`${We}/api/tags`,{headers:Ve()});return t.ok?((e=(await t.json()).models)==null?void 0:e.map(n=>n.name))||[]:[]}catch{return[]}}const xe="mistral:7b";async function It(){const e=await Lt();return e.length===0?xe:e.some(t=>t.includes("mistral"))?e.find(t=>t.includes("mistral"))||xe:e[0]||xe}const dt={hobbys:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail. Dieser Abschnitt beschreibt die Hobby-Gemeinsamkeiten zweier Tandem-Partner.

WICHTIG:
- NUR ein Abschnitt, NICHT die ganze E-Mail!
- KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
- Starte direkt mit dem Inhalt!
- Alle DUZEN sich! ("ihr", "euch", "du" - NIEMALS "Sie")

STIL: "Ihr beide...", "Gemeinsam könntet ihr...", "Euch verbindet..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze, direkt starten):`,freizeit:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Freizeit-Gemeinsamkeiten.

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Ihr beide...", "In eurer Freizeit..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,interessen:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über gemeinsame Interessen.

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Ihr interessiert euch beide für..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,sprachen:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Sprachkenntnisse.

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Ihr sprecht beide...", "Deutsch könnt ihr gemeinsam üben."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (1-2 Sätze):`,beruf:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über berufliche Verbindungen.

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Beruflich verbindet euch...", "Eure unterschiedlichen Branchen..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,vorher:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über bisherige Erfahrungen.

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Ihr habt beide...", "Eure unterschiedlichen Wege..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,zukunft:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Zukunftspläne.

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Ihr habt beide Pläne für...", "Dabei könntet ihr euch unterstützen."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,tandem_motivation:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über die Tandem-Motivation.

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Eure Motivationen ergänzen sich...", "Ihr wollt beide..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,freundschaft_werte:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Freundschafts-Werte.

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Euch beiden ist wichtig...", "Ihr teilt ähnliche Werte..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,events:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über gemeinsame Aktivitäten.

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Ihr könntet zusammen...", "Events wie ... interessieren euch beide."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,verfuegbarkeit:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über die zeitliche Verfügbarkeit.

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Ihr seid beide abends verfügbar.", "Ein Treffen am Wochenende würde passen."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (1-2 Sätze):`,default:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail zur Frage "{Frage}".

WICHTIG: NUR ein Abschnitt - KEINE Anrede/Einleitung/Abschluss! Alle DUZEN sich!
STIL: "Ihr beide...", "Euch verbindet...", "Gemeinsam könntet ihr..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis, Siezen
Falls keine Gemeinsamkeit: antworte nur "---"

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (1-2 Sätze):`};function Tn(e){const t=e.toLowerCase();return t.includes("hobby")||t.includes("hobbies")||t.includes("hobbys")?"hobbys":t.includes("freizeit")||t.includes("was machst du gerne")?"freizeit":t.includes("interesse")||t.includes("themen")?"interessen":t.includes("sprache")||t.includes("sprichst")?"sprachen":t.includes("beruf")||t.includes("arbeit")||t.includes("job")||t.includes("was machst du gerade")?"beruf":t.includes("vorher")||t.includes("früher")||t.includes("gelernt")||t.includes("was hast du")?"vorher":t.includes("zukunft")||t.includes("plan")||t.includes("ziel")||t.includes("vorhaben")?"zukunft":t.includes("warum")&&(t.includes("swaf")||t.includes("tandem")||t.includes("mitmachen"))?"tandem_motivation":t.includes("wichtig")&&(t.includes("freund")||t.includes("wert"))?"freundschaft_werte":t.includes("event")||t.includes("veranstaltung")||t.includes("unternehmen")||t.includes("aktivität")?"events":t.includes("zeit")||t.includes("wann")||t.includes("verfügbar")||t.includes("treffen")||t.includes("erreichbar")?"verfuegbarkeit":"default"}function St(e,t,s){const n=Tn(e);return(dt[n]||dt.default).replace("{Frage}",e).replace("{Antwort1}",t).replace("{Antwort2}",s)}async function He(e,t,s,n){var r;const i=await It();if(!i)return null;const a=St(e,t,s);try{const o=await fetch(`${We}/api/generate`,{method:"POST",headers:Ve(),body:JSON.stringify({model:i,prompt:a,stream:!1,options:{temperature:.7,num_predict:400}})});if(!o.ok)return console.warn("Ollama API error:",o.status),null;const l=((r=(await o.json()).response)==null?void 0:r.trim())||null;return!l||l==="---"||l.includes("keine Gemeinsamkeit")||l.includes("keine erkennbare")?null:l.replace(/^["']|["']$/g,"").trim()}catch(o){return console.warn("Ollama generation failed:",o),null}}async function At(){if(!await kt())return{available:!1,model:null,models:[]};const t=await Lt();return{available:!0,model:await It(),models:t}}let y=[],G="",j="",R=new Set;const Cn='Schreibe hierzu einen kurzen Text. Die Frage zu den Antworten lautet {Frage}. Schreibe, wie die Antworten zusammenpassen könnten bzw. gebe Beispiele aus. Hier die Antworten: Person 1 - {Antwort1}, Person 2 - {Antwort2}. Schreibe den Text nach diesem Beispiel: "Ihr habt beide angegeben, dass ihr gerne kocht - ob mit Freund*innen oder alleine. Also los! Probiert doch einmal gemeinsam neue Rezepte. Außerdem geht ihr beide gerne Spazieren. Nach dem Essen sollst du Ruhn, oder 1.000 Schritte tun. Also habt ihr ja quasi schon einen Tagesplan ;) Weil ihr beide gerne auch kulturelle Dinge macht, wie in das Theater/Museum/oder auf andere Kulturveranstaltungen geht - schaut doch mal auf rausgegangen.de was es in Köln so die nächsten Tage gibt. Oder guckt bei uns im Eventportal: www.startwithafriend.de/events" - Nenne KEINE Namen oder andere Personenbezeichnungen.',_e=["Person","Sprachen & Herkunft","Beruf & Bildung","Hobbys & Interessen","Tandem-Wünsche","Verfügbarkeit","Sonstiges"],zn=["vermittler","durchgeführt von","status","terminart","anmeldestatus","bearbeitungsstatus","infoabend","infonachmittag","aufnahmegespräch datum","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","wie wirkt die person","eindruck","einschätzung","bewertung","nächste schritte","follow-up","user-id","profil-id","teilnehmer-id","women_kpi","kpi","integrationskurs","besuchst du gerade einen integrationskurs","vorgeschlagene termine","suggested_appointments","telefonnummer","phone_number","telefon","responsible_user","responsible","registration_interview","appointment_type","appointment_info","region","department_region","department","process_history","process_current_step","flucht","einwandungserfahrung","immigration_experience","create_uid","existing_tandem_count","tandem_count","birthday","geburtstag","geburtsdatum","group","gruppe","e-mail","email","e-mail-adresse","emailadresse","nachname","last_name","lastname","familienname","full_name","fullname","vollständiger name","datum/uhrzeit","datum uhrzeit","anmeldedatum","registrierungsdatum"],Pn=["name","full name"];function xn(e){const t=e.toLowerCase();return t.includes("name")||t.includes("alter")||t.includes("geschlecht")||t.includes("geboren")||t.includes("plz")||t.includes("postleitzahl")?"Person":t.includes("sprache")||t.includes("herkunft")||t.includes("land")||t.includes("deutschland")||t.includes("seit wann")?"Sprachen & Herkunft":t.includes("beruf")||t.includes("arbeit")||t.includes("studium")||t.includes("studiert")||t.includes("abschluss")||t.includes("branche")||t.includes("was machst du gerade")||t.includes("was hast du vorher gemacht")||t.includes("was hast du gelernt")||t.includes("in zukunft")||t.includes("zukunft gerne machen")?"Beruf & Bildung":t.includes("hobby")||t.includes("freizeit")||t.includes("interesse")||t.includes("ausprobieren")||t.includes("was machst du gerne")||t.includes("freundschaft")||t.includes("wichtig")||t.includes("event")||t.includes("anbieten")||t.includes("themen")||t.includes("community")||t.includes("unternehmen")?"Hobbys & Interessen":t.includes("tandem")||t.includes("swaf")||t.includes("mitmachen")||t.includes("warum")||t.includes("vorstellung")||t.includes("geschlecht")&&t.includes("partner")?"Tandem-Wünsche":t.includes("zeit")||t.includes("treffen")||t.includes("wann")||t.includes("erreichen")||t.includes("kontakt")||t.includes("bewegst")?"Verfügbarkeit":"Sonstiges"}function Nn(e){const t=e.toLowerCase().trim();return Pn.includes(t)?!0:zn.some(s=>t.includes(s))}function Fe(e){return e?["übersprungen","keine angabe","k.a.","n/a","-","","egal","keine","null","undefined"].includes(e.toLowerCase().trim()):!0}const Bn=["name","vorname","nachname","plz","postleitzahl","standort","ort","adresse","wohnort","geschlecht","gender","alter","age","geburt","in deutschland geboren","in welchem land","herkunftsland","geburtsland","woher kommst du","country","altersunterschied","geschlechterpräferenz","alterspräferenz"];function qn(e){const t=e.toLowerCase();return Bn.some(s=>t.includes(s))}function Mt(e,t,s){G=mt(t.name),j=mt(s.name);const n=new Map;function i(r,o,c){if(Nn(r)||!o||Fe(o))return;const l=Rn(r),d=n.get(l);d?(c?d.answer1?d.answer1!==o&&(d.answer1+="; "+o):d.answer1=o:d.answer2?d.answer2!==o&&(d.answer2+="; "+o):d.answer2=o,d.mergedQuestions.includes(r)||d.mergedQuestions.push(r)):n.set(l,{displayQuestion:r,answer1:c?o:"",answer2:c?"":o,mergedQuestions:[r]})}for(const r of t.fields)i(r.question,r.answer||"",!0);for(const r of s.fields)i(r.question,r.answer||"",!1);y=[];let a=0;for(const[r,o]of n){if(!o.answer1&&!o.answer2)continue;const c=Hn(r,o.displayQuestion),l=ye(c,o.answer1,o.answer2),d=l.length>0||o.answer1&&o.answer2;y.push({id:`row-${a}`,question:c,answer1:o.answer1,answer2:o.answer2,comment:l,selected:!1,included:d,collapsed:!d,category:xn(c)}),a++}y.sort((r,o)=>{const c=_e.indexOf(r.category),l=_e.indexOf(o.category);return c!==l?c-l:r.included!==o.included?r.included?-1:1:r.question.localeCompare(o.question)}),R.clear(),ve(e);for(const r of y)(r.question.toLowerCase().includes("plz")||r.question.toLowerCase().includes("postleitzahl"))&&r.answer1&&r.answer2&&Vn(r.answer1,r.answer2,r.id)}const Dn=[{key:"alter",patterns:["alter","age","wie alt bist du","wie alt","dein alter","geburtsjahr"]},{key:"geschlecht",patterns:["geschlecht","gender","dein geschlecht","welches geschlecht"]},{key:"altersunterschied",patterns:["altersunterschied","alterspräferenz","age_difference","max_age_difference","maximaler altersunterschied","altersunterschied zum tandempartner"]},{key:"geschlechterpräferenz",patterns:["geschlechterpräferenz","gender_preference","geschlecht des tandems","geschlecht tandempartner","welches geschlecht soll","gewünschtes geschlecht"]},{key:"vorname",patterns:["vorname","firstname","first_name","first name"]},{key:"plz",patterns:["plz","postleitzahl","postal code","zip","zipcode","deine plz"]},{key:"hobbys",patterns:["hobbys","hobbies","hobby"]},{key:"freizeit",patterns:["freizeit","freizeitaktivitäten"]},{key:"interessen",patterns:["interessen","interests"]},{key:"sprachen",patterns:["sprachen","languages","sprache","welche sprachen sprichst du","welche sprachen"]},{key:"herkunftsland",patterns:["herkunftsland","herkunft","woher kommst du","aus welchem land","country"]},{key:"seit_wann_deutschland",patterns:["seit wann in deutschland","seit wann bist du in deutschland","wie lange in deutschland","in deutschland seit"]}],ut={vorname:"Vorname",alter:"Alter",geschlecht:"Geschlecht",plz:"PLZ",hobbys:"Hobbys",freizeit:"Freizeitaktivitäten",interessen:"Interessen",sprachen:"Sprachen",herkunftsland:"Herkunftsland",seit_wann_deutschland:"Seit wann in Deutschland",altersunterschied:"Maximaler Altersunterschied",geschlechterpräferenz:"Geschlecht des Tandempartners"};function Rn(e){const t=e.toLowerCase().replace(/[?!.,:*_-]/g," ").replace(/\s+/g," ").trim(),s=[...Dn].sort((n,i)=>{const a=Math.max(...n.patterns.map(o=>o.length));return Math.max(...i.patterns.map(o=>o.length))-a});for(const n of s)for(const i of n.patterns)if(t===i||t.startsWith(i+" ")||t.endsWith(" "+i)||t.includes(" "+i+" "))return n.key;return t}function Hn(e,t){return ut[e]?ut[e]:t}function ve(e){const t=R.size,s=y.filter(a=>!a.hidden),n=s.filter(a=>a.included).length,i=new Map;for(const a of s)i.has(a.category)||i.set(a.category,[]),i.get(a.category).push(a);e.innerHTML=`
    <div class="tandem-editor">
      <div class="editor-toolbar">
        <button class="btn btn-sm" id="mergeRowsBtn" ${t<2?"disabled":""}>
          Zusammenführen (${t})
        </button>
        <button class="btn btn-sm btn-outline" id="regenerateBtn" title="Textvorschläge lokal generieren">
          Lokal generieren
        </button>
        <button class="btn btn-sm btn-ai" id="ollamaBtn" title="Mit lokalem LLM (Ollama) generieren" disabled>
          KI generieren...
        </button>
        <span class="toolbar-info">${n} von ${s.length} Feldern</span>
      </div>

      <div class="editor-table">
        ${_e.map(a=>{const r=i.get(a);if(!r||r.length===0)return"";const o=r.filter(c=>c.included).length;return`
            <div class="category-section">
              <div class="category-header">
                <span>${a}</span>
                <span class="category-count">${o}/${r.length}</span>
              </div>
              ${r.map(c=>_n(c)).join("")}
            </div>
          `}).join("")}
      </div>

      <div class="editor-preview">
        <div class="preview-header">
          <strong>E-Mail-Vorschau (${n} Felder):</strong>
          <button class="btn btn-sm" id="copyEmailBtn">📋 Kopieren</button>
        </div>
        <div class="preview-content" id="emailPreview">
          ${Ze()}
        </div>
      </div>
    </div>
  `,Fn(e)}function _n(e){const t=R.has(e.id),s=e.comment&&e.comment.length>0;return`
    <div class="editor-row ${t?"selected":""} ${e.included?"included":"excluded"} ${e.collapsed?"collapsed":""}" data-row-id="${e.id}">
      <div class="row-header">
        <label class="include-toggle" title="In E-Mail einschließen">
          <input type="checkbox" class="include-checkbox" data-row-id="${e.id}" ${e.included?"checked":""}>
          <span class="toggle-slider"></span>
        </label>
        <div class="row-question" data-row-id="${e.id}">
          <span class="collapse-icon">${e.collapsed?"▸":"▾"}</span>
          <span class="question-text">${w(e.question)}</span>
          ${s?'<span class="has-comment-indicator">✓</span>':""}
        </div>
        <div class="row-quick-actions">
          <input type="checkbox" class="merge-checkbox" data-row-id="${e.id}" ${t?"checked":""} title="Für Zusammenführen auswählen">
        </div>
      </div>

      <div class="row-details ${e.collapsed?"hidden":""}">
        <div class="row-answers">
          <div class="answer-cell">
            <div class="answer-label">${w(G)}:</div>
            <textarea
              class="answer-input answer1-input"
              data-row-id="${e.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${w(e.answer1)}</textarea>
          </div>
          <div class="answer-cell">
            <div class="answer-label">${w(j)}:</div>
            <textarea
              class="answer-input answer2-input"
              data-row-id="${e.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${w(e.answer2)}</textarea>
          </div>
        </div>

        <div class="row-comment">
          <textarea
            class="comment-input"
            data-row-id="${e.id}"
            placeholder="Gemeinsamkeit / Kommentar eingeben..."
            rows="2"
          >${w(he(e.comment))}</textarea>
          ${ns(e.comment)}
          <div class="comment-buttons">
            <button class="btn-icon smart-suggest" data-row-id="${e.id}" title="Lokaler Textvorschlag">💡</button>
            <button class="btn-icon ai-assist" data-row-id="${e.id}" title="KI-Unterstützung (ChatGPT/Claude)">🤖</button>
          </div>
        </div>
      </div>
    </div>
  `}function Fn(e){var n,i,a;e.querySelectorAll(".include-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;const d=y.find(h=>h.id===l);if(d){d.included=c.checked,ne(e);const h=e.querySelector(`.editor-row[data-row-id="${l}"]`);h&&(h.classList.toggle("included",d.included),h.classList.toggle("excluded",!d.included))}})}),e.querySelectorAll(".merge-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;c.checked?R.add(l):R.delete(l);const d=e.querySelector("#mergeRowsBtn");d&&(d.disabled=R.size<2,d.textContent=`⊕ Zusammenführen (${R.size})`)})}),e.querySelectorAll(".row-question").forEach(r=>{r.addEventListener("click",o=>{const c=r.dataset.rowId;if(!c)return;const l=y.find(d=>d.id===c);if(l){l.collapsed=!l.collapsed;const d=e.querySelector(`.editor-row[data-row-id="${c}"]`);if(d){d.classList.toggle("collapsed",l.collapsed);const h=d.querySelector(".row-details"),f=d.querySelector(".collapse-icon");h&&h.classList.toggle("hidden",l.collapsed),f&&(f.textContent=l.collapsed?"▸":"▾")}}})});function t(r){r.style.height="auto",r.style.height=Math.min(r.scrollHeight,200)+"px"}e.querySelectorAll(".answer1-input").forEach(r=>{const o=r;t(o),o.addEventListener("input",c=>{const l=c.target;t(l);const d=l.dataset.rowId;if(!d)return;const h=y.find(f=>f.id===d);h&&(h.answer1=l.value,ne(e))})}),e.querySelectorAll(".answer2-input").forEach(r=>{const o=r;t(o),o.addEventListener("input",c=>{const l=c.target;t(l);const d=l.dataset.rowId;if(!d)return;const h=y.find(f=>f.id===d);h&&(h.answer2=l.value,ne(e))})}),e.querySelectorAll(".comment-input").forEach(r=>{t(r)}),e.querySelectorAll(".comment-input").forEach(r=>{r.addEventListener("input",o=>{const c=o.target,l=c.dataset.rowId;if(!l)return;const d=y.find(h=>h.id===l);if(d){if(d.comment=c.value,c.value.length>0&&!d.included){d.included=!0;const h=e.querySelector(`.include-checkbox[data-row-id="${l}"]`);h&&(h.checked=!0)}ne(e)}})}),e.querySelectorAll(".smart-suggest").forEach(r=>{r.addEventListener("click",async o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=y.find(h=>h.id===c);if(!l)return;l.comment=ye(l.question,l.answer1,l.answer2);const d=e.querySelector(`.comment-input[data-row-id="${c}"]`);if(d&&(d.value=l.comment),ne(e),(!l.comment||l.comment.length<10)&&l.answer1&&l.answer2&&await kt()){r.textContent="...";const f=await He(l.question,l.answer1,l.answer2);f&&(l.comment=f,l.included=!0,d&&(d.value=l.comment),ne(e)),r.textContent="💡"}})}),e.querySelectorAll(".ai-assist").forEach(r=>{r.addEventListener("click",o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=y.find(d=>d.id===c);l&&Xn(l)})}),(n=e.querySelector("#mergeRowsBtn"))==null||n.addEventListener("click",()=>{On(),ve(e)}),(i=e.querySelector("#regenerateBtn"))==null||i.addEventListener("click",()=>{for(const r of y)r.comment=ye(r.question,r.answer1,r.answer2),r.included=r.comment.length>0;ve(e)});const s=e.querySelector("#ollamaBtn");At().then(r=>{r.available?(s.disabled=!1,s.textContent="KI generieren",s.title="Mit Mistral KI generieren"):(s.textContent="KI nicht verfügbar",s.title="KI-Server nicht erreichbar")}).catch(()=>{s.textContent="KI nicht verfügbar",s.title="Fehler bei der Verbindung zum KI-Server"}),s==null||s.addEventListener("click",async()=>{s.disabled=!0,s.textContent="KI läuft...";const r=y.filter(o=>o.answer1&&o.answer2&&!qn(o.question)).map(o=>({question:o.question,answer1:o.answer1,answer2:o.answer2,rowId:o.id}));es(r,e,()=>{s.disabled=!1,s.textContent="KI generieren"})}),(a=e.querySelector("#copyEmailBtn"))==null||a.addEventListener("click",()=>{const r=Je(),o=ts();if(navigator.clipboard&&typeof ClipboardItem<"u"){const c=[new ClipboardItem({"text/html":new Blob([o],{type:"text/html"}),"text/plain":new Blob([r],{type:"text/plain"})})];navigator.clipboard.write(c).then(()=>{const l=e.querySelector("#copyEmailBtn");l&&(l.textContent="✓ Kopiert (Word-kompatibel)!",setTimeout(()=>l.textContent="📋 Kopieren",2e3))}).catch(()=>{navigator.clipboard.writeText(r)})}else navigator.clipboard.writeText(r).then(()=>{const c=e.querySelector("#copyEmailBtn");c&&(c.textContent="✓ Kopiert!",setTimeout(()=>c.textContent="📋 Kopieren",2e3))})})}function On(){if(R.size<2)return;const e=Array.from(R),t=e[0],s=y.find(i=>i.id===t);if(!s)return;const n=e.slice(1);for(const i of n){const a=y.find(r=>r.id===i);a&&(s.question+=" + "+a.question,a.answer1&&a.answer1!==s.answer1&&(s.answer1=s.answer1?s.answer1+"; "+a.answer1:a.answer1),a.answer2&&a.answer2!==s.answer2&&(s.answer2=s.answer2?s.answer2+"; "+a.answer2:a.answer2),a.comment&&(s.comment=s.comment?s.comment+"; "+a.comment:a.comment),a.included=!1,s.mergedWith||(s.mergedWith=[]),s.mergedWith.push(a.question.substring(0,30)))}s.comment=ye(s.question,s.answer1,s.answer2),R.clear()}function ye(e,t,s){const n=e.toLowerCase(),i=(t||"").toLowerCase().trim(),a=(s||"").toLowerCase().trim();if(!i&&!a||Fe(i)&&Fe(a))return"";if(i===a&&i.length>2)return n.includes("wichtig")||n.includes("freundschaft")?`Gemeinsamer Wert: ${t}`:n.includes("studium")&&i.includes("ja")?"Beide haben studiert - das verbindet!":`Übereinstimmung: ${t}`;if(n.includes("alter")&&!n.includes("unterschied")){const r=parseInt(i),o=parseInt(a);if(!isNaN(r)&&!isNaN(o)){const c=Math.abs(r-o);return c===0?"Genau gleich alt!":c<=3?`Nur ${c} Jahre Unterschied - perfekt!`:c<=7?`${c} Jahre Unterschied - passt gut`:c<=15?`${c} Jahre Unterschied - verschiedene Perspektiven`:`${c} Jahre Unterschied`}}return n.includes("sprache")||n.includes("sprichst")?Gn(t,s):n.includes("hobby")||n.includes("freizeit")||n.includes("interesse")||n.includes("ausprobieren")||n.includes("was machst du gerne")||n.includes("event")||n.includes("anbieten")||n.includes("unternehmen")||n.includes("themen")?jn(t,s):n.includes("beruf")||n.includes("arbeit")||n.includes("studium")||n.includes("gelernt")||n.includes("zukunft")||n.includes("branche")||n.includes("was machst du gerade")||n.includes("vorher gemacht")?Zn(t,s):n.includes("zeit")||n.includes("treffen")||n.includes("wann")||n.includes("erreichbar")?Kn(t,s):n.includes("wichtig")||n.includes("freundschaft")||n.includes("erwartung")?Un(t,s):n.includes("plz")||n.includes("postleitzahl")?Wn(t,s):n.includes("herkunft")||n.includes("land")||n.includes("woher")?Jn(t,s):n.includes("tandem")||n.includes("warum")||n.includes("mitmachen")||n.includes("swaf")||n.includes("start with a friend")?Qn(t,s):n.includes("geschlecht")&&(n.includes("partner")||n.includes("tandem"))?Yn(t,s):$t(t,s)}function Gn(e,t){const s=e.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),n=t.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),i=s.filter(a=>n.some(r=>a.includes(r)||r.includes(a)));return i.length>0?`Gemeinsame Sprachen: ${[...new Set(i)].join(", ")}`:""}function jn(e,t){const s=e.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),n=t.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),i=[["sport","fitness","training","gym","joggen","laufen"],["wandern","hiking","spazieren","natur","wald"],["kochen","backen","essen","kulinarisch","rezept"],["musik","konzert","instrument","singen"],["lesen","bücher","literatur"],["reisen","urlaub","travel","länder"],["film","kino","serien","netflix","movie"],["kunst","museum","malen","zeichnen","kreativ"],["tanzen","dance","salsa","bachata","tanz"],["fahrrad","radfahren","cycling","bike"],["foto","fotografieren","photography","kamera"],["café","kaffee","coffee"],["sprache","lernen","language"],["garten","pflanzen","garden"],["yoga","meditation","entspannung"],["schwimmen","baden","swimming"]],a=[];for(const o of s)for(const c of n){if(o.includes(c)||c.includes(o)){a.push(o.length>c.length?o:c);continue}for(const l of i){const d=l.some(f=>o.includes(f)),h=l.some(f=>c.includes(f));d&&h&&a.push(l[0])}}const r=[...new Set(a)];return r.length>0?r.length===1?`Gemeinsames Hobby: ${r[0]}`:`Gemeinsame Hobbys: ${r.slice(0,4).join(", ")}`:""}function Kn(e,t){const s=["morgens","mittags","nachmittags","abends","wochenende","unter der woche","flexibel"],n=e.toLowerCase(),i=t.toLowerCase(),a=s.filter(r=>n.includes(r)&&i.includes(r));return a.includes("flexibel")||a.length>=2?"Zeitlich flexibel - passt gut!":a.length>0?`Gemeinsame Zeit: ${a.join(", ")}`:""}function Un(e,t){const s=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","kommunikation"],n=e.toLowerCase(),i=t.toLowerCase(),a=s.filter(r=>n.includes(r)&&i.includes(r));return a.length>0?`Gemeinsame Werte: ${a.join(", ")}`:""}function Wn(e,t){const s=Ee(e),n=Ee(t);return!s||!n?"":s===n?"Gleiche PLZ":s.substring(0,2)===n.substring(0,2)?"Gleiche Region - Entfernung wird berechnet...":"Entfernung wird berechnet..."}async function Vn(e,t,s,n){const i=Ee(e),a=Ee(t);if(!i||!a)return;const r=y.find(c=>c.id===s);if(!r)return;const o=await Ut(i,a);if(o){const c=await X(i),l=await X(a);let d=Wt(o);if(c&&l){const E=Vt(c,l);d+=` [🗺️](${E.google})`}r.comment=d,r.included=!0;const h=document.querySelector(`.comment-input[data-row-id="${s}"]`);h&&(h.value=he(d));const f=document.querySelector(`.include-checkbox[data-row-id="${s}"]`);f&&(f.checked=!0);const b=document.querySelector("#emailPreview");b&&(b.innerHTML=Ze())}}function Ee(e){const t=e.match(/\b(\d{5})\b/);return t?t[1]:null}function Zn(e,t){const s=e.toLowerCase(),n=t.toLowerCase(),i=[["student","studier","uni","hochschule","ausbildung"],["arbeit","beruf","job","angestellt"],["selbstständig","freelance","freiberuflich"],["suche","arbeitslos","orientierung"],["it","software","computer","programmier"],["sozial","pflege","gesundheit","medizin"],["lehrer","pädagog","bildung","schule"],["ingenieur","technik","maschinenbau"],["wirtschaft","bwl","marketing","vertrieb"],["kunst","design","kreativ","musik"]],a=[];for(const r of i){const o=r.some(l=>s.includes(l)),c=r.some(l=>n.includes(l));o&&c&&a.push(r[0])}return a.length>0?`Ähnlicher Bereich: ${a.join(", ")}`:(s.includes("student")||s.includes("studier"))&&(n.includes("student")||n.includes("studier"))?"Beide studieren - viel gemeinsam!":$t(e,t)}function Jn(e,t){const s=e.toLowerCase(),n=t.toLowerCase(),i=["deutschland","syrien","iran","irak","afghanistan","türkei","ukraine","eritrea","somalia","nigeria","pakistan","indien","china","russland"];for(const a of i)if(s.includes(a)&&n.includes(a))return`Beide haben Bezug zu ${a.charAt(0).toUpperCase()+a.slice(1)}`;return(s.includes("kultur")||s.includes("tradition"))&&(n.includes("kultur")||n.includes("tradition"))?"Beide interessiert an Kultur & Traditionen":""}function Qn(e,t){const s=e.toLowerCase(),n=t.toLowerCase(),i=[{keywords:["sprache","deutsch","lernen","verbessern"],text:"Beide wollen Sprachkenntnisse verbessern"},{keywords:["freund","kennenlernen","kontakt","leute"],text:"Beide suchen neue Kontakte"},{keywords:["kultur","austausch","integration"],text:"Beide wollen kulturellen Austausch"},{keywords:["helfen","unterstütz","begleiten"],text:"Gegenseitige Unterstützung ist wichtig"},{keywords:["spaß","unternehmung","aktivität"],text:"Beide wollen gemeinsam Spaß haben"}];for(const a of i){const r=a.keywords.some(c=>s.includes(c)),o=a.keywords.some(c=>n.includes(c));if(r&&o)return a.text}return""}function Yn(e,t){const s=e.toLowerCase(),n=t.toLowerCase();return(s.includes("egal")||s.includes("keine präferenz"))&&(n.includes("egal")||n.includes("keine präferenz"))?"Beide flexibel beim Geschlecht":""}function $t(e,t){if(!e||!t)return"";const s=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","gerne","sehr","auch","aber","wenn","dann","noch","schon","kann","will","muss","soll","hat","haben","sein","wird","sind","ist","nicht","mehr","viel","viele","alle","diese","dies","dem","den","des"]),n=e.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!s.has(o)),i=t.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!s.has(o)),a=n.filter(o=>i.some(c=>o===c||o.length>4&&c.length>4&&(o.includes(c)||c.includes(o)))),r=[...new Set(a)];return r.length>=1?`Gemeinsam: ${r.slice(0,4).join(", ")}`:e.length>5&&t.length>5?"Beide haben geantwortet":""}function ne(e){const t=e.querySelector("#emailPreview");t&&(t.innerHTML=Ze())}function Ze(){const t=y.filter(n=>n.included).filter(n=>n.answer1||n.answer2);let s=`
    <div class="email-intro">
      Hi <strong>${w(G)}</strong> und <strong>${w(j)}</strong>,<br><br>
      hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde,
      <strong>ihr habt einige Gemeinsamkeiten und Interessen</strong>. Lest euch die Tabelle gerne durch.<br><br>
      <strong>Ihr findet:</strong> Eure Angaben, die Angaben der anderen Person, meine Einschätzung.<br><br>
      <em>Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus.</em>
      Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.<br><br>
    </div>

    <div class="email-section-title"><strong>Eure Gemeinsamkeiten und Profile im Überblick</strong></div>

    <table class="email-table">
      <thead>
        <tr>
          <th>Frage</th>
          <th>${w(G)}</th>
          <th>${w(j)}</th>
          <th>Gemeinsamkeit</th>
        </tr>
      </thead>
      <tbody>
  `;for(const n of t){const i=ss(n.comment);s+=`
      <tr>
        <td><strong>${w(n.question)}</strong></td>
        <td>${w(n.answer1)||"-"}</td>
        <td>${w(n.answer2)||"-"}</td>
        <td class="commonality">${i}</td>
      </tr>
    `}return s+=`
      </tbody>
    </table>
    <div class="email-outro">
      <br>Ich freue mich über eure Rückmeldung!
    </div>
  `,s}function Xn(e,t){var a,r,o,c;const n=(localStorage.getItem("swaf_ai_prompt")||Cn).replace("{Frage}",e.question).replace("{Antwort1}",e.answer1||"keine Angabe").replace("{Antwort2}",e.answer2||"keine Angabe"),i=document.createElement("div");i.className="ai-modal-overlay",i.innerHTML=`
    <div class="ai-modal">
      <div class="ai-modal-header">
        <h3>🤖 KI-Unterstützung</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="ai-modal-body">
        <div class="ai-dsgvo-notice">
          <strong>🔒 DSGVO-konform:</strong> Der Text wird nur in deine Zwischenablage kopiert.
          Du entscheidest selbst, ob und welche KI du nutzen möchtest.
          Keine Daten werden automatisch übertragen.
        </div>

        <p>Wähle deinen bevorzugten KI-Assistenten:</p>

        <div class="ai-buttons">
          <button class="btn btn-primary ai-chatgpt">💬 ChatGPT öffnen</button>
          <button class="btn btn-secondary ai-claude">🤖 Claude öffnen</button>
        </div>

        <div class="ai-prompt-section">
          <label>Prompt (wird in Zwischenablage kopiert):</label>
          <textarea class="ai-prompt-text" readonly rows="6">${w(n)}</textarea>
          <button class="btn btn-outline ai-copy-prompt">📋 Nur Prompt kopieren</button>
        </div>

        <div class="ai-alternatives">
          <details>
            <summary>💡 Alternative: Lokaler Textvorschlag</summary>
            <p>Klicke auf 💡 im Editor für einen automatisch generierten Vorschlag ohne externe KI.</p>
          </details>
        </div>
      </div>
    </div>
  `,document.body.appendChild(i),(a=i.querySelector(".close-modal"))==null||a.addEventListener("click",()=>i.remove()),i.addEventListener("click",l=>{l.target===i&&i.remove()}),(r=i.querySelector(".ai-chatgpt"))==null||r.addEventListener("click",()=>{navigator.clipboard.writeText(n).then(()=>{window.open("https://chat.openai.com/","_blank"),i.remove(),Oe("💬 ChatGPT geöffnet - Prompt in Zwischenablage kopiert!")})}),(o=i.querySelector(".ai-claude"))==null||o.addEventListener("click",()=>{navigator.clipboard.writeText(n).then(()=>{window.open("https://claude.ai/","_blank"),i.remove(),Oe("🤖 Claude geöffnet - Prompt in Zwischenablage kopiert!")})}),(c=i.querySelector(".ai-copy-prompt"))==null||c.addEventListener("click",()=>{navigator.clipboard.writeText(n).then(()=>{const l=i.querySelector(".ai-copy-prompt");l.textContent="✓ Kopiert!",setTimeout(()=>l.textContent="📋 Nur Prompt kopieren",2e3)})})}function Oe(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),3e3)}function es(e,t,s){const n=e.map(u=>({...u,generated:"",status:"pending",selected:!0}));let i=!1,a=new Set;const r=document.createElement("div");r.className="ai-modal-overlay";function o(){return`
      <div class="ai-modal ai-preview-modal ai-live-modal">
        <div class="ai-modal-header">
          <h3>KI-Generierung</h3>
          <div class="ai-progress-info" id="progressInfo">
            <span class="ai-progress-spinner"></span> <span id="progressText">0/${e.length} generiert</span>
          </div>
          <button class="close-modal">&times;</button>
        </div>
        <div class="ai-modal-body">
          <p class="ai-preview-intro" id="introText">
            <strong>Generiere Vorschläge...</strong> Du kannst bereits fertige Texte bearbeiten und auswählen.
          </p>

          <div class="ai-preview-actions-top">
            <button class="btn btn-sm" id="selectAllBtn">Alle auswählen</button>
            <button class="btn btn-sm btn-outline" id="selectNoneBtn">Keine auswählen</button>
            <button class="btn btn-sm btn-danger" id="stopGenerationBtn">Generation stoppen</button>
          </div>

          <div class="ai-preview-list ai-live-list" id="previewList">
            ${n.map((u,m)=>c(u,m)).join("")}
          </div>

          <div class="ai-preview-actions">
            <button class="btn btn-secondary" id="cancelPreviewBtn">Abbrechen</button>
            <button class="btn btn-primary" id="applyPreviewBtn" disabled>
              Ausgewählte übernehmen (<span id="selectedCount">0</span>)
            </button>
          </div>
        </div>
      </div>
    `}function c(u,m){return`
      <div class="ai-preview-item ${u.status}" data-index="${m}" id="preview-item-${m}">
        <label class="ai-preview-checkbox">
          <input type="checkbox" ${u.selected?"checked":""} ${u.status!=="done"?"disabled":""} data-index="${m}">
          <span class="checkmark"></span>
        </label>
        <div class="ai-preview-content">
          <div class="ai-preview-question-row">
            <span class="ai-preview-question">${w(u.question)}</span>
            <button class="btn-icon ai-regenerate-btn" data-index="${m}" title="Neu generieren" ${u.status==="generating"?"disabled":""}>🔄</button>
          </div>
          <div class="ai-preview-answers">
            <span class="answer-snippet" title="${w(u.answer1)}">${w(ue(u.answer1,30))}</span>
            <span class="answer-vs">+</span>
            <span class="answer-snippet" title="${w(u.answer2)}">${w(ue(u.answer2,30))}</span>
          </div>
          <div class="ai-preview-result" id="result-${m}">
            ${l(u,m)}
          </div>
          <details class="ai-item-prompt">
            <summary>Prompt anzeigen</summary>
            <pre class="ai-prompt-mini">${w(St(u.question,u.answer1,u.answer2))}</pre>
          </details>
        </div>
      </div>
    `}function l(u,m){return u.status==="pending"?'<div class="ai-preview-pending">Wartet...</div>':u.status==="generating"?'<div class="ai-preview-generating"><span class="ai-mini-spinner"></span> Generiere...</div>':u.status==="error"?'<div class="ai-preview-error">Fehler - klicke 🔄 zum erneuten Versuch</div>':`<textarea class="ai-preview-textarea" data-index="${m}" rows="4">${w(u.generated)}</textarea>`}function d(u){const m=n[u],p=r.querySelector(`#preview-item-${u}`);if(!p)return;p.className=`ai-preview-item ${m.status}`;const g=p.querySelector(`#result-${u}`);if(g){g.innerHTML=l(m,u);const P=g.querySelector(".ai-preview-textarea");P&&P.addEventListener("input",q=>{const fe=q.target;n[u].generated=fe.value})}const v=p.querySelector('input[type="checkbox"]');v&&(v.disabled=m.status!=="done",v.checked=m.selected);const S=p.querySelector(".ai-regenerate-btn");S&&(S.disabled=m.status==="generating"),h()}function h(){const u=n.filter(S=>S.status==="done").length,m=n.filter(S=>S.selected&&S.status==="done").length,p=r.querySelector("#progressText");p&&(p.textContent=`${u}/${e.length} generiert`);const g=r.querySelector("#selectedCount");g&&(g.textContent=String(m));const v=r.querySelector("#applyPreviewBtn");v&&(v.disabled=m===0)}function f(){const u=r.querySelector("#progressInfo");if(u){const g=n.filter(v=>v.status==="done").length;u.innerHTML=`<span id="progressText">${g} Vorschläge generiert</span>`}const m=r.querySelector("#introText");if(m){const g=n.filter(v=>v.status==="done").length;m.innerHTML=`<strong>${g} Vorschläge generiert.</strong> Wähle aus, welche du übernehmen möchtest:`}const p=r.querySelector("#stopGenerationBtn");p&&(p.style.display="none")}function b(){const u={};for(const m of n)m.status==="done"&&m.generated&&(u[m.question]=m.generated);Object.keys(u).length>0&&localStorage.setItem("swaf_ai_suggestions_cache",JSON.stringify(u))}function E(){try{const u=localStorage.getItem("swaf_ai_suggestions_cache");if(u){const m=JSON.parse(u);for(const p of n)m[p.question]&&!p.generated&&(p.generated=m[p.question],p.status="done",p.selected=!1)}}catch(u){console.warn("Could not load AI suggestions cache:",u)}}function M(){b(),i=!0,r.remove(),s()}function z(){var u,m,p,g,v,S,P,q,fe;(u=r.querySelector(".close-modal"))==null||u.addEventListener("click",M),(m=r.querySelector("#cancelPreviewBtn"))==null||m.addEventListener("click",M),(p=r.querySelector("#stopGenerationBtn"))==null||p.addEventListener("click",()=>{i=!0,f()}),(g=r.querySelector("#selectAllBtn"))==null||g.addEventListener("click",()=>{n.forEach((D,A)=>{if(D.status==="done"){D.selected=!0;const x=r.querySelector(`#preview-item-${A} input[type="checkbox"]`);x&&(x.checked=!0)}}),h()}),(v=r.querySelector("#selectNoneBtn"))==null||v.addEventListener("click",()=>{n.forEach((D,A)=>{D.selected=!1;const x=r.querySelector(`#preview-item-${A} input[type="checkbox"]`);x&&(x.checked=!1)}),h()}),(S=r.querySelector("#previewList"))==null||S.addEventListener("change",D=>{const A=D.target;if(A.type==="checkbox"&&A.dataset.index){const x=parseInt(A.dataset.index,10);n[x].selected=A.checked,h()}}),(P=r.querySelector("#previewList"))==null||P.addEventListener("input",D=>{const A=D.target;if(A.classList.contains("ai-preview-textarea")&&A.dataset.index){const x=parseInt(A.dataset.index,10);n[x].generated=A.value}}),(q=r.querySelector("#previewList"))==null||q.addEventListener("click",async D=>{const A=D.target;if(A.classList.contains("ai-regenerate-btn")&&A.dataset.index){const x=parseInt(A.dataset.index,10);await J(x)}}),(fe=r.querySelector("#applyPreviewBtn"))==null||fe.addEventListener("click",()=>{b(),i=!0,ee(),r.remove(),s()})}async function J(u){if(a.has(u))return;const m=n[u];a.add(u),m.status="generating",d(u);try{const p=await He(m.question,m.answer1,m.answer2);p?(m.generated=p,m.status="done",m.selected=!0):m.status="error"}catch(p){console.warn("Regeneration error:",p),m.status="error"}a.delete(u),d(u)}function ee(){let u=0;for(const m of n)if(m.selected&&m.status==="done"&&m.generated){const p=y.find(g=>g.id===m.rowId);p&&(p.comment=m.generated,p.included=!0,u++)}ve(t),u>0&&Oe(`${u} KI-Vorschläge übernommen`)}E(),r.innerHTML=o(),document.body.appendChild(r),z();for(let u=0;u<n.length;u++)n[u].status==="done"&&d(u);async function te(){for(let u=0;u<n.length&&!i;u++){const m=n[u];if(!(m.status==="done"&&m.generated)){m.status="generating",d(u);try{const p=await He(m.question,m.answer1,m.answer2);if(i)break;p?(m.generated=p,m.status="done"):(m.status="error",m.selected=!1)}catch(p){console.warn("Generation error:",p),m.status="error",m.selected=!1}d(u)}}f()}te()}function Je(){const t=y.filter(i=>i.included).filter(i=>i.answer1||i.answer2);let s=`Hi ${G} und ${j},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;const n={question:Math.max(10,...t.map(i=>i.question.length)),answer1:Math.max(G.length,...t.map(i=>(i.answer1||"-").length)),answer2:Math.max(j.length,...t.map(i=>(i.answer2||"-").length))};n.question=Math.min(n.question,30),n.answer1=Math.min(n.answer1,25),n.answer2=Math.min(n.answer2,25),s+=se("Frage",n.question)+" | ",s+=se(G,n.answer1)+" | ",s+=se(j,n.answer2)+" | ",s+=`Gemeinsamkeit
`,s+="-".repeat(n.question)+"-+-",s+="-".repeat(n.answer1)+"-+-",s+="-".repeat(n.answer2)+"-+-",s+="-".repeat(20)+`
`;for(const i of t){const a=he(i.comment);s+=se(ue(i.question,n.question),n.question)+" | ",s+=se(ue(i.answer1||"-",n.answer1),n.answer1)+" | ",s+=se(ue(i.answer2||"-",n.answer2),n.answer2)+" | ",s+=(a||"")+`
`}return s+=`
Ich freue mich über eure Rückmeldung!
`,s}function se(e,t){return e.length>=t?e.substring(0,t):e+" ".repeat(t-e.length)}function ue(e,t){return e?e.length<=t?e:e.substring(0,t-2)+"..":""}function ts(){const t=y.filter(n=>n.included).filter(n=>n.answer1||n.answer2);let s=`<!--StartFragment-->
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.5; }
  table { border-collapse: collapse; width: 100%; margin: 15px 0; }
  th { background-color: #009892; color: white; font-weight: bold; padding: 10px; text-align: left; border: 1px solid #ccc; }
  td { padding: 8px 10px; border: 1px solid #ccc; vertical-align: top; }
  tr:nth-child(even) { background-color: #f8f8f8; }
  .intro { margin-bottom: 20px; }
  .section-title { font-size: 14pt; font-weight: bold; color: #C3003B; margin: 20px 0 10px 0; }
  .commonality { color: #009892; font-style: italic; }
</style>
</head>
<body>
<div class="intro">
  Hi <strong>${w(G)}</strong> und <strong>${w(j)}</strong>,<br><br>
  hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde,
  <strong>ihr habt einige Gemeinsamkeiten und Interessen</strong>. Lest euch die Tabelle gerne durch.<br><br>
  <strong>Ihr findet:</strong> Eure Angaben, die Angaben der anderen Person, meine Einschätzung.<br><br>
  <em>Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus.</em>
  Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.
</div>

<div class="section-title">Eure Gemeinsamkeiten und Profile im Überblick</div>

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Frage</th>
      <th style="width: 25%;">${w(G)}</th>
      <th style="width: 25%;">${w(j)}</th>
      <th style="width: 25%;">Gemeinsamkeit</th>
    </tr>
  </thead>
  <tbody>
`;for(const n of t){const i=is(n.comment);s+=`    <tr>
      <td><strong>${w(n.question)}</strong></td>
      <td>${w(n.answer1)||"-"}</td>
      <td>${w(n.answer2)||"-"}</td>
      <td class="commonality">${i}</td>
    </tr>
`}return s+=`  </tbody>
</table>

<p><br>Ich freue mich über eure Rückmeldung!</p>
</body>
</html>
<!--EndFragment-->`,s}function Tt(){return y.filter(e=>e.included).map(e=>({question:e.question,answer1:e.answer1,answer2:e.answer2,commonality:e.comment}))}function mt(e){if(!e||typeof e!="string")return"Partner*in";const t=e.match(/\(([^)]+)\)/);if(t){const n=t[1].trim().split(/[\s,]+/)[0];if(n&&n.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(n))return n}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(e)){const s=e.split(/[\s,]+/)[0];if(s&&s.length>1)return s}return"Partner*in"}function w(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Qe(e){if(!e)return null;const t=e.match(/\[🗺️\]\((https?:\/\/[^)]+)\)/);return t?t[1]:null}function he(e){return e?e.replace(/\s*\[🗺️\]\(https?:\/\/[^)]+\)/,"").trim():""}function ns(e){const t=Qe(e);return t?`<a href="${t}" target="_blank" class="btn-icon map-link-btn" title="Route in Google Maps öffnen">🗺️</a>`:""}function ss(e){if(!e)return"";const t=Qe(e);if(t){const s=he(e);return`${w(s)} <a href="${t}" target="_blank" class="map-link">🗺️ Route</a>`}return w(e)}function is(e){if(!e)return"";const t=Qe(e);if(t){const s=he(e);return`${w(s)} <a href="${t}" style="color: #009892;">🗺️ Route anzeigen</a>`}return w(e)}function rs(){ht(),window.addEventListener("tandems-updated",ht),window.addEventListener("create-match",n=>{const i=n;cs(i.detail.profile1,i.detail.profile2)}),window.addEventListener("edit-tandem",n=>{je(n.detail.tandem)});const e=document.getElementById("closeMatchModal"),t=document.getElementById("cancelMatch"),s=document.getElementById("confirmMatch");e==null||e.addEventListener("click",Ge),t==null||t.addEventListener("click",Ge),s==null||s.addEventListener("click",ls)}function ht(){const e=document.getElementById("tandemList");if(!e)return;const t=Q();if(t.length===0){e.innerHTML='<p class="empty-state">Noch keine Tandems erstellt. Wähle zwei Profile aus, um ein Tandem zu erstellen.</p>';return}e.innerHTML=t.sort((s,n)=>new Date(n.created).getTime()-new Date(s.created).getTime()).map(s=>os(s)).join(""),e.querySelectorAll(".delete-tandem").forEach(s=>{s.addEventListener("click",n=>{n.stopPropagation();const i=s.getAttribute("data-tandem-id");i&&confirm("Tandem wirklich löschen?")&&wt(i)})}),e.querySelectorAll(".copy-tandem").forEach(s=>{s.addEventListener("click",n=>{n.stopPropagation();const i=s.getAttribute("data-tandem-id");i&&as(i)})}),e.querySelectorAll(".edit-tandem").forEach(s=>{s.addEventListener("click",n=>{n.stopPropagation();const i=s.getAttribute("data-tandem-id");if(i){const r=Q().find(o=>o.id===i);r&&je(r)}})}),e.querySelectorAll(".tandem-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button"))return;const a=s.getAttribute("data-tandem-id");if(a){const o=Q().find(c=>c.id===a);o&&je(o)}})})}function as(e){const s=Q().find(r=>r.id===e);if(!s)return;if(s.suggestionText){navigator.clipboard.writeText(s.suggestionText).then(()=>{gt("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")});return}const n=ft(s.profile1.name),i=ft(s.profile2.name);let a=`Hi ${n} und ${i},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;if(s.commonalities&&s.commonalities.length>0){const r={question:Math.max(10,...s.commonalities.map(o=>o.question.length)),answer1:Math.max(n.length,...s.commonalities.map(o=>(o.answer1||"-").length)),answer2:Math.max(i.length,...s.commonalities.map(o=>(o.answer2||"-").length))};r.question=Math.min(r.question,30),r.answer1=Math.min(r.answer1,25),r.answer2=Math.min(r.answer2,25),a+=ie("Frage",r.question)+" | ",a+=ie(n,r.answer1)+" | ",a+=ie(i,r.answer2)+" | ",a+=`Gemeinsamkeit
`,a+="-".repeat(r.question)+"-+-",a+="-".repeat(r.answer1)+"-+-",a+="-".repeat(r.answer2)+"-+-",a+="-".repeat(20)+`
`;for(const o of s.commonalities)a+=ie(Ne(o.question,r.question),r.question)+" | ",a+=ie(Ne(o.answer1||"-",r.answer1),r.answer1)+" | ",a+=ie(Ne(o.answer2||"-",r.answer2),r.answer2)+" | ",a+=(o.commonality||"")+`
`}a+=`
Ich freue mich über eure Rückmeldung!
`,navigator.clipboard.writeText(a).then(()=>{gt("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")})}function ie(e,t){return e.length>=t?e.substring(0,t):e+" ".repeat(t-e.length)}function Ne(e,t){return e?e.length<=t?e:e.substring(0,t-2)+"..":""}function ft(e){if(!e||typeof e!="string")return"Partner*in";const t=e.match(/\(([^)]+)\)/);if(t){const n=t[1].trim().split(/[\s,]+/)[0];if(n&&n.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(n))return n}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(e)){const s=e.split(/[\s,]+/)[0];if(s&&s.length>1)return s}return"Partner*in"}function gt(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),2e3)}function os(e){const t=new Date(e.created).toLocaleDateString("de-DE"),s=Ye(e.matchScore);return`
    <div class="tandem-card" data-tandem-id="${e.id}">
      <div class="header">
        <div class="title">${_(e.name)}</div>
        <div class="meta">
          <span class="stars">${s}</span>
          <span class="date">${t}</span>
          <button class="edit-tandem btn-icon" data-tandem-id="${e.id}" title="Bearbeiten">✏️</button>
          <button class="copy-tandem btn-icon" data-tandem-id="${e.id}" title="Text kopieren">📋</button>
          <button class="delete-tandem close-btn" data-tandem-id="${e.id}">&times;</button>
        </div>
      </div>
      <div class="profiles">
        <div class="profile">
          <strong>${_(e.profile1.name)}</strong>
        </div>
        <div class="profile">
          <strong>${_(e.profile2.name)}</strong>
        </div>
      </div>
      ${e.suggestionText?`
        <div class="suggestion-text">
          <strong>Vorschlagstext:</strong>
          <pre>${_(e.suggestionText)}</pre>
        </div>
      `:e.commonalities.length>0?`
        <div class="commonalities">
          <strong>Gemeinsamkeiten:</strong>
          ${e.commonalities.slice(0,3).map(n=>`
            <div class="commonality">• ${_(n.commonality)}</div>
          `).join("")}
          ${e.commonalities.length>3?`<div class="commonality">... und ${e.commonalities.length-3} weitere</div>`:""}
        </div>
      `:""}
    </div>
  `}function Ye(e){let t="";for(let s=0;s<5;s++)t+=`<span class="star ${s<e?"":"empty"}">★</span>`;return t}let ke=null;function cs(e,t){const s=document.getElementById("matchModal"),n=document.getElementById("matchPreview");if(!s||!n)return;ke={profile1:e,profile2:t};const i=Ue(e,t);n.innerHTML=`
    <div class="match-preview-content">
      <div class="match-profiles">
        <div class="profile">
          <strong>${_(e.name)}</strong>
        </div>
        <div class="match-icon">🤝</div>
        <div class="profile">
          <strong>${_(t.name)}</strong>
        </div>
      </div>
      <div class="match-score">
        <span>Match-Qualität: </span>
        <span class="stars">${Ye(i.score)}</span>
      </div>
      <div id="tandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    </div>
  `;const a=document.getElementById("tandemEditorContainer");a&&Mt(a,e,t),s.classList.add("visible")}function Ge(){const e=document.getElementById("matchModal");e==null||e.classList.remove("visible"),ke=null}function ls(){if(!ke)return;const{profile1:e,profile2:t}=ke,s=Ue(e,t),n=Je(),i=Tt(),a={id:crypto.randomUUID(),profile1:e,profile2:t,name:`${e.name} & ${t.name}`,created:new Date().toISOString(),commonalities:i,matchScore:s.score,suggestionText:n};qt(a),Ge(),Xe(`Tandem erstellt: ${e.name} & ${t.name}`)}function Xe(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),3e3)}function _(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let K=null;function je(e){var n,i,a,r;K=e;let t=document.getElementById("editTandemModal");t||(t=document.createElement("div"),t.id="editTandemModal",t.className="modal",t.innerHTML=`
      <div class="modal-content">
        <div class="modal-header">
          <h2>Tandem bearbeiten</h2>
          <button class="close-btn" id="closeEditModal">&times;</button>
        </div>
        <div class="modal-body" id="editTandemContent">
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" id="dissolveTandem">🗑️ Tandem auflösen</button>
          <button class="btn btn-outline" id="cancelEditTandem">Abbrechen</button>
          <button class="btn btn-primary" id="saveEditTandem">💾 Speichern</button>
        </div>
      </div>
    `,document.body.appendChild(t),(n=t.querySelector("#closeEditModal"))==null||n.addEventListener("click",Le),(i=t.querySelector("#cancelEditTandem"))==null||i.addEventListener("click",Le),(a=t.querySelector("#dissolveTandem"))==null||a.addEventListener("click",ds),(r=t.querySelector("#saveEditTandem"))==null||r.addEventListener("click",us));const s=document.getElementById("editTandemContent");if(s){const o=new Date(e.created).toLocaleDateString("de-DE");s.innerHTML=`
      <div class="edit-tandem-info">
        <div class="tandem-pair">
          <div class="profile-name">
            <strong>${_(e.profile1.name)}</strong>
          </div>
          <div class="pair-icon">🤝</div>
          <div class="profile-name">
            <strong>${_(e.profile2.name)}</strong>
          </div>
        </div>
        <div class="tandem-meta">
          <span class="stars">${Ye(e.matchScore)}</span>
          <span class="date">Erstellt am: ${o}</span>
        </div>
      </div>
      <div id="editTandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    `;const c=document.getElementById("editTandemEditorContainer");c&&Mt(c,e.profile1,e.profile2)}t.classList.add("visible")}function Le(){const e=document.getElementById("editTandemModal");e==null||e.classList.remove("visible"),K=null}function ds(){if(!K)return;const e=`Tandem zwischen "${K.profile1.name}" und "${K.profile2.name}" wirklich auflösen?

Die Profile können dann erneut gematcht werden.`;confirm(e)&&(wt(K.id),Le(),Xe("Tandem aufgelöst - Profile können neu gematcht werden"))}function us(){if(!K)return;const e=Je(),t=Tt();Dt(K.id,{suggestionText:e,commonalities:t}),Le(),Xe("Tandem aktualisiert")}const ms="modulepreload",hs=function(e,t){return new URL(e,t).href},pt={},fs=function(t,s,n){let i=Promise.resolve();if(s&&s.length>0){const r=document.getElementsByTagName("link"),o=document.querySelector("meta[property=csp-nonce]"),c=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));i=Promise.allSettled(s.map(l=>{if(l=hs(l,n),l in pt)return;pt[l]=!0;const d=l.endsWith(".css"),h=d?'[rel="stylesheet"]':"";if(!!n)for(let E=r.length-1;E>=0;E--){const M=r[E];if(M.href===l&&(!d||M.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${h}`))return;const b=document.createElement("link");if(b.rel=d?"stylesheet":ms,d||(b.as="script"),b.crossOrigin="",b.href=l,c&&b.setAttribute("nonce",c),document.head.appendChild(b),d)return new Promise((E,M)=>{b.addEventListener("load",E),b.addEventListener("error",()=>M(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return i.then(r=>{for(const o of r||[])o.status==="rejected"&&a(o.reason);return t().catch(a)})};function gs(){const e=document.getElementById("exportExcel"),t=document.getElementById("exportCSV"),s=document.getElementById("exportJSON"),n=document.getElementById("importBackup"),i=document.getElementById("manageProfilesBtn"),a=document.getElementById("deleteAllProfilesBtn");e==null||e.addEventListener("click",ps),t==null||t.addEventListener("click",bs),s==null||s.addEventListener("click",ws),n==null||n.addEventListener("click",vs),i==null||i.addEventListener("click",Es),a==null||a.addEventListener("click",ys),Be(),window.addEventListener("tandems-updated",Be),window.addEventListener("profiles-updated",Be)}function Be(){const e=document.getElementById("statsContainer");if(!e)return;const t=U(),s=Q(),n=Rt(),i=s.length>0?(s.reduce((a,r)=>a+r.matchScore,0)/s.length).toFixed(1):"-";e.innerHTML=`
    <div class="stat-item">
      <span class="stat-label">Profile:</span>
      <span class="stat-value">${t.length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Tandems:</span>
      <span class="stat-value">${s.length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Durchschn. Match-Qualität:</span>
      <span class="stat-value">${i} ★</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Gesamtpunkte:</span>
      <span class="stat-value">${n.totalPoints}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Streak:</span>
      <span class="stat-value">${n.streak} Tage</span>
    </div>
  `}async function ps(){const e=Q();if(e.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}try{const t=await fs(()=>import("./xlsx-D_0l8YDs.js"),[],import.meta.url),s=e.map(r=>({Tandem:r.name,"Person 1":r.profile1.name,"Person 2":r.profile2.name,"Match-Score":r.matchScore,Erstellt:new Date(r.created).toLocaleDateString("de-DE"),Gemeinsamkeiten:r.commonalities.map(o=>o.commonality).join("; ")})),n=t.utils.json_to_sheet(s),i=t.utils.book_new();t.utils.book_append_sheet(i,n,"Tandems");const a=`tandems_${new Date().toISOString().split("T")[0]}.xlsx`;t.writeFile(i,a)}catch(t){console.error("Excel export error:",t),alert("Fehler beim Excel-Export. Bitte versuche den CSV-Export.")}}function bs(){const e=Q();if(e.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}const t=["Tandem","Person 1","Person 2","Match-Score","Erstellt","Gemeinsamkeiten"],s=e.map(i=>[i.name,i.profile1.name,i.profile2.name,String(i.matchScore),new Date(i.created).toLocaleDateString("de-DE"),i.commonalities.map(a=>a.commonality).join("; ")]),n=[t.join(";"),...s.map(i=>i.map(a=>`"${a.replace(/"/g,'""')}"`).join(";"))].join(`
`);Ct(n,`tandems_${new Date().toISOString().split("T")[0]}.csv`,"text/csv;charset=utf-8")}function ws(){const e=Ft();Ct(e,`tandem-matcher-backup_${new Date().toISOString().split("T")[0]}.json`,"application/json")}function vs(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=t=>{var i;const s=(i=t.target.files)==null?void 0:i[0];if(!s)return;const n=new FileReader;n.onload=a=>{var r;try{const o=(r=a.target)==null?void 0:r.result;confirm("Achtung: Alle bestehenden Daten werden überschrieben. Fortfahren?")&&(Ot(o),alert("Backup erfolgreich wiederhergestellt!"),location.reload())}catch(o){alert("Fehler beim Wiederherstellen: "+o.message)}},n.readAsText(s)},e.click()}function Ct(e,t,s){const n=new Blob([e],{type:s}),i=URL.createObjectURL(n),a=document.createElement("a");a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)}function ys(){const e=U();if(e.length===0){alert("Keine Profile vorhanden.");return}confirm(`Möchtest du wirklich ALLE ${e.length} Profile löschen?

Diese Aktion kann nicht rückgängig gemacht werden!`)&&confirm("Bist du sicher? Alle Profile werden unwiderruflich gelöscht.")&&(Bt(),window.dispatchEvent(new Event("profiles-updated")),alert("Alle Profile wurden gelöscht."))}function Es(){const e=U();if(ce(),e.length===0){alert("Keine Profile vorhanden.");return}const t=document.createElement("div");t.className="modal visible",t.id="profileManageModal";function s(){const c=U(),l=ce();return c.map(d=>{const h=l.has(d.id),f=d.group==="local"?"Local":"Newcomer",b=d.group==="local"?"local":"newcomer";return`
        <div class="profile-manage-item ${h?"matched":""}" data-id="${d.id}">
          <div class="profile-manage-info">
            <span class="profile-manage-name">${ks(d.name)}</span>
            <span class="profile-manage-group ${b}">${f}</span>
            ${h?'<span class="profile-manage-badge">In Tandem</span>':""}
          </div>
          <button class="btn btn-sm btn-danger profile-delete-btn" data-id="${d.id}" ${h?'disabled title="Profil ist in einem Tandem"':""}>
            Löschen
          </button>
        </div>
      `}).join("")}t.innerHTML=`
    <div class="modal-content modal-lg">
      <div class="modal-header">
        <h2>Profile verwalten</h2>
        <button class="close-btn" id="closeProfileManageModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="profile-manage-header">
          <p><strong>${e.length}</strong> Profile geladen</p>
          <div class="profile-manage-actions">
            <input type="text" id="profileSearchInput" placeholder="Name suchen..." class="profile-search-input">
          </div>
        </div>
        <div class="profile-manage-list" id="profileManageList">
          ${s()}
        </div>
        <div class="profile-manage-footer">
          <button class="btn btn-secondary" id="closeProfileManageBtn">Schließen</button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(t);const n=t.querySelector("#closeProfileManageModal"),i=t.querySelector("#closeProfileManageBtn"),a=t.querySelector("#profileSearchInput"),r=t.querySelector("#profileManageList");function o(){t.remove()}n==null||n.addEventListener("click",o),i==null||i.addEventListener("click",o),t.addEventListener("click",c=>{c.target===t&&o()}),a==null||a.addEventListener("input",()=>{const c=a.value.toLowerCase(),l=r==null?void 0:r.querySelectorAll(".profile-manage-item");l==null||l.forEach(d=>{var f,b;const h=((b=(f=d.querySelector(".profile-manage-name"))==null?void 0:f.textContent)==null?void 0:b.toLowerCase())||"";d.style.display=h.includes(c)?"flex":"none"})}),r==null||r.addEventListener("click",c=>{var d,h;const l=c.target;if(l.classList.contains("profile-delete-btn")&&!l.hasAttribute("disabled")){const f=l.dataset.id;if(!f)return;const b=((h=(d=l.closest(".profile-manage-item"))==null?void 0:d.querySelector(".profile-manage-name"))==null?void 0:h.textContent)||"Unbekannt";if(confirm(`Profil "${b}" wirklich löschen?`)){Nt(f),window.dispatchEvent(new Event("profiles-updated")),r&&(r.innerHTML=s());const M=t.querySelector(".profile-manage-header p"),z=U();M&&(M.innerHTML=`<strong>${z.length}</strong> Profile geladen`),z.length===0&&(o(),alert("Alle Profile wurden gelöscht."))}}})}function ks(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}document.addEventListener("DOMContentLoaded",async()=>{console.log("Tandem-Matcher v2.0 initialisiert"),await zt(),Ls(),Ln(),Zt(),rn(),pn(),rs(),gs(),Is(),Ms(),As(),Ss()});function Ls(){const e=document.querySelectorAll(".tab"),t=document.querySelectorAll(".tab-content");e.forEach(s=>{s.addEventListener("click",()=>{const n=s.dataset.tab;n&&(e.forEach(i=>i.classList.remove("active")),s.classList.add("active"),t.forEach(i=>{i.classList.toggle("active",i.id===`${n}-tab`)}))})})}function Is(){const e=document.querySelectorAll(".view-btn"),t=document.getElementById("profileSidebar"),s=document.getElementById("mapContainer");e.forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.view;!i||!t||!s||(e.forEach(a=>a.classList.remove("active")),n.classList.add("active"),i==="list"?(t.classList.add("mobile-visible"),s.classList.add("mobile-hidden")):(t.classList.remove("mobile-visible"),s.classList.remove("mobile-hidden"),setTimeout(()=>{window.dispatchEvent(new Event("resize")),window.dispatchEvent(new Event("map-needs-resize"))},100)))})})}async function Ss(){const e=document.getElementById("ollamaStatus");if(e)try{const t=await At();t.available&&t.model?(e.className="ollama-status available",e.textContent=`Verfügbar: ${t.model}`):t.available?(e.className="ollama-status unavailable",e.textContent="Ollama läuft, aber kein Modell installiert"):(e.className="ollama-status unavailable",e.textContent="Nicht verfügbar - Ollama installieren")}catch{e.className="ollama-status unavailable",e.textContent="Nicht verfügbar"}}function As(){const e=document.getElementById("helpBtn"),t=document.getElementById("helpModal"),s=document.getElementById("closeHelpModal");e==null||e.addEventListener("click",()=>{t==null||t.classList.add("visible")}),s==null||s.addEventListener("click",()=>{t==null||t.classList.remove("visible")}),t==null||t.addEventListener("click",n=>{n.target===t&&t.classList.remove("visible")}),localStorage.getItem("swaf_help_shown")||setTimeout(()=>{t==null||t.classList.add("visible"),localStorage.setItem("swaf_help_shown","true")},500)}function Ms(){window.addEventListener("focus",async()=>{try{const e=await navigator.clipboard.readText();e&&e.includes('"version"')&&e.includes('"profiles"')&&confirm("Profile-Daten in der Zwischenablage erkannt. Importieren?")&&window.dispatchEvent(new CustomEvent("import-from-clipboard",{detail:e}))}catch{}})}window.TandemMatcher={version:"2.0.0"};
