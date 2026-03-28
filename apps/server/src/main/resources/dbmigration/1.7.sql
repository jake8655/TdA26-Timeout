-- apply alter tables
alter table course_joins add column username varchar(255);
alter table quiz_results add column attempt_started_at datetime(6);
alter table quiz_results add column duration_seconds integer;
