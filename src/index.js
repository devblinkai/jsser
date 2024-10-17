import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { GoogleOAuthProvider, useGoogleLogin, googleLogout } from "@react-oauth/google";






const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="897239590485-i11qcb6i1jcbcf1kvqmku4b74nff5cq7.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
