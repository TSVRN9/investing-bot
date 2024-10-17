import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    Unique,
} from "typeorm";

@Entity()
@Unique(["ticker"])
export class Feed extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    ticker!: string;

    @Column({ name: "guild_id" })
    guildId!: string;

    @Column({ name: "channel_id" })
    channelId!: string;
}
