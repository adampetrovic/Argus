import {
  Button,
  Card,
  Container,
  ListGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { ModalType, ServiceSummaryType } from "types/summary";
import { ReactElement, forwardRef, useCallback, useContext } from "react";
import {
  faAngleDoubleUp,
  faCheck,
  faInfo,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ModalContext } from "contexts/modal";
import { formatRelative } from "date-fns";

const FaInfoCircle = forwardRef((props, ref) => (
  <FontAwesomeIcon
    forwardedRef={ref}
    icon={faInfoCircle}
    {...props}
    style={{ paddingLeft: "0.5rem" }}
  />
));
FaInfoCircle.displayName = "FaInfoCircle";

interface ServiceInfoData {
  service: ServiceSummaryType;
  updateAvailable: boolean;
  updateSkipped: boolean;
  setShowUpdateInfo: () => void;
}

export const ServiceInfo = ({
  service,
  updateAvailable,
  updateSkipped,
  setShowUpdateInfo,
}: ServiceInfoData): ReactElement => {
  const { handleModal } = useContext(ModalContext);

  const showModal = useCallback(
    (type: ModalType, service: ServiceSummaryType) => {
      handleModal(type, service);
    },
    [handleModal]
  );

  // If version hasn't been found or a new version has been found
  const serviceWarning =
    service?.status?.deployed_version === undefined ||
    service?.status?.deployed_version === "" ||
    (updateAvailable && !updateSkipped);

  const updateApproved =
    service?.status?.latest_version !== undefined &&
    service.status.latest_version === service?.status?.approved_version;

  return (
    <Container
      style={{
        padding: "0px",
      }}
      className={serviceWarning ? "alert-warning" : "default"}
    >
      <ListGroup className="list-group-flush">
        {updateAvailable && !updateSkipped ? (
          <>
            <ListGroup.Item
              key="update-available"
              className={"service-item update-options alert-warning"}
              variant="secondary"
            >
              {updateApproved && service.webhook
                ? "WebHooks already sent:"
                : "Update available:"}
            </ListGroup.Item>
            <ListGroup.Item
              key="update-buttons"
              className={"service-item update-options alert-warning"}
              variant="secondary"
              style={{ paddingTop: "0.25rem" }}
            >
              <Button
                key="details"
                className="btn-flex btn-update-action"
                variant="primary"
                onClick={() => setShowUpdateInfo()}
              >
                <FontAwesomeIcon icon={faInfo} />
              </Button>
              <Button
                key="approve"
                className="btn-flex btn-update-action"
                variant="success"
                onClick={() =>
                  showModal(updateApproved ? "RESEND" : "SEND", service)
                }
                disabled={updateApproved || service.webhook === undefined}
              >
                <FontAwesomeIcon icon={faCheck} />
              </Button>
              <Button
                key="reject"
                className="btn-flex btn-update-action"
                variant="danger"
                onClick={() => showModal("SKIP", service)}
                disabled={updateApproved || service.webhook === undefined}
              >
                <FontAwesomeIcon icon={faTimes} color="white" />
              </Button>
            </ListGroup.Item>
          </>
        ) : (
          <ListGroup.Item
            key="deployed_v"
            variant={serviceWarning ? "warning" : "secondary"}
            className={
              "service-item" + (service.webhook ? "" : " justify-left")
            }
          >
            <p style={{ margin: 0 }}>
              Current version:
              {service.has_deployed_version === true && (
                <OverlayTrigger
                  key="deployed-service"
                  placement="top"
                  delay={{ show: 500, hide: 500 }}
                  overlay={
                    <Tooltip id={`tooltip-deployed-service`}>
                      of the deployed Service
                    </Tooltip>
                  }
                >
                  <FaInfoCircle />
                </OverlayTrigger>
              )}
              <br />
              <OverlayTrigger
                key="deployed-version"
                placement="top"
                delay={{ show: 500, hide: 500 }}
                overlay={
                  service?.status?.deployed_version_timestamp ? (
                    <Tooltip id={`tooltip-deployed-version`}>
                      <>
                        {formatRelative(
                          new Date(service.status.deployed_version_timestamp),
                          new Date()
                        )}
                      </>
                    </Tooltip>
                  ) : (
                    <>Unknown</>
                  )
                }
              >
                <p style={{ margin: 0 }}>
                  {service?.status?.deployed_version
                    ? service.status.deployed_version
                    : "Unknown"}{" "}
                </p>
              </OverlayTrigger>
            </p>
            {service.webhook && (!updateAvailable || updateSkipped) && (
              <OverlayTrigger
                key="resend"
                placement="top"
                delay={{ show: 500, hide: 500 }}
                overlay={
                  <Tooltip id={`tooltip-resend`}>
                    {updateSkipped
                      ? "Approve this release"
                      : "Resend the WebHooks"}
                  </Tooltip>
                }
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    showModal(updateSkipped ? "SEND" : "RESEND", service)
                  }
                  disabled={service.loading}
                >
                  <FontAwesomeIcon
                    icon={updateSkipped ? faCheck : faAngleDoubleUp}
                  />
                </Button>
              </OverlayTrigger>
            )}
          </ListGroup.Item>
        )}
      </ListGroup>
      <Card.Footer
        className={
          serviceWarning || !service?.status?.last_queried
            ? "alert-warning"
            : ""
        }
      >
        <small
          className={
            "text-muted same-color" + (serviceWarning ? " alert-warning" : "")
          }
        >
          {service?.status?.last_queried ? (
            <>
              Queried{" "}
              {formatRelative(
                new Date(service.status.last_queried),
                new Date()
              )}
            </>
          ) : service.loading ? (
            "loading"
          ) : (
            "no successful queries"
          )}
        </small>
      </Card.Footer>
    </Container>
  );
};
