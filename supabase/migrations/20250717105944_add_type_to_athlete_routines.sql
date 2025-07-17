-- aggiunge la colonna "type" che fa riferimento ai vari tipi di routine
ALTER TABLE athlete_routines
ADD COLUMN type daily_routine_type_enum;
