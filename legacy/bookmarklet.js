/**
 * Tandem-Matcher Legacy Bookmarklet
 *
 * Dieses Bookmarklet sammelt Profildaten von portal.startwithafriend.de
 * und speichert sie für den Import in den Tandem-Matcher.
 *
 * Installation:
 * 1. Erstelle ein neues Lesezeichen in deinem Browser
 * 2. Als URL den minifizierten Code unten einfügen
 * 3. Auf portal.startwithafriend.de Profilseiten öffnen und Bookmarklet klicken
 *
 * HINWEIS: Dieses Bookmarklet ist der Legacy-Fallback.
 * Die empfohlene Methode ist die Chrome Extension.
 */

(function() {
  try {
    // Profil-Datenstruktur
    var d = {
      url: location.href,
      name: '',
      fields: [],
      pageType: '',
      timestamp: Date.now()
    };

    // Toast-Benachrichtigung anzeigen
    function showToast(msg, isError) {
      var t = document.getElementById('swafToast');
      if (t) t.remove();

      t = document.createElement('div');
      t.id = 'swafToast';
      t.textContent = msg;

      Object.assign(t.style, {
        position: 'fixed',
        top: '60px',
        right: '10px',
        zIndex: 999999,
        background: isError ? '#c00' : '#2a9d8f',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'opacity 0.3s'
      });

      document.body.appendChild(t);

      setTimeout(function() {
        t.style.opacity = '0';
        setTimeout(function() {
          t.remove();
        }, 300);
      }, 2000);
    }

    // Alle gesammelten Daten löschen
    function clearData() {
      localStorage.removeItem('swaf_batch_profiles');
      showToast('Alle Daten gelöscht!');
    }

    // Lösch-Button erstellen
    function createClearButton() {
      if (document.getElementById('swafClearBtn')) return;

      var b = document.createElement('button');
      b.id = 'swafClearBtn';
      b.textContent = 'Daten löschen';

      Object.assign(b.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 999999,
        background: '#c00',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px'
      });

      b.onclick = clearData;
      document.body.appendChild(b);
    }

    // Feldwert aus Container extrahieren
    function getFieldValue(container) {
      // Hidden Input
      var hiddenInput = container.querySelector('input[type=hidden]');
      if (hiddenInput && hiddenInput.value) return hiddenInput.value;

      // Text Input
      var input = container.querySelector('input.o_input, input.o-autocomplete--input, input.o_datepicker_input');
      if (input && input.value && input.value.trim().length > 0) return input.value.trim();

      // Select
      var select = container.querySelector('select');
      if (select && select.value) {
        return select.options[select.selectedIndex] ? select.options[select.selectedIndex].text.trim() : '';
      }

      // Span
      var span = container.querySelector('span:not([class])');
      if (!span) span = container.querySelector('span');
      if (span && span.textContent && span.textContent.trim().length > 0) {
        var txt = span.textContent.trim();
        if (!txt.includes('o_field') && txt !== 'false' && txt !== 'true') return txt;
      }

      // Textarea
      var textarea = container.querySelector('textarea');
      if (textarea && textarea.value) return textarea.value.trim();

      return '';
    }

    // Profildaten sammeln
    function collectData() {
      // Interview-Seite erkennen
      if (document.querySelector('.js_question-wrapper')) {
        d.pageType = 'Interview';

        var h = document.querySelector('h1') || document.querySelector('.breadcrumb-item.active');
        d.name = h ? (h.textContent || '').trim() : 'Interview_' + Date.now();

        // Interview-Fragen sammeln
        document.querySelectorAll('.js_question-wrapper').forEach(function(w) {
          var qEl = w.querySelector('h2 span.text-break') || w.querySelector('h2');
          if (!qEl) return;

          var q = qEl.textContent.trim();
          var ans = [];

          // Checkboxen und Radios
          w.querySelectorAll('input[type=checkbox]:checked, input[type=radio]:checked').forEach(function(inp) {
            var sp = inp.nextElementSibling;
            if (sp && sp.tagName === 'SPAN') {
              ans.push(sp.textContent.trim());
            } else {
              var parent = inp.closest('label');
              if (parent) ans.push(parent.textContent.trim());
            }
          });

          // Selects
          w.querySelectorAll('select').forEach(function(sel) {
            if (sel.value && sel.selectedIndex > 0) {
              var opt = sel.options[sel.selectedIndex];
              if (opt) ans.push(opt.text.trim());
            }
          });

          // Textareas
          w.querySelectorAll('textarea').forEach(function(ta) {
            if (ta.disabled || ta.offsetHeight === 0 || ta.offsetWidth === 0) return;
            var c = ta.value.trim() || ta.textContent.trim();
            if (c && c.length > 0) ans.push(c);
          });

          // Text Inputs
          w.querySelectorAll('input[type=text], input[type=email], input[type=number], input[type=tel]').forEach(function(inp) {
            var v = inp.value.trim();
            if (v && v.length > 0) ans.push(v);
          });

          var answer = ans.filter(function(a) { return a && a.length > 0; }).join(', ');
          if (q && answer) d.fields.push({ question: q, answer: answer });
        });

      } else {
        // Hauptprofil-Seite
        d.pageType = 'Hauptprofil';

        // Name finden
        var nameEl = document.querySelector('span[name=name]') ||
                     document.querySelector('input[name=name]') ||
                     document.querySelector('.o_field_char input') ||
                     document.querySelector('h1');

        if (nameEl) d.name = (nameEl.value || nameEl.textContent || nameEl.innerText || '').trim();
        if (!d.name) d.name = 'Profil_' + Date.now();

        var processedFields = new Set();

        // Label-basierte Felder
        document.querySelectorAll('label.o_form_label[for]').forEach(function(label) {
          var forId = label.getAttribute('for');
          if (!forId) return;

          var input = document.getElementById(forId);
          var container = input ? input.closest('div.o_field_widget') : null;
          if (!container) container = document.querySelector('div.o_field_widget[name="' + forId + '"]');

          if (container) {
            var fieldName = container.getAttribute('name') || forId;
            if (processedFields.has(fieldName)) return;

            var q = label.textContent.trim().replace(':', '');
            var a = getFieldValue(container);

            if (q && a && a.length > 0 && q !== a) {
              d.fields.push({ question: q, answer: a });
              processedFields.add(fieldName);
            }
          }
        });

        // Widget-basierte Felder
        document.querySelectorAll('div.o_field_widget[name]').forEach(function(container) {
          var fieldName = container.getAttribute('name');
          if (processedFields.has(fieldName)) return;

          var label = document.querySelector('label.o_form_label[for="' + fieldName + '"]');
          if (!label) {
            var wrap = container.closest('.o_wrap_field');
            if (wrap) label = wrap.querySelector('label.o_form_label');
          }
          if (!label) {
            var row = container.closest('tr');
            if (row) label = row.querySelector('label.o_form_label');
          }

          if (label) {
            var q = label.textContent.trim().replace(':', '');
            var a = getFieldValue(container);

            if (q && a && a.length > 0 && q !== a) {
              d.fields.push({ question: q, answer: a });
              processedFields.add(fieldName);
            }
          }
        });

        // Tab-Pane Felder
        document.querySelectorAll('.tab-pane tr').forEach(function(row) {
          var label = row.querySelector('label.o_form_label');
          var field = row.querySelector('div.o_field_widget[name], span.o_field_widget, a.o_field_widget');

          if (label && field && !field.classList.contains('o_field_empty')) {
            var fieldName = field.getAttribute('name') || '';
            if (fieldName && processedFields.has(fieldName)) return;

            var q = label.textContent.trim().replace(':', '');
            var a = getFieldValue(field);

            if (q && a && a.length > 0 && q !== a) {
              d.fields.push({ question: q, answer: a });
              if (fieldName) processedFields.add(fieldName);
            }
          }
        });
      }

      // Profile in Batch speichern
      var stored = localStorage.getItem('swaf_batch_profiles');
      var arr = [];

      if (stored) {
        try {
          var parsed = JSON.parse(stored);
          arr = Array.isArray(parsed) ? parsed : (parsed.profiles || []);
        } catch (e) {
          arr = [];
        }
      }

      arr.push(d);
      localStorage.setItem('swaf_batch_profiles', JSON.stringify(arr));

      // In Zwischenablage kopieren (im SWAF-Format)
      var clipText = '';
      arr.forEach(function(p) {
        clipText += 'SWAF_PROFILE_START' + JSON.stringify(p) + 'SWAF_PROFILE_END\n';
      });

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(clipText).then(function() {
          showToast(arr.length + ' Profile gesammelt');
        }).catch(function() {
          showToast(arr.length + ' Profile gesammelt');
        });
      } else {
        showToast(arr.length + ' Profile gesammelt');
      }
    }

    // Ausführen
    createClearButton();
    collectData();

  } catch (e) {
    showToast('Fehler: ' + e.message, true);
  }
})();

