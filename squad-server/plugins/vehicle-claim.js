/*
//
//  ______    _   _           _  __      _   _     ____   ___
// |  ____|  | | | |         | |/ _|    | | | |   |___ \ / _ \
// | |__ __ _| |_| |__   __ _| | |_ __ _| |_| |__   __) | | | |
// |  __/ _` | __| '_ \ / _` | |  _/ _` | __| '_ \ |__ <| | | |
// | | | (_| | |_| | | | (_| | | || (_| | |_| | | |___) | |_| |
// |_|  \__,_|\__|_| |_|\__,_|_|_| \__,_|\__|_| |_|____/ \___/
//
// Written by Fathalfath30.
// Email : fathalfath30@gmail.com
// Follow me on:
//  Github : https://github.com/fathalfath30
//  Gitlab : https://gitlab.com/Fathalfath30
//
*/
import DiscordBasePlugin from './discord-base-plugin.js';
import Logger from 'core/logger';

export default class VehicleClaim extends DiscordBasePlugin
{
  static get description()
  {
    return ('description');
  }

  static get optionsSpecification()
  {
    return {
      ...DiscordBasePlugin.optionsSpecification,
      updateInterval: {
        required: true,
        description: 'Frequency of fetching player and squad information in second(s).'
      },
      squadMinimumMemberThreshold: {
        required: false,
        description: 'Minimum player count for Squad Lead Can lock the squad',
        default: 4
      },
      squadMinimumMemberWarningThreshold: {
        required: false,
        description: 'Maximum warning threshold to disband the squad',
        default: 3
      },
      squadMinimumMemberIgnoreSquadName: {
        required: false,
        description: 'Ignore the following squad name',
        default: ['MBT', 'MGS', 'IFV', 'APC', 'HELI']
      }
    };
  }

  constructor(server, options, connectors)
  {
    super(server, options, connectors);
    this.executePlugin = this.executePlugin.bind(this);
  }

  async mount()
  {
    await this.executePlugin();
  }

  async unmount()
  {
    this.server.removeEventListener('SQUAD_CREATED', this.onSquadCreated);
  }

  // fetch all squad and players
  async executePlugin()
  {
    // todo: executePlugin()
  }
}
