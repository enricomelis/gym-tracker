# Piano di Sviluppo: GymTracker

Questo documento delinea il piano di sviluppo per la web app GymTracker, uno strumento moderno per la gestione della programmazione e delle sessioni di allenamento nella ginnastica artistica maschile.

**Stack Tecnologico:**

- **Frontend:** Next.js (App Router) con TypeScript
- **Backend & Database:** Supabase
- **Styling:** Tailwind CSS
- **Formatting:** Prettier con `prettier-plugin-tailwindcss`

---

### Fase 1: Setup del Progetto e Fondamenta

**Obiettivo:** Creare le fondamenta tecniche dell'applicazione, configurare l'ambiente di sviluppo e preparare il database secondo lo schema fornito.

1.  **Inizializzazione Progetto:**

    - Bootstrap di un nuovo progetto Next.js utilizzando il template ufficiale con Supabase.
    - Creazione di un nuovo progetto sulla piattaforma Supabase.

2.  **Integrazione Next.js & Supabase:**

    - Configurazione delle variabili d'ambiente nel file `.env.local` per la connessione sicura a Supabase (URL e `anon_key`).
    - Implementazione dei client Supabase (lato client e lato server) utilizzando i pacchetti e le best practice di `@supabase/ssr`.

3.  **Creazione Schema Database e Sicurezza:**

    - **Revisione Schema:** Analisi e validazione finale dello schema DBML fornito.
    - **Migrazione Database:** Traduzione dello schema DBML in uno o più script di migrazione SQL per Supabase. Questi script creeranno tutte le tabelle, le relazioni (foreign keys), i tipi (`enum`) e i default.
    - **Row Level Security (RLS):** Le policy RLS verranno omesse durante la creazione iniziale dello schema. Saranno definite e implementate in seguito, una per una.

4.  **Autenticazione e Profili Utente:**
    - Adeguamento stilistico e funzionale delle pagine di `login`, `signup` e `password_reset` già fornite dal template, per allinearle al design dell'app.
    - Implementazione di un meccanismo (es. trigger Postgres su `auth.users`) che, dopo la registrazione di un nuovo utente, crei un record corrispondente nella tabella `coaches` in base al ruolo scelto durante il signup.

---

### Fase 1.5: Creazione Dashboard Dinamica e UI

**Obiettivo:** Sostituire la navigazione statica con una dashboard dinamica, stabilizzare l'autenticazione e rifinire l'interfaccia utente.

1.  **Routing Dinamico e Struttura:**

    - ✅ Creazione di un route group `(protected)` per le pagine autenticate.
    - ✅ Implementazione di una dashboard dinamica in `/dashboard` basata sul ruolo.
    - ✅ Creazione di pagine placeholder per le sezioni future (`/atleti`, etc.).

2.  **Stabilizzazione Autenticazione:**

    - ✅ Risoluzione di errori critici aggiornando la gestione delle sessioni Supabase a `@supabase/ssr`.
    - ✅ Correzione del recupero dati per allinearlo allo schema reale del DB.

3.  **Rifinitura Interfaccia Utente (UI):**
    - ✅ Implementazione di una sidebar a scomparsa con modalità "overlay" su tutti i dispositivi.
    - ✅ Riorganizzazione dell'header per un layout più pulito e un titolo centrato.
    - ✅ Miglioramento della UX con indicatori di caricamento e spaziatura aumentata.

---

### Fase 2: Sviluppo Funzionalità Core - Programmazione

**Obiettivo:** Dare ai coach gli strumenti per gestire i propri atleti e programmare gli allenamenti su base settimanale e giornaliera.

1.  **Dashboard Coach:**

    - ✅ Creazione di una dashboard principale per il coach.
    - La dashboard mostrerà una sintesi dell'attività odierna (es. allenamento pianificato, atleti che si allenano oggi) e includerà alcuni grafici riepilogativi veloci (es. volume settimanale).

2.  **Gestione Atleti (Route Dedicata):**

    - ✅ Creazione di una nuova sezione dedicata (es. `/atleti`).
    - ✅ In questa sezione, il coach potrà visualizzare la lista completa dei propri atleti.
    - ✅ Implementazione delle funzionalità per associare un nuovo atleta a un coach e gestire le anagrafiche (atleti, società, competizioni).

3.  **Programmazione Settimanale (`apparatus_weekly_goals`):**

    - ✅ Sviluppo di una dashboard di pianificazione annuale con vista a matrice.
    - ✅ L'interfaccia permette di visualizzare i dati aggregati per tutte le settimane dell'anno e di navigare tra gli anni.
    - ✅ Cliccando su una settimana, si apre una modale con un form per inserire, modificare e cancellare gli obiettivi settimanali per ogni attrezzo, popolando la tabella `apparatus_weekly_goals`.
    - [ ] CRUD per i `weekly_goal_presets` per permettere ai coach di salvare e riutilizzare template di programmazione settimanale.

4.  **Programmazione Giornaliera (`daily_routines`):**
    - Interfaccia per definire le routine di allenamento giornaliere per un atleta, direttamente dalla vista settimanale.
    - Form per creare e modificare le `daily_routines` per ogni attrezzo previsto nella sessione.
    - CRUD per i `daily_routine_presets` per velocizzare la creazione delle routine giornaliere.

---

### Fase 3: Esecuzione Allenamento e Inserimento Dati

**Obiettivo:** Permettere al coach (o all'atleta) di inserire i dati dell'allenamento effettivamente svolto, confrontandoli con la programmazione.

1.  **Pagina Allenamento del Giorno:**

    - Creazione di una vista che mostri la programmazione (`daily_routines`) per un atleta in una data specifica.
    - Pulsante per "Iniziare Sessione di Allenamento", che crea un nuovo record in `training_sessions`.

2.  **Form di Inserimento Dati "Live":**

    - Sviluppo di un'interfaccia di inserimento dati ottimizzata per la velocità, usabile anche da dispositivi mobili in palestra.
    - Per ogni attrezzo, l'interfaccia permetterà di creare un record in `apparatus_sessions`.
    - Per ogni serie, l'interfaccia permetterà di creare uno o più record in `training_sets`, registrando volume, penalità, cadute, etc.
    - I campi calcolati (`total_volume`, `average_intensity`, etc.) in `apparatus_sessions` verranno popolati tramite calcoli automatici (lato client per un feedback immediato, con validazione finale lato server/database).

3.  **Storico Allenamenti:**
    - Creazione di una pagina per visualizzare lo storico delle `training_sessions` di un atleta.
    - Possibilità di navigare e visualizzare i dettagli completi di ogni sessione passata.

---

### Fase 4: Visualizzazione Dati e Funzionalità Avanzate

**Obiettivo:** Trasformare i dati raccolti in insight utili e aggiungere funzionalità a valore aggiunto.

1.  **Dashboard e Reportistica:**

    - Sviluppo di una dashboard per visualizzare i progressi dell'atleta.
    - Creazione di grafici per monitorare l'andamento di metriche chiave (es. volume totale, intensità media, penalità media per attrezzo) nel tempo.
    - Visualizzazione di un confronto tra i dati programmati (dagli `
