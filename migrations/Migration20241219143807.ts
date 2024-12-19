import { Migration } from '@mikro-orm/migrations';

export class Migration20241219143807 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "package" ("id" serial primary key, "name" varchar(255) not null, "tag_name" varchar(255) not null, "readme" text not null);`);

    this.addSql(`create table "version" ("id" serial primary key, "package_id" int not null, "major" int not null, "minor" int not null, "patch" int not null, "sortable_version" varchar(255) not null, "version_number" varchar(255) not null, "package_blob" varchar(255) not null, "size_kb" int not null, "created_at" timestamptz not null);`);
    this.addSql(`alter table "version" add constraint "version_sortable_version_unique" unique ("sortable_version");`);

    this.addSql(`create table "download" ("id" serial primary key, "package_id" int not null, "version_id" int not null, "download_date" timestamptz not null);`);

    this.addSql(`alter table "version" add constraint "version_package_id_foreign" foreign key ("package_id") references "package" ("id") on update cascade;`);

    this.addSql(`alter table "download" add constraint "download_package_id_foreign" foreign key ("package_id") references "package" ("id") on update cascade;`);
    this.addSql(`alter table "download" add constraint "download_version_id_foreign" foreign key ("version_id") references "version" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "version" drop constraint "version_package_id_foreign";`);

    this.addSql(`alter table "download" drop constraint "download_package_id_foreign";`);

    this.addSql(`alter table "download" drop constraint "download_version_id_foreign";`);

    this.addSql(`drop table if exists "package" cascade;`);

    this.addSql(`drop table if exists "version" cascade;`);

    this.addSql(`drop table if exists "download" cascade;`);
  }

}
