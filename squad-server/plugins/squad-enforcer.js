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

export default class SquadEnforcer extends DiscordBasePlugin
{
  static get description()
  {
    return ('Enforce non claimable Squad to have specific amount of squad member(s)');
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

    // set default interval
    this.onSquadCreated = this.onSquadCreated.bind(this);
    this.fetchAllPlayers = this.fetchAllPlayers.bind(this);
  }

  async mount()
  {
    this.server.on('SQUAD_CREATED', this.onSquadCreated);
  }

  async unmount()
  {
    this.server.removeEventListener('SQUAD_CREATED', this.onSquadCreated);
  }

  async onSquadCreated(info)
  {
    // todo: onSquadCreated()
  }
}
