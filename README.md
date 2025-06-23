# GymTracker

Un'applicazione web moderna progettata per la gestione degli allenamenti nella ginnastica artistica maschile. L'obiettivo è fornire a tecnici e atleti uno strumento potente, veloce e intuitivo per programmare, tracciare e analizzare ogni aspetto della preparazione atletica.

---

## Roadmap del Progetto

### ✅ Fase 1: Fondamenta e Setup

- [x] Inizializzazione del progetto Next.js
- [x] Configurazione dell'ambiente di sviluppo (Tailwind CSS, Prettier)
- [x] Integrazione con il backend Supabase
- [x] Creazione dello schema del database
- [x] Implementazione del sistema di autenticazione per tecnici
- [x] Creazione della UI shell dell'applicazione (layout protetto, header, sidebar navigabile)

### 🚧 Fase 2: Funzionalità Core di Programmazione

- [ ] **Gestione Atleti:** Una sezione dedicata per gestire le anagrafiche degli atleti e delle competizioni.
  - [x] Atleti
  - [ ] Competizioni + Modifica al db: Ogni Gara deve avere un Nome.
- [ ] **Programmazione Settimanale:** Uno strumento visuale, basato su calendario, per definire gli obiettivi di allenamento per ogni atleta e per ogni attrezzo.
  - [x] Inserimento della programmazione
  - [ ] Molteplici modalità di visualizzazione
- [ ] **Pianificazione Giornaliera:** La possibilità di creare esercizi dettagliati per ogni sessione di allenamento.
- [ ] **Dashboard del Coach:** Una vista centrale per avere tutto sotto controllo, con la pianificazione del giorno e dati riepilogativi.
- [ ] **Presets:** Possibilità di salvare dei preset per le programmazioni, in modo da facilitare l'inserimento da parte del tecnico (esempio: creare un preset per un microciclo d'urto)
  - [ ] Settimanale
  - [ ] Mensile
  - [ ] Inserimento?

### 🎯 Fase 3: Esecuzione Allenamento e Tracking

- [ ] **Auth per Atleti:** Possibilità per gli atleti di creare un account, inserire i dati, fornire feedback e visualizzare il proprio andamento in tempo reale.
- [ ] **Modalità Allenamento "Live":** Un'interfaccia ottimizzata per l'inserimento rapido dei dati durante l'allenamento, direttamente dalla palestra.
- [ ] **Storico Allenamenti:** Un archivio completo e facilmente consultabile di tutte le sessioni di allenamento svolte.

### 🚀 Fase 4: Analisi e Funzionalità Avanzate

- [ ] **Modificatori del Volume:** Una gestione ottimale per gestire tutte le regole che definiscono i modificatori percentuali del carico.
- [ ] **Dashboard dei Progressi:** Grafici e report per visualizzare e analizzare i progressi di ogni atleta nel tempo.
- [ ] **Gestione Competizioni:** Strumenti per tracciare la partecipazione e i risultati nelle gare.
- [ ] **Progressive Web App (PWA):** Per un'esperienza d'uso ancora più integrata su dispositivi mobili.

---

## Problematiche Note (Known Issues)

Questa sezione elenca i problemi noti o i bug che sono stati identificati ma non ancora risolti. La loro risoluzione è pianificata per il futuro, ma non rappresenta una priorità immediata.

### Front-end

#### app/settimanale - Mobile

- [ ] Overflow del bottone per il cambio anno.
- [ ] Overflow del form per inserimento programmazione che ne impossibilita l'utilizzo.

### Back-end

#### Database Schema

- [ ] Modificare relazione Atleti-Allenamenti. Dovrebbe essere Molti-a-Molti.
- [ ] Modificare l'eliminazione degli Atleti. Elimina diventa Disattiva; Possibilità di cambiare tecnico.
- [ ] RLS non attiva.

#### app/giornaliera

- [ ] Il calcolo dell'intensità media è sbagliato.
