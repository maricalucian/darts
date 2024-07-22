import React, { ReactElement } from "react";
import "./preloader.scss";

export const Preloader = (): ReactElement => {
  return (
    <div className="preloader">
      <div className="darts">
        <img src="/darts.png" width="96px"/>
      </div>
    </div>
  );
};
