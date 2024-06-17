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

export default class SquadEnforcer extends DiscordBasePlugin {
  static get description() {
    return ('Enforce non claimable Squad to have specific amount of squad member(s)');
  }

  static get optionsSpecification() {
    return {
      updateInterval: {
        required: false,
        description: 'Frequency of fetching player and squad information in second(s).',
        default: 60 * 1000
      },
      warningMessage: {
        required: false,
        description: 'The message that will be sent to the squad leader.',
        default: 'You’re not allowed to lock your squad with less than 4 members!'
      },
      enableDisbandMessage: {
        required: false,
        description: 'Show message after disbanded',
        default: true
      },
      disbandMessage: {
        required: false,
        description: 'Message after the squad is getting disbanded',
        default: 'Squad disbanded, please make sure you have at least 4 player in squad!'
      },
      squadMinimumMemberCount: {
        required: false,
        description: 'Minimum player count for Squad Lead Can lock the squad',
        default: 4
      },
      squadWarningMaximumBeforeKick: {
        required: false,
        description: 'Maximum warning threshold to disband the squad',
        default: 3
      },
      ignoreAdmins: {
        required: false,
        description: 'Ignore if player is admin',
        default: false
      },
      ignoreSquadName: {
        required: false,
        description: 'Ignore the following squad name',
        default: []
      },
      SquadMBT: {
        required: false,
        description: 'List the vehicles that are classified as MBTs',
        default: {
          minimumMemberCount: 2,
          warningMessage: 'You must have at least 2 squad member to claim this vehicle!',
          disbandMessage: 'You must have at least 2 squad member to claim this vehicle!',
          vehicles: [
            '2A6M', 'FV4034 "Challenger"', 'FV4034', 'M1A1 "Abrams"', 'M1A1', 'M1A2 "Abrams"',
            'M1A2', 'M60T', 'T-62', 'T-72B3', 'T-72S', 'T-90A', 'ZTZ-99', 'ZTZ99A'
          ]
        }
      },
      SquadMGS: {
        required: false,
        description: 'List the vehicles that are classified as MGSs',
        default: {
          minimumMemberCount: 2,
          warningMessage: 'You must have at least 2 squad member to claim this vehicle!',
          disbandMessage: 'You must have at least 2 squad member to claim this vehicle!',
          vehicles: [
            'M1128', 'Sprut-SDM1', 'ZTD05'
          ]
        }
      },
      SquadIFV: {
        required: false,
        description: 'List the vehicles that are classified as IFVs',
        default: {
          minimumMemberCount: 2,
          warningMessage: 'You must have at least 2 squad member to claim this vehicle!',
          disbandMessage: 'You must have at least 2 squad member to claim this vehicle!',
          vehicles: [
            'ACV-15 IFV', 'ASLAV', 'BMD-1M', 'BMD-4M', 'BMP-1', 'BMP-2', 'BTR-82A', 'Coyote',
            'FV107', 'FV510 UA', 'FV510', 'FV520 CTAS40', 'LAV 6.0', 'LAV-25', 'M2A3', 'MT-LBM 6MB',
            'PARS III IFV', 'ZBD04A', 'ZBD05', 'ZBL08'
          ]
        }
      },
      SquadAPC: {
        required: false,
        description: 'List the vehicles that are classified as IFVs',
        default: {
          minimumMemberCount: 2,
          warningMessage: 'You must have at least 2 squad member to claim this vehicle!',
          disbandMessage: 'You must have at least 2 squad member to claim this vehicle!',
          vehicles: [
            'BTR-80', 'LAV III C6 RWS', 'LAV III M2 RWS', 'M1126 CROWS M2', 'M1126 CROWS M240',
            'PARS III M2 RWS', 'PARS III MG3 RWS', 'PARS III MK19 RWS'
          ]
        }
      },
      SquadHELI: {
        required: false,
        description: 'List the vehicles that are classified as HELIs',
        default: {
          minimumMemberCount: 1,
          warningMessage: 'You must have at least 1 squad member to claim this vehicle!',
          disbandMessage: 'You must have at least 1 squad member to claim this vehicle!',
          vehicles: [
            'CH-146', 'MI-17', 'MI-8', 'MRH-90', 'SA330', 'UH-1H', 'UH-1Y', 'UH-60M', 'Z-8G', 'Z-8J'
          ]
        }
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);
    this.warnCount = {};
    this.options.SquadMBT.vehicles.push('MBT');
    this.options.SquadMGS.vehicles.push('MGS');
    this.options.SquadIFV.vehicles.push('IFV');
    this.options.SquadAPC.vehicles.push('APC');
    this.options.SquadHELI.vehicles.push('HELI');

    this.onNewGame = this.onNewGame.bind(this);
    this.clearWarnCount = this.clearWarnCount.bind(this);
    this.checkSquad = this.checkSquad.bind(this);
  }

  async mount() {
    await super.mount();
    this.server.on('NEW_GAME', this.onNewGame);
    this.server.on('PLAYER_CONNECTED', this.clearWarnCount);
    this.server.on('PLAYER_DISCONNECTED', this.clearWarnCount);
    this.server.on('SQUAD_CREATED', this.clearWarnCount);

    this.checkSquadInterval = setInterval(this.checkSquad, this.options.updateInterval);
  }

  async unmount() {
    clearInterval(this.checkSquadInterval);
    this.server.removeEventListener('NEW_GAME', this.onNewGame);
    this.server.removeEventListener('PLAYER_CONNECTED', this.clearWarnCount);
    this.server.removeEventListener('PLAYER_DISCONNECTED', this.clearWarnCount);
    this.server.removeEventListener('SQUAD_CREATED', this.clearWarnCount);
  }

  async clearWarnCount(info) {
    if (this.warnCount[info.player.steamID]) {
      delete this.warnCount[info.player.steamID];
    }
  }

  async onNewGame(info) {
    this.warnCount = {};
  }

  async validateSquad(server, player, minimumSquadSize, warningMessage, disbandMessage) {
    // if player count already greater or equals with the threshold, we will clear the warn count
    // and stop checking, start with new player to check
    if (parseInt(player.squad.size) >= parseInt(minimumSquadSize)) {
      if (this.warnCount[player.steamID]) {
        delete this.warnCount[player.steamID];
      }
      return;
    }

    // if player has ho warning count create one
    if (!this.warnCount[player.steamID]) {
      this.warnCount[player.steamID] = 1;
    } else {
      this.warnCount[player.steamID]++;
    }

    // if the warning count for player is above maximum warning threshold + 1 disband the squad
    // and send information why his squad is disbanded
    if (this.warnCount[player.steamID] >= parseInt(this.options.squadWarningMaximumBeforeKick) + 1) {
      // send RCON command to disband the squad
      await server.rcon.execute(`AdminDisbandSquad ${player.squad.teamID} ${player.squadID}`);

      // reset warning count
      delete this.warnCount[player.steamID];

      // send warning message if enabled
      if (this.options.enableDisbandMessage) {
        await server.rcon.warn(player.steamID, disbandMessage);
      }
      return;
    }

    // send warning message to open the squad
    await server.rcon.warn(player.steamID, `${warningMessage} (#${this.warnCount[player.steamID]})`);
  }

  async checkSquad() {
    this.server.players.forEach((player) => {
      // check if player is squad leader, otherwise just skip it,
      // don't need to check the players
      if (!player.isLeader || !player.squad) {
        return;
      }

      const squadName = player.squad.squadName.trim().toUpperCase();
      // ignore if player is admin, but it required 'canseeadminchat' permission
      if (this.options.ignoreAdmins) {
        const admins = this.server.getAdminsWithPermission('canseeadminchat');
        if (admins.includes(player.steamID)) {
          return;
        }
      }

      // if squad is not locked we don't to check either
      if (player.squad.locked !== 'True') {
        if (this.warnCount[player.steamID]) {
          delete this.warnCount[player.steamID];
        }
        return;
      }

      // check if the squad name in ignoreSquadName config
      let ignored = false;
      this.options.ignoreSquadName
        .forEach((wl) => {
          if (wl.trim().toUpperCase() === squadName) {
            ignored = true;
          }
        });
      if (ignored) {
        return;
      }

      // check if player is using vehicle squad
      // checking if player using MBT
      const MBT = this.options.SquadMBT.vehicles;
      let MBTSquad = false;
      for (let i = 0; i < MBT.length; i++) {
        if (MBT[i].trim().toUpperCase() === squadName) {
          MBTSquad = true;
          break;
        }
      }

      if (MBTSquad) {
        return this.validateSquad(this.server, player,
          this.options.SquadMBT.minimumMemberCount,
          this.options.SquadMBT.warningMessage,
          this.options.SquadMBT.disbandMessage
        );
      }

      // checking if player using MGS
      const MGS = this.options.SquadMGS.vehicles;
      let MGSSquad = false;
      for (let i = 0; i < MGS.length; i++) {
        if (MGS[i].trim().toUpperCase() === squadName) {
          MGSSquad = true;
          break;
        }
      }

      if (MGSSquad) {
        return this.validateSquad(this.server, player,
          this.options.SquadMGS.minimumMemberCount,
          this.options.SquadMGS.warningMessage,
          this.options.SquadMGS.disbandMessage
        );
      }

      // checking if player using IFV
      const IFV = this.options.SquadIFV.vehicles;
      let IFVSquad = false;
      for (let i = 0; i < IFV.length; i++) {
        if (IFV[i].trim().toUpperCase() === squadName) {
          IFVSquad = true;
          break;
        }
      }

      if (IFVSquad) {
        return this.validateSquad(this.server, player,
          this.options.SquadIFV.minimumMemberCount,
          this.options.SquadIFV.warningMessage,
          this.options.SquadIFV.disbandMessage
        );
      }

      // checking if player using APC
      const APC = this.options.SquadAPC.vehicles;
      let APCSquad = false;
      for (let i = 0; i < APC.length; i++) {
        if (APC[i].trim().toUpperCase() === squadName) {
          APCSquad = true;
          break;
        }
      }

      if (APCSquad) {
        return this.validateSquad(this.server, player,
          this.options.SquadAPC.minimumMemberCount,
          this.options.SquadAPC.warningMessage,
          this.options.SquadAPC.disbandMessage
        );
      }

      // checking if player using HELI
      const HELI = this.options.SquadHELI.vehicles;
      let HELISquad = false;
      for (let i = 0; i < HELI.length; i++) {
        if (HELI[i].trim().toUpperCase() === squadName) {
          HELISquad = true;
          break;
        }
      }

      if (HELISquad) {
        return this.validateSquad(this.server, player,
          this.options.SquadHELI.minimumMemberCount,
          this.options.SquadHELI.warningMessage,
          this.options.SquadHELI.disbandMessage
        );
      }

      // validate non vehicle squad
      return this.validateSquad(this.server, player,
        this.options.squadMinimumMemberCount,
        this.options.warningMessage,
        this.options.disbandMessage
      );
    });
  }
}