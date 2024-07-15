import React, { ReactElement, useEffect, useState } from "react";
import "./users.scss";
import { API_ENDPOINT } from "../../core/constants";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  ListItemText,
  ListItemButton,
  List,
  ListItem,
  TextField,
  DialogActions,
} from "@mui/material";
import { AppUser, TPlayersList } from "../../types";
import { updateUsersPlayer } from "../../firestore/competition";

type TUsersPageProps = {
  user: AppUser;
  playersMap: TPlayersList;
  usersMap: { [key: string]: string };
  showLoader: (visible: boolean) => void;
};

type TUser = {
  uid: string;
  email: string;
};

const getUnusedPlayers = (
  allPlayers: TPlayersList,
  usersMap: { [key: string]: string }
): string[] => {
  const unusedPlayers: string[] = [];
  const usedPlayers = Object.values(usersMap);
  Object.keys(allPlayers).forEach((id) => {
    if (!usedPlayers.includes(id)) {
      unusedPlayers.push(id);
    }
  });

  return unusedPlayers;
};

export const UsersPage = ({
  user,
  playersMap,
  usersMap,
  showLoader,
}: TUsersPageProps): ReactElement => {
  const [users, setUsers] = useState([] as TUser[]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedUserUid, setSelectedUserUid] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [unusedPlayer, setUnusedPlayer] = useState([] as string[]);

  useEffect(() => {
    const uuPlayers = getUnusedPlayers(playersMap, usersMap);
    uuPlayers.sort((a: string, b: string) => {
      if (playersMap[a].name < playersMap[b].name) {
        return -1;
      } else {
        return 1;
      }
    });
    setUnusedPlayer(uuPlayers);
  }, [playersMap, users]);

  useEffect(() => {
    if (user.loggedIn) {
      showLoader(true);
      // @ts-ignore
      user.user
        .getIdToken()
        .then(function (idToken) {
          fetch(`${API_ENDPOINT}/getAllUsers`, {
            headers: {
              Authorization: `Token ${idToken}`,
            },
          })
            .then((response) => response.json())
            .then((data) => {
              (data || []).sort((u1: any, u2: any) => {
                if (u1.email < u2.email) return -1;
                if (u1.email > u2.email) return 1;
                return 0;
              });
              setUsers(data);

              showLoader(false);
            });
        })
        .catch(function (error) {
          showLoader(false);
        });
    }
  }, [user.loggedIn]);

  const editUserPlayer = (email: string, uid: string) => {
    setSelectedUserEmail(email);
    setSelectedUserUid(uid);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  return (
    <div className="users">
      <div className="users-list">
        {users.map((u, i) => (
          <div
            className="user-item"
            key={i}
            onClick={() => {
              editUserPlayer(u.email, u.uid);
            }}
          >
            <div className="left">
              <div className="user-name">{u.email}</div>
              <div className="user-email">
                {(playersMap && playersMap[usersMap[u.uid]]?.name) || `-`}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={modalIsOpen} onClose={closeModal} fullWidth={true}>
        <DialogTitle>Select player for {selectedUserEmail}</DialogTitle>
        <DialogContent>
          <div className="list-container">
            <List>
              <ListItem
                key={999}
                disablePadding
                className={`${
                  selectedPlayer === "XXNONE" && "selected-list-item"
                }`}
              >
                <ListItemButton
                  onClick={() => {
                    setSelectedPlayer("XXNONE");
                  }}
                >
                  <ListItemText primary={"Not Specified"} />
                </ListItemButton>
              </ListItem>
              {unusedPlayer.map((playerId) => {
                return (
                  <ListItem
                    key={playerId}
                    disablePadding
                    className={`${
                      selectedPlayer === playerId && "selected-list-item"
                    }`}
                  >
                    <ListItemButton
                      onClick={() => {
                        setSelectedPlayer(playerId);
                      }}
                    >
                      <ListItemText primary={`${playersMap[playerId].name}`} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={closeModal}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              updateUsersPlayer(selectedUserUid, selectedPlayer);
              closeModal();
            }}
          >
            Set Player
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
