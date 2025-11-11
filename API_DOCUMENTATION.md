# API Documentation - Workflow Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication

Semua endpoint (kecuali login dan register) memerlukan JWT token di header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "submitter",
  "unit_kerja": "IT Department"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "submitter",
    "unit_kerja": "IT Department"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "submitter"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "submitter",
    "unit_kerja": "IT Department"
  }
}
```

---

## Document Endpoints

### Create Document
```http
POST /documents
```

**Request Body:**
```json
{
  "title": "Kebijakan Keamanan Informasi 2024",
  "document_type": "Kebijakan",
  "unit_kerja": "IT Security",
  "description": "Dokumen kebijakan keamanan informasi untuk tahun 2024",
  "valid_date": "2024-12-31"
}
```

**Response:**
```json
{
  "document": {
    "id": 1,
    "title": "Kebijakan Keamanan Informasi 2024",
    "document_type": "Kebijakan",
    "unit_kerja": "IT Security",
    "status": "draft",
    "submitter_id": 1,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get All Documents
```http
GET /documents
```

**Query Parameters:**
- `status` - Filter by status (draft, review1, review2, etc.)
- `search` - Search by title or document number
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```http
GET /documents?status=review1&page=1&limit=10
```

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "document_number": "DOC-2024-000001",
      "title": "Kebijakan Keamanan Informasi 2024",
      "document_type": "Kebijakan",
      "status": "review1",
      "submitter_name": "John Doe",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Get Document by ID
```http
GET /documents/:id
```

**Response:**
```json
{
  "document": {
    "id": 1,
    "document_number": "DOC-2024-000001",
    "title": "Kebijakan Keamanan Informasi 2024",
    "status": "review1",
    "submitter_name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "attachments": [
    {
      "id": 1,
      "filename": "policy-document.pdf",
      "original_filename": "Kebijakan_2024.pdf",
      "file_size": 1024000,
      "uploaded_at": "2024-01-15T10:35:00Z"
    }
  ],
  "comments": [
    {
      "id": 1,
      "user_name": "Jane Smith",
      "comment": "Dokumen perlu ditambahkan bagian sanksi",
      "created_at": "2024-01-16T09:00:00Z"
    }
  ],
  "audit": [],
  "workflow": []
}
```

### Update Document
```http
PUT /documents/:id
```

**Request Body:**
```json
{
  "title": "Kebijakan Keamanan Informasi 2024 (Revisi)",
  "document_type": "Kebijakan",
  "unit_kerja": "IT Security",
  "description": "Dokumen kebijakan yang telah direvisi",
  "valid_date": "2024-12-31"
}
```

### Delete Document
```http
DELETE /documents/:id
```

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

### Submit Document for Review
```http
POST /documents/:id/submit
```

**Response:**
```json
{
  "message": "Document submitted successfully",
  "documentNumber": "DOC-2024-000001"
}
```

---

## Review Endpoints

### Review Document
```http
POST /review/:id/review
```

**Roles:** reviewer1, reviewer2, reviewer3, admin

**Request Body:**
```json
{
  "action": "approve",
  "notes": "Dokumen sudah sesuai standar"
}
```

**Actions:**
- `approve` - Setujui dan lanjut ke tahap berikutnya
- `request_changes` - Minta revisi
- `reject` - Tolak dokumen

**Response:**
```json
{
  "message": "Document approved successfully",
  "newStatus": "review2"
}
```

### Add Comment
```http
POST /review/:id/comment
```

**Request Body:**
```json
{
  "comment": "Bagian 3.2 perlu diperjelas",
  "is_inline": false,
  "inline_position": null
}
```

**Response:**
```json
{
  "comment": {
    "id": 5,
    "document_id": 1,
    "user_id": 2,
    "comment": "Bagian 3.2 perlu diperjelas",
    "created_at": "2024-01-16T10:00:00Z"
  }
}
```

---

## Approval Endpoints

### Approve Document
```http
POST /approve/:id/approve
```

**Roles:** approver, admin

**Request Body:**
```json
{
  "action": "approve",
  "notes": "Dokumen disetujui untuk ditandatangani"
}
```

**Actions:**
- `approve` - Setujui dokumen
- `reject` - Tolak dokumen

**Response:**
```json
{
  "message": "Document approved successfully",
  "newStatus": "sign"
}
```

---

## Signature Endpoints

### Sign Document
```http
POST /sign/:id/sign
```

**Roles:** signer, admin

**Request Body:**
```json
{
  "signature_type": "digital",
  "certificate_info": "Digital Certificate Info",
  "signature_data": "base64_encoded_signature_data"
}
```

**Response:**
```json
{
  "message": "Document signed successfully"
}
```

### Get Signature Status
```http
GET /sign/:id/signatures
```

**Response:**
```json
{
  "signatures": [
    {
      "id": 1,
      "signer_name": "Director",
      "signature_status": "signed",
      "signed_at": "2024-01-20T14:00:00Z",
      "sequence_order": 1
    },
    {
      "id": 2,
      "signer_name": "CEO",
      "signature_status": "pending",
      "sequence_order": 2
    }
  ]
}
```

---

## Archive Endpoints

### Get Archived Documents
```http
GET /archive
```

**Query Parameters:**
- `search` - Search by title or document number
- `document_type` - Filter by document type
- `start_date` - Filter by start date
- `end_date` - Filter by end date
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "document_number": "DOC-2024-000001",
      "title": "Kebijakan Keamanan Informasi 2024",
      "status": "archived",
      "archived_at": "2024-01-20T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Get Archived Document Detail
```http
GET /archive/:id
```

**Response:**
```json
{
  "document": {
    "id": 1,
    "document_number": "DOC-2024-000001",
    "title": "Kebijakan Keamanan Informasi 2024",
    "status": "archived",
    "is_locked": true,
    "archived_at": "2024-01-20T15:00:00Z",
    "retention_date": "2031-01-20T15:00:00Z"
  },
  "attachments": [],
  "signatures": [],
  "audit": []
}
```

### Get Archive Statistics
```http
GET /archive/statistics
```

**Response:**
```json
{
  "statistics": {
    "total_archived": 150,
    "document_types_count": 5,
    "archived_last_month": 25,
    "expired_retention": 3
  },
  "documentTypes": [
    {
      "document_type": "Kebijakan",
      "count": 50
    },
    {
      "document_type": "SOP",
      "count": 40
    }
  ]
}
```

---

## Attachment Endpoints

### Upload Attachment
```http
POST /attachments/:id/upload
```

**Content-Type:** multipart/form-data

**Form Data:**
- `file` - File to upload

**Response:**
```json
{
  "attachment": {
    "id": 1,
    "document_id": 1,
    "filename": "uuid-generated-name.pdf",
    "original_filename": "document.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "version": 1,
    "uploaded_at": "2024-01-15T10:35:00Z"
  }
}
```

### Download Attachment
```http
GET /attachments/:attachmentId/download
```

**Response:** File download

### Delete Attachment
```http
DELETE /attachments/:attachmentId
```

**Response:**
```json
{
  "message": "Attachment deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
