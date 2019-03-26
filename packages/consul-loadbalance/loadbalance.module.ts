import {
    NEST_BOOT,
    NEST_BOOT_PROVIDER,
    NEST_CONSUL_CONFIG,
    NEST_CONSUL_CONFIG_PROVIDER,
    NEST_CONSUL_LOADBALANCE_PROVIDER,
    NEST_CONSUL_SERVICE_PROVIDER
} from '@nestcloud/common';
import { ConsulService } from '@nestcloud/consul-service';
import { DynamicModule, Global, Module } from '@nestjs/common';

import { Boot } from '@nestcloud/boot';
import { ConsulConfig } from '@nestcloud/consul-config';
import { Loadbalance } from './loadbalance';
import { Options, RuleOptions } from './loadbalance.options';

@Global()
@Module({})
export class LoadbalanceModule {
    static register(options: Options = {}): DynamicModule {
        const inject = [NEST_CONSUL_SERVICE_PROVIDER];
        if (options.dependencies.includes(NEST_BOOT)) {
            inject.push(NEST_BOOT_PROVIDER);
        } else if (options.dependencies.includes(NEST_CONSUL_CONFIG)) {
            inject.push(NEST_CONSUL_CONFIG_PROVIDER);
        }

        const loadbalanceProvider = {
            provide: NEST_CONSUL_LOADBALANCE_PROVIDER,
            useFactory: async (service: ConsulService, boot: Boot | ConsulConfig): Promise<Loadbalance> => {
                const loadbalance = new Loadbalance(service);
                const rules = (
                    options.dependencies && options.dependencies.includes(NEST_BOOT) ?
                        (boot as Boot).get('loadbalance.rules') :
                        options.dependencies && options.dependencies.includes(NEST_CONSUL_CONFIG) ?
                            await (boot as ConsulConfig).get('loadbalance.rules') : options.rules
                ) as RuleOptions[] || [];
                await loadbalance.init(rules, options.ruleCls);
                return loadbalance;
            },
            inject,
        };

        return {
            module: LoadbalanceModule,
            providers: [loadbalanceProvider],
            exports: [loadbalanceProvider],
        };
    }
}
