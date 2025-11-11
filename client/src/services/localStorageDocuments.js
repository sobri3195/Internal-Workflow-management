const STORAGE_KEY = 'mockDocuments';
const COMMENTS_KEY = 'mockComments';
const ATTACHMENTS_KEY = 'mockAttachments';

const getMockDocuments = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  const mockDocs = [
    {
      id: 1,
      document_number: 'DOC-2024-001',
      title: 'Proposal Pengadaan Barang',
      document_type: 'Proposal',
      unit_kerja: 'Procurement',
      description: 'Proposal pengadaan barang untuk tahun 2024',
      status: 'draft',
      submitter_id: 1,
      submitter_name: 'Development User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      valid_date: '2024-12-31',
      archived_at: null,
    },
    {
      id: 2,
      document_number: 'DOC-2024-002',
      title: 'Laporan Keuangan Q1',
      document_type: 'Laporan',
      unit_kerja: 'Finance',
      description: 'Laporan keuangan triwulan pertama',
      status: 'review1',
      submitter_id: 1,
      submitter_name: 'Development User',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      valid_date: '2024-12-31',
      archived_at: null,
    },
    {
      id: 3,
      document_number: 'DOC-2024-003',
      title: 'Kontrak Vendor IT',
      document_type: 'Kontrak',
      unit_kerja: 'IT',
      description: 'Kontrak dengan vendor IT untuk tahun 2024',
      status: 'approve',
      submitter_id: 1,
      submitter_name: 'Development User',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      valid_date: '2024-12-31',
      archived_at: null,
    },
    {
      id: 4,
      document_number: 'DOC-2024-004',
      title: 'Surat Keputusan Direksi',
      document_type: 'SK',
      unit_kerja: 'Management',
      description: 'Surat keputusan mengenai kebijakan baru',
      status: 'sign',
      submitter_id: 1,
      submitter_name: 'Development User',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString(),
      valid_date: '2024-12-31',
      archived_at: null,
    },
    {
      id: 5,
      document_number: 'DOC-2024-005',
      title: 'Memo Internal',
      document_type: 'Memo',
      unit_kerja: 'HR',
      description: 'Memo internal mengenai kebijakan cuti',
      status: 'archived',
      submitter_id: 1,
      submitter_name: 'Development User',
      created_at: new Date(Date.now() - 345600000).toISOString(),
      updated_at: new Date(Date.now() - 345600000).toISOString(),
      valid_date: '2024-12-31',
      archived_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDocs));
  return mockDocs;
};

const saveMockDocuments = (documents) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
};

