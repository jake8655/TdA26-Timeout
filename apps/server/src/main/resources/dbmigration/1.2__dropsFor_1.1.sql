-- apply alter tables
CALL usp_ebean_drop_column('file_attachments', 'course_uuid');
CALL usp_ebean_drop_column('quizzes', 'course_uuid');
CALL usp_ebean_drop_column('url_attachments', 'course_uuid');
