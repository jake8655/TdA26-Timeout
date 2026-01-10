-- apply changes
create table questions (
  uuid                          varchar(40) not null,
  quiz_uuid                     varchar(40) not null,
  type                          varchar(14) not null,
  question                      text not null,
  options                       json not null,
  correct_index                 integer,
  correct_indices               json,
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

create table quiz_results (
  uuid                          varchar(40) not null,
  quiz_uuid                     varchar(40) not null,
  score                         double not null,
  max_score                     double not null,
  correct_per_question          json not null,
  submitted_at                  datetime(6) not null,
  constraint pk_quiz_results primary key (uuid)
);

-- foreign keys and indices
create index ix_questions_quiz_uuid on questions (quiz_uuid);
alter table questions add constraint fk_questions_quiz_uuid foreign key (quiz_uuid) references quizzes (uuid) on delete restrict on update restrict;

create index ix_quizzes_course_uuid on quizzes (course_uuid);
alter table quizzes add constraint fk_quizzes_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;

create index ix_quiz_results_quiz_uuid on quiz_results (quiz_uuid);
alter table quiz_results add constraint fk_quiz_results_quiz_uuid foreign key (quiz_uuid) references quizzes (uuid) on delete restrict on update restrict;

