import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Paper,
  Button,
  Skeleton,
} from "@mui/material";
import {
  ArrowForward,
  Edit,
  Delete,
  ArrowLeft,
  ArrowRight,
} from "@mui/icons-material";
import styles from "./PractitionerList.module.css";
import { Practitioner } from "fhir/r4";
import PersonUtil from "../../../Services/Utils/PersonUtils";
import { SearchParams } from "fhir-kit-client";
import HandleResult from "../../../Utils/HandleResult";
import FhirResourceService from "../../../Services/FhirService";
import Tooltip from "@mui/material/Tooltip";
import { useTranslation } from "react-i18next";

interface PractitionerListProps {
  searchParam?: SearchParams;
  onDetailsClick?: (resource: Practitioner) => void;
  onEditClick?: (resource: Practitioner) => void;
  onDeleteClick?: (resource: Practitioner) => void;
}

function identifier(resource: Practitioner) {
  const identifier = PersonUtil.getIdentifierByCode(resource, "RUT");
  return (
    <Typography variant="body2" color="textSecondary" component="span">
      <strong>{identifier.system}</strong> {identifier.value}
    </Typography>
  );
}

const fhirService =
  FhirResourceService.getInstance<Practitioner>("Practitioner");

export default function PractitionerList({
  searchParam,
  onDetailsClick,
  onEditClick,
  onDeleteClick,
}: PractitionerListProps) {
  const { t } = useTranslation();
  const [resources, setResources] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNewResources = async (direction: "next" | "previous") => {
    setLoading(true);
    await HandleResult.handleOperation(
      () => fhirService.getNewResources(direction),
      t("practitionerList.receivedSuccessfully"),
      t("practitionerList.obtaining"),
      setResources
    );
    setLoading(false);
  };

  const fetchResources = async () => {
    setLoading(true);
    await HandleResult.handleOperation(
      () => fhirService.getResources(searchParam),
      t("practitionerList.receivedSuccessfully"),
      t("practitionerList.obtaining"),
      setResources
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, [searchParam]);

  const renderSkeleton = () => (
    <ListItem className={styles.listItem}>
      <ListItemAvatar
        className={styles.circularContainer}
        sx={{ marginRight: 2 }}
      >
        <Skeleton variant="circular" width={55} height={50} />
      </ListItemAvatar>
      <Box sx={{ flex: 1 }}>
        <ListItemText
          primary={<Skeleton variant="text" width="60%" />}
          secondary={
            <>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="text" width="50%" />
            </>
          }
        />
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    </ListItem>
  );

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(0, 0, 0, 0.12)",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      <List
        sx={{
          flex: 1,
          overflow: "hidden",
          height: "100%",
          "& .MuiListItem-root": {
            "& ::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 70,
              right: 0,
              borderBottom: "1px solid darkblue",
            },
          },
        }}
      >
        {loading
          ? Array.from(new Array(5)).map((_, index) => (
              <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
            ))
          : resources.map((resource) => (
              <React.Fragment key={resource.id}>
                <ListItem className={styles.listItem}>
                  <ListItemAvatar
                    className={styles.circularContainer}
                    sx={{ marginRight: 2 }}
                  >
                    <Avatar
                      sx={{ width: "55px", height: "50px" }}
                      src={
                        resource.photo?.[0]?.data
                          ? `data:${resource.photo[0].contentType};base64,${resource.photo[0].data}`
                          : resource.photo?.[0]?.url || undefined
                      }
                    />
                  </ListItemAvatar>
                  <Box sx={{ flex: 1 }}>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          color="textSecondary"
                          component="span"
                          sx={{ fontWeight: "bold", display: "block" }}
                        >
                          {resource.name?.[0]?.text}
                        </Typography>
                      }
                      secondary={
                        <>
                          {identifier(resource)}
                          <Box component="span" className={styles.block}>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              component="span"
                            >
                              <strong>{t("practitionerList.age")}:</strong>{" "}
                              {PersonUtil.calcularEdad(resource.birthDate!)}
                            </Typography>
                          </Box>
                          <Box component="span" className={styles.block}>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              component="span"
                            >
                              <strong>{t("practitionerList.phone")}:</strong>{" "}
                              {PersonUtil.getContactPointFirstOrDefaultAsString(
                                resource,
                                "phone"
                              )}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {onDetailsClick && (
                      <Tooltip title={t("practitionerList.derivePractitioner")}>
                        <IconButton
                          className={styles.circularContainer}
                          color="primary"
                          aria-label="derive"
                          onClick={() => onDetailsClick(resource)}
                        >
                          <ArrowForward />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onEditClick && (
                      <Tooltip title={t("practitionerList.edit")}>
                        <IconButton
                          className={styles.circularContainer}
                          color="primary"
                          aria-label="edit"
                          onClick={() => onEditClick(resource)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDeleteClick && (
                      <Tooltip title={t("practitionerList.delete")}>
                        <IconButton
                          className={styles.circularContainer}
                          color="error"
                          aria-label="delete"
                          onClick={() => onDeleteClick(resource)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
      </List>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: 1,
          borderColor: "divider",
          paddingTop: 1,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowLeft />}
          onClick={() => handleNewResources("previous")}
          disabled={!fhirService.hasPrevPage}
        >
          {t("practitionerList.previous")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowRight />}
          onClick={() => handleNewResources("next")}
          disabled={!fhirService.hasNextPage}
        >
          {t("practitionerList.next")}
        </Button>
      </Box>
    </Paper>
  );
}