import { Entity, Table, Id, Generated, Column, Documentation, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy} from '@aerokit/sdk/db'

@Entity('CountryEntity')
@Table('COUNTRY')
@Documentation('Country entity mapping')
export class CountryEntity {

    @Id()
    @Generated('sequence')
    @Documentation('Id')
    @Column({
        name: 'COUNTRY_ID',
        type: 'integer',
    })
    public Id?: number;

    @Documentation('Name')
    @Column({
        name: 'COUNTRY_NAME',
        type: 'string',
        length: 255,
    })
    public Name!: string;

}

(new CountryEntity());
