-- apply alter tables
CALL usp_ebean_drop_column('course_joins', 'has_submitted_quiz');
CALL usp_ebean_drop_column('course_stats', 'material_interactions');
CALL usp_ebean_drop_column('courses', 'scheduled_end_at');
