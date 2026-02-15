(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const B={PROFILES:"swaf_profiles",TANDEMS:"swaf_tandems",GAMIFICATION:"swaf_gamification_stats",PLZ_CACHE:"swaf_plz_cache",SETTINGS:"swaf_settings"};let k=[],$=[],q=ut(),Z=new Map;function ut(){return{totalMatches:0,todayMatches:0,lastMatchDate:"",streak:0,qualityScores:[],achievements:[],totalPoints:0}}async function Mt(){try{const t=localStorage.getItem(B.PROFILES);t&&(k=JSON.parse(t));const e=localStorage.getItem(B.TANDEMS);e&&($=JSON.parse(e));const n=localStorage.getItem(B.GAMIFICATION);n&&(q={...ut(),...JSON.parse(n)});const i=localStorage.getItem(B.PLZ_CACHE);if(i){const s=JSON.parse(i);Z=new Map(Object.entries(s))}console.log(`Storage initialized: ${k.length} profiles, ${$.length} tandems`)}catch(t){console.error("Error loading storage:",t)}}function F(){return[...k]}function he(t){return k.find(e=>e.id===t)}function Tt(t){const e=new Set(k.map(i=>i.id)),n=new Set(k.map(i=>ke(i.name)));for(const i of t){if(e.has(i.id))continue;const s=ke(i.name);if(n.has(s)){const a=k.find(r=>ke(r.name)===s);if(a){At(a,i);continue}}k.push(i),e.add(i.id),n.add(s)}ye()}function At(t,e){const n=new Set(t.fields.map(i=>i.question));for(const i of e.fields)n.has(i.question)||t.fields.push(i);t.pageType="Merged",t.timestamp=Math.max(t.timestamp,e.timestamp)}function ke(t){return t.toLowerCase().trim().replace(/\s+/g," ")}function It(t){k=k.filter(e=>e.id!==t),ye()}function Pt(){k=[],ye()}function ye(){localStorage.setItem(B.PROFILES,JSON.stringify(k)),window.dispatchEvent(new CustomEvent("profiles-updated"))}function le(){return[...$]}function xt(t){$.push(t),Ee(),q.totalMatches++,q.todayMatches++,q.lastMatchDate=new Date().toISOString().split("T")[0],q.qualityScores.push(t.matchScore),ht()}function mt(t){$=$.filter(e=>e.id!==t),Ee()}function zt(t,e){const n=$.findIndex(i=>i.id===t);n!==-1&&($[n]={...$[n],...e},Ee())}function ne(){const t=new Set;for(const e of $)t.add(e.profile1.id),t.add(e.profile2.id);return t}function X(t){return $.find(e=>e.profile1.id===t||e.profile2.id===t)}function Ee(){localStorage.setItem(B.TANDEMS,JSON.stringify($)),window.dispatchEvent(new CustomEvent("tandems-updated"))}function Ct(){return{...q}}function ht(){localStorage.setItem(B.GAMIFICATION,JSON.stringify(q))}function Bt(t){return Z.get(t)}function ze(t,e){Z.set(t,e);const n=Object.fromEntries(Z);localStorage.setItem(B.PLZ_CACHE,JSON.stringify(n))}function qt(t){if(!t.profiles||!Array.isArray(t.profiles))throw new Error("Ungültiges Datenformat");const e=k.length;return Tt(t.profiles),k.length-e}function Nt(){return JSON.stringify({profiles:k,tandems:$,gamificationStats:q,plzCache:Object.fromEntries(Z),exportedAt:new Date().toISOString(),version:"2.0"})}function Rt(t){const e=JSON.parse(t);e.profiles&&(k=e.profiles),e.tandems&&($=e.tandems),e.gamificationStats&&(q=e.gamificationStats),e.plzCache&&(Z=new Map(Object.entries(e.plzCache))),ye(),Ee(),ht(),localStorage.setItem(B.PLZ_CACHE,JSON.stringify(Object.fromEntries(Z)))}function K(t){const e=t.fields.find(n=>n.question.toLowerCase().includes("plz")||n.question.toLowerCase().includes("postleitzahl"));if(e!=null&&e.answer){const n=e.answer.match(/\d{5}/);return n?n[0]:null}for(const n of t.fields){const i=n.answer.match(/\b\d{5}\b/);if(i)return i[0]}return null}function ce(t){const e=[/newcomer/i,/geflüchtet/i,/migrant/i,/zugewandert/i,/immigrant/i,/einwander/i,/neuankommend/i,/geflohene?/i,/refugee/i,/asyl/i,/zuwander/i],n=[/\blocal\b/i,/einheimisch/i,/hier.*geboren/i,/alteingesessen/i,/ortsansässig/i],i=a=>e.some(r=>r.test(a)),s=a=>n.some(r=>r.test(a));if(t.pageType){if(i(t.pageType))return"newcomer";if(s(t.pageType))return"local"}if(t.name){if(i(t.name))return"newcomer";if(s(t.name))return"local"}if(t.url){if(i(t.url))return"newcomer";if(s(t.url))return"local"}for(const a of t.fields){const r=a.question.toLowerCase(),o=a.answer;if(r.includes("gruppe")||r.includes("status")||r.includes("wer bist")||r.includes("local")||r.includes("newcomer")||r.includes("herkunft")||r.includes("aufnahme")||r.includes("teilnehmer")){if(i(o))return"newcomer";if(s(o))return"local"}}for(const a of t.fields)if(i(a.answer))return"newcomer";return"local"}function ie(t){const e=t.fields.find(i=>i.question.toLowerCase().includes("alter")&&!i.question.toLowerCase().includes("unterschied")&&!i.question.toLowerCase().includes("präferenz"));if(e!=null&&e.answer){const i=e.answer.match(/\d+/);if(i){const s=parseInt(i[0]);if(s>=16&&s<=100)return s}}const n=t.fields.find(i=>i.question.toLowerCase().includes("geboren")||i.question.toLowerCase().includes("geburtsjahr"));if(n!=null&&n.answer){const i=n.answer.match(/(19|20)\d{2}/);if(i){const s=parseInt(i[0]),r=new Date().getFullYear()-s;if(r>=16&&r<=100)return r}}return null}function fe(t){const e=t.fields.find(n=>n.question.toLowerCase().includes("geschlecht")&&!n.question.toLowerCase().includes("präferenz")&&!n.question.toLowerCase().includes("partner"));if(e!=null&&e.answer){const n=e.answer.toLowerCase();if(n.includes("männlich")||n.includes("mann")||n==="m")return"male";if(n.includes("weiblich")||n.includes("frau")||n==="w"||n==="f")return"female";if(n.includes("divers")||n.includes("sonstig")||n.includes("andere"))return"other"}return null}const Dt={sport:["sport","fitness","training","gym","workout"],fussball:["fußball","fussball","soccer","kicken"],musik:["musik","music","konzert","singen","instrument"],lesen:["lesen","bücher","reading","books"],kochen:["kochen","cooking","backen","küche"],reisen:["reisen","travel","urlaub","reise"],kino:["kino","filme","movies","cinema","film"],gaming:["gaming","videospiele","spiele","zocken","games"],wandern:["wandern","hiking","spazieren","natur"],fotografie:["fotografie","photography","fotos","fotografieren"],kunst:["kunst","art","malen","zeichnen","museum"],tanzen:["tanzen","dance","dancing","tanz"],yoga:["yoga","meditation","entspannung"],schwimmen:["schwimmen","swimming","baden"],radfahren:["radfahren","fahrrad","cycling","bike","rad"],laufen:["laufen","joggen","running","jogging"],sprachen:["sprachen","languages","sprachkurs"],essen:["essen","food","kulinarik","restaurant"],feiern:["feiern","party","ausgehen","club","bar"],natur:["natur","nature","garten","pflanzen","outdoor"]};function Ue(t){const e=t.toLowerCase().trim();for(const[n,i]of Object.entries(Dt))if(i.some(s=>e.includes(s)))return n;return e.replace(/[^a-zäöüß]/gi,"")}const _t={"01":{lat:51.05,lng:13.74,city:"Dresden"},"02":{lat:51.15,lng:14.97,city:"Görlitz"},"03":{lat:51.76,lng:14.33,city:"Cottbus"},"04":{lat:51.34,lng:12.38,city:"Leipzig"},"05":{lat:51.22,lng:6.78,city:"Düsseldorf"},"06":{lat:51.48,lng:11.97,city:"Halle"},"07":{lat:50.93,lng:11.59,city:"Jena"},"08":{lat:50.72,lng:12.49,city:"Zwickau"},"09":{lat:50.83,lng:12.92,city:"Chemnitz"},10:{lat:52.52,lng:13.41,city:"Berlin Mitte"},11:{lat:52.52,lng:13.41,city:"Berlin"},12:{lat:52.45,lng:13.43,city:"Berlin Süd"},13:{lat:52.57,lng:13.35,city:"Berlin Nord"},14:{lat:52.39,lng:13.07,city:"Potsdam"},15:{lat:52.34,lng:14.55,city:"Frankfurt/Oder"},16:{lat:52.98,lng:13.79,city:"Oranienburg"},17:{lat:53.91,lng:13.38,city:"Greifswald"},18:{lat:54.09,lng:12.14,city:"Rostock"},19:{lat:53.63,lng:11.41,city:"Schwerin"},20:{lat:53.55,lng:10,city:"Hamburg"},21:{lat:53.47,lng:9.78,city:"Hamburg Süd"},22:{lat:53.6,lng:10.05,city:"Hamburg Nord"},23:{lat:53.87,lng:10.69,city:"Lübeck"},24:{lat:54.32,lng:10.14,city:"Kiel"},25:{lat:53.87,lng:9.09,city:"Itzehoe"},26:{lat:53.14,lng:8.22,city:"Oldenburg"},27:{lat:53.08,lng:8.81,city:"Bremen Nord"},28:{lat:53.08,lng:8.81,city:"Bremen"},29:{lat:52.97,lng:10.57,city:"Celle"},30:{lat:52.37,lng:9.74,city:"Hannover"},31:{lat:52.23,lng:9.52,city:"Hannover Süd"},32:{lat:52.02,lng:8.53,city:"Herford"},33:{lat:51.93,lng:8.38,city:"Bielefeld"},34:{lat:51.31,lng:9.5,city:"Kassel"},35:{lat:50.56,lng:8.67,city:"Gießen"},36:{lat:50.55,lng:9.68,city:"Fulda"},37:{lat:51.53,lng:9.93,city:"Göttingen"},38:{lat:52.27,lng:10.52,city:"Braunschweig"},39:{lat:52.13,lng:11.63,city:"Magdeburg"},40:{lat:51.23,lng:6.78,city:"Düsseldorf"},41:{lat:51.19,lng:6.44,city:"Mönchengladbach"},42:{lat:51.26,lng:7.15,city:"Wuppertal"},43:{lat:51.36,lng:7.35,city:"Hagen"},44:{lat:51.51,lng:7.47,city:"Dortmund"},45:{lat:51.45,lng:7.01,city:"Essen"},46:{lat:51.54,lng:6.77,city:"Oberhausen"},47:{lat:51.43,lng:6.76,city:"Duisburg"},48:{lat:51.96,lng:7.63,city:"Münster"},49:{lat:52.28,lng:8.05,city:"Osnabrück"},50:{lat:50.94,lng:6.96,city:"Köln"},51:{lat:50.99,lng:7.13,city:"Köln Ost"},52:{lat:50.78,lng:6.08,city:"Aachen"},53:{lat:50.73,lng:7.1,city:"Bonn"},54:{lat:49.75,lng:6.64,city:"Trier"},55:{lat:50,lng:8.27,city:"Mainz"},56:{lat:50.36,lng:7.6,city:"Koblenz"},57:{lat:50.87,lng:8.02,city:"Siegen"},58:{lat:51.36,lng:7.47,city:"Hagen"},59:{lat:51.66,lng:8.38,city:"Hamm"},60:{lat:50.11,lng:8.68,city:"Frankfurt"},61:{lat:50.22,lng:8.62,city:"Frankfurt Nord"},62:{lat:50.1,lng:8.77,city:"Bad Homburg"},63:{lat:50,lng:8.96,city:"Offenbach"},64:{lat:49.87,lng:8.65,city:"Darmstadt"},65:{lat:50.08,lng:8.24,city:"Wiesbaden"},66:{lat:49.24,lng:7,city:"Saarbrücken"},67:{lat:49.45,lng:8.44,city:"Ludwigshafen"},68:{lat:49.49,lng:8.47,city:"Mannheim"},69:{lat:49.41,lng:8.69,city:"Heidelberg"},70:{lat:48.78,lng:9.18,city:"Stuttgart"},71:{lat:48.73,lng:9.11,city:"Stuttgart Süd"},72:{lat:48.52,lng:9.05,city:"Tübingen"},73:{lat:48.8,lng:9.47,city:"Esslingen"},74:{lat:49.14,lng:9.22,city:"Heilbronn"},75:{lat:48.89,lng:8.69,city:"Pforzheim"},76:{lat:49.01,lng:8.4,city:"Karlsruhe"},77:{lat:48.47,lng:7.94,city:"Offenburg"},78:{lat:47.99,lng:8.52,city:"Villingen"},79:{lat:47.99,lng:7.85,city:"Freiburg"},80:{lat:48.14,lng:11.58,city:"München"},81:{lat:48.11,lng:11.6,city:"München Süd"},82:{lat:48.05,lng:11.47,city:"München West"},83:{lat:47.86,lng:11.97,city:"Rosenheim"},84:{lat:48.44,lng:12.12,city:"Landshut"},85:{lat:48.4,lng:11.74,city:"Freising"},86:{lat:48.37,lng:10.9,city:"Augsburg"},87:{lat:47.73,lng:10.31,city:"Kempten"},88:{lat:47.66,lng:9.48,city:"Friedrichshafen"},89:{lat:48.4,lng:10,city:"Ulm"},90:{lat:49.45,lng:11.08,city:"Nürnberg"},91:{lat:49.6,lng:11.01,city:"Erlangen"},92:{lat:49.02,lng:12.1,city:"Amberg"},93:{lat:49.02,lng:12.1,city:"Regensburg"},94:{lat:48.57,lng:13.45,city:"Passau"},95:{lat:50.06,lng:11.78,city:"Bayreuth"},96:{lat:50.1,lng:10.88,city:"Bamberg"},97:{lat:49.79,lng:9.95,city:"Würzburg"},98:{lat:50.68,lng:10.93,city:"Suhl"},99:{lat:50.98,lng:11.03,city:"Erfurt"}};function ft(t,e,n,i){const a=ue(n-t),r=ue(i-e),o=Math.sin(a/2)*Math.sin(a/2)+Math.cos(ue(t))*Math.cos(ue(n))*Math.sin(r/2)*Math.sin(r/2);return 6371*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}function ue(t){return t*(Math.PI/180)}let Le=0;const Ve=1e3;async function U(t){var s;if(!t||t.length<2)return null;const e=t.replace(/\D/g,"").substring(0,5);if(e.length<5)return Je(e);const n=Bt(e);if(n)return n;const i=Je(e);if(i)return ze(e,i),i;try{const a=Date.now();a-Le<Ve&&await new Promise(c=>setTimeout(c,Ve-(a-Le))),Le=Date.now(),console.log(`🌐 Lade PLZ ${e} von OpenStreetMap...`);const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&country=DE&postalcode=${e}&limit=1`,{headers:{"User-Agent":"SwaF Tandem Matcher v2.0"}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const o=await r.json();if(o&&o.length>0){const c={lat:parseFloat(o[0].lat),lng:parseFloat(o[0].lon),city:((s=o[0].display_name)==null?void 0:s.split(",")[0])||void 0};return ze(e,c),console.log(`✅ PLZ ${e} gefunden:`,c),c}}catch(a){console.warn(`⚠️ Nominatim API Fehler für PLZ ${e}:`,a)}return null}function Je(t){const e=t.substring(0,2),n=_t[e];if(!n)return null;let i=0,s=0;if(t.length>=5){const r=parseInt(t.substring(2,5),10)||0,o=r*2.399963,c=.02+r%100*3e-4;i=c*Math.cos(o),s=c*Math.sin(o)*1.4}const a={lat:n.lat+i,lng:n.lng+s,city:n.city};return ze(t,a),a}async function Ot(t,e){if(t===e)return 0;const n=await U(t),i=await U(e);if(!(!n||!i))return ft(n.lat,n.lng,i.lat,i.lng)}const me=new Map;async function Gt(t,e){if(!t||!e)return null;if(t===e)return{distanceKm:0,drivingMinutes:0,transitMinutes:0,cyclingMinutes:0,walkingMinutes:0};const n=`${t}-${e}`,i=me.get(n);if(i)return i;const s=`${e}-${t}`,a=me.get(s);if(a)return a;const r=await U(t),o=await U(e);if(!r||!o)return null;try{const f=`https://router.project-osrm.org/route/v1/driving/${r.lng},${r.lat};${o.lng},${o.lat}?overview=false`;console.log(`🚗 Berechne Entfernung ${t} → ${e}...`);const h=await fetch(f);if(!h.ok)throw new Error(`HTTP ${h.status}`);const g=await h.json();if(g.code==="Ok"&&g.routes&&g.routes.length>0){const m=g.routes[0],v=m.distance/1e3,D=Math.round(m.duration/60),W=Math.round(D*1.8),S=Math.round(v*4),_=Math.round(v*12),T={distanceKm:Math.round(v*10)/10,drivingMinutes:D,transitMinutes:W,cyclingMinutes:S,walkingMinutes:_};return me.set(n,T),console.log(`✅ Entfernung: ${T.distanceKm} km`),T}}catch(f){console.warn("⚠️ OSRM API Fehler:",f)}const c=ft(r.lat,r.lng,o.lat,o.lng),d=Math.round(c*1.3*10)/10,u={distanceKm:d,drivingMinutes:Math.round(d*1.2),transitMinutes:Math.round(d*2.2),cyclingMinutes:Math.round(d*4),walkingMinutes:Math.round(d*12)};return me.set(n,u),u}function Ft(t){if(t.distanceKm===0)return"Gleiche PLZ";const e=[];return e.push(`${t.distanceKm} km Entfernung`),t.drivingMinutes<=120&&e.push(`ca. ${Se(t.drivingMinutes)} mit Auto`),t.transitMinutes<=180&&e.push(`ca. ${Se(t.transitMinutes)} mit ÖPNV`),t.walkingMinutes<=45&&e.push(`ca. ${Se(t.walkingMinutes)} zu Fuß`),e.join(", ")}function Se(t){if(t<60)return`${t} min`;const e=Math.floor(t/60),n=t%60;return n===0?`${e} h`:`${e}:${n.toString().padStart(2,"0")} h`}function Ht(t,e){const n=`https://www.google.com/maps/dir/${t.lat},${t.lng}/${e.lat},${e.lng}`,i=`https://www.bvg.de/de/verbindungen/verbindungssuche?start=${t.lat},${t.lng}&destination=${e.lat},${e.lng}`;return{google:n,bvg:i,mvv:"https://www.mvv-muenchen.de/fahrplanauskunft/index.html#routing",hvv:"https://www.hvv.de/de/fahrplaene/abruf-fahrplaninfos/"}}let I=null,H=new Map,_e=null;function jt(){document.getElementById("map")&&(I=L.map("map").setView([51.1657,10.4515],6),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:18}).addTo(I),Qe(),window.addEventListener("profiles-updated",Qe),window.addEventListener("tandems-updated",Kt),window.addEventListener("profile-selected",e=>{Vt(e.detail.profileId)}),window.addEventListener("profile-deselected",()=>{Jt()}))}function Kt(){const t=ne();H.forEach((e,n)=>{var s;const i=(s=e.getElement())==null?void 0:s.querySelector(".marker-icon");i&&(t.has(n)?i.classList.add("matched"):i.classList.remove("matched"))})}async function Qe(){if(!I)return;H.forEach(n=>n.remove()),H.clear();const t=F(),e=new Map;for(const n of t){const i=K(n);i&&(e.has(i)||e.set(i,[]),e.get(i).push(n))}for(const[n,i]of e){const s=await U(n);if(!(!s||!isFinite(s.lat)||!isFinite(s.lng)))for(let a=0;a<i.length;a++){const r=i[a],o=Wt(a,i.length),c=s.lat+o.lat,l=s.lng+o.lng,d=Zt(r,c,l);d.addTo(I),H.set(r.id,d)}}}function Wt(t,e){if(e===1)return{lat:0,lng:0};const n=.002,i=.001*Math.floor(t/8),s=n+i,r=t*2.399963;return{lat:s*Math.cos(r),lng:s*Math.sin(r)*1.4}}function Zt(t,e,n){const i=ce(t),s=t.name.split(" ").map(u=>u[0]).join("").substring(0,2).toUpperCase(),r=ne().has(t.id),o=r?"matched":"",c=L.divIcon({className:"marker-wrapper",html:`<div class="marker-icon ${i} ${o}" data-profile-id="${t.id}">${s}</div>`,iconSize:[30,30],iconAnchor:[15,15]}),l=L.marker([e,n],{icon:c}),d=Ut(t,i,r);return l.bindPopup(d,{maxWidth:300}),l.on("click",()=>{window.dispatchEvent(new CustomEvent("profile-clicked",{detail:{profileId:t.id}}))}),l}function Ut(t,e,n=!1){const i=ie(t),s=K(t),a=fe(t),r=Me(t,["hobby","hobbies","freizeit","interessen"]),o=Me(t,["sprache","sprachen","language"]),c=Me(t,["beruf","arbeit","job","tätigkeit","beschäftigung"]),l=a==="male"?"M":a==="female"?"W":a==="other"?"D":"",d=e==="local"?"Local":"Newcomer",u=e==="local"?"local":"newcomer";let f=`
    <div class="marker-popup">
      <div class="popup-header">
        <strong>${ae(t.name)}</strong>
        <span class="group-badge ${u}">${d}</span>
        ${n?'<span class="matched-badge">✓ Vermittelt</span>':""}
      </div>
      <div class="popup-meta">
        ${i?`<span>${i} Jahre</span>`:""}
        ${l?`<span>${l}</span>`:""}
        ${s?`<span>PLZ ${s}</span>`:""}
      </div>
  `;if(n){const h=X(t.id);if(h){const g=h.profile1.id===t.id?h.profile2.name:h.profile1.name;f+=`<div class="popup-field tandem-info"><strong>Tandem mit:</strong> ${ae(g)}</div>`}}return c&&(f+=`<div class="popup-field"><strong>Beruf:</strong> ${ae($e(c,50))}</div>`),o&&(f+=`<div class="popup-field"><strong>Sprachen:</strong> ${ae($e(o,80))}</div>`),r&&(f+=`<div class="popup-field"><strong>Interessen:</strong> ${ae($e(r,80))}</div>`),f+=`
      <div class="popup-action">
        ${n?"<em>Bereits vermittelt</em>":"<em>Klicken für Smart Match</em>"}
      </div>
    </div>
  `,f}function $e(t,e){return t.length<=e?t:t.substring(0,e-3)+"..."}function ae(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function Me(t,e){for(const n of e){const i=new RegExp(n,"i"),s=t.fields.find(a=>i.test(a.question));if(s!=null&&s.answer)return s.answer}return null}function Vt(t){_e=t,H.forEach((n,i)=>{var a;const s=(a=n.getElement())==null?void 0:a.querySelector(".marker-icon");s&&s.classList.toggle("selected",i===t)});const e=H.get(t);e&&I&&I.setView(e.getLatLng(),Math.max(I.getZoom(),10))}function Jt(){_e=null,H.forEach(t=>{var n;const e=(n=t.getElement())==null?void 0:n.querySelector(".marker-icon");e&&e.classList.remove("selected","compatible","incompatible","top-match")})}function Qt(t,e,n){H.forEach((i,s)=>{var r;if(s===_e)return;const a=(r=i.getElement())==null?void 0:r.querySelector(".marker-icon");a&&(a.classList.remove("compatible","incompatible","top-match"),n.includes(s)?a.classList.add("compatible","top-match"):t.includes(s)?a.classList.add("compatible"):e.includes(s)&&a.classList.add("incompatible"))})}function Yt(){I&&setTimeout(()=>{I==null||I.invalidateSize()},100)}window.addEventListener("map-needs-resize",Yt);let A={},y=new Set,j=!1;function Xt(){z(),en();const t=document.getElementById("filter-gender"),e=document.getElementById("filter-group"),n=document.getElementById("filter-search");t==null||t.addEventListener("change",()=>{A.gender=t.value,z()}),e==null||e.addEventListener("change",()=>{A.group=e.value,z()}),n==null||n.addEventListener("input",()=>{A.searchText=n.value,z()}),window.addEventListener("profiles-updated",z),window.addEventListener("tandems-updated",z),window.addEventListener("profile-clicked",i=>{gt(i.detail.profileId)})}function en(){const t=document.querySelector(".sidebar-header");if(!t||document.getElementById("manualMatchBtn"))return;const e=document.createElement("button");e.id="manualMatchBtn",e.className="btn btn-sm",e.innerHTML="👆 Manuell matchen",e.title="Zwei Profile zum Matchen auswählen",e.addEventListener("click",()=>{j=!j,y.clear(),window.dispatchEvent(new CustomEvent("profile-deselected")),Ce(),z()}),t.appendChild(e)}function Ce(){const t=document.getElementById("manualMatchBtn");t&&(j?(t.classList.add("active"),t.innerHTML=y.size===0?"✋ Wähle 2 Profile...":y.size===1?"✋ Noch 1 wählen...":"✅ Matchen!"):(t.classList.remove("active"),t.innerHTML="👆 Manuell matchen"))}function z(){const t=document.getElementById("profileList"),e=document.getElementById("profileCount");if(!t)return;const n=tn();if(e&&(e.textContent=String(n.length)),n.length===0){t.innerHTML='<p class="empty-state">Keine Profile gefunden. Importiere Profile über den Button oben.</p>';return}t.innerHTML=n.map(i=>nn(i)).join(""),t.querySelectorAll(".profile-card").forEach(i=>{i.addEventListener("click",()=>{const s=i.getAttribute("data-profile-id");s&&gt(s)})})}function tn(){let t=F();if(A.gender&&A.gender!=="all"&&(t=t.filter(e=>fe(e)===A.gender)),A.group&&A.group!=="all"&&(t=t.filter(e=>ce(e)===A.group)),A.searchText){const e=A.searchText.toLowerCase();t=t.filter(n=>{const i=K(n)||"";return n.name.toLowerCase().includes(e)||i.includes(e)})}return t}function nn(t){const e=K(t)||"-",n=ce(t),i=ie(t),s=y.has(t.id),r=ne().has(t.id),o=r?X(t.id):null,c=o?o.profile1.id===t.id?o.profile2.name:o.profile1.name:null,l=j&&s?Array.from(y).indexOf(t.id)+1:0;return`
    <div class="profile-card ${s?"selected":""} ${r?"matched":""} ${j?"manual-mode":""}" data-profile-id="${t.id}">
      ${l>0?`<div class="selection-number">${l}</div>`:""}
      <div class="name">${Ye(t.name)}</div>
      <div class="meta">
        <span class="group-badge ${n}">${n==="local"?"Local":"Newcomer"}</span>
        <span>PLZ: ${e}</span>
        ${i?`<span>${i} Jahre</span>`:""}
      </div>
      ${r?`
        <div class="matched-info">
          <span class="matched-badge">✓ Vermittelt</span>
          ${c?`<span class="partner-name">mit ${Ye(c.split(" ")[0])}</span>`:""}
        </div>
      `:""}
    </div>
  `}function gt(t){const e=he(t);if(!e)return;const n=X(t);if(n&&!j){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:n.id,tandem:n,profileId:t}}));return}if(j){if(y.has(t))y.delete(t);else{if(y.size>=2){const i=Array.from(y)[0];y.delete(i)}y.add(t)}if(Ce(),y.size===2){const i=Array.from(y),s=he(i[0]),a=he(i[1]);if(s&&a){const r=X(s.id),o=X(a.id);if(r||o){alert("Eines der Profile ist bereits in einem Tandem. Bitte zuerst das bestehende Tandem auflösen.");return}window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:s,profile2:a}})),j=!1,y.clear(),Ce()}}z();return}if(y.has(t))y.delete(t),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:t}}));else{if(y.size>0){const i=Array.from(y)[0];y.clear(),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:i}}))}y.add(t),window.dispatchEvent(new CustomEvent("profile-selected",{detail:{profileId:t,profile:e}}))}z()}function Ye(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const sn=["vorname","nachname","name","vollständiger name","e-mail-adresse","e-mail","email","telefonnummer","telefon","id","user-id","teilnehmer-id","profil-id","gruppe","standort","region","west","ost","nord","süd","vermittler","vermittler*in","durchgeführt von","durchgeführt","datum/uhrzeit","datum","uhrzeit","termin","terminart","status","bearbeitungsstatus","anmeldestatus","infoabend","infonachmittag","format","aufnahmegespräch","standort-newsletter","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","portal-link","wie wirkt die person auf dich","eindruck","bewertung","wie schätzt du ein","einschätzung","beurteilung","sind weitere schritte nötig","nächste schritte","follow-up","aufnahmegespräch datum","gespräch datum","plz","postleitzahl","ort","stadt","köln","berlin","münchen","ausgeschlossen","ausgetreten","pausiert","vermittelt","unvermittelt","angemeldet","beginn","ende"];function rn(t){const e=t.toLowerCase().trim();return e.length<3||e==="geschlecht"||e==="dein geschlecht"?!0:sn.some(n=>e.includes(n)||n.includes(e))}function E(t,e){for(const n of e){const i=new RegExp(n,"i"),s=t.fields.find(a=>i.test(a.question)&&!rn(a.question));if(s!=null&&s.answer)return s.answer}return null}function Oe(t,e){const n=[],i=ce(t),s=ce(e);if(i===s)return{compatible:!1,score:0,failReason:"same_group",failDetails:`Beide sind ${i==="local"?"Locals":"Newcomer"} - nur interkulturelle Matches möglich`,softFactsScore:0,softFactsMax:15};const a=an(t,e);if(!a.pass)return{compatible:!1,score:0,failReason:"age_preference",failDetails:a.reason,softFactsScore:0,softFactsMax:15};const r=on(t,e);if(!r.pass)return{compatible:!1,score:0,failReason:"gender_preference",failDetails:r.reason,softFactsScore:0,softFactsMax:15};const o=cn(t,e);if(!o.pass)return{compatible:!1,score:0,failReason:"time_overlap",failDetails:o.reason,softFactsScore:0,softFactsMax:15};const c=[],l=ln(t,e,n,c),d=15;return{compatible:!0,score:Math.min(5,Math.round(l/d*5)),softFactsScore:l,softFactsMax:d,details:n.join("; "),positiveFactors:c.slice(0,3)}}function an(t,e){const n=ie(t),i=ie(e);if(!n||!i)return{pass:!0};const s=Math.abs(n-i),a=E(t,["alter.*unterschied","alter.*tandem","wie groß.*alter"]),r=E(e,["alter.*unterschied","alter.*tandem","wie groß.*alter"]);if(a){const o=a.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&s>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${s} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&s>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${s} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&i<n)return{pass:!1,reason:`${t.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&i>n)return{pass:!1,reason:`${t.name}: Präferiert jüngeren Partner`}}if(r){const o=r.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&s>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${s} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&s>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${s} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&n<i)return{pass:!1,reason:`${e.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&n>i)return{pass:!1,reason:`${e.name}: Präferiert jüngeren Partner`}}return{pass:!0}}function on(t,e){const n=fe(t),i=fe(e),s=E(t,["geschlecht.*tandem","geschlecht.*partner"]),a=E(e,["geschlecht.*tandem","geschlecht.*partner"]);if(s&&i){const r=s.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&i!=="female")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${s}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&i!=="male")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${s}" nicht erfüllt`}}}if(a&&n){const r=a.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&n!=="female")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${a}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&n!=="male")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${a}" nicht erfüllt`}}}return{pass:!0}}function cn(t,e){const n=E(t,["zeit.*treffen","zeit.*tandem","wann.*zeit"]),i=E(e,["zeit.*treffen","zeit.*tandem","wann.*zeit"]);if(!n||!i)return{pass:!0};const s=n.toLowerCase(),a=i.toLowerCase();return s.includes("flexibel")||a.includes("flexibel")?{pass:!0}:["morgens","mittags","nachmittags","abends","unter der woche","wochenende"].filter(c=>s.includes(c)&&a.includes(c)).length===0?{pass:!1,reason:"Keine gemeinsamen Zeitfenster gefunden"}:{pass:!0}}function ln(t,e,n,i){let s=0;const a=K(t),r=K(e);if(a&&r){const b=parseInt(a.substring(0,2)),P=parseInt(r.substring(0,2)),O=Math.abs(b-P);a===r?(s+=3,n.push("Gleiche PLZ"),i.push("Gleiche PLZ")):O===0?(s+=2.5,n.push("Gleiche Region (< 10 km)"),i.push("Nah beieinander")):O===1?(s+=2,n.push("Benachbarte Region"),i.push("Benachbarte Region")):O<=3?(s+=1.5,n.push("Nahe Region")):O<=5?s+=1:s+=.5}const o=ie(t),c=ie(e);if(o&&c){const b=Math.abs(o-c);b<=3?(s+=2,n.push(`Sehr ähnliches Alter (±${b} Jahre)`),i.push(b===0?"Gleich alt":`Nur ${b}J Unterschied`)):b<=5?(s+=1.8,n.push(`Ähnliches Alter (±${b} Jahre)`),i.push("Ähnliches Alter")):b<=10?s+=1.5:b<=15?s+=1:b<=20&&(s+=.5)}const l=E(t,["geschlecht.*tandem","geschlecht.*partner"]),d=E(e,["geschlecht.*tandem","geschlecht.*partner"]);(l||d)&&(s+=1,n.push("Geschlechtspräferenz erfüllt")),s+=1,n.push("Interkulturell");const u=E(t,["hobby","hobbies","hobbys"]),f=E(e,["hobby","hobbies","hobbys"]);if(u&&f){const b=dn(u,f);if(b.length>0){const P=Math.min(2,b.length*.4);s+=P,b.length>=3?(n.push("Viele gemeinsame Hobbys"),i.push("Viele gemeinsame Hobbys")):b.length>=2?(n.push("Mehrere gemeinsame Hobbys"),i.push("Gemeinsame Hobbys")):n.push("Gemeinsame Hobby-Interessen")}}const h=E(t,["freizeit(?!.*vermittler)"]),g=E(e,["freizeit(?!.*vermittler)"]);if(h&&g){const b=Xe(h,g);b.length>=3?(s+=1.5,n.push("Ähnliche Freizeitinteressen")):b.length>=1&&(s+=.75)}const m=E(t,["themen.*interessieren","interess.*themen"]),v=E(e,["themen.*interessieren","interess.*themen"]);if(m&&v){const b=["politik","kunst","kultur","technologie","sport","musik","natur","reisen","essen","kochen","wissenschaft","geschichte","literatur"],P=m.toLowerCase(),O=v.toLowerCase(),se=b.filter(re=>P.includes(re)&&O.includes(re));se.length>=2?(s+=1.5,n.push("Mehrere gemeinsame Interessensgebiete"),i.push("Ähnliche Interessen")):se.length===1&&(s+=.75,n.push("Gemeinsame Interessensgebiete"))}const D=E(t,["freundschaft.*wichtig","wichtig.*freundschaft"]),W=E(e,["freundschaft.*wichtig","wichtig.*freundschaft"]);if(D&&W){const b=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","loyalität","treue"],P=D.toLowerCase(),O=W.toLowerCase(),se=b.filter(re=>P.includes(re)&&O.includes(re));se.length>=2?(s+=1.5,n.push("Ähnliche Wertvorstellungen"),i.push("Ähnliche Werte")):se.length===1&&(s+=.75)}const S=E(t,["tandem.*vorstellung(?!.*geschlecht)"]),_=E(e,["tandem.*vorstellung(?!.*geschlecht)"]);if(S&&_){const b=Xe(S,_);b.length>=2?(s+=1,n.push("Ähnliche Tandem-Vorstellungen")):b.length>=1&&(s+=.5)}const T=E(t,["community-event","event.*unternehmen"]),V=E(e,["community-event","event.*unternehmen"]);if(T&&V){const b=T.toLowerCase(),P=V.toLowerCase();(b.includes("ja")||b.includes("gerne"))&&(P.includes("ja")||P.includes("gerne"))&&(s+=.5)}return s}function dn(t,e){const n=t.split(/[,;]/).map(s=>Ue(s.trim())).filter(Boolean),i=e.split(/[,;]/).map(s=>Ue(s.trim())).filter(Boolean);return n.filter(s=>i.some(a=>s===a))}function Xe(t,e){const n=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","mich","gerne","sehr","auch","aber","dass","wenn","weil","nicht","mehr","noch","schon","immer"]),i=t.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!n.has(a)),s=e.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!n.has(a));return i.filter(a=>s.some(r=>a===r||a.includes(r)||r.includes(a)))}let M=null,ee=[];function un(){document.getElementById("smartMatchPanel");const t=document.getElementById("closeSmartMatch");t==null||t.addEventListener("click",()=>{et(),window.dispatchEvent(new CustomEvent("profile-deselected"))}),window.addEventListener("profile-selected",async e=>{M=e.detail.profile;const i=X(M.id);if(i){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:i.id,tandem:i,profileId:M.id}})),M=null;return}await mn(),hn(),bn()}),window.addEventListener("profile-deselected",()=>{M=null,ee=[],et()})}async function mn(){if(!M)return;const t=F(),e=ne(),n=[];for(const i of t){if(i.id===M.id||e.has(i.id))continue;const s=Oe(M,i),a=K(M),r=K(i);let o,c;a&&r&&(o=await Ot(a,r),o!==void 0&&(c=o<1?"<1 km":`${Math.round(o)} km`)),n.push({profile:i,matchResult:s,distance:o,distanceText:c})}n.sort((i,s)=>i.matchResult.compatible!==s.matchResult.compatible?i.matchResult.compatible?-1:1:i.matchResult.compatible?s.matchResult.score-i.matchResult.score:0),ee=n}function hn(){const t=document.getElementById("smartMatchPanel"),e=document.getElementById("selectedProfileName"),n=document.getElementById("smartMatchContent");!t||!e||!n||!M||(e.textContent=M.name,n.innerHTML=fn(),t.classList.add("visible"),n.querySelectorAll(".match-item").forEach(i=>{i.addEventListener("click",()=>{const s=i.getAttribute("data-profile-id");s&&pn(s)})}))}function et(){const t=document.getElementById("smartMatchPanel");t==null||t.classList.remove("visible")}function fn(){if(ee.length===0)return'<p class="empty-state">Keine anderen Profile zum Matchen vorhanden.</p>';const t=ee.filter(i=>i.matchResult.compatible),e=ee.filter(i=>!i.matchResult.compatible);let n="";return t.length>0&&(n+='<div class="match-section"><h4>Passende Matches</h4>',n+=t.map(i=>tt(i,!0)).join(""),n+="</div>"),e.length>0&&(n+='<div class="match-section"><h4>Unpassend (Hard Facts)</h4>',n+=e.map(i=>tt(i,!1)).join(""),n+="</div>"),n}function tt(t,e){const{profile:n,matchResult:i,distanceText:s}=t,a=gn(i.score);let r="";if(!e&&i.failReason){const c={age_preference:"🎂",gender_preference:"⚧️",time_overlap:"⏰",same_group:"👥"},l={age_preference:"Alter-Präferenz",gender_preference:"Geschlecht-Präferenz",time_overlap:"Keine Zeit-Überschneidung",same_group:"Gleiche Gruppe"},d=c[i.failReason]||"⚠️",u=l[i.failReason]||i.failReason;let f="";i.failDetails&&(f=`<div class="reason-details">${Te(i.failDetails)}</div>`),r=`
      <div class="reason-box">
        <span class="reason-icon">${d}</span>
        <span class="reason-label">${u}</span>
        ${f}
      </div>
    `}let o="";return e&&i.positiveFactors&&i.positiveFactors.length>0&&(o=`
      <div class="positive-factors">
        ${i.positiveFactors.slice(0,2).map(c=>`<span class="factor">✓ ${Te(c)}</span>`).join("")}
      </div>
    `),`
    <div class="match-item ${e?"":"incompatible"}" data-profile-id="${n.id}">
      <div class="stars">${e?a:"---"}</div>
      <div class="info">
        <div class="name">${Te(n.name)}</div>
        <div class="match-meta">
          ${s?`<span class="distance">📍 ${s}</span>`:""}
        </div>
        ${o}
        ${r}
      </div>
    </div>
  `}function gn(t){let e="";for(let n=0;n<5;n++)e+=`<span class="star ${n<t?"":"empty"}">★</span>`;return e}function pn(t){const e=he(t);!e||!M||window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:M,profile2:e}}))}function bn(){const t=[],e=[],n=[];for(const i of ee)i.matchResult.compatible?(t.push(i.profile.id),i.matchResult.score>=4&&n.push(i.profile.id)):e.push(i.profile.id);Qt(t,e,n)}function Te(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}let te=null;function wn(){const t=document.getElementById("importModal"),e=document.getElementById("importBtn"),n=document.getElementById("closeImportModal"),i=document.getElementById("pasteClipboard"),s=document.getElementById("dropZone"),a=document.getElementById("fileInput"),r=document.getElementById("cancelImport"),o=document.getElementById("confirmImport"),c=document.getElementById("importPreview");e==null||e.addEventListener("click",()=>nt()),n==null||n.addEventListener("click",()=>Ae()),t==null||t.addEventListener("click",l=>{l.target===t&&Ae()}),i==null||i.addEventListener("click",async()=>{try{const l=await navigator.clipboard.readText();Be(l)}catch{alert("Fehler beim Lesen der Zwischenablage. Bitte erlaube den Zugriff.")}}),s==null||s.addEventListener("click",()=>a==null?void 0:a.click()),s==null||s.addEventListener("dragover",l=>{l.preventDefault(),s.classList.add("dragover")}),s==null||s.addEventListener("dragleave",()=>{s.classList.remove("dragover")}),s==null||s.addEventListener("drop",l=>{var u;l.preventDefault(),s.classList.remove("dragover");const d=(u=l.dataTransfer)==null?void 0:u.files[0];d&&it(d)}),a==null||a.addEventListener("change",()=>{var d;const l=(d=a.files)==null?void 0:d[0];l&&it(l)}),r==null||r.addEventListener("click",()=>{te=null,c&&(c.hidden=!0)}),o==null||o.addEventListener("click",()=>{if(te)try{const l=qt(te);alert(`${l} neue Profile importiert!`),Ae()}catch(l){alert("Fehler beim Import: "+l.message)}}),window.addEventListener("import-from-clipboard",l=>{const d=l;nt(),Be(d.detail)})}function nt(){const t=document.getElementById("importModal"),e=document.getElementById("importPreview");t==null||t.classList.add("visible"),e&&(e.hidden=!0),te=null}function Ae(){const t=document.getElementById("importModal");t==null||t.classList.remove("visible"),te=null}function it(t){if(!t.name.endsWith(".json")){alert("Bitte eine JSON-Datei auswählen.");return}const e=new FileReader;e.onload=n=>{var s;const i=(s=n.target)==null?void 0:s.result;Be(i)},e.onerror=()=>{alert("Fehler beim Lesen der Datei.")},e.readAsText(t)}function Be(t){try{let e;if(t.includes("SWAF_PROFILE_START")?e=vn(t):e=JSON.parse(t),!e.profiles||!Array.isArray(e.profiles))throw new Error("Ungültiges Format: profiles Array nicht gefunden");te=e,yn(e)}catch(e){alert("Fehler beim Verarbeiten der Daten: "+e.message)}}function vn(t){const e=[],n=/SWAF_PROFILE_START([\s\S]*?)SWAF_PROFILE_END/g;let i;for(;(i=n.exec(t))!==null;)try{const s=JSON.parse(i[1].trim());e.push({id:crypto.randomUUID(),url:s.url||"",name:s.name||"Unbekannt",pageType:s.pageType||"Hauptprofil",timestamp:s.timestamp||Date.now(),fields:s.fields||[]})}catch{}return{version:"1.0",exportedAt:new Date().toISOString(),profiles:e}}function yn(t){const e=document.getElementById("importPreview"),n=document.getElementById("previewCount"),i=document.getElementById("previewList");!e||!n||!i||(n.textContent=String(t.profiles.length),i.innerHTML=t.profiles.slice(0,10).map(s=>`<div class="preview-item">${En(s.name)} (${s.fields.length} Felder)</div>`).join(""),t.profiles.length>10&&(i.innerHTML+=`<div class="preview-item">... und ${t.profiles.length-10} weitere</div>`),e.hidden=!1)}function En(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const Ge="https://api.swaf.koeln/ollama",kn="ollama",Ln="Tandem2026Matcher";function Fe(){return{"Content-Type":"application/json",Authorization:"Basic "+btoa(`${kn}:${Ln}`)}}async function pt(){try{console.log("🤖 Prüfe Ollama-Verfügbarkeit...");const t=await fetch(`${Ge}/api/tags`,{method:"GET",headers:Fe(),signal:AbortSignal.timeout(5e3)});return console.log(`🤖 Ollama Response: ${t.status} ${t.statusText}`),t.ok}catch(t){return console.warn("🤖 Ollama nicht erreichbar:",t),!1}}async function bt(){var t;try{const e=await fetch(`${Ge}/api/tags`,{headers:Fe()});return e.ok?((t=(await e.json()).models)==null?void 0:t.map(i=>i.name))||[]:[]}catch{return[]}}const Ie="mistral:7b";async function wt(){const t=await bt();return t.length===0?Ie:t.some(e=>e.includes("mistral"))?t.find(e=>e.includes("mistral"))||Ie:t[0]||Ie}const st={hobbys:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Hobby-Angaben und schreibe, was beide gemeinsam haben oder wie sie die Hobbies verbinden können.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "gemeinsam"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- NIEMALS "Die erste Person" oder "Die zweite Person"!
- Keine Emojis
- Locker und freundlich, nicht förmlich

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,freizeit:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Freizeit-Angaben und schreibe, was beide gemeinsam machen können.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "gemeinsam"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis
- Locker und freundlich

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,interessen:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Interessen und schreibe, was beide verbindet.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "gemeinsam"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis
- Locker und freundlich

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,sprachen:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Sprachkenntnisse und schreibe, wie beide miteinander kommunizieren können.

REGELN:
- Schreibe 2-3 Sätze (100-200 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,beruf:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Berufs-Angaben und schreibe, was beide beruflich verbindet oder warum die Unterschiede spannend sind.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis
- Locker und freundlich

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,vorher:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Angaben zu früheren Tätigkeiten und schreibe, was beide verbindet oder warum die unterschiedlichen Wege interessant sind.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euer Weg", "eure Erfahrungen"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,zukunft:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Zukunftspläne und schreibe, wie beide voneinander profitieren können.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "eure Pläne", "gemeinsam"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,tandem_motivation:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Motivationen fürs Tandem-Programm und schreibe, warum sich die Motivationen gut ergänzen.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "eure Motivation"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,freundschaft_werte:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Werte-Angaben und schreibe, warum sich die Vorstellungen gut ergänzen.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "euch beiden"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,events:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Event-/Aktivitäten-Angaben und schreibe, was beide gemeinsam unternehmen können.

REGELN:
- Schreibe 2-3 Sätze (150-250 Zeichen)
- Sprich beide direkt an mit "Ihr könnt", "gemeinsam", "zusammen"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,verfuegbarkeit:`Du schreibst einen freundlichen Text für zwei Tandem-Partner. Analysiere die Verfügbarkeits-Angaben und mache einen konkreten Vorschlag für ein erstes Treffen.

REGELN:
- Schreibe 2-3 Sätze mit einem konkreten Zeitvorschlag (Wochentag/Tageszeit)
- Sprich beide direkt an mit "Ihr könntet", "euer erstes Treffen"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`,default:`Du schreibst einen freundlichen Text für zwei Tandem-Partner bei "Start with a Friend". Analysiere die Antworten zur Frage "{Frage}" und schreibe, was beide verbindet.

REGELN:
- Schreibe 1-2 Sätze (100-200 Zeichen)
- Sprich beide direkt an mit "Ihr", "euch", "gemeinsam"
- NIEMALS "Person 1" oder "Person 2" schreiben!
- Keine Emojis
- Wenn keine Gemeinsamkeit erkennbar: antworte nur "---"

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Text:`};function Sn(t){const e=t.toLowerCase();return e.includes("hobby")||e.includes("hobbies")||e.includes("hobbys")?"hobbys":e.includes("freizeit")||e.includes("was machst du gerne")?"freizeit":e.includes("interesse")||e.includes("themen")?"interessen":e.includes("sprache")||e.includes("sprichst")?"sprachen":e.includes("beruf")||e.includes("arbeit")||e.includes("job")||e.includes("was machst du gerade")?"beruf":e.includes("vorher")||e.includes("früher")||e.includes("gelernt")||e.includes("was hast du")?"vorher":e.includes("zukunft")||e.includes("plan")||e.includes("ziel")||e.includes("vorhaben")?"zukunft":e.includes("warum")&&(e.includes("swaf")||e.includes("tandem")||e.includes("mitmachen"))?"tandem_motivation":e.includes("wichtig")&&(e.includes("freund")||e.includes("wert"))?"freundschaft_werte":e.includes("event")||e.includes("veranstaltung")||e.includes("unternehmen")||e.includes("aktivität")?"events":e.includes("zeit")||e.includes("wann")||e.includes("verfügbar")||e.includes("treffen")||e.includes("erreichbar")?"verfuegbarkeit":"default"}function vt(t,e,n){const i=Sn(t);return(st[i]||st.default).replace("{Frage}",t).replace("{Antwort1}",e).replace("{Antwort2}",n)}async function yt(t,e,n,i){var r;const s=await wt();if(!s)return null;const a=vt(t,e,n);try{const o=await fetch(`${Ge}/api/generate`,{method:"POST",headers:Fe(),body:JSON.stringify({model:s,prompt:a,stream:!1,options:{temperature:.7,num_predict:150}})});if(!o.ok)return console.warn("Ollama API error:",o.status),null;const l=((r=(await o.json()).response)==null?void 0:r.trim())||null;return!l||l==="---"||l.includes("keine Gemeinsamkeit")||l.includes("keine erkennbare")?null:l.replace(/^["']|["']$/g,"").trim()}catch(o){return console.warn("Ollama generation failed:",o),null}}async function Et(){if(!await pt())return{available:!1,model:null,models:[]};const e=await bt();return{available:!0,model:await wt(),models:e}}let w=[],N="",R="",x=new Set;const $n='Schreibe hierzu einen kurzen Text. Die Frage zu den Antworten lautet {Frage}. Schreibe, wie die Antworten zusammenpassen könnten bzw. gebe Beispiele aus. Hier die Antworten: Person 1 - {Antwort1}, Person 2 - {Antwort2}. Schreibe den Text nach diesem Beispiel: "Ihr habt beide angegeben, dass ihr gerne kocht - ob mit Freund*innen oder alleine. Also los! Probiert doch einmal gemeinsam neue Rezepte. Außerdem geht ihr beide gerne Spazieren. Nach dem Essen sollst du Ruhn, oder 1.000 Schritte tun. Also habt ihr ja quasi schon einen Tagesplan ;) Weil ihr beide gerne auch kulturelle Dinge macht, wie in das Theater/Museum/oder auf andere Kulturveranstaltungen geht - schaut doch mal auf rausgegangen.de was es in Köln so die nächsten Tage gibt. Oder guckt bei uns im Eventportal: www.startwithafriend.de/events" - Nenne KEINE Namen oder andere Personenbezeichnungen.',qe=["Person","Sprachen & Herkunft","Beruf & Bildung","Hobbys & Interessen","Tandem-Wünsche","Verfügbarkeit","Sonstiges"],Mn=["vermittler","durchgeführt von","status","terminart","anmeldestatus","bearbeitungsstatus","infoabend","infonachmittag","aufnahmegespräch datum","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","wie wirkt die person","eindruck","einschätzung","bewertung","nächste schritte","follow-up","user-id","profil-id","teilnehmer-id","women_kpi","kpi","integrationskurs","besuchst du gerade einen integrationskurs","vorgeschlagene termine","suggested_appointments","telefonnummer","phone_number","telefon","responsible_user","responsible","registration_interview","appointment_type","appointment_info","region","department_region","department","process_history","process_current_step","flucht","einwandungserfahrung","immigration_experience","create_uid","existing_tandem_count","tandem_count","birthday","geburtstag","geburtsdatum","group","gruppe","e-mail","email","e-mail-adresse","emailadresse","nachname","last_name","lastname","familienname","full_name","fullname","vollständiger name","datum/uhrzeit","datum uhrzeit","anmeldedatum","registrierungsdatum"],Tn=["name","full name"];function An(t){const e=t.toLowerCase();return e.includes("name")||e.includes("alter")||e.includes("geschlecht")||e.includes("geboren")||e.includes("plz")||e.includes("postleitzahl")?"Person":e.includes("sprache")||e.includes("herkunft")||e.includes("land")||e.includes("deutschland")||e.includes("seit wann")?"Sprachen & Herkunft":e.includes("beruf")||e.includes("arbeit")||e.includes("studium")||e.includes("studiert")||e.includes("abschluss")||e.includes("branche")||e.includes("was machst du gerade")||e.includes("was hast du vorher gemacht")||e.includes("was hast du gelernt")||e.includes("in zukunft")||e.includes("zukunft gerne machen")?"Beruf & Bildung":e.includes("hobby")||e.includes("freizeit")||e.includes("interesse")||e.includes("ausprobieren")||e.includes("was machst du gerne")||e.includes("freundschaft")||e.includes("wichtig")||e.includes("event")||e.includes("anbieten")||e.includes("themen")||e.includes("community")||e.includes("unternehmen")?"Hobbys & Interessen":e.includes("tandem")||e.includes("swaf")||e.includes("mitmachen")||e.includes("warum")||e.includes("vorstellung")||e.includes("geschlecht")&&e.includes("partner")?"Tandem-Wünsche":e.includes("zeit")||e.includes("treffen")||e.includes("wann")||e.includes("erreichen")||e.includes("kontakt")||e.includes("bewegst")?"Verfügbarkeit":"Sonstiges"}function In(t){const e=t.toLowerCase().trim();return Tn.includes(e)?!0:Mn.some(n=>e.includes(n))}function Ne(t){return t?["übersprungen","keine angabe","k.a.","n/a","-","","egal","keine","null","undefined"].includes(t.toLowerCase().trim()):!0}const Pn=["name","vorname","nachname","plz","postleitzahl","standort","ort","adresse","wohnort","geschlecht","gender","alter","age","geburt","in deutschland geboren","in welchem land","herkunftsland","geburtsland","woher kommst du","country","altersunterschied","geschlechterpräferenz","alterspräferenz"];function xn(t){const e=t.toLowerCase();return Pn.some(n=>e.includes(n))}function kt(t,e,n){N=at(e.name),R=at(n.name);const i=new Map;function s(r,o,c){if(In(r)||!o||Ne(o))return;const l=Cn(r),d=i.get(l);d?(c?d.answer1?d.answer1!==o&&(d.answer1+="; "+o):d.answer1=o:d.answer2?d.answer2!==o&&(d.answer2+="; "+o):d.answer2=o,d.mergedQuestions.includes(r)||d.mergedQuestions.push(r)):i.set(l,{displayQuestion:r,answer1:c?o:"",answer2:c?"":o,mergedQuestions:[r]})}for(const r of e.fields)s(r.question,r.answer||"",!0);for(const r of n.fields)s(r.question,r.answer||"",!1);w=[];let a=0;for(const[r,o]of i){if(!o.answer1&&!o.answer2)continue;const c=Bn(r,o.displayQuestion),l=pe(c,o.answer1,o.answer2),d=l.length>0||o.answer1&&o.answer2;w.push({id:`row-${a}`,question:c,answer1:o.answer1,answer2:o.answer2,comment:l,selected:!1,included:d,collapsed:!d,category:An(c)}),a++}w.sort((r,o)=>{const c=qe.indexOf(r.category),l=qe.indexOf(o.category);return c!==l?c-l:r.included!==o.included?r.included?-1:1:r.question.localeCompare(o.question)}),x.clear(),ge(t);for(const r of w)(r.question.toLowerCase().includes("plz")||r.question.toLowerCase().includes("postleitzahl"))&&r.answer1&&r.answer2&&Hn(r.answer1,r.answer2,r.id)}const zn=[{key:"alter",patterns:["alter","age","wie alt bist du","wie alt","dein alter","geburtsjahr"]},{key:"geschlecht",patterns:["geschlecht","gender","dein geschlecht","welches geschlecht"]},{key:"altersunterschied",patterns:["altersunterschied","alterspräferenz","age_difference","max_age_difference","maximaler altersunterschied","altersunterschied zum tandempartner"]},{key:"geschlechterpräferenz",patterns:["geschlechterpräferenz","gender_preference","geschlecht des tandems","geschlecht tandempartner","welches geschlecht soll","gewünschtes geschlecht"]},{key:"vorname",patterns:["vorname","firstname","first_name","first name"]},{key:"plz",patterns:["plz","postleitzahl","postal code","zip","zipcode","deine plz"]},{key:"hobbys",patterns:["hobbys","hobbies","hobby"]},{key:"freizeit",patterns:["freizeit","freizeitaktivitäten"]},{key:"interessen",patterns:["interessen","interests"]},{key:"sprachen",patterns:["sprachen","languages","sprache","welche sprachen sprichst du","welche sprachen"]},{key:"herkunftsland",patterns:["herkunftsland","herkunft","woher kommst du","aus welchem land","country"]},{key:"seit_wann_deutschland",patterns:["seit wann in deutschland","seit wann bist du in deutschland","wie lange in deutschland","in deutschland seit"]}],rt={vorname:"Vorname",alter:"Alter",geschlecht:"Geschlecht",plz:"PLZ",hobbys:"Hobbys",freizeit:"Freizeitaktivitäten",interessen:"Interessen",sprachen:"Sprachen",herkunftsland:"Herkunftsland",seit_wann_deutschland:"Seit wann in Deutschland",altersunterschied:"Maximaler Altersunterschied",geschlechterpräferenz:"Geschlecht des Tandempartners"};function Cn(t){const e=t.toLowerCase().replace(/[?!.,:*_-]/g," ").replace(/\s+/g," ").trim(),n=[...zn].sort((i,s)=>{const a=Math.max(...i.patterns.map(o=>o.length));return Math.max(...s.patterns.map(o=>o.length))-a});for(const i of n)for(const s of i.patterns)if(e===s||e.startsWith(s+" ")||e.endsWith(" "+s)||e.includes(" "+s+" "))return i.key;return e}function Bn(t,e){return rt[t]?rt[t]:e}function ge(t){const e=x.size,n=w.filter(a=>!a.hidden),i=n.filter(a=>a.included).length,s=new Map;for(const a of n)s.has(a.category)||s.set(a.category,[]),s.get(a.category).push(a);t.innerHTML=`
    <div class="tandem-editor">
      <div class="editor-toolbar">
        <button class="btn btn-sm" id="mergeRowsBtn" ${e<2?"disabled":""}>
          Zusammenführen (${e})
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
        ${qe.map(a=>{const r=s.get(a);if(!r||r.length===0)return"";const o=r.filter(c=>c.included).length;return`
            <div class="category-section">
              <div class="category-header">
                <span>${a}</span>
                <span class="category-count">${o}/${r.length}</span>
              </div>
              ${r.map(c=>qn(c)).join("")}
            </div>
          `}).join("")}
      </div>

      <div class="editor-preview">
        <div class="preview-header">
          <strong>E-Mail-Vorschau (${i} Felder):</strong>
          <button class="btn btn-sm" id="copyEmailBtn">📋 Kopieren</button>
        </div>
        <div class="preview-content" id="emailPreview">
          ${He()}
        </div>
      </div>
    </div>
  `,Nn(t)}function qn(t){const e=x.has(t.id),n=t.comment&&t.comment.length>0;return`
    <div class="editor-row ${e?"selected":""} ${t.included?"included":"excluded"} ${t.collapsed?"collapsed":""}" data-row-id="${t.id}">
      <div class="row-header">
        <label class="include-toggle" title="In E-Mail einschließen">
          <input type="checkbox" class="include-checkbox" data-row-id="${t.id}" ${t.included?"checked":""}>
          <span class="toggle-slider"></span>
        </label>
        <div class="row-question" data-row-id="${t.id}">
          <span class="collapse-icon">${t.collapsed?"▸":"▾"}</span>
          <span class="question-text">${p(t.question)}</span>
          ${n?'<span class="has-comment-indicator">✓</span>':""}
        </div>
        <div class="row-quick-actions">
          <input type="checkbox" class="merge-checkbox" data-row-id="${t.id}" ${e?"checked":""} title="Für Zusammenführen auswählen">
        </div>
      </div>

      <div class="row-details ${t.collapsed?"hidden":""}">
        <div class="row-answers">
          <div class="answer-cell">
            <div class="answer-label">${p(N)}:</div>
            <textarea
              class="answer-input answer1-input"
              data-row-id="${t.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${p(t.answer1)}</textarea>
          </div>
          <div class="answer-cell">
            <div class="answer-label">${p(R)}:</div>
            <textarea
              class="answer-input answer2-input"
              data-row-id="${t.id}"
              placeholder="Antwort eingeben..."
              rows="2"
            >${p(t.answer2)}</textarea>
          </div>
        </div>

        <div class="row-comment">
          <textarea
            class="comment-input"
            data-row-id="${t.id}"
            placeholder="Gemeinsamkeit / Kommentar eingeben..."
            rows="2"
          >${p(de(t.comment))}</textarea>
          ${Qn(t.comment)}
          <div class="comment-buttons">
            <button class="btn-icon smart-suggest" data-row-id="${t.id}" title="Lokaler Textvorschlag">💡</button>
            <button class="btn-icon ai-assist" data-row-id="${t.id}" title="KI-Unterstützung (ChatGPT/Claude)">🤖</button>
          </div>
        </div>
      </div>
    </div>
  `}function Nn(t){var i,s,a;t.querySelectorAll(".include-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;const d=w.find(u=>u.id===l);if(d){d.included=c.checked,J(t);const u=t.querySelector(`.editor-row[data-row-id="${l}"]`);u&&(u.classList.toggle("included",d.included),u.classList.toggle("excluded",!d.included))}})}),t.querySelectorAll(".merge-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;c.checked?x.add(l):x.delete(l);const d=t.querySelector("#mergeRowsBtn");d&&(d.disabled=x.size<2,d.textContent=`⊕ Zusammenführen (${x.size})`)})}),t.querySelectorAll(".row-question").forEach(r=>{r.addEventListener("click",o=>{const c=r.dataset.rowId;if(!c)return;const l=w.find(d=>d.id===c);if(l){l.collapsed=!l.collapsed;const d=t.querySelector(`.editor-row[data-row-id="${c}"]`);if(d){d.classList.toggle("collapsed",l.collapsed);const u=d.querySelector(".row-details"),f=d.querySelector(".collapse-icon");u&&u.classList.toggle("hidden",l.collapsed),f&&(f.textContent=l.collapsed?"▸":"▾")}}})});function e(r){r.style.height="auto",r.style.height=Math.min(r.scrollHeight,200)+"px"}t.querySelectorAll(".answer1-input").forEach(r=>{const o=r;e(o),o.addEventListener("input",c=>{const l=c.target;e(l);const d=l.dataset.rowId;if(!d)return;const u=w.find(f=>f.id===d);u&&(u.answer1=l.value,J(t))})}),t.querySelectorAll(".answer2-input").forEach(r=>{const o=r;e(o),o.addEventListener("input",c=>{const l=c.target;e(l);const d=l.dataset.rowId;if(!d)return;const u=w.find(f=>f.id===d);u&&(u.answer2=l.value,J(t))})}),t.querySelectorAll(".comment-input").forEach(r=>{e(r)}),t.querySelectorAll(".comment-input").forEach(r=>{r.addEventListener("input",o=>{const c=o.target,l=c.dataset.rowId;if(!l)return;const d=w.find(u=>u.id===l);if(d){if(d.comment=c.value,c.value.length>0&&!d.included){d.included=!0;const u=t.querySelector(`.include-checkbox[data-row-id="${l}"]`);u&&(u.checked=!0)}J(t)}})}),t.querySelectorAll(".smart-suggest").forEach(r=>{r.addEventListener("click",async o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=w.find(u=>u.id===c);if(!l)return;l.comment=pe(l.question,l.answer1,l.answer2);const d=t.querySelector(`.comment-input[data-row-id="${c}"]`);if(d&&(d.value=l.comment),J(t),(!l.comment||l.comment.length<10)&&l.answer1&&l.answer2&&await pt()){r.textContent="...";const f=await yt(l.question,l.answer1,l.answer2);f&&(l.comment=f,l.included=!0,d&&(d.value=l.comment),J(t)),r.textContent="💡"}})}),t.querySelectorAll(".ai-assist").forEach(r=>{r.addEventListener("click",o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=w.find(d=>d.id===c);l&&Un(l)})}),(i=t.querySelector("#mergeRowsBtn"))==null||i.addEventListener("click",()=>{Rn(),ge(t)}),(s=t.querySelector("#regenerateBtn"))==null||s.addEventListener("click",()=>{for(const r of w)r.comment=pe(r.question,r.answer1,r.answer2),r.included=r.comment.length>0;ge(t)});const n=t.querySelector("#ollamaBtn");Et().then(r=>{r.available?(n.disabled=!1,n.textContent="KI generieren",n.title="Mit Mistral KI generieren"):(n.textContent="KI nicht verfügbar",n.title="KI-Server nicht erreichbar")}).catch(()=>{n.textContent="KI nicht verfügbar",n.title="Fehler bei der Verbindung zum KI-Server"}),n==null||n.addEventListener("click",async()=>{n.disabled=!0,n.textContent="KI läuft...";const r=w.filter(o=>o.answer1&&o.answer2&&!xn(o.question)).map(o=>({question:o.question,answer1:o.answer1,answer2:o.answer2,rowId:o.id}));Vn(r,t,()=>{n.disabled=!1,n.textContent="KI generieren"})}),(a=t.querySelector("#copyEmailBtn"))==null||a.addEventListener("click",()=>{const r=je(),o=Jn();if(navigator.clipboard&&typeof ClipboardItem<"u"){const c=[new ClipboardItem({"text/html":new Blob([o],{type:"text/html"}),"text/plain":new Blob([r],{type:"text/plain"})})];navigator.clipboard.write(c).then(()=>{const l=t.querySelector("#copyEmailBtn");l&&(l.textContent="✓ Kopiert (Word-kompatibel)!",setTimeout(()=>l.textContent="📋 Kopieren",2e3))}).catch(()=>{navigator.clipboard.writeText(r)})}else navigator.clipboard.writeText(r).then(()=>{const c=t.querySelector("#copyEmailBtn");c&&(c.textContent="✓ Kopiert!",setTimeout(()=>c.textContent="📋 Kopieren",2e3))})})}function Rn(){if(x.size<2)return;const t=Array.from(x),e=t[0],n=w.find(s=>s.id===e);if(!n)return;const i=t.slice(1);for(const s of i){const a=w.find(r=>r.id===s);a&&(n.question+=" + "+a.question,a.answer1&&a.answer1!==n.answer1&&(n.answer1=n.answer1?n.answer1+"; "+a.answer1:a.answer1),a.answer2&&a.answer2!==n.answer2&&(n.answer2=n.answer2?n.answer2+"; "+a.answer2:a.answer2),a.comment&&(n.comment=n.comment?n.comment+"; "+a.comment:a.comment),a.hidden=!0,n.mergedWith||(n.mergedWith=[]),n.mergedWith.push(a.question.substring(0,30)))}n.comment=pe(n.question,n.answer1,n.answer2),x.clear()}function pe(t,e,n){const i=t.toLowerCase(),s=(e||"").toLowerCase().trim(),a=(n||"").toLowerCase().trim();if(!s&&!a||Ne(s)&&Ne(a))return"";if(s===a&&s.length>2)return i.includes("wichtig")||i.includes("freundschaft")?`Gemeinsamer Wert: ${e}`:i.includes("studium")&&s.includes("ja")?"Beide haben studiert - das verbindet!":`Übereinstimmung: ${e}`;if(i.includes("alter")&&!i.includes("unterschied")){const r=parseInt(s),o=parseInt(a);if(!isNaN(r)&&!isNaN(o)){const c=Math.abs(r-o);return c===0?"Genau gleich alt!":c<=3?`Nur ${c} Jahre Unterschied - perfekt!`:c<=7?`${c} Jahre Unterschied - passt gut`:c<=15?`${c} Jahre Unterschied - verschiedene Perspektiven`:`${c} Jahre Unterschied`}}return i.includes("sprache")||i.includes("sprichst")?Dn(e,n):i.includes("hobby")||i.includes("freizeit")||i.includes("interesse")||i.includes("ausprobieren")||i.includes("was machst du gerne")||i.includes("event")||i.includes("anbieten")||i.includes("unternehmen")||i.includes("themen")?_n(e,n):i.includes("beruf")||i.includes("arbeit")||i.includes("studium")||i.includes("gelernt")||i.includes("zukunft")||i.includes("branche")||i.includes("was machst du gerade")||i.includes("vorher gemacht")?jn(e,n):i.includes("zeit")||i.includes("treffen")||i.includes("wann")||i.includes("erreichbar")?On(e,n):i.includes("wichtig")||i.includes("freundschaft")||i.includes("erwartung")?Gn(e,n):i.includes("plz")||i.includes("postleitzahl")?Fn(e,n):i.includes("herkunft")||i.includes("land")||i.includes("woher")?Kn(e,n):i.includes("tandem")||i.includes("warum")||i.includes("mitmachen")||i.includes("swaf")||i.includes("start with a friend")?Wn(e,n):i.includes("geschlecht")&&(i.includes("partner")||i.includes("tandem"))?Zn(e,n):Lt(e,n)}function Dn(t,e){const n=t.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),i=e.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),s=n.filter(a=>i.some(r=>a.includes(r)||r.includes(a)));return s.length>0?`Gemeinsame Sprachen: ${[...new Set(s)].join(", ")}`:""}function _n(t,e){const n=t.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),i=e.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),s=[["sport","fitness","training","gym","joggen","laufen"],["wandern","hiking","spazieren","natur","wald"],["kochen","backen","essen","kulinarisch","rezept"],["musik","konzert","instrument","singen"],["lesen","bücher","literatur"],["reisen","urlaub","travel","länder"],["film","kino","serien","netflix","movie"],["kunst","museum","malen","zeichnen","kreativ"],["tanzen","dance","salsa","bachata","tanz"],["fahrrad","radfahren","cycling","bike"],["foto","fotografieren","photography","kamera"],["café","kaffee","coffee"],["sprache","lernen","language"],["garten","pflanzen","garden"],["yoga","meditation","entspannung"],["schwimmen","baden","swimming"]],a=[];for(const o of n)for(const c of i){if(o.includes(c)||c.includes(o)){a.push(o.length>c.length?o:c);continue}for(const l of s){const d=l.some(f=>o.includes(f)),u=l.some(f=>c.includes(f));d&&u&&a.push(l[0])}}const r=[...new Set(a)];return r.length>0?r.length===1?`Gemeinsames Hobby: ${r[0]}`:`Gemeinsame Hobbys: ${r.slice(0,4).join(", ")}`:""}function On(t,e){const n=["morgens","mittags","nachmittags","abends","wochenende","unter der woche","flexibel"],i=t.toLowerCase(),s=e.toLowerCase(),a=n.filter(r=>i.includes(r)&&s.includes(r));return a.includes("flexibel")||a.length>=2?"Zeitlich flexibel - passt gut!":a.length>0?`Gemeinsame Zeit: ${a.join(", ")}`:""}function Gn(t,e){const n=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","kommunikation"],i=t.toLowerCase(),s=e.toLowerCase(),a=n.filter(r=>i.includes(r)&&s.includes(r));return a.length>0?`Gemeinsame Werte: ${a.join(", ")}`:""}function Fn(t,e){const n=be(t),i=be(e);return!n||!i?"":n===i?"Gleiche PLZ":n.substring(0,2)===i.substring(0,2)?"Gleiche Region - Entfernung wird berechnet...":"Entfernung wird berechnet..."}async function Hn(t,e,n,i){const s=be(t),a=be(e);if(!s||!a)return;const r=w.find(c=>c.id===n);if(!r)return;const o=await Gt(s,a);if(o){const c=await U(s),l=await U(a);let d=Ft(o);if(c&&l){const g=Ht(c,l);d+=` [🗺️](${g.google})`}r.comment=d,r.included=!0;const u=document.querySelector(`.comment-input[data-row-id="${n}"]`);u&&(u.value=de(d));const f=document.querySelector(`.include-checkbox[data-row-id="${n}"]`);f&&(f.checked=!0);const h=document.querySelector("#emailPreview");h&&(h.innerHTML=He())}}function be(t){const e=t.match(/\b(\d{5})\b/);return e?e[1]:null}function jn(t,e){const n=t.toLowerCase(),i=e.toLowerCase(),s=[["student","studier","uni","hochschule","ausbildung"],["arbeit","beruf","job","angestellt"],["selbstständig","freelance","freiberuflich"],["suche","arbeitslos","orientierung"],["it","software","computer","programmier"],["sozial","pflege","gesundheit","medizin"],["lehrer","pädagog","bildung","schule"],["ingenieur","technik","maschinenbau"],["wirtschaft","bwl","marketing","vertrieb"],["kunst","design","kreativ","musik"]],a=[];for(const r of s){const o=r.some(l=>n.includes(l)),c=r.some(l=>i.includes(l));o&&c&&a.push(r[0])}return a.length>0?`Ähnlicher Bereich: ${a.join(", ")}`:(n.includes("student")||n.includes("studier"))&&(i.includes("student")||i.includes("studier"))?"Beide studieren - viel gemeinsam!":Lt(t,e)}function Kn(t,e){const n=t.toLowerCase(),i=e.toLowerCase(),s=["deutschland","syrien","iran","irak","afghanistan","türkei","ukraine","eritrea","somalia","nigeria","pakistan","indien","china","russland"];for(const a of s)if(n.includes(a)&&i.includes(a))return`Beide haben Bezug zu ${a.charAt(0).toUpperCase()+a.slice(1)}`;return(n.includes("kultur")||n.includes("tradition"))&&(i.includes("kultur")||i.includes("tradition"))?"Beide interessiert an Kultur & Traditionen":""}function Wn(t,e){const n=t.toLowerCase(),i=e.toLowerCase(),s=[{keywords:["sprache","deutsch","lernen","verbessern"],text:"Beide wollen Sprachkenntnisse verbessern"},{keywords:["freund","kennenlernen","kontakt","leute"],text:"Beide suchen neue Kontakte"},{keywords:["kultur","austausch","integration"],text:"Beide wollen kulturellen Austausch"},{keywords:["helfen","unterstütz","begleiten"],text:"Gegenseitige Unterstützung ist wichtig"},{keywords:["spaß","unternehmung","aktivität"],text:"Beide wollen gemeinsam Spaß haben"}];for(const a of s){const r=a.keywords.some(c=>n.includes(c)),o=a.keywords.some(c=>i.includes(c));if(r&&o)return a.text}return""}function Zn(t,e){const n=t.toLowerCase(),i=e.toLowerCase();return(n.includes("egal")||n.includes("keine präferenz"))&&(i.includes("egal")||i.includes("keine präferenz"))?"Beide flexibel beim Geschlecht":""}function Lt(t,e){if(!t||!e)return"";const n=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","gerne","sehr","auch","aber","wenn","dann","noch","schon","kann","will","muss","soll","hat","haben","sein","wird","sind","ist","nicht","mehr","viel","viele","alle","diese","dies","dem","den","des"]),i=t.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!n.has(o)),s=e.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!n.has(o)),a=i.filter(o=>s.some(c=>o===c||o.length>4&&c.length>4&&(o.includes(c)||c.includes(o)))),r=[...new Set(a)];return r.length>=1?`Gemeinsam: ${r.slice(0,4).join(", ")}`:t.length>5&&e.length>5?"Beide haben geantwortet":""}function J(t){const e=t.querySelector("#emailPreview");e&&(e.innerHTML=He())}function He(){const e=w.filter(i=>i.included).filter(i=>i.answer1||i.answer2);let n=`
    <div class="email-intro">
      Hi <strong>${p(N)}</strong> und <strong>${p(R)}</strong>,<br><br>
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
          <th>${p(N)}</th>
          <th>${p(R)}</th>
          <th>Gemeinsamkeit</th>
        </tr>
      </thead>
      <tbody>
  `;for(const i of e){const s=Yn(i.comment);n+=`
      <tr>
        <td><strong>${p(i.question)}</strong></td>
        <td>${p(i.answer1)||"-"}</td>
        <td>${p(i.answer2)||"-"}</td>
        <td class="commonality">${s}</td>
      </tr>
    `}return n+=`
      </tbody>
    </table>
    <div class="email-outro">
      <br>Ich freue mich über eure Rückmeldung!
    </div>
  `,n}function Un(t,e){var a,r,o,c;const i=(localStorage.getItem("swaf_ai_prompt")||$n).replace("{Frage}",t.question).replace("{Antwort1}",t.answer1||"keine Angabe").replace("{Antwort2}",t.answer2||"keine Angabe"),s=document.createElement("div");s.className="ai-modal-overlay",s.innerHTML=`
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
          <textarea class="ai-prompt-text" readonly rows="6">${p(i)}</textarea>
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
  `,document.body.appendChild(s),(a=s.querySelector(".close-modal"))==null||a.addEventListener("click",()=>s.remove()),s.addEventListener("click",l=>{l.target===s&&s.remove()}),(r=s.querySelector(".ai-chatgpt"))==null||r.addEventListener("click",()=>{navigator.clipboard.writeText(i).then(()=>{window.open("https://chat.openai.com/","_blank"),s.remove(),Re("💬 ChatGPT geöffnet - Prompt in Zwischenablage kopiert!")})}),(o=s.querySelector(".ai-claude"))==null||o.addEventListener("click",()=>{navigator.clipboard.writeText(i).then(()=>{window.open("https://claude.ai/","_blank"),s.remove(),Re("🤖 Claude geöffnet - Prompt in Zwischenablage kopiert!")})}),(c=s.querySelector(".ai-copy-prompt"))==null||c.addEventListener("click",()=>{navigator.clipboard.writeText(i).then(()=>{const l=s.querySelector(".ai-copy-prompt");l.textContent="✓ Kopiert!",setTimeout(()=>l.textContent="📋 Nur Prompt kopieren",2e3)})})}function Re(t){let e=document.getElementById("successToast");e||(e=document.createElement("div"),e.id="successToast",e.className="success-toast",document.body.appendChild(e)),e.textContent=t,e.classList.add("visible"),setTimeout(()=>e==null?void 0:e.classList.remove("visible"),3e3)}function Vn(t,e,n){const i=t.map(h=>({...h,generated:"",status:"pending",selected:!0}));let s=!0,a=!1;const r=document.createElement("div");r.className="ai-modal-overlay";function o(){const h=i.filter(m=>m.status==="done").length;i.findIndex(m=>m.status==="generating");const g=i.filter(m=>m.selected&&m.status==="done").length;return`
      <div class="ai-modal ai-preview-modal ai-live-modal">
        <div class="ai-modal-header">
          <h3>KI-Generierung</h3>
          <div class="ai-progress-info">
            ${s?`<span class="ai-progress-spinner"></span> ${h}/${t.length} generiert`:`${h} Vorschläge generiert`}
          </div>
          <button class="close-modal">&times;</button>
        </div>
        <div class="ai-modal-body">
          <p class="ai-preview-intro">
            ${s?"<strong>Generiere Vorschläge...</strong> Du kannst bereits fertige Texte bearbeiten und auswählen.":`<strong>${h} Vorschläge generiert.</strong> Wähle aus, welche du übernehmen möchtest:`}
          </p>

          <div class="ai-preview-actions-top">
            <button class="btn btn-sm" id="selectAllBtn">Alle auswählen</button>
            <button class="btn btn-sm btn-outline" id="selectNoneBtn">Keine auswählen</button>
            ${s?'<button class="btn btn-sm btn-danger" id="stopGenerationBtn">Generation stoppen</button>':""}
          </div>

          <div class="ai-preview-list ai-live-list">
            ${i.map((m,v)=>`
              <div class="ai-preview-item ${m.status}" data-index="${v}">
                <label class="ai-preview-checkbox">
                  <input type="checkbox" ${m.selected?"checked":""} ${m.status!=="done"?"disabled":""} data-index="${v}">
                  <span class="checkmark"></span>
                </label>
                <div class="ai-preview-content">
                  <div class="ai-preview-question">${p(m.question)}</div>
                  <div class="ai-preview-answers">
                    <span class="answer-snippet" title="${p(m.answer1)}">${p(oe(m.answer1,30))}</span>
                    <span class="answer-vs">+</span>
                    <span class="answer-snippet" title="${p(m.answer2)}">${p(oe(m.answer2,30))}</span>
                  </div>
                  ${m.status==="pending"?'<div class="ai-preview-pending">Wartet...</div>':m.status==="generating"?'<div class="ai-preview-generating"><span class="ai-mini-spinner"></span> Generiere...</div>':m.status==="error"?'<div class="ai-preview-error">Fehler bei der Generierung</div>':`<textarea class="ai-preview-textarea" data-index="${v}" rows="3">${p(m.generated)}</textarea>`}
                  <details class="ai-item-prompt">
                    <summary>Prompt anzeigen</summary>
                    <pre class="ai-prompt-mini">${p(vt(m.question,m.answer1,m.answer2))}</pre>
                  </details>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="ai-preview-actions">
            <button class="btn btn-secondary" id="cancelPreviewBtn">Abbrechen</button>
            <button class="btn btn-primary" id="applyPreviewBtn" ${g===0?"disabled":""}>
              Ausgewählte übernehmen (<span id="selectedCount">${g}</span>)
            </button>
          </div>
        </div>
      </div>
    `}function c(){r.innerHTML=o(),l()}function l(){var h,g,m,v,D,W;(h=r.querySelector(".close-modal"))==null||h.addEventListener("click",()=>{a=!0,r.remove(),n()}),r.addEventListener("click",S=>{S.target===r&&(a=!0,r.remove(),n())}),(g=r.querySelector("#cancelPreviewBtn"))==null||g.addEventListener("click",()=>{a=!0,r.remove(),n()}),(m=r.querySelector("#stopGenerationBtn"))==null||m.addEventListener("click",()=>{a=!0,s=!1,c()}),(v=r.querySelector("#selectAllBtn"))==null||v.addEventListener("click",()=>{i.forEach(S=>{S.status==="done"&&(S.selected=!0)}),c()}),(D=r.querySelector("#selectNoneBtn"))==null||D.addEventListener("click",()=>{i.forEach(S=>S.selected=!1),c()}),r.querySelectorAll('.ai-preview-item input[type="checkbox"]').forEach(S=>{S.addEventListener("change",_=>{const T=_.target,V=parseInt(T.dataset.index||"0",10);i[V].selected=T.checked,d()})}),r.querySelectorAll(".ai-preview-textarea").forEach(S=>{S.addEventListener("input",_=>{const T=_.target,V=parseInt(T.dataset.index||"0",10);i[V].generated=T.value})}),(W=r.querySelector("#applyPreviewBtn"))==null||W.addEventListener("click",()=>{a=!0,u(),r.remove(),n()})}function d(){const h=i.filter(v=>v.selected&&v.status==="done").length,g=r.querySelector("#selectedCount");g&&(g.textContent=String(h));const m=r.querySelector("#applyPreviewBtn");m&&(m.disabled=h===0)}function u(){let h=0;for(const g of i)if(g.selected&&g.status==="done"&&g.generated){const m=w.find(v=>v.id===g.rowId);m&&(m.comment=g.generated,m.included=!0,h++)}ge(e),h>0&&Re(`${h} KI-Vorschläge übernommen`)}r.innerHTML=o(),document.body.appendChild(r),l();async function f(){for(let h=0;h<i.length&&!a;h++){const g=i[h];g.status="generating",c();try{const m=await yt(g.question,g.answer1,g.answer2);if(a)break;m?(g.generated=m,g.status="done"):(g.status="error",g.selected=!1)}catch(m){console.warn("Generation error:",m),g.status="error",g.selected=!1}c()}s=!1,c()}f()}function je(){const e=w.filter(s=>s.included).filter(s=>s.answer1||s.answer2);let n=`Hi ${N} und ${R},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;const i={question:Math.max(10,...e.map(s=>s.question.length)),answer1:Math.max(N.length,...e.map(s=>(s.answer1||"-").length)),answer2:Math.max(R.length,...e.map(s=>(s.answer2||"-").length))};i.question=Math.min(i.question,30),i.answer1=Math.min(i.answer1,25),i.answer2=Math.min(i.answer2,25),n+=Q("Frage",i.question)+" | ",n+=Q(N,i.answer1)+" | ",n+=Q(R,i.answer2)+" | ",n+=`Gemeinsamkeit
`,n+="-".repeat(i.question)+"-+-",n+="-".repeat(i.answer1)+"-+-",n+="-".repeat(i.answer2)+"-+-",n+="-".repeat(20)+`
`;for(const s of e){const a=de(s.comment);n+=Q(oe(s.question,i.question),i.question)+" | ",n+=Q(oe(s.answer1||"-",i.answer1),i.answer1)+" | ",n+=Q(oe(s.answer2||"-",i.answer2),i.answer2)+" | ",n+=(a||"")+`
`}return n+=`
Ich freue mich über eure Rückmeldung!
`,n}function Q(t,e){return t.length>=e?t.substring(0,e):t+" ".repeat(e-t.length)}function oe(t,e){return t?t.length<=e?t:t.substring(0,e-2)+"..":""}function Jn(){const e=w.filter(i=>i.included).filter(i=>i.answer1||i.answer2);let n=`<!--StartFragment-->
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
  Hi <strong>${p(N)}</strong> und <strong>${p(R)}</strong>,<br><br>
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
      <th style="width: 25%;">${p(N)}</th>
      <th style="width: 25%;">${p(R)}</th>
      <th style="width: 25%;">Gemeinsamkeit</th>
    </tr>
  </thead>
  <tbody>
`;for(const i of e){const s=Xn(i.comment);n+=`    <tr>
      <td><strong>${p(i.question)}</strong></td>
      <td>${p(i.answer1)||"-"}</td>
      <td>${p(i.answer2)||"-"}</td>
      <td class="commonality">${s}</td>
    </tr>
`}return n+=`  </tbody>
</table>

<p><br>Ich freue mich über eure Rückmeldung!</p>
</body>
</html>
<!--EndFragment-->`,n}function St(){return w.filter(t=>t.included).map(t=>({question:t.question,answer1:t.answer1,answer2:t.answer2,commonality:t.comment}))}function at(t){if(!t||typeof t!="string")return"Partner*in";const e=t.match(/\(([^)]+)\)/);if(e){const i=e[1].trim().split(/[\s,]+/)[0];if(i&&i.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(i))return i}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(t)){const n=t.split(/[\s,]+/)[0];if(n&&n.length>1)return n}return"Partner*in"}function p(t){if(!t)return"";const e=document.createElement("div");return e.textContent=t,e.innerHTML}function Ke(t){if(!t)return null;const e=t.match(/\[🗺️\]\((https?:\/\/[^)]+)\)/);return e?e[1]:null}function de(t){return t?t.replace(/\s*\[🗺️\]\(https?:\/\/[^)]+\)/,"").trim():""}function Qn(t){const e=Ke(t);return e?`<a href="${e}" target="_blank" class="btn-icon map-link-btn" title="Route in Google Maps öffnen">🗺️</a>`:""}function Yn(t){if(!t)return"";const e=Ke(t);if(e){const n=de(t);return`${p(n)} <a href="${e}" target="_blank" class="map-link">🗺️ Route</a>`}return p(t)}function Xn(t){if(!t)return"";const e=Ke(t);if(e){const n=de(t);return`${p(n)} <a href="${e}" style="color: #009892;">🗺️ Route anzeigen</a>`}return p(t)}function ei(){ot(),window.addEventListener("tandems-updated",ot),window.addEventListener("create-match",i=>{const s=i;ii(s.detail.profile1,s.detail.profile2)}),window.addEventListener("edit-tandem",i=>{ri(i.detail.tandem)});const t=document.getElementById("closeMatchModal"),e=document.getElementById("cancelMatch"),n=document.getElementById("confirmMatch");t==null||t.addEventListener("click",De),e==null||e.addEventListener("click",De),n==null||n.addEventListener("click",si)}function ot(){const t=document.getElementById("tandemList");if(!t)return;const e=le();if(e.length===0){t.innerHTML='<p class="empty-state">Noch keine Tandems erstellt. Wähle zwei Profile aus, um ein Tandem zu erstellen.</p>';return}t.innerHTML=e.sort((n,i)=>new Date(i.created).getTime()-new Date(n.created).getTime()).map(n=>ni(n)).join(""),t.querySelectorAll(".delete-tandem").forEach(n=>{n.addEventListener("click",i=>{i.stopPropagation();const s=n.getAttribute("data-tandem-id");s&&confirm("Tandem wirklich löschen?")&&mt(s)})}),t.querySelectorAll(".copy-tandem").forEach(n=>{n.addEventListener("click",i=>{i.stopPropagation();const s=n.getAttribute("data-tandem-id");s&&ti(s)})})}function ti(t){const n=le().find(r=>r.id===t);if(!n)return;if(n.suggestionText){navigator.clipboard.writeText(n.suggestionText).then(()=>{lt("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")});return}const i=ct(n.profile1.name),s=ct(n.profile2.name);let a=`Hi ${i} und ${s},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;if(n.commonalities&&n.commonalities.length>0){const r={question:Math.max(10,...n.commonalities.map(o=>o.question.length)),answer1:Math.max(i.length,...n.commonalities.map(o=>(o.answer1||"-").length)),answer2:Math.max(s.length,...n.commonalities.map(o=>(o.answer2||"-").length))};r.question=Math.min(r.question,30),r.answer1=Math.min(r.answer1,25),r.answer2=Math.min(r.answer2,25),a+=Y("Frage",r.question)+" | ",a+=Y(i,r.answer1)+" | ",a+=Y(s,r.answer2)+" | ",a+=`Gemeinsamkeit
`,a+="-".repeat(r.question)+"-+-",a+="-".repeat(r.answer1)+"-+-",a+="-".repeat(r.answer2)+"-+-",a+="-".repeat(20)+`
`;for(const o of n.commonalities)a+=Y(Pe(o.question,r.question),r.question)+" | ",a+=Y(Pe(o.answer1||"-",r.answer1),r.answer1)+" | ",a+=Y(Pe(o.answer2||"-",r.answer2),r.answer2)+" | ",a+=(o.commonality||"")+`
`}a+=`
Ich freue mich über eure Rückmeldung!
`,navigator.clipboard.writeText(a).then(()=>{lt("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")})}function Y(t,e){return t.length>=e?t.substring(0,e):t+" ".repeat(e-t.length)}function Pe(t,e){return t?t.length<=e?t:t.substring(0,e-2)+"..":""}function ct(t){if(!t||typeof t!="string")return"Partner*in";const e=t.match(/\(([^)]+)\)/);if(e){const i=e[1].trim().split(/[\s,]+/)[0];if(i&&i.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(i))return i}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(t)){const n=t.split(/[\s,]+/)[0];if(n&&n.length>1)return n}return"Partner*in"}function lt(t){let e=document.getElementById("successToast");e||(e=document.createElement("div"),e.id="successToast",e.className="success-toast",document.body.appendChild(e)),e.textContent=t,e.classList.add("visible"),setTimeout(()=>e==null?void 0:e.classList.remove("visible"),2e3)}function ni(t){const e=new Date(t.created).toLocaleDateString("de-DE"),n=We(t.matchScore);return`
    <div class="tandem-card" data-tandem-id="${t.id}">
      <div class="header">
        <div class="title">${C(t.name)}</div>
        <div class="meta">
          <span class="stars">${n}</span>
          <span class="date">${e}</span>
          <button class="copy-tandem btn-icon" data-tandem-id="${t.id}" title="Text kopieren">📋</button>
          <button class="delete-tandem close-btn" data-tandem-id="${t.id}">&times;</button>
        </div>
      </div>
      <div class="profiles">
        <div class="profile">
          <strong>${C(t.profile1.name)}</strong>
        </div>
        <div class="profile">
          <strong>${C(t.profile2.name)}</strong>
        </div>
      </div>
      ${t.suggestionText?`
        <div class="suggestion-text">
          <strong>Vorschlagstext:</strong>
          <pre>${C(t.suggestionText)}</pre>
        </div>
      `:t.commonalities.length>0?`
        <div class="commonalities">
          <strong>Gemeinsamkeiten:</strong>
          ${t.commonalities.slice(0,3).map(i=>`
            <div class="commonality">• ${C(i.commonality)}</div>
          `).join("")}
          ${t.commonalities.length>3?`<div class="commonality">... und ${t.commonalities.length-3} weitere</div>`:""}
        </div>
      `:""}
    </div>
  `}function We(t){let e="";for(let n=0;n<5;n++)e+=`<span class="star ${n<t?"":"empty"}">★</span>`;return e}let we=null;function ii(t,e){const n=document.getElementById("matchModal"),i=document.getElementById("matchPreview");if(!n||!i)return;we={profile1:t,profile2:e};const s=Oe(t,e);i.innerHTML=`
    <div class="match-preview-content">
      <div class="match-profiles">
        <div class="profile">
          <strong>${C(t.name)}</strong>
        </div>
        <div class="match-icon">🤝</div>
        <div class="profile">
          <strong>${C(e.name)}</strong>
        </div>
      </div>
      <div class="match-score">
        <span>Match-Qualität: </span>
        <span class="stars">${We(s.score)}</span>
      </div>
      <div id="tandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    </div>
  `;const a=document.getElementById("tandemEditorContainer");a&&kt(a,t,e),n.classList.add("visible")}function De(){const t=document.getElementById("matchModal");t==null||t.classList.remove("visible"),we=null}function si(){if(!we)return;const{profile1:t,profile2:e}=we,n=Oe(t,e),i=je(),s=St(),a={id:crypto.randomUUID(),profile1:t,profile2:e,name:`${t.name} & ${e.name}`,created:new Date().toISOString(),commonalities:s,matchScore:n.score,suggestionText:i};xt(a),De(),Ze(`Tandem erstellt: ${t.name} & ${e.name}`)}function Ze(t){let e=document.getElementById("successToast");e||(e=document.createElement("div"),e.id="successToast",e.className="success-toast",document.body.appendChild(e)),e.textContent=t,e.classList.add("visible"),setTimeout(()=>e==null?void 0:e.classList.remove("visible"),3e3)}function C(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}let G=null;function ri(t){var i,s,a,r;G=t;let e=document.getElementById("editTandemModal");e||(e=document.createElement("div"),e.id="editTandemModal",e.className="modal",e.innerHTML=`
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
    `,document.body.appendChild(e),(i=e.querySelector("#closeEditModal"))==null||i.addEventListener("click",ve),(s=e.querySelector("#cancelEditTandem"))==null||s.addEventListener("click",ve),(a=e.querySelector("#dissolveTandem"))==null||a.addEventListener("click",ai),(r=e.querySelector("#saveEditTandem"))==null||r.addEventListener("click",oi));const n=document.getElementById("editTandemContent");if(n){const o=new Date(t.created).toLocaleDateString("de-DE");n.innerHTML=`
      <div class="edit-tandem-info">
        <div class="tandem-pair">
          <div class="profile-name">
            <strong>${C(t.profile1.name)}</strong>
          </div>
          <div class="pair-icon">🤝</div>
          <div class="profile-name">
            <strong>${C(t.profile2.name)}</strong>
          </div>
        </div>
        <div class="tandem-meta">
          <span class="stars">${We(t.matchScore)}</span>
          <span class="date">Erstellt am: ${o}</span>
        </div>
      </div>
      <div id="editTandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    `;const c=document.getElementById("editTandemEditorContainer");c&&kt(c,t.profile1,t.profile2)}e.classList.add("visible")}function ve(){const t=document.getElementById("editTandemModal");t==null||t.classList.remove("visible"),G=null}function ai(){if(!G)return;const t=`Tandem zwischen "${G.profile1.name}" und "${G.profile2.name}" wirklich auflösen?

Die Profile können dann erneut gematcht werden.`;confirm(t)&&(mt(G.id),ve(),Ze("Tandem aufgelöst - Profile können neu gematcht werden"))}function oi(){if(!G)return;const t=je(),e=St();zt(G.id,{suggestionText:t,commonalities:e}),ve(),Ze("Tandem aktualisiert")}const ci="modulepreload",li=function(t,e){return new URL(t,e).href},dt={},di=function(e,n,i){let s=Promise.resolve();if(n&&n.length>0){const r=document.getElementsByTagName("link"),o=document.querySelector("meta[property=csp-nonce]"),c=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));s=Promise.allSettled(n.map(l=>{if(l=li(l,i),l in dt)return;dt[l]=!0;const d=l.endsWith(".css"),u=d?'[rel="stylesheet"]':"";if(!!i)for(let g=r.length-1;g>=0;g--){const m=r[g];if(m.href===l&&(!d||m.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${u}`))return;const h=document.createElement("link");if(h.rel=d?"stylesheet":ci,d||(h.as="script"),h.crossOrigin="",h.href=l,c&&h.setAttribute("nonce",c),document.head.appendChild(h),d)return new Promise((g,m)=>{h.addEventListener("load",g),h.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return s.then(r=>{for(const o of r||[])o.status==="rejected"&&a(o.reason);return e().catch(a)})};function ui(){const t=document.getElementById("exportExcel"),e=document.getElementById("exportCSV"),n=document.getElementById("exportJSON"),i=document.getElementById("importBackup"),s=document.getElementById("manageProfilesBtn"),a=document.getElementById("deleteAllProfilesBtn");t==null||t.addEventListener("click",mi),e==null||e.addEventListener("click",hi),n==null||n.addEventListener("click",fi),i==null||i.addEventListener("click",gi),s==null||s.addEventListener("click",bi),a==null||a.addEventListener("click",pi),xe(),window.addEventListener("tandems-updated",xe),window.addEventListener("profiles-updated",xe)}function xe(){const t=document.getElementById("statsContainer");if(!t)return;const e=F(),n=le(),i=Ct(),s=n.length>0?(n.reduce((a,r)=>a+r.matchScore,0)/n.length).toFixed(1):"-";t.innerHTML=`
    <div class="stat-item">
      <span class="stat-label">Profile:</span>
      <span class="stat-value">${e.length}</span>
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
  `}async function mi(){const t=le();if(t.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}try{const e=await di(()=>import("./xlsx-D_0l8YDs.js"),[],import.meta.url),n=t.map(r=>({Tandem:r.name,"Person 1":r.profile1.name,"Person 2":r.profile2.name,"Match-Score":r.matchScore,Erstellt:new Date(r.created).toLocaleDateString("de-DE"),Gemeinsamkeiten:r.commonalities.map(o=>o.commonality).join("; ")})),i=e.utils.json_to_sheet(n),s=e.utils.book_new();e.utils.book_append_sheet(s,i,"Tandems");const a=`tandems_${new Date().toISOString().split("T")[0]}.xlsx`;e.writeFile(s,a)}catch(e){console.error("Excel export error:",e),alert("Fehler beim Excel-Export. Bitte versuche den CSV-Export.")}}function hi(){const t=le();if(t.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}const e=["Tandem","Person 1","Person 2","Match-Score","Erstellt","Gemeinsamkeiten"],n=t.map(s=>[s.name,s.profile1.name,s.profile2.name,String(s.matchScore),new Date(s.created).toLocaleDateString("de-DE"),s.commonalities.map(a=>a.commonality).join("; ")]),i=[e.join(";"),...n.map(s=>s.map(a=>`"${a.replace(/"/g,'""')}"`).join(";"))].join(`
`);$t(i,`tandems_${new Date().toISOString().split("T")[0]}.csv`,"text/csv;charset=utf-8")}function fi(){const t=Nt();$t(t,`tandem-matcher-backup_${new Date().toISOString().split("T")[0]}.json`,"application/json")}function gi(){const t=document.createElement("input");t.type="file",t.accept=".json",t.onchange=e=>{var s;const n=(s=e.target.files)==null?void 0:s[0];if(!n)return;const i=new FileReader;i.onload=a=>{var r;try{const o=(r=a.target)==null?void 0:r.result;confirm("Achtung: Alle bestehenden Daten werden überschrieben. Fortfahren?")&&(Rt(o),alert("Backup erfolgreich wiederhergestellt!"),location.reload())}catch(o){alert("Fehler beim Wiederherstellen: "+o.message)}},i.readAsText(n)},t.click()}function $t(t,e,n){const i=new Blob([t],{type:n}),s=URL.createObjectURL(i),a=document.createElement("a");a.href=s,a.download=e,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(s)}function pi(){const t=F();if(t.length===0){alert("Keine Profile vorhanden.");return}confirm(`Möchtest du wirklich ALLE ${t.length} Profile löschen?

Diese Aktion kann nicht rückgängig gemacht werden!`)&&confirm("Bist du sicher? Alle Profile werden unwiderruflich gelöscht.")&&(Pt(),window.dispatchEvent(new Event("profiles-updated")),alert("Alle Profile wurden gelöscht."))}function bi(){const t=F();if(ne(),t.length===0){alert("Keine Profile vorhanden.");return}const e=document.createElement("div");e.className="modal visible",e.id="profileManageModal";function n(){const c=F(),l=ne();return c.map(d=>{const u=l.has(d.id),f=d.group==="local"?"Local":"Newcomer",h=d.group==="local"?"local":"newcomer";return`
        <div class="profile-manage-item ${u?"matched":""}" data-id="${d.id}">
          <div class="profile-manage-info">
            <span class="profile-manage-name">${wi(d.name)}</span>
            <span class="profile-manage-group ${h}">${f}</span>
            ${u?'<span class="profile-manage-badge">In Tandem</span>':""}
          </div>
          <button class="btn btn-sm btn-danger profile-delete-btn" data-id="${d.id}" ${u?'disabled title="Profil ist in einem Tandem"':""}>
            Löschen
          </button>
        </div>
      `}).join("")}e.innerHTML=`
    <div class="modal-content modal-lg">
      <div class="modal-header">
        <h2>Profile verwalten</h2>
        <button class="close-btn" id="closeProfileManageModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="profile-manage-header">
          <p><strong>${t.length}</strong> Profile geladen</p>
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
  `,document.body.appendChild(e);const i=e.querySelector("#closeProfileManageModal"),s=e.querySelector("#closeProfileManageBtn"),a=e.querySelector("#profileSearchInput"),r=e.querySelector("#profileManageList");function o(){e.remove()}i==null||i.addEventListener("click",o),s==null||s.addEventListener("click",o),e.addEventListener("click",c=>{c.target===e&&o()}),a==null||a.addEventListener("input",()=>{const c=a.value.toLowerCase(),l=r==null?void 0:r.querySelectorAll(".profile-manage-item");l==null||l.forEach(d=>{var f,h;const u=((h=(f=d.querySelector(".profile-manage-name"))==null?void 0:f.textContent)==null?void 0:h.toLowerCase())||"";d.style.display=u.includes(c)?"flex":"none"})}),r==null||r.addEventListener("click",c=>{var d,u;const l=c.target;if(l.classList.contains("profile-delete-btn")&&!l.hasAttribute("disabled")){const f=l.dataset.id;if(!f)return;const h=((u=(d=l.closest(".profile-manage-item"))==null?void 0:d.querySelector(".profile-manage-name"))==null?void 0:u.textContent)||"Unbekannt";if(confirm(`Profil "${h}" wirklich löschen?`)){It(f),window.dispatchEvent(new Event("profiles-updated")),r&&(r.innerHTML=n());const m=e.querySelector(".profile-manage-header p"),v=F();m&&(m.innerHTML=`<strong>${v.length}</strong> Profile geladen`),v.length===0&&(o(),alert("Alle Profile wurden gelöscht."))}}})}function wi(t){if(!t)return"";const e=document.createElement("div");return e.textContent=t,e.innerHTML}document.addEventListener("DOMContentLoaded",async()=>{console.log("Tandem-Matcher v2.0 initialisiert"),await Mt(),vi(),wn(),jt(),Xt(),un(),ei(),ui(),yi(),Li(),ki(),Ei()});function vi(){const t=document.querySelectorAll(".tab"),e=document.querySelectorAll(".tab-content");t.forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.tab;i&&(t.forEach(s=>s.classList.remove("active")),n.classList.add("active"),e.forEach(s=>{s.classList.toggle("active",s.id===`${i}-tab`)}))})})}function yi(){const t=document.querySelectorAll(".view-btn"),e=document.getElementById("profileSidebar"),n=document.getElementById("mapContainer");t.forEach(i=>{i.addEventListener("click",()=>{const s=i.dataset.view;!s||!e||!n||(t.forEach(a=>a.classList.remove("active")),i.classList.add("active"),s==="list"?(e.classList.add("mobile-visible"),n.classList.add("mobile-hidden")):(e.classList.remove("mobile-visible"),n.classList.remove("mobile-hidden"),setTimeout(()=>{window.dispatchEvent(new Event("resize")),window.dispatchEvent(new Event("map-needs-resize"))},100)))})})}async function Ei(){const t=document.getElementById("ollamaStatus");if(t)try{const e=await Et();e.available&&e.model?(t.className="ollama-status available",t.textContent=`Verfügbar: ${e.model}`):e.available?(t.className="ollama-status unavailable",t.textContent="Ollama läuft, aber kein Modell installiert"):(t.className="ollama-status unavailable",t.textContent="Nicht verfügbar - Ollama installieren")}catch{t.className="ollama-status unavailable",t.textContent="Nicht verfügbar"}}function ki(){const t=document.getElementById("helpBtn"),e=document.getElementById("helpModal"),n=document.getElementById("closeHelpModal");t==null||t.addEventListener("click",()=>{e==null||e.classList.add("visible")}),n==null||n.addEventListener("click",()=>{e==null||e.classList.remove("visible")}),e==null||e.addEventListener("click",i=>{i.target===e&&e.classList.remove("visible")}),localStorage.getItem("swaf_help_shown")||setTimeout(()=>{e==null||e.classList.add("visible"),localStorage.setItem("swaf_help_shown","true")},500)}function Li(){window.addEventListener("focus",async()=>{try{const t=await navigator.clipboard.readText();t&&t.includes('"version"')&&t.includes('"profiles"')&&confirm("Profile-Daten in der Zwischenablage erkannt. Importieren?")&&window.dispatchEvent(new CustomEvent("import-from-clipboard",{detail:t}))}catch{}})}window.TandemMatcher={version:"2.0.0"};
