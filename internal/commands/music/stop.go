package musiccmds

import (
	"github.com/bwmarrin/discordgo"
	"github.com/zanz1n/duvua-bot/internal/errors"
	"github.com/zanz1n/duvua-bot/internal/manager"
	"github.com/zanz1n/duvua-bot/internal/music"
	"github.com/zanz1n/duvua-bot/pkg/player"
)

var stopCommandData = discordgo.ApplicationCommand{
	Name:        "stop",
	Type:        discordgo.ChatApplicationCommand,
	Description: "Para e limpa a fila de músicas",
	DescriptionLocalizations: &map[discordgo.Locale]string{
		discordgo.EnglishUS: "Stops and cleans the music queue",
	},
}

func NewStopCommand(r music.MusicConfigRepository, client *player.HttpClient) manager.Command {
	return manager.Command{
		Accepts: manager.CommandAccept{
			Slash:  true,
			Button: true,
		},
		Data:     &stopCommandData,
		Category: manager.CommandCategoryMusic,
		Handler:  &StopCommand{r: r, c: client},
	}
}

type StopCommand struct {
	r music.MusicConfigRepository
	c *player.HttpClient
}

func (c *StopCommand) Handle(s *discordgo.Session, i *manager.InteractionCreate) error {
	if i.Member == nil || i.GuildID == "" {
		return errors.New("esse comando só pode ser utilizado dentro de um servidor")
	}

	cfg, err := c.r.GetOrDefault(i.GuildID)
	if err != nil {
		return err
	}

	if err = canControl(i.Member, cfg); err != nil {
		return err
	}

	if err = c.c.Stop(i.GuildID); err != nil {
		return err
	}

	return i.Replyf(s, "OK!")
}