-- apply alter tables
alter table course_stats add column downloads integer default 0 not null;
alter table course_stats add column site_visits integer default 0 not null;
