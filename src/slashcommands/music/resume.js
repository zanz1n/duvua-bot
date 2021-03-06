const slashCommand = require('../../structures/slashCommands')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const { Permissions } = require('discord.js')

module.exports = class extends slashCommand {
    constructor(client) {
        super(client, {
            name: "resume",
            description: "Despausa a reprodução do bot",
        })
    }

    async run(interaction) {
        const queue = this.client.player.getQueue(interaction.guildId)

        const embed = new MessageEmbed()
        if (!interaction.member.permissions.has(Permissions.FLAGS.MOVE_MEMBERS)) {
            embed.setDescription(`**Você não tem permissão para usar esse comando,  ${interaction.user.username}**`)
            return await interaction.editReply({ content: null, embeds: [embed] })
        }
        if (!queue) {
            embed.setDescription(`**Não há nenhum som na fila,  ${interaction.user.username}**`)
            return await interaction.editReply({ content: null, embeds: [embed] })
        }

        queue.setPaused(false)
        const pause = new MessageButton().setCustomId('pause').setLabel('⏸️ Pause').setStyle('PRIMARY')
        const button = new MessageActionRow().addComponents(pause)
        embed.setDescription(`**Bot despausado por ${interaction.user.username}**\nUse /pause para pausá-lo`)
        await interaction.editReply({ content: null, embeds: [embed], components: [button] })
    }
}
