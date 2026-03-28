-- apply changes
create table accounts (
  uuid                          varchar(40) not null,
  username                      varchar(255) not null,
  hashed_pass                   varchar(255) not null,
  display_name                  varchar(255) not null,
  role                          varchar(8) not null,
  status                        varchar(8) default 'ACTIVE' not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint uq_accounts_username unique (username),
  constraint pk_accounts primary key (uuid)
);

create table branches (
  id                            bigint auto_increment not null,
  country_id                    bigint not null,
  name                          varchar(255) not null,
  city                          varchar(255) not null,
  address                       varchar(255) not null,
  postal_code                   varchar(255) not null,
  region                        varchar(255) not null,
  type                          varchar(6) not null,
  status                        varchar(10) default 'ACTIVE' not null,
  manager_account_uuid          varchar(40) not null,
  lecturer_account_uuid         varchar(40) not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_branches primary key (id)
);

create table countries (
  id                            bigint auto_increment not null,
  iso_code                      varchar(2) not null,
  name                          varchar(255) not null,
  status                        varchar(10) default 'ACTIVE' not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint uq_countries_iso_code unique (iso_code),
  constraint pk_countries primary key (id)
);

create table course_versions (
  uuid                          varchar(40) not null,
  course_uuid                   varchar(40) not null,
  version_no                    integer not null,
  snapshot_json                 longtext not null,
  created_by_account_uuid       varchar(40) not null,
  reason                        varchar(255) not null,
  source                        varchar(255) not null,
  created_at                    datetime(6) not null,
  constraint pk_course_versions primary key (uuid)
);

create table file_assets (
  uuid                          varchar(40) not null,
  storage_key                   varchar(255) not null,
  checksum                      varchar(255) not null,
  mime_type                     varchar(255) not null,
  size_bytes                    bigint not null,
  retention_state               varchar(12) default 'ACTIVE' not null,
  deleted_at                    datetime(6),
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint uq_file_assets_storage_key unique (storage_key),
  constraint pk_file_assets primary key (uuid)
);

-- apply alter tables
alter table courses add column country_id bigint;
alter table courses add column branch_id bigint;
alter table file_attachments add column asset_uuid varchar(40);
alter table file_attachments add column deleted_at datetime(6);
alter table sessions modify lecturer_uuid varchar(40);
alter table sessions add column account_uuid varchar(40);
alter table sessions add column role_snapshot varchar(8);
alter table sessions add column country_id bigint;
alter table sessions add column branch_id bigint;
-- foreign keys and indices
create index ix_branches_country_id on branches (country_id);
alter table branches add constraint fk_branches_country_id foreign key (country_id) references countries (id) on delete restrict on update restrict;

create index ix_branches_manager_account_uuid on branches (manager_account_uuid);
alter table branches add constraint fk_branches_manager_account_uuid foreign key (manager_account_uuid) references accounts (uuid) on delete restrict on update restrict;

create index ix_branches_lecturer_account_uuid on branches (lecturer_account_uuid);
alter table branches add constraint fk_branches_lecturer_account_uuid foreign key (lecturer_account_uuid) references accounts (uuid) on delete restrict on update restrict;

create index ix_course_versions_course_uuid on course_versions (course_uuid);
alter table course_versions add constraint fk_course_versions_course_uuid foreign key (course_uuid) references courses (uuid) on delete restrict on update restrict;

create index ix_course_versions_created_by_account_uuid on course_versions (created_by_account_uuid);
alter table course_versions add constraint fk_course_versions_created_by_account_uuid foreign key (created_by_account_uuid) references accounts (uuid) on delete restrict on update restrict;

create index ix_courses_country_id on courses (country_id);
alter table courses add constraint fk_courses_country_id foreign key (country_id) references countries (id) on delete restrict on update restrict;

create index ix_courses_branch_id on courses (branch_id);
alter table courses add constraint fk_courses_branch_id foreign key (branch_id) references branches (id) on delete restrict on update restrict;

create index ix_file_attachments_asset_uuid on file_attachments (asset_uuid);
alter table file_attachments add constraint fk_file_attachments_asset_uuid foreign key (asset_uuid) references file_assets (uuid) on delete restrict on update restrict;

create index ix_sessions_account_uuid on sessions (account_uuid);
alter table sessions add constraint fk_sessions_account_uuid foreign key (account_uuid) references accounts (uuid) on delete restrict on update restrict;

create index ix_sessions_country_id on sessions (country_id);
alter table sessions add constraint fk_sessions_country_id foreign key (country_id) references countries (id) on delete restrict on update restrict;

create index ix_sessions_branch_id on sessions (branch_id);
alter table sessions add constraint fk_sessions_branch_id foreign key (branch_id) references branches (id) on delete restrict on update restrict;