/**
 * MINIFIZIERTER CODE FÜR BOOKMARKLET:
 *
 * Kopiere den folgenden Code und füge ihn als URL in ein Lesezeichen ein:
 *
 * javascript:(function(){try{var d={url:location.href,name:'',fields:[],pageType:'',timestamp:Date.now()};function showToast(msg,isError){var t=document.getElementById('swafToast');if(t)t.remove();t=document.createElement('div');t.id='swafToast';t.textContent=msg;Object.assign(t.style,{position:'fixed',top:'60px',right:'10px',zIndex:999999,background:isError?'%23c00':'%232a9d8f',color:'%23fff',padding:'12px 20px',borderRadius:'8px',fontSize:'14px',fontWeight:'bold',boxShadow:'0 4px 12px rgba(0,0,0,0.3)',transition:'opacity 0.3s'});document.body.appendChild(t);setTimeout(function(){t.style.opacity='0';setTimeout(function(){t.remove();},300);},2000);}function clearData(){localStorage.removeItem('swaf_batch_profiles');showToast('Alle Daten geloescht!');}function createClearButton(){if(document.getElementById('swafClearBtn'))return;var b=document.createElement('button');b.id='swafClearBtn';b.textContent='Daten loeschen';Object.assign(b.style,{position:'fixed',top:'10px',right:'10px',zIndex:999999,background:'%23c00',color:'%23fff',border:'none',padding:'8px 12px',borderRadius:'6px',cursor:'pointer',fontSize:'14px'});b.onclick=clearData;document.body.appendChild(b);}function getFieldValue(container){var hiddenInput=container.querySelector('input[type=hidden]');if(hiddenInput%26%26hiddenInput.value)return hiddenInput.value;var input=container.querySelector('input.o_input,input.o-autocomplete--input,input.o_datepicker_input');if(input%26%26input.value%26%26input.value.trim().length%3E0)return input.value.trim();var select=container.querySelector('select');if(select%26%26select.value)return select.options[select.selectedIndex]?select.options[select.selectedIndex].text.trim():'';var span=container.querySelector('span:not([class])');if(!span)span=container.querySelector('span');if(span%26%26span.textContent%26%26span.textContent.trim().length%3E0){var txt=span.textContent.trim();if(!txt.includes('o_field')%26%26txt!=='false'%26%26txt!=='true')return txt;}var textarea=container.querySelector('textarea');if(textarea%26%26textarea.value)return textarea.value.trim();return'';}function collectData(){if(document.querySelector('.js_question-wrapper')){d.pageType='Interview';var h=document.querySelector('h1')||document.querySelector('.breadcrumb-item.active');d.name=h?(h.textContent||'').trim():'Interview_'+Date.now();document.querySelectorAll('.js_question-wrapper').forEach(function(w){var qEl=w.querySelector('h2 span.text-break')||w.querySelector('h2');if(!qEl)return;var q=qEl.textContent.trim();var ans=[];w.querySelectorAll('input[type=checkbox]:checked,input[type=radio]:checked').forEach(function(inp){var sp=inp.nextElementSibling;if(sp%26%26sp.tagName==='SPAN'){ans.push(sp.textContent.trim());}else{var parent=inp.closest('label');if(parent)ans.push(parent.textContent.trim());}});w.querySelectorAll('select').forEach(function(sel){if(sel.value%26%26sel.selectedIndex%3E0){var opt=sel.options[sel.selectedIndex];if(opt)ans.push(opt.text.trim());}});w.querySelectorAll('textarea').forEach(function(ta){if(ta.disabled||ta.offsetHeight===0||ta.offsetWidth===0)return;var c=ta.value.trim()||ta.textContent.trim();if(c%26%26c.length%3E0)ans.push(c);});w.querySelectorAll('input[type=text],input[type=email],input[type=number],input[type=tel]').forEach(function(inp){var v=inp.value.trim();if(v%26%26v.length%3E0)ans.push(v);});var answer=ans.filter(function(a){return a%26%26a.length%3E0;}).join(', ');if(q%26%26answer)d.fields.push({question:q,answer:answer});});}else{d.pageType='Hauptprofil';var nameEl=document.querySelector('span[name=name]')||document.querySelector('input[name=name]')||document.querySelector('.o_field_char input')||document.querySelector('h1');if(nameEl)d.name=(nameEl.value||nameEl.textContent||nameEl.innerText||'').trim();if(!d.name)d.name='Profil_'+Date.now();var processedFields=new Set();document.querySelectorAll('label.o_form_label[for]').forEach(function(label){var forId=label.getAttribute('for');if(!forId)return;var input=document.getElementById(forId);var container=input?input.closest('div.o_field_widget'):null;if(!container)container=document.querySelector('div.o_field_widget[name=%22'+forId+'%22]');if(container){var fieldName=container.getAttribute('name')||forId;if(processedFields.has(fieldName))return;var q=label.textContent.trim().replace(':','');var a=getFieldValue(container);if(q%26%26a%26%26a.length%3E0%26%26q!==a){d.fields.push({question:q,answer:a});processedFields.add(fieldName);}}});document.querySelectorAll('div.o_field_widget[name]').forEach(function(container){var fieldName=container.getAttribute('name');if(processedFields.has(fieldName))return;var label=document.querySelector('label.o_form_label[for=%22'+fieldName+'%22]');if(!label){var wrap=container.closest('.o_wrap_field');if(wrap)label=wrap.querySelector('label.o_form_label');}if(!label){var row=container.closest('tr');if(row)label=row.querySelector('label.o_form_label');}if(label){var q=label.textContent.trim().replace(':','');var a=getFieldValue(container);if(q%26%26a%26%26a.length%3E0%26%26q!==a){d.fields.push({question:q,answer:a});processedFields.add(fieldName);}}});document.querySelectorAll('.tab-pane tr').forEach(function(row){var label=row.querySelector('label.o_form_label');var field=row.querySelector('div.o_field_widget[name],span.o_field_widget,a.o_field_widget');if(label%26%26field%26%26!field.classList.contains('o_field_empty')){var fieldName=field.getAttribute('name')||'';if(fieldName%26%26processedFields.has(fieldName))return;var q=label.textContent.trim().replace(':','');var a=getFieldValue(field);if(q%26%26a%26%26a.length%3E0%26%26q!==a){d.fields.push({question:q,answer:a});if(fieldName)processedFields.add(fieldName);}}});}var stored=localStorage.getItem('swaf_batch_profiles');var arr=[];if(stored){try{var parsed=JSON.parse(stored);arr=Array.isArray(parsed)?parsed:(parsed.profiles||[]);}catch(e){arr=[];}}arr.push(d);localStorage.setItem('swaf_batch_profiles',JSON.stringify(arr));var clipText='';arr.forEach(function(p){clipText+='SWAF_PROFILE_START'+JSON.stringify(p)+'SWAF_PROFILE_END\n';});if(navigator.clipboard%26%26navigator.clipboard.writeText){navigator.clipboard.writeText(clipText).then(function(){showToast(arr.length+' Profile gesammelt');}).catch(function(){showToast(arr.length+' Profile gesammelt');});}else{showToast(arr.length+' Profile gesammelt');}}createClearButton();collectData();}catch(e){showToast('Fehler: '+e.message,true);}})();
 */
