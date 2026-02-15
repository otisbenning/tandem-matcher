# Tandem-Matcher v2.0

Matching-Tool für [Start with a Friend](https://www.startwithafriend.de/) - Paart Locals mit Newcomern für Tandem-Partnerschaften.

**Live-Demo:** [https://otisbenning.github.io/tandem-matcher/](https://otisbenning.github.io/tandem-matcher/)

## Struktur

```
Tandem-Matcher/
├── extension/          # Chrome Extension zum Profile-Sammeln
├── webapp/             # Haupt-Web-Anwendung
├── shared/             # Gemeinsame TypeScript-Typen
├── legacy/             # Altes Bookmarklet (Fallback)
└── dist/               # Build-Output
```

## Installation

### Entwicklung

```bash
# Dependencies installieren
npm install

# Webapp im Dev-Modus starten
npm run dev

# Extension bauen
npm run build:extension

# Alles bauen
npm run build
```

### Chrome Extension installieren

1. `npm run build:extension` ausführen
2. Chrome öffnen → `chrome://extensions`
3. "Developer mode" aktivieren (oben rechts)
4. "Load unpacked" klicken
5. Ordner `dist/extension` auswählen

### Web-App deployen

```bash
npm run build
# dist/webapp enthält die statischen Dateien
```

## Verwendung

### 1. Profile sammeln (Chrome Extension)

1. Extension-Icon im Browser anzeigen
2. Portal-Tabs öffnen (portal.startwithafriend.de)
3. "Alle Tabs scannen" klicken
4. Profile werden automatisch gesammelt
5. "In Zwischenablage" oder "Als Datei" exportieren

### 2. Profile importieren (Web-App)

1. Web-App öffnen
2. "Profile importieren" klicken
3. Aus Zwischenablage einfügen ODER JSON-Datei laden

### 3. Tandems matchen

1. Profil auf der Karte oder Liste anklicken
2. Smart Match Panel zeigt passende Partner
3. Grün = kompatibel, Grau = unpassend (Hard Facts)
4. Match auswählen → Tandem erstellen

## Features

- **Automatisches Tab-Scanning**: Alle offenen Portal-Tabs auf einmal scannen
- **Smart Match**: Automatische Vorschläge basierend auf Hard Facts + Soft Facts
- **Hard Facts Check**: Alter, Geschlecht, Zeit-Verfügbarkeit
- **Soft Facts Score**: PLZ-Nähe, Hobbies, Interessen (0-5 Sterne)
- **KI-Textgenerierung**: Ollama/Mistral für automatische Gemeinsamkeits-Texte (DSGVO-konform auf eigenem Server)
- **Entfernungsberechnung**: Automatische Berechnung von Reisezeiten zwischen PLZ
- **Mobile-friendly**: Responsive Design für Tablet/Mobile
- **Karten-Visualisierung**: Profile auf interaktiver Karte mit Leaflet.js
- **Word-kompatibler Export**: Tabellen können direkt in Word eingefügt werden

## Technologien

- TypeScript
- Vite (Build-Tool)
- Leaflet.js (Karten)
- Chrome Extension Manifest V3
