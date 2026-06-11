-- RPC function for attendance statistics
CREATE OR REPLACE FUNCTION get_attendance_stats()
RETURNS TABLE (
  total_study_sessions BIGINT,
  present_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT ar.date)::BIGINT AS total_study_sessions,
    COUNT(*) FILTER (WHERE ar.status = '출석')::BIGINT AS present_count
  FROM attendance_records ar;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_attendance_stats() TO authenticated;
