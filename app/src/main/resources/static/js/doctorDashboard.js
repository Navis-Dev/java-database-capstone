import { getAllAppointments } from './services/appointmentRecordService.js';
import { createPatientRow } from './components/patientRows.js';

const tableBody = document.getElementById("patientTableBody");
const token = localStorage.getItem("token");
let selectedDate = new Date().toISOString().split('T')[0];
let patientName = "null";

document.addEventListener("DOMContentLoaded", () => {
  const datePicker = document.getElementById("datePicker");
  if (datePicker) {
    datePicker.value = selectedDate;
    datePicker.addEventListener("change", (e) => {
      selectedDate = e.target.value;
      loadAppointments();
    });
  }

  const todayButton = document.getElementById("todayButton");
  if (todayButton) {
    todayButton.addEventListener("click", () => {
      selectedDate = new Date().toISOString().split('T')[0];
      if (datePicker) datePicker.value = selectedDate;
      loadAppointments();
    });
  }

  const searchBar = document.getElementById("searchBar");
  if (searchBar) {
    searchBar.addEventListener("input", (e) => {
      const value = e.target.value.trim();
      patientName = value.length > 0 ? value : "null";
      loadAppointments();
    });
  }

  loadAppointments();
});

async function loadAppointments() {
  try {
    const response = await getAllAppointments(selectedDate, patientName, token);
    tableBody.innerHTML = "";

    const appointments = Array.isArray(response) ? response : (response.appointments || []);

    if (appointments.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No Appointments found for today.</td></tr>';
      return;
    }

    appointments.forEach(appointment => {
      const patient = {
        id: appointment.patientId,
        name: appointment.patientName,
        phone: appointment.patientPhone,
        email: appointment.patientEmail
      };
      const row = createPatientRow(patient, appointment.id, appointment.doctorId);
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading appointments:", error);
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Error loading appointments. Try again later.</td></tr>';
  }
}
