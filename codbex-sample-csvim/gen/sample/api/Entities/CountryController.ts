import { Controller, Get, Post, Put, Delete, Documentation, request, response } from '@aerokit/sdk/http'
import { HttpUtils } from "@aerokit/sdk/http/utils";
import { ValidationError } from '@aerokit/sdk/http/errors'
import { Options } from '@aerokit/sdk/db'
import { Extensions } from "@aerokit/sdk/extensions"
import { Injected, Inject } from '@aerokit/sdk/component'
import { CountryRepository } from '../../data/Entities/CountryRepository'
import { CountryEntity } from '../../data/Entities/CountryEntity'

const validationModules = await Extensions.loadExtensionModules('codbex-sample-csvim-Entities-Country', ['validate']);

@Controller
@Documentation('codbex-sample-csvim - Country Controller')
@Injected()
class CountryController {

    @Inject('CountryRepository')
    private readonly repository!: CountryRepository;

    @Get('/')
    @Documentation('Get All Country')
    public getAll(_: any, ctx: any): CountryEntity[] {
        try {
            const options: Options = {
                limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : 20,
                offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : 0,
                language: request.getLocale().split("_")[0]
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Post('/')
    @Documentation('Create Country')
    public create(entity: CountryEntity): CountryEntity {
        try {
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity) as any;
            response.setHeader('Content-Location', '/services/ts/codbex-sample-csvim/gen/sample/api/Entities/CountryController.ts/' + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Get('/count')
    @Documentation('Count Country')
    public count(): { count: number } {
        try {
            return { count: this.repository.count() };
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Post('/count')
    @Documentation('Count Country with filter')
    public countWithFilter(filter: any): { count: number } {
        try {
            return { count: this.repository.count(filter) };
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Post('/search')
    @Documentation('Search Country')
    public search(filter: any): CountryEntity[] {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Get('/:id')
    @Documentation('Get Country by id')
    public getById(_: any, ctx: any): CountryEntity {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const options: Options = {
                language: request.getLocale().split("_")[0]
            };
            const entity = this.repository.findById(id, options);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound('Country not found');
            }
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Put('/:id')
    @Documentation('Update Country by id')
    public update(entity: CountryEntity, ctx: any): CountryEntity {
        try {
            const id = parseInt(ctx.pathParameters.id);
            entity.Id = id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
        return undefined as any;
    }

    @Delete('/:id')
    @Documentation('Delete Country by id')
    public deleteById(_: any, ctx: any): void {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound('Country not found');
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === 'ForbiddenError') {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === 'ValidationError') {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

    private validateEntity(entity: any): void {
        if (entity.Name === null || entity.Name === undefined) {
            throw new ValidationError(`The 'Name' property is required, provide a valid value`);
        }
        if (entity.Name?.length > 255) {
            throw new ValidationError(`The 'Name' exceeds the maximum length of [255] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
