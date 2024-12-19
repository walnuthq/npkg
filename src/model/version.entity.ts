import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Package } from './package.entity';

@Entity()
export class Version {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Package)
  package!: Package;

  @Property()
  major!: number;

  @Property()
  minor!: number;

  @Property()
  patch!: number;

  @Property({ unique: true })
  sortableVersion!: string;

  @Property()
  versionNumber!: string;

  @Property({ columnType: 'text' })
  packageBlob!: string;

  @Property()
  sizeKb!: number;

  @Property()
  createdAt: Date = new Date();
}
