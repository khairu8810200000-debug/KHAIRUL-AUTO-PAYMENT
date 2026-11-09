# Firestore data model

- customers: fullName, phoneE164, active, createdAt
- vehicles: customerId, registrationNo, model, year, monthlyAmount, dueDay, active
- payments: customerId, vehicleId, period (YYYY-MM), amountDue, amountPaid, paidAt, status, receiptNo
- reminderLogs: customerId, vehicleId, period, reminderType, sentAt, providerMessageId, status

Simpan nombor telefon format E.164. Log peringatan digunakan untuk mencegah mesej dihantar berulang kali. Pastikan pelanggan bersetuju menerima notifikasi.