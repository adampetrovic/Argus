// Copyright [2023] [Argus]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package latestver

import (
	"sync"

	github_types "github.com/release-argus/Argus/service/latest_version/api_type"
	"github.com/release-argus/Argus/service/latest_version/filter"
	opt "github.com/release-argus/Argus/service/options"
	svcstatus "github.com/release-argus/Argus/service/status"
	"github.com/release-argus/Argus/util"
)

var (
	jLog *util.JLog
)

// LookupBase is the base struct for a Lookup.
type LookupBase struct {
	AccessToken       *string `yaml:"access_token,omitempty" json:"access_token,omitempty"`               // GitHub access token to use
	AllowInvalidCerts *bool   `yaml:"allow_invalid_certs,omitempty" json:"allow_invalid_certs,omitempty"` // default - false = Disallows invalid HTTPS certificates
	UsePreRelease     *bool   `yaml:"use_prerelease,omitempty" json:"use_prerelease,omitempty"`           // Whether the prerelease tag should be used
}

// LookupDefaults are the default values for a Lookup.
type LookupDefaults struct {
	LookupBase `yaml:",inline" json:",inline"`

	Require filter.RequireDefaults `yaml:"require" json:"require"` // Options to require before a release is considered valid
}

// NewDefaults returns a new LookupDefaults.
func NewDefaults(
	accessToken *string,
	allowInvalidCerts *bool,
	usePreRelease *bool,
	require *filter.RequireDefaults,
) (lookup *LookupDefaults) {
	lookup = &LookupDefaults{
		LookupBase: LookupBase{
			AccessToken:       accessToken,
			AllowInvalidCerts: allowInvalidCerts,
			UsePreRelease:     usePreRelease,
		}}
	if require != nil {
		lookup.Require = *require
	}
	return
}

type Lookup struct {
	Type        string `yaml:"type,omitempty" json:"type,omitempty"` // "github"/"URL"
	URL         string `yaml:"url,omitempty" json:"url,omitempty"`   // type:URL - "https://example.com", type:github - "owner/repo" or "https://github.com/owner/repo".
	LookupBase  `yaml:",inline" json:",inline"`
	URLCommands filter.URLCommandSlice `yaml:"url_commands,omitempty" json:"url_commands,omitempty"` // Commands to filter the release from the URL request
	Require     *filter.Require        `yaml:"require,omitempty" json:"require,omitempty"`           // Options to require before a release is considered valid

	GitHubData *GitHubData `yaml:"-" json:"-"` // GitHub Conditional Request vars

	Options *opt.Options      `yaml:"-" json:"-"` // Options
	Status  *svcstatus.Status `yaml:"-" json:"-"` // Service Status

	Defaults     *LookupDefaults `yaml:"-" json:"-"` // Defaults
	HardDefaults *LookupDefaults `yaml:"-" json:"-"` // Hard Defaults
}

// New returns a new Lookup.
func New(
	accessToken *string,
	allowInvalidCerts *bool,
	githubData *GitHubData,
	options *opt.Options,
	require *filter.Require,
	status *svcstatus.Status,
	lType string,
	url string,
	urlCommands *filter.URLCommandSlice,
	usePreRelease *bool,
	defaults *LookupDefaults,
	hardDefaults *LookupDefaults,
) (lookup *Lookup) {
	lookup = &Lookup{
		LookupBase: LookupBase{
			AccessToken:       accessToken,
			AllowInvalidCerts: allowInvalidCerts,
			UsePreRelease:     usePreRelease,
		},
		GitHubData:   githubData,
		Status:       status,
		Type:         lType,
		URL:          url,
		Require:      require,
		Options:      options,
		Defaults:     defaults,
		HardDefaults: hardDefaults}
	if urlCommands != nil {
		lookup.URLCommands = *urlCommands
	}
	if lookup.Status == nil {
		lookup.Status = svcstatus.New(
			nil, nil, nil,
			"", "", "", "", "", "")
	}
	return
}

// String returns a string representation of the Lookup.
func (l *Lookup) String(prefix string) (str string) {
	if l != nil {
		str = util.ToYAMLString(l, prefix)
	}
	return
}

// GitHubData is data needed in GitHub requests
type GitHubData struct {
	eTag     string                 // GitHub ETag for conditional requests https://docs.github.com/en/rest/overview/resources-in-the-rest-api#conditional-requestsl
	releases []github_types.Release // Track the ETag releases until they're usable

	mutex sync.RWMutex `json:"-"` // Mutex to protect the GitHubData
}

// NewGitHubData returns a new GitHubData.
func NewGitHubData(
	eTag string,
	releases *[]github_types.Release,
) (githubData *GitHubData) {
	githubData = &GitHubData{
		eTag:     eTag,
		releases: *releases}
	return
}

// String returns a string representation of the Status.
func (g *GitHubData) String() (str string) {
	if g == nil {
		return
	}
	type githubDataJSON struct {
		ETag     string                 `json:"etag,omitempty"`
		Releases []github_types.Release `json:"releases,omitempty"`
	}

	jsonStruct := githubDataJSON{
		ETag:     g.ETag(),
		Releases: g.Releases()}

	str = util.ToJSONString(jsonStruct)
	return
}

// Releases of the GitHubData.
func (g *GitHubData) Releases() []github_types.Release {
	g.mutex.RLock()
	defer g.mutex.RUnlock()

	return g.releases
}

// SetReleases of the GitHubData.
func (g *GitHubData) SetReleases(releases []github_types.Release) {
	g.mutex.Lock()
	defer g.mutex.Unlock()

	g.releases = releases
}

// ETag of the GitHubData.
func (g *GitHubData) ETag() string {
	g.mutex.RLock()
	defer g.mutex.RUnlock()

	return g.eTag
}

// SetETag of the GitHubData.
func (g *GitHubData) SetETag(etag string) {
	g.mutex.Lock()
	defer g.mutex.Unlock()

	g.eTag = etag
}

// Set the ETag and releases for the GitHubData.
func (g *GitHubData) Set(etag string, releases []github_types.Release) {
	g.mutex.Lock()
	defer g.mutex.Unlock()

	g.eTag = etag
	g.releases = releases
}

// isEqual will return a bool of whether this lookup is the same as `other` (excluding status).
func (l *Lookup) IsEqual(other *Lookup) bool {
	return l.String("") == other.String("")
}
