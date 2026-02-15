(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const _={PROFILES:"swaf_profiles",TANDEMS:"swaf_tandems",GAMIFICATION:"swaf_gamification_stats",PLZ_CACHE:"swaf_plz_cache",SETTINGS:"swaf_settings"};let A=[],I=[],F=wt(),Y=new Map;function wt(){return{totalMatches:0,todayMatches:0,lastMatchDate:"",streak:0,qualityScores:[],achievements:[],totalPoints:0}}async function Ct(){try{const e=localStorage.getItem(_.PROFILES);e&&(A=JSON.parse(e));const t=localStorage.getItem(_.TANDEMS);t&&(I=JSON.parse(t));const n=localStorage.getItem(_.GAMIFICATION);n&&(F={...wt(),...JSON.parse(n)});const i=localStorage.getItem(_.PLZ_CACHE);if(i){const s=JSON.parse(i);Y=new Map(Object.entries(s))}console.log(`Storage initialized: ${A.length} profiles, ${I.length} tandems`)}catch(e){console.error("Error loading storage:",e)}}function j(){return[...A]}function be(e){return A.find(t=>t.id===e)}function xt(e){const t=new Set(A.map(i=>i.id)),n=new Set(A.map(i=>Te(i.name)));for(const i of e){if(t.has(i.id))continue;const s=Te(i.name);if(n.has(s)){const a=A.find(r=>Te(r.name)===s);if(a){Pt(a,i);continue}}A.push(i),t.add(i.id),n.add(s)}Se()}function Pt(e,t){const n=new Set(e.fields.map(i=>i.question));for(const i of t.fields)n.has(i.question)||e.fields.push(i);e.pageType="Merged",e.timestamp=Math.max(e.timestamp,t.timestamp)}function Te(e){return e.toLowerCase().trim().replace(/\s+/g," ")}function Bt(e){A=A.filter(t=>t.id!==e),Se()}function Nt(){A=[],Se()}function Se(){localStorage.setItem(_.PROFILES,JSON.stringify(A)),window.dispatchEvent(new CustomEvent("profiles-updated"))}function Q(){return[...I]}function qt(e){I.push(e),$e(),F.totalMatches++,F.todayMatches++,F.lastMatchDate=new Date().toISOString().split("T")[0],F.qualityScores.push(e.matchScore),vt()}function bt(e){I=I.filter(t=>t.id!==e),$e()}function Rt(e,t){const n=I.findIndex(i=>i.id===e);n!==-1&&(I[n]={...I[n],...t},$e())}function ce(){const e=new Set;for(const t of I)e.add(t.profile1.id),e.add(t.profile2.id);return e}function ae(e){return I.find(t=>t.profile1.id===e||t.profile2.id===e)}function $e(){localStorage.setItem(_.TANDEMS,JSON.stringify(I)),window.dispatchEvent(new CustomEvent("tandems-updated"))}function Ot(){return{...F}}function vt(){localStorage.setItem(_.GAMIFICATION,JSON.stringify(F))}function Dt(e){return Y.get(e)}function qe(e,t){Y.set(e,t);const n=Object.fromEntries(Y);localStorage.setItem(_.PLZ_CACHE,JSON.stringify(n))}function Kt(e){if(!e.profiles||!Array.isArray(e.profiles))throw new Error("Ungültiges Datenformat");const t=A.length;return xt(e.profiles),A.length-t}function _t(){return JSON.stringify({profiles:A,tandems:I,gamificationStats:F,plzCache:Object.fromEntries(Y),exportedAt:new Date().toISOString(),version:"2.0"})}function Ft(e){const t=JSON.parse(e);t.profiles&&(A=t.profiles),t.tandems&&(I=t.tandems),t.gamificationStats&&(F=t.gamificationStats),t.plzCache&&(Y=new Map(Object.entries(t.plzCache))),Se(),$e(),vt(),localStorage.setItem(_.PLZ_CACHE,JSON.stringify(Object.fromEntries(Y)))}function V(e){const t=e.fields.find(n=>n.question.toLowerCase().includes("plz")||n.question.toLowerCase().includes("postleitzahl"));if(t!=null&&t.answer){const n=t.answer.match(/\d{5}/);return n?n[0]:null}for(const n of e.fields){const i=n.answer.match(/\b\d{5}\b/);if(i)return i[0]}return null}function me(e){const t=[/newcomer/i,/geflüchtet/i,/migrant/i,/zugewandert/i,/immigrant/i,/einwander/i,/neuankommend/i,/geflohene?/i,/refugee/i,/asyl/i,/zuwander/i],n=[/\blocal\b/i,/einheimisch/i,/hier.*geboren/i,/alteingesessen/i,/ortsansässig/i],i=a=>t.some(r=>r.test(a)),s=a=>n.some(r=>r.test(a));if(e.pageType){if(i(e.pageType))return"newcomer";if(s(e.pageType))return"local"}if(e.name){if(i(e.name))return"newcomer";if(s(e.name))return"local"}if(e.url){if(i(e.url))return"newcomer";if(s(e.url))return"local"}for(const a of e.fields){const r=a.question.toLowerCase(),o=a.answer;if(r.includes("gruppe")||r.includes("status")||r.includes("wer bist")||r.includes("local")||r.includes("newcomer")||r.includes("herkunft")||r.includes("aufnahme")||r.includes("teilnehmer")){if(i(o))return"newcomer";if(s(o))return"local"}}for(const a of e.fields)if(i(a.answer))return"newcomer";return"local"}function le(e){const t=e.fields.find(i=>i.question.toLowerCase().includes("alter")&&!i.question.toLowerCase().includes("unterschied")&&!i.question.toLowerCase().includes("präferenz"));if(t!=null&&t.answer){const i=t.answer.match(/\d+/);if(i){const s=parseInt(i[0]);if(s>=16&&s<=100)return s}}const n=e.fields.find(i=>i.question.toLowerCase().includes("geboren")||i.question.toLowerCase().includes("geburtsjahr"));if(n!=null&&n.answer){const i=n.answer.match(/(19|20)\d{2}/);if(i){const s=parseInt(i[0]),r=new Date().getFullYear()-s;if(r>=16&&r<=100)return r}}return null}function ve(e){const t=e.fields.find(n=>n.question.toLowerCase().includes("geschlecht")&&!n.question.toLowerCase().includes("präferenz")&&!n.question.toLowerCase().includes("partner"));if(t!=null&&t.answer){const n=t.answer.toLowerCase();if(n.includes("männlich")||n.includes("mann")||n==="m")return"male";if(n.includes("weiblich")||n.includes("frau")||n==="w"||n==="f")return"female";if(n.includes("divers")||n.includes("sonstig")||n.includes("andere"))return"other"}return null}const Gt={sport:["sport","fitness","training","gym","workout"],fussball:["fußball","fussball","soccer","kicken"],musik:["musik","music","konzert","singen","instrument"],lesen:["lesen","bücher","reading","books"],kochen:["kochen","cooking","backen","küche"],reisen:["reisen","travel","urlaub","reise"],kino:["kino","filme","movies","cinema","film"],gaming:["gaming","videospiele","spiele","zocken","games"],wandern:["wandern","hiking","spazieren","natur"],fotografie:["fotografie","photography","fotos","fotografieren"],kunst:["kunst","art","malen","zeichnen","museum"],tanzen:["tanzen","dance","dancing","tanz"],yoga:["yoga","meditation","entspannung"],schwimmen:["schwimmen","swimming","baden"],radfahren:["radfahren","fahrrad","cycling","bike","rad"],laufen:["laufen","joggen","running","jogging"],sprachen:["sprachen","languages","sprachkurs"],essen:["essen","food","kulinarik","restaurant"],feiern:["feiern","party","ausgehen","club","bar"],natur:["natur","nature","garten","pflanzen","outdoor"]};function et(e){const t=e.toLowerCase().trim();for(const[n,i]of Object.entries(Gt))if(i.some(s=>t.includes(s)))return n;return t.replace(/[^a-zäöüß]/gi,"")}const Ht={"01":{lat:51.05,lng:13.74,city:"Dresden"},"02":{lat:51.15,lng:14.97,city:"Görlitz"},"03":{lat:51.76,lng:14.33,city:"Cottbus"},"04":{lat:51.34,lng:12.38,city:"Leipzig"},"05":{lat:51.22,lng:6.78,city:"Düsseldorf"},"06":{lat:51.48,lng:11.97,city:"Halle"},"07":{lat:50.93,lng:11.59,city:"Jena"},"08":{lat:50.72,lng:12.49,city:"Zwickau"},"09":{lat:50.83,lng:12.92,city:"Chemnitz"},10:{lat:52.52,lng:13.41,city:"Berlin Mitte"},11:{lat:52.52,lng:13.41,city:"Berlin"},12:{lat:52.45,lng:13.43,city:"Berlin Süd"},13:{lat:52.57,lng:13.35,city:"Berlin Nord"},14:{lat:52.39,lng:13.07,city:"Potsdam"},15:{lat:52.34,lng:14.55,city:"Frankfurt/Oder"},16:{lat:52.98,lng:13.79,city:"Oranienburg"},17:{lat:53.91,lng:13.38,city:"Greifswald"},18:{lat:54.09,lng:12.14,city:"Rostock"},19:{lat:53.63,lng:11.41,city:"Schwerin"},20:{lat:53.55,lng:10,city:"Hamburg"},21:{lat:53.47,lng:9.78,city:"Hamburg Süd"},22:{lat:53.6,lng:10.05,city:"Hamburg Nord"},23:{lat:53.87,lng:10.69,city:"Lübeck"},24:{lat:54.32,lng:10.14,city:"Kiel"},25:{lat:53.87,lng:9.09,city:"Itzehoe"},26:{lat:53.14,lng:8.22,city:"Oldenburg"},27:{lat:53.08,lng:8.81,city:"Bremen Nord"},28:{lat:53.08,lng:8.81,city:"Bremen"},29:{lat:52.97,lng:10.57,city:"Celle"},30:{lat:52.37,lng:9.74,city:"Hannover"},31:{lat:52.23,lng:9.52,city:"Hannover Süd"},32:{lat:52.02,lng:8.53,city:"Herford"},33:{lat:51.93,lng:8.38,city:"Bielefeld"},34:{lat:51.31,lng:9.5,city:"Kassel"},35:{lat:50.56,lng:8.67,city:"Gießen"},36:{lat:50.55,lng:9.68,city:"Fulda"},37:{lat:51.53,lng:9.93,city:"Göttingen"},38:{lat:52.27,lng:10.52,city:"Braunschweig"},39:{lat:52.13,lng:11.63,city:"Magdeburg"},40:{lat:51.23,lng:6.78,city:"Düsseldorf"},41:{lat:51.19,lng:6.44,city:"Mönchengladbach"},42:{lat:51.26,lng:7.15,city:"Wuppertal"},43:{lat:51.36,lng:7.35,city:"Hagen"},44:{lat:51.51,lng:7.47,city:"Dortmund"},45:{lat:51.45,lng:7.01,city:"Essen"},46:{lat:51.54,lng:6.77,city:"Oberhausen"},47:{lat:51.43,lng:6.76,city:"Duisburg"},48:{lat:51.96,lng:7.63,city:"Münster"},49:{lat:52.28,lng:8.05,city:"Osnabrück"},50:{lat:50.94,lng:6.96,city:"Köln"},51:{lat:50.99,lng:7.13,city:"Köln Ost"},52:{lat:50.78,lng:6.08,city:"Aachen"},53:{lat:50.73,lng:7.1,city:"Bonn"},54:{lat:49.75,lng:6.64,city:"Trier"},55:{lat:50,lng:8.27,city:"Mainz"},56:{lat:50.36,lng:7.6,city:"Koblenz"},57:{lat:50.87,lng:8.02,city:"Siegen"},58:{lat:51.36,lng:7.47,city:"Hagen"},59:{lat:51.66,lng:8.38,city:"Hamm"},60:{lat:50.11,lng:8.68,city:"Frankfurt"},61:{lat:50.22,lng:8.62,city:"Frankfurt Nord"},62:{lat:50.1,lng:8.77,city:"Bad Homburg"},63:{lat:50,lng:8.96,city:"Offenbach"},64:{lat:49.87,lng:8.65,city:"Darmstadt"},65:{lat:50.08,lng:8.24,city:"Wiesbaden"},66:{lat:49.24,lng:7,city:"Saarbrücken"},67:{lat:49.45,lng:8.44,city:"Ludwigshafen"},68:{lat:49.49,lng:8.47,city:"Mannheim"},69:{lat:49.41,lng:8.69,city:"Heidelberg"},70:{lat:48.78,lng:9.18,city:"Stuttgart"},71:{lat:48.73,lng:9.11,city:"Stuttgart Süd"},72:{lat:48.52,lng:9.05,city:"Tübingen"},73:{lat:48.8,lng:9.47,city:"Esslingen"},74:{lat:49.14,lng:9.22,city:"Heilbronn"},75:{lat:48.89,lng:8.69,city:"Pforzheim"},76:{lat:49.01,lng:8.4,city:"Karlsruhe"},77:{lat:48.47,lng:7.94,city:"Offenburg"},78:{lat:47.99,lng:8.52,city:"Villingen"},79:{lat:47.99,lng:7.85,city:"Freiburg"},80:{lat:48.14,lng:11.58,city:"München"},81:{lat:48.11,lng:11.6,city:"München Süd"},82:{lat:48.05,lng:11.47,city:"München West"},83:{lat:47.86,lng:11.97,city:"Rosenheim"},84:{lat:48.44,lng:12.12,city:"Landshut"},85:{lat:48.4,lng:11.74,city:"Freising"},86:{lat:48.37,lng:10.9,city:"Augsburg"},87:{lat:47.73,lng:10.31,city:"Kempten"},88:{lat:47.66,lng:9.48,city:"Friedrichshafen"},89:{lat:48.4,lng:10,city:"Ulm"},90:{lat:49.45,lng:11.08,city:"Nürnberg"},91:{lat:49.6,lng:11.01,city:"Erlangen"},92:{lat:49.02,lng:12.1,city:"Amberg"},93:{lat:49.02,lng:12.1,city:"Regensburg"},94:{lat:48.57,lng:13.45,city:"Passau"},95:{lat:50.06,lng:11.78,city:"Bayreuth"},96:{lat:50.1,lng:10.88,city:"Bamberg"},97:{lat:49.79,lng:9.95,city:"Würzburg"},98:{lat:50.68,lng:10.93,city:"Suhl"},99:{lat:50.98,lng:11.03,city:"Erfurt"}};function yt(e,t,n,i){const a=pe(n-e),r=pe(i-t),o=Math.sin(a/2)*Math.sin(a/2)+Math.cos(pe(e))*Math.cos(pe(n))*Math.sin(r/2)*Math.sin(r/2);return 6371*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}function pe(e){return e*(Math.PI/180)}let Me=0;const tt=1e3;async function ee(e){var s;if(!e||e.length<2)return null;const t=e.replace(/\D/g,"").substring(0,5);if(t.length<5)return nt(t);const n=Dt(t);if(n)return n;const i=nt(t);if(i)return qe(t,i),i;try{const a=Date.now();a-Me<tt&&await new Promise(c=>setTimeout(c,tt-(a-Me))),Me=Date.now(),console.log(`🌐 Lade PLZ ${t} von OpenStreetMap...`);const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&country=DE&postalcode=${t}&limit=1`,{headers:{"User-Agent":"SwaF Tandem Matcher v2.0"}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const o=await r.json();if(o&&o.length>0){const c={lat:parseFloat(o[0].lat),lng:parseFloat(o[0].lon),city:((s=o[0].display_name)==null?void 0:s.split(",")[0])||void 0};return qe(t,c),console.log(`✅ PLZ ${t} gefunden:`,c),c}}catch(a){console.warn(`⚠️ Nominatim API Fehler für PLZ ${t}:`,a)}return null}function nt(e){const t=e.substring(0,2),n=Ht[t];if(!n)return null;let i=0,s=0;if(e.length>=5){const r=parseInt(e.substring(2,5),10)||0,o=r*2.399963,c=.02+r%100*3e-4;i=c*Math.cos(o),s=c*Math.sin(o)*1.4}const a={lat:n.lat+i,lng:n.lng+s,city:n.city};return qe(e,a),a}async function Ut(e,t){if(e===t)return 0;const n=await ee(e),i=await ee(t);if(!(!n||!i))return yt(n.lat,n.lng,i.lat,i.lng)}const we=new Map;async function jt(e,t){if(!e||!t)return null;if(e===t)return{distanceKm:0,drivingMinutes:0,transitMinutes:0,cyclingMinutes:0,walkingMinutes:0};const n=`${e}-${t}`,i=we.get(n);if(i)return i;const s=`${t}-${e}`,a=we.get(s);if(a)return a;const r=await ee(e),o=await ee(t);if(!r||!o)return null;try{const f=`https://router.project-osrm.org/route/v1/driving/${r.lng},${r.lat};${o.lng},${o.lat}?overview=false`;console.log(`🚗 Berechne Entfernung ${e} → ${t}...`);const w=await fetch(f);if(!w.ok)throw new Error(`HTTP ${w.status}`);const E=await w.json();if(E.code==="Ok"&&E.routes&&E.routes.length>0){const M=E.routes[0],C=M.distance/1e3,J=Math.round(M.duration/60),te=Math.round(J*1.8),ne=Math.round(C*4),u=Math.round(C*12),m={distanceKm:Math.round(C*10)/10,drivingMinutes:J,transitMinutes:te,cyclingMinutes:ne,walkingMinutes:u};return we.set(n,m),console.log(`✅ Entfernung: ${m.distanceKm} km`),m}}catch(f){console.warn("⚠️ OSRM API Fehler:",f)}const c=yt(r.lat,r.lng,o.lat,o.lng),d=Math.round(c*1.3*10)/10,h={distanceKm:d,drivingMinutes:Math.round(d*1.2),transitMinutes:Math.round(d*2.2),cyclingMinutes:Math.round(d*4),walkingMinutes:Math.round(d*12)};return we.set(n,h),h}function Zt(e){if(e.distanceKm===0)return"Gleiche PLZ";const t=[];return t.push(`${e.distanceKm} km Entfernung`),e.drivingMinutes<=120&&t.push(`ca. ${Ae(e.drivingMinutes)} mit Auto`),e.transitMinutes<=180&&t.push(`ca. ${Ae(e.transitMinutes)} mit ÖPNV`),e.walkingMinutes<=45&&t.push(`ca. ${Ae(e.walkingMinutes)} zu Fuß`),t.join(", ")}function Ae(e){if(e<60)return`${e} min`;const t=Math.floor(e/60),n=e%60;return n===0?`${t} h`:`${t}:${n.toString().padStart(2,"0")} h`}function Wt(e,t){const n=`https://www.google.com/maps/dir/${e.lat},${e.lng}/${t.lat},${t.lng}`,i=`https://www.bvg.de/de/verbindungen/verbindungssuche?start=${e.lat},${e.lng}&destination=${t.lat},${t.lng}`;return{google:n,bvg:i,mvv:"https://www.mvv-muenchen.de/fahrplanauskunft/index.html#routing",hvv:"https://www.hvv.de/de/fahrplaene/abruf-fahrplaninfos/"}}let N=null,Z=new Map,Ue=null;function Vt(){document.getElementById("map")&&(N=L.map("map").setView([51.1657,10.4515],6),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:18}).addTo(N),it(),window.addEventListener("profiles-updated",it),window.addEventListener("tandems-updated",Jt),window.addEventListener("profile-selected",t=>{en(t.detail.profileId)}),window.addEventListener("profile-deselected",()=>{tn()}))}function Jt(){const e=ce();Z.forEach((t,n)=>{var s;const i=(s=t.getElement())==null?void 0:s.querySelector(".marker-icon");i&&(e.has(n)?i.classList.add("matched"):i.classList.remove("matched"))})}async function it(){if(!N)return;Z.forEach(n=>n.remove()),Z.clear();const e=j(),t=new Map;for(const n of e){const i=V(n);i&&(t.has(i)||t.set(i,[]),t.get(i).push(n))}for(const[n,i]of t){const s=await ee(n);if(!(!s||!isFinite(s.lat)||!isFinite(s.lng)))for(let a=0;a<i.length;a++){const r=i[a],o=Xt(a,i.length),c=s.lat+o.lat,l=s.lng+o.lng,d=Qt(r,c,l);d.addTo(N),Z.set(r.id,d)}}}function Xt(e,t){if(t===1)return{lat:0,lng:0};const n=.002,i=.001*Math.floor(e/8),s=n+i,r=e*2.399963;return{lat:s*Math.cos(r),lng:s*Math.sin(r)*1.4}}function Qt(e,t,n){const i=me(e),s=e.name.split(" ").map(h=>h[0]).join("").substring(0,2).toUpperCase(),r=ce().has(e.id),o=r?"matched":"",c=L.divIcon({className:"marker-wrapper",html:`<div class="marker-icon ${i} ${o}" data-profile-id="${e.id}">${s}</div>`,iconSize:[30,30],iconAnchor:[15,15]}),l=L.marker([t,n],{icon:c}),d=Yt(e,i,r);return l.bindPopup(d,{maxWidth:300}),l.on("click",()=>{window.dispatchEvent(new CustomEvent("profile-clicked",{detail:{profileId:e.id}}))}),l}function Yt(e,t,n=!1){const i=le(e),s=V(e),a=ve(e),r=ze(e,["hobby","hobbies","freizeit","interessen"]),o=ze(e,["sprache","sprachen","language"]),c=ze(e,["beruf","arbeit","job","tätigkeit","beschäftigung"]),l=a==="male"?"M":a==="female"?"W":a==="other"?"D":"",d=t==="local"?"Local":"Newcomer",h=t==="local"?"local":"newcomer";let f=`
    <div class="marker-popup">
      <div class="popup-header">
        <strong>${de(e.name)}</strong>
        <span class="group-badge ${h}">${d}</span>
        ${n?'<span class="matched-badge">✓ Vermittelt</span>':""}
      </div>
      <div class="popup-meta">
        ${i?`<span>${i} Jahre</span>`:""}
        ${l?`<span>${l}</span>`:""}
        ${s?`<span>PLZ ${s}</span>`:""}
      </div>
  `;if(n){const w=ae(e.id);if(w){const E=w.profile1.id===e.id?w.profile2.name:w.profile1.name;f+=`<div class="popup-field tandem-info"><strong>Tandem mit:</strong> ${de(E)}</div>`}}return c&&(f+=`<div class="popup-field"><strong>Beruf:</strong> ${de(Ie(c,50))}</div>`),o&&(f+=`<div class="popup-field"><strong>Sprachen:</strong> ${de(Ie(o,80))}</div>`),r&&(f+=`<div class="popup-field"><strong>Interessen:</strong> ${de(Ie(r,80))}</div>`),f+=`
      <div class="popup-action">
        ${n?"<em>Bereits vermittelt</em>":"<em>Klicken für Smart Match</em>"}
      </div>
    </div>
  `,f}function Ie(e,t){return e.length<=t?e:e.substring(0,t-3)+"..."}function de(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function ze(e,t){for(const n of t){const i=new RegExp(n,"i"),s=e.fields.find(a=>i.test(a.question));if(s!=null&&s.answer)return s.answer}return null}function en(e){Ue=e,Z.forEach((n,i)=>{var a;const s=(a=n.getElement())==null?void 0:a.querySelector(".marker-icon");s&&s.classList.toggle("selected",i===e)});const t=Z.get(e);t&&N&&N.setView(t.getLatLng(),Math.max(N.getZoom(),10))}function tn(){Ue=null,Z.forEach(e=>{var n;const t=(n=e.getElement())==null?void 0:n.querySelector(".marker-icon");t&&t.classList.remove("selected","compatible","incompatible","top-match")})}function nn(e,t,n){Z.forEach((i,s)=>{var r;if(s===Ue)return;const a=(r=i.getElement())==null?void 0:r.querySelector(".marker-icon");a&&(a.classList.remove("compatible","incompatible","top-match"),n.includes(s)?a.classList.add("compatible","top-match"):e.includes(s)?a.classList.add("compatible"):t.includes(s)&&a.classList.add("incompatible"))})}function sn(){N&&setTimeout(()=>{N==null||N.invalidateSize()},100)}window.addEventListener("map-needs-resize",sn);let B={},k=new Set,W=!1;function rn(){D(),an();const e=document.getElementById("filter-gender"),t=document.getElementById("filter-group"),n=document.getElementById("filter-search");e==null||e.addEventListener("change",()=>{B.gender=e.value,D()}),t==null||t.addEventListener("change",()=>{B.group=t.value,D()}),n==null||n.addEventListener("input",()=>{B.searchText=n.value,D()}),window.addEventListener("profiles-updated",D),window.addEventListener("tandems-updated",D),window.addEventListener("profile-clicked",i=>{Et(i.detail.profileId)})}function an(){const e=document.querySelector(".sidebar-header");if(!e||document.getElementById("manualMatchBtn"))return;const t=document.createElement("button");t.id="manualMatchBtn",t.className="btn btn-sm",t.innerHTML="👆 Manuell matchen",t.title="Zwei Profile zum Matchen auswählen",t.addEventListener("click",()=>{W=!W,k.clear(),window.dispatchEvent(new CustomEvent("profile-deselected")),Re(),D()}),e.appendChild(t)}function Re(){const e=document.getElementById("manualMatchBtn");e&&(W?(e.classList.add("active"),e.innerHTML=k.size===0?"✋ Wähle 2 Profile...":k.size===1?"✋ Noch 1 wählen...":"✅ Matchen!"):(e.classList.remove("active"),e.innerHTML="👆 Manuell matchen"))}function D(){const e=document.getElementById("profileList"),t=document.getElementById("profileCount");if(!e)return;const n=on();if(t&&(t.textContent=String(n.length)),n.length===0){e.innerHTML='<p class="empty-state">Keine Profile gefunden. Importiere Profile über den Button oben.</p>';return}e.innerHTML=n.map(i=>cn(i)).join(""),e.querySelectorAll(".profile-card").forEach(i=>{i.addEventListener("click",()=>{const s=i.getAttribute("data-profile-id");s&&Et(s)})})}function on(){let e=j();if(B.gender&&B.gender!=="all"&&(e=e.filter(t=>ve(t)===B.gender)),B.group&&B.group!=="all"&&(e=e.filter(t=>me(t)===B.group)),B.searchText){const t=B.searchText.toLowerCase();e=e.filter(n=>{const i=V(n)||"";return n.name.toLowerCase().includes(t)||i.includes(t)})}return e}function cn(e){const t=V(e)||"-",n=me(e),i=le(e),s=k.has(e.id),r=ce().has(e.id),o=r?ae(e.id):null,c=o?o.profile1.id===e.id?o.profile2.name:o.profile1.name:null,l=W&&s?Array.from(k).indexOf(e.id)+1:0;return`
    <div class="profile-card ${s?"selected":""} ${r?"matched":""} ${W?"manual-mode":""}" data-profile-id="${e.id}">
      ${l>0?`<div class="selection-number">${l}</div>`:""}
      <div class="name">${st(e.name)}</div>
      <div class="meta">
        <span class="group-badge ${n}">${n==="local"?"Local":"Newcomer"}</span>
        <span>PLZ: ${t}</span>
        ${i?`<span>${i} Jahre</span>`:""}
      </div>
      ${r?`
        <div class="matched-info">
          <span class="matched-badge">✓ Vermittelt</span>
          ${c?`<span class="partner-name">mit ${st(c.split(" ")[0])}</span>`:""}
        </div>
      `:""}
    </div>
  `}function Et(e){const t=be(e);if(!t)return;const n=ae(e);if(n&&!W){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:n.id,tandem:n,profileId:e}}));return}if(W){if(k.has(e))k.delete(e);else{if(k.size>=2){const i=Array.from(k)[0];k.delete(i)}k.add(e)}if(Re(),k.size===2){const i=Array.from(k),s=be(i[0]),a=be(i[1]);if(s&&a){const r=ae(s.id),o=ae(a.id);if(r||o){alert("Eines der Profile ist bereits in einem Tandem. Bitte zuerst das bestehende Tandem auflösen.");return}window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:s,profile2:a}})),W=!1,k.clear(),Re()}}D();return}if(k.has(e))k.delete(e),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:e}}));else{if(k.size>0){const i=Array.from(k)[0];k.clear(),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:i}}))}k.add(e),window.dispatchEvent(new CustomEvent("profile-selected",{detail:{profileId:e,profile:t}}))}D()}function st(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const ln=["vorname","nachname","name","vollständiger name","e-mail-adresse","e-mail","email","telefonnummer","telefon","id","user-id","teilnehmer-id","profil-id","gruppe","standort","region","west","ost","nord","süd","vermittler","vermittler*in","durchgeführt von","durchgeführt","datum/uhrzeit","datum","uhrzeit","termin","terminart","status","bearbeitungsstatus","anmeldestatus","infoabend","infonachmittag","format","aufnahmegespräch","standort-newsletter","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","portal-link","wie wirkt die person auf dich","eindruck","bewertung","wie schätzt du ein","einschätzung","beurteilung","sind weitere schritte nötig","nächste schritte","follow-up","aufnahmegespräch datum","gespräch datum","plz","postleitzahl","ort","stadt","köln","berlin","münchen","ausgeschlossen","ausgetreten","pausiert","vermittelt","unvermittelt","angemeldet","beginn","ende"];function dn(e){const t=e.toLowerCase().trim();return t.length<3||t==="geschlecht"||t==="dein geschlecht"?!0:ln.some(n=>t.includes(n)||n.includes(t))}function S(e,t){for(const n of t){const i=new RegExp(n,"i"),s=e.fields.find(a=>i.test(a.question)&&!dn(a.question));if(s!=null&&s.answer)return s.answer}return null}function je(e,t){const n=[],i=me(e),s=me(t);if(i===s)return{compatible:!1,score:0,failReason:"same_group",failDetails:`Beide sind ${i==="local"?"Locals":"Newcomer"} - nur interkulturelle Matches möglich`,softFactsScore:0,softFactsMax:15};const a=un(e,t);if(!a.pass)return{compatible:!1,score:0,failReason:"age_preference",failDetails:a.reason,softFactsScore:0,softFactsMax:15};const r=mn(e,t);if(!r.pass)return{compatible:!1,score:0,failReason:"gender_preference",failDetails:r.reason,softFactsScore:0,softFactsMax:15};const o=hn(e,t);if(!o.pass)return{compatible:!1,score:0,failReason:"time_overlap",failDetails:o.reason,softFactsScore:0,softFactsMax:15};const c=[],l=fn(e,t,n,c),d=15;return{compatible:!0,score:Math.min(5,Math.round(l/d*5)),softFactsScore:l,softFactsMax:d,details:n.join("; "),positiveFactors:c.slice(0,3)}}function un(e,t){const n=le(e),i=le(t);if(!n||!i)return{pass:!0};const s=Math.abs(n-i),a=S(e,["alter.*unterschied","alter.*tandem","wie groß.*alter"]),r=S(t,["alter.*unterschied","alter.*tandem","wie groß.*alter"]);if(a){const o=a.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&s>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${s} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&s>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${s} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&i<n)return{pass:!1,reason:`${e.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&i>n)return{pass:!1,reason:`${e.name}: Präferiert jüngeren Partner`}}if(r){const o=r.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&s>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${s} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&s>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${s} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&n<i)return{pass:!1,reason:`${t.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&n>i)return{pass:!1,reason:`${t.name}: Präferiert jüngeren Partner`}}return{pass:!0}}function mn(e,t){const n=ve(e),i=ve(t),s=S(e,["geschlecht.*tandem","geschlecht.*partner"]),a=S(t,["geschlecht.*tandem","geschlecht.*partner"]);if(s&&i){const r=s.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&i!=="female")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${s}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&i!=="male")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${s}" nicht erfüllt`}}}if(a&&n){const r=a.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&n!=="female")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${a}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&n!=="male")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${a}" nicht erfüllt`}}}return{pass:!0}}function hn(e,t){const n=S(e,["zeit.*treffen","zeit.*tandem","wann.*zeit"]),i=S(t,["zeit.*treffen","zeit.*tandem","wann.*zeit"]);if(!n||!i)return{pass:!0};const s=n.toLowerCase(),a=i.toLowerCase();return s.includes("flexibel")||a.includes("flexibel")?{pass:!0}:["morgens","mittags","nachmittags","abends","unter der woche","wochenende"].filter(c=>s.includes(c)&&a.includes(c)).length===0?{pass:!1,reason:"Keine gemeinsamen Zeitfenster gefunden"}:{pass:!0}}function fn(e,t,n,i){let s=0;const a=V(e),r=V(t);if(a&&r){const g=parseInt(a.substring(0,2)),v=parseInt(r.substring(0,2)),$=Math.abs(g-v);a===r?(s+=3,n.push("Gleiche PLZ"),i.push("Gleiche PLZ")):$===0?(s+=2.5,n.push("Gleiche Region (< 10 km)"),i.push("Nah beieinander")):$===1?(s+=2,n.push("Benachbarte Region"),i.push("Benachbarte Region")):$<=3?(s+=1.5,n.push("Nahe Region")):$<=5?s+=1:s+=.5}const o=le(e),c=le(t);if(o&&c){const g=Math.abs(o-c);g<=3?(s+=2,n.push(`Sehr ähnliches Alter (±${g} Jahre)`),i.push(g===0?"Gleich alt":`Nur ${g}J Unterschied`)):g<=5?(s+=1.8,n.push(`Ähnliches Alter (±${g} Jahre)`),i.push("Ähnliches Alter")):g<=10?s+=1.5:g<=15?s+=1:g<=20&&(s+=.5)}const l=S(e,["geschlecht.*tandem","geschlecht.*partner"]),d=S(t,["geschlecht.*tandem","geschlecht.*partner"]);(l||d)&&(s+=1,n.push("Geschlechtspräferenz erfüllt")),s+=1,n.push("Interkulturell");const h=S(e,["hobby","hobbies","hobbys"]),f=S(t,["hobby","hobbies","hobbys"]);if(h&&f){const g=gn(h,f);if(g.length>0){const v=Math.min(2,g.length*.4);s+=v,g.length>=3?(n.push("Viele gemeinsame Hobbys"),i.push("Viele gemeinsame Hobbys")):g.length>=2?(n.push("Mehrere gemeinsame Hobbys"),i.push("Gemeinsame Hobbys")):n.push("Gemeinsame Hobby-Interessen")}}const w=S(e,["freizeit(?!.*vermittler)"]),E=S(t,["freizeit(?!.*vermittler)"]);if(w&&E){const g=rt(w,E);g.length>=3?(s+=1.5,n.push("Ähnliche Freizeitinteressen")):g.length>=1&&(s+=.75)}const M=S(e,["themen.*interessieren","interess.*themen"]),C=S(t,["themen.*interessieren","interess.*themen"]);if(M&&C){const g=["politik","kunst","kultur","technologie","sport","musik","natur","reisen","essen","kochen","wissenschaft","geschichte","literatur"],v=M.toLowerCase(),$=C.toLowerCase(),x=g.filter(q=>v.includes(q)&&$.includes(q));x.length>=2?(s+=1.5,n.push("Mehrere gemeinsame Interessensgebiete"),i.push("Ähnliche Interessen")):x.length===1&&(s+=.75,n.push("Gemeinsame Interessensgebiete"))}const J=S(e,["freundschaft.*wichtig","wichtig.*freundschaft"]),te=S(t,["freundschaft.*wichtig","wichtig.*freundschaft"]);if(J&&te){const g=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","loyalität","treue"],v=J.toLowerCase(),$=te.toLowerCase(),x=g.filter(q=>v.includes(q)&&$.includes(q));x.length>=2?(s+=1.5,n.push("Ähnliche Wertvorstellungen"),i.push("Ähnliche Werte")):x.length===1&&(s+=.75)}const ne=S(e,["tandem.*vorstellung(?!.*geschlecht)"]),u=S(t,["tandem.*vorstellung(?!.*geschlecht)"]);if(ne&&u){const g=rt(ne,u);g.length>=2?(s+=1,n.push("Ähnliche Tandem-Vorstellungen")):g.length>=1&&(s+=.5)}const m=S(e,["community-event","event.*unternehmen"]),p=S(t,["community-event","event.*unternehmen"]);if(m&&p){const g=m.toLowerCase(),v=p.toLowerCase();(g.includes("ja")||g.includes("gerne"))&&(v.includes("ja")||v.includes("gerne"))&&(s+=.5)}return s}function gn(e,t){const n=e.split(/[,;]/).map(s=>et(s.trim())).filter(Boolean),i=t.split(/[,;]/).map(s=>et(s.trim())).filter(Boolean);return n.filter(s=>i.some(a=>s===a))}function rt(e,t){const n=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","mich","gerne","sehr","auch","aber","dass","wenn","weil","nicht","mehr","noch","schon","immer"]),i=e.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!n.has(a)),s=t.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!n.has(a));return i.filter(a=>s.some(r=>a===r||a.includes(r)||r.includes(a)))}let z=null,oe=[];function pn(){document.getElementById("smartMatchPanel");const e=document.getElementById("closeSmartMatch");e==null||e.addEventListener("click",()=>{at(),window.dispatchEvent(new CustomEvent("profile-deselected"))}),window.addEventListener("profile-selected",async t=>{z=t.detail.profile;const i=ae(z.id);if(i){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:i.id,tandem:i,profileId:z.id}})),z=null;return}await wn(),bn(),kn()}),window.addEventListener("profile-deselected",()=>{z=null,oe=[],at()})}async function wn(){if(!z)return;const e=j(),t=ce(),n=[];for(const i of e){if(i.id===z.id||t.has(i.id))continue;const s=je(z,i),a=V(z),r=V(i);let o,c;a&&r&&(o=await Ut(a,r),o!==void 0&&(c=o<1?"<1 km":`${Math.round(o)} km`)),n.push({profile:i,matchResult:s,distance:o,distanceText:c})}n.sort((i,s)=>i.matchResult.compatible!==s.matchResult.compatible?i.matchResult.compatible?-1:1:i.matchResult.compatible?s.matchResult.score-i.matchResult.score:0),oe=n}function bn(){const e=document.getElementById("smartMatchPanel"),t=document.getElementById("selectedProfileName"),n=document.getElementById("smartMatchContent");!e||!t||!n||!z||(t.textContent=z.name,n.innerHTML=vn(),e.classList.add("visible"),n.querySelectorAll(".match-item").forEach(i=>{i.addEventListener("click",()=>{const s=i.getAttribute("data-profile-id");s&&En(s)})}))}function at(){const e=document.getElementById("smartMatchPanel");e==null||e.classList.remove("visible")}function vn(){if(oe.length===0)return'<p class="empty-state">Keine anderen Profile zum Matchen vorhanden.</p>';const e=oe.filter(i=>i.matchResult.compatible),t=oe.filter(i=>!i.matchResult.compatible);let n="";return e.length>0&&(n+='<div class="match-section"><h4>Passende Matches</h4>',n+=e.map(i=>ot(i,!0)).join(""),n+="</div>"),t.length>0&&(n+='<div class="match-section"><h4>Unpassend (Hard Facts)</h4>',n+=t.map(i=>ot(i,!1)).join(""),n+="</div>"),n}function ot(e,t){const{profile:n,matchResult:i,distanceText:s}=e,a=yn(i.score);let r="";if(!t&&i.failReason){const c={age_preference:"🎂",gender_preference:"⚧️",time_overlap:"⏰",same_group:"👥"},l={age_preference:"Alter-Präferenz",gender_preference:"Geschlecht-Präferenz",time_overlap:"Keine Zeit-Überschneidung",same_group:"Gleiche Gruppe"},d=c[i.failReason]||"⚠️",h=l[i.failReason]||i.failReason;let f="";i.failDetails&&(f=`<div class="reason-details">${Ce(i.failDetails)}</div>`),r=`
      <div class="reason-box">
        <span class="reason-icon">${d}</span>
        <span class="reason-label">${h}</span>
        ${f}
      </div>
    `}let o="";return t&&i.positiveFactors&&i.positiveFactors.length>0&&(o=`
      <div class="positive-factors">
        ${i.positiveFactors.slice(0,2).map(c=>`<span class="factor">✓ ${Ce(c)}</span>`).join("")}
      </div>
    `),`
    <div class="match-item ${t?"":"incompatible"}" data-profile-id="${n.id}">
      <div class="stars">${t?a:"---"}</div>
      <div class="info">
        <div class="name">${Ce(n.name)}</div>
        <div class="match-meta">
          ${s?`<span class="distance">📍 ${s}</span>`:""}
        </div>
        ${o}
        ${r}
      </div>
    </div>
  `}function yn(e){let t="";for(let n=0;n<5;n++)t+=`<span class="star ${n<e?"":"empty"}">★</span>`;return t}function En(e){const t=be(e);!t||!z||window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:z,profile2:t}}))}function kn(){const e=[],t=[],n=[];for(const i of oe)i.matchResult.compatible?(e.push(i.profile.id),i.matchResult.score>=4&&n.push(i.profile.id)):t.push(i.profile.id);nn(e,t,n)}function Ce(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let X=null;function Ln(){const e=document.getElementById("importModal"),t=document.getElementById("importBtn"),n=document.getElementById("closeImportModal"),i=document.getElementById("pasteClipboard"),s=document.getElementById("dropZone"),a=document.getElementById("fileInput"),r=document.getElementById("cancelImport"),o=document.getElementById("confirmImport"),c=document.getElementById("importPreview");t==null||t.addEventListener("click",()=>ct()),n==null||n.addEventListener("click",()=>xe()),e==null||e.addEventListener("click",l=>{l.target===e&&xe()}),i==null||i.addEventListener("click",async()=>{try{const l=await navigator.clipboard.readText();Oe(l)}catch{alert("Fehler beim Lesen der Zwischenablage. Bitte erlaube den Zugriff.")}}),s==null||s.addEventListener("click",()=>a==null?void 0:a.click()),s==null||s.addEventListener("dragover",l=>{l.preventDefault(),s.classList.add("dragover")}),s==null||s.addEventListener("dragleave",()=>{s.classList.remove("dragover")}),s==null||s.addEventListener("drop",l=>{var h;l.preventDefault(),s.classList.remove("dragover");const d=(h=l.dataTransfer)==null?void 0:h.files[0];d&&lt(d)}),a==null||a.addEventListener("change",()=>{var d;const l=(d=a.files)==null?void 0:d[0];l&&lt(l)}),r==null||r.addEventListener("click",()=>{X=null,c&&(c.hidden=!0)}),o==null||o.addEventListener("click",()=>{if(X)try{const l=X.profiles.length,d=Kt(X),h=l-d;let f=`${d} neue Profile importiert!`;h>0&&(f+=`
${h} Duplikate übersprungen (bereits vorhanden).`),alert(f),xe()}catch(l){alert("Fehler beim Import: "+l.message)}}),window.addEventListener("import-from-clipboard",l=>{const d=l;ct(),Oe(d.detail)})}function ct(){const e=document.getElementById("importModal"),t=document.getElementById("importPreview");e==null||e.classList.add("visible"),t&&(t.hidden=!0),X=null}function xe(){const e=document.getElementById("importModal");e==null||e.classList.remove("visible"),X=null}function lt(e){if(!e.name.endsWith(".json")){alert("Bitte eine JSON-Datei auswählen.");return}const t=new FileReader;t.onload=n=>{var s;const i=(s=n.target)==null?void 0:s.result;Oe(i)},t.onerror=()=>{alert("Fehler beim Lesen der Datei.")},t.readAsText(e)}function Oe(e){try{let t;if(e.includes("SWAF_PROFILE_START")?t=Sn(e):t=JSON.parse(e),!t.profiles||!Array.isArray(t.profiles))throw new Error("Ungültiges Format: profiles Array nicht gefunden");X=t,$n(t)}catch(t){alert("Fehler beim Verarbeiten der Daten: "+t.message)}}function Sn(e){const t=[],n=/SWAF_PROFILE_START([\s\S]*?)SWAF_PROFILE_END/g;let i;for(;(i=n.exec(e))!==null;)try{const s=JSON.parse(i[1].trim());t.push({id:crypto.randomUUID(),url:s.url||"",name:s.name||"Unbekannt",pageType:s.pageType||"Hauptprofil",timestamp:s.timestamp||Date.now(),fields:s.fields||[]})}catch{}return{version:"1.0",exportedAt:new Date().toISOString(),profiles:t}}function $n(e){const t=document.getElementById("importPreview"),n=document.getElementById("previewCount"),i=document.getElementById("previewList");!t||!n||!i||(n.textContent=String(e.profiles.length),i.innerHTML=e.profiles.slice(0,10).map(s=>`<div class="preview-item">${Tn(s.name)} (${s.fields.length} Felder)</div>`).join(""),e.profiles.length>10&&(i.innerHTML+=`<div class="preview-item">... und ${e.profiles.length-10} weitere</div>`),t.hidden=!1)}function Tn(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const Ze="https://api.swaf.koeln/ollama",Mn="ollama",An="Tandem2026Matcher";function We(){return{"Content-Type":"application/json",Authorization:"Basic "+btoa(`${Mn}:${An}`)}}async function kt(){try{console.log("🤖 Prüfe Ollama-Verfügbarkeit...");const e=await fetch(`${Ze}/api/tags`,{method:"GET",headers:We(),signal:AbortSignal.timeout(5e3)});return console.log(`🤖 Ollama Response: ${e.status} ${e.statusText}`),e.ok}catch(e){return console.warn("🤖 Ollama nicht erreichbar:",e),!1}}async function Lt(){var e;try{const t=await fetch(`${Ze}/api/tags`,{headers:We()});return t.ok?((e=(await t.json()).models)==null?void 0:e.map(i=>i.name))||[]:[]}catch{return[]}}const Pe="mistral:7b";async function St(){const e=await Lt();return e.length===0?Pe:e.some(t=>t.includes("mistral"))?e.find(t=>t.includes("mistral"))||Pe:e[0]||Pe}const dt={hobbys:`Schreibe einen KURZEN Kommentar zur Gemeinsamkeit bei Hobbys.

KONTEXT: Die Lesenden sehen die Original-Antworten bereits in einer Tabelle. Dein Text steht daneben als Kommentar.

AUFGABE: Beschreibe NUR die Verbindung/Gemeinsamkeit - NICHT die Inhalte wiederholen!
STIL: "Hier gibt es Anknüpfungspunkte!", "Das passt gut zusammen.", "Gemeinsam könntet ihr..."
DUZEN: Immer "ihr/euch" - niemals "Sie"
VERMEIDE: Inhalte der Antworten wiederholen, Emojis, "Person 1/2"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,freizeit:`Schreibe einen KURZEN Kommentar zur Gemeinsamkeit bei Freizeitaktivitäten.

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR die Verbindung beschreiben, KEINE Inhalte wiederholen!
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,interessen:`Schreibe einen KURZEN Kommentar zu gemeinsamen Interessen.

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR die Verbindung beschreiben, KEINE Inhalte wiederholen!
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,sprachen:`Schreibe einen KURZEN Kommentar zu Sprachkenntnissen.

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR beschreiben wie die Sprachen zusammenpassen - KEINE Liste wiederholen!
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,beruf:`Schreibe einen KURZEN Kommentar zu beruflichen Verbindungen.

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR die Verbindung/Synergie beschreiben, KEINE Berufe wiederholen!
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,vorher:`Schreibe einen KURZEN Kommentar zu bisherigen Erfahrungen.

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR die Verbindung beschreiben, KEINE Inhalte wiederholen!
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,zukunft:`Schreibe einen KURZEN Kommentar zu Zukunftsplänen.

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR beschreiben wie ihr euch unterstützen könnt, KEINE Pläne wiederholen!
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,tandem_motivation:`Schreibe einen KURZEN Kommentar zur Tandem-Motivation.

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR beschreiben wie die Motivationen zusammenpassen!
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,freundschaft_werte:`Schreibe einen KURZEN Kommentar zu Freundschafts-Werten.

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR die gemeinsame Basis beschreiben, KEINE Werte auflisten!
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,events:`Schreibe einen KURZEN Kommentar zu gemeinsamen Aktivitäten/Events.

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR einen Vorschlag oder die Passung beschreiben!
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,verfuegbarkeit:`Schreibe einen KURZEN Kommentar zur zeitlichen Verfügbarkeit.

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR beschreiben ob/wie die Zeiten passen - KEINE Zeiten wiederholen!
DUZEN: "ihr/euch" - nie "Sie"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz):`,default:`Schreibe einen KURZEN Kommentar zur Frage "{Frage}".

