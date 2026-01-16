-- apply changes
create table events (
  uuid                          varchar(40) not null,
  course_uuid                   varchar(40) not null,
  type                          varchar(6) not null,
  message                       text not null,
  edited                        tinyint(1) default 0 not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_events primary key (uuid)
);

-- foreign keys and indices
create index ix_events_course_uuid on events (course_uuid);
alter table events add constraint fk_events_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;

