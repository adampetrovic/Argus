import { FC, memo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

interface Props {
  text: string | JSX.Element;
  placement?: "top" | "right" | "bottom" | "left";
}

const HelpTooltip: FC<Props> = ({ text, placement = "top" }) => (
  <OverlayTrigger
    placement={placement}
    delay={{ show: 500, hide: 500 }}
    overlay={<Tooltip id={`help-semantic-versioning`}>{text}</Tooltip>}
  >
    <FontAwesomeIcon
      icon={faQuestionCircle}
      style={{
        paddingLeft: "0.25em",
        height: "0.75em",
      }}
    />
  </OverlayTrigger>
);

export default memo(HelpTooltip);
