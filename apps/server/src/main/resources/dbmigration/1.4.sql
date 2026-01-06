-- drop dependencies
alter table courses drop foreign key fk_courses_lecturer_id;
alter table file_attachments drop foreign key fk_file_attachments_course_id;
alter table sessions drop foreign key fk_sessions_lecturer_id;
alter table url_attachments drop foreign key fk_url_attachments_course_id;
-- apply alter tables
alter table url_attachments add column type varchar(3) default 'url' not null;
-- foreign keys and indices
alter table courses add constraint fk_courses_lecturer_uuid foreign key (lecturer_uuid) references lecturers (uuid) on delete restrict on update restrict;
alter table file_attachments add constraint fk_file_attachments_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;
alter table sessions add constraint fk_sessions_lecturer_uuid foreign key (lecturer_uuid) references lecturers (uuid) on delete restrict on update restrict;
alter table url_attachments add constraint fk_url_attachments_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;
