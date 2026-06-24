import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import { PublicI18nProvider } from "@/i18n/publicI18n";
import store from "./store";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/themes/light.css";
import "./assets/css/app.css";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <PublicI18nProvider>
        <App />
      </PublicI18nProvider>
    </Provider>
  </BrowserRouter>
);
