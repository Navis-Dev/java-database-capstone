import { showBookingOverlay } from '../loggedPatient.js';
import { deleteDoctor } from '../services/doctorServices.js';
import { getPatientData } from '../services/patientServices.js';

export function createDoctorCard(doctor) {
    const card = document.createElement("div");
    card.classList.add("doctor-card");

    const role = localStorage.getItem("userRole");

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("doctor-info");

    const name = document.createElement("h3");
    name.textContent = doctor.name;

    const specialty = document.createElement("p");
    specialty.textContent = doctor.specialty;

    const email = document.createElement("p");
    email.textContent = doctor.email;

    const times = document.createElement("div");
    times.classList.add("available-times");
    times.innerHTML = "<strong>Available Times:</strong>";
    const timeList = document.createElement("ul");
    doctor.availableTimes.forEach(t => {
        const li = document.createElement("li");
        li.textContent = t;
        timeList.appendChild(li);
    });
    times.appendChild(timeList);

    infoDiv.appendChild(name);
    infoDiv.appendChild(specialty);
    infoDiv.appendChild(email);
    infoDiv.appendChild(times);

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("card-actions");

    if (role === "admin") {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", async () => {
            const token = localStorage.getItem("token");
            const { success, message } = await deleteDoctor(doctor.id, token);
            if (success) {
                alert("Doctor deleted successfully!");
                card.remove();
            } else {
                alert("Failed to delete doctor: " + message);
            }
        });
        actionsDiv.appendChild(deleteBtn);
    } else if (role === "patient") {
        const bookBtn = document.createElement("button");
        bookBtn.textContent = "Book Now";
        bookBtn.classList.add("book-btn");
        bookBtn.addEventListener("click", () => {
            alert("Please log in to book an appointment.");
        });
        actionsDiv.appendChild(bookBtn);
    } else if (role === "loggedPatient") {
        const bookBtn = document.createElement("button");
        bookBtn.textContent = "Book Now";
        bookBtn.classList.add("book-btn");
        bookBtn.addEventListener("click", async (e) => {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "/";
                return;
            }
            const patient = await getPatientData(token);
            if (patient) {
                showBookingOverlay(e, doctor, patient);
            }
        });
        actionsDiv.appendChild(bookBtn);
    }

    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);

    return card;
}
