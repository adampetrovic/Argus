import { FormItem, FormKeyValMap, FormLabel } from "components/generic/form";
import {
  convertOpsGenieDetailsFromString,
  convertOpsGenieTargetFromString,
} from "../util/api-ui-conversions";
import { useEffect, useMemo } from "react";

import { NotifyOpsGenieType } from "types/config";
import { NotifyOptions } from "./generic";
import { OpsGenieTargets } from "./extra";
import { globalOrDefault } from "./util";
import { useFormContext } from "react-hook-form";

const OPSGENIE = ({
  name,

  global,
  defaults,
  hard_defaults,
}: {
  name: string;

  global?: NotifyOpsGenieType;
  defaults?: NotifyOpsGenieType;
  hard_defaults?: NotifyOpsGenieType;
}) => {
  const { getValues, setValue } = useFormContext();

  const convertedDefaults = useMemo(
    () => ({
      details: convertOpsGenieDetailsFromString(
        globalOrDefault(
          global?.params?.details as string,
          defaults?.params?.details as string,
          hard_defaults?.params?.details as string
        )
      ),
      responders: convertOpsGenieTargetFromString(
        globalOrDefault(
          global?.params?.responders as string,
          defaults?.params?.responders as string,
          hard_defaults?.params?.responders as string
        )
      ),
      visibleto: convertOpsGenieTargetFromString(
        globalOrDefault(
          global?.params?.visibleto as string,
          defaults?.params?.visibleto as string,
          hard_defaults?.params?.visibleto as string
        )
      ),
    }),
    [global, defaults, hard_defaults]
  );

  useEffect(() => {
    const details = getValues(`${name}.params.details`);

    if (typeof details === "string")
      setValue(
        `${name}.params.details`,
        convertOpsGenieDetailsFromString(details)
      );

    const responders = getValues(`${name}.paramms.responders`);
    if (typeof responders === "string")
      setValue(
        `${name}.params.responders`,
        convertOpsGenieTargetFromString(responders)
      );

    const visibleto = getValues(`${name}.params.visibleto`);
    if (typeof visibleto === "string")
      setValue(
        `${name}.params.visibleto`,
        convertOpsGenieTargetFromString(visibleto)
      );
  }, []);

  return (
    <>
      <NotifyOptions
        name={name}
        global={global?.options}
        defaults={defaults?.options}
        hard_defaults={hard_defaults?.options}
      />
      <>
        <FormLabel text="URL Fields" heading />
        <FormItem
          name={`${name}.url_fields.host`}
          col_sm={9}
          label="Host"
          tooltip="The OpsGenie API host. Use 'api.eu.opsgenie.com' for EU instances"
          defaultVal={globalOrDefault(
            global?.url_fields?.host,
            defaults?.url_fields?.host,
            hard_defaults?.url_fields?.host
          )}
        />
        <FormItem
          name={`${name}.url_fields.port`}
          col_sm={3}
          type="number"
          label="Port"
          defaultVal={globalOrDefault(
            global?.url_fields?.port,
            defaults?.url_fields?.port,
            hard_defaults?.url_fields?.port
          )}
          onRight
        />
        <FormItem
          name={`${name}.url_fields.apikey`}
          required
          col_sm={12}
          label="API Key"
          defaultVal={globalOrDefault(
            global?.url_fields?.apikey,
            defaults?.url_fields?.apikey,
            hard_defaults?.url_fields?.apikey
          )}
        />
      </>
      <>
        <FormLabel text="Params" heading />
        <FormItem
          name={`${name}.params.actions`}
          label="Actions"
          tooltip="Custom actions that will be available for the alert"
          defaultVal={globalOrDefault(
            global?.params?.actions,
            defaults?.params?.actions,
            hard_defaults?.params?.actions
          )}
        />
        <FormItem
          name={`${name}.params.alias`}
          label="Alias"
          tooltip="Client-defined identifier of the alert"
          defaultVal={globalOrDefault(
            global?.params?.alias,
            defaults?.params?.alias,
            hard_defaults?.params?.alias
          )}
          onRight
        />
        <FormItem
          name={`${name}.params.description`}
          label="Description"
          tooltip="Description field of the alert"
          defaultVal={globalOrDefault(
            global?.params?.description,
            defaults?.params?.description,
            hard_defaults?.params?.description
          )}
        />
        <FormItem
          name={`${name}.params.note`}
          label="Note"
          tooltip="Additional note that will be added while creating the alert"
          defaultVal={globalOrDefault(
            global?.params?.note,
            defaults?.params?.note,
            hard_defaults?.params?.note
          )}
          onRight
        />
        <FormKeyValMap
          name={`${name}.params.details`}
          label="Details"
          tooltip="Map of key-val custom props of the alert"
          keyPlaceholder="e.g. X-Authorization"
          valuePlaceholder="e.g. 'Bearer TOKEN'"
          defaults={convertedDefaults.details}
        />
        <FormItem
          name={`${name}.params.entity`}
          label="Entity"
          tooltip="Entity field of the alert that is generally used to specify which domain the Source field of the alert"
          defaultVal={globalOrDefault(
            global?.params?.entity,
            defaults?.params?.entity,
            hard_defaults?.params?.entity
          )}
        />
        <FormItem
          name={`${name}.params.priority`}
          type="number"
          label="Priority"
          tooltip="Priority level of the alert. 1/2/3/4/5"
          defaultVal={globalOrDefault(
            global?.params?.priority,
            defaults?.params?.priority,
            hard_defaults?.params?.priority
          )}
          onRight
        />
        <OpsGenieTargets
          name={`${name}.params.responders`}
          label="Responders"
          tooltip="Teams, users, escalations and schedules that the alert will be routed to"
          defaults={convertedDefaults.responders}
        />
        <FormItem
          name={`${name}.params.source`}
          label="Source"
          tooltip="Source field of the alert"
          defaultVal={globalOrDefault(
            global?.params?.source,
            defaults?.params?.source,
            hard_defaults?.params?.source
          )}
        />
        <FormItem
          name={`${name}.params.tags`}
          label="Tags"
          tooltip="Tags of the alert"
          defaultVal={globalOrDefault(
            global?.params?.tags,
            defaults?.params?.tags,
            hard_defaults?.params?.tags
          )}
          onRight
        />
        <FormItem
          name={`${name}.params.title`}
          label="Title"
          tooltip="Notification title, optionally set by the sender"
          defaultVal={globalOrDefault(
            global?.params?.title,
            defaults?.params?.title,
            hard_defaults?.params?.title
          )}
        />
        <FormItem
          name={`${name}.params.user`}
          label="User"
          tooltip="Display name of the request owner"
          defaultVal={globalOrDefault(
            global?.params?.user,
            defaults?.params?.user,
            hard_defaults?.params?.user
          )}
          onRight
        />
      </>
      <OpsGenieTargets
        name={`${name}.params.visibleto`}
        label="Visible To"
        tooltip="Teams and users that the alert will become visible to without sending any notification"
        defaults={convertedDefaults.visibleto}
      />
    </>
  );
};

export default OPSGENIE;
