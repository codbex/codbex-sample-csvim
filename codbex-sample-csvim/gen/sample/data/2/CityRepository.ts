import { Repository, EntityEvent, EntityConstructor, Options } from '@aerokit/sdk/db'
import { Component } from '@aerokit/sdk/component'
import { Producer } from '@aerokit/sdk/messaging'
import { Extensions } from '@aerokit/sdk/extensions'
import { CityEntity } from './CityEntity'

@Component('CityRepository')
export class CityRepository extends Repository<CityEntity> {

    constructor() {
        super((CityEntity as EntityConstructor));
    }

    protected override async triggerEvent(data: EntityEvent<CityEntity>): Promise<void> {
        const triggerExtensions = await Extensions.loadExtensionModules('codbex-sample-csvim-2-City', ['trigger']);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }
        });
        Producer.topic('codbex-sample-csvim-2-City').send(JSON.stringify(data));
    }
}
