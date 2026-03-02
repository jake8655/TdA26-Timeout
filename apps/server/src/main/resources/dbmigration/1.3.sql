-- apply changes
create table course_stats (
  uuid                          varchar(40) not null,
  course_uuid                   varchar(40) not null,
  total_submissions             integer default 0 not null,
  total_score_sum               double default 0 not null,
  total_max_score_sum           double default 0 not null,
  total_percentage_sum          double default 0 not null,
  material_interactions         integer default 0 not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_course_stats primary key (uuid)
);

-- apply alter tables
alter table modules add column order_index integer default 0 not null;
-- foreign keys and indices
create index ix_course_stats_course_uuid on course_stats (course_uuid);
alter table course_stats add constraint fk_course_stats_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;

