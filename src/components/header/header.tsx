import React, { ReactElement, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../core/firebase";
import { Link, useLocation } from "react-router-dom";
import { AppUser, FirestoreRound } from "../../types";
import { getAuth } from "firebase/auth";
import { Box, AppBar, Toolbar, Button } from "@mui/material";
import BallotIcon from "@mui/icons-material/Ballot";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { ReactComponent as DartSvg } from "../../icons/dart.svg";
import { ReactComponent as TournamentSvg } from "../../icons/tournament.svg";
import { ReactComponent as HomeSvg } from "../../icons/home.svg";
import { ReactComponent as CupSvg } from "../../icons/cup.svg";
import {
  Backdrop,
  Divider,
  Drawer,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import RocketIcon from "@mui/icons-material/Rocket";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import "./header.scss";
import { ADM } from "../../core/constants";

type HeaderProps = {
  round: FirestoreRound;
  user: AppUser;
  funMode: boolean;
};

const switchToFriendlyMode = (fun: boolean) => {
  if (fun) {
    localStorage.setItem("competition", "friendly");
  } else {
    localStorage.setItem("competition", "duminica23");
  }

  window.location.reload();
};

export const Header = ({ round, user, funMode }: HeaderProps): ReactElement => {
  const [currentEdition, setCurrentEdition] = useState(0);
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    onSnapshot(doc(db, "test", "currentCompetition"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCurrentEdition(data.et);
      }
    });
    // getCurrentCompetition().then((data) => {
    //   setCurrentEdition(data);
    // });
  });

  const closeMenu = () => {
    setShowMenu(false);
  };

  return (
    <div className="header">
      <Drawer
        anchor={"left"}
        open={showMenu}
        onClose={() => {
          setShowMenu(false);
        }}
        className="drawer"
      >
        <MenuList>
          <MenuItem component={Link} to={"/"} onClick={closeMenu}>
            <ListItemIcon>
              <HomeSvg
                style={{ height: "30px", marginTop: "0px", marginLeft: "-4px" }}
              />
            </ListItemIcon>
            Dashboard
          </MenuItem>
          <MenuItem component={Link} to={"/matches"} onClick={closeMenu}>
            <ListItemIcon>
              <DartSvg style={{ height: "26px", marginTop: "-4px" }} />
            </ListItemIcon>
            Match center
          </MenuItem>
          <MenuItem component={Link} to={"/bracket"} onClick={closeMenu}>
            <ListItemIcon>
              <TournamentSvg style={{ height: "23px", marginTop: "0px" }} />
            </ListItemIcon>
            Bracket
          </MenuItem>
          <Divider light={true} />
          {!funMode && (
            <MenuItem component={Link} to={"/standings"} onClick={closeMenu}>
              <ListItemIcon>
                <CupSvg style={{ height: "21px", marginTop: "0px" }} />
              </ListItemIcon>
              Tournament info
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              switchToFriendlyMode(!funMode);
            }}
          >
            <ListItemIcon>
              {funMode && <RocketLaunchIcon style={{ fontSize: "26px" }} />}
              {!funMode && <RocketIcon style={{ fontSize: "26px" }} />}
            </ListItemIcon>
            {funMode && `Tournament mode`}
            {!funMode && `Friendly mode`}
          </MenuItem>
          {user.user?.uid === ADM && <Divider light={true} />}
          {user.user?.uid === ADM && (
            <MenuItem component={Link} to={"/users"} onClick={closeMenu}>
              <ListItemIcon>
                <PeopleOutlineIcon style={{ fontSize: "26px" }} />
              </ListItemIcon>
              <ListItemText>Accounts</ListItemText>
            </MenuItem>
          )}
          {user.user?.uid === ADM && (
            <MenuItem component={Link} to={"/manage"} onClick={closeMenu}>
              <ListItemIcon>
                <AdminPanelSettingsIcon style={{ fontSize: "26px" }} />
              </ListItemIcon>
              <ListItemText>Manage</ListItemText>
            </MenuItem>
          )}
          <Divider light={true} />
          {user.loggedIn && (
            <MenuItem
              onClick={() => {
                getAuth().signOut();
                closeMenu();
              }}
            >
              <ListItemIcon>
                <LogoutIcon style={{ fontSize: "26px" }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          )}
          {!user.loggedIn && (
            <MenuItem component={Link} to={"/login"} onClick={closeMenu}>
              <ListItemIcon>
                <AccountCircleIcon style={{ fontSize: "26px" }} />
              </ListItemIcon>
              <ListItemText>Login</ListItemText>
            </MenuItem>
          )}
        </MenuList>
      </Drawer>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          sx={{
            backgroundColor: funMode ? "#17a13d" : "#1976d2",
          }}
        >
          <Toolbar sx={{ paddingLeft: "0" }}>
            <div className="menu" style={{ flex: 1 }}>
              <Button
                color="inherit"
                onClick={() => {
                  setShowMenu(true);
                }}
              >
                <MenuIcon style={{ fontSize: "32px" }} />
              </Button>
              <Button
                color="inherit"
                component={Link}
                to={"/"}
                className={`${location.pathname === "/" && "selected"}`}
              >
                <HomeSvg style={{ height: "40px", marginTop: "0px" }} />
              </Button>
              <Button
                color="inherit"
                component={Link}
                to={"/matches"}
                className={`${location.pathname === "/matches" && "selected"}`}
              >
                <DartSvg style={{ height: "32px", marginTop: "-4px" }} />
              </Button>
              <Button
                color="inherit"
                component={Link}
                to={"/bracket"}
                className={`${location.pathname === "/bracket" && "selected"}`}
              >
                <TournamentSvg style={{ height: "28px", marginTop: "0px" }} />
              </Button>
            </div>

            <b>
              {funMode && `FRIENDLY`}
              {!funMode && `TOURNAMENT`}
            </b>
          </Toolbar>
        </AppBar>
      </Box>
    </div>
  );
};
