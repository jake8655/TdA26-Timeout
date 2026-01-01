-- apply alter tables
alter table sessions add column token varchar(255) default '' not null;
