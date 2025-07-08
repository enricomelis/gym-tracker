/* Grant execute privileges on newly recreated RPC functions
   Added after fixing RLS and function signatures to ensure authenticated users can call them */

-- Grant permissions for coach/athlete related RPC functions
GRANT EXECUTE ON FUNCTION get_coach_athletes_rpc(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_athlete_rpc(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_athlete_rpc(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION change_athlete_coach_rpc(UUID, UUID) TO authenticated;