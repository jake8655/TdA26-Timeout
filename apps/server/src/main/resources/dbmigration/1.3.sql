-- apply alter tables
alter table courses change id uuid varchar(40);
alter table courses change lecturer_id lecturer_uuid varchar(40) not null;
alter table file_attachments change id uuid varchar(40);
alter table file_attachments change course_id course_uuid varchar(40) not null;
alter table lecturers change id uuid varchar(40);
alter table sessions change id uuid varchar(40);
alter table sessions change lecturer_id lecturer_uuid varchar(40) not null;
alter table url_attachments change id uuid varchar(40);
alter table url_attachments change course_id course_uuid varchar(40) not null;