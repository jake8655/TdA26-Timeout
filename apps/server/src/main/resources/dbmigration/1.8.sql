-- apply changes
alter table questions add column position integer not null default 0;

-- index for efficient ordering
create index ix_questions_quiz_position on questions (quiz_uuid, position);

