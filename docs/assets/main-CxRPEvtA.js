(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const G={PROFILES:"swaf_profiles",TANDEMS:"swaf_tandems",GAMIFICATION:"swaf_gamification_stats",PLZ_CACHE:"swaf_plz_cache",SETTINGS:"swaf_settings"};let T=[],P=[],O=ht(),Q=new Map;function ht(){return{totalMatches:0,todayMatches:0,lastMatchDate:"",streak:0,qualityScores:[],achievements:[],totalPoints:0}}async function $t(){try{const e=localStorage.getItem(G.PROFILES);e&&(T=JSON.parse(e));const t=localStorage.getItem(G.TANDEMS);t&&(P=JSON.parse(t));const n=localStorage.getItem(G.GAMIFICATION);n&&(O={...ht(),...JSON.parse(n)});const s=localStorage.getItem(G.PLZ_CACHE);if(s){const i=JSON.parse(s);Q=new Map(Object.entries(i))}console.log(`Storage initialized: ${T.length} profiles, ${P.length} tandems`)}catch(e){console.error("Error loading storage:",e)}}function W(){return[...T]}function fe(e){return T.find(t=>t.id===e)}function Tt(e){const t=new Set(T.map(s=>s.id)),n=new Set(T.map(s=>Ie(s.name)));for(const s of e){if(t.has(s.id))continue;const i=Ie(s.name);if(n.has(i)){const a=T.find(r=>Ie(r.name)===i);if(a){At(a,s);continue}}T.push(s),t.add(s.id),n.add(i)}ye()}function At(e,t){const n=new Set(e.fields.map(s=>s.question));for(const s of t.fields)n.has(s.question)||e.fields.push(s);e.pageType="Merged",e.timestamp=Math.max(e.timestamp,t.timestamp)}function Ie(e){return e.toLowerCase().trim().replace(/\s+/g," ")}function Ct(e){T=T.filter(t=>t.id!==e),ye()}function Pt(){T=[],ye()}function ye(){localStorage.setItem(G.PROFILES,JSON.stringify(T)),window.dispatchEvent(new CustomEvent("profiles-updated"))}function de(){return[...P]}function xt(e){P.push(e),ke(),O.totalMatches++,O.todayMatches++,O.lastMatchDate=new Date().toISOString().split("T")[0],O.qualityScores.push(e.matchScore),gt()}function ft(e){P=P.filter(t=>t.id!==e),ke()}function zt(e,t){const n=P.findIndex(s=>s.id===e);n!==-1&&(P[n]={...P[n],...t},ke())}function re(){const e=new Set;for(const t of P)e.add(t.profile1.id),e.add(t.profile2.id);return e}function ne(e){return P.find(t=>t.profile1.id===e||t.profile2.id===e)}function ke(){localStorage.setItem(G.TANDEMS,JSON.stringify(P)),window.dispatchEvent(new CustomEvent("tandems-updated"))}function Nt(){return{...O}}function gt(){localStorage.setItem(G.GAMIFICATION,JSON.stringify(O))}function Bt(e){return Q.get(e)}function ze(e,t){Q.set(e,t);const n=Object.fromEntries(Q);localStorage.setItem(G.PLZ_CACHE,JSON.stringify(n))}function qt(e){if(!e.profiles||!Array.isArray(e.profiles))throw new Error("Ungültiges Datenformat");const t=T.length;return Tt(e.profiles),T.length-t}function Rt(){return JSON.stringify({profiles:T,tandems:P,gamificationStats:O,plzCache:Object.fromEntries(Q),exportedAt:new Date().toISOString(),version:"2.0"})}function Dt(e){const t=JSON.parse(e);t.profiles&&(T=t.profiles),t.tandems&&(P=t.tandems),t.gamificationStats&&(O=t.gamificationStats),t.plzCache&&(Q=new Map(Object.entries(t.plzCache))),ye(),ke(),gt(),localStorage.setItem(G.PLZ_CACHE,JSON.stringify(Object.fromEntries(Q)))}function J(e){const t=e.fields.find(n=>n.question.toLowerCase().includes("plz")||n.question.toLowerCase().includes("postleitzahl"));if(t!=null&&t.answer){const n=t.answer.match(/\d{5}/);return n?n[0]:null}for(const n of e.fields){const s=n.answer.match(/\b\d{5}\b/);if(s)return s[0]}return null}function le(e){const t=[/newcomer/i,/geflüchtet/i,/migrant/i,/zugewandert/i,/immigrant/i,/einwander/i,/neuankommend/i,/geflohene?/i,/refugee/i,/asyl/i,/zuwander/i],n=[/\blocal\b/i,/einheimisch/i,/hier.*geboren/i,/alteingesessen/i,/ortsansässig/i],s=a=>t.some(r=>r.test(a)),i=a=>n.some(r=>r.test(a));if(e.pageType){if(s(e.pageType))return"newcomer";if(i(e.pageType))return"local"}if(e.name){if(s(e.name))return"newcomer";if(i(e.name))return"local"}if(e.url){if(s(e.url))return"newcomer";if(i(e.url))return"local"}for(const a of e.fields){const r=a.question.toLowerCase(),o=a.answer;if(r.includes("gruppe")||r.includes("status")||r.includes("wer bist")||r.includes("local")||r.includes("newcomer")||r.includes("herkunft")||r.includes("aufnahme")||r.includes("teilnehmer")){if(s(o))return"newcomer";if(i(o))return"local"}}for(const a of e.fields)if(s(a.answer))return"newcomer";return"local"}function ae(e){const t=e.fields.find(s=>s.question.toLowerCase().includes("alter")&&!s.question.toLowerCase().includes("unterschied")&&!s.question.toLowerCase().includes("präferenz"));if(t!=null&&t.answer){const s=t.answer.match(/\d+/);if(s){const i=parseInt(s[0]);if(i>=16&&i<=100)return i}}const n=e.fields.find(s=>s.question.toLowerCase().includes("geboren")||s.question.toLowerCase().includes("geburtsjahr"));if(n!=null&&n.answer){const s=n.answer.match(/(19|20)\d{2}/);if(s){const i=parseInt(s[0]),r=new Date().getFullYear()-i;if(r>=16&&r<=100)return r}}return null}function ge(e){const t=e.fields.find(n=>n.question.toLowerCase().includes("geschlecht")&&!n.question.toLowerCase().includes("präferenz")&&!n.question.toLowerCase().includes("partner"));if(t!=null&&t.answer){const n=t.answer.toLowerCase();if(n.includes("männlich")||n.includes("mann")||n==="m")return"male";if(n.includes("weiblich")||n.includes("frau")||n==="w"||n==="f")return"female";if(n.includes("divers")||n.includes("sonstig")||n.includes("andere"))return"other"}return null}const Ht={sport:["sport","fitness","training","gym","workout"],fussball:["fußball","fussball","soccer","kicken"],musik:["musik","music","konzert","singen","instrument"],lesen:["lesen","bücher","reading","books"],kochen:["kochen","cooking","backen","küche"],reisen:["reisen","travel","urlaub","reise"],kino:["kino","filme","movies","cinema","film"],gaming:["gaming","videospiele","spiele","zocken","games"],wandern:["wandern","hiking","spazieren","natur"],fotografie:["fotografie","photography","fotos","fotografieren"],kunst:["kunst","art","malen","zeichnen","museum"],tanzen:["tanzen","dance","dancing","tanz"],yoga:["yoga","meditation","entspannung"],schwimmen:["schwimmen","swimming","baden"],radfahren:["radfahren","fahrrad","cycling","bike","rad"],laufen:["laufen","joggen","running","jogging"],sprachen:["sprachen","languages","sprachkurs"],essen:["essen","food","kulinarik","restaurant"],feiern:["feiern","party","ausgehen","club","bar"],natur:["natur","nature","garten","pflanzen","outdoor"]};function Je(e){const t=e.toLowerCase().trim();for(const[n,s]of Object.entries(Ht))if(s.some(i=>t.includes(i)))return n;return t.replace(/[^a-zäöüß]/gi,"")}const Ft={"01":{lat:51.05,lng:13.74,city:"Dresden"},"02":{lat:51.15,lng:14.97,city:"Görlitz"},"03":{lat:51.76,lng:14.33,city:"Cottbus"},"04":{lat:51.34,lng:12.38,city:"Leipzig"},"05":{lat:51.22,lng:6.78,city:"Düsseldorf"},"06":{lat:51.48,lng:11.97,city:"Halle"},"07":{lat:50.93,lng:11.59,city:"Jena"},"08":{lat:50.72,lng:12.49,city:"Zwickau"},"09":{lat:50.83,lng:12.92,city:"Chemnitz"},10:{lat:52.52,lng:13.41,city:"Berlin Mitte"},11:{lat:52.52,lng:13.41,city:"Berlin"},12:{lat:52.45,lng:13.43,city:"Berlin Süd"},13:{lat:52.57,lng:13.35,city:"Berlin Nord"},14:{lat:52.39,lng:13.07,city:"Potsdam"},15:{lat:52.34,lng:14.55,city:"Frankfurt/Oder"},16:{lat:52.98,lng:13.79,city:"Oranienburg"},17:{lat:53.91,lng:13.38,city:"Greifswald"},18:{lat:54.09,lng:12.14,city:"Rostock"},19:{lat:53.63,lng:11.41,city:"Schwerin"},20:{lat:53.55,lng:10,city:"Hamburg"},21:{lat:53.47,lng:9.78,city:"Hamburg Süd"},22:{lat:53.6,lng:10.05,city:"Hamburg Nord"},23:{lat:53.87,lng:10.69,city:"Lübeck"},24:{lat:54.32,lng:10.14,city:"Kiel"},25:{lat:53.87,lng:9.09,city:"Itzehoe"},26:{lat:53.14,lng:8.22,city:"Oldenburg"},27:{lat:53.08,lng:8.81,city:"Bremen Nord"},28:{lat:53.08,lng:8.81,city:"Bremen"},29:{lat:52.97,lng:10.57,city:"Celle"},30:{lat:52.37,lng:9.74,city:"Hannover"},31:{lat:52.23,lng:9.52,city:"Hannover Süd"},32:{lat:52.02,lng:8.53,city:"Herford"},33:{lat:51.93,lng:8.38,city:"Bielefeld"},34:{lat:51.31,lng:9.5,city:"Kassel"},35:{lat:50.56,lng:8.67,city:"Gießen"},36:{lat:50.55,lng:9.68,city:"Fulda"},37:{lat:51.53,lng:9.93,city:"Göttingen"},38:{lat:52.27,lng:10.52,city:"Braunschweig"},39:{lat:52.13,lng:11.63,city:"Magdeburg"},40:{lat:51.23,lng:6.78,city:"Düsseldorf"},41:{lat:51.19,lng:6.44,city:"Mönchengladbach"},42:{lat:51.26,lng:7.15,city:"Wuppertal"},43:{lat:51.36,lng:7.35,city:"Hagen"},44:{lat:51.51,lng:7.47,city:"Dortmund"},45:{lat:51.45,lng:7.01,city:"Essen"},46:{lat:51.54,lng:6.77,city:"Oberhausen"},47:{lat:51.43,lng:6.76,city:"Duisburg"},48:{lat:51.96,lng:7.63,city:"Münster"},49:{lat:52.28,lng:8.05,city:"Osnabrück"},50:{lat:50.94,lng:6.96,city:"Köln"},51:{lat:50.99,lng:7.13,city:"Köln Ost"},52:{lat:50.78,lng:6.08,city:"Aachen"},53:{lat:50.73,lng:7.1,city:"Bonn"},54:{lat:49.75,lng:6.64,city:"Trier"},55:{lat:50,lng:8.27,city:"Mainz"},56:{lat:50.36,lng:7.6,city:"Koblenz"},57:{lat:50.87,lng:8.02,city:"Siegen"},58:{lat:51.36,lng:7.47,city:"Hagen"},59:{lat:51.66,lng:8.38,city:"Hamm"},60:{lat:50.11,lng:8.68,city:"Frankfurt"},61:{lat:50.22,lng:8.62,city:"Frankfurt Nord"},62:{lat:50.1,lng:8.77,city:"Bad Homburg"},63:{lat:50,lng:8.96,city:"Offenbach"},64:{lat:49.87,lng:8.65,city:"Darmstadt"},65:{lat:50.08,lng:8.24,city:"Wiesbaden"},66:{lat:49.24,lng:7,city:"Saarbrücken"},67:{lat:49.45,lng:8.44,city:"Ludwigshafen"},68:{lat:49.49,lng:8.47,city:"Mannheim"},69:{lat:49.41,lng:8.69,city:"Heidelberg"},70:{lat:48.78,lng:9.18,city:"Stuttgart"},71:{lat:48.73,lng:9.11,city:"Stuttgart Süd"},72:{lat:48.52,lng:9.05,city:"Tübingen"},73:{lat:48.8,lng:9.47,city:"Esslingen"},74:{lat:49.14,lng:9.22,city:"Heilbronn"},75:{lat:48.89,lng:8.69,city:"Pforzheim"},76:{lat:49.01,lng:8.4,city:"Karlsruhe"},77:{lat:48.47,lng:7.94,city:"Offenburg"},78:{lat:47.99,lng:8.52,city:"Villingen"},79:{lat:47.99,lng:7.85,city:"Freiburg"},80:{lat:48.14,lng:11.58,city:"München"},81:{lat:48.11,lng:11.6,city:"München Süd"},82:{lat:48.05,lng:11.47,city:"München West"},83:{lat:47.86,lng:11.97,city:"Rosenheim"},84:{lat:48.44,lng:12.12,city:"Landshut"},85:{lat:48.4,lng:11.74,city:"Freising"},86:{lat:48.37,lng:10.9,city:"Augsburg"},87:{lat:47.73,lng:10.31,city:"Kempten"},88:{lat:47.66,lng:9.48,city:"Friedrichshafen"},89:{lat:48.4,lng:10,city:"Ulm"},90:{lat:49.45,lng:11.08,city:"Nürnberg"},91:{lat:49.6,lng:11.01,city:"Erlangen"},92:{lat:49.02,lng:12.1,city:"Amberg"},93:{lat:49.02,lng:12.1,city:"Regensburg"},94:{lat:48.57,lng:13.45,city:"Passau"},95:{lat:50.06,lng:11.78,city:"Bayreuth"},96:{lat:50.1,lng:10.88,city:"Bamberg"},97:{lat:49.79,lng:9.95,city:"Würzburg"},98:{lat:50.68,lng:10.93,city:"Suhl"},99:{lat:50.98,lng:11.03,city:"Erfurt"}};function pt(e,t,n,s){const a=me(n-e),r=me(s-t),o=Math.sin(a/2)*Math.sin(a/2)+Math.cos(me(e))*Math.cos(me(n))*Math.sin(r/2)*Math.sin(r/2);return 6371*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}function me(e){return e*(Math.PI/180)}let Le=0;const Qe=1e3;async function Y(e){var i;if(!e||e.length<2)return null;const t=e.replace(/\D/g,"").substring(0,5);if(t.length<5)return Ye(t);const n=Bt(t);if(n)return n;const s=Ye(t);if(s)return ze(t,s),s;try{const a=Date.now();a-Le<Qe&&await new Promise(c=>setTimeout(c,Qe-(a-Le))),Le=Date.now(),console.log(`🌐 Lade PLZ ${t} von OpenStreetMap...`);const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&country=DE&postalcode=${t}&limit=1`,{headers:{"User-Agent":"SwaF Tandem Matcher v2.0"}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const o=await r.json();if(o&&o.length>0){const c={lat:parseFloat(o[0].lat),lng:parseFloat(o[0].lon),city:((i=o[0].display_name)==null?void 0:i.split(",")[0])||void 0};return ze(t,c),console.log(`✅ PLZ ${t} gefunden:`,c),c}}catch(a){console.warn(`⚠️ Nominatim API Fehler für PLZ ${t}:`,a)}return null}function Ye(e){const t=e.substring(0,2),n=Ft[t];if(!n)return null;let s=0,i=0;if(e.length>=5){const r=parseInt(e.substring(2,5),10)||0,o=r*2.399963,c=.02+r%100*3e-4;s=c*Math.cos(o),i=c*Math.sin(o)*1.4}const a={lat:n.lat+s,lng:n.lng+i,city:n.city};return ze(e,a),a}async function _t(e,t){if(e===t)return 0;const n=await Y(e),s=await Y(t);if(!(!n||!s))return pt(n.lat,n.lng,s.lat,s.lng)}const he=new Map;async function Gt(e,t){if(!e||!t)return null;if(e===t)return{distanceKm:0,drivingMinutes:0,transitMinutes:0,cyclingMinutes:0,walkingMinutes:0};const n=`${e}-${t}`,s=he.get(n);if(s)return s;const i=`${t}-${e}`,a=he.get(i);if(a)return a;const r=await Y(e),o=await Y(t);if(!r||!o)return null;try{const f=`https://router.project-osrm.org/route/v1/driving/${r.lng},${r.lat};${o.lng},${o.lat}?overview=false`;console.log(`🚗 Berechne Entfernung ${e} → ${t}...`);const b=await fetch(f);if(!b.ok)throw new Error(`HTTP ${b.status}`);const y=await b.json();if(y.code==="Ok"&&y.routes&&y.routes.length>0){const A=y.routes[0],B=A.distance/1e3,m=Math.round(A.duration/60),h=Math.round(m*1.8),p=Math.round(B*4),k=Math.round(B*12),I={distanceKm:Math.round(B*10)/10,drivingMinutes:m,transitMinutes:h,cyclingMinutes:p,walkingMinutes:k};return he.set(n,I),console.log(`✅ Entfernung: ${I.distanceKm} km`),I}}catch(f){console.warn("⚠️ OSRM API Fehler:",f)}const c=pt(r.lat,r.lng,o.lat,o.lng),d=Math.round(c*1.3*10)/10,u={distanceKm:d,drivingMinutes:Math.round(d*1.2),transitMinutes:Math.round(d*2.2),cyclingMinutes:Math.round(d*4),walkingMinutes:Math.round(d*12)};return he.set(n,u),u}function Ot(e){if(e.distanceKm===0)return"Gleiche PLZ";const t=[];return t.push(`${e.distanceKm} km Entfernung`),e.drivingMinutes<=120&&t.push(`ca. ${Se(e.drivingMinutes)} mit Auto`),e.transitMinutes<=180&&t.push(`ca. ${Se(e.transitMinutes)} mit ÖPNV`),e.walkingMinutes<=45&&t.push(`ca. ${Se(e.walkingMinutes)} zu Fuß`),t.join(", ")}function Se(e){if(e<60)return`${e} min`;const t=Math.floor(e/60),n=e%60;return n===0?`${t} h`:`${t}:${n.toString().padStart(2,"0")} h`}function Kt(e,t){const n=`https://www.google.com/maps/dir/${e.lat},${e.lng}/${t.lat},${t.lng}`,s=`https://www.bvg.de/de/verbindungen/verbindungssuche?start=${e.lat},${e.lng}&destination=${t.lat},${t.lng}`;return{google:n,bvg:s,mvv:"https://www.mvv-muenchen.de/fahrplanauskunft/index.html#routing",hvv:"https://www.hvv.de/de/fahrplaene/abruf-fahrplaninfos/"}}let D=null,U=new Map,_e=null;function jt(){document.getElementById("map")&&(D=L.map("map").setView([51.1657,10.4515],6),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:18}).addTo(D),Xe(),window.addEventListener("profiles-updated",Xe),window.addEventListener("tandems-updated",Vt),window.addEventListener("profile-selected",t=>{Jt(t.detail.profileId)}),window.addEventListener("profile-deselected",()=>{Qt()}))}function Vt(){const e=re();U.forEach((t,n)=>{var i;const s=(i=t.getElement())==null?void 0:i.querySelector(".marker-icon");s&&(e.has(n)?s.classList.add("matched"):s.classList.remove("matched"))})}async function Xe(){if(!D)return;U.forEach(n=>n.remove()),U.clear();const e=W(),t=new Map;for(const n of e){const s=J(n);s&&(t.has(s)||t.set(s,[]),t.get(s).push(n))}for(const[n,s]of t){const i=await Y(n);if(!(!i||!isFinite(i.lat)||!isFinite(i.lng)))for(let a=0;a<s.length;a++){const r=s[a],o=Wt(a,s.length),c=i.lat+o.lat,l=i.lng+o.lng,d=Ut(r,c,l);d.addTo(D),U.set(r.id,d)}}}function Wt(e,t){if(t===1)return{lat:0,lng:0};const n=.002,s=.001*Math.floor(e/8),i=n+s,r=e*2.399963;return{lat:i*Math.cos(r),lng:i*Math.sin(r)*1.4}}function Ut(e,t,n){const s=le(e),i=e.name.split(" ").map(u=>u[0]).join("").substring(0,2).toUpperCase(),r=re().has(e.id),o=r?"matched":"",c=L.divIcon({className:"marker-wrapper",html:`<div class="marker-icon ${s} ${o}" data-profile-id="${e.id}">${i}</div>`,iconSize:[30,30],iconAnchor:[15,15]}),l=L.marker([t,n],{icon:c}),d=Zt(e,s,r);return l.bindPopup(d,{maxWidth:300}),l.on("click",()=>{window.dispatchEvent(new CustomEvent("profile-clicked",{detail:{profileId:e.id}}))}),l}function Zt(e,t,n=!1){const s=ae(e),i=J(e),a=ge(e),r=$e(e,["hobby","hobbies","freizeit","interessen"]),o=$e(e,["sprache","sprachen","language"]),c=$e(e,["beruf","arbeit","job","tätigkeit","beschäftigung"]),l=a==="male"?"M":a==="female"?"W":a==="other"?"D":"",d=t==="local"?"Local":"Newcomer",u=t==="local"?"local":"newcomer";let f=`
    <div class="marker-popup">
      <div class="popup-header">
        <strong>${oe(e.name)}</strong>
        <span class="group-badge ${u}">${d}</span>
        ${n?'<span class="matched-badge">✓ Vermittelt</span>':""}
      </div>
      <div class="popup-meta">
        ${s?`<span>${s} Jahre</span>`:""}
        ${l?`<span>${l}</span>`:""}
        ${i?`<span>PLZ ${i}</span>`:""}
      </div>
  `;if(n){const b=ne(e.id);if(b){const y=b.profile1.id===e.id?b.profile2.name:b.profile1.name;f+=`<div class="popup-field tandem-info"><strong>Tandem mit:</strong> ${oe(y)}</div>`}}return c&&(f+=`<div class="popup-field"><strong>Beruf:</strong> ${oe(Me(c,50))}</div>`),o&&(f+=`<div class="popup-field"><strong>Sprachen:</strong> ${oe(Me(o,80))}</div>`),r&&(f+=`<div class="popup-field"><strong>Interessen:</strong> ${oe(Me(r,80))}</div>`),f+=`
      <div class="popup-action">
        ${n?"<em>Bereits vermittelt</em>":"<em>Klicken für Smart Match</em>"}
      </div>
    </div>
  `,f}function Me(e,t){return e.length<=t?e:e.substring(0,t-3)+"..."}function oe(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function $e(e,t){for(const n of t){const s=new RegExp(n,"i"),i=e.fields.find(a=>s.test(a.question));if(i!=null&&i.answer)return i.answer}return null}function Jt(e){_e=e,U.forEach((n,s)=>{var a;const i=(a=n.getElement())==null?void 0:a.querySelector(".marker-icon");i&&i.classList.toggle("selected",s===e)});const t=U.get(e);t&&D&&D.setView(t.getLatLng(),Math.max(D.getZoom(),10))}function Qt(){_e=null,U.forEach(e=>{var n;const t=(n=e.getElement())==null?void 0:n.querySelector(".marker-icon");t&&t.classList.remove("selected","compatible","incompatible","top-match")})}function Yt(e,t,n){U.forEach((s,i)=>{var r;if(i===_e)return;const a=(r=s.getElement())==null?void 0:r.querySelector(".marker-icon");a&&(a.classList.remove("compatible","incompatible","top-match"),n.includes(i)?a.classList.add("compatible","top-match"):e.includes(i)?a.classList.add("compatible"):t.includes(i)&&a.classList.add("incompatible"))})}function Xt(){D&&setTimeout(()=>{D==null||D.invalidateSize()},100)}window.addEventListener("map-needs-resize",Xt);let R={},S=new Set,Z=!1;function en(){F(),tn();const e=document.getElementById("filter-gender"),t=document.getElementById("filter-group"),n=document.getElementById("filter-search");e==null||e.addEventListener("change",()=>{R.gender=e.value,F()}),t==null||t.addEventListener("change",()=>{R.group=t.value,F()}),n==null||n.addEventListener("input",()=>{R.searchText=n.value,F()}),window.addEventListener("profiles-updated",F),window.addEventListener("tandems-updated",F),window.addEventListener("profile-clicked",s=>{bt(s.detail.profileId)})}function tn(){const e=document.querySelector(".sidebar-header");if(!e||document.getElementById("manualMatchBtn"))return;const t=document.createElement("button");t.id="manualMatchBtn",t.className="btn btn-sm",t.innerHTML="👆 Manuell matchen",t.title="Zwei Profile zum Matchen auswählen",t.addEventListener("click",()=>{Z=!Z,S.clear(),window.dispatchEvent(new CustomEvent("profile-deselected")),Ne(),F()}),e.appendChild(t)}function Ne(){const e=document.getElementById("manualMatchBtn");e&&(Z?(e.classList.add("active"),e.innerHTML=S.size===0?"✋ Wähle 2 Profile...":S.size===1?"✋ Noch 1 wählen...":"✅ Matchen!"):(e.classList.remove("active"),e.innerHTML="👆 Manuell matchen"))}function F(){const e=document.getElementById("profileList"),t=document.getElementById("profileCount");if(!e)return;const n=nn();if(t&&(t.textContent=String(n.length)),n.length===0){e.innerHTML='<p class="empty-state">Keine Profile gefunden. Importiere Profile über den Button oben.</p>';return}e.innerHTML=n.map(s=>sn(s)).join(""),e.querySelectorAll(".profile-card").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-profile-id");i&&bt(i)})})}function nn(){let e=W();if(R.gender&&R.gender!=="all"&&(e=e.filter(t=>ge(t)===R.gender)),R.group&&R.group!=="all"&&(e=e.filter(t=>le(t)===R.group)),R.searchText){const t=R.searchText.toLowerCase();e=e.filter(n=>{const s=J(n)||"";return n.name.toLowerCase().includes(t)||s.includes(t)})}return e}function sn(e){const t=J(e)||"-",n=le(e),s=ae(e),i=S.has(e.id),r=re().has(e.id),o=r?ne(e.id):null,c=o?o.profile1.id===e.id?o.profile2.name:o.profile1.name:null,l=Z&&i?Array.from(S).indexOf(e.id)+1:0;return`
    <div class="profile-card ${i?"selected":""} ${r?"matched":""} ${Z?"manual-mode":""}" data-profile-id="${e.id}">
      ${l>0?`<div class="selection-number">${l}</div>`:""}
      <div class="name">${et(e.name)}</div>
      <div class="meta">
        <span class="group-badge ${n}">${n==="local"?"Local":"Newcomer"}</span>
        <span>PLZ: ${t}</span>
        ${s?`<span>${s} Jahre</span>`:""}
      </div>
      ${r?`
        <div class="matched-info">
          <span class="matched-badge">✓ Vermittelt</span>
          ${c?`<span class="partner-name">mit ${et(c.split(" ")[0])}</span>`:""}
        </div>
      `:""}
    </div>
  `}function bt(e){const t=fe(e);if(!t)return;const n=ne(e);if(n&&!Z){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:n.id,tandem:n,profileId:e}}));return}if(Z){if(S.has(e))S.delete(e);else{if(S.size>=2){const s=Array.from(S)[0];S.delete(s)}S.add(e)}if(Ne(),S.size===2){const s=Array.from(S),i=fe(s[0]),a=fe(s[1]);if(i&&a){const r=ne(i.id),o=ne(a.id);if(r||o){alert("Eines der Profile ist bereits in einem Tandem. Bitte zuerst das bestehende Tandem auflösen.");return}window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:i,profile2:a}})),Z=!1,S.clear(),Ne()}}F();return}if(S.has(e))S.delete(e),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:e}}));else{if(S.size>0){const s=Array.from(S)[0];S.clear(),window.dispatchEvent(new CustomEvent("profile-deselected",{detail:{profileId:s}}))}S.add(e),window.dispatchEvent(new CustomEvent("profile-selected",{detail:{profileId:e,profile:t}}))}F()}function et(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const rn=["vorname","nachname","name","vollständiger name","e-mail-adresse","e-mail","email","telefonnummer","telefon","id","user-id","teilnehmer-id","profil-id","gruppe","standort","region","west","ost","nord","süd","vermittler","vermittler*in","durchgeführt von","durchgeführt","datum/uhrzeit","datum","uhrzeit","termin","terminart","status","bearbeitungsstatus","anmeldestatus","infoabend","infonachmittag","format","aufnahmegespräch","standort-newsletter","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","portal-link","wie wirkt die person auf dich","eindruck","bewertung","wie schätzt du ein","einschätzung","beurteilung","sind weitere schritte nötig","nächste schritte","follow-up","aufnahmegespräch datum","gespräch datum","plz","postleitzahl","ort","stadt","köln","berlin","münchen","ausgeschlossen","ausgetreten","pausiert","vermittelt","unvermittelt","angemeldet","beginn","ende"];function an(e){const t=e.toLowerCase().trim();return t.length<3||t==="geschlecht"||t==="dein geschlecht"?!0:rn.some(n=>t.includes(n)||n.includes(t))}function M(e,t){for(const n of t){const s=new RegExp(n,"i"),i=e.fields.find(a=>s.test(a.question)&&!an(a.question));if(i!=null&&i.answer)return i.answer}return null}function Ge(e,t){const n=[],s=le(e),i=le(t);if(s===i)return{compatible:!1,score:0,failReason:"same_group",failDetails:`Beide sind ${s==="local"?"Locals":"Newcomer"} - nur interkulturelle Matches möglich`,softFactsScore:0,softFactsMax:15};const a=on(e,t);if(!a.pass)return{compatible:!1,score:0,failReason:"age_preference",failDetails:a.reason,softFactsScore:0,softFactsMax:15};const r=cn(e,t);if(!r.pass)return{compatible:!1,score:0,failReason:"gender_preference",failDetails:r.reason,softFactsScore:0,softFactsMax:15};const o=ln(e,t);if(!o.pass)return{compatible:!1,score:0,failReason:"time_overlap",failDetails:o.reason,softFactsScore:0,softFactsMax:15};const c=[],l=dn(e,t,n,c),d=15;return{compatible:!0,score:Math.min(5,Math.round(l/d*5)),softFactsScore:l,softFactsMax:d,details:n.join("; "),positiveFactors:c.slice(0,3)}}function on(e,t){const n=ae(e),s=ae(t);if(!n||!s)return{pass:!0};const i=Math.abs(n-s),a=M(e,["alter.*unterschied","alter.*tandem","wie groß.*alter"]),r=M(t,["alter.*unterschied","alter.*tandem","wie groß.*alter"]);if(a){const o=a.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${i} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${e.name}: Alterspräferenz "${a}" nicht erfüllt (Diff: ${i} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&s<n)return{pass:!1,reason:`${e.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&s>n)return{pass:!1,reason:`${e.name}: Präferiert jüngeren Partner`}}if(r){const o=r.toLowerCase();if(!o.includes("egal"))if(o.includes("±")||o.includes("+/-")){const c=o.match(/(\d+)/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${i} Jahre)`}}else{const c=o.match(/(\d+)\s*jahre?/);if(c&&i>parseInt(c[1]))return{pass:!1,reason:`${t.name}: Alterspräferenz "${r}" nicht erfüllt (Diff: ${i} Jahre)`}}if(o.includes("älter")&&!o.includes("jünger")&&!o.includes("egal")&&n<s)return{pass:!1,reason:`${t.name}: Präferiert älteren Partner`};if(o.includes("jünger")&&!o.includes("älter")&&!o.includes("egal")&&n>s)return{pass:!1,reason:`${t.name}: Präferiert jüngeren Partner`}}return{pass:!0}}function cn(e,t){const n=ge(e),s=ge(t),i=M(e,["geschlecht.*tandem","geschlecht.*partner"]),a=M(t,["geschlecht.*tandem","geschlecht.*partner"]);if(i&&s){const r=i.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&s!=="female")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${i}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&s!=="male")return{pass:!1,reason:`${e.name}: Geschlechtspräferenz "${i}" nicht erfüllt`}}}if(a&&n){const r=a.toLowerCase();if(!r.includes("egal")&&!r.includes("keine")){if((r.includes("nur frauen")||r.includes("frauen*"))&&n!=="female")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${a}" nicht erfüllt`};if((r.includes("nur männer")||r.includes("männer*"))&&n!=="male")return{pass:!1,reason:`${t.name}: Geschlechtspräferenz "${a}" nicht erfüllt`}}}return{pass:!0}}function ln(e,t){const n=M(e,["zeit.*treffen","zeit.*tandem","wann.*zeit"]),s=M(t,["zeit.*treffen","zeit.*tandem","wann.*zeit"]);if(!n||!s)return{pass:!0};const i=n.toLowerCase(),a=s.toLowerCase();return i.includes("flexibel")||a.includes("flexibel")?{pass:!0}:["morgens","mittags","nachmittags","abends","unter der woche","wochenende"].filter(c=>i.includes(c)&&a.includes(c)).length===0?{pass:!1,reason:"Keine gemeinsamen Zeitfenster gefunden"}:{pass:!0}}function dn(e,t,n,s){let i=0;const a=J(e),r=J(t);if(a&&r){const g=parseInt(a.substring(0,2)),C=parseInt(r.substring(0,2)),z=Math.abs(g-C);a===r?(i+=3,n.push("Gleiche PLZ"),s.push("Gleiche PLZ")):z===0?(i+=2.5,n.push("Gleiche Region (< 10 km)"),s.push("Nah beieinander")):z===1?(i+=2,n.push("Benachbarte Region"),s.push("Benachbarte Region")):z<=3?(i+=1.5,n.push("Nahe Region")):z<=5?i+=1:i+=.5}const o=ae(e),c=ae(t);if(o&&c){const g=Math.abs(o-c);g<=3?(i+=2,n.push(`Sehr ähnliches Alter (±${g} Jahre)`),s.push(g===0?"Gleich alt":`Nur ${g}J Unterschied`)):g<=5?(i+=1.8,n.push(`Ähnliches Alter (±${g} Jahre)`),s.push("Ähnliches Alter")):g<=10?i+=1.5:g<=15?i+=1:g<=20&&(i+=.5)}const l=M(e,["geschlecht.*tandem","geschlecht.*partner"]),d=M(t,["geschlecht.*tandem","geschlecht.*partner"]);(l||d)&&(i+=1,n.push("Geschlechtspräferenz erfüllt")),i+=1,n.push("Interkulturell");const u=M(e,["hobby","hobbies","hobbys"]),f=M(t,["hobby","hobbies","hobbys"]);if(u&&f){const g=un(u,f);if(g.length>0){const C=Math.min(2,g.length*.4);i+=C,g.length>=3?(n.push("Viele gemeinsame Hobbys"),s.push("Viele gemeinsame Hobbys")):g.length>=2?(n.push("Mehrere gemeinsame Hobbys"),s.push("Gemeinsame Hobbys")):n.push("Gemeinsame Hobby-Interessen")}}const b=M(e,["freizeit(?!.*vermittler)"]),y=M(t,["freizeit(?!.*vermittler)"]);if(b&&y){const g=tt(b,y);g.length>=3?(i+=1.5,n.push("Ähnliche Freizeitinteressen")):g.length>=1&&(i+=.75)}const A=M(e,["themen.*interessieren","interess.*themen"]),B=M(t,["themen.*interessieren","interess.*themen"]);if(A&&B){const g=["politik","kunst","kultur","technologie","sport","musik","natur","reisen","essen","kochen","wissenschaft","geschichte","literatur"],C=A.toLowerCase(),z=B.toLowerCase(),$=g.filter(v=>C.includes(v)&&z.includes(v));$.length>=2?(i+=1.5,n.push("Mehrere gemeinsame Interessensgebiete"),s.push("Ähnliche Interessen")):$.length===1&&(i+=.75,n.push("Gemeinsame Interessensgebiete"))}const m=M(e,["freundschaft.*wichtig","wichtig.*freundschaft"]),h=M(t,["freundschaft.*wichtig","wichtig.*freundschaft"]);if(m&&h){const g=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","loyalität","treue"],C=m.toLowerCase(),z=h.toLowerCase(),$=g.filter(v=>C.includes(v)&&z.includes(v));$.length>=2?(i+=1.5,n.push("Ähnliche Wertvorstellungen"),s.push("Ähnliche Werte")):$.length===1&&(i+=.75)}const p=M(e,["tandem.*vorstellung(?!.*geschlecht)"]),k=M(t,["tandem.*vorstellung(?!.*geschlecht)"]);if(p&&k){const g=tt(p,k);g.length>=2?(i+=1,n.push("Ähnliche Tandem-Vorstellungen")):g.length>=1&&(i+=.5)}const I=M(e,["community-event","event.*unternehmen"]),x=M(t,["community-event","event.*unternehmen"]);if(I&&x){const g=I.toLowerCase(),C=x.toLowerCase();(g.includes("ja")||g.includes("gerne"))&&(C.includes("ja")||C.includes("gerne"))&&(i+=.5)}return i}function un(e,t){const n=e.split(/[,;]/).map(i=>Je(i.trim())).filter(Boolean),s=t.split(/[,;]/).map(i=>Je(i.trim())).filter(Boolean);return n.filter(i=>s.some(a=>i===a))}function tt(e,t){const n=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","mich","gerne","sehr","auch","aber","dass","wenn","weil","nicht","mehr","noch","schon","immer"]),s=e.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!n.has(a)),i=t.toLowerCase().split(/\s+/).filter(a=>a.length>3&&!n.has(a));return s.filter(a=>i.some(r=>a===r||a.includes(r)||r.includes(a)))}let N=null,se=[];function mn(){document.getElementById("smartMatchPanel");const e=document.getElementById("closeSmartMatch");e==null||e.addEventListener("click",()=>{nt(),window.dispatchEvent(new CustomEvent("profile-deselected"))}),window.addEventListener("profile-selected",async t=>{N=t.detail.profile;const s=ne(N.id);if(s){window.dispatchEvent(new CustomEvent("edit-tandem",{detail:{tandemId:s.id,tandem:s,profileId:N.id}})),N=null;return}await hn(),fn(),wn()}),window.addEventListener("profile-deselected",()=>{N=null,se=[],nt()})}async function hn(){if(!N)return;const e=W(),t=re(),n=[];for(const s of e){if(s.id===N.id||t.has(s.id))continue;const i=Ge(N,s),a=J(N),r=J(s);let o,c;a&&r&&(o=await _t(a,r),o!==void 0&&(c=o<1?"<1 km":`${Math.round(o)} km`)),n.push({profile:s,matchResult:i,distance:o,distanceText:c})}n.sort((s,i)=>s.matchResult.compatible!==i.matchResult.compatible?s.matchResult.compatible?-1:1:s.matchResult.compatible?i.matchResult.score-s.matchResult.score:0),se=n}function fn(){const e=document.getElementById("smartMatchPanel"),t=document.getElementById("selectedProfileName"),n=document.getElementById("smartMatchContent");!e||!t||!n||!N||(t.textContent=N.name,n.innerHTML=gn(),e.classList.add("visible"),n.querySelectorAll(".match-item").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-profile-id");i&&bn(i)})}))}function nt(){const e=document.getElementById("smartMatchPanel");e==null||e.classList.remove("visible")}function gn(){if(se.length===0)return'<p class="empty-state">Keine anderen Profile zum Matchen vorhanden.</p>';const e=se.filter(s=>s.matchResult.compatible),t=se.filter(s=>!s.matchResult.compatible);let n="";return e.length>0&&(n+='<div class="match-section"><h4>Passende Matches</h4>',n+=e.map(s=>st(s,!0)).join(""),n+="</div>"),t.length>0&&(n+='<div class="match-section"><h4>Unpassend (Hard Facts)</h4>',n+=t.map(s=>st(s,!1)).join(""),n+="</div>"),n}function st(e,t){const{profile:n,matchResult:s,distanceText:i}=e,a=pn(s.score);let r="";if(!t&&s.failReason){const c={age_preference:"🎂",gender_preference:"⚧️",time_overlap:"⏰",same_group:"👥"},l={age_preference:"Alter-Präferenz",gender_preference:"Geschlecht-Präferenz",time_overlap:"Keine Zeit-Überschneidung",same_group:"Gleiche Gruppe"},d=c[s.failReason]||"⚠️",u=l[s.failReason]||s.failReason;let f="";s.failDetails&&(f=`<div class="reason-details">${Te(s.failDetails)}</div>`),r=`
      <div class="reason-box">
        <span class="reason-icon">${d}</span>
        <span class="reason-label">${u}</span>
        ${f}
      </div>
    `}let o="";return t&&s.positiveFactors&&s.positiveFactors.length>0&&(o=`
      <div class="positive-factors">
        ${s.positiveFactors.slice(0,2).map(c=>`<span class="factor">✓ ${Te(c)}</span>`).join("")}
      </div>
    `),`
    <div class="match-item ${t?"":"incompatible"}" data-profile-id="${n.id}">
      <div class="stars">${t?a:"---"}</div>
      <div class="info">
        <div class="name">${Te(n.name)}</div>
        <div class="match-meta">
          ${i?`<span class="distance">📍 ${i}</span>`:""}
        </div>
        ${o}
        ${r}
      </div>
    </div>
  `}function pn(e){let t="";for(let n=0;n<5;n++)t+=`<span class="star ${n<e?"":"empty"}">★</span>`;return t}function bn(e){const t=fe(e);!t||!N||window.dispatchEvent(new CustomEvent("create-match",{detail:{profile1:N,profile2:t}}))}function wn(){const e=[],t=[],n=[];for(const s of se)s.matchResult.compatible?(e.push(s.profile.id),s.matchResult.score>=4&&n.push(s.profile.id)):t.push(s.profile.id);Yt(e,t,n)}function Te(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let ie=null;function vn(){const e=document.getElementById("importModal"),t=document.getElementById("importBtn"),n=document.getElementById("closeImportModal"),s=document.getElementById("pasteClipboard"),i=document.getElementById("dropZone"),a=document.getElementById("fileInput"),r=document.getElementById("cancelImport"),o=document.getElementById("confirmImport"),c=document.getElementById("importPreview");t==null||t.addEventListener("click",()=>it()),n==null||n.addEventListener("click",()=>Ae()),e==null||e.addEventListener("click",l=>{l.target===e&&Ae()}),s==null||s.addEventListener("click",async()=>{try{const l=await navigator.clipboard.readText();Be(l)}catch{alert("Fehler beim Lesen der Zwischenablage. Bitte erlaube den Zugriff.")}}),i==null||i.addEventListener("click",()=>a==null?void 0:a.click()),i==null||i.addEventListener("dragover",l=>{l.preventDefault(),i.classList.add("dragover")}),i==null||i.addEventListener("dragleave",()=>{i.classList.remove("dragover")}),i==null||i.addEventListener("drop",l=>{var u;l.preventDefault(),i.classList.remove("dragover");const d=(u=l.dataTransfer)==null?void 0:u.files[0];d&&rt(d)}),a==null||a.addEventListener("change",()=>{var d;const l=(d=a.files)==null?void 0:d[0];l&&rt(l)}),r==null||r.addEventListener("click",()=>{ie=null,c&&(c.hidden=!0)}),o==null||o.addEventListener("click",()=>{if(ie)try{const l=qt(ie);alert(`${l} neue Profile importiert!`),Ae()}catch(l){alert("Fehler beim Import: "+l.message)}}),window.addEventListener("import-from-clipboard",l=>{const d=l;it(),Be(d.detail)})}function it(){const e=document.getElementById("importModal"),t=document.getElementById("importPreview");e==null||e.classList.add("visible"),t&&(t.hidden=!0),ie=null}function Ae(){const e=document.getElementById("importModal");e==null||e.classList.remove("visible"),ie=null}function rt(e){if(!e.name.endsWith(".json")){alert("Bitte eine JSON-Datei auswählen.");return}const t=new FileReader;t.onload=n=>{var i;const s=(i=n.target)==null?void 0:i.result;Be(s)},t.onerror=()=>{alert("Fehler beim Lesen der Datei.")},t.readAsText(e)}function Be(e){try{let t;if(e.includes("SWAF_PROFILE_START")?t=En(e):t=JSON.parse(e),!t.profiles||!Array.isArray(t.profiles))throw new Error("Ungültiges Format: profiles Array nicht gefunden");ie=t,yn(t)}catch(t){alert("Fehler beim Verarbeiten der Daten: "+t.message)}}function En(e){const t=[],n=/SWAF_PROFILE_START([\s\S]*?)SWAF_PROFILE_END/g;let s;for(;(s=n.exec(e))!==null;)try{const i=JSON.parse(s[1].trim());t.push({id:crypto.randomUUID(),url:i.url||"",name:i.name||"Unbekannt",pageType:i.pageType||"Hauptprofil",timestamp:i.timestamp||Date.now(),fields:i.fields||[]})}catch{}return{version:"1.0",exportedAt:new Date().toISOString(),profiles:t}}function yn(e){const t=document.getElementById("importPreview"),n=document.getElementById("previewCount"),s=document.getElementById("previewList");!t||!n||!s||(n.textContent=String(e.profiles.length),s.innerHTML=e.profiles.slice(0,10).map(i=>`<div class="preview-item">${kn(i.name)} (${i.fields.length} Felder)</div>`).join(""),e.profiles.length>10&&(s.innerHTML+=`<div class="preview-item">... und ${e.profiles.length-10} weitere</div>`),t.hidden=!1)}function kn(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const Oe="https://api.swaf.koeln/ollama",In="ollama",Ln="Tandem2026Matcher";function Ke(){return{"Content-Type":"application/json",Authorization:"Basic "+btoa(`${In}:${Ln}`)}}async function wt(){try{console.log("🤖 Prüfe Ollama-Verfügbarkeit...");const e=await fetch(`${Oe}/api/tags`,{method:"GET",headers:Ke(),signal:AbortSignal.timeout(5e3)});return console.log(`🤖 Ollama Response: ${e.status} ${e.statusText}`),e.ok}catch(e){return console.warn("🤖 Ollama nicht erreichbar:",e),!1}}async function vt(){var e;try{const t=await fetch(`${Oe}/api/tags`,{headers:Ke()});return t.ok?((e=(await t.json()).models)==null?void 0:e.map(s=>s.name))||[]:[]}catch{return[]}}const Ce="mistral:7b";async function Et(){const e=await vt();return e.length===0?Ce:e.some(t=>t.includes("mistral"))?e.find(t=>t.includes("mistral"))||Ce:e[0]||Ce}const at={hobbys:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail. Dieser Abschnitt beschreibt die Hobby-Gemeinsamkeiten zweier Tandem-Partner.

WICHTIG: Du schreibst NUR einen Abschnitt, NICHT die ganze E-Mail!
- KEINE Anrede ("Hallo", "Liebe...")
- KEINE Einleitung ("Ich freue mich...", "Hier ist...")
- KEIN Abschluss ("Viele Grüße", "Ich hoffe...")
- Starte direkt mit dem Inhalt!

DEINE ROLLE: Vermittler, der von außen beschreibt.
STIL: "Ihr beide...", "Gemeinsam könntet ihr...", "Euch verbindet..."

VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze, direkt starten):`,freizeit:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Freizeit-Gemeinsamkeiten.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr beide...", "Gemeinsam könntet ihr...", "In eurer Freizeit..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,interessen:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über gemeinsame Interessen.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr interessiert euch beide für...", "Ein gemeinsames Interesse..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,sprachen:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Sprachkenntnisse.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr sprecht beide...", "Deutsch könnt ihr gemeinsam üben."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (1-2 Sätze):`,beruf:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über berufliche Verbindungen.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Beruflich verbindet euch...", "Eure unterschiedlichen Branchen..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,vorher:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über bisherige Erfahrungen.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr habt beide...", "Eure unterschiedlichen Wege..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,zukunft:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Zukunftspläne.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr habt beide Pläne für...", "Dabei könntet ihr euch unterstützen."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,tandem_motivation:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über die Tandem-Motivation.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Eure Motivationen ergänzen sich...", "Ihr wollt beide..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,freundschaft_werte:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über Freundschafts-Werte.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Euch beiden ist wichtig...", "Ihr teilt ähnliche Werte..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,events:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über gemeinsame Aktivitäten.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr könntet zusammen...", "Events wie ... interessieren euch beide."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (2-3 Sätze):`,verfuegbarkeit:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail über die zeitliche Verfügbarkeit.

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr seid beide abends verfügbar.", "Ein Treffen am Wochenende würde passen."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (1-2 Sätze):`,default:`Du schreibst EINEN ABSCHNITT einer Vermittlungs-E-Mail zur Frage "{Frage}".

WICHTIG: NUR ein Abschnitt - KEINE Anrede, KEINE Einleitung, KEIN Abschluss!
Starte direkt mit dem Inhalt.

STIL: "Ihr beide...", "Euch verbindet...", "Gemeinsam könntet ihr..."
VERMEIDE: Ich-Form der Partner, "Person 1/2", Emojis
Falls keine Gemeinsamkeit: antworte nur "---"

Angabe A: "{Antwort1}"
Angabe B: "{Antwort2}"

Abschnitt (1-2 Sätze):`};function Sn(e){const t=e.toLowerCase();return t.includes("hobby")||t.includes("hobbies")||t.includes("hobbys")?"hobbys":t.includes("freizeit")||t.includes("was machst du gerne")?"freizeit":t.includes("interesse")||t.includes("themen")?"interessen":t.includes("sprache")||t.includes("sprichst")?"sprachen":t.includes("beruf")||t.includes("arbeit")||t.includes("job")||t.includes("was machst du gerade")?"beruf":t.includes("vorher")||t.includes("früher")||t.includes("gelernt")||t.includes("was hast du")?"vorher":t.includes("zukunft")||t.includes("plan")||t.includes("ziel")||t.includes("vorhaben")?"zukunft":t.includes("warum")&&(t.includes("swaf")||t.includes("tandem")||t.includes("mitmachen"))?"tandem_motivation":t.includes("wichtig")&&(t.includes("freund")||t.includes("wert"))?"freundschaft_werte":t.includes("event")||t.includes("veranstaltung")||t.includes("unternehmen")||t.includes("aktivität")?"events":t.includes("zeit")||t.includes("wann")||t.includes("verfügbar")||t.includes("treffen")||t.includes("erreichbar")?"verfuegbarkeit":"default"}function yt(e,t,n){const s=Sn(e);return(at[s]||at.default).replace("{Frage}",e).replace("{Antwort1}",t).replace("{Antwort2}",n)}async function qe(e,t,n,s){var r;const i=await Et();if(!i)return null;const a=yt(e,t,n);try{const o=await fetch(`${Oe}/api/generate`,{method:"POST",headers:Ke(),body:JSON.stringify({model:i,prompt:a,stream:!1,options:{temperature:.7,num_predict:400}})});if(!o.ok)return console.warn("Ollama API error:",o.status),null;const l=((r=(await o.json()).response)==null?void 0:r.trim())||null;return!l||l==="---"||l.includes("keine Gemeinsamkeit")||l.includes("keine erkennbare")?null:l.replace(/^["']|["']$/g,"").trim()}catch(o){return console.warn("Ollama generation failed:",o),null}}async function kt(){if(!await wt())return{available:!1,model:null,models:[]};const t=await vt();return{available:!0,model:await Et(),models:t}}let E=[],K="",j="",H=new Set;const Mn='Schreibe hierzu einen kurzen Text. Die Frage zu den Antworten lautet {Frage}. Schreibe, wie die Antworten zusammenpassen könnten bzw. gebe Beispiele aus. Hier die Antworten: Person 1 - {Antwort1}, Person 2 - {Antwort2}. Schreibe den Text nach diesem Beispiel: "Ihr habt beide angegeben, dass ihr gerne kocht - ob mit Freund*innen oder alleine. Also los! Probiert doch einmal gemeinsam neue Rezepte. Außerdem geht ihr beide gerne Spazieren. Nach dem Essen sollst du Ruhn, oder 1.000 Schritte tun. Also habt ihr ja quasi schon einen Tagesplan ;) Weil ihr beide gerne auch kulturelle Dinge macht, wie in das Theater/Museum/oder auf andere Kulturveranstaltungen geht - schaut doch mal auf rausgegangen.de was es in Köln so die nächsten Tage gibt. Oder guckt bei uns im Eventportal: www.startwithafriend.de/events" - Nenne KEINE Namen oder andere Personenbezeichnungen.',Re=["Person","Sprachen & Herkunft","Beruf & Bildung","Hobbys & Interessen","Tandem-Wünsche","Verfügbarkeit","Sonstiges"],$n=["vermittler","durchgeführt von","status","terminart","anmeldestatus","bearbeitungsstatus","infoabend","infonachmittag","aufnahmegespräch datum","newsletter","dsgvo","einverständnis","notizen","interne notizen","bemerkungen admin","url","link","wie wirkt die person","eindruck","einschätzung","bewertung","nächste schritte","follow-up","user-id","profil-id","teilnehmer-id","women_kpi","kpi","integrationskurs","besuchst du gerade einen integrationskurs","vorgeschlagene termine","suggested_appointments","telefonnummer","phone_number","telefon","responsible_user","responsible","registration_interview","appointment_type","appointment_info","region","department_region","department","process_history","process_current_step","flucht","einwandungserfahrung","immigration_experience","create_uid","existing_tandem_count","tandem_count","birthday","geburtstag","geburtsdatum","group","gruppe","e-mail","email","e-mail-adresse","emailadresse","nachname","last_name","lastname","familienname","full_name","fullname","vollständiger name","datum/uhrzeit","datum uhrzeit","anmeldedatum","registrierungsdatum"],Tn=["name","full name"];function An(e){const t=e.toLowerCase();return t.includes("name")||t.includes("alter")||t.includes("geschlecht")||t.includes("geboren")||t.includes("plz")||t.includes("postleitzahl")?"Person":t.includes("sprache")||t.includes("herkunft")||t.includes("land")||t.includes("deutschland")||t.includes("seit wann")?"Sprachen & Herkunft":t.includes("beruf")||t.includes("arbeit")||t.includes("studium")||t.includes("studiert")||t.includes("abschluss")||t.includes("branche")||t.includes("was machst du gerade")||t.includes("was hast du vorher gemacht")||t.includes("was hast du gelernt")||t.includes("in zukunft")||t.includes("zukunft gerne machen")?"Beruf & Bildung":t.includes("hobby")||t.includes("freizeit")||t.includes("interesse")||t.includes("ausprobieren")||t.includes("was machst du gerne")||t.includes("freundschaft")||t.includes("wichtig")||t.includes("event")||t.includes("anbieten")||t.includes("themen")||t.includes("community")||t.includes("unternehmen")?"Hobbys & Interessen":t.includes("tandem")||t.includes("swaf")||t.includes("mitmachen")||t.includes("warum")||t.includes("vorstellung")||t.includes("geschlecht")&&t.includes("partner")?"Tandem-Wünsche":t.includes("zeit")||t.includes("treffen")||t.includes("wann")||t.includes("erreichen")||t.includes("kontakt")||t.includes("bewegst")?"Verfügbarkeit":"Sonstiges"}function Cn(e){const t=e.toLowerCase().trim();return Tn.includes(t)?!0:$n.some(n=>t.includes(n))}function De(e){return e?["übersprungen","keine angabe","k.a.","n/a","-","","egal","keine","null","undefined"].includes(e.toLowerCase().trim()):!0}const Pn=["name","vorname","nachname","plz","postleitzahl","standort","ort","adresse","wohnort","geschlecht","gender","alter","age","geburt","in deutschland geboren","in welchem land","herkunftsland","geburtsland","woher kommst du","country","altersunterschied","geschlechterpräferenz","alterspräferenz"];function xn(e){const t=e.toLowerCase();return Pn.some(n=>t.includes(n))}function It(e,t,n){K=ct(t.name),j=ct(n.name);const s=new Map;function i(r,o,c){if(Cn(r)||!o||De(o))return;const l=Nn(r),d=s.get(l);d?(c?d.answer1?d.answer1!==o&&(d.answer1+="; "+o):d.answer1=o:d.answer2?d.answer2!==o&&(d.answer2+="; "+o):d.answer2=o,d.mergedQuestions.includes(r)||d.mergedQuestions.push(r)):s.set(l,{displayQuestion:r,answer1:c?o:"",answer2:c?"":o,mergedQuestions:[r]})}for(const r of t.fields)i(r.question,r.answer||"",!0);for(const r of n.fields)i(r.question,r.answer||"",!1);E=[];let a=0;for(const[r,o]of s){if(!o.answer1&&!o.answer2)continue;const c=Bn(r,o.displayQuestion),l=be(c,o.answer1,o.answer2),d=l.length>0||o.answer1&&o.answer2;E.push({id:`row-${a}`,question:c,answer1:o.answer1,answer2:o.answer2,comment:l,selected:!1,included:d,collapsed:!d,category:An(c)}),a++}E.sort((r,o)=>{const c=Re.indexOf(r.category),l=Re.indexOf(o.category);return c!==l?c-l:r.included!==o.included?r.included?-1:1:r.question.localeCompare(o.question)}),H.clear(),pe(e);for(const r of E)(r.question.toLowerCase().includes("plz")||r.question.toLowerCase().includes("postleitzahl"))&&r.answer1&&r.answer2&&Kn(r.answer1,r.answer2,r.id)}const zn=[{key:"alter",patterns:["alter","age","wie alt bist du","wie alt","dein alter","geburtsjahr"]},{key:"geschlecht",patterns:["geschlecht","gender","dein geschlecht","welches geschlecht"]},{key:"altersunterschied",patterns:["altersunterschied","alterspräferenz","age_difference","max_age_difference","maximaler altersunterschied","altersunterschied zum tandempartner"]},{key:"geschlechterpräferenz",patterns:["geschlechterpräferenz","gender_preference","geschlecht des tandems","geschlecht tandempartner","welches geschlecht soll","gewünschtes geschlecht"]},{key:"vorname",patterns:["vorname","firstname","first_name","first name"]},{key:"plz",patterns:["plz","postleitzahl","postal code","zip","zipcode","deine plz"]},{key:"hobbys",patterns:["hobbys","hobbies","hobby"]},{key:"freizeit",patterns:["freizeit","freizeitaktivitäten"]},{key:"interessen",patterns:["interessen","interests"]},{key:"sprachen",patterns:["sprachen","languages","sprache","welche sprachen sprichst du","welche sprachen"]},{key:"herkunftsland",patterns:["herkunftsland","herkunft","woher kommst du","aus welchem land","country"]},{key:"seit_wann_deutschland",patterns:["seit wann in deutschland","seit wann bist du in deutschland","wie lange in deutschland","in deutschland seit"]}],ot={vorname:"Vorname",alter:"Alter",geschlecht:"Geschlecht",plz:"PLZ",hobbys:"Hobbys",freizeit:"Freizeitaktivitäten",interessen:"Interessen",sprachen:"Sprachen",herkunftsland:"Herkunftsland",seit_wann_deutschland:"Seit wann in Deutschland",altersunterschied:"Maximaler Altersunterschied",geschlechterpräferenz:"Geschlecht des Tandempartners"};function Nn(e){const t=e.toLowerCase().replace(/[?!.,:*_-]/g," ").replace(/\s+/g," ").trim(),n=[...zn].sort((s,i)=>{const a=Math.max(...s.patterns.map(o=>o.length));return Math.max(...i.patterns.map(o=>o.length))-a});for(const s of n)for(const i of s.patterns)if(t===i||t.startsWith(i+" ")||t.endsWith(" "+i)||t.includes(" "+i+" "))return s.key;return t}function Bn(e,t){return ot[e]?ot[e]:t}function pe(e){const t=H.size,n=E.filter(a=>!a.hidden),s=n.filter(a=>a.included).length,i=new Map;for(const a of n)i.has(a.category)||i.set(a.category,[]),i.get(a.category).push(a);e.innerHTML=`
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
        ${Re.map(a=>{const r=i.get(a);if(!r||r.length===0)return"";const o=r.filter(c=>c.included).length;return`
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
          <strong>E-Mail-Vorschau (${s} Felder):</strong>
          <button class="btn btn-sm" id="copyEmailBtn">📋 Kopieren</button>
        </div>
        <div class="preview-content" id="emailPreview">
          ${je()}
        </div>
      </div>
    </div>
  `,Rn(e)}function qn(e){const t=H.has(e.id),n=e.comment&&e.comment.length>0;return`
    <div class="editor-row ${t?"selected":""} ${e.included?"included":"excluded"} ${e.collapsed?"collapsed":""}" data-row-id="${e.id}">
      <div class="row-header">
        <label class="include-toggle" title="In E-Mail einschließen">
          <input type="checkbox" class="include-checkbox" data-row-id="${e.id}" ${e.included?"checked":""}>
          <span class="toggle-slider"></span>
        </label>
        <div class="row-question" data-row-id="${e.id}">
          <span class="collapse-icon">${e.collapsed?"▸":"▾"}</span>
          <span class="question-text">${w(e.question)}</span>
          ${n?'<span class="has-comment-indicator">✓</span>':""}
        </div>
        <div class="row-quick-actions">
          <input type="checkbox" class="merge-checkbox" data-row-id="${e.id}" ${t?"checked":""} title="Für Zusammenführen auswählen">
        </div>
      </div>

      <div class="row-details ${e.collapsed?"hidden":""}">
        <div class="row-answers">
          <div class="answer-cell">
            <div class="answer-label">${w(K)}:</div>
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
          >${w(ue(e.comment))}</textarea>
          ${Yn(e.comment)}
          <div class="comment-buttons">
            <button class="btn-icon smart-suggest" data-row-id="${e.id}" title="Lokaler Textvorschlag">💡</button>
            <button class="btn-icon ai-assist" data-row-id="${e.id}" title="KI-Unterstützung (ChatGPT/Claude)">🤖</button>
          </div>
        </div>
      </div>
    </div>
  `}function Rn(e){var s,i,a;e.querySelectorAll(".include-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;const d=E.find(u=>u.id===l);if(d){d.included=c.checked,X(e);const u=e.querySelector(`.editor-row[data-row-id="${l}"]`);u&&(u.classList.toggle("included",d.included),u.classList.toggle("excluded",!d.included))}})}),e.querySelectorAll(".merge-checkbox").forEach(r=>{r.addEventListener("change",o=>{o.stopPropagation();const c=o.target,l=c.dataset.rowId;if(!l)return;c.checked?H.add(l):H.delete(l);const d=e.querySelector("#mergeRowsBtn");d&&(d.disabled=H.size<2,d.textContent=`⊕ Zusammenführen (${H.size})`)})}),e.querySelectorAll(".row-question").forEach(r=>{r.addEventListener("click",o=>{const c=r.dataset.rowId;if(!c)return;const l=E.find(d=>d.id===c);if(l){l.collapsed=!l.collapsed;const d=e.querySelector(`.editor-row[data-row-id="${c}"]`);if(d){d.classList.toggle("collapsed",l.collapsed);const u=d.querySelector(".row-details"),f=d.querySelector(".collapse-icon");u&&u.classList.toggle("hidden",l.collapsed),f&&(f.textContent=l.collapsed?"▸":"▾")}}})});function t(r){r.style.height="auto",r.style.height=Math.min(r.scrollHeight,200)+"px"}e.querySelectorAll(".answer1-input").forEach(r=>{const o=r;t(o),o.addEventListener("input",c=>{const l=c.target;t(l);const d=l.dataset.rowId;if(!d)return;const u=E.find(f=>f.id===d);u&&(u.answer1=l.value,X(e))})}),e.querySelectorAll(".answer2-input").forEach(r=>{const o=r;t(o),o.addEventListener("input",c=>{const l=c.target;t(l);const d=l.dataset.rowId;if(!d)return;const u=E.find(f=>f.id===d);u&&(u.answer2=l.value,X(e))})}),e.querySelectorAll(".comment-input").forEach(r=>{t(r)}),e.querySelectorAll(".comment-input").forEach(r=>{r.addEventListener("input",o=>{const c=o.target,l=c.dataset.rowId;if(!l)return;const d=E.find(u=>u.id===l);if(d){if(d.comment=c.value,c.value.length>0&&!d.included){d.included=!0;const u=e.querySelector(`.include-checkbox[data-row-id="${l}"]`);u&&(u.checked=!0)}X(e)}})}),e.querySelectorAll(".smart-suggest").forEach(r=>{r.addEventListener("click",async o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=E.find(u=>u.id===c);if(!l)return;l.comment=be(l.question,l.answer1,l.answer2);const d=e.querySelector(`.comment-input[data-row-id="${c}"]`);if(d&&(d.value=l.comment),X(e),(!l.comment||l.comment.length<10)&&l.answer1&&l.answer2&&await wt()){r.textContent="...";const f=await qe(l.question,l.answer1,l.answer2);f&&(l.comment=f,l.included=!0,d&&(d.value=l.comment),X(e)),r.textContent="💡"}})}),e.querySelectorAll(".ai-assist").forEach(r=>{r.addEventListener("click",o=>{o.stopPropagation();const c=r.dataset.rowId;if(!c)return;const l=E.find(d=>d.id===c);l&&Zn(l)})}),(s=e.querySelector("#mergeRowsBtn"))==null||s.addEventListener("click",()=>{Dn(),pe(e)}),(i=e.querySelector("#regenerateBtn"))==null||i.addEventListener("click",()=>{for(const r of E)r.comment=be(r.question,r.answer1,r.answer2),r.included=r.comment.length>0;pe(e)});const n=e.querySelector("#ollamaBtn");kt().then(r=>{r.available?(n.disabled=!1,n.textContent="KI generieren",n.title="Mit Mistral KI generieren"):(n.textContent="KI nicht verfügbar",n.title="KI-Server nicht erreichbar")}).catch(()=>{n.textContent="KI nicht verfügbar",n.title="Fehler bei der Verbindung zum KI-Server"}),n==null||n.addEventListener("click",async()=>{n.disabled=!0,n.textContent="KI läuft...";const r=E.filter(o=>o.answer1&&o.answer2&&!xn(o.question)).map(o=>({question:o.question,answer1:o.answer1,answer2:o.answer2,rowId:o.id}));Jn(r,e,()=>{n.disabled=!1,n.textContent="KI generieren"})}),(a=e.querySelector("#copyEmailBtn"))==null||a.addEventListener("click",()=>{const r=Ve(),o=Qn();if(navigator.clipboard&&typeof ClipboardItem<"u"){const c=[new ClipboardItem({"text/html":new Blob([o],{type:"text/html"}),"text/plain":new Blob([r],{type:"text/plain"})})];navigator.clipboard.write(c).then(()=>{const l=e.querySelector("#copyEmailBtn");l&&(l.textContent="✓ Kopiert (Word-kompatibel)!",setTimeout(()=>l.textContent="📋 Kopieren",2e3))}).catch(()=>{navigator.clipboard.writeText(r)})}else navigator.clipboard.writeText(r).then(()=>{const c=e.querySelector("#copyEmailBtn");c&&(c.textContent="✓ Kopiert!",setTimeout(()=>c.textContent="📋 Kopieren",2e3))})})}function Dn(){if(H.size<2)return;const e=Array.from(H),t=e[0],n=E.find(i=>i.id===t);if(!n)return;const s=e.slice(1);for(const i of s){const a=E.find(r=>r.id===i);a&&(n.question+=" + "+a.question,a.answer1&&a.answer1!==n.answer1&&(n.answer1=n.answer1?n.answer1+"; "+a.answer1:a.answer1),a.answer2&&a.answer2!==n.answer2&&(n.answer2=n.answer2?n.answer2+"; "+a.answer2:a.answer2),a.comment&&(n.comment=n.comment?n.comment+"; "+a.comment:a.comment),a.hidden=!0,n.mergedWith||(n.mergedWith=[]),n.mergedWith.push(a.question.substring(0,30)))}n.comment=be(n.question,n.answer1,n.answer2),H.clear()}function be(e,t,n){const s=e.toLowerCase(),i=(t||"").toLowerCase().trim(),a=(n||"").toLowerCase().trim();if(!i&&!a||De(i)&&De(a))return"";if(i===a&&i.length>2)return s.includes("wichtig")||s.includes("freundschaft")?`Gemeinsamer Wert: ${t}`:s.includes("studium")&&i.includes("ja")?"Beide haben studiert - das verbindet!":`Übereinstimmung: ${t}`;if(s.includes("alter")&&!s.includes("unterschied")){const r=parseInt(i),o=parseInt(a);if(!isNaN(r)&&!isNaN(o)){const c=Math.abs(r-o);return c===0?"Genau gleich alt!":c<=3?`Nur ${c} Jahre Unterschied - perfekt!`:c<=7?`${c} Jahre Unterschied - passt gut`:c<=15?`${c} Jahre Unterschied - verschiedene Perspektiven`:`${c} Jahre Unterschied`}}return s.includes("sprache")||s.includes("sprichst")?Hn(t,n):s.includes("hobby")||s.includes("freizeit")||s.includes("interesse")||s.includes("ausprobieren")||s.includes("was machst du gerne")||s.includes("event")||s.includes("anbieten")||s.includes("unternehmen")||s.includes("themen")?Fn(t,n):s.includes("beruf")||s.includes("arbeit")||s.includes("studium")||s.includes("gelernt")||s.includes("zukunft")||s.includes("branche")||s.includes("was machst du gerade")||s.includes("vorher gemacht")?jn(t,n):s.includes("zeit")||s.includes("treffen")||s.includes("wann")||s.includes("erreichbar")?_n(t,n):s.includes("wichtig")||s.includes("freundschaft")||s.includes("erwartung")?Gn(t,n):s.includes("plz")||s.includes("postleitzahl")?On(t,n):s.includes("herkunft")||s.includes("land")||s.includes("woher")?Vn(t,n):s.includes("tandem")||s.includes("warum")||s.includes("mitmachen")||s.includes("swaf")||s.includes("start with a friend")?Wn(t,n):s.includes("geschlecht")&&(s.includes("partner")||s.includes("tandem"))?Un(t,n):Lt(t,n)}function Hn(e,t){const n=e.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),s=t.toLowerCase().split(/[,;]/).map(a=>a.trim()).filter(a=>a.length>2),i=n.filter(a=>s.some(r=>a.includes(r)||r.includes(a)));return i.length>0?`Gemeinsame Sprachen: ${[...new Set(i)].join(", ")}`:""}function Fn(e,t){const n=e.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),s=t.toLowerCase().split(/[,;]/).map(o=>o.trim()).filter(o=>o.length>2),i=[["sport","fitness","training","gym","joggen","laufen"],["wandern","hiking","spazieren","natur","wald"],["kochen","backen","essen","kulinarisch","rezept"],["musik","konzert","instrument","singen"],["lesen","bücher","literatur"],["reisen","urlaub","travel","länder"],["film","kino","serien","netflix","movie"],["kunst","museum","malen","zeichnen","kreativ"],["tanzen","dance","salsa","bachata","tanz"],["fahrrad","radfahren","cycling","bike"],["foto","fotografieren","photography","kamera"],["café","kaffee","coffee"],["sprache","lernen","language"],["garten","pflanzen","garden"],["yoga","meditation","entspannung"],["schwimmen","baden","swimming"]],a=[];for(const o of n)for(const c of s){if(o.includes(c)||c.includes(o)){a.push(o.length>c.length?o:c);continue}for(const l of i){const d=l.some(f=>o.includes(f)),u=l.some(f=>c.includes(f));d&&u&&a.push(l[0])}}const r=[...new Set(a)];return r.length>0?r.length===1?`Gemeinsames Hobby: ${r[0]}`:`Gemeinsame Hobbys: ${r.slice(0,4).join(", ")}`:""}function _n(e,t){const n=["morgens","mittags","nachmittags","abends","wochenende","unter der woche","flexibel"],s=e.toLowerCase(),i=t.toLowerCase(),a=n.filter(r=>s.includes(r)&&i.includes(r));return a.includes("flexibel")||a.length>=2?"Zeitlich flexibel - passt gut!":a.length>0?`Gemeinsame Zeit: ${a.join(", ")}`:""}function Gn(e,t){const n=["ehrlichkeit","vertrauen","respekt","toleranz","humor","offenheit","zuverlässigkeit","kommunikation"],s=e.toLowerCase(),i=t.toLowerCase(),a=n.filter(r=>s.includes(r)&&i.includes(r));return a.length>0?`Gemeinsame Werte: ${a.join(", ")}`:""}function On(e,t){const n=we(e),s=we(t);return!n||!s?"":n===s?"Gleiche PLZ":n.substring(0,2)===s.substring(0,2)?"Gleiche Region - Entfernung wird berechnet...":"Entfernung wird berechnet..."}async function Kn(e,t,n,s){const i=we(e),a=we(t);if(!i||!a)return;const r=E.find(c=>c.id===n);if(!r)return;const o=await Gt(i,a);if(o){const c=await Y(i),l=await Y(a);let d=Ot(o);if(c&&l){const y=Kt(c,l);d+=` [🗺️](${y.google})`}r.comment=d,r.included=!0;const u=document.querySelector(`.comment-input[data-row-id="${n}"]`);u&&(u.value=ue(d));const f=document.querySelector(`.include-checkbox[data-row-id="${n}"]`);f&&(f.checked=!0);const b=document.querySelector("#emailPreview");b&&(b.innerHTML=je())}}function we(e){const t=e.match(/\b(\d{5})\b/);return t?t[1]:null}function jn(e,t){const n=e.toLowerCase(),s=t.toLowerCase(),i=[["student","studier","uni","hochschule","ausbildung"],["arbeit","beruf","job","angestellt"],["selbstständig","freelance","freiberuflich"],["suche","arbeitslos","orientierung"],["it","software","computer","programmier"],["sozial","pflege","gesundheit","medizin"],["lehrer","pädagog","bildung","schule"],["ingenieur","technik","maschinenbau"],["wirtschaft","bwl","marketing","vertrieb"],["kunst","design","kreativ","musik"]],a=[];for(const r of i){const o=r.some(l=>n.includes(l)),c=r.some(l=>s.includes(l));o&&c&&a.push(r[0])}return a.length>0?`Ähnlicher Bereich: ${a.join(", ")}`:(n.includes("student")||n.includes("studier"))&&(s.includes("student")||s.includes("studier"))?"Beide studieren - viel gemeinsam!":Lt(e,t)}function Vn(e,t){const n=e.toLowerCase(),s=t.toLowerCase(),i=["deutschland","syrien","iran","irak","afghanistan","türkei","ukraine","eritrea","somalia","nigeria","pakistan","indien","china","russland"];for(const a of i)if(n.includes(a)&&s.includes(a))return`Beide haben Bezug zu ${a.charAt(0).toUpperCase()+a.slice(1)}`;return(n.includes("kultur")||n.includes("tradition"))&&(s.includes("kultur")||s.includes("tradition"))?"Beide interessiert an Kultur & Traditionen":""}function Wn(e,t){const n=e.toLowerCase(),s=t.toLowerCase(),i=[{keywords:["sprache","deutsch","lernen","verbessern"],text:"Beide wollen Sprachkenntnisse verbessern"},{keywords:["freund","kennenlernen","kontakt","leute"],text:"Beide suchen neue Kontakte"},{keywords:["kultur","austausch","integration"],text:"Beide wollen kulturellen Austausch"},{keywords:["helfen","unterstütz","begleiten"],text:"Gegenseitige Unterstützung ist wichtig"},{keywords:["spaß","unternehmung","aktivität"],text:"Beide wollen gemeinsam Spaß haben"}];for(const a of i){const r=a.keywords.some(c=>n.includes(c)),o=a.keywords.some(c=>s.includes(c));if(r&&o)return a.text}return""}function Un(e,t){const n=e.toLowerCase(),s=t.toLowerCase();return(n.includes("egal")||n.includes("keine präferenz"))&&(s.includes("egal")||s.includes("keine präferenz"))?"Beide flexibel beim Geschlecht":""}function Lt(e,t){if(!e||!t)return"";const n=new Set(["und","oder","der","die","das","ein","eine","mit","für","von","zu","ich","mir","gerne","sehr","auch","aber","wenn","dann","noch","schon","kann","will","muss","soll","hat","haben","sein","wird","sind","ist","nicht","mehr","viel","viele","alle","diese","dies","dem","den","des"]),s=e.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!n.has(o)),i=t.toLowerCase().replace(/[.,!?;:()]/g," ").split(/\s+/).filter(o=>o.length>3&&!n.has(o)),a=s.filter(o=>i.some(c=>o===c||o.length>4&&c.length>4&&(o.includes(c)||c.includes(o)))),r=[...new Set(a)];return r.length>=1?`Gemeinsam: ${r.slice(0,4).join(", ")}`:e.length>5&&t.length>5?"Beide haben geantwortet":""}function X(e){const t=e.querySelector("#emailPreview");t&&(t.innerHTML=je())}function je(){const t=E.filter(s=>s.included).filter(s=>s.answer1||s.answer2);let n=`
    <div class="email-intro">
      Hi <strong>${w(K)}</strong> und <strong>${w(j)}</strong>,<br><br>
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
          <th>${w(K)}</th>
          <th>${w(j)}</th>
          <th>Gemeinsamkeit</th>
        </tr>
      </thead>
      <tbody>
  `;for(const s of t){const i=Xn(s.comment);n+=`
      <tr>
        <td><strong>${w(s.question)}</strong></td>
        <td>${w(s.answer1)||"-"}</td>
        <td>${w(s.answer2)||"-"}</td>
        <td class="commonality">${i}</td>
      </tr>
    `}return n+=`
      </tbody>
    </table>
    <div class="email-outro">
      <br>Ich freue mich über eure Rückmeldung!
    </div>
  `,n}function Zn(e,t){var a,r,o,c;const s=(localStorage.getItem("swaf_ai_prompt")||Mn).replace("{Frage}",e.question).replace("{Antwort1}",e.answer1||"keine Angabe").replace("{Antwort2}",e.answer2||"keine Angabe"),i=document.createElement("div");i.className="ai-modal-overlay",i.innerHTML=`
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
          <textarea class="ai-prompt-text" readonly rows="6">${w(s)}</textarea>
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
  `,document.body.appendChild(i),(a=i.querySelector(".close-modal"))==null||a.addEventListener("click",()=>i.remove()),i.addEventListener("click",l=>{l.target===i&&i.remove()}),(r=i.querySelector(".ai-chatgpt"))==null||r.addEventListener("click",()=>{navigator.clipboard.writeText(s).then(()=>{window.open("https://chat.openai.com/","_blank"),i.remove(),He("💬 ChatGPT geöffnet - Prompt in Zwischenablage kopiert!")})}),(o=i.querySelector(".ai-claude"))==null||o.addEventListener("click",()=>{navigator.clipboard.writeText(s).then(()=>{window.open("https://claude.ai/","_blank"),i.remove(),He("🤖 Claude geöffnet - Prompt in Zwischenablage kopiert!")})}),(c=i.querySelector(".ai-copy-prompt"))==null||c.addEventListener("click",()=>{navigator.clipboard.writeText(s).then(()=>{const l=i.querySelector(".ai-copy-prompt");l.textContent="✓ Kopiert!",setTimeout(()=>l.textContent="📋 Nur Prompt kopieren",2e3)})})}function He(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),3e3)}function Jn(e,t,n){const s=e.map(m=>({...m,generated:"",status:"pending",selected:!0}));let i=!1,a=new Set;const r=document.createElement("div");r.className="ai-modal-overlay";function o(){return`
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
            ${s.map((m,h)=>c(m,h)).join("")}
          </div>

          <div class="ai-preview-actions">
            <button class="btn btn-secondary" id="cancelPreviewBtn">Abbrechen</button>
            <button class="btn btn-primary" id="applyPreviewBtn" disabled>
              Ausgewählte übernehmen (<span id="selectedCount">0</span>)
            </button>
          </div>
        </div>
      </div>
    `}function c(m,h){return`
      <div class="ai-preview-item ${m.status}" data-index="${h}" id="preview-item-${h}">
        <label class="ai-preview-checkbox">
          <input type="checkbox" ${m.selected?"checked":""} ${m.status!=="done"?"disabled":""} data-index="${h}">
          <span class="checkmark"></span>
        </label>
        <div class="ai-preview-content">
          <div class="ai-preview-question-row">
            <span class="ai-preview-question">${w(m.question)}</span>
            <button class="btn-icon ai-regenerate-btn" data-index="${h}" title="Neu generieren" ${m.status==="generating"?"disabled":""}>🔄</button>
          </div>
          <div class="ai-preview-answers">
            <span class="answer-snippet" title="${w(m.answer1)}">${w(ce(m.answer1,30))}</span>
            <span class="answer-vs">+</span>
            <span class="answer-snippet" title="${w(m.answer2)}">${w(ce(m.answer2,30))}</span>
          </div>
          <div class="ai-preview-result" id="result-${h}">
            ${l(m,h)}
          </div>
          <details class="ai-item-prompt">
            <summary>Prompt anzeigen</summary>
            <pre class="ai-prompt-mini">${w(yt(m.question,m.answer1,m.answer2))}</pre>
          </details>
        </div>
      </div>
    `}function l(m,h){return m.status==="pending"?'<div class="ai-preview-pending">Wartet...</div>':m.status==="generating"?'<div class="ai-preview-generating"><span class="ai-mini-spinner"></span> Generiere...</div>':m.status==="error"?'<div class="ai-preview-error">Fehler - klicke 🔄 zum erneuten Versuch</div>':`<textarea class="ai-preview-textarea" data-index="${h}" rows="4">${w(m.generated)}</textarea>`}function d(m){const h=s[m],p=r.querySelector(`#preview-item-${m}`);if(!p)return;p.className=`ai-preview-item ${h.status}`;const k=p.querySelector(`#result-${m}`);if(k){k.innerHTML=l(h,m);const g=k.querySelector(".ai-preview-textarea");g&&g.addEventListener("input",C=>{const z=C.target;s[m].generated=z.value})}const I=p.querySelector('input[type="checkbox"]');I&&(I.disabled=h.status!=="done",I.checked=h.selected);const x=p.querySelector(".ai-regenerate-btn");x&&(x.disabled=h.status==="generating"),u()}function u(){const m=s.filter(x=>x.status==="done").length,h=s.filter(x=>x.selected&&x.status==="done").length,p=r.querySelector("#progressText");p&&(p.textContent=`${m}/${e.length} generiert`);const k=r.querySelector("#selectedCount");k&&(k.textContent=String(h));const I=r.querySelector("#applyPreviewBtn");I&&(I.disabled=h===0)}function f(){const m=r.querySelector("#progressInfo");if(m){const k=s.filter(I=>I.status==="done").length;m.innerHTML=`<span id="progressText">${k} Vorschläge generiert</span>`}const h=r.querySelector("#introText");if(h){const k=s.filter(I=>I.status==="done").length;h.innerHTML=`<strong>${k} Vorschläge generiert.</strong> Wähle aus, welche du übernehmen möchtest:`}const p=r.querySelector("#stopGenerationBtn");p&&(p.style.display="none")}function b(){var m,h,p,k,I,x,g,C,z;(m=r.querySelector(".close-modal"))==null||m.addEventListener("click",()=>{i=!0,r.remove(),n()}),r.addEventListener("click",$=>{$.target===r&&(i=!0,r.remove(),n())}),(h=r.querySelector("#cancelPreviewBtn"))==null||h.addEventListener("click",()=>{i=!0,r.remove(),n()}),(p=r.querySelector("#stopGenerationBtn"))==null||p.addEventListener("click",()=>{i=!0,f()}),(k=r.querySelector("#selectAllBtn"))==null||k.addEventListener("click",()=>{s.forEach(($,v)=>{if($.status==="done"){$.selected=!0;const q=r.querySelector(`#preview-item-${v} input[type="checkbox"]`);q&&(q.checked=!0)}}),u()}),(I=r.querySelector("#selectNoneBtn"))==null||I.addEventListener("click",()=>{s.forEach(($,v)=>{$.selected=!1;const q=r.querySelector(`#preview-item-${v} input[type="checkbox"]`);q&&(q.checked=!1)}),u()}),(x=r.querySelector("#previewList"))==null||x.addEventListener("change",$=>{const v=$.target;if(v.type==="checkbox"&&v.dataset.index){const q=parseInt(v.dataset.index,10);s[q].selected=v.checked,u()}}),(g=r.querySelector("#previewList"))==null||g.addEventListener("input",$=>{const v=$.target;if(v.classList.contains("ai-preview-textarea")&&v.dataset.index){const q=parseInt(v.dataset.index,10);s[q].generated=v.value}}),(C=r.querySelector("#previewList"))==null||C.addEventListener("click",async $=>{const v=$.target;if(v.classList.contains("ai-regenerate-btn")&&v.dataset.index){const q=parseInt(v.dataset.index,10);await y(q)}}),(z=r.querySelector("#applyPreviewBtn"))==null||z.addEventListener("click",()=>{i=!0,A(),r.remove(),n()})}async function y(m){if(a.has(m))return;const h=s[m];a.add(m),h.status="generating",d(m);try{const p=await qe(h.question,h.answer1,h.answer2);p?(h.generated=p,h.status="done",h.selected=!0):h.status="error"}catch(p){console.warn("Regeneration error:",p),h.status="error"}a.delete(m),d(m)}function A(){let m=0;for(const h of s)if(h.selected&&h.status==="done"&&h.generated){const p=E.find(k=>k.id===h.rowId);p&&(p.comment=h.generated,p.included=!0,m++)}pe(t),m>0&&He(`${m} KI-Vorschläge übernommen`)}r.innerHTML=o(),document.body.appendChild(r),b();async function B(){for(let m=0;m<s.length&&!i;m++){const h=s[m];h.status="generating",d(m);try{const p=await qe(h.question,h.answer1,h.answer2);if(i)break;p?(h.generated=p,h.status="done"):(h.status="error",h.selected=!1)}catch(p){console.warn("Generation error:",p),h.status="error",h.selected=!1}d(m)}f()}B()}function Ve(){const t=E.filter(i=>i.included).filter(i=>i.answer1||i.answer2);let n=`Hi ${K} und ${j},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;const s={question:Math.max(10,...t.map(i=>i.question.length)),answer1:Math.max(K.length,...t.map(i=>(i.answer1||"-").length)),answer2:Math.max(j.length,...t.map(i=>(i.answer2||"-").length))};s.question=Math.min(s.question,30),s.answer1=Math.min(s.answer1,25),s.answer2=Math.min(s.answer2,25),n+=ee("Frage",s.question)+" | ",n+=ee(K,s.answer1)+" | ",n+=ee(j,s.answer2)+" | ",n+=`Gemeinsamkeit
`,n+="-".repeat(s.question)+"-+-",n+="-".repeat(s.answer1)+"-+-",n+="-".repeat(s.answer2)+"-+-",n+="-".repeat(20)+`
`;for(const i of t){const a=ue(i.comment);n+=ee(ce(i.question,s.question),s.question)+" | ",n+=ee(ce(i.answer1||"-",s.answer1),s.answer1)+" | ",n+=ee(ce(i.answer2||"-",s.answer2),s.answer2)+" | ",n+=(a||"")+`
`}return n+=`
Ich freue mich über eure Rückmeldung!
`,n}function ee(e,t){return e.length>=t?e.substring(0,t):e+" ".repeat(t-e.length)}function ce(e,t){return e?e.length<=t?e:e.substring(0,t-2)+"..":""}function Qn(){const t=E.filter(s=>s.included).filter(s=>s.answer1||s.answer2);let n=`<!--StartFragment-->
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
  Hi <strong>${w(K)}</strong> und <strong>${w(j)}</strong>,<br><br>
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
      <th style="width: 25%;">${w(K)}</th>
      <th style="width: 25%;">${w(j)}</th>
      <th style="width: 25%;">Gemeinsamkeit</th>
    </tr>
  </thead>
  <tbody>
`;for(const s of t){const i=es(s.comment);n+=`    <tr>
      <td><strong>${w(s.question)}</strong></td>
      <td>${w(s.answer1)||"-"}</td>
      <td>${w(s.answer2)||"-"}</td>
      <td class="commonality">${i}</td>
    </tr>
`}return n+=`  </tbody>
</table>

<p><br>Ich freue mich über eure Rückmeldung!</p>
</body>
</html>
<!--EndFragment-->`,n}function St(){return E.filter(e=>e.included).map(e=>({question:e.question,answer1:e.answer1,answer2:e.answer2,commonality:e.comment}))}function ct(e){if(!e||typeof e!="string")return"Partner*in";const t=e.match(/\(([^)]+)\)/);if(t){const s=t[1].trim().split(/[\s,]+/)[0];if(s&&s.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(s))return s}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(e)){const n=e.split(/[\s,]+/)[0];if(n&&n.length>1)return n}return"Partner*in"}function w(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function We(e){if(!e)return null;const t=e.match(/\[🗺️\]\((https?:\/\/[^)]+)\)/);return t?t[1]:null}function ue(e){return e?e.replace(/\s*\[🗺️\]\(https?:\/\/[^)]+\)/,"").trim():""}function Yn(e){const t=We(e);return t?`<a href="${t}" target="_blank" class="btn-icon map-link-btn" title="Route in Google Maps öffnen">🗺️</a>`:""}function Xn(e){if(!e)return"";const t=We(e);if(t){const n=ue(e);return`${w(n)} <a href="${t}" target="_blank" class="map-link">🗺️ Route</a>`}return w(e)}function es(e){if(!e)return"";const t=We(e);if(t){const n=ue(e);return`${w(n)} <a href="${t}" style="color: #009892;">🗺️ Route anzeigen</a>`}return w(e)}function ts(){lt(),window.addEventListener("tandems-updated",lt),window.addEventListener("create-match",s=>{const i=s;is(i.detail.profile1,i.detail.profile2)}),window.addEventListener("edit-tandem",s=>{as(s.detail.tandem)});const e=document.getElementById("closeMatchModal"),t=document.getElementById("cancelMatch"),n=document.getElementById("confirmMatch");e==null||e.addEventListener("click",Fe),t==null||t.addEventListener("click",Fe),n==null||n.addEventListener("click",rs)}function lt(){const e=document.getElementById("tandemList");if(!e)return;const t=de();if(t.length===0){e.innerHTML='<p class="empty-state">Noch keine Tandems erstellt. Wähle zwei Profile aus, um ein Tandem zu erstellen.</p>';return}e.innerHTML=t.sort((n,s)=>new Date(s.created).getTime()-new Date(n.created).getTime()).map(n=>ss(n)).join(""),e.querySelectorAll(".delete-tandem").forEach(n=>{n.addEventListener("click",s=>{s.stopPropagation();const i=n.getAttribute("data-tandem-id");i&&confirm("Tandem wirklich löschen?")&&ft(i)})}),e.querySelectorAll(".copy-tandem").forEach(n=>{n.addEventListener("click",s=>{s.stopPropagation();const i=n.getAttribute("data-tandem-id");i&&ns(i)})})}function ns(e){const n=de().find(r=>r.id===e);if(!n)return;if(n.suggestionText){navigator.clipboard.writeText(n.suggestionText).then(()=>{ut("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")});return}const s=dt(n.profile1.name),i=dt(n.profile2.name);let a=`Hi ${s} und ${i},

hier ist ein Tandemvorschlag für euch 😊 Lest euch das gerne einmal durch – ich finde, ihr habt einige Gemeinsamkeiten und Interessen. Lest euch die Tabelle gerne durch.

Ihr findet: Eure Angaben, die Angaben der anderen Person, meine Einschätzung.

Auch wenn es auf den ersten Blick nicht zu 100% passt, probiert es vielleicht aus. Natürlich nur, wenn ihr Lust drauf habt. Wenn nicht, ist das auch okay.

EURE GEMEINSAMKEITEN UND PROFILE IM ÜBERBLICK
----------------------------------------------

`;if(n.commonalities&&n.commonalities.length>0){const r={question:Math.max(10,...n.commonalities.map(o=>o.question.length)),answer1:Math.max(s.length,...n.commonalities.map(o=>(o.answer1||"-").length)),answer2:Math.max(i.length,...n.commonalities.map(o=>(o.answer2||"-").length))};r.question=Math.min(r.question,30),r.answer1=Math.min(r.answer1,25),r.answer2=Math.min(r.answer2,25),a+=te("Frage",r.question)+" | ",a+=te(s,r.answer1)+" | ",a+=te(i,r.answer2)+" | ",a+=`Gemeinsamkeit
`,a+="-".repeat(r.question)+"-+-",a+="-".repeat(r.answer1)+"-+-",a+="-".repeat(r.answer2)+"-+-",a+="-".repeat(20)+`
`;for(const o of n.commonalities)a+=te(Pe(o.question,r.question),r.question)+" | ",a+=te(Pe(o.answer1||"-",r.answer1),r.answer1)+" | ",a+=te(Pe(o.answer2||"-",r.answer2),r.answer2)+" | ",a+=(o.commonality||"")+`
`}a+=`
Ich freue mich über eure Rückmeldung!
`,navigator.clipboard.writeText(a).then(()=>{ut("Text kopiert!")}).catch(()=>{alert("Fehler beim Kopieren")})}function te(e,t){return e.length>=t?e.substring(0,t):e+" ".repeat(t-e.length)}function Pe(e,t){return e?e.length<=t?e:e.substring(0,t-2)+"..":""}function dt(e){if(!e||typeof e!="string")return"Partner*in";const t=e.match(/\(([^)]+)\)/);if(t){const s=t[1].trim().split(/[\s,]+/)[0];if(s&&s.length>1&&!/^(locals?|einwander|interview|gespräch)/i.test(s))return s}if(!/^(aufnahmegespräch|interview|gespräch)/i.test(e)){const n=e.split(/[\s,]+/)[0];if(n&&n.length>1)return n}return"Partner*in"}function ut(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),2e3)}function ss(e){const t=new Date(e.created).toLocaleDateString("de-DE"),n=Ue(e.matchScore);return`
    <div class="tandem-card" data-tandem-id="${e.id}">
      <div class="header">
        <div class="title">${_(e.name)}</div>
        <div class="meta">
          <span class="stars">${n}</span>
          <span class="date">${t}</span>
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
          ${e.commonalities.slice(0,3).map(s=>`
            <div class="commonality">• ${_(s.commonality)}</div>
          `).join("")}
          ${e.commonalities.length>3?`<div class="commonality">... und ${e.commonalities.length-3} weitere</div>`:""}
        </div>
      `:""}
    </div>
  `}function Ue(e){let t="";for(let n=0;n<5;n++)t+=`<span class="star ${n<e?"":"empty"}">★</span>`;return t}let ve=null;function is(e,t){const n=document.getElementById("matchModal"),s=document.getElementById("matchPreview");if(!n||!s)return;ve={profile1:e,profile2:t};const i=Ge(e,t);s.innerHTML=`
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
        <span class="stars">${Ue(i.score)}</span>
      </div>
      <div id="tandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    </div>
  `;const a=document.getElementById("tandemEditorContainer");a&&It(a,e,t),n.classList.add("visible")}function Fe(){const e=document.getElementById("matchModal");e==null||e.classList.remove("visible"),ve=null}function rs(){if(!ve)return;const{profile1:e,profile2:t}=ve,n=Ge(e,t),s=Ve(),i=St(),a={id:crypto.randomUUID(),profile1:e,profile2:t,name:`${e.name} & ${t.name}`,created:new Date().toISOString(),commonalities:i,matchScore:n.score,suggestionText:s};xt(a),Fe(),Ze(`Tandem erstellt: ${e.name} & ${t.name}`)}function Ze(e){let t=document.getElementById("successToast");t||(t=document.createElement("div"),t.id="successToast",t.className="success-toast",document.body.appendChild(t)),t.textContent=e,t.classList.add("visible"),setTimeout(()=>t==null?void 0:t.classList.remove("visible"),3e3)}function _(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let V=null;function as(e){var s,i,a,r;V=e;let t=document.getElementById("editTandemModal");t||(t=document.createElement("div"),t.id="editTandemModal",t.className="modal",t.innerHTML=`
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
    `,document.body.appendChild(t),(s=t.querySelector("#closeEditModal"))==null||s.addEventListener("click",Ee),(i=t.querySelector("#cancelEditTandem"))==null||i.addEventListener("click",Ee),(a=t.querySelector("#dissolveTandem"))==null||a.addEventListener("click",os),(r=t.querySelector("#saveEditTandem"))==null||r.addEventListener("click",cs));const n=document.getElementById("editTandemContent");if(n){const o=new Date(e.created).toLocaleDateString("de-DE");n.innerHTML=`
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
          <span class="stars">${Ue(e.matchScore)}</span>
          <span class="date">Erstellt am: ${o}</span>
        </div>
      </div>
      <div id="editTandemEditorContainer" class="tandem-editor-container">
        <!-- Editor wird hier eingefügt -->
      </div>
    `;const c=document.getElementById("editTandemEditorContainer");c&&It(c,e.profile1,e.profile2)}t.classList.add("visible")}function Ee(){const e=document.getElementById("editTandemModal");e==null||e.classList.remove("visible"),V=null}function os(){if(!V)return;const e=`Tandem zwischen "${V.profile1.name}" und "${V.profile2.name}" wirklich auflösen?

Die Profile können dann erneut gematcht werden.`;confirm(e)&&(ft(V.id),Ee(),Ze("Tandem aufgelöst - Profile können neu gematcht werden"))}function cs(){if(!V)return;const e=Ve(),t=St();zt(V.id,{suggestionText:e,commonalities:t}),Ee(),Ze("Tandem aktualisiert")}const ls="modulepreload",ds=function(e,t){return new URL(e,t).href},mt={},us=function(t,n,s){let i=Promise.resolve();if(n&&n.length>0){const r=document.getElementsByTagName("link"),o=document.querySelector("meta[property=csp-nonce]"),c=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));i=Promise.allSettled(n.map(l=>{if(l=ds(l,s),l in mt)return;mt[l]=!0;const d=l.endsWith(".css"),u=d?'[rel="stylesheet"]':"";if(!!s)for(let y=r.length-1;y>=0;y--){const A=r[y];if(A.href===l&&(!d||A.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${u}`))return;const b=document.createElement("link");if(b.rel=d?"stylesheet":ls,d||(b.as="script"),b.crossOrigin="",b.href=l,c&&b.setAttribute("nonce",c),document.head.appendChild(b),d)return new Promise((y,A)=>{b.addEventListener("load",y),b.addEventListener("error",()=>A(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return i.then(r=>{for(const o of r||[])o.status==="rejected"&&a(o.reason);return t().catch(a)})};function ms(){const e=document.getElementById("exportExcel"),t=document.getElementById("exportCSV"),n=document.getElementById("exportJSON"),s=document.getElementById("importBackup"),i=document.getElementById("manageProfilesBtn"),a=document.getElementById("deleteAllProfilesBtn");e==null||e.addEventListener("click",hs),t==null||t.addEventListener("click",fs),n==null||n.addEventListener("click",gs),s==null||s.addEventListener("click",ps),i==null||i.addEventListener("click",ws),a==null||a.addEventListener("click",bs),xe(),window.addEventListener("tandems-updated",xe),window.addEventListener("profiles-updated",xe)}function xe(){const e=document.getElementById("statsContainer");if(!e)return;const t=W(),n=de(),s=Nt(),i=n.length>0?(n.reduce((a,r)=>a+r.matchScore,0)/n.length).toFixed(1):"-";e.innerHTML=`
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
  `}async function hs(){const e=de();if(e.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}try{const t=await us(()=>import("./xlsx-D_0l8YDs.js"),[],import.meta.url),n=e.map(r=>({Tandem:r.name,"Person 1":r.profile1.name,"Person 2":r.profile2.name,"Match-Score":r.matchScore,Erstellt:new Date(r.created).toLocaleDateString("de-DE"),Gemeinsamkeiten:r.commonalities.map(o=>o.commonality).join("; ")})),s=t.utils.json_to_sheet(n),i=t.utils.book_new();t.utils.book_append_sheet(i,s,"Tandems");const a=`tandems_${new Date().toISOString().split("T")[0]}.xlsx`;t.writeFile(i,a)}catch(t){console.error("Excel export error:",t),alert("Fehler beim Excel-Export. Bitte versuche den CSV-Export.")}}function fs(){const e=de();if(e.length===0){alert("Keine Tandems zum Exportieren vorhanden.");return}const t=["Tandem","Person 1","Person 2","Match-Score","Erstellt","Gemeinsamkeiten"],n=e.map(i=>[i.name,i.profile1.name,i.profile2.name,String(i.matchScore),new Date(i.created).toLocaleDateString("de-DE"),i.commonalities.map(a=>a.commonality).join("; ")]),s=[t.join(";"),...n.map(i=>i.map(a=>`"${a.replace(/"/g,'""')}"`).join(";"))].join(`
`);Mt(s,`tandems_${new Date().toISOString().split("T")[0]}.csv`,"text/csv;charset=utf-8")}function gs(){const e=Rt();Mt(e,`tandem-matcher-backup_${new Date().toISOString().split("T")[0]}.json`,"application/json")}function ps(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=t=>{var i;const n=(i=t.target.files)==null?void 0:i[0];if(!n)return;const s=new FileReader;s.onload=a=>{var r;try{const o=(r=a.target)==null?void 0:r.result;confirm("Achtung: Alle bestehenden Daten werden überschrieben. Fortfahren?")&&(Dt(o),alert("Backup erfolgreich wiederhergestellt!"),location.reload())}catch(o){alert("Fehler beim Wiederherstellen: "+o.message)}},s.readAsText(n)},e.click()}function Mt(e,t,n){const s=new Blob([e],{type:n}),i=URL.createObjectURL(s),a=document.createElement("a");a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)}function bs(){const e=W();if(e.length===0){alert("Keine Profile vorhanden.");return}confirm(`Möchtest du wirklich ALLE ${e.length} Profile löschen?

Diese Aktion kann nicht rückgängig gemacht werden!`)&&confirm("Bist du sicher? Alle Profile werden unwiderruflich gelöscht.")&&(Pt(),window.dispatchEvent(new Event("profiles-updated")),alert("Alle Profile wurden gelöscht."))}function ws(){const e=W();if(re(),e.length===0){alert("Keine Profile vorhanden.");return}const t=document.createElement("div");t.className="modal visible",t.id="profileManageModal";function n(){const c=W(),l=re();return c.map(d=>{const u=l.has(d.id),f=d.group==="local"?"Local":"Newcomer",b=d.group==="local"?"local":"newcomer";return`
        <div class="profile-manage-item ${u?"matched":""}" data-id="${d.id}">
          <div class="profile-manage-info">
            <span class="profile-manage-name">${vs(d.name)}</span>
            <span class="profile-manage-group ${b}">${f}</span>
            ${u?'<span class="profile-manage-badge">In Tandem</span>':""}
          </div>
          <button class="btn btn-sm btn-danger profile-delete-btn" data-id="${d.id}" ${u?'disabled title="Profil ist in einem Tandem"':""}>
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
  `,document.body.appendChild(t);const s=t.querySelector("#closeProfileManageModal"),i=t.querySelector("#closeProfileManageBtn"),a=t.querySelector("#profileSearchInput"),r=t.querySelector("#profileManageList");function o(){t.remove()}s==null||s.addEventListener("click",o),i==null||i.addEventListener("click",o),t.addEventListener("click",c=>{c.target===t&&o()}),a==null||a.addEventListener("input",()=>{const c=a.value.toLowerCase(),l=r==null?void 0:r.querySelectorAll(".profile-manage-item");l==null||l.forEach(d=>{var f,b;const u=((b=(f=d.querySelector(".profile-manage-name"))==null?void 0:f.textContent)==null?void 0:b.toLowerCase())||"";d.style.display=u.includes(c)?"flex":"none"})}),r==null||r.addEventListener("click",c=>{var d,u;const l=c.target;if(l.classList.contains("profile-delete-btn")&&!l.hasAttribute("disabled")){const f=l.dataset.id;if(!f)return;const b=((u=(d=l.closest(".profile-manage-item"))==null?void 0:d.querySelector(".profile-manage-name"))==null?void 0:u.textContent)||"Unbekannt";if(confirm(`Profil "${b}" wirklich löschen?`)){Ct(f),window.dispatchEvent(new Event("profiles-updated")),r&&(r.innerHTML=n());const A=t.querySelector(".profile-manage-header p"),B=W();A&&(A.innerHTML=`<strong>${B.length}</strong> Profile geladen`),B.length===0&&(o(),alert("Alle Profile wurden gelöscht."))}}})}function vs(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}document.addEventListener("DOMContentLoaded",async()=>{console.log("Tandem-Matcher v2.0 initialisiert"),await $t(),Es(),vn(),jt(),en(),mn(),ts(),ms(),ys(),Ls(),Is(),ks()});function Es(){const e=document.querySelectorAll(".tab"),t=document.querySelectorAll(".tab-content");e.forEach(n=>{n.addEventListener("click",()=>{const s=n.dataset.tab;s&&(e.forEach(i=>i.classList.remove("active")),n.classList.add("active"),t.forEach(i=>{i.classList.toggle("active",i.id===`${s}-tab`)}))})})}function ys(){const e=document.querySelectorAll(".view-btn"),t=document.getElementById("profileSidebar"),n=document.getElementById("mapContainer");e.forEach(s=>{s.addEventListener("click",()=>{const i=s.dataset.view;!i||!t||!n||(e.forEach(a=>a.classList.remove("active")),s.classList.add("active"),i==="list"?(t.classList.add("mobile-visible"),n.classList.add("mobile-hidden")):(t.classList.remove("mobile-visible"),n.classList.remove("mobile-hidden"),setTimeout(()=>{window.dispatchEvent(new Event("resize")),window.dispatchEvent(new Event("map-needs-resize"))},100)))})})}async function ks(){const e=document.getElementById("ollamaStatus");if(e)try{const t=await kt();t.available&&t.model?(e.className="ollama-status available",e.textContent=`Verfügbar: ${t.model}`):t.available?(e.className="ollama-status unavailable",e.textContent="Ollama läuft, aber kein Modell installiert"):(e.className="ollama-status unavailable",e.textContent="Nicht verfügbar - Ollama installieren")}catch{e.className="ollama-status unavailable",e.textContent="Nicht verfügbar"}}function Is(){const e=document.getElementById("helpBtn"),t=document.getElementById("helpModal"),n=document.getElementById("closeHelpModal");e==null||e.addEventListener("click",()=>{t==null||t.classList.add("visible")}),n==null||n.addEventListener("click",()=>{t==null||t.classList.remove("visible")}),t==null||t.addEventListener("click",s=>{s.target===t&&t.classList.remove("visible")}),localStorage.getItem("swaf_help_shown")||setTimeout(()=>{t==null||t.classList.add("visible"),localStorage.setItem("swaf_help_shown","true")},500)}function Ls(){window.addEventListener("focus",async()=>{try{const e=await navigator.clipboard.readText();e&&e.includes('"version"')&&e.includes('"profiles"')&&confirm("Profile-Daten in der Zwischenablage erkannt. Importieren?")&&window.dispatchEvent(new CustomEvent("import-from-clipboard",{detail:e}))}catch{}})}window.TandemMatcher={version:"2.0.0"};
