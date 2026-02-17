(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const H={PROFILES:"swaf_profiles",TANDEMS:"swaf_tandems",GAMIFICATION:"swaf_gamification_stats",PLZ_CACHE:"swaf_plz_cache",SETTINGS:"swaf_settings"};let T=[],C=[],F=yt(),X=new Map;function yt(){return{totalMatches:0,todayMatches:0,lastMatchDate:"",streak:0,qualityScores:[],achievements:[],totalPoints:0}}async function Bt(){try{const e=localStorage.getItem(H.PROFILES);e&&(T=JSON.parse(e));const t=localStorage.getItem(H.TANDEMS);t&&(C=JSON.parse(t));const n=localStorage.getItem(H.GAMIFICATION);n&&(F={...yt(),...JSON.parse(n)});const s=localStorage.getItem(H.PLZ_CACHE);if(s){const i=JSON.parse(s);X=new Map(Object.entries(i))}console.log(`Storage initialized: ${T.length} profiles, ${C.length} tandems`)}catch(e){console.error("Error loading storage:",e)}}function W(){return[...T]}function ve(e){return T.find(t=>t.id===e)}function Nt(e){const t=new Set(T.map(s=>s.id)),n=new Set(T.map(s=>Me(s.name)));for(const s of e){if(t.has(s.id))continue;const i=Me(s.name);if(n.has(i)){const a=T.find(r=>Me(r.name)===i);if(a){_t(a,s);continue}}T.push(s),t.add(s.id),n.add(i)}Se()}function _t(e,t){const n=new Set(e.fields.map(s=>s.question));for(const s of t.fields)n.has(s.question)||e.fields.push(s);e.pageType="Merged",e.timestamp=Math.max(e.timestamp,t.timestamp)}function Me(e){return e.toLowerCase().trim().replace(/\s+/g," ")}function Rt(e){T=T.filter(t=>t.id!==e),Se()}function Ot(){T=[],Se()}function Se(){localStorage.setItem(H.PROFILES,JSON.stringify(T)),window.dispatchEvent(new CustomEvent("profiles-updated"))}function Y(){return[...C]}function Dt(e){C.push(e),$e(),F.totalMatches++,F.todayMatches++,F.lastMatchDate=new Date().toISOString().split("T")[0],F.qualityScores.push(e.matchScore),kt()}function Et(e){C=C.filter(t=>t.id!==e),$e()}function Ht(e,t){const n=C.findIndex(s=>s.id===e);n!==-1&&(C[n]={...C[n],...t},$e())}function ce(){const e=new Set;for(const t of C)e.add(t.profile1.id),e.add(t.profile2.id);return e}function ae(e){return C.find(t=>t.profile1.id===e||t.profile2.id===e)}function $e(){localStorage.setItem(H.TANDEMS,JSON.stringify(C)),window.dispatchEvent(new CustomEvent("tandems-updated"))}function Ft(){return{...F}}function kt(){localStorage.setItem(H.GAMIFICATION,JSON.stringify(F))}function Gt(e){return X.get(e)}function _e(e,t){X.set(e,t);const n=Object.fromEntries(X);localStorage.setItem(H.PLZ_CACHE,JSON.stringify(n))}function Kt(e){if(!e.profiles||!Array.isArray(e.profiles))throw new Error("Ungültiges Datenformat");const t=T.length;return Nt(e.profiles),T.length-t}function jt(){return JSON.stringify({profiles:T,tandems:C,gamificationStats:F,plzCache:Object.fromEntries(X),exportedAt:new Date().toISOString(),version:"2.0"})}function Wt(e){const t=JSON.parse(e);t.profiles&&(T=t.profiles),t.tandems&&(C=t.tandems),t.gamificationStats&&(F=t.gamificationStats),t.plzCache&&(X=new Map(Object.entries(t.plzCache))),Se(),$e(),kt(),localStorage.setItem(H.PLZ_CACHE,JSON.stringify(Object.fromEntries(X)))}const Ue="swaf_custom_prompt";function Lt(){return localStorage.getItem(Ue)}function Ut(e){localStorage.setItem(Ue,e)}function Vt(){localStorage.removeItem(Ue)}function Z(e){const t=e.fields.find(n=>n.question.toLowerCase().includes("plz")||n.question.toLowerCase().includes("postleitzahl"));if(t!=null&&t.answer){const n=t.answer.match(/\d{5}/);return n?n[0]:null}for(const n of e.fields){const s=n.answer.match(/\b\d{5}\b/);if(s)return s[0]}return null}function me(e){const t=[/newcomer/i,/geflüchtet/i,/migrant/i,/zugewandert/i,/immigrant/i,/einwander/i,/neuankommend/i,/geflohene?/i,/refugee/i,/asyl/i,/zuwander/i],n=[/\blocal\b/i,/einheimisch/i,/hier.*geboren/i,/alteingesessen/i,/ortsansässig/i],s=a=>t.some(r=>r.test(a)),i=a=>n.some(r=>r.test(a));if(e.pageType){if(s(e.pageType))return"newcomer";if(i(e.pageType))return"local"}if(e.name){if(s(e.name))return"newcomer";if(i(e.name))return"local"}if(e.url){if(s(e.url))return"newcomer";if(i(e.url))return"local"}for(const a of e.fields){const r=a.question.toLowerCase(),o=a.answer;if(r.includes("gruppe")||r.includes("status")||r.includes("wer bist")||r.includes("local")||r.includes("newcomer")||r.includes("herkunft")||r.includes("aufnahme")||r.includes("teilnehmer")){if(s(o))return"newcomer";if(i(o))return"local"}}for(const a of e.fields)if(s(a.answer))return"newcomer";return"local"}function le(e){const t=e.fields.find(s=>s.question.toLowerCase().includes("alter")&&!s.question.toLowerCase().includes("unterschied")&&!s.question.toLowerCase().includes("präferenz"));if(t!=null&&t.answer){const s=t.answer.match(/\d+/);if(s){const i=parseInt(s[0]);if(i>=16&&i<=100)return i}}const n=e.fields.find(s=>s.question.toLowerCase().includes("geboren")||s.question.toLowerCase().includes("geburtsjahr"));if(n!=null&&n.answer){const s=n.answer.match(/(19|20)\d{2}/);if(s){const i=parseInt(s[0]),r=new Date().getFullYear()-i;if(r>=16&&r<=100)return r}}return null}function be(e){const t=e.fields.find(n=>n.question.toLowerCase().includes("geschlecht")&&!n.question.toLowerCase().includes("präferenz")&&!n.question.toLowerCase().includes("partner"));if(t!=null&&t.answer){const n=t.answer.toLowerCase();if(n.includes("männlich")||n.includes("mann")||n==="m")return"male";if(n.includes("weiblich")||n.includes("frau")||n==="w"||n==="f")return"female";if(n.includes("divers")||n.includes("sonstig")||n.includes("andere"))return"other"}return null}const Zt={sport:["sport","fitness","training","gym","workout"],fussball:["fußball","fussball","soccer","kicken"],musik:["musik","music","konzert","singen","instrument"],lesen:["lesen","bücher","reading","books"],kochen:["kochen","cooking","backen","küche"],reisen:["reisen","travel","urlaub","reise"],kino:["kino","filme","movies","cinema","film"],gaming:["gaming","videospiele","spiele","zocken","games"],wandern:["wandern","hiking","spazieren","natur"],fotografie:["fotografie","photography","fotos","fotografieren"],kunst:["kunst","art","malen","zeichnen","museum"],tanzen:["tanzen","dance","dancing","tanz"],yoga:["yoga","meditation","entspannung"],schwimmen:["schwimmen","swimming","baden"],radfahren:["radfahren","fahrrad","cycling","bike","rad"],laufen:["laufen","joggen","running","jogging"],sprachen:["sprachen","languages","sprachkurs"],essen:["essen","food","kulinarik","restaurant"],feiern:["feiern","party","ausgehen","club","bar"],natur:["natur","nature","garten","pflanzen","outdoor"]};function st(e){const t=e.toLowerCase().trim();for(const[n,s]of Object.entries(Zt))if(s.some(i=>t.includes(i)))return n;return t.replace(/[^a-zäöüß]/gi,"")}const Jt={"01":{lat:51.05,lng:13.74,city:"Dresden"},"02":{lat:51.15,lng:14.97,city:"Görlitz"},"03":{lat:51.76,lng:14.33,city:"Cottbus"},"04":{lat:51.34,lng:12.38,city:"Leipzig"},"05":{lat:51.22,lng:6.78,city:"Düsseldorf"},"06":{lat:51.48,lng:11.97,city:"Halle"},"07":{lat:50.93,lng:11.59,city:"Jena"},"08":{lat:50.72,lng:12.49,city:"Zwickau"},"09":{lat:50.83,lng:12.92,city:"Chemnitz"},10:{lat:52.52,lng:13.41,city:"Berlin Mitte"},11:{lat:52.52,lng:13.41,city:"Berlin"},12:{lat:52.45,lng:13.43,city:"Berlin Süd"},13:{lat:52.57,lng:13.35,city:"Berlin Nord"},14:{lat:52.39,lng:13.07,city:"Potsdam"},15:{lat:52.34,lng:14.55,city:"Frankfurt/Oder"},16:{lat:52.98,lng:13.79,city:"Oranienburg"},17:{lat:53.91,lng:13.38,city:"Greifswald"},18:{lat:54.09,lng:12.14,city:"Rostock"},19:{lat:53.63,lng:11.41,city:"Schwerin"},20:{lat:53.55,lng:10,city:"Hamburg"},21:{lat:53.47,lng:9.78,city:"Hamburg Süd"},22:{lat:53.6,lng:10.05,city:"Hamburg Nord"},23:{lat:53.87,lng:10.69,city:"Lübeck"},24:{lat:54.32,lng:10.14,city:"Kiel"},25:{lat:53.87,lng:9.09,city:"Itzehoe"},26:{lat:53.14,lng:8.22,city:"Oldenburg"},27:{lat:53.08,lng:8.81,city:"Bremen Nord"},28:{lat:53.08,lng:8.81,city:"Bremen"},29:{lat:52.97,lng:10.57,city:"Celle"},30:{lat:52.37,lng:9.74,city:"Hannover"},31:{lat:52.23,lng:9.52,city:"Hannover Süd"},32:{lat:52.02,lng:8.53,city:"Herford"},33:{lat:51.93,lng:8.38,city:"Bielefeld"},34:{lat:51.31,lng:9.5,city:"Kassel"},35:{lat:50.56,lng:8.67,city:"Gießen"},36:{lat:50.55,lng:9.68,city:"Fulda"},37:{lat:51.53,lng:9.93,city:"Göttingen"},38:{lat:52.27,lng:10.52,city:"Braunschweig"},39:{lat:52.13,lng:11.63,city:"Magdeburg"},40:{lat:51.23,lng:6.78,city:"Düsseldorf"},41:{lat:51.19,lng:6.44,city:"Mönchengladbach"},42:{lat:51.26,lng:7.15,city:"Wuppertal"},43:{lat:51.36,lng:7.35,city:"Hagen"},44:{lat:51.51,lng:7.47,city:"Dortmund"},45:{lat:51.45,lng:7.01,city:"Essen"},46:{lat:51.54,lng:6.77,city:"Oberhausen"},47:{lat:51.43,lng:6.76,city:"Duisburg"},48:{lat:51.96,lng:7.63,city:"Münster"},49:{lat:52.28,lng:8.05,city:"Osnabrück"},50:{lat:50.94,lng:6.96,city:"Köln"},51:{lat:50.99,lng:7.13,city:"Köln Ost"},52:{lat:50.78,lng:6.08,city:"Aachen"},53:{lat:50.73,lng:7.1,city:"Bonn"},54:{lat:49.75,lng:6.64,city:"Trier"},55:{lat:50,lng:8.27,city:"Mainz"},56:{lat:50.36,lng:7.6,city:"Koblenz"},57:{lat:50.87,lng:8.02,city:"Siegen"},58:{lat:51.36,lng:7.47,city:"Hagen"},59:{lat:51.66,lng:8.38,city:"Hamm"},60:{lat:50.11,lng:8.68,city:"Frankfurt"},61:{lat:50.22,lng:8.62,city:"Frankfurt Nord"},62:{lat:50.1,lng:8.77,city:"Bad Homburg"},63:{lat:50,lng:8.96,city:"Offenbach"},64:{lat:49.87,lng:8.65,city:"Darmstadt"},65:{lat:50.08,lng:8.24,city:"Wiesbaden"},66:{lat:49.24,lng:7,city:"Saarbrücken"},67:{lat:49.45,lng:8.44,city:"Ludwigshafen"},68:{lat:49.49,lng:8.47,city:"Mannheim"},69:{lat:49.41,lng:8.69,city:"Heidelberg"},70:{lat:48.78,lng:9.18,city:"Stuttgart"},71:{lat:48.73,lng:9.11,city:"Stuttgart Süd"},72:{lat:48.52,lng:9.05,city:"Tübingen"},73:{lat:48.8,lng:9.47,city:"Esslingen"},74:{lat:49.14,lng:9.22,city:"Heilbronn"},75:{lat:48.89,lng:8.69,city:"Pforzheim"},76:{lat:49.01,lng:8.4,city:"Karlsruhe"},77:{lat:48.47,lng:7.94,city:"Offenburg"},78:{lat:47.99,lng:8.52,city:"Villingen"},79:{lat:47.99,lng:7.85,city:"Freiburg"},80:{lat:48.14,lng:11.58,city:"München"},81:{lat:48.11,lng:11.6,city:"München Süd"},82:{lat:48.05,lng:11.47,city:"München West"},83:{lat:47.86,lng:11.97,city:"Rosenheim"},84:{lat:48.44,lng:12.12,city:"Landshut"},85:{lat:48.4,lng:11.74,city:"Freising"},86:{lat:48.37,lng:10.9,city:"Augsburg"},87:{lat:47.73,lng:10.31,city:"Kempten"},88:{lat:47.66,lng:9.48,city:"Friedrichshafen"},89:{lat:48.4,lng:10,city:"Ulm"},90:{lat:49.45,lng:11.08,city:"Nürnberg"},91:{lat:49.6,lng:11.01,city:"Erlangen"},92:{lat:49.02,lng:12.1,city:"Amberg"},93:{lat:49.02,lng:12.1,city:"Regensburg"},94:{lat:48.57,lng:13.45,city:"Passau"},95:{lat:50.06,lng:11.78,city:"Bayreuth"},96:{lat:50.1,lng:10.88,city:"Bamberg"},97:{lat:49.79,lng:9.95,city:"Würzburg"},98:{lat:50.68,lng:10.93,city:"Suhl"},99:{lat:50.98,lng:11.03,city:"Erfurt"}};function St(e,t,n,s){const a=pe(n-e),r=pe(s-t),o=Math.sin(a/2)*Math.sin(a/2)+Math.cos(pe(e))*Math.cos(pe(n))*Math.sin(r/2)*Math.sin(r/2);return 6371*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}function pe(e){return e*(Math.PI/180)}let Ie=0;const it=1e3;async function ee(e){var i;if(!e||e.length<2)return null;const t=e.replace(/\D/g,"").substring(0,5);if(t.length<5)return rt(t);const n=Gt(t);if(n)return n;const s=rt(t);if(s)return _e(t,s),s;try{const a=Date.now();a-Ie<it&&await new Promise(c=>setTimeout(c,it-(a-Ie))),Ie=Date.now(),console.log(`🌐 Lade PLZ ${t} von OpenStreetMap...`);const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&country=DE&postalcode=${t}&limit=1`,{headers:{"User-Agent":"SwaF Tandem Matcher v2.0"}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const o=await r.json();if(o&&o.length>0){const c={lat:parseFloat(o[0].lat),lng:parseFloat(o[0].lon),city:((i=o[0].display_name)==null?void 0:i.split(",")[0])||void 0};return _e(t,c),console.log(`✅ PLZ ${t} gefunden:`,c),c}}catch(a){console.warn(`⚠️ Nominatim API Fehler für PLZ ${t}:`,a)}return null}function rt(e){const t=e.substring(0,2),n=Jt[t];if(!n)return null;let s=0,i=0;if(e.length>=5){const r=parseInt(e.substring(2,5),10)||0,o=r*2.399963,c=.02+r%100*3e-4;s=c*Math.cos(o),i=c*Math.sin(o)*1.4}const a={lat:n.lat+s,lng:n.lng+i,city:n.city};return _e(e,a),a}async function Qt(e,t){if(e===t)return 0;const n=await ee(e),s=await ee(t);if(!(!n||!s))return St(n.lat,n.lng,s.lat,s.lng)}const we=new Map;async function Yt(e,t){if(!e||!t)return null;if(e===t)return{distanceKm:0,drivingMinutes:0,transitMinutes:0,cyclingMinutes:0,walkingMinutes:0};const n=`${e}-${t}`,s=we.get(n);if(s)return s;const i=`${t}-${e}`,a=we.get(i);if(a)return a;const r=await ee(e),o=await ee(t);if(!r||!o)return null;try{const h=`https://router.project-osrm.org/route/v1/driving/${r.lng},${r.lat};${o.lng},${o.lat}?overview=false`;console.log(`🚗 Berechne Entfernung ${e} → ${t}...`);const w=await fetch(h);if(!w.ok)throw new Error(`HTTP ${w.status}`);const E=await w.json();if(E.code==="Ok"&&E.routes&&E.routes.length>0){const I=E.routes[0],P=I.distance/1e3,J=Math.round(I.duration/60),te=Math.round(J*1.8),ne=Math.round(P*4),u=Math.round(P*12),m={distanceKm:Math.round(P*10)/10,drivingMinutes:J,transitMinutes:te,cyclingMinutes:ne,walkingMinutes:u};return we.set(n,m),console.log(`✅ Entfernung: ${m.distanceKm} km`),m}}catch(h){console.warn("⚠️ OSRM API Fehler:",h)}const c=St(r.lat,r.lng,o.lat,o.lng),d=Math.round(c*1.3*10)/10,f={distanceKm:d,drivingMinutes:Math.round(d*1.2),transitMinutes:Math.round(d*2.2),cyclingMinutes:Math.round(d*4),walkingMinutes:Math.round(d*12)};return we.set(n,f),f}function Xt(e){if(e.distanceKm===0)return"Gleiche PLZ";const t=[];return t.push(`${e.distanceKm} km Entfernung`),e.drivingMinutes<=120&&t.push(`ca. ${Te(e.drivingMinutes)} mit Auto`),e.transitMinutes<=180&&t.push(`ca. ${Te(e.transitMinutes)} mit ÖPNV`),e.walkingMinutes<=45&&t.push(`ca. ${Te(e.walkingMinutes)} zu Fuß`),t.join(", ")}function Te(e){if(e<60)return`${e} min`;const t=Math.floor(e/60),n=e%60;return n===0?`${t} h`:`${t}:${n.toString().padStart(2,"0")} h`}function en(e,t){const n=`https://www.google.com/maps/dir/${e.lat},${e.lng}/${t.lat},${t.lng}`,s=`https://www.bvg.de/de/verbindungen/verbindungssuche?start=${e.lat},${e.lng}&destination=${t.lat},${t.lng}`;return{google:n,bvg:s,mvv:"https://www.mvv-muenchen.de/fahrplanauskunft/index.html#routing",hvv:"https://www.hvv.de/de/fahrplaene/abruf-fahrplaninfos/"}}let B=null,U=new Map,Ve=null;function tn(){document.getElementById("map")&&(B=L.map("map").setView([51.1657,10.4515],6),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:18}).addTo(B),at(),window.addEventListener("profiles-updated",at),window.addEventListener("tandems-updated",nn),window.addEventListener("profile-selected",t=>{on(t.detail.profileId)}),window.addEventListener("profile-deselected",()=>{cn()}))}function nn(){const e=ce();U.forEach((t,n)=>{var i;const s=(i=t.getElement())==null?void 0:i.querySelector(".marker-icon");s&&(e.has(n)?s.classList.add("matched"):s.classList.remove("matched"))})}async function at(){if(!B)return;U.forEach(n=>n.remove()),U.clear();const e=W(),t=new Map;for(const n of e){const s=Z(n);s&&(t.has(s)||t.set(s,[]),t.get(s).push(n))}for(const[n,s]of t){const i=await ee(n);if(!(!i||!isFinite(i.lat)||!isFinite(i.lng)))for(let a=0;a<s.length;a++){const r=s[a],o=sn(a,s.length),c=i.lat+o.lat,l=i.lng+o.lng,d=rn(r,c,l);d.addTo(B),U.set(r.id,d)}}}function sn(e,t){if(t===1)return{lat:0,lng:0};const n=.002,s=.001*Math.floor(e/8),i=n+s,r=e*2.399963;return{lat:i*Math.cos(r),lng:i*Math.sin(r)*1.4}}function rn(e,t,n){const s=me(e),i=e.name.split(" ").map(f=>f[0]).join("").substring(0,2).toUpperCase(),r=ce().has(e.id),o=r?"matched":"",c=L.divIcon({className:"marker-wrapper",html:`<div class="marker-icon ${s} ${o}" data-profile-id="${e.id}">${i}</div>`,iconSize:[30,30],iconAnchor:[15,15]}),l=L.marker([t,n],{icon:c}),d=an(e,s,r);return l.bindPopup(d,{maxWidth:300}),l.on("click",()=>{window.dispatchEvent(new CustomEvent("profile-clicked",{detail:{profileId:e.id}}))}),l}function an(e,t,n=!1){const s=le(e),i=Z(e),a=be(e),r=xe(e,["hobby","hobbies","freizeit","interessen"]),o=xe(e,["sprache","sprachen","language"]),c=xe(e,["beruf","arbeit","job","tätigkeit","beschäftigung"]),l=a==="male"?"M":a==="female"?"W":a==="other"?"D":"",d=t==="local"?"Local":"Newcomer",f=t==="local"?"local":"newcomer";let h=`
    <div class="marker-popup">
      <div class="popup-header">
        <strong>${de(e.name)}</strong>
        <span class="group-badge ${f}">${d}</span>
        ${n?'<span class="matched-badge">✓ Vermittelt</span>':""}
      </div>
      <div class="popup-meta">
        ${s?`<span>${s} Jahre</span>`:""}
        ${l?`<span>${l}</span>`:""}
        ${i?`<span>PLZ ${i}</span>`:""}
      </div>
  `;if(n){const w=ae(e.id);if(w){const E=w.profile1.id===e.id?w.profile2.name:w.profile1.name;h+=`<div class="popup-field tandem-info"><strong>Tandem mit:</strong> ${de(E)}</div>`}}return c&&(h+=`<div class="popup-field"><strong>Beruf:</strong> ${de(Ce(c,50))}</div>`),o&&(h+=`<div class="popup-field"><strong>Sprachen:</strong> ${de(Ce(o,80))}</div>`),r&&(h+=`<div class="popup-field"><strong>Interessen:</strong> ${de(Ce(r,80))}</div>`),h+=`
      <div class="popup-action">
        ${n?"<em>Bereits vermittelt</em>":"<em>Klicken für Smart Match</em>"}
      </div>
    </div>
  `,h}function Ce(e,t){return e.length<=t?e:e.substring(0,t-3)+"..."}function de(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function xe(e,t){for(const n of t){const s=new RegExp(n,"i"),i=e.fields.find(a=>s.test(a.question));if(i!=null&&i.answer)return i.answer}return null}function on(e){Ve=e,U.forEach((n,s)=>{var a;const i=(a=n.getElement())==null?void 0:a.querySelector(".marker-icon");i&&i.classList.toggle("selected",s===e)});const t=U.get(e);t&&B&&B.setView(t.getLatLng(),Math.max(B.getZoom(),10))}function cn(){Ve=null,U.forEach(e=>{var n;const t=(n=e.getElement())==null?void 0:n.querySelector(".marker-icon");t&&t.classList.remove("selected","compatible","incompatible","top-match")})}function ln(e,t,n){U.forEach((s,i)=>{var r;if(i===Ve)return;const a=(r=s.getElement())==null?void 0:r.querySelector(".marker-icon");a&&(a.classList.remove("compatible","incompatible","top-match"),n.includes(i)?a.classList.add("compatible","top-match"):e.includes(i)?a.classList.add("compatible"):t.includes(i)&&a.classList.add("incompatible"))})}function dn(){B&&setTimeout(()=>{B==null||B.invalidateSize()},100)}window.addEventListener("map-needs-resize",dn);let q={},k=new Set,V=!1;function un(){O(),mn();const e=document.getElementById("filter-gender"),t=document.getElementById("filter-group"),n=document.getElementById("filter-search");e==null||e.addEventListener("change",()=>{q.gender=e.value,O()}),t==null||t.addEventListener("change",()=>{q.group=t.value,O()}),n==null||n.addEventListener("input",()=>{q.searchText=n.value,O()}),window.addEventListener("profiles-updated",O),window.addEventListener("tandems-updated",O),window.addEventListener("profile-clicked",s=>{$t(s.detail.profileId)})}function mn(){const e=document.querySelector(".sidebar-header");if(!e||document.getElementById("manualMatchBtn"))return;const t=document.createElement("button");t.id="manualMatchBtn",t.className="btn btn-sm",t.innerHTML="👆 Manuell matchen",t.title="Zwei Profile zum Matchen auswählen",t.addEventListener("click",()=>{V=!V,k.clear(),window.dispatchEvent(new CustomEvent("profile-deselected")),Re(),O()}),e.appendChild(t)}function Re(){const e=document.getElementById("manualMatchBtn");e&&(V?(e.classList.add("active"),e.innerHTML=k.size===0?"✋ Wähle 2 Profile...":k.size===1?"✋ Noch 1 wählen...":"✅ Matchen!"):(e.classList.remove("active"),e.innerHTML="👆 Manuell matchen"))}function O(){const e=document.getElementById("profileList"),t=document.getElementById("profileCount");if(!e)return;const n=fn();if(t&&(t.textContent=String(n.length)),n.length===0){e.innerHTML='<p class="empty-state">Keine Profile gefunden. Importiere Profile über den Button oben.</p>';return}e.innerHTML=n.map(s=>hn(s)).join(""),e.querySelectorAll(".profile-card").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-profile-id");i&&$t(i)})})}function fn(){let e=W();if(q.gender&&q.gender!=="all"&&(e=e.filter(t=>be(t)===q.gender)),q.group&&q.group!=="all"&&(e=e.filter(t=>me(t)===q.group)),q.searchText){const t=q.searchText.toLowerCase();e=e.filter(n=>{const s=Z(n)||"";return n.name.toLowerCase().includes(t)||s.includes(t)})}return e}function hn(e){const t=Z(e)||"-",n=me(e),s=le(e),i=k.has(e.id),r=ce().has(e.id),o=r?ae(e.id):null,c=o?o.profile1.id===e.id?o.profile2.name:o.profile1.name:null,l=V&&i?Array.from(k).indexOf(e.id)+1:0;return`
    <div class="profile-card ${i?"selected":""} ${r?"matched":""} ${V?"manual-mode":""}" data-profile-id="${e.id}">
      ${l>0?`<div class="selection-number">${l}</div>`:""}
      <div class="name">${ot(e.name)}</div>
      <div class="meta">
        <span class="group-badge ${n}">${n==="local"?"Local":"Newcomer"}</span>
        <span>PLZ: ${t}</span>
        ${s?`<span>${s} Jahre</span>`:""}
      </div>
      ${r?`
        <div class="matched-info">
          <span class="matched-badge">✓ Vermittelt</span>
          ${c?`<span class="partner-name">mit ${ot(c.split(" ")[0])}</span>`:""}
        </div>
      `:""}
    </div>
  `}function $t(e){const t=ve(e);if(!t)return;const n=ae(e);if(n&&!V){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:n.id,tandem:n,profileId:e}}));return}if(V){if(k.has(e))k.delete(e);else{if(k.size>=2){const s=Array.from(k)[0];k.delete(s)}k.add(e)}if(Re(),k.size===2){const s=Array.from(k),i=ve(s[0]),a=ve(s[1]);if(i&&a){const r=ae(i.id),o=ae(a.id);if(r||o){alert("Eines der Profile ist bereits in einem Tandem. Bitte zuerst das bestehende Tandem auflösen.");return}window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:i,profile2:a}})),V=!1,k.clear(),Re()}}O();return}if(k.has(e))k.delete(e),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:e}}));else{if(k.size>0){const s=Array.from(k)[0];k.clear(),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:s}}))}k.add(e),window.dispatchEvent(new CustomEvent("profile-selected",{detail:{profileId:e,profile:t}}))}O()}function ot(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const gn=["vorname","nachname","name","vollständiger name","e-mail-adresse","e-mail","email","telefonnummer","telefon","id","user-id","teilnehmer-id","profil-id","gruppe","standort","region","west","ost","nord","süd","vermittler","vermittler*in","durchgeführt von","durchgeführt","datum/uhrzeit","datum","uhrzeit","termin","terminart","status","bearbeitungsstatus","anmeldestatus","infoabend","infonachmittag","format","aufnahmegespräch","standort-newsletter","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","portal-link","wie wirkt die person auf dich","eindruck","bewertung","wie schätzt du ein","einschätzung","beurteilung","sind weitere schritte nötig","nächste schritte","follow-up","aufnahmegespräch datum","gespräch datum","plz","postleitzahl","ort","stadt","köln","berlin","münchen","ausgeschlossen","ausgetreten","pausiert","vermittelt","unvermittelt","angemeldet","beginn","ende"];function pn(e){const t=e.toLowerCase().trim();return t.length<3||t==="geschlecht"||t==="dein geschlecht"?!0:gn.some(n=>t.includes(n)||n.includes(t))}function S(e,t){for(const n of t){const s=new RegExp(n,"i"),i=e.fields.find(a=>s.test(a.question)&&!pn(a.question));if(i!=null&&i.answer)return i.answer}return null}function Ze(e,t){const n=[],s=me(e),i=me(t);if(s===i)return{compatible:!1,score:0,failReason:"same_group",failDetails:`Beide sind ${s==="local"?"Locals":"Newcomer"} - nur interkulturelle Matches möglich`,softFactsScore:0,softFactsMax:15};const a=wn(e,t);if(!a.pass)return{compatible:!1,score:0,failReason:"age_preference",failDetails:a.reason,softFactsScore:0,softFactsMax:15};const r=vn(e,t);if(!r.pass)return{compatible:!1,score:0,failReason:"gender_preference",failDetails:r.reason,softFactsScore:0,softFactsMax:15};const o=bn(e,t);if(!o.pass)return{compatible:!1,score:0,failReason:"time_overlap",failDetails:o.reason,softFactsScore:0,softFactsMax:15};const c=[],l=yn(e,t,n,c),d=15;return{compatible:!0,score:Math.min(5,Math.round(l/d*5)),softFactsScore:l,softFactsMax:d,details:n.join("; "),positiveFactors:c.slice(0,3)}}function wn(e,t){const n=le(e),s=le(t);if(!n||!s)return{pass:!0};const i=Math.abs(n-s),a=S(e,["alter.*unterschied","alter.*tandem","wie groß.*alter"]),r=S(t,["alter.*unterschied","alter.*tandem","wie groß.*alter"]);if(a){const o=a.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${i} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${i} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&s<n)return{pass:!1,reason:`${e.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&s>n)return{pass:!1,reason:`${e.name}: Präferiert jüngeren Partner`}}if(r){const o=r.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${i} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${i} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&n<s)return{pass:!1,reason:`${t.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&n>s)return{pass:!1,reason:`${t.name}: Präferiert jüngeren Partner`}}return{pass:!0}}function vn(e,t){const n=be(e),s=be(t),i=S(e,["geschlecht.*tandem","geschlecht.*partner"]),a=S(t,["geschlecht.*tandem","geschlecht.*partner"]);if(i&&s){const r=i.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&s!=="female")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${i}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&s!=="male")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${i}" nicht erfüllt`}}}if(a&&n){const r=a.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&n!=="female")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${a}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&n!=="male")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${a}" nicht erfüllt`}}}return{pass:!0}}function bn(e,t){const n=S(e,["zeit.*treffen","zeit.*tandem","wann.*zeit"]),s=S(t,["zeit.*treffen","zeit.*tandem","wann.*zeit"]);if(!n||!s)return{pass:!0};const i=n.toLowerCase(),a=s.toLowerCase();return i.includes("flexibel")||a.includes("flexibel")?{pass:!0}:["morgens","mittags","nachmittags","abends","unter der woche","wochenende"].filter(c=>i.includes(c)&&a.includes(c)).length===0?{pass:!1,reason:"Keine gemeinsamen Zeitfenster gefunden"}:{pass:!0}}function yn(e,t,n,s){let i=0;const a=Z(e),r=Z(t);if(a&&r){const g=parseInt(a.substring(0,2)),b=parseInt(r.substring(0,2)),$=Math.abs(g-b);a===r?(i+=3,n.push("Gleiche PLZ"),s.push("Gleiche PLZ")):$===0?(i+=2.5,n.push("Gleiche Region (< 10 km)"),s.push("Nah beieinander")):$===1?(i+=2,n.push("Benachbarte Region"),s.push("Benachbarte Region")):$<=3?(i+=1.5,n.push("Nahe Region")):$<=5?i+=1:i+=.5}const o=le(e),c=le(t);if(o&&c){const g=Math.abs(o-c);g<=3?(i+=2,n.push(`Sehr ähnliches Alter (±${g} Jahre)`),s.push(g===0?"Gleich alt":`Nur ${g}J Unterschied`)):g<=5?(i+=1.8,n.push(`Ähnliches Alter (±${g} Jahre)`),s.push("Ähnliches Alter")):g<=10?i+=1.5:g<=15?i+=1:g<=20&&(i+=.5)}const l=S(e,["geschlecht.*tandem","geschlecht.*partner"]),d=S(t,["geschlecht.*tandem","geschlecht.*partner"]);(l||d)&&(i+=1,n.push("Geschlechtspräferenz erfüllt")),i+=1,n.push("Interkulturell");const f=S(e,["hobby","hobbies","hobbys"]),h=S(t,["hobby","hobbies","hobbys"]);if(f&&h){const g=En(f,h);if(g.length>0){const b=Math.min(2,g.length*.4);i+=b,g.length>=3?(n.push("Viele gemeinsame Hobbys"),s.push("Viele gemeinsame Hobbys")):g.length>=2?(n.push("Mehrere gemeinsame Hobbys"),s.push("Gemeinsame Hobbys")):n.push("Gemeinsame Hobby-Interessen")}}const w=S(e,["freizeit(?!.*vermittler)"]),E=S(t,["freizeit(?!.*vermittler)"]);if(w&&E){const g=ct(w,E);g.length>=3?(i+=1.5,n.push("Ähnliche Freizeitinteressen")):g.length>=1&&(i+=.75)}const I=S(e,["themen.*interessieren","interess.*themen"]),P=S(t,["themen.*interessieren","interess.*themen"]);if(I&&P){const g=["politik","kunst","kultur","technologie","sport","musik","natur","reisen","essen","kochen","wissenschaft","geschichte","literatur"],b=I.toLowerCase(),$=P.toLowerCase(),z=g.filter(N=>b.includes(N)&&$.includes(N));z.length>=2?(i+=1.5,n.push("Mehrere gemeinsame Interessensgebiete"),s.push("Ähnliche Interessen")):z.length===1&&(i+=.75,n.push("Gemeinsame Interessensgebiete"))}const J=S(e,["freundschaft.*wichtig","wichtig.*freundschaft"]),te=S(t,["freundschaft.*wichtig","wichtig.*freundschaft"]);if(J&&te){const g=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","loyalität","treue"],b=J.toLowerCase(),$=te.toLowerCase(),z=g.filter(N=>b.includes(N)&&$.includes(N));z.length>=2?(i+=1.5,n.push("Ähnliche Wertvorstellungen"),s.push("Ähnliche Werte")):z.length===1&&(i+=.75)}const ne=S(e,["tandem.*vorstellung(?!.*geschlecht)"]),u=S(t,["tandem.*vorstellung(?!.*geschlecht)"]);if(ne&&u){const g=ct(ne,u);g.length>=2?(i+=1,n.push("Ähnliche Tandem-Vorstellungen")):g.length>=1&&(i+=.5)}const m=S(e,["community-event","event.*unternehmen"]),p=S(t,["community-event","event.*unternehmen"]);if(m&&p){const g=m.toLowerCase(),b=p.toLowerCase();(g.includes("ja")||g.includes("gerne"))&&(b.includes("ja")||b.includes("gerne"))&&(i+=.5)}return i}function En(e,t){const n=e.split(/[,;]/).map(i=>st(i.trim())).filter(Boolean),s=t.split(/[,;]/).map(i=>st(i.trim())).filter(Boolean);return n.filter(i=>s.some(a=>i===a))}function ct(e,t){const n=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","mich","gerne","sehr","auch","aber","dass","wenn","weil","nicht","mehr","noch","schon","immer"]),s=e.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!n.has(a)),i=t.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!n.has(a));return s.filter(a=>i.some(r=>a===r||a.includes(r)||r.includes(a)))}let x=null,oe=[];function kn(){document.getElementById("smartMatchPanel");const e=document.getElementById("closeSmartMatch");e==null||e.addEventListener("click",()=>{lt(),window.dispatchEvent(new CustomEvent("profile-deselected"))}),window.addEventListener("profile-selected",async t=>{x=t.detail.profile;const s=ae(x.id);if(s){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:s.id,tandem:s,profileId:x.id}})),x=null;return}await Ln(),Sn(),Tn()}),window.addEventListener("profile-deselected",()=>{x=null,oe=[],lt()})}async function Ln(){if(!x)return;const e=W(),t=ce(),n=[];for(const s of e){if(s.id===x.id||t.has(s.id))continue;const i=Ze(x,s),a=Z(x),r=Z(s);let o,c;a&&r&&(o=await Qt(a,r),o!==void 0&&(c=o<1?"<1 km":`${Math.round(o)} km`)),n.push({profile:s,matchResult:i,distance:o,distanceText:c})}n.sort((s,i)=>s.matchResult.compatible!==i.matchResult.compatible?s.matchResult.compatible?-1:1:s.matchResult.compatible?i.matchResult.score-s.matchResult.score:0),oe=n}function Sn(){const e=document.getElementById("smartMatchPanel"),t=document.getElementById("selectedProfileName"),n=document.getElementById("smartMatchContent");!e||!t||!n||!x||(t.textContent=x.name,n.innerHTML=$n(),e.classList.add("visible"),n.querySelectorAll(".match-item").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-profile-id");i&&In(i)})}))}function lt(){const e=document.getElementById("smartMatchPanel");e==null||e.classList.remove("visible")}function $n(){if(oe.length===0)return'<p class="empty-state">Keine anderen Profile zum Matchen vorhanden.</p>';const e=oe.filter(s=>s.matchResult.compatible),t=oe.filter(s=>!s.matchResult.compatible);let n="";return e.length>0&&(n+='<div class="match-section"><h4>Passende Matches</h4>',n+=e.map(s=>dt(s,!0)).join(""),n+="</div>"),t.length>0&&(n+='<div class="match-section"><h4>Unpassend (Hard Facts)</h4>',n+=t.map(s=>dt(s,!1)).join(""),n+="</div>"),n}function dt(e,t){const{profile:n,matchResult:s,distanceText:i}=e,a=Mn(s.score);let r="";if(!t&&s.failReason){const c={age_preference:"🎂",gender_preference:"⚧️",time_overlap:"⏰",same_group:"👥"},l={age_preference:"Alter-Präferenz",gender_preference:"Geschlecht-Präferenz",time_overlap:"Keine Zeit-Überschneidung",same_group:"Gleiche Gruppe"},d=c[s.failReason]||"⚠️",f=l[s.failReason]||s.failReason;let h="";s.failDetails&&(h=`<div class="reason-details">${Pe(s.failDetails)}</div>`),r=`
      <div class="reason-box">
        <span class="reason-icon">${d}</span>
        <span class="reason-label">${f}</span>
        ${h}
      </div>
    `}let o="";return t&&s.positiveFactors&&s.positiveFactors.length>0&&(o=`
      <div class="positive-factors">
        ${s.positiveFactors.slice(0,2).map(c=>`<span class="factor">✓ ${Pe(c)}</span>`).join("")}
      </div>
    `),`
    <div class="match-item ${t?"":"incompatible"}" data-profile-id="${n.id}">
      <div class="stars">${t?a:"---"}</div>
      <div class="info">
        <div class="name">${Pe(n.name)}</div>
        <div class="match-meta">
          ${i?`<span class="distance">📍 ${i}</span>`:""}
        </div>
        ${o}
        ${r}
      </div>
    </div>
  `}function Mn(e){let t="";for(let n=0;n<5;n++)t+=`<span class="star ${n<e?"":"empty"}">★</span>`;return t}function In(e){const t=ve(e);!t||!x||window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:x,profile2:t}}))}function Tn(){const e=[],t=[],n=[];for(const s of oe)s.matchResult.compatible?(e.push(s.profile.id),s.matchResult.score>=4&&n.push(s.profile.id)):t.push(s.profile.id);ln(e,t,n)}function Pe(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let Q=null;function Cn(){const e=document.getElementById("importModal"),t=document.getElementById("importBtn"),n=document.getElementById("closeImportModal"),s=document.getElementById("pasteClipboard"),i=document.getElementById("dropZone"),a=document.getElementById("fileInput"),r=document.getElementById("cancelImport"),o=document.getElementById("confirmImport"),c=document.getElementById("importPreview");t==null||t.addEventListener("click",()=>ut()),n==null||n.addEventListener("click",()=>ze()),e==null||e.addEventListener("click",l=>{l.target===e&&ze()}),s==null||s.addEventListener("click",async()=>{try{const l=await navigator.clipboard.readText();Oe(l)}catch{alert("Fehler beim Lesen der Zwischenablage. Bitte erlaube den Zugriff.")}}),i==null||i.addEventListener("click",()=>a==null?void 0:a.click()),i==null||i.addEventListener("dragover",l=>{l.preventDefault(),i.classList.add("dragover")}),i==null||i.addEventListener("dragleave",()=>{i.classList.remove("dragover")}),i==null||i.addEventListener("drop",l=>{var f;l.preventDefault(),i.classList.remove("dragover");const d=(f=l.dataTransfer)==null?void 0:f.files[0];d&&mt(d)}),a==null||a.addEventListener("change",()=>{var d;const l=(d=a.files)==null?void 0:d[0];l&&mt(l)}),r==null||r.addEventListener("click",()=>{Q=null,c&&(c.hidden=!0)}),o==null||o.addEventListener("click",()=>{if(Q)try{const l=Q.profiles.length,d=Kt(Q),f=l-d;let h=`${d} neue Profile importiert!`;f>0&&(h+=`
${f} Duplikate übersprungen (bereits vorhanden).`),alert(h),ze()}catch(l){alert("Fehler beim Import: "+l.message)}}),window.addEventListener("import-from-clipboard",l=>{const d=l;ut(),Oe(d.detail)})}function ut(){const e=document.getElementById("importModal"),t=document.getElementById("importPreview");e==null||e.classList.add("visible"),t&&(t.hidden=!0),Q=null}function ze(){const e=document.getElementById("importModal");e==null||e.classList.remove("visible"),Q=null}function mt(e){if(!e.name.endsWith(".json")){alert("Bitte eine JSON-Datei auswählen.");return}const t=new FileReader;t.onload=n=>{var i;const s=(i=n.target)==null?void 0:i.result;Oe(s)},t.onerror=()=>{alert("Fehler beim Lesen der Datei.")},t.readAsText(e)}function Oe(e){try{let t;if(e.includes("SWAF_PROFILE_START")?t=xn(e):t=JSON.parse(e),!t.profiles||!Array.isArray(t.profiles))throw new Error("Ungültiges Format: profiles Array nicht gefunden");Q=t,Pn(t)}catch(t){alert("Fehler beim Verarbeiten der Daten: "+t.message)}}function xn(e){const t=[],n=/SWAF_PROFILE_START([\s\S]*?)SWAF_PROFILE_END/g;let s;for(;(s=n.exec(e))!==null;)try{const i=JSON.parse(s[1].trim());t.push({id:crypto.randomUUID(),url:i.url||"",name:i.name||"Unbekannt",pageType:i.pageType||"Hauptprofil",timestamp:i.timestamp||Date.now(),fields:i.fields||[]})}catch{}return{version:"1.0",exportedAt:new Date().toISOString(),profiles:t}}function Pn(e){const t=document.getElementById("importPreview"),n=document.getElementById("previewCount"),s=document.getElementById("previewList");!t||!n||!s||(n.textContent=String(e.profiles.length),s.innerHTML=e.profiles.slice(0,10).map(i=>`<div class="preview-item">${zn(i.name)} (${i.fields.length} Felder)</div>`).join(""),e.profiles.length>10&&(s.innerHTML+=`<div class="preview-item">... und ${e.profiles.length-10} weitere</div>`),t.hidden=!1)}function zn(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const Je="https://api.swaf.koeln/ollama",An="ollama",qn="Tandem2026Matcher";function Qe(){return{"Content-Type":"application/json",Authorization:"Basic "+btoa(`${An}:${qn}`)}}async function Mt(){try{console.log("Pruefe Ollama-Verfuegbarkeit...");const e=await fetch(`${Je}/api/tags`,{method:"GET",headers:Qe(),signal:AbortSignal.timeout(5e3)});return console.log(`Ollama Response: ${e.status} ${e.statusText}`),e.ok}catch(e){return console.warn("Ollama nicht erreichbar:",e),!1}}async function It(){var e;try{const t=await fetch(`${Je}/api/tags`,{headers:Qe()});return t.ok?((e=(await t.json()).models)==null?void 0:e.map(s=>s.name))||[]:[]}catch{return[]}}const Ae="qwen2.5:14b";async function Tt(){const e=await It();return e.length===0?Ae:e.some(t=>t.includes("qwen"))?e.find(t=>t.includes("qwen"))||Ae:e[0]||Ae}const De=`Du bist Tandem-Vermittlerin und schreibst einen Kommentar an zwei Personen, die du als Tandem-Partner zusammenbringst.

KONTEXT: Dein Text erscheint in einer Tabellenzelle. Darueber und darunter stehen bereits Einleitung und Abschluss - schreibe daher NUR den inhaltlichen Kommentar ohne Einleitung oder Schlusssatz.

PERSPEKTIVE: Du sprichst die beiden direkt an ("ihr", "euch"). Du schreibst UEBER die beiden, nicht AUS ihrer Sicht.

WICHTIG:
- Kein Einleitungssatz, kein Schlusssatz - direkt zum Inhalt
- Achte darauf, dass deine Antwort zur Frage passt
- Benenne Gemeinsamkeiten, keine Analyse
- Keine Annahmen ueber nicht genannte Dinge
- Bei Kontaktfragen: Erklaere wie die beiden SICH GEGENSEITIG erreichen koennen
- Vermeide "Person 1/2" - schreibe natuerlich
- 3-5 Saetze

Frage: {Frage}
Antwort Person A: "{Antwort1}"
Antwort Person B: "{Antwort2}"

Dein Kommentar:`;function Ct(e,t,n){return(Lt()||De).replace("{Frage}",e).replace("{Antwort1}",t).replace("{Antwort2}",n)}async function He(e,t,n,s){var r;const i=await Tt();if(!i)return null;const a=Ct(e,t,n);try{const o=await fetch(`${Je}/api/generate`,{method:"POST",headers:Qe(),body:JSON.stringify({model:i,prompt:a,stream:!1,options:{temperature:.7,num_predict:500}})});if(!o.ok)return console.warn("Ollama API error:",o.status),null;const l=((r=(await o.json()).response)==null?void 0:r.trim())||null;return!l||l==="---"||l.includes("keine Gemeinsamkeit")||l.includes("keine erkennbare")?null:l.replace(/^["']|["']$/g,"").trim()}catch(o){return console.warn("Ollama generation failed:",o),null}}async function xt(){if(!await Mt())return{available:!1,model:null,models:[]};const t=await It();return{available:!0,model:await Tt(),models:t}}let y=[],G="",K="",R=new Set;const Bn='Schreibe hierzu einen kurzen Text. Die Frage zu den Antworten lautet {Frage}. Schreibe, wie die Antworten zusammenpassen könnten bzw. gebe Beispiele aus. Hier die Antworten: Person 1 - {Antwort1}, Person 2 - {Antwort2}. Schreibe den Text nach diesem Beispiel: "Ihr habt beide angegeben, dass ihr gerne kocht - ob mit Freund*innen oder alleine. Also los! Probiert doch einmal gemeinsam neue Rezepte. Außerdem geht ihr beide gerne Spazieren. Nach dem Essen sollst du Ruhn, oder 1.000 Schritte tun. Also habt ihr ja quasi schon einen Tagesplan ;) Weil ihr beide gerne auch kulturelle Dinge macht, wie in das Theater/Museum/oder auf andere Kulturveranstaltungen geht - schaut doch mal auf rausgegangen.de was es in Köln so die nächsten Tage gibt. Oder guckt bei uns im Eventportal: www.startwithafriend.de/events" - Nenne KEINE Namen oder andere Personenbezeichnungen.',Fe=["Person","Sprachen & Herkunft","Beruf & Bildung","Hobbys & Interessen","Tandem-Wünsche","Verfügbarkeit","Sonstiges"],Nn=["vermittler","durchgeführt von","status","terminart","anmeldestatus","bearbeitungsstatus","infoabend","infonachmittag","aufnahmegespräch datum","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","wie wirkt die person","eindruck","einschätzung","bewertung","nächste schritte","follow-up","user-id","profil-id","teilnehmer-id","women_kpi","kpi","integrationskurs","besuchst du gerade einen integrationskurs","vorgeschlagene termine","suggested_appointments","telefonnummer","phone_number","telefon","responsible_user","responsible","registration_interview","appointment_type","appointment_info","region","department_region","department","process_history","process_current_step","flucht","einwandungserfahrung","immigration_experience","create_uid","existing_tandem_count","tandem_count","birthday","geburtstag","geburtsdatum","group","gruppe","e-mail","email","e-mail-adresse","emailadresse","nachname","last_name","lastname","familienname","full_name","fullname","vollständiger name","datum/uhrzeit","datum uhrzeit","anmeldedatum","registrierungsdatum"],_n=["name","full name"];function Rn(e){const t=e.toLowerCase();return t.includes("name")||t.includes("alter")||t.includes("geschlecht")||t.includes("geboren")||t.includes("plz")||t.includes("postleitzahl")?"Person":t.includes("sprache")||t.includes("herkunft")||t.includes("land")||t.includes("deutschland")||t.includes("seit wann")?"Sprachen & Herkunft":t.includes("beruf")||t.includes("arbeit")||t.includes("studium")||t.includes("studiert")||t.includes("abschluss")||t.includes("branche")||t.includes("was machst du gerade")||t.includes("was hast du vorher gemacht")||t.includes("was hast du gelernt")||t.includes("in zukunft")||t.includes("zukunft gerne machen")?"Beruf & Bildung":t.includes("hobby")||t.includes("freizeit")||t.includes("interesse")||t.includes("ausprobieren")||t.includes("was machst du gerne")||t.includes("freundschaft")||t.includes("wichtig")||t.includes("event")||t.includes("anbieten")||t.includes("themen")||t.includes("community")||t.includes("unternehmen")?"Hobbys & Interessen":t.includes("tandem")||t.includes("swaf")||t.includes("mitmachen")||t.includes("warum")||t.includes("vorstellung")||t.includes("geschlecht")&&t.includes("partner")?"Tandem-Wünsche":t.includes("zeit")||t.includes("treffen")||t.includes("wann")||t.includes("erreichen")||t.includes("kontakt")||t.includes("bewegst")?"Verfügbarkeit":"Sonstiges"}function On(e){const t=e.toLowerCase().trim();return _n.includes(t)?!0:Nn.some(n=>t.includes(n))}function Ge(e){return e?["übersprungen","keine angabe","k.a.","n/a","-","","egal","keine","null","undefined"].includes(e.toLowerCase().trim()):!0}const Dn=["name","vorname","nachname","plz","postleitzahl","standort","ort","adresse","wohnort","geschlecht","gender","alter","age","geburt","in deutschland geboren","in welchem land","herkunftsland","geburtsland","woher kommst du","country","altersunterschied","geschlechterpräferenz","alterspräferenz"];function Hn(e){const t=e.toLowerCase();return Dn.some(n=>t.includes(n))}function Pt(e,t,n){localStorage.removeItem("swaf_ai_suggestions_cache"),G=ht(t.name),K=ht(n.name);const s=new Map;function i(r,o,c){if(On(r)||!o||Ge(o))return;const l=Gn(r),d=s.get(l);d?(c?d.answer1?d.answer1!==o&&(d.answer1+="; "+o):d.answer1=o:d.answer2?d.answer2!==o&&(d.answer2+="; "+o):d.answer2=o,d.mergedQuestions.includes(r)||d.mergedQuestions.push(r)):s.set(l,{displayQuestion:r,answer1:c?o:"",answer2:c?"":o,mergedQuestions:[r]})}for(const r of t.fields)i(r.question,r.answer||"",!0);for(const r of n.fields)i(r.question,r.answer||"",!1);y=[];let a=0;for(const[r,o]of s){if(!o.answer1&&!o.answer2)continue;const c=Kn(r,o.displayQuestion),l=Ee(c,o.answer1,o.answer2),d=l.length>0||o.answer1&&o.answer2;y.push({id:`row-${a}`,question:c,answer1:o.answer1,answer2:o.answer2,comment:l,selected:!1,included:d,collapsed:!d,category:Rn(c)}),a++}y.sort((r,o)=>{const c=Fe.indexOf(r.category),l=Fe.indexOf(o.category);return c!==l?c-l:r.included!==o.included?r.included?-1:1:r.question.localeCompare(o.question)}),R.clear(),ye(e);for(const r of y)(r.question.toLowerCase().includes("plz")||r.question.toLowerCase().includes("postleitzahl"))&&r.answer1&&r.answer2&&Xn(r.answer1,r.answer2,r.id)}const Fn=[{key:"alter",patterns:["alter","age","wie alt bist du","wie alt","dein alter","geburtsjahr"]},{key:"geschlecht",patterns:["geschlecht","gender","dein geschlecht","welches geschlecht"]},{key:"altersunterschied",patterns:["altersunterschied","alterspräferenz","age_difference","max_age_difference","maximaler altersunterschied","altersunterschied zum tandempartner"]},{key:"geschlechterpräferenz",patterns:["geschlechterpräferenz","gender_preference","geschlecht des tandems","geschlecht tandempartner","welches geschlecht soll","gewünschtes geschlecht"]},{key:"vorname",patterns:["vorname","firstname","first_name","first name"]},{key:"plz",patterns:["plz","postleitzahl","postal code","zip","zipcode","deine plz"]},{key:"hobbys",patterns:["hobbys","hobbies","hobby"]},{key:"freizeit",patterns:["freizeit","freizeitaktivitäten"]},{key:"interessen",patterns:["interessen","interests"]},{key:"sprachen",patterns:["sprachen","languages","sprache","welche sprachen sprichst du","welche sprachen"]},{key:"herkunftsland",patterns:["herkunftsland","herkunft","woher kommst du","aus welchem land","country"]},{key:"seit_wann_deutschland",patterns:["seit wann in deutschland","seit wann bist du in deutschland","wie lange in deutschland","in deutschland seit"]}],ft={vorname:"Vorname",alter:"Alter",geschlecht:"Geschlecht",plz:"PLZ",hobbys:"Hobbys",freizeit:"Freizeitaktivitäten",interessen:"Interessen",sprachen:"Sprachen",herkunftsland:"Herkunftsland",seit_wann_deutschland:"Seit wann in Deutschland",altersunterschied:"Maximaler Altersunterschied",geschlechterpräferenz:"Geschlecht des Tandempartners"};function Gn(e){const t=e.toLowerCase().replace(/[?!.,:*_-]/g," ").replace(/\s+/g," ").trim(),n=[...Fn].sort((s,i)=>{const a=Math.max(...s.patterns.map(o=>o.length));return Math.max(...i.patterns.map(o=>o.length))-a});for(const s of n)for(const i of s.patterns)if(t===i||t.startsWith(i+" ")||t.endsWith(" "+i)||t.includes(" "+i+" "))return s.key;return t}function Kn(e,t){return ft[e]?ft[e]:t}function ye(e){const t=R.size,n=y.filter(a=>!a.hidden),s=n.filter(a=>a.included).length,i=new Map;for(const a of n)i.has(a.category)||i.set(a.category,[]),i.get(a.category).push(a);e.innerHTML=`
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
        <span class="toolbar-info">${s} von ${n.length} Feldern</span>
      </div>

      <div class="editor-table">
        ${Fe.map(a=>{const r=i.get(a);if(!r||r.length===0)return"";const o=r.filter(c=>c.included).length;return`
            <div class="category-section">
              <div class="category-header">
                <span>${a}</span>
                <span class="category-count">${o}/${r.length}</span>
              </div>
              ${r.map(c=>jn(c)).join("")}
            </div>
          `}).join("")}
      </div>

      <div class="editor-preview">
        <div class="preview-header">
          <strong>E-Mail-Vorschau (${s} Felder):</strong>
          <button class="btn btn-sm" id="copyEmailBtn">📋 Kopieren</button>
        </div>
        <div class="preview-content" id="emailPreview">
          ${Ye()}
        </div>
      </div>
    </div>
  `,Wn(e)}function jn(e){const t=R.has(e.id),n=e.comment&&e.comment.length>0;return`
    <div class="editor-row ${t?"selected":""} ${e.included?"included":"excluded"} ${e.collapsed?"collapsed":""}" data-row-id="${e.id}">
      <div class="row-header">
        <label class="include-toggle" title="In E-Mail einschließen">
          <input type="checkbox" class="include-checkbox" data-row-id="${e.id}" ${e.included?"checked":""}>
          <span class="toggle-slider"></span>
        </label>
        <div class="row-question" data-row-id="${e.id}">
          <span class="collapse-icon">${e.collapsed?"▸":"▾"}</span>
          <span class="question-text">${v(e.question)}</span>
          ${n?'<span class="has-comment-indicator">✓</span>':""}
        </div>
        <div class="row-quick-actions">
          <input type="checkbox" class="merge-checkbox" data-row-id="${e.id}" ${t?"checked":""} title="Für Zusammenführen auswählen">
        </div>
      </div>

      <div class="row-details ${e.collapsed?"hidden":""}">
        <div class="row-answers">
          <div class="answer-cell">
            <div class="answer-label">${v(G)}:</div>
            <textarea
              class="answer-input answer1-input"
              data-row-id="${e.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${v(e.answer1)}</textarea>
          </div>
          <div class="answer-cell">
            <div class="answer-label">${v(K)}:</div>
            <textarea
              class="answer-input answer2-input"
              data-row-id="${e.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${v(e.answer2)}</textarea>
          </div>
        </div>

        <div class="row-comment">
          <textarea
            class="comment-input"
            data-row-id="${e.id}"
            placeholder="Gemeinsamkeit / Kommentar eingeben..."
            rows="2"
          >${v(he(e.comment))}</textarea>
          ${os(e.comment)}
          <div class="comment-buttons">
            <button class="btn-icon smart-suggest" data-row-id="${e.id}" title="Lokaler Textvorschlag">💡</button>
            <button class="btn-icon ai-assist" data-row-id="${e.id}" title="KI-Unterstützung (ChatGPT/Claude)">🤖</button>
          </div>
        </div>
      </div>
    </div>
  `}function Wn(e){var s,i,a;e.querySelectorAll(".include-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;const d=y.find(f=>f.id===l);if(d){d.included=c.checked,se(e);const f=e.querySelector(`.editor-row[data-row-id="${l}"]`);f&&(f.classList.toggle("included",d.included),f.classList.toggle("excluded",!d.included))}})}),e.querySelectorAll(".merge-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;c.checked?R.add(l):R.delete(l);const d=e.querySelector("#mergeRowsBtn");d&&(d.disabled=R.size<2,d.textContent=`⊕ Zusammenführen (${R.size})`)})}),e.querySelectorAll(".row-question").forEach(r=>{r.addEventListener("click",o=>{const c=r.dataset.rowId;if(!c)return;const l=y.find(d=>d.id===c);if(l){l.collapsed=!l.collapsed;const d=e.querySelector(`.editor-row[data-row-id="${c}"]`);if(d){d.classList.toggle("collapsed",l.collapsed);const f=d.querySelector(".row-details"),h=d.querySelector(".collapse-icon");f&&f.classList.toggle("hidden",l.collapsed),h&&(h.textContent=l.collapsed?"▸":"▾")}}})});function t(r){r.style.height="auto",r.style.height=Math.min(r.scrollHeight,200)+"px"}e.querySelectorAll(".answer1-input").forEach(r=>{const o=r;t(o),o.addEventListener("input",c=>{const l=c.target;t(l);const d=l.dataset.rowId;if(!d)return;const f=y.find(h=>h.id===d);f&&(f.answer1=l.value,se(e))})}),e.querySelectorAll(".answer2-input").forEach(r=>{const o=r;t(o),o.addEventListener("input",c=>{const l=c.target;t(l);const d=l.dataset.rowId;if(!d)return;const f=y.find(h=>h.id===d);f&&(f.answer2=l.value,se(e))})}),e.querySelectorAll(".comment-input").forEach(r=>{t(r)}),e.querySelectorAll(".comment-input").forEach(r=>{r.addEventListener("input",o=>{const c=o.target,l=c.dataset.rowId;if(!l)return;const d=y.find(f=>f.id===l);if(d){if(d.comment=c.value,c.value.length>0&&!d.included){d.included=!0;const f=e.querySelector(`.include-checkbox[data-row-id="${l}"]`);f&&(f.checked=!0)}se(e)}})}),e.querySelectorAll(".smart-suggest").forEach(r=>{r.addEventListener("click",async o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=y.find(f=>f.id===c);if(!l)return;l.comment=Ee(l.question,l.answer1,l.answer2);const d=e.querySelector(`.comment-input[data-row-id="${c}"]`);if(d&&(d.value=l.comment),se(e),(!l.comment||l.comment.length<10)&&l.answer1&&l.answer2&&await Mt()){r.textContent="...";const h=await He(l.question,l.answer1,l.answer2);h&&(l.comment=h,l.included=!0,d&&(d.value=l.comment),se(e)),r.textContent="💡"}})}),e.querySelectorAll(".ai-assist").forEach(r=>{r.addEventListener("click",o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=y.find(d=>d.id===c);l&&is(l)})}),(s=e.querySelector("#mergeRowsBtn"))==null||s.addEventListener("click",()=>{Un(),ye(e)}),(i=e.querySelector("#regenerateBtn"))==null||i.addEventListener("click",()=>{for(const r of y)r.comment=Ee(r.question,r.answer1,r.answer2),r.included=r.comment.length>0;ye(e)});const n=e.querySelector("#ollamaBtn");xt().then(r=>{r.available?(n.disabled=!1,n.textContent="KI generieren",n.title="Mit Mistral KI generieren"):(n.textContent="KI nicht verfügbar",n.title="KI-Server nicht erreichbar")}).catch(()=>{n.textContent="KI nicht verfügbar",n.title="Fehler bei der Verbindung zum KI-Server"}),n==null||n.addEventListener("click",async()=>{n.disabled=!0,n.textContent="KI läuft...";const r=y.filter(o=>o.included&&o.answer1&&o.answer2&&!Hn(o.question)).map(o=>({question:o.question,answer1:o.answer1,answer2:o.answer2,rowId:o.id}));rs(r,e,()=>{n.disabled=!1,n.textContent="KI generieren"})}),(a=e.querySelector("#copyEmailBtn"))==null||a.addEventListener("click",()=>{const r=Xe(),o=as();if(navigator.clipboard&&typeof ClipboardItem<"u"){const c=[new ClipboardItem({"text/html":new Blob([o],{type:"text/html"}),"text/plain":new Blob([r],{type:"text/plain"})})];navigator.clipboard.write(c).then(()=>{const l=e.querySelector("#copyEmailBtn");l&&(l.textContent="✓ Kopiert (Word-kompatibel)!",setTimeout(()=>l.textContent="📋 Kopieren",2e3))}).catch(()=>{navigator.clipboard.writeText(r)})}else navigator.clipboard.writeText(r).then(()=>{const c=e.querySelector("#copyEmailBtn");c&&(c.textContent="✓ Kopiert!",setTimeout(()=>c.textContent="📋 Kopieren",2e3))})})}function Un(){if(R.size<2)return;const e=Array.from(R),t=e[0],n=y.find(i=>i.id===t);if(!n)return;const s=e.slice(1);for(const i of s){const a=y.find(r=>r.id===i);a&&(n.question+=" + "+a.question,a.answer1&&a.answer1!==n.answer1&&(n.answer1=n.answer1?n.answer1+"; "+a.answer1:a.answer1),a.answer2&&a.answer2!==n.answer2&&(n.answer2=n.answer2?n.answer2+"; "+a.answer2:a.answer2),a.comment&&(n.comment=n.comment?n.comment+"; "+a.comment:a.comment),a.included=!1,n.mergedWith||(n.mergedWith=[]),n.mergedWith.push(a.question.substring(0,30)))}n.comment=Ee(n.question,n.answer1,n.answer2),R.clear()}function Ee(e,t,n){const s=e.toLowerCase(),i=(t||"").toLowerCase().trim(),a=(n||"").toLowerCase().trim();if(!i&&!a||Ge(i)&&Ge(a))return"";if(i===a&&i.length>2)return s.includes("wichtig")||s.includes("freundschaft")?`Gemeinsamer Wert: ${t}`:s.includes("studium")&&i.includes("ja")?"Beide haben studiert - das verbindet!":`Übereinstimmung: ${t}`;if(s.includes("alter")&&!s.includes("unterschied")){const r=parseInt(i),o=parseInt(a);if(!isNaN(r)&&!isNaN(o)){const c=Math.abs(r-o);return c===0?"Genau gleich alt!":c<=3?`Nur ${c} Jahre Unterschied - perfekt!`:c<=7?`${c} Jahre Unterschied - passt gut`:c<=15?`${c} Jahre Unterschied - verschiedene Perspektiven`:`${c} Jahre Unterschied`}}return s.includes("sprache")||s.includes("sprichst")?Vn(t,n):s.includes("hobby")||s.includes("freizeit")||s.includes("interesse")||s.includes("ausprobieren")||s.includes("was machst du gerne")||s.includes("event")||s.includes("anbieten")||s.includes("unternehmen")||s.includes("themen")?Zn(t,n):s.includes("beruf")||s.includes("arbeit")||s.includes("studium")||s.includes("gelernt")||s.includes("zukunft")||s.includes("branche")||s.includes("was machst du gerade")||s.includes("vorher gemacht")?es(t,n):s.includes("zeit")||s.includes("treffen")||s.includes("wann")||s.includes("erreichbar")?Jn(t,n):s.includes("wichtig")||s.includes("freundschaft")||s.includes("erwartung")?Qn(t,n):s.includes("plz")||s.includes("postleitzahl")?Yn(t,n):s.includes("herkunft")||s.includes("land")||s.includes("woher")?ts(t,n):s.includes("tandem")||s.includes("warum")||s.includes("mitmachen")||s.includes("swaf")||s.includes("start with a friend")?ns(t,n):s.includes("geschlecht")&&(s.includes("partner")||s.includes("tandem"))?ss(t,n):zt(t,n)}function Vn(e,t){const n=e.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),s=t.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),i=n.filter(a=>s.some(r=>a.includes(r)||r.includes(a)));return i.length>0?`Gemeinsame Sprachen: ${[...new Set(i)].join(", ")}`:""}function Zn(e,t){const n=e.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),s=t.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),i=[["sport","fitness","training","gym","joggen","laufen"],["wandern","hiking","spazieren","natur","wald"],["kochen","backen","essen","kulinarisch","rezept"],["musik","konzert","instrument","singen"],["lesen","bücher","literatur"],["reisen","urlaub","travel","länder"],["film","kino","serien","netflix","movie"],["kunst","museum","malen","zeichnen","kreativ"],["tanzen","dance","salsa","bachata","tanz"],["fahrrad","radfahren","cycling","bike"],["foto","fotografieren","photography","kamera"],["café","kaffee","coffee"],["sprache","lernen","language"],["garten","pflanzen","garden"],["yoga","meditation","entspannung"],["schwimmen","baden","swimming"]],a=[];for(const o of n)for(const c of s){if(o.includes(c)||c.includes(o)){a.push(o.length>c.length?o:c);continue}for(const l of i){const d=l.some(h=>o.includes(h)),f=l.some(h=>c.includes(h));d&&f&&a.push(l[0])}}const r=[...new Set(a)];return r.length>0?r.length===1?`Gemeinsames Hobby: ${r[0]}`:`Gemeinsame Hobbys: ${r.slice(0,4).join(", ")}`:""}function Jn(e,t){const n=["morgens","mittags","nachmittags","abends","wochenende","unter der woche","flexibel"],s=e.toLowerCase(),i=t.toLowerCase(),a=n.filter(r=>s.includes(r)&&i.includes(r));return a.includes("flexibel")||a.length>=2?"Zeitlich flexibel - passt gut!":a.length>0?`Gemeinsame Zeit: ${a.join(", ")}`:""}function Qn(e,t){const n=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","kommunikation"],s=e.toLowerCase(),i=t.toLowerCase(),a=n.filter(r=>s.includes(r)&&i.includes(r));return a.length>0?`Gemeinsame Werte: ${a.join(", ")}`:""}function Yn(e,t){const n=ke(e),s=ke(t);return!n||!s?"":n===s?"Gleiche PLZ":n.substring(0,2)===s.substring(0,2)?"Gleiche Region - Entfernung wird berechnet...":"Entfernung wird berechnet..."}async function Xn(e,t,n,s){const i=ke(e),a=ke(t);if(!i||!a)return;const r=y.find(c=>c.id===n);if(!r)return;const o=await Yt(i,a);if(o){const c=await ee(i),l=await ee(a);let d=Xt(o);if(c&&l){const E=en(c,l);d+=` [🗺️](${E.google})`}r.comment=d,r.included=!0;const f=document.querySelector(`.comment-input[data-row-id="${n}"]`);f&&(f.value=he(d));const h=document.querySelector(`.include-checkbox[data-row-id="${n}"]`);h&&(h.checked=!0);const w=document.querySelector("#emailPreview");w&&(w.innerHTML=Ye())}}function ke(e){const t=e.match(/\b(\d{5})\b/);return t?t[1]:null}function es(e,t){const n=e.toLowerCase(),s=t.toLowerCase(),i=[["student","studier","uni","hochschule","ausbildung"],["arbeit","beruf","job","angestellt"],["selbstständig","freelance","freiberuflich"],["suche","arbeitslos","orientierung"],["it","software","computer","programmier"],["sozial","pflege","gesundheit","medizin"],["lehrer","pädagog","bildung","schule"],["ingenieur","technik","maschinenbau"],["wirtschaft","bwl","marketing","vertrieb"],["kunst","design","kreativ","musik"]],a=[];for(const r of i){const o=r.some(l=>n.includes(l)),c=r.some(l=>s.includes(l));o&&c&&a.push(r[0])}return a.length>0?`Ähnlicher Bereich: ${a.join(", ")}`:(n.includes("student")||n.includes("studier"))&&(s.includes("student")||s.includes("studier"))?"Beide studieren - viel gemeinsam!":zt(e,t)}function ts(e,t){const n=e.toLowerCase(),s=t.toLowerCase(),i=["deutschland","syrien","iran","irak","afghanistan","türkei","ukraine","eritrea","somalia","nigeria","pakistan","indien","china","russland"];for(const a of i)if(n.includes(a)&&s.includes(a))return`Beide haben Bezug zu ${a.charAt(0).toUpperCase()+a.slice(1)}`;return(n.includes("kultur")||n.includes("tradition"))&&(s.includes("kultur")||s.includes("tradition"))?"Beide interessiert an Kultur & Traditionen":""}function ns(e,t){const n=e.toLowerCase(),s=t.toLowerCase(),i=[{keywords:["sprache","deutsch","lernen","verbessern"],text:"Beide wollen Sprachkenntnisse verbessern"},{keywords:["freund","kennenlernen","kontakt","leute"],text:"Beide suchen neue Kontakte"},{keywords:["kultur","austausch","integration"],text:"Beide wollen kulturellen Austausch"},{keywords:["helfen","unterstütz","begleiten"],text:"Gegenseitige Unterstützung ist wichtig"},{keywords:["spaß","unternehmung","aktivität"],text:"Beide wollen gemeinsam Spaß haben"}];for(const a of i){const r=a.keywords.some(c=>n.includes(c)),o=a.keywords.some(c=>s.includes(c));if(r&&o)return a.text}return""}function ss(e,t){const n=e.toLowerCase(),s=t.toLowerCase();return(n.includes("egal")||n.includes("keine präferenz"))&&(s.includes("egal")||s.includes("keine präferenz"))?"Beide flexibel beim Geschlecht":""}function zt(e,t){if(!e||!t)return"";const n=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","gerne","sehr","auch","aber","wenn","dann","noch","schon","kann","will","muss","soll","hat","haben","sein","wird","sind","ist","nicht","mehr","viel","viele","alle","diese","dies","dem","den","des"]),s=e.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!n.has(o)),i=t.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!n.has(o)),a=s.filter(o=>i.some(c=>o===c||o.length>4&&c.length>4&&(o.includes(c)||c.includes(o)))),r=[...new Set(a)];return r.length>=1?`Gemeinsam: ${r.slice(0,4).join(", ")}`:e.length>5&&t.length>5?"Beide haben geantwortet":""}function se(e){const t=e.querySelector("#emailPreview");t&&(t.innerHTML=Ye())}function Ye(){const t=y.filter(s=>s.included).filter(s=>s.answer1||s.answer2);let n=`
    <div class="email-intro">
      Hi <strong>${v(G)}</strong> und <strong>${v(K)}</strong>,<br><br>
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
          <th>${v(G)}</th>
          <th>${v(K)}</th>
          <th>Gemeinsamkeit</th>
        </tr>
      </thead>
      <tbody>
  `;for(const s of t){const i=cs(s.comment);n+=`
      <tr>
        <td><strong>${v(s.question)}</strong></td>
        <td>${v(s.answer1)||"-"}</td>
        <td>${v(s.answer2)||"-"}</td>
        <td class="commonality">${i}</td>
      </tr>
    `}return n+=`
      </tbody>
    </table>
    <div class="email-outro">
      <br>Ich freue mich über eure Rückmeldung!
    </div>
  `,n}function is(e,t){var a,r,o,c;const s=(localStorage.getItem("swaf_ai_prompt")||Bn).replace("{Frage}",e.question).replace("{Antwort1}",e.answer1||"keine Angabe").replace("{Antwort2}",e.answer2||"keine Angabe"),i=document.createElement("div");i.className="ai-modal-overlay",i.innerHTML=`
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
          <textarea class="ai-prompt-text" readonly rows="6">${v(s)}</textarea>
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
  `,document.body.appendChild(i),(a=i.querySelector(".close-modal"))==null||a.addEventListener("click",()=>i.remove()),i.addEventListener("click",l=>{l.target===i&&i.remove()}),(r=i.querySelector(".ai-chatgpt"))==null||r.addEventListener("click",()=>{navigator.clipboard.writeText(s).then(()=>{window.open("https://chat.openai.com/","_blank"),i.remove(),Ke("💬 ChatGPT geöffnet - Prompt in Zwischenablage kopiert!")})}),(o=i.querySelector(".ai-claude"))==null||o.addEventListener("click",()=>{navigator.clipboard.writeText(s).then(()=>{window.open("https://claude.ai/","_blank"),i.remove(),Ke("🤖 Claude geöffnet - Prompt in Zwischenablage kopiert!")})}),(c=i.querySelector(".ai-copy-prompt"))==null||c.addEventListener("click",()=>{navigator.clipboard.writeText(s).then(()=>{const l=i.querySelector(".ai-copy-prompt");l.textContent="✓ Kopiert!",setTimeout(()=>l.textContent="📋 Nur Prompt kopieren",2e3)})})}function Ke(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),3e3)}function rs(e,t,n){const s=e.map(u=>({...u,generated:"",status:"pending",selected:!0}));let i=!1,a=new Set;const r=document.createElement("div");r.className="ai-modal-overlay";function o(){return`
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
            ${s.map((u,m)=>c(u,m)).join("")}
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
            <span class="ai-preview-question">${v(u.question)}</span>
            <button class="btn-icon ai-regenerate-btn" data-index="${m}" title="Neu generieren" ${u.status==="generating"?"disabled":""}>🔄</button>
          </div>
          <div class="ai-preview-answers">
            <span class="answer-snippet" title="${v(u.answer1)}">${v(ue(u.answer1,30))}</span>
            <span class="answer-vs">+</span>
            <span class="answer-snippet" title="${v(u.answer2)}">${v(ue(u.answer2,30))}</span>
          </div>
          <div class="ai-preview-result" id="result-${m}">
            ${l(u,m)}
          </div>
          <details class="ai-item-prompt">
            <summary>Prompt anzeigen</summary>
            <pre class="ai-prompt-mini">${v(Ct(u.question,u.answer1,u.answer2))}</pre>
          </details>
        </div>
      </div>
    `}function l(u,m){return u.status==="pending"?'<div class="ai-preview-pending">Wartet...</div>':u.status==="generating"?'<div class="ai-preview-generating"><span class="ai-mini-spinner"></span> Generiere...</div>':u.status==="error"?'<div class="ai-preview-error">Fehler - klicke 🔄 zum erneuten Versuch</div>':`<textarea class="ai-preview-textarea" data-index="${m}" rows="4">${v(u.generated)}</textarea>`}function d(u){const m=s[u],p=r.querySelector(`#preview-item-${u}`);if(!p)return;p.className=`ai-preview-item ${m.status}`;const g=p.querySelector(`#result-${u}`);if(g){g.innerHTML=l(m,u);const z=g.querySelector(".ai-preview-textarea");z&&z.addEventListener("input",N=>{const ge=N.target;s[u].generated=ge.value})}const b=p.querySelector('input[type="checkbox"]');b&&(b.disabled=m.status!=="done",b.checked=m.selected);const $=p.querySelector(".ai-regenerate-btn");$&&($.disabled=m.status==="generating"),f()}function f(){const u=s.filter($=>$.status==="done").length,m=s.filter($=>$.selected&&$.status==="done").length,p=r.querySelector("#progressText");p&&(p.textContent=`${u}/${e.length} generiert`);const g=r.querySelector("#selectedCount");g&&(g.textContent=String(m));const b=r.querySelector("#applyPreviewBtn");b&&(b.disabled=m===0)}function h(){const u=r.querySelector("#progressInfo");if(u){const g=s.filter(b=>b.status==="done").length;u.innerHTML=`<span id="progressText">${g} Vorschläge generiert</span>`}const m=r.querySelector("#introText");if(m){const g=s.filter(b=>b.status==="done").length;m.innerHTML=`<strong>${g} Vorschläge generiert.</strong> Wähle aus, welche du übernehmen möchtest:`}const p=r.querySelector("#stopGenerationBtn");p&&(p.style.display="none")}function w(){const u={};for(const m of s)m.status==="done"&&m.generated&&(u[m.question]=m.generated);Object.keys(u).length>0&&localStorage.setItem("swaf_ai_suggestions_cache",JSON.stringify(u))}function E(){try{const u=localStorage.getItem("swaf_ai_suggestions_cache");if(u){const m=JSON.parse(u);for(const p of s)m[p.question]&&!p.generated&&(p.generated=m[p.question],p.status="done",p.selected=!1)}}catch(u){console.warn("Could not load AI suggestions cache:",u)}}function I(){w(),i=!0,r.remove(),n()}function P(){var u,m,p,g,b,$,z,N,ge;(u=r.querySelector(".close-modal"))==null||u.addEventListener("click",I),(m=r.querySelector("#cancelPreviewBtn"))==null||m.addEventListener("click",I),(p=r.querySelector("#stopGenerationBtn"))==null||p.addEventListener("click",()=>{i=!0,h()}),(g=r.querySelector("#selectAllBtn"))==null||g.addEventListener("click",()=>{s.forEach((_,M)=>{if(_.status==="done"){_.selected=!0;const A=r.querySelector(`#preview-item-${M} input[type="checkbox"]`);A&&(A.checked=!0)}}),f()}),(b=r.querySelector("#selectNoneBtn"))==null||b.addEventListener("click",()=>{s.forEach((_,M)=>{_.selected=!1;const A=r.querySelector(`#preview-item-${M} input[type="checkbox"]`);A&&(A.checked=!1)}),f()}),($=r.querySelector("#previewList"))==null||$.addEventListener("change",_=>{const M=_.target;if(M.type==="checkbox"&&M.dataset.index){const A=parseInt(M.dataset.index,10);s[A].selected=M.checked,f()}}),(z=r.querySelector("#previewList"))==null||z.addEventListener("input",_=>{const M=_.target;if(M.classList.contains("ai-preview-textarea")&&M.dataset.index){const A=parseInt(M.dataset.index,10);s[A].generated=M.value}}),(N=r.querySelector("#previewList"))==null||N.addEventListener("click",async _=>{const M=_.target;if(M.classList.contains("ai-regenerate-btn")&&M.dataset.index){const A=parseInt(M.dataset.index,10);await J(A)}}),(ge=r.querySelector("#applyPreviewBtn"))==null||ge.addEventListener("click",()=>{w(),i=!0,te(),r.remove(),n()})}async function J(u){if(a.has(u))return;const m=s[u];a.add(u),m.status="generating",d(u);try{const p=await He(m.question,m.answer1,m.answer2);p?(m.generated=p,m.status="done",m.selected=!0):m.status="error"}catch(p){console.warn("Regeneration error:",p),m.status="error"}a.delete(u),d(u)}function te(){let u=0;for(const m of s)if(m.selected&&m.status==="done"&&m.generated){const p=y.find(g=>g.id===m.rowId);p&&(p.comment=m.generated,p.included=!0,u++)}ye(t),u>0&&Ke(`${u} KI-Vorschläge übernommen`)}E(),r.innerHTML=o(),document.body.appendChild(r),P();for(let u=0;u<s.length;u++)s[u].status==="done"&&d(u);async function ne(){for(let u=0;u<s.length&&!i;u++){const m=s[u];if(!(m.status==="done"&&m.generated)){m.status="generating",d(u);try{const p=await He(m.question,m.answer1,m.answer2);if(i)break;p?(m.generated=p,m.status="done"):(m.status="error",m.selected=!1)}catch(p){console.warn("Generation error:",p),m.status="error",m.selected=!1}d(u)}}h()}ne()}function Xe(){const t=y.filter(i=>i.included).filter(i=>i.answer1||i.answer2);let n=`Hi ${G} und ${K},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;const s={question:Math.max(10,...t.map(i=>i.question.length)),answer1:Math.max(G.length,...t.map(i=>(i.answer1||"-").length)),answer2:Math.max(K.length,...t.map(i=>(i.answer2||"-").length))};s.question=Math.min(s.question,30),s.answer1=Math.min(s.answer1,25),s.answer2=Math.min(s.answer2,25),n+=ie("Frage",s.question)+" | ",n+=ie(G,s.answer1)+" | ",n+=ie(K,s.answer2)+" | ",n+=`Gemeinsamkeit
`,n+="-".repeat(s.question)+"-+-",n+="-".repeat(s.answer1)+"-+-",n+="-".repeat(s.answer2)+"-+-",n+="-".repeat(20)+`
`;for(const i of t){const a=he(i.comment);n+=ie(ue(i.question,s.question),s.question)+" | ",n+=ie(ue(i.answer1||"-",s.answer1),s.answer1)+" | ",n+=ie(ue(i.answer2||"-",s.answer2),s.answer2)+" | ",n+=(a||"")+`
`}return n+=`
Ich freue mich über eure Rückmeldung!
`,n}function ie(e,t){return e.length>=t?e.substring(0,t):e+" ".repeat(t-e.length)}function ue(e,t){return e?e.length<=t?e:e.substring(0,t-2)+"..":""}function as(){const t=y.filter(s=>s.included).filter(s=>s.answer1||s.answer2);let n=`<!--StartFragment-->
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
  Hi <strong>${v(G)}</strong> und <strong>${v(K)}</strong>,<br><br>
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
      <th style="width: 25%;">${v(G)}</th>
      <th style="width: 25%;">${v(K)}</th>
      <th style="width: 25%;">Gemeinsamkeit</th>
    </tr>
  </thead>
  <tbody>
`;for(const s of t){const i=ls(s.comment);n+=`    <tr>
      <td><strong>${v(s.question)}</strong></td>
      <td>${v(s.answer1)||"-"}</td>
      <td>${v(s.answer2)||"-"}</td>
      <td class="commonality">${i}</td>
    </tr>
`}return n+=`  </tbody>
</table>

<p><br>Ich freue mich über eure Rückmeldung!</p>
</body>
</html>
<!--EndFragment-->`,n}function At(){return y.filter(e=>e.included).map(e=>({question:e.question,answer1:e.answer1,answer2:e.answer2,commonality:e.comment}))}function ht(e){if(!e||typeof e!="string")return"Partner*in";const t=e.match(/\(([^)]+)\)/);if(t){const s=t[1].trim().split(/[\s,]+/)[0];if(s&&s.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(s))return s}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(e)){const n=e.split(/[\s,]+/)[0];if(n&&n.length>1)return n}return"Partner*in"}function v(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function et(e){if(!e)return null;const t=e.match(/\[🗺️\]\((https?:\/\/[^)]+)\)/);return t?t[1]:null}function he(e){return e?e.replace(/\s*\[🗺️\]\(https?:\/\/[^)]+\)/,"").trim():""}function os(e){const t=et(e);return t?`<a href="${t}" target="_blank" class="btn-icon map-link-btn" title="Route in Google Maps öffnen">🗺️</a>`:""}function cs(e){if(!e)return"";const t=et(e);if(t){const n=he(e);return`${v(n)} <a href="${t}" target="_blank" class="map-link">🗺️ Route</a>`}return v(e)}function ls(e){if(!e)return"";const t=et(e);if(t){const n=he(e);return`${v(n)} <a href="${t}" style="color: #009892;">🗺️ Route anzeigen</a>`}return v(e)}function ds(){gt(),window.addEventListener("tandems-updated",gt),window.addEventListener("create-match",s=>{const i=s;fs(i.detail.profile1,i.detail.profile2)}),window.addEventListener("edit-tandem",s=>{We(s.detail.tandem)});const e=document.getElementById("closeMatchModal"),t=document.getElementById("cancelMatch"),n=document.getElementById("confirmMatch");e==null||e.addEventListener("click",je),t==null||t.addEventListener("click",je),n==null||n.addEventListener("click",hs)}function gt(){const e=document.getElementById("tandemList");if(!e)return;const t=Y();if(t.length===0){e.innerHTML='<p class="empty-state">Noch keine Tandems erstellt. Wähle zwei Profile aus, um ein Tandem zu erstellen.</p>';return}e.innerHTML=t.sort((n,s)=>new Date(s.created).getTime()-new Date(n.created).getTime()).map(n=>ms(n)).join(""),e.querySelectorAll(".delete-tandem").forEach(n=>{n.addEventListener("click",s=>{s.stopPropagation();const i=n.getAttribute("data-tandem-id");i&&confirm("Tandem wirklich löschen?")&&Et(i)})}),e.querySelectorAll(".copy-tandem").forEach(n=>{n.addEventListener("click",s=>{s.stopPropagation();const i=n.getAttribute("data-tandem-id");i&&us(i)})}),e.querySelectorAll(".edit-tandem").forEach(n=>{n.addEventListener("click",s=>{s.stopPropagation();const i=n.getAttribute("data-tandem-id");if(i){const r=Y().find(o=>o.id===i);r&&We(r)}})}),e.querySelectorAll(".tandem-card").forEach(n=>{n.addEventListener("click",s=>{if(s.target.closest("button"))return;const a=n.getAttribute("data-tandem-id");if(a){const o=Y().find(c=>c.id===a);o&&We(o)}})})}function us(e){const n=Y().find(r=>r.id===e);if(!n)return;if(n.suggestionText){navigator.clipboard.writeText(n.suggestionText).then(()=>{wt("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")});return}const s=pt(n.profile1.name),i=pt(n.profile2.name);let a=`Hi ${s} und ${i},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;if(n.commonalities&&n.commonalities.length>0){const r={question:Math.max(10,...n.commonalities.map(o=>o.question.length)),answer1:Math.max(s.length,...n.commonalities.map(o=>(o.answer1||"-").length)),answer2:Math.max(i.length,...n.commonalities.map(o=>(o.answer2||"-").length))};r.question=Math.min(r.question,30),r.answer1=Math.min(r.answer1,25),r.answer2=Math.min(r.answer2,25),a+=re("Frage",r.question)+" | ",a+=re(s,r.answer1)+" | ",a+=re(i,r.answer2)+" | ",a+=`Gemeinsamkeit
`,a+="-".repeat(r.question)+"-+-",a+="-".repeat(r.answer1)+"-+-",a+="-".repeat(r.answer2)+"-+-",a+="-".repeat(20)+`
`;for(const o of n.commonalities)a+=re(qe(o.question,r.question),r.question)+" | ",a+=re(qe(o.answer1||"-",r.answer1),r.answer1)+" | ",a+=re(qe(o.answer2||"-",r.answer2),r.answer2)+" | ",a+=(o.commonality||"")+`
`}a+=`
Ich freue mich über eure Rückmeldung!
`,navigator.clipboard.writeText(a).then(()=>{wt("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")})}function re(e,t){return e.length>=t?e.substring(0,t):e+" ".repeat(t-e.length)}function qe(e,t){return e?e.length<=t?e:e.substring(0,t-2)+"..":""}function pt(e){if(!e||typeof e!="string")return"Partner*in";const t=e.match(/\(([^)]+)\)/);if(t){const s=t[1].trim().split(/[\s,]+/)[0];if(s&&s.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(s))return s}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(e)){const n=e.split(/[\s,]+/)[0];if(n&&n.length>1)return n}return"Partner*in"}function wt(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),2e3)}function ms(e){const t=new Date(e.created).toLocaleDateString("de-DE"),n=tt(e.matchScore);return`
    <div class="tandem-card" data-tandem-id="${e.id}">
      <div class="header">
        <div class="title">${D(e.name)}</div>
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
          <strong>${D(e.profile1.name)}</strong>
        </div>
        <div class="profile">
          <strong>${D(e.profile2.name)}</strong>
        </div>
      </div>
      ${e.suggestionText?`
        <div class="suggestion-text">
          <strong>Vorschlagstext:</strong>
          <pre>${D(e.suggestionText)}</pre>
        </div>
      `:e.commonalities.length>0?`
        <div class="commonalities">
          <strong>Gemeinsamkeiten:</strong>
          ${e.commonalities.slice(0,3).map(s=>`
            <div class="commonality">• ${D(s.commonality)}</div>
          `).join("")}
          ${e.commonalities.length>3?`<div class="commonality">... und ${e.commonalities.length-3} weitere</div>`:""}
        </div>
      `:""}
    </div>
  `}function tt(e){let t="";for(let n=0;n<5;n++)t+=`<span class="star ${n<e?"":"empty"}">★</span>`;return t}let Le=null;function fs(e,t){const n=document.getElementById("matchModal"),s=document.getElementById("matchPreview");if(!n||!s)return;Le={profile1:e,profile2:t};const i=Ze(e,t);s.innerHTML=`
    <div class="match-preview-content">
      <div class="match-profiles">
        <div class="profile">
          <strong>${D(e.name)}</strong>
        </div>
        <div class="match-icon">🤝</div>
        <div class="profile">
          <strong>${D(t.name)}</strong>
        </div>
      </div>
      <div class="match-score">
        <span>Match-Qualität: </span>
        <span class="stars">${tt(i.score)}</span>
      </div>
      <div id="tandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    </div>
  `;const a=document.getElementById("tandemEditorContainer");a&&Pt(a,e,t),n.classList.add("visible")}function je(){const e=document.getElementById("matchModal");e==null||e.classList.remove("visible"),Le=null}function hs(){if(!Le)return;const{profile1:e,profile2:t}=Le,n=Ze(e,t),s=Xe(),i=At(),a={id:crypto.randomUUID(),profile1:e,profile2:t,name:`${e.name} & ${t.name}`,created:new Date().toISOString(),commonalities:i,matchScore:n.score,suggestionText:s};Dt(a),je(),nt(`Tandem erstellt: ${e.name} & ${t.name}`)}function nt(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),3e3)}function D(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let j=null;function We(e){var s,i,a,r,o;j=e;let t=document.getElementById("editTandemModal");t||(t=document.createElement("div"),t.id="editTandemModal",t.className="modal",t.innerHTML=`
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
    `,document.body.appendChild(t),(s=t.querySelector("#closeEditModal"))==null||s.addEventListener("click",fe),(i=t.querySelector("#cancelEditTandem"))==null||i.addEventListener("click",fe),(a=t.querySelector("#dissolveTandem"))==null||a.addEventListener("click",ps),(r=t.querySelector("#saveEditTandem"))==null||r.addEventListener("click",ws),(o=t.querySelector("#backToOverviewBtn"))==null||o.addEventListener("click",gs));const n=document.getElementById("editTandemContent");if(n){const c=new Date(e.created).toLocaleDateString("de-DE");n.innerHTML=`
      <div class="edit-tandem-info">
        <div class="tandem-pair">
          <div class="profile-name">
            <strong>${D(e.profile1.name)}</strong>
          </div>
          <div class="pair-icon">🤝</div>
          <div class="profile-name">
            <strong>${D(e.profile2.name)}</strong>
          </div>
        </div>
        <div class="tandem-meta">
          <span class="stars">${tt(e.matchScore)}</span>
          <span class="date">Erstellt am: ${c}</span>
        </div>
      </div>
      <div id="editTandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    `;const l=document.getElementById("editTandemEditorContainer");l&&Pt(l,e.profile1,e.profile2)}t.classList.add("visible")}function fe(){const e=document.getElementById("editTandemModal");e==null||e.classList.remove("visible"),j=null}function gs(){fe();const e=document.querySelectorAll(".tab"),t=document.querySelectorAll(".tab-content");e.forEach(n=>{n.classList.toggle("active",n.dataset.tab==="matching")}),t.forEach(n=>{n.classList.toggle("active",n.id==="matching-tab")})}function ps(){if(!j)return;const e=`Tandem zwischen "${j.profile1.name}" und "${j.profile2.name}" wirklich auflösen?

Die Profile können dann erneut gematcht werden.`;confirm(e)&&(Et(j.id),fe(),nt("Tandem aufgelöst - Profile können neu gematcht werden"))}function ws(){if(!j)return;const e=Xe(),t=At();Ht(j.id,{suggestionText:e,commonalities:t}),fe(),nt("Tandem aktualisiert")}const vs="modulepreload",bs=function(e,t){return new URL(e,t).href},vt={},ys=function(t,n,s){let i=Promise.resolve();if(n&&n.length>0){const r=document.getElementsByTagName("link"),o=document.querySelector("meta[property=csp-nonce]"),c=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));i=Promise.allSettled(n.map(l=>{if(l=bs(l,s),l in vt)return;vt[l]=!0;const d=l.endsWith(".css"),f=d?'[rel="stylesheet"]':"";if(!!s)for(let E=r.length-1;E>=0;E--){const I=r[E];if(I.href===l&&(!d||I.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${f}`))return;const w=document.createElement("link");if(w.rel=d?"stylesheet":vs,d||(w.as="script"),w.crossOrigin="",w.href=l,c&&w.setAttribute("nonce",c),document.head.appendChild(w),d)return new Promise((E,I)=>{w.addEventListener("load",E),w.addEventListener("error",()=>I(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return i.then(r=>{for(const o of r||[])o.status==="rejected"&&a(o.reason);return t().catch(a)})};function Es(){const e=document.getElementById("exportExcel"),t=document.getElementById("exportCSV"),n=document.getElementById("exportJSON"),s=document.getElementById("importBackup"),i=document.getElementById("manageProfilesBtn"),a=document.getElementById("deleteAllProfilesBtn");e==null||e.addEventListener("click",ks),t==null||t.addEventListener("click",Ls),n==null||n.addEventListener("click",Ss),s==null||s.addEventListener("click",$s),i==null||i.addEventListener("click",Is),a==null||a.addEventListener("click",Ms),Cs(),Be(),window.addEventListener("tandems-updated",Be),window.addEventListener("profiles-updated",Be)}function Be(){const e=document.getElementById("statsContainer");if(!e)return;const t=W(),n=Y(),s=Ft(),i=n.length>0?(n.reduce((a,r)=>a+r.matchScore,0)/n.length).toFixed(1):"-";e.innerHTML=`
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
  `}async function ks(){const e=Y();if(e.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}try{const t=await ys(()=>import("./xlsx-D_0l8YDs.js"),[],import.meta.url),n=e.map(r=>({Tandem:r.name,"Person 1":r.profile1.name,"Person 2":r.profile2.name,"Match-Score":r.matchScore,Erstellt:new Date(r.created).toLocaleDateString("de-DE"),Gemeinsamkeiten:r.commonalities.map(o=>o.commonality).join("; ")})),s=t.utils.json_to_sheet(n),i=t.utils.book_new();t.utils.book_append_sheet(i,s,"Tandems");const a=`tandems_${new Date().toISOString().split("T")[0]}.xlsx`;t.writeFile(i,a)}catch(t){console.error("Excel export error:",t),alert("Fehler beim Excel-Export. Bitte versuche den CSV-Export.")}}function Ls(){const e=Y();if(e.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}const t=["Tandem","Person 1","Person 2","Match-Score","Erstellt","Gemeinsamkeiten"],n=e.map(i=>[i.name,i.profile1.name,i.profile2.name,String(i.matchScore),new Date(i.created).toLocaleDateString("de-DE"),i.commonalities.map(a=>a.commonality).join("; ")]),s=[t.join(";"),...n.map(i=>i.map(a=>`"${a.replace(/"/g,'""')}"`).join(";"))].join(`
`);qt(s,`tandems_${new Date().toISOString().split("T")[0]}.csv`,"text/csv;charset=utf-8")}function Ss(){const e=jt();qt(e,`tandem-matcher-backup_${new Date().toISOString().split("T")[0]}.json`,"application/json")}function $s(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=t=>{var i;const n=(i=t.target.files)==null?void 0:i[0];if(!n)return;const s=new FileReader;s.onload=a=>{var r;try{const o=(r=a.target)==null?void 0:r.result;confirm("Achtung: Alle bestehenden Daten werden überschrieben. Fortfahren?")&&(Wt(o),alert("Backup erfolgreich wiederhergestellt!"),location.reload())}catch(o){alert("Fehler beim Wiederherstellen: "+o.message)}},s.readAsText(n)},e.click()}function qt(e,t,n){const s=new Blob([e],{type:n}),i=URL.createObjectURL(s),a=document.createElement("a");a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)}function Ms(){const e=W();if(e.length===0){alert("Keine Profile vorhanden.");return}confirm(`Möchtest du wirklich ALLE ${e.length} Profile löschen?

Diese Aktion kann nicht rückgängig gemacht werden!`)&&confirm("Bist du sicher? Alle Profile werden unwiderruflich gelöscht.")&&(Ot(),window.dispatchEvent(new Event("profiles-updated")),alert("Alle Profile wurden gelöscht."))}function Is(){const e=W();if(ce(),e.length===0){alert("Keine Profile vorhanden.");return}const t=document.createElement("div");t.className="modal visible",t.id="profileManageModal";function n(){const c=W(),l=ce();return c.map(d=>{const f=l.has(d.id),h=d.group==="local"?"Local":"Newcomer",w=d.group==="local"?"local":"newcomer";return`
        <div class="profile-manage-item ${f?"matched":""}" data-id="${d.id}">
          <div class="profile-manage-info">
            <span class="profile-manage-name">${Ts(d.name)}</span>
            <span class="profile-manage-group ${w}">${h}</span>
            ${f?'<span class="profile-manage-badge">In Tandem</span>':""}
          </div>
          <button class="btn btn-sm btn-danger profile-delete-btn" data-id="${d.id}" ${f?'disabled title="Profil ist in einem Tandem"':""}>
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
  `,document.body.appendChild(t);const s=t.querySelector("#closeProfileManageModal"),i=t.querySelector("#closeProfileManageBtn"),a=t.querySelector("#profileSearchInput"),r=t.querySelector("#profileManageList");function o(){t.remove()}s==null||s.addEventListener("click",o),i==null||i.addEventListener("click",o),t.addEventListener("click",c=>{c.target===t&&o()}),a==null||a.addEventListener("input",()=>{const c=a.value.toLowerCase(),l=r==null?void 0:r.querySelectorAll(".profile-manage-item");l==null||l.forEach(d=>{var h,w;const f=((w=(h=d.querySelector(".profile-manage-name"))==null?void 0:h.textContent)==null?void 0:w.toLowerCase())||"";d.style.display=f.includes(c)?"flex":"none"})}),r==null||r.addEventListener("click",c=>{var d,f;const l=c.target;if(l.classList.contains("profile-delete-btn")&&!l.hasAttribute("disabled")){const h=l.dataset.id;if(!h)return;const w=((f=(d=l.closest(".profile-manage-item"))==null?void 0:d.querySelector(".profile-manage-name"))==null?void 0:f.textContent)||"Unbekannt";if(confirm(`Profil "${w}" wirklich löschen?`)){Rt(h),window.dispatchEvent(new Event("profiles-updated")),r&&(r.innerHTML=n());const I=t.querySelector(".profile-manage-header p"),P=W();I&&(I.innerHTML=`<strong>${P.length}</strong> Profile geladen`),P.length===0&&(o(),alert("Alle Profile wurden gelöscht."))}}})}function Ts(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Cs(){const e=document.getElementById("promptTextarea"),t=document.getElementById("savePromptBtn"),n=document.getElementById("resetPromptBtn"),s=document.getElementById("promptStatus");if(!e||!t||!n)return;const i=Lt();e.value=i||De,Ne(s,!!i),t.addEventListener("click",()=>{const a=e.value.trim();a&&(Ut(a),Ne(s,!0),bt(s,"Gespeichert!","success"))}),n.addEventListener("click",()=>{confirm("Prompt auf Standard zur�cksetzen?")&&(Vt(),e.value=De,Ne(s,!1),bt(s,"Zur�ckgesetzt!","info"))})}function Ne(e,t){e&&(t?(e.textContent="Eigener Prompt aktiv",e.className="prompt-status custom"):(e.textContent="Standard-Prompt aktiv",e.className="prompt-status default"))}function bt(e,t,n){if(!e)return;const s=e.textContent,i=e.className;e.textContent=t,e.className="prompt-status "+n,setTimeout(()=>{e.textContent=s,e.className=i},2e3)}document.addEventListener("DOMContentLoaded",async()=>{console.log("Tandem-Matcher v2.0 initialisiert"),await Bt(),xs(),Cn(),tn(),un(),kn(),ds(),Es(),Ps(),qs(),As(),zs()});function xs(){const e=document.querySelectorAll(".tab"),t=document.querySelectorAll(".tab-content");e.forEach(n=>{n.addEventListener("click",()=>{const s=n.dataset.tab;s&&(e.forEach(i=>i.classList.remove("active")),n.classList.add("active"),t.forEach(i=>{i.classList.toggle("active",i.id===`${s}-tab`)}))})})}function Ps(){const e=document.querySelectorAll(".view-btn"),t=document.getElementById("profileSidebar"),n=document.getElementById("mapContainer");e.forEach(s=>{s.addEventListener("click",()=>{const i=s.dataset.view;!i||!t||!n||(e.forEach(a=>a.classList.remove("active")),s.classList.add("active"),i==="list"?(t.classList.add("mobile-visible"),n.classList.add("mobile-hidden")):(t.classList.remove("mobile-visible"),n.classList.remove("mobile-hidden"),setTimeout(()=>{window.dispatchEvent(new Event("resize")),window.dispatchEvent(new Event("map-needs-resize"))},100)))})})}async function zs(){const e=document.getElementById("ollamaStatus");if(e)try{const t=await xt();t.available&&t.model?(e.className="ollama-status available",e.textContent=`Verfügbar: ${t.model}`):t.available?(e.className="ollama-status unavailable",e.textContent="Ollama läuft, aber kein Modell installiert"):(e.className="ollama-status unavailable",e.textContent="Nicht verfügbar - Ollama installieren")}catch{e.className="ollama-status unavailable",e.textContent="Nicht verfügbar"}}function As(){const e=document.getElementById("helpBtn"),t=document.getElementById("helpModal"),n=document.getElementById("closeHelpModal");e==null||e.addEventListener("click",()=>{t==null||t.classList.add("visible")}),n==null||n.addEventListener("click",()=>{t==null||t.classList.remove("visible")}),t==null||t.addEventListener("click",s=>{s.target===t&&t.classList.remove("visible")}),localStorage.getItem("swaf_help_shown")||setTimeout(()=>{t==null||t.classList.add("visible"),localStorage.setItem("swaf_help_shown","true")},500)}function qs(){let e=!1;setTimeout(async()=>{if(!e){e=!0;try{if((await navigator.permissions.query({name:"clipboard-read"})).state==="granted"){const n=await navigator.clipboard.readText();n&&n.includes('"version"')&&n.includes('"profiles"')&&confirm("Profile-Daten in der Zwischenablage erkannt. Importieren?")&&window.dispatchEvent(new CustomEvent("import-from-clipboard",{detail:n}))}}catch{}}},1e3)}window.TandemMatcher={version:"2.0.0"};
