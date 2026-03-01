-- apply changes
create table modules (
  uuid                          varchar(40) not null,
  course_uuid                   varchar(40) not null,
  title                         varchar(255) not null,
  description                   varchar(255),
  visible                       tinyint(1) default 0 not null,
  revealed_at                   datetime(6),
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_modules primary key (uuid)
);

-- apply alter tables
alter table file_attachments add column module_uuid varchar(40) not null;
alter table quizzes add column module_uuid varchar(40) not null;
alter table url_attachments add column module_uuid varchar(40) not null;
-- foreign keys and indices
create index ix_modules_course_uuid on modules (course_uuid);
alter table modules add constraint fk_modules_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;

create index ix_file_attachments_module_uuid on file_attachments (module_uuid);
alter table file_attachments add constraint fk_file_attachments_module_uuid foreign key (module_uuid) references modules (uuid) on delete restrict on update restrict;

create index ix_quizzes_module_uuid on quizzes (module_uuid);
alter table quizzes add constraint fk_quizzes_module_uuid foreign key (module_uuid) references modules (uuid) on delete restrict on update restrict;

create index ix_url_attachments_module_uuid on url_attachments (module_uuid);
alter table url_attachments add constraint fk_url_attachments_module_uuid foreign key (module_uuid) references modules (uuid) on delete restrict on update restrict;

