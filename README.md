# GymTracker

Un'applicazione web moderna progettata per la gestione degli allenamenti nella ginnastica artistica maschile. L'obiettivo è fornire a tecnici e atleti uno strumento potente, veloce e intuitivo per programmare, tracciare e analizzare ogni aspetto della preparazione atletica.

---

## Roadmap del Progetto

Le fasi numerate sono ordinate in base alla priorità, partendo dalle fondamenta dal progetto e aggiungendo mano mano strati di funzionalità.
Le fasi letterali non sono ordinate, sono semplicemente buttate giù e verranno ordinate in futuro con l'ampliamento del progetto.

### 🏗️ Fase 1: Fondamenta e Setup

- [x] Inizializzazione del progetto Next.js
- [x] Configurazione dell'ambiente di sviluppo (Tailwind CSS, Prettier)
- [x] Integrazione con il backend Supabase
- [x] Creazione dello schema del database
- [x] Implementazione del sistema di autenticazione per tecnici
- [x] Creazione della UI shell dell'applicazione (layout protetto, header, sidebar navigabile)

### 🎯 Fase 2: Funzionalità Core di Programmazione

- [x] **Gestione atleti:** Una sezione dedicata per la visione degli atleti.
- [x] **Programmazione:** Una sezione per gestire la programmazione secondo lo standard nazionale.
  - [x] Programmazione Settimanale.
  - [x] Programmazione Giornaliera.
- [x] **Inserimento:** Una sezione di tecnici e atleti possono inserire il carico svolto durante gli allenamenti.

### ✨ Fase 3: Funzionalità aggiuntive per UX Leggera

- [ ] **Micro preset:** Possibilità di salvare delle settimane, degli allenamenti e dei macrocicli per facilitarne l'inserimento.
  - [ ] Preset per la programmazione settimanale.
  - [ ] Preset per la programmazione giornaliera.
- [ ] **Macro preset**
  - [ ] Preset per determinati macrocicli.
  - [ ] Preset per la preparazione a una gara (multi-settimana, multi-microciclo).
- [ ] **Gestione delle gare:** Calcolo automatico della programmazione, parametrizzata dal tecnico, data una gara calendarizzata.

### 📊 Fase X.1: Analisi dati e Regole Avanzate

- [ ] **Grafici e Analisi dati:** Una sezione che confronta la programmazione con l'inserimento, che visualizzi l'andamento con grafici e che renda comprensibile l'andamento dell'atleta.
- [ ] **Regole avanzate:** Implementazione delle regole avanzate dello standard nazionale.
  - [ ] Inizialmente aggiungendo dei semplici calcoli frontend per l'inserimento più accurato.
  - [ ] Successivamente collegando ogni elemento della salita alle regole da applicare.

### 🧑🏻‍🔧 Fase X.2: Super Tecnico

- [ ] **Nuovo ruolo:** Inserimento di un terzo ruolo, al di sopra del tecnico, che rifletta la figura di Direttore Tecnico ai vari livelli (Regionale, Nazionale...) con funzionalità aggiuntive di analisi di svariati atleti.

### 🌐 Fase Z.1: UI

- [ ] **Miglioramento generale:** Tema e colori ben definiti, Tipografia, Libreria Componenti.
- [ ] **Filtri:** Possibilità di cambiare modalità di visualizzazione per le varie programmazioni.
- [ ] **Dashboard:** Inserimento di Dashboard per tecnici e atleti, che aiutino al massimo a visualizzare l'andamento.

### ⚡ Fase Z.2: Ottimizzazioni varie

- [ ] **Speed Insights:** Inserimento di analisi per ottimizzare la velocità dell'app.
- [ ] **RLS:** Inserimento di un maggior livello di sicurezza, lato database.
- [ ] **Sviluppo Mobile:** Costruzione di una versione mobile on-device dell'app.

---

## Problematiche Note

Questa sezione elenca i problemi noti o i bug che sono stati identificati ma non ancora risolti. La loro risoluzione è pianificata per il futuro, ma non rappresenta una priorità immediata.

### Front-end

#### app

- [ ] Fare in modo che il login venga salvato.

#### app/settimanale - Mobile

- [x] Overflow del bottone per il cambio anno.
- [x] Overflow del form per inserimento programmazione che ne impossibilita l'utilizzo.

### Back-end

#### URLs

- [ ] Dopo la corretta conferma dell'email, il redirect va cambiato dalla Dashboard Supabase.

#### Database Schema

- [x] Modificare relazione Atleti-Allenamenti. Dovrebbe essere Molti-a-Molti.
- [x] Modificare l'eliminazione degli Atleti. Elimina diventa Disattiva; Possibilità di cambiare tecnico.
- [ ] RLS non attiva.

## Gestione dei Branch

La gestione dei branch è purtroppo un miscuglio non ben definito di CI/CD e di GitFlow, dato che non ho mai avuto esperienze lavorative con nessuno dei due (sto semplicemente prendendo ciò che mi sembra meglio da entrambi).

- il branch `main` è quello di production, l'ultima versione stabile dell'app.
- il branch `development` è quello di riferimento per lo sviluppo di nuove funzionalità e di testing.
- tutti i branch che iniziano con un numero sono creati per la risoluzione delle GitHub Issue associata, possono derivare sia da `main` che da `development`.
- tutti i branch che iniziano con _feat/_ sono dedicati a una singola funzionalità, difficilmente deriveranno da `main` ma non lo escludo a priori.
- tutti i branch che iniziano con _hotfix/_ sono dedicati a fix di bug da risolvere velocemente, quasi sempre deriveranno da `main`.

### Dev Workflow

- `git branch <branch_name>` per creare un nuovo branch secondo le convenzioni di sopra
- `git checkout <branch_name>` per cambiare e andare sul nuovo branch
- pubblicare il branch su GitHub (non so come si fa da CLI)
- `git add .` per aggiungere tutti i cambiamenti
- `npm run build` per verificare che la build non crei problemi
- `git commit -m "<messaggio>"` per fare la commit locale
- `git push origin <branch_name>` per pushare i cambiamenti sul proprio branch
