// Copyright [2022] [Argus]
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

package shoutrrr

import (
	svcstatus "github.com/release-argus/Argus/service/status"
	"github.com/release-argus/Argus/util"
)

var (
	jLog *util.JLog
)

// Slice mapping of Shoutrrr.
type Slice map[string]*Shoutrrr

type Shoutrrr struct {
	Type          string            `yaml:"type,omitempty"` // Notification type, e.g. slack
	ID            string            `yaml:"-"`              // ID for this Shoutrrr sender
	Failed        *map[string]*bool `yaml:"-"`              // Whether the last send attempt failed
	ServiceStatus *svcstatus.Status `yaml:"-"`              // Status of the Service (used for templating commands)
	Main          *Shoutrrr         `yaml:"-"`              // The Shoutrrr that this Shoutrrr is calling (and may override parts of)
	Defaults      *Shoutrrr         `yaml:"-"`              // Default values
	HardDefaults  *Shoutrrr         `yaml:"-"`              // Harcoded default values

	// Unsure whether to switch this to a base service which specific services inherit and define the Options/URLFields/Params
	// Thinking this may be preferable as it makes adding new services much quicker/easier
	Options   map[string]string `yaml:"options,omitempty"`    // Options
	URLFields map[string]string `yaml:"url_fields,omitempty"` // URL Fields
	Params    map[string]string `yaml:"params,omitempty"`     // Query/Param Props
}
