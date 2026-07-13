import { getDoctors, saveDoctor, filterDoctors } from './services/doctorServices.js';
import { createDoctorCard } from './components/doctorCard.js';
import { openModal } from './components/modals.js';

window.openModal = openModal;

window.closeModal = function () {
  document.getElementById('modal').style.display = 'none';
};

document.addEventListener("DOMContentLoaded", () => {
  loadDoctorCards();

  const searchBar = document.getElementById("searchBar");
  const timeFilter = document.getElementById("timeFilter");
  const specialtyFilter = document.getElementById("specialtyFilter");

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (timeFilter) timeFilter.addEventListener("change", filterDoctorsOnChange);
  if (specialtyFilter) specialtyFilter.addEventListener("change", filterDoctorsOnChange);
});

function loadDoctorCards() {
  getDoctors()
    .then(doctors => {
      renderDoctorCards(doctors);
    })
    .catch(error => {
      console.error("Failed to load doctors:", error);
    });
}

function filterDoctorsOnChange() {
  const searchBar = document.getElementById("searchBar").value.trim();
  const time = document.getElementById("timeFilter").value;
  const specialty = document.getElementById("specialtyFilter").value;

  const name = searchBar.length > 0 ? searchBar : null;
  const timeVal = time.length > 0 ? time : null;
  const specialtyVal = specialty.length > 0 ? specialty : null;

  filterDoctors(name, timeVal, specialtyVal)
    .then(response => {
      const doctors = response.doctors;
      if (doctors && doctors.length > 0) {
        renderDoctorCards(doctors);
      } else {
        const contentDiv = document.getElementById("content");
        contentDiv.innerHTML = "<p>No doctors found with the given filters.</p>";
      }
    })
    .catch(error => {
      console.error("Failed to filter doctors:", error);
      alert("An error occurred while filtering doctors.");
    });
}

function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = "";
  doctors.forEach(doctor => {
    const card = createDoctorCard(doctor);
    contentDiv.appendChild(card);
  });
}

window.adminAddDoctor = async function () {
  const name = document.getElementById("doctorName").value;
  const specialization = document.getElementById("specialization").value;
  const email = document.getElementById("doctorEmail").value;
  const password = document.getElementById("doctorPassword").value;
  const phone = document.getElementById("doctorPhone").value;

  const availabilityCheckboxes = document.querySelectorAll('input[name="availability"]:checked');
  const availableTimes = Array.from(availabilityCheckboxes).map(cb => cb.value);

  const token = localStorage.getItem("token");
  if (!token) {
    alert("No authentication token found. Please log in again.");
    return;
  }

  const doctor = {
    name,
    email,
    password,
    phone,
    specialty: specialization,
    availableTimes
  };

  const { success, message } = await saveDoctor(doctor, token);
  if (success) {
    alert("Doctor added successfully!");
    document.getElementById("modal").style.display = "none";
    window.location.reload();
  } else {
    alert("Failed to add doctor: " + message);
  }
};
