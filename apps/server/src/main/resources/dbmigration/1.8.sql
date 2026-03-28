-- apply changes
create table support_messages (
  uuid                          varchar(40) not null,
  submitted_by_uuid             varchar(40) not null,
  subject                       varchar(255) not null,
  page_url                      varchar(255) not null,
  steps_to_reproduce            text not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint pk_support_messages primary key (uuid)
);

create table support_message_attachments (
  uuid                          varchar(40) not null,
  support_message_uuid          varchar(40) not null,
  asset_uuid                    varchar(40) not null,
  file_name                     varchar(255) not null,
  file_url                      varchar(255) not null,
  mime_type                     varchar(255) not null,
  size_bytes                    bigint not null,
  created_at                    datetime(6) not null,
  updated_at                    datetime(6) not null,
  constraint uq_support_message_attachments_asset_uuid unique (asset_uuid),
  constraint pk_support_message_attachments primary key (uuid)
);

-- foreign keys and indices
create index ix_support_messages_submitted_by_uuid on support_messages (submitted_by_uuid);
alter table support_messages add constraint fk_support_messages_submitted_by_uuid foreign key (submitted_by_uuid) references accounts (uuid) on delete restrict on update restrict;

create index ix_support_message_attachments_support_message_uuid on support_message_attachments (support_message_uuid);
alter table support_message_attachments add constraint fk_support_message_attachments_support_message_uuid foreign key (support_message_uuid) references support_messages (uuid) on delete restrict on update restrict;

alter table support_message_attachments add constraint fk_support_message_attachments_asset_uuid foreign key (asset_uuid) references file_assets (uuid) on delete restrict on update restrict;

