

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const axios = require('axios');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });

// Temporary storage for tryout data
const pendingTryouts = new Map();

const TOKEN = MTQwNDU1NDEwMjg1OTYzMjc3MQ.GjdUgO.A8KoAJw4UpR7iT6syJPTu6b6jZRB06jF-N3BcI; // Replace with your bot token
const ALLOWED_GUILD_ID = 1404531292762017892; // The only guild the bot is allowed to operate in ORIGINAL one: 1344501419943661608

// Define allowed roles for interactions (replace with actual Tryout Host role ID)
const ALLOWED_ROLES = ['1065431492416778332', '1263681901244448838', '813881130372825098']; // Role ID for Tryout Host

// Define division roles with role IDs for MVSD, RIVALS, TSB
const GAME_PREFIXES = {

  RIVALS: 'RV',
  
};
const DIVISION_ROLES = {

  RIVALS: {
    'RV Division 1': { 
      roleIds: ['1404550423284547644'], // Replace with RV Imperial Warlord, RV Division 1 role IDs
      color: '#FFD700', 
      minScore: 48, 
     
    },
    'RV Division 2': { 
      roleIds: ['1404550579685949590'], // Replace with RV Grand Reaper, RV Division 2 role IDs
      color: '#C0C0C0', 
      minScore: 43, 
      maxScore: 47, 
      
    },
    'RV Division 3': { 
      roleIds: ['1404550649546281131', // Replace with RV Reaper, RV Division 3 role IDs
      color: '#CD7F32', 
      minScore: 30, 
      maxScore: 42, 
    
    },
    'RV Division 4': { 
      roleIds: ['1404550824897806387'], // Replace with RV Guard, RV Division 4 role IDs
      color: '#00FF00', 
      minScore: 0, 
      maxScore: 29, 
    
    }
  },
 
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('guildCreate', async guild => {
  if (guild.id !== ALLOWED_GUILD_ID) {
    console.log(`Bot was added to unauthorized guild: ${guild.name} (${guild.id}). Leaving...`);
    try {
      await guild.leave();
      console.log(`Successfully left unauthorized guild: ${guild.name} (${guild.id})`);
    } catch (error) {
      console.error(`Failed to leave unauthorized guild ${guild.name} (${guild.id}): ${error.message}`);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() && !interaction.isButton() && !interaction.isModalSubmit()) return;

  // Restrict interactions to the allowed guild
  if (interaction.guildId !== ALLOWED_GUILD_ID) {
    if (interaction.isCommand()) {
      return interaction.reply({ content: 'This bot can only be used in the designated server.', ephemeral: true });
    }
    return; // Silently ignore non-command interactions
  }

  // Slash commands
  if (interaction.isCommand()) {
    if (interaction.commandName === 'tryout') {
      // Restrict /tryout to User ID 1289271473826959464
      if (interaction.user.id !== '1289271473826959464') {
        return interaction.reply({ content: 'Only a specific user can use the /tryout command.', ephemeral: true });
      }
      // Check for Tryout Host role
      if (!interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
        return interaction.reply({ content: 'You need the Tryout Host role to use this command.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('Tryout Assignment System')
        .setDescription('Select a game to assign tryout scores and division.')
        .setColor('#0099ff')
        .setFooter({ text: 'Tryout Bot | Created in 2 Days' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tryout_mvsd').setLabel('MVSD').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('tryout_rivals').setLabel('Rivals').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('tryout_tsb').setLabel('TSB').setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    } else if (interaction.commandName === 'cat') {
      try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search');
        const imageUrl = response.data[0].url;

        const embed = new EmbedBuilder()
          .setTitle('Here\'s a Cute Cat!')
          .setImage(imageUrl)
          .setColor('#FF69B4')
          .setFooter({ text: 'Tryout Bot | Created in 2 Days' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(`Error fetching cat image: ${error.message}`);
        await interaction.reply({ content: 'Failed to fetch a cat image. Try again later!', ephemeral: true });
      }
    } else if (interaction.commandName === 'dog') {
      try {
        const response = await axios.get('https://dog.ceo/api/breeds/image/random');
        const imageUrl = response.data.message;

        const embed = new EmbedBuilder()
          .setTitle('Here\'s a Cute Dog!')
          .setImage(imageUrl)
          .setColor('#FFA500')
          .setFooter({ text: 'Tryout Bot | Created in 2 Days' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(`Error fetching dog image: ${error.message}`);
        await interaction.reply({ content: 'Failed to fetch a dog image. Try again later!', ephemeral: true });
      }
    }
  }

  // Button interaction for first modal
  if (interaction.isButton() && interaction.customId.startsWith('tryout_')) {
    if (!interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
      return interaction.reply({ content: 'You need the Tryout Host role to use this button.', ephemeral: true });
    }

    const game = interaction.customId.split('_')[1].toUpperCase();
    const modal = new ModalBuilder()
      .setCustomId(`tryout_modal_1_${game.toLowerCase()}`)
      .setTitle(`${game} Tryout Assignment - Part 1`);

    const userIdInput = new TextInputBuilder()
      .setCustomId('user_id')
      .setLabel('User ID')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const actionRows = [
      new ActionRowBuilder().addComponents(userIdInput)
    ];

    if (game === 'MVSD') {
      actionRows.push(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('perks').setLabel('Perks (e.g., 5-3)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('no_perks').setLabel('No Perks (e.g., 4-2)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('aim').setLabel('Aim (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );
    } else if (game === 'RIVALS') {
      actionRows.push(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('aim').setLabel('Aim (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('game_sense').setLabel('Game Sense (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('juking').setLabel('Juking (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );
    } else if (game === 'TSB') {
      actionRows.push(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('movement').setLabel('Movement (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('combo').setLabel('Combo (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('juking').setLabel('Juking (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );
    }

    modal.addComponents(actionRows);
    await interaction.showModal(modal);
  }

  // First modal submission
  if (interaction.isModalSubmit() && interaction.customId.startsWith('tryout_modal_1_')) {
    const game = interaction.customId.split('_')[3].toUpperCase();
    const userId = interaction.fields.getTextInputValue('user_id');

    const tryoutData = { userId, game };

    if (game === 'MVSD') {
      tryoutData.perks = interaction.fields.getTextInputValue('perks');
      tryoutData.noPerks = interaction.fields.getTextInputValue('no_perks');
      tryoutData.aim = parseInt(interaction.fields.getTextInputValue('aim'));
    } else if (game === 'RIVALS') {
      tryoutData.aim = parseInt(interaction.fields.getTextInputValue('aim'));
      tryoutData.gameSense = parseInt(interaction.fields.getTextInputValue('game_sense'));
      tryoutData.juking = parseInt(interaction.fields.getTextInputValue('juking'));
    } else if (game === 'TSB') {
      tryoutData.movement = parseInt(interaction.fields.getTextInputValue('movement'));
      tryoutData.combo = parseInt(interaction.fields.getTextInputValue('combo'));
      tryoutData.juking = parseInt(interaction.fields.getTextInputValue('juking'));
    }

    pendingTryouts.set(interaction.user.id, tryoutData);

    const continueButton = new ButtonBuilder()
      .setCustomId(`continue_tryout_${game.toLowerCase()}`)
      .setLabel('Continue with Tryout Results')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(continueButton);

    await interaction.reply({
      content: 'First part submitted. Click to continue.',
      components: [row],
      ephemeral: true
    });
  }

  // Continue button for second modal
  if (interaction.isButton() && interaction.customId.startsWith('continue_tryout_')) {
    if (!interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
      return interaction.reply({ content: 'You need the Tryout Host role to use this button.', ephemeral: true });
    }

    const game = interaction.customId.split('_')[2].toUpperCase();
    const tryoutData = pendingTryouts.get(interaction.user.id);
    if (!tryoutData) {
      return interaction.reply({ content: 'Tryout data not found. Start over with /tryout.', ephemeral: true });
    }

    const secondModal = new ModalBuilder()
      .setCustomId(`tryout_modal_2_${game.toLowerCase()}`)
      .setTitle(`${game} Tryout Assignment - Part 2`);

    let secondActionRows = [];
    if (game === 'MVSD') {
      secondActionRows = [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('game_sense').setLabel('Game Sense (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('juking').setLabel('Juking (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('cover').setLabel('Cover (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('movement').setLabel('Movement (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        )
      ];
    } else if (game === 'RIVALS') {
      secondActionRows = [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('cover').setLabel('Cover (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('movement').setLabel('Movement (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        )
      ];
    } else if (game === 'TSB') {
      secondActionRows = [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('blocking').setLabel('Blocking (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('main').setLabel('Main (0-10)').setStyle(TextInputStyle.Short).setRequired(true)
        )
      ];
    }

    secondActionRows.push(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('additional_notes')
          .setLabel('Additional Notes (Optional)')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
      )
    );

    secondModal.addComponents(secondActionRows);
    await interaction.showModal(secondModal);
  }

  // Second modal submission
  if (interaction.isModalSubmit() && interaction.customId.startsWith('tryout_modal_2_')) {
    const game = interaction.customId.split('_')[3].toUpperCase();
    const tryoutData = pendingTryouts.get(interaction.user.id);
    if (!tryoutData) {
      return interaction.reply({ content: 'Tryout data not found. Start over with /tryout.', ephemeral: true });
    }

    tryoutData.additionalNotes = interaction.fields.getTextInputValue('additional_notes') || '';

    if (game === 'MVSD') {
      tryoutData.gameSense = parseInt(interaction.fields.getTextInputValue('game_sense'));
      tryoutData.juking = parseInt(interaction.fields.getTextInputValue('juking'));
      tryoutData.cover = parseInt(interaction.fields.getTextInputValue('cover'));
      tryoutData.movement = parseInt(interaction.fields.getTextInputValue('movement'));
    } else if (game === 'RIVALS') {
      tryoutData.cover = parseInt(interaction.fields.getTextInputValue('cover'));
      tryoutData.movement = parseInt(interaction.fields.getTextInputValue('movement'));
    } else if (game === 'TSB') {
      tryoutData.blocking = parseInt(interaction.fields.getTextInputValue('blocking'));
      tryoutData.main = parseInt(interaction.fields.getTextInputValue('main'));
    }

    let totalScore = 0;
    if (game === 'MVSD') {
      totalScore = (tryoutData.aim || 0) + (tryoutData.gameSense || 0) + (tryoutData.juking || 0) + (tryoutData.cover || 0) + (tryoutData.movement || 0);
    } else if (game === 'RIVALS') {
      totalScore = (tryoutData.aim || 0) + (tryoutData.gameSense || 0) + (tryoutData.juking || 0) + (tryoutData.cover || 0) + (tryoutData.movement || 0);
    } else if (game === 'TSB') {
      totalScore = (tryoutData.movement || 0) + (tryoutData.combo || 0) + (tryoutData.juking || 0) + (tryoutData.blocking || 0) + (tryoutData.main || 0);
    }
    tryoutData.totalScore = totalScore;

    const prefix = GAME_PREFIXES[game];
    let divisionKey = `${prefix} Division 4`;
    const div2PlusRoles = DIVISION_ROLES[game][`${prefix} Division 2`].requiredRoles;
    const div1Roles = DIVISION_ROLES[game][`${prefix} Division 1`].requiredRoles;

    if (totalScore >= 48 && interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id)) && 
        interaction.member.roles.cache.some(role => div1Roles.includes(role.id))) {
      divisionKey = `${prefix} Division 1`;
    } else if (totalScore >= 43 && totalScore <= 47 && interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id)) && 
               interaction.member.roles.cache.some(role => div2PlusRoles.includes(role.id))) {
      divisionKey = `${prefix} Division 2`;
    } else if (totalScore >= 30 && totalScore <= 42 && interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id)) && 
               interaction.member.roles.cache.some(role => div2PlusRoles.includes(role.id))) {
      divisionKey = `${prefix} Division 3`;
    } else if (totalScore <= 29 && interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id)) && 
               interaction.member.roles.cache.some(role => div2PlusRoles.includes(role.id))) {
      divisionKey = `${prefix} Division 4`;
    } else {
      const requiredRoles = divisionKey === `${prefix} Division 1` ? div1Roles.join(' or ') : div2PlusRoles.join(' or ');
      return interaction.reply({
        content: `You lack the required roles (Tryout Host and one of ${requiredRoles}) for ${divisionKey} (score: ${totalScore}/50).`,
        ephemeral: true
      });
    }
    tryoutData.division = divisionKey;

    const confirmEmbed = new EmbedBuilder()
      .setTitle(`${game} Tryout Confirmation`)
      .setDescription('Review the tryout data and confirm or edit.')
      .setColor('#FFD700')
      .addFields({ name: 'User ID', value: tryoutData.userId, inline: true })
      .addFields({ name: 'Game', value: game, inline: true })
      .addFields({ name: 'Division', value: divisionKey, inline: true });

    if (game === 'MVSD') {
      confirmEmbed.addFields(
        { name: 'Perks', value: tryoutData.perks || '0-0', inline: true },
        { name: 'No Perks', value: tryoutData.noPerks || '0-0', inline: true },
        { name: 'Aim', value: `${tryoutData.aim || 0}/10`, inline: true },
        { name: 'Game Sense', value: `${tryoutData.gameSense || 0}/10`, inline: true },
        { name: 'Juking', value: `${tryoutData.juking || 0}/10`, inline: true },
        { name: 'Cover', value: `${tryoutData.cover || 0}/10`, inline: true },
        { name: 'Movement', value: `${tryoutData.movement || 0}/10`, inline: true }
      );
    } else if (game === 'RIVALS') {
      confirmEmbed.addFields(
        { name: 'Aim', value: `${tryoutData.aim || 0}/10`, inline: true },
        { name: 'Game Sense', value: `${tryoutData.gameSense || 0}/10`, inline: true },
        { name: 'Juking', value: `${tryoutData.juking || 0}/10`, inline: true },
        { name: 'Cover', value: `${tryoutData.cover || 0}/10`, inline: true },
        { name: 'Movement', value: `${tryoutData.movement || 0}/10`, inline: true }
      );
    } else if (game === 'TSB') {
      confirmEmbed.addFields(
        { name: 'Movement', value: `${tryoutData.movement || 0}/10`, inline: true },
        { name: 'Combo', value: `${tryoutData.combo || 0}/10`, inline: true },
        { name: 'Juking', value: `${tryoutData.juking || 0}/10`, inline: true },
        { name: 'Blocking', value: `${tryoutData.blocking || 0}/10`, inline: true },
        { name: 'Main', value: `${tryoutData.main || 0}/10`, inline: true }
      );
    }

    if (tryoutData.additionalNotes) {
      confirmEmbed.addFields({ name: 'Additional Notes', value: tryoutData.additionalNotes });
    }
    confirmEmbed.addFields({ name: 'Total Score', value: `${totalScore}/50` })
      .setFooter({ text: 'Tryout Bot | Created in 2 Days' });

    const confirmButton = new ButtonBuilder()
      .setCustomId(`confirm_tryout_${game.toLowerCase()}`)
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder()
      .setCustomId(`cancel_tryout_${game.toLowerCase()}`)
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger);
    const editButton = new ButtonBuilder()
      .setCustomId(`edit_tryout_${game.toLowerCase()}`)
      .setLabel('Edit')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton, editButton);

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [row],
      ephemeral: true
    });
  }

  // Confirm button
  if (interaction.isButton() && interaction.customId.startsWith('confirm_tryout_')) {
    const game = interaction.customId.split('_')[2].toUpperCase();
    const tryoutData = pendingTryouts.get(interaction.user.id);
    if (!tryoutData) {
      return interaction.reply({ content: 'Tryout data not found. Start over with /tryout.', ephemeral: true });
    }

    await processTryout(interaction, tryoutData);
    pendingTryouts.delete(interaction.user.id);
  }

  // Cancel button
  if (interaction.isButton() && interaction.customId.startsWith('cancel_tryout_')) {
    pendingTryouts.delete(interaction.user.id);
    await interaction.reply({ content: 'Tryout submission cancelled.', ephemeral: true });
  }

  // Edit button
  if (interaction.isButton() && interaction.customId.startsWith('edit_tryout_')) {
    if (!interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
      return interaction.reply({ content: 'You need the Tryout Host role to use this button.', ephemeral: true });
    }

    const game = interaction.customId.split('_')[2].toUpperCase();
    const tryoutData = pendingTryouts.get(interaction.user.id);
    if (!tryoutData) {
      return interaction.reply({ content: 'Tryout data not found. Start over with /tryout.', ephemeral: true });
    }

    const editModal = new ModalBuilder()
      .setCustomId(`edit_modal_${game.toLowerCase()}`)
      .setTitle(`${game} Tryout Edit`);

    const actionRows = [
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('user_id')
          .setLabel('User ID')
          .setStyle(TextInputStyle.Short)
          .setValue(tryoutData.userId)
          .setRequired(true)
      )
    ];

    if (game === 'MVSD') {
      actionRows.push(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('perks')
            .setLabel('Perks (e.g., 5-3)')
            .setStyle(TextInputStyle.Short)
            .setValue(tryoutData.perks || '')
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('no_perks')
            .setLabel('No Perks (e.g., 4-2)')
            .setStyle(TextInputStyle.Short)
            .setValue(tryoutData.noPerks || '')
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('aim')
            .setLabel('Aim (0-10)')
            .setStyle(TextInputStyle.Short)
            .setValue(`${tryoutData.aim || 0}`)
            .setRequired(true)
        )
      );
    } else if (game === 'RIVALS') {
      actionRows.push(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('aim')
            .setLabel('Aim (0-10)')
            .setStyle(TextInputStyle.Short)
            .setValue(`${tryoutData.aim || 0}`)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('game_sense')
            .setLabel('Game Sense (0-10)')
            .setStyle(TextInputStyle.Short)
            .setValue(`${tryoutData.gameSense || 0}`)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('juking')
            .setLabel('Juking (0-10)')
            .setStyle(TextInputStyle.Short)
            .setValue(`${tryoutData.juking || 0}`)
            .setRequired(true)
        )
      );
    } else if (game === 'TSB') {
      actionRows.push(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('movement')
            .setLabel('Movement (0-10)')
            .setStyle(TextInputStyle.Short)
            .setValue(`${tryoutData.movement || 0}`)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('combo')
            .setLabel('Combo (0-10)')
            .setStyle(TextInputStyle.Short)
            .setValue(`${tryoutData.combo || 0}`)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('juking')
            .setLabel('Juking (0-10)')
            .setStyle(TextInputStyle.Short)
            .setValue(`${tryoutData.juking || 0}`)
            .setRequired(true)
        )
      );
    }

    actionRows.push(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('additional_notes')
          .setLabel('Additional Notes (Optional)')
          .setStyle(TextInputStyle.Paragraph)
          .setValue(tryoutData.additionalNotes || '')
          .setRequired(false)
      )
    );

    editModal.addComponents(actionRows.slice(0, 5));
    await interaction.showModal(editModal);
  }

  // Edit modal submission
  if (interaction.isModalSubmit() && interaction.customId.startsWith('edit_modal_')) {
    const game = interaction.customId.split('_')[2].toUpperCase();
    const tryoutData = pendingTryouts.get(interaction.user.id);
    if (!tryoutData) {
      return interaction.reply({ content: 'Tryout data not found. Start over with /tryout.', ephemeral: true });
    }

    tryoutData.userId = interaction.fields.getTextInputValue('user_id');
    tryoutData.additionalNotes = interaction.fields.getTextInputValue('additional_notes') || '';

    if (game === 'MVSD') {
      tryoutData.perks = interaction.fields.getTextInputValue('perks');
      tryoutData.noPerks = interaction.fields.getTextInputValue('no_perks');
      tryoutData.aim = parseInt(interaction.fields.getTextInputValue('aim'));
      tryoutData.gameSense = tryoutData.gameSense || 0;
      tryoutData.juking = tryoutData.juking || 0;
      tryoutData.cover = tryoutData.cover || 0;
      tryoutData.movement = tryoutData.movement || 0;
    } else if (game === 'RIVALS') {
      tryoutData.aim = parseInt(interaction.fields.getTextInputValue('aim'));
      tryoutData.gameSense = parseInt(interaction.fields.getTextInputValue('game_sense'));
      tryoutData.juking = parseInt(interaction.fields.getTextInputValue('juking'));
      tryoutData.cover = tryoutData.cover || 0;
      tryoutData.movement = tryoutData.movement || 0;
    } else if (game === 'TSB') {
      tryoutData.movement = parseInt(interaction.fields.getTextInputValue('movement'));
      tryoutData.combo = parseInt(interaction.fields.getTextInputValue('combo'));
      tryoutData.juking = parseInt(interaction.fields.getTextInputValue('juking'));
      tryoutData.blocking = tryoutData.blocking || 0;
      tryoutData.main = tryoutData.main || 0;
    }

    let totalScore = 0;
    if (game === 'MVSD') {
      totalScore = (tryoutData.aim || 0) + (tryoutData.gameSense || 0) + (tryoutData.juking || 0) + (tryoutData.cover || 0) + (tryoutData.movement || 0);
    } else if (game === 'RIVALS') {
      totalScore = (tryoutData.aim || 0) + (tryoutData.gameSense || 0) + (tryoutData.juking || 0) + (tryoutData.cover || 0) + (tryoutData.movement || 0);
    } else if (game === 'TSB') {
      totalScore = (tryoutData.movement || 0) + (tryoutData.combo || 0) + (tryoutData.juking || 0) + (tryoutData.blocking || 0) + (tryoutData.main || 0);
    }
    tryoutData.totalScore = totalScore;

    const prefix = GAME_PREFIXES[game];
    let divisionKey = `${prefix} Division 4`;
    const div2PlusRoles = DIVISION_ROLES[game][`${prefix} Division 2`].requiredRoles;
    const div1Roles = DIVISION_ROLES[game][`${prefix} Division 1`].requiredRoles;

    if (totalScore >= 48 && interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id)) && 
        interaction.member.roles.cache.some(role => div1Roles.includes(role.id))) {
      divisionKey = `${prefix} Division 1`;
    } else if (totalScore >= 43 && totalScore <= 47 && interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id)) && 
               interaction.member.roles.cache.some(role => div2PlusRoles.includes(role.id))) {
      divisionKey = `${prefix} Division 2`;
    } else if (totalScore >= 30 && totalScore <= 42 && interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id)) && 
               interaction.member.roles.cache.some(role => div2PlusRoles.includes(role.id))) {
      divisionKey = `${prefix} Division 3`;
    } else if (totalScore <= 29 && interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id)) && 
               interaction.member.roles.cache.some(role => div2PlusRoles.includes(role.id))) {
      divisionKey = `${prefix} Division 4`;
    } else {
      const requiredRoles = divisionKey === `${prefix} Division 1` ? div1Roles.join(' or ') : div2PlusRoles.join(' or ');
      return interaction.reply({
        content: `You lack the required roles (Tryout Host and one of ${requiredRoles}) for ${divisionKey} (score: ${totalScore}/50).`,
        ephemeral: true
      });
    }
    tryoutData.division = divisionKey;

    const confirmEmbed = new EmbedBuilder()
      .setTitle(`${game} Tryout Confirmation`)
      .setDescription('Review the updated tryout data and confirm or edit.')
      .setColor('#FFD700')
      .addFields({ name: 'User ID', value: tryoutData.userId, inline: true })
      .addFields({ name: 'Game', value: game, inline: true })
      .addFields({ name: 'Division', value: divisionKey, inline: true });

    if (game === 'MVSD') {
      confirmEmbed.addFields(
        { name: 'Perks', value: tryoutData.perks || '0-0', inline: true },
        { name: 'No Perks', value: tryoutData.noPerks || '0-0', inline: true },
        { name: 'Aim', value: `${tryoutData.aim || 0}/10`, inline: true },
        { name: 'Game Sense', value: `${tryoutData.gameSense || 0}/10`, inline: true },
        { name: 'Juking', value: `${tryoutData.juking || 0}/10`, inline: true },
        { name: 'Cover', value: `${tryoutData.cover || 0}/10`, inline: true },
        { name: 'Movement', value: `${tryoutData.movement || 0}/10`, inline: true }
      );
    } else if (game === 'RIVALS') {
      confirmEmbed.addFields(
        { name: 'Aim', value: `${tryoutData.aim || 0}/10`, inline: true },
        { name: 'Game Sense', value: `${tryoutData.gameSense || 0}/10`, inline: true },
        { name: 'Juking', value: `${tryoutData.juking || 0}/10`, inline: true },
        { name: 'Cover', value: `${tryoutData.cover || 0}/10`, inline: true },
        { name: 'Movement', value: `${tryoutData.movement || 0}/10`, inline: true }
      );
    } else if (game === 'TSB') {
      confirmEmbed.addFields(
        { name: 'Movement', value: `${tryoutData.movement || 0}/10`, inline: true },
        { name: 'Combo', value: `${tryoutData.combo || 0}/10`, inline: true },
        { name: 'Juking', value: `${tryoutData.juking || 0}/10`, inline: true },
        { name: 'Blocking', value: `${tryoutData.blocking || 0}/10`, inline: true },
        { name: 'Main', value: `${tryoutData.main || 0}/10`, inline: true }
      );
    }

    if (tryoutData.additionalNotes) {
      confirmEmbed.addFields({ name: 'Additional Notes', value: tryoutData.additionalNotes });
    }
    confirmEmbed.addFields({ name: 'Total Score', value: `${totalScore}/50` })
      .setFooter({ text: 'Tryout Bot | Created in 2 Days' });

    const confirmButton = new ButtonBuilder()
      .setCustomId(`confirm_tryout_${game.toLowerCase()}`)
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder()
      .setCustomId(`cancel_tryout_${game.toLowerCase()}`)
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger);
    const editButton = new ButtonBuilder()
      .setCustomId(`edit_tryout_${game.toLowerCase()}`)
      .setLabel('Edit')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton, editButton);

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [row],
      ephemeral: true
    });
  }
});

