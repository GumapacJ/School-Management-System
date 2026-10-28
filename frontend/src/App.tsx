import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./components/pages/Dashboard";
import SimplePage from "./components/pages/SimplePage";
import Students from "./components/pages/Students";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="students" element={<Students />} />

          <Route
            path="teachers"
            element={
              <SimplePage
                title="Teachers"
                description="Manage teacher profiles and assignments."
              />
            }
          />

          <Route
            path="classes"
            element={
              <SimplePage
                title="Classes"
                description="Manage grade levels, sections, subjects, and schedules."
              />
            }
          />

          <Route
            path="attendance"
            element={
              <SimplePage
                title="Attendance"
                description="Record and review daily student attendance."
              />
            }
          />

          <Route
            path="grades"
            element={
              <SimplePage
                title="Grades"
                description="Manage student grades and academic records."
              />
            }
          />

          <Route
            path="payments"
            element={
              <SimplePage
                title="Payments"
                description="Manage school fees and payment records."
              />
            }
          />

          <Route
            path="settings"
            element={
              <SimplePage
                title="Settings"
                description="Configure school information and preferences."
              />
            }
          />

          <Route
            path="*"
            element={
              <SimplePage
                title="Page Not Found"
                description="The page you requested does not exist."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
