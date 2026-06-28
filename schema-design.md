## MySQL Database Design

### Table: patients
- id: INT, Primary Key, Auto Increment
- name: VARCHAR(100), Not Null
- email: VARCHAR(255), Unique, Not Null
- password: VARCHAR(255), Not Null
- phone: VARCHAR(10), Not Null
- address: VARCHAR(255), Not Null
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP

### Table: doctors
- id: INT, Primary Key, Auto Increment
- name: VARCHAR(100), Not Null
- specialty: VARCHAR(50), Not Null
- email: VARCHAR(255), Unique, Not Null
- password: VARCHAR(255), Not Null
- phone: VARCHAR(10), Not Null
- available_times: JSON (list of time slots, e.g. `["09:00-10:00", "10:00-11:00"]`)
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP

### Table: admin
- id: INT, Primary Key, Auto Increment
- username: VARCHAR(50), Unique, Not Null
- password: VARCHAR(255), Not Null
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP

### Table: appointments
- id: INT, Primary Key, Auto Increment
- doctor_id: INT, Foreign Key → doctors(id)
- patient_id: INT, Foreign Key → patients(id)
- appointment_time: DATETIME, Not Null
- status: INT (0 = Scheduled, 1 = Completed, 2 = Cancelled)
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP

### Table: clinic_locations
- id: INT, Primary Key, Auto Increment
- name: VARCHAR(100), Not Null
- address: VARCHAR(255), Not Null
- city: VARCHAR(50), Not Null
- state: VARCHAR(50), Not Null
- zip_code: VARCHAR(10), Not Null
- phone: VARCHAR(10), Not Null
- operating_hours: VARCHAR(255) (e.g. "Mon-Fri 8:00-18:00, Sat 9:00-14:00")
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP

### Table: payments
- id: INT, Primary Key, Auto Increment
- appointment_id: INT, Foreign Key → appointments(id)
- patient_id: INT, Foreign Key → patients(id)
- amount: DECIMAL(10, 2), Not Null
- payment_method: VARCHAR(50) (e.g. "Credit Card", "Cash", "Insurance")
- payment_status: INT (0 = Pending, 1 = Completed, 2 = Refunded)
- transaction_id: VARCHAR(100), Unique
- paid_at: TIMESTAMP, Nullable
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP


## MongoDB Collection Design

### Collection: prescriptions

```json
{
  "_id": "ObjectId('64abc123456')",
  "patientName": "John Smith",
  "appointmentId": 51,
  "medication": "Paracetamol",
  "dosage": "500mg",
  "doctorNotes": "Take 1 tablet every 6 hours.",
  "refillCount": 2,
  "pharmacy": {
    "name": "Walgreens SF",
    "location": "Market Street"
  }
}
```

### Collection: feedback

```json
{
  "_id": "ObjectId('64abc123457')",
  "patientId": 1,
  "patientName": "John Smith",
  "appointmentId": 51,
  "doctorId": 2,
  "rating": 5,
  "comment": "Very thorough and kind doctor.",
  "category": "consultation",
  "submittedAt": "2026-06-28T10:30:00Z"
}
```

### Collection: logs

```json
{
  "_id": "ObjectId('64abc123458')",
  "action": "APPOINTMENT_CANCELLED",
  "performedBy": "admin",
  "userId": 1,
  "details": {
    "appointmentId": 51,
    "reason": "Patient requested reschedule"
  },
  "ipAddress": "192.168.1.100",
  "timestamp": "2026-06-28T10:30:00Z"
}
```

### Collection: messages

```json
{
  "_id": "ObjectId('64abc123459')",
  "senderId": 1,
  "senderRole": "patient",
  "receiverId": 2,
  "receiverRole": "doctor",
  "appointmentId": 51,
  "subject": "Prescription clarification",
  "body": "Could you explain the dosage instructions?",
  "isRead": false,
  "readAt": null,
  "sentAt": "2026-06-28T10:30:00Z"
}
```