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

//go:build unit || integration

package deployedver

import (
	"os"
	"testing"

	opt "github.com/release-argus/Argus/service/options"
	svcstatus "github.com/release-argus/Argus/service/status"
	"github.com/release-argus/Argus/util"
)

func stringPtr(val string) *string {
	return &val
}
func boolPtr(val bool) *bool {
	return &val
}
func TestMain(m *testing.M) {
	// initialize jLog
	jLog = util.NewJLog("DEBUG", false)
	jLog.Testing = true

	// run other tests
	exitCode := m.Run()

	// exit
	os.Exit(exitCode)
}

func testLookup() (lookup *Lookup) {
	lookup = New(
		boolPtr(true),
		nil,
		nil,
		"version",
		opt.New(
			nil, "", boolPtr(true),
			&opt.OptionsDefaults{}, &opt.OptionsDefaults{}),
		"",
		&svcstatus.Status{
			ServiceID: stringPtr("test")},
		"https://invalid.release-argus.io/json",
		&LookupDefaults{},
		&LookupDefaults{})
	return
}
