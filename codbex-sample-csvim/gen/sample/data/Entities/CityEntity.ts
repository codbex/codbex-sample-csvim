import { Entity, Table, Id, Generated, Column, Documentation, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy} from '@aerokit/sdk/db'

@Entity('CityEntity')
@Table('CITY')
@Documentation('City entity mapping')
export class CityEntity {

    @Id()
    @Generated('sequence')
    @Documentation('Id')
    @Column({
        name: 'CITY_ID',
        type: 'integer',
    })
    public Id?: number;

    @Documentation('Name')
    @Column({
        name: 'CITY_NAME',
        type: 'string',
        length: 255,
    })
    public Name!: string;

    @Documentation('Country')
    @Column({
        name: 'CITY_COUNTRY',
        type: 'integer',
        nullable: true,
    })
    public Country?: number;

}

(new CityEntity());
