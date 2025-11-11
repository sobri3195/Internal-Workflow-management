# Workflow Management System

Sistem manajemen workflow dokumen internal dengan fitur pengajuan, review berjenjang, persetujuan, penandatanganan elektronik, dan arsip.

## Fitur Utama

### 🎨 UI/UX Features
- ✅ **Responsive Design** - Tampilan optimal di desktop dan mobile
- ✅ **Bottom Navigation** - Navigasi mobile-friendly di bagian bawah layar
- ✅ **Role-based Navigation** - Menu yang tampil sesuai dengan role user
- ✅ **Active State Indication** - Indikator halaman aktif dengan ikon solid
- ✅ **Modern Design** - TailwindCSS dengan komponen Heroicons

### 1. Submit (Pengajuan Dokumen)
- ✅ Form input dokumen (Judul, jenis dokumen, unit kerja, deskripsi, tanggal berlaku)
- ✅ Upload lampiran (PDF, DOCX, XLSX, gambar)
- ✅ Simpan sebagai Draft
- ✅ Fitur auto-save draft
- ✅ Submit → ubah status ke Review1
- ✅ Notifikasi otomatis ke Reviewer1

### 2. Review1 / Review2 / Review3 (Tahapan Review Berjenjang)
- ✅ Interface untuk reviewer dengan akses lihat dokumen & lampiran
- ✅ Lihat komentar & riwayat versi sebelumnya
- ✅ Tombol aksi:
  - ✅ Approve (lanjut ke tahap berikutnya)
  - 🔁 Request Changes (kembali ke Draft Revisi)
  - ❌ Reject (dokumen berhenti)
- ✅ Fitur komentar inline & catatan review
- ✅ Tracking: siapa reviewer, kapan mulai & kapan selesai
- ✅ Timer atau deadline untuk review (dengan reminder otomatis)

### 3. Approve (Persetujuan Final)
- ✅ Hanya user dengan role Approver dapat mengakses tahap ini
- ✅ Lihat semua hasil review sebelumnya
- ✅ Tanda bahwa dokumen siap untuk penandatanganan
- ✅ Aksi: Approve → lanjut ke Sign, Reject → dokumen berhenti
- ✅ Catatan keputusan tersimpan di audit log

### 4. Sign (Penandatanganan Elektronik)
- ✅ Integrasi ready untuk sistem e-signature
- ✅ Mode tanda tangan Sequential (berurutan) dan Parallel (bersamaan)
- ✅ Preview dokumen final sebelum tanda tangan
- ✅ Tracking tanda tangan (status: pending, signed, failed)
- ✅ Metadata tanda tangan tersimpan (nama, waktu, jenis, sertifikat)
- ✅ Dokumen terkunci setelah semua tanda tangan selesai (read-only)

### 5. Archive (Arsip Dokumen)
- ✅ Arsip otomatis setelah dokumen selesai ditandatangani
- ✅ Dokumen menjadi read-only
- ✅ Fitur pencarian arsip (judul, jenis, status, tanggal, pembuat)
- ✅ Fitur download dokumen versi final
- ✅ Metadata tersimpan (nomor dokumen, tanggal dibuat/disetujui/ditandatangani)
- ✅ Retention policy (default 7 tahun)

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Multer (file upload)
- Nodemailer (email notifications)

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router
- React Query
- Axios
- Heroicons (untuk ikon)
- Responsive design dengan bottom navigation

## Instalasi

### Prerequisites
- Node.js (v16 atau lebih baru)
- PostgreSQL (v12 atau lebih baru)
- npm atau yarn

### Setup Database

1. Buat database PostgreSQL:
```bash
createdb workflow_management
```

2. Copy file environment:
```bash
cp .env.example .env
```

3. Edit file `.env` dan sesuaikan konfigurasi database:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workflow_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Migrate Database

```bash
npm run migrate
```

### Seed Database (Optional)

Untuk membuat user demo:
```bash
npm run seed
```

User demo yang dibuat:
- **Admin**: username: `admin`, password: `password123`
- **Submitter**: username: `submitter1`, password: `password123`
- **Reviewer1**: username: `reviewer1`, password: `password123`
- **Reviewer2**: username: `reviewer2`, password: `password123`
- **Reviewer3**: username: `reviewer3`, password: `password123`
- **Approver**: username: `approver1`, password: `password123`
- **Signer**: username: `signer1`, password: `password123`

## Running the Application

### Development Mode

Jalankan backend dan frontend secara bersamaan:
```bash
npm run dev
```

Atau jalankan secara terpisah:

Backend (port 5000):
```bash
npm run server
```

