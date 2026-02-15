(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const P={PROFILES:"swaf_profiles",TANDEMS:"swaf_tandems",GAMIFICATION:"swaf_gamification_stats",PLZ_CACHE:"swaf_plz_cache",SETTINGS:"swaf_settings"};let $=[],E=[],A=dt(),G=new Map;function dt(){return{totalMatches:0,todayMatches:0,lastMatchDate:"",streak:0,qualityScores:[],achievements:[],totalPoints:0}}async function $t(){try{const e=localStorage.getItem(P.PROFILES);e&&($=JSON.parse(e));const t=localStorage.getItem(P.TANDEMS);t&&(E=JSON.parse(t));const n=localStorage.getItem(P.GAMIFICATION);n&&(A={...dt(),...JSON.parse(n)});const s=localStorage.getItem(P.PLZ_CACHE);if(s){const i=JSON.parse(s);G=new Map(Object.entries(i))}console.log(`Storage initialized: ${$.length} profiles, ${E.length} tandems`)}catch(e){console.error("Error loading storage:",e)}}function we(){return[...$]}function de(e){return $.find(t=>t.id===e)}function St(e){const t=new Set($.map(s=>s.id)),n=new Set($.map(s=>ye(s.name)));for(const s of e){if(t.has(s.id))continue;const i=ye(s.name);if(n.has(i)){const a=$.find(r=>ye(r.name)===i);if(a){Mt(a,s);continue}}$.push(s),t.add(s.id),n.add(i)}ut()}function Mt(e,t){const n=new Set(e.fields.map(s=>s.question));for(const s of t.fields)n.has(s.question)||e.fields.push(s);e.pageType="Merged",e.timestamp=Math.max(e.timestamp,t.timestamp)}function ye(e){return e.toLowerCase().trim().replace(/\s+/g," ")}function ut(){localStorage.setItem(P.PROFILES,JSON.stringify($)),window.dispatchEvent(new CustomEvent("profiles-updated"))}function se(){return[...E]}function It(e){E.push(e),be(),A.totalMatches++,A.todayMatches++,A.lastMatchDate=new Date().toISOString().split("T")[0],A.qualityScores.push(e.matchScore),ht()}function mt(e){E=E.filter(t=>t.id!==e),be()}function Tt(e,t){const n=E.findIndex(s=>s.id===e);n!==-1&&(E[n]={...E[n],...t},be())}function ve(){const e=new Set;for(const t of E)e.add(t.profile1.id),e.add(t.profile2.id);return e}function V(e){return E.find(t=>t.profile1.id===e||t.profile2.id===e)}function be(){localStorage.setItem(P.TANDEMS,JSON.stringify(E)),window.dispatchEvent(new CustomEvent("tandems-updated"))}function Ct(){return{...A}}function ht(){localStorage.setItem(P.GAMIFICATION,JSON.stringify(A))}function xt(e){return G.get(e)}function xe(e,t){G.set(e,t);const n=Object.fromEntries(G);localStorage.setItem(P.PLZ_CACHE,JSON.stringify(n))}function zt(e){if(!e.profiles||!Array.isArray(e.profiles))throw new Error("Ungültiges Datenformat");const t=$.length;return St(e.profiles),$.length-t}function Pt(){return JSON.stringify({profiles:$,tandems:E,gamificationStats:A,plzCache:Object.fromEntries(G),exportedAt:new Date().toISOString(),version:"2.0"})}function At(e){const t=JSON.parse(e);t.profiles&&($=t.profiles),t.tandems&&(E=t.tandems),t.gamificationStats&&(A=t.gamificationStats),t.plzCache&&(G=new Map(Object.entries(t.plzCache))),ut(),be(),ht(),localStorage.setItem(P.PLZ_CACHE,JSON.stringify(Object.fromEntries(G)))}function D(e){const t=e.fields.find(n=>n.question.toLowerCase().includes("plz")||n.question.toLowerCase().includes("postleitzahl"));if(t!=null&&t.answer){const n=t.answer.match(/\d{5}/);return n?n[0]:null}for(const n of e.fields){const s=n.answer.match(/\b\d{5}\b/);if(s)return s[0]}return null}function ne(e){const t=[/newcomer/i,/geflüchtet/i,/migrant/i,/zugewandert/i,/immigrant/i,/einwander/i,/neuankommend/i,/geflohene?/i,/refugee/i,/asyl/i,/zuwander/i],n=[/\blocal\b/i,/einheimisch/i,/hier.*geboren/i,/alteingesessen/i,/ortsansässig/i],s=a=>t.some(r=>r.test(a)),i=a=>n.some(r=>r.test(a));if(e.pageType){if(s(e.pageType))return"newcomer";if(i(e.pageType))return"local"}if(e.name){if(s(e.name))return"newcomer";if(i(e.name))return"local"}if(e.url){if(s(e.url))return"newcomer";if(i(e.url))return"local"}for(const a of e.fields){const r=a.question.toLowerCase(),o=a.answer;if(r.includes("gruppe")||r.includes("status")||r.includes("wer bist")||r.includes("local")||r.includes("newcomer")||r.includes("herkunft")||r.includes("aufnahme")||r.includes("teilnehmer")){if(s(o))return"newcomer";if(i(o))return"local"}}for(const a of e.fields)if(s(a.answer))return"newcomer";return"local"}function Q(e){const t=e.fields.find(s=>s.question.toLowerCase().includes("alter")&&!s.question.toLowerCase().includes("unterschied")&&!s.question.toLowerCase().includes("präferenz"));if(t!=null&&t.answer){const s=t.answer.match(/\d+/);if(s){const i=parseInt(s[0]);if(i>=16&&i<=100)return i}}const n=e.fields.find(s=>s.question.toLowerCase().includes("geboren")||s.question.toLowerCase().includes("geburtsjahr"));if(n!=null&&n.answer){const s=n.answer.match(/(19|20)\d{2}/);if(s){const i=parseInt(s[0]),r=new Date().getFullYear()-i;if(r>=16&&r<=100)return r}}return null}function ue(e){const t=e.fields.find(n=>n.question.toLowerCase().includes("geschlecht")&&!n.question.toLowerCase().includes("präferenz")&&!n.question.toLowerCase().includes("partner"));if(t!=null&&t.answer){const n=t.answer.toLowerCase();if(n.includes("männlich")||n.includes("mann")||n==="m")return"male";if(n.includes("weiblich")||n.includes("frau")||n==="w"||n==="f")return"female";if(n.includes("divers")||n.includes("sonstig")||n.includes("andere"))return"other"}return null}const Bt={sport:["sport","fitness","training","gym","workout"],fussball:["fußball","fussball","soccer","kicken"],musik:["musik","music","konzert","singen","instrument"],lesen:["lesen","bücher","reading","books"],kochen:["kochen","cooking","backen","küche"],reisen:["reisen","travel","urlaub","reise"],kino:["kino","filme","movies","cinema","film"],gaming:["gaming","videospiele","spiele","zocken","games"],wandern:["wandern","hiking","spazieren","natur"],fotografie:["fotografie","photography","fotos","fotografieren"],kunst:["kunst","art","malen","zeichnen","museum"],tanzen:["tanzen","dance","dancing","tanz"],yoga:["yoga","meditation","entspannung"],schwimmen:["schwimmen","swimming","baden"],radfahren:["radfahren","fahrrad","cycling","bike","rad"],laufen:["laufen","joggen","running","jogging"],sprachen:["sprachen","languages","sprachkurs"],essen:["essen","food","kulinarik","restaurant"],feiern:["feiern","party","ausgehen","club","bar"],natur:["natur","nature","garten","pflanzen","outdoor"]};function Ve(e){const t=e.toLowerCase().trim();for(const[n,s]of Object.entries(Bt))if(s.some(i=>t.includes(i)))return n;return t.replace(/[^a-zäöüß]/gi,"")}const qt={"01":{lat:51.05,lng:13.74,city:"Dresden"},"02":{lat:51.15,lng:14.97,city:"Görlitz"},"03":{lat:51.76,lng:14.33,city:"Cottbus"},"04":{lat:51.34,lng:12.38,city:"Leipzig"},"05":{lat:51.22,lng:6.78,city:"Düsseldorf"},"06":{lat:51.48,lng:11.97,city:"Halle"},"07":{lat:50.93,lng:11.59,city:"Jena"},"08":{lat:50.72,lng:12.49,city:"Zwickau"},"09":{lat:50.83,lng:12.92,city:"Chemnitz"},10:{lat:52.52,lng:13.41,city:"Berlin Mitte"},11:{lat:52.52,lng:13.41,city:"Berlin"},12:{lat:52.45,lng:13.43,city:"Berlin Süd"},13:{lat:52.57,lng:13.35,city:"Berlin Nord"},14:{lat:52.39,lng:13.07,city:"Potsdam"},15:{lat:52.34,lng:14.55,city:"Frankfurt/Oder"},16:{lat:52.98,lng:13.79,city:"Oranienburg"},17:{lat:53.91,lng:13.38,city:"Greifswald"},18:{lat:54.09,lng:12.14,city:"Rostock"},19:{lat:53.63,lng:11.41,city:"Schwerin"},20:{lat:53.55,lng:10,city:"Hamburg"},21:{lat:53.47,lng:9.78,city:"Hamburg Süd"},22:{lat:53.6,lng:10.05,city:"Hamburg Nord"},23:{lat:53.87,lng:10.69,city:"Lübeck"},24:{lat:54.32,lng:10.14,city:"Kiel"},25:{lat:53.87,lng:9.09,city:"Itzehoe"},26:{lat:53.14,lng:8.22,city:"Oldenburg"},27:{lat:53.08,lng:8.81,city:"Bremen Nord"},28:{lat:53.08,lng:8.81,city:"Bremen"},29:{lat:52.97,lng:10.57,city:"Celle"},30:{lat:52.37,lng:9.74,city:"Hannover"},31:{lat:52.23,lng:9.52,city:"Hannover Süd"},32:{lat:52.02,lng:8.53,city:"Herford"},33:{lat:51.93,lng:8.38,city:"Bielefeld"},34:{lat:51.31,lng:9.5,city:"Kassel"},35:{lat:50.56,lng:8.67,city:"Gießen"},36:{lat:50.55,lng:9.68,city:"Fulda"},37:{lat:51.53,lng:9.93,city:"Göttingen"},38:{lat:52.27,lng:10.52,city:"Braunschweig"},39:{lat:52.13,lng:11.63,city:"Magdeburg"},40:{lat:51.23,lng:6.78,city:"Düsseldorf"},41:{lat:51.19,lng:6.44,city:"Mönchengladbach"},42:{lat:51.26,lng:7.15,city:"Wuppertal"},43:{lat:51.36,lng:7.35,city:"Hagen"},44:{lat:51.51,lng:7.47,city:"Dortmund"},45:{lat:51.45,lng:7.01,city:"Essen"},46:{lat:51.54,lng:6.77,city:"Oberhausen"},47:{lat:51.43,lng:6.76,city:"Duisburg"},48:{lat:51.96,lng:7.63,city:"Münster"},49:{lat:52.28,lng:8.05,city:"Osnabrück"},50:{lat:50.94,lng:6.96,city:"Köln"},51:{lat:50.99,lng:7.13,city:"Köln Ost"},52:{lat:50.78,lng:6.08,city:"Aachen"},53:{lat:50.73,lng:7.1,city:"Bonn"},54:{lat:49.75,lng:6.64,city:"Trier"},55:{lat:50,lng:8.27,city:"Mainz"},56:{lat:50.36,lng:7.6,city:"Koblenz"},57:{lat:50.87,lng:8.02,city:"Siegen"},58:{lat:51.36,lng:7.47,city:"Hagen"},59:{lat:51.66,lng:8.38,city:"Hamm"},60:{lat:50.11,lng:8.68,city:"Frankfurt"},61:{lat:50.22,lng:8.62,city:"Frankfurt Nord"},62:{lat:50.1,lng:8.77,city:"Bad Homburg"},63:{lat:50,lng:8.96,city:"Offenbach"},64:{lat:49.87,lng:8.65,city:"Darmstadt"},65:{lat:50.08,lng:8.24,city:"Wiesbaden"},66:{lat:49.24,lng:7,city:"Saarbrücken"},67:{lat:49.45,lng:8.44,city:"Ludwigshafen"},68:{lat:49.49,lng:8.47,city:"Mannheim"},69:{lat:49.41,lng:8.69,city:"Heidelberg"},70:{lat:48.78,lng:9.18,city:"Stuttgart"},71:{lat:48.73,lng:9.11,city:"Stuttgart Süd"},72:{lat:48.52,lng:9.05,city:"Tübingen"},73:{lat:48.8,lng:9.47,city:"Esslingen"},74:{lat:49.14,lng:9.22,city:"Heilbronn"},75:{lat:48.89,lng:8.69,city:"Pforzheim"},76:{lat:49.01,lng:8.4,city:"Karlsruhe"},77:{lat:48.47,lng:7.94,city:"Offenburg"},78:{lat:47.99,lng:8.52,city:"Villingen"},79:{lat:47.99,lng:7.85,city:"Freiburg"},80:{lat:48.14,lng:11.58,city:"München"},81:{lat:48.11,lng:11.6,city:"München Süd"},82:{lat:48.05,lng:11.47,city:"München West"},83:{lat:47.86,lng:11.97,city:"Rosenheim"},84:{lat:48.44,lng:12.12,city:"Landshut"},85:{lat:48.4,lng:11.74,city:"Freising"},86:{lat:48.37,lng:10.9,city:"Augsburg"},87:{lat:47.73,lng:10.31,city:"Kempten"},88:{lat:47.66,lng:9.48,city:"Friedrichshafen"},89:{lat:48.4,lng:10,city:"Ulm"},90:{lat:49.45,lng:11.08,city:"Nürnberg"},91:{lat:49.6,lng:11.01,city:"Erlangen"},92:{lat:49.02,lng:12.1,city:"Amberg"},93:{lat:49.02,lng:12.1,city:"Regensburg"},94:{lat:48.57,lng:13.45,city:"Passau"},95:{lat:50.06,lng:11.78,city:"Bayreuth"},96:{lat:50.1,lng:10.88,city:"Bamberg"},97:{lat:49.79,lng:9.95,city:"Würzburg"},98:{lat:50.68,lng:10.93,city:"Suhl"},99:{lat:50.98,lng:11.03,city:"Erfurt"}};function ft(e,t,n,s){const a=ce(n-e),r=ce(s-t),o=Math.sin(a/2)*Math.sin(a/2)+Math.cos(ce(e))*Math.cos(ce(n))*Math.sin(r/2)*Math.sin(r/2);return 6371*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}function ce(e){return e*(Math.PI/180)}let Ee=0;const Ze=1e3;async function H(e){var i;if(!e||e.length<2)return null;const t=e.replace(/\D/g,"").substring(0,5);if(t.length<5)return Je(t);const n=xt(t);if(n)return n;const s=Je(t);if(s)return xe(t,s),s;try{const a=Date.now();a-Ee<Ze&&await new Promise(c=>setTimeout(c,Ze-(a-Ee))),Ee=Date.now(),console.log(`🌐 Lade PLZ ${t} von OpenStreetMap...`);const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&country=DE&postalcode=${t}&limit=1`,{headers:{"User-Agent":"SwaF Tandem Matcher v2.0"}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const o=await r.json();if(o&&o.length>0){const c={lat:parseFloat(o[0].lat),lng:parseFloat(o[0].lon),city:((i=o[0].display_name)==null?void 0:i.split(",")[0])||void 0};return xe(t,c),console.log(`✅ PLZ ${t} gefunden:`,c),c}}catch(a){console.warn(`⚠️ Nominatim API Fehler für PLZ ${t}:`,a)}return null}function Je(e){const t=e.substring(0,2),n=qt[t];if(!n)return null;let s=0,i=0;if(e.length>=5){const r=parseInt(e.substring(2,5),10)||0,o=r*2.399963,c=.02+r%100*3e-4;s=c*Math.cos(o),i=c*Math.sin(o)*1.4}const a={lat:n.lat+s,lng:n.lng+i,city:n.city};return xe(e,a),a}async function Nt(e,t){if(e===t)return 0;const n=await H(e),s=await H(t);if(!(!n||!s))return ft(n.lat,n.lng,s.lat,s.lng)}const le=new Map;async function Rt(e,t){if(!e||!t)return null;if(e===t)return{distanceKm:0,drivingMinutes:0,transitMinutes:0,cyclingMinutes:0,walkingMinutes:0};const n=`${e}-${t}`,s=le.get(n);if(s)return s;const i=`${t}-${e}`,a=le.get(i);if(a)return a;const r=await H(e),o=await H(t);if(!r||!o)return null;try{const m=`https://router.project-osrm.org/route/v1/driving/${r.lng},${r.lat};${o.lng},${o.lat}?overview=false`;console.log(`🚗 Berechne Entfernung ${e} → ${t}...`);const g=await fetch(m);if(!g.ok)throw new Error(`HTTP ${g.status}`);const b=await g.json();if(b.code==="Ok"&&b.routes&&b.routes.length>0){const y=b.routes[0],I=y.distance/1e3,F=Math.round(y.duration/60),re=Math.round(F*1.8),ae=Math.round(I*4),oe=Math.round(I*12),j={distanceKm:Math.round(I*10)/10,drivingMinutes:F,transitMinutes:re,cyclingMinutes:ae,walkingMinutes:oe};return le.set(n,j),console.log(`✅ Entfernung: ${j.distanceKm} km`),j}}catch(m){console.warn("⚠️ OSRM API Fehler:",m)}const c=ft(r.lat,r.lng,o.lat,o.lng),d=Math.round(c*1.3*10)/10,u={distanceKm:d,drivingMinutes:Math.round(d*1.2),transitMinutes:Math.round(d*2.2),cyclingMinutes:Math.round(d*4),walkingMinutes:Math.round(d*12)};return le.set(n,u),u}function Ot(e){if(e.distanceKm===0)return"Gleiche PLZ";const t=[];return t.push(`${e.distanceKm} km Entfernung`),e.drivingMinutes<=120&&t.push(`ca. ${ke(e.drivingMinutes)} mit Auto`),e.transitMinutes<=180&&t.push(`ca. ${ke(e.transitMinutes)} mit ÖPNV`),e.walkingMinutes<=45&&t.push(`ca. ${ke(e.walkingMinutes)} zu Fuß`),t.join(", ")}function ke(e){if(e<60)return`${e} min`;const t=Math.floor(e/60),n=e%60;return n===0?`${t} h`:`${t}:${n.toString().padStart(2,"0")} h`}function _t(e,t){const n=`https://www.google.com/maps/dir/${e.lat},${e.lng}/${t.lat},${t.lng}`,s=`https://www.bvg.de/de/verbindungen/verbindungssuche?start=${e.lat},${e.lng}&destination=${t.lat},${t.lng}`;return{google:n,bvg:s,mvv:"https://www.mvv-muenchen.de/fahrplanauskunft/index.html#routing",hvv:"https://www.hvv.de/de/fahrplaene/abruf-fahrplaninfos/"}}let M=null,O=new Map,Re=null;function Dt(){document.getElementById("map")&&(M=L.map("map").setView([51.1657,10.4515],6),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:18}).addTo(M),Qe(),window.addEventListener("profiles-updated",Qe),window.addEventListener("tandems-updated",Ft),window.addEventListener("profile-selected",t=>{Kt(t.detail.profileId)}),window.addEventListener("profile-deselected",()=>{Wt()}))}function Ft(){const e=ve();O.forEach((t,n)=>{var i;const s=(i=t.getElement())==null?void 0:i.querySelector(".marker-icon");s&&(e.has(n)?s.classList.add("matched"):s.classList.remove("matched"))})}async function Qe(){if(!M)return;O.forEach(n=>n.remove()),O.clear();const e=we(),t=new Map;for(const n of e){const s=D(n);s&&(t.has(s)||t.set(s,[]),t.get(s).push(n))}for(const[n,s]of t){const i=await H(n);if(!(!i||!isFinite(i.lat)||!isFinite(i.lng)))for(let a=0;a<s.length;a++){const r=s[a],o=Gt(a,s.length),c=i.lat+o.lat,l=i.lng+o.lng,d=Ht(r,c,l);d.addTo(M),O.set(r.id,d)}}}function Gt(e,t){if(t===1)return{lat:0,lng:0};const n=.002,s=.001*Math.floor(e/8),i=n+s,r=e*2.399963;return{lat:i*Math.cos(r),lng:i*Math.sin(r)*1.4}}function Ht(e,t,n){const s=ne(e),i=e.name.split(" ").map(u=>u[0]).join("").substring(0,2).toUpperCase(),r=ve().has(e.id),o=r?"matched":"",c=L.divIcon({className:"marker-wrapper",html:`<div class="marker-icon ${s} ${o}" data-profile-id="${e.id}">${i}</div>`,iconSize:[30,30],iconAnchor:[15,15]}),l=L.marker([t,n],{icon:c}),d=jt(e,s,r);return l.bindPopup(d,{maxWidth:300}),l.on("click",()=>{window.dispatchEvent(new CustomEvent("profile-clicked",{detail:{profileId:e.id}}))}),l}function jt(e,t,n=!1){const s=Q(e),i=D(e),a=ue(e),r=$e(e,["hobby","hobbies","freizeit","interessen"]),o=$e(e,["sprache","sprachen","language"]),c=$e(e,["beruf","arbeit","job","tätigkeit","beschäftigung"]),l=a==="male"?"M":a==="female"?"W":a==="other"?"D":"",d=t==="local"?"Local":"Newcomer",u=t==="local"?"local":"newcomer";let m=`
    <div class="marker-popup">
      <div class="popup-header">
        <strong>${ee(e.name)}</strong>
        <span class="group-badge ${u}">${d}</span>
        ${n?'<span class="matched-badge">✓ Vermittelt</span>':""}
      </div>
      <div class="popup-meta">
        ${s?`<span>${s} Jahre</span>`:""}
        ${l?`<span>${l}</span>`:""}
        ${i?`<span>PLZ ${i}</span>`:""}
      </div>
  `;if(n){const g=V(e.id);if(g){const b=g.profile1.id===e.id?g.profile2.name:g.profile1.name;m+=`<div class="popup-field tandem-info"><strong>Tandem mit:</strong> ${ee(b)}</div>`}}return c&&(m+=`<div class="popup-field"><strong>Beruf:</strong> ${ee(Le(c,50))}</div>`),o&&(m+=`<div class="popup-field"><strong>Sprachen:</strong> ${ee(Le(o,80))}</div>`),r&&(m+=`<div class="popup-field"><strong>Interessen:</strong> ${ee(Le(r,80))}</div>`),m+=`
      <div class="popup-action">
        ${n?"<em>Bereits vermittelt</em>":"<em>Klicken für Smart Match</em>"}
      </div>
    </div>
  `,m}function Le(e,t){return e.length<=t?e:e.substring(0,t-3)+"..."}function ee(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function $e(e,t){for(const n of t){const s=new RegExp(n,"i"),i=e.fields.find(a=>s.test(a.question));if(i!=null&&i.answer)return i.answer}return null}function Kt(e){Re=e,O.forEach((n,s)=>{var a;const i=(a=n.getElement())==null?void 0:a.querySelector(".marker-icon");i&&i.classList.toggle("selected",s===e)});const t=O.get(e);t&&M&&M.setView(t.getLatLng(),Math.max(M.getZoom(),10))}function Wt(){Re=null,O.forEach(e=>{var n;const t=(n=e.getElement())==null?void 0:n.querySelector(".marker-icon");t&&t.classList.remove("selected","compatible","incompatible","top-match")})}function Ut(e,t,n){O.forEach((s,i)=>{var r;if(i===Re)return;const a=(r=s.getElement())==null?void 0:r.querySelector(".marker-icon");a&&(a.classList.remove("compatible","incompatible","top-match"),n.includes(i)?a.classList.add("compatible","top-match"):e.includes(i)?a.classList.add("compatible"):t.includes(i)&&a.classList.add("incompatible"))})}function Vt(){M&&setTimeout(()=>{M==null||M.invalidateSize()},100)}window.addEventListener("map-needs-resize",Vt);let S={},w=new Set,_=!1;function Zt(){x(),Jt();const e=document.getElementById("filter-gender"),t=document.getElementById("filter-group"),n=document.getElementById("filter-search");e==null||e.addEventListener("change",()=>{S.gender=e.value,x()}),t==null||t.addEventListener("change",()=>{S.group=t.value,x()}),n==null||n.addEventListener("input",()=>{S.searchText=n.value,x()}),window.addEventListener("profiles-updated",x),window.addEventListener("tandems-updated",x),window.addEventListener("profile-clicked",s=>{gt(s.detail.profileId)})}function Jt(){const e=document.querySelector(".sidebar-header");if(!e||document.getElementById("manualMatchBtn"))return;const t=document.createElement("button");t.id="manualMatchBtn",t.className="btn btn-sm",t.innerHTML="👆 Manuell matchen",t.title="Zwei Profile zum Matchen auswählen",t.addEventListener("click",()=>{_=!_,w.clear(),window.dispatchEvent(new CustomEvent("profile-deselected")),ze(),x()}),e.appendChild(t)}function ze(){const e=document.getElementById("manualMatchBtn");e&&(_?(e.classList.add("active"),e.innerHTML=w.size===0?"✋ Wähle 2 Profile...":w.size===1?"✋ Noch 1 wählen...":"✅ Matchen!"):(e.classList.remove("active"),e.innerHTML="👆 Manuell matchen"))}function x(){const e=document.getElementById("profileList"),t=document.getElementById("profileCount");if(!e)return;const n=Qt();if(t&&(t.textContent=String(n.length)),n.length===0){e.innerHTML='<p class="empty-state">Keine Profile gefunden. Importiere Profile über den Button oben.</p>';return}e.innerHTML=n.map(s=>Yt(s)).join(""),e.querySelectorAll(".profile-card").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-profile-id");i&&gt(i)})})}function Qt(){let e=we();if(S.gender&&S.gender!=="all"&&(e=e.filter(t=>ue(t)===S.gender)),S.group&&S.group!=="all"&&(e=e.filter(t=>ne(t)===S.group)),S.searchText){const t=S.searchText.toLowerCase();e=e.filter(n=>{const s=D(n)||"";return n.name.toLowerCase().includes(t)||s.includes(t)})}return e}function Yt(e){const t=D(e)||"-",n=ne(e),s=Q(e),i=w.has(e.id),r=ve().has(e.id),o=r?V(e.id):null,c=o?o.profile1.id===e.id?o.profile2.name:o.profile1.name:null,l=_&&i?Array.from(w).indexOf(e.id)+1:0;return`
    <div class="profile-card ${i?"selected":""} ${r?"matched":""} ${_?"manual-mode":""}" data-profile-id="${e.id}">
      ${l>0?`<div class="selection-number">${l}</div>`:""}
      <div class="name">${Ye(e.name)}</div>
      <div class="meta">
        <span class="group-badge ${n}">${n==="local"?"Local":"Newcomer"}</span>
        <span>PLZ: ${t}</span>
        ${s?`<span>${s} Jahre</span>`:""}
      </div>
      ${r?`
        <div class="matched-info">
          <span class="matched-badge">✓ Vermittelt</span>
          ${c?`<span class="partner-name">mit ${Ye(c.split(" ")[0])}</span>`:""}
        </div>
      `:""}
    </div>
  `}function gt(e){const t=de(e);if(!t)return;const n=V(e);if(n&&!_){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:n.id,tandem:n,profileId:e}}));return}if(_){if(w.has(e))w.delete(e);else{if(w.size>=2){const s=Array.from(w)[0];w.delete(s)}w.add(e)}if(ze(),w.size===2){const s=Array.from(w),i=de(s[0]),a=de(s[1]);if(i&&a){const r=V(i.id),o=V(a.id);if(r||o){alert("Eines der Profile ist bereits in einem Tandem. Bitte zuerst das bestehende Tandem auflösen.");return}window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:i,profile2:a}})),_=!1,w.clear(),ze()}}x();return}if(w.has(e))w.delete(e),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:e}}));else{if(w.size>0){const s=Array.from(w)[0];w.clear(),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:s}}))}w.add(e),window.dispatchEvent(new CustomEvent("profile-selected",{detail:{profileId:e,profile:t}}))}x()}function Ye(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const Xt=["vorname","nachname","name","vollständiger name","e-mail-adresse","e-mail","email","telefonnummer","telefon","id","user-id","teilnehmer-id","profil-id","gruppe","standort","region","west","ost","nord","süd","vermittler","vermittler*in","durchgeführt von","durchgeführt","datum/uhrzeit","datum","uhrzeit","termin","terminart","status","bearbeitungsstatus","anmeldestatus","infoabend","infonachmittag","format","aufnahmegespräch","standort-newsletter","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","portal-link","wie wirkt die person auf dich","eindruck","bewertung","wie schätzt du ein","einschätzung","beurteilung","sind weitere schritte nötig","nächste schritte","follow-up","aufnahmegespräch datum","gespräch datum","plz","postleitzahl","ort","stadt","köln","berlin","münchen","ausgeschlossen","ausgetreten","pausiert","vermittelt","unvermittelt","angemeldet","beginn","ende"];function en(e){const t=e.toLowerCase().trim();return t.length<3||t==="geschlecht"||t==="dein geschlecht"?!0:Xt.some(n=>t.includes(n)||n.includes(t))}function v(e,t){for(const n of t){const s=new RegExp(n,"i"),i=e.fields.find(a=>s.test(a.question)&&!en(a.question));if(i!=null&&i.answer)return i.answer}return null}function Oe(e,t){const n=[],s=ne(e),i=ne(t);if(s===i)return{compatible:!1,score:0,failReason:"same_group",failDetails:`Beide sind ${s==="local"?"Locals":"Newcomer"} - nur interkulturelle Matches möglich`,softFactsScore:0,softFactsMax:15};const a=tn(e,t);if(!a.pass)return{compatible:!1,score:0,failReason:"age_preference",failDetails:a.reason,softFactsScore:0,softFactsMax:15};const r=nn(e,t);if(!r.pass)return{compatible:!1,score:0,failReason:"gender_preference",failDetails:r.reason,softFactsScore:0,softFactsMax:15};const o=sn(e,t);if(!o.pass)return{compatible:!1,score:0,failReason:"time_overlap",failDetails:o.reason,softFactsScore:0,softFactsMax:15};const c=[],l=rn(e,t,n,c),d=15;return{compatible:!0,score:Math.min(5,Math.round(l/d*5)),softFactsScore:l,softFactsMax:d,details:n.join("; "),positiveFactors:c.slice(0,3)}}function tn(e,t){const n=Q(e),s=Q(t);if(!n||!s)return{pass:!0};const i=Math.abs(n-s),a=v(e,["alter.*unterschied","alter.*tandem","wie groß.*alter"]),r=v(t,["alter.*unterschied","alter.*tandem","wie groß.*alter"]);if(a){const o=a.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${i} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${i} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&s<n)return{pass:!1,reason:`${e.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&s>n)return{pass:!1,reason:`${e.name}: Präferiert jüngeren Partner`}}if(r){const o=r.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${i} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${i} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&n<s)return{pass:!1,reason:`${t.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&n>s)return{pass:!1,reason:`${t.name}: Präferiert jüngeren Partner`}}return{pass:!0}}function nn(e,t){const n=ue(e),s=ue(t),i=v(e,["geschlecht.*tandem","geschlecht.*partner"]),a=v(t,["geschlecht.*tandem","geschlecht.*partner"]);if(i&&s){const r=i.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&s!=="female")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${i}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&s!=="male")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${i}" nicht erfüllt`}}}if(a&&n){const r=a.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&n!=="female")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${a}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&n!=="male")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${a}" nicht erfüllt`}}}return{pass:!0}}function sn(e,t){const n=v(e,["zeit.*treffen","zeit.*tandem","wann.*zeit"]),s=v(t,["zeit.*treffen","zeit.*tandem","wann.*zeit"]);if(!n||!s)return{pass:!0};const i=n.toLowerCase(),a=s.toLowerCase();return i.includes("flexibel")||a.includes("flexibel")?{pass:!0}:["morgens","mittags","nachmittags","abends","unter der woche","wochenende"].filter(c=>i.includes(c)&&a.includes(c)).length===0?{pass:!1,reason:"Keine gemeinsamen Zeitfenster gefunden"}:{pass:!0}}function rn(e,t,n,s){let i=0;const a=D(e),r=D(t);if(a&&r){const f=parseInt(a.substring(0,2)),T=parseInt(r.substring(0,2)),N=Math.abs(f-T);a===r?(i+=3,n.push("Gleiche PLZ"),s.push("Gleiche PLZ")):N===0?(i+=2.5,n.push("Gleiche Region (< 10 km)"),s.push("Nah beieinander")):N===1?(i+=2,n.push("Benachbarte Region"),s.push("Benachbarte Region")):N<=3?(i+=1.5,n.push("Nahe Region")):N<=5?i+=1:i+=.5}const o=Q(e),c=Q(t);if(o&&c){const f=Math.abs(o-c);f<=3?(i+=2,n.push(`Sehr ähnliches Alter (±${f} Jahre)`),s.push(f===0?"Gleich alt":`Nur ${f}J Unterschied`)):f<=5?(i+=1.8,n.push(`Ähnliches Alter (±${f} Jahre)`),s.push("Ähnliches Alter")):f<=10?i+=1.5:f<=15?i+=1:f<=20&&(i+=.5)}const l=v(e,["geschlecht.*tandem","geschlecht.*partner"]),d=v(t,["geschlecht.*tandem","geschlecht.*partner"]);(l||d)&&(i+=1,n.push("Geschlechtspräferenz erfüllt")),i+=1,n.push("Interkulturell");const u=v(e,["hobby","hobbies","hobbys"]),m=v(t,["hobby","hobbies","hobbys"]);if(u&&m){const f=an(u,m);if(f.length>0){const T=Math.min(2,f.length*.4);i+=T,f.length>=3?(n.push("Viele gemeinsame Hobbys"),s.push("Viele gemeinsame Hobbys")):f.length>=2?(n.push("Mehrere gemeinsame Hobbys"),s.push("Gemeinsame Hobbys")):n.push("Gemeinsame Hobby-Interessen")}}const g=v(e,["freizeit(?!.*vermittler)"]),b=v(t,["freizeit(?!.*vermittler)"]);if(g&&b){const f=Xe(g,b);f.length>=3?(i+=1.5,n.push("Ähnliche Freizeitinteressen")):f.length>=1&&(i+=.75)}const y=v(e,["themen.*interessieren","interess.*themen"]),I=v(t,["themen.*interessieren","interess.*themen"]);if(y&&I){const f=["politik","kunst","kultur","technologie","sport","musik","natur","reisen","essen","kochen","wissenschaft","geschichte","literatur"],T=y.toLowerCase(),N=I.toLowerCase(),Y=f.filter(X=>T.includes(X)&&N.includes(X));Y.length>=2?(i+=1.5,n.push("Mehrere gemeinsame Interessensgebiete"),s.push("Ähnliche Interessen")):Y.length===1&&(i+=.75,n.push("Gemeinsame Interessensgebiete"))}const F=v(e,["freundschaft.*wichtig","wichtig.*freundschaft"]),re=v(t,["freundschaft.*wichtig","wichtig.*freundschaft"]);if(F&&re){const f=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","loyalität","treue"],T=F.toLowerCase(),N=re.toLowerCase(),Y=f.filter(X=>T.includes(X)&&N.includes(X));Y.length>=2?(i+=1.5,n.push("Ähnliche Wertvorstellungen"),s.push("Ähnliche Werte")):Y.length===1&&(i+=.75)}const ae=v(e,["tandem.*vorstellung(?!.*geschlecht)"]),oe=v(t,["tandem.*vorstellung(?!.*geschlecht)"]);if(ae&&oe){const f=Xe(ae,oe);f.length>=2?(i+=1,n.push("Ähnliche Tandem-Vorstellungen")):f.length>=1&&(i+=.5)}const j=v(e,["community-event","event.*unternehmen"]),Ue=v(t,["community-event","event.*unternehmen"]);if(j&&Ue){const f=j.toLowerCase(),T=Ue.toLowerCase();(f.includes("ja")||f.includes("gerne"))&&(T.includes("ja")||T.includes("gerne"))&&(i+=.5)}return i}function an(e,t){const n=e.split(/[,;]/).map(i=>Ve(i.trim())).filter(Boolean),s=t.split(/[,;]/).map(i=>Ve(i.trim())).filter(Boolean);return n.filter(i=>s.some(a=>i===a))}function Xe(e,t){const n=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","mich","gerne","sehr","auch","aber","dass","wenn","weil","nicht","mehr","noch","schon","immer"]),s=e.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!n.has(a)),i=t.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!n.has(a));return s.filter(a=>i.some(r=>a===r||a.includes(r)||r.includes(a)))}let k=null,Z=[];function on(){document.getElementById("smartMatchPanel");const e=document.getElementById("closeSmartMatch");e==null||e.addEventListener("click",()=>{et(),window.dispatchEvent(new CustomEvent("profile-deselected"))}),window.addEventListener("profile-selected",async t=>{k=t.detail.profile;const s=V(k.id);if(s){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:s.id,tandem:s,profileId:k.id}})),k=null;return}await cn(),ln(),hn()}),window.addEventListener("profile-deselected",()=>{k=null,Z=[],et()})}async function cn(){if(!k)return;const e=we(),t=ve(),n=[];for(const s of e){if(s.id===k.id||t.has(s.id))continue;const i=Oe(k,s),a=D(k),r=D(s);let o,c;a&&r&&(o=await Nt(a,r),o!==void 0&&(c=o<1?"<1 km":`${Math.round(o)} km`)),n.push({profile:s,matchResult:i,distance:o,distanceText:c})}n.sort((s,i)=>s.matchResult.compatible!==i.matchResult.compatible?s.matchResult.compatible?-1:1:s.matchResult.compatible?i.matchResult.score-s.matchResult.score:0),Z=n}function ln(){const e=document.getElementById("smartMatchPanel"),t=document.getElementById("selectedProfileName"),n=document.getElementById("smartMatchContent");!e||!t||!n||!k||(t.textContent=k.name,n.innerHTML=dn(),e.classList.add("visible"),n.querySelectorAll(".match-item").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-profile-id");i&&mn(i)})}))}function et(){const e=document.getElementById("smartMatchPanel");e==null||e.classList.remove("visible")}function dn(){if(Z.length===0)return'<p class="empty-state">Keine anderen Profile zum Matchen vorhanden.</p>';const e=Z.filter(s=>s.matchResult.compatible),t=Z.filter(s=>!s.matchResult.compatible);let n="";return e.length>0&&(n+='<div class="match-section"><h4>Passende Matches</h4>',n+=e.map(s=>tt(s,!0)).join(""),n+="</div>"),t.length>0&&(n+='<div class="match-section"><h4>Unpassend (Hard Facts)</h4>',n+=t.map(s=>tt(s,!1)).join(""),n+="</div>"),n}function tt(e,t){const{profile:n,matchResult:s,distanceText:i}=e,a=un(s.score);let r="";if(!t&&s.failReason){const c={age_preference:"🎂",gender_preference:"⚧️",time_overlap:"⏰",same_group:"👥"},l={age_preference:"Alter-Präferenz",gender_preference:"Geschlecht-Präferenz",time_overlap:"Keine Zeit-Überschneidung",same_group:"Gleiche Gruppe"},d=c[s.failReason]||"⚠️",u=l[s.failReason]||s.failReason;let m="";s.failDetails&&(m=`<div class="reason-details">${Se(s.failDetails)}</div>`),r=`
      <div class="reason-box">
        <span class="reason-icon">${d}</span>
        <span class="reason-label">${u}</span>
        ${m}
      </div>
    `}let o="";return t&&s.positiveFactors&&s.positiveFactors.length>0&&(o=`
      <div class="positive-factors">
        ${s.positiveFactors.slice(0,2).map(c=>`<span class="factor">✓ ${Se(c)}</span>`).join("")}
      </div>
    `),`
    <div class="match-item ${t?"":"incompatible"}" data-profile-id="${n.id}">
      <div class="stars">${t?a:"---"}</div>
      <div class="info">
        <div class="name">${Se(n.name)}</div>
        <div class="match-meta">
          ${i?`<span class="distance">📍 ${i}</span>`:""}
        </div>
        ${o}
        ${r}
      </div>
    </div>
  `}function un(e){let t="";for(let n=0;n<5;n++)t+=`<span class="star ${n<e?"":"empty"}">★</span>`;return t}function mn(e){const t=de(e);!t||!k||window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:k,profile2:t}}))}function hn(){const e=[],t=[],n=[];for(const s of Z)s.matchResult.compatible?(e.push(s.profile.id),s.matchResult.score>=4&&n.push(s.profile.id)):t.push(s.profile.id);Ut(e,t,n)}function Se(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let J=null;function fn(){const e=document.getElementById("importModal"),t=document.getElementById("importBtn"),n=document.getElementById("closeImportModal"),s=document.getElementById("pasteClipboard"),i=document.getElementById("dropZone"),a=document.getElementById("fileInput"),r=document.getElementById("cancelImport"),o=document.getElementById("confirmImport"),c=document.getElementById("importPreview");t==null||t.addEventListener("click",()=>nt()),n==null||n.addEventListener("click",()=>Me()),e==null||e.addEventListener("click",l=>{l.target===e&&Me()}),s==null||s.addEventListener("click",async()=>{try{const l=await navigator.clipboard.readText();Pe(l)}catch{alert("Fehler beim Lesen der Zwischenablage. Bitte erlaube den Zugriff.")}}),i==null||i.addEventListener("click",()=>a==null?void 0:a.click()),i==null||i.addEventListener("dragover",l=>{l.preventDefault(),i.classList.add("dragover")}),i==null||i.addEventListener("dragleave",()=>{i.classList.remove("dragover")}),i==null||i.addEventListener("drop",l=>{var u;l.preventDefault(),i.classList.remove("dragover");const d=(u=l.dataTransfer)==null?void 0:u.files[0];d&&st(d)}),a==null||a.addEventListener("change",()=>{var d;const l=(d=a.files)==null?void 0:d[0];l&&st(l)}),r==null||r.addEventListener("click",()=>{J=null,c&&(c.hidden=!0)}),o==null||o.addEventListener("click",()=>{if(J)try{const l=zt(J);alert(`${l} neue Profile importiert!`),Me()}catch(l){alert("Fehler beim Import: "+l.message)}}),window.addEventListener("import-from-clipboard",l=>{const d=l;nt(),Pe(d.detail)})}function nt(){const e=document.getElementById("importModal"),t=document.getElementById("importPreview");e==null||e.classList.add("visible"),t&&(t.hidden=!0),J=null}function Me(){const e=document.getElementById("importModal");e==null||e.classList.remove("visible"),J=null}function st(e){if(!e.name.endsWith(".json")){alert("Bitte eine JSON-Datei auswählen.");return}const t=new FileReader;t.onload=n=>{var i;const s=(i=n.target)==null?void 0:i.result;Pe(s)},t.onerror=()=>{alert("Fehler beim Lesen der Datei.")},t.readAsText(e)}function Pe(e){try{let t;if(e.includes("SWAF_PROFILE_START")?t=gn(e):t=JSON.parse(e),!t.profiles||!Array.isArray(t.profiles))throw new Error("Ungültiges Format: profiles Array nicht gefunden");J=t,pn(t)}catch(t){alert("Fehler beim Verarbeiten der Daten: "+t.message)}}function gn(e){const t=[],n=/SWAF_PROFILE_START([\s\S]*?)SWAF_PROFILE_END/g;let s;for(;(s=n.exec(e))!==null;)try{const i=JSON.parse(s[1].trim());t.push({id:crypto.randomUUID(),url:i.url||"",name:i.name||"Unbekannt",pageType:i.pageType||"Hauptprofil",timestamp:i.timestamp||Date.now(),fields:i.fields||[]})}catch{}return{version:"1.0",exportedAt:new Date().toISOString(),profiles:t}}function pn(e){const t=document.getElementById("importPreview"),n=document.getElementById("previewCount"),s=document.getElementById("previewList");!t||!n||!s||(n.textContent=String(e.profiles.length),s.innerHTML=e.profiles.slice(0,10).map(i=>`<div class="preview-item">${wn(i.name)} (${i.fields.length} Felder)</div>`).join(""),e.profiles.length>10&&(s.innerHTML+=`<div class="preview-item">... und ${e.profiles.length-10} weitere</div>`),t.hidden=!1)}function wn(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const _e="https://api.swaf.koeln/ollama",vn="ollama",bn="Tandem2026Matcher";function De(){return{"Content-Type":"application/json",Authorization:"Basic "+btoa(`${vn}:${bn}`)}}async function pt(){try{return(await fetch(`${_e}/api/tags`,{method:"GET",headers:De(),signal:AbortSignal.timeout(5e3)})).ok}catch{return!1}}async function wt(){var e;try{const t=await fetch(`${_e}/api/tags`,{headers:De()});return t.ok?((e=(await t.json()).models)==null?void 0:e.map(s=>s.name))||[]:[]}catch{return[]}}const Ie="mistral:7b";async function Fe(){const e=await wt();return e.length===0?Ie:e.some(t=>t.includes("mistral"))?e.find(t=>t.includes("mistral"))||Ie:e[0]||Ie}async function vt(e,t,n,s){var r;const i=s||await Fe();if(!i)return null;const a=`Du bist ein freundlicher Tandem-Vermittler bei "Start with a Friend". Analysiere die folgenden zwei Antworten auf die Frage "${e}" und schreibe EINEN kurzen Satz (max. 20 Wörter) der die Gemeinsamkeit oder Verbindung beschreibt. Schreibe natürlich und persönlich, ohne Emojis, so als würdest du zwei Freunde einander vorstellen. Wenn es keine erkennbare Gemeinsamkeit gibt, antworte nur mit "---".

Person 1: "${t}"
Person 2: "${n}"

Gemeinsamkeit:`;try{const o=await fetch(`${_e}/api/generate`,{method:"POST",headers:De(),body:JSON.stringify({model:i,prompt:a,stream:!1,options:{temperature:.7,num_predict:60}})});if(!o.ok)return console.warn("Ollama API error:",o.status),null;const l=((r=(await o.json()).response)==null?void 0:r.trim())||null;return!l||l==="---"||l.includes("keine Gemeinsamkeit")||l.includes("keine erkennbare")?null:l.replace(/^["']|["']$/g,"").trim()}catch(o){return console.warn("Ollama generation failed:",o),null}}async function yn(e,t){const n=new Map,s=await Fe();if(!s)return console.warn("No Ollama model available"),n;for(let i=0;i<e.length;i++){const a=e[i];if(t==null||t(i+1,e.length),!a.answer1||!a.answer2)continue;const r=await vt(a.question,a.answer1,a.answer2,s);r&&n.set(a.question,r),await new Promise(o=>setTimeout(o,100))}return n}async function bt(){if(!await pt())return{available:!1,model:null,models:[]};const t=await wt();return{available:!0,model:await Fe(),models:t}}let p=[],B="",q="",C=new Set;const En='Schreibe hierzu einen kurzen Text. Die Frage zu den Antworten lautet {Frage}. Schreibe, wie die Antworten zusammenpassen könnten bzw. gebe Beispiele aus. Hier die Antworten: Person 1 - {Antwort1}, Person 2 - {Antwort2}. Schreibe den Text nach diesem Beispiel: "Ihr habt beide angegeben, dass ihr gerne kocht - ob mit Freund*innen oder alleine. Also los! Probiert doch einmal gemeinsam neue Rezepte. Außerdem geht ihr beide gerne Spazieren. Nach dem Essen sollst du Ruhn, oder 1.000 Schritte tun. Also habt ihr ja quasi schon einen Tagesplan ;) Weil ihr beide gerne auch kulturelle Dinge macht, wie in das Theater/Museum/oder auf andere Kulturveranstaltungen geht - schaut doch mal auf rausgegangen.de was es in Köln so die nächsten Tage gibt. Oder guckt bei uns im Eventportal: www.startwithafriend.de/events" - Nenne KEINE Namen oder andere Personenbezeichnungen.',Ae=["Person","Sprachen & Herkunft","Beruf & Bildung","Hobbys & Interessen","Tandem-Wünsche","Verfügbarkeit","Sonstiges"],kn=["vermittler","durchgeführt von","status","terminart","anmeldestatus","bearbeitungsstatus","infoabend","infonachmittag","aufnahmegespräch datum","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","wie wirkt die person","eindruck","einschätzung","bewertung","nächste schritte","follow-up","user-id","profil-id","teilnehmer-id","women_kpi","kpi","integrationskurs","besuchst du gerade einen integrationskurs","vorgeschlagene termine","suggested_appointments","telefonnummer","phone_number","telefon","responsible_user","responsible","registration_interview","appointment_type","appointment_info","region","department_region","department","process_history","process_current_step","flucht","einwandungserfahrung","immigration_experience","create_uid","existing_tandem_count","tandem_count","birthday","geburtstag","geburtsdatum","group","gruppe","e-mail","email","e-mail-adresse","emailadresse","nachname","last_name","lastname","familienname","full_name","fullname","vollständiger name","datum/uhrzeit","datum uhrzeit","anmeldedatum","registrierungsdatum"],Ln=["name","full name"];function $n(e){const t=e.toLowerCase();return t.includes("name")||t.includes("alter")||t.includes("geschlecht")||t.includes("geboren")||t.includes("plz")||t.includes("postleitzahl")?"Person":t.includes("sprache")||t.includes("herkunft")||t.includes("land")||t.includes("deutschland")||t.includes("seit wann")?"Sprachen & Herkunft":t.includes("beruf")||t.includes("arbeit")||t.includes("studium")||t.includes("studiert")||t.includes("abschluss")||t.includes("branche")||t.includes("was machst du gerade")||t.includes("was hast du vorher gemacht")||t.includes("was hast du gelernt")||t.includes("in zukunft")||t.includes("zukunft gerne machen")?"Beruf & Bildung":t.includes("hobby")||t.includes("freizeit")||t.includes("interesse")||t.includes("ausprobieren")||t.includes("was machst du gerne")||t.includes("freundschaft")||t.includes("wichtig")||t.includes("event")||t.includes("anbieten")||t.includes("themen")||t.includes("community")||t.includes("unternehmen")?"Hobbys & Interessen":t.includes("tandem")||t.includes("swaf")||t.includes("mitmachen")||t.includes("warum")||t.includes("vorstellung")||t.includes("geschlecht")&&t.includes("partner")?"Tandem-Wünsche":t.includes("zeit")||t.includes("treffen")||t.includes("wann")||t.includes("erreichen")||t.includes("kontakt")||t.includes("bewegst")?"Verfügbarkeit":"Sonstiges"}function Sn(e){const t=e.toLowerCase().trim();return Ln.includes(t)?!0:kn.some(n=>t.includes(n))}function Be(e){return e?["übersprungen","keine angabe","k.a.","n/a","-","","egal","keine","null","undefined"].includes(e.toLowerCase().trim()):!0}const Mn=["name","vorname","nachname","plz","postleitzahl","standort","ort","adresse","wohnort","geschlecht","gender","alter","age","geburt","in deutschland geboren","in welchem land","herkunftsland","geburtsland","woher kommst du","country","altersunterschied","geschlechterpräferenz","alterspräferenz"];function In(e){const t=e.toLowerCase();return Mn.some(n=>t.includes(n))}function yt(e,t,n){B=rt(t.name),q=rt(n.name);const s=new Map;function i(r,o,c){if(Sn(r)||!o||Be(o))return;const l=Cn(r),d=s.get(l);d?(c?d.answer1?d.answer1!==o&&(d.answer1+="; "+o):d.answer1=o:d.answer2?d.answer2!==o&&(d.answer2+="; "+o):d.answer2=o,d.mergedQuestions.includes(r)||d.mergedQuestions.push(r)):s.set(l,{displayQuestion:r,answer1:c?o:"",answer2:c?"":o,mergedQuestions:[r]})}for(const r of t.fields)i(r.question,r.answer||"",!0);for(const r of n.fields)i(r.question,r.answer||"",!1);p=[];let a=0;for(const[r,o]of s){if(!o.answer1&&!o.answer2)continue;const c=xn(r,o.displayQuestion),l=he(c,o.answer1,o.answer2),d=l.length>0||o.answer1&&o.answer2;p.push({id:`row-${a}`,question:c,answer1:o.answer1,answer2:o.answer2,comment:l,selected:!1,included:d,collapsed:!d,category:$n(c)}),a++}p.sort((r,o)=>{const c=Ae.indexOf(r.category),l=Ae.indexOf(o.category);return c!==l?c-l:r.included!==o.included?r.included?-1:1:r.question.localeCompare(o.question)}),C.clear(),me(e);for(const r of p)(r.question.toLowerCase().includes("plz")||r.question.toLowerCase().includes("postleitzahl"))&&r.answer1&&r.answer2&&_n(r.answer1,r.answer2,r.id)}const Tn=[{key:"alter",patterns:["alter","age","wie alt bist du","wie alt","dein alter","geburtsjahr"]},{key:"geschlecht",patterns:["geschlecht","gender","dein geschlecht","welches geschlecht"]},{key:"altersunterschied",patterns:["altersunterschied","alterspräferenz","age_difference","max_age_difference","maximaler altersunterschied","altersunterschied zum tandempartner"]},{key:"geschlechterpräferenz",patterns:["geschlechterpräferenz","gender_preference","geschlecht des tandems","geschlecht tandempartner","welches geschlecht soll","gewünschtes geschlecht"]},{key:"vorname",patterns:["vorname","firstname","first_name","first name"]},{key:"plz",patterns:["plz","postleitzahl","postal code","zip","zipcode","deine plz"]},{key:"hobbys",patterns:["hobbys","hobbies","hobby"]},{key:"freizeit",patterns:["freizeit","freizeitaktivitäten"]},{key:"interessen",patterns:["interessen","interests"]},{key:"sprachen",patterns:["sprachen","languages","sprache","welche sprachen sprichst du","welche sprachen"]},{key:"herkunftsland",patterns:["herkunftsland","herkunft","woher kommst du","aus welchem land","country"]},{key:"seit_wann_deutschland",patterns:["seit wann in deutschland","seit wann bist du in deutschland","wie lange in deutschland","in deutschland seit"]}],it={vorname:"Vorname",alter:"Alter",geschlecht:"Geschlecht",plz:"PLZ",hobbys:"Hobbys",freizeit:"Freizeitaktivitäten",interessen:"Interessen",sprachen:"Sprachen",herkunftsland:"Herkunftsland",seit_wann_deutschland:"Seit wann in Deutschland",altersunterschied:"Maximaler Altersunterschied",geschlechterpräferenz:"Geschlecht des Tandempartners"};function Cn(e){const t=e.toLowerCase().replace(/[?!.,:*_-]/g," ").replace(/\s+/g," ").trim(),n=[...Tn].sort((s,i)=>{const a=Math.max(...s.patterns.map(o=>o.length));return Math.max(...i.patterns.map(o=>o.length))-a});for(const s of n)for(const i of s.patterns)if(t===i||t.startsWith(i+" ")||t.endsWith(" "+i)||t.includes(" "+i+" "))return s.key;return t}function xn(e,t){return it[e]?it[e]:t}function me(e){const t=C.size,n=p.filter(i=>i.included).length;p.length-n;const s=new Map;for(const i of p)s.has(i.category)||s.set(i.category,[]),s.get(i.category).push(i);e.innerHTML=`
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
        <span class="toolbar-info">${n} von ${p.length} Feldern</span>
      </div>

      <div class="editor-table">
        ${Ae.map(i=>{const a=s.get(i);if(!a||a.length===0)return"";const r=a.filter(o=>o.included).length;return`
            <div class="category-section">
              <div class="category-header">
                <span>${i}</span>
                <span class="category-count">${r}/${a.length}</span>
              </div>
              ${a.map(o=>zn(o)).join("")}
            </div>
          `}).join("")}
      </div>

      <div class="editor-preview">
        <div class="preview-header">
          <strong>E-Mail-Vorschau (${n} Felder):</strong>
          <button class="btn btn-sm" id="copyEmailBtn">📋 Kopieren</button>
        </div>
        <div class="preview-content" id="emailPreview">
          ${Ge()}
        </div>
      </div>
    </div>
  `,Pn(e)}function zn(e){const t=C.has(e.id),n=e.comment&&e.comment.length>0;return`
    <div class="editor-row ${t?"selected":""} ${e.included?"included":"excluded"} ${e.collapsed?"collapsed":""}" data-row-id="${e.id}">
      <div class="row-header">
        <label class="include-toggle" title="In E-Mail einschließen">
          <input type="checkbox" class="include-checkbox" data-row-id="${e.id}" ${e.included?"checked":""}>
          <span class="toggle-slider"></span>
        </label>
        <div class="row-question" data-row-id="${e.id}">
          <span class="collapse-icon">${e.collapsed?"▸":"▾"}</span>
          <span class="question-text">${h(e.question)}</span>
          ${n?'<span class="has-comment-indicator">✓</span>':""}
        </div>
        <div class="row-quick-actions">
          <input type="checkbox" class="merge-checkbox" data-row-id="${e.id}" ${t?"checked":""} title="Für Zusammenführen auswählen">
        </div>
      </div>

      <div class="row-details ${e.collapsed?"hidden":""}">
        <div class="row-answers">
          <div class="answer-cell">
            <div class="answer-label">${h(B)}:</div>
            <textarea
              class="answer-input answer1-input"
              data-row-id="${e.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${h(e.answer1)}</textarea>
          </div>
          <div class="answer-cell">
            <div class="answer-label">${h(q)}:</div>
            <textarea
              class="answer-input answer2-input"
              data-row-id="${e.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${h(e.answer2)}</textarea>
          </div>
        </div>

        <div class="row-comment">
          <textarea
            class="comment-input"
            data-row-id="${e.id}"
            placeholder="Gemeinsamkeit / Kommentar eingeben..."
            rows="2"
          >${h(ie(e.comment))}</textarea>
          ${Un(e.comment)}
          <div class="comment-buttons">
            <button class="btn-icon smart-suggest" data-row-id="${e.id}" title="Lokaler Textvorschlag">💡</button>
            <button class="btn-icon ai-assist" data-row-id="${e.id}" title="KI-Unterstützung (ChatGPT/Claude)">🤖</button>
          </div>
        </div>
      </div>
    </div>
  `}function Pn(e){var s,i,a;e.querySelectorAll(".include-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;const d=p.find(u=>u.id===l);if(d){d.included=c.checked,K(e);const u=e.querySelector(`.editor-row[data-row-id="${l}"]`);u&&(u.classList.toggle("included",d.included),u.classList.toggle("excluded",!d.included))}})}),e.querySelectorAll(".merge-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;c.checked?C.add(l):C.delete(l);const d=e.querySelector("#mergeRowsBtn");d&&(d.disabled=C.size<2,d.textContent=`⊕ Zusammenführen (${C.size})`)})}),e.querySelectorAll(".row-question").forEach(r=>{r.addEventListener("click",o=>{const c=r.dataset.rowId;if(!c)return;const l=p.find(d=>d.id===c);if(l){l.collapsed=!l.collapsed;const d=e.querySelector(`.editor-row[data-row-id="${c}"]`);if(d){d.classList.toggle("collapsed",l.collapsed);const u=d.querySelector(".row-details"),m=d.querySelector(".collapse-icon");u&&u.classList.toggle("hidden",l.collapsed),m&&(m.textContent=l.collapsed?"▸":"▾")}}})});function t(r){r.style.height="auto",r.style.height=Math.min(r.scrollHeight,200)+"px"}e.querySelectorAll(".answer1-input").forEach(r=>{const o=r;t(o),o.addEventListener("input",c=>{const l=c.target;t(l);const d=l.dataset.rowId;if(!d)return;const u=p.find(m=>m.id===d);u&&(u.answer1=l.value,K(e))})}),e.querySelectorAll(".answer2-input").forEach(r=>{const o=r;t(o),o.addEventListener("input",c=>{const l=c.target;t(l);const d=l.dataset.rowId;if(!d)return;const u=p.find(m=>m.id===d);u&&(u.answer2=l.value,K(e))})}),e.querySelectorAll(".comment-input").forEach(r=>{t(r)}),e.querySelectorAll(".comment-input").forEach(r=>{r.addEventListener("input",o=>{const c=o.target,l=c.dataset.rowId;if(!l)return;const d=p.find(u=>u.id===l);if(d){if(d.comment=c.value,c.value.length>0&&!d.included){d.included=!0;const u=e.querySelector(`.include-checkbox[data-row-id="${l}"]`);u&&(u.checked=!0)}K(e)}})}),e.querySelectorAll(".smart-suggest").forEach(r=>{r.addEventListener("click",async o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=p.find(u=>u.id===c);if(!l)return;l.comment=he(l.question,l.answer1,l.answer2);const d=e.querySelector(`.comment-input[data-row-id="${c}"]`);if(d&&(d.value=l.comment),K(e),(!l.comment||l.comment.length<10)&&l.answer1&&l.answer2&&await pt()){r.textContent="...";const m=await vt(l.question,l.answer1,l.answer2);m&&(l.comment=m,l.included=!0,d&&(d.value=l.comment),K(e)),r.textContent="💡"}})}),e.querySelectorAll(".ai-assist").forEach(r=>{r.addEventListener("click",o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=p.find(d=>d.id===c);l&&jn(l)})}),(s=e.querySelector("#mergeRowsBtn"))==null||s.addEventListener("click",()=>{An(),me(e)}),(i=e.querySelector("#regenerateBtn"))==null||i.addEventListener("click",()=>{for(const r of p)r.comment=he(r.question,r.answer1,r.answer2),r.included=r.comment.length>0;me(e)});const n=e.querySelector("#ollamaBtn");bt().then(r=>{r.available?(n.disabled=!1,n.textContent="KI generieren",n.title="Mit Mistral KI generieren"):(n.textContent="KI nicht verfügbar",n.title="KI-Server nicht erreichbar")}).catch(()=>{n.textContent="KI nicht verfügbar",n.title="Fehler bei der Verbindung zum KI-Server"}),n==null||n.addEventListener("click",async()=>{n.disabled=!0,n.textContent="Generiere...";const r=p.filter(o=>o.answer1&&o.answer2&&!In(o.question)).map(o=>({question:o.question,answer1:o.answer1,answer2:o.answer2,rowId:o.id}));try{const o=await yn(r.map(c=>({question:c.question,answer1:c.answer1,answer2:c.answer2})),(c,l)=>{n.textContent=`Generiere ${c}/${l}...`});Kn(o,r,e)}catch(o){console.error("Ollama generation failed:",o),alert("Fehler bei der KI-Generierung. Ist der KI-Server erreichbar?")}n.disabled=!1,n.textContent="KI generieren"}),(a=e.querySelector("#copyEmailBtn"))==null||a.addEventListener("click",()=>{const r=He(),o=Wn();if(navigator.clipboard&&typeof ClipboardItem<"u"){const c=[new ClipboardItem({"text/html":new Blob([o],{type:"text/html"}),"text/plain":new Blob([r],{type:"text/plain"})})];navigator.clipboard.write(c).then(()=>{const l=e.querySelector("#copyEmailBtn");l&&(l.textContent="✓ Kopiert (Word-kompatibel)!",setTimeout(()=>l.textContent="📋 Kopieren",2e3))}).catch(()=>{navigator.clipboard.writeText(r)})}else navigator.clipboard.writeText(r).then(()=>{const c=e.querySelector("#copyEmailBtn");c&&(c.textContent="✓ Kopiert!",setTimeout(()=>c.textContent="📋 Kopieren",2e3))})})}function An(){if(C.size<2)return;const e=Array.from(C),t=e[0],n=p.find(i=>i.id===t);if(!n)return;const s=e.slice(1);for(const i of s){const a=p.find(r=>r.id===i);a&&(n.question+=" + "+a.question,a.answer1&&a.answer1!==n.answer1&&(n.answer1=n.answer1?n.answer1+"; "+a.answer1:a.answer1),a.answer2&&a.answer2!==n.answer2&&(n.answer2=n.answer2?n.answer2+"; "+a.answer2:a.answer2),a.comment&&(n.comment=n.comment?n.comment+"; "+a.comment:a.comment),a.hidden=!0,n.mergedWith||(n.mergedWith=[]),n.mergedWith.push(a.question.substring(0,30)))}n.comment=he(n.question,n.answer1,n.answer2),C.clear()}function he(e,t,n){const s=e.toLowerCase(),i=(t||"").toLowerCase().trim(),a=(n||"").toLowerCase().trim();if(!i&&!a||Be(i)&&Be(a))return"";if(i===a&&i.length>2)return s.includes("wichtig")||s.includes("freundschaft")?`Gemeinsamer Wert: ${t}`:s.includes("studium")&&i.includes("ja")?"Beide haben studiert - das verbindet!":`Übereinstimmung: ${t}`;if(s.includes("alter")&&!s.includes("unterschied")){const r=parseInt(i),o=parseInt(a);if(!isNaN(r)&&!isNaN(o)){const c=Math.abs(r-o);return c===0?"Genau gleich alt!":c<=3?`Nur ${c} Jahre Unterschied - perfekt!`:c<=7?`${c} Jahre Unterschied - passt gut`:c<=15?`${c} Jahre Unterschied - verschiedene Perspektiven`:`${c} Jahre Unterschied`}}return s.includes("sprache")||s.includes("sprichst")?Bn(t,n):s.includes("hobby")||s.includes("freizeit")||s.includes("interesse")||s.includes("ausprobieren")||s.includes("was machst du gerne")||s.includes("event")||s.includes("anbieten")||s.includes("unternehmen")||s.includes("themen")?qn(t,n):s.includes("beruf")||s.includes("arbeit")||s.includes("studium")||s.includes("gelernt")||s.includes("zukunft")||s.includes("branche")||s.includes("was machst du gerade")||s.includes("vorher gemacht")?Dn(t,n):s.includes("zeit")||s.includes("treffen")||s.includes("wann")||s.includes("erreichbar")?Nn(t,n):s.includes("wichtig")||s.includes("freundschaft")||s.includes("erwartung")?Rn(t,n):s.includes("plz")||s.includes("postleitzahl")?On(t,n):s.includes("herkunft")||s.includes("land")||s.includes("woher")?Fn(t,n):s.includes("tandem")||s.includes("warum")||s.includes("mitmachen")||s.includes("swaf")||s.includes("start with a friend")?Gn(t,n):s.includes("geschlecht")&&(s.includes("partner")||s.includes("tandem"))?Hn(t,n):Et(t,n)}function Bn(e,t){const n=e.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),s=t.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),i=n.filter(a=>s.some(r=>a.includes(r)||r.includes(a)));return i.length>0?`Gemeinsame Sprachen: ${[...new Set(i)].join(", ")}`:""}function qn(e,t){const n=e.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),s=t.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),i=[["sport","fitness","training","gym","joggen","laufen"],["wandern","hiking","spazieren","natur","wald"],["kochen","backen","essen","kulinarisch","rezept"],["musik","konzert","instrument","singen"],["lesen","bücher","literatur"],["reisen","urlaub","travel","länder"],["film","kino","serien","netflix","movie"],["kunst","museum","malen","zeichnen","kreativ"],["tanzen","dance","salsa","bachata","tanz"],["fahrrad","radfahren","cycling","bike"],["foto","fotografieren","photography","kamera"],["café","kaffee","coffee"],["sprache","lernen","language"],["garten","pflanzen","garden"],["yoga","meditation","entspannung"],["schwimmen","baden","swimming"]],a=[];for(const o of n)for(const c of s){if(o.includes(c)||c.includes(o)){a.push(o.length>c.length?o:c);continue}for(const l of i){const d=l.some(m=>o.includes(m)),u=l.some(m=>c.includes(m));d&&u&&a.push(l[0])}}const r=[...new Set(a)];return r.length>0?r.length===1?`Gemeinsames Hobby: ${r[0]}`:`Gemeinsame Hobbys: ${r.slice(0,4).join(", ")}`:""}function Nn(e,t){const n=["morgens","mittags","nachmittags","abends","wochenende","unter der woche","flexibel"],s=e.toLowerCase(),i=t.toLowerCase(),a=n.filter(r=>s.includes(r)&&i.includes(r));return a.includes("flexibel")||a.length>=2?"Zeitlich flexibel - passt gut!":a.length>0?`Gemeinsame Zeit: ${a.join(", ")}`:""}function Rn(e,t){const n=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","kommunikation"],s=e.toLowerCase(),i=t.toLowerCase(),a=n.filter(r=>s.includes(r)&&i.includes(r));return a.length>0?`Gemeinsame Werte: ${a.join(", ")}`:""}function On(e,t){const n=fe(e),s=fe(t);return!n||!s?"":n===s?"Gleiche PLZ":n.substring(0,2)===s.substring(0,2)?"Gleiche Region - Entfernung wird berechnet...":"Entfernung wird berechnet..."}async function _n(e,t,n,s){const i=fe(e),a=fe(t);if(!i||!a)return;const r=p.find(c=>c.id===n);if(!r)return;const o=await Rt(i,a);if(o){const c=await H(i),l=await H(a);let d=Ot(o);if(c&&l){const b=_t(c,l);d+=` [🗺️](${b.google})`}r.comment=d,r.included=!0;const u=document.querySelector(`.comment-input[data-row-id="${n}"]`);u&&(u.value=ie(d));const m=document.querySelector(`.include-checkbox[data-row-id="${n}"]`);m&&(m.checked=!0);const g=document.querySelector("#emailPreview");g&&(g.innerHTML=Ge())}}function fe(e){const t=e.match(/\b(\d{5})\b/);return t?t[1]:null}function Dn(e,t){const n=e.toLowerCase(),s=t.toLowerCase(),i=[["student","studier","uni","hochschule","ausbildung"],["arbeit","beruf","job","angestellt"],["selbstständig","freelance","freiberuflich"],["suche","arbeitslos","orientierung"],["it","software","computer","programmier"],["sozial","pflege","gesundheit","medizin"],["lehrer","pädagog","bildung","schule"],["ingenieur","technik","maschinenbau"],["wirtschaft","bwl","marketing","vertrieb"],["kunst","design","kreativ","musik"]],a=[];for(const r of i){const o=r.some(l=>n.includes(l)),c=r.some(l=>s.includes(l));o&&c&&a.push(r[0])}return a.length>0?`Ähnlicher Bereich: ${a.join(", ")}`:(n.includes("student")||n.includes("studier"))&&(s.includes("student")||s.includes("studier"))?"Beide studieren - viel gemeinsam!":Et(e,t)}function Fn(e,t){const n=e.toLowerCase(),s=t.toLowerCase(),i=["deutschland","syrien","iran","irak","afghanistan","türkei","ukraine","eritrea","somalia","nigeria","pakistan","indien","china","russland"];for(const a of i)if(n.includes(a)&&s.includes(a))return`Beide haben Bezug zu ${a.charAt(0).toUpperCase()+a.slice(1)}`;return(n.includes("kultur")||n.includes("tradition"))&&(s.includes("kultur")||s.includes("tradition"))?"Beide interessiert an Kultur & Traditionen":""}function Gn(e,t){const n=e.toLowerCase(),s=t.toLowerCase(),i=[{keywords:["sprache","deutsch","lernen","verbessern"],text:"Beide wollen Sprachkenntnisse verbessern"},{keywords:["freund","kennenlernen","kontakt","leute"],text:"Beide suchen neue Kontakte"},{keywords:["kultur","austausch","integration"],text:"Beide wollen kulturellen Austausch"},{keywords:["helfen","unterstütz","begleiten"],text:"Gegenseitige Unterstützung ist wichtig"},{keywords:["spaß","unternehmung","aktivität"],text:"Beide wollen gemeinsam Spaß haben"}];for(const a of i){const r=a.keywords.some(c=>n.includes(c)),o=a.keywords.some(c=>s.includes(c));if(r&&o)return a.text}return""}function Hn(e,t){const n=e.toLowerCase(),s=t.toLowerCase();return(n.includes("egal")||n.includes("keine präferenz"))&&(s.includes("egal")||s.includes("keine präferenz"))?"Beide flexibel beim Geschlecht":""}function Et(e,t){if(!e||!t)return"";const n=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","gerne","sehr","auch","aber","wenn","dann","noch","schon","kann","will","muss","soll","hat","haben","sein","wird","sind","ist","nicht","mehr","viel","viele","alle","diese","dies","dem","den","des"]),s=e.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!n.has(o)),i=t.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!n.has(o)),a=s.filter(o=>i.some(c=>o===c||o.length>4&&c.length>4&&(o.includes(c)||c.includes(o)))),r=[...new Set(a)];return r.length>=1?`Gemeinsam: ${r.slice(0,4).join(", ")}`:e.length>5&&t.length>5?"Beide haben geantwortet":""}function K(e){const t=e.querySelector("#emailPreview");t&&(t.innerHTML=Ge())}function Ge(){const t=p.filter(s=>s.included).filter(s=>s.answer1||s.answer2);let n=`
    <div class="email-intro">
      Hi <strong>${h(B)}</strong> und <strong>${h(q)}</strong>,<br><br>
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
          <th>${h(B)}</th>
          <th>${h(q)}</th>
          <th>Gemeinsamkeit</th>
        </tr>
      </thead>
      <tbody>
  `;for(const s of t){const i=Vn(s.comment);n+=`
      <tr>
        <td><strong>${h(s.question)}</strong></td>
        <td>${h(s.answer1)||"-"}</td>
        <td>${h(s.answer2)||"-"}</td>
        <td class="commonality">${i}</td>
      </tr>
    `}return n+=`
      </tbody>
    </table>
    <div class="email-outro">
      <br>Ich freue mich über eure Rückmeldung!
    </div>
  `,n}function jn(e,t){var a,r,o,c;const s=(localStorage.getItem("swaf_ai_prompt")||En).replace("{Frage}",e.question).replace("{Antwort1}",e.answer1||"keine Angabe").replace("{Antwort2}",e.answer2||"keine Angabe"),i=document.createElement("div");i.className="ai-modal-overlay",i.innerHTML=`
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
          <textarea class="ai-prompt-text" readonly rows="6">${h(s)}</textarea>
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
  `,document.body.appendChild(i),(a=i.querySelector(".close-modal"))==null||a.addEventListener("click",()=>i.remove()),i.addEventListener("click",l=>{l.target===i&&i.remove()}),(r=i.querySelector(".ai-chatgpt"))==null||r.addEventListener("click",()=>{navigator.clipboard.writeText(s).then(()=>{window.open("https://chat.openai.com/","_blank"),i.remove(),qe("💬 ChatGPT geöffnet - Prompt in Zwischenablage kopiert!")})}),(o=i.querySelector(".ai-claude"))==null||o.addEventListener("click",()=>{navigator.clipboard.writeText(s).then(()=>{window.open("https://claude.ai/","_blank"),i.remove(),qe("🤖 Claude geöffnet - Prompt in Zwischenablage kopiert!")})}),(c=i.querySelector(".ai-copy-prompt"))==null||c.addEventListener("click",()=>{navigator.clipboard.writeText(s).then(()=>{const l=i.querySelector(".ai-copy-prompt");l.textContent="✓ Kopiert!",setTimeout(()=>l.textContent="📋 Nur Prompt kopieren",2e3)})})}function Kn(e,t,n){var r,o,c,l,d;const s=[];for(const u of t){const m=e.get(u.question);m&&s.push({rowId:u.rowId,question:u.question,answer1:u.answer1,answer2:u.answer2,generated:m,selected:!0})}if(s.length===0){alert("Keine Gemeinsamkeiten gefunden. Die KI konnte keine passenden Texte generieren.");return}const i=document.createElement("div");i.className="ai-modal-overlay",i.innerHTML=`
    <div class="ai-modal ai-preview-modal">
      <div class="ai-modal-header">
        <h3>KI-Vorschläge prüfen</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="ai-modal-body">
        <p class="ai-preview-intro">
          <strong>${s.length} Vorschläge generiert.</strong>
          Wähle aus, welche du übernehmen möchtest:
        </p>

        <div class="ai-preview-actions-top">
          <button class="btn btn-sm" id="selectAllBtn">Alle auswählen</button>
          <button class="btn btn-sm btn-outline" id="selectNoneBtn">Keine auswählen</button>
        </div>

        <div class="ai-preview-list">
          ${s.map((u,m)=>`
            <div class="ai-preview-item" data-index="${m}">
              <label class="ai-preview-checkbox">
                <input type="checkbox" ${u.selected?"checked":""} data-index="${m}">
                <span class="checkmark"></span>
              </label>
              <div class="ai-preview-content">
                <div class="ai-preview-question">${h(u.question)}</div>
                <div class="ai-preview-answers">
                  <span class="answer-snippet" title="${h(u.answer1)}">${h(te(u.answer1,30))}</span>
                  <span class="answer-vs">+</span>
                  <span class="answer-snippet" title="${h(u.answer2)}">${h(te(u.answer2,30))}</span>
                </div>
                <div class="ai-preview-generated">"${h(u.generated)}"</div>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="ai-preview-prompt-info">
          <details>
            <summary>Verwendeter Prompt anzeigen</summary>
            <pre class="ai-prompt-display">Du bist ein freundlicher Tandem-Vermittler bei "Start with a Friend".
Analysiere die folgenden zwei Antworten auf die Frage "{Frage}" und
schreibe EINEN kurzen Satz (max. 20 Wörter) der die Gemeinsamkeit oder
Verbindung beschreibt. Schreibe natürlich und persönlich, ohne Emojis,
so als würdest du zwei Freunde einander vorstellen. Wenn es keine
erkennbare Gemeinsamkeit gibt, antworte nur mit "---".

Person 1: "{Antwort1}"
Person 2: "{Antwort2}"

Gemeinsamkeit:</pre>
          </details>
        </div>

        <div class="ai-preview-actions">
          <button class="btn btn-secondary" id="cancelPreviewBtn">Abbrechen</button>
          <button class="btn btn-primary" id="applyPreviewBtn">
            Ausgewählte übernehmen (<span id="selectedCount">${s.length}</span>)
          </button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(i);function a(){const u=i.querySelectorAll(".ai-preview-item input:checked").length,m=i.querySelector("#selectedCount");m&&(m.textContent=String(u))}(r=i.querySelector(".close-modal"))==null||r.addEventListener("click",()=>i.remove()),i.addEventListener("click",u=>{u.target===i&&i.remove()}),(o=i.querySelector("#cancelPreviewBtn"))==null||o.addEventListener("click",()=>i.remove()),(c=i.querySelector("#selectAllBtn"))==null||c.addEventListener("click",()=>{i.querySelectorAll(".ai-preview-item input").forEach(u=>{u.checked=!0}),a()}),(l=i.querySelector("#selectNoneBtn"))==null||l.addEventListener("click",()=>{i.querySelectorAll(".ai-preview-item input").forEach(u=>{u.checked=!1}),a()}),i.querySelectorAll(".ai-preview-item input").forEach(u=>{u.addEventListener("change",a)}),(d=i.querySelector("#applyPreviewBtn"))==null||d.addEventListener("click",()=>{const u=i.querySelectorAll(".ai-preview-item input:checked");let m=0;u.forEach(g=>{const b=parseInt(g.dataset.index||"0",10),y=s[b];if(y){const I=p.find(F=>F.id===y.rowId);I&&(I.comment=y.generated,I.included=!0,m++)}}),i.remove(),me(n),qe(`${m} KI-Vorschläge übernommen`)})}function qe(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),3e3)}function He(){const t=p.filter(i=>i.included).filter(i=>i.answer1||i.answer2);let n=`Hi ${B} und ${q},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;const s={question:Math.max(10,...t.map(i=>i.question.length)),answer1:Math.max(B.length,...t.map(i=>(i.answer1||"-").length)),answer2:Math.max(q.length,...t.map(i=>(i.answer2||"-").length))};s.question=Math.min(s.question,30),s.answer1=Math.min(s.answer1,25),s.answer2=Math.min(s.answer2,25),n+=W("Frage",s.question)+" | ",n+=W(B,s.answer1)+" | ",n+=W(q,s.answer2)+" | ",n+=`Gemeinsamkeit
`,n+="-".repeat(s.question)+"-+-",n+="-".repeat(s.answer1)+"-+-",n+="-".repeat(s.answer2)+"-+-",n+="-".repeat(20)+`
`;for(const i of t){const a=ie(i.comment);n+=W(te(i.question,s.question),s.question)+" | ",n+=W(te(i.answer1||"-",s.answer1),s.answer1)+" | ",n+=W(te(i.answer2||"-",s.answer2),s.answer2)+" | ",n+=(a||"")+`
`}return n+=`
Ich freue mich über eure Rückmeldung!
`,n}function W(e,t){return e.length>=t?e.substring(0,t):e+" ".repeat(t-e.length)}function te(e,t){return e?e.length<=t?e:e.substring(0,t-2)+"..":""}function Wn(){const t=p.filter(s=>s.included).filter(s=>s.answer1||s.answer2);let n=`<!--StartFragment-->
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
  Hi <strong>${h(B)}</strong> und <strong>${h(q)}</strong>,<br><br>
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
      <th style="width: 25%;">${h(B)}</th>
      <th style="width: 25%;">${h(q)}</th>
      <th style="width: 25%;">Gemeinsamkeit</th>
    </tr>
  </thead>
  <tbody>
`;for(const s of t){const i=Zn(s.comment);n+=`    <tr>
      <td><strong>${h(s.question)}</strong></td>
      <td>${h(s.answer1)||"-"}</td>
      <td>${h(s.answer2)||"-"}</td>
      <td class="commonality">${i}</td>
    </tr>
`}return n+=`  </tbody>
</table>

<p><br>Ich freue mich über eure Rückmeldung!</p>
</body>
</html>
<!--EndFragment-->`,n}function kt(){return p.filter(e=>e.included).map(e=>({question:e.question,answer1:e.answer1,answer2:e.answer2,commonality:e.comment}))}function rt(e){if(!e||typeof e!="string")return"Partner*in";const t=e.match(/\(([^)]+)\)/);if(t){const s=t[1].trim().split(/[\s,]+/)[0];if(s&&s.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(s))return s}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(e)){const n=e.split(/[\s,]+/)[0];if(n&&n.length>1)return n}return"Partner*in"}function h(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function je(e){if(!e)return null;const t=e.match(/\[🗺️\]\((https?:\/\/[^)]+)\)/);return t?t[1]:null}function ie(e){return e?e.replace(/\s*\[🗺️\]\(https?:\/\/[^)]+\)/,"").trim():""}function Un(e){const t=je(e);return t?`<a href="${t}" target="_blank" class="btn-icon map-link-btn" title="Route in Google Maps öffnen">🗺️</a>`:""}function Vn(e){if(!e)return"";const t=je(e);if(t){const n=ie(e);return`${h(n)} <a href="${t}" target="_blank" class="map-link">🗺️ Route</a>`}return h(e)}function Zn(e){if(!e)return"";const t=je(e);if(t){const n=ie(e);return`${h(n)} <a href="${t}" style="color: #009892;">🗺️ Route anzeigen</a>`}return h(e)}function Jn(){at(),window.addEventListener("tandems-updated",at),window.addEventListener("create-match",s=>{const i=s;Xn(i.detail.profile1,i.detail.profile2)}),window.addEventListener("edit-tandem",s=>{ts(s.detail.tandem)});const e=document.getElementById("closeMatchModal"),t=document.getElementById("cancelMatch"),n=document.getElementById("confirmMatch");e==null||e.addEventListener("click",Ne),t==null||t.addEventListener("click",Ne),n==null||n.addEventListener("click",es)}function at(){const e=document.getElementById("tandemList");if(!e)return;const t=se();if(t.length===0){e.innerHTML='<p class="empty-state">Noch keine Tandems erstellt. Wähle zwei Profile aus, um ein Tandem zu erstellen.</p>';return}e.innerHTML=t.sort((n,s)=>new Date(s.created).getTime()-new Date(n.created).getTime()).map(n=>Yn(n)).join(""),e.querySelectorAll(".delete-tandem").forEach(n=>{n.addEventListener("click",s=>{s.stopPropagation();const i=n.getAttribute("data-tandem-id");i&&confirm("Tandem wirklich löschen?")&&mt(i)})}),e.querySelectorAll(".copy-tandem").forEach(n=>{n.addEventListener("click",s=>{s.stopPropagation();const i=n.getAttribute("data-tandem-id");i&&Qn(i)})})}function Qn(e){const n=se().find(r=>r.id===e);if(!n)return;if(n.suggestionText){navigator.clipboard.writeText(n.suggestionText).then(()=>{ct("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")});return}const s=ot(n.profile1.name),i=ot(n.profile2.name);let a=`Hi ${s} und ${i},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;if(n.commonalities&&n.commonalities.length>0){const r={question:Math.max(10,...n.commonalities.map(o=>o.question.length)),answer1:Math.max(s.length,...n.commonalities.map(o=>(o.answer1||"-").length)),answer2:Math.max(i.length,...n.commonalities.map(o=>(o.answer2||"-").length))};r.question=Math.min(r.question,30),r.answer1=Math.min(r.answer1,25),r.answer2=Math.min(r.answer2,25),a+=U("Frage",r.question)+" | ",a+=U(s,r.answer1)+" | ",a+=U(i,r.answer2)+" | ",a+=`Gemeinsamkeit
`,a+="-".repeat(r.question)+"-+-",a+="-".repeat(r.answer1)+"-+-",a+="-".repeat(r.answer2)+"-+-",a+="-".repeat(20)+`
`;for(const o of n.commonalities)a+=U(Te(o.question,r.question),r.question)+" | ",a+=U(Te(o.answer1||"-",r.answer1),r.answer1)+" | ",a+=U(Te(o.answer2||"-",r.answer2),r.answer2)+" | ",a+=(o.commonality||"")+`
`}a+=`
Ich freue mich über eure Rückmeldung!
`,navigator.clipboard.writeText(a).then(()=>{ct("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")})}function U(e,t){return e.length>=t?e.substring(0,t):e+" ".repeat(t-e.length)}function Te(e,t){return e?e.length<=t?e:e.substring(0,t-2)+"..":""}function ot(e){if(!e||typeof e!="string")return"Partner*in";const t=e.match(/\(([^)]+)\)/);if(t){const s=t[1].trim().split(/[\s,]+/)[0];if(s&&s.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(s))return s}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(e)){const n=e.split(/[\s,]+/)[0];if(n&&n.length>1)return n}return"Partner*in"}function ct(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),2e3)}function Yn(e){const t=new Date(e.created).toLocaleDateString("de-DE"),n=Ke(e.matchScore);return`
    <div class="tandem-card" data-tandem-id="${e.id}">
      <div class="header">
        <div class="title">${z(e.name)}</div>
        <div class="meta">
          <span class="stars">${n}</span>
          <span class="date">${t}</span>
          <button class="copy-tandem btn-icon" data-tandem-id="${e.id}" title="Text kopieren">📋</button>
          <button class="delete-tandem close-btn" data-tandem-id="${e.id}">&times;</button>
        </div>
      </div>
      <div class="profiles">
        <div class="profile">
          <strong>${z(e.profile1.name)}</strong>
        </div>
        <div class="profile">
          <strong>${z(e.profile2.name)}</strong>
        </div>
      </div>
      ${e.suggestionText?`
        <div class="suggestion-text">
          <strong>Vorschlagstext:</strong>
          <pre>${z(e.suggestionText)}</pre>
        </div>
      `:e.commonalities.length>0?`
        <div class="commonalities">
          <strong>Gemeinsamkeiten:</strong>
          ${e.commonalities.slice(0,3).map(s=>`
            <div class="commonality">• ${z(s.commonality)}</div>
          `).join("")}
          ${e.commonalities.length>3?`<div class="commonality">... und ${e.commonalities.length-3} weitere</div>`:""}
        </div>
      `:""}
    </div>
  `}function Ke(e){let t="";for(let n=0;n<5;n++)t+=`<span class="star ${n<e?"":"empty"}">★</span>`;return t}let ge=null;function Xn(e,t){const n=document.getElementById("matchModal"),s=document.getElementById("matchPreview");if(!n||!s)return;ge={profile1:e,profile2:t};const i=Oe(e,t);s.innerHTML=`
    <div class="match-preview-content">
      <div class="match-profiles">
        <div class="profile">
          <strong>${z(e.name)}</strong>
        </div>
        <div class="match-icon">🤝</div>
        <div class="profile">
          <strong>${z(t.name)}</strong>
        </div>
      </div>
      <div class="match-score">
        <span>Match-Qualität: </span>
        <span class="stars">${Ke(i.score)}</span>
      </div>
      <div id="tandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    </div>
  `;const a=document.getElementById("tandemEditorContainer");a&&yt(a,e,t),n.classList.add("visible")}function Ne(){const e=document.getElementById("matchModal");e==null||e.classList.remove("visible"),ge=null}function es(){if(!ge)return;const{profile1:e,profile2:t}=ge,n=Oe(e,t),s=He(),i=kt(),a={id:crypto.randomUUID(),profile1:e,profile2:t,name:`${e.name} & ${t.name}`,created:new Date().toISOString(),commonalities:i,matchScore:n.score,suggestionText:s};It(a),Ne(),We(`Tandem erstellt: ${e.name} & ${t.name}`)}function We(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),3e3)}function z(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let R=null;function ts(e){var s,i,a,r;R=e;let t=document.getElementById("editTandemModal");t||(t=document.createElement("div"),t.id="editTandemModal",t.className="modal",t.innerHTML=`
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
    `,document.body.appendChild(t),(s=t.querySelector("#closeEditModal"))==null||s.addEventListener("click",pe),(i=t.querySelector("#cancelEditTandem"))==null||i.addEventListener("click",pe),(a=t.querySelector("#dissolveTandem"))==null||a.addEventListener("click",ns),(r=t.querySelector("#saveEditTandem"))==null||r.addEventListener("click",ss));const n=document.getElementById("editTandemContent");if(n){const o=new Date(e.created).toLocaleDateString("de-DE");n.innerHTML=`
      <div class="edit-tandem-info">
        <div class="tandem-pair">
          <div class="profile-name">
            <strong>${z(e.profile1.name)}</strong>
          </div>
          <div class="pair-icon">🤝</div>
          <div class="profile-name">
            <strong>${z(e.profile2.name)}</strong>
          </div>
        </div>
        <div class="tandem-meta">
          <span class="stars">${Ke(e.matchScore)}</span>
          <span class="date">Erstellt am: ${o}</span>
        </div>
      </div>
      <div id="editTandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    `;const c=document.getElementById("editTandemEditorContainer");c&&yt(c,e.profile1,e.profile2)}t.classList.add("visible")}function pe(){const e=document.getElementById("editTandemModal");e==null||e.classList.remove("visible"),R=null}function ns(){if(!R)return;const e=`Tandem zwischen "${R.profile1.name}" und "${R.profile2.name}" wirklich auflösen?

Die Profile können dann erneut gematcht werden.`;confirm(e)&&(mt(R.id),pe(),We("Tandem aufgelöst - Profile können neu gematcht werden"))}function ss(){if(!R)return;const e=He(),t=kt();Tt(R.id,{suggestionText:e,commonalities:t}),pe(),We("Tandem aktualisiert")}const is="modulepreload",rs=function(e,t){return new URL(e,t).href},lt={},as=function(t,n,s){let i=Promise.resolve();if(n&&n.length>0){const r=document.getElementsByTagName("link"),o=document.querySelector("meta[property=csp-nonce]"),c=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));i=Promise.allSettled(n.map(l=>{if(l=rs(l,s),l in lt)return;lt[l]=!0;const d=l.endsWith(".css"),u=d?'[rel="stylesheet"]':"";if(!!s)for(let b=r.length-1;b>=0;b--){const y=r[b];if(y.href===l&&(!d||y.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${u}`))return;const g=document.createElement("link");if(g.rel=d?"stylesheet":is,d||(g.as="script"),g.crossOrigin="",g.href=l,c&&g.setAttribute("nonce",c),document.head.appendChild(g),d)return new Promise((b,y)=>{g.addEventListener("load",b),g.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return i.then(r=>{for(const o of r||[])o.status==="rejected"&&a(o.reason);return t().catch(a)})};function os(){const e=document.getElementById("exportExcel"),t=document.getElementById("exportCSV"),n=document.getElementById("exportJSON"),s=document.getElementById("importBackup");e==null||e.addEventListener("click",cs),t==null||t.addEventListener("click",ls),n==null||n.addEventListener("click",ds),s==null||s.addEventListener("click",us),Ce(),window.addEventListener("tandems-updated",Ce),window.addEventListener("profiles-updated",Ce)}function Ce(){const e=document.getElementById("statsContainer");if(!e)return;const t=we(),n=se(),s=Ct(),i=n.length>0?(n.reduce((a,r)=>a+r.matchScore,0)/n.length).toFixed(1):"-";e.innerHTML=`
    <div class="stat-item">
      <span class="stat-label">Profile:</span>
      <span class="stat-value">${t.length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Tandems:</span>
      <span class="stat-value">${n.length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Durchschn. Match-Qualität:</span>
      <span class="stat-value">${i} ★</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Gesamtpunkte:</span>
      <span class="stat-value">${s.totalPoints}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Streak:</span>
      <span class="stat-value">${s.streak} Tage</span>
    </div>
  `}async function cs(){const e=se();if(e.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}try{const t=await as(()=>import("./xlsx-D_0l8YDs.js"),[],import.meta.url),n=e.map(r=>({Tandem:r.name,"Person 1":r.profile1.name,"Person 2":r.profile2.name,"Match-Score":r.matchScore,Erstellt:new Date(r.created).toLocaleDateString("de-DE"),Gemeinsamkeiten:r.commonalities.map(o=>o.commonality).join("; ")})),s=t.utils.json_to_sheet(n),i=t.utils.book_new();t.utils.book_append_sheet(i,s,"Tandems");const a=`tandems_${new Date().toISOString().split("T")[0]}.xlsx`;t.writeFile(i,a)}catch(t){console.error("Excel export error:",t),alert("Fehler beim Excel-Export. Bitte versuche den CSV-Export.")}}function ls(){const e=se();if(e.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}const t=["Tandem","Person 1","Person 2","Match-Score","Erstellt","Gemeinsamkeiten"],n=e.map(i=>[i.name,i.profile1.name,i.profile2.name,String(i.matchScore),new Date(i.created).toLocaleDateString("de-DE"),i.commonalities.map(a=>a.commonality).join("; ")]),s=[t.join(";"),...n.map(i=>i.map(a=>`"${a.replace(/"/g,'""')}"`).join(";"))].join(`
`);Lt(s,`tandems_${new Date().toISOString().split("T")[0]}.csv`,"text/csv;charset=utf-8")}function ds(){const e=Pt();Lt(e,`tandem-matcher-backup_${new Date().toISOString().split("T")[0]}.json`,"application/json")}function us(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=t=>{var i;const n=(i=t.target.files)==null?void 0:i[0];if(!n)return;const s=new FileReader;s.onload=a=>{var r;try{const o=(r=a.target)==null?void 0:r.result;confirm("Achtung: Alle bestehenden Daten werden überschrieben. Fortfahren?")&&(At(o),alert("Backup erfolgreich wiederhergestellt!"),location.reload())}catch(o){alert("Fehler beim Wiederherstellen: "+o.message)}},s.readAsText(n)},e.click()}function Lt(e,t,n){const s=new Blob([e],{type:n}),i=URL.createObjectURL(s),a=document.createElement("a");a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)}document.addEventListener("DOMContentLoaded",async()=>{console.log("Tandem-Matcher v2.0 initialisiert"),await $t(),ms(),fn(),Dt(),Zt(),on(),Jn(),os(),hs(),ps(),gs(),fs()});function ms(){const e=document.querySelectorAll(".tab"),t=document.querySelectorAll(".tab-content");e.forEach(n=>{n.addEventListener("click",()=>{const s=n.dataset.tab;s&&(e.forEach(i=>i.classList.remove("active")),n.classList.add("active"),t.forEach(i=>{i.classList.toggle("active",i.id===`${s}-tab`)}))})})}function hs(){const e=document.querySelectorAll(".view-btn"),t=document.getElementById("profileSidebar"),n=document.getElementById("mapContainer");e.forEach(s=>{s.addEventListener("click",()=>{const i=s.dataset.view;!i||!t||!n||(e.forEach(a=>a.classList.remove("active")),s.classList.add("active"),i==="list"?(t.classList.add("mobile-visible"),n.classList.add("mobile-hidden")):(t.classList.remove("mobile-visible"),n.classList.remove("mobile-hidden"),setTimeout(()=>{window.dispatchEvent(new Event("resize")),window.dispatchEvent(new Event("map-needs-resize"))},100)))})})}async function fs(){const e=document.getElementById("ollamaStatus");if(e)try{const t=await bt();t.available&&t.model?(e.className="ollama-status available",e.textContent=`Verfügbar: ${t.model}`):t.available?(e.className="ollama-status unavailable",e.textContent="Ollama läuft, aber kein Modell installiert"):(e.className="ollama-status unavailable",e.textContent="Nicht verfügbar - Ollama installieren")}catch{e.className="ollama-status unavailable",e.textContent="Nicht verfügbar"}}function gs(){const e=document.getElementById("helpBtn"),t=document.getElementById("helpModal"),n=document.getElementById("closeHelpModal");e==null||e.addEventListener("click",()=>{t==null||t.classList.add("visible")}),n==null||n.addEventListener("click",()=>{t==null||t.classList.remove("visible")}),t==null||t.addEventListener("click",s=>{s.target===t&&t.classList.remove("visible")}),localStorage.getItem("swaf_help_shown")||setTimeout(()=>{t==null||t.classList.add("visible"),localStorage.setItem("swaf_help_shown","true")},500)}function ps(){window.addEventListener("focus",async()=>{try{const e=await navigator.clipboard.readText();e&&e.includes('"version"')&&e.includes('"profiles"')&&confirm("Profile-Daten in der Zwischenablage erkannt. Importieren?")&&window.dispatchEvent(new CustomEvent("import-from-clipboard",{detail:e}))}catch{}})}window.TandemMatcher={version:"2.0.0"};
