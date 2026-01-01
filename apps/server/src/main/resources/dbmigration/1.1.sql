-- apply changes
create table sessions (
  id                            varchar(40) not null,
  lecturer_id                   varchar(40) not null,
  expires_at                    datetime(6) not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_sessions primary key (id)
);

-- foreign keys and indices
create index ix_sessions_lecturer_id on sessions (lecturer_id);
alter table sessions add constraint fk_sessions_lecturer_id foreign key (lecturer_id) references lecturers (id) on delete restrict on update restrict;