KONTEXT: Die Original-Antworten stehen bereits in der Tabelle daneben.
AUFGABE: NUR die Gemeinsamkeit/Verbindung beschreiben, KEINE Inhalte wiederholen!
DUZEN: "ihr/euch" - nie "Sie"
Falls keine Gemeinsamkeit erkennbar: antworte nur "---"

Antwort A: "{Antwort1}"
Antwort B: "{Antwort2}"

Kommentar (1 kurzer Satz oder "---"):`};function In(e){const t=e.toLowerCase();return t.includes("hobby")||t.includes("hobbies")||t.includes("hobbys")?"hobbys":t.includes("freizeit")||t.includes("was machst du gerne")?"freizeit":t.includes("interesse")||t.includes("themen")?"interessen":t.includes("sprache")||t.includes("sprichst")?"sprachen":t.includes("beruf")||t.includes("arbeit")||t.includes("job")||t.includes("was machst du gerade")?"beruf":t.includes("vorher")||t.includes("früher")||t.includes("gelernt")||t.includes("was hast du")?"vorher":t.includes("zukunft")||t.includes("plan")||t.includes("ziel")||t.includes("vorhaben")?"zukunft":t.includes("warum")&&(t.includes("swaf")||t.includes("tandem")||t.includes("mitmachen"))?"tandem_motivation":t.includes("wichtig")&&(t.includes("freund")||t.includes("wert"))?"freundschaft_werte":t.includes("event")||t.includes("veranstaltung")||t.includes("unternehmen")||t.includes("aktivität")?"events":t.includes("zeit")||t.includes("wann")||t.includes("verfügbar")||t.includes("treffen")||t.includes("erreichbar")?"verfuegbarkeit":"default"}function $t(e,t,n){const i=In(e);return(dt[i]||dt.default).replace("{Frage}",e).replace("{Antwort1}",t).replace("{Antwort2}",n)}async function De(e,t,n,i){var r;const s=await St();if(!s)return null;const a=$t(e,t,n);try{const o=await fetch(`${Ze}/api/generate`,{method:"POST",headers:We(),body:JSON.stringify({model:s,prompt:a,stream:!1,options:{temperature:.7,num_predict:100}})});if(!o.ok)return console.warn("Ollama API error:",o.status),null;const l=((r=(await o.json()).response)==null?void 0:r.trim())||null;return!l||l==="---"||l.includes("keine Gemeinsamkeit")||l.includes("keine erkennbare")?null:l.replace(/^["']|["']$/g,"").trim()}catch(o){return console.warn("Ollama generation failed:",o),null}}async function Tt(){if(!await kt())return{available:!1,model:null,models:[]};const t=await Lt();return{available:!0,model:await St(),models:t}}let y=[],G="",H="",O=new Set;const zn='Schreibe hierzu einen kurzen Text. Die Frage zu den Antworten lautet {Frage}. Schreibe, wie die Antworten zusammenpassen könnten bzw. gebe Beispiele aus. Hier die Antworten: Person 1 - {Antwort1}, Person 2 - {Antwort2}. Schreibe den Text nach diesem Beispiel: "Ihr habt beide angegeben, dass ihr gerne kocht - ob mit Freund*innen oder alleine. Also los! Probiert doch einmal gemeinsam neue Rezepte. Außerdem geht ihr beide gerne Spazieren. Nach dem Essen sollst du Ruhn, oder 1.000 Schritte tun. Also habt ihr ja quasi schon einen Tagesplan ;) Weil ihr beide gerne auch kulturelle Dinge macht, wie in das Theater/Museum/oder auf andere Kulturveranstaltungen geht - schaut doch mal auf rausgegangen.de was es in Köln so die nächsten Tage gibt. Oder guckt bei uns im Eventportal: www.startwithafriend.de/events" - Nenne KEINE Namen oder andere Personenbezeichnungen.',Ke=["Person","Sprachen & Herkunft","Beruf & Bildung","Hobbys & Interessen","Tandem-Wünsche","Verfügbarkeit","Sonstiges"],Cn=["vermittler","durchgeführt von","status","terminart","anmeldestatus","bearbeitungsstatus","infoabend","infonachmittag","aufnahmegespräch datum","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","wie wirkt die person","eindruck","einschätzung","bewertung","nächste schritte","follow-up","user-id","profil-id","teilnehmer-id","women_kpi","kpi","integrationskurs","besuchst du gerade einen integrationskurs","vorgeschlagene termine","suggested_appointments","telefonnummer","phone_number","telefon","responsible_user","responsible","registration_interview","appointment_type","appointment_info","region","department_region","department","process_history","process_current_step","flucht","einwandungserfahrung","immigration_experience","create_uid","existing_tandem_count","tandem_count","birthday","geburtstag","geburtsdatum","group","gruppe","e-mail","email","e-mail-adresse","emailadresse","nachname","last_name","lastname","familienname","full_name","fullname","vollständiger name","datum/uhrzeit","datum uhrzeit","anmeldedatum","registrierungsdatum"],xn=["name","full name"];function Pn(e){const t=e.toLowerCase();return t.includes("name")||t.includes("alter")||t.includes("geschlecht")||t.includes("geboren")||t.includes("plz")||t.includes("postleitzahl")?"Person":t.includes("sprache")||t.includes("herkunft")||t.includes("land")||t.includes("deutschland")||t.includes("seit wann")?"Sprachen & Herkunft":t.includes("beruf")||t.includes("arbeit")||t.includes("studium")||t.includes("studiert")||t.includes("abschluss")||t.includes("branche")||t.includes("was machst du gerade")||t.includes("was hast du vorher gemacht")||t.includes("was hast du gelernt")||t.includes("in zukunft")||t.includes("zukunft gerne machen")?"Beruf & Bildung":t.includes("hobby")||t.includes("freizeit")||t.includes("interesse")||t.includes("ausprobieren")||t.includes("was machst du gerne")||t.includes("freundschaft")||t.includes("wichtig")||t.includes("event")||t.includes("anbieten")||t.includes("themen")||t.includes("community")||t.includes("unternehmen")?"Hobbys & Interessen":t.includes("tandem")||t.includes("swaf")||t.includes("mitmachen")||t.includes("warum")||t.includes("vorstellung")||t.includes("geschlecht")&&t.includes("partner")?"Tandem-Wünsche":t.includes("zeit")||t.includes("treffen")||t.includes("wann")||t.includes("erreichen")||t.includes("kontakt")||t.includes("bewegst")?"Verfügbarkeit":"Sonstiges"}function Bn(e){const t=e.toLowerCase().trim();return xn.includes(t)?!0:Cn.some(n=>t.includes(n))}function _e(e){return e?["übersprungen","keine angabe","k.a.","n/a","-","","egal","keine","null","undefined"].includes(e.toLowerCase().trim()):!0}const Nn=["name","vorname","nachname","plz","postleitzahl","standort","ort","adresse","wohnort","geschlecht","gender","alter","age","geburt","in deutschland geboren","in welchem land","herkunftsland","geburtsland","woher kommst du","country","altersunterschied","geschlechterpräferenz","alterspräferenz"];function qn(e){const t=e.toLowerCase();return Nn.some(n=>t.includes(n))}function Mt(e,t,n){localStorage.removeItem("swaf_ai_suggestions_cache"),G=mt(t.name),H=mt(n.name);const i=new Map;function s(r,o,c){if(Bn(r)||!o||_e(o))return;const l=On(r),d=i.get(l);d?(c?d.answer1?d.answer1!==o&&(d.answer1+="; "+o):d.answer1=o:d.answer2?d.answer2!==o&&(d.answer2+="; "+o):d.answer2=o,d.mergedQuestions.includes(r)||d.mergedQuestions.push(r)):i.set(l,{displayQuestion:r,answer1:c?o:"",answer2:c?"":o,mergedQuestions:[r]})}for(const r of t.fields)s(r.question,r.answer||"",!0);for(const r of n.fields)s(r.question,r.answer||"",!1);y=[];let a=0;for(const[r,o]of i){if(!o.answer1&&!o.answer2)continue;const c=Dn(r,o.displayQuestion),l=Ee(c,o.answer1,o.answer2),d=l.length>0||o.answer1&&o.answer2;y.push({id:`row-${a}`,question:c,answer1:o.answer1,answer2:o.answer2,comment:l,selected:!1,included:d,collapsed:!d,category:Pn(c)}),a++}y.sort((r,o)=>{const c=Ke.indexOf(r.category),l=Ke.indexOf(o.category);return c!==l?c-l:r.included!==o.included?r.included?-1:1:r.question.localeCompare(o.question)}),O.clear(),ye(e);for(const r of y)(r.question.toLowerCase().includes("plz")||r.question.toLowerCase().includes("postleitzahl"))&&r.answer1&&r.answer2&&Wn(r.answer1,r.answer2,r.id)}const Rn=[{key:"alter",patterns:["alter","age","wie alt bist du","wie alt","dein alter","geburtsjahr"]},{key:"geschlecht",patterns:["geschlecht","gender","dein geschlecht","welches geschlecht"]},{key:"altersunterschied",patterns:["altersunterschied","alterspräferenz","age_difference","max_age_difference","maximaler altersunterschied","altersunterschied zum tandempartner"]},{key:"geschlechterpräferenz",patterns:["geschlechterpräferenz","gender_preference","geschlecht des tandems","geschlecht tandempartner","welches geschlecht soll","gewünschtes geschlecht"]},{key:"vorname",patterns:["vorname","firstname","first_name","first name"]},{key:"plz",patterns:["plz","postleitzahl","postal code","zip","zipcode","deine plz"]},{key:"hobbys",patterns:["hobbys","hobbies","hobby"]},{key:"freizeit",patterns:["freizeit","freizeitaktivitäten"]},{key:"interessen",patterns:["interessen","interests"]},{key:"sprachen",patterns:["sprachen","languages","sprache","welche sprachen sprichst du","welche sprachen"]},{key:"herkunftsland",patterns:["herkunftsland","herkunft","woher kommst du","aus welchem land","country"]},{key:"seit_wann_deutschland",patterns:["seit wann in deutschland","seit wann bist du in deutschland","wie lange in deutschland","in deutschland seit"]}],ut={vorname:"Vorname",alter:"Alter",geschlecht:"Geschlecht",plz:"PLZ",hobbys:"Hobbys",freizeit:"Freizeitaktivitäten",interessen:"Interessen",sprachen:"Sprachen",herkunftsland:"Herkunftsland",seit_wann_deutschland:"Seit wann in Deutschland",altersunterschied:"Maximaler Altersunterschied",geschlechterpräferenz:"Geschlecht des Tandempartners"};function On(e){const t=e.toLowerCase().replace(/[?!.,:*_-]/g," ").replace(/\s+/g," ").trim(),n=[...Rn].sort((i,s)=>{const a=Math.max(...i.patterns.map(o=>o.length));return Math.max(...s.patterns.map(o=>o.length))-a});for(const i of n)for(const s of i.patterns)if(t===s||t.startsWith(s+" ")||t.endsWith(" "+s)||t.includes(" "+s+" "))return i.key;return t}function Dn(e,t){return ut[e]?ut[e]:t}function ye(e){const t=O.size,n=y.filter(a=>!a.hidden),i=n.filter(a=>a.included).length,s=new Map;for(const a of n)s.has(a.category)||s.set(a.category,[]),s.get(a.category).push(a);e.innerHTML=`
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
        <span class="toolbar-info">${i} von ${n.length} Feldern</span>
      </div>

      <div class="editor-table">
        ${Ke.map(a=>{const r=s.get(a);if(!r||r.length===0)return"";const o=r.filter(c=>c.included).length;return`
            <div class="category-section">
              <div class="category-header">
                <span>${a}</span>
                <span class="category-count">${o}/${r.length}</span>
              </div>
              ${r.map(c=>Kn(c)).join("")}
            </div>
          `}).join("")}
      </div>

      <div class="editor-preview">
        <div class="preview-header">
          <strong>E-Mail-Vorschau (${i} Felder):</strong>
          <button class="btn btn-sm" id="copyEmailBtn">📋 Kopieren</button>
        </div>
        <div class="preview-content" id="emailPreview">
          ${Ve()}
        </div>
      </div>
    </div>
  `,_n(e)}function Kn(e){const t=O.has(e.id),n=e.comment&&e.comment.length>0;return`
    <div class="editor-row ${t?"selected":""} ${e.included?"included":"excluded"} ${e.collapsed?"collapsed":""}" data-row-id="${e.id}">
      <div class="row-header">
        <label class="include-toggle" title="In E-Mail einschließen">
          <input type="checkbox" class="include-checkbox" data-row-id="${e.id}" ${e.included?"checked":""}>
          <span class="toggle-slider"></span>
        </label>
        <div class="row-question" data-row-id="${e.id}">
          <span class="collapse-icon">${e.collapsed?"▸":"▾"}</span>
          <span class="question-text">${b(e.question)}</span>
          ${n?'<span class="has-comment-indicator">✓</span>':""}
        </div>
        <div class="row-quick-actions">
          <input type="checkbox" class="merge-checkbox" data-row-id="${e.id}" ${t?"checked":""} title="Für Zusammenführen auswählen">
        </div>
      </div>

      <div class="row-details ${e.collapsed?"hidden":""}">
        <div class="row-answers">
          <div class="answer-cell">
            <div class="answer-label">${b(G)}:</div>
            <textarea
              class="answer-input answer1-input"
              data-row-id="${e.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${b(e.answer1)}</textarea>
          </div>
          <div class="answer-cell">
            <div class="answer-label">${b(H)}:</div>
            <textarea
              class="answer-input answer2-input"
              data-row-id="${e.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${b(e.answer2)}</textarea>
          </div>
        </div>

        <div class="row-comment">
          <textarea
            class="comment-input"
            data-row-id="${e.id}"
            placeholder="Gemeinsamkeit / Kommentar eingeben..."
            rows="2"
          >${b(fe(e.comment))}</textarea>
          ${ni(e.comment)}
          <div class="comment-buttons">
            <button class="btn-icon smart-suggest" data-row-id="${e.id}" title="Lokaler Textvorschlag">💡</button>
            <button class="btn-icon ai-assist" data-row-id="${e.id}" title="KI-Unterstützung (ChatGPT/Claude)">🤖</button>
          </div>
        </div>
      </div>
    </div>
  `}function _n(e){var i,s,a;e.querySelectorAll(".include-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;const d=y.find(h=>h.id===l);if(d){d.included=c.checked,ie(e);const h=e.querySelector(`.editor-row[data-row-id="${l}"]`);h&&(h.classList.toggle("included",d.included),h.classList.toggle("excluded",!d.included))}})}),e.querySelectorAll(".merge-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;c.checked?O.add(l):O.delete(l);const d=e.querySelector("#mergeRowsBtn");d&&(d.disabled=O.size<2,d.textContent=`⊕ Zusammenführen (${O.size})`)})}),e.querySelectorAll(".row-question").forEach(r=>{r.addEventListener("click",o=>{const c=r.dataset.rowId;if(!c)return;const l=y.find(d=>d.id===c);if(l){l.collapsed=!l.collapsed;const d=e.querySelector(`.editor-row[data-row-id="${c}"]`);if(d){d.classList.toggle("collapsed",l.collapsed);const h=d.querySelector(".row-details"),f=d.querySelector(".collapse-icon");h&&h.classList.toggle("hidden",l.collapsed),f&&(f.textContent=l.collapsed?"▸":"▾")}}})});function t(r){r.style.height="auto",r.style.height=Math.min(r.scrollHeight,200)+"px"}e.querySelectorAll(".answer1-input").forEach(r=>{const o=r;t(o),o.addEventListener("input",c=>{const l=c.target;t(l);const d=l.dataset.rowId;if(!d)return;const h=y.find(f=>f.id===d);h&&(h.answer1=l.value,ie(e))})}),e.querySelectorAll(".answer2-input").forEach(r=>{const o=r;t(o),o.addEventListener("input",c=>{const l=c.target;t(l);const d=l.dataset.rowId;if(!d)return;const h=y.find(f=>f.id===d);h&&(h.answer2=l.value,ie(e))})}),e.querySelectorAll(".comment-input").forEach(r=>{t(r)}),e.querySelectorAll(".comment-input").forEach(r=>{r.addEventListener("input",o=>{const c=o.target,l=c.dataset.rowId;if(!l)return;const d=y.find(h=>h.id===l);if(d){if(d.comment=c.value,c.value.length>0&&!d.included){d.included=!0;const h=e.querySelector(`.include-checkbox[data-row-id="${l}"]`);h&&(h.checked=!0)}ie(e)}})}),e.querySelectorAll(".smart-suggest").forEach(r=>{r.addEventListener("click",async o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=y.find(h=>h.id===c);if(!l)return;l.comment=Ee(l.question,l.answer1,l.answer2);const d=e.querySelector(`.comment-input[data-row-id="${c}"]`);if(d&&(d.value=l.comment),ie(e),(!l.comment||l.comment.length<10)&&l.answer1&&l.answer2&&await kt()){r.textContent="...";const f=await De(l.question,l.answer1,l.answer2);f&&(l.comment=f,l.included=!0,d&&(d.value=l.comment),ie(e)),r.textContent="💡"}})}),e.querySelectorAll(".ai-assist").forEach(r=>{r.addEventListener("click",o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=y.find(d=>d.id===c);l&&Yn(l)})}),(i=e.querySelector("#mergeRowsBtn"))==null||i.addEventListener("click",()=>{Fn(),ye(e)}),(s=e.querySelector("#regenerateBtn"))==null||s.addEventListener("click",()=>{for(const r of y)r.comment=Ee(r.question,r.answer1,r.answer2),r.included=r.comment.length>0;ye(e)});const n=e.querySelector("#ollamaBtn");Tt().then(r=>{r.available?(n.disabled=!1,n.textContent="KI generieren",n.title="Mit Mistral KI generieren"):(n.textContent="KI nicht verfügbar",n.title="KI-Server nicht erreichbar")}).catch(()=>{n.textContent="KI nicht verfügbar",n.title="Fehler bei der Verbindung zum KI-Server"}),n==null||n.addEventListener("click",async()=>{n.disabled=!0,n.textContent="KI läuft...";const r=y.filter(o=>o.included&&o.answer1&&o.answer2&&!qn(o.question)).map(o=>({question:o.question,answer1:o.answer1,answer2:o.answer2,rowId:o.id}));ei(r,e,()=>{n.disabled=!1,n.textContent="KI generieren"})}),(a=e.querySelector("#copyEmailBtn"))==null||a.addEventListener("click",()=>{const r=Je(),o=ti();if(navigator.clipboard&&typeof ClipboardItem<"u"){const c=[new ClipboardItem({"text/html":new Blob([o],{type:"text/html"}),"text/plain":new Blob([r],{type:"text/plain"})})];navigator.clipboard.write(c).then(()=>{const l=e.querySelector("#copyEmailBtn");l&&(l.textContent="✓ Kopiert (Word-kompatibel)!",setTimeout(()=>l.textContent="📋 Kopieren",2e3))}).catch(()=>{navigator.clipboard.writeText(r)})}else navigator.clipboard.writeText(r).then(()=>{const c=e.querySelector("#copyEmailBtn");c&&(c.textContent="✓ Kopiert!",setTimeout(()=>c.textContent="📋 Kopieren",2e3))})})}function Fn(){if(O.size<2)return;const e=Array.from(O),t=e[0],n=y.find(s=>s.id===t);if(!n)return;const i=e.slice(1);for(const s of i){const a=y.find(r=>r.id===s);a&&(n.question+=" + "+a.question,a.answer1&&a.answer1!==n.answer1&&(n.answer1=n.answer1?n.answer1+"; "+a.answer1:a.answer1),a.answer2&&a.answer2!==n.answer2&&(n.answer2=n.answer2?n.answer2+"; "+a.answer2:a.answer2),a.comment&&(n.comment=n.comment?n.comment+"; "+a.comment:a.comment),a.included=!1,n.mergedWith||(n.mergedWith=[]),n.mergedWith.push(a.question.substring(0,30)))}n.comment=Ee(n.question,n.answer1,n.answer2),O.clear()}function Ee(e,t,n){const i=e.toLowerCase(),s=(t||"").toLowerCase().trim(),a=(n||"").toLowerCase().trim();if(!s&&!a||_e(s)&&_e(a))return"";if(s===a&&s.length>2)return i.includes("wichtig")||i.includes("freundschaft")?`Gemeinsamer Wert: ${t}`:i.includes("studium")&&s.includes("ja")?"Beide haben studiert - das verbindet!":`Übereinstimmung: ${t}`;if(i.includes("alter")&&!i.includes("unterschied")){const r=parseInt(s),o=parseInt(a);if(!isNaN(r)&&!isNaN(o)){const c=Math.abs(r-o);return c===0?"Genau gleich alt!":c<=3?`Nur ${c} Jahre Unterschied - perfekt!`:c<=7?`${c} Jahre Unterschied - passt gut`:c<=15?`${c} Jahre Unterschied - verschiedene Perspektiven`:`${c} Jahre Unterschied`}}return i.includes("sprache")||i.includes("sprichst")?Gn(t,n):i.includes("hobby")||i.includes("freizeit")||i.includes("interesse")||i.includes("ausprobieren")||i.includes("was machst du gerne")||i.includes("event")||i.includes("anbieten")||i.includes("unternehmen")||i.includes("themen")?Hn(t,n):i.includes("beruf")||i.includes("arbeit")||i.includes("studium")||i.includes("gelernt")||i.includes("zukunft")||i.includes("branche")||i.includes("was machst du gerade")||i.includes("vorher gemacht")?Vn(t,n):i.includes("zeit")||i.includes("treffen")||i.includes("wann")||i.includes("erreichbar")?Un(t,n):i.includes("wichtig")||i.includes("freundschaft")||i.includes("erwartung")?jn(t,n):i.includes("plz")||i.includes("postleitzahl")?Zn(t,n):i.includes("herkunft")||i.includes("land")||i.includes("woher")?Jn(t,n):i.includes("tandem")||i.includes("warum")||i.includes("mitmachen")||i.includes("swaf")||i.includes("start with a friend")?Xn(t,n):i.includes("geschlecht")&&(i.includes("partner")||i.includes("tandem"))?Qn(t,n):At(t,n)}function Gn(e,t){const n=e.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),i=t.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),s=n.filter(a=>i.some(r=>a.includes(r)||r.includes(a)));return s.length>0?`Gemeinsame Sprachen: ${[...new Set(s)].join(", ")}`:""}function Hn(e,t){const n=e.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),i=t.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),s=[["sport","fitness","training","gym","joggen","laufen"],["wandern","hiking","spazieren","natur","wald"],["kochen","backen","essen","kulinarisch","rezept"],["musik","konzert","instrument","singen"],["lesen","bücher","literatur"],["reisen","urlaub","travel","länder"],["film","kino","serien","netflix","movie"],["kunst","museum","malen","zeichnen","kreativ"],["tanzen","dance","salsa","bachata","tanz"],["fahrrad","radfahren","cycling","bike"],["foto","fotografieren","photography","kamera"],["café","kaffee","coffee"],["sprache","lernen","language"],["garten","pflanzen","garden"],["yoga","meditation","entspannung"],["schwimmen","baden","swimming"]],a=[];for(const o of n)for(const c of i){if(o.includes(c)||c.includes(o)){a.push(o.length>c.length?o:c);continue}for(const l of s){const d=l.some(f=>o.includes(f)),h=l.some(f=>c.includes(f));d&&h&&a.push(l[0])}}const r=[...new Set(a)];return r.length>0?r.length===1?`Gemeinsames Hobby: ${r[0]}`:`Gemeinsame Hobbys: ${r.slice(0,4).join(", ")}`:""}function Un(e,t){const n=["morgens","mittags","nachmittags","abends","wochenende","unter der woche","flexibel"],i=e.toLowerCase(),s=t.toLowerCase(),a=n.filter(r=>i.includes(r)&&s.includes(r));return a.includes("flexibel")||a.length>=2?"Zeitlich flexibel - passt gut!":a.length>0?`Gemeinsame Zeit: ${a.join(", ")}`:""}function jn(e,t){const n=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","kommunikation"],i=e.toLowerCase(),s=t.toLowerCase(),a=n.filter(r=>i.includes(r)&&s.includes(r));return a.length>0?`Gemeinsame Werte: ${a.join(", ")}`:""}function Zn(e,t){const n=ke(e),i=ke(t);return!n||!i?"":n===i?"Gleiche PLZ":n.substring(0,2)===i.substring(0,2)?"Gleiche Region - Entfernung wird berechnet...":"Entfernung wird berechnet..."}async function Wn(e,t,n,i){const s=ke(e),a=ke(t);if(!s||!a)return;const r=y.find(c=>c.id===n);if(!r)return;const o=await jt(s,a);if(o){const c=await ee(s),l=await ee(a);let d=Zt(o);if(c&&l){const E=Wt(c,l);d+=` [🗺️](${E.google})`}r.comment=d,r.included=!0;const h=document.querySelector(`.comment-input[data-row-id="${n}"]`);h&&(h.value=fe(d));const f=document.querySelector(`.include-checkbox[data-row-id="${n}"]`);f&&(f.checked=!0);const w=document.querySelector("#emailPreview");w&&(w.innerHTML=Ve())}}function ke(e){const t=e.match(/\b(\d{5})\b/);return t?t[1]:null}function Vn(e,t){const n=e.toLowerCase(),i=t.toLowerCase(),s=[["student","studier","uni","hochschule","ausbildung"],["arbeit","beruf","job","angestellt"],["selbstständig","freelance","freiberuflich"],["suche","arbeitslos","orientierung"],["it","software","computer","programmier"],["sozial","pflege","gesundheit","medizin"],["lehrer","pädagog","bildung","schule"],["ingenieur","technik","maschinenbau"],["wirtschaft","bwl","marketing","vertrieb"],["kunst","design","kreativ","musik"]],a=[];for(const r of s){const o=r.some(l=>n.includes(l)),c=r.some(l=>i.includes(l));o&&c&&a.push(r[0])}return a.length>0?`Ähnlicher Bereich: ${a.join(", ")}`:(n.includes("student")||n.includes("studier"))&&(i.includes("student")||i.includes("studier"))?"Beide studieren - viel gemeinsam!":At(e,t)}function Jn(e,t){const n=e.toLowerCase(),i=t.toLowerCase(),s=["deutschland","syrien","iran","irak","afghanistan","türkei","ukraine","eritrea","somalia","nigeria","pakistan","indien","china","russland"];for(const a of s)if(n.includes(a)&&i.includes(a))return`Beide haben Bezug zu ${a.charAt(0).toUpperCase()+a.slice(1)}`;return(n.includes("kultur")||n.includes("tradition"))&&(i.includes("kultur")||i.includes("tradition"))?"Beide interessiert an Kultur & Traditionen":""}function Xn(e,t){const n=e.toLowerCase(),i=t.toLowerCase(),s=[{keywords:["sprache","deutsch","lernen","verbessern"],text:"Beide wollen Sprachkenntnisse verbessern"},{keywords:["freund","kennenlernen","kontakt","leute"],text:"Beide suchen neue Kontakte"},{keywords:["kultur","austausch","integration"],text:"Beide wollen kulturellen Austausch"},{keywords:["helfen","unterstütz","begleiten"],text:"Gegenseitige Unterstützung ist wichtig"},{keywords:["spaß","unternehmung","aktivität"],text:"Beide wollen gemeinsam Spaß haben"}];for(const a of s){const r=a.keywords.some(c=>n.includes(c)),o=a.keywords.some(c=>i.includes(c));if(r&&o)return a.text}return""}function Qn(e,t){const n=e.toLowerCase(),i=t.toLowerCase();return(n.includes("egal")||n.includes("keine präferenz"))&&(i.includes("egal")||i.includes("keine präferenz"))?"Beide flexibel beim Geschlecht":""}function At(e,t){if(!e||!t)return"";const n=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","gerne","sehr","auch","aber","wenn","dann","noch","schon","kann","will","muss","soll","hat","haben","sein","wird","sind","ist","nicht","mehr","viel","viele","alle","diese","dies","dem","den","des"]),i=e.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!n.has(o)),s=t.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!n.has(o)),a=i.filter(o=>s.some(c=>o===c||o.length>4&&c.length>4&&(o.includes(c)||c.includes(o)))),r=[...new Set(a)];return r.length>=1?`Gemeinsam: ${r.slice(0,4).join(", ")}`:e.length>5&&t.length>5?"Beide haben geantwortet":""}function ie(e){const t=e.querySelector("#emailPreview");t&&(t.innerHTML=Ve())}function Ve(){const t=y.filter(i=>i.included).filter(i=>i.answer1||i.answer2);let n=`
    <div class="email-intro">
      Hi <strong>${b(G)}</strong> und <strong>${b(H)}</strong>,<br><br>
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
          <th>${b(G)}</th>
          <th>${b(H)}</th>
          <th>Gemeinsamkeit</th>
        </tr>
      </thead>
      <tbody>
  `;for(const i of t){const s=ii(i.comment);n+=`
      <tr>
        <td><strong>${b(i.question)}</strong></td>
        <td>${b(i.answer1)||"-"}</td>
        <td>${b(i.answer2)||"-"}</td>
        <td class="commonality">${s}</td>
      </tr>
    `}return n+=`
      </tbody>
    </table>
    <div class="email-outro">
      <br>Ich freue mich über eure Rückmeldung!
    </div>
  `,n}function Yn(e,t){var a,r,o,c;const i=(localStorage.getItem("swaf_ai_prompt")||zn).replace("{Frage}",e.question).replace("{Antwort1}",e.answer1||"keine Angabe").replace("{Antwort2}",e.answer2||"keine Angabe"),s=document.createElement("div");s.className="ai-modal-overlay",s.innerHTML=`
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
          <textarea class="ai-prompt-text" readonly rows="6">${b(i)}</textarea>
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
  `,document.body.appendChild(s),(a=s.querySelector(".close-modal"))==null||a.addEventListener("click",()=>s.remove()),s.addEventListener("click",l=>{l.target===s&&s.remove()}),(r=s.querySelector(".ai-chatgpt"))==null||r.addEventListener("click",()=>{navigator.clipboard.writeText(i).then(()=>{window.open("https://chat.openai.com/","_blank"),s.remove(),Fe("💬 ChatGPT geöffnet - Prompt in Zwischenablage kopiert!")})}),(o=s.querySelector(".ai-claude"))==null||o.addEventListener("click",()=>{navigator.clipboard.writeText(i).then(()=>{window.open("https://claude.ai/","_blank"),s.remove(),Fe("🤖 Claude geöffnet - Prompt in Zwischenablage kopiert!")})}),(c=s.querySelector(".ai-copy-prompt"))==null||c.addEventListener("click",()=>{navigator.clipboard.writeText(i).then(()=>{const l=s.querySelector(".ai-copy-prompt");l.textContent="✓ Kopiert!",setTimeout(()=>l.textContent="📋 Nur Prompt kopieren",2e3)})})}function Fe(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),3e3)}function ei(e,t,n){const i=e.map(u=>({...u,generated:"",status:"pending",selected:!0}));let s=!1,a=new Set;const r=document.createElement("div");r.className="ai-modal-overlay";function o(){return`
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
            ${i.map((u,m)=>c(u,m)).join("")}
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
            <span class="ai-preview-question">${b(u.question)}</span>
            <button class="btn-icon ai-regenerate-btn" data-index="${m}" title="Neu generieren" ${u.status==="generating"?"disabled":""}>🔄</button>
          </div>
          <div class="ai-preview-answers">
            <span class="answer-snippet" title="${b(u.answer1)}">${b(ue(u.answer1,30))}</span>
            <span class="answer-vs">+</span>
            <span class="answer-snippet" title="${b(u.answer2)}">${b(ue(u.answer2,30))}</span>
          </div>
          <div class="ai-preview-result" id="result-${m}">
            ${l(u,m)}
          </div>
          <details class="ai-item-prompt">
            <summary>Prompt anzeigen</summary>
            <pre class="ai-prompt-mini">${b($t(u.question,u.answer1,u.answer2))}</pre>
          </details>
        </div>
      </div>
    `}function l(u,m){return u.status==="pending"?'<div class="ai-preview-pending">Wartet...</div>':u.status==="generating"?'<div class="ai-preview-generating"><span class="ai-mini-spinner"></span> Generiere...</div>':u.status==="error"?'<div class="ai-preview-error">Fehler - klicke 🔄 zum erneuten Versuch</div>':`<textarea class="ai-preview-textarea" data-index="${m}" rows="4">${b(u.generated)}</textarea>`}function d(u){const m=i[u],p=r.querySelector(`#preview-item-${u}`);if(!p)return;p.className=`ai-preview-item ${m.status}`;const g=p.querySelector(`#result-${u}`);if(g){g.innerHTML=l(m,u);const x=g.querySelector(".ai-preview-textarea");x&&x.addEventListener("input",q=>{const ge=q.target;i[u].generated=ge.value})}const v=p.querySelector('input[type="checkbox"]');v&&(v.disabled=m.status!=="done",v.checked=m.selected);const $=p.querySelector(".ai-regenerate-btn");$&&($.disabled=m.status==="generating"),h()}function h(){const u=i.filter($=>$.status==="done").length,m=i.filter($=>$.selected&&$.status==="done").length,p=r.querySelector("#progressText");p&&(p.textContent=`${u}/${e.length} generiert`);const g=r.querySelector("#selectedCount");g&&(g.textContent=String(m));const v=r.querySelector("#applyPreviewBtn");v&&(v.disabled=m===0)}function f(){const u=r.querySelector("#progressInfo");if(u){const g=i.filter(v=>v.status==="done").length;u.innerHTML=`<span id="progressText">${g} Vorschläge generiert</span>`}const m=r.querySelector("#introText");if(m){const g=i.filter(v=>v.status==="done").length;m.innerHTML=`<strong>${g} Vorschläge generiert.</strong> Wähle aus, welche du übernehmen möchtest:`}const p=r.querySelector("#stopGenerationBtn");p&&(p.style.display="none")}function w(){const u={};for(const m of i)m.status==="done"&&m.generated&&(u[m.question]=m.generated);Object.keys(u).length>0&&localStorage.setItem("swaf_ai_suggestions_cache",JSON.stringify(u))}function E(){try{const u=localStorage.getItem("swaf_ai_suggestions_cache");if(u){const m=JSON.parse(u);for(const p of i)m[p.question]&&!p.generated&&(p.generated=m[p.question],p.status="done",p.selected=!1)}}catch(u){console.warn("Could not load AI suggestions cache:",u)}}function M(){w(),s=!0,r.remove(),n()}function C(){var u,m,p,g,v,$,x,q,ge;(u=r.querySelector(".close-modal"))==null||u.addEventListener("click",M),(m=r.querySelector("#cancelPreviewBtn"))==null||m.addEventListener("click",M),(p=r.querySelector("#stopGenerationBtn"))==null||p.addEventListener("click",()=>{s=!0,f()}),(g=r.querySelector("#selectAllBtn"))==null||g.addEventListener("click",()=>{i.forEach((R,T)=>{if(R.status==="done"){R.selected=!0;const P=r.querySelector(`#preview-item-${T} input[type="checkbox"]`);P&&(P.checked=!0)}}),h()}),(v=r.querySelector("#selectNoneBtn"))==null||v.addEventListener("click",()=>{i.forEach((R,T)=>{R.selected=!1;const P=r.querySelector(`#preview-item-${T} input[type="checkbox"]`);P&&(P.checked=!1)}),h()}),($=r.querySelector("#previewList"))==null||$.addEventListener("change",R=>{const T=R.target;if(T.type==="checkbox"&&T.dataset.index){const P=parseInt(T.dataset.index,10);i[P].selected=T.checked,h()}}),(x=r.querySelector("#previewList"))==null||x.addEventListener("input",R=>{const T=R.target;if(T.classList.contains("ai-preview-textarea")&&T.dataset.index){const P=parseInt(T.dataset.index,10);i[P].generated=T.value}}),(q=r.querySelector("#previewList"))==null||q.addEventListener("click",async R=>{const T=R.target;if(T.classList.contains("ai-regenerate-btn")&&T.dataset.index){const P=parseInt(T.dataset.index,10);await J(P)}}),(ge=r.querySelector("#applyPreviewBtn"))==null||ge.addEventListener("click",()=>{w(),s=!0,te(),r.remove(),n()})}async function J(u){if(a.has(u))return;const m=i[u];a.add(u),m.status="generating",d(u);try{const p=await De(m.question,m.answer1,m.answer2);p?(m.generated=p,m.status="done",m.selected=!0):m.status="error"}catch(p){console.warn("Regeneration error:",p),m.status="error"}a.delete(u),d(u)}function te(){let u=0;for(const m of i)if(m.selected&&m.status==="done"&&m.generated){const p=y.find(g=>g.id===m.rowId);p&&(p.comment=m.generated,p.included=!0,u++)}ye(t),u>0&&Fe(`${u} KI-Vorschläge übernommen`)}E(),r.innerHTML=o(),document.body.appendChild(r),C();for(let u=0;u<i.length;u++)i[u].status==="done"&&d(u);async function ne(){for(let u=0;u<i.length&&!s;u++){const m=i[u];if(!(m.status==="done"&&m.generated)){m.status="generating",d(u);try{const p=await De(m.question,m.answer1,m.answer2);if(s)break;p?(m.generated=p,m.status="done"):(m.status="error",m.selected=!1)}catch(p){console.warn("Generation error:",p),m.status="error",m.selected=!1}d(u)}}f()}ne()}function Je(){const t=y.filter(s=>s.included).filter(s=>s.answer1||s.answer2);let n=`Hi ${G} und ${H},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;const i={question:Math.max(10,...t.map(s=>s.question.length)),answer1:Math.max(G.length,...t.map(s=>(s.answer1||"-").length)),answer2:Math.max(H.length,...t.map(s=>(s.answer2||"-").length))};i.question=Math.min(i.question,30),i.answer1=Math.min(i.answer1,25),i.answer2=Math.min(i.answer2,25),n+=se("Frage",i.question)+" | ",n+=se(G,i.answer1)+" | ",n+=se(H,i.answer2)+" | ",n+=`Gemeinsamkeit