const getMockComments = () => {
  const stored = localStorage.getItem(COMMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveMockComments = (comments) => {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
};

const getMockAttachments = () => {
  const stored = localStorage.getItem(ATTACHMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveMockAttachments = (attachments) => {
  localStorage.setItem(ATTACHMENTS_KEY, JSON.stringify(attachments));
};

export const localStorageDocuments = {
  getDocuments: (params = {}) => {
    const documents = getMockDocuments();
    let filtered = documents;
    
    if (params.status) {
      const statuses = params.status.split(',');
      filtered = filtered.filter(doc => statuses.includes(doc.status));
    }
    
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(search) ||
        doc.document_number?.toLowerCase().includes(search)
      );
    }
    
    if (params.document_type) {
      filtered = filtered.filter(doc => 
        doc.document_type.toLowerCase().includes(params.document_type.toLowerCase())
      );
    }
    
    return {
      documents: filtered,
      pagination: {
        total: filtered.length,
        page: 1,
        limit: 50,
      },
    };
  },

  getDocument: (id) => {
    const documents = getMockDocuments();
    const document = documents.find(doc => doc.id === parseInt(id));
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    const comments = getMockComments().filter(c => c.document_id === parseInt(id));
    const attachments = getMockAttachments().filter(a => a.document_id === parseInt(id));
    
    return {
      document,
      comments,
      attachments,
    };
  },

  createDocument: (data) => {
    const documents = getMockDocuments();
    const newDoc = {
      id: Math.max(0, ...documents.map(d => d.id)) + 1,
      document_number: null,
      title: data.title,
      document_type: data.document_type,
      unit_kerja: data.unit_kerja,
      description: data.description || '',
      status: 'draft',
      submitter_id: 1,
      submitter_name: 'Development User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      valid_date: data.valid_date || null,
      archived_at: null,
    };
    
    documents.push(newDoc);
    saveMockDocuments(documents);
    
    return { document: newDoc };
  },

  updateDocument: (id, data) => {
    const documents = getMockDocuments();
    const index = documents.findIndex(doc => doc.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    documents[index] = {
      ...documents[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    saveMockDocuments(documents);
    return { document: documents[index] };
  },

  submitDocument: (id) => {
    const documents = getMockDocuments();
    const index = documents.findIndex(doc => doc.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    documents[index] = {
      ...documents[index],
      status: 'review1',
      document_number: documents[index].document_number || `DOC-${new Date().getFullYear()}-${String(documents[index].id).padStart(3, '0')}`,
      updated_at: new Date().toISOString(),
    };
    
    saveMockDocuments(documents);
    return { document: documents[index] };
  },

  reviewDocument: (id, action, notes) => {
    const documents = getMockDocuments();
    const index = documents.findIndex(doc => doc.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    const currentStatus = documents[index].status;
    let newStatus = currentStatus;
    
    if (action === 'approve') {
      if (currentStatus === 'review1') newStatus = 'review2';
      else if (currentStatus === 'review2') newStatus = 'review3';
      else if (currentStatus === 'review3') newStatus = 'approve';
    } else if (action === 'reject') {
      newStatus = 'rejected';
    } else if (action === 'request_changes') {
      newStatus = 'revision';
    }
    
    documents[index] = {
      ...documents[index],
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    
    saveMockDocuments(documents);
    
    if (notes) {
      const comments = getMockComments();
      comments.push({
        id: comments.length + 1,
        document_id: parseInt(id),
        user_name: 'Development User',
        comment: notes,
        created_at: new Date().toISOString(),
      });
      saveMockComments(comments);
    }
    
    return { success: true };
  },

  approveDocument: (id, action, notes) => {
    const documents = getMockDocuments();
    const index = documents.findIndex(doc => doc.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    let newStatus = documents[index].status;
    
    if (action === 'approve') {
      newStatus = 'sign';
    } else if (action === 'reject') {
      newStatus = 'rejected';
    }
    
    documents[index] = {
      ...documents[index],
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    
    saveMockDocuments(documents);
    
    if (notes) {
      const comments = getMockComments();
      comments.push({
        id: comments.length + 1,
        document_id: parseInt(id),
        user_name: 'Development User',
        comment: notes,
        created_at: new Date().toISOString(),
      });
      saveMockComments(comments);
    }
    
    return { success: true };
  },

  signDocument: (id, signatureData) => {
    const documents = getMockDocuments();
    const index = documents.findIndex(doc => doc.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    documents[index] = {
      ...documents[index],
      status: 'archived',
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    saveMockDocuments(documents);
    return { success: true };
  },

  addComment: (id, comment) => {
    const comments = getMockComments();
    const newComment = {
      id: comments.length + 1,
      document_id: parseInt(id),
      user_name: 'Development User',
      comment: comment,
      created_at: new Date().toISOString(),
    };
    
    comments.push(newComment);
    saveMockComments(comments);
    
    return { comment: newComment };
  },

  uploadAttachment: (docId, file) => {
    const attachments = getMockAttachments();
    const newAttachment = {
      id: attachments.length + 1,
      document_id: parseInt(docId),
      original_filename: file.name,
      file_path: URL.createObjectURL(file),
      uploaded_at: new Date().toISOString(),
    };
    
    attachments.push(newAttachment);
    saveMockAttachments(attachments);
    
    return { attachment: newAttachment };
  },
};
