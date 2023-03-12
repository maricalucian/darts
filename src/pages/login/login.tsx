import React, { ReactElement, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import * as firebaseui from "firebaseui";
import "./login.scss";
import { firebaseConfig } from "../../core/firebase";
import { useNavigate } from "react-router-dom";
import "firebaseui/dist/firebaseui.css";
import { AppUser } from "../../types";

firebase.initializeApp(firebaseConfig);

var ui = new firebaseui.auth.AuthUI(firebase.auth());

export const LoginPage = ({user}: {user: AppUser}): ReactElement => {
  const navigate = useNavigate();
  useEffect(() => {
    if(user.loggedIn) {
      navigate('/')
    }
  }, [user.loggedIn])
  useEffect(() => {
    ui.start("#fui-home", {
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false,
        },
      ],
      signInSuccessUrl: "/",
    });
  }, []);
  return (
    <div className="login">
      <div id="fui-home"></div>
    </div>
  );
};
