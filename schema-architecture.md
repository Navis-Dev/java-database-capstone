# Architecture

Smart Clinic Management System — Spring Boot 3.4.4 / Java 17

## 1. Topology

```
  ┌─────────────────────────────────────────────────────────────┐
  │                        FRONTEND                             │
  │  ┌──────────────────┐  ┌──────────────────────────────────┐ │
  │  │ Static HTML+JS   │  │ Thymeleaf Templates              │ │
  │  │ (REST clients)   │  │ (adminDashboard, doctorDashboard)│ │
  │  └──────┬───────────┘  └──────────┬───────────────────────┘ │
  └─────────┼─────────────────────────┼─────────────────────────┘
            │ JSON                    │ Model+View
            ▼                         ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                   CONTROLLER LAYER                          │
  │  ┌──────────────────────┐  ┌──────────────────────────────┐ │
  │  │ @RestController      │  │ @Controller (MVC)            │ │
  │  │  AdminController     │  │  DashboardController         │ │
  │  │  DoctorController    │  └──────────────────────────────┘ │
  │  │  PatientController   │                                   │
  │  │  AppointmentController│                                  │
  │  │  PrescriptionController│─── ValidationFailed (@RAdvice)  │
  │  └──────────┬───────────┘                                   │
  └─────────────┼───────────────────────────────────────────────┘
                │
                ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                    SERVICE LAYER                            │
  │  ┌─────────────────────────────────────────────────────────┐│
  │  │   Service (orchestrator)        TokenService (JWT)      ││
  │  │   DoctorService                 PatientService          ││
  │  │   AppointmentService            PrescriptionService     ││
  │  └──────────┬──────────────────────────────────────────┬───┘│
  └─────────────┼──────────────────────────────────────────┼────┘
                │                                          │
                ▼                                          ▼
  ┌──────────────────────────┐  ┌──────────────────────────────┐
  │     REPOSITORY LAYER     │  │     REPOSITORY LAYER         │
  │  JpaRepository (MySQL)   │  │  MongoRepository (MongoDB)   │
  │  ┌────────────────────┐  │  │  ┌─────────────────────────┐ │
  │  │ AdminRepository    │  │  │  │ PrescriptionRepository  │ │
  │  │ DoctorRepository   │  │  │  └─────────────────────────┘ │
  │  │ PatientRepository  │  │  └──────────────────────────────┘
  │  │ AppointmentRepo    │  │
  │  └────────┬───────────┘  │
  └───────────┼──────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
  MySQL (cms)       MongoDB (prescriptions)
  Tables:            Collection:
  admin              prescriptions
  doctor
  patient
  appointment
```

## 2. Database Strategy

| Engine  | Database | Purpose                        | Mapping            |
|---------|----------|--------------------------------|--------------------|
| MySQL   | `cms`    | Admin, Doctor, Patient, Appt   | JPA `@Entity`      |
| MongoDB | `prescriptions` | Prescriptions (flexible schema) | `@Document`  |

- **MySQL**: Normalized relational schema with foreign keys, `@ManyToOne` relationships, `@ElementCollection` for doctor availability times, bean validation constraints.
- **MongoDB**: Schema-on-read for prescriptions; allows nested medication/dosage arrays, varying note formats, and rapid evolution without migrations.

## 3. Request Flow

### REST Flow (Patient, Doctor, Admin, Appointment, Prescription)

```
  Client (HTML+JS)
    │ POST/GET/PUT/DELETE  (JSON body)
    ▼
  @RestController
    │ delegates
    ▼
  Service Layer
    │ calls repository
    ▼
  Repository (JPA / Mongo)
    │ queries
    ▼
  Database (MySQL / MongoDB)
    │ returns entity / document
    ▼
  Service → maps to DTO or entity
    │
    ▼
  @RestController → JSON response
```

### MVC Flow (Admin / Doctor dashboards)

```
  Browser
    │ GET /adminDashboard/{token}
    ▼
  @Controller DashboardController
    │ delegates
    ▼
  Service Layer (same classes)
    │
    ▼
  @Controller → ModelAndView
    │
    ▼
  Thymeleaf template (.html) → rendered HTML
```

## 4. Cross-Cutting Concerns

| Concern      | Mechanism                                          |
|--------------|----------------------------------------------------|
| Auth         | JWT (`TokenService` + `jjwt` 0.12.6)               |
| Validation   | `@Valid` + `@RestControllerAdvice` (`ValidationFailed`) |
| CORS         | `WebConfig` — open to all origins/methods/headers  |
| Dev          | `spring-boot-devtools` (hot reload)                |
| SQL logging  | `spring.jpa.show-sql=true`, `hibernate.format_sql` |

## 5. Package Layout

```
com.project.back_end
├── config/            WebConfig.java
├── controllers/       AdminController, DoctorController, PatientController,
│                      AppointmentController, PrescriptionController,
│                      ValidationFailed
├── DTO/               Login, AppointmentDTO
├── models/            Admin, Doctor, Patient, Appointment, Prescription
├── mvc/               DashboardController
├── repo/              AdminRepository, DoctorRepository, PatientRepository,
│                      AppointmentRepository, PrescriptionRepository
├── services/          Service, DoctorService, PatientService,
│                      AppointmentService, PrescriptionService, TokenService
└── BackEndApplication.java
```

## 6. Entity Relationships (MySQL)

```
Doctor ──1:N──► Appointment ◄──N:1── Patient
  │                                    │
  └── @ElementCollection               └── address, phone
      (availableTimes)

Admin (standalone, username/password auth)
```

- `Appointment.doctor` → `@ManyToOne` → `Doctor`
- `Appointment.patient` → `@ManyToOne` → `Patient`
- `Appointment.status`: 0 = scheduled, 1 = completed
- `Appointment.appointmentTime`: `LocalDateTime` with `@Future`

## 7. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Dual controller pattern (MVC + REST) | Dashboards get server-rendered HTML for simplicity; REST APIs serve JS-heavy client pages |
| Common service layer | Avoids duplicating business logic between MVC and REST paths |
| JWT in URL path for dashboards | Token passed as path variable to simplify Thymeleaf page auth (no cookie/localStorage dependency in SSR) |
| MongoDB for prescriptions | Prescription structure changes frequently; nested medication arrays don't normalize well into relational tables |
| `open-in-view=false` | Prevents lazy-loading issues in views; forces explicit fetch planning in the service layer |
