const Bot = require('../../structures/Client')
const { MessageActionRow, MessageButton, Interaction, MessageEmbed, Permissions } = require('discord.js')
const Event = require('../../structures/Event')

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "interactionCreate"
        })
    }
    /**
     * 
     * @param {Interaction} interaction 
     * @param {Bot} this.client
     * 
     */
    run = async (interaction) => {
        if (interaction.user.bot) return

        interaction.guild.db = await this.client.db.guilds.findById(interaction.guild.id) ||
            new this.client.db.guilds({ _id: interaction.guild.id, name: interaction.guild.name });

        interaction.member.db = await this.client.db.member.findById(interaction.guild.id + interaction.user.id) ||
            new this.client.db.member({ _id: interaction.guild.id + interaction.user.id, guildid: interaction.guild.id, userid: interaction.user.id, usertag: interaction.user.tag });

        interaction.user.db = await this.client.db.user.findById(interaction.user.id) ||
            new this.client.db.user({ _id: interaction.user.id, usertag: interaction.user.tag });

        interaction.user.db.save()
        interaction.member.db.save()
        interaction.guild.db.save()

        if (interaction.isButton()) {
            const ver = (name) => interaction.customId === name
            if (!(ver("skip") || ver("stop") || ver("pause") || ver("resume"))) return

            const queue = this.client.player.getQueue(interaction.guildId)
            const embed = new MessageEmbed()

            const pause = new MessageButton().setCustomId('pause').setLabel('⏸️ Pause').setStyle('PRIMARY')
            const resume = new MessageButton().setCustomId('resume').setLabel('▶️ Resume').setStyle('SUCCESS')

            if (interaction.customId === "skip") {
                if (!queue) {
                    embed.setDescription(`**Não há nenhum som na fila,  ${interaction.user.username}**`)
                    return await interaction.reply({ content: null, embeds: [embed], ephemeral: true })
                }
                queue.skip()

                embed.setDescription(`**Música** ${queue.current.title} **pulada por ${interaction.user.username}**`)
                await interaction.reply({ content: null, embeds: [embed] })

            }
            else if (interaction.customId === "stop") {
                if (!interaction.member.permissions.has(Permissions.FLAGS.MOVE_MEMBERS)) {
                    embed.setDescription(`**Você não tem permissão para usar esse comando,  ${interaction.user.username}**`)
                    return await interaction.reply({ content: null, embeds: [embed], ephemeral: true })
                }
                if (!queue) {
                    embed.setDescription(`**Não há nenhum som na fila,  ${interaction.user.username}**`)
                    return await interaction.reply({ content: null, embeds: [embed], ephemeral: true })
                }

                queue.destroy()

                embed.setDescription(`**A fila foi limpa por ${interaction.user.username}**`)
                await interaction.reply({ content: null, embeds: [embed] })
            }
            else if (interaction.customId === "pause") {
                if (!interaction.member.permissions.has(Permissions.FLAGS.MOVE_MEMBERS)) {
                    embed.setDescription(`**Você não tem permissão para usar esse comando,  ${interaction.user.username}**`)
                    return await interaction.reply({ content: null, embeds: [embed], ephemeral: true })
                }
                if (!queue) {
                    embed.setDescription(`**Não há nenhum som na fila,  ${interaction.user.username}**`)
                    return await interaction.reply({ content: null, embeds: [embed], ephemeral: true })
                }

                queue.setPaused(true)

                const button = new MessageActionRow().addComponents(resume)
                embed.setDescription(`**Bot pausado por ${interaction.user.username}**\nUse /resume para continuar a reprodução`)
                await interaction.reply({ content: null, embeds: [embed], components: [button] })
            }
            else if (interaction.customId === "resume") {

                if (!interaction.member.permissions.has(Permissions.FLAGS.MOVE_MEMBERS)) {
                    embed.setDescription(`**Você não tem permissão para usar esse comando,  ${interaction.user.username}**`)
                    return await interaction.reply({ content: null, embeds: [embed], ephemeral: true })
                }
                if (!queue) {
                    embed.setDescription(`**Não há nenhum som na fila,  ${interaction.user.username}**`)
                    return await interaction.reply({ content: null, embeds: [embed], ephemeral: true })
                }

                queue.setPaused(false)

                const button = new MessageActionRow().addComponents(pause)
                embed.setDescription(`**Bot despausado por ${interaction.user.username}**\nUse /pause para pausá-lo`)
                await interaction.reply({ content: null, embeds: [embed], components: [button] })
            }
        }

        if (interaction.isCommand) {
            const cmd = await this.client.slashCommands.find(c => c.name === interaction.commandName)

            if (!cmd) return

            const ephemeral = (string) => interaction.commandName === string //boolean

            if (ephemeral("info")) {
                await interaction.deferReply({ ephemeral: true })
            } else {
                await interaction.deferReply()
            }
            cmd.run(interaction).catch((err) => {
                if (err) console.log("\x1b[31m[bot-err] something whent wrong trying to execute a slashCommand\x1b[0m\n",
                    err,
                    "\n\x1b[33m[bot-api] this may affect the usability of the bot\x1b[0m"
                )
            })
        }
    }
}
