-- apply changes
create table users (
  id                            varchar(40) not null,
  name                          varchar(255),
  created_at                    datetime(6) not null,
  constraint pk_users primary key (id)
);

