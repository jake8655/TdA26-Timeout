-- apply changes
alter table courses add column status varchar(10) default 'DRAFT' not null;
alter table courses add column scheduled_start_at datetime(6);
alter table courses add column scheduled_end_at datetime(6);
alter table courses add column paused_at datetime(6);
alter table courses add column archived_at datetime(6);
alter table courses add column last_went_live_at datetime(6);

create table course_joins (
  uuid                          varchar(40) not null,
  course_uuid                   varchar(40) not null,
  session_token                 varchar(255) not null,
  joined_at                     datetime(6) not null,
  last_seen_at                  datetime(6) not null,
  active                        tinyint(1) default 1 not null,
  constraint pk_course_joins primary key (uuid)
);

create index ix_course_joins_course_uuid on course_joins (course_uuid);
create index ix_course_joins_course_session on course_joins (course_uuid, session_token);
alter table course_joins add constraint fk_course_joins_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;
