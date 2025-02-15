import {
  HeaderType,
  NotifyNtfyAction,
  NotifyOpsGenieTarget,
} from "types/config";
import {
  NotifyOpsGenieDetailType,
  ServiceEditAPIType,
  ServiceEditOtherData,
  ServiceEditType,
} from "types/service-edit";

export const convertAPIServiceDataEditToUI = (
  name: string,
  serviceData?: ServiceEditAPIType,
  otherOptionsData?: ServiceEditOtherData
): ServiceEditType => {
  if (serviceData && name) {
    // Edit service defaults
    return {
      ...serviceData,
      options: {
        ...serviceData?.options,
        active: serviceData?.options?.active !== false,
      },
      latest_version: {
        ...serviceData?.latest_version,
        require: {
          ...serviceData?.latest_version?.require,
          command: serviceData?.latest_version?.require?.command?.map(
            (arg) => ({
              arg: arg as string,
            })
          ),
          docker: {
            type: serviceData?.latest_version?.require?.docker?.type || "",
            image: serviceData?.latest_version?.require?.docker?.image,
            tag: serviceData?.latest_version?.require?.docker?.tag,
            username: serviceData?.latest_version?.require?.docker?.username,
            token: serviceData?.latest_version?.require?.docker?.token,
          },
        },
      },
      name: name,
      deployed_version: {
        url: serviceData?.deployed_version?.url,
        allow_invalid_certs: serviceData?.deployed_version?.allow_invalid_certs,
        basic_auth: {
          username: serviceData?.deployed_version?.basic_auth?.username || "",
          password: serviceData?.deployed_version?.basic_auth?.password || "",
        },
        headers:
          serviceData?.deployed_version?.headers?.map((header, key) => ({
            ...header,
            oldIndex: key,
          })) || [],
        json: serviceData?.deployed_version?.json,
        regex: serviceData?.deployed_version?.regex,
      },
      command: serviceData?.command?.map((args) => ({
        args: args.map((arg) => ({ arg })),
      })),
      webhook: serviceData?.webhook?.map((item) => ({
        ...item,
        custom_headers: item.custom_headers?.map((header, index) => ({
          ...header,
          oldIndex: index,
        })),
        oldIndex: item.name,
      })),
      notify: serviceData?.notify?.map((item) => ({
        ...item,
        oldIndex: item.name,
        params: {
          avatar: "", // controlled param
          color: "", // ^
          icon: "", // ^
          ...convertNotifyParams(
            item.name as string,
            item.type,
            item.params,
            otherOptionsData
          ),
        },
      })),
      dashboard: {
        auto_approve: undefined,
        icon: "",
        ...serviceData?.dashboard,
      },
    };
  }

  // New service defaults
  return {
    name: "",
    options: { active: true },
    latest_version: {
      type: "github",
      require: { docker: { type: "" } },
    },
    dashboard: {
      auto_approve: undefined,
      icon: "",
      icon_link_to: "",
      web_url: "",
    },
  };
};

export const convertOpsGenieDetailsFromString = (
  str?: string | NotifyOpsGenieDetailType[]
): NotifyOpsGenieDetailType[] | undefined => {
  // already converted
  if (typeof str === "object") return str as NotifyOpsGenieDetailType[];
  // undefined/empty
  if (str === undefined || str === "") return undefined;

  // convert from a JSON string
  try {
    return Object.entries(JSON.parse(str)).map(([key, value], i) => ({
      id: i,
      key: key,
      value: value,
    })) as NotifyOpsGenieDetailType[];
  } catch (error) {
    return [];
  }
};

export const convertOpsGenieTargetFromString = (
  str?: string | NotifyOpsGenieTarget[]
): NotifyOpsGenieTarget[] | undefined => {
  // already converted
  if (typeof str === "object") return str as NotifyOpsGenieTarget[];
  // undefined/empty
  if (str === undefined || str === "") return undefined;

  // convert from a JSON string
  try {
    return JSON.parse(str).map(
      (
        obj: { id: string; type: string; name: string; username: string },
        i: number
      ) => {
        // id
        if (obj.id) {
          return {
            id: i,
            type: obj.type,
            sub_type: "id",
            value: obj.id,
          };
        } else {
          // username/name
          return {
            id: i,
            type: obj.type,
            sub_type: obj.type === "user" ? "username" : "name",
            value: obj.name || obj.username,
          };
        }
      }
    ) as NotifyOpsGenieTarget[];
  } catch (error) {
    return [];
  }
};

export const convertNtfyActionsFromString = (
  str?: string | NotifyNtfyAction[]
): NotifyNtfyAction[] | undefined => {
  // already converted
  if (typeof str === "object") return str as NotifyNtfyAction[];
  if (str === undefined || str === "") return undefined;

  // convert from a JSON string
  try {
    return JSON.parse(str).map((obj: NotifyNtfyAction, i: number) => ({
      id: i,
      ...obj,
      headers: obj.headers
        ? convertStringMapToHeaderType(obj.headers as { [key: string]: string })
        : undefined,
      extras: obj.extras
        ? convertStringMapToHeaderType(obj.extras as { [key: string]: string })
        : undefined,
    })) as NotifyNtfyAction[];
  } catch (error) {
    return [];
  }
};

export const convertNotifyParams = (
  name: string,
  type?: string,
  params?: { [key: string]: string },
  otherOptionsData?: ServiceEditOtherData
) => {
  const notifyType = type || otherOptionsData?.notify?.[name]?.type || name;
  switch (notifyType) {
    case "ntfy":
      return {
        ...params,
        actions: convertNtfyActionsFromString(params?.actions),
      };
    case "opsgenie":
      return {
        ...params,
        details: convertOpsGenieDetailsFromString(params?.details),
        targets: convertOpsGenieTargetFromString(params?.targets),
      };
    default:
      return params;
  }
};

const convertStringMapToHeaderType = (headers?: {
  [key: string]: string;
}): HeaderType[] | undefined => {
  if (!headers) return undefined;
  return Object.keys(headers).map((key) => ({
    key: key,
    value: headers[key],
  }));
};