`,n+="-".repeat(i.question)+"-+-",n+="-".repeat(i.answer1)+"-+-",n+="-".repeat(i.answer2)+"-+-",n+="-".repeat(20)+`
`;for(const s of t){const a=fe(s.comment);n+=se(ue(s.question,i.question),i.question)+" | ",n+=se(ue(s.answer1||"-",i.answer1),i.answer1)+" | ",n+=se(ue(s.answer2||"-",i.answer2),i.answer2)+" | ",n+=(a||"")+`
`}return n+=`
Ich freue mich über eure Rückmeldung!
`,n}function se(e,t){return e.length>=t?e.substring(0,t):e+" ".repeat(t-e.length)}function ue(e,t){return e?e.length<=t?e:e.substring(0,t-2)+"..":""}function ti(){const t=y.filter(i=>i.included).filter(i=>i.answer1||i.answer2);let n=`<!--StartFragment-->
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
  Hi <strong>${b(G)}</strong> und <strong>${b(H)}</strong>,<br><br>
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
      <th style="width: 25%;">${b(G)}</th>
      <th style="width: 25%;">${b(H)}</th>
      <th style="width: 25%;">Gemeinsamkeit</th>
    </tr>
  </thead>
  <tbody>
`;for(const i of t){const s=si(i.comment);n+=`    <tr>
      <td><strong>${b(i.question)}</strong></td>
      <td>${b(i.answer1)||"-"}</td>
      <td>${b(i.answer2)||"-"}</td>
      <td class="commonality">${s}</td>
    </tr>
