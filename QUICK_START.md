# Quick Start Guide - Workflow Management System

## Setup dalam 5 Menit

### 1. Persiapan Database

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database baru
CREATE DATABASE workflow_management;

# Keluar dari psql
\q
```

### 2. Setup Environment

```bash
# Copy file environment
cp .env.example .env

# Edit file .env (gunakan editor favorit Anda)
nano .env
```

Minimal konfigurasi yang perlu diubah:
```env
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_random_secret_key_here
```

### 3. Install & Run

```bash
# Install dependencies untuk backend dan frontend
npm install
cd client && npm install && cd ..

# Jalankan migrasi database
npm run migrate

# (Opsional) Seed database dengan user demo
npm run seed

# Jalankan aplikasi
npm run dev
```

### 4. Akses Aplikasi

Buka browser dan akses: **http://localhost:3000**

Login dengan akun demo:
- Username: `admin`
- Password: `password123`

## User Demo Tersedia

Setelah menjalankan `npm run seed`, Anda dapat login dengan:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | password123 |
| Submitter | submitter1 | password123 |
| Reviewer 1 | reviewer1 | password123 |
| Reviewer 2 | reviewer2 | password123 |
| Reviewer 3 | reviewer3 | password123 |
| Approver | approver1 | password123 |
| Signer | signer1 | password123 |

## Test Workflow Lengkap

### Skenario 1: Submit → Review → Approve → Sign → Archive

1. **Login sebagai Submitter** (`submitter1`)
   - Klik "Buat Dokumen Baru"
   - Isi form dokumen
   - Upload file (opsional)
   - Klik "Submit untuk Review"

2. **Login sebagai Reviewer 1** (`reviewer1`)
   - Buka "Review Queue"
   - Klik "Review" pada dokumen
   - Pilih "Approve"
   - Submit review

3. **Login sebagai Reviewer 2** (`reviewer2`)
   - Lakukan review yang sama
   - Approve dokumen

4. **Login sebagai Approver** (`approver1`)
   - Buka "Approval Queue"
   - Review dokumen
   - Klik "Approve"

5. **Login sebagai Signer** (`signer1`)
   - Buka "Sign Queue"
   - Klik "Sign" pada dokumen
   - Pilih jenis tanda tangan
   - Submit

6. **Cek Archive**
   - Buka "Archive"
   - Dokumen sudah masuk archive dengan status "archived"
   - Dokumen sudah locked dan read-only

### Skenario 2: Request Changes

1. **Login sebagai Reviewer 1**
   - Buka dokumen di "Review Queue"
   - Klik "Review"
   - Pilih "Request Changes"
   - Tambahkan catatan revisi
   - Submit

2. **Login sebagai Submitter**
   - Dokumen kembali ke status "revision"
   - Edit dokumen sesuai catatan
   - Submit ulang untuk review

## Fitur-Fitur yang Bisa Dicoba

### ✅ Document Management
- Buat dokumen baru
- Edit dokumen (draft/revision)
- Upload lampiran
- Lihat detail dokumen
- Tambah komentar

### ✅ Workflow
- Submit dokumen untuk review
- Multi-level review (Review 1, 2, 3)
- Approval
- Electronic signature
- Auto-archive setelah signed

### ✅ Search & Filter
- Cari dokumen berdasarkan judul/nomor
- Filter berdasarkan status
- Cari di archive

### ✅ Audit Trail
- Lihat riwayat semua aksi
- Tracking perubahan status
- Lihat siapa melakukan apa dan kapan

## Troubleshooting

### Port sudah digunakan

Jika port 3000 atau 5000 sudah digunakan, edit file:

**Backend (port 5000):**
Edit `.env`:
```env
PORT=5001
```

**Frontend (port 3000):**
Edit `client/vite.config.js`:
```js
server: {
  port: 3001,
  // ...
}
```

### Database connection error

Pastikan:
1. PostgreSQL sudah running
2. Database sudah dibuat
3. Credentials di `.env` sudah benar

### Upload file tidak berfungsi

Pastikan folder `uploads` ada dan memiliki permission yang tepat:
```bash
mkdir uploads
chmod 755 uploads
```

## Tips Penggunaan

1. **Auto-save Draft**: Simpan dokumen sebagai draft terlebih dahulu sebelum submit
2. **Comments**: Gunakan fitur komentar untuk komunikasi antar reviewer
3. **Audit Log**: Selalu cek audit log untuk tracking perubahan
4. **Archive Search**: Gunakan search di archive untuk menemukan dokumen lama

## Customization

### Tambah Review Stage

Edit `server/controllers/reviewController.js` untuk menambah/mengurangi tahap review.

### Ubah Retention Period

Edit `.env`:
```env
RETENTION_YEARS=10
```

### Konfigurasi Email Notifications

Edit `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Next Steps

1. Customize UI sesuai brand perusahaan
2. Integrasi dengan e-signature provider (DocuSign, e-Meterai)
3. Setup email notifications
4. Deploy ke production server
5. Tambah unit tests

## Support

Untuk pertanyaan lebih lanjut, baca dokumentasi lengkap di:
- `README.md` - Dokumentasi umum
- `API_DOCUMENTATION.md` - API endpoints

Happy workflow managing! 🚀
