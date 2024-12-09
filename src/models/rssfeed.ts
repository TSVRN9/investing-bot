import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class RSSFeed extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "channel_id" })
    channelId!: string;

    @Column({ name: "guild_id" })
    guildId!: string;

    @Column("simple-array")
    keywords!: string[];

    @Column({ nullable: true })
    name?: string;
}
