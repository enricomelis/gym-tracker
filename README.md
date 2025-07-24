# GymTracker

Un'applicazione web moderna progettata per la gestione degli allenamenti nella ginnastica artistica maschile. L'obiettivo è fornire a tecnici e atleti uno strumento potente, veloce e intuitivo per programmare, tracciare e analizzare ogni aspetto della preparazione atletica.

---

## Per la DX

La fase di dev è svolto tramite le CLI di _git_ e _supabase_.

### Gestione dei Branch

- il branch `main` è quello di production, l'ultima versione stabile dell'app.
- il branch `development` è quello di riferimento per lo sviluppo di nuove funzionalità e di testing.
- tutti i branch che iniziano con un numero sono creati per la risoluzione delle GitHub Issue associata, possono derivare sia da `main` che da `development`.
- tutti i branch che iniziano con _feat/_ sono dedicati a una singola funzionalità, difficilmente deriveranno da `main` ma non lo escludo a priori.
- tutti i branch che iniziano con _hotfix/_ sono dedicati a fix di bug da risolvere velocemente, quasi sempre deriveranno da `main`.
- tutti i branch che iniziano con _refactor/_ sono dedicati a ristrutturazione del codice senza aggiunta/rimozione di funzionalità.

### Workflow

Dopo aver clonato la repo e aver installato le dependecies, il flusso di sviluppo tendenzialmente va così, a partire dal branch /development:

- `git pull` e `git status` per controllare di essere aggiornati alle ultime push
- `git branch <nome-del-branch>` per creare un nuovo branch
- `git push origin/<nome-del-branch>` per pubblicare il nuovo branch su GitHub
- `supabase start` per avviare il db locale (per funzionare ha bisogno di Docker, la documentazione della Supabase CLI è chiara e ben scritta)
- `supabase db pull` per aggiornare la versione locale con quella remota nel caso fossero avvenuti cambiamenti
- `supabase db reset` per riscrivere da 0 lo schema del db locale e popolarlo col file `seed.sql` (ad ora vuoto/inesistente)\*
- `npm run dev` per avviare il server locale (senza `supabase start` non può funzionare)
- `npm run build` per verificare che il codice possa essere compilato/gestito correttamente da Vercel
- `git add .` per aggiungere tutti i file modificati all'interno della directory corrente
- `git commit -m "<messaggio di commit>"` per salvare in locale i cambiamenti
- `git push origin <nome-del-branch>` per fare la push alla repo remota su GitHub
- `supabase stop` per chiudere il db locale
- per la PR e le merge, si fa tutto su GitHub

#### Migrazioni

- `supabase migration new <nome_migrazione>` per creare una nuova migrazione in locale (viene creata con un timestamp automaticamente UTC, quindi due ore prima rispetto all'ora italiana. ad ora non c'è modo per cambiare questo formato ma è bene che rimanga tale.)
- `supabase migration list` per controllare quali migrazioni sono state eseguite in locale e in remoto
- `supabase migration up --local` per eseguire una migrazione nuova nel db locale

altri comandi utili

- `supabase db diff` per vedere le differenze fra locale e remoto
- `supabase db dump` per scaricare tutti i dati dal db remoto

* il database viene creato localmente in base alle migrazioni scritte nella directory `@/supabase/migrations`

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

### ✨ Fase 3: Funzionalità extra-excel per la UX

- [x] Tecnico inserisce atleta ed esercizi relativi (/atleti)
- [x] Tecnico definisce i preset (/presets)
  - [x] Attrezzo
  - [x] Allenamento
  - [x] Microciclo
  - [x] Macrociclo
- [ ] Tecnico inserisce i preset in modo Top-Down
  - [x] Creando un allenamento crea anche i preset all'attrezzo
    - [ ] Inserimento dell'attrezzo "All" a livello DB e Server Actions
  - [ ] Creando un giorno della settimana crea anche i preset degli allenamenti che lo costituiscono
  - [ ] Creando un microciclo crea anche i giorni della settimana che lo costituiscono
  - [ ] Creando un macrociclo crea anche i microcicli che lo costituiscono
