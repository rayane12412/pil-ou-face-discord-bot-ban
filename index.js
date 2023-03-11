const Discord = require('discord.js');
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

const PREFIX = 'MTA4NDIxMTg1Mjg3NzI1MDYyMQ.GZo6eo.Hx8ITAWWRx66NG2jDbMN0r09SjjCC4pxvPFM9Y';

client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ne pas répondre aux messages provenant d'autres bots
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'pile_ou_face') {
    if (!message.guild.me.permissions.has('MANAGE_ROLES')) {
      return message.reply('Je n\'ai pas les permissions nécessaires pour exclure des utilisateurs!');
    }

    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply('Vous n\'avez pas la permission de lancer cette commande!');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Vous devez mentionner un utilisateur!');
    }

    const msg = await message.channel.send(`Pile ou face pour ${user}...`);

    await msg.react('👍'); // Pile
    await msg.react('👎'); // Face

    const filter = (reaction, reactedUser) => {
      return ['👍', '👎'].includes(reaction.emoji.name) && reactedUser.id === user.id;
    };

    try {
      const collected = await msg.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] });
      const reaction = collected.first();

      const isHeads = Math.random() < 0.5;
      const correctReaction = isHeads ? '👍' : '👎';

      const resultMsg = await message.channel.send(`Le résultat est ${isHeads ? 'pile' : 'face'}!`);

      if (reaction.emoji.name !== correctReaction) {
        const role = message.guild.roles.cache.find(role => role.name === 'Exclu');
        if (!role) {
          return message.channel.send('Le rôle "Exclu" n\'a pas été trouvé sur ce serveur!');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
          return message.channel.send('L\'utilisateur mentionné n\'a pas été trouvé sur ce serveur!');
        }

        await member.roles.add(role);
        resultMsg.edit(`${user} a perdu! Ils sont exclus jusqu'à ce qu'un modérateur retire leur rôle.`);
      } else {
        resultMsg.edit(`${user} a gagné!`);
      }
    } catch (err) {
      if (err instanceof Discord.Collection) {
        return message.channel.send(`Désolé ${user}, vous n'avez pas répondu à temps!`);
      } else {
        console.error(err);
        return message.channel.send('Une erreur s\'est produite lors de l\'exécution de cette commande!');
      }
    }
  }
});

client.login('YOUR_BOT_TOKEN');
