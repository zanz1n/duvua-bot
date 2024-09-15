package platform

import (
	"io"
	"net/url"
	"strings"

	"github.com/zanz1n/duvua/internal/errors"
	"github.com/zanz1n/duvua/internal/player/encoder"
	"github.com/zanz1n/duvua/pkg/player"
)

type Fetcher struct {
	yt Platform
}

func NewFetcher(ytf *Youtube) *Fetcher {
	if ytf == nil {
		ytf = NewYoutube(nil, 1)
	}
	return &Fetcher{yt: ytf}
}

func (f *Fetcher) Search(query string) (*player.TrackData, error) {
	if strings.HasPrefix(query, "https://") {
		u, err := url.Parse(query)
		if err != nil {
			return nil, errors.New("invalid url: " + err.Error())
		}

		switch {
		case strings.Contains(u.Host, "youtu"):
			return f.yt.SearchUrl(query)

		// case strings.Contains(u.Host, "soundcloud"):
		// case strings.Contains(u.Host, "spotify"):
		default:
			return nil, errors.Newf("invalid url host `%s`", u.Host)
		}
	}

	return f.yt.SearchString(query)
}

func (f *Fetcher) Fetch(query string) (Streamer, error) {
	platform, url, ok := strings.Cut(query, ":")
	if !ok {
		return nil, errors.New("invalid music format")
	}

	switch platform {
	case "youtube":
		return f.yt.Fetch(url)

	// case "spotify":
	// case "soundcloud":
	default:
		return nil, errors.New("invalid format")
	}
}

var _ Streamer = &readerStreamer{}

type readerStreamer struct {
	*encoder.Session
}

func newReaderStreamer(r io.ReadCloser) (*readerStreamer, error) {
	return &readerStreamer{encoder.NewSession(r, nil)}, nil
}

// SetSpeed implements Streamer.
func (s *readerStreamer) SetSpeed(speed TrackSpeed) error {
	// TODO: implement speed
	return nil
}

// SetVolume implements Streamer.
func (s *readerStreamer) SetVolume(volume uint8) error {
	// TODO: implement volume
	return nil
}