Frontend (port 3000):
```bash
npm run client
```

Akses aplikasi di: http://localhost:3000

### Development Mode - Bypass Login

**NEW!** Untuk development tanpa backend atau testing cepat dengan berbagai role:

1. Akses halaman login di http://localhost:3000/login
2. Klik **"Development Mode (Bypass Login)"**
3. Pilih role yang ingin di-test (admin, submitter, reviewer1, dll)
4. Klik **"Bypass Login"**

Fitur ini memungkinkan Anda:
- ✅ Mengakses aplikasi tanpa backend server
- ✅ Test UI dengan role yang berbeda secara instant
- ✅ Demo aplikasi tanpa setup database
- ✅ Development frontend-only

⚠️ **Catatan**: Bypass login hanya melewati autentikasi. API calls untuk data masih memerlukan backend server.

📖 Lihat panduan lengkap di [BYPASS_LOGIN_GUIDE.md](BYPASS_LOGIN_GUIDE.md)

### Production Build

```bash
npm run build
```

### Deployment

#### Netlify Deployment

Aplikasi ini sudah dikonfigurasi untuk deployment di Netlify:

1. **Frontend**: Deploy ke Netlify dengan satu klik
2. **Backend**: Deploy backend ke Heroku, Railway, atau platform lain
3. Lihat panduan lengkap di [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md)

Fitur deployment:
- ✅ Konfigurasi `netlify.toml` sudah tersedia
- ✅ SPA routing dengan redirect rules
- ✅ Build optimization
- ✅ Environment variable support

#### Full Deployment Guide

Untuk opsi deployment lengkap (VPS, Docker, Cloud platforms), lihat:
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Panduan deployment fullstack

## Struktur Project

```
workflow-management/
├── server/                 # Backend
│   ├── config/            # Database configuration
│   ├── controllers/       # Request handlers
│   ├── database/          # Database schema & migrations
│   ├── middleware/        # Auth, upload middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utilities (notifications, audit log)
│   └── index.js           # Server entry point
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Documents
- `POST /api/documents` - Buat dokumen baru
- `GET /api/documents` - List semua dokumen
- `GET /api/documents/:id` - Detail dokumen
- `PUT /api/documents/:id` - Update dokumen
- `DELETE /api/documents/:id` - Hapus dokumen (draft only)
- `POST /api/documents/:id/submit` - Submit dokumen untuk review

### Review
- `POST /api/review/:id/review` - Review dokumen (approve/reject/request_changes)
- `POST /api/review/:id/comment` - Tambah komentar

### Approval
- `POST /api/approve/:id/approve` - Approve/reject dokumen

### Sign
- `POST /api/sign/:id/sign` - Tanda tangani dokumen
- `GET /api/sign/:id/signatures` - Get signature status

### Archive
- `GET /api/archive` - List dokumen yang diarsipkan
- `GET /api/archive/:id` - Detail dokumen arsip
- `GET /api/archive/statistics` - Statistik arsip

### Attachments
- `POST /api/attachments/:id/upload` - Upload attachment
- `GET /api/attachments/:attachmentId/download` - Download attachment
- `DELETE /api/attachments/:attachmentId` - Hapus attachment

## User Roles

1. **submitter** - Dapat membuat dan submit dokumen
2. **reviewer1** - Review tahap 1
3. **reviewer2** - Review tahap 2
4. **reviewer3** - Review tahap 3
5. **approver** - Approve dokumen setelah review selesai
6. **signer** - Tanda tangan dokumen
7. **admin** - Full access ke semua fitur

## Workflow Status

- **draft** - Dokumen dalam draft
- **revision** - Dokumen perlu revisi
- **review1** - Dalam review tahap 1
- **review2** - Dalam review tahap 2
- **review3** - Dalam review tahap 3
- **approve** - Menunggu approval
- **sign** - Menunggu tanda tangan
- **archived** - Dokumen telah diarsipkan
- **rejected** - Dokumen ditolak

## Konfigurasi Email

Untuk mengaktifkan notifikasi email, atur konfigurasi SMTP di file `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=noreply@yourcompany.com
```

## File Upload Configuration

Default max file size: 10MB. Ubah di `.env`:

```env
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Retention Policy

Default retention period: 7 tahun. Ubah di `.env`:

```env
RETENTION_YEARS=7
```

## Security

- JWT untuk authentication
- Password di-hash dengan bcrypt
- Role-based access control (RBAC)
- File upload validation
- Audit log untuk semua aksi penting

## License

MIT

## Support

Untuk pertanyaan dan support, silakan buat issue di repository ini.