async function processTryout(interaction, tryoutData) {
  await interaction.deferReply({ ephemeral: true });

  const { userId, division, game, perks, noPerks, aim, gameSense, juking, cover, movement, combo, blocking, main, additionalNotes, totalScore } = tryoutData;
  const divisionKey = division;

  try {
    if (isNaN(userId) || !/^\d{17,19}$/.test(userId)) {
      throw new Error('Invalid User ID format. Must be a valid Discord user ID.');
    }
    if (game === 'MVSD' && (!/^\d+-\d+$/.test(perks) || !/^\d+-\d+$/.test(noPerks))) {
      throw new Error('Invalid Perks or No Perks format. Use format like "5-3".');
    }
    const scores = [aim, gameSense, juking, cover, movement, combo, blocking, main].filter(val => val !== undefined);
    if (scores.some(score => isNaN(score) || score < 0 || score > 10)) {
      throw new Error('Invalid score format. Scores must be numbers between 0 and 10.');
    }

    const member = await interaction.guild.members.fetch(userId).catch(err => {
      throw new Error(`Failed to fetch member: ${err.message}`);
    });
    const rolesToAdd = DIVISION_ROLES[game][divisionKey].roleIds;

    // Remove existing division roles for the specific game
    for (const div in DIVISION_ROLES[game]) {
      for (const roleId of DIVISION_ROLES[game][div].roleIds) {
        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(roleId).catch(err => {
            throw new Error(`Failed to remove role ${roleId}: ${err.message}`);
          });
        }
      }
    }

    // Add new division roles
    for (const roleId of rolesToAdd) {
      let role = interaction.guild.roles.cache.get(roleId);
      if (!role) {
        role = await interaction.guild.roles.create({
          name: `Role_${roleId}`, // Fallback name, replace with actual role name if needed
          color: DIVISION_ROLES[game][divisionKey].color,
          reason: `Created for ${game} tryout division assignment`
        }).catch(err => {
          throw new Error(`Failed to create role ${roleId}: ${err.message}`);
        });
      }
      await member.roles.add(role).catch(err => {
        throw new Error(`Failed to add role ${roleId}: ${err.message}`);
      });
    }

    const resultEmbed = new EmbedBuilder()
      .setTitle(`${game} Tryout Results`)
      .setDescription(`${member.user.tag}, your tryout results are ready!`)
      .setColor(DIVISION_ROLES[game][divisionKey].color)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields({ name: 'Game', value: game, inline: true })
      .addFields({ name: 'Division', value: divisionKey, inline: true });

    if (game === 'MVSD') {
      resultEmbed.addFields(
        { name: 'Perks', value: perks || '0-0', inline: true },
        { name: 'No Perks', value: noPerks || '0-0', inline: true },
        { name: 'Aim', value: `${aim || 0}/10`, inline: true },
        { name: 'Game Sense', value: `${gameSense || 0}/10`, inline: true },
        { name: 'Juking', value: `${juking || 0}/10`, inline: true },
        { name: 'Cover', value: `${cover || 0}/10`, inline: true },
        { name: 'Movement', value: `${movement || 0}/10`, inline: true },
        { name: 'Total Score', value: `${totalScore}/50` }
      );
    } else if (game === 'RIVALS') {
      resultEmbed.addFields(
        { name: 'Aim', value: `${aim || 0}/10`, inline: true },
        { name: 'Game Sense', value: `${gameSense || 0}/10`, inline: true },
        { name: 'Juking', value: `${juking || 0}/10`, inline: true },
        { name: 'Cover', value: `${cover || 0}/10`, inline: true },
        { name: 'Movement', value: `${movement || 0}/10`, inline: true },
        { name: 'Total Score', value: `${totalScore}/50` }
      );
    } else if (game === 'TSB') {
      resultEmbed.addFields(
        { name: 'Movement', value: `${movement || 0}/10`, inline: true },
        { name: 'Combo', value: `${combo || 0}/10`, inline: true },
        { name: 'Juking', value: `${juking || 0}/10`, inline: true },
        { name: 'Blocking', value: `${blocking || 0}/10`, inline: true },
        { name: 'Main', value: `${main || 0}/10`, inline: true },
        { name: 'Total Score', value: `${totalScore}/50` }
      );
    }

    if (additionalNotes) {
      resultEmbed.addFields({ name: 'Additional Notes', value: additionalNotes });
    }
    resultEmbed.addFields({ name: 'Submitted by', value: interaction.user.tag })
      .setFooter({ text: 'Tryout Bot | made by denny' });

    const logChannel = interaction.guild.channels.cache.find(ch => ch.name === '🎯┊tryout-logs');
    if (logChannel) {
      // Send plain text ping message
      await logChannel.send({ content: `<@${userId}>, your tryout results for ${game} are ready!` }).catch(err => {
        console.error(`Failed to send ping message to #tryout-logs: ${err.message}`);
        interaction.followUp({ content: 'Could not send ping message to #tryout-logs channel.', ephemeral: true });
      });
      // Send the existing embed
      await logChannel.send({ embeds: [resultEmbed] }).catch(err => {
        console.error(`Failed to send embed to #tryout-logs: ${err.message}`);
        interaction.followUp({ content: 'Could not send embed to #tryout-logs channel.', ephemeral: true });
      });
    } else {
      await interaction.followUp({ content: 'Could not find #tryout-logs channel.', ephemeral: true });
    }

    try {
      await member.send({ embeds: [resultEmbed] });
    } catch (error) {
      console.error(`Failed to send DM to ${member.user.tag}: ${error.message}`);
      await interaction.followUp({ content: `Could not send DM to ${member.user.tag}. Their DMs may be closed.`, ephemeral: true });
    }

    await interaction.editReply({
      content: `Successfully assigned ${member.user.tag} to ${divisionKey} for ${game} with roles: ${rolesToAdd.join(', ')}`,
      ephemeral: true
    });
  } catch (error) {
    console.error(`Error in processTryout: ${error.message}`);
    await interaction.editReply({
      content: `Error: ${error.message}. Check User ID, scores (0-10), and Perks/No Perks format (e.g., "5-3").`,
      ephemeral: true
    });
  }
}

// Register slash commands
client.on('ready', async () => {
  try {
    const guild = client.guilds.cache.get(ALLOWED_GUILD_ID);
    if (!guild) {
      console.error('Allowed guild not found. Check ALLOWED_GUILD_ID.');
      return;
    }

    const commands = [
      {
        name: 'tryout',
        description: 'Send the tryout assignment embed'
      },
      {
        name: 'cat',
        description: 'Get a cute cat picture'
      },
      {
        name: 'dog',
        description: 'Get a cute dog picture'
      }
    ];

    await guild.commands.set(commands);
    console.log(`Registered slash commands for guild ${ALLOWED_GUILD_ID}`);
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
});

client.login(TOKEN);
