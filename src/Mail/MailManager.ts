/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/mail.ts" />

import { IocContract } from '@adonisjs/fold'
import {
  DriverContract,
  MailerConfigContract,
  MailerContract,
  MailManagerContract,
  MessageComposeCallback,
} from '@ioc:Adonis/Addons/Mail'
import { Manager } from '@poppinss/manager'
import { EdgeContract } from 'edge.js'
import { Mailer } from './Mailer'

/**
 * The manager exposes the API to pull instance of [[Mailer]] class for pre-defined mappings
 * in the config file. The manager internally manages the state of mappings and cache
 * them for re-use.
 */
export class MailManager extends Manager<DriverContract, MailerContract>
  implements MailManagerContract {
  /**
   * Caching driver instances. One must call `close` to clean it up
   */
  protected $cacheMappings = true

  constructor (
    container: IocContract,
    private _config: MailerConfigContract,
    private _view: EdgeContract,
  ) {
    super(container)
  }

  /**
   * Since we don't expose the drivers instances directly, we wrap them
   * inside the mailer instance.
   */
  protected wrapDriverResponse (
    mappingName: string,
    driver: DriverContract,
  ): MailerContract {
    return new Mailer(mappingName, this._view, driver, ({ name }) => {
      this.release(name)
    })
  }

  /**
   * Returns the driver name for a given mapping
   */
  protected getMappingDriver (name: string) {
    const config = this.getMappingConfig(name)
    return config && config.driver
  }

  /**
   * Returns the config for a given mapping
   */
  protected getMappingConfig (name: string) {
    return this._config.mailers[name]
  }

  /**
   * Returns the name of the default mapping
   */
  protected getDefaultMappingName () {
    return this._config.mailer
  }

  /**
   * Creates an instance of `smtp` driver by lazy loading. This method
   * is invoked internally when a new driver instance is required
   */
  protected createSmtp (_mapping, config) {
    const { SmtpDriver } = require('../Drivers/Smtp')
    return new SmtpDriver(config)
  }

  /**
   * Creates an instance of `ses` driver by lazy loading. This method
   * is invoked internally when a new driver instance is required
   */
  protected createSes (_mapping, config) {
    const { SesDriver } = require('../Drivers/Ses')
    return new SesDriver(config)
  }

  /**
   * Sends email using the default `mailer`
   */
  public async send (callback: MessageComposeCallback) {
    return this.use().send(callback)
  }

  /**
   * Closes the mapping instance and removes it from the cache
   */
  public async close (name?: string): Promise<void> {
    const mailer = name ? this.use(name) : this.use()
    await mailer.close()
  }

  /**
   * Closes the mapping instance and removes it from the cache
   */
  public async closeAll (): Promise<void> {
    await Promise.all(
      Array.from(this['_mappingsCache'].keys()).map((name: string) =>
        this.close(name),
      ),
    )
  }
}
