import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DataProvider } from "./context/DataContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { AdminProvider } from "./context/AdminContext.tsx";
import { KitchenProvider } from "./context/KitchenContext.tsx";
import { FitnessProvider } from "./context/FitnessContext.tsx";
import { BrandingProvider } from "./context/BrandingContext.tsx";
import { initLanguage } from "./utils/i18n";

initLanguage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrandingProvider>
      <AuthProvider>
        <AdminProvider>
          <KitchenProvider>
            <FitnessProvider>
              <DataProvider>
                <App />
              </DataProvider>
            </FitnessProvider>
          </KitchenProvider>
        </AdminProvider>
      </AuthProvider>
    </BrandingProvider>
  </StrictMode>,
);
