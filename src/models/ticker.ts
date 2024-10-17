import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Ticker extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "company_name" })
    companyName!: string;

    @Column()
    ticker!: string;

    @Column()
    exchange!: string;

    @Column({ name: "gics_sector" })
    gicsSector!: string;

    @Column({ name: "gics_industry_group" })
    gicsIndustryGroup!: string;

    @Column({ name: "gics_industry" })
    gicsIndustry!: string;

    @Column({ name: "gics_sub_industry" })
    gicsSubIndustry!: string;
}
