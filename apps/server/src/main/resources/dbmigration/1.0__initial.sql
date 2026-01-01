-- apply changes
create table courses (
  id                            varchar(40) not null,
  lecturer_id                   varchar(40) not null,
  name                          varchar(255) not null,
  description                   varchar(255),
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_courses primary key (id)
);

create table file_attachments (
  id                            varchar(40) not null,
  course_id                     varchar(40) not null,
  name                          varchar(255) not null,
  description                   varchar(255),
  type                          varchar(4) not null,
  size_bytes                    bigint,
  mime_type                     varchar(255),
  file_url                      varchar(255) not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_file_attachments primary key (id)
);

create table lecturers (
  id                            varchar(40) not null,
  username                      varchar(255) not null,
  hashed_pass                   varchar(255) not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_lecturers primary key (id)
);

create table url_attachments (
  id                            varchar(40) not null,
  course_id                     varchar(40) not null,
  name                          varchar(255) not null,
  url                           varchar(255) not null,
  description                   varchar(255),
  favicon_url                   varchar(255) not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_url_attachments primary key (id)
);

-- foreign keys and indices
create index ix_courses_lecturer_id on courses (lecturer_id);
alter table courses add constraint fk_courses_lecturer_id foreign key (lecturer_id) references lecturers (id) on delete restrict on update restrict;

create index ix_file_attachments_course_id on file_attachments (course_id);
alter table file_attachments add constraint fk_file_attachments_course_id foreign key (course_id) references courses (id) on delete restrict on update restrict;

create index ix_url_attachments_course_id on url_attachments (course_id);
alter table url_attachments add constraint fk_url_attachments_course_id foreign key (course_id) references courses (id) on delete restrict on update restrict;

