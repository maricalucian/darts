import React, { ReactElement, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../core/firebase";
import { Link } from "react-router-dom";
import { AppUser, FirestoreRound } from "../../types";
import { getAuth } from "firebase/auth";
import { Box, AppBar, Toolbar, Button } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import "./header.scss";
import { ADM } from "../../core/constants";

type HeaderProps = {
  round: FirestoreRound;
  user: AppUser;
};

export const Header = ({ round, user }: HeaderProps): ReactElement => {
  const [currentEdition, setCurrentEdition] = useState(0);

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
        <AppBar position="static">
          <Toolbar>
            <div className="menu" style={{ flex: 1 }}>
              <Button color="inherit" component={Link} to={"/"}>
                Home
              </Button>
              <Button color="inherit" component={Link} to={"/matches"}>
                Matches
              </Button>
              <Button color="inherit" component={Link} to={"/bracket"}>
                Bracket
              </Button>
              {user.user?.uid === ADM && (
                <>
                  <Button color="inherit" component={Link} to={"/manage"}>
                    Manage
                  </Button>
                  <Button color="inherit" component={Link} to={"/users"}>
                    Users
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