`}return n+=`  </tbody>
</table>

<p><br>Ich freue mich über eure Rückmeldung!</p>
</body>
</html>
<!--EndFragment-->`,n}function It(){return y.filter(e=>e.included).map(e=>({question:e.question,answer1:e.answer1,answer2:e.answer2,commonality:e.comment}))}function mt(e){if(!e||typeof e!="string")return"Partner*in";const t=e.match(/\(([^)]+)\)/);if(t){const i=t[1].trim().split(/[\s,]+/)[0];if(i&&i.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(i))return i}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(e)){const n=e.split(/[\s,]+/)[0];if(n&&n.length>1)return n}return"Partner*in"}function b(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Xe(e){if(!e)return null;const t=e.match(/\[🗺️\]\((https?:\/\/[^)]+)\)/);return t?t[1]:null}function fe(e){return e?e.replace(/\s*\[🗺️\]\(https?:\/\/[^)]+\)/,"").trim():""}function ni(e){const t=Xe(e);return t?`<a href="${t}" target="_blank" class="btn-icon map-link-btn" title="Route in Google Maps öffnen">🗺️</a>`:""}function ii(e){if(!e)return"";const t=Xe(e);if(t){const n=fe(e);return`${b(n)} <a href="${t}" target="_blank" class="map-link">🗺️ Route</a>`}return b(e)}function si(e){if(!e)return"";const t=Xe(e);if(t){const n=fe(e);return`${b(n)} <a href="${t}" style="color: #009892;">🗺️ Route anzeigen</a>`}return b(e)}function ri(){ht(),window.addEventListener("tandems-updated",ht),window.addEventListener("create-match",i=>{const s=i;ci(s.detail.profile1,s.detail.profile2)}),window.addEventListener("edit-tandem",i=>{He(i.detail.tandem)});const e=document.getElementById("closeMatchModal"),t=document.getElementById("cancelMatch"),n=document.getElementById("confirmMatch");e==null||e.addEventListener("click",Ge),t==null||t.addEventListener("click",Ge),n==null||n.addEventListener("click",li)}function ht(){const e=document.getElementById("tandemList");if(!e)return;const t=Q();if(t.length===0){e.innerHTML='<p class="empty-state">Noch keine Tandems erstellt. Wähle zwei Profile aus, um ein Tandem zu erstellen.</p>';return}e.innerHTML=t.sort((n,i)=>new Date(i.created).getTime()-new Date(n.created).getTime()).map(n=>oi(n)).join(""),e.querySelectorAll(".delete-tandem").forEach(n=>{n.addEventListener("click",i=>{i.stopPropagation();const s=n.getAttribute("data-tandem-id");s&&confirm("Tandem wirklich löschen?")&&bt(s)})}),e.querySelectorAll(".copy-tandem").forEach(n=>{n.addEventListener("click",i=>{i.stopPropagation();const s=n.getAttribute("data-tandem-id");s&&ai(s)})}),e.querySelectorAll(".edit-tandem").forEach(n=>{n.addEventListener("click",i=>{i.stopPropagation();const s=n.getAttribute("data-tandem-id");if(s){const r=Q().find(o=>o.id===s);r&&He(r)}})}),e.querySelectorAll(".tandem-card").forEach(n=>{n.addEventListener("click",i=>{if(i.target.closest("button"))return;const a=n.getAttribute("data-tandem-id");if(a){const o=Q().find(c=>c.id===a);o&&He(o)}})})}function ai(e){const n=Q().find(r=>r.id===e);if(!n)return;if(n.suggestionText){navigator.clipboard.writeText(n.suggestionText).then(()=>{gt("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")});return}const i=ft(n.profile1.name),s=ft(n.profile2.name);let a=`Hi ${i} und ${s},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;if(n.commonalities&&n.commonalities.length>0){const r={question:Math.max(10,...n.commonalities.map(o=>o.question.length)),answer1:Math.max(i.length,...n.commonalities.map(o=>(o.answer1||"-").length)),answer2:Math.max(s.length,...n.commonalities.map(o=>(o.answer2||"-").length))};r.question=Math.min(r.question,30),r.answer1=Math.min(r.answer1,25),r.answer2=Math.min(r.answer2,25),a+=re("Frage",r.question)+" | ",a+=re(i,r.answer1)+" | ",a+=re(s,r.answer2)+" | ",a+=`Gemeinsamkeit
`,a+="-".repeat(r.question)+"-+-",a+="-".repeat(r.answer1)+"-+-",a+="-".repeat(r.answer2)+"-+-",a+="-".repeat(20)+`
`;for(const o of n.commonalities)a+=re(Be(o.question,r.question),r.question)+" | ",a+=re(Be(o.answer1||"-",r.answer1),r.answer1)+" | ",a+=re(Be(o.answer2||"-",r.answer2),r.answer2)+" | ",a+=(o.commonality||"")+`
`}a+=`
Ich freue mich über eure Rückmeldung!
`,navigator.clipboard.writeText(a).then(()=>{gt("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")})}function re(e,t){return e.length>=t?e.substring(0,t):e+" ".repeat(t-e.length)}function Be(e,t){return e?e.length<=t?e:e.substring(0,t-2)+"..":""}function ft(e){if(!e||typeof e!="string")return"Partner*in";const t=e.match(/\(([^)]+)\)/);if(t){const i=t[1].trim().split(/[\s,]+/)[0];if(i&&i.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(i))return i}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(e)){const n=e.split(/[\s,]+/)[0];if(n&&n.length>1)return n}return"Partner*in"}function gt(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),2e3)}function oi(e){const t=new Date(e.created).toLocaleDateString("de-DE"),n=Qe(e.matchScore);return`
    <div class="tandem-card" data-tandem-id="${e.id}">
      <div class="header">
        <div class="title">${K(e.name)}</div>
        <div class="meta">
          <span class="stars">${n}</span>
          <span class="date">${t}</span>
          <button class="edit-tandem btn-icon" data-tandem-id="${e.id}" title="Bearbeiten">✏️</button>
          <button class="copy-tandem btn-icon" data-tandem-id="${e.id}" title="Text kopieren">📋</button>
          <button class="delete-tandem close-btn" data-tandem-id="${e.id}">&times;</button>
        </div>
      </div>
      <div class="profiles">
        <div class="profile">
          <strong>${K(e.profile1.name)}</strong>
        </div>
        <div class="profile">
          <strong>${K(e.profile2.name)}</strong>
        </div>
      </div>
      ${e.suggestionText?`
        <div class="suggestion-text">
          <strong>Vorschlagstext:</strong>
          <pre>${K(e.suggestionText)}</pre>
        </div>
      `:e.commonalities.length>0?`
        <div class="commonalities">
          <strong>Gemeinsamkeiten:</strong>
          ${e.commonalities.slice(0,3).map(i=>`
            <div class="commonality">• ${K(i.commonality)}</div>
          `).join("")}
          ${e.commonalities.length>3?`<div class="commonality">... und ${e.commonalities.length-3} weitere</div>`:""}
        </div>
      `:""}
    </div>
  `}function Qe(e){let t="";for(let n=0;n<5;n++)t+=`<span class="star ${n<e?"":"empty"}">★</span>`;return t}let Le=null;function ci(e,t){const n=document.getElementById("matchModal"),i=document.getElementById("matchPreview");if(!n||!i)return;Le={profile1:e,profile2:t};const s=je(e,t);i.innerHTML=`
    <div class="match-preview-content">
      <div class="match-profiles">
        <div class="profile">
          <strong>${K(e.name)}</strong>
        </div>
        <div class="match-icon">🤝</div>
        <div class="profile">
          <strong>${K(t.name)}</strong>
        </div>
      </div>
      <div class="match-score">
        <span>Match-Qualität: </span>
        <span class="stars">${Qe(s.score)}</span>
      </div>
      <div id="tandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    </div>
  `;const a=document.getElementById("tandemEditorContainer");a&&Mt(a,e,t),n.classList.add("visible")}function Ge(){const e=document.getElementById("matchModal");e==null||e.classList.remove("visible"),Le=null}function li(){if(!Le)return;const{profile1:e,profile2:t}=Le,n=je(e,t),i=Je(),s=It(),a={id:crypto.randomUUID(),profile1:e,profile2:t,name:`${e.name} & ${t.name}`,created:new Date().toISOString(),commonalities:s,matchScore:n.score,suggestionText:i};qt(a),Ge(),Ye(`Tandem erstellt: ${e.name} & ${t.name}`)}function Ye(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),3e3)}function K(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let U=null;function He(e){var i,s,a,r,o;U=e;let t=document.getElementById("editTandemModal");t||(t=document.createElement("div"),t.id="editTandemModal",t.className="modal",t.innerHTML=`
      <div class="modal-content">
        <div class="modal-header">
          <h2>Tandem bearbeiten</h2>
          <button class="close-btn" id="closeEditModal">&times;</button>
        </div>
        <div class="modal-body" id="editTandemContent">
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="backToOverviewBtn">← Zurück zur Übersicht</button>
          <div class="modal-footer-right">
            <button class="btn btn-danger" id="dissolveTandem">🗑️ Tandem auflösen</button>
            <button class="btn btn-outline" id="cancelEditTandem">Abbrechen</button>
            <button class="btn btn-primary" id="saveEditTandem">💾 Speichern</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(t),(i=t.querySelector("#closeEditModal"))==null||i.addEventListener("click",he),(s=t.querySelector("#cancelEditTandem"))==null||s.addEventListener("click",he),(a=t.querySelector("#dissolveTandem"))==null||a.addEventListener("click",ui),(r=t.querySelector("#saveEditTandem"))==null||r.addEventListener("click",mi),(o=t.querySelector("#backToOverviewBtn"))==null||o.addEventListener("click",di));const n=document.getElementById("editTandemContent");if(n){const c=new Date(e.created).toLocaleDateString("de-DE");n.innerHTML=`
      <div class="edit-tandem-info">
        <div class="tandem-pair">
          <div class="profile-name">
            <strong>${K(e.profile1.name)}</strong>
          </div>
          <div class="pair-icon">🤝</div>
          <div class="profile-name">
            <strong>${K(e.profile2.name)}</strong>
          </div>
        </div>
        <div class="tandem-meta">
          <span class="stars">${Qe(e.matchScore)}</span>
          <span class="date">Erstellt am: ${c}</span>
        </div>
      </div>
      <div id="editTandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    `;const l=document.getElementById("editTandemEditorContainer");l&&Mt(l,e.profile1,e.profile2)}t.classList.add("visible")}function he(){const e=document.getElementById("editTandemModal");e==null||e.classList.remove("visible"),U=null}function di(){he();const e=document.querySelectorAll(".tab"),t=document.querySelectorAll(".tab-content");e.forEach(n=>{n.classList.toggle("active",n.dataset.tab==="matching")}),t.forEach(n=>{n.classList.toggle("active",n.id==="matching-tab")})}function ui(){if(!U)return;const e=`Tandem zwischen "${U.profile1.name}" und "${U.profile2.name}" wirklich auflösen?

Die Profile können dann erneut gematcht werden.`;confirm(e)&&(bt(U.id),he(),Ye("Tandem aufgelöst - Profile können neu gematcht werden"))}function mi(){if(!U)return;const e=Je(),t=It();Rt(U.id,{suggestionText:e,commonalities:t}),he(),Ye("Tandem aktualisiert")}const hi="modulepreload",fi=function(e,t){return new URL(e,t).href},pt={},gi=function(t,n,i){let s=Promise.resolve();if(n&&n.length>0){const r=document.getElementsByTagName("link"),o=document.querySelector("meta[property=csp-nonce]"),c=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));s=Promise.allSettled(n.map(l=>{if(l=fi(l,i),l in pt)return;pt[l]=!0;const d=l.endsWith(".css"),h=d?'[rel="stylesheet"]':"";if(!!i)for(let E=r.length-1;E>=0;E--){const M=r[E];if(M.href===l&&(!d||M.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${h}`))return;const w=document.createElement("link");if(w.rel=d?"stylesheet":hi,d||(w.as="script"),w.crossOrigin="",w.href=l,c&&w.setAttribute("nonce",c),document.head.appendChild(w),d)return new Promise((E,M)=>{w.addEventListener("load",E),w.addEventListener("error",()=>M(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return s.then(r=>{for(const o of r||[])o.status==="rejected"&&a(o.reason);return t().catch(a)})};function pi(){const e=document.getElementById("exportExcel"),t=document.getElementById("exportCSV"),n=document.getElementById("exportJSON"),i=document.getElementById("importBackup"),s=document.getElementById("manageProfilesBtn"),a=document.getElementById("deleteAllProfilesBtn");e==null||e.addEventListener("click",wi),t==null||t.addEventListener("click",bi),n==null||n.addEventListener("click",vi),i==null||i.addEventListener("click",yi),s==null||s.addEventListener("click",ki),a==null||a.addEventListener("click",Ei),Ne(),window.addEventListener("tandems-updated",Ne),window.addEventListener("profiles-updated",Ne)}function Ne(){const e=document.getElementById("statsContainer");if(!e)return;const t=j(),n=Q(),i=Ot(),s=n.length>0?(n.reduce((a,r)=>a+r.matchScore,0)/n.length).toFixed(1):"-";e.innerHTML=`
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
      <span class="stat-value">${s} ★</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Gesamtpunkte:</span>
      <span class="stat-value">${i.totalPoints}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Streak:</span>
      <span class="stat-value">${i.streak} Tage</span>
    </div>
  `}async function wi(){const e=Q();if(e.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}try{const t=await gi(()=>import("./xlsx-D_0l8YDs.js"),[],import.meta.url),n=e.map(r=>({Tandem:r.name,"Person 1":r.profile1.name,"Person 2":r.profile2.name,"Match-Score":r.matchScore,Erstellt:new Date(r.created).toLocaleDateString("de-DE"),Gemeinsamkeiten:r.commonalities.map(o=>o.commonality).join("; ")})),i=t.utils.json_to_sheet(n),s=t.utils.book_new();t.utils.book_append_sheet(s,i,"Tandems");const a=`tandems_${new Date().toISOString().split("T")[0]}.xlsx`;t.writeFile(s,a)}catch(t){console.error("Excel export error:",t),alert("Fehler beim Excel-Export. Bitte versuche den CSV-Export.")}}function bi(){const e=Q();if(e.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}const t=["Tandem","Person 1","Person 2","Match-Score","Erstellt","Gemeinsamkeiten"],n=e.map(s=>[s.name,s.profile1.name,s.profile2.name,String(s.matchScore),new Date(s.created).toLocaleDateString("de-DE"),s.commonalities.map(a=>a.commonality).join("; ")]),i=[t.join(";"),...n.map(s=>s.map(a=>`"${a.replace(/"/g,'""')}"`).join(";"))].join(`
`);zt(i,`tandems_${new Date().toISOString().split("T")[0]}.csv`,"text/csv;charset=utf-8")}function vi(){const e=_t();zt(e,`tandem-matcher-backup_${new Date().toISOString().split("T")[0]}.json`,"application/json")}function yi(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=t=>{var s;const n=(s=t.target.files)==null?void 0:s[0];if(!n)return;const i=new FileReader;i.onload=a=>{var r;try{const o=(r=a.target)==null?void 0:r.result;confirm("Achtung: Alle bestehenden Daten werden überschrieben. Fortfahren?")&&(Ft(o),alert("Backup erfolgreich wiederhergestellt!"),location.reload())}catch(o){alert("Fehler beim Wiederherstellen: "+o.message)}},i.readAsText(n)},e.click()}function zt(e,t,n){const i=new Blob([e],{type:n}),s=URL.createObjectURL(i),a=document.createElement("a");a.href=s,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(s)}function Ei(){const e=j();if(e.length===0){alert("Keine Profile vorhanden.");return}confirm(`Möchtest du wirklich ALLE ${e.length} Profile löschen?

Diese Aktion kann nicht rückgängig gemacht werden!`)&&confirm("Bist du sicher? Alle Profile werden unwiderruflich gelöscht.")&&(Nt(),window.dispatchEvent(new Event("profiles-updated")),alert("Alle Profile wurden gelöscht."))}function ki(){const e=j();if(ce(),e.length===0){alert("Keine Profile vorhanden.");return}const t=document.createElement("div");t.className="modal visible",t.id="profileManageModal";function n(){const c=j(),l=ce();return c.map(d=>{const h=l.has(d.id),f=d.group==="local"?"Local":"Newcomer",w=d.group==="local"?"local":"newcomer";return`
        <div class="profile-manage-item ${h?"matched":""}" data-id="${d.id}">
          <div class="profile-manage-info">
            <span class="profile-manage-name">${Li(d.name)}</span>
            <span class="profile-manage-group ${w}">${f}</span>
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
          ${n()}
        </div>
        <div class="profile-manage-footer">
          <button class="btn btn-secondary" id="closeProfileManageBtn">Schließen</button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(t);const i=t.querySelector("#closeProfileManageModal"),s=t.querySelector("#closeProfileManageBtn"),a=t.querySelector("#profileSearchInput"),r=t.querySelector("#profileManageList");function o(){t.remove()}i==null||i.addEventListener("click",o),s==null||s.addEventListener("click",o),t.addEventListener("click",c=>{c.target===t&&o()}),a==null||a.addEventListener("input",()=>{const c=a.value.toLowerCase(),l=r==null?void 0:r.querySelectorAll(".profile-manage-item");l==null||l.forEach(d=>{var f,w;const h=((w=(f=d.querySelector(".profile-manage-name"))==null?void 0:f.textContent)==null?void 0:w.toLowerCase())||"";d.style.display=h.includes(c)?"flex":"none"})}),r==null||r.addEventListener("click",c=>{var d,h;const l=c.target;if(l.classList.contains("profile-delete-btn")&&!l.hasAttribute("disabled")){const f=l.dataset.id;if(!f)return;const w=((h=(d=l.closest(".profile-manage-item"))==null?void 0:d.querySelector(".profile-manage-name"))==null?void 0:h.textContent)||"Unbekannt";if(confirm(`Profil "${w}" wirklich löschen?`)){Bt(f),window.dispatchEvent(new Event("profiles-updated")),r&&(r.innerHTML=n());const M=t.querySelector(".profile-manage-header p"),C=j();M&&(M.innerHTML=`<strong>${C.length}</strong> Profile geladen`),C.length===0&&(o(),alert("Alle Profile wurden gelöscht."))}}})}function Li(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}document.addEventListener("DOMContentLoaded",async()=>{console.log("Tandem-Matcher v2.0 initialisiert"),await Ct(),Si(),Ln(),Vt(),rn(),pn(),ri(),pi(),$i(),Ai(),Mi(),Ti()});function Si(){const e=document.querySelectorAll(".tab"),t=document.querySelectorAll(".tab-content");e.forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.tab;i&&(e.forEach(s=>s.classList.remove("active")),n.classList.add("active"),t.forEach(s=>{s.classList.toggle("active",s.id===`${i}-tab`)}))})})}function $i(){const e=document.querySelectorAll(".view-btn"),t=document.getElementById("profileSidebar"),n=document.getElementById("mapContainer");e.forEach(i=>{i.addEventListener("click",()=>{const s=i.dataset.view;!s||!t||!n||(e.forEach(a=>a.classList.remove("active")),i.classList.add("active"),s==="list"?(t.classList.add("mobile-visible"),n.classList.add("mobile-hidden")):(t.classList.remove("mobile-visible"),n.classList.remove("mobile-hidden"),setTimeout(()=>{window.dispatchEvent(new Event("resize")),window.dispatchEvent(new Event("map-needs-resize"))},100)))})})}async function Ti(){const e=document.getElementById("ollamaStatus");if(e)try{const t=await Tt();t.available&&t.model?(e.className="ollama-status available",e.textContent=`Verfügbar: ${t.model}`):t.available?(e.className="ollama-status unavailable",e.textContent="Ollama läuft, aber kein Modell installiert"):(e.className="ollama-status unavailable",e.textContent="Nicht verfügbar - Ollama installieren")}catch{e.className="ollama-status unavailable",e.textContent="Nicht verfügbar"}}function Mi(){const e=document.getElementById("helpBtn"),t=document.getElementById("helpModal"),n=document.getElementById("closeHelpModal");e==null||e.addEventListener("click",()=>{t==null||t.classList.add("visible")}),n==null||n.addEventListener("click",()=>{t==null||t.classList.remove("visible")}),t==null||t.addEventListener("click",i=>{i.target===t&&t.classList.remove("visible")}),localStorage.getItem("swaf_help_shown")||setTimeout(()=>{t==null||t.classList.add("visible"),localStorage.setItem("swaf_help_shown","true")},500)}function Ai(){let e=!1;setTimeout(async()=>{if(!e){e=!0;try{if((await navigator.permissions.query({name:"clipboard-read"})).state==="granted"){const n=await navigator.clipboard.readText();n&&n.includes('"version"')&&n.includes('"profiles"')&&confirm("Profile-Daten in der Zwischenablage erkannt. Importieren?")&&window.dispatchEvent(new CustomEvent("import-from-clipboard",{detail:n}))}}catch{}}},1e3)}window.TandemMatcher={version:"2.0.0"};