- [ ] Tecnico inserisce la programmazione generica (/programmazione)
- [ ] Tecnico definisce la gara, chi partecipa e a quali attrezzi (/gestione-gare)
- [ ] Tecnico collega la programmazione ai singoli atleti
  - [ ] prima della definizione della gara, (dentro /programmazione -> switch per Generica/Specifica)
  - [ ] dopo la definizione della gara, controllando se e come sovrascrivere i dati già presenti (dentro /gestione-gare)

Per ottenere tutto questo c'è da ristrutturare il database perché si stacca dall'excel.

In che modo cambia del flow attuale?

- prima la programmazione partiva dall'atleta; adesso deve finire con l'atleta
- prima la programmazione andava inserita giorno per giorno, attrezzo per attrezzo, atleta per atleta; adesso viene generalizzata prima e personalizzata dopo
- prima la programmazione si basava esclusivamente sul volume in UdE; adesso è definita in base agli esercizi definiti dal tecnico (che in futuro potranno essere collegato ai singoli elementi)

#### Ristrutturazione della UI, bozza

- Atleti: dove il tecnico inserisce i suoi atleti e i vari esercizi generici
- Preset: dove il tecnico crea, top-down, i vari preset (Attrezzo, Allenamento, Settimana/Microciclo, Periodo/Macrociclo)
  - Attrezzo
  - Allenamento
  - Microciclo
  - Macrociclo
- Programmazione: dove il tecnico inserisce la programmazione generica in base ai preset che ha creato
  - type/Generica: fa la ricerca dentro `public.<table>` dove non ci sono riferimenti a date, atleti e altri particolari
    - view/Annuale: visione generale di tutto l'anno,
      - è una tabella Settimane x Giorni dove ogni cella è la quantità di esercizi ai vari attrezzi
      - colonne aggiuntive: microciclo e macrociclo relativi
    - view/Settimanale: visione particolare del microciclo corrente,
      - è una tabella Giorni x Attrezzi dove ogni cella è la quantità specifica per ogni attrezzo
      - colonne aggiuntive: macrociclo relativo
  - type/Specifica + Dropdown (per scegliere l'Atleta): fa la ricerca dentro `daily_routine_presets` in base all'_athlete_id_
    - view/Annuale
    - view/Settimanale
- Gestione Gare:
  - section/programmazione: dove il tecnico definisce in che modo la programmazione generica si relazione con la data gara (ad esempio: una gara X ha una programmazione basata sul macrociclo Y; in questo modo la programmazione si può popolare automaticamente)
  - section/atleti: dove il tecnico inserisce quale atleta partecipa a quale gara, per quali attrezzi e con quali esercizi, così che la programmazione di quell'atleta possa essere correttamente personalizzata
- Analisi dati: sempre la solita che prima o poi verrà creata

### ⚡ Fase 4: Funzionalità avanzate

- [ ] **Regole avanzate:** Implementazione delle regole avanzate dello standard nazionale.
  - [ ] Inizialmente aggiungendo dei semplici calcoli frontend per l'inserimento più accurato.
  - [ ] Successivamente collegando ogni elemento della salita alle regole da applicare.
- [ ] **Nuovo ruolo:** Inserimento di un terzo ruolo, al di sopra del tecnico, che rifletta la figura di Direttore Tecnico ai vari livelli (Regionale, Nazionale...) con funzionalità aggiuntive di analisi di svariati atleti.
- [ ] **Implementazione del CdP** Per poter creare esercizi da codice.
- [ ] **Grafici e Analisi dati:** Una sezione che confronta la programmazione con l'inserimento, che visualizzi l'andamento con grafici e che renda comprensibile l'andamento dell'atleta.

### 🌐 Fase 5: UI

- [ ] **Miglioramento generale:** Tema e colori ben definiti, Tipografia, Libreria Componenti.
- [ ] **Filtri:** Possibilità di cambiare modalità di visualizzazione per le varie programmazioni.
- [ ] **Dashboard:** Inserimento di Dashboard per tecnici e atleti, che aiutino al massimo a visualizzare l'andamento.
