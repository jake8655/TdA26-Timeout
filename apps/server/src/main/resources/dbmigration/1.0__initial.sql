-- apply changes
create table courses (
  uuid                          varchar(40) not null,
  lecturer_uuid                 varchar(40) not null,
  name                          varchar(255) not null,
  description                   varchar(255),
  status                        varchar(9) default 'DRAFT' not null,
  scheduled_start_at            datetime(6),
  scheduled_end_at              datetime(6),
  paused_at                     datetime(6),
  archived_at                   datetime(6),
  last_went_live_at             datetime(6),
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_courses primary key (uuid)
);

create table course_joins (
  uuid                          varchar(40) not null,
  course_uuid                   varchar(40) not null,
  session_token                 varchar(255) not null,
  active                        tinyint(1) not null,
  has_submitted_quiz            tinyint(1),
  joined_at                     datetime(6) not null,
  last_seen_at                  datetime(6) not null,
  constraint pk_course_joins primary key (uuid)
);

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

create table file_attachments (
  uuid                          varchar(40) not null,
  course_uuid                   varchar(40) not null,
  name                          varchar(255) not null,
  description                   varchar(255),
  type                          varchar(4) not null,
  size_bytes                    bigint,
  mime_type                     varchar(255),
  file_url                      varchar(255) not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_file_attachments primary key (uuid)
);

create table lecturers (
  uuid                          varchar(40) not null,
  username                      varchar(255) not null,
  hashed_pass                   varchar(255) not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_lecturers primary key (uuid)
);

create table questions (
  uuid                          varchar(40) not null,
  quiz_uuid                     varchar(40) not null,
  type                          varchar(14) not null,
  question                      text not null,
  options                       json not null,
  correct_index                 integer,
  correct_indices               json,
  position                      integer default 0 not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_questions primary key (uuid)
);

create table quizzes (
  uuid                          varchar(40) not null,
  course_uuid                   varchar(40) not null,
  title                         varchar(255) not null,
  attempts_count                integer default 0 not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_quizzes primary key (uuid)
);

create table quiz_answer_submissions (
  uuid                          varchar(40) not null,
  quiz_result_uuid              varchar(40) not null,
  question_uuid                 text not null,
  selected_indices              json not null,
  submitted_at                  datetime(6) not null,
  constraint pk_quiz_answer_submissions primary key (uuid)
);

create table quiz_results (
  uuid                          varchar(40) not null,
  quiz_uuid                     varchar(40) not null,
  score                         double not null,
  max_score                     double not null,
  correct_per_question          json not null,
  session_token                 varchar(255),
  submitted_at                  datetime(6) not null,
  constraint pk_quiz_results primary key (uuid)
);

create table sessions (
  uuid                          varchar(40) not null,
  token                         varchar(255) default '' not null,
  lecturer_uuid                 varchar(40) not null,
  expires_at                    datetime(6) not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_sessions primary key (uuid)
);

create table url_attachments (
  uuid                          varchar(40) not null,
  course_uuid                   varchar(40) not null,
  name                          varchar(255) not null,
  url                           varchar(255) not null,
  description                   varchar(255),
  type                          varchar(3) default 'url' not null,
  favicon_url                   varchar(255) not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_url_attachments primary key (uuid)
);

-- foreign keys and indices
create index ix_courses_lecturer_uuid on courses (lecturer_uuid);
alter table courses add constraint fk_courses_lecturer_uuid foreign key (lecturer_uuid) references lecturers (uuid) on delete restrict on update restrict;

create index ix_course_joins_course_uuid on course_joins (course_uuid);
alter table course_joins add constraint fk_course_joins_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;

create index ix_events_course_uuid on events (course_uuid);
alter table events add constraint fk_events_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;

create index ix_file_attachments_course_uuid on file_attachments (course_uuid);
alter table file_attachments add constraint fk_file_attachments_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;

create index ix_questions_quiz_uuid on questions (quiz_uuid);
alter table questions add constraint fk_questions_quiz_uuid foreign key (quiz_uuid) references quizzes (uuid) on delete restrict on update restrict;

create index ix_quizzes_course_uuid on quizzes (course_uuid);
alter table quizzes add constraint fk_quizzes_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;

create index ix_quiz_answer_submissions_quiz_result_uuid on quiz_answer_submissions (quiz_result_uuid);
alter table quiz_answer_submissions add constraint fk_quiz_answer_submissions_quiz_result_uuid foreign key (quiz_result_uuid) references quiz_results (uuid) on delete restrict on update restrict;

create index ix_quiz_results_quiz_uuid on quiz_results (quiz_uuid);
alter table quiz_results add constraint fk_quiz_results_quiz_uuid foreign key (quiz_uuid) references quizzes (uuid) on delete restrict on update restrict;

create index ix_sessions_lecturer_uuid on sessions (lecturer_uuid);
alter table sessions add constraint fk_sessions_lecturer_uuid foreign key (lecturer_uuid) references lecturers (uuid) on delete restrict on update restrict;

create index ix_url_attachments_course_uuid on url_attachments (course_uuid);
alter table url_attachments add constraint fk_url_attachments_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;

