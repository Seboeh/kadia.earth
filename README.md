# kadia.earth

**Artenschutzanalyse in wenigen Klicks**  
Von der Flächenauswahl zur artenschutzrechtlichen Relevanzprüfung – nachvollziehbar, regulatorisch konform und in wenigen Minuten erstellt.

kadia.earth ist ein digitales Werkzeug zur schnellen, strukturierten und behördenkonformen Unterstützung bei artenschutzrechtlichen Bewertungen von Standorten und Projektflächen.

---

## 🌍 Überblick

Planungs- und Genehmigungsprozesse erfordern frühzeitige Einschätzungen zu Artenschutzrisiken.  
kadia.earth automatisiert die Zusammenführung relevanter Umwelt- und Artendaten und reduziert den Recherche- und Dokumentationsaufwand von Stunden auf Minuten.

**Ziel:**  
Frühe Klarheit, belastbare Entscheidungsgrundlagen und konsistente Berichterstellung.

---

## 🚀 Kernfunktionen

### ✅ Automatisierte Datenzusammenführung
- Integration behördlicher Umweltlayer
- Einbindung öffentlicher & validierter Artendaten
- Konsolidierung relevanter Informationen in einer Oberfläche

### ✅ Länderspezifische Anpassung
- Unterstützung landesspezifischer Leitfäden & Richtlinien
- Konsistente Ergebnisse für alle 16 Bundesländer

### ✅ Reduzierte Fehlerquote
- Automatisierte Datenübernahme
- Durchgängige Validierung
- Minimierung manueller Übertragungsfehler

### ✅ GIS-basierte Standortanalyse
- Interaktive Kartenansicht
- Visualisierung relevanter Umweltfaktoren
- Kontextbezogene Bewertung

### ✅ Bericht & Dokumentation per Klick
- Standardisierte Berichte
- Exportierbar & nachvollziehbar
- Behördenkonforme Struktur inkl. Karten & Quellen

---

## 🔄 Workflow

### **1️⃣ Projektgebiet markieren**
Wählen Sie den Standort und zeichnen Sie die Projektfläche in der Kartenansicht ein.

### **2️⃣ Ergebnisse erhalten**
Automatische Zusammenführung:
- Arten- & Umweltdaten
- Prüfbedarfseinschätzung
- Hinweise zu Kompensationsmaßnahmen

### **3️⃣ Bericht exportieren**
Erstellung strukturierter Dokumentationen für:
- Umweltanalysen
- Artenschutzprüfungen
- Flächenbewertungen

---

## 👥 Zielgruppen

- **Projektentwicklung**
- **Umwelt- & Gutachterbüros**
- **Naturschutzorganisationen**

**Mehrwert:**
- Frühe Klarheit in Minuten statt Wochen
- Transparente Risikoabschätzung
- Go/No-Go-Entscheidungsgrundlage
- Exportierbare Berichte

---

## 🧠 Technologie
- Frontend: Next.js (App Router) mit React + TypeScript, Tailwind CSS, Radix UI, Framer Motion  
- Backend: Next.js API Routes + Server Actions (Node.js Runtime)  
- Datenbank: PostgreSQL mit Drizzle ORM (inkl. Migrations-Setup), aktuell teilweise Mock-Repositorys für Demo-Flows  
- Auth & Security: Session-basierte Authentifizierung (jose), Passwort-Hashing (bcryptjs)  
- GIS: Leaflet + React Leaflet + Leaflet-Geoman (Zeichnen/Editieren), Geocoding via Nominatim, Basemap über Esri World Imagery  
- State/Data Fetching: SWR + TanStack React Query  
- Payments: Stripe (Checkout + Webhook)  
- Datenquellen (fachlich): Behördliche Umweltlayer, Artendatenbanken und Habitatindikatoren (projektspezifisch integrierbar)  



---

## ⚙️ Installation

```bash
git clone https://github.com/<username>/kadia-earth.git
cd kadia-earth
npm install
npm run dev
