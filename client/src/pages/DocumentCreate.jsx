import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { toast } from 'react-toastify';

export default function DocumentCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    document_type: '',
    unit_kerja: '',
    description: '',
    valid_date: '',
  });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post('/api/documents', formData);
      const docId = response.data.document.id;
      
      for (const file of files) {
        const fileData = new FormData();
        fileData.append('file', file);
        await axios.post(`/api/attachments/${docId}/upload`, fileData);
      }
      
      toast.success('Dokumen berhasil disimpan sebagai draft');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal menyimpan dokumen');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post('/api/documents', formData);
      const docId = response.data.document.id;
      
      for (const file of files) {
        const fileData = new FormData();
        fileData.append('file', file);
        await axios.post(`/api/attachments/${docId}/upload`, fileData);
      }
      
      await axios.post(`/api/documents/${docId}/submit`);
      toast.success('Dokumen berhasil diajukan untuk review');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal mengajukan dokumen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Buat Dokumen Baru</h1>
      <form className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Judul</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Jenis Dokumen</label>
          <input
            type="text"
            name="document_type"
            required
            value={formData.document_type}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit Kerja</label>
          <input
            type="text"
            name="unit_kerja"
            required
            value={formData.unit_kerja}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tanggal Berlaku</label>
          <input
            type="date"
            name="valid_date"
            value={formData.valid_date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Lampiran</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="bg-gray-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-300"
          >
            Simpan sebagai Draft
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            Submit untuk Review
          </button>
        </div>
      </form>
    </div>
  );
}
