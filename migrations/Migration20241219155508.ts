import { Migration } from '@mikro-orm/migrations';

export class Migration20241219155508 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "version" alter column "package_blob" type text using ("package_blob"::text);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "version" alter column "package_blob" type varchar(255) using ("package_blob"::varchar(255));`);
  }

}
