-- apply changes
create table quiz_answer_submissions (
  uuid                          varchar(40) not null,
  quiz_result_uuid              varchar(40) not null,
  question_uuid                 text not null,
  selected_indices              json not null,
  submitted_at                  datetime(6) not null,
  constraint pk_quiz_answer_submissions primary key (uuid)
);

-- foreign keys and indices
create index ix_quiz_answer_submissions_quiz_result_uuid on quiz_answer_submissions (quiz_result_uuid);
alter table quiz_answer_submissions add constraint fk_quiz_answer_submissions_quiz_result_uuid foreign key (quiz_result_uuid) references quiz_results (uuid) on delete restrict on update restrict;

