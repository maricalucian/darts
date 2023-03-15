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

import { ReactComponent as DartSvg } from "../../icons/dart.svg";
import { ReactComponent as TournamentSvg } from "../../icons/tournament.svg";
import { ReactComponent as HomeSvg } from "../../icons/home.svg";
import { ReactComponent as CupSvg } from "../../icons/cup.svg";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RocketIcon from '@mui/icons-material/Rocket';

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

  return (
    <div className="header">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{
          backgroundColor: funMode ? '#17a13d' : '#1976d2'
        }}>
          <Toolbar>
            <div className="menu" style={{ flex: 1 }}>
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
              <Button
                color="inherit"
                component={Link}
                to={"/standings"}
                className={`${
                  location.pathname === "/standings" && "selected"
                }`}
              >
                <CupSvg style={{ height: "26px", marginTop: "0px" }} />
              </Button>
              <Button
                color="inherit"
                onClick={() => {
                  switchToFriendlyMode(!funMode);
                }}
              >
                {funMode && (
                  <RocketIcon style={{ fontSize: "34px" }} />
                )}
                {!funMode && (
                  <RocketLaunchIcon style={{ fontSize: "34px" }} />
                )}
              </Button>
              {user.user?.uid === ADM && (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to={"/users"}
                    className={`${
                      location.pathname === "/users" && "selected"
                    }`}
                  >
                    <PeopleOutlineIcon style={{ fontSize: "34px" }} />
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to={"/manage"}
                    className={`${
                      location.pathname === "/manage" && "selected"
                    }`}
                  >
                    <SettingsIcon style={{ fontSize: "32px" }} />
                  </Button>
                </>
              )}
            </div>
            {user.loggedIn && (
              <Button
                color="inherit"
                onClick={() => {
                  getAuth().signOut();
                }}
              >
                Logout
                <span
                  style={{
                    fontSize: "10px",
                    position: "absolute",
                    marginTop: "28px",
                    right: "4px",
                  }}
                >
                  {user.user?.email}
                </span>
              </Button>
            )}
            {!user.loggedIn && (
              <Button color="inherit" component={Link} to={"/login"}>
                Login
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </div>
  );
};
